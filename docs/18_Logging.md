# 18. Logging & Error Handling

Hệ thống AMP thiết lập cơ chế giám sát và bắt lỗi toàn diện nhằm đảm bảo khả năng phục hồi tự động khi xảy ra sự cố.

## 1. Cơ chế Xử lý Lỗi (Error Handling)

### Xử lý lỗi tại Backend API
- Mọi khối lệnh truy cập cơ sở dữ liệu hoặc gọi dịch vụ ngoài đều được bọc trong cấu trúc `try-catch` để tránh làm sập máy chủ khi xảy ra lỗi kết nối.
- Khi phát hiện lỗi hệ thống, backend trả về mã trạng thái HTTP chuẩn kèm thông điệp JSON thân thiện với người dùng:
  - Lỗi kết nối DB / Lỗi logic sâu: Trả về trạng thái `500 Internal Server Error` kèm phản hồi `{ "msg": "Server error" }`.
  - Lỗi nghiệp vụ (Business logic): Trả về trạng thái thích hợp như `400 Bad Request` hoặc `404 Not Found` kèm chi tiết nguyên nhân.

### Xử lý lỗi tại Frontend Client
- API Wrapper trong [`api.js`](file:///D:/Project/AMPV2/source/frontend/amp/src/lib/api.js) tự động bắt các phản hồi lỗi từ server.
- Nếu server trả về lỗi `401 Unauthorized`, hệ thống sẽ ném ra ngoại lệ để component xử lý xóa token lỗi thời và đưa người dùng về trang đăng nhập.
- Hiển thị thông báo Toast góc màn hình thông qua store `toast.js` để người dùng biết trạng thái kết nối mạng hoặc lỗi camera webcam.

---

## 2. Nhật ký Hệ thống (Logging)

- **Nhật ký Console**: Backend ghi lại các sự kiện quan trọng trong quá trình vận hành trực tiếp ra luồng ra tiêu chuẩn (stdout/stderr):
  - Khởi động máy chủ thành công kèm cổng lắng nghe.
  - Kết nối Socket.io của khách hàng kèm thông tin sự kiện gửi/nhận tin nhắn.
  - Các lỗi phát sinh trong quá trình lưu trữ tin nhắn hoặc tải tệp tin được in chi tiết qua `console.error` để hỗ trợ gỡ lỗi nhanh.
- **PM2 Log Management**: Khi chạy ở môi trường production, PM2 tự động thu thập toàn bộ luồng log từ console và ghi vào các file nhật ký riêng biệt tại thư mục `~/.pm2/logs/` để tiện cho việc kiểm tra lịch sử vận hành.
