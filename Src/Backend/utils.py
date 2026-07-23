from functools import wraps
from flask import request, jsonify
from flask_jwt_extended import get_jwt_identity, verify_jwt_in_request
from extensions import db
from models import User


def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        try:
            verify_jwt_in_request()
            user_id = int(get_jwt_identity())
            current_user = User.query.get(user_id)
            if not current_user:
                return jsonify({"msg": "User not found"}), 401
        except Exception as e:
            return jsonify({"msg": "Token missing or invalid", "error": str(e)}), 401

        return f(current_user, *args, **kwargs)

    return decorated


def admin_required(f):
    @wraps(f)
    @token_required
    def decorated(current_user, *args, **kwargs):
        if not current_user.is_admin:
            return jsonify({"msg": "Admin privilege required"}), 403
        return f(current_user, *args, **kwargs)

    return decorated


def get_current_user():
    user_id = int(get_jwt_identity())
    return User.query.get(user_id)

