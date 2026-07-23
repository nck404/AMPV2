# AMP Development Environment Setup

## Prerequisites

- **Python**: >= 3.10
- **pip** (hoặc **pipx**)
- **Node.js** >= 18 & **pnpm** (cho frontend)
- **Git**

## Backend Setup

```bash
cd Src/Backend

# 1. Tạo virtual environment
python3 -m venv venv

# Linux / macOS
source venv/bin/activate

# Windows
venv\Scripts\activate

# 2. Cài dependencies
pip install -r requirements.txt

# 3. Tạo file .env
cp .env.example .env
```

### Các biến môi trường cần có

| Biến | Mô tả | Mặc định (dev) |
|------|-------|----------------|
| `DATABASE_URL` | Kết nối database | `sqlite:///humanbio.db` |
| `TURSO_AUTH_TOKEN` | Token Turso/LibSQL nếu dùng remote DB | *(không cần nếu dùng SQLite)* |
| `JWT_SECRET_KEY` | Secret cho JWT | *(tự sinh ngẫu nhiên nếu để trống)* |
| `RECAPTCHA_SECRET_KEY` | Secret reCAPTCHA | *(bỏ qua nếu không có)* |

> **Lưu ý bảo mật**: Không commit file `.env` lên git.

### Chạy backend

```bash
# Đảm bảo đang ở trong venv
python3 app.py
```

Backend sẽ chạy tại `http://localhost:6333`.

### Khởi tạo database

```bash
python3 init_db.py
```

## Frontend Setup (AMP)

```bash
cd Src/Frontend/amp

pnpm install
pnpm run dev
```

Frontend sẽ chạy tại `http://localhost:5173`.

*Mobile (SvelteKit):*

```bash
cd Src/Frontend/mobile
pnpm install
pnpm run dev
```

## Cấu trúc thư mục

```
Src/
├── Backend/
│   ├── app.py                # Flask app factory
│   ├── server.py             # Process manager (tunnel + backend)
│   ├── extensions.py         # Flask extensions
│   ├── models.py             # SQLAlchemy models
│   ├── utils.py              # Decorators, helpers
│   ├── init_db.py            # DB initialization script
│   ├── routes/
│   │   ├── auth.py
│   │   ├── admin.py
│   │   ├── forum.py
│   │   ├── chat.py
│   │   ├── social.py
│   │   ├── docs.py
│   │   ├── tts.py
│   │   ├── recruitment.py
│   │   └── sign_language.py
│   ├── requirements.txt
│   └── .env
└── Frontend/
    ├── amp/                  # Web app (SvelteKit)
    └── mobile/               # Mobile app (SvelteKit)
```

## Lệnh hữu ích

```bash
# Deactivate venv
deactivate

# Cập nhật dependencies sau khi sửa requirements.txt
pip install -r requirements.txt

# Xem logs (nếu dùng server.py)
python3 server.py
```
