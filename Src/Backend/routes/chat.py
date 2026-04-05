from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import Message, User
from extensions import db
from sqlalchemy import or_

chat_bp = Blueprint('chat', __name__)

@chat_bp.route('/history', methods=['GET'])
@jwt_required()
def get_chat_history():
    current_uid = int(get_jwt_identity())
    receiver_id = request.args.get('receiver_id')
    
    if receiver_id:
        # Private chat
        receiver_id = int(receiver_id)
        messages = Message.query.filter(
            or_(
                (Message.sender_id == current_uid) & (Message.receiver_id == receiver_id),
                (Message.sender_id == receiver_id) & (Message.receiver_id == current_uid)
            )
        ).order_by(Message.created_at.asc()).limit(100).all()
    else:
        # Global chat (receiver_id is null)
        messages = Message.query.filter_by(receiver_id=None).order_by(Message.created_at.asc()).limit(100).all()
    
    result = []
    for msg in messages:
        result.append({
            "id": msg.id,
            "sender_id": msg.sender_id,
            "sender_name": msg.sender.username,
            "sender_is_admin": msg.sender.is_admin,
            "content": msg.content,
            "timestamp": msg.created_at.isoformat()
        })
    
    return jsonify(result), 200

@chat_bp.route('/unread-count', methods=['GET'])
@jwt_required()
def get_unread_count():
    current_uid = int(get_jwt_identity())
    count = Message.query.filter_by(receiver_id=current_uid, is_read=False).count()
    return jsonify({"unread_count": count}), 200

@chat_bp.route('/mark-read', methods=['POST'])
@jwt_required()
def mark_messages_read():
    current_uid = int(get_jwt_identity())
    sender_id = request.json.get('sender_id')
    
    if sender_id:
        Message.query.filter_by(receiver_id=current_uid, sender_id=sender_id, is_read=False).update({Message.is_read: True})
        db.session.commit()
        return jsonify({"message": "Messages marked as read"}), 200
    return jsonify({"error": "sender_id is required"}), 400
