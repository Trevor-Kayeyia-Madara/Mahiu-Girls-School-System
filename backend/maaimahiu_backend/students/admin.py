# students/admin.py

from django.contrib import admin
from .models import Class, Parent, Student, Teacher, Message, Notification

admin.site.register(Class)
admin.site.register(Parent)
admin.site.register(Student)
admin.site.register(Teacher)
admin.site.register(Message)
admin.site.register(Notification)
