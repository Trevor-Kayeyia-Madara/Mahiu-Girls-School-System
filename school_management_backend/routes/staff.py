# type: ignore
from flask import Blueprint, request, jsonify
from models import User, Staff
from app import db
from utils.auth_utils import token_required
from datetime import datetime
ts_bp = Blueprint('teacher_subjects', __name__)

import random
import string

def generate_employee_id():
    return 'EMP' + ''.join(random.choices(string.digits, k=6))


staff_bp = Blueprint('staff', __name__)

@staff_bp.route('/', methods=['GET'])
@token_required
def get_all_staff(current_user):
    if current_user.role != 'admin':
        return jsonify({'error': 'Access denied'}), 403

    staff_members = Staff.query.all()
    return jsonify([
        {
            'staff_id': s.staff_id,
            'user_id': s.user_id,
            'employee_id': s.employee_id,
            'gender': s.gender,
            'date_of_birth': s.date_of_birth.isoformat() if s.date_of_birth else None,
            'role': s.role,
            'qualifications': s.qualifications,
            'contact': s.contact,
            'user': {
                'name': s.user.name,
                'email': s.user.email
            }
        } for s in staff_members
    ]), 200

# GET one staff member
@staff_bp.route('/<int:staff_id>', methods=['GET'])
@token_required
def get_staff(current_user, staff_id):
    staff = Staff.query.get_or_404(staff_id)

    if current_user.role != 'admin' and current_user.user_id != staff.user_id:
        return jsonify({'error': 'Access denied'}), 403

    return jsonify({
        'staff_id': staff.staff_id,
        'user_id': staff.user_id,
        'employee_id': staff.employee_id,
        'gender': staff.gender,
        'date_of_birth': staff.date_of_birth.isoformat() if staff.date_of_birth else None,
        'role': staff.role,
        'qualifications': staff.qualifications,
        'contact': staff.contact,
        'user': {
            'name': staff.user.name,
            'email': staff.user.email
        }
    }), 200

# PUT update existing staff
@staff_bp.route('/<int:staff_id>', methods=['PUT'])
@token_required
def update_staff(current_user, staff_id):
    staff = Staff.query.get_or_404(staff_id)

    # Only admin or the user themself can update
    if current_user.role != 'admin' and current_user.user_id != staff.user_id:
        return jsonify({'error': 'Access denied'}), 403

    data = request.get_json()

    try:
        # Update User fields
        staff.user.name = data.get('name', staff.user.name)
        staff.user.email = data.get('email', staff.user.email)

        # Update password if provided (optional)
        if 'password' in data and data['password']:
            from werkzeug.security import generate_password_hash
            staff.user.password = generate_password_hash(data['password'])

        # Update Staff fields
        staff.gender = data.get('gender', staff.gender)
        staff.contact = data.get('contact', staff.contact)
        staff.role = data.get('role', staff.role)
        staff.qualifications = data.get('qualifications', staff.qualifications)

        if data.get('date_of_birth'):
            staff.date_of_birth = datetime.strptime(data['date_of_birth'], '%Y-%m-%d')

        db.session.commit()

        return jsonify({'message': 'Staff updated successfully'}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


# POST create new staff
@staff_bp.route('/', methods=['POST'])
@token_required
def create_staff(current_user):
    if current_user.role != 'admin':
        return jsonify({'error': 'Only admin can add staff'}), 403

    data = request.get_json()
    try:
        # Create user account
        user = User(
            name=data['name'],
            email=data['email'],
            password=data['password'],
            role=data['role']  # should be 'teacher' or 'admin'
        )
        db.session.add(user)
        db.session.flush()  # gets user.user_id

        # Create staff profile
        staff = Staff(
            user_id=user.user_id,
            employee_id=data['employee_id'],
            gender=data.get('gender'),
            date_of_birth=datetime.strptime(data['date_of_birth'], '%Y-%m-%d'),
            role=data['role'],
            qualifications=data.get('qualifications'),
            contact=data.get('contact')
        )
        db.session.add(staff)
        db.session.commit()

        return jsonify({'message': 'Staff created successfully'}), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400
