# app/__init__.py
# type: ignore

from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_bcrypt import Bcrypt
from dotenv import load_dotenv
import os

db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()
bcrypt = Bcrypt()

def create_app():
    # Load .env variables (optional but recommended)
    load_dotenv()

    app = Flask(__name__)

    # Load config from a config class
    app.config.from_object("app.config.Config")

    # Initialize extensions
    CORS(app)
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    bcrypt.init_app(app)

    # 💡 IMPORTANT: Import models to register tables with SQLAlchemy
    from app import models

    # 📦 Optionally register routes here
    # from app.routes import init_routes
    # init_routes(app)

    return app
