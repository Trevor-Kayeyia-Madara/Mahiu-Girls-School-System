# type: ignore
import random
from datetime import date
from faker import Faker

from app import create_app, db
from models import User, Student, Staff, Subject, Classroom, TeacherSubject, Grade

app = create_app()
fake = Faker()

# === CONSTANTS ===
FORMS = ["Form 1", "Form 2", "Form 3", "Form 4"]
STREAMS = ["Yellow", "White", "Red", "Blue", "Purple", "Green"]
CORE_LANGUAGES = ["Mathematics", "English", "Kiswahili"]
COMPULSORY_SCIENCE = "Chemistry"
SCIENCES = ["Physics", "Biology"]
HUMANITIES = ["C.R.E", "History", "Geography"]
ELECTIVES = ["Computer Studies", "Agriculture", "Home Science", "French", "German", "Music", "Business Studies"]
ALL_SUBJECTS = CORE_LANGUAGES + [COMPULSORY_SCIENCE] + SCIENCES + HUMANITIES + ELECTIVES

def get_group(subject_name):
    if subject_name in CORE_LANGUAGES:
        return "language"
    if subject_name in SCIENCES or subject_name == COMPULSORY_SCIENCE:
        return "science"
    if subject_name in HUMANITIES:
        return "humanity"
    return "elective"

def assign_subjects(form_name):
    if form_name == "Form 1":
        return ALL_SUBJECTS.copy()
    else:
        subjects = CORE_LANGUAGES.copy()
        subjects.append(COMPULSORY_SCIENCE)
        subjects.append(random.choice(SCIENCES))
        subjects += random.sample(HUMANITIES, 2)
        subjects.append(random.choice(ELECTIVES))
        return subjects

with app.app_context():
    db.drop_all()
    db.create_all()

    # === SUBJECTS ===
    subject_objs = {}
    for sub in ALL_SUBJECTS:
        subject = Subject(name=sub, group=get_group(sub), compulsory=sub in CORE_LANGUAGES + [COMPULSORY_SCIENCE])
        db.session.add(subject)
        subject_objs[sub] = subject
    db.session.commit()

    # === CLASSROOMS & STAFF ===
    classrooms = []
    teacher_count = 1
    staff_list = []
    for form in FORMS:
        for stream in STREAMS:
            class_name = f"{form} {stream}"
            
            # Create class teacher
            user = User(
                name=fake.name(),
                email=fake.unique.email(),
                password="admin123",  # plain password
                role="teacher"
            )
            db.session.add(user)
            db.session.flush()

            staff = Staff(
                user_id=user.user_id,
                employee_id=f"T{teacher_count:03d}",
                gender=random.choice(["Male", "Female"]),
                date_of_birth=fake.date_of_birth(minimum_age=25, maximum_age=50),
                role="teacher",
                qualifications="B.Ed",
                contact=fake.phone_number()
            )
            db.session.add(staff)
            db.session.flush()
            staff_list.append(staff)

            classroom = Classroom(class_name=class_name, class_teacher_id=staff.staff_id)
            db.session.add(classroom)
            db.session.flush()
            classrooms.append((classroom, form))
            teacher_count += 1

    db.session.commit()

    # === TEACHER-SUBJECT-CLASS ASSIGNMENTS ===
    teacher_subject_map = {}
    for (classroom, form) in classrooms:
        teacher_subject_map[classroom.class_id] = {}
        for sub in ALL_SUBJECTS:
            user = User(
                name=fake.name(),
                email=fake.unique.email(),
                password="teacher123",  # plain password
                role="teacher"
            )
            db.session.add(user)
            db.session.flush()

            staff = Staff(
                user_id=user.user_id,
                employee_id=f"T{teacher_count:03d}",
                gender=random.choice(["Male", "Female"]),
                date_of_birth=fake.date_of_birth(minimum_age=25, maximum_age=50),
                role="teacher",
                qualifications="B.Ed",
                contact=fake.phone_number()
            )
            db.session.add(staff)
            db.session.flush()

            ts = TeacherSubject(
                teacher_id=staff.staff_id,
                subject_id=subject_objs[sub].subject_id,
                class_id=classroom.class_id
            )
            db.session.add(ts)
            teacher_subject_map[classroom.class_id][sub] = staff
            teacher_count += 1
    db.session.commit()

    # === STUDENTS, USERS, GRADES ===
    student_count = 1
    grade_count = 1
    for (classroom, form) in classrooms:
        for _ in range(10):  # 10 students per class
            user = User(
                name=fake.name(),
                email=fake.unique.email(),
                password="student123",  # plain password
                role="student"
            )
            db.session.add(user)
            db.session.flush()

            student = Student(
                user_id=user.user_id,
                admission_number=f"S{student_count:04d}",
                gender=random.choice(["Male", "Female"]),
                date_of_birth=fake.date_of_birth(minimum_age=14, maximum_age=18),
                guardian_name=fake.name(),
                guardian_phone=fake.phone_number(),
                address=fake.address(),
                class_id=classroom.class_id
            )
            db.session.add(student)
            db.session.flush()

            subjects = assign_subjects(form)
            for sub in subjects:
                teacher = teacher_subject_map[classroom.class_id][sub]
                grade = Grade(
                    student_id=student.student_id,
                    class_id=classroom.class_id,
                    subject_id=subject_objs[sub].subject_id,
                    teacher_id=teacher.staff_id,
                    term="Term 1",
                    year=2024,
                    score=round(random.uniform(45, 95), 1)
                )
                db.session.add(grade)
                grade_count += 1

            student_count += 1

    db.session.commit()
    print("✅ Database seeded successfully with plain passwords.")
