import os
from app import create_app
from extensions import db
from models import SystemConfig, User

app = create_app()
with app.app_context():
    print("--- AMP Database Initializer ---")
    
    # Create all tables
    print("Creating database tables...")
    db.create_all()
    
    # Initialize default configuration
    if not SystemConfig.query.filter_by(key="locked_routes").first():
        print("Initializing 'locked_routes' configuration...")
        config = SystemConfig(key="locked_routes", value="[]")
        db.session.add(config)
        db.session.commit()
    else:
        print("'locked_routes' configuration already exists.")
        
    # Check if admin exists, if not, maybe create one? 
    # (Optional, but helpful for first-time setup)
    
    print("--- Database initialized successfully! ---")
    print(f"Database location: {app.config['SQLALCHEMY_DATABASE_URI']}")
