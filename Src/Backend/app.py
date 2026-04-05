import os
from datetime import timedelta

from dotenv import load_dotenv
from extensions import db, jwt, socketio, migrate
from flask import Flask
from flask_cors import CORS
from models import User
from routes.admin import admin_bp
from routes.auth import auth_bp
from routes.chat import chat_bp
from routes.docs import docs_bp
from routes.forum import forum_bp
from routes.social import social_bp
from routes.tts import tts_bp

load_dotenv()


def create_app():
    # Set upload folder
    upload_folder = os.path.join(os.getcwd(), "static", "uploads")
    if not os.path.exists(upload_folder):
        os.makedirs(upload_folder)

    app = Flask(__name__, static_folder="static")
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    print("--- Backend Neural Core starting on port 6333 ---")

    # Configuration
    app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get(
        "DATABASE_URL", "sqlite:///humanbio.db"
    )
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["JWT_SECRET_KEY"] = os.environ.get("JWT_SECRET_KEY", "super-secret-key")
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(days=7)
    app.config["UPLOAD_FOLDER"] = upload_folder

    # Initialize extensions
    db.init_app(app)
    jwt.init_app(app)
    socketio.init_app(app)
    migrate.init_app(app, db)

    # Register blueprints
    app.register_blueprint(auth_bp, url_prefix="/api")
    app.register_blueprint(forum_bp, url_prefix="/api/forum")
    app.register_blueprint(chat_bp, url_prefix="/api/chat")
    app.register_blueprint(social_bp, url_prefix="/api/social")
    app.register_blueprint(tts_bp, url_prefix="/api/tts")
    app.register_blueprint(docs_bp, url_prefix="/api/docs")
    app.register_blueprint(admin_bp, url_prefix="/api/admin")

    # Removed db.create_all() in favor of migrations

    return app


@socketio.on("connect")
def handle_connect():
    print("Client connected")


@socketio.on("message")
def handle_message(data):
    # data: { sender_id, text, time, receiver_id }
    print(f"Message received: {data}")
    # Simple broadcast, clients filter by receiver_id/sender_id
    socketio.emit("message", data)

    # Save to DB
    from models import Message

    content = data.get("content") or data.get("text")
    sender_id = data.get("sender_id")
    receiver_id = data.get("receiver_id")

    from flask import current_app

    with current_app.app_context():
        if content and sender_id:
            msg = Message(sender_id=sender_id, content=content, receiver_id=receiver_id)
            db.session.add(msg)
            db.session.commit()


if __name__ == "__main__":
    app = create_app()
    socketio.run(app, host="0.0.0.0", debug=True, port=6333)
