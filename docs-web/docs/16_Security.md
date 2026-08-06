# 16. Security Measures

Hệ thống AMP áp dụng các giải pháp bảo mật nhiều lớp nhằm bảo vệ thông tin cá nhân của người khuyết tật và ngăn chặn các cuộc tấn công mạng phổ biến.

## Các biện pháp bảo mật chính

### 1. Xác thực và Phân quyền chặt chẽ
- **Bảo vệ Token**: JWT được mã hóa với chữ ký bảo mật dài được lấy từ biến môi trường `JWT_SECRET`. Hạn dùng của Token được thiết lập là 30 ngày.
- **An toàn mật khẩu**: Toàn bộ mật khẩu của người dùng bắt buộc phải đi qua thuật toán băm một chiều **bcryptjs** kết hợp với chuỗi muối ngẫu nhiên (salt rounds = 10) trước khi ghi vào cơ sở dữ liệu. Không lưu mật khẩu thô dưới bất kỳ hình thức nào.
- **Middleware phân quyền**: Các API nhạy cảm của trang quản trị hoặc đăng tin tuyển dụng đều được bảo vệ kép bởi middleware `authenticateToken` và `requireAdmin`, ngăn chặn tấn công leo thang đặc quyền (Privilege Escalation).

### 2. Kiểm soát dữ liệu đầu vào và Ngăn chặn lỗ hổng
- **Ngăn chặn SQL Injection**: Nhờ sử dụng **Prisma ORM** làm cầu nối truy vấn, mọi tham số truyền vào cơ sở dữ liệu đều được tự động chuyển đổi thành câu lệnh chuẩn hóa (Parameterized Queries), giúp triệt tiêu hoàn toàn nguy cơ bị khai thác SQL Injection.
- **Xử lý tệp tải lên (File Upload Security)**:
  - Giới hạn loại tệp tin trong route [`recruitment.js`](file:///D:/Project/AMPV2/source/backend/routes/recruitment.js): Chỉ cho phép tải lên các tệp tin có phần mở rộng `.pdf`, `.doc`, `.docx` để tránh nguy cơ tải lên tệp thực thi mã độc.
  - Sử dụng định danh ngẫu nhiên cho tên tệp lưu trữ trên server: `cv_${userId}_${randomString}${ext}` nhằm ngăn chặn tấn công ghi đè tệp tin hệ thống.

### 3. Chính sách CORS & Bảo vệ API
- Máy chủ Express thiết lập cấu hình CORS nghiêm ngặt trong [`server.js`](file:///D:/Project/AMPV2/source/backend/server.js): Chỉ cho phép các domain được định nghĩa trước (như localhost dev, tfai.lol và các subdomain của Surge) gửi yêu cầu và đọc thông tin phản hồi từ API.
- Hỗ trợ cho phép các request không có header `Origin` (như ứng dụng di động Android gốc hoặc yêu cầu từ curl) nhưng chặn đứng các trang web lạ cố tình truy cập tài nguyên.
