#type:ignore

from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_migrate import Migrate  # ✅ FIXED: Import this
from dotenv import load_dotenv
import os

db = SQLAlchemy()
migrate = Migrate()  # ✅ This now works

def create_app():
    load_dotenv()
    app = Flask(__name__)
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URI')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    db.init_app(app)
    migrate.init_app(app, db)
    CORS(app)

    # Register models
    from models import User, Student, Staff, Classroom, Subject, TeacherSubject, Grade, Message, Announcement

    # Initialize routes
    from routes import init_routes
    init_routes(app)

    return app
