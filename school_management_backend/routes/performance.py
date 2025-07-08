from flask import Blueprint, jsonify,request
from models import Grade, Classroom, Subject
from sqlalchemy import func
from app import db
from utils.auth_utils import token_required

performance_bp = Blueprint('performance', __name__)

@performance_bp.route('/summary', methods=['GET'])
@token_required
def get_summary(current_user):
    if current_user.role != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403

    year = request.args.get('year', type=int)
    term = request.args.get('term', type=str)

    query = db.session.query(Grade)

    if year:
        query = query.filter(Grade.year == year)
    if term:
        query = query.filter(Grade.term == term)

    # Class averages
    class_scores = query.join(Classroom).with_entities(
        Classroom.class_name,
        func.avg(Grade.score).label('average_score')
    ).group_by(Classroom.class_name).all()

    # Subject averages
    subject_scores = query.join(Subject).with_entities(
        Subject.name,
        func.avg(Grade.score).label('average_score')
    ).group_by(Subject.name).all()

    return jsonify({
        'class_performance': [
            {'class': c[0], 'average': round(c[1], 2)} for c in class_scores
        ],
        'subject_performance': [
            {'subject': s[0], 'average': round(s[1], 2)} for s in subject_scores
        ]
    }), 200
@performance_bp.route('/trends/<string:class_name>', methods=['GET'])
@token_required
def class_trend(current_user, class_name):
    # Get average by term and year
    results = db.session.query(
        Grade.year,
        Grade.term,
        func.avg(Grade.score)
    ).join(Classroom).filter(
        Classroom.class_name == class_name
    ).group_by(Grade.year, Grade.term).order_by(Grade.year, Grade.term).all()

    return jsonify([
        {'year': r[0], 'term': r[1], 'average': round(r[2], 2)}
        for r in results
    ])
