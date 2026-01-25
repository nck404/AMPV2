import sys
import os


sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app import create_app
from extensions import db
from models import User
import random
import string

def generate_random_public_id():
    return ''.join(random.choices(string.digits, k=6))

def add_admin():
    app = create_app()
    with app.app_context():
        print("\n--- TẠO TÀI KHOẢN ADMIN AMP ---")
        
        username = input("Nhập Username: ").strip()
        email = input("Nhập Email: ").strip()
        password = input("Nhập Password: ").strip()

        if not username or not email or not password:
            print(" Lỗi: Vui lòng không để trống thông tin.")
            return

        # Kiểm tra xem user đã tồn tại chưa
        if User.query.filter_by(username=username).first():
            print(f" Lỗi: Username '{username}' đã tồn tại.")
            return
        
        if User.query.filter_by(email=email).first():
            print(f" Lỗi: Email '{email}' đã tồn tại.")
            return

        try:
            new_admin = User(
                username=username,
                email=email,
                is_admin=True,
                public_id=generate_random_public_id(),
                bio="Quản trị viên hệ thống AMP."
            )
            new_admin.set_password(password)
            
            db.session.add(new_admin)
            db.session.commit()
            
            print(f"\n THÀNH CÔNG!")
            print(f"Tài khoản Admin '{username}' đã được tạo.")
            print(f"Bây giờ bạn có thể đăng nhập và truy cập Admin Panel.")
            
        except Exception as e:
            db.session.rollback()
            print(f" Đã xảy ra lỗi: {str(e)}")

if __name__ == "__main__":
    add_admin()
