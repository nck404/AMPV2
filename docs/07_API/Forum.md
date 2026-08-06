# Forum API Endpoints

Danh sách các API phục vụ diễn đàn tương tác của cộng đồng trong file [`forum.js`](file:///D:/Project/AMPV2/source/backend/routes/forum.js).

## 1. Lấy danh sách bài viết (GET `/api/forum/posts`)

*   **Mô tả**: Trả về danh sách toàn bộ các bài đăng trên diễn đàn, sắp xếp theo thời gian tạo mới nhất.
*   **Xác thực**: Không yêu cầu (Public)
*   **Phản hồi thành công (200 OK)**:
    ```json
    [
        {
            "id": 5,
            "title": "Hỏi về cách dùng MediaPipe",
            "content": "Tôi đang gặp khó khăn khi thiết lập camera...",
            "tags": ["AI", "MediaPipe", "TroNang"],
            "upvotes": 0,
            "reactions": {
                "like": 12,
                "love": 3
            },
            "comments_count": 2,
            "time": "2026-08-06 12:00:00",
            "author": {
                "username": "nguyenvana",
                "public_id": "847291",
                "avatar_url": null,
                "is_admin": false
            }
        }
    ]
    ```

---

## 2. Tạo bài viết mới (POST `/api/forum/posts`)

*   **Mô tả**: Đăng bài thảo luận mới lên diễn đàn.
*   **Xác thực**: Yêu cầu Token
*   **Body nhận vào**:
    ```json
    {
        "title": "Hỏi về cách dùng MediaPipe",
        "content": "Tôi đang gặp khó khăn khi thiết lập camera...",
        "tags": "AI,MediaPipe,TroNang"
    }
    ```
*   **Phản hồi thành công (201 Created)**:
    ```json
    {
        "msg": "Post created successfully",
        "id": 5
    }
    ```

---

## 3. Xem chi tiết bài viết (GET `/api/forum/posts/:id`)

*   **Mô tả**: Lấy thông tin đầy đủ của một bài viết kèm theo thông tin phản ứng cảm xúc của người dùng hiện tại (nếu đã đăng nhập).
*   **Xác thực**: Tùy chọn (Optional Token)
*   **Phản hồi thành công (200 OK)**:
    ```json
    {
        "id": 5,
        "title": "Hỏi về cách dùng MediaPipe",
        "content": "...",
        "tags": ["AI", "MediaPipe"],
        "upvotes": 0,
        "reactions": { "like": 1 },
        "user_reaction": "like",
        "time": "2026-08-06 12:00:00",
        "author": { "username": "nguyenvana", "public_id": "847291" }
    }
    ```

---

## 4. Tương tác cảm xúc (POST `/api/forum/react`)

*   **Mô tả**: Thêm, cập nhật hoặc xóa phản ứng cảm xúc (like, love, haha, wow, sad, angry) đối với bài viết hoặc bình luận.
*   **Xác thực**: Yêu cầu Token
*   **Body nhận vào**:
    ```json
    {
        "target_type": "post", // Hoặc "comment"
        "target_id": 5,
        "type": "love" // Gửi null nếu muốn hủy cảm xúc
    }
    ```
*   **Phản hồi thành công (200 OK hoặc 201 Created)**:
    ```json
    {
        "msg": "Reaction added" // Hoặc "Reaction removed" / "Reaction updated"
    }
    ```
