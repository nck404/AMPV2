from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from models import User
from extensions import db
import os
import uuid
import random
import string
import re

def generate_random_public_id():
    while True:
        pid = ''.join(random.choices(string.digits, k=6))
        if not User.query.filter_by(public_id=pid).first():
            return pid

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    recaptcha_token = data.get('recaptcha_token') 

    if not all([username, email, password]):
        return jsonify({"msg": "Missing required fields"}), 400

    from utils import verify_recaptcha
    if not verify_recaptcha(recaptcha_token):
        return jsonify({"msg": "Invalid reCAPTCHA"}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({"msg": "Username already exists"}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"msg": "Email already exists"}), 400

    new_user = User(username=username, email=email)
    new_user.set_password(password)
    # Generate random 6-digit public_id
    new_user.public_id = generate_random_public_id()
    
    db.session.add(new_user)
    db.session.commit()

    return jsonify({"msg": "User created successfully"}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not all([email, password]):
        return jsonify({"msg": "Missing field"}), 400

    user = User.query.filter_by(email=email).first()
    if user and user.check_password(password):
        access_token = create_access_token(identity=str(user.id))
        return jsonify(
            access_token=access_token, 
            user={
                "id": user.id, 
                "public_id": user.public_id,
                "username": user.username, 
                "email": user.email,
                "bio": user.bio,
                "is_admin": user.is_admin,
                "avatar_url": user.avatar_url
            }
        ), 200

    return jsonify({"msg": "Bad email or password"}), 401

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_me():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user:
        return jsonify({"msg": "User not found"}), 404
    return jsonify(
        id=user.id, 
        public_id=user.public_id,
        username=user.username, 
        email=user.email, 
        bio=user.bio,
        is_admin=user.is_admin,
        avatar_url=user.avatar_url
    )

@auth_bp.route('/me/public_id', methods=['PUT'])
@jwt_required()
def update_public_id():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user:
        return jsonify({"msg": "User not found"}), 404
    
    data = request.get_json()
    new_pid = data.get('public_id')
    
    if not new_pid:
        return jsonify({"msg": "Missing public_id"}), 400
        
    # Validation: alphanumeric only, no special chars
    if not re.match(r'^[a-zA-Z0-9]+$', new_pid):
        return jsonify({"msg": "Public ID must be alphanumeric only"}), 400
        
    if User.query.filter_by(public_id=new_pid).first():
        return jsonify({"msg": "Public ID already taken"}), 400
        
    user.public_id = new_pid
    db.session.commit()
    
    return jsonify({"msg": "Public ID updated", "public_id": new_pid}), 200

@auth_bp.route('/me/bio', methods=['PUT'])
@jwt_required()
def update_bio():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user:
        return jsonify({"msg": "User not found"}), 404
    
    data = request.get_json()
    new_bio = data.get('bio')
    
    if new_bio is None:
        return jsonify({"msg": "Missing bio"}), 400
        
    user.bio = new_bio
    db.session.commit()
    
    return jsonify({"msg": "Bio updated", "bio": new_bio}), 200

@auth_bp.route('/me/avatar/upload', methods=['POST'])
@jwt_required()
def upload_avatar():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user:
        return jsonify({"msg": "User not found"}), 404
        
    if 'avatar' not in request.files:
        return jsonify({"msg": "No file part"}), 400
    
    file = request.files['avatar']
    if file.filename == '':
        return jsonify({"msg": "No selected file"}), 400
        
    if file:
        ext = os.path.splitext(file.filename)[1]
        if not ext:
            ext = ".jpg" 
        filename = f"avatar_{user_id}_{uuid.uuid4().hex}{ext}"
        filepath = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        # Update user avatar_url
        avatar_url = f"/static/uploads/{filename}"
        user.avatar_url = avatar_url
        db.session.commit()
        
        return jsonify({
            "msg": "Avatar uploaded successfully",
            "avatar_url": avatar_url
        }), 200

@auth_bp.route('/me/email', methods=['PUT'])
@jwt_required()
def update_email():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user:
        return jsonify({"msg": "User not found"}), 404
        
    data = request.get_json()
    new_email = data.get('email')
    
    if not new_email:
        return jsonify({"msg": "Missing email"}), 400
        
    if User.query.filter_by(email=new_email).first():
        return jsonify({"msg": "Email already in use"}), 400
        
    user.email = new_email
    db.session.commit()
    
    return jsonify({"msg": "Email updated successfully"}), 200

@auth_bp.route('/me/password', methods=['PUT'])
@jwt_required()
def update_password():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user:
        return jsonify({"msg": "User not found"}), 404
        
    data = request.get_json()
    old_password = data.get('old_password')
    new_password = data.get('new_password')
    
    if not old_password or not new_password:
        return jsonify({"msg": "Missing password fields"}), 400
        
    if not user.check_password(old_password):
        return jsonify({"msg": "Incorrect current password"}), 401
        
    user.set_password(new_password)
    db.session.commit()
    
    return jsonify({"msg": "Password updated successfully"}), 200

# --- ADMIN USER MANAGEMENT ---

@auth_bp.route('/admin/users', methods=['GET'])
@jwt_required()
def admin_get_users():
    admin_id = int(get_jwt_identity())
    admin = User.query.get(admin_id)
    if not admin or not admin.is_admin:
        return jsonify({"msg": "Admin privilege required"}), 403
    
    users = User.query.order_by(User.created_at.desc()).all()
    return jsonify([{
        "id": u.id,
        "username": u.username,
        "email": u.email,
        "public_id": u.public_id,
        "is_admin": u.is_admin,
        "created_at": u.created_at
    } for u in users]), 200

@auth_bp.route('/admin/users/<int:user_id>/toggle-admin', methods=['POST'])
@jwt_required()
def admin_toggle_admin(user_id):
    admin_id = int(get_jwt_identity())
    admin = User.query.get(admin_id)
    if not admin or not admin.is_admin:
        return jsonify({"msg": "Admin privilege required"}), 403
    
    user = User.query.get(user_id)
    if not user:
        return jsonify({"msg": "User not found"}), 404
        
    if user.id == admin.id:
        return jsonify({"msg": "Cannot demote yourself"}), 400
        
    user.is_admin = not user.is_admin
    db.session.commit()
    
    return jsonify({
        "msg": f"User {user.username} admin status updated", 
        "is_admin": user.is_admin
    }), 200

@auth_bp.route('/admin/users/<int:user_id>', methods=['DELETE'])
@jwt_required()
def admin_delete_user(user_id):
    admin_id = int(get_jwt_identity())
    admin = User.query.get(admin_id)
    if not admin or not admin.is_admin:
        return jsonify({"msg": "Admin privilege required"}), 403
    
    user = User.query.get(user_id)
    if not user:
        return jsonify({"msg": "User not found"}), 404
    
    if user.id == admin.id:
        return jsonify({"msg": "Cannot delete yourself"}), 400
        
    db.session.delete(user)
    db.session.commit()
    
    return jsonify({"msg": "User deleted"}), 200
