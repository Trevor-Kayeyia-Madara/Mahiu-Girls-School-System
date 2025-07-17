from flask import Blueprint, jsonify
from utils.auth_utils import token_required
from models import db, ExamSchedule, ClassAssignment, Exam, Classroom, Subject, Student

exam_schedules_bp = Blueprint('exam_schedules', __name__, url_prefix='/api/v1')

@exam_schedules_bp.route('/', methods=['GET'])
@token_required
def get_exam_schedules(current_user):
    schedules = ExamSchedule.query.all()
    result = []

    for sched in schedules:
        assignment = sched.class_assignment
        classroom = assignment.classroom
        subject = assignment.subject
        exam = sched.exam

        # Get students in the same class
        students = Student.query.filter_by(class_id=classroom.class_id).all()

        result.append({
            "id": sched.id,
            "exam": {
                "exam_id": exam.exam_id,
                "name": exam.name,
                "term": exam.term,
                "year": exam.year,
            },
            "class_assignment": {
                "subject": {
                    "name": subject.name
                },
                "classroom": {
                    "class_name": classroom.class_name
                },
                "students": [
                    {
                        "student_id": student.student_id,
                        "first_name": student.first_name,
                        "last_name": student.last_name
                    } for student in students
                ]
            }
        })

    return jsonify(result), 200
