from . import app
from routes.auth import auth_bp

app.register_blueprint(auth_bp, url_prefix="/api/v1/auth")
