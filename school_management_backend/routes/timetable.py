from flask import Blueprint, request, jsonify # type: ignore
from models import TimetableEntry, Classroom, Subject, Staff
from app import db
from utils.auth_utils import token_required
from datetime import time

timetable_bp = Blueprint('timetable', __name__)

# 📄 GET full timetable for a class
@timetable_bp.route('/<int:class_id>', methods=['GET'])
@token_required
def get_class_timetable(current_user, class_id):
    entries = TimetableEntry.query.filter_by(class_id=class_id).all()
    result = []
    for entry in entries:
        result.append({
            'id': entry.id,
            'day': entry.day,
            'start_time': entry.start_time.strftime('%H:%M'),
            'end_time': entry.end_time.strftime('%H:%M'),
            'subject': entry.subject.name,
            'teacher': entry.teacher.user.name if entry.teacher else None,
            'subject_id': entry.subject_id,
            'teacher_id': entry.teacher_id,
        })
    return jsonify(result), 200

# ➕ POST a new timetable entry
@timetable_bp.route('/', methods=['POST'])
@token_required
def add_entry(current_user):
    if current_user.role != 'admin':
        return jsonify({'error': 'Only admin can add timetable entries'}), 403

    data = request.get_json()
    entry = TimetableEntry(
        class_id=data['class_id'],
        subject_id=data['subject_id'],
        day=data['day'],
        start_time=time.fromisoformat(data['start_time']),
        end_time=time.fromisoformat(data['end_time']),
        teacher_id=data.get('teacher_id')  # optional override
    )
    db.session.add(entry)
    db.session.commit()
    return jsonify({'message': 'Timetable entry added'}), 201

# ❌ DELETE entry
@timetable_bp.route('/<int:entry_id>', methods=['DELETE'])
@token_required
def delete_entry(current_user, entry_id):
    entry = TimetableEntry.query.get_or_404(entry_id)
    db.session.delete(entry)
    db.session.commit()
    return jsonify({'message': 'Entry deleted'}), 200
