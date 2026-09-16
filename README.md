# BK-Store: Website Thương Mại Điện Tử Thiết Bị Công Nghệ Tích Hợp AI Chatbot

> **Đồ án liên ngành Công nghệ Thông tin**  
> Nghiên cứu và xây dựng Website thương mại điện tử thiết bị công nghệ tích hợp Trợ lý ảo AI chăm sóc khách hàng dựa trên nền tảng **Node.js, Express, LangChain.js và Google Gemini**.

---

## 👥 THÔNG TIN THỰC HIỆN ĐỀ TÀI

* **Giảng viên hướng dẫn:** Thầy **Nguyễn Văn Sơn**
* **Sinh viên thực hiện:**
  1. **Nguyễn Quế Bắc** - Mã sinh viên: `23010574`
  2. **Hoàng Tuấn Kiệt** - Mã sinh viên: `23010517`
* **Thời gian thực hiện:** Năm học 2026

---

## 🌟 GIỚI THIỆU DỰ ÁN

**BK-Store** là hệ thống website thương mại điện tử chuyên cung cấp các thiết bị công nghệ cao cấp (Laptop, Điện thoại thông minh, Phụ kiện) tích hợp **Trợ lý ảo AI thông minh (BK-Bot)**. 

Khác biệt với các hệ thống chatbot kịch bản thông thường, BK-Bot sử dụng mô hình ngôn ngữ lớn **Google Gemini** kết hợp với **LangChain.js** để mang đến trải nghiệm mua sắm thông minh:
* **Tư vấn cấu hình chuyên sâu:** Hiểu ngôn ngữ tự nhiên, phân tích nhu cầu và ngân sách để gợi ý dòng máy tối ưu.
* **So sánh sản phẩm trực quan:** Đối chiếu chi tiết thông số kỹ thuật (CPU, RAM, GPU, Màn hình, Pin) giữa các sản phẩm dưới dạng bảng.
* **Tra cứu chính sách chuẩn xác (RAG):** Trả lời chính sách bảo hành, đổi trả bằng cơ sở tri thức (Vector DB), loại bỏ hoàn toàn hiện tượng ảo giác thông tin.
* **Tác tử hành động (Agent Tool Calling):** Kết nối trực tiếp cơ sở dữ liệu SQL để kiểm tra số lượng tồn kho theo chi nhánh và tra cứu trạng thái đơn hàng thời gian thực.
* **Phản hồi thời gian thực (SSE Streaming):** Hiển thị câu trả lời dạng gõ từng chữ mượt mà với độ trễ phản hồi ban đầu dưới 1.5 giây.

---

## 🛠️ CÔNG NGHỆ SỬ DỤNG (TECH STACK)

| Thành phần | Công nghệ chính |
| :--- | :--- |
| **Frontend** | [Next.js](https://nextjs.org/) (React), TailwindCSS, Shadcn/ui, Lucide Icons |
| **Backend API** | [Node.js](https://nodejs.org/), [Express.js](https://expressjs.com/) (100% JavaScript / TypeScript) |
| **AI Framework** | [LangChain.js](https://js.langchain.com/), `@google/generative-ai` |
| **Mô hình LLM & Embeddings** | **Google Gemini 1.5 Flash**, `text-embedding-004` |
| **Cơ sở dữ liệu chính** | [PostgreSQL](https://www.postgresql.org/)  |
| **Vector Database (RAG)** | [PGVector](https://github.com/pgvector/pgvector) / ChromaDB |
| **Đóng gói & Triển khai** | Docker, Docker Compose |

---

## 🚀 CÁC TÍNH NĂNG CHÍNH

### 1. Phân hệ Khách hàng (Storefront)
- [x] Xem danh mục sản phẩm (Laptop, Smartphone, Phụ kiện).
- [x] Bộ lọc thông số kỹ thuật đa năng (khoảng giá, hãng, CPU, dung lượng RAM).
- [x] Xem chi tiết sản phẩm, ảnh phóng to, bảng thông số phần cứng chi tiết.
- [x] Quản lý giỏ hàng (lưu trữ cục bộ với LocalStorage qua Zustand).
- [x] Đặt hàng nhanh (Checkout COD / Quét mã QR chuyển khoản tĩnh, không cần login).
- [x] Tra cứu tiến độ đơn hàng tức thì bằng `Mã đơn` + `Số điện thoại`.

### 2. Phân hệ Trợ lý ảo AI (BK-Bot)
- [x] Cửa sổ chat nổi (Floating Chat Widget) giao diện hiện đại.
- [x] Phản hồi dạng dòng dữ liệu thời gian thực (Server-Sent Events - SSE).
- [x] Duy trì trí nhớ ngữ cảnh hội thoại (Conversation Memory theo session).
- [x] Tư vấn chọn máy và so sánh kỹ thuật giữa 2-3 sản phẩm.
- [x] RAG Engine: Tra cứu chính sách bảo hành, đổi trả từ tài liệu tri thức cửa hàng.
- [x] Tool Calling: Tự động gọi hàm SQL kiểm tra tồn kho tại các kho hàng.
- [x] Tool Calling: Tự động kiểm tra trạng thái vận đơn cho khách hàng.
- [x] Rich UI: Hiển thị Thẻ Card sản phẩm (ảnh, giá, nút "Xem ngay" / "Thêm giỏ") trong chat.

### 3. Phân hệ Quản trị (Admin)
- [x] Quản lý sản phẩm, thông số cấu hình và số lượng tồn kho.
- [x] Quản lý đơn hàng, đổi trạng thái đơn (Chờ xác nhận → Đang giao → Đã giao).
- [x] Quản lý tri thức RAG: Tải lên tài liệu chính sách mới (Markdown/PDF) để hệ thống tự động vector hóa và nạp vào DB.

---

