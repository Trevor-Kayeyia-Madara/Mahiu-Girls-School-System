from app import db

class Grade(db.Model):
    __tablename__ = 'grades'
    grade_id = db.Column(db.Integer, primary_key=True)

    student_id = db.Column(db.Integer, db.ForeignKey('students.student_id'), nullable=False)
    class_id = db.Column(db.Integer, db.ForeignKey('classrooms.class_id'), nullable=False)
    subject_id = db.Column(db.Integer, db.ForeignKey('subjects.subject_id'), nullable=False)
    teacher_id = db.Column(db.Integer, db.ForeignKey('teachers.teacher_id'), nullable=False)

    term = db.Column(db.String(10))
    year = db.Column(db.Integer)
    score = db.Column(db.Float)
