import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import { ragService, SearchResult } from './rag.service';
import {
  checkInventory,
  trackOrder,
  filterProducts,
  getProductDetails,
  executeAiTool,
  formatVND,
  normalizeText,
  InventoryCheckResult,
  OrderTrackResult,
  ProductFilterResult,
  ProductDetailResult,
} from './ai-tools.service';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY || '';
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

// Danh sách các model ưu tiên thử nghiệm (fallback nếu gặp 503 tạm thời)
const CANDIDATE_MODELS = ['gemini-3.8-flash', 'gemini-flash-latest', 'gemini-pro-latest'];

export interface ChatHistoryItem {
  role: 'user' | 'assistant' | 'model';
  content: string;
}

export interface ChatRequestOptions {
  message: string;
  history?: ChatHistoryItem[];
  stream?: boolean;
}

export interface ChatResponseData {
  reply: string;
  citations: string[];
  cards?: {
    type: 'products' | 'order' | 'inventory';
    data: any;
  };
  toolUsed?: string;
  model: string;
}

const SYSTEM_INSTRUCTION = `Bạn là BK-Bot – Chuyên viên tư vấn công nghệ & Chăm sóc khách hàng cao cấp tại BK-Store (Hệ thống bán lẻ Laptop, Smartphone, Phụ kiện công nghệ chính hãng hàng đầu).

VAI TRÒ & PHONG CÁCH:
- Tên gọi: BK-Bot (hoặc xưng "em", gọi khách hàng là "anh/chị" hoặc "quý khách").
- Phong cách: Nhiệt tình, thân thiện, lịch thiệp, am hiểu sâu sắc phần cứng công nghệ (chip CPU, GPU, RAM, màn hình OLED/Retina, pin, tản nhiệt), trung thực tuyệt đối.
- Luôn sử dụng tiếng Việt tự nhiên, ngắt dòng rõ ràng, sử dụng bullet points để khách dễ theo dõi.
- Khi nhắc đến giá sản phẩm, luôn ghi rõ đơn vị tiền tệ VNĐ (ví dụ: 31.990.000₫).

NGUYÊN TẮC BẮT BUỘC:
1. DỮ LIỆU ĐƯỢC CUNG CẤP: Dựa trên NGỮ CẢNH TRI THỨC (Chính sách, Cẩm nang) và DỮ LIỆU THỰC TẾ (Tồn kho, Đơn hàng, Danh mục) được hệ thống chuyển đến bên dưới. Tuyệt đối không tự bịa đặt thông tin không có trong tài liệu.
2. TƯ VẤN CẤU HÌNH: Giải thích vì sao cấu hình đó phù hợp với nhu cầu của khách (ví dụ: sinh viên kinh tế cần mỏng nhẹ pin trâu; AI/Data Science cần 32GB RAM + GPU CUDA; gaming cần tần số quét cao).
3. ĐƠN HÀNG: Thông báo rõ mã đơn, trạng thái hiện tại, lộ trình vận chuyển và số tiền.
4. TỒN KHO: Nói rõ chi nhánh nào còn bao nhiêu máy, địa chỉ showroom để khách ghé trải nghiệm.
5. GỢI Ý HÀNH ĐỘNG: Ở cuối câu trả lời, hãy gợi ý nhẹ nhàng bước tiếp theo (ví dụ: đặt giữ máy, ghé chi nhánh xem thực tế, hoặc liên hệ hotline 1800 6868 miễn phí).`;

class ChatService {
  /**
   * Phân tích ý định người dùng để tiền xử lý công cụ (Deterministic Intent Parser)
   */
  private detectIntent(message: string): {
    intent: 'track_order' | 'check_inventory' | 'filter_products' | 'product_details' | 'general';
    extracted: any;
  } {
    const text = message.trim();
    const norm = normalizeText(text);

    // 1. Kiểm tra ý định Tra cứu đơn hàng (#BK-xxxx hoặc BK-xxxx hoặc "đơn hàng")
    const orderCodeMatch = text.match(/#?BK-?\d{4}/i) || text.match(/\b\d{4}\b/);
    const isOrderKeyword =
      norm.includes('don hang') ||
      norm.includes('tra cuu') ||
      norm.includes('van don') ||
      norm.includes('kiem tra don') ||
      norm.includes('giao den dau') ||
      norm.includes('tinh trang don');

    if (orderCodeMatch && (isOrderKeyword || text.toUpperCase().includes('BK-'))) {
      const code = orderCodeMatch[0].replace(/[^0-9]/g, '');
      return {
        intent: 'track_order',
        extracted: {
          orderCode: `#BK-${code}`,
        },
      };
    }

    // 2. Kiểm tra ý định Tra cứu tồn kho chi nhánh
    const isInventoryKeyword =
      norm.includes('con hang') ||
      norm.includes('het hang') ||
      norm.includes('ton kho') ||
      norm.includes('o chi nhanh') ||
      norm.includes('con may') ||
      norm.includes('co san') ||
      norm.includes('mua tai');

    if (isInventoryKeyword) {
      let branchName = '';
      if (norm.includes('cau giay') || norm.includes('ha noi')) branchName = 'Cầu Giấy';
      else if (norm.includes('quan 1') || norm.includes('ho chi minh') || norm.includes('tphcm') || norm.includes('hcm')) branchName = 'Quận 1';
      else if (norm.includes('hai chau') || norm.includes('da nang')) branchName = 'Hải Châu';

      // Loại bỏ các từ thừa trong câu hỏi để lấy tên sản phẩm chuẩn
      let cleanProdName = text;
      const removePhrases = [
        /ở\s+(cầu giấy|hà nội|quận 1|hồ chí minh|tphcm|hcm|hải châu|đà nẵng)/gi,
        /tại\s+(cầu giấy|hà nội|quận 1|hồ chí minh|tphcm|hcm|hải châu|đà nẵng)/gi,
        /(còn hàng|hết hàng|còn máy|tồn kho|có sẵn)\s*(không|k|ko|hả|hở)?\s*(shop|em|bạn|ạ)?/gi,
        /(cho mình hỏi|shop ơi|em ơi|ad ơi|bạn ơi|cho hỏi)/gi,
      ];
      for (const rx of removePhrases) {
        cleanProdName = cleanProdName.replace(rx, ' ');
      }
      cleanProdName = cleanProdName.trim();

      return {
        intent: 'check_inventory',
        extracted: {
          productName: cleanProdName || text,
          branchName: branchName || undefined,
        },
      };
    }

    // 3. Kiểm tra ý định Tìm & Lọc theo tầm tiền / danh mục
    const isFilterKeyword =
      norm.includes('trieu') ||
      norm.includes('ngan sach') ||
      norm.includes('tai chinh') ||
      norm.includes('tam gia') ||
      norm.includes('khoang gia') ||
      norm.includes('duoi') ||
      norm.includes('tu van mua') ||
      norm.includes('nen mua') ||
      norm.includes('gioi thieu') ||
      norm.includes('laptop') ||
      norm.includes('smartphone');

    if (isFilterKeyword) {
      let category = '';
      if (norm.includes('laptop') || norm.includes('may tinh') || norm.includes('macbook')) category = 'laptop';
      else if (norm.includes('dien thoai') || norm.includes('smartphone') || norm.includes('iphone')) category = 'smartphone';
      else if (norm.includes('tai nghe') || norm.includes('chuot') || norm.includes('ban phim') || norm.includes('phu kien')) category = 'accessory';

      // Trích xuất thương hiệu
      let brand: string | undefined;
      const candidateBrands = ['Apple', 'Asus', 'Dell', 'Lenovo', 'Acer', 'Samsung', 'Xiaomi', 'Sony', 'Logitech', 'Anker'];
      for (const b of candidateBrands) {
        if (norm.includes(b.toLowerCase())) {
          brand = b;
          break;
        }
      }

      // Trích xuất số tiền (ví dụ: "20 đến 30 triệu", "dưới 25 triệu", "tầm 15tr")
      let minPrice: number | undefined;
      let maxPrice: number | undefined;

      const priceRangeMatch = norm.match(/(\d+)\s*(den|to|-)\s*(\d+)\s*(trieu|tr)/i);
      const underPriceMatch = norm.match(/(duoi|tam|khoang)\s*(\d+)\s*(trieu|tr)/i);

      if (priceRangeMatch) {
        minPrice = parseInt(priceRangeMatch[1], 10) * 1000000;
        maxPrice = parseInt(priceRangeMatch[3], 10) * 1000000;
      } else if (underPriceMatch) {
        const val = parseInt(underPriceMatch[2], 10) * 1000000;
        if (norm.includes('duoi')) {
          maxPrice = val;
        } else {
          minPrice = Math.max(0, val - 5000000);
          maxPrice = val + 5000000;
        }
      }

      return {
        intent: 'filter_products',
        extracted: {
          category: category || undefined,
          brand,
          minPrice,
          maxPrice,
          keyword: undefined, // Không truyền toàn bộ câu hỏi làm keyword tìm kiếm
        },
      };
    }

    // 4. Kiểm tra ý định hỏi thông số chi tiết của máy
    const isSpecKeyword =
      norm.includes('thong so') ||
      norm.includes('cau hinh') ||
      norm.includes('ram') ||
      norm.includes('chip') ||
      norm.includes('cpu') ||
      norm.includes('man hinh');

    if (isSpecKeyword) {
      return {
        intent: 'product_details',
        extracted: {
          productIdentifier: text,
        },
      };
    }

    return { intent: 'general', extracted: null };
  }

  /**
   * Gọi mô hình Gemini với cơ chế luân chuyển model (Model Fallback) khi gặp 503
   */
  private async generateWithFallback(prompt: string): Promise<{ text: string; modelName: string }> {
    if (!genAI) {
      throw new Error('Chưa cấu hình GEMINI_API_KEY trong file .env');
    }

    let lastError: any = null;

    for (const modelName of CANDIDATE_MODELS) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 1200,
          },
        });
        const res = await model.generateContent(prompt);
        const text = res.response.text();
        if (text && text.trim().length > 0) {
          return { text: text.trim(), modelName };
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`⚠️ [ChatService] Model ${modelName} gặp sự cố (${err.status || err.message}), thử model tiếp theo...`);
      }
    }

    throw lastError || new Error('Không thể kết nối với mô hình Gemini AI lúc này.');
  }

  /**
   * Xử lý câu hỏi của khách hàng, tích hợp RAG + AI Tools + Gemini
   */
  public async handleMessage(options: ChatRequestOptions): Promise<ChatResponseData> {
    const { message, history = [] } = options;
    const citations: string[] = [];
    let toolResultData: any = null;
    let cardPayload: any = undefined;
    let toolUsed: string | undefined = undefined;

    // 1. Phân tích ý định & kích hoạt AI Tool
    const detected = this.detectIntent(message);

    if (detected.intent === 'check_inventory') {
      toolUsed = 'checkInventory';
      const inv = await checkInventory(detected.extracted);
      toolResultData = inv;
      if (inv.found && inv.product) {
        cardPayload = {
          type: 'inventory',
          data: inv,
        };
      }
    } else if (detected.intent === 'track_order') {
      toolUsed = 'trackOrder';
      const ord = await trackOrder(detected.extracted);
      toolResultData = ord;
      if (ord.found) {
        cardPayload = {
          type: 'order',
          data: ord,
        };
      }
    } else if (detected.intent === 'filter_products') {
      toolUsed = 'filterProducts';
      const filt = await filterProducts(detected.extracted);
      toolResultData = filt;
      if (filt.products && filt.products.length > 0) {
        cardPayload = {
          type: 'products',
          data: filt.products,
        };
      }
    } else if (detected.intent === 'product_details') {
      toolUsed = 'getProductDetails';
      const det = await getProductDetails(detected.extracted.productIdentifier);
      toolResultData = det;
      if (det.found && det.product) {
        cardPayload = {
          type: 'products',
          data: [det.product],
        };
      }
    }

    // 2. Tra cứu RAG ngữ cảnh tri thức (Chính sách, Cẩm nang tư vấn)
    let ragContextText = '';
    try {
      const ragResults = await ragService.search(message, 3);
      const relevantChunks = ragResults.filter((r) => r.score >= 0.2);

      if (relevantChunks.length > 0) {
        const contextParts: string[] = [];
        for (const res of relevantChunks) {
          const docTitle = res.chunk.documentTitle || res.chunk.category;
          const secTitle = res.chunk.sectionTitle ? ` - ${res.chunk.sectionTitle}` : '';
          citations.push(`${docTitle}${secTitle}`);
          contextParts.push(`--- [Tài liệu: ${docTitle}${secTitle} (Độ khớp: ${(res.score * 100).toFixed(0)}%)] ---\n${res.chunk.content}`);
        }
        ragContextText = contextParts.join('\n\n');
      }
    } catch (ragErr: any) {
      console.warn('⚠️ [ChatService] Tra cứu RAG gặp lỗi nhẹ:', ragErr.message);
    }

    // 3. Xây dựng Prompt tổng hợp gửi cho Gemini
    let conversationHistoryText = '';
    if (history && history.length > 0) {
      const recentHistory = history.slice(-4);
      conversationHistoryText = recentHistory
        .map((h) => `${h.role === 'user' ? 'Khách hàng' : 'BK-Bot'}: ${h.content}`)
        .join('\n');
    }

    const systemPromptWithData = `${SYSTEM_INSTRUCTION}

${ragContextText ? `=== NGỮ CẢNH TRI THỨC CHUẨN XÁC TỪ BK-STORE (RAG) ===\n${ragContextText}\n` : ''}
${toolResultData ? `=== DỮ LIỆU THỜI GIAN THỰC TỪ HỆ THỐNG / DATABASE (LIVE DATA) ===\nCông cụ: ${toolUsed}\nKết quả: ${JSON.stringify(toolResultData, null, 2)}\n` : ''}
${conversationHistoryText ? `=== LỊCH SỬ HỘI THOẠI GẦN ĐÂY ===\n${conversationHistoryText}\n` : ''}
Khách hàng vừa hỏi: "${message}"

Hãy đưa ra câu trả lời hoàn chỉnh, ân cần, súc tích và chính xác nhất cho khách hàng:`;

    // 4. Gọi Gemini để tổng hợp câu trả lời
    let replyText = '';
    let usedModel = 'gemini-3.8-flash';

    try {
      const genResult = await this.generateWithFallback(systemPromptWithData);
      replyText = genResult.text;
      usedModel = genResult.modelName;
    } catch (aiErr: any) {
      console.error('❌ [ChatService] Lỗi khi gọi Gemini, sử dụng Smart Fallback:', aiErr.message);

      // Smart Fallback nếu Gemini API tạm gián đoạn (503/Quota)
      if (toolResultData) {
        if (toolUsed === 'checkInventory') {
          replyText = `Dạ chào anh/chị! BK-Bot đã kiểm tra nhanh hệ thống kho:\n\n${toolResultData.message}\n\n`;
          if (toolResultData.branches && toolResultData.branches.length > 0) {
            replyText += toolResultData.branches
              .map((b: any) => `• **${b.branchName}** (${b.address}): **${b.status}** (${b.quantity} máy)`)
              .join('\n');
          }
          replyText += `\n\nAnh/chị có muốn em giữ máy trước tại chi nhánh gần mình không ạ?`;
        } else if (toolUsed === 'trackOrder') {
          replyText = `Dạ chào anh/chị! BK-Bot xin gửi thông tin chi tiết đơn hàng:\n\n• **Mã đơn:** ${toolResultData.orderCode}\n• **Trạng thái:** ${toolResultData.statusLabel}\n• **Tiến trình:** ${toolResultData.trackingInfo}\n• **Tổng thanh toán:** ${toolResultData.formattedTotal}\n\nĐơn hàng đang được BK-Store xử lý đúng tiến độ ạ!`;
        } else if (toolUsed === 'filterProducts') {
          replyText = `Dạ chào anh/chị! Dưới đây là các sản phẩm phù hợp nhất với tầm giá và nhu cầu của mình tại BK-Store:\n\n`;
          replyText += toolResultData.products
            .map((p: any) => `• **${p.name}** — Giá ưu đãi: **${p.formattedPrice}**\n  *Cấu hình:* ${p.specsSummary}`)
            .join('\n\n');
          replyText += `\n\nTất cả sản phẩm đều là hàng chính hãng 100%, bảo hành 1 đổi 1 trong 30 ngày ạ!`;
        } else {
          replyText = `Dạ, ${toolResultData.message || 'BK-Store luôn sẵn sàng phục vụ anh/chị!'}`;
        }
      } else if (ragContextText) {
        replyText = `Dạ chào anh/chị! Theo chính sách chính thức của BK-Store:\n\n${ragContextText.slice(0, 400)}...\n\nAnh/chị có thể liên hệ tổng đài miễn phí **1800 6868** nếu cần hỗ trợ thêm nhé!`;
      } else {
        replyText = `Dạ em chào anh/chị! Em là **BK-Bot** - Trợ lý công nghệ của BK-Store. Em có thể hỗ trợ anh/chị tư vấn cấu hình laptop, điện thoại, kiểm tra tồn kho tại 3 chi nhánh hoặc tra cứu tiến trình đơn hàng. Anh/chị đang quan tâm đến sản phẩm nào ạ?`;
      }
      usedModel = 'smart-fallback';
    }

    return {
      reply: replyText,
      citations: Array.from(new Set(citations)),
      cards: cardPayload,
      toolUsed,
      model: usedModel,
    };
  }

  /**
   * SSE Streaming Response dành cho chữ chạy thời gian thực (Typewriter Effect)
   */
  public async streamChat(
    options: ChatRequestOptions,
    sendEvent: (event: string, data: any) => void
  ): Promise<void> {
    const { message } = options;

    sendEvent('status', {
      text: 'BK-Bot đang kiểm tra cơ sở dữ liệu & tri thức...',
    });

    const result = await this.handleMessage(options);

    // Nếu có công cụ được kích hoạt
    if (result.toolUsed) {
      sendEvent('tool_call', {
        tool: result.toolUsed,
        cards: result.cards,
      });
    }

    // Nếu có trích dẫn tài liệu
    if (result.citations && result.citations.length > 0) {
      sendEvent('citations', {
        citations: result.citations,
      });
    }

    // Mô phỏng stream chữ mượt mà
    const words = result.reply.split(' ');
    let currentText = '';

    for (let i = 0; i < words.length; i += 3) {
      const chunk = words.slice(i, i + 3).join(' ') + ' ';
      currentText += chunk;
      sendEvent('chunk', {
        delta: chunk,
        accumulated: currentText,
      });
      // Giãn cách một chút để tạo cảm giác tự nhiên
      await new Promise((resolve) => setTimeout(resolve, 25));
    }

    sendEvent('done', {
      fullReply: result.reply,
      cards: result.cards,
      citations: result.citations,
      model: result.model,
    });
  }
}

export const chatService = new ChatService();
