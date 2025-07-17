from app import db
# app/models.py

class TeacherSubject(db.Model):
    __tablename__ = 'teacher_subjects'

    id = db.Column(db.Integer, primary_key=True)
    teacher_id = db.Column(db.Integer, db.ForeignKey('teachers.teacher_id'), nullable=False)
    subject_id = db.Column(db.Integer, db.ForeignKey('subjects.subject_id'), nullable=False)

    subject = db.relationship('Subject', backref='teacher_subjects')  # ✅ Add this line

    __table_args__ = (
        db.UniqueConstraint('teacher_id', 'subject_id', name='uq_teacher_subject'),
    )
