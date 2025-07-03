# type: ignore
from flask import Blueprint
from .auth import auth_bp
from .users import user_bp
from .students import student_bp

def init_routes(app):
    app.register_blueprint(auth_bp, url_prefix='/api/v1/auth')
    app.register_blueprint(user_bp, url_prefix="/api/v1/users")
    app.register_blueprint(student_bp, url_prefix="/api/v1/students")
