# routes/students.py
from flask import Blueprint, request, jsonify
from app import db
from models import Student, Classroom, Parent, Exam
from utils.auth_utils import token_required
from utils.grade_utils import get_kcse_grade
from datetime import datetime

student_bp = Blueprint('students', __name__)

# 📄 Get all students
@student_bp.route('/', methods=['GET'])
@token_required
def get_all_students(current_user):
    if current_user.role not in ['admin', 'teacher']:
        return jsonify({'error': 'Unauthorized'}), 403

    students = Student.query.all()
    return jsonify([{
        'student_id': s.student_id,
        'first_name': s.first_name,
        'last_name': s.last_name,
        'admission_number': s.admission_number,
        'gender': s.gender,
        'date_of_birth': s.date_of_birth,
        'class_id': s.class_id,
        'class_name': s.classroom.class_name if s.classroom else None,
        'parent_id': s.parent_id,
        'parent_name': s.parent.user.name if s.parent else None
    } for s in students]), 200

# 📄 Get one student
@student_bp.route('/<int:student_id>', methods=['GET'])
@token_required
def get_student(current_user, student_id):
    student = Student.query.get_or_404(student_id)

    return jsonify({
        'student_id': student.student_id,
        'first_name': student.first_name,
        'last_name': student.last_name,
        'admission_number': student.admission_number,
        'gender': student.gender,
        'date_of_birth': student.date_of_birth,
        'class_id': student.class_id,
        'parent_id': student.parent_id,
        'parent_name': student.parent.user.name if student.parent else None
    }), 200

# 🆕 Create new student
@student_bp.route('/', methods=['POST'])
@token_required
def create_student(current_user):
    if current_user.role != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403

    data = request.get_json()
    try:
        student = Student(
            first_name=data['first_name'],
            last_name=data['last_name'],
            admission_number=data['admission_number'],
            gender=data['gender'],
            date_of_birth=data['date_of_birth'],
            class_id=data['class_id'],
            parent_id=data.get('parent_id')
        )
        db.session.add(student)
        db.session.commit()
        return jsonify({'message': 'Student created'}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

# ✏️ Update student
@student_bp.route('/<int:student_id>', methods=['PUT'])
@token_required
def update_student(current_user, student_id):
    if current_user.role != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403

    student = Student.query.get_or_404(student_id)
    data = request.get_json()

    student.first_name = data.get('first_name', student.first_name)
    student.last_name = data.get('last_name', student.last_name)
    student.admission_number = data.get('admission_number', student.admission_number)
    student.gender = data.get('gender', student.gender)
    student.date_of_birth = data.get('date_of_birth', student.date_of_birth)
    student.class_id = data.get('class_id', student.class_id)
    student.parent_id = data.get('parent_id', student.parent_id)

    db.session.commit()
    return jsonify({'message': 'Student updated'}), 200

# ❌ Delete student
@student_bp.route('/<int:student_id>', methods=['DELETE'])
@token_required
def delete_student(current_user, student_id):
    if current_user.role != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403

    student = Student.query.get_or_404(student_id)
    db.session.delete(student)
    db.session.commit()
    return jsonify({'message': 'Student deleted'}), 200


@student_bp.route('/<int:student_id>/report-card', methods=['GET'])
@token_required
def get_student_report_card(current_user, student_id):
    from models import Grade, Subject, ExamSchedule, Exam
    from sqlalchemy import func
    from utils.grade_utils import get_kcse_grade

    term = request.args.get('term')
    year = request.args.get('year')
    top_n = int(request.args.get('top_n', 5))

    if not term or not year:
        return jsonify({'error': 'Missing term or year'}), 400

    student = Student.query.get_or_404(student_id)
    classroom = student.classroom
    if not classroom:
        return jsonify({'error': 'Student has no class assigned'}), 400

    # 📊 Get classmates and calculate their mean scores
    classmates = Student.query.filter_by(class_id=classroom.class_id).all()
    student_means = []

    for s in classmates:
        grades = (
            db.session.query(Grade, ExamSchedule, Exam)
            .join(ExamSchedule, Grade.exam_schedule_id == ExamSchedule.id)
            .join(Exam, Exam.exam_id == ExamSchedule.exam_id)
            .filter(
                Grade.student_id == s.student_id,
                Exam.term == term,
                Exam.year == year
            )
            .all()
        )
        marks = [grade.marks for grade, _, _ in grades]
        avg = sum(marks) / len(marks) if marks else 0

        student_means.append({
            'student_id': s.student_id,
            'student_name': f"{s.first_name} {s.last_name}",
            'mean': round(avg, 1),
            'kcse_grade': get_kcse_grade(avg)
        })

    sorted_means = sorted(student_means, key=lambda x: x['mean'], reverse=True)
    position = next((i + 1 for i, s in enumerate(sorted_means) if s['student_id'] == student_id), None)
    class_average = round(sum(s['mean'] for s in sorted_means) / len(sorted_means), 1) if sorted_means else 0
    leaderboard = sorted_means[:top_n]

    # 📚 Subject-wise breakdown
    grades = (
        db.session.query(Grade, Subject, ExamSchedule, Exam)
        .join(Subject, Grade.subject_id == Subject.subject_id)
        .join(ExamSchedule, Grade.exam_schedule_id == ExamSchedule.id)
        .join(Exam, Exam.exam_id == ExamSchedule.exam_id)
        .filter(
            Grade.student_id == student_id,
            Exam.term == term,
            Exam.year == year
        )
        .all()
    )

    subjects = {}
    total_score = 0

    for grade, subject, _, exam in grades:
        subject_name = subject.name

        if subject_name not in subjects:
            subjects[subject_name] = {
                'subject_name': subject_name,
                'average_score': 0,
                'kcse_grade': '',
                'exams': []
            }

        subjects[subject_name]['exams'].append({
            'exam': exam.name,
            'score': grade.marks,
            'term': exam.term,
            'year': exam.year
        })

    for sub in subjects.values():
        scores = [e['score'] for e in sub['exams']]
        avg = sum(scores) / len(scores) if scores else 0
        sub['average_score'] = round(avg, 1)
        sub['kcse_grade'] = get_kcse_grade(avg)
        total_score += avg

    mean_score = round(total_score / len(subjects), 1) if subjects else 0

    return jsonify({
        'student_id': student.student_id,
        'student_name': f"{student.first_name} {student.last_name}",
        'class_name': classroom.class_name,
        'term': term,
        'year': year,
        'mean_score': mean_score,
        'kcse_grade': get_kcse_grade(mean_score),
        'position': position,
        'class_average': class_average,
        'leaderboard': leaderboard,
        'subjects': list(subjects.values())
    }), 200


# 📘 Get all students in a specific class
@student_bp.route('/class/<int:class_id>', methods=['GET'])
@token_required
def get_students_by_class(current_user, class_id):
    if current_user.role not in ['admin', 'teacher']:
        return jsonify({'error': 'Unauthorized'}), 403

    students = Student.query.filter_by(class_id=class_id).all()

    result = []
    for s in students:
        result.append({
            'student_id': s.student_id,
            'first_name': s.first_name,
            'last_name': s.last_name,
            'class_id': s.class_id,
            'class_name': s.classroom.class_name if s.classroom else None
        })

    return jsonify(result), 200
