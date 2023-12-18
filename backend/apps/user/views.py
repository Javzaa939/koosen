
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes

from django.db.models import Q
from django.contrib import auth

from main.utils.function.utils import get_user_permissions, get_menu_unit, get_unit_user

from core.models import User

from .serializers import UserInfoSerializer

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

        user_detail = dict()
        try:
            user = User.objects.filter(Q(email=email) | Q(username=email)).first()

            if not user:
                return request.send_error("ERR_001", "Cистемд бүртгүүлнэ үү.")

            serializer = self.get_serializer(user)
            user_detail = serializer.data

            email = user_detail['email']
            auth_user = auth.authenticate(request, username=email, password=password)

        except Exception:
            return request.send_error("ERR_002")

        if not auth_user:
            return request.send_error("ERR_001")

        # Хэрэглэгч нэвтрэх үед LMS систем рүү нэвтрэх эрхтэйг шалгах
        user_permissions = get_user_permissions(user)

        if not user_permissions:
            request.send_error("ERR_001", "Систем рүү нэвтрэх эрхгүй байна. Админд хандана уу")

        if LMS_LOGIN not in user_permissions:
            return request.send_error("ERR_001", "Систем рүү нэвтрэх эрхгүй байна. Админд хандана уу")

        auth.login(request, auth_user)

        return request.send_info("INF_004", user_detail)

class UserAPILogoutView(
    generics.GenericAPIView
):
    """ Logout """

    def get(self, request):

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
