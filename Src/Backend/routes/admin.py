import json
from functools import wraps

from extensions import db
from flask import Blueprint, jsonify, request
from models import SystemConfig, User

try:
    from flask_jwt_extended import get_jwt_identity, jwt_required
except ImportError:
    # Fallback if using a custom token_required from utils
    from utils import token_required as jwt_required

admin_bp = Blueprint("admin_bp", __name__)


def admin_required(f):
    @wraps(f)
    @jwt_required()  # Or standard auth wrapper
    def decorated_function(*args, **kwargs):
        try:
            # Try flask_jwt_extended first
            current_user_id = get_jwt_identity()
            current_user = User.query.filter_by(id=current_user_id).first()
        except Exception:
            # If using custom utils.token_required which passes current_user as first arg
            # This is a bit tricky, let's assume standard behavior where user is fetched
            # We will just rely on standard JWT identity for this example
            return jsonify({"message": "Authentication context error"}), 401

        if not current_user or not current_user.is_admin:
            return jsonify({"message": "Admin privilege required!"}), 403
        return f(*args, **kwargs)

    return decorated_function


@admin_bp.route("/users", methods=["GET"])
@admin_required
def get_all_users():
    users = User.query.all()
    output = []
    for user in users:
        user_data = {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "public_id": user.public_id,
            "is_admin": user.is_admin,
            "created_at": user.created_at,
        }
        output.append(user_data)
    return jsonify({"users": output}), 200


@admin_bp.route("/users/<int:user_id>/ban", methods=["PUT"])
@admin_required
def ban_user(user_id):
    user = User.query.get_or_404(user_id)
    data = request.get_json() or {}

    # Note: If 'is_banned' column is added to User model later, update this logic.
    # Currently assuming there might be an 'is_banned' or similar attribute.
    ban_status = data.get("ban", True)

    # Placeholder for actual ban logic (e.g., user.is_banned = ban_status)
    # user.is_banned = ban_status

    db.session.commit()
    return jsonify(
        {
            "message": f"User {user.username} has been {'banned' if ban_status else 'unbanned'}."
        }
    ), 200


@admin_bp.route("/users/<int:user_id>/role", methods=["PUT"])
@admin_required
def change_role(user_id):
    user = User.query.get_or_404(user_id)
    data = request.get_json()

    if "is_admin" in data:
        user.is_admin = bool(data["is_admin"])
        db.session.commit()
        return jsonify(
            {
                "message": f"User {user.username} role updated.",
                "is_admin": user.is_admin,
            }
        ), 200

    return jsonify({"message": "Missing is_admin field."}), 400


@admin_bp.route("/routes", methods=["GET", "POST"])
@admin_required
def manage_locked_routes():
    config_key = "locked_routes"
    config = SystemConfig.query.filter_by(key=config_key).first()

    if request.method == "GET":
        if config:
            try:
                # Assuming value is stored as a JSON string like '["/forum", "/cv"]'
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
        return jsonify(
            {
                "message": "Locked routes updated successfully.",
                "locked_routes": new_locked_routes,
            }
        ), 200
