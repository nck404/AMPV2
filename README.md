# AMP - Hướng dẫn Quản trị Server
By Nguyen Khoa

hướng dẫn cách vận hành và quản lý dự án AMP trên server Linux 

## 1. Triển khai (Deploy)
Để cập nhật mã nguồn mới nhất và khởi động lại toàn bộ hệ thống, hãy chạy:
```bash
chmod +x deploy.sh
./deploy.sh
```
*Lưu ý: Script này sẽ tự động cài đặt dependencies, build Frontend, và cấu chỉnh các dịch vụ hệ thống.*

## 2. Quản lý tiến trình (Systemd)
Dự án được chia thành 2 dịch vụ chạy nền độc lập:

| Dịch vụ | Chức năng | Cổng (Port) |
| :--- | :--- | :--- |
| `amp-api` | Backend API (Flask) | `6333` |
| `amp-web` | Frontend Web (Node.js) | `2027` |

### Các lệnh điều khiển:
Thay thế `[service-name]` bằng `amp-api` hoặc `amp-web`.

- **Khởi động lại (Nên dùng khi cập nhật code):**
  ```bash
  sudo systemctl restart [service-name]
  ```
- **Dừng dịch vụ:**
  ```bash
  sudo systemctl stop [service-name]
  ```
- **Kiểm tra trạng thái (Xem app có đang chạy hay không):**
  ```bash
  sudo systemctl status [service-name]
  ```
- **Xem log hệ thống (Journalctl):**
  ```bash
  sudo journalctl -u [service-name] -f
  ```

## 3. Xem Nhật ký (Logs)
Ngoài log của hệ thống, các luồng output của ứng dụng được ghi vào file log riêng:

- **Backend API:** `Src/Backend/server.log`
- **Frontend Web:** `Src/Frontend/amp/server.log`

Dùng lệnh sau để xem log thời gian thực:
```bash
tail -f Src/Backend/server.log
```

