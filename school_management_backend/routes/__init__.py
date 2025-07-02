# type: ignore
from flask import Blueprint
from .auth import auth_bp

def init_routes(app):
    app.register_blueprint(auth_bp, url_prefix='/api/v1/auth')
