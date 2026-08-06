# 06. Database Documentation

Hệ thống AMP sử dụng **SQLite** ở môi trường phát triển cục bộ và tương thích hoàn toàn với **Turso/libsql** ở môi trường production thông qua adapter Prisma.

## Sơ đồ Thực thể Quan hệ (ERD)

```mermaid
erDiagram
    USER ||--o{ MESSAGE : "sent_messages"
    USER ||--o{ MESSAGE : "received_messages"
    USER ||--o{ POST : "creates"
    USER ||--o{ COMMENT : "writes"
    USER ||--o{ REACTION : "reacts"
    USER ||--o{ FRIENDSHIP : "requests"
    USER ||--o{ FRIENDSHIP : "received_requests"
    USER ||--o{ JOB : "posts_jobs"
    USER ||--o{ NOTIFICATION : "receives"
    USER ||--o{ JOB_APPLICATION : "applies"
    USER ||--o{ LEARNING_PROGRESS : "completes"
    USER ||--|| LEADERBOARD : "has_rank"

    POST ||--o{ COMMENT : "has"
    POST ||--o{ REACTION : "has_reactions"
    COMMENT ||--o{ REACTION : "has_reactions"
    COMMENT ||--o{ COMMENT : "replies"
    JOB ||--o{ JOB_APPLICATION : "has_applications"

    USER {
        int id
        string username
        string email
        string password_hash
        string public_id
        string bio
        string avatar_url
        boolean is_admin
        boolean is_banned
        string role
        datetime created_at
    }

    MESSAGE {
        int id
        int sender_id
        int receiver_id
        string content
        boolean is_read
        datetime created_at
    }

    POST {
        int id
        int author_id
        string title
        string content
        string tags
        int upvotes
        datetime created_at
    }

    COMMENT {
        int id
        int post_id
        int author_id
        int parent_id
        string content
        datetime created_at
    }

    REACTION {
        int id
        int user_id
        int post_id
        int comment_id
        string type
    }

    FRIENDSHIP {
        int id
        int user_id
        int friend_id
        string status
        datetime created_at
    }

    DOCUMENTATION {
        int id
        string title
        string slug
        string category
        string content
        int order
        datetime last_updated
    }

    SYSTEM_CONFIG {
        int id
        string key
        string value
    }

    JOB {
        int id
        string title
        string company
        string location
        string salary
        string type
        string description
        string status
        datetime created_at
        int author_id
    }

    NOTIFICATION {
        int id
        int user_id
        string title
        string content
        string type
        boolean is_read
        datetime created_at
    }

    JOB_APPLICATION {
        int id
        int job_id
        int user_id
        string name
        string email
        string phone
        string cv_url
        string cover_letter
        string status
        datetime created_at
    }

    LEARNING_PROGRESS {
        int id
        int user_id
        string lesson_title
        string category
        int score
        int best_score
        int attempts
        int time_spent
        float accuracy
        int session_count
        datetime completed_at
        datetime last_attempt
    }

    LEADERBOARD {
        int id
        int user_id
        int total_score
        int total_lessons_completed
        int current_streak
        int highest_streak
        int total_practice_score
        float average_accuracy
        datetime last_updated
        int rank
    }

    LESSON_LOCK {
        int id
        string target_type
        string target_name
        boolean is_locked
    }
```

## Các Bảng dữ liệu quan trọng

### 1. Bảng `user`
Lưu trữ thông tin tài khoản người dùng của hệ thống bao gồm phân quyền và trạng thái hoạt động.
- `public_id`: ID công khai dạng số ngẫu nhiên 6 chữ số dùng để ẩn danh tính thật khi giao tiếp xã hội và kết bạn.
- `role`: Phân cấp vai trò người dùng (`user`, `business`, `admin`).
- `is_banned`: Đánh dấu trạng thái tài khoản bị khóa bởi quản trị viên.

### 2. Bảng `learning_progress` & `leaderboard`
- `learning_progress`: Lưu chi tiết các nỗ lực học tập của người dùng, số điểm đạt được (`score`), điểm số cao nhất (`best_score`), tổng số lần thử (`attempts`) và độ chính xác trung bình (`accuracy`).
- `leaderboard`: Điểm tổng hợp được tính toán định kỳ hoặc sau mỗi bài học thành công để xếp hạng (`rank`) người học dựa trên tổng số điểm tích lũy (`total_score`).

### 3. Bảng `friendship`
- Thiết lập mối quan hệ bạn bè giữa hai đối tượng `user_id` and `friend_id`.
- Trạng thái kết bạn có các giá trị: `pending` (đang chờ), `accepted` (đã đồng ý).
