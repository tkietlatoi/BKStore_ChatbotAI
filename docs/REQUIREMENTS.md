# TÀI LIỆU ĐẶC TẢ YÊU CẦU PHẦN MỀM (SRS)
## DỰ ÁN: WEBSITE THƯƠNG MẠI ĐIỆN TỬ THIẾT BỊ CÔNG NGHỆ TÍCH HỢP AI CHATBOT (BK-STORE)

* **Loại đề tài:** Đồ án liên ngành Công nghệ thông tin
* **Nền tảng công nghệ:** Next.js (Frontend), Node.js/Express (Backend), LangChain.js & Google Gemini API (AI Service), PostgreSQL / PGVector (Database).
* **Phiên bản tài liệu:** 1.0
* **Ngày ban hành:** 2026-09-13

---

## 1. GIỚI THIỆU DỰ ÁN (INTRODUCTION)

### 1.1. Mục đích tài liệu
Tài liệu này xác định chi tiết các yêu cầu chức năng, phi chức năng, phạm vi và tiêu chí nghiệm thu cho hệ thống website thương mại điện tử thiết bị công nghệ BK-Store, phục vụ quy trình phát triển theo chuẩn SDLC.

### 1.2. Mục tiêu hệ thống
* **Website E-Commerce:** Cung cấp kênh bán lẻ trực tuyến cho các thiết bị công nghệ (Laptop, Smartphone, Phụ kiện) với đầy đủ chu trình: xem sản phẩm, giỏ hàng, đặt hàng và tra cứu vận đơn.
* **AI Chatbot (BK-Bot):** Xây dựng trợ lý ảo thông minh đóng vai trò nhân viên tư vấn bán hàng và chăm sóc khách hàng 24/7, có khả năng tư vấn cấu hình, so sánh sản phẩm, giải đáp chính sách (RAG) và truy vấn dữ liệu thực tế (Tool Calling).

### 1.3. Các tác nhân trong hệ thống (Actors)
1. **Khách hàng (Guest / Customer):** Người dùng duyệt web, xem sản phẩm, trò chuyện với AI, đặt hàng và tra cứu đơn.
2. **Trợ lý ảo AI (BK-Bot):** Thực thể AI tự động phản hồi khách hàng theo ngữ cảnh tự nhiên, gọi công cụ tra cứu DB.
3. **Quản trị viên (Admin):** Quản lý danh mục, sản phẩm, đơn hàng và nạp tài liệu chính sách vào cơ sở tri thức.

---

## 2. PHẠM VI HỆ THỐNG (SYSTEM SCOPE)

### 2.1. Trong phạm vi (In-Scope)
* Quản lý và hiển thị danh mục thiết bị công nghệ (30–50 sản phẩm mẫu có thông số kỹ thuật thật).
* Bộ lọc đa tiêu chí: mức giá, hãng, CPU, RAM, dung lượng ổ cứng.
* Giỏ hàng và quy trình đặt hàng tinh gọn (COD / Chuyển khoản qua mã QR tĩnh, không bắt buộc đăng nhập).
* Tra cứu trạng thái đơn hàng bằng `Mã đơn hàng` + `Số điện thoại`.
* Chatbot AI tích hợp:
  * Trò chuyện dạng dòng dữ liệu thời gian thực (Streaming qua SSE).
  * Tư vấn theo nhu cầu & ngân sách; so sánh 2–3 sản phẩm dưới dạng bảng.
  * Trả lời chính sách bảo hành/đổi trả bằng RAG (Vector DB).
  * Tool Calling: Tra cứu tồn kho chi nhánh, tra cứu tiến độ đơn hàng từ SQL Database.
  * Rich UI: Trả về thẻ sản phẩm tương tác (Card) ngay trong khung chat.
* Trang quản trị: Quản lý sản phẩm, đơn hàng và giao diện upload file tài liệu RAG.

### 2.2. Ngoài phạm vi (Out-of-Scope)
* Không tích hợp cổng thanh toán thực tế (VNPAY, MoMo, Stripe).
* Không kết nối API hãng vận chuyển thứ 3 (GHN, Viettel Post).
* Không xây dựng mô hình sàn đa người bán (Multi-vendor).
* Không phát triển hệ thống Live Chat giữa người với người (Human-to-human escalation).
* Không tự huấn luyện (train/fine-tune) lại LLM từ đầu; sử dụng 100% qua Gemini API.

---

## 3. YÊU CẦU CHỨC NĂNG (FUNCTIONAL REQUIREMENTS)

### 3.1. Phân hệ Cửa hàng (E-Commerce Storefront)
| Mã yêu cầu | Tên chức năng | Mô tả chi tiết |
| :--- | :--- | :--- |
| **FR-01** | Duyệt danh mục & Trang chủ | Hiển thị sản phẩm mới, bán chạy theo danh mục (Laptop, Điện thoại, Phụ kiện). |
| **FR-02** | Tìm kiếm & Bộ lọc kỹ thuật | Tìm kiếm theo tên; lọc theo khoảng giá, thương hiệu, loại CPU, dung lượng RAM. |
| **FR-03** | Chi tiết sản phẩm | Hiển thị thông số kỹ thuật chi tiết, hình ảnh, giá bán, tình trạng còn/hết hàng. |
| **FR-04** | Quản lý giỏ hàng | Thêm sản phẩm vào giỏ, cập nhật số lượng, xóa sản phẩm, tự động tính tổng tiền. |
| **FR-05** | Đặt hàng (Checkout) | Nhập thông tin người nhận (Tên, SĐT, Địa chỉ), chọn phương thức (COD/QR Pay). Sinh mã đơn duy nhất (ví dụ: `#BK-1024`). |
| **FR-06** | Tra cứu đơn hàng | Người dùng nhập Mã đơn + SĐT để xem lịch sử và trạng thái vận chuyển. |

### 3.2. Phân hệ Trợ lý ảo AI (BK-Bot)
| Mã yêu cầu | Tên chức năng | Mô tả chi tiết |
| :--- | :--- | :--- |
| **FR-07** | Widget Chat & Streaming | Khung chat nổi góc màn hình; stream phản hồi từng từ qua Server-Sent Events (SSE). |
| **FR-08** | Duy trì ngữ cảnh (Memory) | Lưu lịch sử hội thoại trong phiên (Session) để duy trì ngữ cảnh câu hỏi liên tiếp. |
| **FR-09** | Tư vấn theo nhu cầu | Phân tích yêu cầu tự nhiên (mục đích sử dụng, ngân sách) → gợi ý sản phẩm phù hợp. |
| **FR-10** | So sánh sản phẩm | So sánh thông số kỹ thuật 2–3 sản phẩm theo yêu cầu và tổng hợp ưu/nhược điểm. |
| **FR-11** | Tra cứu chính sách (RAG) | Tìm kiếm ngữ nghĩa trong Vector DB để trả lời về bảo hành, đổi trả, sửa chữa. |
| **FR-12** | Tool: Tra cứu tồn kho | Bot tự động gọi hàm nội bộ kiểm tra số lượng máy còn hàng tại chi nhánh. |
| **FR-13** | Tool: Tra cứu đơn hàng | Bot nhận diện ý định hỏi đơn → yêu cầu Mã đơn + SĐT → truy vấn DB trả kết quả. |
| **FR-14** | Hiển thị thẻ Card tương tác | Hiển thị Card sản phẩm (ảnh, tên, giá, nút Xem chi tiết / Thêm vào giỏ) trong khung chat. |

### 3.3. Phân hệ Quản trị (Admin Dashboard)
| Mã yêu cầu | Tên chức năng | Mô tả chi tiết |
| :--- | :--- | :--- |
| **FR-15** | Đăng nhập quản trị | Xác thực quyền Admin để truy cập khu vực quản lý. |
| **FR-16** | Quản lý sản phẩm | Thêm, sửa, xóa sản phẩm, cập nhật thông số và số lượng kho. |
| **FR-17** | Quản lý đơn hàng | Xem danh sách đơn, lọc theo trạng thái, cập nhật trạng thái (Chờ duyệt → Đang giao → Đã giao). |
| **FR-18** | Quản lý tri thức RAG | Tải lên tài liệu chính sách (PDF/Markdown) → Backend tự động cắt đoạn (chunking), tạo embedding và lưu vào Vector DB. |

---

## 4. YÊU CẦU PHI CHỨC NĂNG (NON-FUNCTIONAL REQUIREMENTS)

| Mã yêu cầu | Hạng mục | Tiêu chí kỹ thuật |
| :--- | :--- | :--- |
| **NFR-01** | **Thời gian đáp ứng (Latency)** | Thời gian sinh ký tự đầu tiên (Time to First Token) của Chatbot ≤ 1.5 giây qua kết nối SSE. Các API CRUD web ≤ 300ms. |
| **NFR-02** | **Độ tin cậy của AI (Groundedness)** | Câu trả lời về chính sách phải bám sát tài liệu RAG. Tỷ lệ ảo giác (bịa thông số/giá không có trong DB) ≤ 5\%. |
| **NFR-03** | **Bảo mật (Security)** | API Key Gemini được bảo vệ trong biến môi trường Backend, không lộ ra Client. Tra cứu đơn hàng bắt buộc khớp cả Mã đơn và Số điện thoại. |
| **NFR-04** | **Xử lý sự cố (Fault Tolerance)** | Khi Gemini API bị gián đoạn hoặc quá tải, hệ thống phải hiển thị câu thông báo fallback lịch sự thay vì báo lỗi hệ thống sập. |
| **NFR-05** | **Giao diện & Tương thích (UX/UI)** | Giao diện chuẩn Responsive (hoạt động tốt trên Desktop và Mobile), khung chat không che khuất nội dung quan trọng. |
| **NFR-06** | **Tính module hóa (Architecture)** | 100% mã nguồn sử dụng JavaScript/TypeScript trên nền tảng Node.js/Express. Mã nguồn phân tách rõ: Router, Controller, Service, Agent Tools. |

---

## 5. MÔ TẢ LUỒNG HOẠT ĐỘNG CỦA AI CHATBOT (AI WORKFLOW)

```
[Người dùng gửi tin nhắn]
            │
            ▼
[Express Server: Endpoint /api/chat/stream]
            │
            ▼
[LangChain.js: Phân loại ý định & Chọn hành động]
      ├── 1. Hỏi chính sách / Bảo hành  ──► [Vector DB: Semantic Search (RAG)] ──► Sinh câu trả lời
      ├── 2. Hỏi tồn kho / Đơn hàng    ──► [Tool Calling: Query PostgreSQL]   ──► Sinh câu trả lời
      └── 3. Hỏi tư vấn / So sánh       ──► [Prompt Engineering + Context]     ──► Trả về Text + Cards
            │
            ▼
[Server-Sent Events (SSE): Stream từng token về Frontend Widget]
```

---

## 6. TIÊU CHÍ NGHIỆM THU ĐỒ ÁN (ACCEPTANCE CRITERIA)

Dự án được đánh giá là hoàn thành đạt yêu cầu khi:
1. **Website vận hành hoàn chỉnh:** Thực hiện trọn vẹn luồng từ duyệt sản phẩm → lọc sản phẩm → thêm giỏ → đặt hàng và nhận mã đơn.
2. **Chatbot hoạt động thực tế:** Trả lời mượt mà bằng tiếng Việt; trả lời chính xác thông số kỹ thuật; stream chữ không bị giật lag.
3. **Chứng minh được năng lực RAG:** Hỏi các câu hỏi ngóc ngách về chính sách (ví dụ: *"Bảo hành pin laptop bao nhiêu tháng?"*) và bot trích xuất đúng nội dung từ file tài liệu đã nạp.
4. **Chứng minh được Tool Calling:** Khách hỏi *"Kiểm tra đơn hàng #BK-1024 của SĐT 0987654321"* → Bot tự gọi hàm DB và thông báo chính xác trạng thái đơn hàng.
5. **Mã nguồn và Tài liệu:** Có đầy đủ mã nguồn Node.js/Express + Next.js, tài liệu đặc tả SRS, tài liệu thiết kế CSDL và hướng dẫn chạy bằng Docker.
