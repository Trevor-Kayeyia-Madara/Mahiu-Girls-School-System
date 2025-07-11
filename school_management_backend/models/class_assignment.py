from app import db

class ClassAssignment(db.Model):
    __tablename__ = 'class_assignments'
    id = db.Column(db.Integer, primary_key=True)
    class_id = db.Column(db.Integer, db.ForeignKey('classrooms.class_id'), nullable=False)
    subject_id = db.Column(db.Integer, db.ForeignKey('subjects.subject_id'), nullable=False)
    teacher_id = db.Column(db.Integer, db.ForeignKey('teachers.teacher_id'), nullable=False)

    classroom = db.relationship('Classroom', backref='subject_assignments')
    subject = db.relationship('Subject')
    teacher = db.relationship('Teacher', back_populates='subject_assignments', overlaps="assigned_teacher")


    assigned_teacher = db.relationship('Teacher', back_populates='subject_assignments')
    __table_args__ = (
        db.UniqueConstraint('class_id', 'subject_id', name='uq_class_subject'),
    )
