from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from dotenv import load_dotenv
import os

db = SQLAlchemy()
migrate = Migrate()

def create_app():
    load_dotenv()

    app = Flask(__name__)
    app.url_map.strict_slashes = False 
    app.config.from_object('config.Config')
    
    import models  # Ensure models are loaded before db.init_app

    # ✅ Allow only frontend origin and support credentials (e.g., headers)
    CORS(app,
     resources={r"/api/*": {"origins": ["http://localhost:5173"]}},
     supports_credentials=True,
     expose_headers=["Authorization"],
     allow_headers=["Content-Type", "Authorization"],
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])

    db.init_app(app)
    migrate.init_app(app, db)

    from routes import init_routes
    init_routes(app)

    return app
