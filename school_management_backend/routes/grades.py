from flask import Blueprint, request, jsonify
from sqlalchemy.exc import IntegrityError
from app import db
from models import Grade, Student, ExamSchedule
from utils.auth_utils import token_required
from utils.grade_utils import get_kcse_grade

grade_bp = Blueprint('grades', __name__)

# 1. Get all grades
@grade_bp.route('/', methods=['GET'])
@token_required
def get_all_grades(current_user):
    if current_user.role not in ['admin', 'teacher']:
        return jsonify({'error': 'Unauthorized'}), 403

    grades = Grade.query.all()
    result = []

    for g in grades:
        result.append({
            'grade_id': g.grade_id,
            'student_id': g.student_id,
            'exam_schedule_id': g.exam_schedule_id,
            'marks': g.marks
        })

    return jsonify(result), 200


# 2. Enter grades for an exam schedule
@grade_bp.route('/', methods=['POST'])
@token_required
def enter_grades(current_user):
    data = request.get_json()
    exam_schedule_id = data.get('exam_schedule_id')
    entries = data.get('grades')  # List of { student_id, marks }

    if not exam_schedule_id or not entries:
        return jsonify({"error": "Missing exam_schedule_id or grades"}), 400

    exam_schedule = ExamSchedule.query.get(exam_schedule_id)
    if not exam_schedule:
        return jsonify({"error": "ExamSchedule not found"}), 404

    responses = []

    # Optional: Validate students if classroom linkage exists
    if hasattr(exam_schedule, 'class_assignment') and hasattr(exam_schedule.class_assignment, 'classroom'):
        valid_student_ids = [s.student_id for s in exam_schedule.class_assignment.classroom.students]
    else:
        valid_student_ids = None

    for entry in entries:
        student_id = entry.get('student_id')
        marks = entry.get('marks')

        if student_id is None or marks is None:
            continue

        if valid_student_ids and student_id not in valid_student_ids:
            continue

        existing_grade = Grade.query.filter_by(student_id=student_id, exam_schedule_id=exam_schedule_id).first()

        if existing_grade:
            existing_grade.marks = marks
            status = "updated"
        else:
            new_grade = Grade(
                student_id=student_id,
                exam_schedule_id=exam_schedule_id,
                marks=marks
            )
            db.session.add(new_grade)
            status = "added"

        responses.append({"student_id": student_id, "status": status})

    try:
        db.session.commit()
        return jsonify({"message": "Grades saved successfully", "details": responses}), 201
    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "Database integrity error"}), 409
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


# 3. Get grades by student
@grade_bp.route('/student/<int:student_id>', methods=['GET'])
@token_required
def get_grades_by_student(current_user, student_id):
    if current_user.role not in ['admin', 'teacher']:
        return jsonify({'error': 'Unauthorized'}), 403

    grades = Grade.query.filter_by(student_id=student_id).all()
    result = []

    for g in grades:
        result.append({
            'grade_id': g.grade_id,
            'exam_schedule_id': g.exam_schedule_id,
            'marks': g.marks
        })

    return jsonify(result), 200


# 4. Delete a grade
@grade_bp.route('/<int:grade_id>', methods=['DELETE'])
@token_required
def delete_grade(current_user, grade_id):
    if current_user.role != 'admin':
        return jsonify({'error': 'Only admin can delete grades'}), 403

    grade = Grade.query.get_or_404(grade_id)
    db.session.delete(grade)
    db.session.commit()
    return jsonify({'message': 'Grade deleted'}), 200


# 5. Update a grade
@grade_bp.route('/<int:grade_id>', methods=['PUT'])
@token_required
def update_grade(current_user, grade_id):
    if current_user.role not in ['admin', 'teacher']:
        return jsonify({'error': 'Unauthorized'}), 403

    grade = Grade.query.get_or_404(grade_id)
    data = request.get_json()
    grade.marks = data.get('marks', grade.marks)

    db.session.commit()
    return jsonify({'message': 'Grade updated'}), 200
