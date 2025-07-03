# type: ignore
from flask import Blueprint, request, jsonify
from models import Classroom, Staff, Student
from app import db
from utils.auth_utils import token_required

class_bp = Blueprint('classrooms', __name__)

# 📄 GET all classrooms
@class_bp.route('/', methods=['GET'])
@token_required
def get_all_classes(current_user):
    classes = Classroom.query.all()
    return jsonify([{
        'class_id': c.class_id,
        'class_name': c.class_name,
        'class_teacher': c.class_teacher.user.name if c.class_teacher else None,
        'num_students': len(c.students)
    } for c in classes]), 200

# 📄 GET one classroom by ID
@class_bp.route('/<int:class_id>', methods=['GET'])
@token_required
def get_class(current_user, class_id):
    classroom = Classroom.query.get_or_404(class_id)
    students = [{
        'student_id': s.student_id,
        'name': s.user.name,
        'admission_number': s.admission_number
    } for s in classroom.students]

    return jsonify({
        'class_id': classroom.class_id,
        'class_name': classroom.class_name,
        'class_teacher': classroom.class_teacher.user.name if classroom.class_teacher else None,
        'students': students
    }), 200

# ➕ POST create classroom
@class_bp.route('/', methods=['POST'])
@token_required
def create_classroom(current_user):
    if current_user.role != 'admin':
        return jsonify({'error': 'Only admin can create classrooms'}), 403

    data = request.get_json()
    classroom = Classroom(
        class_name=data['class_name'],
        class_teacher_id=data.get('class_teacher_id')  # optional on creation
    )
    db.session.add(classroom)
    db.session.commit()
    return jsonify({'message': 'Classroom created successfully'}), 201

# ✏️ PUT update classroom
@class_bp.route('/<int:class_id>', methods=['PUT'])
@token_required
def update_classroom(current_user, class_id):
    if current_user.role != 'admin':
        return jsonify({'error': 'Only admin can update classrooms'}), 403

    classroom = Classroom.query.get_or_404(class_id)
    data = request.get_json()

    classroom.class_name = data.get('class_name', classroom.class_name)
    classroom.class_teacher_id = data.get('class_teacher_id', classroom.class_teacher_id)

    db.session.commit()
    return jsonify({'message': 'Classroom updated successfully'}), 200

# ❌ DELETE classroom
@class_bp.route('/<int:class_id>', methods=['DELETE'])
@token_required
def delete_classroom(current_user, class_id):
    if current_user.role != 'admin':
        return jsonify({'error': 'Only admin can delete classrooms'}), 403

    classroom = Classroom.query.get_or_404(class_id)
    db.session.delete(classroom)
    db.session.commit()
    return jsonify({'message': 'Classroom deleted successfully'}), 200
