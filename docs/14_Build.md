# 14. Build System

Hệ thống AMP chia các kịch bản build độc lập cho từng phân hệ (Backend và Frontend SvelteKit).

## 1. Backend Build

Do sử dụng Node.js chạy trực tiếp, phân hệ Backend không yêu cầu bước biên dịch mã nguồn (transpilation). Tuy nhiên, có bước phát sinh code của Prisma ORM Client.

*   **Lệnh phát triển cục bộ**:
    ```bash
    npm run dev
    # Sử dụng nodemon server.js để tự động tải lại máy chủ khi mã nguồn thay đổi.
    ```
*   **Lệnh cài đặt & Đồng bộ**:
    ```bash
    npm install
    npx prisma generate
    # Sinh mã nguồn lớp Prisma Client dựa theo tệp cấu hình schema.prisma.
    ```
*   **Lệnh khởi chạy**:
    ```bash
    npm start
    # Chạy trực tiếp tệp server.js.
    ```

---

## 2. Frontend Web & Mobile Web (Vite + SvelteKit)

Cả hai phân hệ frontend đều sử dụng công cụ đóng gói siêu tốc **Vite** để tối ưu hóa quá trình biên dịch tài nguyên tĩnh.

*   **Lệnh chạy môi trường phát triển (Local Development)**:
    ```bash
    npm run dev
    # Khởi chạy Vite Dev Server tại cổng mặc định 5173.
    ```
*   **Lệnh đóng gói ứng dụng (Production Build)**:
    ```bash
    npm run build
    # Biên dịch mã nguồn Svelte thành mã HTML, CSS và Javascript thuần tối ưu.
    ```
*   **Cơ chế Adapter**:
    Frontend sử dụng `@sveltejs/adapter-static` để xuất dữ liệu đóng gói dạng Single Page Application (SPA) thích hợp cho việc host trên các nền tảng phân phối tĩnh như Surge.

---

## 3. Biên dịch Ứng dụng Di động (Capacitor)

Quy trình build APK di động từ mã nguồn Web:

1.  **Biên dịch mã nguồn Web**:
    ```bash
    npm run build
    # Tạo ra thư mục build/ chứa các file web tĩnh.
    ```
2.  **Đồng bộ hóa tài nguyên sang thư mục native**:
    ```bash
    npx cap sync android
    # Sao chép các tệp tin web tĩnh vào thư mục android/app/src/main/assets/public.
    ```
3.  **Build Native Android Project**:
    ```bash
    cd android && ./gradlew assembleDebug
    # Biên dịch mã nguồn gốc Java/Kotlin và Gradle thành tệp tin đóng gói app-debug.apk.
    ```
