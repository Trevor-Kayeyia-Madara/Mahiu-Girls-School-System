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
        student = g.student
        exam_schedule = g.exam_schedule  # ✅ FIXED HERE
        class_assignment = exam_schedule.class_assignment if exam_schedule else None 
        subject = class_assignment.subject if class_assignment else None
        classroom = class_assignment.classroom if class_assignment else None
        exam = exam_schedule.exam if exam_schedule else None
        teacher = class_assignment.teacher if class_assignment else None

        result.append({
            'grade_id': g.grade_id,
            'student_name': f"{student.first_name} {student.last_name}",
            'admission_number': student.admission_number,
            'subject': subject.name if subject else '',
            'score': g.marks,
            'exam_name': exam.name if exam else '',
            'term': exam.term if exam else '',
            'year': exam.year if exam else '',
           'teacher_name': f"{teacher.user.name}" if teacher and teacher.user else ''
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

    # Ensure subject_id exists from class assignment
    class_assignment = exam_schedule.class_assignment
    if not class_assignment or not class_assignment.subject_id:
        return jsonify({"error": "Related subject not found in class assignment."}), 500

    subject_id = class_assignment.subject_id
    valid_student_ids = [s.student_id for s in class_assignment.classroom.students]

    responses = []

    for entry in entries:
        student_id = entry.get('student_id')
        marks = entry.get('marks')

        if student_id is None or marks is None or student_id not in valid_student_ids:
            continue

        existing_grade = Grade.query.filter_by(
            student_id=student_id,
            exam_schedule_id=exam_schedule_id
        ).first()

        if existing_grade:
            existing_grade.marks = marks
            existing_grade.subject_id = subject_id  # Ensure update in case subject was added later
            status = "updated"
        else:
            new_grade = Grade(
                student_id=student_id,
                exam_schedule_id=exam_schedule_id,
                subject_id=subject_id,
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
