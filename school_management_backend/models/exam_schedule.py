from app import db

class ExamSchedule(db.Model):
    __tablename__ = 'exam_schedules'

    id = db.Column(db.Integer, primary_key=True)

    exam_id = db.Column(db.Integer, db.ForeignKey('exams.exam_id'), nullable=False)
    class_assignment_id = db.Column(db.Integer, db.ForeignKey('class_assignments.id'), nullable=False)

    # Relationships
    exam = db.relationship('Exam', backref='schedules')
    class_assignment = db.relationship('ClassAssignment', backref='exam_schedules')

    __table_args__ = (
        db.UniqueConstraint('exam_id', 'class_assignment_id', name='uq_exam_assignment'),
    )

    def __repr__(self):
        class_name = self.class_assignment.classroom.class_name if self.class_assignment and self.class_assignment.classroom else 'N/A'
        subject_name = self.class_assignment.subject.name if self.class_assignment and self.class_assignment.subject else 'N/A'
        return f"<ExamSchedule Exam={self.exam.name}, Class={class_name}, Subject={subject_name}>"
