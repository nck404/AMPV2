# 21. Future Roadmap & Scaling

Định hướng phát triển và nâng cấp hệ thống AMP trong tương lai nhằm phục vụ cộng đồng lớn hơn và tích hợp các công nghệ trợ năng tiên tiến hơn.

## 1. Cải tiến Trí tuệ Nhân tạo (AI & Deep Learning)
*   **Chuyển đổi sang WebGL/WebGPU Custom Model**: Tự huấn luyện (Custom Train) mô hình TensorFlow.js hoặc ONNX Runtime trên tập dữ liệu ký hiệu tiếng Việt (VSL - Vietnamese Sign Language) thay vì sử dụng Fingerpose dựa trên luật tĩnh. Điều này giúp nhận diện được các cử chỉ động (ví dụ: chuyển động vẫy tay khi chào hỏi, cử chỉ phức tạp của cả hai bàn tay kết hợp).
*   **Tích hợp LLM Trợ năng**: Tích hợp các mô hình ngôn ngữ lớn (như Gemini) hoạt động ở chế độ ngoại tuyến (WebNN API) hoặc trực tuyến để tự động chuyển đổi chuỗi ký tự ký hiệu rời rạc thành câu tiếng Việt hoàn chỉnh, có ngữ pháp chính xác.

---

## 2. Nâng cấp Kiến trúc Hệ thống (Infrastructure & Scalability)
*   **Chuyển đổi sang Cơ sở dữ liệu phân tán**: Hoàn thiện tích hợp Turso DB ở chế độ đa phân vùng (Multi-region replica) giúp người dùng ở các vùng miền khác nhau truy cập diễn đàn và nhắn tin với độ trễ tối thiểu.
*   **Bộ nhớ đệm (Caching Layer)**: Tích hợp Redis làm lớp đệm lưu trữ danh sách phiên làm việc (Session Store), bảng xếp hạng học tập (Leaderboard cache) và lịch sử tin nhắn của phòng chat chung nhằm giảm tải trực tiếp cho cơ sở dữ liệu SQLite/Turso.
*   **Hệ thống tin nhắn hàng loạt (Queue/Broker)**: Sử dụng RabbitMQ hoặc BullMQ để quản lý hàng đợi gửi thông báo đẩy (Push Notification) và email phản hồi tuyển dụng hàng loạt của doanh nghiệp, tránh gây nghẽn luồng xử lý HTTP chính của Express.

---

## 3. Tính năng Trợ năng mới (New Accessibility Features)
*   **Hỗ trợ Haptic Feedback**: Sử dụng bộ rung của thiết bị di động (qua Capacitor Haptics API) để phản hồi lực rung nhẹ cho người khiếm thính khi họ thực hiện đúng cử chỉ tay mà không cần nhìn màn hình.
*   **Nhận diện biểu cảm khuôn mặt (Facial Expression)**: Kết hợp MediaPipe Face Mesh để phân tích biểu cảm khuôn mặt song song với cử chỉ tay, do biểu cảm đóng vai trò cực kỳ quan trọng trong việc truyền tải cảm xúc của ngôn ngữ ký hiệu.
*   **Trình đọc màn hình thông minh tự xây dựng**: Cung cấp bộ đọc văn bản bằng âm thanh chất lượng cao tiếng Việt tích hợp sâu trong ứng dụng để phục vụ người khiếm thị mà không cần cài đặt phần mềm bên thứ ba.
