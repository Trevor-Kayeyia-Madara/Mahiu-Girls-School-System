# models.py
#type: ignore
from datetime import datetime
from app import db

# =====================
# === AUTH USERS ======
# =====================
class User(db.Model):
    __tablename__ = 'users'
    user_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    role = db.Column(db.String(20), nullable=False)  # admin, teacher, parent

    staff = db.relationship('Staff', backref='user', uselist=False)
    parent = db.relationship('Parent', backref='user', uselist=False)

# =====================
# === STAFF & TEACHERS
# =====================
class Staff(db.Model):
    __tablename__ = 'staff'
    staff_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False, unique=True)
    employee_id = db.Column(db.String(50), unique=True, nullable=False)
    gender = db.Column(db.String(10))
    date_of_birth = db.Column(db.Date)
    role = db.Column(db.String(20))  # teacher, admin
    contact = db.Column(db.String(100))
    qualifications = db.Column(db.String(200))

    teacher_subjects = db.relationship('TeacherSubject', backref='teacher', cascade="all, delete")
    grades_given = db.relationship('Grade', backref='teacher', cascade="all, delete")
    classes_led = db.relationship('Classroom', backref='class_teacher', cascade="all, delete")
    messages_sent = db.relationship('Message', foreign_keys='Message.sender_id', backref='sender')
    messages_received = db.relationship('Message', foreign_keys='Message.receiver_id', backref='receiver')

# =====================
# ====== PARENTS ======
# =====================
class Parent(db.Model):
    __tablename__ = 'parents'
    parent_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False, unique=True)
    phone = db.Column(db.String(20))
    address = db.Column(db.String(200))

    children = db.relationship('Student', backref='parent', cascade="all, delete")

# =====================
# ===== STUDENTS ======
# =====================
class Student(db.Model):
    __tablename__ = 'students'
    student_id = db.Column(db.Integer, primary_key=True)
    admission_number = db.Column(db.String(50), unique=True, nullable=False)
    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=False)
    gender = db.Column(db.String(10), nullable=False)
    date_of_birth = db.Column(db.Date)
    class_id = db.Column(db.Integer, db.ForeignKey('classrooms.class_id'))
    parent_id = db.Column(db.Integer, db.ForeignKey('parents.parent_id'))

    grades = db.relationship('Grade', backref='student', cascade="all, delete")

# =====================
# ==== CLASSROOMS =====
# =====================
class Classroom(db.Model):
    __tablename__ = 'classrooms'
    class_id = db.Column(db.Integer, primary_key=True)
    class_name = db.Column(db.String(100), unique=True, nullable=False)
    class_teacher_id = db.Column(db.Integer, db.ForeignKey('staff.staff_id'))

    students = db.relationship('Student', backref='classroom', cascade="all, delete")
    subject_assignments = db.relationship('TeacherSubject', backref='classroom', cascade="all, delete")
    timetable_entries = db.relationship('TimetableEntry', backref='classroom', cascade="all, delete")
    grades = db.relationship('Grade', backref='classroom', cascade="all, delete")

# =====================
# ===== SUBJECTS ======
# =====================
class Subject(db.Model):
    __tablename__ = 'subjects'
    subject_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    group = db.Column(db.String(20), nullable=False)  # language, science, humanity, elective
    compulsory = db.Column(db.Boolean, default=False)

    teacher_subjects = db.relationship('TeacherSubject', backref='subject', cascade="all, delete")
    grades = db.relationship('Grade', backref='subject', cascade="all, delete")

# ================================
# === TEACHER-SUBJECT-CLASS LINK
# ================================
class TeacherSubject(db.Model):
    __tablename__ = 'teacher_subjects'
    id = db.Column(db.Integer, primary_key=True)
    teacher_id = db.Column(db.Integer, db.ForeignKey('staff.staff_id'), nullable=False)
    subject_id = db.Column(db.Integer, db.ForeignKey('subjects.subject_id'), nullable=False)
    class_id = db.Column(db.Integer, db.ForeignKey('classrooms.class_id'), nullable=False)

    __table_args__ = (
        db.UniqueConstraint('teacher_id', 'subject_id', 'class_id'),
    )

# =====================
# ===== GRADES =========
# =====================
class Grade(db.Model):
    __tablename__ = 'grades'
    grade_id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('students.student_id'), nullable=False)
    class_id = db.Column(db.Integer, db.ForeignKey('classrooms.class_id'), nullable=False)
    subject_id = db.Column(db.Integer, db.ForeignKey('subjects.subject_id'), nullable=False)
    teacher_id = db.Column(db.Integer, db.ForeignKey('staff.staff_id'), nullable=False)
    term = db.Column(db.String(10))
    year = db.Column(db.Integer)
    score = db.Column(db.Float)

# =====================
# ==== TIMETABLE ======
# =====================
class TimetableEntry(db.Model):
    __tablename__ = 'timetable_entries'
    id = db.Column(db.Integer, primary_key=True)
    class_id = db.Column(db.Integer, db.ForeignKey('classrooms.class_id'), nullable=False)
    subject_id = db.Column(db.Integer, db.ForeignKey('subjects.subject_id'), nullable=False)
    day = db.Column(db.String(10), nullable=False)  # Monday - Friday
    start_time = db.Column(db.Time, nullable=False)
    end_time = db.Column(db.Time, nullable=False)
    teacher_id = db.Column(db.Integer, db.ForeignKey('staff.staff_id'), nullable=True)

    subject = db.relationship('Subject')
    teacher = db.relationship('Staff')

# =====================
# ==== MESSAGES =======
# =====================
class Message(db.Model):
    __tablename__ = 'messages'
    id = db.Column(db.Integer, primary_key=True)
    sender_id = db.Column(db.Integer, db.ForeignKey('users.user_id'))
    receiver_id = db.Column(db.Integer, db.ForeignKey('users.user_id'))
    content = db.Column(db.Text)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    read = db.Column(db.Boolean, default=False)

# ==========================
# ==== ANNOUNCEMENTS =======
# ==========================
class Announcement(db.Model):
    __tablename__ = 'announcements'
    announcement_id = db.Column(db.Integer, primary_key=True)
    posted_by = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text, nullable=False)
    target_audience = db.Column(db.String(20))  # students, parents, staff, all
    posted_at = db.Column(db.DateTime, server_default=db.func.now())
