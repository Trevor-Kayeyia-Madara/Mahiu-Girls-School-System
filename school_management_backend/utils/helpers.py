import string
import random
from datetime import datetime

def generate_random_password(length=10):
    characters = string.ascii_letters + string.digits + string.punctuation
    return ''.join(random.choices(characters, k=length))

def generate_employee_number():
    timestamp = datetime.utcnow().strftime('%Y%m%d%H%M%S%f')[:-3]
    random_digits = ''.join(random.choices(string.digits, k=3))
    return f"T{timestamp}{random_digits}"
