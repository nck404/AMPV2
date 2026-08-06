# 01. Overview

> [!NOTE]
> **AMP (Accessibility & Mobility Platform)** là nền tảng mạng xã hội, diễn đàn, học tập và cơ hội việc làm chuyên biệt dành cho người khuyết tật (đặc biệt là người khiếm thính, khiếm thị) tại Việt Nam.

Nền tảng giúp kết nối cộng đồng người khuyết tật với các doanh nghiệp xã hội, tình nguyện viên và nhà tuyển dụng, mang lại các công cụ hỗ trợ tương tác và nâng cao kỹ năng sống.

## Mục tiêu Dự án
- **Hỗ trợ giao tiếp:** Cung cấp hệ thống học Ngôn ngữ Ký hiệu trực tuyến với camera AI nhận diện thời gian thực (MediaPipe & Fingerpose) và công cụ Chuyển văn bản thành giọng nói (TTS) tiếng Việt.
- **Kết nối việc làm:** Nơi doanh nghiệp đăng tuyển các công việc phù hợp với khả năng của người khuyết tật, hỗ trợ ứng viên gửi CV và phản hồi trực tuyến.
- **Mạng xã hội & Diễn đàn:** Không gian chia sẻ, thảo luận lành mạnh về các chủ đề đời sống, kỹ năng và hỗ trợ lẫn nhau.
- **Trợ năng (Accessibility):** Tối ưu hóa UI/UX thân thiện với các công cụ đọc màn hình (Screen Reader), thiết kế giao diện có độ tương phản cao và font chữ trực quan.

## Các Phân hệ Lớn
1. **AMP Web (SvelteKit):** Giao diện web tối ưu hóa cho Desktop và Laptop.
2. **AMP Mobile (SvelteKit + Capacitor):** Phiên bản dành cho thiết bị di động, có khả năng build thành file APK cài đặt trực tiếp trên Android.
3. **AMP Backend (Express.js + Prisma):** API Core xử lý cơ sở dữ liệu (SQLite/Turso), xác thực JWT, truyền tải thời gian thực (Socket.io), quản lý hồ sơ và tiến trình học tập.
