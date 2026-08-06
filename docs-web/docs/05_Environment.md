# 05. Environment

Hệ thống AMP sử dụng cấu hình thông qua các biến môi trường nhằm phân tách thông tin nhạy cảm khỏi mã nguồn công khai, hỗ trợ chuyển đổi linh hoạt giữa môi trường phát triển local và production (Turso DB, Google One-Tap Client).

## 1. Backend Environment Configuration

Tệp tin cấu hình `.env` của backend đặt tại `source/backend/.env`.

### Bảng tra cứu các biến môi trường Backend

| Tên biến | Kiểu dữ liệu | Giá trị mẫu | Mô tả chi tiết |
| :--- | :--- | :--- | :--- |
| `DATABASE_URL` | String | `file:./dev.db` hoặc `libsql://amp-db.turso.io` | Đường dẫn kết nối cơ sở dữ liệu. Nếu sử dụng SQLite cục bộ, cấu hình `file:./dev.db`. Nếu dùng Turso Cloud, cấu hình dạng kết nối `libsql://`. |
| `TURSO_AUTH_TOKEN` | String | `eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9...` | Token xác thực kết nối vào Turso Cloud Database (Bắt buộc nếu `DATABASE_URL` bắt đầu bằng `libsql:` hoặc `http:`). |
| `JWT_SECRET` | String | `c3VwZXItc2VjcmV0LWtleS1hbXAtMjAyNg==` | Chuỗi khóa bí mật dùng để ký số và giải mã mã token đăng nhập JWT. Không được chia sẻ chuỗi này. |
| `GOOGLE_CLIENT_ID` | String | `625110280747-i1kiof7an9t0fiaalqjk2ejh93ecu4is.apps.googleusercontent.com` | Mã định danh ứng dụng của dự án Google Cloud Platform để thực thi xác thực đăng nhập một chạm (Google One-Tap Login). |

> [!WARNING]
> Không bao giờ commit tệp `.env` chứa token thực lên Github. Sử dụng các cơ chế Secret Manager của nhà cung cấp Cloud (như VPS Environment Variables, Github Secrets) khi deploy production.

---

## 2. Frontend Environment Configuration

Tệp tin cấu hình `.env` của frontend đặt tại `source/frontend/amp/.env` và `source/frontend/mobile/.env`.

### Bảng tra cứu các biến môi trường Frontend

| Tên biến | Kiểu dữ liệu | Giá trị mẫu | Mô tả chi tiết |
| :--- | :--- | :--- | :--- |
| `PUBLIC_API_DOMAIN` | String | `http://localhost:6333/api` hoặc `https://amp-api.example.com/api` | Điểm cuối (Endpoint) cơ sở của API backend mà ứng dụng Client gửi yêu cầu RESTful HTTP. |
| `PUBLIC_GOOGLE_CLIENT_ID` | String | `625110280747-i1kiof7an9t0fiaalqjk2ejh93ecu4is.apps.googleusercontent.com` | Client ID dùng để hiển thị hộp thoại đăng nhập nhanh bằng tài khoản Google trên giao diện. |

> [!NOTE]
> Trong SvelteKit, các biến môi trường có tiền tố `PUBLIC_` được công khai hiển thị ở phía Client-side code.
