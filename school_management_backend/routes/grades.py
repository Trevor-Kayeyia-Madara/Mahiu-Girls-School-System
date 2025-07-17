from sqlite3 import IntegrityError
from flask import Blueprint, request, jsonify
from app import db
from models import Grade, Student, Subject, Teacher, Exam, ExamSchedule
from utils.auth_utils import token_required
from utils.grade_utils import get_kcse_grade

grade_bp = Blueprint('grades', __name__)

@grade_bp.route('/', methods=['GET'])
@token_required
def get_grades(current_user):
    if current_user.role not in ['admin', 'teacher']:
        return jsonify({'error': 'Unauthorized'}), 403

    class_id = request.args.get('class_id')
    subject_id = request.args.get('subject_id')
    term = request.args.get('term')
    year = request.args.get('year')

    query = Grade.query

    if class_id:
        query = query.filter_by(class_id=class_id)
    if subject_id:
        query = query.filter_by(subject_id=subject_id)
    if term:
        query = query.filter_by(term=term)
    if year:
        query = query.filter_by(year=year)

    grades = query.all()

    result = []
    for g in grades:
        result.append({
            'grade_id': g.grade_id,
            'student_name': g.student.name,
            'admission_number': g.student.admission_number,
            'subject': g.subject.name,
            'score': g.score,
            'exam_name': getattr(g, 'exam', {}).get('name', 'N/A') if hasattr(g, 'exam') else 'N/A',
            'term': g.term,
            'year': g.year,
            'teacher_name': g.teacher.name
        })

    return jsonify(result), 200

@grade_bp.route('/grades', methods=['GET'])
@token_required
def get_grades_paginated(current_user):
    if current_user.role not in ['admin', 'teacher']:
        return jsonify({'error': 'Unauthorized'}), 403

    page = int(request.args.get('page', 1))
    per_page = int(request.args.get('per_page', 10))

    query = Grade.query.join(Student).join(Subject).join(Teacher)

    total = query.count()
    grades = query.offset((page - 1) * per_page).limit(per_page).all()

    return jsonify({
        'total': total,
        'data': [{
            'student_name': g.student.first_name + ' ' + g.student.last_name,
            'subject': g.subject.name,
            'score': g.score,
            'term': g.term,
            'year': g.year,
            'teacher': g.teacher.user.name
        } for g in grades]
    }), 200

@grade_bp.route('/', methods=['POST'])
@token_required
def add_or_update_grade(current_user):
    data = request.get_json()
    student_id = data.get('student_id')
    subject_id = data.get('subject_id')
    class_id = data.get('class_id')
    term = data.get('term')
    year = data.get('year')
    score = data.get('score')

    if current_user.role not in ['teacher', 'admin']:
        return jsonify({'error': 'Unauthorized'}), 403

    existing = Grade.query.filter_by(
        student_id=student_id,
        subject_id=subject_id,
        term=term,
        year=year
    ).first()

    if existing:
        existing.score = score
    else:
        new_grade = Grade(
            student_id=student_id,
            subject_id=subject_id,
            class_id=class_id,
            term=term,
            year=year,
            score=score,
            teacher_id=current_user.staff.staff_id
        )
        db.session.add(new_grade)

    db.session.commit()
    return jsonify({'message': 'Grade saved'}), 200

@grade_bp.route('/student/<int:student_id>', methods=['GET'])
@token_required
def get_student_grades(current_user, student_id):
    if current_user.role not in ['admin', 'teacher']:
        return jsonify({'error': 'Unauthorized'}), 403

    grades = Grade.query.filter_by(student_id=student_id).all()

    return jsonify([{
        'subject': g.subject.name,
        'score': g.score,
        'term': g.term,
        'year': g.year
    } for g in grades]), 200

@grade_bp.route('/class/<int:class_id>', methods=['GET'])
@token_required
def get_class_grades(current_user, class_id):
    if current_user.role not in ['admin', 'teacher']:
        return jsonify({'error': 'Unauthorized'}), 403

    grades = Grade.query.filter_by(class_id=class_id).all()

    result = []
    for g in grades:
        result.append({
            'student_id': g.student_id,
            'subject': g.subject.name,
            'score': g.score,
            'term': g.term,
            'year': g.year
        })
    return jsonify(result), 200

@grade_bp.route('/<int:grade_id>', methods=['DELETE'])
@token_required
def delete_grade(current_user, grade_id):
    if current_user.role != 'admin':
        return jsonify({'error': 'Only admin can delete grades'}), 403

    grade = Grade.query.get_or_404(grade_id)
    db.session.delete(grade)
    db.session.commit()

    return jsonify({'message': 'Grade deleted'}), 200

@grade_bp.route('/<int:grade_id>', methods=['PUT'])
@token_required
def update_grade(current_user, grade_id):
    if current_user.role not in ['admin', 'teacher']:
        return jsonify({'error': 'Unauthorized'}), 403

    grade = Grade.query.get_or_404(grade_id)
    data = request.get_json()

    grade.score = data.get('score', grade.score)
    grade.term = data.get('term', grade.term)
    grade.year = data.get('year', grade.year)

    if current_user.role == 'admin':
        grade.student_id = data.get('student_id', grade.student_id)
        grade.subject_id = data.get('subject_id', grade.subject_id)
        grade.class_id = data.get('class_id', grade.class_id)
        grade.teacher_id = data.get('teacher_id', grade.teacher_id)

    db.session.commit()
    return jsonify({'message': 'Grade updated'}), 200

@grade_bp.route('/bulk', methods=['POST'])
@token_required
def bulk_upload_grades(current_user):
    if current_user.role not in ['admin', 'teacher']:
        return jsonify({'error': 'Unauthorized'}), 403

    data = request.get_json()
    if not isinstance(data, list):
        return jsonify({'error': 'Expected a list of grade records'}), 400

    for item in data:
        student_id = item.get('student_id')
        subject_id = item.get('subject_id')
        class_id = item.get('class_id')
        teacher_id = item.get('teacher_id')
        term = item.get('term')
        year = item.get('year')
        score = item.get('score')

        if not all([student_id, subject_id, class_id, teacher_id, term, year, score]):
            continue

        grade = Grade.query.filter_by(
            student_id=student_id,
            subject_id=subject_id,
            term=term,
            year=year
        ).first()

        if grade:
            grade.score = score
        else:
            new_grade = Grade(
                student_id=student_id,
                subject_id=subject_id,
                class_id=class_id,
                teacher_id=teacher_id,
                term=term,
                year=year,
                score=score
            )
            db.session.add(new_grade)

    db.session.commit()
    return jsonify({'message': 'Grades uploaded successfully'}), 200

@grade_bp.route('/summary/class/<int:class_id>/subject/<int:subject_id>', methods=['GET'])
@token_required
def summary_by_class_subject(current_user, class_id, subject_id):
    if current_user.role not in ['admin', 'teacher']:
        return jsonify({'error': 'Unauthorized'}), 403

    students = Student.query.filter_by(class_id=class_id).all()
    data = []
    for s in students:
        exams = ['CAT 1', 'CAT 2', 'Main Exam']
        scores = {}
        for ex in exams:
            g = Grade.query.join(Exam).filter(
                Grade.student_id == s.student_id,
                Grade.subject_id == subject_id,
                Exam.name == ex
            ).first()
            scores[ex] = g.score if g else 0
        
        total = scores['CAT 1'] + scores['CAT 2'] + scores['Main Exam']
        data.append({
            'student_id': s.student_id,
            'student_name': f"{s.first_name} {s.last_name}",
            'cat1': scores['CAT 1'],
            'cat2': scores['CAT 2'],
            'main': scores['Main Exam'],
            'total': total,
            'kcse': get_kcse_grade(total)
        })

    return jsonify(data), 200

#Enter marks
@grade_bp.route('/grades', methods=['POST'])

def enter_grades():
    
    data = request.get_json()

    exam_schedule_id = data.get('exam_schedule_id')
    entries = data.get('grades')  # list of { student_id, marks }

    if not exam_schedule_id or not entries:
        return jsonify({"error": "Missing exam_schedule_id or grades"}), 400

    exam_schedule = ExamSchedule.query.get(exam_schedule_id)
    if not exam_schedule:
        return jsonify({"error": "ExamSchedule not found"}), 404

    responses = []
    for entry in entries:
        student_id = entry.get('student_id')
        marks = entry.get('marks')

        if student_id is None or marks is None:
            continue

        # Optional: Check if student belongs to that classroom
        if student_id not in [s.student_id for s in exam_schedule.class_assignment.classroom.students]:
            continue

        grade = Grade(
            student_id=student_id,
            exam_schedule_id=exam_schedule_id,
            marks=marks
        )
        db.session.add(grade)
        responses.append({"student_id": student_id, "status": "added"})

    try:
        db.session.commit()
        return jsonify({"message": "Grades entered successfully", "details": responses}), 201
    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "Duplicate entry or constraint issue"}), 409
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500