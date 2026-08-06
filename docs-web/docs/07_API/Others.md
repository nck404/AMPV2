# Recruitment, Social, Docs, TTS & Chat API Endpoints

Tài liệu gom cụm các nhóm API nghiệp vụ phụ của hệ thống AMP.

## 1. Tuyển dụng (Recruitment) - `/api/recruitment`
Phục vụ kết nối doanh nghiệp tuyển dụng và người lao động khuyết tật (xử lý trong [`recruitment.js`](file:///D:/Project/AMPV2/source/backend/routes/recruitment.js)).

### Đăng tin tuyển dụng (POST `/jobs`)
*   **Xác thực**: Yêu cầu Token (Chỉ doanh nghiệp - role `business` hoặc `admin`).
*   **Body**: `{ "title": "Lập trình viên", "company": "Công ty X", "location": "Hà Nội", "salary": "Thỏa thuận", "type": "Full-time", "description": "..." }`
*   **Phản hồi thành công (201 Created)**: `{ "msg": "Job posted successfully. Waiting for admin approval.", "job_id": 12 }`

### Nộp hồ sơ ứng tuyển (POST `/jobs/:id/apply`)
*   **Xác thực**: Yêu cầu Token.
*   **Body**: `{ "name": "Nguyễn Văn A", "email": "a@example.com", "phone": "0987654321", "cv_url": "/uploads/cv_1.pdf", "cover_letter": "..." }`
*   **Phản hồi thành công (201 Created)**: `{ "msg": "Application submitted successfully." }`

---

## 2. Kết bạn & Tìm kiếm (Social) - `/api/social`
Phục vụ tương tác kết nối giữa các cá nhân người dùng khuyết tật (xử lý trong [`social.js`](file:///D:/Project/AMPV2/source/backend/routes/social.js)).

### Tìm kiếm người dùng (GET `/users/search?q=...`)
*   **Xác thực**: Yêu cầu Token.
*   **Phản hồi (200 OK)**: Trả về danh sách người dùng khớp với từ khóa tìm kiếm (tên hoặc public_id) kèm trạng thái quan hệ bạn bè (`friend_status`: `none`, `pending`, `accepted`).

### Gửi yêu cầu kết bạn (POST `/friends/request`)
*   **Xác thực**: Yêu cầu Token.
*   **Body**: `{ "friend_id": 2 }`
*   **Phản hồi (201 Created)**: `{ "msg": "Request sent" }`

---

## 3. Chuyển văn bản thành giọng nói (TTS) - `/api/tts`
Hỗ trợ người khiếm thị đọc nội dung bài viết và tương tác ứng dụng (xử lý trong [`tts.js`](file:///D:/Project/AMPV2/source/backend/routes/tts.js)).

### Phát âm văn bản (GET `/speak?text=...`)
*   **Mô tả**: proxy yêu cầu của client đến Google TTS dịch vụ Tiếng Việt để lấy về luồng nhị phân audio.
*   **Xác thực**: Không yêu cầu (Public).
*   **Phản hồi thành công (200 OK)**: Trả về dữ liệu nhị phân với `Content-Type: audio/mpeg`.

---

## 4. Trò chuyện (Chat) - `/api/chat`
Lưu trữ lịch sử hội thoại (xử lý trong [`chat.js`](file:///D:/Project/AMPV2/source/backend/routes/chat.js)).

### Lấy lịch sử chat (GET `/history?receiver_id=...`)
*   **Mô tả**: Lấy 100 tin nhắn gần nhất. Nếu truyền `receiver_id` sẽ lấy lịch sử chat 1-1, ngược lại lấy lịch sử phòng chat chung (Global Chat).
*   **Xác thực**: Yêu cầu Token.
*   **Phản hồi (200 OK)**: Danh sách các tin nhắn gồm `sender_id`, `sender_name`, `content`, `timestamp`.
