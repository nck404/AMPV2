from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import User, Friendship
from extensions import db
from sqlalchemy import or_

social_bp = Blueprint('social', __name__)

@social_bp.route('/users/search', methods=['GET'])
@jwt_required()
def search_users():
    current_user_id = int(get_jwt_identity())
    query = request.args.get('q', '')
    
    if not query:
        return jsonify([]), 200
        
    # Search by username or public_id
    users = User.query.filter(
        or_(
            User.username.ilike(f'%{query}%'),
            User.public_id.ilike(f'%{query}%')
        )
    ).filter(User.id != current_user_id).limit(10).all()
    
    result = []
    for u in users:
        # Check friendship status
        friendship = Friendship.query.filter(
            or_(
                (Friendship.user_id == current_user_id) & (Friendship.friend_id == u.id),
                (Friendship.user_id == u.id) & (Friendship.friend_id == current_user_id)
            )
        ).first()
        
        status = friendship.status if friendship else 'none'
        
        result.append({
            "id": u.id,
            "username": u.username,
            "public_id": u.public_id,
            "avatar_url": u.avatar_url,
            "friend_status": status
        })
        
    return jsonify(result), 200

@social_bp.route('/friends/request', methods=['POST'])
@jwt_required()
def send_friend_request():
    current_user_id = int(get_jwt_identity())
    data = request.get_json()
    friend_id = data.get('friend_id')
    
    if not friend_id:
        return jsonify({"msg": "Friend ID required"}), 400
        
    if current_user_id == friend_id:
        return jsonify({"msg": "Cannot add yourself"}), 400
        
    existing = Friendship.query.filter(
        or_(
            (Friendship.user_id == current_user_id) & (Friendship.friend_id == friend_id),
            (Friendship.user_id == friend_id) & (Friendship.friend_id == current_user_id)
        )
    ).first()
    
    if existing:
        return jsonify({"msg": "Request already exists or already friends"}), 400
        
    new_request = Friendship(user_id=current_user_id, friend_id=friend_id, status='pending')
    db.session.add(new_request)
    db.session.commit()
    
    return jsonify({"msg": "Request sent"}), 201

@social_bp.route('/friends/accept', methods=['POST'])
@jwt_required()
def accept_friend_request():
    current_user_id = int(get_jwt_identity())
    data = request.get_json()
    request_id = data.get('request_id')
    
    friendship = Friendship.query.get(request_id)
    if not friendship or friendship.friend_id != current_user_id:
        return jsonify({"msg": "Request not found"}), 404
        
    friendship.status = 'accepted'
    db.session.commit()
    
    return jsonify({"msg": "Request accepted"}), 200

@social_bp.route('/friends', methods=['GET'])
@jwt_required()
def get_friends():
    current_user_id = int(get_jwt_identity())
    
    friendships = Friendship.query.filter(
        ((Friendship.user_id == current_user_id) | (Friendship.friend_id == current_user_id)),
        Friendship.status == 'accepted'
    ).all()
    
    from models import Message
    for f in friendships:
        friend = f.friend if f.user_id == current_user_id else f.user
        unread_count = Message.query.filter_by(
            sender_id=friend.id, 
            receiver_id=current_user_id, 
            is_read=False
        ).count()
        
        result.append({
            "id": friend.id,
            "username": friend.username,
            "public_id": friend.public_id,
            "avatar_url": friend.avatar_url,
            "unread_count": unread_count
        })
        
    return jsonify(result), 200

@social_bp.route('/friends/pending', methods=['GET'])
@jwt_required()
def get_pending_requests():
    current_user_id = int(get_jwt_identity())
    
    requests = Friendship.query.filter_by(friend_id=current_user_id, status='pending').all()
    result = []
    for r in requests:
        result.append({
            "request_id": r.id,
            "id": r.user.id,
            "username": r.user.username,
            "public_id": r.user.public_id,
            "avatar_url": r.user.avatar_url
        })
        
    return jsonify(result), 200
