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
    u = User.query.get(2)
    if u:
        u.role = 'business'
        db.session.commit()
        print(f"User {u.username} updated to business")
    else:
        print("User not found")
