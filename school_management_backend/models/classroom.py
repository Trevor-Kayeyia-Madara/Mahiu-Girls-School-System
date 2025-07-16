from app import db

class Classroom(db.Model):
    __tablename__ = 'classrooms'

    class_id = db.Column(db.Integer, primary_key=True)
    class_name = db.Column(db.String(100), unique=True, nullable=False)

    # NEW: Optional field to store form level explicitly
    form_level = db.Column(db.String(20), nullable=True)  # e.g. Form 1, Form 2, etc.

    class_teacher_id = db.Column(db.Integer, db.ForeignKey('teachers.teacher_id'))

    # Relationships
    class_teacher = db.relationship('Teacher', back_populates='classrooms')
    students = db.relationship('Student', backref='classroom')
    teacher_subjects = db.relationship('TeacherSubject', backref='classroom')
