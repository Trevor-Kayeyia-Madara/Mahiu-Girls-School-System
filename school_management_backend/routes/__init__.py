from .auth import auth_bp
from .users import user_bp
from .teachers import teacher_bp
from .parents import parent_bp
from .students import student_bp
from .classrooms import class_bp, class_teacher_bp
from .class_assignment import assignment_bp
from .grades import grade_bp
from .exams import exam_bp
from .reports import report_bp
from .announcements import announcement_bp
from .messages import message_bp
from .timetable import timetable_bp
from .subjects import subject_bp
from .teacher_subject import teacher_subject_bp
from .exam_schedules import exam_schedules_bp
from .teacher_reports import teacher_report_bp

def init_routes(app):
   app.register_blueprint(auth_bp,url_prefix='/api/v1/auth')
   app.register_blueprint(user_bp, url_prefix="/api/v1/users")
   app.register_blueprint(teacher_bp,url_prefix='/api/v1/teachers')
   app.register_blueprint(parent_bp,url_prefix='/api/v1/parents')
   app.register_blueprint(student_bp,url_prefix='/api/v1/students')
   app.register_blueprint(class_bp, url_prefix='/api/v1/classrooms')
   app.register_blueprint(assignment_bp, url_prefix='/api/v1/assignments')
   app.register_blueprint(class_teacher_bp, url_prefix='/api/v1/classrooms')
   app.register_blueprint(grade_bp, url_prefix='/api/v1/grades')
   app.register_blueprint(exam_bp, url_prefix='/api/v1/exams')
   app.register_blueprint(report_bp,url_prefix='/api/v1/reports')
   app.register_blueprint(announcement_bp,url_prefix='/api/v1/announcements')
   app.register_blueprint(message_bp,url_prefix='/api/v1/messages')
   app.register_blueprint(timetable_bp, url_prefix='/api/v1/timetable')
   app.register_blueprint(subject_bp, url_prefix='/api/v1/subjects')
   app.register_blueprint(teacher_subject_bp, url_prefix='/api/v1/teacher-subjects')
   app.register_blueprint(exam_schedules_bp, url_prefix='/api/v1/exam-schedules')
   app.register_blueprint(teacher_report_bp, url_prefix='/api/v1/teacher-reports')