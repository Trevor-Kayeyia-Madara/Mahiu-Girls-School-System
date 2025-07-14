import datetime
from flask import Blueprint, request, jsonify, send_file, Response
from io import BytesIO
import csv
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
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

# CSV Export
@timetable_bp.route('/export/class/<int:class_id>/csv', methods=['GET'])
@token_required
def export_class_timetable_csv(current_user, class_id):
    if current_user.role != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403

    entries = TimetableEntry.query.filter_by(class_id=class_id).all()

    output = BytesIO()
    writer = csv.writer(output)
    writer.writerow(['Day', 'Start Time', 'End Time', 'Subject', 'Teacher'])

    for e in entries:
        writer.writerow([
            e.day,
            e.start_time.strftime('%H:%M'),
            e.end_time.strftime('%H:%M'),
            e.subject.name,
            e.teacher.user.name
        ])

    output.seek(0)
    return Response(
        output,
        mimetype='text/csv',
        headers={
            "Content-Disposition": f"attachment; filename=class_{class_id}_timetable.csv"
        }
    )


# PDF Export
@timetable_bp.route('/export/class/<int:class_id>/pdf', methods=['GET'])
@token_required
def export_class_timetable_pdf(current_user, class_id):
    if current_user.role != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403

    entries = TimetableEntry.query.filter_by(class_id=class_id).order_by(
        TimetableEntry.day, TimetableEntry.start_time
    ).all()

    buffer = BytesIO()
    p = canvas.Canvas(buffer, pagesize=A4)
    width, height = A4
    y = height - 40

    p.setFont("Helvetica-Bold", 14)
    p.drawString(50, y, f"Class Timetable - Class ID {class_id}")
    y -= 30

    p.setFont("Helvetica-Bold", 10)
    p.drawString(50, y, "Day")
    p.drawString(120, y, "Start-End")
    p.drawString(220, y, "Subject")
    p.drawString(350, y, "Teacher")
    y -= 20

    p.setFont("Helvetica", 10)
    for e in entries:
        if y < 40:
            p.showPage()
            y = height - 40

        p.drawString(50, y, e.day)
        p.drawString(120, y, f"{e.start_time.strftime('%H:%M')} - {e.end_time.strftime('%H:%M')}")
        p.drawString(220, y, e.subject.name)
        p.drawString(350, y, e.teacher.user.name)
        y -= 15

    p.save()
    buffer.seek(0)

    return send_file(
        buffer,
        as_attachment=True,
        download_name=f'class_{class_id}_timetable.pdf',
        mimetype='application/pdf'
    )