from django.db.models import F
from datetime import datetime
from rest_framework import mixins
from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.filters import SearchFilter

from lms.models import Rule, Score
from lms.models import Group
from lms.models import Season
from lms.models import Student
from lms.models import Learning
from lms.models import LessonType
from lms.models import LessonType
from lms.models import LessonLevel
from lms.models import LessonGroup
from lms.models import DiscountType
from lms.models import SystemSettings
from lms.models import LessonCategory
from lms.models import AdmissionLesson
from lms.models import StudentRegister
from lms.models import ProfessionalDegree
from lms.models import ProfessionDefinition
from lms.models import Country
from lms.models import TimeTable
from lms.models import DefinitionSignature
from core.models import Permissions
from core.models import Roles
from lms.models import AdmissionBottomScore
from lms.models import PrintSettings
from lms.models import ScoreRegister
from lms.models import StudentGrade
from lms.models import GradeLetter

from .serializers import RuleSerializer, ScoreSerailizer
from .serializers import SeasonSerailizer
from .serializers import LearningSerializer
from .serializers import LessonTypeSerailizer
from .serializers import LessonLevelSerailizer
from .serializers import LessonGroupSerailizer
from .serializers import DiscountTypeSerializer
from .serializers import LessonCategorySerializer
from .serializers import SystemSettingsSerailizer
from .serializers import StudentRegisterSerializer
from .serializers import AdmissionLessonSerializer
from .serializers import DiscountTypeListSerializer
from .serializers import ProfessionalDegreeSerializer
from .serializers import AdmissionLessonListSerializer
from .serializers import ProfessionalDegreePutSerializer
from .serializers import CountrySerializer
from .serializers import DefinitionSignatureSerializer
from .serializers import PermissionsSerializer
from .serializers import RolesSerializer
from .serializers import RolesListSerializer
from .serializers import PrintSettingsListSerializer
from .serializers import PrintSettingsSerializer
from .serializers import OrgPosition
from .serializers import GradeLetterSerializer


from django.db import transaction
from django.db.models import  Sum, F, FloatField, OuterRef, Subquery, Value, Max, Q
from django.db.models.functions import Coalesce

from django.core.files.uploadedfile import InMemoryUploadedFile

from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes

from main.utils.function.pagination import CustomPagination
from main.utils.function.utils import create_file_in_cdn_silently, delete_objects_with_signals, has_permission, is_access_for_case_1, is_access_for_case_2, save_data_with_signals
from main.decorators import login_required
from main.utils.function.serializer import post_put_action


@permission_classes([IsAuthenticated])
class ProfessionalDegreeAPIView(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    generics.GenericAPIView
):

    """ Мэргэжлийн зэрэг """

    queryset = ProfessionalDegree.objects.all().order_by("-created_at")
    serializer_class = ProfessionalDegreeSerializer

    @has_permission(must_permissions=['lms-settings-degree-read'])
    def get(self, request, pk=None):
        " Мэргэжлийн зэргийн жагсаалт "

        org = getattr(request, 'org_filter', {}).get('org')

        if org:
            self.queryset = self.queryset.filter(org=org)

        if pk:
            degree_info = self.retrieve(request, pk).data
            return request.send_data(degree_info)

        degree_list = self.list(request).data
        return request.send_data(degree_list)

    @has_permission(must_permissions=['lms-settings-degree-create'])
    def post(self, request):
        " Мэргэжлийн зэргийн мэдээлэл шинээр үүсгэх "

        org = getattr(request, 'org_filter', {}).get('org')

        if not org:
            return request.send_error("ERR_002", "Таньд боловсролын зэрэг нэмэх эрх байхгүй байна")

        request.data["org"] = org.id
        serializer = self.get_serializer(data=request.data)

        if serializer.is_valid(raise_exception=False):
            with transaction.atomic():
                try:
                    self.perform_create(serializer)

                except Exception:
                    return request.send_error("ERR_002")

            return request.send_info("INF_001")

        else:
            # Олон алдааны мессэж буцаах бол үүнийг ашиглана
            for key in serializer.errors:

                return_error = {
                    "field": key,
                    "msg": "Код бүртгэгдсэн байна"
                }

            return request.send_error_valid(return_error)

    @has_permission(must_permissions=['lms-settings-degree-update'])
    def put(self, request, pk=None):
        "Мэргэжлийн зэргийн засах"

        self.serializer_class = ProfessionalDegreePutSerializer

        datas = request.data
        prof_qs = ProfessionDefinition.objects.exclude(degree=pk).filter(code=datas.get('code'))
        if len(prof_qs) > 0:
            return request.send_error("ERR_003", "Зэргийн код давхцаж байна.")

        instance = self.queryset.filter(id=pk).first()
        serializer = self.get_serializer(instance, data=datas)

        if serializer.is_valid(raise_exception=False):

            with transaction.atomic():
                try:
                    self.perform_update(serializer)

                except Exception:
                    return request.send_error("ERR_002")

            return request.send_info("INF_002")

        else:
            # Олон алдааны мессэж буцаах бол үүнийг ашиглана
            for key in serializer.errors:

                return_error = {
                    "field": key,
                    "msg": "Код бүртгэгдсэн байна"
                }

            return request.send_error_valid(return_error)

    @has_permission(must_permissions=['lms-settings-degree-delete'])
    def delete(self, request, pk=None):
        prof_qs = ProfessionDefinition.objects.filter(degree=pk)
        if prof_qs:
            return request.send_error("ERR_003", "Мэргэжлийн тодорхойлолтод холбогдсон байгаа тул устгах боломжгүй")

        self.destroy(request, pk)
        return request.send_info("INF_003")


@permission_classes([IsAuthenticated])
class LearningAPIView(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    generics.GenericAPIView
):

    """ Суралцах хэлбэр """

    queryset = Learning.objects.all().order_by("-created_at")
    serializer_class = LearningSerializer

    @has_permission(must_permissions=['lms-settings-learningstatus-read'])
    def get(self, request, pk=None):
        " Суралцах хэлбэр жагсаалт "

        org = getattr(request, 'org_filter', {}).get('org')

        if org:
            self.queryset = self.queryset.filter(org=org)

        if pk:
            learning_info = self.retrieve(request, pk).data
            return request.send_data(learning_info)

        learning_list = self.list(request, pk).data
        return request.send_data(learning_list)

    @has_permission(must_permissions=['lms-settings-learningstatus-create'])
    def post(self, request):
        " Суралцах хэлбэр мэдээлэл шинээр үүсгэх "

        org = getattr(request, 'org_filter', {}).get('org')

        if not org:
            return request.send_error("ERR_002", "Таньд суралцах хэлбэр нэмэх эрх байхгүй байна")

        request.data["org"] = org.id

        serializer = self.get_serializer(data=request.data)

        if serializer.is_valid(raise_exception=False):
            with transaction.atomic():
                try:
                    self.perform_create(serializer)

                except Exception:
                    return request.send_error("ERR_002")

            return request.send_info("INF_001")

        else:
            # Олон алдааны мессэж буцаах бол үүнийг ашиглана
            for key in serializer.errors:

                return_error = {
                    "field": key,
                    "msg": "Код бүртгэгдсэн байна"
                }

            return request.send_error_valid(return_error)

    @has_permission(must_permissions=['lms-settings-learningstatus-update'])
    def put(self, request, pk=None):
        " Суралцах хэлбэр засах"

        group_qs=Group.objects.filter(learning_status=pk)
        if group_qs:
            return request.send_error("ERR_003", " Тухайн суралцах хэлбэр ангид бүртгэлтэй байгаа тул засах боломжгүй байна.")

        datas = request.data
        instance = self.queryset.filter(id=pk).first()
        serializer = self.get_serializer(instance, data=datas)

        if serializer.is_valid(raise_exception=False):
            with transaction.atomic():
                try:
                    self.perform_update(serializer)

                except Exception:
                    return request.send_error("ERR_002")

            return request.send_info("INF_002")

        else:
            # Олон алдааны мессэж буцаах бол үүнийг ашиглана
            for key in serializer.errors:

                return_error = {
                    "field": key,
                    "msg": "Код бүртгэгдсэн байна"
                }

            return request.send_error_valid(return_error)

    @has_permission(must_permissions=['lms-settings-learningstatus-delete'])
    def delete(self, request, pk=None):
        "Суралцах хэлбэр устгах"

        # Анги
        group_qs = Group.objects.filter(learning_status=pk)
        if len(group_qs) > 0:
            return request.send_error("ERR_003", "Ангитай холбогдсон байгаа тул устгах боломжгүй")

        self.destroy(request, pk)

        return request.send_info("INF_003")


@permission_classes([IsAuthenticated])
class StudentRegisterAPIView(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    generics.GenericAPIView
):

    """ Оюутны бүртгэлийн хэлбэр """

    queryset = StudentRegister.objects.all().order_by("-created_at")
    serializer_class = StudentRegisterSerializer

    @has_permission(must_permissions=['lms-settings-registerstatus-read'])
    def get(self, request, pk=None):
        " Оюутны бүртгэл жагсаалт "

        org = getattr(request, 'org_filter', {}).get('org')

        if org:
            self.queryset = self.queryset.filter(org=org)

        if pk:
            register = self.retrieve(request, pk).data
            return request.send_data(register)

        student_list = self.list(request, pk).data
        return request.send_data(student_list)

    @has_permission(must_permissions=['lms-settings-registerstatus-create'])
    def post(self, request):
        " Оюутны бүртгэл хэлбэр шинээр үүсгэх "

        org = getattr(request, 'org_filter', {}).get('org')

        if not org:
            return request.send_error("ERR_002", "Оюутны бүртгэлийн хэлбэр нэмэх эрх байхгүй байна")

        data = request.data
        data["org"] = org.id
        serializer = self.get_serializer(data=data)

        if serializer.is_valid(raise_exception=False):
            with transaction.atomic():
                try:
                    self.perform_create(serializer)

                except Exception:
                    return request.send_error("ERR_002")

            return request.send_info("INF_001")

        else:
            # Олон алдааны мессэж буцаах бол үүнийг ашиглана
            for key in serializer.errors:

                return_error = {
                    "field": key,
                    "msg": "Код бүртгэгдсэн байна"
                }

            return request.send_error_valid(return_error)

    @has_permission(must_permissions=['lms-settings-registerstatus-update'])
    def put(self, request, pk=None):
        "Оюутны бүртгэл засах"

        datas = request.data

        instance = self.queryset.filter(id=pk).first()

        serializer = self.get_serializer(instance, data=datas)

        if serializer.is_valid(raise_exception=False):
            with transaction.atomic():
                try:
                    self.perform_update(serializer)

                except Exception:
                    return request.send_error("ERR_002")

            return request.send_info("INF_002")

        else:
            # Олон алдааны мессэж буцаах бол үүнийг ашиглана
            for key in serializer.errors:

                return_error = {
                    "field": key,
                    "msg": "Код бүртгэгдсэн байна"
                }
            return request.send_error_valid(return_error)

    @has_permission(must_permissions=['lms-settings-registerstatus-delete'])
    def delete(self, request, pk=None):
        " Оюутны бүртгэл устгах "

        stud_qs = Student.objects.filter(status=pk)
        if len(stud_qs) >0:
            return request.send_error("ERR_004", "Оюутны бүртгэлтэй холбогдсон тул устгах боломжгүй")
        self.destroy(request, pk)
        return request.send_info("INF_003")

@permission_classes([IsAuthenticated])
class LessonCategoryAPIView(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    generics.GenericAPIView
):

    """ Хичээлийн ангилал """

    queryset = LessonCategory.objects.all().order_by("-created_at")
    serializer_class = LessonCategorySerializer

    @has_permission(must_permissions=['lms-settings-lessoncategory-read'])
    def get(self, request, pk=None):
        " Хичээлийн ангиллын жагсаалт "

        org = getattr(request, 'org_filter', {}).get('org')

        if org:
            self.queryset = self.queryset.filter(org=org)

        if pk:
            category = self.retrieve(request, pk).data
            return request.send_data(category)

        less_cate_list = self.list(request).data
        return request.send_data(less_cate_list)

    @has_permission(must_permissions=['lms-settings-lessoncategory-create'])
    def post(self, request):
        " Хичээлийн ангиллыг шинээр үүсгэх "

        org = getattr(request, 'org_filter', {}).get('org')

        if not org:
            return request.send_error("ERR_002", "Таньд хичээлийн ангилал нэмэх эрх байхгүй байна")

        request.data["org"] = org.id
        serializer = self.get_serializer(data=request.data)

        if serializer.is_valid(raise_exception=False):
            with transaction.atomic():
                try:
                    self.perform_create(serializer)

                except Exception:
                    return request.send_error("ERR_002")

            return request.send_info("INF_001")

        else:
            # Олон алдааны мессэж буцаах бол үүнийг ашиглана
            for key in serializer.errors:

                return_error = {
                    "field": key,
                    "msg": "Код бүртгэгдсэн байна"
                }

            return request.send_error_valid(return_error)


    @has_permission(must_permissions=['lms-settings-lessoncategory-update'])
    def put(self, request, pk=None):
        "Хичээлийн ангилал засах"

        datas = request.data
        instance = self.queryset.filter(id=pk).first()
        serializer = self.get_serializer(instance, data=datas)
        if serializer.is_valid(raise_exception=False):
            with transaction.atomic():
                try:
                    self.perform_update(serializer)

                except Exception:
                    return request.send_error("ERR_002")

            return request.send_info("INF_002")
        else:
            # Олон алдааны мессэж буцаах бол үүнийг ашиглана
            for key in serializer.errors:

                return_error = {
                    "field": key,
                    "msg": "Код бүртгэгдсэн байна"
                }

                return request.send_error_valid(return_error)

    @has_permission(must_permissions=['lms-settings-lessoncategory-delete'])
    def delete(self, request, pk=None):
        " Хичээлийн ангилал устгах "

        self.destroy(request, pk)
        return request.send_info("INF_003")


@permission_classes([IsAuthenticated])
class LessonTypeAPIView(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    generics.GenericAPIView
):

    """ Хичээлийн төрөл """

    queryset = LessonType.objects.all().order_by("-created_at")
    serializer_class = LessonTypeSerailizer

    @has_permission(must_permissions=['lms-settings-lessontype-read'])
    def get(self, request, pk=None):
        " Хичээлийн төрөл жагсаалт "

        if pk:
            lesson_type = self.retrieve(request, pk).data
            return request.send_data(lesson_type)

        less_type_list = self.list(request, pk).data
        return request.send_data(less_type_list)

    @has_permission(must_permissions=['lms-settings-lessontype-create'])
    def post(self, request):
        " Хичээлийн төрөл шинээр үүсгэх"

        data = request.data
        type_code = data.get("type_code")

        serializer = self.get_serializer(data=request.data)

        if serializer.is_valid(raise_exception=False):
            is_success = False
            with transaction.atomic():
                try:
                    self.create(request).data

                    is_success = True
                except Exception:
                    raise
            if is_success:
                return request.send_info("INF_001")

            return request.send_error("ERR_002")

        else:
            if type_code:
                less_type_info = self.queryset.filter(type_code=type_code)
                if less_type_info:
                    error_obj = {
                        "error": serializer.errors,
                        "msg": "Код давхцаж байна"
                    }
                    return request.send_error("ERR_004", error_obj)

            return request.send_error("ERR_002")

    @has_permission(must_permissions=['lms-settings-lessontype-update'])
    def put(self, request, pk=None):
        " Хичээлийн төрөл засах"

        datas = request.data
        serializer = self.get_serializer(data=datas)

        if serializer.is_valid(raise_exception=False):

            self.update(request, pk).data
            return request.send_info("INF_002")
        else:
            errors = []
            type_code = datas.get("type_code")
            if type_code:
                lesson_type = self.queryset.filter(type_code=type_code)
                if lesson_type:
                    return request.send_error("ERR_003", "Хичээлийн төрлийн код давхцаж байна")

            for key in serializer.errors:
                msg = "Хоосон байна"

                return_error = {
                    "field": key,
                    "msg": msg
                }

                errors.append(return_error)

            if len(errors) > 0:
                return request.send_error("ERR_003", errors)

    @has_permission(must_permissions=['lms-settings-lessontype-delete'])
    def delete(self, request, pk=None):
        " Хичээлийн төрөл устгах "

        self.destroy(request, pk)
        return request.send_info("INF_003")

@permission_classes([IsAuthenticated])
class LessonLevelAPIView(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    generics.GenericAPIView
):

    """ Хичээлийн түвшин """

    queryset = LessonLevel.objects
    serializer_class = LessonLevelSerailizer

    @has_permission(must_permissions=['lms-settings-lessonlevel-read'])
    def get(self, request, pk=None):
        " Хичээлийн түвшин жагсаалт "
        if pk:
            lesson_level = self.retrieve(request, pk).data
            return request.send_data(lesson_level)

        lesson_level_list = self.list(request, pk).data
        return request.send_data(lesson_level_list)

    @has_permission(must_permissions=['lms-settings-lessonlevel-create'])
    def post(self, request):
        " Хичээлийн түвшин шинээр үүсгэх "

        data = request.data
        level_code = data.get("level_code")
        serializer = self.get_serializer(data=request.data)

        if serializer.is_valid(raise_exception=False):
            is_success = False
            with transaction.atomic():
                try:
                    self.create(request).data

                    is_success = True
                except Exception:
                    raise
            if is_success:
                return request.send_info("INF_001")

            return request.send_error("ERR_002")

        else:
            if level_code:
                less_lvl_info = self.queryset.filter(level_code=level_code)
                if less_lvl_info:
                    error_obj = {
                        "error": serializer.errors,
                        "msg": "Код давхцаж байна"
                    }
                    return request.send_error("ERR_004", error_obj)

            return request.send_error("ERR_002")

    @has_permission(must_permissions=['lms-settings-lessonlevel-update'])
    def put(self, request, pk=None):
        " Хичээлийн түвшин засах"

        datas = request.data
        serializer = self.get_serializer(data=datas)

        if serializer.is_valid(raise_exception=False):

            self.update(request, pk).data
            return request.send_info("INF_002")
        else:
            errors = []
            group_code = datas.get("group_code")
            if group_code:
                lesson_group = self.queryset.filter(group_code=group_code)
                if lesson_group:
                    return request.send_error("ERR_003", "Хичээлийн бүлгийн код давхцаж байна")

            for key in serializer.errors:
                msg = "Хоосон байна"

                return_error = {
                    "field": key,
                    "msg": msg
                }

                errors.append(return_error)

            if len(errors) > 0:
                return request.send_error("ERR_003", errors)

    # @has_permission(must_permissions=['lms-settings-lessonlevel-delete'])
    def delete(self, request, pk=None):
        " Хичээлийн түвшин устгах "

        self.destroy(request, pk)
        return request.send_info("INF_003")

@permission_classes([IsAuthenticated])
class LessonGroupAPIView(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    generics.GenericAPIView
):

    """ Хичээлийн бүлэг """

    queryset = LessonGroup.objects.all().order_by("-created_at")
    serializer_class = LessonGroupSerailizer

    @has_permission(must_permissions=['lms-settings-lessongroup-read'])
    def get(self, request, pk=None):
        " Хичээлийн бүлэг жагсаалт "
        org = getattr(request, 'org_filter', {}).get('org')

        if org:
            self.queryset = self.queryset.filter(org=org)

        if pk:
            lesson_group = self.retrieve(request, pk).data
            return request.send_data(lesson_group)

        lesson_group_list = self.list(request, pk).data
        return request.send_data(lesson_group_list)

    @has_permission(must_permissions=['lms-settings-lessongroup-create'])
    def post(self, request):
        " Хичээлийн бүлэг шинээр үүсгэх "

        org = getattr(request, 'org_filter', {}).get('org')

        if not org:
            return request.send_error("ERR_002", "Таньд хичээлийн бүлэг нэмэх эрх байхгүй байна")

        request.data["org"] = org.id
        serializer = self.get_serializer(data=request.data)

        if serializer.is_valid(raise_exception=False):
            with transaction.atomic():
                try:
                    self.perform_create(serializer)

                except Exception:
                    return request.send_error("ERR_002")

            return request.send_info("INF_001")

        else:
            # Олон алдааны мессэж буцаах бол үүнийг ашиглана
            for key in serializer.errors:

                return_error = {
                    "field": key,
                    "msg": "Код бүртгэгдсэн байна"
                }

            return request.send_error_valid(return_error)

    @has_permission(must_permissions=['lms-settings-lessongroup-update'])
    def put(self, request, pk=None):
        " Хичээлийн бүлэг засах"

        datas = request.data
        instance = self.queryset.filter(id=pk).first()
        serializer = self.get_serializer(instance, data=datas)

        if serializer.is_valid(raise_exception=False):
            with transaction.atomic():
                try:
                    self.perform_update(serializer)

                except Exception:
                    return request.send_error("ERR_002")

            return request.send_info("INF_002")
        else:
            for key in serializer.errors:

                return_error = {
                    "field": key,
                    "msg": "Код бүртгэгдсэн байна"
                }

            return request.send_error_valid(return_error)

    @has_permission(must_permissions=['lms-settings-lessongroup-delete'])
    def delete(self, request, pk=None):
        " Хичээлийн бүлэг устгах "

        self.destroy(request, pk)
        return request.send_info("INF_003")

@permission_classes([IsAuthenticated])
class SeasonAPIView(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    generics.GenericAPIView
):

    """ Улирал """

    queryset = Season.objects.all().order_by("-created_at")
    serializer_class = SeasonSerailizer

    @has_permission(must_permissions=['lms-settings-season-read'])
    def get(self, request, pk=None):
        " улирлын жагсаалт "

        if not is_access_for_case_1(request):
            return request.send_data([])

        if not request.user.is_superuser:
            self.queryset = self.queryset.filter(org=request.org_filter['org'])

        if pk:
            season = self.retrieve(request, pk).data
            return request.send_data(season)

        season_list = self.list(request, pk).data
        return request.send_data(season_list)

    @has_permission(must_permissions=['lms-settings-season-create'])
    def post(self, request):
        " улирал шинээр үүсгэх "

        if not is_access_for_case_1(request):
            return request.send_error("ERR_002", "Таньд улирал нэмэх эрх байхгүй байна")

        if not request.user.is_superuser:
            request.data['org'] = request.org_filter['org'].id

        data = request.data
        season_code = data.get("season_code")
        serializer = self.get_serializer(data=data)

        if serializer.is_valid(raise_exception=False):
            with transaction.atomic():
                try:
                    self.perform_create(serializer)

                except Exception:
                    return request.send_error("ERR_002")

            return request.send_info("INF_001")

        else:
            if season_code:
                less_season_info = self.queryset.filter(season_code=season_code)
                if len(less_season_info) > 0:
                    error_obj = {
                        "error": serializer.errors,
                        "msg": "Код давхцаж байна"
                    }
                    return request.send_error("ERR_004", error_obj)

            return request.send_error("ERR_002")

    @has_permission(must_permissions=['lms-settings-season-update'])
    def put(self, request, pk=None):
        " Улирал засах"

        if not is_access_for_case_2(request, pk):
            return request.send_error("ERR_002", "Эрх байхгүй байна")

        datas = request.data
        season_code = datas.get("season_code")
        instance = self.queryset.filter(id=pk).first()
        serializer = self.get_serializer(instance, data=datas)

        if serializer.is_valid(raise_exception=False):
            self.perform_update(serializer)
            return request.send_info("INF_002")

        else:
            for key in serializer.errors:

                return_error = {
                    "field": key,
                    "msg": "Код давхцаж байна."
                }
            if season_code:
                less_season_info = self.queryset.filter(season_code=season_code)
                if len(less_season_info) > 0:
                    return request.send_error_valid([return_error])

            return request.send_error("ERR_002")

    @has_permission(must_permissions=['lms-settings-season-delete'])
    def delete(self, request, pk=None):
        " Улирал устгах "

        if not is_access_for_case_2(request, pk):
            return request.send_error("ERR_002", "Эрх байхгүй байна")

        timetable_qs = TimeTable.objects.filter(lesson_season=pk)
        if len(timetable_qs) > 0:
            return request.send_error("Хичээлийн хуваарьтай холбогдсон байгаа тул устгах боломжгүй")

        self.destroy(request, pk)
        return request.send_info("INF_003")


@permission_classes([IsAuthenticated])
class ScoreAPIView(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    generics.GenericAPIView
):

    """ Үнэлгээний бүртгэл """

    queryset = Score.objects.all().order_by("-created_at")
    serializer_class = ScoreSerailizer

    @has_permission(must_permissions=['lms-settings-score-read'])
    def get(self, request, pk=None):
        " Үнэлгээний жагсаалт "

        org = getattr(request, 'org_filter', {}).get('org')

        if org:
            self.queryset = self.queryset.filter(org=org)

        if pk:
            score = self.retrieve(request, pk).data
            return request.send_data(score)

        score_list = self.list(request, pk).data
        return request.send_data(score_list)

    @has_permission(must_permissions=['lms-settings-score-create'])
    def post(self, request):
        " Үнэлгээ шинээр үүсгэх "

        org = getattr(request, 'org_filter', {}).get('org')

        if not org:
            return request.send_error("ERR_002", "Таньд үнэлгээний бүртгэл нэмэх эрх байхгүй байна")

        request.data["org"] = org.id
        serializer = self.get_serializer(data=request.data)

        if serializer.is_valid(raise_exception=False):
            with transaction.atomic():
                try:
                    self.perform_create(serializer)

                except Exception:
                    return request.send_error("ERR_002")

            return request.send_info("INF_001")

        else:
            # Олон алдааны мессэж буцаах бол үүнийг ашиглана
            for key in serializer.errors:

                return_error = {
                    "field": key,
                    "msg": "Код бүртгэгдсэн байна"
                }

            return request.send_error_valid(return_error)

    @has_permission(must_permissions=['lms-settings-score-update'])
    def put(self, request, pk=None):
        "Үнэлгээний бүртгэл засах"

        datas = request.data

        instance = self.queryset.filter(id=pk).first()
        serializer = self.get_serializer(instance, data=datas)

        if serializer.is_valid(raise_exception=False):
            with transaction.atomic():
                try:
                    self.perform_create(serializer)

                except Exception:
                    return request.send_error("ERR_002")

            return request.send_info("INF_002")

        else:
            # Олон алдааны мессэж буцаах бол үүнийг ашиглана
            for key in serializer.errors:

                return_error = {
                    "field": key,
                    "msg": "Код бүртгэгдсэн байна"
                }

            return request.send_error_valid(return_error)

    @has_permission(must_permissions=['lms-settings-score-delete'])
    def delete(self, request, pk=None):
        " Үнэлгээний бүртгэл устгах "

        self.destroy(request, pk)
        return request.send_info("INF_003")


@permission_classes([IsAuthenticated])
class SystemSettingsAPIView(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    generics.GenericAPIView
):

    """ Системийн ажиллах жилийн тохиргоо """

    queryset = SystemSettings.objects.all().order_by("-created_at")
    serializer_class = SystemSettingsSerailizer

    @has_permission(must_permissions=['lms-settings-аctiveyear-read'])
    def get(self, request, pk=None):
        " ажиллах жилийн жагсаалт "

        if not is_access_for_case_1(request):
            return request.send_data([])

        if not request.user.is_superuser:
            self.queryset = self.queryset.filter(org=request.org_filter['org'])

        if pk:
            main = self.retrieve(request, pk).data
            return request.send_data(main)

        main_list = self.list(request, pk).data
        return request.send_data(main_list)

    @has_permission(must_permissions=['lms-settings-аctiveyear-create'])
    def post(self, request):
        with transaction.atomic():
            if not is_access_for_case_1(request):
                return request.send_error("ERR_002", "Таньд ажиллах жил нэмэх эрх байхгүй байна")

            if not request.user.is_superuser:
                request.data["org"] = request.org_filter['org'].id

            data = request.data.copy()
            sid = transaction.savepoint()       # transaction savepoint зарлах нь хэрэв алдаа гарвад roll back хийнэ

            active_lesson_year = data.get("active_lesson_year")
            season = data.get("active_lesson_season")

            check_qs = self.queryset.filter(active_lesson_year=active_lesson_year, active_lesson_season=season)
            if len(check_qs) > 0:
                return request.send_error("ERR_003", "Хичээлийн жил улирлын тохиргоо бүртгэгдсэн байна.")

            serializer = self.serializer_class(data=data)

            if not serializer.is_valid():
                transaction.savepoint_rollback(sid)
                return request.send_error_valid(serializer.errors)

            serializer.save()

        return request.send_info('INF_001')

    @has_permission(must_permissions=['lms-settings-аctiveyear-update'])
    @transaction.atomic()
    def put(self, request, pk=None):
        " ажиллах жилийн тохиргоо засах "

        if not is_access_for_case_1(request):
            return request.send_error("ERR_002", "Эрх байхгүй байна")

        data = request.data

        system_obj = SystemSettings.objects.get(pk=pk)
        active_lesson_year = system_obj.active_lesson_year
        season = system_obj.active_lesson_season.id
        season_type = data.get("season_type")

        instance = self.get_object()

        if active_lesson_year:
            check_qs = self.queryset.filter(active_lesson_year=active_lesson_year, active_lesson_season=season).exclude(id=pk)
            if len(check_qs) > 0:
                return request.send_error("ERR_003", "Тухай сургууль дээр энэ хичээлийн жил улирлын тохиргоо орсон байна.")

        if season_type == SystemSettings.ACTIVE:
            # Улирал идэвхижүүлэхэд өмнөх хичээлийн жилийн улирлыг хаасан байх ёстой

            prev_lesson_year = instance.prev_lesson_year
            prev_lesson_season = instance.prev_lesson_season
            check_qs = self.queryset.filter(active_lesson_year=prev_lesson_year, active_lesson_season=prev_lesson_season, season_type=SystemSettings.CLOSED)

            if not check_qs and self.queryset.filter(active_lesson_year=prev_lesson_year, active_lesson_season=prev_lesson_season).exists():
                return request.send_error('ERR_02', 'Та өмнөх улирлаа хаана уу?')

            self.queryset.filter(season_type=SystemSettings.ACTIVE).update(season_type=SystemSettings.INACTIVE)

        elif season_type == SystemSettings.CLOSED:
            active_lesson_year = instance.active_lesson_year
            active_lesson_season = instance.active_lesson_season

            # Бодогдсон голчуудыг хадгалах хүснэгт
            student_grade_list = []
            student_update_list = []

            # Тухайн жил, улирал болон идэвхитэй суралцаж байгаа оюутнуудын дүн авах хэсэг
            score_qs = ScoreRegister.objects.filter(student__status__code=1, lesson_year=active_lesson_year, lesson_season=active_lesson_season)
            score_students = score_qs.values_list('student', flat=True)
            try:
                # Идэвхитэй суралцаж байгаа оюутнуудын ID-г авах хэсэг
                student_list = Student.objects.filter(status__code=1, id__in=score_students).values_list("id", flat=True)

                # оюутнуудын ID-гаар гүйлгэх хэсэг
                for student in student_list:
                    # Оюутны тухайн улирлын дүнг авах хэсэг
                    student_grade = score_qs.filter(student=student)

                    all_estimate_kredit = student_grade.filter(grade_letter__letter='S').aggregate(
                                            kr=Sum('lesson__kredit')
                                        ).get('kr') or 0

                    total_kr = student_grade.exclude(grade_letter__letter='S').aggregate(
                                    kr=Sum('lesson__kredit')
                                ).get('kr') or 0
                    gpa = 0
                    avg_score = 0

                    gpa_query = Score.objects.filter(score_max__gte=OuterRef('score_total'), score_min__lte=OuterRef('score_total')).values('gpa')[:1]
                    total_gpa = (
                        student_grade
                            .exclude(grade_letter__letter='S')
                            .annotate(score_total=Coalesce(F('exam_score'), 0, output_field=FloatField()) + Coalesce(F('teach_score'), 0, output_field=FloatField()))
                            .annotate(cgpa=Coalesce(Subquery(gpa_query), Value(0, output_field=FloatField())))
                            .annotate(total_gpa=Coalesce(F('cgpa'), 0, output_field=FloatField()) * Coalesce(F('lesson__kredit'), 0, output_field=FloatField()))
                            .aggregate(total=Sum('total_gpa')).get('total') or 0
                    )

                    total_score = (
                        student_grade
                            .exclude(grade_letter__letter='S')
                            .annotate(score_total=Coalesce(F('exam_score'), 0, output_field=FloatField()) + Coalesce(F('teach_score'), 0, output_field=FloatField()))
                            .annotate(total_gpa=Coalesce(F('score_total'), 0, output_field=FloatField()) * Coalesce(F('lesson__kredit'), 0, output_field=FloatField()))
                            .aggregate(total=Sum('total_gpa')).get('total') or 0
                    )

                    if total_gpa != 0 and total_kr != 0:
                        gpa = round(total_gpa / total_kr, 1)

                    if total_score != 0 and total_kr != 0:
                        avg_score = round(total_score / total_kr, 1)


                    # Авсан датагаар instance үүсгэх хэсэг
                    if not StudentGrade.objects.filter(student=student, lesson_year=active_lesson_year, lesson_season=active_lesson_season).exists():
                        student_grade_list.append(
                            StudentGrade(
                                student = Student.objects.get(id=student),
                                lesson_year = active_lesson_year,
                                lesson_season = active_lesson_season,
                                credit = total_kr + all_estimate_kredit,
                                average = avg_score,
                                gpa=gpa,
                                created_at=datetime.now(),
                                updated_at=datetime.now()
                            )
                        )
                    else:
                        grade_obj = StudentGrade.objects.filter(student=student, lesson_year=active_lesson_year, lesson_season=active_lesson_season).first()
                        grade_obj.credit = (total_kr + all_estimate_kredit)
                        grade_obj.average = avg_score
                        grade_obj.gpa = gpa
                        grade_obj.updated_at = datetime.now()
                        student_update_list.append(grade_obj)

                # Өгөгдлийн санд хадгалах хэсэг
                StudentGrade.objects.bulk_create(student_grade_list)
                StudentGrade.objects.bulk_update(student_update_list, ['estimate_credit', 'learn_credit', 'credit', 'average', 'gpa', 'updated_at'])
            except Exception as e:
                print(e)
                pass

        serializer = self.get_serializer(instance, data=data, partial=True)
        if not serializer.is_valid(raise_exception=False):
            return request.send_error_valid(serializer.errors)

        serializer.save()

        return request.send_info('INF_002')

    def delete(self, request, pk=None):
        "Идэвхитэй жил, улирал устгах "

        if not is_access_for_case_2(request, pk):
            return request.send_error("ERR_002", "Эрх байхгүй байна")

        self.destroy(request, pk)
        return request.send_info("INF_003")


class AdmissionLessonAPIView(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    generics.GenericAPIView
):
    """ ЭЕШ-ын хичээл """

    queryset = AdmissionLesson.objects.all().order_by("-created_at")
    serializer_class = AdmissionLessonSerializer

    def get(self, request, pk=None):
        " ЭЕШ-ын хичээлийн жагсаалт "

        org = getattr(request, 'org_filter', {}).get('org')

        if org:
            self.queryset = self.queryset.filter(org=org)

        self.serializer_class = AdmissionLessonListSerializer

        if pk:
            admiss_lesson = self.retrieve(request, pk).data
            return request.send_data(admiss_lesson)

        admin_less = self.list(request).data
        return request.send_data(admin_less)

    def post(self, request):
        " ЭЕШ-ын хичээл шинээр үүсгэх "

        org = getattr(request, 'org_filter', {}).get('org')

        if not org:
            return request.send_error("ERR_002", "Таньд эеш-н хичээл нэмэх эрх байхгүй байна")

        request.data["org"] = org.id
        serializer = self.get_serializer(data=request.data)

        if serializer.is_valid(raise_exception=False):
            with transaction.atomic():
                try:
                    self.perform_create(serializer)

                except Exception:
                    return request.send_error("ERR_002")

            return request.send_info("INF_001")

        else:
            # Олон алдааны мессэж буцаах бол үүнийг ашиглана
            for key in serializer.errors:

                return_error = {
                    "field": key,
                    "msg": "Код бүртгэгдсэн байна"
                }

            return request.send_error_valid(return_error)

    def put(self, request, pk=None):
        "ЭЕШ-ын хичээл засах"

        instance = self.queryset.filter(id=pk).first()
        serializer = self.get_serializer(instance, data=request.data)

        if serializer.is_valid(raise_exception=False):
            with transaction.atomic():
                try:
                    self.perform_create(serializer)

                except Exception:
                    return request.send_error("ERR_002")

            return request.send_info("INF_002")

        else:
            # Олон алдааны мессэж буцаах бол үүнийг ашиглана
            for key in serializer.errors:

                return_error = {
                    "field": key,
                    "msg": "Код бүртгэгдсэн байна"
                }

            return request.send_error_valid(return_error)

    def delete(self, request, pk=None):
        "ЭЕШ-ын хичээл устгах "

        score = AdmissionBottomScore.objects.filter(admission_lesson=pk)
        if len(score) > 0:
            return request.send_error("ERR_002", "Элсэлтийн шалгалтын хичээлд холбогдсон байгаа тул устгах боломжгүй")

        self.destroy(request, pk)
        return request.send_info("INF_003")


class SystemSettingsActiveYearAPIView(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    generics.GenericAPIView
):
    """ Идэвхитэй хичээлийн жилийн жагсаалт """

    queryset = SystemSettings.objects
    serializer_class = SystemSettingsSerailizer

    def get(self, request):
        " Идэвхитэй хичээлийн жилийн жагсаалт "

        org = getattr(request, 'org_filter', {}).get('org')

        if org:
            self.queryset = self.queryset.filter(org=org)

        instance = self.queryset.filter(season_type=SystemSettings.ACTIVE).first()

        all_data =  self.get_serializer(instance).data
        return request.send_data(all_data)


@permission_classes([IsAuthenticated])
class DiscountTypeAPIView(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    generics.GenericAPIView
):
    """ Төлбөрийн хөнгөлөлтийн төрөл """

    queryset = DiscountType.objects
    serializer_class = DiscountTypeSerializer

    @has_permission(must_permissions=['lms-settings-discounttype-read'])
    def get(self, request, pk=None):
        " Төлбөрийн хөнгөлөлтийн төрөлийн жагсаалт "

        org = getattr(request, 'org_filter', {}).get('org')

        if org:
            self.queryset = self.queryset.filter(org=org)

        self.serializer_class = DiscountTypeListSerializer

        if pk:
            list_data = self.retrieve(request, pk).data
            return request.send_data(list_data)

        admin_less = self.list(request).data
        return request.send_data(admin_less)

    @has_permission(must_permissions=['lms-settings-discounttype-create'])
    def post(self, request):
        " Төлбөрийн хөнгөлөлтийн төрөл шинээр үүсгэх "

        org = getattr(request, 'org_filter', {}).get('org')

        if not org:
            return request.send_error("ERR_002", "Таньд төлбөрийн хөнгөлөлт нэмэх эрх байхгүй байна")

        request.data["org"] = org.id
        serializer = self.get_serializer(data=request.data)

        if serializer.is_valid(raise_exception=False):
            with transaction.atomic():
                try:
                    self.perform_create(serializer)

                except Exception:
                    return request.send_error("ERR_002")

            return request.send_info("INF_001")

        else:
            # Олон алдааны мессэж буцаах бол үүнийг ашиглана
            for key in serializer.errors:

                return_error = {
                    "field": key,
                    "msg": "Код бүртгэгдсэн байна"
                }

            return request.send_error_valid(return_error)


    @has_permission(must_permissions=['lms-settings-discounttype-update'])
    def put(self, request, pk=None):
        "Төлбөрийн хөнгөлөлтийн төрөл засах"

        instance = self.queryset.filter(id=pk).first()
        serializer = self.get_serializer(instance, data=request.data)

        if serializer.is_valid(raise_exception=False):
            with transaction.atomic():
                try:
                    self.perform_update(serializer)

                except Exception:
                    return request.send_error("ERR_002")

            return request.send_info("INF_002")
        else:
            # Олон алдааны мессэж буцаах бол үүнийг ашиглана
            for key in serializer.errors:

                return_error = {
                    "field": key,
                    "msg": "Код бүртгэгдсэн байна"
                }

            return request.send_error_valid(return_error)

    @has_permission(must_permissions=['lms-settings-discounttype-delete'])
    def delete(self, request, pk=None):
        "Төлбөрийн хөнгөлөлтийн төрөл устгах "

        self.destroy(request, pk)
        return request.send_info("INF_003")


@permission_classes([IsAuthenticated])
class CountryAPIView(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    generics.GenericAPIView
):
    """ Улсын нэр """

    queryset = Country.objects.all().order_by("-created_at")
    serializer_class = CountrySerializer

    @has_permission(must_permissions=['lms-settings-country-read'])
    def get(self, request, pk=None):
        " Улсын нэрийн жагсаалт "

        # self.serializer_class = CountryListSerializer

        if pk:
            list_data = self.retrieve(request, pk).data
            return request.send_data(list_data)

        admin_less = self.list(request).data
        return request.send_data(admin_less)

    @has_permission(must_permissions=['lms-settings-country-create'])
    def post(self, request):
        " Улсын нэр шинээр үүсгэх "

        data = request.data

        serializer = self.get_serializer(data=data)
        if serializer.is_valid(raise_exception=False):
            with transaction.atomic():
                try:
                    self.perform_create(serializer)
                except Exception:
                    return request.send_error("ERR_002")

            return request.send_info("INF_001")

        else:
            # Олон алдааны мессэж буцаах бол үүнийг ашиглана
            for key in serializer.errors:

                return_error = {
                    "field": key,
                    "msg": "Код бүртгэгдсэн байна"
                }

            return request.send_error_valid(return_error)

    @has_permission(must_permissions=['lms-settings-country-update'])
    def put(self, request, pk=None):
        "Улсын нэр засах"

        datas = request.data
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=datas)

        if serializer.is_valid(raise_exception=False):
            with transaction.atomic():
                try:
                    self.perform_create(serializer)
                except Exception:
                    return request.send_error("ERR_002")
            return request.send_info("INF_002")
        else:
            # Олон алдааны мессэж буцаах бол үүнийг ашиглана
            for key in serializer.errors:
                return_error = {
                    "field": key,
                    "msg": "Код бүртгэгдсэн байна"
                }

            return request.send_error_valid(return_error)

    @has_permission(must_permissions=['lms-settings-country-delete'])
    def delete(self, request, pk=None):
        "Улс устгах "

        if not request.user.is_superuser:
            return request.send_error("ERR_002", "Эрх байхгүй байна")

        self.destroy(request, pk)
        return request.send_info("INF_003")


@permission_classes([IsAuthenticated])
class SignatureAPIView(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    generics.GenericAPIView
):

    """ Тодорхойлолтын гарын үсэг """

    queryset = DefinitionSignature.objects.all().order_by("-created_at")
    serializer_class = DefinitionSignatureSerializer

    @has_permission(must_permissions=['lms-settings-signature-read'])
    def get(self, request, pk=None):
        " Тодорхойлолтын гарын үсэг жагсаалт "

        if pk:
            season = self.retrieve(request, pk).data
            return request.send_data(season)

        season_list = self.list(request, pk).data
        return request.send_data(season_list)

    @has_permission(must_permissions=['lms-settings-signature-create'])
    def post(self, request):
        " Тодорхойлолтын гарын үсэг шинээр үүсгэх "

        data = request.data

        order = 1

        max_order = DefinitionSignature.objects.aggregate(Max('order')).get('order__max')
        if max_order:
            order = max_order + 1

        data['order'] = order
        data['school'] = request.user.employee.org.id

        serializer = self.get_serializer(data=request.data)

        if serializer.is_valid(raise_exception=False):
            is_success = False
            with transaction.atomic():
                try:
                    self.create(request).data

                    is_success = True
                except Exception:
                    raise
            if is_success:
                return request.send_info("INF_001")

            return request.send_error("ERR_002")

        else:
            # Олон алдааны мессэж буцаах бол үүнийг ашиглана
            error_obj = []
            for key in serializer.errors:

                return_error = {
                    "field": key,
                    "msg": serializer.errors
                }

                error_obj.append(return_error)

            if len(error_obj) > 0:
                return request.send_error("ERR_003", error_obj)

            return request.send_error("ERR_002")

    @has_permission(must_permissions=['lms-settings-signature-update'])
    def put(self, request, pk=None):
        " Тодорхойлолтын гарын үсэг засах"

        datas = request.data
        instance = self.queryset.filter(id=pk).first()
        serializer = self.get_serializer(instance, data=datas)

        if serializer.is_valid(raise_exception=False):

            self.perform_update(serializer)
            return request.send_info("INF_002")

    @has_permission(must_permissions=['lms-settings-signature-delete'])
    def delete(self, request, pk=None):
        " Төгсөлтийн ажил устгах "

        self.destroy(request, pk)
        return request.send_info("INF_003")


@permission_classes([IsAuthenticated])
class SignatureDataTableAPIView(APIView):

    @has_permission(must_permissions=['lms-settings-signature-read'])
    def get(self, request):
        ''' DataTable-ийн утгыг авах
        '''
        data = list()


        for ded_type in DefinitionSignature.DEDICATION_TYPE:


            data.append(
            {
                'id': ded_type[0],
                'name': ded_type[1],
            })

        return request.send_data(data)


class SignatureTableAPIView(APIView):

    @has_permission(must_permissions=['lms-settings-signature-read'])
    def get(self, request):
        ''' Гарын үсэг зурах хүмүүсийн жагсаалт
        '''

        if not is_access_for_case_1(request):
            return request.send_data([])

        filter_access_case1 = {}

        if not request.user.is_superuser:
            filter_access_case1 = { 'school': request.org_filter['org'] }

        type_id = self.request.query_params.get('typeId')

        qs_values = DefinitionSignature.objects.filter(**filter_access_case1, dedication_type=type_id).order_by('order').values("position_name", "name", "order", "id")

        return request.send_data(list(qs_values))


class SignatureOrderAPIView(APIView):

    queryset = DefinitionSignature.objects

    @has_permission(must_permissions=['lms-settings-signature-create'])
    def post(self, request):
        ''' Дээр доор аль гарахыг засах
        '''

        dedication_type_num = self.request.query_params.get('type')

        from_id = request.data.get('from_id')
        to_id = request.data.get('to_id')

        from_qs = self.queryset.filter(id=from_id)
        from_order = from_qs.last().order

        to_qs = self.queryset.filter(id=to_id)
        to_order = to_qs.last().order

        is_up = from_order > to_order

        if is_up:

            reduce_order_values = self.queryset.filter(dedication_type=dedication_type_num, order__lt=from_order, order__gte=to_order).order_by('order')

            for x in range(reduce_order_values.__len__()):
                if x == reduce_order_values.__len__() - 1:
                    reduce_order_values[x].order = from_order
                else:
                    reduce_order_values[x].order = reduce_order_values[x + 1].order

                reduce_order_values[x].save()

        else:

            reduce_order_values = self.queryset.filter(dedication_type=dedication_type_num, order__gt=from_order, order__lte=to_order).order_by('-order')

            for x in range(reduce_order_values.__len__()):
                if x == reduce_order_values.__len__() - 1:
                    reduce_order_values[x].order = from_order
                else:
                    reduce_order_values[x].order = reduce_order_values[x + 1].order

                reduce_order_values[x].save()

        from_qs.update(order=to_order)

        return request.send_info("INF_013")


@permission_classes([IsAuthenticated])
class PermissionAPIView(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    generics.GenericAPIView
):
    """ Эрх
    """

    queryset = Permissions.objects.order_by("-created_at")
    serializer_class = PermissionsSerializer
    pagination_class = CustomPagination

    filter_backends = [SearchFilter]
    search_fields = [
        'name',
        'description',
        'created_at',
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

    @login_required()
    def get(self, request, pk=None):
        """ Эрх жагсаалт
        """

        list = self.list(request, pk).data
        return request.send_data(list)

    @login_required()
    @transaction.atomic
    def post(self, request):
        """ Эрх үүсгэх
        """

        return post_put_action(self, request, 'post', request.data)

    @login_required()
    @transaction.atomic
    def put(self, request, pk=None):
        """ Эрх засах
        """

        return post_put_action(self, request, 'put', request.data, pk)

    @login_required()
    @transaction.atomic
    def delete(self, request, pk=None):
        """ Эрх устгах
        """

        self.destroy(request, pk)
        return request.send_info("INF_003")


@permission_classes([IsAuthenticated])
class PermissionListAPIView(
    generics.GenericAPIView
):
    queryset = Permissions.objects.filter(name__startswith='lms-').order_by("-created_at")
    serializer_class = PermissionsSerializer

    @login_required()
    def get(self, request, pk=None):
        """ Эрх жагсаалт
        """

        crud_perms = list()

        # read create update delete орсон утгууд
        crud_perms_qs = self.queryset.filter(Q(name__endswith='-read') | Q(name__endswith='-create') | Q(name__endswith='-update') | Q(name__endswith='-delete'))
        crud_perms_datas = self.serializer_class(crud_perms_qs, many=True).data

        # read create update delete ороогүй утгууд
        non_crud_perms_qs = self.queryset.exclude(Q(name__endswith='-read') | Q(name__endswith='-create') | Q(name__endswith='-update') | Q(name__endswith='-delete'))
        non_crud_perms = self.serializer_class(non_crud_perms_qs, many=True).data


        for crud_perms_data in crud_perms_qs.values_list('name', flat=True):

            name = crud_perms_data

            if '-read' in crud_perms_data:
                name = crud_perms_data.replace('-read', '')

            if '-create' in crud_perms_data:
                name = crud_perms_data.replace('-create', '')

            if '-update' in crud_perms_data:
                name = crud_perms_data.replace('-update', '')

            if '-delete' in crud_perms_data:
                name = crud_perms_data.replace('-delete', '')

            if not any(name == d.get('name') for d in crud_perms):

                filtered = list(filter(lambda crud_perms_data: (f'{name}-read' == dict(crud_perms_data).get('name') or f'{name}-create' == dict(crud_perms_data).get('name') or f'{name}-update' == dict(crud_perms_data).get('name') or f'{name}-delete' == dict(crud_perms_data).get('name')), crud_perms_datas))

                description = ''

                if len(filtered) != 1:
                    chars = {}
                    for char1 in filtered:
                        for char in dict(char1).get('description').split(" "):
                            if char not in chars:
                                chars[char] = 1
                            else:
                                chars[char] += 1

                    duplicates = []

                    for char, count in chars.items():
                        if count > 1:
                            duplicates.append(char)

                    description = (" ".join(duplicates)).replace(' эрх', '')

                else:
                    description = filtered[0].get('description')


                crud_perms.append({
                    'name': name,
                    'description': description,
                    'filtered': filtered
                })


        return request.send_data({
            'non_crud_perms': non_crud_perms,
            'crud_perms': crud_perms
        })


@permission_classes([IsAuthenticated])
class RolesAPIView(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    generics.GenericAPIView
):
    """ Role
    """

    queryset = Roles.objects.order_by("-created_at")
    serializer_class = RolesSerializer

    @login_required()
    def get(self, request, pk=None):
        """ Role жагсаалт
        """

        org = getattr(request, 'org_filter', {}).get('org')

        if org:
            self.queryset = self.queryset.filter(org=org)

        self.serializer_class = RolesListSerializer
        list = self.list(request, pk).data
        return request.send_data(list)

    @login_required()
    @transaction.atomic
    def post(self, request):
        """ Role үүсгэх
        """

        org = getattr(request, 'org_filter', {}).get('org')

        if not org:
            return request.send_error("ERR_002", "Роль үүсгэх эрхгүй байна")

        request.data["org"] = org.id

        saved_data = post_put_action(self, request, 'post', request.data, get_res=True)
        querysets = OrgPosition.objects.filter(id__in=request.data.get('orgpositions'))
        for queryset in querysets:
            queryset.roles.add(saved_data)

        return request.send_info("INF_001")

    @login_required()
    @transaction.atomic
    def put(self, request, pk=None):
        """ Role засах
        """

        oobj = self.get_object()
        querysets = OrgPosition.objects.filter(id__in=request.data.get('orgpositions'))

        # Тухайн эрх дээр байгаа сонгогдсон албан тушаалаас бусад нь устгах
        old_perms = OrgPosition.objects.filter(roles__in=[pk]).exclude(id__in=request.data.get('orgpositions'))

        with transaction.atomic():
            if len(old_perms) > 0:
                for old_perm in old_perms:
                    old_perm.roles.clear()

        for queryset in querysets:
            queryset.roles.add(oobj)

        return post_put_action(self, request, 'put', request.data, pk)

    @login_required()
    @transaction.atomic
    def delete(self, request, pk=None):
        """ Role устгах
        """

        self.destroy(request, pk)
        return request.send_info("INF_003")


class PrintAPIView(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.CreateModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    generics.GenericAPIView,
):
    """ Хэвлэх тохиргоо  """

    queryset = PrintSettings.objects.order_by("-created_at")
    serializer_class = PrintSettingsSerializer

    @has_permission(must_permissions=['lms-settings-print-read'])
    def get(self, request, pk=None):
        " Хэвлэх тохиргоо жагсаалт "

        if not is_access_for_case_1(request):
            return request.send_data([])

        if not request.user.is_superuser:
            self.queryset = self.queryset.filter(org=request.org_filter['org'])

        self.serializer_class = PrintSettingsListSerializer

        if pk:
            one_data = self.retrieve(request, pk).data
            return request.send_data(one_data)

        all_data = self.list(request).data
        return request.send_data(all_data)

    @has_permission(must_permissions=['lms-settings-print-create'])
    def post(self, request):
        " Хэвлэх тохиргоо шинээр үүсгэх "

        if not is_access_for_case_1(request):
            return request.send_error("ERR_002", "Эрх байхгүй байна")

        if not request.user.is_superuser:
            request.data['org'] = request.org_filter['org'].id

        data = request.data

        serializer = self.get_serializer(data=data)
        if serializer.is_valid(raise_exception=False):
            with transaction.atomic():
                try:
                    self.perform_create(serializer)
                except Exception:
                    return request.send_error("ERR_002")

            return request.send_info("INF_001")

        else:
            # Олон алдааны мессэж буцаах бол үүнийг ашиглана
            for key in serializer.errors:

                return_error = {
                    "field": key,
                    "msg": "Хоосон байна"
                }

                return request.send_error_valid(return_error)

    @has_permission(must_permissions=['lms-settings-print-update'])
    def put(self, request, pk=None):
        "Хэвлэх тохиргоо засах"

        if not is_access_for_case_2(request, request.data.get('org')):
            return request.send_error("ERR_002", "Эрх байхгүй байна")

        datas = request.data
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=datas)

        if serializer.is_valid(raise_exception=False):
            with transaction.atomic():
                try:
                    self.perform_create(serializer)
                except Exception:
                    return request.send_error("ERR_002")
            return request.send_info("INF_002")
        else:
            # Олон алдааны мессэж буцаах бол үүнийг ашиглана
            for key in serializer.errors:
                return_error = {
                    "field": key,
                    "msg": "Хоосон байна"
                }

            return request.send_error_valid(return_error)

    @has_permission(must_permissions=['lms-settings-print-delete'])
    def delete(self, request, pk=None):
        "Хэвлэх устгах "

        if not is_access_for_case_2(request, pk):
            return request.send_error("ERR_002", "Эрх байхгүй байна")

        self.destroy(request, pk)
        return request.send_info("INF_003")


@permission_classes([IsAuthenticated])
class YearSeasonListAPIView(
    generics.GenericAPIView,
):
    def get(self, request, pk=None):
        """ жил улирлын жагсаалт
        """

        filters = dict()
        org = getattr(request, 'org_filter', {}).get('org')

        if org:
            filters["org"] = org.id

        year_list = list(SystemSettings.objects.filter(**filters).order_by('active_lesson_year').values_list('active_lesson_year', flat=True).distinct())
        season_list = SeasonSerailizer(Season.objects.filter(**filters).order_by("-created_at"), many=True).data

        return request.send_data({
            'year_list': year_list,
            'season_list': season_list
        })


@permission_classes([IsAuthenticated])
class RuleAPIView(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    generics.GenericAPIView
):
    """ Дүрэм журмын файл
    """

    queryset = Rule.objects
    serializer_class = RuleSerializer
    pagination_class = CustomPagination

    filter_backends = [SearchFilter]
    search_fields = [
        'title',
    ]

    def get_queryset(self):
        queryset = self.queryset.all()
        sorting = self.request.GET.get('sorting')

        # Sort хийх үед ажиллана
        if sorting:
            if not isinstance(sorting, str):
                sorting = str(sorting)

            queryset = queryset.order_by(sorting)

        return queryset

    @login_required()
    def get(self, request, pk=None):
        """ Дүрэм журмын файл жагсаалт
        """

        list_data = self.list(request, pk).data

        return request.send_data(list_data)

    @login_required()
    @transaction.atomic
    def put(self, request, pk=None):
        """ Дүрэм журмын файл засах """

        upload_to = self.queryset.model._meta.get_field('file').upload_to
        file = request.data.get('file')
        stype = request.data.get('stype')
        isFileChanged = isinstance(file, InMemoryUploadedFile)

        if file and isFileChanged:
            relative_path, _, error = create_file_in_cdn_silently(upload_to, file)

            if relative_path:
                request.data['file'] = relative_path

            else:
                print(error)

                return request.send_error("ERR_002")
                # request.data['file'] = upload_to + '/' + file.name

        instance = self.queryset.model.objects.filter(stype=stype).first()
        request_data = request.data.dict()

        if instance:
            request_data['id'] = instance.id

            if not isFileChanged and 'file' in request_data:
                del request_data['file']

            result = save_data_with_signals(self.queryset.model, self.serializer_class, True, None, data=request_data)

        else:
            if 'id' in request_data:
                del request_data['id']

            result = save_data_with_signals(self.queryset.model, self.serializer_class, True, None, data=request_data)

        instance = result[0]

        if instance:

            return request.send_info("INF_001")

        print('put', result)

        return request.send_error("ERR_002")

    @login_required()
    # @has_permission(must_permissions=['lms-settings-print-delete'])
    def delete(self, request, pk=None):
        """ Дүрэм журмын файл устгах """

        if not pk:
            print('no pk')

            return request.send_error("ERR_002")

        _, error = delete_objects_with_signals(self.queryset.model, [pk])

        if error:
            print('delete', error)

            return request.send_error("ERR_002")

        return request.send_info("INF_003")

@permission_classes([IsAuthenticated])
class GradeLetterAPIView(
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    generics.GenericAPIView,
):

    queryset = GradeLetter.objects
    serializer_class = GradeLetterSerializer

    def get(self, request, pk=None):
        """ Дүнгийн үсгэн үнэлгээ жагсаалт """

        org = getattr(request, 'org_filter', {}).get('org')

        if org:
            self.queryset = self.queryset.filter(org=org)

        if pk:
            data = self.retrieve(request, pk).data
            return request.send_data(data)

        grade_list = list(self.queryset.order_by('-created_at').values('id', 'letter', 'description', 'tovch'))
        return request.send_data(grade_list)

    @login_required()
    @transaction.atomic
    def post(self, request):
        """ Дүнгийн үсгэн үнэлгээ шинээр үүсгэх """

        org = getattr(request, 'org_filter', {}).get('org')

        if not org:
            return request.send_error("ERR_002", "Таньд үсгэн үнэлгээ нэмэх эрх байхгүй байна")

        request.data["org"] = org.id
        return post_put_action(self, request, 'post', request.data)

    @login_required()
    @transaction.atomic
    def put(self, request, pk=None):
        "Дүнгийн үсгэн үнэлгээ засах"
        return post_put_action(self, request, 'put', request.data, pk)

    def delete(self, request, pk=None):
        "Дүнгийн үсгэн үнэлгээ устгах "

        self.destroy(request, pk)
        return request.send_info("INF_003")
