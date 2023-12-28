
import json

from rest_framework import mixins
from rest_framework import generics
from rest_framework.views import APIView

from lms.models import Score
from lms.models import Group
from lms.models import Season
from lms.models import Student
from lms.models import Stipend
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
from lms.models import StudentAdmissionScore
from lms.models import Country
from lms.models import PaymentSeasonClosing
from lms.models import DefinitionSignature

from .serializers import ScoreSerailizer
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

from django.db import transaction
from django.db.models import Max

from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes

from main.utils.function.utils import has_permission, list_to_dict

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

        if pk:
            degree_info = self.retrieve(request, pk).data
            return request.send_data(degree_info)

        degree_list = self.list(request).data
        return request.send_data(degree_list)


    @has_permission(must_permissions=['lms-settings-degree-create'])
    def post(self, request):
        " Мэргэжлийн зэргийн мэдээлэл шинээр үүсгэх "

        data = request.data
        degree_code = data.get("degree_code")

        if degree_code:
            degree = self.queryset.filter(degree_code=degree_code)
            if degree:
                return request.send_error("ERR_003", "Боловсролын зэргийн код давхцаж байна")

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


    @has_permission(must_permissions=['lms-settings-degree-update'])
    def put(self, request, pk=None):
        "Мэргэжлийн зэргийн засах"

        self.serializer_class = ProfessionalDegreePutSerializer

        datas = request.data
        prof_qs = ProfessionDefinition.objects.filter(degree=pk)
        if prof_qs:
           return request.send_error("ERR_003", "Мэргэжлийн тодорхойлолтод бүртгэлтэй байгаа тул зэргийг засах боломжгүй байна.")

        instance = self.queryset.filter(id=pk).first()

        serializer = self.get_serializer(instance, data=datas)

        if serializer.is_valid(raise_exception=False):

            self.update(request, pk).data
            return request.send_info("INF_002")
        else:
            errors = []

            for key in serializer.errors:
                msg = serializer.errors[key]

                return_error = {
                    "field": key,
                    "msg": msg
                }

                errors.append(return_error)

            if len(errors) > 0:
                return request.send_error("ERR_003", errors)


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

        if pk:
            learning_info = self.retrieve(request, pk).data
            return request.send_data(learning_info)

        learning_list = self.list(request, pk).data
        return request.send_data(learning_list)

    @has_permission(must_permissions=['lms-settings-learningstatus-create'])
    def post(self, request):
        " Суралцах хэлбэр мэдээлэл шинээр үүсгэх "

        data = request.data
        learn_code = data.get("learn_code")
        if learn_code:
            learning = self.queryset.filter(learn_code=learn_code)
            if learning:
                return request.send_error("ERR_003", "Суралцах хэлбэрийн код давхцаж байна")

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

            self.perform_update(serializer)
            return request.send_info("INF_002")


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

        if pk:
            register = self.retrieve(request, pk).data
            return request.send_data(register)

        student_list = self.list(request, pk).data
        return request.send_data(student_list)

    @has_permission(must_permissions=['lms-settings-registerstatus-create'])
    def post(self, request):
        " Оюутны бүртгэл хэлбэр шинээр үүсгэх "

        data = request.data
        code = data.get("code")
        if code:
            stud_register = self.queryset.filter(code=code)
            if stud_register:
                return request.send_error("ERR_003", "Оюутны бүртгэлийн хэлбэрийн код давхцаж байна")

        serializer = self.get_serializer(data=data)

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

    @has_permission(must_permissions=['lms-settings-registerstatus-update'])
    def put(self, request, pk=None):
        "Оюутны бүртгэл засах"

        datas = request.data
        st_count = Student.objects.filter(status=pk)
        if st_count:
            return request.send_error("ERR_003", "Тухайн бүртгэлийн хэлбэрт оюутан бүртгэлтэй байгаа тул засах боломжгүй.")

        instance = self.queryset.filter(id=pk).first()

        serializer = self.get_serializer(instance, data=datas)

        if serializer.is_valid(raise_exception=False):

            self.perform_update(serializer)
            return request.send_info("INF_002")


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

        if pk:
            category = self.retrieve(request, pk).data
            return request.send_data(category)

        less_cate_list = self.list(request).data
        return request.send_data(less_cate_list)

    @has_permission(must_permissions=['lms-settings-lessoncategory-create'])
    def post(self, request):
        " Хичээлийн ангиллыг шинээр үүсгэх "

        data = request.data
        category_code = data.get("category_code")
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
            if category_code:
                category_info = self.queryset.filter(category_code=category_code)
                if category_info:
                    error_obj = {
                        "error": serializer.errors,
                        "msg": "Код давхцаж байна"
                    }
                    return request.send_error("ERR_004", error_obj)

            return request.send_error("ERR_002")


    @has_permission(must_permissions=['lms-settings-lessoncategory-update'])
    def put(self, request, pk=None):
        "Хичээлийн ангилал  засах"

        errors = []
        datas = request.data
        instance = self.queryset.filter(id=pk).first()
        serializer = self.get_serializer(instance, data=datas)
        if serializer.is_valid(raise_exception=False):

            self.perform_update(serializer)

            return request.send_info("INF_002")
        else:
            for key in serializer.errors:
                msg = serializer.errors[key]

                return_error = {
                    "field": key,
                    "msg": msg
                }

                errors.append(return_error)

            if len(errors) > 0:
                return request.send_error("ERR_003", errors)



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
        " Хичээлийн бүлэг засах"

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
        if pk:
            lesson_group = self.retrieve(request, pk).data
            return request.send_data(lesson_group)

        lesson_group_list = self.list(request, pk).data
        return request.send_data(lesson_group_list)

    @has_permission(must_permissions=['lms-settings-lessongroup-create'])
    def post(self, request):
        " Хичээлийн бүлэг шинээр үүсгэх "

        data = request.data
        group_code = data.get("group_code")

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
            if group_code:
                less_group_info = self.queryset.filter(group_code=group_code)
                if less_group_info:
                    error_obj = {
                        "error": serializer.errors,
                        "msg": "Код давхцаж байна"
                    }
                    return request.send_error("ERR_004", error_obj)

            return request.send_error("ERR_002")

    @has_permission(must_permissions=['lms-settings-lessongroup-update'])
    def put(self, request, pk=None):
        " Хичээлийн бүлэг засах"

        datas = request.data
        instance = self.queryset.filter(id=pk).first()
        serializer = self.get_serializer(instance, data=datas)

        if serializer.is_valid(raise_exception=False):

            self.perform_update(serializer)
            return request.send_info("INF_002")
        else:
            errors = []
            for key in serializer.errors:
                msg = serializer.errors[key]

                return_error = {
                    "field": key,
                    "msg": msg
                }

                errors.append(return_error)

            if len(errors) > 0:
                return request.send_error("ERR_003", errors)


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

        if pk:
            season = self.retrieve(request, pk).data
            return request.send_data(season)

        season_list = self.list(request, pk).data
        return request.send_data(season_list)

    @has_permission(must_permissions=['lms-settings-season-create'])
    def post(self, request):
        " улирал шинээр үүсгэх "

        data = request.data
        season_code = data.get("season_code")
        serializer = self.get_serializer(data=request.data)

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

        if pk:
            score = self.retrieve(request, pk).data
            return request.send_data(score)

        score_list = self.list(request, pk).data
        return request.send_data(score_list)

    @has_permission(must_permissions=['lms-settings-score-create'])
    def post(self, request):
        " Үнэлгээ шинээр үүсгэх "

        data = request.data
        score_code = data.get("score_code")
        if score_code:
            score = self.queryset.filter(score_code=score_code)
            if score:
                return request.send_error("ERR_003", " Үнэлгээний код давхцаж байна")

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


    @has_permission(must_permissions=['lms-settings-score-update'])
    def put(self, request, pk=None):
        "Үнэлгээний бүртгэл засах"

        datas = request.data

        score_code = datas.get("score_code")
        if score_code:
            score = self.queryset.filter(score_code=score_code).exclude(id=pk)
            if score:
                return request.send_error("ERR_003", " Үнэлгээний код давхцаж байна")

        instance = self.queryset.filter(id=pk).first()
        serializer = self.get_serializer(instance, data=datas)

        if serializer.is_valid(raise_exception=False):

            self.perform_update(serializer)
            return request.send_info("INF_002")


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

        if pk:
            main = self.retrieve(request, pk).data
            return request.send_data(main)

        main_list = self.list(request, pk).data
        return request.send_data(main_list)

    @has_permission(must_permissions=['lms-settings-аctiveyear-create'])
    def post(self, request):
        with transaction.atomic():
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
    def put(self, request, pk=None):
        " ажиллах жилийн тохиргоо засах "

        data = request.data
        active_lesson_year = data.get("active_lesson_year")
        season = data.get("active_lesson_season")
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

            if len(self.queryset) > 1:
                if not check_qs:
                    return request.send_error('ERR_02', 'Та өмнөх улирлаа хаана уу?')

            self.queryset.filter(season_type=SystemSettings.ACTIVE).update(season_type=SystemSettings.INACTIVE)

        elif season_type == SystemSettings.CLOSED:
            # Улирлын хаалт хийхэд с/төлбөрийн хаалтыг хийсэн байх шаардлагатай

            active_lesson_year = instance.active_lesson_year
            active_lesson_season = instance.active_lesson_season
            # closing_qs = PaymentSeasonClosing.objects.filter(lesson_year=active_lesson_year, lesson_season=active_lesson_season)

            # if not closing_qs:
            #     return request.send_error('ERR_02', 'Сургалтын төлбөрийн улирлын хаалт хийгээгүй байна')

        serializer = self.get_serializer(instance, data=data, partial=True)

        if not serializer.is_valid(raise_exception=False):
            return request.send_error_valid(serializer.errors)

        serializer.save()
        return request.send_info('INF_002')

    def delete(self, request, pk=None):
        "Идэвхитэй жил, улирал устгах "

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

        self.serializer_class = AdmissionLessonListSerializer

        if pk:
            admiss_lesson = self.retrieve(request, pk).data
            return request.send_data(admiss_lesson)

        admin_less = self.list(request).data
        return request.send_data(admin_less)

    def post(self, request):
        " ЭЕШ-ын хичээл шинээр үүсгэх "

        data = request.data
        lesson_code = data.get("lesson_code")

        serializer = self.get_serializer(data=data)

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
            if lesson_code:
                admis_less_info = self.queryset.filter(lesson_code=lesson_code)
                if admis_less_info:
                    error_obj = {
                        "error": serializer.errors,
                        "msg": "ЭЕШ-ын хичээлийн код давхцаж байна"
                    }
                    return request.send_error("ERR_004", error_obj)
        return request.send_info("INF_001")

    def put(self, request, pk=None):
        "ЭЕШ-ын хичээл засах"

        admiss_qs = StudentAdmissionScore.objects.filter(admission_lesson=pk)
        if admiss_qs:
            return request.send_error("ERR_003", "Энэ хичээл дээр ЭЕШ-ын оноо бүртгэлтэй байгаа тул засах боломжгүй")

        datas = request.data

        instance = self.queryset.filter(id=pk).first()
        serializer = self.get_serializer(instance, data=datas)
        if serializer.is_valid(raise_exception=False):

            self.perform_update(serializer)
            return request.send_info("INF_002")


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

        self.serializer_class = DiscountTypeListSerializer

        if pk:
            list_data = self.retrieve(request, pk).data
            return request.send_data(list_data)

        admin_less = self.list(request).data
        return request.send_data(admin_less)

    @has_permission(must_permissions=['lms-settings-discounttype-create'])
    def post(self, request):
        " Төлбөрийн хөнгөлөлтийн төрөл шинээр үүсгэх "

        data = request.data
        serializer = self.get_serializer(data=data)

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
                msg = "Хоосон байна"
                if key == 'code':
                    msg = "Код давхцаж байна"

                return_error = {
                    "field": key,
                    "msg": msg
                }

                error_obj.append(return_error)

            if len(error_obj) > 0:
                return request.send_error("ERR_003", error_obj)

        return request.send_info("INF_001")


    @has_permission(must_permissions=['lms-settings-discounttype-update'])
    def put(self, request, pk=None):
        "Төлбөрийн хөнгөлөлтийн төрөл засах"

        stipent = Stipend.objects.filter(stipend_type=pk)
        if stipent:
            return request.send_error("ERR_003","Тухайн хөнгөлөлтийн төрөлд тэтгэлэг бүртгэлтэй байгаа тул засах боломжгүй")

        datas = request.data
        instance = self.queryset.filter(id=pk).first()
        serializer = self.get_serializer(instance, data=datas)

        if serializer.is_valid(raise_exception=False):

            self.perform_update(serializer)
            return request.send_info("INF_002")



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

        type_id = self.request.query_params.get('typeId')

        qs_values = DefinitionSignature.objects.filter(dedication_type=type_id).order_by('order').values("position_name", "name", "order", "id")

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
