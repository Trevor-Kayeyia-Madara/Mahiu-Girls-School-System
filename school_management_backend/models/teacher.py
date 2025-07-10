from app import db

class Teacher(db.Model):
    __tablename__ = 'teachers'
    
    teacher_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False, unique=True)
    employee_id = db.Column(db.String(50), unique=True, nullable=False)
    qualifications = db.Column(db.String(200))
    gender = db.Column(db.String(10))
    contact = db.Column(db.String(100))
    
    # Relationships to class and subject
    classes = db.relationship('Classroom', backref='class_teacher')
    teacher_subjects = db.relationship('TeacherSubject', backref='teacher')
