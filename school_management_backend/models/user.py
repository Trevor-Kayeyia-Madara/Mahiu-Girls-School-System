from app import db

# models/user.py
class User(db.Model):
    __tablename__ = 'users'
    
    user_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), nullable=False)  # 'admin', 'teacher', 'parent'

    teacher = db.relationship('Teacher', back_populates='user', uselist=False)
    parent = db.relationship('Parent', back_populates='user', uselist=False)
