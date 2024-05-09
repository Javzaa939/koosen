
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes

from django.db.models import Q
from django.contrib import auth

from main.utils.function.utils import get_user_permissions, get_menu_unit, get_unit_user
from main.decorators import login_required

from core.models import User

from .serializers import (
    UserInfoSerializer,
    AccessHistoryLmsSerializer
)

from lms.models import AccessHistoryLms

from datetime import datetime

# LMS рүү нэвтрэх эрх
LMS_LOGIN = 'lms-login'

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
            user = User.objects.filter(Q(email=email) | Q(username=email)).first()

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
