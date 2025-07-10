from .auth import auth_bp
from .teachers import teacher_bp
from .parents import parent_bp

def init_routes(app):
   app.register_blueprint(auth_bp,url_prefix='/api/v1/auth')
   app.register_blueprint(teacher_bp,url_prefix='/api/v1/teachers')
   app.register_blueprint(parent_bp,url_prefix='/api/v1/parents')
