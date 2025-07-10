# models/announcement.py

from datetime import datetime
from app import db

class Announcement(db.Model):
    __tablename__ = 'announcements'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text, nullable=False)
    target_role = db.Column(db.String(20))  # 'admin', 'teacher', 'student', 'parent', 'all'
    posted_by = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    poster = db.relationship('User', backref='announcements')
