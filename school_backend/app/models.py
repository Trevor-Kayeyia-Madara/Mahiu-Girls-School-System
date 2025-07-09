# models.py

#type: ignore

from datetime import datetime
from school_backend.app import db # Assumes 'db' is initialized in your 'app/__init__.py' or 'app/app.py'

# =====================
# === AUTH USERS ======
# =====================
class User(db.Model):
    __tablename__ = 'users'
    user_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False) # Store hashed passwords
    role = db.Column(db.String(20), nullable=False)  # admin, teacher, parent

    # Link to Staff or Parent profile based on role
    # 'uselist=False' means a User can have at most one Staff or Parent profile
    staff = db.relationship('Staff', backref='user', uselist=False, cascade="all, delete-orphan")
    parent = db.relationship('Parent', backref='user', uselist=False, cascade="all, delete-orphan")

    # Relationships for unified messaging and announcements via the User account
    sent_messages = db.relationship('Message', foreign_keys='Message.sender_id', backref='sender', lazy=True)
    received_messages = db.relationship('Message', foreign_keys='Message.receiver_id', backref='receiver', lazy=True)
    announcements_posted = db.relationship('Announcement', backref='posted_by_user', lazy=True)

# =====================
# === STAFF & TEACHERS
# (This model serves as both Admin and Teacher profiles)
# =====================
class Staff(db.Model):
    __tablename__ = 'staff'
    staff_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False, unique=True)
    employee_id = db.Column(db.String(50), unique=True, nullable=False)
    gender = db.Column(db.String(10))
    date_of_birth = db.Column(db.Date) # Using db.Date for just date
    role = db.Column(db.String(20))  # teacher, admin (redundant with user.role but useful for direct query)
    contact = db.Column(db.String(100))
    qualifications = db.Column(db.String(200))

    # Relationships for a Teacher's Dashboard:
    # 1. Subjects taught in specific classes
    teacher_subjects = db.relationship('TeacherSubject', backref='teacher', cascade="all, delete-orphan", lazy=True)
    # 2. Grades entered by this teacher
    grades_given = db.relationship('Grade', backref='teacher', cascade="all, delete-orphan", lazy=True)
    # 3. Classes where this staff member is the designated class teacher
    classes_led = db.relationship('Classroom', foreign_keys='Classroom.class_teacher_id', backref='class_teacher', lazy=True)
    # Note: Messages are linked via the User model (User.sent_messages, User.received_messages)

# =====================
# ====== PARENTS ======
# =====================
class Parent(db.Model):
    __tablename__ = 'parents'
    parent_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False, unique=True)
    phone = db.Column(db.String(20))
    address = db.Column(db.String(200))

    # A parent can have multiple children (students)
    children = db.relationship('Student', backref='parent', cascade="all, delete-orphan", lazy=True)

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
    date_of_birth = db.Column(db.Date) # Using db.Date for just date
    class_id = db.Column(db.Integer, db.ForeignKey('classrooms.class_id'), nullable=True) # Can be null if not yet assigned
    parent_id = db.Column(db.Integer, db.ForeignKey('parents.parent_id'), nullable=False)

    # A student has many grades
    grades = db.relationship('Grade', backref='student', cascade="all, delete-orphan", lazy=True)

# =====================
# ==== CLASSROOMS =====
# =====================
class Classroom(db.Model):
    __tablename__ = 'classrooms'
    class_id = db.Column(db.Integer, primary_key=True)
    class_name = db.Column(db.String(100), unique=True, nullable=False)
    # Class Teacher Allocation: Links a classroom to a specific staff member (teacher)
    class_teacher_id = db.Column(db.Integer, db.ForeignKey('staff.staff_id'), nullable=True) # Can be null initially

    # Relationships for students, subjects taught in this class, and timetable
    students = db.relationship('Student', backref='classroom', lazy=True)
    subject_assignments = db.relationship('TeacherSubject', backref='classroom', cascade="all, delete-orphan", lazy=True)
    timetable_entries = db.relationship('TimetableEntry', backref='classroom', cascade="all, delete-orphan", lazy=True)
    grades = db.relationship('Grade', backref='classroom', lazy=True) # Grades associated with this class

# =====================
# ===== SUBJECTS ======
# =====================
class Subject(db.Model):
    __tablename__ = 'subjects'
    subject_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    group = db.Column(db.String(20), nullable=False)  # language, science, humanity, elective
    compulsory = db.Column(db.Boolean, default=False)

    # Relationships to link subjects to teachers and grades
    teacher_subjects = db.relationship('TeacherSubject', backref='subject', cascade="all, delete-orphan", lazy=True)
    grades = db.relationship('Grade', backref='subject', lazy=True)

# ================================
# === TEACHER-SUBJECT-CLASS LINK
# (This handles Subject Teacher Allocation: which teacher teaches which subject in which class)
# ================================
class TeacherSubject(db.Model):
    __tablename__ = 'teacher_subjects'
    id = db.Column(db.Integer, primary_key=True) # Primary key for individual record
    teacher_id = db.Column(db.Integer, db.ForeignKey('staff.staff_id'), nullable=False)
    subject_id = db.Column(db.Integer, db.ForeignKey('subjects.subject_id'), nullable=False)
    class_id = db.Column(db.Integer, db.ForeignKey('classrooms.class_id'), nullable=False)

    # Ensures a teacher teaches a specific subject in a specific class only once
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
    teacher_id = db.Column(db.Integer, db.ForeignKey('staff.staff_id'), nullable=False) # Teacher who entered the grade
    term = db.Column(db.String(10))
    year = db.Column(db.Integer)
    score = db.Column(db.Float) # Using Float for scores that might not be whole numbers

# =====================
# ==== TIMETABLE ======
# =====================
class TimetableEntry(db.Model):
    __tablename__ = 'timetable_entries'
    id = db.Column(db.Integer, primary_key=True)
    class_id = db.Column(db.Integer, db.ForeignKey('classrooms.class_id'), nullable=False)
    subject_id = db.Column(db.Integer, db.ForeignKey('subjects.subject_id'), nullable=False)
    day = db.Column(db.String(10), nullable=False)  # Monday - Friday
    start_time = db.Column(db.Time, nullable=False) # Using db.Time for time only
    end_time = db.Column(db.Time, nullable=False)   # Using db.Time for time only
    teacher_id = db.Column(db.Integer, db.ForeignKey('staff.staff_id'), nullable=True) # Teacher assigned to this slot

    # Relationships for easier access to related subject and teacher details
    subject = db.relationship('Subject', lazy=True)
    teacher = db.relationship('Staff', lazy=True)

# =====================
# ==== MESSAGES =======
# =====================
class Message(db.Model):
    __tablename__ = 'messages'
    id = db.Column(db.Integer, primary_key=True)
    sender_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False) # Messages linked to User accounts
    receiver_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)
    content = db.Column(db.Text)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    read = db.Column(db.Boolean, default=False)

# ==========================
# ==== ANNOUNCEMENTS =======
# ==========================
class Announcement(db.Model):
    __tablename__ = 'announcements'
    announcement_id = db.Column(db.Integer, primary_key=True)
    posted_by = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False) # Announcements linked to User accounts
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text, nullable=False)
    target_audience = db.Column(db.String(20))  # students, parents, staff, all
    posted_at = db.Column(db.DateTime, server_default=db.func.now()) # Use server_default for DB-managed timestamp