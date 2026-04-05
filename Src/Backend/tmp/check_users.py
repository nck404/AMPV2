import os
import sys

# Set path to Backend
backend_dir = r"d:\Project\AMPV2\Src\Backend"
os.chdir(backend_dir)
sys.path.insert(0, backend_dir)

from app import create_app
from extensions import db
from models import User

app = create_app()
with app.app_context():
    count = User.query.count()
    users = User.query.all()
    print(f"Users count: {count}")
    for u in users:
        print(f"ID: {u.id}, Username: {u.username}, Admin: {u.is_admin}")
