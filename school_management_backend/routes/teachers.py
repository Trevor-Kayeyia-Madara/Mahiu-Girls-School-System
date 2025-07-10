from flask import Blueprint, request, jsonify
from models import db, Teacher, User
from utils.auth_utils import token_required

teacher_bp = Blueprint('teachers', __name__)

# GET all teachers
@teacher_bp.route('/', methods=['GET'])
@token_required
def list_teachers(current_user):
    if current_user.role != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403

    teachers = Teacher.query.all()
    return jsonify([{
        'teacher_id': t.teacher_id,
        'name': t.user.name,
        'email': t.user.email,
        'employee_number': t.employee_number,
        'gender': t.gender,
        'contact': t.contact,
        'qualifications': t.qualifications
    } for t in teachers]), 200


# POST /api/v1/teachers
@teacher_bp.route('/', methods=['POST'])
@token_required
def create_teacher(current_user):
    if current_user.role != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403

    data = request.get_json()
    user = User(
        name=data['name'],
        email=data['email'],
        password=data['password'],  # Hash before saving in production
        role='teacher'
    )
    db.session.add(user)
    db.session.flush()

    teacher = Teacher(
        user_id=user.user_id,
        employee_number=data['employee_number'],
        gender=data.get('gender'),
        date_of_birth=data.get('date_of_birth'),
        contact=data.get('contact'),
        qualifications=data.get('qualifications')
    )
    db.session.add(teacher)
    db.session.commit()
    return jsonify({'message': 'Teacher created successfully'}), 201

@teacher_bp.route('/<int:teacher_id>', methods=['GET'])
@token_required
def get_teacher(current_user, teacher_id):
    if current_user.role != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403

    teacher = Teacher.query.get_or_404(teacher_id)
    return jsonify({
        'teacher_id': teacher.teacher_id,
        'name': teacher.user.name,
        'email': teacher.user.email,
        'employee_number': teacher.employee_number,
        'gender': teacher.gender,
        'contact': teacher.contact,
        'qualifications': teacher.qualifications
    }), 200

@teacher_bp.route('/<int:teacher_id>', methods=['PUT'])
@token_required
def update_teacher(current_user, teacher_id):
    if current_user.role != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403

    teacher = Teacher.query.get_or_404(teacher_id)
    data = request.get_json()

    # Update user info
    if 'name' in data:
        teacher.user.name = data['name']
    if 'email' in data:
        teacher.user.email = data['email']

    # Update teacher profile
    teacher.employee_number = data.get('employee_number', teacher.employee_number)
    teacher.gender = data.get('gender', teacher.gender)
    teacher.contact = data.get('contact', teacher.contact)
    teacher.qualifications = data.get('qualifications', teacher.qualifications)

    db.session.commit()
    return jsonify({'message': 'Teacher updated successfully'}), 200

@teacher_bp.route('/<int:teacher_id>', methods=['DELETE'])
@token_required
def delete_teacher(current_user, teacher_id):
    if current_user.role != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403

    teacher = Teacher.query.get_or_404(teacher_id)
    user = teacher.user

    db.session.delete(teacher)
    db.session.delete(user)
    db.session.commit()

    return jsonify({'message': 'Teacher and associated user deleted'}), 200
