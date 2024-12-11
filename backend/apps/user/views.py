
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes

from django.db import transaction
from django.db.models import Q
from django.contrib import auth
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.core.exceptions import ValidationError
from django.utils.encoding import force_str, force_bytes
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from main.utils.function.utils import get_domain_url, get_domain_url_link
from main.utils.function.utils import get_user_permissions, get_menu_unit, get_unit_user, make_connection
from main.decorators import login_required

from core.models import Employee, Schools, SubOrgs, Teachers, User

from .serializers import (
    UserInfoSerializer,
    AccessHistoryLmsSerializer,
    AccessHistoryLmsSerializerAll
)
from lms.models import AccessHistoryLms, Student

from lms.models import AccessHistoryLms

from datetime import datetime

# LMS рүү нэвтрэх эрх
LMS_LOGIN = 'lms-login'

class UserDetailAPI(
    generics.GenericAPIView
):
    queryset = AccessHistoryLms.objects
    serializer_class = AccessHistoryLmsSerializerAll

    def get(self, request):
        """ Нэвтэрсэн хэрэглэгчийн мэдээллийг авах """

        user = User.objects.filter(email=request.user).first()
        if not user:
            return request.send_data({})

        qs = AccessHistoryLms.objects.filter(user=user)
        serializer = self.get_serializer(qs, many=True)
        return request.send_data(serializer.data)

class UserAPILoginView(
    generics.GenericAPIView
):
    """ User login api view """

    serializer_class = UserInfoSerializer

    def get(self, request):
        """ Нэвтэрсэн хэрэглэгчийн мэдээллийг авах """

        user = User.objects.filter(email=request.user).first()

        if not user:
            return request.send_data({})

        serializer = self.get_serializer(user)

        return request.send_data(serializer.data)

    def post(self, request):
        """ Нэвтрэх функц """

        datas = request.data
        email = datas.get("email").strip() if datas.get("email") else None
        password = datas.get("password").strip() if datas.get("password") else None

        # Нэвтрэлт хийсэн төхөөрөмжийн мэдээллийг авах хэсэг
        ip = None
        user_id = None
        is_logged = False

        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')

        user_agent = request.user_agent

        device_type = 0
        browser = "OTHER"
        os = "OTHER"
        device_name = "OTHER"

        if user_agent.is_mobile:
            device_type = AccessHistoryLms.MOBILE
        elif user_agent.is_pc:
            device_type = AccessHistoryLms.PC
        else:
            device_type = AccessHistoryLms.TABLET

        if user_agent.browser.family:
            browser = user_agent.browser.family

        if user_agent.os.family:
            os = user_agent.os.family

        if user_agent.device.family:
            device_name = user_agent.device.family

        access_history_body = {
            "system_type": AccessHistoryLms.LMS,
            "device_type": device_type,
            "device_name": device_name,
            "browser": browser,
            "os_type": os,
            "ip": ip,
        }

        user_detail = dict()
        try:
            user = User.objects.filter(Q(email__iexact=email) | Q(username__iexact=email)).first()

            if not user:
                access_history_body.update({"user": user_id, "is_logged": is_logged})
                access_history_serilaizer = AccessHistoryLmsSerializer(data=access_history_body)
                if not access_history_serilaizer.is_valid():
                    raise

                access_history_serilaizer.save()

                return request.send_error("ERR_001", "Cистемд бүртгүүлнэ үү.")
            user_id = user.id

            serializer = self.get_serializer(user)
            user_detail = serializer.data

            email = user_detail['email']
            auth_user = auth.authenticate(request, username=email, password=password)

        except Exception:
            access_history_body.update({"user": user_id, "is_logged": is_logged})
            access_history_serilaizer = AccessHistoryLmsSerializer(data=access_history_body)
            if not access_history_serilaizer.is_valid():
                raise

            access_history_serilaizer.save()
            return request.send_error("ERR_002")

        if not auth_user:
            access_history_body.update({"user": user_id, "is_logged": is_logged})
            access_history_serilaizer = AccessHistoryLmsSerializer(data=access_history_body)
            if not access_history_serilaizer.is_valid():
                raise

            access_history_serilaizer.save()

            return request.send_error("ERR_001")

        # Хэрэглэгч нэвтрэх үед LMS систем рүү нэвтрэх эрхтэйг шалгах
        user_permissions = get_user_permissions(user)

        if not user_permissions:
            access_history_body.update({"user": user_id, "is_logged": is_logged})
            access_history_serilaizer = AccessHistoryLmsSerializer(data=access_history_body)
            if not access_history_serilaizer.is_valid():
                raise

            access_history_serilaizer.save()

            request.send_error("ERR_001", "Систем рүү нэвтрэх эрхгүй байна. Админд хандана уу")

        if LMS_LOGIN not in user_permissions:
            access_history_body.update({"user": user_id, "is_logged": is_logged})
            access_history_serilaizer = AccessHistoryLmsSerializer(data=access_history_body)
            if not access_history_serilaizer.is_valid():
                raise

            access_history_serilaizer.save()

            return request.send_error("ERR_001", "Систем рүү нэвтрэх эрхгүй байна. Админд хандана уу")

        auth.login(request, auth_user)

        is_logged = True
        access_history_body.update({"user": user_id, "is_logged": is_logged})
        access_history_serilaizer = AccessHistoryLmsSerializer(data=access_history_body)
        if not access_history_serilaizer.is_valid():
            raise

        access_history_serilaizer.save()

        return request.send_info("INF_004", user_detail)

class UserAPILogoutView(
    generics.GenericAPIView
):
    """ Logout """

    queryset = AccessHistoryLms.objects.all().order_by('-in_time')

    @login_required()
    def get(self, request):

        user_id = request.user.id

        # Нэвтрэлт дууссан цагийг нэвтрэлтийн хэсэгт update хэсэгт хийж хадгалах
        access_id = self.queryset.filter(user=user_id).first().id if self.queryset.filter(user=user_id).exists() else None

        if access_id:
            self.queryset.filter(pk=access_id).update(out_time=datetime.now())

        auth.logout(request)

        return request.send_info("INF_005")


class UserMenuAPI(
    generics.GenericAPIView,
):
    """ Тухайн цэсний шийдвэрлэх эрхтэй нэгжүүд болон хэрэглэгч шийдвэрлэх эрхтэй эсэх """

    def get(self, request):

        c_units = []
        c_menu_list = []

        user = User.objects.filter(email=request.user).first()

        if not user:
            return request.send_data(c_menu_list)

        menu_id = request.query_params.get('menu')

        c_units = get_unit_user(user.id)

        # Хандах цэс орж ирвэл тухайн цэсэнд ямар нэгжүүд батлах эрхтэйг олох хэсэг
        if menu_id:
            c_menu_list = get_menu_unit(menu_id) # Цэсний шийдвэрлэх нэгжүүд

            for c_menu in c_menu_list:
                is_solved = False
                c_menu_id = c_menu.get('id')

                # Хэрэглэгчийн шийдвэрлэх нэгжүүд
                for c_unit in c_units:
                    c_unit_id = c_unit.get('unit_id')
                    if c_menu_id == c_unit_id:
                        is_solved = True

                c_menu['is_solve'] = is_solved

        return request.send_data(c_menu_list)

class UserForgotPasswordAPI(
    generics.GenericAPIView
):
    """ To process "forgot password" form submission to send reset link """

    def post(self, request):
        # Validation and sanitization of input data
        email = request.data.get('email')
        if not email:
            return request.send_error("ERR_002", 'Fill input(s) correctly')
        email = User(email=email)
        try:
            email.full_clean()
        except ValidationError as e:
            errors = e.message_dict
            if 'email' in errors:
                if 'и-мэйл давхцсан байна' not in [error.lower() for error in errors['email']]:
                    return request.send_error("ERR_002", 'Fill input(s) correctly')
        email = email.email

        # Searching school config in models
        user = User.objects.filter(email=email).first()
        if user:
            school = Employee.objects.filter(user=user.id).values_list('org', flat=True).first()
            if not school:
                school = Teachers.objects.filter(user=school).values_list('org', flat=True).first()
        # NOTE Student never login this system.
        else:
            user = Student.objects.filter(email=email).first()
            if user:
                school = SubOrgs.objects.filter(org=user.school).values_list("org", flat=True).first()
            else:
                return request.send_info('INF_001')
        if not school:
            return request.send_info('INF_001')

        school = Schools.objects.filter(id=school).values('email_password', 'email_port', 'email_host', 'email_use_tls', 'email_host_user').first()
        if not school:
            return request.send_info('INF_001')

        # Building reset link. default token expiration is 3 days and can be changed in settings with PASSWORD_RESET_TIMEOUT
        token = default_token_generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        link_domain = get_domain_url() or get_domain_url_link()
        react_app_base_url = 'http://localhost:3000' if 'http://localhost:' in link_domain else link_domain
        reset_link = f'{react_app_base_url}/reset-password/?ab1={uid}&ab2={token}'

        # Sending email
        config = {
            "email_password": school['email_password'],
            "email_port": school['email_port'],
            "email_host": school['email_host'],
            "email_use_tsl": school['email_use_tls'],
        }
        send_mail(
            subject = 'Password Reset',
            message = f'Please use the following link to reset your password: {reset_link}',
            from_email = school['email_host_user'],
            recipient_list = [email],
            connection = make_connection(school['email_host_user'], config),
            html_message = f'Please use the following link to reset your password: {reset_link}'
        )
        return request.send_info('INF_001')


class UserForgotPasswordConfirmAPI(
    generics.GenericAPIView
):
    """ To process "forgot password" form after reset link opening to update password """

    @transaction.atomic()
    def post(self, request):
        sid = transaction.savepoint()
        try:
            try:
                uid = request.data.get('ab1')
                uid = force_str(urlsafe_base64_decode(uid).decode())
                user_model = get_user_model()
                user = user_model.objects.get(pk=uid)

            except (TypeError, ValueError, OverflowError, user_model.DoesNotExist):
                # success result to decrease user ID bruteforce simplicity
                transaction.savepoint_rollback(sid)
                return request.send_info('INF_001')

            token = request.data.get('ab2')
            if not default_token_generator.check_token(user, token):
                # Invalid or expired token
                # success result to decrease token bruteforce simplicity
                transaction.savepoint_rollback(sid)
                return request.send_info('INF_001')

            new_password = request.data.get('password')
            if new_password:
                user.set_password(new_password)
                user.save()
                # Password has been reset
                return request.send_info('INF_001')

            transaction.savepoint_rollback(sid)
            return request.send_error("ERR_002", 'Password is required.')

        except Exception as e:
            print(e)
            transaction.savepoint_rollback(sid)
            return request.send_error("ERR_002", e)