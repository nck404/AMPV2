from datetime import datetime

from extensions import db
from flask import Blueprint, jsonify, request
from models import Leaderboard, LearningProgress, LessonLock, User
from utils import token_required

sign_lang_bp = Blueprint("sign_lang", __name__)


@sign_lang_bp.route("/progress", methods=["GET"])
@token_required
def get_progress(current_user):
    progress = LearningProgress.query.filter_by(user_id=current_user.id).all()
    return jsonify(
        [
            {
                "lesson_title": p.lesson_title,
                "category": p.category,
                "score": p.score,
                "completed_at": p.completed_at.isoformat(),
            }
            for p in progress
        ]
    )


@sign_lang_bp.route("/progress", methods=["POST"])
@token_required
def save_progress(current_user):
    data = request.get_json()
    lesson_title = data.get("lesson_title")
    category = data.get("category")
    score = data.get("score", 0)
    time_spent = data.get("time_spent", 0)  # thời gian học tính bằng giây
    accuracy = data.get("accuracy", 0.0)  # độ chính xác (%)

    # Check if exists to update or create new
    p = LearningProgress.query.filter_by(
        user_id=current_user.id, lesson_title=lesson_title
    ).first()
    if p:
        # Update existing progress
        p.score = score
        p.best_score = max(p.best_score, score)
        p.attempts += 1
        p.time_spent += time_spent
        p.accuracy = accuracy
        p.session_count += 1
        p.completed_at = datetime.utcnow()
        p.last_attempt = datetime.utcnow()
    else:
        # Create new progress record
        p = LearningProgress(
            user_id=current_user.id,
            lesson_title=lesson_title,
            category=category,
            score=score,
            best_score=score,
            attempts=1,
            time_spent=time_spent,
            accuracy=accuracy,
            session_count=1,
            completed_at=datetime.utcnow(),
            last_attempt=datetime.utcnow(),
        )
        db.session.add(p)

    db.session.commit()

    # Update leaderboard entry
    update_leaderboard(current_user.id)

    return jsonify(
        {
            "message": "Progress saved successfully",
            "lesson_title": lesson_title,
            "score": score,
            "best_score": p.best_score,
            "attempts": p.attempts,
            "session_count": p.session_count,
        }
    )


@sign_lang_bp.route("/locks", methods=["GET"])
def get_locks():
    locks = LessonLock.query.filter_by(is_locked=True).all()
    return jsonify(
        [{"target_type": l.target_type, "target_name": l.target_name} for l in locks]
    )


@sign_lang_bp.route("/locks/toggle", methods=["POST"])
@token_required
def toggle_lock(current_user):
    if current_user.role != "admin":
        return jsonify({"message": "Unauthorized"}), 403

    data = request.get_json()
    target_type = data.get("target_type")  # 'lesson' or 'category'
    target_name = data.get("target_name")

    lock = LessonLock.query.filter_by(
        target_type=target_type, target_name=target_name
    ).first()
    if lock:
        db.session.delete(lock)
        status = "unlocked"
    else:
        lock = LessonLock(
            target_type=target_type, target_name=target_name, is_locked=True
        )
        db.session.add(lock)
        status = "locked"

    db.session.commit()
    return jsonify({"message": f"Target {status} successfully", "status": status})


@sign_lang_bp.route("/leaderboard", methods=["GET"])
def get_leaderboard():
    limit = int(request.args.get("limit", 50))
    offset = int(request.args.get("offset", 0))

    # Update ranks before fetching
    update_all_ranks()

    # Get leaderboard entries with user info
    entries = (
        db.session.query(Leaderboard, User)
        .join(User)
        .filter(User.is_banned == False)
        .order_by(Leaderboard.total_score.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )

    result = []
    for entry, user in entries:
        result.append(
            {
                "rank": entry.rank,
                "user_id": user.id,
                "username": user.username,
                "avatar_url": user.avatar_url,
                "total_score": entry.total_score,
                "total_lessons_completed": entry.total_lessons_completed,
                "current_streak": entry.current_streak,
                "highest_streak": entry.highest_streak,
                "average_accuracy": entry.average_accuracy,
                "total_practice_score": entry.total_practice_score,
                "last_updated": entry.last_updated.isoformat()
                if entry.last_updated
                else None,
            }
        )

    return jsonify(result)


@sign_lang_bp.route("/leaderboard/me", methods=["GET"])
@token_required
def get_my_leaderboard(current_user):
    # Update ranks before fetching
    update_all_ranks()

    entry = Leaderboard.query.filter_by(user_id=current_user.id).first()
    if not entry:
        return jsonify({"message": "No leaderboard data found"}), 404

    return jsonify(
        {
            "rank": entry.rank,
            "user_id": current_user.id,
            "username": current_user.username,
            "avatar_url": current_user.avatar_url,
            "total_score": entry.total_score,
            "total_lessons_completed": entry.total_lessons_completed,
            "current_streak": entry.current_streak,
            "highest_streak": entry.highest_streak,
            "average_accuracy": entry.average_accuracy,
            "total_practice_score": entry.total_practice_score,
            "last_updated": entry.last_updated.isoformat()
            if entry.last_updated
            else None,
        }
    )


@sign_lang_bp.route("/leaderboard/user/<int:user_id>", methods=["GET"])
@token_required
def get_user_leaderboard(current_user, user_id):
    # Update ranks before fetching
    update_all_ranks()

    entry = Leaderboard.query.filter_by(user_id=user_id).first()
    user = User.query.get(user_id)

    if not entry or not user or user.is_banned:
        return jsonify({"message": "User not found or no data"}), 404

    return jsonify(
        {
            "rank": entry.rank,
            "user_id": user.id,
            "username": user.username,
            "avatar_url": user.avatar_url,
            "total_score": entry.total_score,
            "total_lessons_completed": entry.total_lessons_completed,
            "current_streak": entry.current_streak,
            "highest_streak": entry.highest_streak,
            "average_accuracy": entry.average_accuracy,
            "total_practice_score": entry.total_practice_score,
            "last_updated": entry.last_updated.isoformat()
            if entry.last_updated
            else None,
        }
    )


# ─── Helper Functions ─────────────────────────────────────────────────────


def update_leaderboard(user_id):
    """Update or create leaderboard entry for a user"""
    user = User.query.get(user_id)
    if not user:
        return

    # Get or create leaderboard entry
    entry = Leaderboard.query.filter_by(user_id=user_id).first()
    if not entry:
        entry = Leaderboard(user_id=user_id)
        db.session.add(entry)

    # Calculate stats from learning progress
    progress_records = LearningProgress.query.filter_by(user_id=user_id).all()

    total_score = sum(p.score for p in progress_records)
    total_lessons = len(progress_records)

    # Calculate average accuracy (assuming score = accuracy * 100)
    if total_lessons > 0:
        average_accuracy = (
            (total_score / (total_lessons * 100)) * 100 if total_lessons > 0 else 0
        )
    else:
        average_accuracy = 0.0

    entry.total_score = total_score
    entry.total_lessons_completed = total_lessons
    entry.average_accuracy = average_accuracy
    entry.last_updated = datetime.utcnow()

    db.session.commit()


def update_all_ranks():
    """Update ranks for all leaderboard entries based on total_score"""
    # Get all leaderboard entries ordered by total_score desc
    entries = Leaderboard.query.order_by(Leaderboard.total_score.desc()).all()

    # Update ranks
    for i, entry in enumerate(entries, start=1):
        entry.rank = i

    db.session.commit()
