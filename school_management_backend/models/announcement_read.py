# models/announcement_read.py (assuming this is your file name)
from app import db
from datetime import datetime # Not directly used in AnnouncementRead, but good to keep if it was.

class AnnouncementRead(db.Model):
    __tablename__ = 'announcement_reads'
    id = db.Column(db.Integer, primary_key=True)
    # FIX 1: Change 'announcement' to 'announcements' (plural table name)
    # FIX 2: Change 'announcement_id' to 'id' (primary key column name in Announcement)
    announcement_id = db.Column(db.Integer, db.ForeignKey('announcements.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)

    __table_args__ = (db.UniqueConstraint('announcement_id', 'user_id'),)

    # Add relationships for easier querying (optional but recommended)
    announcement = db.relationship('Announcement', backref='read_by_users')
    user = db.relationship('User', backref='announcements_read')

    def __repr__(self):
        return f"<AnnouncementRead User:{self.user_id} Announcement:{self.announcement_id}>"