from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import User, Friendship, Message
from extensions import db
from sqlalchemy import or_
from utils import get_current_user

social_bp = Blueprint('social', __name__)


def _get_friendship_status(user_a, user_b):
    friendship = Friendship.query.filter(
        or_(
            (Friendship.user_id == user_a.id) & (Friendship.friend_id == user_b.id),
            (Friendship.user_id == user_b.id) & (Friendship.friend_id == user_a.id)
        )
    ).first()
    return friendship.status if friendship else 'none'


def _serialize_user(user):
    return {
        "id": user.id,
        "username": user.username,
        "public_id": user.public_id,
        "avatar_url": user.avatar_url
    }


@social_bp.route('/users/search', methods=['GET'])
@jwt_required()
def search_users():
    user = get_current_user()
    query = request.args.get('q', '')

    if not query:
        return jsonify([]), 200

    users = User.query.filter(
        or_(
            User.username.ilike(f'%{query}%'),
            User.public_id.ilike(f'%{query}%')
        )
    ).filter(User.id != user.id).limit(10).all()

    result = []
    for u in users:
        status = _get_friendship_status(user, u)
        entry = _serialize_user(u)
        entry["friend_status"] = status
        result.append(entry)

    return jsonify(result), 200


@social_bp.route('/friends/request', methods=['POST'])
@jwt_required()
def send_friend_request():
    user = get_current_user()
    data = request.get_json()
    friend_id = data.get('friend_id')

    if not friend_id:
        return jsonify({"msg": "Friend ID required"}), 400

    if user.id == friend_id:
        return jsonify({"msg": "Cannot add yourself"}), 400

    existing = Friendship.query.filter(
        or_(
            (Friendship.user_id == user.id) & (Friendship.friend_id == friend_id),
            (Friendship.user_id == friend_id) & (Friendship.friend_id == user.id)
        )
    ).first()

    if existing:
        return jsonify({"msg": "Request already exists or already friends"}), 400

    new_request = Friendship(user_id=user.id, friend_id=friend_id, status='pending')
    db.session.add(new_request)
    db.session.commit()

    return jsonify({"msg": "Request sent"}), 201


@social_bp.route('/friends/accept', methods=['POST'])
@jwt_required()
def accept_friend_request():
    user = get_current_user()
    data = request.get_json()
    request_id = data.get('request_id')

    friendship = Friendship.query.get(request_id)
    if not friendship or friendship.friend_id != user.id:
        return jsonify({"msg": "Request not found"}), 404

    friendship.status = 'accepted'
    db.session.commit()

    return jsonify({"msg": "Request accepted"}), 200


@social_bp.route('/friends', methods=['GET'])
@jwt_required()
def get_friends():
    user = get_current_user()

    friendships = Friendship.query.filter(
        ((Friendship.user_id == user.id) | (Friendship.friend_id == user.id)),
        Friendship.status == 'accepted'
    ).all()

    result = []
    for f in friendships:
        friend = f.friend if f.user_id == user.id else f.user
        unread_count = Message.query.filter_by(
            sender_id=friend.id,
            receiver_id=user.id,
            is_read=False
        ).count()

        entry = _serialize_user(friend)
        entry["unread_count"] = unread_count
        result.append(entry)

    return jsonify(result), 200


@social_bp.route('/friends/pending', methods=['GET'])
@jwt_required()
def get_pending_requests():
    user = get_current_user()

    requests = Friendship.query.filter_by(friend_id=user.id, status='pending').all()
    result = []
    for r in requests:
        result.append({
            "request_id": r.id,
            **_serialize_user(r.user)
        })

    return jsonify(result), 200
