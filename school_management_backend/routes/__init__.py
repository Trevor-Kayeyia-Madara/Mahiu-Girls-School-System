# type: ignore
from flask import Blueprint

def init_routes(app):
    from .auth import auth_bp
    app.register_blueprint(auth_bp, url_prefix='/api/v1/auth')
