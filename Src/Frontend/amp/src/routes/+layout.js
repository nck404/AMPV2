// Tắt Server-Side Rendering (SSR) cho toàn bộ ứng dụng
// Biến dự án thành một Single Page Application (SPA) hoàn chỉnh
export const ssr = false;

// Yêu cầu adapter-static luôn tạo sẵn một file fallback chung (index.html)
// cho tất cả các đường dẫn thay vì cố gắng render trước từng trang một
export const prerender = true;
