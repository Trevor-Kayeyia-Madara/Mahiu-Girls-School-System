from flask import Blueprint, jsonify, request
from utils.auth_utils import token_required
from models import db, ExamSchedule, ClassAssignment, Exam, Classroom, Subject, Student

exam_schedules_bp = Blueprint('exam_schedules', __name__)

# ✅ GET all exam schedules, filtered for teacher if needed
@exam_schedules_bp.route('/', methods=['GET'])
@token_required
def get_exam_schedules(current_user):
    if current_user.role == 'teacher':
        teacher_id = current_user.teacher.teacher_id
        schedules = ExamSchedule.query.join(ClassAssignment).filter(ClassAssignment.teacher_id == teacher_id).all()
    else:
        schedules = ExamSchedule.query.all()

    result = []
    for sched in schedules:
        assignment = sched.class_assignment
        classroom = getattr(assignment, 'classroom', None)
        subject = getattr(assignment, 'subject', None)
        exam = sched.exam

        # Skip invalid or incomplete relationships
        if not classroom or not subject:
            continue

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
                "id": assignment.id,
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


# ✅ Create a new schedule
@exam_schedules_bp.route('/', methods=['POST'])
@token_required
def create_exam_schedule(current_user):
    data = request.get_json()
    exam_id = data.get('exam_id')
    class_assignment_id = data.get('class_assignment_id')

    if not exam_id or not class_assignment_id:
        return jsonify({"error": "Both exam_id and class_assignment_id are required."}), 400

    existing = ExamSchedule.query.filter_by(
        exam_id=exam_id,
        class_assignment_id=class_assignment_id
    ).first()
    if existing:
        return jsonify({"error": "This exam schedule already exists."}), 409

    new_schedule = ExamSchedule(
        exam_id=exam_id,
        class_assignment_id=class_assignment_id
    )
    db.session.add(new_schedule)
    db.session.commit()

    return jsonify({"message": "Exam schedule created successfully."}), 201

# ✅ Edit an existing schedule
@exam_schedules_bp.route('/<int:schedule_id>', methods=['PUT'])
@token_required
def update_exam_schedule(current_user, schedule_id):
    schedule = ExamSchedule.query.get(schedule_id)
    if not schedule:
        return jsonify({"error": "Exam schedule not found."}), 404

    if current_user.role != 'admin':
        return jsonify({"error": "Unauthorized"}), 403

    data = request.get_json()
    exam_id = data.get('exam_id')
    class_assignment_id = data.get('class_assignment_id')

    if not exam_id or not class_assignment_id:
        return jsonify({"error": "Both exam_id and class_assignment_id are required."}), 400

    # Check if this new combination already exists (but not this current one)
    conflict = ExamSchedule.query.filter(
        ExamSchedule.exam_id == exam_id,
        ExamSchedule.class_assignment_id == class_assignment_id,
        ExamSchedule.id != schedule_id
    ).first()
    if conflict:
        return jsonify({"error": "Another schedule with same exam and assignment already exists."}), 409

    schedule.exam_id = exam_id
    schedule.class_assignment_id = class_assignment_id
    db.session.commit()

    return jsonify({"message": "Exam schedule updated successfully."}), 200

# ❌ Delete a schedule
@exam_schedules_bp.route('/<int:schedule_id>', methods=['DELETE'])
@token_required
def delete_exam_schedule(current_user, schedule_id):
    if current_user.role != 'admin':
        return jsonify({"error": "Unauthorized"}), 403

    schedule = ExamSchedule.query.get(schedule_id)
    if not schedule:
        return jsonify({"error": "Exam schedule not found."}), 404

    db.session.delete(schedule)
    db.session.commit()
    return jsonify({"message": "Exam schedule deleted."}), 200