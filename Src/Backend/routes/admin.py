import json
from functools import wraps

from extensions import db
from flask import Blueprint, jsonify, request

try:
    from flask_jwt_extended import get_jwt_identity, jwt_required
except ImportError:
    from utils import token_required as jwt_required

from models import SystemConfig, User, Post, Job, Comment

admin_bp = Blueprint("admin_bp", __name__)


def admin_required(f):
    @wraps(f)
    @jwt_required()
    def decorated_function(*args, **kwargs):
        try:
            current_user_id = get_jwt_identity()
            current_user = User.query.filter_by(id=current_user_id).first()
        except Exception:
            return jsonify({"message": "Authentication context error"}), 401

        if not current_user or not current_user.is_admin:
            return jsonify({"message": "Admin privilege required!"}), 403
        return f(*args, **kwargs)

    return decorated_function


@admin_bp.route("/stats", methods=["GET"])
@admin_required
def get_stats():
    total_users = User.query.count()
    total_businesses = User.query.filter_by(role="business").count()
    total_posts = Post.query.count()
    total_jobs = Job.query.count()
    
    return jsonify({
        "total_users": total_users,
        "total_businesses": total_businesses,
        "total_posts": total_posts,
        "total_jobs": total_jobs
    }), 200


@admin_bp.route("/users", methods=["GET"])
@admin_required
def get_all_users():
    users = User.query.all()
    output = []
    for user in users:
        output.append({
            "id": user.id,
            "name": user.username,
            "username": user.username,
            "email": user.email,
            "public_id": user.public_id,
            "role": user.role,
            "is_admin": user.is_admin,
            "status": "banned" if user.is_banned else "active",
            "created_at": user.created_at,
        })
    return jsonify({"users": output}), 200


@admin_bp.route("/users/<int:user_id>/ban", methods=["PUT"])
@admin_required
def ban_user(user_id):
    user = User.query.get_or_404(user_id)
    data = request.get_json() or {}
    ban_status = data.get("ban", True)
    user.is_banned = ban_status
    db.session.commit()
    return jsonify({"message": f"User {user.username} has been {'banned' if ban_status else 'unbanned'}."}), 200


@admin_bp.route("/users/<int:user_id>/role", methods=["PUT"])
@admin_required
def change_role(user_id):
    user = User.query.get_or_404(user_id)
    data = request.get_json()
    if "role" in data:
        new_role = data["role"]
        user.role = new_role
        user.is_admin = (new_role == "admin")
        db.session.commit()
        return jsonify({"message": f"User {user.username} role updated to {new_role}."}), 200
    return jsonify({"message": "Missing role field."}), 400


@admin_bp.route("/users/<int:user_id>", methods=["DELETE"])
@admin_required
def delete_user(user_id):
    user = User.query.get_or_404(user_id)
    Post.query.filter_by(author_id=user_id).delete()
    db.session.delete(user)
    db.session.commit()
    return jsonify({"message": f"User {user.username} deleted."}), 200


@admin_bp.route("/routes", methods=["GET", "POST"])
@admin_required
def manage_locked_routes():
    config_key = "locked_routes"
    config = SystemConfig.query.filter_by(key=config_key).first()

    if request.method == "GET":
        if config:
            try:
                locked_routes = json.loads(config.value)
            except json.JSONDecodeError:
                locked_routes = []
        else:
            locked_routes = []
        return jsonify({"locked_routes": locked_routes}), 200

    if request.method == "POST":
        data = request.get_json()
        new_locked_routes = data.get("locked_routes", [])
        if not isinstance(new_locked_routes, list):
            return jsonify({"message": "locked_routes must be a list"}), 400
        json_value = json.dumps(new_locked_routes)
        if config:
            config.value = json_value
        else:
            new_config = SystemConfig(key=config_key, value=json_value)
            db.session.add(new_config)
        db.session.commit()
        return jsonify({"message": "Locked routes updated successfully.", "locked_routes": new_locked_routes}), 200


@admin_bp.route("/check-route", methods=["GET"])
def check_route_lock():
    path = request.args.get("path", "")
    config = SystemConfig.query.filter_by(key="locked_routes").first()
    if config:
        try:
            locked_routes = json.loads(config.value)
            if path in locked_routes:
                return jsonify({"locked": True}), 200
        except:
            pass
    return jsonify({"locked": False}), 200


@admin_bp.route("/posts", methods=["GET"])
@admin_required
def get_all_posts():
    posts = Post.query.all()
    output = []
    for post in posts:
        output.append({
            "id": post.id,
            "title": post.title,
            "author": post.author.username,
            "date": post.created_at.strftime("%Y-%m-%d"),
        })
    return jsonify({"posts": output}), 200


@admin_bp.route("/posts/<int:post_id>", methods=["DELETE"])
@admin_required
def delete_post(post_id):
    post = Post.query.get_or_404(post_id)
    Comment.query.filter_by(post_id=post_id).delete()
    db.session.delete(post)
    db.session.commit()
    return jsonify({"message": "Post deleted"}), 200


@admin_bp.route("/jobs", methods=["GET"])
@admin_required
def get_all_jobs():
    jobs = Job.query.all()
    output = []
    for job in jobs:
        output.append({
            "id": job.id,
            "title": job.title,
            "company": job.company,
            "status": job.status,
        })
    return jsonify({"jobs": output}), 200


@admin_bp.route("/jobs/<int:job_id>", methods=["DELETE"])
@admin_required
def delete_job(job_id):
    job = Job.query.get_or_404(job_id)
    db.session.delete(job)
    db.session.commit()
    return jsonify({"message": "Job deleted"}), 200


@admin_bp.route("/jobs/<int:job_id>/approve", methods=["PUT"])
@admin_required
def approve_job(job_id):
    job = Job.query.get_or_404(job_id)
    job.status = "approved"
    db.session.commit()
    return jsonify({"message": "Job approved"}), 200


@admin_bp.route("/notifications", methods=["POST"])
@admin_required
def create_notification():
    data = request.get_json()
    title = data.get("title")
    content = data.get("content")
    notif_type = data.get("type", "admin")
    user_id = data.get("user_id") # Optional

    if not title or not content:
        return jsonify({"message": "Title and content are required."}), 400

    from models import Notification
    new_notif = Notification(
        user_id=user_id,
        title=title,
        content=content,
        type=notif_type
    )
    db.session.add(new_notif)
    db.session.commit()

    return jsonify({"message": "Notification sent successfully."}), 201


@admin_bp.route("/notifications", methods=["GET"])
@admin_required
def get_all_notifications_admin():
    from models import Notification
    notifs = Notification.query.order_by(Notification.created_at.desc()).all()
    output = []
    for n in notifs:
        output.append({
            "id": n.id,
            "title": n.title,
            "content": n.content,
            "type": n.type,
            "user_id": n.user_id,
            "created_at": n.created_at.isoformat()
        })
    return jsonify({"notifications": output}), 200


@admin_bp.route("/notifications/<int:notif_id>", methods=["DELETE"])
@admin_required
def delete_notification(notif_id):
    from models import Notification
    notif = Notification.query.get_or_404(notif_id)
    db.session.delete(notif)
    db.session.commit()
    return jsonify({"message": "Notification deleted."}), 200
