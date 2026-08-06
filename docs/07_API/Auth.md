# Auth API Endpoints

Danh sách các API phục vụ xác thực người dùng trong file [`auth.js`](file:///D:/Project/AMPV2/source/backend/routes/auth.js).

## 1. Đăng ký tài khoản (POST `/api/register`)

*   **Mô tả**: Tạo tài khoản người dùng mới trên hệ thống.
*   **Xác thực**: Không yêu cầu (Public)
*   **Body nhận vào**:
    ```json
    {
        "username": "nguyenvana",
        "email": "vana@example.com",
        "password": "Password123"
    }
    ```
*   **Phản hồi thành công (201 Created)**:
    ```json
    {
        "msg": "User created successfully"
    }
    ```
*   **Phản hồi lỗi**:
    *   `400 Bad Request`: "Missing required fields" hoặc "Username already exists" hoặc "Email already exists".
    *   `500 Internal Server Error`: "Server error".

---

## 2. Đăng nhập truyền thống (POST `/api/login`)

*   **Mô tả**: Xác thực tài khoản bằng email và mật khẩu, trả về mã token JWT thời hạn 30 ngày.
*   **Xác thực**: Không yêu cầu (Public)
*   **Body nhận vào**:
    ```json
    {
        "email": "vana@example.com",
        "password": "Password123"
    }
    ```
*   **Phản hồi thành công (200 OK)**:
    ```json
    {
        "access_token": "eyJhbGciOi...",
        "user": {
            "id": 1,
            "public_id": "847291",
            "username": "nguyenvana",
            "email": "vana@example.com",
            "bio": "Chào mừng đến với cộng đồng AMP",
            "is_admin": false,
            "avatar_url": null
        }
    }
    ```
*   **Phản hồi lỗi (401 Unauthorized)**:
    ```json
    {
        "msg": "Bad email or password"
    }
    ```

---

## 3. Đăng nhập qua Google (POST `/api/google-login`)

*   **Mô tả**: Xác minh token Google ID Token được gửi từ phía client để đăng nhập hoặc tự động đăng ký tài khoản mới nếu chưa tồn tại.
*   **Xác thực**: Không yêu cầu (Public)
*   **Body nhận vào**:
    ```json
    {
        "token": "google-id-token-here"
    }
    ```
*   **Phản hồi thành công (200 OK)**: Trả về cấu trúc tương tự API `/login`.

---

## 4. Lấy thông tin tài khoản hiện tại (GET `/api/me`)

*   **Mô tả**: Truy vấn hồ sơ chi tiết của người dùng đang đăng nhập dựa trên JWT Token được gửi trong Header.
*   **Xác thực**: Yêu cầu Token hợp lệ (`Authorization: Bearer <token>`)
*   **Phản hồi thành công (200 OK)**:
    ```json
    {
        "id": 1,
        "public_id": "847291",
        "username": "nguyenvana",
        "email": "vana@example.com",
        "bio": "Chào mừng đến với cộng đồng AMP",
        "is_admin": false,
        "avatar_url": "/uploads/avatar_1_abdc1234.png"
    }
    ```

---

## 5. Tải ảnh đại diện (POST `/api/me/avatar/upload`)

*   **Mô tả**: Tải lên tệp ảnh đại diện mới của người dùng dưới dạng Multipart Form.
*   **Xác thực**: Yêu cầu Token hợp lệ
*   **Form Data**: 
    *   Key: `avatar` (Type: File)
*   **Phản hồi thành công (200 OK)**:
    ```json
    {
        "msg": "Avatar uploaded successfully",
        "avatar_url": "/uploads/avatar_1_f83da8f2.png"
    }
    ```
