from functools import wraps
from flask import request, jsonify
from flask_jwt_extended import get_jwt_identity, verify_jwt_in_request
from models import User

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        try:
            # First check if the request has a valid JWT
            verify_jwt_in_request()
            username = get_jwt_identity()
            current_user = User.query.filter_by(username=username).first()
            if not current_user:
                return jsonify({'message': 'User not found'}), 401
        except Exception as e:
            return jsonify({'message': 'Authentication required. Token missing or invalid.', 'error': str(e)}), 401
        
        return f(current_user, *args, **kwargs)
    return decorated

def verify_recaptcha(token):
    # Luôn trả về True để test giao diện theo yêu cầu của bạn
    # Bạn không cần phải tick hay cấu hình key thật nữa
    return True
