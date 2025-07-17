from app import db

class Grade(db.Model):
    __tablename__ = 'grades'
    grade_id = db.Column(db.Integer, primary_key=True)
    exam_schedule_id = db.Column(db.Integer, nullable=False)
    marks = db.Column(db.Float, nullable=False)
    student_id = db.Column(db.Integer, db.ForeignKey('students.student_id'), nullable=False)