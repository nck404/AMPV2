from datetime import datetime

from extensions import db
from werkzeug.security import check_password_hash, generate_password_hash


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    public_id = db.Column(db.String(20), unique=True, nullable=False)
    bio = db.Column(
        db.String(255), default="Đam mê công nghệ và mong muốn đóng góp cho cộng đồng."
    )
    avatar_url = db.Column(db.String(255))
    is_admin = db.Column(db.Boolean, default=False)
    is_banned = db.Column(db.Boolean, default=False)
    role = db.Column(db.String(20), default="user")  # user, business, admin
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)


class Message(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    sender_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    receiver_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=True)
    content = db.Column(db.Text, nullable=False)
    is_read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())

    sender = db.relationship("User", foreign_keys=[sender_id])


class Post(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    author_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text, nullable=False)
    tags = db.Column(db.String(200))
    upvotes = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())

    author = db.relationship("User", backref="posts")


class Comment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    post_id = db.Column(db.Integer, db.ForeignKey("post.id"), nullable=False)
    author_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    parent_id = db.Column(db.Integer, db.ForeignKey("comment.id"), nullable=True)
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())

    author = db.relationship("User", backref="comments")
    replies = db.relationship(
        "Comment", backref=db.backref("parent", remote_side=[id]), lazy="dynamic"
    )


class Reaction(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    post_id = db.Column(db.Integer, db.ForeignKey("post.id"), nullable=True)
    comment_id = db.Column(db.Integer, db.ForeignKey("comment.id"), nullable=True)
    type = db.Column(db.String(20), nullable=False)  # like, love, haha, wow, sad, angry

    user = db.relationship("User", backref="reactions")


class Friendship(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    friend_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    status = db.Column(db.String(20), default="pending")  # pending, accepted, blocked
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())

    user = db.relationship("User", foreign_keys=[user_id], backref="friendships")
    friend = db.relationship("User", foreign_keys=[friend_id])


class Documentation(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    slug = db.Column(db.String(200), unique=True, nullable=False)
    category = db.Column(db.String(100), default="Hướng dẫn")
    content = db.Column(db.Text, nullable=False)  # Markdown
    order = db.Column(db.Integer, default=0)
    last_updated = db.Column(
        db.DateTime,
        default=db.func.current_timestamp(),
        onupdate=db.func.current_timestamp(),
    )


class SystemConfig(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    key = db.Column(db.String(255), unique=True, nullable=False)
    value = db.Column(db.Text, nullable=False)


class Job(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    company = db.Column(db.String(200), nullable=False)
    location = db.Column(db.String(200))
    salary = db.Column(db.String(100))
    type = db.Column(db.String(100))  # Full-time, Remote, etc.
    description = db.Column(db.Text)
    status = db.Column(db.String(20), default="pending")  # pending, approved
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    author_id = db.Column(db.Integer, db.ForeignKey("user.id"))

    author = db.relationship("User", backref="jobs")


class Notification(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(
        db.Integer, db.ForeignKey("user.id"), nullable=True
    )  # NULL means global notification
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text, nullable=False)
    type = db.Column(db.String(50), default="info")  # info, warning, success, admin
    is_read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())

    user = db.relationship("User", backref="notifications")


class JobApplication(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    job_id = db.Column(db.Integer, db.ForeignKey("job.id"), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    name = db.Column(db.String(200), nullable=False)
    email = db.Column(db.String(120), nullable=False)
    phone = db.Column(db.String(20))
    cv_url = db.Column(db.String(255))
    cover_letter = db.Column(db.Text)
    status = db.Column(
        db.String(20), default="pending"
    )  # pending, reviewed, accepted, rejected
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())

    job = db.relationship("Job", backref="applications")
    user = db.relationship("User", backref="applications")


class LearningProgress(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    lesson_title = db.Column(db.String(200), nullable=False)
    category = db.Column(db.String(100))
    score = db.Column(db.Integer, default=0)
    best_score = db.Column(db.Integer, default=0)
    attempts = db.Column(db.Integer, default=0)
    time_spent = db.Column(db.Integer, default=0)  # thời gian học tính bằng giây
    accuracy = db.Column(db.Float, default=0.0)  # độ chính xác (%)
    session_count = db.Column(db.Integer, default=0)  # số phiên học
    completed_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    last_attempt = db.Column(db.DateTime, default=db.func.current_timestamp())

    user = db.relationship("User", backref="learning_progress")


class Leaderboard(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(
        db.Integer, db.ForeignKey("user.id"), unique=True, nullable=False
    )
    total_score = db.Column(db.Integer, default=0)
    total_lessons_completed = db.Column(db.Integer, default=0)
    current_streak = db.Column(db.Integer, default=0)
    highest_streak = db.Column(db.Integer, default=0)
    total_practice_score = db.Column(db.Integer, default=0)
    average_accuracy = db.Column(db.Float, default=0.0)
    last_updated = db.Column(db.DateTime, onupdate=db.func.current_timestamp())
    rank = db.Column(db.Integer, default=0)

    user = db.relationship("User", backref="leaderboard")


class LessonLock(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    target_type = db.Column(db.String(20), nullable=False)  # 'lesson' or 'category'
    target_name = db.Column(db.String(200), nullable=False)
    is_locked = db.Column(db.Boolean, default=True)
