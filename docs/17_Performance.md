# 17. Performance Optimization

Hệ thống AMP được tinh chỉnh hiệu năng để có thể chạy mượt mà ngay cả trên các thiết bị di động cấu hình thấp hoặc môi trường mạng băng thông hạn chế tại Việt Nam.

## Các giải pháp tối ưu hóa hiệu năng

### 1. Phân tích cử chỉ biên (Edge Computing & AI Client-Side)
- Thay vì truyền luồng video từ camera của người dùng về máy chủ để xử lý (tốn băng thông, gây trễ lớn và quá tải server), AMP tải trực tiếp mô hình nhận diện cử chỉ của **MediaPipe** và **Fingerpose** về trình duyệt của khách hàng.
- Quá trình tính toán 21 điểm xương khớp tay được thực hiện hoàn toàn bằng phần cứng đồ họa (WebGL) cục bộ giúp giảm tải 100% tài nguyên CPU của máy chủ và đưa độ trễ nhận diện về mức dưới 50ms.

### 2. Tối ưu hóa truy vấn Database (Giải quyết bài toán N+1 Query)
- Trong phần hiển thị bình luận đa cấp của diễn đàn tại [`forum.js`](file:///D:/Project/AMPV2/source/backend/routes/forum.js), thay vì thực hiện truy vấn đệ quy xuống cơ sở dữ liệu cho từng bình luận con (gây nghẽn kết nối), hệ thống truy vấn toàn bộ bình luận của bài viết trong một câu lệnh đơn giản:
  ```javascript
  const comments = await prisma.comment.findMany({ where: { post_id: postId } });
  ```
- Sau đó, toàn bộ cấu trúc cây bình luận (Replies Tree) được dựng lại trực tiếp trên bộ nhớ RAM của máy chủ thông qua hàm xử lý thuật toán tối ưu `serializeCommentsInMemory`.

### 3. Tối ưu hóa đóng gói (Asset & Bundle Size)
- **Lazy Loading**: Các trang hoặc tài nguyên nặng (như thư mục ảnh SVG mô phỏng cử chỉ tay) chỉ được tải khi người dùng truy cập vào mục "Học ngôn ngữ ký hiệu".
- **Vite Bundler**: Tự động thực hiện kỹ thuật Tree-shaking loại bỏ các đoạn mã thừa không sử dụng khỏi các thư viện dependencies lớn trong quá trình build bản production frontend.
- **Giới hạn số lượng tin nhắn**: API chat riêng và chat chung chỉ lấy giới hạn 100 tin nhắn gần nhất (`take: 100`) nhằm bảo vệ thiết bị đầu cuối khỏi việc phải kết xuất quá nhiều phần tử DOM cùng lúc.
