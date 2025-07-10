from app import db

class Classroom(db.Model):
    __tablename__ = 'classrooms'

    class_id = db.Column(db.Integer, primary_key=True)
    class_name = db.Column(db.String(100), unique=True, nullable=False)
    class_teacher_id = db.Column(db.Integer, db.ForeignKey('teachers.teacher_id'))

    students = db.relationship('Student', backref='classroom')
    teacher_subjects = db.relationship('TeacherSubject', backref='classroom')
