from .auth import auth_bp
from .teachers import teacher_bp
from .parents import parent_bp
from .students import student_bp
from .classrooms import class_bp, class_teacher_bp
from .class_assignment import assignment_bp
from .grades import grade_bp
from .exams import exam_bp

def init_routes(app):
   app.register_blueprint(auth_bp,url_prefix='/api/v1/auth')
   app.register_blueprint(teacher_bp,url_prefix='/api/v1/teachers')
   app.register_blueprint(parent_bp,url_prefix='/api/v1/parents')
   app.register_blueprint(student_bp,url_prefix='/api/v1/students')
   app.register_blueprint(class_bp, url_prefix='/api/v1/classrooms')
   app.register_blueprint(assignment_bp, url_prefix='/api/v1/assignments')
   app.register_blueprint(class_teacher_bp, url_prefix='/api/v1/classrooms')
   app.register_blueprint(grade_bp, url_prefix='/api/v1/grades')
   app.register_blueprint(exam_bp, url_prefix='/api/v1/exams')
