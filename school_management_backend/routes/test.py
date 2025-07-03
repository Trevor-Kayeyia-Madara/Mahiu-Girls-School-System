from flask import Blueprint, jsonify # type: ignore

test_bp = Blueprint('test', __name__)

@test_bp.route('/test', methods=['GET'])
def test():
    return jsonify({'message': 'CORS works!'})
