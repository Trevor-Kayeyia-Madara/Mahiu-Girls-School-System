import datetime
from flask import Blueprint, request, jsonify
from app import db
from models import TimetableEntry, Classroom, Subject, Teacher
from utils.auth_utils import token_required
import datetime

timetable_bp = Blueprint('timetable', __name__)

# 🟢 GET timetable for a class
@timetable_bp.route('/class/<int:class_id>', methods=['GET'])
@token_required
def get_class_timetable(current_user, class_id):
    entries = TimetableEntry.query.filter_by(class_id=class_id).all()
    result = [{
        'id': e.id,
        'day': e.day,
        'start_time': e.start_time.strftime('%H:%M'),
        'end_time': e.end_time.strftime('%H:%M'),
        'subject': e.subject.name,
        'teacher': e.teacher.user.name
    } for e in entries]
    return jsonify(result), 200

# 🟢 GET teacher's timetable
@timetable_bp.route('/teacher/<int:teacher_id>', methods=['GET'])
@token_required
def get_teacher_timetable(current_user, teacher_id):
    if current_user.role != 'teacher' and current_user.role != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403

    entries = TimetableEntry.query.filter_by(teacher_id=teacher_id).all()
    result = [{
        'id': e.id,
        'class': e.classroom.class_name,
        'day': e.day,
        'start_time': e.start_time.strftime('%H:%M'),
        'end_time': e.end_time.strftime('%H:%M'),
        'subject': e.subject.name
    } for e in entries]
    return jsonify(result), 200

# 🆕 POST add entry
@timetable_bp.route('/', methods=['POST'])
@token_required
def add_timetable_entry(current_user):
    if current_user.role != 'admin':
        return jsonify({'error': 'Only admin can add entries'}), 403

    data = request.get_json()

    try:
        start_time_obj = datetime.datetime.strptime(data['start_time'], '%H:%M').time()
        end_time_obj = datetime.datetime.strptime(data['end_time'], '%H:%M').time()
    except (ValueError, TypeError):
        return jsonify({'error': 'Invalid time format'}), 400

    entry = TimetableEntry(
        class_id=data['class_id'],
        subject_id=data['subject_id'],
        teacher_id=data['teacher_id'],
        day=data['day'],
        start_time=start_time_obj,
        end_time=end_time_obj
    )

    db.session.add(entry)
    db.session.commit()
    return jsonify({'message': 'Entry added'}), 201
# 🗑 DELETE an entry
@timetable_bp.route('/<int:entry_id>', methods=['DELETE'])
@token_required
def delete_entry(current_user, entry_id):
    if current_user.role != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403

    entry = TimetableEntry.query.get_or_404(entry_id)
    db.session.delete(entry)
    db.session.commit()
    return jsonify({'message': 'Entry deleted'}), 200
