# 15. Testing Methodology

Quy trình và phương pháp kiểm thử của hệ thống AMP được xây dựng nhằm đảm bảo tính ổn định của API và độ chính xác của các thuật toán nhận diện cử chỉ.

## Các phương pháp kiểm thử chính

### 1. Kiểm thử tích hợp API (Integration Testing)
- **Công cụ khuyến nghị**: Postman hoặc Bruno.
- **Mục tiêu**: Kiểm tra tính đúng đắn của các điểm cuối API quan trọng như xác thực JWT, tương tác diễn đàn, cập nhật hồ sơ cá nhân và tiến trình học tập.
- **Kịch bản kiểm thử**:
  - Gửi request đăng ký tài khoản với định dạng email không hợp lệ -> Mong đợi lỗi `400 Bad Request`.
  - Gửi request đến route được bảo vệ `/api/me` không kèm header Authorization -> Mong đợi lỗi `401 Unauthorized`.
  - Gửi token hợp lệ -> Mong đợi trả về thông tin người dùng tương thích.

---

### 2. Kiểm thử nhận diện AI Cử chỉ tay (Edge AI Testing)
Do thuật toán xử lý trực tiếp trên trình duyệt nên kiểm thử AI tập trung vào các trường hợp biên của luồng camera:
- **Kiểm thử môi trường sáng**: Đánh giá độ chính xác của việc nhận diện cử chỉ ở các điều kiện ánh sáng khác nhau (thiếu sáng, ngược sáng).
- **Kiểm thử hiệu năng xử lý (FPS)**: Đo lường tốc độ xử lý khung hình trên các thiết bị cấu hình thấp. Đảm bảo luồng xử lý của MediaPipe và Fingerpose đạt tối thiểu 15-20 FPS để không gây giật lag.
- **Kiểm thử độ trễ cử chỉ (Debouncing)**: Hệ thống sử dụng cơ chế đệm ổn định (Buffer) với hằng số `STABLE_FRAMES = 5` để đảm bảo người dùng giữ nguyên cử chỉ trong 5 khung hình liên tục mới công nhận kết quả, tránh việc nhận diện sai lệch do các chuyển động nhiễu của ngón tay.

---

### 3. Kiểm thử Trợ năng (Accessibility & UI/UX Testing)
Đặc thù dự án hỗ trợ người khuyết tật yêu cầu kiểm thử nghiêm ngặt về trợ năng:
- **Kiểm thử Screen Reader (Đọc màn hình)**: Sử dụng công cụ NVDA (trên Windows) hoặc VoiceOver (trên macOS/iOS) để kiểm tra xem các nút bấm, ảnh đại diện và thẻ bài viết đã được gắn đầy đủ thẻ mô tả `aria-label` và `alt` hay chưa.
- **Kiểm thử điều hướng bằng bàn phím**: Đảm bảo người khiếm thị có thể sử dụng phím `Tab` để di chuyển tuần tự qua các danh mục của trang web mà không cần dùng chuột.
