from flask import Blueprint, request, jsonify
from app import db
from models import Student, Classroom, Subject, StudentSelection
from utils.auth_utils import token_required

student_selection_bp = Blueprint('student_selection', __name__)


from flask import Blueprint, request, jsonify
from models import db, Student, Subject, StudentSelection

student_selection_bp = Blueprint('student_selection', __name__)

# -------------------- POST: Select Subjects --------------------
@student_selection_bp.route('/select-subjects', methods=['POST'])
def select_subjects():
    data = request.get_json()

    student_id = data.get('student_id')
    subject_ids = data.get('subject_ids', [])

    if not student_id or not subject_ids:
        return jsonify({'error': 'student_id and subject_ids are required'}), 400

    student = Student.query.get(student_id)
    if not student or not student.classroom:
        return jsonify({'error': 'Student or classroom not found'}), 404

    form_level = student.classroom.form_level
    if form_level not in ['Form 3', 'Form 4']:
        return jsonify({
            'error': f'Subject selection allowed only for Form 3 and 4 students. Student is in {form_level}.'
        }), 403

    # Optional: Clear old selections before adding new ones
    StudentSelection.query.filter_by(student_id=student_id).delete()

    for subject_id in subject_ids:
        subject = Subject.query.get(subject_id)
        if subject:
            selection = StudentSelection(student_id=student_id, subject_id=subject_id)
            db.session.add(selection)

    db.session.commit()
    return jsonify({'message': 'Subjects successfully selected'}), 200



# -------------------- GET: Retrieve selected subjects --------------------
@student_selection_bp.route('/selected-subjects/<int:student_id>', methods=['GET'])
@token_required
def get_selected_subjects(current_user,student_id):
    if current_user.role != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403
    
    student = Student.query.get(student_id)
    if not student:
        return jsonify({'error': 'Student not found'}), 404

    selections = StudentSelection.query.filter_by(student_id=student_id).all()
    subjects = [{
        'subject_id': sel.subject.subject_id,
        'name': sel.subject.name,
        'group': sel.subject.group,
        'compulsory': sel.subject.compulsory
    } for sel in selections]

    return jsonify({
        'student_id': student_id,
        'student_name': f'{student.first_name} {student.last_name}',
        'selected_subjects': subjects
    }), 200


# -------------------- DELETE: Remove all subject selections --------------------
@student_selection_bp.route('/selected-subjects/<int:student_id>', methods=['DELETE'])
@token_required
def delete_selected_subjects(current_user,student_id):
    if current_user.role != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403
    
    student = Student.query.get(student_id)
    if not student:
        return jsonify({'error': 'Student not found'}), 404

    deleted = StudentSelection.query.filter_by(student_id=student_id).delete()
    db.session.commit()

    return jsonify({
        'message': f'{deleted} subject(s) deleted for student ID {student_id}'
    }), 200
