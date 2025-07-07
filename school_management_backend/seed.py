from app import create_app, db  # This assumes create_app() and db are in app/__init__.py
from models import Subject, Classroom

def seed_data():
    kcse_subjects = [
        ("English", "language", True),
        ("Kiswahili", "language", True),
        ("Mathematics", "science", True),
        ("Biology", "science", False),
        ("Chemistry", "science", True),
        ("Physics", "science", False),
        ("History", "humanity", False),
        ("Geography", "humanity", False),
        ("C.R.E", "humanity", False),
        ("Business Studies", "elective", False),
        ("Agriculture", "elective", False),
        ("Home Science", "elective", False),
        ("Computer Studies", "elective", False),
        ("Music", "elective", False),
    ]

    forms = ["Form 1", "Form 2", "Form 3", "Form 4"]
    streams = ["Blue", "Green", "Purple", "Red", "White", "Yellow"]

    # ✅ Seed Subjects
    for name, group, compulsory in kcse_subjects:
        if not Subject.query.filter_by(name=name).first():
            subject = Subject(name=name, group=group, compulsory=compulsory)
            db.session.add(subject)

    db.session.commit()
    print("✅ Subjects seeded.")

    # ✅ Seed Classrooms
    for form in forms:
        for stream in streams:
            class_name = f"{form} {stream}"
            if not Classroom.query.filter_by(class_name=class_name).first():
                classroom = Classroom(class_name=class_name)
                db.session.add(classroom)

    db.session.commit()
    print("✅ Classrooms seeded.")

if __name__ == "__main__":
    app = create_app()
    with app.app_context():
        seed_data()
