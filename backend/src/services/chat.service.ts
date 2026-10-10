import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import { ragService, SearchResult } from './rag.service';
import { products as seedProducts } from '../db/seedData';
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

// Danh sách các model ưu tiên thử nghiệm (fallback nếu gặp 503/429 tạm thời)
const CANDIDATE_MODELS = [
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-1.5-flash',
  'gemini-3.5-flash',
  'gemini-flash-latest',
  'gemini-3.8-flash',
];

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
5. GỢI Ý HÀNH ĐỘNG: Ở cuối câu trả lời, hãy gợi ý nhẹ nhàng bước tiếp theo (ví dụ: đặt giữ máy, ghé chi nhánh xem thực tế, hoặc liên hệ hotline 1800 6868 miễn phí).
6. TRÌNH BÀY TỰ NHIÊN: Khi trích xuất tài liệu từ RAG, luôn diễn giải thành văn phong tư vấn ân cần, tự nhiên, dễ hiểu.
7. TUYỆT ĐỐI KHÔNG XUẤT RA DỮ LIỆU NỘI BỘ HAY CHECKLIST:
- CHỈ xuất ra đúng nội dung câu trả lời tư vấn gửi đến khách hàng.
- Tuyệt đối KHÔNG in ra các nhãn kỹ thuật nội bộ như "[Tài liệu: ...]", "[Mục: ...]", "Độ khớp: ...%", hoặc các đoạn code/tag debug thô.
- Tuyệt đối KHÔNG in ra bất kỳ dòng suy nghĩ, checklist, tự kiểm tra, self-reflection (như "technical metadata printed", "Checked", "Suggest next step at end: Checked", "Verified",...).`;

/**
 * Làm sạch câu trả lời của AI: Loại bỏ triệt để các nhãn kỹ thuật, nhãn debug,
 * và các checklist tự kiểm tra (CoT/self-reflection leakage) bị rò rỉ.
 */
export function sanitizeChatReply(text: string): string {
  if (!text) return '';

  let cleaned = text;

  // 1. Xóa các khối checklist / metadata dạng đoạn văn
  cleaned = cleaned.replace(
    /(?:^|\n)[\/\*_\s]*(?:technical\s*metadata|metadata\s*printed|self-check|checklist|internal\s*JSON\s*tags)[\s\S]*?(?=\n\n[A-ZÀ-Ỹ0-9]|$)/gi,
    ''
  );

  // 2. Xóa các dòng đơn lẻ hoặc checklist bullet points
  cleaned = cleaned.replace(/^.*(?:technical\s*metadata|suggest\s*next\s*step\s*at\s*end|checked\s*\(no|\(no\s*\[tài liệu|internal\s*JSON\s*tags).*$/gim, '');

  // 3. Xóa các nhãn kỹ thuật nội bộ còn sót
  cleaned = cleaned.replace(/\[Tài liệu:.*?\]/gi, '');
  cleaned = cleaned.replace(/\[Mục:.*?\]/gi, '');
  cleaned = cleaned.replace(/Độ khớp:\s*\d+(?:\.\d+)?%/gi, '');

  // 4. Lọc từng dòng
  const lines = cleaned.split('\n');
  const filteredLines: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (
      /^(?:\/|\*|\-)?\s*(?:technical\s*metadata|suggest\s*next\s*step|checked\b)/i.test(trimmed) ||
      /\bchecked\s*\(/i.test(trimmed) ||
      /internal\s*(?:JSON|tags)/i.test(trimmed)
    ) {
      continue;
    }
    filteredLines.push(line);
  }

  cleaned = filteredLines.join('\n');

  // 5. Chuẩn hóa khoảng trắng & dòng trống
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n').trim();

  return cleaned;
}

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

    // 1. Kiểm tra ý định Tra cứu đơn hàng (#BK-xxxx hoặc SĐT hoặc từ khóa đơn hàng)
    const isOrderKeyword =
      norm.includes('don hang') ||
      norm.includes('tra cuu') ||
      norm.includes('van don') ||
      norm.includes('kiem tra don') ||
      norm.includes('giao den dau') ||
      norm.includes('tinh trang don') ||
      norm.includes('trang thai don') ||
      norm.includes('shipper') ||
      norm.includes('da giao chua') ||
      norm.includes('ma van don');

    // Tìm mã đơn hàng (#BK-xxxx, BK-xxxx, BKxxxx, hoặc 4 chữ số khi có từ khóa đơn hàng)
    const orderCodeMatch =
      text.match(/#?BK[-_ ]?\d{3,6}/i) ||
      (isOrderKeyword ? text.match(/\b\d{4}\b/) : null);

    // Tìm số điện thoại (10 chữ số bắt đầu bằng 0 hoặc +84)
    const phoneMatch = text.match(/(?:\+?84|0)(?:\d{9}|\d{8})\b/);

    if (orderCodeMatch || (isOrderKeyword && phoneMatch)) {
      const code = orderCodeMatch ? orderCodeMatch[0].replace(/[^0-9]/g, '') : undefined;
      return {
        intent: 'track_order',
        extracted: {
          orderCode: code ? `#BK-${code}` : undefined,
          phone: phoneMatch ? phoneMatch[0] : undefined,
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

    // 4. Kiểm tra ý định hỏi thông số chi tiết hoặc tư vấn về máy cụ thể
    const isConsultProductKeyword =
      norm.includes('thong so') ||
      norm.includes('cau hinh') ||
      norm.includes('ram') ||
      norm.includes('chip') ||
      norm.includes('cpu') ||
      norm.includes('man hinh') ||
      norm.includes('tu van cho toi ve san pham') ||
      norm.includes('ve san pham') ||
      norm.includes('may nay');

    if (isConsultProductKeyword) {
      // Tìm sản phẩm trong danh mục
      const matched = seedProducts.find((p) => {
        const pNameNorm = normalizeText(p.name);
        const pSlugNorm = normalizeText(p.slug);
        return (
          norm.includes(pNameNorm) ||
          norm.includes(pSlugNorm) ||
          pNameNorm.split(' ').slice(0, 3).every((w) => norm.includes(w))
        );
      });

      return {
        intent: 'product_details',
        extracted: {
          productIdentifier: matched ? matched.slug : text,
        },
      };
    }

    return { intent: 'general', extracted: null };
  }

  /**
   * Gọi mô hình Gemini với cơ chế luân chuyển model (Model Fallback) khi gặp 503
   */
  private async generateWithFallback(
    prompt: string,
    systemInstructionText?: string
  ): Promise<{ text: string; modelName: string }> {
    if (!genAI) {
      throw new Error('Chưa cấu hình GEMINI_API_KEY trong file .env');
    }

    let lastError: any = null;

    for (const modelName of CANDIDATE_MODELS) {
      try {
        const modelParams: any = {
          model: modelName,
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 2048,
          },
        };
        if (systemInstructionText) {
          modelParams.systemInstruction = systemInstructionText;
        }

        const model = genAI.getGenerativeModel(modelParams);
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
    let matchedRagChunks: SearchResult[] = [];
    try {
      const ragResults = await ragService.search(message, 3);
      matchedRagChunks = ragResults.filter((r) => r.score >= 0.2);

      if (matchedRagChunks.length > 0) {
        const contextParts: string[] = [];
        for (const res of matchedRagChunks) {
          const docTitle = res.chunk.documentTitle || res.chunk.category;
          const secTitle = res.chunk.sectionTitle ? ` - ${res.chunk.sectionTitle}` : '';
          citations.push(`${docTitle}${secTitle}`);
          const cleanChunkText = res.chunk.content
            .replace(/\[Tài liệu:.*?\]/g, '')
            .replace(/\[Mục:.*?\]/g, '')
            .trim();
          contextParts.push(`Tài liệu tham khảo (${docTitle}${secTitle}):\n${cleanChunkText}`);
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

    const userPromptWithData = `${ragContextText ? `=== NGỮ CẢNH TRI THỨC CHUẨN XÁC TỪ BK-STORE (RAG) ===\n${ragContextText}\n\n` : ''}${toolResultData ? `=== DỮ LIỆU THỜI GIAN THỰC TỪ HỆ THỐNG / DATABASE (LIVE DATA) ===\nCông cụ: ${toolUsed}\nKết quả: ${JSON.stringify(toolResultData, null, 2)}\n\n` : ''}${conversationHistoryText ? `=== LỊCH SỬ HỘI THOẠI GẦN ĐÂY ===\n${conversationHistoryText}\n\n` : ''}Khách hàng vừa hỏi: "${message}"

Hãy đưa ra câu trả lời trực tiếp cho khách hàng (chỉ xuất lời thoại tư vấn, tuyệt đối không in bất kỳ dòng checklist hoặc siêu dữ liệu tự kiểm tra nào):`;

    // 4. Gọi Gemini để tổng hợp câu trả lời
    let replyText = '';
    let usedModel = 'gemini-3.8-flash';

    try {
      const genResult = await this.generateWithFallback(userPromptWithData, SYSTEM_INSTRUCTION);
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
          if (toolResultData.found) {
            replyText = `Dạ chào anh/chị! BK-Bot xin gửi thông tin chi tiết đơn hàng:\n\n• **Mã đơn:** ${toolResultData.orderCode}\n• **Khách hàng:** ${toolResultData.customerName || 'Quý khách'}\n• **Trạng thái:** ${toolResultData.statusLabel}\n• **Tiến trình:** ${toolResultData.trackingInfo}\n• **Tổng thanh toán:** ${toolResultData.formattedTotal}\n\nĐơn hàng đang được BK-Store xử lý đúng tiến độ ạ!`;
          } else {
            replyText = `Dạ chào anh/chị! ${toolResultData.message}`;
          }
        } else if (toolUsed === 'filterProducts') {
          replyText = `Dạ chào anh/chị! Dưới đây là các sản phẩm phù hợp nhất với tầm giá và nhu cầu của mình tại BK-Store:\n\n`;
          replyText += toolResultData.products
            .map((p: any) => `• **${p.name}** — Giá ưu đãi: **${p.formattedPrice}**\n  *Cấu hình:* ${p.specsSummary}`)
            .join('\n\n');
          replyText += `\n\nTất cả sản phẩm đều là hàng chính hãng 100%, bảo hành 1 đổi 1 trong 30 ngày ạ!`;
        } else if (toolUsed === 'getProductDetails' && toolResultData.product) {
          const p = toolResultData.product;
          replyText = `Dạ chào anh/chị! Dưới đây là thông số kỹ thuật chi tiết và đánh giá về **${p.name}** tại BK-Store:\n\n`;
          replyText += `• **Thương hiệu:** ${p.brand}\n`;
          replyText += `• **Giá niêm yết ưu đãi:** **${p.formattedPrice}**\n`;
          if (p.specs && typeof p.specs === 'object') {
            replyText += `• **Cấu hình nổi bật:**\n`;
            replyText += Object.entries(p.specs).map(([k, v]) => `  - ${k.toUpperCase()}: ${v}`).join('\n') + '\n';
          }
          replyText += `• **Chính sách:** Hàng chính hãng 100%, bảo hành ${p.warrantyMonths} tháng, đặc quyền **1 đổi 1 trong 30 ngày** nếu có lỗi phần cứng.\n\n`;
          replyText += `Mẫu máy này cực kỳ tối ưu cho các tác vụ làm việc và giải trí cao cấp. Anh/chị có muốn em kiểm tra tồn kho tại showroom gần mình nhất không ạ?`;
        } else {
          replyText = `Dạ, ${toolResultData.message || 'BK-Store luôn sẵn sàng phục vụ anh/chị!'}`;
        }
      } else if (matchedRagChunks && matchedRagChunks.length > 0) {
        const topChunk = matchedRagChunks[0].chunk;
        const cleanContent = topChunk.content
          .replace(/\[Tài liệu:.*?\]/g, '')
          .replace(/\[Mục:.*?\]/g, '')
          .replace(/^#+\s+/gm, '')
          .trim();

        const paragraphs = cleanContent
          .split('\n\n')
          .filter((p) => p.trim().length > 0)
          .slice(0, 3)
          .join('\n\n');

        replyText = `Dạ em chào anh/chị! Về chính sách chính thức của BK-Store, em xin phép thông tin chi tiết đến anh/chị như sau:\n\n${paragraphs}\n\nAnh/chị hoàn toàn yên tâm khi mua sắm tại BK-Store ạ! Nếu cần hỗ trợ thêm thông tin chi tiết, anh/chị có thể liên hệ ngay tổng đài miễn phí **1800 6868** nhé!`;
      } else {
        replyText = `Dạ em chào anh/chị! Em là **BK-Bot** - Trợ lý công nghệ của BK-Store. Em có thể hỗ trợ anh/chị tư vấn cấu hình laptop, điện thoại, kiểm tra tồn kho tại 3 chi nhánh hoặc tra cứu tiến trình đơn hàng. Anh/chị đang quan tâm đến sản phẩm nào ạ?`;
      }
      usedModel = 'smart-fallback';
    }

    const cleanedReply = sanitizeChatReply(replyText);

    return {
      reply: cleanedReply,
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
