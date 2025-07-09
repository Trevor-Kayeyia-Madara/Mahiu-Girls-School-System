import os

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', 'super-secret')
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL', 'sqlite:///school.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
