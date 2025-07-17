from datetime import datetime
from app import db

class Grade(db.Model):
    __tablename__ = 'grades'

    grade_id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('students.student_id'), nullable=False)
    exam_schedule_id = db.Column(db.Integer, db.ForeignKey('exam_schedules.id'), nullable=False)

    subject_id = db.Column(db.Integer, db.ForeignKey('subjects.subject_id'), nullable=False)
    marks = db.Column(db.Float, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    exam_schedule = db.relationship('ExamSchedule', backref='grades')

    def __repr__(self):
        return f"<Grade Student={self.student_id}, Marks={self.marks}, ExamSchedule={self.exam_schedule_id}>"
