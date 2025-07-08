from flask import Blueprint, jsonify
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

    # 📊 Average by class
    class_scores = db.session.query(
        Classroom.class_name,
        func.avg(Grade.score).label('average_score')
    ).join(Classroom, Grade.class_id == Classroom.class_id).group_by(Classroom.class_name).all()

    # 📊 Average by subject
    subject_scores = db.session.query(
        Subject.name,
        func.avg(Grade.score).label('average_score')
    ).join(Subject, Grade.subject_id == Subject.subject_id).group_by(Subject.name).all()

    return jsonify({
        'class_performance': [
            {'class': c[0], 'average': round(c[1], 2)} for c in class_scores
        ],
        'subject_performance': [
            {'subject': s[0], 'average': round(s[1], 2)} for s in subject_scores
        ]
    }), 200
