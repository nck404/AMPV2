# 11. Core Workflows

Hệ thống AMP vận hành thông qua các quy trình nghiệp vụ cốt lõi dưới đây, bao gồm cả luồng phát triển phần mềm và các quy trình chức năng ứng dụng thực tế.

## 1. Quy trình Phát triển & Triển khai (Developer Workflow)

Sơ đồ mô tả luồng kiểm soát từ máy phát triển cục bộ tới khi mã nguồn được triển khai trên môi trường Production.

```mermaid
flowchart LR
    Dev[Lập trình viên] -->|Push code| Git[Git Repository]
    Git -->|Webhook trigger| GHA[Github Actions]
    
    subgraph Pipeline [CI/CD Pipeline]
        GHA -->|Job 1| Build[Build SvelteKit Web & Mobile]
        GHA -->|Job 2| Test[Check Lint & Syntax]
        GHA -->|Job 3| Deploy[Deploy to Target Servers]
    end
    
    Deploy -->|Frontend to Surge| WebProd[amp-web.surge.sh]
    Deploy -->|Mobile to Surge| MobProd[amp0.surge.sh]
    Deploy -->|Backend to Ubuntu| PM2[PM2 server API]
```

---

## 2. Quy trình Nhận dạng Cử chỉ tay học Ngôn ngữ Ký hiệu (AI Learning Workflow)

Sơ đồ mô tả cách thức hệ thống AI biên trên trình duyệt phân tích hình ảnh camera của người học.

```mermaid
flowchart TD
    Cam[Khởi chạy Webcam] -->|Stream Frames| MP[MediaPipe Hands SDK]
    MP -->|Nhận diện thành công?| Check{Có bàn tay?}
    
    Check -->|Không| Warn[Hiển thị cảnh báo mất kết nối tay]
    Check -->|Có| Mark[Trích xuất 21 điểm Landmarks dạng 3D]
    
    Mark --> FP[Fingerpose Estimator]
    FP --> Calc[Tính toán góc mở khớp ngón tay]
    Calc --> Match[Đối sánh mẫu trong gestures.js]
    
    Match --> MatchCheck{Khớp cử chỉ bài học?}
    MatchCheck -->|Đúng| Score[Cộng điểm & Kích hoạt Confetti]
    MatchCheck -->|Sai| Stable[Tiếp tục theo dõi luồng frame tiếp theo]
```

---

## 3. Quy trình Tuyển dụng & Ứng tuyển (Recruitment Workflow)

Quy trình nộp đơn của người khuyết tật vào các doanh nghiệp xã hội liên kết.

```mermaid
sequenceDiagram
    participant User as Ứng viên (User)
    participant Business as Doanh nghiệp (Business)
    participant Admin as Quản trị viên (Admin)
    participant DB as Cơ sở dữ liệu

    Business->>DB: Đăng tin tuyển dụng (Status: pending)
    Admin->>DB: Xem xét & Duyệt tin tuyển dụng (Status: approved)
    User->>DB: Upload CV & Nộp hồ sơ ứng tuyển
    DB-->>Business: Gửi thông báo có hồ sơ mới ứng tuyển
    Business->>DB: Thay đổi trạng thái hồ sơ (reviewed, accepted, rejected)
    Business->>User: Gửi email phản hồi hàng loạt thông qua API
```
