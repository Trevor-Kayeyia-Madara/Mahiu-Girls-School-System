from flask import Blueprint, request, jsonify
from models import db, Teacher, User
from werkzeug.security import generate_password_hash
from utils.auth_utils import token_required
from utils.helpers import generate_employee_number, generate_random_password
from sqlalchemy import or_, func

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
        'date_of_birth': t.date_of_birth,
        'qualifications': t.qualifications
    } for t in teachers]), 200


# POST /api/v1/teachers

@teacher_bp.route('/', methods=['POST'])
@token_required
def create_teacher(current_user):
    if current_user.role != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403

    data = request.json
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')  # Required
    gender = data.get('gender', '')
    contact = data.get('contact', '')
    date_of_birth = data.get('date_of_birth', '')
    qualifications = data.get('qualifications', '')

    if not all([name, email, password]):
        return jsonify({'error': 'Name, email, and password are required'}), 400

    existing_user = User.query.filter_by(email=email).first()
    if existing_user:
        return jsonify({'error': 'User with this email already exists'}), 400

    # Create the user
    new_user = User(
        name=name,
        email=email,
        password=generate_password_hash(password),
        role='teacher'
    )
    db.session.add(new_user)
    db.session.flush()  # Allows access to new_user.user_id before commit

    # Create the teacher record
    new_teacher = Teacher(
        user_id=new_user.user_id,
        employee_number=generate_employee_number(),
        gender=gender,
        contact=contact,
        date_of_birth=date_of_birth,
        qualifications=qualifications
    )
    db.session.add(new_teacher)
    db.session.commit()

    return jsonify({
        'message': 'Teacher created successfully',
        'teacher_id': new_teacher.teacher_id,
        'employee_number': new_teacher.employee_number
    }), 201

#GET one Teacher
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
        'date_of_birth': teacher.date_of_birth,
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

# Delete Teacher

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

#Search for a teacher
from sqlalchemy import or_, func

@teacher_bp.route('/search', methods=['GET'])
@token_required
def search_teachers(current_user):
    if current_user.role != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403

    query_param = request.args.get('q', '').strip().lower()
    if not query_param:
        return jsonify([]), 200

    search = f"%{query_param}%"

    results = (
        Teacher.query.join(User)
        .filter(
            or_(
                func.lower(User.name).like(search),
                func.lower(User.email).like(search),
                func.lower(Teacher.employee_number).like(search)
            )
        )
        .all()
    )

    return jsonify([{
        'teacher_id': t.teacher_id,
        'name': t.user.name,
        'email': t.user.email,
        'employee_number': t.employee_number,
        'gender': t.gender,
        'contact': t.contact,
        'qualifications': t.qualifications
    } for t in results]), 200

