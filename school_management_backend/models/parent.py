from app import db

class Parent(db.Model):
    __tablename__ = 'parents'
    parent_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False, unique=True)
    phone = db.Column(db.String(20))
    occupation = db.Column(db.String(100))

    students = db.relationship('Student', backref='parent')
