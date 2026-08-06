# 04. Tech Stack

Hệ thống AMP kết hợp các công nghệ hiện đại nhằm đảm bảo hiệu năng tối ưu trên thiết bị di động, khả năng bảo mật cao ở backend và khả năng nhận diện AI thời gian thực trực tiếp ở frontend.

## Chi tiết Công nghệ Sử dụng

### 1. Backend (Core Services)
*   **Ngôn ngữ & Runtime**: Node.js (CommonJS, ESM support)
*   **Framework**: Express.js (Phiên bản v5.2.1 mới nhất hỗ trợ xử lý luồng routing tối ưu)
*   **Real-time Communication**: Socket.io (v4.8.3) quản lý kết nối WebSocket hai chiều.
*   **Database ORM**: Prisma Client (v5.22.0) giúp quản lý mô hình dữ liệu và thực hiện di chuyển schema.
*   **Xác thực bảo mật**: 
    *   `jsonwebtoken` (v9.0.3) tạo ký số bảo mật JWT.
    *   `bcryptjs` (v3.0.3) mã hóa băm mật khẩu một chiều chống tấn công brute-force.
    *   `google-auth-library` (v10.9.1) xác minh chữ ký mã token Google OAuth2.
*   **Quản lý tệp tin**: `multer` (v2.2.0) xử lý tải file CV và hình ảnh đại diện.

### 2. Frontend (Web & Mobile Clients)
*   **Framework**: SvelteKit (Svelte v5) với hệ thống Reactivity tinh gọn sử dụng Runes (`$state`, `$derived`, `$effect`).
*   **Mobile Container**: Capacitor CLI & Core để chuyển đổi mã nguồn Web thành Native Android Java/Kotlin.
*   **Styling**: Vanilla CSS kết hợp hệ thống Icon của **Boxicons** (v2.1.4).
*   **Hỗ trợ Markdown**: `marked` (vết trên CDN) để chuyển đổi nội dung tài liệu hướng dẫn và bài viết diễn đàn.
*   **Hiệu ứng động**: `canvas-confetti` tạo hiệu ứng chúc mừng khi người dùng hoàn thành bài học ngôn ngữ ký hiệu xuất sắc.

### 3. AI & Assistive Technologies (Edge Computing)
*   **Computer Vision**: `@mediapipe/hands` định vị chính xác vị trí và tọa độ không gian 3 chiều của 21 khớp tay từ camera.
*   **Gesture Recognition**: `fingerpose` (Gesture Estimator) phân tích các góc gập ngón tay để dự đoán cử chỉ tương thích.
*   **Text-to-Speech**: Google TTS API thông qua lớp proxy Node.js để tránh lộ khóa API và giải quyết xung đột CORS trên trình duyệt của người khiếm thị.

### 4. Database Storage
*   **Development**: SQLite cục bộ sử dụng tệp `dev.db` giúp phát triển nhanh chóng.
*   **Production**: Turso Cloud Database (LibSQL - Bản mở rộng phân tán của SQLite) thông qua driver `@prisma/adapter-libsql` giúp đồng bộ dữ liệu toàn cầu với độ trễ cực thấp.
