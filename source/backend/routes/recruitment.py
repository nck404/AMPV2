from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import Job, JobApplication, User, Notification
from extensions import db
import os
import uuid
from flask import current_app
from utils import get_current_user

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
    job = Job.query.get(job_id)
    if not job:
        return jsonify({"msg": "Job not found"}), 404
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
    user = get_current_user()

    if user.role not in ["business", "admin"]:
        return jsonify({"msg": "Only businesses can post jobs."}), 403

    data = request.get_json()
    if not data or not data.get("title") or not data.get("company"):
        return jsonify({"msg": "Missing required fields."}), 400

    new_job = Job(
        title=data.get("title"),
        company=data.get("company"),
        location=data.get("location"),
        salary=data.get("salary"),
        type=data.get("type"),
        description=data.get("description"),
        author_id=user.id,
        status='pending'
    )
    db.session.add(new_job)
    db.session.commit()

    return jsonify({"msg": "Job posted successfully. Waiting for admin approval.", "job_id": new_job.id}), 201


@recruitment_bp.route("/jobs/<int:job_id>/apply", methods=["POST"])
@jwt_required()
def apply_job(job_id):
    user = get_current_user()
    job = Job.query.get(job_id)
    if not job:
        return jsonify({"msg": "Job not found"}), 404

    data = request.get_json()
    if not data or not data.get("name") or not data.get("email"):
        return jsonify({"msg": "Missing required fields."}), 400

    existing = JobApplication.query.filter_by(job_id=job_id, user_id=user.id).first()
    if existing:
        return jsonify({"msg": "You have already applied for this job."}), 400

    new_application = JobApplication(
        job_id=job_id,
        user_id=user.id,
        name=data.get("name"),
        email=data.get("email"),
        phone=data.get("phone"),
        cv_url=data.get("cv_url"),
        cover_letter=data.get("cover_letter")
    )
    db.session.add(new_application)
    db.session.commit()

    return jsonify({"msg": "Application submitted successfully."}), 201


@recruitment_bp.route("/applications", methods=["GET"])
@jwt_required()
def get_applications():
    user = get_current_user()

    if user.role == "business":
        jobs = Job.query.filter_by(author_id=user.id).all()
        job_ids = [j.id for j in jobs]
        apps = JobApplication.query.filter(JobApplication.job_id.in_(job_ids)).all()
    else:
        apps = JobApplication.query.filter_by(user_id=user.id).all()

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
    user = get_current_user()

    if 'cv' not in request.files:
        return jsonify({"msg": "No file part"}), 400

    file = request.files['cv']
    if file.filename == '':
        return jsonify({"msg": "No selected file"}), 400

    if file:
        ext = os.path.splitext(file.filename)[1].lower()
        if ext not in ['.pdf', '.doc', '.docx']:
            return jsonify({"msg": "Only PDF, DOC, and DOCX files are allowed."}), 400

        filename = f"cv_{user.id}_{uuid.uuid4().hex}{ext}"
        filepath = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)

        cv_url = f"/static/uploads/{filename}"
        return jsonify({
            "msg": "CV uploaded successfully",
            "cv_url": cv_url
        }), 200


@recruitment_bp.route("/applications/<int:app_id>/status", methods=["PUT"])
@jwt_required()
def update_application_status(app_id):
    user = get_current_user()

    app = JobApplication.query.get(app_id)
    if not app:
        return jsonify({"msg": "Application not found"}), 404
    if app.job.author_id != user.id and user.role != "admin":
        return jsonify({"msg": "Unauthorized"}), 403

    data = request.get_json()
    status = data.get("status")
    if status not in ['pending', 'reviewed', 'accepted', 'rejected']:
        return jsonify({"msg": "Invalid status"}), 400

    app.status = status
    db.session.commit()
    return jsonify({"msg": f"Application status updated to {status}"}), 200


@recruitment_bp.route("/applications/send-email", methods=["POST"])
@jwt_required()
def send_bulk_email():
    data = request.get_json()
    emails = data.get("emails", [])
    subject = data.get("subject", "Thông báo từ nhà tuyển dụng")
    body = data.get("body", "")

    if not emails:
        return jsonify({"msg": "No emails provided"}), 400

    print(f"Sending email to {len(emails)} recipients: {emails}")
    print(f"Subject: {subject}")

    return jsonify({"msg": f"Successfully sent email to {len(emails)} applicants."}), 200
