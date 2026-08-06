# Sign Language & Leaderboard API Endpoints

Danh sách các API phục vụ học tập ngôn ngữ ký hiệu và xếp hạng tại [`sign_language.js`](file:///D:/Project/AMPV2/source/backend/routes/sign_language.js).

## 1. Lưu tiến trình học tập (POST `/api/sign-language/progress`)

*   **Mô tả**: Lưu lại kết quả sau khi hoàn thành một bài học nhận diện cử chỉ. Tự động tính toán lại điểm số trung bình và cập nhật vào bảng xếp hạng.
*   **Xác thực**: Yêu cầu Token
*   **Body nhận vào**:
    ```json
    {
        "lesson_title": "Chữ A",
        "category": "Bảng chữ cái",
        "score": 90,
        "time_spent": 12,
        "accuracy": 90.0
    }
    ```
*   **Phản hồi thành công (200 OK)**:
    ```json
    {
        "message": "Progress saved successfully",
        "lesson_title": "Chữ A",
        "score": 90,
        "best_score": 90,
        "attempts": 1,
        "session_count": 1
    }
    ```

---

## 2. Lấy bảng xếp hạng (GET `/api/sign-language/leaderboard`)

*   **Mô tả**: Trả về danh sách xếp hạng người dùng học tập xuất sắc nhất hệ thống dựa trên tổng điểm, hỗ trợ phân trang thông qua Query Parameter.
*   **Xác thực**: Không yêu cầu (Public)
*   **Query Parameters**:
    *   `limit` (Mặc định: 50)
    *   `offset` (Mặc định: 0)
*   **Phản hồi thành công (200 OK)**:
    ```json
    [
        {
            "rank": 1,
            "user_id": 2,
            "username": "learning_king",
            "avatar_url": null,
            "total_score": 2600,
            "total_lessons_completed": 26,
            "current_streak": 0,
            "highest_streak": 0,
            "average_accuracy": 100.0,
            "total_practice_score": 0,
            "last_updated": "2026-08-06T12:00:00.000Z"
        }
    ]
    ```

---

## 3. Khóa/Mở khóa bài học (POST `/api/sign-language/locks/toggle`)

*   **Mô tả**: Khóa hoặc mở khóa một bài học cụ thể để quản lý tiến trình của học viên (Chỉ dành cho Admin).
*   **Xác thực**: Yêu cầu Token & Quyền Admin
*   **Body nhận vào**:
    ```json
    {
        "target_type": "lesson", // Hoặc "category"
        "target_name": "Chữ B"
    }
    ```
*   **Phản hồi thành công (200 OK)**:
    ```json
    {
        "msg": "Target unlocked successfully",
        "status": "unlocked" // Hoặc "locked"
    }
    ```
