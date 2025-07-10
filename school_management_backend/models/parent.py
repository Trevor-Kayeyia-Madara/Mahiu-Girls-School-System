from app import db

class Parent(db.Model):
    __tablename__ = 'parents'

    parent_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False, unique=True)
    phone = db.Column(db.String(20))
    address = db.Column(db.String(200))

    children = db.relationship('Student', backref='parent')
