import os
from rest_framework import mixins
from rest_framework import generics
from rest_framework.filters import SearchFilter
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes

from main.utils.function.pagination import CustomPagination
from main.utils.function.utils import override_get_queryset
from main.utils.function.utils import has_permission, get_domain_url
from main.utils.file import save_file
from main.utils.file import remove_folder

from django.db import transaction
from django.db.models import Q
from django.db.models import Count
from django.db.models import Sum
from django.shortcuts import get_object_or_404
from django.conf import settings
from functools import reduce
from operator import or_

from lms.models import LessonStandart, Student
from lms.models import Lesson_title_plan
from lms.models import ProfessionDefinition
from lms.models import LearningPlan
from lms.models import Profession_SongonKredit
from lms.models import TimeTable
from lms.models import ScoreRegister
from lms.models import Group
from lms.models import ProfessionalDegree
from lms.models import AdmissionBottomScore, SubSchools, Departments
from lms.models import Lesson_to_teacher
from lms.models import ExamTimeTable,Exam_repeat
from lms.models import AdmissionLesson

from .serializers import LessonStandartSerializer
from .serializers import LessonTitlePlanSerializer
from .serializers import LessonStandartListSerializer
from .serializers import LessonStandartSerialzier
from .serializers import ProfessionDefinitionSerializer
from .serializers import LearningPlanSerializer
from .serializers import LearningPlanListSerializer
from .serializers import ProfessionDefinitionListSerializer
from .serializers import ProfessionLearningPlanSerializer
from .serializers import LearningPlanPrintSerializer
from .serializers import GroupSerializer
from .serializers import AdmissionBottomScoreSerializer
from .serializers import AdmissionBottomScoreListSerializer

@permission_classes([IsAuthenticated])
class LessonStandartAPIView(
    mixins.CreateModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    mixins.RetrieveModelMixin,
    mixins.ListModelMixin,
    generics.GenericAPIView
):
    """ Хичээлийн стандарт """

    queryset = LessonStandart.objects.all().order_by('-updated_at')
    serializer_class = LessonStandartSerializer
    pagination_class = CustomPagination

    filter_backends = [SearchFilter]
    search_fields = [
        'code',
        'name',
        'name_eng',
        'name_uig',
        'kredit',
        'category__category_name',
        'definition',
        'department__name'
    ]

    @has_permission(must_permissions=['lms-study-lessonstandart-read'])
    def get(self, request, pk=None):
        " Хичээлийн стандартын жагсаалт "

        self.serializer_class = LessonStandartListSerializer

        department = self.request.query_params.get('department')
        category = self.request.query_params.get('category')
        school = self.request.query_params.get('schoolId')

        # if school:
        #     self.queryset = self.queryset.filter(school=int(school))

        if department:
            self.queryset = self.queryset.filter(department=department)

        # Хичээлийн Ангилал сонголтоор хайх
        if category:
            self.queryset = self.queryset.filter(category=category)

        if pk:
            standart = self.retrieve(request, pk).data
            return request.send_data(standart)

        less_standart_list = self.list(request).data

        return request.send_data(less_standart_list)

    @has_permission(must_permissions=['lms-study-lessonstandart-create'])
    def post(self, request):
        " хичээлийн стандартын шинээр үүсгэх "

        request_data = request.data
        serializer = self.get_serializer(data=request_data)

        if serializer.is_valid(raise_exception=False):
            is_success = False
            with transaction.atomic():
                try:
                    self.create(request).data

                    is_success = True
                except Exception as e:
                    print(e)
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

            return request.send_error("ERR_002")

    @has_permission(must_permissions=['lms-study-lessonstandart-update'])
    def put(self, request, pk=None):
        " хичээлийн стандартын шинээр үүсгэх "

        request_data = request.data
        teachers_data = request.data.get("teachers")
        instance = self.get_object()

        serializer = self.get_serializer(instance, data=request_data)

        if serializer.is_valid(raise_exception=False):
            is_success = False
            with transaction.atomic():
                try:
                    if teachers_data:
                        old_teacher_ids = Lesson_to_teacher.objects.filter(lesson=pk).values_list('teacher',flat=True)
                        for old_teacher in old_teacher_ids:
                            if not (old_teacher in  teachers_data):
                                qs_teacher = Lesson_to_teacher.objects.filter(teacher_id=old_teacher,lesson_id=pk)
                                if qs_teacher:
                                    qs_teacher.delete()
                        for teacher in teachers_data:
                            teacher_id = teacher.get('id')
                            Lesson_to_teacher.objects.update_or_create(
                                    lesson_id=pk,
                                    teacher_id=teacher_id
                                )

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
                if key == 'code':
                    msg = "Код давхцаж байна"

                return_error = {
                    "field": key,
                    "msg": msg
                }

                error_obj.append(return_error)

            if len(error_obj) > 0:
                return request.send_error("ERR_003", error_obj)

            return request.send_error("ERR_002")

    @has_permission(must_permissions=['lms-study-lessonstandart-delete'])
    def delete(self, request, pk=None):
        " хичээлийн стандартыг устгах "

        learn_plan = LearningPlan.objects.filter(Q(lesson=pk) | Q(previous_lesson=pk))

        timetable = TimeTable.objects.filter(lesson=pk)

        examtimetable = ExamTimeTable.objects.filter(lesson=pk)

        examrepeat = Exam_repeat.objects.filter(lesson=pk)

        score = ScoreRegister.objects.filter(lesson=pk)

        if learn_plan or timetable or score or examtimetable or examrepeat:
            return request.send_error("ERR_002", "Тухайн хичээлийг устгах боломжгүй байна.")

        self.destroy(request, pk)
        return request.send_info("INF_003")
class LessonTitlePlanAPIView(
    mixins.CreateModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    mixins.RetrieveModelMixin,
    mixins.ListModelMixin,
    generics.GenericAPIView
):
    """ Хичээлийн сэдэвчилсэн төлөвлөгөө """

    queryset = Lesson_title_plan.objects.all()
    serializer_class = LessonTitlePlanSerializer

    def get_queryset(self):
        return override_get_queryset(self)

    @has_permission(must_permissions=['lms-study-lessonstandart-read'])
    def get(self, request, pk=None, lessonID=None):
        " хичээлийн сэдэвчилсэн төлөвлөгөө жагсаалт "


        # Хичээлийн хайх
        if lessonID:
            self.queryset = self.queryset.filter(lesson_id=lessonID).order_by('week')


        if pk:
            standart = self.retrieve(request, pk).data
            return request.send_data(standart)

        less_standart_list = self.list(request).data
        return request.send_data(less_standart_list)

    @has_permission(must_permissions=['lms-study-lessonstandart-create'])
    def post(self, request):
        " хичээлийн сэдэвчилсэн төлөвлөгөө шинээр үүсгэх "

        request_data = request.data
        delete_plan_ids = request_data.get('delete_plan_ids')
        all_datas = request_data.get('all_datas')
        lesson_id = request_data.get('lesson_id')

        with transaction.atomic():
            try:
                if delete_plan_ids:
                    for delete_plan_id in delete_plan_ids:
                        title_plan = Lesson_title_plan.objects.filter(id=delete_plan_id)
                        if title_plan:
                            title_plan.delete()

                if all_datas:
                    for datas in all_datas:
                        plan_id = datas.get('id')
                        lesson = datas.get('lesson')
                        week = datas.get('week')
                        title = datas.get('title')
                        content = datas.get('content')
                        lesson_type = datas.get('lesson_type')
                        if lesson:
                            lesson=lesson_id

                        if plan_id:
                            Lesson_title_plan.objects.filter(id=plan_id).update(
                                week=week,
                                lesson_type=lesson_type,
                                title=title,
                                content=content,
                                lesson=lesson,
                            )
                        else:
                            Lesson_title_plan.objects.create(
                                week=week,
                                lesson_type=lesson_type,
                                title=title,
                                content=content,
                                lesson_id=lesson_id,
                            )

            except Exception as e:
                print(e.__str__())
                return request.send_error("ERR_002")

        return request.send_info("INF_013")
    @has_permission(must_permissions=['lms-study-lessonstandart-update'])
    def put(self, request, pk=None):
        " хичээлийн сэдэвчилсэн төлөвлөгөө шинээр үүсгэх "

        request_data = request.data
        teachers_data = request.data.get("teachers")
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
                if key == 'code':
                    msg = "Код давхцаж байна"

                return_error = {
                    "field": key,
                    "msg": msg
                }

                error_obj.append(return_error)

            if len(error_obj) > 0:
                return request.send_error("ERR_003", error_obj)

            return request.send_error("ERR_002")

    @has_permission(must_permissions=['lms-study-lessonstandart-delete'])
    def delete(self, request, pk=None):
        " хичээлийн сэдэвчилсэн төлөвлөгөө устгах "

        self.destroy(request, pk)
        return request.send_info("INF_003")


@permission_classes([IsAuthenticated])
class LessonStandartListAPIView(
    mixins.ListModelMixin,
    generics.GenericAPIView
):
    """ Хичээлийн стандартын жагсаалт """

    queryset = LessonStandart.objects.all()
    serializer_class = LessonStandartSerialzier

    def get(self, request):

        school = request.query_params.get('school')

        if school:
            self.queryset = self.queryset.filter(school=school)

        department = request.query_params.get('department')

        if department:
            self.queryset = self.queryset.filter(department=department)

        less_standart_list = self.list(request).data

        return request.send_data(less_standart_list)


@permission_classes([IsAuthenticated])
class ProfessionDefinitionAPIView(
    mixins.CreateModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    mixins.RetrieveModelMixin,
    mixins.ListModelMixin,
    generics.GenericAPIView
):
    """  Мэргэжлийн тодорхойлолт """

    queryset = ProfessionDefinition.objects.all()
    serializer_class = ProfessionDefinitionSerializer
    pagination_class = CustomPagination

    filter_backends = [SearchFilter]
    search_fields = ['name', 'code', 'profession_code']

    # def get_queryset(self):
    #     return override_get_queryset(self)

    @has_permission(must_permissions=['lms-study-profession-read'])
    def get(self, request, pk=None):
        "  Мэргэжлийн тодорхойлолт жагсаалт "

        self.serializer_class = ProfessionDefinitionListSerializer

        degree = self.request.query_params.get('degree')
        department = self.request.query_params.get('department')
        school = self.request.query_params.get('schoolId')

        if school:
            self.queryset = self.queryset.filter(school=school)

        if degree:
            self.queryset = self.queryset.filter(degree=degree)

        if department:
            self.queryset = self.queryset.filter(department=department)

        if pk:
            plan = self.retrieve(request, pk).data
            return request.send_data(plan)

        learn_plan_list = self.list(request).data
        return request.send_data(learn_plan_list)

    @has_permission(must_permissions=['lms-study-profession-create'])
    def post(self, request):
        "  Мэргэжлийн тодорхойлолт шинээр үүсгэх "

        request_data = request.data

        with_start = '001'
        profession_code = 1

        profession_qs = (
            ProfessionDefinition.objects.order_by('-profession_code')
        ).first()

        if profession_qs:
            check_code = profession_qs.profession_code
            profession_code = int(check_code) + 1

        new_profession_code = f'{int(profession_code):0{len(with_start)}d}'

        request_data['profession_code'] = new_profession_code

        serializer = self.get_serializer(data=request_data)

        if serializer.is_valid():
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

            return request.send_error("ERR_002")

    @has_permission(must_permissions=['lms-study-profession-update'])
    def put(self, request, pk=None):
        "  Мэргэжлийн тодорхойлолт  засах "

        request_data = request.data
        general_base = request_data.get('general_base')
        profession = request_data.get('id')
        professional_base = request_data.get('professional_base')
        professional_lesson = request_data.get('professional_lesson')
        admission_lesson = request_data.get('admission_lesson')
        instance = self.get_object()

        serializer = self.get_serializer(instance, data=request_data)

        if serializer.is_valid(raise_exception=False):
            self.perform_create(serializer)
            if general_base:
                ss = Profession_SongonKredit.objects.update_or_create(
                    profession_id = profession,
                    lesson_level=LearningPlan.BASIC,
                    songon_kredit=general_base
                )
            if professional_base:
                ss = Profession_SongonKredit.objects.update_or_create(
                    profession_id = profession,
                    lesson_level=LearningPlan.PROF_BASIC,
                    songon_kredit=professional_base
                )
            if professional_lesson:
                ss = Profession_SongonKredit.objects.update_or_create(
                    profession_id = profession,
                    lesson_level=LearningPlan.PROFESSION,
                    songon_kredit=professional_lesson
                )
        else:
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

        return request.send_info("INF_002")

    @has_permission(must_permissions=['lms-study-profession-delete'])
    def delete(self, request, pk=None):
        " Мэргэжлийн тодорхойлолт устгах "

        data = request.data
        degree = data.get("degree")

        prof = ProfessionalDegree.objects.filter(id=degree)
        lear_qs = LearningPlan.objects.filter(profession=pk)
        group = Group.objects.filter(profession=pk)
        prof_songon = Profession_SongonKredit.objects.filter(profession=pk)

        if lear_qs or prof_songon or group or prof:
            return request.send_error("ERR_003", "Мэргэжлийн тодорхойлолтийг устгах боломжгүй байна.")

        self.destroy(request, pk)

        return request.send_info("INF_003")

class ProfessionIntroductionFileAPIView(
    generics.GenericAPIView,
):
    @has_permission(must_permissions=['lms-study-profession-update'])
    def post(self, request):
        """ Мэргэжлийн тодорхойлолтын танилцуулга хэсэгт файл нэмэх """

        data = request.data
        file = data.get('file')

        path = save_file(file, 'profession_images', settings.PROFESSION)

        domain = get_domain_url()

        file_path = os.path.join(settings.MEDIA_URL, path)

        return_url = '{domain}{path}'.format(domain=domain, path=file_path)

        return request.send_data(return_url)

    def put(self, request, pk=None):

        data = request.data
        introduction = data.get('introduction')

        obj = get_object_or_404(ProfessionDefinition, pk=pk)

        with transaction.atomic():
            try:
                obj.introduction = introduction
                obj.save()
            except Exception as e:
                print(e)
                return request.send_error('ERR_002')

        return request.send_info('INF_002')

class StudentNoticeFileAPIView(
    generics.GenericAPIView,
    mixins.DestroyModelMixin,
    ):
        queryset = ProfessionDefinition.objects.all()

        def delete(self, request, pk=None):

            # NOTE: Файл засаж байгаа үед хуучин файлыг устгана
            remove_file = os.path.join(settings.PROFESSION, str(pk))
            if remove_file:
                remove_folder(remove_file)

            self.destroy(request, pk)

            return request.send_info("INF_003")
@permission_classes([IsAuthenticated])
class ProfessionDefinitionListAPIView(
    generics.GenericAPIView,
    mixins.ListModelMixin
):
    """ Мэргэжлийн тодорхойлолтын жагсаалт """

    queryset = ProfessionDefinition.objects
    serializer_class = ProfessionDefinitionSerializer

    def get_queryset(self):
        queryset = self.queryset
        degreeId = self.request.query_params.get('degreeId')
        department = self.request.query_params.get('department')
        confirm_year = self.request.query_params.get('confirm_year')
        schoolId = self.request.query_params.get('schoolId')

        if schoolId:
            queryset = queryset.filter(school_id=schoolId)

        # Хөтөлбөрийн баг
        if department:
            queryset = queryset.filter(department_id=department)

        # Боловсролын зэрэг
        if degreeId:
            queryset = queryset.filter(degree=degreeId)

        # Хөтөлбөр батлагдсан он
        if confirm_year:
            queryset = queryset.filter(confirm_year=confirm_year)

        return queryset

    def get(self, request):

        all_list = self.list(request).data
        return request.send_data(all_list)

@permission_classes([IsAuthenticated])
class LearningPlanAPIView(
    mixins.CreateModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    mixins.RetrieveModelMixin,
    mixins.ListModelMixin,
    generics.GenericAPIView
):
    """  Сургалтын төлөвлөгөө """

    queryset = LearningPlan.objects.all()
    serializer_class = LearningPlanSerializer

    pagination_class = CustomPagination
    filter_backends = [SearchFilter]
    search_fields = ['profession__name', 'lesson__name', 'lesson_level__level_name', 'lesson_type__type_name', 'season__season_name']

    @has_permission(must_permissions=['lms-study-learningplan-read'])
    def get(self, request, pk=None):
        "  Сургалтын төлөвлөгөөны жагсаалт "

        self.serializer_class = LearningPlanListSerializer

        if pk:
            plan = self.retrieve(request, pk).data
            return request.send_data(plan)

        learn_plan_list = self.list(request).data
        return request.send_data(learn_plan_list)

    @has_permission(must_permissions=['lms-study-learningplan-create'])
    def post(self, request):
        "  Сургалтын төлөвлөгөө шинээр үүсгэх "

        request_data = request.data
        profession = request_data.get('profession')
        lesson = request_data.get('lesson')

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
            if profession and lesson:
                qs = self.queryset.filter(profession=profession, lesson=lesson)

                if qs:
                    return request.send_error("ERR_002", "Тухайн мэргэжлийн сургалтын төлөвлөгөөн дээр энэ хичээл бүртгэгдсэн байна.")

            error_obj = {
                "error": serializer.errors,
                "msg": "Код давхцаж байна"
            }

            return request.send_error("ERR_003", error_obj)


    @has_permission(must_permissions=['lms-study-learningplan-update'])
    def put(self, request, pk=None):
        "  Сургалтын төлөвлөгөөн засах "

        request_data = request.data
        profession = request_data.get('profession')
        lesson = request_data.get('lesson')

        check_qs = self.queryset.filter(id=pk).first()
        if check_qs:
            old_profession = check_qs.profession.id
            old_lesson = check_qs.lesson.id

            if old_profession != int(profession) or int(lesson) != old_lesson:
                qs = self.queryset.filter(profession=profession, lesson=lesson)

                if qs:
                    return request.send_error("ERR_002", "Тухайн мэргэжлийн сургалтын төлөвлөгөөн дээр энэ хичээл бүртгэгдсэн байна.")

        self.update(request, pk)
        return request.send_info("INF_002")

    @has_permission(must_permissions=['lms-study-learningplan-delete'])
    def delete(self, request, pk=None):
        " Сургалтын төлөвлөгөө устгах "

        self.destroy(request, pk)
        return request.send_info("INF_003")

@permission_classes([IsAuthenticated])
class LearningPlanListAPIView(
    mixins.CreateModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    mixins.RetrieveModelMixin,
    mixins.ListModelMixin,
    generics.GenericAPIView
):
    """  Сургалтын төлөвлөгөө """

    queryset = LearningPlan.objects.all()
    serializer_class = LearningPlanSerializer

    pagination_class = CustomPagination
    filter_backends = [SearchFilter]
    search_fields = ['profession__name', 'lesson__name', 'lesson_level__level_name', 'lesson_type__type_name', 'season__season_name']

    def get(self, request, salbar=None, level=None, type=None, profession=None):
        "  Сургалтын төлөвлөгөөны жагсаалт "

        self.serializer_class = LearningPlanListSerializer

        self.queryset = self.queryset.filter(profession=profession, lesson_level=level, department=salbar, lesson_type=type)

        learn_plan_list = self.list(request).data
        return request.send_data(learn_plan_list)


# @permission_classes([IsAuthenticated])
class ConfirmYearListAPIView(
    mixins.ListModelMixin,
    generics.GenericAPIView
):
    """  Хөтөлбөр батлагдсан оны жагсаалт авах """
    queryset = ProfessionDefinition.objects.all()

    def get(self, request):

        conf_year = list(self.queryset.filter(confirm_year__isnull=False).values('confirm_year').annotate(cnt=Count('confirm_year')).order_by('confirm_year'))

        return request.send_data(conf_year)


class LessonStandartStudentListAPIView(
    mixins.ListModelMixin,
    generics.GenericAPIView
):
    """ Тухайн оюутны төгсөлтийн хичээлийн жагсаалт """

    queryset = LessonStandart.objects
    serializer_class = LessonStandartListSerializer

    def get_queryset(self):
        queryset = self.queryset
        student = self.request.query_params.get('student')

        if student:
            qs_student = Student.objects.filter(pk=student).first()
            if qs_student:
                qs_group = Group.objects.filter(id=qs_student.group.id).last()
                if qs_group:
                    lesson_ids = LearningPlan.objects.filter(profession=qs_group.profession, lesson_level=LearningPlan.DIPLOM).values_list('lesson', flat=True)

                    queryset = queryset.filter(id__in=lesson_ids)

        return queryset

    def get(self, request, pk=None):

        lesson_list = self.list(request).data
        return request.send_data(lesson_list)


class ProfessionPlanListAPIView(
    mixins.CreateModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    mixins.RetrieveModelMixin,
    mixins.ListModelMixin,
    generics.GenericAPIView
):
    """ Тухайн мэргэжлийн сургалтын төлөвлөгөө """

    queryset = LearningPlan.objects
    serializer_class = LearningPlanSerializer

    def get_queryset(self):
        queryset = self.queryset
        department = self.request.query_params.get('department')
        school = self.request.query_params.get('school')
        profession = self.request.query_params.get('profession')
        lesson_level = self.request.query_params.get('level')
        lesson_type = self.request.query_params.get('type')

        if school:
            queryset = queryset.filter(school=school)

        if department:
            queryset = queryset.filter(department=department)

        if profession:
            queryset = queryset.filter(profession=profession)

        if lesson_level:
            queryset = queryset.filter(lesson_level=lesson_level)

        if lesson_type:
            queryset = queryset.filter(lesson_type=lesson_type)

        queryset.order_by('updated_at')

        return queryset

    def get(self, request, pk=None):

        self.serializer_class = ProfessionLearningPlanSerializer

        lesson_plan_list = self.list(request).data
        return request.send_data(lesson_plan_list)

    @has_permission(must_permissions=['lms-study-learningplan-create'])
    def post(self, request):
        "  Сургалтын төлөвлөгөө шинээр үүсгэх "

        school = request.data.get('school')
        department = request.data.get('department')
        profession_id = request.data.get('profession')
        all_datas = request.data.get('all_datas')

        # datas жагсаалтаас key-нь датаг салгах нь
        def get_datas_by_key(datas):
            plan_id = datas.get('id')
            lesson = datas.get('lesson')
            previous_lesson = datas.get('previous_lesson')
            season = datas.get('season')
            lesson_level = datas.get('lesson_level')
            lesson_type = datas.get('lesson_type')
            group_lesson = datas.get('group_lesson')
            is_check_score = datas.get('is_check_score')

            return plan_id, lesson, previous_lesson, season, lesson_level, lesson_type, group_lesson, is_check_score

        # list ээс key болон value гаар нь тухайн element байгаа эсэхийг шалгаж element-ийн утгыг авах
        def find_data_from_list_by_key(list, key, value):
            return next(filter(lambda x: x[key] == value, list), None)

        with transaction.atomic():
            try:

                # хэрэв all_datas байхгүй бол pass
                if all_datas:
                    pass

                update_list = []
                create_list = []
                update_list_ids = []

                updated_data_list = []
                create_learninPlan_list = []

                # create хийх update хийх датаг all_datas жагсаалтаас ялгах нь
                for datas in all_datas:
                    check_id = datas.get('id')
                    # тухайн дата нь id гэсэн element байвал update хийх дата байна гэж үзээд update_list жагсаалтад нэмж  datas жагсаалтаас устгана
                    # all_datas жагсаалтанд шинээр үүсгэх датануудын жагсаалт үлдэнэ
                    if check_id:
                        update_list.append(datas)
                        update_list_ids.append(check_id)
                    else:
                        create_list.append(datas)

                # Хэрэв update хийх жагсалтын урт нь 0 ээс их бол update хийх үйлдэлийг эхлүүлнэ
                if len(update_list) > 0:
                    update_qs_list = self.queryset.filter(id__in=update_list_ids)

                    for update_qs in update_qs_list:
                        lesson = None
                        previous_lesson = None
                        season = None
                        group_lesson = None

                        update_data = find_data_from_list_by_key(update_list, 'id', update_qs.id)

                        if update_data:
                            plan_id, lesson, previous_lesson, season, lesson_level, lesson_type, group_lesson, is_check_score = get_datas_by_key(update_data)

                        old_profession = update_qs.profession.id
                        old_lesson = update_qs.lesson.id

                        # хичээлийн бүртгэл шалгах бүртгэлтэй бол алдаа буцаах
                        # Хичээл зассан бол хичээлийн давхцалыг шалгана
                        if old_profession != int(profession_id) or (lesson and int(lesson) != old_lesson):
                            qs = self.queryset.filter(profession=profession_id, lesson=lesson).first()

                            if qs:
                                profession_name = qs.profession.name
                                lesson_name = qs.lesson.name
                                lesson_code = qs.lesson.code
                                msg = "`{profession}` мэргэжлийн сургалтын төлөвлөгөөн дээр `{lesson_code} {lesson_name}` хичээл бүртгэгдсэн байна." \
                                    .format(
                                        profession=profession_name,
                                        lesson_name=lesson_name,
                                        lesson_code=lesson_code,
                                    )

                                return request.send_error("ERR_002", msg)

                        if lesson:
                            # тухайн queryset-ийн датаг өөрчилж updated_data_list жагсаалтанд нэмэх нь
                            update_qs.group_lesson = LessonStandart.objects.get(id=group_lesson) if group_lesson else None
                            update_qs.previous_lesson = LessonStandart.objects.get(id=previous_lesson) if previous_lesson else None
                            update_qs.lesson = LessonStandart.objects.get(id=lesson)
                            update_qs.season = season
                            update_qs.is_check_score = is_check_score

                            updated_data_list.append(update_qs)

                if len(create_list) > 0:
                    for create_data in create_list:
                        plan_id, lesson, previous_lesson, season, lesson_level, lesson_type, group_lesson, is_check_score = get_datas_by_key(create_data)

                        # хичээлийн бүртгэл шалгах бүртгэлтэй бол алдаа буцаах
                        if lesson:
                            qs = self.queryset.filter(profession=profession_id, lesson=lesson).first()

                            if qs:
                                profession_name = qs.profession.name
                                lesson_name = qs.lesson.name
                                lesson_code = qs.lesson.code
                                msg = "`{profession}` мэргэжлийн сургалтын төлөвлөгөөн дээр `{lesson_code} {lesson_name}` хичээл бүртгэгдсэн байна." \
                                    .format(
                                        profession=profession_name,
                                        lesson_name=lesson_name,
                                        lesson_code=lesson_code,
                                    )

                                return request.send_error("ERR_002", msg)

                        if lesson:
                            create_learninPlan_list.append(
                                LearningPlan(
                                    school=SubSchools.objects.get(id=school),
                                    lesson=LessonStandart.objects.get(id=lesson),
                                    department=Departments.objects.get(id=department) if department else None,
                                    profession=ProfessionDefinition.objects.get(id=profession_id),
                                    previous_lesson=LessonStandart.objects.get(id=previous_lesson) if previous_lesson else None,
                                    group_lesson = LessonStandart.objects.get(id=group_lesson) if group_lesson else None,
                                    season=season if season else None,
                                    lesson_level=lesson_level,
                                    lesson_type=lesson_type,
                                    is_check_score=is_check_score,
                                )
                            )

                # bulk_create, bulk_update
                self.queryset.bulk_create(create_learninPlan_list)
                self.queryset.bulk_update(updated_data_list, ['group_lesson', 'previous_lesson', 'lesson', 'season', 'is_check_score'])

            except Exception as e:
                print(e.__str__())
                return request.send_error("ERR_002")

        return request.send_info("INF_013")

    @has_permission(must_permissions=['lms-study-learningplan-delete'])
    def delete(self, request, pk=None):
        " Сургалтын төлөвлөгөө устгах "

        self.destroy(request, pk)
        return request.send_info("INF_003")


class LessonStandartBagtsAPIView(
    generics.GenericAPIView
):

    def get(self, request, pk=None):
        """ Нэг хичээлийн багц цагийн мэдээлэл авах """

        return_values = []
        if pk:
            values = LessonStandart.objects.filter(id=pk).values('lecture_kr', 'seminar_kr', 'laborator_kr', 'practic_kr', 'biedaalt_kr')

            for value in values:
                obj = {}
                lk = value.get('lecture_kr')
                sem = value.get('seminar_kr')
                lab = value.get('laborator_kr')
                pr = value.get('practic_kr')
                bd = value.get('biedaalt_kr')

                if lk:
                    obj['id'] = TimeTable.LECT
                    obj['name'] = 'Лекц'
                    return_values.append(obj)
                    obj = {}

                if sem:
                    obj['id'] = TimeTable.SEM
                    obj['name'] = 'Семинар'
                    return_values.append(obj)
                    obj = {}

                if lab:
                    obj['id'] = TimeTable.LAB
                    obj['name'] = 'Лаборатор'
                    return_values.append(obj)
                    obj = {}

                if pr:
                    obj['id'] = TimeTable.PRACTIC
                    obj['name'] = 'Практик'
                    return_values.append(obj)
                    obj = {}

                if bd:
                    obj['id'] = TimeTable.BIY_DAALT
                    obj['name'] = 'Бие даалт'
                    return_values.append(obj)
                    obj = {}

        return request.send_data(list(return_values))


class LearningPlanProfessionDefinitionAPIView(
    generics.GenericAPIView
):
    """ Мэргэжлээс сургалтын төлөвлөгөөний хичээл авах """

    def get(self, request, profession=None):

        all_list = []
        queryset = LearningPlan.objects
        school = request.query_params.get('school')
        profession = request.query_params.get('profession')

        if school:
            queryset = queryset.filter(school=school)

        if profession:
            get_object_or_404(ProfessionDefinition, id=profession)

            lesson_ids = queryset.filter(profession=profession).values_list('lesson', flat=True).distinct('lesson')

            all_list = list(LessonStandart.objects.filter(id__in=lesson_ids).values('id', 'name', 'code', 'kredit'))

            seasons = queryset.filter(lesson__in=lesson_ids, profession=profession).values('lesson', 'season')
            for clist in all_list:

                full_name = ''
                name = clist.get('name')
                code = clist.get('code')
                p_id = clist.get('id')

                for lseason in seasons:
                    if p_id == lseason.get('lesson'):
                        season = lseason.get('season')

                clist['season'] = season if season else ''

                if code:
                    full_name += code
                if name:
                    full_name +=  ' ' + name

                clist['full_name'] = full_name

        return request.send_data(all_list)


class ProfessionPrintPlanAPIView(
    generics.GenericAPIView
):
    """ Мэргэжлээс сургалтын төлөвлөгөөний хичээл авах """

    def get(self, request):

        all_data = dict()

        profession = request.query_params.get('profession')

        profession_qs = ProfessionDefinition.objects.filter(id=profession).values('id', 'dep_name', 'name').last()
        group_queryset = Group.objects.filter(profession=profession, is_finish=False).order_by('id')
        group_data = GroupSerializer(group_queryset, many=True).data

        all_data['group'] = group_data

        all_data['id'] = profession_qs['id']
        all_data['dep_name'] = profession_qs['dep_name']
        all_data['name'] = profession_qs['name']

        request.data['group_queryset'] = group_queryset

        learning_plan_queryset = LearningPlan.objects.filter(profession=profession)

        all_levels_data = list()

        for lesson_level in LearningPlan.LESSON_LEVEL:
            level_data = learning_plan_queryset.filter(lesson_level=lesson_level[0])

            if level_data:
                one_lesson_datas = dict()
                one_lesson_datas['level'] = lesson_level[1]
                one_lesson_datas['count'] = level_data.aggregate(Sum('lesson__kredit')).get('lesson__kredit__sum')
                one_type_datas = list()

                for lesson_type in LearningPlan.LESSON_TYPE:

                    type_datas = level_data.filter(lesson_type=lesson_type[0])

                    if type_datas:
                        lesson_datas = dict()
                        type_data = LearningPlanPrintSerializer(type_datas, context={ "request": request }, many=True).data
                        lesson_datas['type'] = lesson_type[1]
                        lesson_datas['lessons'] = type_data
                        lesson_datas['count'] = type_datas.aggregate(Sum('lesson__kredit')).get('lesson__kredit__sum')
                        one_type_datas.append(lesson_datas)

                one_lesson_datas['data'] = one_type_datas

                all_levels_data.append(one_lesson_datas)

        all_data['lesson'] = all_levels_data

        return request.send_data(all_data)

class AdmissionBottomScoreAPIView(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    generics.GenericAPIView
):

    """ Элсэлтийн шалгалтын хичээл ба босго оноо мэргэжлээр """

    queryset = AdmissionBottomScore.objects
    serializer_class = AdmissionBottomScoreSerializer

    def get(self, request, pk=None):

        self.serializer_class = AdmissionBottomScoreListSerializer

        #Өнөөдрөөс хойших датаг авна
        self.queryset = self.queryset.filter(profession=pk)

        return_datas = self.list(request).data

        return request.send_data(return_datas)


    # @has_permission(must_permissions=['lms-role-teacher-score-update'])
    def put(self, request, pk=None):
        """ ЭЕШ оноо засах
            мэргэжлийн id = pk
        """
        datas = request.data

        profession = datas.get("profession")
        bottom_score = datas.get("bottom_score")
        lesson = datas.get('lesson')

        profession = ProfessionDefinition.objects.filter(pk=pk).first()
        admission_lesson = AdmissionBottomScore.objects.filter(profession=profession, admission_lesson=lesson).first()

        if admission_lesson:
            obj = AdmissionBottomScore.objects.filter(admission_lesson__id=lesson).update(
                profession=profession,
                bottom_score=bottom_score
            )
        else:
            lesson_instance = AdmissionLesson.objects.filter(id=lesson).first()
            obj = AdmissionBottomScore.objects.filter(profession=pk).create(
                profession=profession,
                admission_lesson=lesson_instance,
                bottom_score=bottom_score
            )

        return request.send_info("INF_002")

    def delete(self, request, pk=None):

        try:
            obj = AdmissionBottomScore.objects.filter(admission_lesson__id=pk).delete()
        except:
            return request.send_error("ERR_002", "Амжилтгүй")

        return request.send_info("INF_003")
class LessonStandartTimetableListAPIView(
    generics.GenericAPIView,
    mixins.ListModelMixin
):
    """ Хичээлийн хуваарьт зориулж хичээлийн лист авах """

    queryset = LessonStandart.objects.all()
    serializer_class = LessonStandartSerialzier

    def get(self, request):

        year = self.request.query_params.get('lesson_year')
        season = self.request.query_params.get('lesson_season')
        school = self.request.query_params.get('school')

        qs_lplan = LearningPlan.objects.all()

        # if school:
        #     # qs_lplan = qs_lplan.filter(school=school)
        #     self.queryset = self.queryset.filter(Q(Q(school=school) | Q(school__org_code=10)))

        even_i = []
        odd_i = []

        for i in range(1,13):
            if i % 2 == 0:
                even_i.append(i)
            else:
                odd_i.append(i)


        # Идэвхтэй улиралд байгаа хичээлүүдийг авах
        # if season == '1':
        #     lookups = [Q(season__contains=str(value)) for value in odd_i]

        #     # Combine the individual lookups using the OR operator (|) for a match on any of the values
        #     filter_query = Q()
        #     for lookup in lookups:
        #         filter_query |= lookup

        #     lesson_ids = qs_lplan.filter(filter_query).values_list('lesson', flat=True).distinct('lesson')
        # else:
        #     lookups = [Q(season__contains=str(value)) for value in even_i]

        #     # Combine the individual lookups using the OR operator (|) for a match on any of the values
        #     filter_query = Q()
        #     for lookup in lookups:
        #         filter_query |= lookup

        #     lesson_ids = qs_lplan.filter(filter_query).values_list('lesson', flat=True).distinct('lesson')

        # self.queryset = self.queryset.filter(id__in=list(lesson_ids))

        all_list = self.list(request).data

        return request.send_data(list(all_list))


class LessonStandartDiplomaListAPIView(
    mixins.ListModelMixin,
    generics.GenericAPIView
):
    """ Тухайн оюутны төгсөлтийн хичээлийн жагсаалт """

    queryset = LessonStandart.objects
    serializer_class = LessonStandartListSerializer

    def get_queryset(self):
        queryset = self.queryset
        student = self.request.query_params.get('student')

        if student:
            qs_student = Student.objects.filter(pk=student).first()
            if qs_student:
                qs_group = Group.objects.filter(id=qs_student.group.id).last()
                if qs_group:
                    lesson_ids = LearningPlan.objects.filter(profession=qs_group.profession, lesson_level=LearningPlan.DIPLOM).values_list('lesson', flat=True)
                    queryset = queryset.filter(id__in=lesson_ids)

        return queryset

    def get(self, request, pk=None):

        lesson_list = self.list(request).data
        return request.send_data(lesson_list)


class LessonStandartProfessionListAPIView(
    generics.GenericAPIView,
    mixins.ListModelMixin
):
    ''' Нэг мэггэжлийн сургалтын төлөвлөгөөнд байгаа хичээлүүд '''

    queryset = LessonStandart.objects.all()
    serializer_class = LessonStandartSerialzier

    def get(self, request, profession=None):
        all_list = []

        if profession:
            learningplan_lesson_ids = LearningPlan.objects.filter(profession=profession).values_list('lesson', flat=True)

            self.queryset = self.queryset.filter(id__in=list(learningplan_lesson_ids))

            all_list = self.list(request).data

        return request.send_data(all_list)
