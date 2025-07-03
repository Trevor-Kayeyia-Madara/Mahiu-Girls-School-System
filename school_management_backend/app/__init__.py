#type:ignore
from flask import Flask
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

    # ✅ FIXED: Explicitly allow the origin for your frontend application
    # You can also use CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}})
    # if you only want to apply CORS to specific API routes.
    CORS(app, origins=["http://localhost:3000"])

    # Register models (assuming these files exist and are correctly structured)
    from models import User, Student, Staff, Classroom, Subject, TeacherSubject, Grade, Message, Announcement

    # Initialize routes (assuming 'routes.py' exists and has 'init_routes' function)
    from routes import init_routes
    init_routes(app)

    return app
