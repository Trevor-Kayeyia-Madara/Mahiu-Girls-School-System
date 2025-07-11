from datetime import datetime
import uuid
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


def generate_sequential_employee_number():
    # This is a simplified example. For production, consider proper locking/transaction
    # management if many concurrent requests are possible to avoid duplicates.
    # Or, use a dedicated sequence generator in your database.
    try:
        last_teacher = Teacher.query.order_by(Teacher.teacher_id.desc()).first()
        if last_teacher and last_teacher.employee_number and last_teacher.employee_number.startswith('EMP'):
            try:
                last_num = int(last_teacher.employee_number[3:]) # Assuming 'EMP' prefix
                new_num = last_num + 1
            except ValueError:
                new_num = 1 # Fallback if employee_number format is inconsistent
        else:
            new_num = 1
        return f"EMP{new_num:05d}" # e.g., EMP00001, EMP00002
    except Exception as e:
        print(f"Error generating sequential employee number: {e}")
        return f"EMP_ERR_{datetime.now().strftime('%Y%m%d%H%M%S')}" # Fallback

# Option 2: Using UUID (Universally Unique Identifier)
def generate_uuid_employee_number():
    return str(uuid.uuid4())[:10].upper() # A shorter, unique string

# Option 3: Date-based + sequence for the day
def generate_date_sequential_employee_number():
    today_str = datetime.now().strftime('%Y%m%d')
    # This would require querying for teachers created today and finding the max sequence
    # For simplicity, let's just make a generic unique string for this example
    return f"TCH-{today_str}-{str(uuid.uuid4())[:6]}"

# Choose one generation method:
EMPLOYEE_NUMBER_GENERATOR = generate_sequential_employee_number