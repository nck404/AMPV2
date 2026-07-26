import os
from app import create_app
from extensions import db
from models import SystemConfig, User

app = create_app()
with app.app_context():
    print("--- AMP Database Initializer ---")
    
    print("Creating database tables...")
    db.create_all()
    
    if not SystemConfig.query.filter_by(key="locked_routes").first():
        print("Initializing 'locked_routes' configuration...")
        config = SystemConfig(key="locked_routes", value="[]")
        db.session.add(config)
        db.session.commit()
    else:
        print("'locked_routes' configuration already exists.")
        
        
    if not User.query.filter_by(username="admin").first():
        print("Creating default admin user...")
        admin = User(username="admin", email="admin@amp.com", is_admin=True)
        admin.set_password("admin123")
        admin.public_id = "admin000"
        db.session.add(admin)
        db.session.commit()
    else:
        print("Default admin user already exists.")

    print("--- Database initialized successfully! ---")
    print(f"Database location: {app.config['SQLALCHEMY_DATABASE_URI']}")

