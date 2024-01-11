import os
from rest_framework import mixins
from rest_framework import generics

from django.db import transaction
from django.conf import settings

from datetime import date
from itertools import chain

from main.utils.file import remove_folder

from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes

from django.db.models import Sum, Q, Subquery, When, Case, OuterRef, FloatField, Value, BooleanField, CharField
from django.db.models.functions import Concat, Upper, Substr

from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger

from dateutil import relativedelta

import calendar
from django.db.models import F

from rest_framework.filters import SearchFilter
from main.utils.function.pagination import CustomPagination

from main.utils.file import remove_folder
from main.utils.function.utils import override_get_queryset, str2bool, get_active_year_season, _filter_queries,  override_get_queryset, str2bool, has_permission, get_position_ids
from lms_package.notif import create_notif

from lms.models import Payment
from lms.models import Journal
from lms.models import JournalStudent
from lms.models import DormitoryRoomType
from lms.models import DormitoryRoomFile
from lms.models import DormitoryRoom
from lms.models import DormitoryStudent
from lms.models import DormitoryOtherStudent
from lms.models import DormitoryPayment
from lms.models import DormitoryEstimationFamily
from lms.models import DormitoryFamilyContract
from lms.models import DormitoryOtherBalance
from lms.models import InventoryRequest
from lms.models import InventoryRegister
from lms.models import Notification
from lms.models import Employee
from lms.models import Teachers
from core.models import User



from .serializers import DormitoryRoomSerializer
from .serializers import DormitoryRoomTypeSerializer
from .serializers import DormitoryRoomListSerializer
from .serializers import DormitoryStudentSerializer
from .serializers import DormitoryOtherStudentSerializer
from .serializers import DormitoryStudentListSerializer
from .serializers import DormitoryOtherStudentListSerializer
from .serializers import DormitoryPaymentSerializer
from .serializers import DormitoryRoomTypeListSerializer
from .serializers import DormitoryPaymentListSerializer
from .serializers import DormitoryStudentEstimateSerializer
from .serializers import DormitoryEstimationFamilySerializer
from .serializers import DormitoryOtherStudentEstimateSerializer
from .serializers import DormitoryFamilyContractsSerializer
from .serializers import PaymentSerializer
from .serializers import DormitoryFamilyContractListSerializer
from .serializers import InventoryRequestListSerializer
from .serializers import InventoryRequestSerializer
from .serializers import InventoryListSerializer
from .serializers import InventoryRequestPutSerializer
from .serializers import NormalRegisterSerializer
from .serializers import FamilyRegisterSerializer
from .serializers import NormalRegisterUserInfoSerializer
from .serializers import OtherStudentInformationSerializer
from .serializers import DormitoryFamilyPostContractSerializer


class DormitoryRoomTypeAPIView(
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    generics.GenericAPIView,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    mixins.RetrieveModelMixin,
):
    " Дотуур байрны өрөөний төрөл "

    queryset = DormitoryRoomType.objects.all()
    serializer_class = DormitoryRoomTypeSerializer

    pagination_class = CustomPagination

    def get_queryset(self):
        return override_get_queryset(self)

    def get(self, request, pk=None):

        if pk:
            return_datas = self.retrieve(request, pk).data
            return request.send_data(return_datas)

        return_datas = self.list(request).data

        return request.send_data(return_datas)

    def post(self, request, def_id=None):
        error_obj = []
        data = request.data
        serializer = self.get_serializer(data=data)

        if serializer.is_valid(raise_exception=False):
            with transaction.atomic():
                try:
                    self.create(request).data
                except Exception:
                    return request.send_error("ERR_002")

            return request.send_info("INF_001")
        else:
            for key in serializer.errors:
                msg = "Хоосон байна"

                return_error = {
                    "field": key,
                    "msg": msg
                }

                error_obj.append(return_error)

            return request.send_error("ERR_003", error_obj)

    def put(self, request, pk=None):
        data = request.data
        files = request.FILES.getlist('files')
        descriptions = request.POST.getlist('descriptions')
        file_change = request.POST.getlist('file_change')
        student_file_ids = request.POST.getlist('file_id')

        instance = self.queryset.filter(id=pk).first()

        serializer = self.get_serializer(instance, data=data)

        if serializer.is_valid(raise_exception=True):
            self.perform_update(serializer)
            if file_change:
                # NOTE: хавсаргасан файл засах үед
                for idx, value in enumerate(file_change):
                    change_file = str2bool(value) # Файлыг зассан бол True
                    edit_file_id = student_file_ids[idx]
                    description = descriptions[idx]

                    if edit_file_id:
                        qs = DormitoryRoomFile.objects.filter(id=edit_file_id)

                    if change_file:
                        file = files[idx]

                        # NOTE: Файл засаж байгаа үед хуучин файлыг устгана
                        remove_file = os.path.join(settings.DORMITORY, str(edit_file_id))
                        if remove_file:
                            remove_folder(remove_file)

                        qs.update_or_create(
                            id=edit_file_id,
                            defaults={
                                "description": description,
                                "file": file,
                            }
                        )
                    else:
                        # NOTE: Файл засаагүй тайлбар зассан үед зөвхөн тайлбарыг update хийнэ
                        qs.update_or_create(
                            id=edit_file_id,
                            defaults={
                                "description": description,
                            }
                        )

            else:
                # NOTE: огт файл байхгүй байсан үед шинээр үүсгэнэ
                if descriptions:
                    for idx, description in enumerate(descriptions):
                        DormitoryRoomFile.objects.create(
                            request=DormitoryRoomType.objects.get(id=pk),
                            description=description,
                            file=files[idx],
                        )
        else:
            error_obj = []
            for key in serializer.errors:
                msg = "Хоосон байна"

                return_error = {
                    "field": key,
                    "msg": msg
                }

                error_obj.append(return_error)

            if len(error_obj) > 0:
                return request.send_error("ERR_003", error_obj)

        return request.send_info("INF_002")

    def delete(self, request, pk=None):


        room = DormitoryRoom.objects.filter(room_type=pk)
        payment = DormitoryPayment.objects.filter(room_type=pk)
        if room or payment:
            return request.send_error("ERR_002", "Энэ өрөөний төрөл нь ашиглагдаж байгаа тул устгах боломжгүй")
        qs = DormitoryRoomFile.objects.filter(request=pk).values_list('id',flat=True)

        if qs:
            for edit_file_id in qs:
                remove_file = os.path.join(settings.DORMITORY, str(edit_file_id))
                if remove_file:
                    remove_folder(remove_file)

        self.destroy(request, pk)

        return request.send_info("INF_003")


class DormitoryRoomTypeFileAPIView(
    generics.GenericAPIView,
    mixins.DestroyModelMixin,
):
    queryset = DormitoryRoomFile.objects.all()

    def delete(self, request, pk=None):

        # NOTE: Файл засаж байгаа үед хуучин файлыг устгана
        remove_file = os.path.join(settings.DORMITORY, str(pk))
        if remove_file:
            remove_folder(remove_file)

        self.destroy(request, pk)

        return request.send_info("INF_003")


@permission_classes([IsAuthenticated])
class DormitoryRoomTypeListAPIView(
    mixins.ListModelMixin,
    generics.GenericAPIView,
):
    ''' Өрөөний төрлийн жагсаалт '''

    queryset = DormitoryRoomType.objects
    serializer_class = DormitoryRoomTypeListSerializer

    def get(self, request):

        room_reg = self.list(request).data

        return request.send_data(room_reg)


class DormitoryRoomListAPIView(
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    generics.GenericAPIView,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    mixins.RetrieveModelMixin,
):

    " Өрөөний жагсаалт "

    queryset = DormitoryRoom.objects.all()
    serializer_class = DormitoryRoomListSerializer

    def get_queryset(self):
        return override_get_queryset(self)

    def get(self, request, pk=None):

        room_type = self.request.query_params.get('room_type')

        if room_type:
            self.queryset = self.queryset.filter(room_type=room_type)

        self.queryset = self.queryset.order_by('room_number')
        datas = self.list(request).data

        return request.send_data(datas)


@permission_classes([IsAuthenticated])
class DormitoryRoomAPIView(
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    generics.GenericAPIView,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    mixins.RetrieveModelMixin,
):

    " Өрөөний бүртгэл "

    queryset = DormitoryRoom.objects.all()
    serializer_class = DormitoryRoomSerializer

    pagination_class = CustomPagination

    def get_queryset(self):
        return override_get_queryset(self)

    def get(self, request, pk=None):
        self.serializer_class = DormitoryRoomListSerializer

        room_type = self.request.query_params.get('room_type')
        gender = self.request.query_params.get('gender')

        if room_type:
            self.queryset = self.queryset.filter(room_type=room_type)

        if gender:
            self.queryset = self.queryset.filter(gender=gender)

        if pk:
            return_datas = self.retrieve(request, pk).data
            return request.send_data(return_datas)

        self.queryset = self.queryset.order_by('room_number')
        room_reg = self.list(request).data

        return request.send_data(room_reg)

    def post(self, request):
        errors = []
        data = request.data
        room_number = data.get("room_number")
        floor = data.get('floor')

        room_info = self.queryset.filter(room_number=room_number, floor=floor)

        if room_info:
            return_error = {
                "field": 'room_number',
                "msg": "Тухайн өрөө бүртгэлтэй байна"
            }

            errors.append(return_error)

            return request.send_error("ERR_003", errors)

        serializer = self.get_serializer(data=data)

        if serializer.is_valid(raise_exception=False):
            with transaction.atomic():
                try:
                    self.perform_create(serializer)
                except Exception:
                    return request.send_error("ERR_002")

            return request.send_info("INF_001")
        else:
            for key in serializer.errors:
                msg = "Хоосон байна"

                return_error = {
                    "field": key,
                    "msg": msg
                }

                errors.append(return_error)

            if len(errors) > 0:
                return request.send_error("ERR_003", errors)

            return request.send_error("ERR_002")

    def put(self, request, pk=None):
        request_data = request.data

        floor = request_data.get('floor')
        room_number = request_data.get("room_number")

        errors = list()

        instance = self.queryset.filter(id=pk).first()
        instance = self.get_object()

        old_room_number = instance.room_number

        if room_number != old_room_number:
            room_info = self.queryset.filter(room_number=room_number, floor=floor)

            if room_info:
                return_error = {
                    "field": 'room_number',
                    "msg": "Тухайн өрөө бүртгэлтэй байна"
                }

                errors.append(return_error)

                return request.send_error("ERR_003", errors)

        serializer = self.get_serializer(instance, data=request_data)

        if serializer.is_valid(raise_exception=False):
            with transaction.atomic():
                try:
                    self.perform_update(serializer)
                except Exception:
                    return request.send_error("ERR_002")
            return request.send_info("INF_001")

        else:
            error_obj = []
            for key in serializer.errors:
                msg = "Хоосон байна"

                return_error = {
                    "field": key,
                    "msg": msg
                }

                error_obj.append(return_error)

            if len(error_obj) > 0:
                return request.send_error("ERR_003", error_obj)

            return request.send_info("ERR_002")

    def delete(self, request, pk=None):

        if pk:
            check_room1 = DormitoryStudent.objects.filter(room=pk)
            check_room2 = DormitoryFamilyContract.objects.filter(room=pk)
            check_room3 = DormitoryOtherStudent.objects.filter(room=pk)
            if check_room1 or check_room2 or check_room3:
                return request.send_error("ERR_003", "Устгах боломжгүй байна")

        self.destroy(request, pk)

        return request.send_info("INF_003")


@permission_classes([IsAuthenticated])
class DormitoryRequestAPIView(
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    generics.GenericAPIView,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    mixins.RetrieveModelMixin,
):

    ''' Амьдрах хүсэлт шийдвэрлэх '''

    queryset = DormitoryStudent.objects.all()
    serializer_class = DormitoryStudentSerializer

    pagination_class = CustomPagination

    filter_backends = [SearchFilter]
    search_fields = ['student__code', 'student__last_name', 'student__first_name']

    def get(self, request, pk=None):
        self.serializer_class = DormitoryStudentListSerializer

        school_id = self.request.query_params.get('school_id')
        group_id = self.request.query_params.get('class_id')

        room = self.request.query_params.get('room')
        roomtype = self.request.query_params.get('roomtype')
        solved = self.request.query_params.get('solved')

        if room:
            self.queryset = self.queryset.filter(room=room)

        if roomtype:
            self.queryset = self.queryset.filter(room_type=roomtype)

        if solved:
            self.queryset = self.queryset.filter(solved_flag=solved)

        # Сургуулиар хайлт хийх
        if school_id:
            self.queryset = self.queryset.select_related('student').filter(student__school_id=school_id)

        # Ангиар хайлт хийх
        if group_id:
            self.queryset = self.queryset.select_related('student').filter(student__group_id=group_id)

        if pk:
            return_datas = self.retrieve(request, pk).data
            return request.send_data(return_datas)

        return_datas = self.list(request).data

        return request.send_data(return_datas)


    def post(self, request):

        data = request.data
        serializer = self.get_serializer(data=data)

        student = data.get('student')

        year, season = get_active_year_season()
        dormitory = self.queryset.filter(student=student, lesson_year=year)

        if len(dormitory) > 0:
            error_obj = [
                {
                    'field': 'student',
                    'msg': 'Бүртгэлтэй оюутан байна'
                }
            ]
            return request.send_error("ERR_003", error_obj)

        if serializer.is_valid(raise_exception=False):
            is_success = False
            with transaction.atomic():
                try:
                    self.create(request).data
                    is_success = True
                except Exception as e:
                    print(e)
                    return request.send_error('ERR_002')
            if is_success:
                return request.send_info("INF_001")

            return request.send_error("ERR_002")
        else:
            error_obj = []
            for key in serializer.errors:
                msg = "Хоосон байна"

                return_error = {
                    "field": key,
                    "msg": msg
                }

                error_obj.append(return_error)

            if len(error_obj) > 0:
                return request.send_error("ERR_003", error_obj)

        return request.send_info("INF_001")


    def put(self, request, pk=None):
        request_data = request.data
        instance = self.queryset.filter(id=pk).first()

        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request_data)

        if serializer.is_valid(raise_exception=False):
            is_success = False
            with transaction.atomic():
                try:
                    self.update(request).data
                    is_success = True
                except Exception:
                    raise
            if is_success:
                return request.send_info("INF_001")

            return request.send_error("ERR_002")
        else:
            error_obj = []
            for key in serializer.errors:
                msg = "Хоосон байна"

                return_error = {
                    "field": key,
                    "msg": msg
                }

                error_obj.append(return_error)

            if len(error_obj) > 0:
                return request.send_error("ERR_003", error_obj)

        return request.send_info("INF_002")

# @permission_classes([IsAuthenticated])
class DormitoryAnotherStudentRequestAPIView(
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    generics.GenericAPIView,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    mixins.RetrieveModelMixin,
):

    '''Гадны оюутны амьдрах хүсэлт шийдвэрлэх '''

    queryset = DormitoryOtherStudent.objects.all()
    serializer_class = DormitoryOtherStudentSerializer

    pagination_class = CustomPagination

    filter_backends = [SearchFilter]
    search_fields = ['student__last_name', 'student__first_name']

    def get(self, request, pk=None):
        self.serializer_class = DormitoryOtherStudentListSerializer

        if pk:
            return_datas = self.retrieve(request, pk).data
            return request.send_data(return_datas)

        return_datas = self.list(request).data

        return request.send_data(return_datas)

    def post(self, request):

        request_data = request.data
        try:
            with transaction.atomic():

                sid = transaction.savepoint()

                request_data['login_type'] = User.LOGIN_TYPE_SIMPLE

                normal = NormalRegisterSerializer(data=request_data)

                if not normal.is_valid():
                    transaction.savepoint_rollback(sid)
                    return request.send_error_valid(normal.errors)

                new_data = normal.save()

                gender = Teachers.GENDER_OTHER
                register = request_data['register']

                if register:
                    check_gender = register[-2]
                    check_gender = int(check_gender) % 2

                    if check_gender == 1:
                        gender = Teachers.GENDER_MALE
                    elif check_gender == 0:
                        gender = Teachers.GENDER_FEMALE

                request_data['user'] = new_data.id
                request_data['gender'] = gender
                request_data['action_status'] = Teachers.APPROVED
                request_data['action_status_type'] = Teachers.ACTION_TYPE_ALL

                serializer_userinfo = NormalRegisterUserInfoSerializer(data=request_data)

                if not serializer_userinfo.is_valid():
                    transaction.savepoint_rollback(sid)
                    return request.send_error_valid(serializer_userinfo.errors)

                teachers = serializer_userinfo.save()

                other_student_inf = {
                    'student': new_data.id,
                    'school': request_data['school'],
                    'course': request_data['course'],
                    'profession': request_data['profession'],
                }

                other_serializer = OtherStudentInformationSerializer(data=other_student_inf)

                if not other_serializer.is_valid():
                    transaction.savepoint_rollback(sid)
                    return request.send_error_valid(other_serializer.errors)

                other_serializer.save()

                request_data['student'] = teachers.id

                serializer = self.get_serializer(data=request_data)

                if not serializer.is_valid():
                    transaction.savepoint_rollback(sid)
                    return request.send_error_valid(serializer.errors)

                serializer.save()

        except Exception as e:
            transaction.savepoint_rollback(sid)
            print(e)
            return request.send_error("ERR_002")

        return request.send_info("INF_001")

    def put(self, request, pk=None):
        request_data = request.data
        instance = self.queryset.filter(id=pk).first()

        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request_data)

        if serializer.is_valid(raise_exception=False):
            is_success = False
            with transaction.atomic():
                try:
                    self.update(request).data
                    is_success = True
                except Exception:
                    raise
            if is_success:
                return request.send_info("INF_001")

            return request.send_error("ERR_002")
        else:
            error_obj = []
            for key in serializer.errors:
                msg = "Хоосон байна"

                return_error = {
                    "field": key,
                    "msg": msg
                }

                error_obj.append(return_error)

            if len(error_obj) > 0:
                return request.send_error("ERR_003", error_obj)

        return request.send_info("INF_002")


@permission_classes([IsAuthenticated])
class DormitoryFamilyContractAPIView(
    mixins.ListModelMixin,
    generics.GenericAPIView,
    mixins.UpdateModelMixin,
    mixins.RetrieveModelMixin,
    mixins.CreateModelMixin,
    mixins.DestroyModelMixin,
):

    ''' Сараар түрээслэгчийн амьдрах хүсэлт шийдвэрлэх '''

    queryset = DormitoryFamilyContract.objects.all()
    serializer_class = DormitoryFamilyContractsSerializer

    pagination_class = CustomPagination

    filter_backends = [SearchFilter]
    search_fields = [
        'request_date',
        'room_type__name',
        'solved_start_date',
        'room__room_number',
        'solved_finish_date',
        'teacher__last_name',
        'teacher__first_name',
    ]

    def get(self, request, pk=None):
        self.serializer_class = DormitoryFamilyContractListSerializer

        is_teacher = self.request.query_params.get('is_teacher')

        if is_teacher:
            is_teacher = str2bool(is_teacher)
            self.queryset = self.queryset.filter(is_ourteacher=is_teacher)

        if pk:
            return_datas = self.retrieve(request, pk).data
            return request.send_data(return_datas)

        return_datas = self.list(request).data

        return request.send_data(return_datas)


    def post(self, request):

        request_data = request.data

        if(request_data['teacher']):

            serializer = self.serializer_class(data=request_data)

            if not serializer.is_valid():
                print(serializer.errors)
                return request.send_error_valid(serializer.errors)

            serializer.save()
            return request.send_info("INF_001")

        try:
            with transaction.atomic():

                sid = transaction.savepoint()

                request_data['login_type'] = User.LOGIN_TYPE_SIMPLE

                family = FamilyRegisterSerializer(data=request_data)

                if not family.is_valid():
                    transaction.savepoint_rollback(sid)
                    return request.send_error_valid(family.errors)

                family = family.save()

                gender = Teachers.GENDER_OTHER
                register = request_data['register']

                if register:
                    check_gender = register[-2]
                    check_gender = int(check_gender) % 2

                    if check_gender == 1:
                        gender = Teachers.GENDER_MALE
                    elif check_gender == 0:
                        gender = Teachers.GENDER_FEMALE

                request_data['user'] = family.id
                request_data['gender'] = gender
                request_data['action_status'] = Teachers.APPROVED
                request_data['action_status_type'] = Teachers.ACTION_TYPE_ALL

                serializer_userinfo = NormalRegisterUserInfoSerializer(data=request_data)

                if not serializer_userinfo.is_valid():
                    transaction.savepoint_rollback(sid)
                    return request.send_error_valid(serializer_userinfo.errors)

                serializer_userinfo.save()

                teacher_id = Teachers.objects.all().filter(user=family.id).first().id
                request_data['teacher'] = teacher_id

                serializer = DormitoryFamilyPostContractSerializer(data=request_data)
                if not serializer.is_valid():
                    print(serializer.errors)
                    transaction.savepoint_rollback(sid)
                    return request.send_error_valid(serializer.errors)

                serializer.save()

        except Exception as e:
            transaction.savepoint_rollback(sid)
            print(e)
            return request.send_error("ERR_002")

        return request.send_info("INF_001")


    def put(self, request, pk=None):
        request_data = request.data
        instance = self.queryset.filter(id=pk).first()

        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request_data)

        if serializer.is_valid(raise_exception=False):
            is_success = False
            with transaction.atomic():
                try:
                    self.update(request).data
                    is_success = True
                except Exception:
                    raise
            if is_success:
                return request.send_info("INF_002")

            return request.send_error("ERR_002")
        else:
            error_obj = []
            for key in serializer.errors:
                msg = "Хоосон байна"

                return_error = {
                    "field": key,
                    "msg": msg
                }

                error_obj.append(return_error)

            if len(error_obj) > 0:
                return request.send_error("ERR_003", error_obj)

        return request.send_info("INF_002")


@permission_classes([IsAuthenticated])
class DormitoryPaymentAPIView(
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    generics.GenericAPIView,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    mixins.RetrieveModelMixin,
):
    " Дотуур байрны өрөөний төлбөр "

    queryset = DormitoryPayment.objects.all()
    serializer_class = DormitoryPaymentSerializer

    pagination_class = CustomPagination

    def get_queryset(self):
        return override_get_queryset(self)

    def get(self, request, pk=None):
        self.serializer_class = DormitoryPaymentListSerializer

        lesson_year = self.request.query_params.get('lesson_year')
        room_type = self.request.query_params.get('room_type')

        # Хичээлийн жилээр хайлт хийх
        if lesson_year:
            self.queryset = self.queryset.filter(lesson_year=lesson_year)

        # Өрөөний төрлөөр хайх
        if room_type:
            self.queryset = self.queryset.filter(room_type=room_type)

        if pk:
            datas = self.queryset.filter(id=pk)
            if not datas:
                return request.send_error('ERR_017', "Төлбөрийн тохиргоо хийгдээгүй байна")

            return_datas = self.retrieve(request, pk).data
            return request.send_data(return_datas)

        return_datas = self.list(request).data

        return request.send_data(return_datas)

    def post(self, request):
        error_obj = []
        data = request.data
        room_type = data.get('room_type')
        lesson_year = data.get('lesson_year')
        is_ourstudent = data.get('is_ourstudent')
        is_ourstudent = str2bool(is_ourstudent)

        # Тухайн хичээлийн жилд нэг төрөлд нэг л төлбөр байх ёстой
        check_qs = self.queryset.filter(
                room_type=room_type,
                lesson_year=lesson_year,
                is_ourstudent=is_ourstudent,
            )

        if check_qs:
            return request.send_error("ERR_003", "Тухайн өрөөний төрөлд төлбөр бүртгэгдсэн байна")

        serializer = self.get_serializer(data=data)

        if serializer.is_valid(raise_exception=False):
            with transaction.atomic():
                try:
                    self.create(request).data
                except Exception:
                    return request.send_error("ERR_002")

            return request.send_info("INF_001")
        else:
            for key in serializer.errors:
                msg = "Хоосон байна"

                return_error = {
                    "field": key,
                    "msg": msg
                }

                error_obj.append(return_error)

            return request.send_error("ERR_003", error_obj)

    def put(self, request, pk=None):
        request_data = request.data
        new_room_type = request_data.get('room_type')
        lesson_year = request_data.get('lesson_year')
        is_ourstudent = request_data.get('is_ourstudent')
        is_ourstudent = str2bool(is_ourstudent)

        instance = self.queryset.filter(id=pk).first()
        old_room_type = instance.room_type.id

        # Тухайн хичээлийн жилд нэг төрөлд нэг л төлбөр байх ёстой
        if old_room_type != int(new_room_type):
            check_qs = self.queryset.filter(
                    room_type=new_room_type,
                    lesson_year=lesson_year,
                    is_ourstudent=is_ourstudent,
                )

            if check_qs:
                return request.send_error("ERR_003", "Тухайн өрөөний төрөлд төлбөр бүртгэгдсэн байна")

        serializer = self.get_serializer(instance, data=request_data)

        if serializer.is_valid(raise_exception=True):
            self.perform_update(serializer)
        else:
            error_obj = []
            for key in serializer.errors:
                msg = "Хоосон байна"

                return_error = {
                    "field": key,
                    "msg": msg
                }

                error_obj.append(return_error)

            if len(error_obj) > 0:
                return request.send_error("ERR_003", error_obj)

        return request.send_info("INF_002")

    def delete(self, request, pk=None):

        self.destroy(request, pk)

        return request.send_info("INF_003")


@permission_classes([IsAuthenticated])
class OurDormitoryStudentEstimateAPIView(
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    generics.GenericAPIView,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    mixins.RetrieveModelMixin,
):
    """ Өөрийн сургуулийн оюутны дотуур байрны төлбөрийн тооцоо """

    queryset = DormitoryStudent.objects.all().order_by('student', 'updated_at')
    serializer_class = DormitoryStudentSerializer

    filter_backends = [SearchFilter]
    pagination_class = CustomPagination

    search_fields = [
        'student__code',
        'student__last_name',
        'student__first_name',
        'student__register_num',
        'room_type__name',
        'room__door_number',
        'room__room_number',
    ]

    def get_queryset(self):
        queryset = self.queryset

        sorting = self.request.query_params.get('sorting')

        # Sort хийх үед ажиллана
        if sorting:
            if not isinstance(sorting, str):
                sorting = str(sorting)

            queryset = queryset.order_by(sorting)

        return queryset

    def get(self, request, pk=None):
        self.serializer_class = DormitoryStudentEstimateSerializer

        searchValue = self.request.query_params.get('search')
        school = self.request.query_params.get('school')
        lesson_year = self.request.query_params.get('lesson_year')
        room = self.request.query_params.get('room')
        roomtype = self.request.query_params.get('roomtype')

        # Хичээлийн жилээр хайлт хийх
        if lesson_year:

            self.queryset = self.queryset.filter(lesson_year=lesson_year.strip())

        # Сургуулиар хайлт хийх
        if school:
            self.queryset = self.queryset.filter(student__school=school)

        if room:
            self.queryset = self.queryset.filter(room=room)

        if roomtype:
            self.queryset = self.queryset.filter(room_type=roomtype)

        all_datas = self.list(request).data
        total_in_balance = self.queryset.aggregate(Sum('in_balance'))['in_balance__sum'] or 0

        datas = self.queryset.aggregate(
            sum_payment=Sum('payment'),
            sum_first_uld=Sum(
                F('in_balance') - (F('payment') + F('ransom'))
            ),
            sum_in_balance=Sum('in_balance'),
            sum_out_balance=Sum('out_balance'),
            sum_out_payment=Sum('out_payment'),
            sum_ransom=Sum('ransom'),
            sum_lastuld=total_in_balance-(Sum(F('payment')) + Sum(F('ransom'))) - Sum(F('out_balance')),
        )

        if searchValue:
            results = all_datas.get('results')
            sum_payment = 0
            sum_first_uld = 0
            sum_in_balance = 0
            sum_out_balance = 0
            sum_out_payment = 0
            sum_lastuld = 0
            sum_ransom = 0
            for result in results:
                sum_payment += result.get('payment') if result.get('payment') else 0
                sum_first_uld += result.get('first_uld') if result.get('first_uld') else 0
                sum_in_balance += result.get('in_balance') if result.get('in_balance') else 0
                sum_out_balance += result.get('out_balance') if result.get('out_balance') else 0
                sum_out_payment += result.get('out_payment') if result.get('out_payment') else 0
                sum_lastuld += result.get('lastuld') if result.get('lastuld') else 0
                sum_ransom += result.get('ransom') if result.get('ransom') else 0

            datas = {
                'sum_payment': sum_payment,
                'sum_first_uld': sum_first_uld,
                'sum_in_balance': sum_in_balance,
                'sum_out_balance': sum_out_balance,
                'sum_out_payment': sum_out_payment,
                'sum_lastuld': sum_lastuld,
                'sum_ransom': sum_ransom,
            }

        check_datas = {
            'total_pay': datas,
            'return_datas': all_datas,
        }

        return request.send_data(check_datas)

    def put(self, request, pk=None):
        request_data = request.data

        change_out_payment = request_data.get('out_payment')       # Буцаах
        change_out_balance = request_data.get('out_balance')       # Буцаасан

        instance = self.queryset.filter(id=pk)

        if instance:
            is_success = False
            with transaction.atomic():
                try:
                    if change_out_payment:
                        instance.update(
                            out_payment=change_out_payment,
                        )

                    if change_out_balance:
                        instance.update(
                            out_balance=change_out_balance,
                        )
                    is_success = True
                except Exception:
                    raise

            if is_success:
                return request.send_info("INF_002")

        return request.send_error("ERR_002")


@permission_classes([IsAuthenticated])
class DormitoryOtherStudentEstimateRequestAPIView(
    mixins.ListModelMixin,
    generics.GenericAPIView,
    mixins.UpdateModelMixin,
    mixins.RetrieveModelMixin,
):

    ''' Гадны оюутны дотуур байрны төлбөрийн тооцоо '''

    queryset = DormitoryOtherStudent.objects.all()
    serializer_class = DormitoryOtherStudentSerializer

    pagination_class = CustomPagination
    filter_backends = [SearchFilter]

    search_fields = [
        'student__last_name',
        'student__first_name',
        'room_type__name',
        'room__room_number'
    ]

    def get_queryset(self):
        queryset = self.queryset

        school = self.request.query_params.get('school')
        sorting = self.request.query_params.get('sorting')
        lesson_year = self.request.query_params.get('lesson_year')
        room = self.request.query_params.get('room')
        roomtype = self.request.query_params.get('roomtype')

        # Хичээлийн жилээр хайлт хийх
        if lesson_year:
            self.queryset = self.queryset.filter(lesson_year=lesson_year)

        # Сургуулиар хайлт хийх
        if school:
            self.queryset = self.queryset.filter(student__school=school)

        if room:
            self.queryset = self.queryset.filter(room=room)

        if roomtype:
            self.queryset = self.queryset.filter(room_type=roomtype)

        # Sort хийх үед ажиллана
        if sorting:
            if not isinstance(sorting, str):
                sorting = str(sorting)

            queryset = queryset.order_by(sorting)

        return queryset

    def get(self, request, pk=None):
        self.serializer_class = DormitoryOtherStudentEstimateSerializer

        searchValue = self.request.query_params.get('search')

        all_datas = self.list(request).data
        total_in_balance = self.queryset.aggregate(Sum('in_balance'))['in_balance__sum'] or 0

        datas = self.queryset.aggregate(
            sum_payment=Sum('payment'),
            sum_first_uld=Sum(
                F('in_balance') - (F('payment') + F('ransom'))
            ),
            sum_in_balance=Sum('in_balance'),
            sum_out_balance=Sum('out_balance'),
            sum_out_payment=Sum('out_payment'),
            sum_ransom=Sum('ransom'),
            sum_lastuld=total_in_balance-Sum((F('payment') + F('ransom'))),
        )

        if searchValue:
            results = all_datas.get('results')
            sum_payment = 0
            sum_first_uld = 0
            sum_in_balance = 0
            sum_out_balance = 0
            sum_out_payment = 0
            sum_lastuld = 0
            sum_ransom = 0
            for result in results:
                sum_payment += result.get('payment') if result.get('payment') else 0
                sum_first_uld += result.get('first_uld') if result.get('first_uld') else 0
                sum_in_balance += result.get('in_balance') if result.get('in_balance') else 0
                sum_out_balance += result.get('out_balance') if result.get('out_balance') else 0
                sum_out_payment += result.get('out_payment') if result.get('out_payment') else 0
                sum_lastuld += result.get('lastuld') if result.get('lastuld') else 0
                sum_ransom += result.get('ransom') if result.get('ransom') else 0

            datas = {
                'sum_payment': sum_payment,
                'sum_first_uld': sum_first_uld,
                'sum_in_balance': sum_in_balance,
                'sum_out_balance': sum_out_balance,
                'sum_out_payment': sum_out_payment,
                'sum_lastuld': sum_lastuld,
                'sum_ransom': sum_ransom,
            }

        check_datas = {
            'total_pay': datas,
            'return_datas': all_datas,
        }

        return request.send_data(check_datas)

    def put(self, request, pk=None):
        request_data = request.data

        change_out_payment = request_data.get('out_payment')       # Буцаах
        change_out_balance = request_data.get('out_balance')       # Буцаасан

        instance = self.queryset.filter(id=pk)

        if instance:
            is_success = False
            with transaction.atomic():
                try:
                    if change_out_payment:
                        instance.update(
                            out_payment=change_out_payment,
                        )

                    if change_out_balance:
                        instance.update(
                            out_balance=change_out_balance,
                        )
                    is_success = True
                except Exception:
                    raise

            if is_success:
                return request.send_info("INF_002")

        return request.send_error("ERR_002")


@permission_classes([IsAuthenticated])
class DormitoryEstimationFamilyEstimateRequestAPIView(
    mixins.ListModelMixin,
    generics.GenericAPIView,
    mixins.UpdateModelMixin,
    mixins.RetrieveModelMixin,
):
    ''' Дотуур байранд сараар төлөлт хийж суудаг оршин суугчдын тооцоо '''

    queryset = DormitoryEstimationFamily.objects.all().order_by('updated_at')
    serializer_class = DormitoryEstimationFamilySerializer

    filter_backends = [SearchFilter]
    pagination_class = CustomPagination

    search_fields = [
        'year',
        'month',
        'payment',
        'ransom',
        'lastuld',
        'first_uld',
        'in_balance',
        'out_balance',
        'out_payment',
        'contract__teacher__last_name',
        'contract__teacher__first_name',
        'contract__teacher__register',
    ]

    def get_queryset(self):
        queryset = self.queryset
        sorting = self.request.query_params.get('sorting')

        # Sort хийх үед ажиллана
        if sorting:
            if not isinstance(sorting, str):
                sorting = str(sorting)

            queryset = queryset.order_by(sorting)

        return queryset

    def get(self, request):
        searchValue = self.request.query_params.get('search')
        year = self.request.query_params.get('year')
        month = self.request.query_params.get('month')
        payment_type = self.request.query_params.get('payment_type')
        is_teacher = self.request.query_params.get('is_teacher')        # Багш ажилчид эсэх True байвал багш ажилчид

        if is_teacher:
            is_teacher = str2bool(is_teacher)
            self.queryset = self.queryset.filter(contract__is_ourteacher=is_teacher)

        if year:
            self.queryset = self.queryset.filter(year=year)

        if month:
            self.queryset = self.queryset.filter(month=month)

        if payment_type:
            # NOTE Зөвхөн гэрээний хувьд идүү дутуугаар хайна
            dormitory_contract_qs = DormitoryFamilyContract.objects.all()
            contract_id = None
            estimation_id = None
            contract = None
            for contract_qs in dormitory_contract_qs:
                contract_id = contract_qs.id

                estimation_qs = self.queryset.filter(
                        contract=contract_id,
                    ).last()

                if estimation_qs:
                    estimation_id = estimation_qs.id

                # Төлбөрийн илүү
                if payment_type == '1':
                    check = self.queryset.filter(id=estimation_id, lastuld__gte=0).first()
                    if check:
                        contract = check.contract
                    self.queryset = self.queryset.filter(contract=contract)
                # Төлбөрийн дутуу
                else:
                    check = self.queryset.filter(id=estimation_id, lastuld__lte=0).first()
                    if check:
                        contract = check.contract
                    self.queryset = self.queryset.filter(contract=contract)

        all_datas = self.list(request).data

        datas = self.queryset.aggregate(
            sum_payment=Sum('payment'),
            sum_first_uld=Sum(
                F('in_balance') - (F('payment') + F('ransom'))
            ),
            sum_in_balance=Sum('in_balance'),
            sum_out_balance=Sum('out_balance'),
            sum_out_payment=Sum('out_payment'),
            sum_ransom=Sum('ransom'),
            # sum_lastuld=Sum(
            #    F('in_balance') - (F('payment') + F('ransom'))
            # ),
            sum_lastuld=(Sum(F('in_balance'))-(Sum(F('payment')) + Sum(F('ransom')))) - Sum(F('out_balance'))
        )

        if searchValue:
            results = all_datas.get('results')
            sum_payment = 0
            sum_first_uld = 0
            sum_in_balance = 0
            sum_out_balance = 0
            sum_out_payment = 0
            sum_lastuld = 0
            sum_ransom = 0
            for result in results:
                sum_payment += result.get('payment') if result.get('payment') else 0
                sum_first_uld += result.get('first_uld') if result.get('first_uld') else 0
                sum_in_balance += result.get('in_balance') if result.get('in_balance') else 0
                sum_out_balance += result.get('out_balance') if result.get('out_balance') else 0
                sum_out_payment += result.get('out_payment') if result.get('out_payment') else 0
                # sum_lastuld += result.get('lastuld') if result.get('lastuld') else 0
                sum_ransom += result.get('ransom') if result.get('ransom') else 0
                sum_lastuld = (sum_in_balance - (sum_payment + sum_ransom)) - sum_out_balance

            datas = {
                'sum_payment': sum_payment,
                'sum_first_uld': sum_first_uld,
                'sum_in_balance': sum_in_balance,
                'sum_out_balance': sum_out_balance,
                'sum_out_payment': sum_out_payment,
                'sum_lastuld': sum_lastuld,
                'sum_ransom': sum_ransom,
            }

        check_datas = {
            'total_pay': datas,
            'return_datas': all_datas,
        }

        return request.send_data(check_datas)

    def post(self, request):
        '''
            Бодолт хийх
            res_months - Гэрээ хийгдсэн нийт сарын тоо
            cmonth - Түрээслэсэн сар
            last_uld - Эцсийн үлдэгдэл
            old_first_uld - Тухайн сарын үлдэгдэл
            ransom - Барьцаа төлбөр
            year - Жил,
            month_payment - 1 Сарын төлбөр
            balance_amount - Тухайн сард төлсөн нийт төлбөр
            day_in_month - Тухайн сарын нийт хоног
            first_uldegdel - Эхний үлдэгдэл
            day_payment - 1 Хоногт тооцох төлбөр (Сарын төлбөрийг түрээслэсэн хоногийн тоогоор хувааж олов)
            is_teacher - Багш ажилчид эсэх True байвал багш ажилчид

        '''

        request_data = request.data
        sum_out_balance = 0
        instance = None
        is_teacher = None
        if request_data:
            butsaah = request_data.get('out_payment')
            butsaasan = request_data.get('out_balance')
            pk = request_data.get('id')
            is_teacher = request_data.get('is_teacher')

            if pk:
                instance = self.queryset.filter(id=pk)

        dormitory_contract_qs = DormitoryFamilyContract.objects.filter(
                is_ourteacher=is_teacher,
                solved_flag=DormitoryStudent.ALLOW
            )

        with transaction.atomic():
            try:
                if instance:
                    if butsaasan:
                        instance.update(
                            out_balance=butsaasan,
                        )

                    if butsaah:
                        instance.update(
                            out_payment=butsaah,
                        )

                for contract_qs in dormitory_contract_qs:
                    ransom = 0
                    contract_id = contract_qs.id
                    room_type = contract_qs.room_type
                    first_uldegdel = contract_qs.first_uldegdel or 0
                    year = contract_qs.solved_start_date.strftime('%Y')
                    user_id = contract_qs.teacher.id

                    start_date = contract_qs.solved_start_date
                    end_date = contract_qs.solved_finish_date

                    # Хэдэн сарын гэрээ хийснийг олно
                    delta = relativedelta.relativedelta(end_date, start_date)
                    res_months = delta.months + (delta.years * 12)

                    # Гэрээ эхлэх хугацаа
                    cmonth = int(start_date.strftime('%m')) - 1

                    # Өрөөний төрлөөс хамаарч сарын төлөх төлбөрийн хэмжээ, барьцаа төлбөрийн хэмжээ авах
                    dormitory_payment = DormitoryPayment.objects.filter(
                            room_type=room_type,
                        ).first()

                    # Сар жил
                    i = 0
                    day_payment = 0
                    last_uld = 0
                    old_first_uld = 0
                    while i <= int(res_months):
                        ransom = 0
                        i += 1
                        cmonth += 1

                        if cmonth > 12:
                            cmonth = int(cmonth - 12)
                            year = int(year) + 1

                        # 1 сарын түрээсийн төлбөр
                        if dormitory_payment:
                            month_payment = dormitory_payment.payment

                        # Төлсөн төлбөр
                        dormitory_balance = DormitoryOtherBalance.objects.filter(
                                student=user_id,
                                balance_date__year=year,
                                balance_date__month=cmonth,
                            ).aggregate(sum_balance_amount=Sum('balance_amount'))

                        if dormitory_balance:
                            balance_amount = dormitory_balance.get('sum_balance_amount') or 0

                        # Тухайн сарын хоног
                        day_in_month = calendar.monthrange(int(year), int(cmonth))[1]

                        # Нэг хоногийн төлбөрийн хэмжээ
                        if month_payment:
                            day_payment = month_payment // day_in_month

                            # Түрээслэж эхлэх сар
                            if i == 1:
                                old_first_uld = first_uldegdel
                                start_day = start_date.day

                                if dormitory_payment:
                                    ransom = dormitory_payment.ransom

                                if start_day < day_in_month:
                                    start_day = day_in_month - start_day
                                    month_payment = start_day * day_payment

                            # Түрээсийн хугацаа дуусах сар
                            if i > int(res_months):
                                end_day = end_date.day
                                if end_day < day_in_month:
                                    month_payment = end_day * day_payment

                        old_first_uld = balance_amount - (month_payment + ransom)
                        last_uld += old_first_uld

                        first_uldegdel = last_uld - old_first_uld
                        out_balance = 0
                        out_payment = 0
                        estimation_qs = self.queryset.filter(
                                contract=contract_id,
                                year=year,
                                month=cmonth
                            ).order_by('year', 'month')

                        for estimation in estimation_qs:
                            last_uldegdel = 0
                            out_balance = estimation.out_balance or 0
                            out_payment = estimation.out_payment or 0
                            payment = estimation.payment or 0
                            ransom = estimation.ransom or 0
                            in_balance = estimation.in_balance or 0
                            first_uld = estimation.first_uld or 0

                        if out_payment or out_balance:
                            check_payment = (payment + ransom) - out_payment      # Хэрэглэгчийн төлөх нийт төлбөр
                            last_uldegdel = first_uld - check_payment
                            last_uld = (last_uldegdel + in_balance) - out_balance

                        if estimation_qs:
                            with transaction.atomic():
                                estimation_qs.update(
                                    first_uld=first_uldegdel,
                                    payment=month_payment,
                                    ransom=ransom,
                                    in_balance=balance_amount,
                                    lastuld=last_uld,
                                )

                        else:
                            with transaction.atomic():
                                DormitoryEstimationFamily.objects.create(
                                    contract=DormitoryFamilyContract.objects.get(id=contract_id),
                                    year=year,
                                    month=cmonth,
                                    first_uld=first_uldegdel,
                                    payment=month_payment,
                                    ransom=ransom,
                                    in_balance=balance_amount,
                                    lastuld=last_uld,
                                )

            except Exception as e:
                print(e.__str__())
                return request.send_error(
                    "ERR_002", "Төлбөрийн бодолт хийхэд алдаа гарлаа"
                )

        return request.send_info("INF_014")

    def put(self, request, pk=None):
        '''
            out_balance - Өмнө нь буцааж байсан төлбөр
            sum_out_balance - Нийт буцаасан төлбөр
        '''

        request_data = request.data
        sum_out_balance = 0
        butsaah = request_data.get('out_payment')
        butsaasan = request_data.get('out_balance')

        instance = self.queryset.filter(id=pk)

        if instance:
            old_obj = instance.first()
            out_balance = old_obj.out_balance or 0

            if butsaasan:
                sum_out_balance = int(out_balance) + int(butsaasan)

            is_success = False
            with transaction.atomic():
                try:
                    if butsaah:
                        instance.update(
                            out_payment=butsaah,
                        )
                    if butsaasan:
                        instance.update(
                            out_balance=sum_out_balance,
                        )
                    is_success = True
                except Exception:
                    raise

            if is_success:
                return request.send_info("INF_002")

            return request.send_error("ERR_002")

        return request.send_info("INF_002")



@permission_classes([IsAuthenticated])
class InventoryRequestAPIView(
    mixins.ListModelMixin,
    generics.GenericAPIView,
    mixins.UpdateModelMixin,
    mixins.RetrieveModelMixin,
    mixins.CreateModelMixin,
    mixins.DestroyModelMixin,
):
    ''' Дотуур байр аж ахуй руу бараа материалын шаардах хуудас '''

    queryset = InventoryRequest.objects.all()
    serializer_class = InventoryRequestSerializer

    pagination_class = CustomPagination
    filter_backends = [SearchFilter]

    search_fields = [
        'name',
        'deadline',
        'amount',
    ]

    def get_queryset(self):
        queryset = self.queryset
        sorting = self.request.query_params.get('sorting')
        state = self.request.query_params.get('state')
        if state:
            queryset = self.queryset.filter(state=state)

        # Sort хийх үед ажиллана
        if sorting:
            if not isinstance(sorting, str):
                sorting = str(sorting)

            queryset = queryset.order_by(sorting)

        return queryset

    @has_permission(must_permissions=['lms-dormitory-inventory-request-read'])
    def get(self, request, pk=None):
        """ Бараа материалын шаардах хуудасны жагсаалт """

        self.serializer_class = InventoryRequestListSerializer

        if pk:
            datas = self.retrieve(request, pk).data
            return request.send_data(datas)

        list_datas = self.list(request).data

        return request.send_data(list_datas)

    @has_permission(must_permissions=['lms-dormitory-inventory-request-create'])
    def post(self, request):
        '''
            Бараа материалын шаардах хуудас илгээх
        '''
        with transaction.atomic():
            try:
                is_success = False
                datas = self.create(request).data

                name =datas.get('name')
                description =datas.get('description')

                is_success = True
                if is_success:

                    names = ["нягтлан бодогч"]
                    pos_ids = get_position_ids(names)
                    create_notif(
                        request,
                        [pos_ids],
                        "Шаардах хуудас",
                        "{name} барааг {description}".format(name=name, description=description),
                        Notification.SCOPE_KIND_USER,
                        Notification.FROM_KIND_POS,
                        'important'
                    )

            except Exception as e:
                print(e.__str__())
                return request.send_error(
                    "ERR_002", "Шаардах хуудас илгээхэд алдаа гарлаа"
                )
        return request.send_info("INF_001", "Ажиллттай илгээгдлээ")

    @has_permission(must_permissions=['lms-dormitory-inventory-request-update'])
    def put(self, request, pk=None):
        '''
            Бараа материалын шаардах хуудас засах
            update_new : БМ шинэ зураг
            image_old : БМ гэмтсэн зураг

        '''
        self.serializer_class = InventoryRequestPutSerializer

        request_data = request.data

        image_new = request_data.get('update_new')

        instance = self.get_object()

        if image_new and instance.image_new:
            remove_new_image = os.path.join(settings.INV_NEW, str(pk))
            if remove_new_image:
                remove_folder(remove_new_image)

        with transaction.atomic():
            try:

                update_data = {
                    'description': request_data.get('description')
                }

                if image_new:
                    update_data['image_new'] = image_new
                    request_data['image_new'] = image_new

                    self.update(request).data

                else:
                    self.queryset.filter(pk=pk).update(
                        **update_data
                    )

            except Exception as e:
                print(e.__str__())
                return request.send_error(
                    "ERR_002", "Шаардах хуудас засахад алдаа гарлаа"
                )
        return request.send_info("INF_002")

    @has_permission(must_permissions=['lms-dormitory-inventory-request-delete'])
    def delete(self, request, pk=None):
        "Бараа материалын шаардах хуудас устгах"

        request_data = request.data
        image_old = request_data.get("image_old")
        image_new = request_data.get("image_new")
        dor_inv_obj = self.queryset.filter(id=pk)
        if pk and image_old and image_new:
            remove_new_image = os.path.join(settings.INV_NEW, str(pk))
            if remove_new_image:
                remove_folder(remove_new_image)

            remove_old_image = os.path.join(settings.INV_OLD, str(pk))
            if remove_old_image:
                remove_folder(remove_old_image)

        self.destroy(request, pk)

        return request.send_info("INF_003")



class InventoryListAPIView(
    mixins.ListModelMixin,
    generics.GenericAPIView,
):
    ''' Бараа материалын жагсаалт '''

    queryset = InventoryRegister.objects
    serializer_class = InventoryListSerializer

    def get(self, request):
        """ Барааны жагсаалт """

        list_datas = self.list(request).data
        return request.send_data(list_datas)


class PaymentTransactionAPIView(
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    mixins.RetrieveModelMixin,
    generics.GenericAPIView
):
    """ Төлбөрийн гүйлгээ гүйлгээ """

    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer
    pagination_class = CustomPagination

    def get(self, request, pk=None):

        lesson_year = request.query_params.get('lesson_year')
        lesson_season = request.query_params.get('lesson_season')
        search_value = request.query_params.get('search')
        paymentType = request.query_params.get('paymentType')

        page = int(request.query_params.get('page'))
        limit = int(request.query_params.get('limit'))

        filters = dict()
        check_qs = list()

        if not lesson_year:
            lesson_year, lesson_season = get_active_year_season()

        if lesson_season and int(lesson_season) == 1:
            begin_date = date(int(lesson_year[0:4]), 7, 1)
            end_date = date(int(lesson_year[0:4]), 12, 31)
        else:
            begin_date = date(int(lesson_year[-4:]), 1, 1)
            end_date = date(int(lesson_year[-4:]), 6, 30)

        if paymentType:
            paymentType = int(paymentType)
            if paymentType == 1:
                filters['transaction__isnull'] = False
            else:
                filters['transaction__isnull'] = True

        journalstudent_qs = JournalStudent.objects.filter(journal__account__type__contains=13)

        all_payment_qs = (
            Payment
            .objects
            .filter(
                status=True,
                dedication=Payment.DORMITORY,
                paid_rsp__isnull=False,
                payed_date__date__gte=begin_date,
                payed_date__date__lte=end_date,
            )
        )

        # Хайлт хийх үед ажиллана.
        if search_value:
            search_fields = [
                'journal__amount',
                'journal__transiction__description',
                'journal__transiction__date',
                'student__last_name',
                'student__first_name',
            ]
            journalstudent_qs = _filter_queries(journalstudent_qs, search_value, search_fields)

            payment_search_fields = [
                'description',
                'payed_date',
                'student__last_name',
                'student__first_name',
                'user__teachers__last_name',
                'user__teachers__first_name',
            ]
            all_payment_qs = _filter_queries(all_payment_qs, search_value, payment_search_fields)

        if not paymentType or int(paymentType) == 2:
            check_qs = (
                journalstudent_qs
                .annotate(
                    cdt_amount=Case(
                        When(journal__is_debet=True, then=Value(None)),
                        default=F('journal__amount'), output_field=FloatField(),
                    ),
                    ckt_amount=Case(
                        When(journal__is_debet=False, then=Value(None)),
                        default=F('journal__amount'), output_field=FloatField(),
                    ),
                    dt_amount=Sum('cdt_amount'),
                    kt_amount=Sum('ckt_amount'),
                    student_name=Concat(Upper(Substr("student__last_name", 1, 1)), Value(". "), "student__first_name", output_field=CharField()),
                )
                .values(
                    'dt_amount',
                    'kt_amount',
                    'student_name',
                    user_name=Value(''),
                    paid_rsp=Value(''),
                    is_qpay=Value(False),
                    payed_date=F('journal__transiction__date'),
                    description=F('journal__transiction__description'),
                )
            )

        journal_qs = (
            Journal
            .objects
            .filter(
                transiction=OuterRef('transaction'),
                account__type__contains=13,
                transiction__date__gte=begin_date,
                transiction__date__lte=end_date,
            )
            .annotate(
                student=Subquery(
                    JournalStudent.objects.filter(journal=OuterRef('id')).values('student')[:1]
                ),
                is_student=Case(
                    When(student__isnull=True, then=Value(False)),
                    default=True, output_field=BooleanField(),
                ),
            )
            .annotate(
                dt_amount=Case(
                    When(is_debet=True, then=Value(None)),
                    default=F('amount'), output_field=FloatField(),
                ),
                kt_amount=Case(
                    When(is_debet=False, then=Value(None)),
                    default=F('amount'), output_field=FloatField(),
                ),
                sum_dt_amount=Sum('dt_amount'),
                sum_kt_amount=Sum('kt_amount'),
            )
            .filter(is_student=False)
            .values('sum_dt_amount', 'sum_kt_amount')
        )

        payment_qs = (
            all_payment_qs
            .filter(
                **filters
            )
            .annotate(
                dt_amount=Subquery(journal_qs.values('sum_dt_amount')),
                kt_amount=Subquery(journal_qs.values('sum_kt_amount')),
                is_qpay=Case(
                    When(transaction__isnull=False, then=Value(True)),
                    When(transaction__isnull=True, then=Value(False))
                ),
                student_name=Concat(Upper(Substr("student__last_name", 1, 1)), Value(". "), "student__first_name", output_field=CharField()),
                user_name=Concat(Upper(Substr("user__teachers__last_name", 1, 1)), Value(". "), "user__teachers__first_name", output_field=CharField()),
            )
            .values(
                'dt_amount',
                'kt_amount',
                'student_name',
                'user_name',
                'payed_date',
                'description',
                'paid_rsp',
                'is_qpay'
            )
        )

        check_union_qs = None
        datas = dict()

        check_union_qs = list(chain(check_qs, payment_qs))

        if check_union_qs and len(check_union_qs) > 0:

            count = len(check_union_qs)

            paginator = Paginator(check_union_qs, limit)

            try:
                results = paginator.page(page)
            except PageNotAnInteger:
                results = paginator.page(1)
            except EmptyPage:
                results = paginator.page(paginator.num_pages)

            datas = {
                'results': list(results),
                'count': count
            }

        return request.send_data(datas)

