from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import User, Post, Comment, Reaction
from extensions import db
from datetime import datetime

forum_bp = Blueprint('forum', __name__)

@forum_bp.route('/posts', methods=['GET'])
def get_posts():
    posts = Post.query.order_by(Post.created_at.desc()).all()
    result = []
    for post in posts:
        # Count reactions
        reactions_count = {}
        for r_type in ['like', 'love', 'haha', 'wow', 'sad', 'angry']:
            count = Reaction.query.filter_by(post_id=post.id, type=r_type).count()
            if count > 0:
                reactions_count[r_type] = count

        result.append({
            "id": post.id,
            "title": post.title,
            "content": post.content,
            "tags": post.tags.split(',') if post.tags else [],
            "upvotes": post.upvotes,
            "reactions": reactions_count,
            "comments_count": Comment.query.filter_by(post_id=post.id).count(),
            "time": post.created_at.strftime("%Y-%m-%d %H:%M:%S"),
            "author": {
                "username": post.author.username,
                "public_id": post.author.public_id,
                "avatar_url": post.author.avatar_url
            }
        })
    return jsonify(result), 200

@forum_bp.route('/posts', methods=['POST'])
@jwt_required()
def create_post():
    user_id = int(get_jwt_identity())
    data = request.get_json()
    
    title = data.get('title')
    content = data.get('content')
    tags = data.get('tags', '') # string
    
    if not title or not content:
        return jsonify({"msg": "Missing title or content"}), 400
        
    new_post = Post(
        author_id=user_id,
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
    user_reaction = None
    if user_id:
        reaction = Reaction.query.filter_by(post_id=post.id, user_id=int(user_id)).first()
        if reaction:
            user_reaction = reaction.type

    # Count reactions
    reactions_count = {}
    for r_type in ['like', 'love', 'haha', 'wow', 'sad', 'angry']:
        count = Reaction.query.filter_by(post_id=post.id, type=r_type).count()
        if count > 0:
            reactions_count[r_type] = count
        
    return jsonify({
        "id": post.id,
        "title": post.title,
        "content": post.content,
        "tags": post.tags.split(',') if post.tags else [],
        "upvotes": post.upvotes,
        "reactions": reactions_count,
        "user_reaction": user_reaction,
        "time": post.created_at.strftime("%Y-%m-%d %H:%M:%S"),
        "author": {
            "username": post.author.username,
            "public_id": post.author.public_id,
            "avatar_url": post.author.avatar_url
        }
    }), 200

@forum_bp.route('/posts/<int:post_id>/comments', methods=['GET'])
@jwt_required(optional=True)
def get_comments(post_id):
    # Fetch top-level comments
    comments = Comment.query.filter_by(post_id=post_id, parent_id=None).order_by(Comment.created_at.desc()).all()
    
    user_id = get_jwt_identity()
    
    def serialize_comment(c):
        # Count reactions for comment
        reactions_count = {}
        for r_type in ['like', 'love', 'haha', 'wow', 'sad', 'angry']:
            count = Reaction.query.filter_by(comment_id=c.id, type=r_type).count()
            if count > 0:
                reactions_count[r_type] = count
        
        user_reaction = None
        if user_id:
            reaction = Reaction.query.filter_by(comment_id=c.id, user_id=int(user_id)).first()
            if reaction:
                user_reaction = reaction.type

        return {
            "id": c.id,
            "content": c.content,
            "time": c.created_at.strftime("%Y-%m-%d %H:%M:%S"),
            "reactions": reactions_count,
            "user_reaction": user_reaction,
            "author": {
                "username": c.author.username,
                "public_id": c.author.public_id,
                "avatar_url": c.author.avatar_url
            },
            "replies": [serialize_comment(reply) for reply in c.replies.all()]
        }
    
    return jsonify([serialize_comment(c) for c in comments]), 200

@forum_bp.route('/posts/<int:post_id>/comments', methods=['POST'])
@jwt_required()
def create_comment(post_id):
    user_id = int(get_jwt_identity())
    data = request.get_json()
    content = data.get('content')
    parent_id = data.get('parent_id') # Optional for replies
    
    if not content:
        return jsonify({"msg": "Content is required"}), 400
        
    new_comment = Comment(
        post_id=post_id,
        author_id=user_id,
        content=content,
        parent_id=parent_id
    )
    db.session.add(new_comment)
    db.session.commit()
    
    return jsonify({"msg": "Comment created", "id": new_comment.id}), 201

@forum_bp.route('/react', methods=['POST'])
@jwt_required()
def react():
    user_id = int(get_jwt_identity())
    data = request.get_json()
    target_type = data.get('target_type') # 'post' or 'comment'
    target_id = data.get('target_id')
    reaction_type = data.get('type') # 'like', 'love', etc. or None to remove
    
    if target_type == 'post':
        existing = Reaction.query.filter_by(user_id=user_id, post_id=target_id).first()
    else:
        existing = Reaction.query.filter_by(user_id=user_id, comment_id=target_id).first()
        
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
            new_r = Reaction(user_id=user_id, type=reaction_type)
            if target_type == 'post':
                new_r.post_id = target_id
            else:
                new_r.comment_id = target_id
            db.session.add(new_r)
            db.session.commit()
            return jsonify({"msg": "Reaction added"}), 201
            
    return jsonify({"msg": "No action taken"}), 400
