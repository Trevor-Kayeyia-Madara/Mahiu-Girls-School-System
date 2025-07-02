#type: ignore

import random
from datetime import date
from itertools import cycle
from faker import Faker

fake = Faker()

# Define constants
FORMS = ["Form 1", "Form 2", "Form 3", "Form 4"]
STREAMS = ["Yellow", "White", "Red", "Blue", "Purple", "Green"]
CORE_LANGUAGES = ["Mathematics", "English", "Kiswahili"]
COMPULSORY_SCIENCE = "Chemistry"
SCIENCES = ["Physics", "Biology"]
HUMANITIES = ["C.R.E", "History", "Geography"]
ELECTIVES = ["Computer Studies", "Agriculture", "Home Science", "French", "German", "Music", "Business Studies"]
ALL_SUBJECTS = CORE_LANGUAGES + [COMPULSORY_SCIENCE] + SCIENCES + HUMANITIES + ELECTIVES

# Helper to assign subjects per form
def assign_subjects(form_name):
    if form_name == "Form 1":
        return ALL_SUBJECTS.copy()
    else:
        subjects = CORE_LANGUAGES.copy()
        subjects.append(COMPULSORY_SCIENCE)
        subjects.append(random.choice(SCIENCES))  # One more science
        subjects += random.sample(HUMANITIES, 2)
        subjects.append(random.choice(ELECTIVES))  # One elective
        return subjects

# Generate classrooms
classrooms = []
for form in FORMS:
    for stream in STREAMS:
        classrooms.append(f"{form} {stream}")

# Assign unique teachers per subject per classroom
teacher_id = 1
teacher_subject_map = {}
class_teacher_ids = {}
for classroom in classrooms:
    teacher_subject_map[classroom] = {}
    for subject in ALL_SUBJECTS:
        teacher_subject_map[classroom][subject] = f"T{teacher_id:03d}"
        teacher_id += 1
    class_teacher_ids[classroom] = f"T{teacher_id:03d}"  # Also assign class teacher
    teacher_id += 1

# Assign students and their subjects
students = []
grades = []
student_id = 1
grade_id = 1
for classroom in classrooms:
    form = classroom.split()[0]
    subjects = assign_subjects(form)
    student = {
        "student_id": f"S{student_id:03d}",
        "name": fake.name(),
        "classroom": classroom,
        "subjects": subjects
    }
    students.append(student)
    # Assign grades
    for subject in subjects:
        grade = {
            "grade_id": grade_id,
            "student_id": student["student_id"],
            "classroom": classroom,
            "subject": subject,
            "teacher_id": teacher_subject_map[classroom][subject],
            "score": round(random.uniform(40, 95), 1),
            "term": "Term 1",
            "year": 2024
        }
        grades.append(grade)
        grade_id += 1
    student_id += 1

# Summary of seeded data
summary = {
    "total_classrooms": len(classrooms),
    "total_teachers": teacher_id - 1,
    "total_students": len(students),
    "total_subjects": len(ALL_SUBJECTS),
    "total_grades": len(grades)
}

summary

