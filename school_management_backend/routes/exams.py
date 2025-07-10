# routes/exams.py
from flask import Blueprint, request, jsonify
from app import db
from models import Exam, Subject, Classroom
from utils.auth_utils import token_required

exam_bp = Blueprint('exams', __name__)

# 📄 GET all exams
@exam_bp.route('/', methods=['GET'])
@token_required
def get_all_exams(current_user):
    exams = Exam.query.all()
    data = [{
        'exam_id': e.exam_id,
        'name': e.name,
        'term': e.term,
        'year': e.year,
        'subject_id': e.subject_id,
        'subject_name': e.subject.name,
        'class_id': e.class_id,
        'class_name': e.classroom.class_name,
        'created_at': e.created_at.isoformat()
    } for e in exams]

    return jsonify(data), 200

# 📄 GET exams for a class and subject
@exam_bp.route('/class/<int:class_id>/subject/<int:subject_id>', methods=['GET'])
@token_required
def get_exams_by_class_subject(current_user, class_id, subject_id):
    exams = Exam.query.filter_by(class_id=class_id, subject_id=subject_id).all()
    return jsonify([{
        'exam_id': e.exam_id,
        'name': e.name,
        'term': e.term,
        'year': e.year
    } for e in exams]), 200

# 🆕 POST new exam
@exam_bp.route('/', methods=['POST'])
@token_required
def create_exam(current_user):
    if current_user.role != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403

    data = request.get_json()
    name = data.get('name')
    term = data.get('term')
    year = data.get('year')
    subject_id = data.get('subject_id')
    class_id = data.get('class_id')

    if not all([name, term, year, subject_id, class_id]):
        return jsonify({'error': 'Missing required fields'}), 400

    exam = Exam(
        name=name,
        term=term,
        year=year,
        subject_id=subject_id,
        class_id=class_id
    )
    db.session.add(exam)
    db.session.commit()

    return jsonify({'message': 'Exam created', 'exam_id': exam.exam_id}), 201

# ✏️ PUT update exam
@exam_bp.route('/<int:exam_id>', methods=['PUT'])
@token_required
def update_exam(current_user, exam_id):
    if current_user.role != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403

    exam = Exam.query.get_or_404(exam_id)
    data = request.get_json()

    exam.name = data.get('name', exam.name)
    exam.term = data.get('term', exam.term)
    exam.year = data.get('year', exam.year)
    exam.subject_id = data.get('subject_id', exam.subject_id)
    exam.class_id = data.get('class_id', exam.class_id)

    db.session.commit()
    return jsonify({'message': 'Exam updated'}), 200

# ❌ DELETE exam
@exam_bp.route('/<int:exam_id>', methods=['DELETE'])
@token_required
def delete_exam(current_user, exam_id):
    if current_user.role != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403

    exam = Exam.query.get_or_404(exam_id)
    db.session.delete(exam)
    db.session.commit()

    return jsonify({'message': 'Exam deleted'}), 200
