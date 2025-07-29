from app import db
from datetime import datetime

class Exam(db.Model):
    __tablename__ = 'exams'

    exam_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)  # e.g., CAT 1, CAT 2, Main Exam
    term = db.Column(db.String(10), nullable=False)   # e.g., Term 1, Term 2
    year = db.Column(db.Integer, nullable=False)
    form_level = db.Column(db.String(10), nullable=False)  # e.g., Form 1, Form 2, Form 3, Form 4
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<Exam {self.name} ({self.form_level}, {self.term} {self.year})>"
