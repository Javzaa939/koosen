from django.contrib.auth.backends import BaseBackend
from lms.models import StudentLogin

class StudentBackend(BaseBackend):
    def authenticate(self, request, username=None, password=None, **kwargs):
        try:
            student = StudentLogin.objects.get(username=username)

            if student.check_password(password):
                return student

        except StudentLogin.DoesNotExist:
            return None

    def get_user(self, user_id):
        try:
            return StudentLogin.objects.get(pk=user_id)

        except StudentLogin.DoesNotExist:
            return None
