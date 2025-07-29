from app import db

class StudentSelection(db.Model):
        __tablename__ = 'student_selections'
        selection_id = db.Column(db.Integer, primary_key=True)
        student_id = db.Column(db.Integer, db.ForeignKey('students.student_id'), nullable=False)
        subject_id = db.Column(db.Integer, db.ForeignKey('subjects.subject_id'), nullable=False)
        
        
         # Relationships with unique backrefs
        student = db.relationship('Student', backref='subject_selections')
        subject = db.relationship('Subject', backref='student_selections')