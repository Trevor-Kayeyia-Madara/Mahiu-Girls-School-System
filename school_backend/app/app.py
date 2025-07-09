#type: ignore
# app/app.py
from flask import Flask
from flask_sqlalchemy import SQLAlchemy # Make sure this is installed: pip install Flask-SQLAlchemy

# Import the 'db' instance from your models.py file
# Assuming models.py is in the same 'app' directory as app.py
from .models import db 

app = Flask(__name__)

# --- Database Configuration ---
# Configure SQLAlchemy to use SQLite and specify the database file.
# 'sqlite:///site.db' means a file named 'site.db' will be created in your project's root directory
# (e.g., school_backend/site.db) when you run the app for the first time.
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///school.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False # Recommended to disable to save memory and avoid warnings

# Initialize the 'db' object with your Flask app
# This connects your models (from models.py) to your Flask application's database configuration
db.init_app(app)

# --- Define your routes ---
@app.route('/')
def hello_world():
    return 'Hello, World!'

# --- Database Initialization (for development) ---
# This block ensures that all database tables defined in models.py are created
# when your Flask application starts, if they don't already exist.
# It runs within an application context, which is necessary for Flask-SQLAlchemy operations.
with app.app_context():
    db.create_all()
    print("Database tables created (if they didn't exist).")

# --- Run the application ---
if __name__ == '__main__':
    # Running in debug mode is great for development as it provides more detailed errors
    # and reloads the server on code changes.
    # host='0.0.0.0' makes the server accessible from other devices on your network (useful for testing).
    # port=5001 (or any other available port) to avoid conflicts with default port 5000.
    app.run(debug=True, host='0.0.0.0', port=5001)