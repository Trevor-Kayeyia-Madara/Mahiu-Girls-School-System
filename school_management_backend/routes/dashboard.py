from flask import jsonify, Blueprint
from models import User, Student, Teacher, Grade  # ✅ NO ReportCard import
from utils.auth_utils import token_required

dashboard_bp = Blueprint('dashboard', __name__)

@dashboard_bp.route('/stats',methods=['GET'])
@token_required
def get_dashboard_stats(current_user):
    if current_user.role != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403

    return jsonify({
        'users': User.query.count(),
        'students': Student.query.count(),
        'teachers': Teacher.query.count(),
        'reports': Grade.query.count()  # Real "report" data using grades
    }), 200