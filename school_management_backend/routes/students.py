# type: ignore
from flask import Blueprint, request, jsonify
from app import db
from models import Student, User, Classroom
from utils.auth_utils import token_required
from datetime import datetime

student_bp = Blueprint('students', __name__)

# 📄 GET all students
@student_bp.route('/', methods=['GET'])
@token_required
def get_all_students(current_user):
    if current_user.role not in ['admin', 'teacher']:
        return jsonify({'error': 'Access denied'}), 403

    students = Student.query.all()
    return jsonify([{
        'id': s.student_id,
        'first_name': s.first_name,
        'last_name': s.last_name,
        'admission_number': s.admission_number,
        'gender': s.gender,
        'dob': s.date_of_birth.isoformat() if s.date_of_birth else None,
        'guardian_name': s.guardian_name,
        'guardian_phone': s.guardian_phone,
        'address': s.address,
        'class_id': s.class_id
    } for s in students]), 200

# 📄 GET a student by ID
@student_bp.route('/<int:student_id>', methods=['GET'])
@token_required
def get_student(current_user, student_id):
    student = Student.query.get_or_404(student_id)

    # Only admin, teacher, or the student themself
    if current_user.role not in ['admin', 'teacher'] and current_user.user_id != student.user_id:
        return jsonify({'error': 'Access denied'}), 403

    return jsonify({
        'id': student.student_id,
        'first_name': student.first_name,  # Updated to include first_name
        'last_name': student.last_name,    # Updated to include last_name
        'admission_number': student.admission_number,
        'gender': student.gender,
        'dob': student.date_of_birth.isoformat() if student.date_of_birth else None,
        'guardian_name': student.guardian_name,
        'guardian_phone': student.guardian_phone,
        'address': student.address,
        'class_id': student.class_id
    }), 200

# 🆕 POST new student
@student_bp.route('/', methods=['POST'])
@token_required
def create_student(current_user):
    if current_user.role != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403

    data = request.get_json()

    student = Student(
        admission_number=data['admission_number'],
        first_name=data['first_name'],
        last_name=data['last_name'],
        gender=data['gender'],
       date_of_birth=datetime.strptime(data['date_of_birth'], '%Y-%m-%d').date(),
        guardian_name=data.get('guardian_name'),
        guardian_phone=data.get('guardian_phone'),
        address=data.get('address'),
        class_id=data['class_id']
    )
    db.session.add(student)
    db.session.commit()
    return jsonify({'message': 'Student created'}), 201


# ✏️ PUT update student
@student_bp.route('/<int:student_id>', methods=['PUT'])
@token_required
def update_student(current_user, student_id):
    student = Student.query.get_or_404(student_id)

    if current_user.role != 'admin':
        return jsonify({'error': 'Only admin can update students'}), 403

    data = request.get_json()
    student.admission_number = data.get('admission_number', student.admission_number)
    student.gender = data.get('gender', student.gender)
    student.date_of_birth = datetime.strptime(data['date_of_birth'], '%Y-%m-%d') if data.get('date_of_birth') else student.date_of_birth
    student.guardian_name = data.get('guardian_name', student.guardian_name)
    student.guardian_phone = data.get('guardian_phone', student.guardian_phone)
    student.address = data.get('address', student.address)
    student.class_id = data.get('class_id', student.class_id)
    student.first_name = data.get('first_name', student.first_name)  # Update first_name
    student.last_name = data.get('last_name', student.last_name)      # Update last_name

    db.session.commit()
    return jsonify({'message': 'Student updated successfully'}), 200

# ❌ DELETE student
@student_bp.route('/<int:student_id>', methods=['DELETE'])
@token_required
def delete_student(current_user, student_id):
    if current_user.role != 'admin':
        return jsonify({'error': 'Only admin can delete students'}), 403

    student = Student.query.get_or_404(student_id)
    db.session.delete(student)
    db.session.commit()
    return jsonify({'message': 'Student deleted successfully'}), 200
