from app import db

class Teacher(db.Model):
    __tablename__ = 'teachers'

    teacher_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), unique=True, nullable=False)
    employee_number = db.Column(db.String(50), unique=True, nullable=False)
    gender = db.Column(db.String(10))
    date_of_birth = db.Column(db.Date)
    contact = db.Column(db.String(100))
    qualifications = db.Column(db.String(200))

    user = db.relationship('User', back_populates='teacher', uselist=False)

    # ✅ Explicit two-way relationship
    classrooms = db.relationship('Classroom', back_populates='class_teacher')

    subject_assignments = db.relationship('ClassAssignment', back_populates='assigned_teacher', overlaps="teacher")


