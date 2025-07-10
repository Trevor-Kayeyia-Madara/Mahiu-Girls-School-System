# routes/students.py
from flask import Blueprint, request, jsonify
from app import db
from models import Student, Classroom, Parent
from utils.auth_utils import token_required
from datetime import datetime

student_bp = Blueprint('students', __name__)

# 📄 Get all students
@student_bp.route('/', methods=['GET'])
@token_required
def get_all_students(current_user):
    if current_user.role not in ['admin', 'teacher']:
        return jsonify({'error': 'Unauthorized'}), 403

    students = Student.query.all()
    return jsonify([{
        'student_id': s.student_id,
        'first_name': s.first_name,
        'last_name': s.last_name,
        'admission_number': s.admission_number,
        'gender': s.gender,
        'date_of_birth': s.date_of_birth.isoformat() if s.date_of_birth else None,
        'class_id': s.class_id,
        'class_name': s.classroom.class_name if s.classroom else None,
        'parent_id': s.parent_id,
        'parent_name': s.parent.user.name if s.parent else None
    } for s in students]), 200

# 📄 Get one student
@student_bp.route('/<int:student_id>', methods=['GET'])
@token_required
def get_student(current_user, student_id):
    student = Student.query.get_or_404(student_id)

    return jsonify({
        'student_id': student.student_id,
        'first_name': student.first_name,
        'last_name': student.last_name,
        'admission_number': student.admission_number,
        'gender': student.gender,
        'date_of_birth': student.date_of_birth.isoformat() if student.date_of_birth else None,
        'class_id': student.class_id,
        'parent_id': student.parent_id,
        'parent_name': student.parent.user.name if student.parent else None
    }), 200

# 🆕 Create new student
@student_bp.route('/', methods=['POST'])
@token_required
def create_student(current_user):
    if current_user.role != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403

    data = request.get_json()
    try:
        student = Student(
            first_name=data['first_name'],
            last_name=data['last_name'],
            admission_number=data['admission_number'],
            gender=data['gender'],
            date_of_birth=datetime.strptime(data['date_of_birth'], '%Y-%m-%d'),
            class_id=data['class_id'],
            parent_id=data.get('parent_id')
        )
        db.session.add(student)
        db.session.commit()
        return jsonify({'message': 'Student created'}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

# ✏️ Update student
@student_bp.route('/<int:student_id>', methods=['PUT'])
@token_required
def update_student(current_user, student_id):
    if current_user.role != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403

    student = Student.query.get_or_404(student_id)
    data = request.get_json()

    student.first_name = data.get('first_name', student.first_name)
    student.last_name = data.get('last_name', student.last_name)
    student.admission_number = data.get('admission_number', student.admission_number)
    student.gender = data.get('gender', student.gender)
    student.date_of_birth = datetime.strptime(data['date_of_birth'], '%Y-%m-%d') if data.get('date_of_birth') else student.date_of_birth
    student.class_id = data.get('class_id', student.class_id)
    student.parent_id = data.get('parent_id', student.parent_id)

    db.session.commit()
    return jsonify({'message': 'Student updated'}), 200

# ❌ Delete student
@student_bp.route('/<int:student_id>', methods=['DELETE'])
@token_required
def delete_student(current_user, student_id):
    if current_user.role != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403

    student = Student.query.get_or_404(student_id)
    db.session.delete(student)
    db.session.commit()
    return jsonify({'message': 'Student deleted'}), 200
