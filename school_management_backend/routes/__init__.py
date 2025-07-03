# type: ignore
from flask import Blueprint
from .auth import auth_bp
from .users import user_bp
from .students import student_bp
from .staff import staff_bp
from .subjects import subject_bp
from .grades import grade_bp
from .classrooms import class_bp
from .assignments import assignment_bp

def init_routes(app):
    app.register_blueprint(auth_bp, url_prefix='/api/v1/auth')
    app.register_blueprint(user_bp, url_prefix="/api/v1/users")
    app.register_blueprint(student_bp, url_prefix="/api/v1/students")
    app.register_blueprint(staff_bp, url_prefix='/api/v1/staff')
    app.register_blueprint(subject_bp, url_prefix='/api/v1/subjects')
    app.register_blueprint(grade_bp, url_prefix='/api/v1/grades')
    app.register_blueprint(class_bp, url_prefix='/api/v1/classrooms')
    app.register_blueprint(assignment_bp,url_prefix='/api/v1/assignments')