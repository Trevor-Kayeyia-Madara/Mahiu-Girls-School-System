from datetime import datetime
from app import db

# === USER ACCOUNTS ===
class User(db.Model):
    __tablename__ = 'users'
    user_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    role = db.Column(db.String(20), nullable=False)  # 'admin', 'teacher', 'parent'

    # Relationships
    staff_profile = db.relationship('Staff', backref='user', uselist=False)
    announcements = db.relationship('Announcement', backref='poster')


# === STAFF (Generic Employee Info) ===
class Staff(db.Model):
    __tablename__ = 'staff'
    staff_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False, unique=True)
    employee_id = db.Column(db.String(50), unique=True, nullable=False)
    gender = db.Column(db.String(10))
    date_of_birth = db.Column(db.Date)
    qualifications = db.Column(db.String(200))
    contact = db.Column(db.String(100))

    # Optional teacher profile
    teacher = db.relationship('Teacher', backref='staff', uselist=False)


# === TEACHER (Only for those in Staff with teaching duties) ===
class Teacher(db.Model):
    __tablename__ = 'teachers'
    teacher_id = db.Column(db.Integer, primary_key=True)
    staff_id = db.Column(db.Integer, db.ForeignKey('staff.staff_id'), nullable=False, unique=True)

    # Relationships
    class_assignments = db.relationship('ClassAssignment', backref='teacher')
    subject_assignments = db.relationship('SubjectAssignment', backref='teacher')
    grades_given = db.relationship('Grade', backref='teacher')


# === CLASSROOMS ===
class Classroom(db.Model):
    __tablename__ = 'classrooms'
    class_id = db.Column(db.Integer, primary_key=True)
    class_name = db.Column(db.String(100), unique=True, nullable=False)

    students = db.relationship('Student', backref='classroom', cascade="all, delete")
    class_assignment = db.relationship('ClassAssignment', backref='classroom', uselist=False)
    subject_assignments = db.relationship('SubjectAssignment', backref='classroom')
    grades = db.relationship('Grade', backref='classroom')


# === SUBJECTS ===
class Subject(db.Model):
    __tablename__ = 'subjects'
    subject_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    group = db.Column(db.String(20))  # e.g. language, science, elective
    compulsory = db.Column(db.Boolean, default=False)

    subject_assignments = db.relationship('SubjectAssignment', backref='subject')
    grades = db.relationship('Grade', backref='subject')


# === STUDENTS ===
class Student(db.Model):
    __tablename__ = 'students'
    student_id = db.Column(db.Integer, primary_key=True)
    admission_number = db.Column(db.String(50), unique=True, nullable=False)
    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=False)
    gender = db.Column(db.String(10), nullable=False)
    date_of_birth = db.Column(db.Date)
    guardian_name = db.Column(db.String(100))
    guardian_phone = db.Column(db.String(20))
    address = db.Column(db.String(200))
    class_id = db.Column(db.Integer, db.ForeignKey('classrooms.class_id'))

    grades = db.relationship('Grade', backref='student', cascade="all, delete")


# === CLASS TEACHER ASSIGNMENT ===
class ClassAssignment(db.Model):
    __tablename__ = 'class_assignments'
    id = db.Column(db.Integer, primary_key=True)
    class_id = db.Column(db.Integer, db.ForeignKey('classrooms.class_id'), nullable=False, unique=True)
    teacher_id = db.Column(db.Integer, db.ForeignKey('teachers.teacher_id'), nullable=False)


# === SUBJECT TEACHER ASSIGNMENT ===
class SubjectAssignment(db.Model):
    __tablename__ = 'subject_assignments'
    id = db.Column(db.Integer, primary_key=True)
    subject_id = db.Column(db.Integer, db.ForeignKey('subjects.subject_id'), nullable=False)
    class_id = db.Column(db.Integer, db.ForeignKey('classrooms.class_id'), nullable=False)
    teacher_id = db.Column(db.Integer, db.ForeignKey('teachers.teacher_id'), nullable=False)

    __table_args__ = (db.UniqueConstraint('subject_id', 'class_id'),)


# === GRADES ===
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


# === ANNOUNCEMENTS ===
class Announcement(db.Model):
    __tablename__ = 'announcements'
    announcement_id = db.Column(db.Integer, primary_key=True)
    posted_by = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text, nullable=False)
    target_audience = db.Column(db.String(20))  # 'students', 'parents', 'staff', 'all'
    posted_at = db.Column(db.DateTime, default=datetime.utcnow)
