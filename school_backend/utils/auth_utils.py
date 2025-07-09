# app/utils/auth_utils.py
# type: ignore
from functools import wraps
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
from flask import jsonify

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        try:
            verify_jwt_in_request()
            identity = get_jwt_identity()
            return f(identity, *args, **kwargs)
        except Exception as e:
            return jsonify({"error": "Unauthorized"}), 401
    return decorated
