from datetime import datetime, timezone

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import User, Post, Comment, Reaction
from extensions import db
from sqlalchemy import or_
from utils import get_current_user

forum_bp = Blueprint('forum', __name__)

REACTION_TYPES = ['like', 'love', 'haha', 'wow', 'sad', 'angry']


def _build_reactions_count(target_type, target_id):
    reactions_count = {}
    for r_type in REACTION_TYPES:
        q = Reaction.query.filter_by(**{target_type: target_id, 'type': r_type})
        count = q.count()
        if count > 0:
            reactions_count[r_type] = count
    return reactions_count


def _get_user_reaction(target_type, target_id, user_id):
    reaction = Reaction.query.filter_by(
        **{target_type: target_id, 'user_id': user_id}
    ).first()
    return reaction.type if reaction else None


def _serialize_author(user):
    return {
        "username": user.username,
        "public_id": user.public_id,
        "avatar_url": user.avatar_url,
        "is_admin": user.is_admin
    }


def _serialize_comment(comment, user_id=None, reactions_count=None):
    if reactions_count is None:
        reactions_count = _build_reactions_count('comment_id', comment.id)

    user_reaction = None
    if user_id:
        user_reaction = _get_user_reaction('comment_id', comment.id, user_id)

    return {
        "id": comment.id,
        "content": comment.content,
        "time": comment.created_at.strftime("%Y-%m-%d %H:%M:%S"),
        "reactions": reactions_count,
        "user_reaction": user_reaction,
        "author": _serialize_author(comment.author),
        "replies": [_serialize_comment(reply, user_id) for reply in comment.replies.all()]
    }


@forum_bp.route('/posts', methods=['GET'])
def get_posts():
    posts = Post.query.order_by(Post.created_at.desc()).all()
    result = []
    for post in posts:
        reactions_count = _build_reactions_count('post_id', post.id)
        result.append({
            "id": post.id,
            "title": post.title,
            "content": post.content,
            "tags": post.tags.split(',') if post.tags else [],
            "upvotes": post.upvotes,
            "reactions": reactions_count,
            "comments_count": Comment.query.filter_by(post_id=post.id).count(),
            "time": post.created_at.strftime("%Y-%m-%d %H:%M:%S"),
            "author": _serialize_author(post.author)
        })
    return jsonify(result), 200


@forum_bp.route('/posts', methods=['POST'])
@jwt_required()
def create_post():
    user = get_current_user()
    data = request.get_json()

    title = data.get('title')
    content = data.get('content')
    tags = data.get('tags', '')

    if not title or not content:
        return jsonify({"msg": "Missing title or content"}), 400

    new_post = Post(
        author_id=user.id,
        title=title,
        content=content,
        tags=tags
    )
    db.session.add(new_post)
    db.session.commit()

    return jsonify({"msg": "Post created successfully", "id": new_post.id}), 201


@forum_bp.route('/posts/<int:post_id>', methods=['GET'])
@jwt_required(optional=True)
def get_post(post_id):
    post = Post.query.get(post_id)
    if not post:
        return jsonify({"msg": "Post not found"}), 404

    user_id = get_jwt_identity()
    if user_id:
        user_id = int(user_id)

    user_reaction = None
    if user_id:
        user_reaction = _get_user_reaction('post_id', post.id, user_id)

    reactions_count = _build_reactions_count('post_id', post.id)

    return jsonify({
        "id": post.id,
        "title": post.title,
        "content": post.content,
        "tags": post.tags.split(',') if post.tags else [],
        "upvotes": post.upvotes,
        "reactions": reactions_count,
        "user_reaction": user_reaction,
        "time": post.created_at.strftime("%Y-%m-%d %H:%M:%S"),
        "author": _serialize_author(post.author)
    }), 200


@forum_bp.route('/posts/<int:post_id>/comments', methods=['GET'])
@jwt_required(optional=True)
def get_comments(post_id):
    comments = Comment.query.filter_by(post_id=post_id, parent_id=None).order_by(Comment.created_at.desc()).all()

    user_id = get_jwt_identity()
    if user_id:
        user_id = int(user_id)

    return jsonify([_serialize_comment(c, user_id) for c in comments]), 200


@forum_bp.route('/posts/<int:post_id>/comments', methods=['POST'])
@jwt_required()
def create_comment(post_id):
    user = get_current_user()
    data = request.get_json()
    content = data.get('content')
    parent_id = data.get('parent_id')

    if not content:
        return jsonify({"msg": "Content is required"}), 400

    new_comment = Comment(
        post_id=post_id,
        author_id=user.id,
        content=content,
        parent_id=parent_id
    )
    db.session.add(new_comment)
    db.session.commit()

    return jsonify({"msg": "Comment created", "id": new_comment.id}), 201


@forum_bp.route('/react', methods=['POST'])
@jwt_required()
def react():
    user = get_current_user()
    data = request.get_json()
    target_type = data.get('target_type')
    target_id = data.get('target_id')
    reaction_type = data.get('type')

    if target_type == 'post':
        existing = Reaction.query.filter_by(post_id=target_id, user_id=user.id).first()
    else:
        existing = Reaction.query.filter_by(comment_id=target_id, user_id=user.id).first()

    if existing:
        if reaction_type is None or existing.type == reaction_type:
            db.session.delete(existing)
            db.session.commit()
            return jsonify({"msg": "Reaction removed"}), 200
        else:
            existing.type = reaction_type
            db.session.commit()
            return jsonify({"msg": "Reaction updated"}), 200
    else:
        if reaction_type:
            new_r = Reaction(user_id=user.id, type=reaction_type)
            if target_type == 'post':
                new_r.post_id = target_id
            else:
                new_r.comment_id = target_id
            db.session.add(new_r)
            db.session.commit()
            return jsonify({"msg": "Reaction added"}), 201

    return jsonify({"msg": "No action taken"}), 400
