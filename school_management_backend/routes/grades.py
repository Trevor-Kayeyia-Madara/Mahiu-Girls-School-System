# type: ignore
from flask import Blueprint, request, jsonify
from models import Grade, Student, Subject, Staff, Classroom
from app import db
from utils.auth_utils import token_required

grade_bp = Blueprint('grades', __name__)

# 🔍 GET grades for a specific student
@grade_bp.route('/student/<int:student_id>', methods=['GET'])
@token_required
def get_student_grades(current_user, student_id):
    student = Student.query.get_or_404(student_id)

    if current_user.role not in ['admin', 'teacher'] and current_user.user_id != student.user_id:
        return jsonify({'error': 'Access denied'}), 403

    grades = Grade.query.filter_by(student_id=student_id).all()
    return jsonify([{
        'grade_id': g.grade_id,
        'subject': g.subject.name,
        'class': g.classroom.class_name,
        'score': g.score,
        'term': g.term,
        'year': g.year,
        'teacher': g.teacher.user.name
    } for g in grades]), 200

# 🆕 POST: Add new grade
@grade_bp.route('/', methods=['POST'])
@token_required
def add_grade(current_user):
    if current_user.role != 'teacher':
        return jsonify({'error': 'Only teachers can add grades'}), 403

    data = request.get_json()

    grade = Grade(
        student_id=data['student_id'],
        class_id=data['class_id'],
        subject_id=data['subject_id'],
        teacher_id=current_user.staff.staff_id,
        term=data['term'],
        year=data['year'],
        score=float(data['score'])
    )
    db.session.add(grade)
    db.session.commit()
    return jsonify({'message': 'Grade added successfully'}), 201

# ✏️ PUT: Update existing grade
@grade_bp.route('/<int:grade_id>', methods=['PUT'])
@token_required
def update_grade(current_user, grade_id):
    grade = Grade.query.get_or_404(grade_id)

    if current_user.role != 'teacher' or current_user.staff.staff_id != grade.teacher_id:
        return jsonify({'error': 'Access denied'}), 403

    data = request.get_json()

    grade.score = float(data.get('score', grade.score))
    grade.term = data.get('term', grade.term)
    grade.year = data.get('year', grade.year)

    db.session.commit()
    return jsonify({'message': 'Grade updated successfully'}), 200

# ❌ DELETE grade
@grade_bp.route('/<int:grade_id>', methods=['DELETE'])
@token_required
def delete_grade(current_user, grade_id):
    grade = Grade.query.get_or_404(grade_id)

    if current_user.role != 'admin' and current_user.staff.staff_id != grade.teacher_id:
        return jsonify({'error': 'Only admin or grade owner can delete'}), 403

    db.session.delete(grade)
    db.session.commit()
    return jsonify({'message': 'Grade deleted successfully'}), 200

# ✅ GET students in class for a teacher's subject
@grade_bp.route('/class/<int:class_id>/subject/<int:subject_id>', methods=['GET'])
@token_required
def get_students_for_grading(current_user, class_id, subject_id):
    if current_user.role != 'teacher':
        return jsonify({'error': 'Unauthorized'}), 403

    from models import Student, TeacherSubject

    ts = TeacherSubject.query.filter_by(
        teacher_id=current_user.staff.staff_id,
        class_id=class_id,
        subject_id=subject_id
    ).first()

    if not ts:
        return jsonify({'error': 'Not assigned to this class/subject'}), 403

    students = Student.query.filter_by(class_id=class_id).all()
    return jsonify([
        {
            'student_id': s.student_id,
            'name': s.user.name,
            'admission_number': s.admission_number
        } for s in students
    ])


# ✅ POST grade entry
@grade_bp.route('/', methods=['POST'])
@token_required
def add_grade(current_user):
    if current_user.role != 'teacher':
        return jsonify({'error': 'Only teachers can add grades'}), 403

    data = request.get_json()
    grade = Grade(
        student_id=data['student_id'],
        class_id=data['class_id'],
        subject_id=data['subject_id'],
        teacher_id=current_user.staff.staff_id,
        term=data['term'],
        year=data['year'],
        score=data['score']
    )
    db.session.add(grade)
    db.session.commit()
    return jsonify({'message': 'Grade added'}), 201
