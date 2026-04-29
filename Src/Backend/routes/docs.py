from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import User, Documentation
from extensions import db

docs_bp = Blueprint('docs', __name__)

def admin_required():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user or not user.is_admin:
        return False
    return True

@docs_bp.route('/', methods=['GET'])
def get_all_docs():
    docs = Documentation.query.order_by(Documentation.category, Documentation.order).all()
    result = []
    for doc in docs:
        result.append({
            "id": doc.id,
            "title": doc.title,
            "slug": doc.slug,
            "category": doc.category,
            "order": doc.order
        })
    return jsonify(result), 200

@docs_bp.route('/<slug>', methods=['GET'])
def get_doc(slug):
    doc = Documentation.query.filter_by(slug=slug).first()
    if not doc:
        return jsonify({"msg": "Documentation not found"}), 404
    
    return jsonify({
        "id": doc.id,
        "title": doc.title,
        "slug": doc.slug,
        "category": doc.category,
        "content": doc.content,
        "order": doc.order,
        "last_updated": doc.last_updated
    }), 200

@docs_bp.route('/', methods=['POST'])
@jwt_required()
def create_doc():
    if not admin_required():
        return jsonify({"msg": "Admin privilege required"}), 403
    
    data = request.get_json()
    title = data.get('title')
    slug = data.get('slug')
    content = data.get('content')
    category = data.get('category', 'Hướng dẫn')
    order = data.get('order', 0)

    if not all([title, slug, content]):
        return jsonify({"msg": "Missing required fields"}), 400

    if Documentation.query.filter_by(slug=slug).first():
        return jsonify({"msg": "Slug already exists"}), 400

    new_doc = Documentation(
        title=title,
        slug=slug,
        content=content,
        category=category,
        order=order
    )
    db.session.add(new_doc)
    db.session.commit()

    return jsonify({"msg": "Documentation created successfully", "id": new_doc.id}), 201

@docs_bp.route('/<int:doc_id>', methods=['PUT'])
@jwt_required()
def update_doc(doc_id):
    if not admin_required():
        return jsonify({"msg": "Admin privilege required"}), 403
    
    doc = Documentation.query.get(doc_id)
    if not doc:
        return jsonify({"msg": "Documentation not found"}), 404
    
    data = request.get_json()
    doc.title = data.get('title', doc.title)
    doc.slug = data.get('slug', doc.slug)
    doc.content = data.get('content', doc.content)
    doc.category = data.get('category', doc.category)
    doc.order = data.get('order', doc.order)

    db.session.commit()
    return jsonify({"msg": "Documentation updated successfully"}), 200

@docs_bp.route('/<int:doc_id>', methods=['DELETE'])
@jwt_required()
def delete_doc(doc_id):
    if not admin_required():
        return jsonify({"msg": "Admin privilege required"}), 403
    
    doc = Documentation.query.get(doc_id)
    if not doc:
        return jsonify({"msg": "Documentation not found"}), 404
    
    db.session.delete(doc)
    db.session.commit()
    return jsonify({"msg": "Documentation deleted successfully"}), 200

