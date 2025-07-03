#type:ignore
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_migrate import Migrate
from dotenv import load_dotenv
import os

db = SQLAlchemy()
migrate = Migrate()

def create_app():
    load_dotenv()
    app = Flask(__name__)
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URI')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    db.init_app(app)
    migrate.init_app(app, db)

    # ✅ Allow all origins for dev — change in prod
    CORS(app)

    # ✅ Log all requests for debug
    @app.before_request
    def log_request():
        print(f"[REQ] {request.method} {request.path}")

    # ✅ Handle OPTIONS preflight without redirect
    @app.before_request
    def handle_options():
        if request.method == 'OPTIONS':
            response = app.make_default_options_response()
            headers = response.headers
            headers['Access-Control-Allow-Origin'] = request.headers.get('Origin', '*')
            headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
            headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
            headers['Access-Control-Allow-Credentials'] = 'true'
            return response

    # 👇 Ensure routes are registered AFTER app is created
    from models import User, Student, Staff, Classroom, Subject, TeacherSubject, Grade, Message, Announcement
    from routes import init_routes
    init_routes(app)

    return app
