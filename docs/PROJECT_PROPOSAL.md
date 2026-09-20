# PROJECT PROPOSAL


## THÔNG TIN CHUNG VỀ ĐỀ TÀI

* **Tên đề tài :** Xây dựng Website thương mại điện tử thiết bị công nghệ tích hợp Trợ lý ảo AI chăm sóc khách hàng dựa trên Node.js, Express, LangChain.js và Google Gemini.
* **Tên sản phẩm dự kiến:** **BK-Store** (*Smart Tech Commerce*)
* **Loại đề tài:** Đồ án liên ngành Công nghệ thông tin 
* **Thời gian thực hiện dự kiến:** 10 tuần 

---

## 1. ĐẶT VẤN ĐỀ & TÍNH CẤP THIẾT CỦA ĐỀ TÀI

### 1.1. Bối cảnh thực tiễn
Thương mại điện tử (E-Commerce) trong lĩnh vực thiết bị điện tử, công nghệ (Laptop, Điện thoại thông minh, Linh kiện máy tính) là một trong những ngành hàng có giá trị đơn hàng cao và tốc độ tăng trưởng nhanh nhất hiện nay. Tuy nhiên, khác với các mặt hàng tiêu dùng thông thường (thời trang, đồ gia dụng), thiết bị điện tử có **thông số kỹ thuật phức tạp** (CPU, card đồ họa, chuẩn RAM, độ phân giải màn hình, tản nhiệt, khả năng nâng cấp) và **yêu cầu bảo hành nghiêm ngặt**. 

Khách hàng khi mua sắm trực tuyến thường có nhu cầu rất lớn về:
* Được tư vấn sản phẩm tối ưu theo ngân sách và mục đích sử dụng cụ thể (lập trình, đồ họa 3D, chơi game, văn phòng).
* So sánh chi tiết ưu - nhược điểm giữa các dòng máy tương đương.
* Hỏi đáp nhanh về chính sách đổi trả, bảo hành linh kiện, vận chuyển.

### 1.2. Hạn chế của các giải pháp hiện tại
1. **Chatbot dựa trên quy tắc (Rule-based Chatbot):** Phổ biến hiện nay dựa trên các cây kịch bản định sẵn (nhấn nút menu hoặc nhận diện từ khóa cứng). Hệ thống này tỏ ra bất lực trước các câu hỏi tự nhiên phức tạp, không thể hiểu ngữ cảnh đa biến và không có khả năng so sánh thông số linh hoạt.
2. **Đội ngũ nhân viên trực 24/7:** Chi phí vận hành nhân sự trực ca đêm hoặc giờ cao điểm rất lớn, tốc độ trả lời phụ thuộc vào kiến thức cá nhân của từng tổng đài viên.

### 1.3. Giải pháp đề xuất
Đề tài đề xuất ứng dụng **Mô hình ngôn ngữ lớn (Large Language Model - LLM)** tiên tiến từ **Google Gemini** kết hợp với framework **LangChain.js** và kỹ thuật **RAG (Retrieval-Augmented Generation)** để xây dựng một **Trợ lý ảo AI (BK-Bot)**:
* Tự động tư vấn thông số kỹ thuật chuẩn xác theo ngôn ngữ tự nhiên.
* Truy xuất chính xác tài liệu chính sách của cửa hàng thông qua Cơ sở dữ liệu Vector (Vector DB), loại bỏ hoàn toàn hiện tượng ảo giác (hallucination).
* Ứng dụng **Function / Tool Calling** để bot kết nối trực tiếp với Cơ sở dữ liệu SQL, tự động tra cứu số lượng tồn kho và tình trạng đơn hàng theo thời gian thực.
* Toàn bộ hệ thống Backend được phát triển trên nền tảng **Node.js/Express (100% JavaScript/TypeScript)**, tận dụng cơ chế Non-blocking I/O để xử lý luồng phản hồi tức thời (Server-Sent Events - SSE).

---

## 2. MỤC TIÊU CỦA ĐỀ TÀI

### 2.1. Mục tiêu tổng quát
Xây dựng một nền tảng thương mại điện tử chuyên ngành công nghệ hoàn chỉnh từ giao diện người dùng đến hệ thống quản trị, tích hợp sâu một Trợ lý ảo AI có khả năng tư vấn nghiệp vụ và hỗ trợ khách hàng tự động 24/7.

### 2.2. Mục tiêu cụ thể
1. **Về Kỹ nghệ phần mềm (Software Engineering):**
   * Xây dựng website bán hàng hiện đại với Next.js và TailwindCSS; Backend RESTful API với Node.js/Express.
   * Thiết kế cơ sở dữ liệu quan hệ PostgreSQL chuẩn hóa cho nghiệp vụ bán hàng và mở rộng PGVector/ChromaDB cho dữ liệu ngữ nghĩa.
   
2. **Về Trí tuệ nhân tạo ứng dụng (Applied AI):**
   * Xây dựng pipeline RAG hoàn chỉnh: Đọc tài liệu → Phân mảnh (Chunking) → Sinh Vector Embedding → Lưu trữ & Truy vấn ngữ nghĩa (Semantic Search).
   * Triển khai kỹ thuật Agentic Tool Calling cho phép AI gọi các hàm nghiệp vụ: tra cứu kho hàng và kiểm tra trạng thái đơn hàng.
   * Tối ưu hóa trải nghiệm người dùng với Server-Sent Events (SSE), đảm bảo thời gian bắt đầu phản hồi (Time-to-First-Token) dưới 1.5 giây.

---

## 3. ĐỐI TƯỢNG VÀ PHẠM VI NGHIÊN CỨU

### 3.1. Đối tượng nghiên cứu
* Kiến trúc ứng dụng Web hướng dịch vụ sử dụng Node.js và Express.
* Mô hình ngôn ngữ lớn Google Gemini (`gemini-1.5-flash`) và mô hình nhúng `text-embedding-004`.
* Framework LangChain.js và kỹ thuật RAG trong môi trường JavaScript.
* Cơ sở dữ liệu Vector và thuật toán tìm kiếm tương đồng vector (Cosine Similarity / HNSW).

### 3.2. Phạm vi đề tài (Scope)

#### A. Trong phạm vi (In-Scope)
* **Website bán hàng:** Danh mục thiết bị điện tử (Laptop, Điện thoại, Phụ kiện); bộ lọc thông số kỹ thuật (RAM, CPU, Giá); giỏ hàng; đặt hàng nhanh (COD / Chuyển khoản QR tĩnh); tra cứu vận đơn theo Mã đơn + SĐT.
* **AI Chatbot:** Widget chat nổi; stream chữ thời gian thực; tư vấn cấu hình theo nhu cầu; so sánh 2–3 sản phẩm; hỏi đáp chính sách (RAG); gọi công cụ kiểm tra tồn kho và đơn hàng (Tool Calling); hiển thị thẻ sản phẩm tương tác (Card).
* **Trang quản trị:** Quản lý sản phẩm, đơn hàng; giao diện tải lên tài liệu chính sách để nạp tự động vào Vector DB.

#### B. Ngoài phạm vi (Out-of-Scope)
* Không tích hợp cổng thanh toán trực tuyến của bên thứ ba (VNPAY, MoMo) vì lý do pháp lý doanh nghiệp → Thay thế bằng COD và mã QR chuyển khoản tĩnh.
* Không kết nối API hãng vận chuyển thứ ba (GHN, Viettel Post) → Trạng thái đơn được mô phỏng bởi quản trị viên.
* Không xây dựng sàn thương mại đa người bán (Multi-vendor).
* Không tự huấn luyện lại mô hình (Pre-train/Fine-tune LLM).

---

## 4. PHƯƠNG PHÁP NGHIÊN CỨU & KIẾN TRÚC GIẢI PHÁP

### 4.1. Phương pháp luận phát triển (SDLC)
Dự án áp dụng mô hình **Iterative Agile / Scrum** với các chu kỳ lặp ngắn (Sprints 2 tuần). Mỗi Sprint đều tạo ra một phiên bản phần mềm có thể kiểm thử và đánh giá độc lập.

### 4.2. Kiến trúc giải pháp kỹ thuật

```
[Khách hàng (Trình duyệt)] 
           │ (HTTP / SSE)
           ▼
[Frontend: Next.js (React) + TailwindCSS]
           │ (RESTful API & EventSource)
           ▼
[Backend: Node.js + Express.js API Server]
   ├── [Module Nghiệp vụ]: Auth, Product, Cart, Order
   └── [Module AI Service (LangChain.js)]:
            ├── Google Gemini API (gemini-1.5-flash)
            ├── Google Embeddings (text-embedding-004)
            ├── Vector Store: PGVector / ChromaDB (RAG Tri thức)
            └── Agent Tools: Truy vấn Database tồn kho & đơn hàng
           │
           ▼
[Cơ sở dữ liệu: PostgreSQL (Dữ liệu nghiệp vụ & Vector Embeddings)]
```

---

## 5. KẾ HOẠCH & TIẾN ĐỘ THỰC HIỆN (ROADMAP 10 TUẦN)

| Giai đoạn (Sprint) | Thời gian | Nội dung công việc chính | Sản phẩm đầu ra (Deliverables) |
| :--- | :---: | :--- | :--- |
| **Pha 1: Khởi động & Đặc tả yêu cầu** | Tuần 1 | • Khảo sát nghiệp vụ bán lẻ công nghệ.<br>• Phân tích yêu cầu chức năng & phi chức năng.<br>• Viết tài liệu đặc tả yêu cầu (SRS). | • Bản SRS hoàn chỉnh.<br>• Bản đề cương Proposal. |
| **Pha 2: Thiết kế hệ thống & CSDL** | Tuần 2 | • Thiết kế kiến trúc tổng thể C4 model.<br>• Thiết kế ERD Database & Schema Vector DB.<br>• Thiết kế giao diện UI/UX (Figma). | • Tài liệu System Design.<br>• Bản vẽ ERD & UI Wireframe. |
| **Pha 3: Phát triển Core E-Commerce** | Tuần 3–4 | • Khởi tạo Backend Express & cấu hình PostgreSQL.<br>• Xây dựng API sản phẩm, giỏ hàng, đơn hàng.<br>• Xây dựng giao diện Frontend Next.js. | • Trang web duyệt sản phẩm, lọc cấu hình và đặt hàng hoạt động được. |
| **Pha 4: Xây dựng AI RAG Pipeline** | Tuần 5–6 | • Thu thập tài liệu chính sách & cẩm nang kỹ thuật.<br>• Cấu hình LangChain.js & Vector Store.<br>• Xây dựng luồng RAG và kiểm thử Prompt. | • Module RAG tra cứu chính sách chính xác, hạn chế ảo giác. |
| **Pha 5: Agent Tool Calling & Streaming** | Tuần 7–8 | • Viết Tool tra cứu kho & đơn hàng cho Agent.<br>• Xây dựng SSE Endpoint stream chữ trên Express.<br>• Tích hợp Chatbot Widget & Card sản phẩm vào Web. | • Chatbot hoàn chỉnh trên giao diện web, tương tác dữ liệu thực tế. |
| **Pha 6: Kiểm thử, Tối ưu & Báo cáo** | Tuần 9–10 | • Kiểm thử phần mềm (Unit test, Integration test).<br>• Đánh giá RAG Triad & khả năng chống injection.<br>• Đóng gói Docker & hoàn thiện Báo cáo tốt nghiệp. | • Mã nguồn trên GitHub.<br>• Bản báo cáo đồ án hoàn chỉnh.<br>• Slide thuyết trình & Video demo. |

---

## 6. ĐÁNH GIÁ RỦI RO & PHƯƠNG ÁN GIẢI QUYẾT

| Rủi ro tiềm ẩn | Mức độ | Phương án phòng ngừa / Giải quyết |
| :--- | :---: | :--- |
| **Chi phí / Hạn mức Gemini API vượt ngưỡng** | Trung bình | Sử dụng model `gemini-1.5-flash` có chi phí rẻ và hạn ngạch miễn phí lớn; thiết lập bộ nhớ đệm (Cache) cho các câu hỏi phổ biến. |
| **Hiện tượng ảo giác thông tin (Hallucination)** | Cao | Ép buộc bot trả lời dựa trên RAG Context; sử dụng System Prompt nghiêm ngặt cấm bịa thông số/giá tiền; trả về fallback nếu không tìm thấy dữ liệu. |
| **Độ trễ phản hồi của Chatbot cao** | Trung bình | Ứng dụng Server-Sent Events (SSE) để stream token ngay khi model vừa sinh chữ; tối ưu kích thước chunk trong Vector DB. |
| **Xung đột tiến độ giữa các thành viên** | Thấp | Phân chia công việc theo Module rõ ràng (Web Core vs AI Service); quản lý source code bằng Git branching chuẩn (Feature Branch Workflow). |

---

## 7. KẾT QUẢ DỰ KIẾN VÀ Ý NGHĨA ĐỀ TÀI

### 7.1. Sản phẩm dự kiến bàn giao
1. **Ứng dụng hoàn chỉnh:** Website BK-Store hoạt động ổn định, có đầy đủ phân hệ mua hàng, quản trị và trợ lý ảo AI.
2. **Bộ mã nguồn:** 100% JavaScript/TypeScript phân tầng rõ ràng, sẵn sàng triển khai qua Docker container.
3. **Hồ sơ tài liệu kỹ thuật:**
   * Bản đề cương đề tài (Project Proposal).
   * Bản đặc tả yêu cầu phần mềm (SRS).
   * Tài liệu thiết kế hệ thống & CSDL (Architecture & Database Design).
   * Báo cáo kiểm thử và đánh giá hiệu quả AI (Testing & Evaluation Report).

### 7.2. Ý nghĩa thực tiễn của đề tài
* Minh chứng tính khả thi của việc kết hợp công nghệ Web hiện đại (Node.js/Express) với các mô hình Trí tuệ nhân tạo thế hệ mới (Google Gemini) mà không cần phụ thuộc vào hạ tầng huấn luyện AI phức tạp.
* Đóng góp một mô hình mẫu (Blueprint) cho việc ứng dụng Conversational AI vào thương mại điện tử chuyên ngành thiết bị công nghệ, nâng cao trải nghiệm mua sắm và tối ưu hóa chi phí vận hành cho doanh nghiệp.

---


