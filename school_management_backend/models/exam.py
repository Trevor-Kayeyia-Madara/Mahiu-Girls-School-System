# models/exam.py
from app import db
from datetime import datetime

class Exam(db.Model):
    __tablename__ = 'exams'

    exam_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)  # e.g., CAT 1, CAT 2, Main Exam
    term = db.Column(db.String(10), nullable=False)   # e.g., Term 1, Term 2
    year = db.Column(db.Integer, nullable=False)

    subject_id = db.Column(db.Integer, db.ForeignKey('subjects.subject_id'), nullable=False)
    class_id = db.Column(db.Integer, db.ForeignKey('classrooms.class_id'), nullable=False)

    # NEW: Add a foreign key to the teachers table
    # Set nullable=True if an exam can exist without a direct teacher assigned,
    # or nullable=False if every exam MUST have a teacher associated with it.
    # I'm setting it to True for flexibility, you can change if your logic requires.
    teacher_id = db.Column(db.Integer, db.ForeignKey('teachers.teacher_id'), nullable=True)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    grades = db.relationship('Grade', backref='exam', cascade='all, delete-orphan')

    # Optional: Add relationships for easier querying
    subject = db.relationship('Subject', backref='exams')
    classroom = db.relationship('Classroom', backref='exams')
    # Relationship to the Teacher who set/is responsible for this exam
    teacher = db.relationship('Teacher', backref='exams_created', foreign_keys=[teacher_id])

    def __repr__(self):
        return f"<Exam {self.name} for {self.subject.name if self.subject else 'N/A'} in {self.classroom.class_name if self.classroom else 'N/A'}>"