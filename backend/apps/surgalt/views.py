import os
from rest_framework import mixins
from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.filters import SearchFilter
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes

from main.utils.function.pagination import CustomPagination
from main.utils.function.utils import override_get_queryset
from main.utils.function.utils import has_permission, get_domain_url, _filter_queries
from main.utils.file import save_file
from main.utils.file import remove_folder
from main.decorators import login_required

from django.db import transaction
from django.db.models import Sum, Count, Q, Subquery, OuterRef,  Value, CharField
from django.db.models.functions import Concat

from django.shortcuts import get_object_or_404
from django.conf import settings

# from functools import reduce
# from operator import or_

from elselt.models import ElseltUser

from lms.models import (
    Group,
    Student,
    TimeTable,
    SubOrgs,
    Salbars,
    Exam_repeat,
    LearningPlan,
    ScoreRegister,
    ExamTimeTable,
    LessonStandart,
    Lesson_title_plan,
    Lesson_to_teacher,
    ProfessionalDegree,
    ProfessionDefinition,
    AdmissionBottomScore,
    Profession_SongonKredit,
    Teachers,
    Challenge,
    QuestionChoices,
    Lesson_materials,
    Lesson_assignment,
    ChallengeStudents,
    TimeTable_to_group,
    ChallengeQuestions,
    TimeTable_to_student,
    Lesson_material_file,
    Lesson_assignment_student,
    Lesson_assignment_student_file,
    AdmissionLesson,
    PsychologicalTestQuestions,
    PsychologicalQuestionChoices,
    PsychologicalQuestionTitle,
    PsychologicalTest
)

from core.models import (
    User,
)

from lms.models import get_image_path
from lms.models import get_choice_image_path

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
from .serializers import ChallengeSerializer
from .serializers import ChallengeListSerializer
from .serializers import ChallengeQuestionListSerializer
from .serializers import GroupListSerializer
from .serializers import LessonAssignmentAssigmentListSerializer
from .serializers import LessonAssignmentAssigmentSerializer
from .serializers import LessonTitleSerializer
from .serializers import LessonMaterialSerializer
from .serializers import LessonMaterialListSerializer
from .serializers import LessonTeacherSerializer
from .serializers import ProfessionDefinitionJustProfessionSerializer
from .serializers import PsychologicalTestSerializer
from .serializers import PsychologicalTestQuestionsSerializer
from .serializers import PsychologicalTestScopeSerializer
from .serializers import TeachersSerializer
from .serializers import StudentSerializer
from .serializers import ElsegchSerializer

from main.utils.function.utils import remove_key_from_dict, fix_format_date, get_domain_url
from main.utils.function.utils import null_to_none, get_lesson_choice_student, get_active_year_season, json_load
from main.utils.function.serializer import dynamic_serializer

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

        department = request.query_params.get('department')
        category = request.query_params.get('category')

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
    @transaction.atomic
    def post(self, request):
        " хичээлийн стандартын шинээр үүсгэх "

        request_data = request.data
        serializer = self.get_serializer(data=request_data)

        # transaction savepoint зарлах нь хэрэв алдаа гарвад roll back хийнэ
        sid = transaction.savepoint()

        try:
            serializer = self.serializer_class(data=request_data, many=False)
            if not serializer.is_valid():
                transaction.savepoint_rollback(sid)
                return request.send_error_valid(serializer.errors)

            serializer.save()

        except Exception:
            return request.send_error("ERR_002")

        return request.send_info("INF_001")

    @has_permission(must_permissions=['lms-study-lessonstandart-update'])
    @transaction.atomic
    def put(self, request, pk=None):
        " хичээлийн стандартын шинээр үүсгэх "

        request_data = request.data
        teachers_data = request.data.get("teachers")
        instance = self.get_object()

        try:
            instance = self.get_object()
            serializer = self.get_serializer(instance, data=request_data, partial=True)

            if not serializer.is_valid(raise_exception=False):
                return request.send_error_valid(serializer.errors)

            if teachers_data:
                old_teacher_qs = Lesson_to_teacher.objects.filter(lesson=pk)
                old_teacher_qs.delete()
                for teacher in teachers_data:
                    teacher_id = teacher.get('id')
                    Lesson_to_teacher.objects.update_or_create(
                        lesson_id=pk,
                        teacher_id=teacher_id
                    )

            serializer.save()

            return request.send_info("INF_002")

        except Exception as e:
            print(e)
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

@permission_classes([IsAuthenticated])
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

    def get(self, request):

        school = request.query_params.get('school')
        # department = request.query_params.get('department')
        profession = request.query_params.get('profession')

        if school:
            self.queryset = self.queryset.filter(school=school)

        # if department:
        #     self.queryset = self.queryset.filter(department=department)

        if profession:
            lesson_ids = LearningPlan.objects.filter(profession=profession).values_list('lesson', flat=True)
            self.queryset = self.queryset.filter(id__in=lesson_ids)
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
    search_fields = ['name', 'code', 'profession_code', 'degree__degree_name']

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

        self.queryset = (
            self.queryset
            .annotate(
                general_base=Subquery(Profession_SongonKredit.objects.filter(profession=OuterRef('pk'), lesson_level=LearningPlan.BASIC).values('songon_kredit')[:1]),
                professional_base=Subquery(Profession_SongonKredit.objects.filter(profession=OuterRef('pk'), lesson_level=LearningPlan.PROF_BASIC).values('songon_kredit')[:1]),
                professional_lesson=Subquery(Profession_SongonKredit.objects.filter(profession=OuterRef('pk'), lesson_level=LearningPlan.PROFESSION).values('songon_kredit')[:1]),
            )
        )

        if pk:
            plan = self.retrieve(request, pk).data
            return request.send_data(plan)

        learn_plan_list = self.list(request).data
        return request.send_data(learn_plan_list)

    @has_permission(must_permissions=['lms-study-profession-create'])
    @transaction.atomic
    def post(self, request):
        "  Мэргэжлийн тодорхойлолт шинээр үүсгэх "

        request_data = request.data
        # with_start = '001'
        # profession_code = 1

        # profession_qs = (
        #     ProfessionDefinition.objects.order_by('profession_code')
        # ).first()

        # if profession_qs:
        #     check_code = profession_qs.profession_code
        #     if check_code:
        #         profession_code = int(check_code) + 1

        # new_profession_code = f'{int(profession_code):0{len(with_start)}d}'
        # request_data['profession_code'] = new_profession_code

        # transaction savepoint зарлах нь хэрэв алдаа гарвад roll back хийнэ
        sid = transaction.savepoint()

        try:
            serializer = self.serializer_class(data=request_data, many=False)
            if not serializer.is_valid():
                transaction.savepoint_rollback(sid)
                return request.send_error_valid(serializer.errors)

            serializer.save()

        except Exception:
            return request.send_error("ERR_002")

        return request.send_info("INF_001")

    @has_permission(must_permissions=['lms-study-profession-update'])
    @transaction.atomic
    def put(self, request, pk=None):
        "  Мэргэжлийн тодорхойлолт  засах "

        request_data = request.data
        general_base = request_data.get('general_base')
        profession = request_data.get('id')
        professional_base = request_data.get('professional_base')
        professional_lesson = request_data.get('professional_lesson')
        admission_lesson = request_data.get('admission_lesson')

        try:
            instance = self.get_object()
            serializer = self.get_serializer(instance, data=request_data, partial=True)

            if not serializer.is_valid(raise_exception=False):
                return request.send_error_valid(serializer.errors)

            if general_base:
                ss = Profession_SongonKredit.objects.update_or_create(
                    profession_id=profession,
                    lesson_level=LearningPlan.BASIC,
                    songon_kredit=general_base
                )
            if professional_base:
                ss = Profession_SongonKredit.objects.update_or_create(
                    profession_id=profession,
                    lesson_level=LearningPlan.PROF_BASIC,
                    songon_kredit=professional_base
                )
            if professional_lesson:
                ss = Profession_SongonKredit.objects.update_or_create(
                    profession_id=profession,
                    lesson_level=LearningPlan.PROFESSION,
                    songon_kredit=professional_lesson
                )


            self.perform_create(serializer)

        except Exception as e:
            print(e)
            return request.send_error("ERR_002")

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



@permission_classes([IsAuthenticated])
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


@permission_classes([IsAuthenticated])
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


@permission_classes([IsAuthenticated])
class ConfirmYearListAPIView(
    mixins.ListModelMixin,
    generics.GenericAPIView
):
    """  Хөтөлбөр батлагдсан оны жагсаалт авах """
    queryset = ProfessionDefinition.objects.all()

    def get(self, request):

        conf_year = list(self.queryset.filter(confirm_year__isnull=False).values('confirm_year').annotate(cnt=Count('confirm_year')).order_by('confirm_year'))

        return request.send_data(conf_year)


@permission_classes([IsAuthenticated])
class LessonStandartStudentListAPIView(
    mixins.ListModelMixin,
    generics.GenericAPIView
):
    """ Тухайн оюутны төгсөлтийн хичээлийн жагсаалт """

    queryset = LessonStandart.objects
    serializer_class = LessonStandartSerializer

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



@permission_classes([IsAuthenticated])
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
        # department = self.request.query_params.get('department')
        school = self.request.query_params.get('school')
        profession = self.request.query_params.get('profession')
        lesson_level = self.request.query_params.get('level')
        lesson_type = self.request.query_params.get('type')

        # if school:
        #     queryset = queryset.filter(school=school)

        # if department:
        #     queryset = queryset.filter(department=department)

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
                                    school=SubOrgs.objects.get(id=school),
                                    lesson=LessonStandart.objects.get(id=lesson),
                                    department=Salbars.objects.get(id=department) if department else None,
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


@permission_classes([IsAuthenticated])
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


@permission_classes([IsAuthenticated])
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


@permission_classes([IsAuthenticated])
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

@permission_classes([IsAuthenticated])
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

@permission_classes([IsAuthenticated])
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


@permission_classes([IsAuthenticated])
class LessonStandartDiplomaListAPIView(
    mixins.ListModelMixin,
    generics.GenericAPIView
):
    """ Тухайн оюутны төгсөлтийн хичээлийн жагсаалт """

    queryset = LessonStandart.objects
    serializer_class = LessonStandartSerializer

    def get_queryset(self):
        queryset = self.queryset
        student = self.request.query_params.get('student')

        if student:
            qs_student = Student.objects.filter(pk=student).first()
            if qs_student:
                qs_group = Group.objects.filter(pk=qs_student.group.id).first()
                if qs_group:
                    lesson_ids = LearningPlan.objects.filter(Q(Q(profession=qs_group.profession) & Q(Q(lesson_level=LearningPlan.DIPLOM) | Q(lesson_level=LearningPlan.MAG_DIPLOM)))).values_list('lesson', flat=True)
                    queryset = queryset.filter(id__in=lesson_ids)

        return queryset

    def get(self, request, pk=None):

        lesson_list = self.list(request).data
        return request.send_data(lesson_list)


@permission_classes([IsAuthenticated])
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

@permission_classes([IsAuthenticated])
class ChallengeAPIView(
    generics.GenericAPIView,
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin
):
    """ Өөрийгөө сорих тест """

    queryset = Challenge.objects.all().order_by("-created_at")
    serializer_class = ChallengeSerializer

    pagination_class = CustomPagination

    @has_permission(must_permissions=['lms-exam-read'])
    def get(self, request):

        self.serializer_class = ChallengeListSerializer
        lesson = request.query_params.get('lesson')
        time_type = request.query_params.get('type')

        user = request.user
        teacher = Teachers.objects.filter(user_id=user).first()

        self.queryset = self.queryset.filter(created_by=teacher)

        if lesson:
            self.queryset = self.queryset.filter(lesson=lesson)

        if time_type:
            state_filters = Challenge.get_state_filter(time_type)

            self.queryset = self.queryset.filter(**state_filters)

        datas = self.list(request).data

        return request.send_data(datas)

    @has_permission(must_permissions=['lms-exam-create'])
    def post(self, request):

        lesson_year = request.query_params.get('year')
        lesson_season = request.query_params.get('season')

        general_datas = request.data

        question_ids = general_datas.get('question_ids')

        qs_student = Student.objects.all()

        user = request.user
        teacher = Teachers.objects.filter(user_id=user).first()

        # Анги эсвэл оюутны select хийгдсэн ids
        selected_ids = general_datas.get('selected')

        # Хамрах хүрээ
        scope = general_datas.get('scope')
        lesson_id = general_datas.get('lesson')

        lesson = LessonStandart.objects.get(id=lesson_id)

        general_datas = remove_key_from_dict(general_datas, [ 'scope', 'scopeName', 'selected', 'select', 'lesson'])

        # Өмнөх шалгалтын мэдээллээс сонгож хадгалсан үед дараах serializer-аар  дамжиж ирсэн утгуудыг хасна
        if general_datas.get('id'):
            general_datas = remove_key_from_dict(general_datas, ['group', 'student', 'startAt', 'endAt', 'id'])

        if 'question_ids' in general_datas:
            del general_datas['question_ids']

        if 'questions' in general_datas:
            del general_datas['questions']

        if 'scopeName' in general_datas:
            del general_datas['scopeName']

        general_datas['lesson'] = lesson
        general_datas['deleted_by'] = teacher
        general_datas['created_by'] = teacher

        # Тухайн хичээлийн хуваарь
        timetable_qs = TimeTable.objects.filter(lesson_year=lesson_year, lesson_season=lesson_season, lesson=lesson_id, teacher=teacher)
        timetable_ids = timetable_qs.values_list('id', flat=True)

        # Хичээлийн хуваариас хасалт хийлгэсэн оюутнууд
        exclude_student_ids = TimeTable_to_student.objects.filter(timetable_id__in=timetable_ids, add_flag=False).values_list('student', flat=True)

        kind = Challenge.KIND_LESSON

        # Хамрах хүрээ
        if scope == 'all':
            all_lesson_students = get_lesson_choice_student(lesson_id, teacher.id, '', lesson_year, lesson_season)
            student_ids = qs_student.filter(id__in=all_lesson_students).values_list('id', flat=True)

        elif scope == 'group':
            kind = Challenge.KIND_GROUP

            all_student_ids = qs_student.filter(group_id__in=selected_ids).values_list('id', flat=True)

            student_ids = set(all_student_ids) - set(list(exclude_student_ids))

        elif scope == 'student':
            kind = Challenge.KIND_STUDENT
            student_ids = selected_ids

        general_datas['kind'] = kind

        general_datas = null_to_none(general_datas)

        with transaction.atomic():

            try:
                question_qs = ChallengeQuestions.objects.filter(id__in=question_ids)

                challenge = self.queryset.create(**general_datas)

                # ManytoMany field нэмэх хэсэг
                if challenge:
                    challenge.questions.set(list(question_qs))
                    challenge.student.set(list(student_ids))

            except Exception as e:
                print(e)

                return request.send_error('ERR_002')

        return request.send_info('INF_001')

    @has_permission(must_permissions=['lms-exam-update'])
    def put(self, request, pk):

        general_datas = request.data

        lesson_year = request.query_params.get('year')
        lesson_season = request.query_params.get('season')

        question_ids = general_datas.get('question_ids')

        qs_student = Student.objects.all()

        user = request.user
        teacher = Teachers.objects.filter(user_id=user).first()

        # Анги эсвэл оюутны select хийгдсэн ids
        selected_ids = general_datas.get('selected')

        # Хамрах хүрээ
        scope = general_datas.get('scope')
        lesson_id = general_datas.get('lesson')

        general_datas = remove_key_from_dict(general_datas, ['group', 'student', 'scopeName', 'startAt', 'endAt', 'question_ids', 'questions', 'selected', 'created_by'])

        # Тухайн хичээлийн хуваарь
        timetable_qs = TimeTable.objects.filter(lesson_year=lesson_year, lesson_season=lesson_season, lesson=lesson_id, teacher=teacher)
        timetable_ids = timetable_qs.values_list('id', flat=True)

        # Хичээлийн хуваариас хасалт хийлгэсэн оюутнууд
        exclude_student_ids = TimeTable_to_student.objects.filter(timetable_id__in=timetable_ids, add_flag=False).values_list('student', flat=True)

        kind = Challenge.KIND_LESSON

        # Хамрах хүрээ
        if scope == 'all':
            all_lesson_students = get_lesson_choice_student(lesson_id, teacher.id, '',  lesson_year, lesson_season)
            student_ids = qs_student.filter(id__in=all_lesson_students).values_list('id', flat=True)

        elif scope == 'group':
            kind = Challenge.KIND_GROUP

            all_student_ids = qs_student.filter(group_id__in=selected_ids).values_list('id', flat=True)

            student_ids = set(all_student_ids) - set(list(exclude_student_ids))

        elif scope == 'student':
            kind = Challenge.KIND_STUDENT
            student_ids = selected_ids

        general_datas['kind'] = kind
        general_datas['created_by'] = teacher.id

        with transaction.atomic():

            try:
                self.update(request, pk).data

                challenge = self.queryset.get(id=pk)

                # ManytoMany field нэмэх хэсэг
                if challenge:

                    question_qs = ChallengeQuestions.objects.filter(id__in=question_ids)

                    # ManytoMany field ээ устгаад нэмнэ.
                    challenge.questions.clear()
                    challenge.student.clear()

                    # ManytoMany field ээ шинээр нэмнэ.
                    challenge.questions.set(list(question_qs))
                    challenge.student.set(list(student_ids))

            except Exception as e:
                print(e)

                return request.send_error('ERR_002')

        return request.send_info('INF_002')

    @has_permission(must_permissions=['lms-exam-delete'])
    def delete(self, request, pk=None):

        challenge_obj = self.queryset.get(id=pk)

        try:
            if challenge_obj:
               challenge_obj.questions.clear()
               challenge_obj.student.clear()
               challenge_obj.save()

            # Шалгалтад хариулсан сурагчид
            challenge_students = ChallengeStudents.objects.filter(challenge=challenge_obj)
            print(challenge_students)

            self.destroy(request, pk)

        except Exception as e:
            print(e)
            return request.send_error("ERR_002")

        return request.send_info("INF_003")

@permission_classes([IsAuthenticated])
class ChallengeAllAPIView(
    generics.GenericAPIView,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin
):
    """ Өөрийгөө сорих шалгалт бүх жагсаалт """

    queryset = Challenge.objects.all()
    serializer_class = ChallengeListSerializer

    @login_required()
    def get(self, request):

        challenge = request.query_params.get('challenge')

        if challenge:
            instance = self.queryset.filter(id=int(challenge)).first()
            serializer_data = self.get_serializer(instance).data

            return request.send_data(serializer_data)

        datas = self.list(request).data

        return request.send_data(datas)

@permission_classes([IsAuthenticated])
class ChallengeSelectAPIView(
    generics.GenericAPIView
):
    @login_required()
    def get(self, request):

        lesson = ''
        all_list = []

        year = request.query_params.get('year')
        season = request.query_params.get('season')
        lesson = request.query_params.get('lesson')

        ctype = request.query_params.get('type')

        user = request.user
        teacher = get_object_or_404(Teachers, user_id=user, action_status=Teachers.APPROVED)

        quesyset = TimeTable.objects.all()

        if year and season:
            quesyset = quesyset.filter(lesson_year=year, lesson_season=season)

        if lesson:
            quesyset = quesyset.filter(lesson=lesson)

        quesyset = quesyset.filter(teacher=teacher)

        timetable_ids = quesyset.values_list('id', flat=True)

        if ctype == 'group':

            group_ids = TimeTable_to_group.objects.filter(timetable_id__in=timetable_ids).values_list('group', flat=True)

            qroup_qs = Group.objects.filter(id__in=group_ids)

            all_list = GroupListSerializer(qroup_qs, many=True).data

        else:

            all_student = get_lesson_choice_student(lesson, teacher, '', year, season)

            student_list = Student.objects.filter(id__in=all_student).values_list('id', flat=True)

            for student_id in student_list:
                obj = {}
                obj['id'] = student_id

                student = Student.objects.filter(id=student_id).first()

                obj['full_name'] = student.full_name + " " + student.code

                all_list.append(obj)

        return request.send_data(list(all_list))


@permission_classes([IsAuthenticated])
class QuestionsAPIView(
    generics.GenericAPIView,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.DestroyModelMixin
):
    """
        Асуултын хэсэг
    """

    queryset = ChallengeQuestions.objects.all().order_by('-created_at')
    serializer_class = ChallengeQuestionListSerializer

    pagination_class = CustomPagination

    filter_backends = [SearchFilter]
    search_fields = ['question', 'subject__title']


    @has_permission(must_permissions=['lms-exam-question-read'])
    def get(self, request, pk=None):

        lesson = request.query_params.get('lesson')
        subject = request.query_params.get('subject')

        user = request.user
        teacher = get_object_or_404(Teachers, user_id=user, action_status=Teachers.APPROVED)

        self.queryset = self.queryset.filter(created_by=teacher)

        if lesson:
            self.queryset = self.queryset.filter(subject__lesson=lesson)

        if subject:
            self.queryset = self.queryset.filter(subject=subject)

        if pk:
            row_data = self.retrieve(request, pk).data
            return request.send_data(row_data)

        all_list = self.list(request).data

        return request.send_data(all_list)


    @has_permission(must_permissions=['lms-exam-question-update'])
    def put(self, request, pk):

        datas = request.data.dict()
        subject_id = datas.get('subject')

        subject = Lesson_title_plan.objects.filter(id=subject_id).first()

        quesion_imgs = request.FILES.getlist('questionImg')
        choice_imgs = request.FILES.getlist('choiceImg')

        questions = request.POST.getlist('question')

        user = request.user
        teacher = Teachers.objects.filter(user_id=user).first()

        with transaction.atomic():
            sid = transaction.savepoint()
            try:
                # Асуултыг хадгалах хэсэг
                for question in questions:
                    question = json_load(question)

                    qkind = question.get("kind")
                    image_name = question.get('imageName')

                    score = question.get('score') # Асуултын оноо

                    question['created_by'] = teacher
                    question['subject'] = subject

                    question_img = None

                    # Асуултын сонголтууд
                    choices = question.get('choices')

                    # Асуултын зураг хадгалах хэсэг
                    for img in quesion_imgs:
                        if image_name == img.name:
                            question_img = img
                            break

                    question = remove_key_from_dict(question, [ 'image', 'choices'])

                    if 'imageName' in question:
                        del question['imageName']

                    if 'imageUrl' in question:
                        del question['imageUrl']

                    if 'kind_name' in question:
                        del question['kind_name']

                    if not question.get('max_choice_count'):
                        question['max_choice_count'] = 0

                    if not question.get('rating_max_count'):
                        question['rating_max_count'] = 0
                    else:
                        question['rating_max_count'] = 5

                    question = null_to_none(question)

                    question_obj, created = ChallengeQuestions.objects.update_or_create(
                        id=pk,
                        defaults={
                            **question
                        }
                    )

                    # Асуултанд зураг байвал хадгалах хэсэг
                    if question_img:
                        question_img_path = get_image_path(question_obj)

                        file_path = save_file(question_img, question_img_path)[0]

                        question_obj.image = file_path
                        question_obj.save()
                    else:
                        old_image = question_obj.image

                        # Хуучин зураг засах үедээ устгасан бол файл устгана.
                        if old_image and not image_name:
                            remove_folder(str(old_image))

                            question_obj.image = None
                            question_obj.save()

                    choice_ids = list()

                    # Асуултын сонголтуудыг үүсгэх нь
                    if int(qkind) in [ChallengeQuestions.KIND_MULTI_CHOICE, ChallengeQuestions.KIND_ONE_CHOICE]:

                        # Олон сонголттой үед асуултын оноог хувааж тавина
                        if int(qkind) == ChallengeQuestions.KIND_MULTI_CHOICE:
                            max_choice_count = int(question.get('max_choice_count'))

                            score = float(score) / max_choice_count

                        for choice in choices:
                            choice['created_by'] = teacher
                            checked = choice.get('checked')

                            choice['score'] = score if checked else 0

                            img_name = choice.get('imageName')

                            choice_img = None

                            # Хариултын зураг хадгалах хэсэг
                            for cimg in choice_imgs:
                                if img_name == cimg.name:
                                    choice_img = cimg
                                    break

                            choice = remove_key_from_dict(choice, ['image', 'checked'])

                            if 'imageName' in choice:
                                del choice['imageName']

                            if 'imageUrl' in choice:
                                del choice['imageUrl']

                            choice_obj, created = QuestionChoices.objects.update_or_create(
                                id=choice.get('id'),
                                defaults={
                                    **choice
                                }
                            )

                            # Асуултанд зураг байвал хадгалах хэсэг
                            if choice_img:
                                choice_img_path = get_choice_image_path(choice_obj)

                                file_path = save_file(choice_img, choice_img_path)[0]

                                choice_obj.image = file_path
                                choice_obj.save()
                            else:
                                choice_old_image = choice_obj.image

                                # Хуучин зураг засах үедээ устгасан бол файл устгана.
                                if choice_old_image and not img_name:
                                    remove_folder(str(choice_old_image))

                                    choice_obj.image = None
                                    choice_obj.save()

                            choice_ids.append(choice_obj.id)

                    question_obj.choices.set(choice_ids)

            except Exception as e:
                print(e)
                transaction.savepoint_rollback(sid)

                return request.send_error('ERR_002')

            return request.send_info('INF_002')


    @has_permission(must_permissions=['lms-exam-question-create'])
    def post(self, request):

        datas = request.data.dict()
        subject_id = datas.get('subject')

        subject = Lesson_title_plan.objects.filter(id=subject_id).first()

        quesion_imgs = request.FILES.getlist('questionImg')
        choice_imgs = request.FILES.getlist('choiceImg')

        questions = request.POST.getlist('question')

        user = request.user
        teacher = Teachers.objects.filter(user_id=user).first()

        with transaction.atomic():
            sid = transaction.savepoint()
            try:
                # Асуултыг хадгалах хэсэг
                for question in questions:
                    question = json_load(question)

                    qkind = question.get("kind")
                    image_name = question.get('imageName')
                    yes_or_no = question.get('yes_or_no')

                    score = question.get('score') # Асуултын оноо

                    question['created_by'] = teacher
                    question['subject'] = subject

                    if not yes_or_no:
                        question['yes_or_no'] = None

                    question_img = None

                    # Асуултын сонголтууд
                    choices = question.get('choices')

                    # Асуултын зураг хадгалах хэсэг
                    for img in quesion_imgs:
                        if image_name == img.name:
                            question_img = img
                            break

                    question = remove_key_from_dict(question, [ 'image', 'choices'])

                    if 'imageName' in question:
                        del question['imageName']

                    if 'imageUrl' in question:
                        del question['imageUrl']


                    if not question.get('max_choice_count'):
                        question['max_choice_count'] = 0

                    if not question.get('rating_max_count'):
                        question['rating_max_count'] = 0
                    else:
                        question['rating_max_count'] = 5

                    question = null_to_none(question)

                    question_obj = ChallengeQuestions.objects.create(
                        **question
                    )

                    # Асуултанд зураг байвал хадгалах хэсэг
                    if question_img:
                        question_img_path = get_image_path(question_obj)

                        file_path = save_file(question_img, question_img_path)[0]

                        question_obj.image = file_path
                        question_obj.save()

                    choice_ids = list()

                    # Асуултын сонголтуудыг үүсгэх нь
                    if int(qkind) in [ChallengeQuestions.KIND_MULTI_CHOICE, ChallengeQuestions.KIND_ONE_CHOICE]:

                        # Олон сонголттой үед асуултын оноог хувааж тавина
                        if int(qkind) == ChallengeQuestions.KIND_MULTI_CHOICE:
                            max_choice_count = int(question.get('max_choice_count'))

                            score = float(score) / max_choice_count

                        for choice in choices:

                            choice['created_by'] = teacher

                            checked = choice.get('checked')

                            choice['score'] = score if checked else 0

                            img_name = choice.get('imageName')

                            choice_img = None

                            # Хариултын зураг хадгалах хэсэг
                            for cimg in choice_imgs:
                                if img_name == cimg.name:
                                    choice_img = cimg
                                    break

                            choice = remove_key_from_dict(choice, ['image', 'checked'])

                            if 'imageName' in choice:
                                del choice['imageName']

                            if 'imageUrl' in choice:
                                del choice['imageUrl']

                            choice_obj = QuestionChoices.objects.create(
                                **choice
                            )

                            # Асуултанд зураг байвал хадгалах хэсэг
                            if choice_img:
                                choice_img_path = get_choice_image_path(choice_obj)

                                file_path = save_file(choice_img, choice_img_path)[0]

                                choice_obj.image = file_path
                                choice_obj.save()

                            choice_ids.append(choice_obj.id)

                    question_obj.choices.set(choice_ids)

            except Exception as e:
                print(e)
                transaction.savepoint_rollback(sid)

                return request.send_error('ERR_002')

            return request.send_info('INF_001')

    @has_permission(must_permissions=['lms-exam-question-delete'])
    def delete(self, request):

        delete_ids = request.query_params.getlist('delete')

        questions = self.queryset.filter(id__in=delete_ids)

        with transaction.atomic():
            try:
                for question in questions:

                    # Хэрвээ асуултанд зураг байвал устгана
                    question_img = question.image

                    if question_img:
                        remove_folder(str(question_img))

                        if question:
                            choices = question.choices.all()

                            for choice in choices:
                                img = choice.image

                                # Хэрвээ хариултын хэсэгт зураг байвал устгана
                                if img:
                                    remove_folder(str(img))

                                choice.delete()

                            # Хариултын хэсгийг устгах хэсэг
                            question.choices.clear()

                    question.delete()

            except Exception as e:
                print(e)
                return request.send_error("ERR_002")

        return request.send_info("INF_003")


class PsychologicalTestQuestionsAPIView(
    generics.GenericAPIView,
    APIView,
    mixins.ListModelMixin,
    mixins.DestroyModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin
):
    queryset = PsychologicalTestQuestions.objects.all().order_by('created_at')
    serializer_class = dynamic_serializer(PsychologicalTestQuestions, "__all__")

    @login_required()
    def get(self, request):
        datas = self.list(request).data
        return request.send_data(datas)

    def post(self, request):
        quesion_imgs = request.FILES.getlist('questionImg')
        choice_imgs = request.FILES.getlist('choiceImg')
        questions = request.POST.getlist('questions')

        user_id = request.user.id
        user = User.objects.get(id=user_id)

        with transaction.atomic():
            try:
                # Асуултыг хадгалах хэсэг
                for question in questions:
                    question = json_load(question)

                    qkind = question.get("kind")
                    image_name = question.get('imageName')
                    yes_or_no = question.get('yes_or_no')

                    question['created_by'] = user

                    if not yes_or_no:
                        question['yes_or_no'] = None

                    question_img = None

                    # Асуултын сонголтууд
                    choices = question.get('answers')

                    # Асуултын зураг хадгалах хэсэг
                    for img in quesion_imgs:
                        if image_name == img.name:
                            question_img = img
                            break

                    if question['level'] != 0:
                        question['has_score'] = True

                    question = remove_key_from_dict(question, ['image', 'answers', 'level'])

                    if 'imageName' in question:
                        del question['imageName']

                    if 'imageUrl' in question:
                        del question['imageUrl']

                    if not question.get('max_choice_count'):
                        question['max_choice_count'] = 0

                    if not question.get('rating_max_count'):
                        question['rating_max_count'] = 0
                    else:
                        question['rating_max_count'] = 5

                    question = null_to_none(question)

                    question_obj = PsychologicalTestQuestions.objects.create(
                        **question
                    )

                    # Асуултанд зураг байвал хадгалах хэсэг
                    if question_img:
                        question_img_path = get_image_path(question_obj)
                        file_path = save_file(question_img, question_img_path)[0]
                        question_obj.image = file_path
                        question_obj.save()

                    choice_ids = list()

                    # Асуултын сонголтуудыг үүсгэх нь
                    if int(qkind) in [PsychologicalTestQuestions.KIND_MULTI_CHOICE, PsychologicalTestQuestions.KIND_ONE_CHOICE]:

                        # Олон сонголттой үед асуултын оноог хувааж тавина
                        if int(qkind) == PsychologicalTestQuestions.KIND_MULTI_CHOICE:
                            max_choice_count = int(question.get('max_choice_count'))
                            if max_choice_count:
                                score = float(question.get('score', 0)) / max_choice_count
                            else:
                                score = 0

                        for choice in choices:
                            choice['created_by'] = user

                            img_name = choice.get('imageName')
                            choice_img = None

                            # Хариултын зураг хадгалах хэсэг
                            for cimg in choice_imgs:
                                if img_name == cimg.name:
                                    choice_img = cimg
                                    break

                            choice = remove_key_from_dict(choice, ['image'])

                            if 'imageName' in choice:
                                del choice['imageName']

                            if 'imageUrl' in choice:
                                del choice['imageUrl']

                            choice_obj = PsychologicalQuestionChoices.objects.create(
                                **choice
                            )

                            # Асуултанд зураг байвал хадгалах хэсэг
                            if choice_img:
                                choice_img_path = get_choice_image_path(choice_obj)
                                file_path = save_file(choice_img, choice_img_path)[0]
                                choice_obj.image = file_path
                                choice_obj.save()

                            choice_ids.append(choice_obj.id)

                    question_obj.choices.set(choice_ids)
                return request.send_info('INF_001')
            except Exception as e:
                print(e)
                return request.send_error('ERR_002')

    def delete(self, request):

        delete_ids = request.query_params.getlist('delete')
        questions = self.queryset.filter(id__in=delete_ids)

        with transaction.atomic():
            try:
                for question in questions:

                    # Хэрвээ асуултанд зураг байвал устгана
                    question_img = question.image

                    if question_img:
                        remove_folder(str(question_img))

                        if question:
                            choices = question.choices.all()

                            for choice in choices:
                                img = choice.image

                                # Хэрвээ хариултын хэсэгт зураг байвал устгана
                                if img:
                                    remove_folder(str(img))

                                choice.delete()

                            # Хариултын хэсгийг устгах хэсэг
                            question.choices.clear()

                    question.delete()

            except Exception as e:
                print(e)
                return request.send_error("ERR_002")

        return request.send_info("INF_003")


class PsychologicalQuestionTitleListAPIView(
    generics.GenericAPIView,
    mixins.ListModelMixin,
):
    """ Шалгалтын Гарчиг
    """
    queryset = PsychologicalQuestionTitle.objects.all()

    @login_required()
    def get(self, request):
        user = request.user.id
        question_titles = PsychologicalTestQuestions.objects.filter(created_by=user).values_list("id", flat=True)
        data = self.queryset.filter(id__in=question_titles).values("id", "name")
        return request.send_data(list(data))


class PsychologicalQuestionTitleAPIView(
    generics.GenericAPIView,
    APIView,
    mixins.ListModelMixin,
    mixins.DestroyModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin

):
    """ Шалгалтын асуултууд Гарчигаар
    """
    queryset = PsychologicalQuestionTitle.objects.all()
    serializer_class = dynamic_serializer(PsychologicalQuestionTitle, "__all__")

    @login_required()
    def get(self, request, pk=None):

        user = request.user.id

        if pk:
            data = self.retrieve(request, pk).data
            questions = PsychologicalTestQuestions.objects.filter(title=pk, created_by=user)
            other_questions = PsychologicalTestQuestions.objects.filter(created_by=user).exclude(id__in=questions.values_list('id', flat=True)).values("id", "question", "title__name")

            questions = questions.values("id", "question", "title__name")
            return request.send_data({"title": data, "questions": list(questions), "other_questions": list(other_questions)})

        title_id = request.query_params.get('titleId')
        title_id = int(title_id)

        # 0  Бүх асуулт
        if title_id == 0:
            challenge_qs = PsychologicalTestQuestions.objects.filter(created_by=user)
        # -1  Сэдэвгүй асуултууд
        elif title_id == -1:
            challenge_qs = PsychologicalTestQuestions.objects.filter(Q(created_by=user) & Q(title__isnull=True))
        else:
            challenge_qs = PsychologicalTestQuestions.objects.filter(created_by=user, title=title_id)

        ser = dynamic_serializer(PsychologicalTestQuestions, "__all__", 1)
        data = ser(challenge_qs, many=True)
        count = challenge_qs.count()

        result = {
            "count": count,
            "results": data.data
        }
        return request.send_data(result)


    @login_required()
    def post(self, request):
        request_data = request.data

        question_ids = request.data.pop("questions")
        serializer = self.get_serializer(data=request_data)
        if serializer.is_valid(raise_exception=False):
            saved_obj =  serializer.save()
            questions_to_update = PsychologicalTestQuestions.objects.filter(id__in=question_ids)
            for question in questions_to_update:
                question.title.add(saved_obj)
            data = self.serializer_class(saved_obj).data
            return request.send_info("INF_001", data)

        return request.send_info("ERR_001")


    @login_required()
    def put(self, request, pk=None):
        request_data = request.data
        question_ids = request.data.pop("questions")
        other_question_ids = request.data.pop("other_questions")
        qs = self.queryset.filter(id=pk).get()
        serializer = self.get_serializer(qs, data=request_data, partial=True)
        if serializer.is_valid(raise_exception=False):
            self.perform_update(serializer)
            questions_to_update = PsychologicalTestQuestions.objects.filter(id__in=question_ids)
            other_questions = PsychologicalTestQuestions.objects.filter(id__in=other_question_ids)
            for question in questions_to_update:
                question.title.add(qs)
            for question in other_questions:
                question.title.remove(qs)
            return request.send_info("INF_002")

        return request.send_info("ERR_001")


    @login_required()
    def delete(self, request, pk=None):
        self.destroy(request, pk)
        return request.send_info("INF_003")


class PsychologicalTestOptionsAPIView(
    mixins.ListModelMixin,
    generics.GenericAPIView
):
    def get(self, request):

        # PsychologicalTest model-ийн scope_kind-ийн val-ийг авна
        set_of_scope = PsychologicalTest.SCOPE_CHOICES
        # Ирсэн set data-г [{}] болгон хөрвүүлнэ
        scope_options = [{'id':id, 'name':name} for id, name in set_of_scope]

        # type_option-ийг гараараа бичээд явуулчихлаа
        type_options = [{'id':1, 'name':'Оноогүй'},{'id':2, 'name':'Асуултаас шалтгаалах'}]

        return_datas ={
            'scope_options':scope_options,
            'type_options':type_options
        }
        return request.send_data(return_datas)


@permission_classes([IsAuthenticated])
class PsychologicalTestAPIView(
    mixins.CreateModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    mixins.RetrieveModelMixin,
    mixins.ListModelMixin,
    generics.GenericAPIView
):

    """ Сэтгэл зүйн шалгалт сорил """

    queryset = PsychologicalTest.objects.all().order_by('id')
    serializer_class = PsychologicalTestSerializer

    pagination_class = CustomPagination

    filter_backends = [SearchFilter]
    search_fields = ['title', 'description']

    @has_permission(must_permissions=['lms-psychologicaltesting-exam-read'])
    def get(self, request, pk=None):

        if pk:
            data = self.retrieve(request, pk).data
            return request.send_data(data)

        datas = self.list(request).data
        return request.send_data(datas)

    def post(self, request):
        with transaction.atomic():
            sid = transaction.savepoint()
            try:
                # Бүх датагаа serializer-даад хадгална
                serializer = self.get_serializer(data=request.data)
                if serializer.is_valid(raise_exception=True):
                    serializer.save()
                transaction.savepoint_commit(sid)
                return request.send_info("INF_001")
            except Exception as e:
                transaction.savepoint_rollback(sid)
                print(e)
                return request.send_error('ERR_002')

    def put(self, request, pk=None):
        # Өөрчлөлт хийх сорилын instance
        instance = self.queryset.filter(id=pk).first()

        with transaction.atomic():
            sid = transaction.savepoint()
            try:
                data = request.data.copy()
                # description болон duration 2 null ирж болно
                data = {key: (None if value == 'null' else value) for key, value in data.items() if key in ['duration', 'description']}

                serializer = self.get_serializer(instance, data=data)
                # Тэгээд шууд serializer ашигланаа
                if serializer.is_valid(raise_exception=True):
                    serializer.save()
                transaction.savepoint_commit(sid)
                return request.send_info("INF_002")
            except Exception as e:
                transaction.savepoint_rollback(sid)
                print(e)
                return request.send_error('ERR_002')

    def delete(self, request, pk):
        self.destroy(request, pk)
        return request.send_info("INF_003")


class PsychologicalTestOneAPIView(
    mixins.CreateModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    mixins.RetrieveModelMixin,
    mixins.ListModelMixin,
    generics.GenericAPIView
):
    """ Сэтгэл зүйн сорилд хамаарагдах багц асуултууд """

    queryset = PsychologicalTestQuestions.objects.all().order_by('id')
    serializer_class = PsychologicalTestQuestionsSerializer

    pagination_class = CustomPagination

    def get(self, request):
        # Асуулт нь ямар сорилд хамааралтайг мэдэхийн тулд сорилын id-г авна
        test_id = self.request.query_params.get('test_id')

        # Тухайн сорилын асуултуудын id
        question_ids = PsychologicalTest.objects.filter(id=test_id).values_list('questions', flat=True)

        # Асуултуудынхаа id-г ашиглан асуултуудаа аваад дараа нь serializer ашиглан буцаана
        if question_ids:
            self.queryset = self.queryset.filter(id__in=question_ids)

        datas = self.list(request).data
        return request.send_data(datas)

    def post(self, request, pk):
        data = request.data

        # Тухайн сорилд нэмэх асуултын багцуудын  id-г хадгална
        question_title_ids = list()
        queryset = PsychologicalTest.objects.filter(id=pk).first()

        # Хэрэглэгчийн сонгосон асуултын багцуудын id-г авна
        for value in data:
            question_title_ids.append(value['id'])

        # Тус багцад хамаарах асуултуудыг, багцын id-г ашиглан хадгална
        question_ids = self.queryser.filter(title__in=question_title_ids).values_list('id', flat=True)

        with transaction.atomic():
            try:
                if queryset:
                    # Тухайн сорилдоо асуултуудаа нэмээд хадгална
                    queryset.questions.add(*question_ids)
                    queryset.save()
                    return request.send_info("INF_001")
                else:
                    return request.send_error('ERR_002', "Тухайн багцад хамаарах асуултууд олдсонгүй")
            except Exception as e:
                print(e)
                return request.send_error('ERR_002')

    def delete(self, request, pk):
        # Сорилын id
        test_id = self.request.query_params.get('test_id')
        try:
            # Сорилын id-гаар сорилын qs-ийг аваад
            test = PsychologicalTest.objects.filter(id=test_id).first()
            if test:
                # Тухайн сорилын pk-р илэрхийлэгдэх асуултыг хасаад хадгална
                test.questions.remove(pk)
                test.save()
            else:
                return request.send_error('ERR_002', "Сорил олдсонгүй")
        except Exception as e:
            print(e)
            return request.send_error('ERR_002')
        return request.send_info("INF_003")


class PsychologicalTestScopesAPIView(
    generics.GenericAPIView,
    mixins.ListModelMixin,
):
    queryset = PsychologicalTest.objects.all()

    def get(self, request):
        datas = []

        # Parametr-үүд
        test_id = request.query_params.get('test_id')
        search_value = request.query_params.get('search')

        # Тухайн ёорилоо авна
        test_instance = self.queryset.get(id=test_id)

        # Cорилын хамрах хүрээний төрлөөс шалтгаалан хамрах хүрээг хаанаас авхаа тодорхойлно
        scope = test_instance.scope_kind
        participants = test_instance.participants

        # Хуудаслалт
        self.pagination_class = CustomPagination

        # Хамрах хүрээний боломжит утгууд
        scope_to_model_serializer = {
            1: (Teachers, TeachersSerializer, ['first_name', 'last_name', 'register']),
            2: (ElseltUser, ElsegchSerializer, ['first_name', 'last_name', 'code']),
            3: (Student, StudentSerializer, ['first_name', 'last_name', 'code'])
        }

        # scope-өөс шалтгаалан ашиглах model, serializer өөр, өөр байна
        # None, none гэсэн нь шууд байгаа утгыг нь авна
        model_class, serializer_class, search_fields = scope_to_model_serializer.get(scope, (None, None, None))

        # scope-д тохирсон model байвал
        if model_class is not None:
            # Оролцогчдоороо filter-ээд
            self.queryset = model_class.objects.filter(id__in=participants)
            # Serializer-г нь заагаад
            self.serializer_class = serializer_class
            # Хайх утгуудын өгнө
            if search_value:
                self.queryset = _filter_queries(self.queryset, search_value, search_fields)

            datas = self.list(request).data
        return request.send_data(datas)


class PsychologicalTestScopeOptionsAPIView(
    generics.GenericAPIView,
    mixins.ListModelMixin,
):
    """ Сэтгэл зүйн сорилын хамрах хүрээг сонгох """

    def get(self, request):
        scope = self.request.query_params.get('scope')

        # Хамрах хүрээг оюутан гэж сонговол
        group_options = list()
        if scope == '3':
            # Бүх ангиудийг id, name-ээр авчирна
            group_options = list(Group.objects.values('id', 'name'))

        # Тэгээд  select-д харуулхын тулд буцаана
        return_data = {
            'scope_kind': scope,
            'select_student_data': group_options,
        }
        return request.send_data(return_data)

    def put(self, request, pk):
        # Data болон scope, оролцогчдоо авна
        datas = request.data
        scope = datas.get('scope')
        participants = datas.get('participants', [])

        # pk болон scope 2-ийн утга 2-уулаа байх үед
        if pk and scope is not None:
            # Оролцогчдын төрлөө өөрчлөөд
            PsychologicalTest.objects.filter(id=pk).update(scope_kind=scope)
            participant_ids = []
            # Хэрвээ оюутанаас сорил авах бол
            if scope == 3 and participants:
                # Ангийн id-уудаа ирсэн датан дотроосоо аваад
                group_ids = [participant['id'] for participant in participants]
                # Тус ангид харьялагдах бүх оюутнуудын id-г хадгална
                participant_ids = Student.objects.filter(group__in=group_ids).values_list('id', flat=True)

            # Бусад үед бүх элсэгч болон багшаа авна
            elif scope == 1:
                participant_ids = Teachers.objects.values_list('id', flat=True)
            elif scope == 2:
                participant_ids = ElseltUser.objects.values_list('id', flat=True)

            # Тэгээд эцэст нь бааздаа хадгална
            PsychologicalTest.objects.filter(id=pk).update(participants=list(participant_ids))

        return request.send_info("INF_002")

    def delete(self, request, pk):
        # Сорилын id
        test_id = self.request.query_params.get('test_id')
        try:
            # Сорилын id-гаар сорилын qs-ийг аваад
            test = PsychologicalTest.objects.filter(id=test_id).first()
            if test:
                # Тухайн сорилын pk-р илэрхийлэгдэх залууг хасаад хадгална
                test.participants.remove(pk)
                test.save()
            else:
                return request.send_error('ERR_002', "Хэрэглэгч олдсонгүй")
        except Exception as e:
            print(e)
            return request.send_error('ERR_002')
        return request.send_info("INF_003")


@permission_classes([IsAuthenticated])
class QuestionsListAPIView(
    generics.GenericAPIView,
    mixins.ListModelMixin
):
    """ Шалгалт үүсгэхдээ асуулт сонгох хэсэг """

    queryset = ChallengeQuestions.objects.all()
    serializer_class = ChallengeQuestionListSerializer

    def get(self, request):

        datas = []

        queryset = self.queryset

        checked_ids = self.request.query_params.getlist('checked')
        count = self.request.query_params.get('count')
        qtype = self.request.query_params.get('type')

        for check_id in checked_ids:
            obj = {}
            subject = Lesson_title_plan.objects.get(id=check_id)

            obj['id'] = int(check_id)
            obj['name'] = subject.title

            querysets = queryset.filter(subject_id=check_id)

            if count and qtype:
                scount = int(count)

                if qtype == 'Эхний':
                    querysets = querysets.order_by('created_at')
                else:
                    querysets = querysets.order_by('-created_at')

                querysets = querysets[0:scount]

            serializer = self.get_serializer(querysets, many=True).data

            obj['data'] = list(serializer)

            datas.append(obj)

        return request.send_data(datas)


@permission_classes([IsAuthenticated])
class ChallengeSendAPIView(
    generics.GenericAPIView
):
    """ Шалгалтын материал батлуулах хүсэлт илгээх """

    def get(self, request, pk=None):

        challlenge = Challenge.objects.get(id=pk)

        with transaction.atomic():
            challlenge.send_type = Challenge.SEND
            challlenge.save()

        return request.send_info('INF_019')



@permission_classes([IsAuthenticated])
class ChallengeApprovePIView(
    generics.GenericAPIView,
    mixins.ListModelMixin
):
    """ ХБА батлах шалгалтын хүсэлтүүд """

    queryset = Challenge.objects.all()
    serializer_class = ChallengeListSerializer

    pagination_class = CustomPagination

    filter_backends = [SearchFilter]
    search_fields = ['title', 'start_date', 'end_date', 'lesson__name', 'lesson__code']

    @login_required()
    def get(self, request):

        user_id = request.user

        ctype = request.query_params.get('type')
        search_teacher = request.query_params.get('teacher')
        lesson = request.query_params.get('lesson')

        # Шалгалтын төрлөөр хайх
        if ctype:
            self.queryset = self.queryset.filter(send_type=int(ctype))

        teacher = Teachers.objects.get(user=user_id)

        department_id = teacher.salbar.id

        self.queryset = self.queryset.exclude(challenge_type=Challenge.SELF_TEST)

        self.queryset = self.queryset.filter(created_by__salbar__id=department_id)

        teacher_ids = self.queryset.values_list('created_by', flat=True)

        self.queryset = self.queryset.filter(created_by__in=teacher_ids)

        if search_teacher:
            self.queryset = self.queryset.filter(created_by=search_teacher)

        if lesson:
            self.queryset = self.queryset.filter(lesson=lesson)

        all_list = self.list(request).data

        return request.send_data(all_list)

    def post(self, request):
        data = request.data

        challenge_id = data.get('id')
        is_confirm = data.get('is_confirm')
        comment = data.get('comment')

        send_type = Challenge.APPROVE

        if not is_confirm:
            send_type = Challenge.REJECT

        qs = self.queryset.filter(id=challenge_id)

        with transaction.atomic():

            qs.update(
                send_type=send_type,
                comment=comment
            )

        return request.send_info('INF_018')


@permission_classes([IsAuthenticated])
class StudentHomeworkListAPIView(
    mixins.ListModelMixin,
    mixins.DestroyModelMixin,
    mixins.UpdateModelMixin,
    generics.GenericAPIView,
    mixins.RetrieveModelMixin
):

    queryset = Lesson_assignment_student.objects.all().order_by('created_at')
    serializer_class = LessonAssignmentAssigmentListSerializer

    @login_required()
    def get(self, request):
        student = request.query_params.get('student')
        assignment = request.query_params.get('assignment')

        user = request.user
        teacher = Teachers.objects.get(user=user)

        lesson_year, lesson_season = get_active_year_season()

        self.queryset = self.queryset.filter(assignment=assignment)

        if student:
            self.queryset = self.queryset.filter(student=student)

        assignment_list = self.list(request).data

        return request.send_data(assignment_list)

    @login_required()
    def put(self, request, pk=None):
        data = request.data
        instance = self.queryset.filter(id=pk).first()

        self.serializer_class = LessonAssignmentAssigmentSerializer

        if 'score' in data:
            data['score'] = float(data['score'])

        data['status'] = Lesson_assignment_student.CHECKED

        try:
            """ Нэгээр дүгнэхэд """
            serializer = self.get_serializer(instance, data=data)

            if serializer.is_valid(raise_exception=False):
                self.perform_update(serializer)
            else:
                print(serializer.errors)

                return request.send_error("ERR_003", 'Дүн оруулахад алдаа гарлаа')
        except Exception as e:
            print(e)
            return request.send_error("ERR_003", 'Дүн оруулахад алдаа гарлаа')

        return request.send_info("INF_002")



@permission_classes([IsAuthenticated])
class StudentHomeworkMultiEditAPIView(
    mixins.UpdateModelMixin,
    generics.GenericAPIView,
):

    queryset = Lesson_assignment_student.objects.all()
    serializer_class = LessonAssignmentAssigmentSerializer

    @login_required()
    def put(self, request):
        """ Даалгаварт олноор үнэлгээ өгөхөд """

        data = request.data

        score = float(data['score'])
        students = data.get('students')
        assignment = data.get('assignment')

        all_update_datas = list()

        try:
            if students and len(students) > 0:
                """ Олноор дүгнэхэд """
                student_assignment_qs = Lesson_assignment_student.objects.filter(student__in=students, assignment=assignment)

                if student_assignment_qs:
                    for student_assignment in student_assignment_qs:
                        student_assignment.score = score
                        student_assignment.status = Lesson_assignment_student.CHECKED
                        all_update_datas.append(student_assignment)

                if len(all_update_datas) > 0:
                    Lesson_assignment_student.objects.bulk_update(all_update_datas, ['score', 'status'])

        except Exception as e:
            print(e)
            return request.send_error("ERR_003", 'Дүн оруулахад алдаа гарлаа')

        return request.send_info("INF_002")


@permission_classes([IsAuthenticated])
class HomeworkStudentsListAPIView(
    generics.GenericAPIView,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
):

    queryset = Lesson_assignment_student.objects.all().order_by('created_at')
    serializer_class = LessonAssignmentAssigmentListSerializer

    @login_required()
    def get(self, request):
        lesson = request.query_params.get('lesson')
        assignment = request.query_params.get('assignment')

        user = request.user
        teacher = Teachers.objects.get(user=user, action_status=Teachers.APPROVED)
        filters = dict()

        lesson_year, lesson_season = get_active_year_season()

        self.queryset = self.queryset.filter(
            assignment__lesson_material__lesson=lesson,
            assignment__lesson_material__teacher=teacher.id
        )

        lesson_data = get_lesson_choice_student(lesson, teacher.id, '', lesson_year, lesson_season)

        if assignment:
            filters['assignment'] = assignment

        students = (
            Student
            .objects
            .filter(
                id__in=lesson_data
            )
            .annotate(
                unelgee=Subquery(
                    Lesson_assignment_student.objects.filter(student=OuterRef('id'), assignment__lesson_material__lesson=lesson, **filters).values('score')[:1]
                ),
                homework_status=Subquery(
                    Lesson_assignment_student.objects.filter(student=OuterRef('id'), assignment__lesson_material__lesson=lesson, **filters).values('status')[:1]
                ),
            )
            .values()
        )

        assignment_list = self.list(request).data

        return request.send_data({
            'students': list(students),
            'assignment': assignment_list
        })


@permission_classes([IsAuthenticated])
class LessonsTeacher(
    generics.GenericAPIView,
):
    ''' Тухайн багшийн зааж байгаа хичээл  '''

    @login_required()
    def get(self, request, pk=None):
        stype = request.query_params.get('stype')

        user = request.user

        teacher = get_object_or_404(Teachers, user_id=user, action_status=Teachers.APPROVED)

        year, season = get_active_year_season()

        lesson_ids = TimeTable.objects.filter(lesson_year=year, lesson_season=season, teacher=teacher).values_list('lesson', flat=True).distinct('lesson')

        if stype == 'one':
            sort_list = LessonStandart.objects.filter(id__in=lesson_ids).values('id', 'name').order_by('name')
        else:
            all_list = LessonStandart.objects.filter(id__in=lesson_ids).values('id', 'name', 'code', 'category__category_name', 'definition', 'updated_at', 'kredit')

            for lesson in all_list:
                is_active = False
                is_active_num = 0
                file = None

                lesson_id = lesson.get('id')
                updated = lesson.get('updated_at')

                lesson_teacher = Lesson_to_teacher.objects.filter(lesson=lesson_id, teacher=teacher).first()

                if lesson_teacher:
                    file = lesson_teacher.file

                    media_path = settings.MEDIA_URL + str(file)
                    domain = get_domain_url()

                    file_path = domain + media_path

                fixed_date = fix_format_date(updated)

                timetable_qs_count = TimeTable.objects.filter(lesson_year=year, lesson_season=season, lesson=lesson_id).count()

                if timetable_qs_count >= 1:
                    is_active = True
                    is_active_num = 1

                lesson_materials_qs = Lesson_materials.objects.filter(lesson=lesson_id, teacher=teacher, material_type=Lesson_materials.PPTX)
                material_count = lesson_materials_qs.count()

                lesson_title_plan_qs = Lesson_title_plan.objects.filter(lesson=lesson_id, lesson_type=Lesson_title_plan.LECT)
                lesson_title_count = lesson_title_plan_qs.count()

                lesson['active'] = is_active
                lesson['is_active_num'] = is_active_num
                lesson['updated_at'] = fixed_date
                lesson['file'] = file_path if file else ''
                lesson['count'] = material_count + lesson_title_count

            sort_list = sorted(list(all_list), key=lambda item: (-item['is_active_num']) )

        return request.send_data(list(sort_list))


@permission_classes([IsAuthenticated])
class LessonOneApiView(
    generics.GenericAPIView,
    mixins.RetrieveModelMixin
):
    """ Хичээлийн стандарт мэдээлэл """

    queryset = LessonStandart.objects.all()
    serializer_class = LessonStandartSerializer

    @login_required()
    def get(self, request, pk=None):

        datas = self.retrieve(request, pk).data

        return request.send_data(datas)



@permission_classes([IsAuthenticated])
class LessonKreditApiView(
    generics.GenericAPIView
):

    def get(self, request, pk=None):
        """ Нэг хичээлийн багц цагийн мэдээлэл авах """

        return_values = []
        qs_title_plan = Lesson_title_plan.objects.all()
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
                    sedev_data = qs_title_plan.filter(lesson=pk, lesson_type=Lesson_title_plan.LECT).values()
                    obj['id'] = Lesson_title_plan.LECT
                    obj['name'] = 'Лекц'
                    obj['data'] = list(sedev_data)

                    return_values.append(obj)
                    obj = {}

                if sem:
                    sedev_data = qs_title_plan.filter(lesson=pk, lesson_type=Lesson_title_plan.SEM).values()
                    obj['id'] = Lesson_title_plan.SEM
                    obj['name'] = 'Семинар'
                    obj['data'] = list(sedev_data)

                    return_values.append(obj)
                    obj = {}

                if lab:
                    sedev_data = qs_title_plan.filter(lesson=pk, lesson_type=Lesson_title_plan.LAB).values()
                    obj['id'] = Lesson_title_plan.LAB
                    obj['name'] = 'Лаборатор'
                    obj['data'] = list(sedev_data)

                    return_values.append(obj)
                    obj = {}

                if pr:
                    sedev_data = qs_title_plan.filter(lesson=pk, lesson_type=Lesson_title_plan.PRACTIC).values()
                    obj['id'] = Lesson_title_plan.PRACTIC
                    obj['name'] = 'Практик'
                    obj['data'] = list(sedev_data)

                    return_values.append(obj)
                    obj = {}

                if bd:
                    sedev_data = qs_title_plan.filter(lesson=pk, lesson_type=Lesson_title_plan.BIY_DAALT).values()
                    obj['id'] = Lesson_title_plan.BIY_DAALT
                    obj['name'] = 'Бие даалт'
                    obj['data'] = list(sedev_data)

                    return_values.append(obj)
                    obj = {}

        return request.send_data(list(return_values))



@permission_classes([IsAuthenticated])
class LessonSedevApiView(
    generics.GenericAPIView,
    mixins.CreateModelMixin,
    mixins.UpdateModelMixin,
    mixins.ListModelMixin
):
    """ Хичээлийн сэдэвчилсэн төлөвлөгөө хадгалах """

    queryset = Lesson_title_plan.objects.all()
    serializer_class = LessonTitleSerializer

    def get(self, request, pk=None):

        if pk:
            self.queryset = self.queryset.filter(lesson=pk)

        all_list = self.list(request).data

        return request.send_data(all_list)

    def post(self, request, pk=None):

        errors = []
        datas = request.data
        lesson_type = request.query_params.get('type')

        is_created = False
        created_weeks = []
        for data in datas:
            lesson_type = data.get('lesson_type')
            data['lesson'] = pk

            week_obj = Lesson_title_plan.objects.filter(lesson=pk, week=data.get('week'), lesson_type=lesson_type).first()

            if week_obj:
                is_created = True

            if is_created:
                serializer = self.get_serializer(week_obj, data=data)
            else:
                serializer = self.get_serializer(data=data)

            if serializer.is_valid(raise_exception=False):

                with transaction.atomic():
                    try:
                       serializer.save()
                       created_weeks.append(data.get('week'))
                    except Exception as e:
                        print(e)

                        return request.send_error('ERR_002')
            else:
                for key in serializer.errors:

                    return_error = {
                        "field": key,
                        "msg": serializer.errors[key]
                    }

                    errors.append(return_error)

                return request.send_error("ERR_003", errors)

        # Хадгалсан датанаас устгах
        Lesson_title_plan.objects.filter(lesson=pk, lesson_type=int(lesson_type)).exclude(week__in=created_weeks).delete()
        return request.send_info('INF_013')


@permission_classes([IsAuthenticated])
class LessonAllApiView(
    generics.GenericAPIView,
    mixins.ListModelMixin
):
    """ Тухайн тэнхимийн хичээлийг авах """

    queryset = LessonStandart.objects.all().order_by('name')
    serializer_class = LessonStandartSerializer

    @login_required()
    def get(self, request):
        user_id = request.user
        teacher = Teachers.objects.get(user=user_id)

        department_id = teacher.salbar.id

        self.queryset = self.queryset.filter(department=department_id)

        search_teacher = request.query_params.get('teacher')

        if search_teacher:
            lesson_teacher_ids = Lesson_to_teacher.objects.filter(teacher=search_teacher).values_list('lesson', flat=True)
            self.queryset = self.queryset.filter(id__in=lesson_teacher_ids)

        all_list = self.list(request).data

        return request.send_data(all_list)


@permission_classes([IsAuthenticated])
class LessonMaterialApiView(
    generics.GenericAPIView,
    mixins.CreateModelMixin,
    mixins.UpdateModelMixin,
    mixins.ListModelMixin,
    mixins.DestroyModelMixin
):
    """ Хичээлийн материал хадгалах хэсэг """

    queryset = Lesson_materials.objects.all()
    serializer_class = LessonMaterialSerializer

    @login_required()
    def get(self, request, pk):

        self.serializer_class = LessonMaterialListSerializer
        lesson_type = request.query_params.get('lesson_type')
        week = request.query_params.get('week')

        user = request.user
        teacher = get_object_or_404(Teachers, user_id=user, action_status=Teachers.APPROVED)

        lesson = LessonStandart.objects.filter(id=pk).first()

        if pk:
            self.queryset = self.queryset.filter(lesson=pk, teacher=teacher)

        if lesson_type:
            self.queryset = self.queryset.filter(lesson_type=lesson_type)

        if week:
            self.queryset = self.queryset.filter(week=int(week))

        all_list = self.list(request).data

        datas = {
            'datas': all_list,
            'name': lesson.code_name if lesson else ''
        }

        return request.send_data(datas)

    @login_required()
    def post(self, request, pk=None):
        """ pk: Хичээлийн ID
            Файлтай хэсгүүдийг хадгалах хэсэг
        """

        datas = request.data.dict()

        files = request.FILES.getlist('files')

        user = request.user
        teacher = get_object_or_404(Teachers, user_id=user, action_status=Teachers.APPROVED)

        # Файл мэдээлэл устгах
        if datas.get('files'):
            datas = remove_key_from_dict(datas, 'files')

        material_type = datas.get('material_type')

        datas['teacher'] = teacher.id
        datas['material_type'] = int(material_type)

        datas = null_to_none(datas)

        with transaction.atomic():
            sid = transaction.savepoint()
            try:

                serializer =  self.get_serializer(data=datas)

                if serializer.is_valid(raise_exception=True):
                    serializer.save()

                    datas = serializer.data

                    # Материал ID
                    lesson_material_id = datas.get('id')

                    for file in files:
                        obj_datas = {}
                        obj_datas['material_id'] = lesson_material_id
                        obj_datas['file'] = file

                        # Оруулсан файл бүрийг хадгалах
                        Lesson_material_file.objects.create(**obj_datas)

            except Exception as e:

                transaction.savepoint_rollback(sid)
                print(e)
                return request.send_error('ERR_002')

        return request.send_info('INF_001')


    @login_required()
    def put(self, request, pk=None):
        # Энд засах үйлдэл хийгдэнэ ирж байгааг датаг харж байгаад хийе
        return request.send_info('INF_002')

    @login_required()
    def delete(self, request, pk=None):
        """ Хичээлийн материал устгах """

        with transaction.atomic():
            try:
                files = Lesson_material_file.objects.filter(material=pk).values_list('file', flat=True)

                # Файлуудыг устгах
                for file in files:

                    full_path = os.path.join(settings.MEDIA_ROOT, str(file))

                    if os.path.exists(full_path):
                        os.remove(full_path)

                # Хичээлийн материал устгах
                Lesson_material_file.objects.filter(material=pk).delete()

                # Даалгаврыг устгах
                lesson_assignment = Lesson_assignment.objects.filter(lesson_material=pk).values_list('id', flat=True)

                # Тухайн хичээл дээр холбоотой бүх даалгаврын хариуг устгана
                lesson_assignmend_students = Lesson_assignment_student.objects.filter(assignment__in=lesson_assignment).values_list('id', flat=True)

                # Тухайн хичээл дээр багш руу илгээсэн файлууд
                student_files = Lesson_assignment_student_file.objects.filter(student_assignment__in=lesson_assignmend_students).values_list('file', flat=True)
                for file in student_files:

                    full_path = os.path.join(settings.MEDIA_ROOT, str(file))

                    if os.path.exists(full_path):
                        os.remove(full_path)

                # Хичээлийн материал устгах
                Lesson_assignment_student.objects.filter(id__in=lesson_assignmend_students).delete()

                self.destroy(request, pk)

            except Exception as e:
                print(e)
                return request.send_error('ERR_002')

            return request.send_info('INF_003')


@permission_classes([IsAuthenticated])
class LessonMaterialGeneralApiView(
    generics.GenericAPIView,
    mixins.CreateModelMixin
):
    """ Хичээлийн ерөнхий мэдээлэл """

    queryset = Lesson_materials.objects.all()
    serializer_class = LessonMaterialSerializer

    @login_required()
    def post(self, request, pk=None):

        data = request.data.dict()

        user = request.user
        teacher = get_object_or_404(Teachers, user_id=user, action_status=Teachers.APPROVED)

        data['teacher'] = teacher.id

        data = null_to_none(data)

        serializer = self.get_serializer(data=data)

        if serializer.is_valid(raise_exception=True):
            with transaction.atomic():
                self.perform_create(serializer)
        else:
            errors = []
            for key in serializer.errors:

                return_error = {
                    "field": key,
                    "msg": serializer.errors[key]
                }

                errors.append(return_error)

            if len(errors) > 0:
                return request.send_error("ERR_003", errors)

        return request.send_info("INF_001")



@permission_classes([IsAuthenticated])
class LessonEditorImage(
    generics.GenericAPIView
):
    """ Editor зураг хадгалах """

    def post(self, request, pk):

        data = request.data
        file = data.get('file')

        path = save_file(file, 'news_images', pk)[0]

        domain = get_domain_url()

        file_path = os.path.join(settings.MEDIA_URL, path)

        return_url = '{domain}{path}'.format(domain=domain, path=file_path)

        return request.send_data(return_url)



@permission_classes([IsAuthenticated])
class LessonMaterialAssignmentApiView(
    generics.GenericAPIView
):
    """ Даалгавар үүсгэх хэсэг"""

    queryset = Lesson_materials.objects.all()
    serializer_class = LessonMaterialSerializer

    @login_required()
    def post(self, request, pk):
        """
            pk: Хичээлийн ID
        """

        datas = request.data.dict()

        # Assignment datas
        score = datas.get('score')
        start_date = datas.get('start_date')
        finish_date = datas.get('finish_date')

        files = request.FILES.getlist('files')

        user = request.user
        teacher = get_object_or_404(Teachers, user_id=user, action_status=Teachers.APPROVED)

        # Файл мэдээлэл устгах
        if len(files) > 0:
            datas = remove_key_from_dict(datas, 'files')

        material_type = datas.get('material_type')

        datas['teacher'] = teacher.id
        datas['material_type'] = int(material_type)

        datas = null_to_none(datas)

        with transaction.atomic():
            sid = transaction.savepoint()
            try:

                serializer =  self.get_serializer(data=datas)

                if serializer.is_valid(raise_exception=True):
                    serializer.save()

                    datas = serializer.data

                    # Материал ID
                    lesson_material_id = datas.get('id')

                    for file in files:
                        obj_datas = {}
                        obj_datas['material_id'] = lesson_material_id
                        obj_datas['file'] = file

                        # Оруулсан файл бүрийг хадгалах
                        Lesson_material_file.objects.create(**obj_datas)

                    # Хичээлийн даалгавар үүсгэх хэсэг
                    Lesson_assignment.objects.create(
                        lesson_material_id =  lesson_material_id,
                        score =  int(score),
                        start_date = start_date,
                        finish_date = finish_date
                    )

            except Exception as e:

                transaction.savepoint_rollback(sid)

                print(e)
                return request.send_error('ERR_002')

        return request.send_info('INF_001')

@permission_classes([IsAuthenticated])
class LessonImage(
    generics.GenericAPIView
):
    """ Тухайн багш хичээлдээ зураг оруулах """

    queryset = Lesson_to_teacher.objects.all()
    serializer_class = LessonTeacherSerializer

    @login_required()
    def post(self, request, pk=None):

        data = request.data.dict()

        user = request.user
        teacher = get_object_or_404(Teachers, user_id=user, action_status=Teachers.APPROVED)

        instance = self.queryset.filter(lesson=pk, teacher=teacher).first()

        data['teacher'] = teacher.id
        data['lesson'] = pk

        serializer = self.get_serializer(instance=instance, data=data)

        if serializer.is_valid(raise_exception=True):
            serializer.save()

        else:
            error_obj = []
            for key in serializer.errors:

                return_error = {
                    "field": key,
                    "msg": serializer.errors[key]
                }

                error_obj.append(return_error)

            if len(error_obj) > 0:
                return request.send_error("ERR_003", error_obj)

        return request.send_info("INF_002")



@permission_classes([IsAuthenticated])
class LessonMaterialSendApiView(
    generics.GenericAPIView,
    mixins.ListModelMixin
):
    ''' Хичээлийн материал ХБА руу илгээх '''

    queryset = Lesson_materials.objects.all().order_by('created_at', 'week')
    serializer_class = LessonMaterialListSerializer

    @login_required()
    def get(self, request, lesson=None):
        """ Хичээлийн бүр лекцийн материал авах """

        self.queryset = self.queryset.filter(lesson=lesson, material_type=Lesson_materials.PPTX)

        all_list = self.list(request).data

        return request.send_data(all_list)

    @login_required()
    def post(self, request, lesson=None):

        # Checked хийсэн ids
        checked_ids = request.data

        queryset = Lesson_materials.objects.filter(lesson=lesson)

        send_ids = queryset.filter(send_type=Lesson_materials.SEND).values_list('id', flat=True)

        remove_sends =  list(set(send_ids) - set(checked_ids))

        qs = queryset.filter(id__in=checked_ids)
        remove_qs = queryset.filter(id__in=remove_sends)

        with transaction.atomic():
            try:
                qs.update(
                    send_type = Lesson_materials.SEND
                )

                remove_qs.update(
                    send_type = None
                )

            except Exception as e:
                print(e)
                return request.send_error("ERR_002")

        return request.send_info("INF_019")


@permission_classes([IsAuthenticated])
class LessonMaterialApproveApiView(
    generics.GenericAPIView,
    mixins.ListModelMixin
):
    """ ХБА батлах хичээлийн материал """

    queryset = Lesson_materials.objects.filter(material_type=Lesson_materials.PPTX).order_by('created_at', 'teacher', 'week')
    serializer_class = LessonMaterialListSerializer

    pagination_class = CustomPagination

    filter_backends = [SearchFilter]
    search_fields = ['title', 'teacher__first_name', 'end_date', 'teacher__last_name', 'lesson__name', 'lesson__code', 'week']

    @login_required()
    def get(self, request):

        user_id = request.user

        ctype = request.query_params.get('type')
        search_teacher = request.query_params.get('teacher')
        lesson = request.query_params.get('lesson')

        # Шалгалтын төрлөөр хайх
        if ctype:
            self.queryset = self.queryset.filter(send_type=int(ctype))

        teacher = Teachers.objects.get(user=user_id)

        department_id = teacher.salbar.id

        self.queryset = self.queryset.filter(teacher__salbar__id=department_id)

        teacher_ids = self.queryset.values_list('teacher', flat=True)

        self.queryset = self.queryset.filter(teacher__in=teacher_ids)

        if search_teacher:
            self.queryset = self.queryset.filter(teacher=search_teacher)

        if lesson:
            self.queryset = self.queryset.filter(lesson=lesson)


        all_list = self.list(request).data

        return request.send_data(all_list)

    def post(self, request):
        data = request.data

        challenge_id = data.get('id')
        is_confirm = data.get('is_confirm')
        comment = data.get('comment')

        send_type = Lesson_materials.APPROVE

        if not is_confirm:
            send_type = Lesson_materials.REJECT

        qs = self.queryset.filter(id=challenge_id)

        with transaction.atomic():

            qs.update(
                send_type=send_type,
                comment=comment
            )

        return request.send_info('INF_018')


@permission_classes([IsAuthenticated])
class LessonStandartGroupAPIView(
    generics.GenericAPIView,
    mixins.ListModelMixin
):
    """ Тухайн ангийн хичээлүүд """

    queryset = LessonStandart.objects.all()
    serializer_class = LessonStandartSerializer
    def get(self, request, group=None):

        group_obj = get_object_or_404(Group, pk=group)

        lessons = LearningPlan.objects.filter(profession=group_obj.profession).annotate(full_name=Concat("lesson__code", Value("-"), "lesson__name", output_field=CharField())).values('lesson__id', 'full_name').order_by('lesson_level', 'lesson__name')
        students = Student.objects.filter(group=group).annotate(full_name=Concat("last_name", Value(". "), "first_name", output_field=CharField())).values('id', 'code', 'full_name')

        return_datas = {
            'lessons': list(lessons),
            'students': list(students)
        }

        return request.send_data(return_datas)


@permission_classes([IsAuthenticated])
class CopyProfesisonAPIView(
    generics.GenericAPIView,
    mixins.CreateModelMixin
):

    ''' Өгөгдсөн хөтөлбөрийн сургалтын төлөвлөгөөний хичээлүүдийг өөр хөтөлбөрийн сургалтын төлөвлөгөөний хичээл рүү хуулах '''

    queryset = LearningPlan.objects.all()

    # Өгөгдлийн сан дээр үйлдэл хийхэд алдаа гарах үед алдаа гарах хүртэл хийгдсэн үйлдлүүдийг буцаах функц
    @transaction.atomic
    def put(self, request):

        data = request.data
        queryset = self.queryset

        # Хуулж авах хөтөлбөрийн сургалтын төлөвлөгөө
        main_learning_plan = queryset.filter(profession=data['copying_prof'])

        # Хуулж тавих хөтөлбөрийн сургалтын төлөвлөгөөний хичээл устгах
        queryset.filter(profession=data['chosen_prof']).delete()

        # Хуулж авах хөтөлбөрийн мэдээллийг авах
        chosen_prof = ProfessionDefinition.objects.get(id=data['chosen_prof'])

        # Хуулж тавих хөтөлбөрийн сургалтын төлөвлөгөөний хичээлийн объектийг хадгалах хүснэгт
        cloned_lessons = []

        # Хуулж тавих хөтөлбөрийн сургалтын төлөвлөгөөний хичээлийн объектийг үүсгэж хадгалах хүснэгт рүү хийх
        for value in main_learning_plan:
            cloned_lessons.append(
                LearningPlan(
                    lesson = value.lesson,
                    previous_lesson = value.previous_lesson,
                    group_lesson = value.group_lesson,
                    lesson_level = value.lesson_level,
                    lesson_type = value.lesson_type,
                    season = value.season,
                    is_check_score = value.is_check_score,
                    department = value.department,
                    school = value.school,
                    profession = chosen_prof
                )
            )

        # Хүснэгтэд хадгалсан объектуудыг өгөгдлийн санд хадгалах хэсэг
        queryset.bulk_create(cloned_lessons)

        # Хүсэлт амжилттай явагдсан үед амжилттай явагдсан тухай мэдээлэл буцаах хэсэг
        return request.send_info('INF_018')


@permission_classes([IsAuthenticated])
class ProfessionJustProfessionAPIView(
    generics.GenericAPIView,
    mixins.ListModelMixin
):
    '''
        Сургалтын төлөвлөгөөний хүснэгтэд хадгалагдсан мэргэжлүүдийг авах
    '''

    queryset = ProfessionDefinition.objects.all()
    serializer_class = ProfessionDefinitionJustProfessionSerializer

    def get(self, request):

        # Сургуулиар хайх хэсэг
        school = request.query_params.get('school')
        if school:
            self.queryset = self.queryset.filter(school=school)

        profession_data = self.list(request).data

        return request.send_data(profession_data)


@permission_classes([IsAuthenticated])
class ProfessionPosterFile(
    generics.GenericAPIView,
    mixins.UpdateModelMixin
):
    """ Постер зураг"""
    queryset = ProfessionDefinition.objects.all()
    serializer_class = ProfessionDefinitionSerializer

    def post(self, request):
        datas = request.data
        profession = datas.get('profession')
        file = request.FILES.get('file')

        datas = {
            'poster_image': file
        }

        instance = ProfessionDefinition.objects.get(id=profession)
        with transaction.atomic():
            serializer =  self.get_serializer(instance, datas, partial=True)
            if serializer.is_valid(raise_exception=False):
                self.perform_update(serializer)
            else:
                return request.send_error_valid(serializer.errors)

        return request.send_info('INF_001')

    def delete(self, request, pk=None):
        ''' Poster зураг устгах '''

        with transaction.atomic():
            instance = ProfessionDefinition.objects.get(id=pk)
            instance.poster_image = None
            instance.save()

        return request.send_info('INF_003')