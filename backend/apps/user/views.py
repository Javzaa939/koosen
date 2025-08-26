import traceback
from rest_framework import mixins
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes
from rest_framework.filters import SearchFilter

from django.db import transaction
from django.db.models import Q, F
from django.contrib import auth
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.core.exceptions import ValidationError
from django.utils.encoding import force_str, force_bytes
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from main.utils.function.utils import get_domain_url, get_domain_url_link
from main.utils.function.utils import get_user_permissions, get_menu_unit, get_unit_user, make_connection
from main.utils.function.pagination import CustomPagination
from main.decorators import login_required

from core.models import Employee, Schools, SubOrgs, Teachers, User

from .serializers import (
    AccessHistoryLmsStudentSerializer,
    StudentLoginSerializer,
    UserInfoSerializer,
    AccessHistoryLmsSerializer,
    AccessHistoryLmsSerializerAll
)
from lms.models import AccessHistoryLms, Student, StudentLogin

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

        user = None
        qs = None

        if request.session.get('_is_student'):
            user = request.user
            qs = AccessHistoryLms.objects.filter(student=user)

        else:
            user = User.objects.filter(email=request.user).first()
            qs = AccessHistoryLms.objects.filter(user=user)

        if not user:
            return request.send_data({})

        serializer = self.get_serializer(qs, many=True)
        return request.send_data(serializer.data)


@permission_classes([IsAuthenticated])
class AccessHistoryLmsStudentAPI(
    generics.GenericAPIView,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
):
    """
    to see StudentWeb project logins (maybe)
    """

    queryset = AccessHistoryLms.objects.filter(system_type=AccessHistoryLms.STUDENT)
    serializer_class = AccessHistoryLmsStudentSerializer

    pagination_class = CustomPagination

    filter_backends = [SearchFilter]
    search_fields = ['student__student__first_name', 'student__student__code', 'student__student__last_name']

    # region custom methods
    def close_sessions(self):
        request = self.request
        data = request.data

        # to require fields
        if not data and not data[0]:
            raise ValidationError({ 'id': ['Хоосон байна'] })

        data = data[0]
        now_date = datetime.now()

        with transaction.atomic():
            new_data = {
                'out_time': now_date
            }

            for data_id in data:
                instance = self.queryset.get(id=data_id)
                serializer = self.get_serializer(instance, data=new_data, partial=True)
                serializer.is_valid(raise_exception=True)
                serializer.save()

    def apply_front_end_filters(self,queryset):
        request = self.request

        is_out_time = request.query_params.get('outTime')

        if is_out_time:
            queryset = queryset.filter(out_time__isnull=is_out_time!='true')

        device_type = request.query_params.get('deviceType')

        if device_type:
            queryset = queryset.filter(device_type=device_type)

        return queryset
    # endregion

    def get(self, request, pk=None):
        """ Нэвтэрсэн 'student' мэдээллийг авах """

        queryset = self.queryset

        queryset = queryset.annotate(
            student_first_name=F('student__student__first_name'),
            student_last_name=F('student__student__last_name'),
            student_idnum=F('student__student'),
            student_code=F('student__student__code'),
        )

        if pk:
            self.queryset = queryset
            return_datas = self.retrieve(request, pk).data
            return request.send_data(return_datas)

        queryset = self.apply_front_end_filters(queryset)

        # region Sort хийх үед ажиллана
        sorting = request.query_params.get('sorting')

        if sorting:
            if not isinstance(sorting, str):
                sorting = str(sorting)
            queryset = queryset.order_by(*sorting.split(','))
        # endregion

        self.queryset = queryset
        return_datas = self.list(request).data
        return request.send_data(return_datas)

    def put(self,request,pk=None):
        result = request.send_info("INF_002")

        try:
            mode = request.query_params.get('mode')

            if mode == 'closeSessions':
                self.close_sessions()
        except ValidationError as serializer_errors:
            traceback.print_exc()
            result = request.send_error_valid(serializer_errors.detail)
        except Exception:
            traceback.print_exc()
            result = request.send_error("ERR_002")

        return result


class UserAPILoginView(
    generics.GenericAPIView
):
    """ User login api view """

    # to avoid error: "AssertionError("'UserAPILoginView' should either include a serializer_class attribute, or override the get_serializer_class() method.")"
    serializer_class = UserInfoSerializer

    # region to reduce code duplication
    @staticmethod
    def save_log(is_logged, user_id, request, log_user_field):
        """
        Нэвтрэлт хийсэн төхөөрөмжийн мэдээллийг авах хэсэг
        """

        ip = None

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
            "is_logged": is_logged
        }

        access_history_body[log_user_field] = user_id
        access_history_serilaizer = AccessHistoryLmsSerializer(data=access_history_body)
        access_history_serilaizer.is_valid(raise_exception=True)
        access_history_serilaizer.save()

    @staticmethod
    def check_user_instance(user, ending_data, request):
        if not user:
            ending_data['result'] = request.send_error("ERR_001", "Cистемд бүртгүүлнэ үү.")
            raise Exception("ERR_001 Cистемд бүртгүүлнэ үү.")

        ending_data['user_id'] = user.id

    @staticmethod
    def check_user_password(auth_user, ending_data, request):
        if not auth_user:
            ending_data['result'] = request.send_error("ERR_001")
            raise Exception('ERR_001')

    @staticmethod
    def user_login_step(user, auth_user, ending_data, request, serializer):
        auth.login(request, auth_user)
        ending_data['is_logged'] = True

        user_detail = serializer(user).data
        ending_data['result'] = request.send_info("INF_004", user_detail)

    @staticmethod
    def student_login(request, ending_data):
        ending_data['log_user_field'] = 'student'
        datas = request.data

        # region check login
        username = datas.get("username").strip() if datas.get("username") else None

        user = (
            StudentLogin.objects
            # to reduce sql queries from calling of related fields
            .select_related(
                'student__group',
                'student__department',
                'student__unit1',
                'student__unit2',
                'student__citizenship',
                'student__status',
            )
            .filter(
                Q(
                    Q(student__status__name__icontains='Суралцаж буй') |
                    Q(student__status__code=1)
                ) &
                Q(
                    username__iexact=username,
                )
            )
            .first()
        )

        UserAPILoginView.check_user_instance(user, ending_data, request)
        # endregion

        # check password
        password = datas.get("password").strip() if datas.get("password") else None
        auth_user = auth.authenticate(request, username=user.username, password=password, backend='main.auth_backends.StudentBackend')
        UserAPILoginView.check_user_password(auth_user, ending_data, request)

        # Оюутны эрх хязгаарлав
        if not user.student.is_active or not user.is_active:
            ending_data['result'] = request.send_error("ERR_001", "Систем рүү нэвтрэх эрхгүй байна. Админд хандана уу")
            raise Exception('ERR_001 Систем рүү нэвтрэх эрхгүй байна. Админд хандана уу')

        # finish login and get details
        UserAPILoginView.user_login_step(user, auth_user, ending_data, request, StudentLoginSerializer)

        # to set special flag for backend to know login type. for example in @login_required() decorator and in self.get()
        request.session["_is_student"] = True

    @staticmethod
    def default_login(request, ending_data):
        ending_data['log_user_field'] = 'user'
        datas = request.data

        # region check login
        email = datas.get("email").strip() if datas.get("email") else None

        user = (
            User.objects
            .prefetch_related(
                'teachers_set__sub_org'
            )
            .filter(
                Q(email__iexact=email) |
                Q(username__iexact=email)
            ).first()
        )

        UserAPILoginView.check_user_instance(user, ending_data, request)
        # endregion

        # check password
        password = datas.get("password").strip() if datas.get("password") else None
        auth_user = auth.authenticate(request, username=user.email, password=password)
        UserAPILoginView.check_user_password(auth_user, ending_data, request)

        # region Хэрэглэгч нэвтрэх үед LMS систем рүү нэвтрэх эрхтэйг шалгах
        user_permissions = get_user_permissions(user)

        if not user_permissions or LMS_LOGIN not in user_permissions:
            ending_data['result'] = request.send_error("ERR_001", "Систем рүү нэвтрэх эрхгүй байна. Админд хандана уу")
            raise Exception('ERR_001 Систем рүү нэвтрэх эрхгүй байна. Админд хандана уу')
        # endregion

        # finish login and get details
        UserAPILoginView.user_login_step(user, auth_user, ending_data, request, UserInfoSerializer)
    # endregion to reduce code duplication

    def get(self, request):
        """ Нэвтэрсэн хэрэглэгчийн мэдээллийг авах """

        is_student = request.session.get('_is_student')
        serializer_data = None

        if is_student == True:
            user = request.user

            if not isinstance(user, StudentLogin):
                return request.send_data({})

            serializer_data = StudentLoginSerializer(user).data

        else:
            user = User.objects.filter(email=request.user).first()

            if not user:
                return request.send_data({})

            serializer_data = UserInfoSerializer(user).data

        return request.send_data(serializer_data)

    def post(self, request):
        """ Нэвтрэх функц """

        # to catch and log the latest values of variables if any exception is occurred in any random moment
        ending_data = {
            'is_logged': False,
            'user_id': None,
            'result': None,
            'log_user_field': None,
        }

        try:
            if request.data.get('isStudent'):
                self.student_login(request, ending_data)

            else:
                self.default_login(request, ending_data)

        except Exception:
            traceback.print_exc()

            if not ending_data['result']:
                ending_data['result'] = request.send_error("ERR_002")

        UserAPILoginView.save_log(ending_data['is_logged'], ending_data['user_id'], request, ending_data['log_user_field'])
        return ending_data['result']


class UserAPILogoutView(
    generics.GenericAPIView
):
    """ Logout """

    queryset = AccessHistoryLms.objects.all().order_by('-in_time')

    @login_required()
    def get(self, request):

        user_id = request.user.id
        conditions = { 'user': user_id }

        if request.session.get('_is_student'):
            conditions = { 'student': user_id }

        # NOTE this can work wrong for example if many devices are used by same user to login. May be need to save sessionId to AccessHistoryLms table and use it to remove correct record, etc
        # Нэвтрэлт дууссан цагийг нэвтрэлтийн хэсэгт update хэсэгт хийж хадгалах
        access_obj = self.queryset.filter(**conditions, out_time__isnull=True, system_type=AccessHistoryLms.LMS, is_logged=True).first()

        if access_obj:
            access_obj.out_time=datetime.now()
            access_obj.save()

        auth.logout(request)

        return request.send_info("INF_005")


class UserMenuAPI(
    generics.GenericAPIView,
):
    """ Тухайн цэсний шийдвэрлэх эрхтэй нэгжүүд болон хэрэглэгч шийдвэрлэх эрхтэй эсэх """

    def get(self, request):

        if request.session.get('_is_student'):
            return request.send_data([])

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

# from django.contrib.auth.hashers import make_password

# from core.models import User
# user = User.objects.filter(email='elselt@chairman.mn').first()

# password = 'Elselt@2025'
# hash_password = make_password(password)

# print(hash_password)

# user.password = hash_password
# user.save()
