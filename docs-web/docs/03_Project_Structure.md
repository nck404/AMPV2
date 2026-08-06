# 03. Project Structure

Dự án AMPV2 được tổ chức theo cấu trúc monorepo đơn giản chia tách rõ ràng giữa frontend và backend, hỗ trợ cả ứng dụng di động thông qua Capacitor.

## Cấu trúc Thư mục

```text
AMPV2/
├── .github/                   # Cấu hình Github Actions CI/CD
│   └── workflows/             # Các kịch bản build APK, deploy backend và frontend
├── deploy/                    # Chứa script khởi động môi trường dev nhanh và cấu hình SSL
├── docs/                      # Tài liệu kỹ thuật Obsidian Docs
├── source/                    # Mã nguồn chính của hệ thống
│   ├── backend/               # Core API sử dụng Node.js & Prisma
│   │   ├── middleware/        # Các middleware bảo mật và xác thực
│   │   ├── prisma/            # File cấu hình cơ sở dữ liệu schema và CSDL SQLite dev.db
│   │   ├── routes/            # Module định tuyến của ExpressJS
│   │   ├── uploads/           # Thư mục lưu trữ tệp tin tạm thời (CV, Avatar)
│   │   ├── package.json
│   │   └── server.js          # File khởi tạo HTTP server & Socket.io
│   └── frontend/              # Ứng dụng khách sử dụng SvelteKit
│       ├── amp/               # Dự án web tối ưu cho trình duyệt PC/Laptop
│       │   ├── src/           # Mã nguồn SvelteKit, routes, stores và lib
│       │   └── static/        # Tài nguyên tĩnh, hình ảnh mô phỏng cử chỉ
│       └── mobile/            # Dự án mobile tích hợp Capacitor
│           ├── android/       # Mã nguồn gốc Gradle Android sinh bởi Capacitor
│           ├── src/           # Mã nguồn SvelteKit của Mobile
│           └── capacitor.config.json
└── package.json               # Cấu hình workspace gốc
```

## Chi tiết Vai trò các Thư mục Chính

### 1. Thư mục `source/backend/`
- **`server.js`**: Khởi chạy máy chủ HTTP, thiết lập chính sách CORS cho phép các domain tin cậy, nạp kết nối Prisma Adapter LibSQL và cấu hình Socket.io lắng nghe sự kiện nhắn tin thời gian thực.
- **`routes/`**: Tách nhỏ các tuyến API theo mục đích nghiệp vụ:
  - `auth.js`: Đăng ký, đăng nhập hệ thống, đăng nhập Google OAuth, cập nhật hồ sơ người dùng.
  - `admin.js`: Cung cấp API quản lý danh sách người dùng, bài viết, việc làm và gửi thông báo hệ thống.
  - `forum.js`: Xử lý đăng tải bài viết, bình luận đa cấp, bày tỏ cảm xúc (Reaction).
  - `chat.js`: Truy vấn lịch sử tin nhắn nhóm/cá nhân, đánh dấu tin nhắn đã đọc.
  - `sign_language.js`: Lưu trữ tiến trình học tập, bảng xếp hạng (Leaderboard) và khóa/mở khóa các bài học.
  - `recruitment.js`: Tuyển dụng, nộp hồ sơ, tải lên CV và gửi email hàng loạt cho ứng viên.
  - `tts.js`: Endpoint proxy kết nối Google TTS API tiếng Việt để phát âm hỗ trợ người khiếm thị.
- **`middleware/`**: 
  - `auth.js`: Chứa hàm `authenticateToken` giải mã JWT, `optionalAuthenticateToken` cho phép đọc bài không bắt buộc đăng nhập và `requireAdmin` chặn các truy cập trái phép vào trang quản trị.

### 2. Thư mục `source/frontend/`
- **`amp/` (Web Client)**:
  - Cấu trúc định tuyến dựa trên thư mục của SvelteKit trong `src/routes/`.
  - Tích hợp các thư viện AI ở mức client qua thẻ `<script>` ở file `app.html` để tối ưu hóa thời gian tải trang.
  - Sử dụng module CSS thuần biến thể tại `layout.css`.
- **`mobile/` (Mobile Client)**:
  - Tương tự như ứng dụng web nhưng có tích hợp thêm Capacitor.
  - Có thư mục `android/` chứa build gradle của Android Studio phục vụ quá trình biên dịch ra ứng dụng Native Android.
