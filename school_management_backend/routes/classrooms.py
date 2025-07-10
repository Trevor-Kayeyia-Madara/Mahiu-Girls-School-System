from flask import Blueprint, request, jsonify
from app import db
from models import Classroom, Teacher
from utils.auth_utils import token_required

class_bp = Blueprint('classrooms', __name__)

# 📄 Get all classes
@class_bp.route('/', methods=['GET'])
@token_required
def get_all_classes(current_user):
    if current_user.role not in ['admin', 'teacher']:
        return jsonify({'error': 'Unauthorized'}), 403

    classes = Classroom.query.all()
    return jsonify([{
        'class_id': c.class_id,
        'class_name': c.class_name,
        'class_teacher_id': c.class_teacher_id,
        'class_teacher_name': c.class_teacher.user.name if c.class_teacher else None
    } for c in classes]), 200

# 📄 Get one class
@class_bp.route('/<int:class_id>', methods=['GET'])
@token_required
def get_class(current_user, class_id):
    classroom = Classroom.query.get_or_404(class_id)
    return jsonify({
        'class_id': classroom.class_id,
        'class_name': classroom.class_name,
        'class_teacher_id': classroom.class_teacher_id,
        'class_teacher_name': classroom.class_teacher.user.name if classroom.class_teacher else None
    }), 200

# 🆕 Create new class
@class_bp.route('/', methods=['POST'])
@token_required
def create_class(current_user):
    if current_user.role != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403

    data = request.get_json()
    new_class = Classroom(
        class_name=data['class_name'],
        class_teacher_id=data.get('class_teacher_id')
    )
    db.session.add(new_class)
    db.session.commit()
    return jsonify({'message': 'Classroom created'}), 201

# ✏️ Update class
@class_bp.route('/<int:class_id>', methods=['PUT'])
@token_required
def update_class(current_user, class_id):
    if current_user.role != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403

    classroom = Classroom.query.get_or_404(class_id)
    data = request.get_json()

    classroom.class_name = data.get('class_name', classroom.class_name)
    classroom.class_teacher_id = data.get('class_teacher_id', classroom.class_teacher_id)

    db.session.commit()
    return jsonify({'message': 'Classroom updated'}), 200

# ❌ Delete class
@class_bp.route('/<int:class_id>', methods=['DELETE'])
@token_required
def delete_class(current_user, class_id):
    if current_user.role != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403

    classroom = Classroom.query.get_or_404(class_id)
    db.session.delete(classroom)
    db.session.commit()
    return jsonify({'message': 'Classroom deleted'}), 200

class_teacher_bp = Blueprint('class_teacher', __name__)

# 🆕 Assign a class teacher
@class_teacher_bp.route('/assign-teacher', methods=['POST'])
@token_required
def assign_class_teacher(current_user):
    if current_user.role != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403

    data = request.get_json()
    class_id = data.get('class_id')
    teacher_id = data.get('teacher_id')

    if not class_id or not teacher_id:
        return jsonify({'error': 'Missing fields'}), 400

    classroom = Classroom.query.get_or_404(class_id)
    classroom.class_teacher_id = teacher_id
    db.session.commit()

    return jsonify({'message': 'Class teacher assigned'}), 200

# 📄 Get class teacher for a class
@class_teacher_bp.route('/<int:class_id>/teacher', methods=['GET'])
@token_required
def get_class_teacher(current_user, class_id):
    classroom = Classroom.query.get_or_404(class_id)

    if not classroom.class_teacher:
        return jsonify({'message': 'No class teacher assigned yet'}), 404

    return jsonify({
        'class_id': classroom.class_id,
        'class_name': classroom.class_name,
        'teacher_id': classroom.class_teacher.staff_id,
        'teacher_name': classroom.class_teacher.user.name
    }), 200