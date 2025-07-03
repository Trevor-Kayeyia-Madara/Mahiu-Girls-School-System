from app import db

# === USER ACCOUNTS ===
class User(db.Model):
    __tablename__ = 'users'
    user_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    role = db.Column(db.String(20), nullable=False)  # 'admin', 'teacher', 'student', 'parent'

    student = db.relationship('Student', backref='user', uselist=False)
    staff = db.relationship('Staff', backref='user', uselist=False)
    announcements = db.relationship('Announcement', backref='poster')
# === STUDENT DATA ===
class Student(db.Model):
    __tablename__ = 'students'
    student_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False, unique=True)
    admission_number = db.Column(db.String(50), unique=True, nullable=False)
    gender = db.Column(db.String(10), nullable=False)
    date_of_birth = db.Column(db.Date)
    guardian_name = db.Column(db.String(100))
    guardian_phone = db.Column(db.String(20))
    address = db.Column(db.String(200))
    class_id = db.Column(db.Integer, db.ForeignKey('classrooms.class_id'))

    grades = db.relationship('Grade', backref='student', cascade="all, delete")

# === STAFF DATA ===
class Staff(db.Model):
    __tablename__ = 'staff'
    staff_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False, unique=True)
    employee_id = db.Column(db.String(50), unique=True, nullable=False)
    gender = db.Column(db.String(10))
    date_of_birth = db.Column(db.Date)
    role = db.Column(db.String(20))  # 'teacher', 'admin'
    qualifications = db.Column(db.String(200))
    contact = db.Column(db.String(100))

    classrooms = db.relationship('Classroom', backref='class_teacher')
    teacher_subjects = db.relationship('TeacherSubject', backref='teacher')
    grades_given = db.relationship('Grade', backref='teacher')

# === CLASSROOM ===
class Classroom(db.Model):
    __tablename__ = 'classrooms'
    class_id = db.Column(db.Integer, primary_key=True)
    class_name = db.Column(db.String(100), unique=True, nullable=False)
    class_teacher_id = db.Column(db.Integer, db.ForeignKey('staff.staff_id'))

    students = db.relationship('Student', backref='classroom', cascade="all, delete")
    teacher_subjects = db.relationship('TeacherSubject', backref='classroom')
    grades = db.relationship('Grade', backref='classroom')

# === SUBJECT ===
class Subject(db.Model):
    __tablename__ = 'subjects'
    subject_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)

    # KCSE subject categorization
    group = db.Column(db.String(20), nullable=False)  # 'language', 'science', 'humanity', 'elective'
    compulsory = db.Column(db.Boolean, default=False)  # e.g. Math, English, Kiswahili, Chemistry

    teacher_subjects = db.relationship('TeacherSubject', backref='subject')
    grades = db.relationship('Grade', backref='subject')

# === TEACHER-SUBJECT-CLASS LINK ===
class TeacherSubject(db.Model):
    __tablename__ = 'teacher_subjects'
    id = db.Column(db.Integer, primary_key=True)
    teacher_id = db.Column(db.Integer, db.ForeignKey('staff.staff_id'), nullable=False)
    subject_id = db.Column(db.Integer, db.ForeignKey('subjects.subject_id'), nullable=False)
    class_id = db.Column(db.Integer, db.ForeignKey('classrooms.class_id'), nullable=False)

    __table_args__ = (
        db.UniqueConstraint('teacher_id', 'subject_id', 'class_id'),
    )

# === GRADES ===
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

# === MESSAGES ===
class Message(db.Model):
    __tablename__ = 'messages'
    message_id = db.Column(db.Integer, primary_key=True)
    sender_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)
    recipient_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)
    message_text = db.Column(db.Text, nullable=False)
    sent_at = db.Column(db.DateTime, server_default=db.func.now())

# === ANNOUNCEMENTS ===
class Announcement(db.Model):
    __tablename__ = 'announcements'
    announcement_id = db.Column(db.Integer, primary_key=True)
    posted_by = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text, nullable=False)
    target_audience = db.Column(db.String(20))  # 'students', 'parents', 'staff', 'all'
    posted_at = db.Column(db.DateTime, server_default=db.func.now())
