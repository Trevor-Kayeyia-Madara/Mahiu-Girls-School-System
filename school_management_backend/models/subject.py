from app import db

class Subject(db.Model):
    __tablename__ = 'subjects'

    subject_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    group = db.Column(db.String(20))  # science, language, elective
    compulsory = db.Column(db.Boolean, default=False)

    teacher_subjects = db.relationship('TeacherSubject', backref='subject')
