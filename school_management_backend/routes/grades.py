from flask import Blueprint, request, jsonify
from app import db
from models import Grade
from utils.auth_utils import token_required

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

    # Optional updates
    grade.score = data.get('score', grade.score)
    grade.term = data.get('term', grade.term)
    grade.year = data.get('year', grade.year)

    # Optional: allow changing student/subject only for admin
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
            continue  # skip incomplete records

        # Check if grade exists (upsert logic)
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
