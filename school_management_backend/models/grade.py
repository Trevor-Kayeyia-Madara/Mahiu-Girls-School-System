from app import db

class Grade(db.Model):
    __tablename__ = 'grades'
    grade_id = db.Column(db.Integer, primary_key=True)
    exam_schedule_id = db.Column(db.Integer, db.ForeignKey('exam_schedules.id'), nullable=False)
    marks = db.Column(db.Float, nullable=False)
    student_id = db.Column(db.Integer, db.ForeignKey('students.student_id'), nullable=False)
    subject_id = db.Column(db.Integer, db.ForeignKey('subjects.subject_id'), nullable=False)

    # ✅ Add these relationships:
    exam_schedule = db.relationship('ExamSchedule', backref='grades')
    student = db.relationship('Student', backref='grades')
    subject = db.relationship('Subject', backref='grades')
