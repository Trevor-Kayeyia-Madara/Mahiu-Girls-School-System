from flask import Blueprint, request, jsonify
from sqlalchemy.orm import joinedload
from app import db
from models import Grade, Student, Subject, Exam, TeacherSubject
from utils.auth_utils import token_required
from utils.grade_utils import get_kcse_grade

teacher_report_bp = Blueprint('teacher_reports', __name__)

# 📊 GET Grades for Teacher’s Subject + Class
@teacher_report_bp.route('/grades/<int:class_id>/<int:subject_id>', methods=['GET'])
@token_required
def teacher_grades(current_user, class_id, subject_id):
    if current_user.role != 'teacher':
        return jsonify({'error': 'Unauthorized'}), 403

    # 🧠 Confirm teacher teaches the subject in the class
    teacher_subject = TeacherSubject.query.filter_by(
        teacher_id=current_user.teacher.teacher_id,
        class_id=class_id,
        subject_id=subject_id
    ).first()

    if not teacher_subject:
        return jsonify({'error': 'You are not assigned to this subject in this class'}), 403

    term = request.args.get('term')
    year = request.args.get('year', type=int)

    # 📥 Get all students in class
    students = Student.query.filter_by(class_id=class_id).all()
    student_map = {s.student_id: f"{s.first_name} {s.last_name}" for s in students}

    # 🧾 Get grades for subject
    grade_query = Grade.query.options(
        joinedload(Grade.student),
        joinedload(Grade.exam)
    ).filter_by(subject_id=subject_id)

    if term:
        grade_query = grade_query.filter(Grade.term == term)
    if year:
        grade_query = grade_query.filter(Grade.year == year)

    grades = grade_query.all()

    # 🧮 Organize by student
    results = {}
    for g in grades:
        sid = g.student_id
        if sid not in results:
            results[sid] = {
                'student_name': student_map.get(sid, 'Unknown'),
                'exams': [],
                'total_score': 0,
                'count': 0
            }
        results[sid]['exams'].append({
            'exam': g.exam.name if g.exam else 'N/A',
            'score': g.score,
            'term': g.term,
            'year': g.year
        })
        results[sid]['total_score'] += g.score
        results[sid]['count'] += 1

    # 🧾 Format output
    final = []
    for sid, data in results.items():
        avg = round(data['total_score'] / data['count'], 2) if data['count'] else 0
        final.append({
            'student_name': data['student_name'],
            'average_score': avg,
            'kcse_grade': get_kcse_grade(avg),
            'exams': data['exams']
        })

    return jsonify(final), 200
