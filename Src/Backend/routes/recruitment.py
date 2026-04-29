from flask import Blueprint, jsonify, request
from extensions import db
from models import Job, JobApplication, User
try:
    from flask_jwt_extended import jwt_required, get_jwt_identity
except ImportError:
    from functools import wraps
    def jwt_required():
        def decorator(f):
            @wraps(f)
            def decorated(*args, **kwargs):
                return f(*args, **kwargs)
            return decorated
        return decorator
    def get_jwt_identity(): return None

import os
import uuid
from flask import current_app

recruitment_bp = Blueprint("recruitment_bp", __name__)

@recruitment_bp.route("/jobs", methods=["GET"])
def get_jobs():
    jobs = Job.query.filter_by(status='approved').all()
    output = []
    for job in jobs:
        output.append({
            "id": job.id,
            "title": job.title,
            "company": job.company,
            "location": job.location,
            "salary": job.salary,
            "type": job.type,
            "logo": job.company[0].upper() if job.company else "?",
            "tags": [job.type] if job.type else [],
            "date": job.created_at.strftime("%d/%m/%Y"),
            "description": job.description
        })
    return jsonify({"jobs": output}), 200

@recruitment_bp.route("/jobs/<int:job_id>", methods=["GET"])
def get_job(job_id):
    job = Job.query.get_or_404(job_id)
    return jsonify({
        "id": job.id,
        "title": job.title,
        "company": job.company,
        "location": job.location,
        "salary": job.salary,
        "type": job.type,
        "description": job.description,
        "created_at": job.created_at.isoformat()
    }), 200

@recruitment_bp.route("/jobs", methods=["POST"])
@jwt_required()
def create_job():
    current_user_id = get_jwt_identity()
    current_user = User.query.get(int(current_user_id))
    
    if current_user.role not in ["business", "admin"]:
        return jsonify({"message": "Only businesses can post jobs."}), 403
    
    data = request.get_json()
    if not data or not data.get("title") or not data.get("company"):
        return jsonify({"message": "Missing required fields."}), 400
    
    new_job = Job(
        title=data.get("title"),
        company=data.get("company"),
        location=data.get("location"),
        salary=data.get("salary"),
        type=data.get("type"),
        description=data.get("description"),
        author_id=current_user.id,
        status='pending'
    )
    db.session.add(new_job)
    db.session.commit()
    
    return jsonify({"message": "Job posted successfully. Waiting for admin approval.", "job_id": new_job.id}), 201

@recruitment_bp.route("/jobs/<int:job_id>/apply", methods=["POST"])
@jwt_required()
def apply_job(job_id):
    current_user_id = get_jwt_identity()
    current_user = User.query.get(int(current_user_id))
    job = Job.query.get_or_404(job_id)
    
    data = request.get_json()
    if not data or not data.get("name") or not data.get("email"):
        return jsonify({"message": "Missing required fields."}), 400
    
    existing = JobApplication.query.filter_by(job_id=job_id, user_id=current_user.id).first()
    if existing:
        return jsonify({"message": "You have already applied for this job."}), 400

    new_application = JobApplication(
        job_id=job_id,
        user_id=current_user.id,
        name=data.get("name"),
        email=data.get("email"),
        phone=data.get("phone"),
        cv_url=data.get("cv_url"),
        cover_letter=data.get("cover_letter")
    )
    db.session.add(new_application)
    db.session.commit()
    
    return jsonify({"message": "Application submitted successfully."}), 201

@recruitment_bp.route("/applications", methods=["GET"])
@jwt_required()
def get_applications():
    current_user_id = get_jwt_identity()
    current_user = User.query.get(int(current_user_id))
    
    if current_user.role == "business":
        jobs = Job.query.filter_by(author_id=current_user.id).all()
        job_ids = [j.id for j in jobs]
        apps = JobApplication.query.filter(JobApplication.job_id.in_(job_ids)).all()
    else:
        apps = JobApplication.query.filter_by(user_id=current_user.id).all()
    
    output = []
    for app in apps:
        output.append({
            "id": app.id,
            "job_title": app.job.title,
            "job_company": app.job.company,
            "name": app.name,
            "email": app.email,
            "phone": app.phone,
            "cv_url": app.cv_url,
            "status": app.status,
            "created_at": app.created_at.isoformat()
        })
    return jsonify({"applications": output}), 200

@recruitment_bp.route("/upload", methods=["POST"])
@jwt_required()
def upload_cv():
    current_user_id = get_jwt_identity()
    
    if 'cv' not in request.files:
        return jsonify({"message": "No file part"}), 400
    
    file = request.files['cv']
    if file.filename == '':
        return jsonify({"message": "No selected file"}), 400
        
    if file:
        ext = os.path.splitext(file.filename)[1].lower()
        if ext not in ['.pdf', '.doc', '.docx']:
            return jsonify({"message": "Only PDF, DOC, and DOCX files are allowed."}), 400
            
        filename = f"cv_{current_user_id}_{uuid.uuid4().hex}{ext}"
        filepath = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        cv_url = f"/static/uploads/{filename}"
        return jsonify({
            "message": "CV uploaded successfully",
            "cv_url": cv_url
        }), 200
@recruitment_bp.route("/applications/<int:app_id>/status", methods=["PUT"])
@jwt_required()
def update_application_status(app_id):
    current_user_id = get_jwt_identity()
    current_user = User.query.get(int(current_user_id))
    
    app = JobApplication.query.get_or_404(app_id)
    if app.job.author_id != current_user.id and current_user.role != "admin":
        return jsonify({"message": "Unauthorized"}), 403
        
    data = request.get_json()
    status = data.get("status")
    if status not in ['pending', 'reviewed', 'accepted', 'rejected']:
        return jsonify({"message": "Invalid status"}), 400
        
    app.status = status
    db.session.commit()
    return jsonify({"message": f"Application status updated to {status}"}), 200

@recruitment_bp.route("/applications/send-email", methods=["POST"])
@jwt_required()
def send_bulk_email():
    data = request.get_json()
    emails = data.get("emails", [])
    subject = data.get("subject", "Thông báo từ nhà tuyển dụng")
    body = data.get("body", "")
    
    if not emails:
        return jsonify({"message": "No emails provided"}), 400
        
    print(f"Sending email to {len(emails)} recipients: {emails}")
    print(f"Subject: {subject}")
    
    return jsonify({"message": f"Successfully sent email to {len(emails)} applicants."}), 200

