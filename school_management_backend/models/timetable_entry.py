from app import db

class TimetableEntry(db.Model):
    __tablename__ = 'timetable_entries'
    id = db.Column(db.Integer, primary_key=True)

    class_id = db.Column(db.Integer, db.ForeignKey('classrooms.class_id'), nullable=False)
    subject_id = db.Column(db.Integer, db.ForeignKey('subjects.subject_id'), nullable=False)
    teacher_id = db.Column(db.Integer, db.ForeignKey('teachers.teacher_id'), nullable=False)
    
    day = db.Column(db.String(10), nullable=False)  # e.g., Monday
    start_time = db.Column(db.Time, nullable=False)
    end_time = db.Column(db.Time, nullable=False)

    classroom = db.relationship('Classroom', backref='timetable')
    subject = db.relationship('Subject')
    teacher = db.relationship('Teachers')
