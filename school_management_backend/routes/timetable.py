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

@timetable_bp.route('/', methods=['POST'])
@token_required
def add_entry(current_user):
    if current_user.role != 'admin':
        return jsonify({'error': 'Only admin can add timetable entries'}), 403

    data = request.get_json()

    from datetime import time

    new_day = data['day']
    new_start = time.fromisoformat(data['start_time'])
    new_end = time.fromisoformat(data['end_time'])

    # ✅ Check conflicts for class
    class_conflict = TimetableEntry.query.filter_by(
        class_id=data['class_id'],
        day=new_day
    ).filter(
        TimetableEntry.start_time < new_end,
        TimetableEntry.end_time > new_start
    ).first()

    if class_conflict:
        return jsonify({'error': 'Time conflict for this class'}), 400

    # ✅ Check conflicts for teacher
    teacher_id = data.get('teacher_id')

    if teacher_id:
        teacher_conflict = TimetableEntry.query.filter_by(
            teacher_id=teacher_id,
            day=new_day
        ).filter(
            TimetableEntry.start_time < new_end,
            TimetableEntry.end_time > new_start
        ).first()

        if teacher_conflict:
            return jsonify({'error': 'Teacher is already scheduled at that time'}), 400

    # Save
    entry = TimetableEntry(
        class_id=data['class_id'],
        subject_id=data['subject_id'],
        day=new_day,
        start_time=new_start,
        end_time=new_end,
        teacher_id=teacher_id
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
