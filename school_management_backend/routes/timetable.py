# type: ignore
from flask import Blueprint, request, jsonify,send_file # type: ignore
from models import TimetableEntry, Classroom, Subject, Staff
from app import db
from utils.auth_utils import token_required
from datetime import time
from reportlab.pdfgen import canvas # type: ignore
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.units import cm
import io

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

@timetable_bp.route('/export/<int:class_id>', methods=['GET'])
@token_required
def export_timetable_pdf(current_user, class_id):
    classroom = Classroom.query.get_or_404(class_id)
    entries = TimetableEntry.query.filter_by(class_id=class_id).all()

    # Group by day and time
    days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
    grouped = {day: [] for day in days}
    time_blocks = set()

    for e in entries:
        start = e.start_time.strftime("%H:%M")
        end = e.end_time.strftime("%H:%M")
        time_str = f"{start} - {end}"
        grouped[e.day].append({
            'time': time_str,
            'subject': e.subject.name,
            'teacher': e.teacher.user.name if e.teacher else 'N/A'
        })
        time_blocks.add(time_str)

    time_blocks = sorted(time_blocks)  # ordered list

    buffer = io.BytesIO()
    p = canvas.Canvas(buffer, pagesize=landscape(A4))
    width, height = landscape(A4)

    p.setFont("Helvetica-Bold", 14)
    p.drawString(2 * cm, height - 2 * cm, f"Class Timetable: {classroom.class_name}")

    # Column headers
    x_start = 3 * cm
    y_start = height - 3 * cm
    col_width = 5 * cm
    row_height = 1.2 * cm

    p.setFont("Helvetica-Bold", 10)
    p.drawString(2 * cm, y_start, "Time")
    for i, day in enumerate(days):
        p.drawString(x_start + i * col_width, y_start, day)

    y = y_start - row_height
    p.setFont("Helvetica", 9)

    for time in time_blocks:
        p.drawString(2 * cm, y, time)

        for i, day in enumerate(days):
            slot = next((s for s in grouped[day] if s['time'] == time), None)
            if slot:
                text = f"{slot['subject']}\n{slot['teacher']}"
                p.drawString(x_start + i * col_width, y, text)

        y -= row_height
        if y < 2 * cm:
            p.showPage()
            y = height - 3 * cm

    p.save()
    buffer.seek(0)

    return send_file(
        buffer,
        as_attachment=True,
        download_name=f"{classroom.class_name}_timetable.pdf",
        mimetype='application/pdf'
    )

