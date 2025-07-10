from app import db

# models/teacher.py (or integrated into models/staff.py)

class Teacher(db.Model):
    __tablename__ = 'teachers'

    teacher_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), unique=True, nullable=False)
    employee_number = db.Column(db.String(50), unique=True, nullable=False)
    gender = db.Column(db.String(10))
    date_of_birth = db.Column(db.Date)
    contact = db.Column(db.String(100))
    qualifications = db.Column(db.String(200))

    # Relationships
    user = db.relationship('User', backref='teacher', uselist=False)
    classrooms = db.relationship('Classroom', backref='class_teacher')
    subject_assignments = db.relationship('ClassAssignment', backref='teacher')
