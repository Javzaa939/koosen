import os
from django.shortcuts import get_object_or_404
import openpyxl_dictreader

from datetime import datetime
from rest_framework import mixins
from rest_framework import generics

from django.db import transaction
from django.conf import settings
from django.db.models import  Count, Q,  Value, CharField, FloatField, DateTimeField, F, Subquery, OuterRef
from django.db.models.functions import Concat

from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes

from main.utils.function.utils import get_lesson_choice_student, has_permission, remove_key_from_dict, get_fullName, get_active_year_season, json_load, calculate_birthday
from main.utils.file import save_file, remove_folder
from lms.models import Challenge, ChallengeStudents, ExamTimeTable, ScoreRegister
from lms.models import Student
from lms.models import LessonStandart
from lms.models import Score
from lms.models import Exam_repeat
from lms.models import Exam_to_student
from lms.models import Lesson_to_teacher
from lms.models import TeacherScore
from lms.models import Lesson_teacher_scoretype
from lms.models import LearningPlan, Exam_to_group
from lms.models import Season, Group, GradeLetter, Country
from core.models import Employee, Teachers, User

from .serializers import CorrespondSerailizer, TeacherScoreListPrintSerializer, TeacherScoreSerializer
from .serializers import CorrespondListSerailizer
from .serializers import ScoreRegisterSerializer
from .serializers import ReScoreSerializer
from .serializers import ReScoreListSerializer
from .serializers import ScoreRegisterListSerializer
from .serializers import ScoreRegisterPrintSerializer

from apps.student.serializers import StudentListSerializer
from main.utils.function.pagination import CustomPagination
from rest_framework.filters import SearchFilter
from django.db.models import Count
from django.db.models import Sum

@permission_classes([IsAuthenticated])
class ScoreRegisterAPIView(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    generics.GenericAPIView
):

    """ дүн crud """

    queryset = ScoreRegister.objects.all()
    serializer_class = ScoreRegisterSerializer

    @has_permission(must_permissions=['lms-score-register-create'])
    def post(self, request):
        " дүн шинээр үүсгэх "

        data = request.data
        student = data.get("student")
        lesson_year = data.get("lesson_year")
        lesson_season = data.get("lesson_season")

        school = data.get("school")
        lesson = data.get("lesson")

        teach_score = data.get("teach_score")
        exam_score = data.get("exam_score")
        total_score = 0

        if teach_score:
            total_score = float(teach_score)

        if exam_score:
            total_score = total_score + float(exam_score)

        if not total_score == 0:
            total_score = round(total_score, 2)
            assessment = Score.objects.filter(score_max__gte=total_score,score_min__lte=total_score).values('id').first()
            if assessment:
                request.data['assessment'] = assessment['id']

        serializer = self.get_serializer(data=data)

        if serializer.is_valid(raise_exception=False):
            with transaction.atomic():
                try:
                    self.create(request)
                except Exception as e:
                    print(e)
                    return request.send_error("ERR_002")

                return request.send_info("INF_001")
        else:
            errors = []
            if student:
                score_info = self.queryset.filter(student=student,lesson_year=lesson_year,lesson_season=lesson_season,school=school,lesson=lesson)
                if score_info:
                    return_error = {
                        "field": "student",
                        "msg": "Тухайн оюутны дүн бүртгэгдсэн байна"
                    }
                    errors.append(return_error)
                    return request.send_error("ERR_003", errors)

            for key in serializer.errors:
                msg = "Хоосон байна"

                return_error = {
                    "field": key,
                    "msg": msg
                }
                errors.append(return_error)

            if len(errors) > 0:
                return request.send_error("ERR_003", errors)

    @has_permission(must_permissions=['lms-score-register-update'])
    def put(self, request, pk=None):
        ''' дүн засах
            pk: Оюутны ID
        '''

        total_score = 0
        data = request.data

        teach_score = data.get("teach_score")
        exam_score = data.get("exam_score")

        lesson_year = data.get("lesson_year")
        lesson_season = data.get("lesson_season")
        lesson = data.get("lesson")

        if teach_score:
            total_score = float(teach_score)

        if exam_score:
            total_score = total_score + float(exam_score)

        if total_score > 100:
            return request.send_error("ERR_002", "0-100 хооронд утга оруулна уу")

        if not total_score == 0:
            total_score = round(total_score, 2)
            assessment = Score.objects.filter(score_max__gte=total_score, score_min__lte=total_score).first()
            if assessment:
                request.data['assessment'] = assessment.id

        instance = self.queryset.filter(student=pk, lesson=lesson, lesson_year=lesson_year, lesson_season=lesson_season).first()

        serializer = self.get_serializer(instance, data=data)

        if serializer.is_valid(raise_exception=False):
            with transaction.atomic():
                try:
                   self.perform_update(serializer)
                except Exception as e:
                    print(e)
                    return request.send_error("ERR_002")

                return request.send_info("INF_002", assessment.get('assesment'))
        else:
            errors = []

            for key in serializer.errors:
                msg = "Хоосон байна"

                return_error = {
                    "field": key,
                    "msg": serializer.errors[msg]
                }

                errors.append(return_error)

            if len(errors) > 0:
                return request.send_error("ERR_003", errors)

            return request.send_error("ERR_002")

    @has_permission(must_permissions=['lms-score-register-delete'])
    def delete(self, request, pk=None):
        ''' Хичээлийн дүн устгах '''

        self.destroy(request, pk)
        return request.send_info("INF_003")

class ScoreRegisterStudentView(
    mixins.ListModelMixin,
    generics.GenericAPIView
):
    queryset = Student.objects
    serializer_class = StudentListSerializer

    filter_backends = [SearchFilter]
    search_fields = ['code', 'first_name', 'last_name']

    def get(self,request):

        lesson_year = self.request.query_params.get('lesson_year')
        lesson_season = self.request.query_params.get('lesson_season')
        school_id = self.request.query_params.get('school')
        lesson = self.request.query_params.get('lesson')
        group = self.request.query_params.get('group')
        teacher = self.request.query_params.get('teacher')

        all_student = get_lesson_choice_student(lesson, teacher, school_id, lesson_year, lesson_season, group)

        score_queryset =  ScoreRegister.objects.all()
        if school_id:
            score_queryset = score_queryset.filter(school=school_id)

        score_list = score_queryset.filter(lesson_year=lesson_year, lesson_season=lesson_season, lesson=lesson, teacher=teacher)

        score_list_ids = score_list.values_list('student', flat=True)

        self.queryset = self.queryset.filter(id__in=all_student).exclude(id__in=score_list_ids)

        all_list = self.list(request).data

        return request.send_data(all_list)


@permission_classes([IsAuthenticated])
class CorrespondAPIView(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    generics.GenericAPIView
):

    """ Дүйцүүлсэн дүн crud """

    queryset = ScoreRegister.objects
    serializer_class = CorrespondSerailizer
    pagination_class = CustomPagination

    filter_backends = [SearchFilter]
    search_fields = ['student__code','student__last_name','student__first_name', 'lesson__name', 'lesson__code', 'teach_score', 'exam_score', 'assessment__assesment']

    def get_queryset(self):
        queryset = self.queryset.filter(status=ScoreRegister.CORRESPOND)
        school = self.request.query_params.get('school')
        lesson_season = self.request.query_params.get('lesson_season')
        lesson_year = self.request.query_params.get('lesson_year')
        sorting = self.request.query_params.get('sorting')

        # Сургуулиар хайлт хийх
        if school:
            queryset = queryset.filter(school=school)

        # Хичээлийн жилээр хайлт хийх
        if lesson_year:
            queryset = queryset.filter(lesson_year=lesson_year)

        # Хичээлийн улиралаар хайлт хийх
        if lesson_season:
            queryset = queryset.filter(lesson_season_id=lesson_season)

        # Sort хийх үед ажиллана
        if sorting:
            if not isinstance(sorting, str):
                sorting = str(sorting)

            queryset = queryset.order_by(sorting)

        return queryset

    @has_permission(must_permissions=['lms-score-correspond-read'])
    def get(self, request, pk=None):
        " Дүйцүүлсэн дүн жагсаалт "

        self.serializer_class = CorrespondListSerailizer
        if pk:
            correspond_info = self.retrieve(request, pk).data
            return request.send_data(correspond_info)

        correspond_list = self.list(request).data
        return request.send_data(correspond_list)

    @has_permission(must_permissions=['lms-score-correspond-create'])
    @transaction.atomic
    def post(self, request):
        " Дүйцүүлсэн дүн шинээр үүсгэх "

        sid = transaction.savepoint()

        data = request.data
        student = data.get("student")
        lesson_year = data.get("lesson_year")
        lesson_season = data.get("lesson_season")
        school = data.get("school")
        lesson = data.get("lesson")
        teach_score = data.get("teach_score")
        exam_score = data.get("exam_score")

        total_score = 0
        if teach_score:
            total_score = float(teach_score)
        if exam_score:
            total_score = total_score + float(exam_score)

        if not total_score == 0:
            total_score = round(total_score, 2)
            assessments = Score.objects.filter(score_max__gte=total_score,score_min__lte=total_score).values('id').first()
            if assessments:
                request.data['assessment'] = assessments['id']

        if student:
            score_info = self.queryset.filter(student=student, lesson_year=lesson_year, lesson_season=lesson_season, school=school, lesson=lesson)
            if score_info:
                return request.send_error("ERR_002", 'Оюутан дээр тухайн хичээлийн дүн бүртгэлтэй байна')

        try:
            serializer = self.serializer_class(data=data, many=False)
            if not serializer.is_valid():
                transaction.savepoint_rollback(sid)
                return request.send_error_valid(serializer.errors)

            serializer.save()

        except Exception:
            return request.send_error("ERR_002")

        return request.send_info("INF_001")

    @has_permission(must_permissions=['lms-score-correspond-update'])
    def put(self, request, pk=None):
        "Дүйцүүлсэн дүн засах"

        data = request.data
        student = data.get("student")
        data = request.data
        assessment = data.get("assessment")
        lesson_year = data.get("lesson_year")
        lesson_season = data.get("lesson_season")
        school = data.get("school")
        lesson = data.get("lesson")
        teach_score = data.get("teach_score")
        exam_score = data.get("exam_score")

        total_score = 0
        if teach_score:
            total_score = float(teach_score)
        if exam_score:
            total_score = total_score + float(exam_score)

        if not total_score == 0:
            total_score = round(total_score, 2)
            assessments = Score.objects.filter(score_max__gte=total_score,score_min__lte=total_score).values('id').first()
            if assessments:
                request.data['assessment'] = assessments['id']

        instance = self.get_object()

        score_info = self.queryset.filter(student=student, lesson_year=lesson_year, lesson_season=lesson_season, school=school, lesson=lesson).exclude(id=pk)
        if score_info:
            return request.send_error("ERR_002", 'Оюутан дээр тухайн хичээлийн дүн бүртгэлтэй байна')

        try:
            serializer = self.get_serializer(instance, data=data)
            if not serializer.is_valid(raise_exception=False):
                return request.send_error_valid(serializer.errors)

            self.update(request).data

        except Exception as e:
            print(e)
            return request.send_error("ERR_002")

        return request.send_info("INF_002")

    @has_permission(must_permissions=['lms-score-correspond-delete'])
    def delete(self, request, pk=None):
        " Дүйцүүлсэн дүн устгах "

        self.destroy(request, pk)
        return request.send_info("INF_003")


@permission_classes([IsAuthenticated])
class ReScoreAPIView(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.CreateModelMixin,
    generics.GenericAPIView
):

    """ Дахин шалгалтын дүн crud """

    queryset = Exam_repeat.objects
    serializer_class = ReScoreSerializer

    filter_backends = [SearchFilter]
    search_fields = ['student__code','student__last_name','student__first_name']

    def get_queryset(self):
        queryset = self.queryset.filter(status__in=[1,2,3])
        school = self.request.query_params.get('school')
        lesson_season = self.request.query_params.get('lesson_season')
        lesson_year = self.request.query_params.get('lesson_year')
        status = self.request.query_params.get('status')
        lesson = self.request.query_params.get('lesson')
        sorting = self.request.query_params.get('sorting')

       # Сургуулиар хайлт хийх
        if school:
            queryset = queryset.filter(school=school)

        # Хичээлийн жилээр хайлт хийх
        if lesson_year:
            queryset = queryset.filter(lesson_year=lesson_year)

        # Хичээлийн улиралаар хайлт хийх
        if lesson_season:
            queryset = queryset.filter(lesson_season_id=lesson_season)

        # Шалгалтын төлөвөөр хайлт хийх
        if status:
            queryset = queryset.filter(status=status)

        # Хичээлээр хайлт хийх
        if lesson:
            queryset = queryset.filter(lesson=lesson)

        if status:
            score_status = int(status) + 4
            if score_status and lesson:
                student_ids = ScoreRegister.objects.filter(lesson=lesson, status=score_status,is_delete=False).values_list('student', flat=True)
                queryset = queryset.filter(student__in=student_ids)

        # Sort хийх үед ажиллана
        if sorting:
            if not isinstance(sorting, str):
                sorting = str(sorting)

            queryset = queryset.order_by(sorting)

        return queryset

    @has_permission(must_permissions=['lms-score-restudy-read'])
    def get(self, request, pk=None):
        " Дахин шалгалтын дүн жагсаалт "

        self.serializer_class = ReScoreListSerializer

        if pk:
            rescore_info = self.retrieve(request, pk).data
            return request.send_data(rescore_info)


        rescore_list = self.list(request).data
        return request.send_data(rescore_list)

    @has_permission(must_permissions=['lms-score-restudy-create'])
    def post(self, request):
        " Дахин шалгалтын дүн үүсгэх "

        self.queryset = ScoreRegister.objects.all()
        data = request.data
        teach_score = data.get('teach_score')
        exam_score = data.get('exam_score')
        lesson = data.get('lesson')
        student = data.get('student')
        status = data.get('status')
        lesson_year = data.get('lesson_year')
        lesson_season = data.get('lesson_season')
        school = data.get('school')
        instance = self.queryset.filter().first()
        serializer = self.get_serializer(instance, data=data)

        if status != 6: #Шууд тооцохоос бусад үед өмнө нь дүнтэй эсэхийг шалгана
            before_score = ScoreRegister.objects.filter(lesson=lesson, student=student).exclude(lesson_year=lesson_year, lesson_season=lesson_season)
            if not before_score:
                return request.send_error("ERR_003", 'Энэ хичээлийг өмнө судлаагүй тул дүн оруулах боломжгүй')
        now_score = ScoreRegister.objects.filter(lesson=lesson, student=student, lesson_year=lesson_year, lesson_season=lesson_season)
        if now_score:
            return request.send_error("ERR_003", 'Энэ улиралд дүн бүртгэгдсэн байна.')

        delete_score = ScoreRegister.objects.filter(lesson=lesson, student=student, is_delete=True)
        if delete_score:
            delete_score.delete()

        if serializer.is_valid(raise_exception=False):
            is_success = False
            with transaction.atomic():
                try:
                    result = ScoreRegister.objects.create(
                        teach_score = teach_score,
                        exam_score = exam_score,
                        teacher = None,
                        lesson_id = lesson,
                        student_id = student,
                        lesson_year = lesson_year,
                        lesson_season_id = lesson_season,
                        school_id = school,
                        status = status,
                    )

                    result1 = ScoreRegister.objects.filter(lesson=lesson, student=student, is_delete=False).exclude(lesson_year=lesson_year, lesson_season=lesson_season).update(
                        is_delete = True
                    )

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

            return request.send_error("ERR_002")

    @has_permission(must_permissions=['lms-score-restudy-update'])
    def put(self, request, pk=None):
        " Дахин шалгалтын дүн засах "

        self.queryset = ScoreRegister.objects.all()
        data = request.data
        teach_score = data.get('teach_score')
        exam_score = data.get('exam_score')
        lesson = data.get('lesson')
        student = data.get('student')
        lesson_year = data.get('lesson_year')
        lesson_season = data.get('lesson_season')
        instance = self.queryset.filter(id=pk).first()
        serializer = self.get_serializer(instance, data=data)

        if serializer.is_valid(raise_exception=False):
            is_success = False
            with transaction.atomic():
                try:
                    result = ScoreRegister.objects.filter(id=pk).update(
                        teach_score = teach_score,
                        exam_score = exam_score,
                        teacher = None
                    )

                    result1 = ScoreRegister.objects.filter(lesson=lesson, student=student, is_delete=False).exclude(lesson_year=lesson_year, lesson_season=lesson_season).update(
                        is_delete = True
                    )

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

            return request.send_error("ERR_002")

@permission_classes([IsAuthenticated])
class ReScoreStudentView(
    mixins.ListModelMixin,
    generics.GenericAPIView
):
    queryset = Student.objects
    serializer_class = StudentListSerializer

    filter_backends = [SearchFilter]
    search_fields = ['code', 'first_name', 'last_name']

    def get(self,request):

        lesson_year = self.request.query_params.get('lesson_year')
        lesson_season = self.request.query_params.get('lesson_season')
        school_id = self.request.query_params.get('school')
        lesson = self.request.query_params.get('lesson')
        status = self.request.query_params.get('status')

        qs_choice = Exam_repeat.objects.all()
        qs_score = ScoreRegister.objects.all().filter(status__in=[5,6,7])

        if lesson_year:
            qs_choice = qs_choice.filter(lesson_year=lesson_year)
            qs_score = qs_score.filter(lesson_year=lesson_year)
        if lesson_season:
            qs_choice = qs_choice.filter(lesson_season=lesson_season)
            qs_score = qs_score.filter(lesson_season=lesson_season)
        if school_id:
            qs_choice = qs_choice.filter(school=school_id)
            qs_score = qs_score.filter(school=school_id)
        if lesson:
            qs_choice = qs_choice.filter(lesson=lesson)
            qs_score = qs_score.filter(lesson=lesson)
        if status:
            qs_choice = qs_choice.filter(status=status)
            score_status = int(status) + 4
            if score_status:
                qs_score = qs_score.filter(status=score_status)
        choice_list_ids = qs_choice.values_list('student', flat=True)

        score_list_ids = qs_score.values_list('student', flat=True)

        self.queryset = self.queryset.filter(id__in=choice_list_ids).exclude(id__in=score_list_ids)

        all_list = self.list(request).data

        return request.send_data(all_list)


@permission_classes([IsAuthenticated])
class ScoreRegisterListAPIView(
    mixins.ListModelMixin,
    generics.GenericAPIView
):
    """ дүн crud """

    queryset = ScoreRegister.objects.all().exclude(status=ScoreRegister.CORRESPOND).order_by('-teach_score', '-exam_score')

    serializer_class = ScoreRegisterListSerializer

    pagination_class = CustomPagination

    filter_backends = [SearchFilter]
    search_fields = ['student__code', 'student__first_name', 'student__last_name']

    @has_permission(must_permissions=['lms-score-register-read'])
    def get(self, request, pk=None):
        " дүн жагсаалт "

        teacher = request.query_params.get('teacher')
        lesson = request.query_params.get('lesson')
        group = request.query_params.get('group')

        have_teach_score = False

        lesson_year, lesson_season = get_active_year_season()

        self.queryset = self.queryset.filter(lesson_year=lesson_year, lesson_season=lesson_season)

        if teacher:
            self.queryset = self.queryset.filter(teacher=teacher)

        if lesson:
            self.queryset = self.queryset.filter(lesson=lesson)

        if group:
            self.queryset = self.queryset.filter(student__group=group)

        all_list = self.list(request).data

        if teacher:
            # Багш хичээл холболт
            lesson_teacher = Lesson_to_teacher.objects.filter(lesson=lesson, teacher=teacher).first()

            # Багшийн дүнгийн задаргааны төрлүүд
            score_type_ids = Lesson_teacher_scoretype.objects.filter(lesson_teacher=lesson_teacher).values_list('id', flat=True)

            teach_score_qs = TeacherScore.objects.filter(lesson_year=lesson_year, lesson_season=lesson_season, score_type_id__in=score_type_ids)

            if teach_score_qs:
                have_teach_score = True

        return_datas = {
            'datas': all_list,
            'have_teach_score': have_teach_score
        }

        return request.send_data(return_datas)

@permission_classes([IsAuthenticated])
class ScoreTeacherDownloadAPIView(
    generics.GenericAPIView,
    mixins.ListModelMixin
):
    """ Багшийн дүн нэгтгэж татах хэсэг """

    queryset = ScoreRegister.objects.all().exclude(status=ScoreRegister.CORRESPOND)
    serializer_class = ScoreRegisterListSerializer

    def get(self, request):

        all_students_teach_scores = []
        have_score_students = []

        student_queryset = Student.objects.all()

        teacher = request.query_params.get('teacher')
        lesson = request.query_params.get('lesson')
        group = request.query_params.get('group')
        school_id = self.request.query_params.get('school')

        lesson_year = request.query_params.get('lesson_year')
        lesson_season = request.query_params.get('lesson_season')

        if not teacher and not lesson:
            return request.send_data([])

        self.queryset = self.queryset.filter(lesson_year=lesson_year, lesson_season=lesson_season)

        # Багш хичээл холболт
        lesson_teacher = Lesson_to_teacher.objects.filter(lesson=lesson, teacher=teacher).first()

        # Багшийн дүнгийн задаргааны төрлүүд
        score_type_ids = Lesson_teacher_scoretype.objects.filter(lesson_teacher=lesson_teacher).values_list('id', flat=True)

        # Багшийн дүнгийн төрөл бүрт оюутанд өгсөн оноо
        teach_score_qs = TeacherScore.objects.filter(lesson_year=lesson_year, lesson_season=lesson_season, score_type_id__in=score_type_ids)

        # Анги байвал тухайн ангийн оюутны дүнг татна.
        if group:
            teach_score_qs = teach_score_qs.filter(student__group=group)

        # Дүнтэй оюутнууд
        teacher_score_students = teach_score_qs.values_list('student', flat=True).distinct('student')

        # Оюутны дүн нэгтэх
        for student_id in teacher_score_students:
            obj = {}
            total_score = teach_score_qs.filter(student=student_id).exclude(score_type__score_type=Lesson_teacher_scoretype.SHALGALT_ONOO).aggregate(total=Sum('score')).get('total')
            exam_score = teach_score_qs.filter(student=student_id).filter(score_type__score_type=Lesson_teacher_scoretype.SHALGALT_ONOO).aggregate(total=Sum('score')).get('total')

            obj['student'] = student_id
            obj['teach_score'] = total_score
            obj['exam_score'] = exam_score

            all_students_teach_scores.append(obj)

        # Тухайн хуваарь дээр хичээл үзэж байгаа бүх оюутнууд
        # all_student = get_lesson_choice_student(lesson, teacher, school_id, lesson_year, lesson_season, group)
        # if all_student:
        #     student_queryset = student_queryset.filter(id__in=all_student)
        # else:
        student_queryset = student_queryset.filter(id__in=teacher_score_students)

        # Хичээлийн хуваарьтай бүх оюутнууд
        all_timetable_student_ids = student_queryset.values_list('id', flat=True)

        with transaction.atomic():

            # Багшийн дүн оруулсан оюутны дүнг үүсгэнэ
            create_score_students = []
            update_score_students = []
            for student_teach_score in all_students_teach_scores:
                student_id = student_teach_score.get('student')
                student_teacher_score = student_teach_score.get('teach_score') or 0
                student_exam_score = student_teach_score.get('exam_score') or 0

                have_score_students.append(student_id)

                # Өмнө нь дүн орсон эсэхийг шалгах
                student_score_have = ScoreRegister.objects.filter(lesson_year=lesson_year, lesson_season=lesson_season, student=student_id, lesson=lesson).first()

                # Үсгэн үнэлгээ
                student_score_total = student_teacher_score + student_exam_score
                student_score_total =round(student_score_total, 2)
                assessment = Score.objects.filter(score_max__gte=student_score_total, score_min__lte=student_score_total).first()

                student = Student.objects.filter(id=student_id).first()

                # Өмнө нь дүн орчихсон байвал update хийнэ
                if student_score_have:
                    student_score_have.teach_score = student_teacher_score
                    student_score_have.exam_score = student_exam_score
                    student_score_have.assessment = assessment
                    student_score_have.lesson_year = lesson_year
                    student_score_have.lesson_season = Season.objects.get(id=lesson_season)
                    student_score_have.status = ScoreRegister.TEACHER_WEB
                    update_score_students.append(student_score_have)
                else:
                    create_score_students.append(
                        ScoreRegister(
                            lesson_year=lesson_year,
                            lesson_season=Season.objects.get(id=lesson_season),
                            lesson_id=lesson,
                            student_id=student_id,
                            teach_score=student_teacher_score if student_teacher_score else 0,
                            exam_score=student_exam_score if student_exam_score else 0,
                            teacher_id=teacher,
                            assessment=assessment or None,
                            status=ScoreRegister.TEACHER_WEB,
                            school=student.school if student else None
                        )
                    )
            ScoreRegister.objects.bulk_create(create_score_students)
            ScoreRegister.objects.bulk_update(update_score_students, ['teach_score', 'exam_score', 'status', 'assessment', 'lesson_year', 'lesson_season'])

            # Дүнгүй оюутнууд
            not_score_students = list(set(all_timetable_student_ids) - set(have_score_students))

            # Багшаас дүн аваагүй ч хуваарьт байгаа оюутнуудыг create хийх
            if not_score_students:
                create_students = []
                update_students = []
                for student_id in not_score_students:
                    student_score_total = 0
                    student_teacher_score = student_teach_score.get('teach_score') or 0
                    student_exam_score = student_teach_score.get('exam_score') or 0
                    student_not_score = ScoreRegister.objects.filter(lesson_year=lesson_year, lesson_season=lesson_season, student=student_id, lesson=lesson).first()
                    student = Student.objects.filter(id=student_id).first()

                    # Үсгэн үнэлгээ
                    student_score_total = student_teacher_score + student_exam_score
                    student_score_total = round(student_score_total, 2)
                    assessment = Score.objects.filter(score_max__gte=student_score_total, score_min__lte=student_score_total).first()

                    # Өмнө нь дүн орчихсон байвал update хийнэ
                    if student_not_score:
                        student_not_score.teach_score = student_teacher_score
                        student_not_score.exam_score = student_exam_score
                        student_not_score.assessment = assessment
                        student_not_score.lesson_year = lesson_year
                        student_not_score.lesson_season = Season.objects.get(id=lesson_season)
                        student_not_score.status = ScoreRegister.TEACHER_WEB
                        update_students.append(student_not_score)
                    else:
                        create_students.append(
                            ScoreRegister(
                                lesson_year=lesson_year,
                                lesson_season=Season.objects.get(id=lesson_season),
                                lesson_id=lesson,
                                student_id=student_id,
                                teach_score=student_teacher_score,
                                exam_score=student_exam_score,
                                teacher_id=teacher,
                                assessment_id=assessment if assessment else None,
                                status=ScoreRegister.TEACHER_WEB,
                                school=student.school if student else None
                            )
                        )

                ScoreRegister.objects.bulk_create(create_students)
                ScoreRegister.objects.bulk_update(update_students, ['teach_score', 'exam_score', 'status', 'assessment', 'lesson_year', 'lesson_season'])

        self.queryset = self.queryset.filter(student__in=student_queryset, lesson=lesson)

        all_list = self.list(request).data

        return request.send_data(all_list)


class ScoreOldAPIView(
    generics.GenericAPIView
):
    """ Оюутан бүрийн хуучин дүн оруулах """

    #  Хичээлийн жил улирал оруулах
    def post(self, request):

        data = request.data.dict()
        assessment = None

        not_found_lesson = []
        not_found_student = []
        all_create_datas = []

        file = data.get('file')

        file_name = file.name

        # Файл түр хадгалах
        path = save_file(file, 'score_sheet', 1)

        full_path = os.path.join(settings.MEDIA_ROOT, str(path))

        # try:
        reader = openpyxl_dictreader.DictReader(full_path)
        for row in reader:
            season = None
            lesson_year = None

            student_code = row.get('Оюутны код')
            student_full_name = row.get('Оюутны нэр')

            if not student_code or not student_full_name:
                continue

            splitted_name = student_full_name.split('.')
            first_name = splitted_name[0]
            last_name = splitted_name[-1]

            student = Student.objects.filter(Q(Q(code=student_code) | Q(first_name=first_name, last_name=last_name))).first()

            # Оюутны код таарахгүй байхгүй үед
            if not student:
                obj = {}
                obj['student_code'] = student_code
                obj['student_name'] = student_full_name

                not_found_student.append(obj)
                continue

            group_obj = Group.objects.get(id=student.group.id)

            # Ангийн элссэн хичээлийн жил
            student_group_year = group_obj.join_year

            # Мэргэжил
            student_profession = group_obj.profession
            lessons = LearningPlan.objects.filter(profession=student_profession).annotate(full_name=Concat("lesson__code", Value("-"), "lesson__name", output_field=CharField())).values('lesson__id', 'full_name').order_by('lesson_level', 'lesson__name')

            for lesson in list(lessons):
                score = row.get('{}'.format(lesson.get('full_name')))

                if not score:
                    obj = {}
                    obj['student_code'] = student_code
                    obj['lesson_code'] = lesson.get('full_name')
                    obj['lesson_name'] = lesson.get('full_name')
                    obj['exam_score'] = score

                    not_found_lesson.append(obj)
                    continue

                splitted_list = student_group_year.split('-')

                start_year = int(splitted_list[0]) # Анги эхэлсэн жил
                end_year = int(splitted_list[1]) # Анги дууссан жил

                lesson = LessonStandart.objects.get(id=lesson.get('lesson__id'))

                # Cургалтын төлөвлөгөөнөөс мэргэжил хичээлээр хайж хичээл үзэх улирлыг авна
                learningplan = LearningPlan.objects.filter(profession=student_profession, lesson=lesson.id).first()
                learningplan_season = json_load(learningplan.season)

                if isinstance(learningplan_season, list) and len(learningplan_season) > 0:
                    learningplan_season = learningplan_season[0]

                    # Улирал тэгш сондгой эсэхийг шалгах
                    if int(learningplan_season) % 2 == 0:
                        year_count = int(learningplan_season) / 2
                        cyear_count = int(year_count - 1)

                        qs_season = Season.objects.filter(season_name='Хавар').first()
                        season = qs_season.id
                    else:
                        year_count = (int(learningplan_season) + 1) / 2
                        cyear_count = int(year_count - 1)

                        qs_season = Season.objects.filter(season_name='Намар').first()
                        season = qs_season.id

                    score_start_year = str(start_year + cyear_count)
                    score_end_year = str(end_year + cyear_count)

                    lesson_year = score_start_year + '-' + score_end_year

                grade_letter = None

                # Тооцов дүн оруулах хэсэг S үнэлгээ нь тооцов
                if isinstance(score, str) and (score == 'S' or score == 's'):
                    grade_letter = GradeLetter.objects.filter(letter__iexact=score).first()
                elif score:
                    score  = float(score)
                    score = round(score, 2)
                    assessment = Score.objects.filter(score_max__gte=score, score_min__lte=score).first()

                exam_score = None
                if isinstance(score, int) or isinstance(score, float):
                    exam_score = round(score, 2)

                # Үсгэн үнэлгээ орж ирвэл
                if isinstance(score, str):
                    exam_score = score

                create_datas = {
                    'student_id': student.id,
                    'student_code': student.code,
                    'lesson_id': lesson.id,
                    'lesson_name': lesson.name,
                    'lesson_code': lesson.code,
                    "exam_score": exam_score,
                    'assessment_id': assessment.id if assessment else None,
                    'grade_letter_id': grade_letter.id if grade_letter else None,
                    'status': ScoreRegister.START_SYSTEM_SCORE,
                    'school_id': student.school.id if student.school else None,
                    'lesson_year': lesson_year,
                    'lesson_season_id': season
                }

                all_create_datas.append(create_datas)

            # Хадгалж дууссаны дараа файлаа устгах
            remove_folder(path)

        # except Exception as e:
            # print(e)
            # Алдаа гарвал файлаа устгах
            # remove_folder(path)

        all_error_datas = not_found_lesson + not_found_student

        return_datas = {
            'create_datas': all_create_datas,
            'not_found_lesson': not_found_lesson,
            'not_found_student': not_found_student,
            'all_error_datas': all_error_datas,
            'file_name': file_name
        }

        return request.send_data(return_datas)


    def put(self, request, pk=None):
        """ Хуучин дүн тулгах """

        datas = request.data
        user = request.user
        not_score = datas.get('not_score')
        now = datetime.now()

        if 'not_score' in datas:
            del datas['not_score']

        datas['updated_user'] = user
        datas['updated_at'] = now

        score_obj = ScoreRegister.objects.get(pk=pk)

        # Дүн засахад үсгэн үнэлгээ өөрчлөх
        with transaction.atomic():
            ScoreRegister.objects.filter(pk=pk).update(
                **datas
            )

            if not not_score:
                score_obj = ScoreRegister.objects.get(pk=pk)
                score = round(score_obj.score_total, 2)

                assessment = Score.objects.filter(score_max__gte=score,score_min__lt=score).first()
                score_obj.assessment = assessment
                score_obj.updated_user = request.user
                score_obj.save()

        return request.send_info('INF_002')


class ScoreImportAPIView(
    generics.GenericAPIView
):
    """ Хуучин дүн import хийх """

    def post(self, request):

        datas = request.data
        user = request.user

        with transaction.atomic():
            try:
                # Бүх датагаа хадгалах
                for create_data in datas:
                    student = create_data.get('student_id')
                    lesson_id = create_data.get('lesson_id')
                    score = create_data.get('exam_score')
                    score = create_data.get('exam_score')

                    if isinstance(score, int) or isinstance(score, float):
                        create_data['exam_score'] = float(score)

                    else:
                        create_data['exam_score'] = 0

                    create_data = remove_key_from_dict(create_data, ['student_code', 'lesson_code', 'lesson_name'])

                    # Тухайн хичээл дүнтэй байвал
                    score_obj = ScoreRegister.objects.filter(student=student, lesson=lesson_id).first()
                    if score_obj:
                        # Үсгэн үнэлгээ хадгалах үед S, CR гээд тооцов
                        if isinstance(score, str) and create_data.get('grade_letter_id'):
                            score_obj.exam_score = 0
                            score_obj.teach_score = 0
                            score_obj.grade_letter = GradeLetter.objects.get(pk=create_data.get('grade_letter_id'))
                        else:
                            teach_score =  score_obj.teach_score if score_obj.teach_score else 0
                            total_score = teach_score + float(score)

                            # Дүн засахад үсгэн үнэлгээ өөрчлөх
                            total_score = round(total_score, 2)
                            assessment = Score.objects.filter(score_max__gte=total_score,score_min__lte=total_score).first()
                            score_obj.exam_score = float(score)
                            score_obj.assessment = assessment
                            score_obj.updated_user = User.objects.get(id=user.id)

                            if create_data.get('lesson_year'):
                                score_obj.lesson_year = create_data.get('lesson_year')

                            if create_data.get('lesson_season_id'):
                                score_obj.lesson_season__id = create_data.get('lesson_season_id')

                        score_obj.save()
                    else:
                        # Үсгэн үнэлгээ хадгалах үед
                        if isinstance(score, str) and create_data.get('grade_letter_id'):
                            create_data['exam_score'] = 0

                        create_data['created_user'] = User.objects.get(id=user.id)
                        ScoreRegister.objects.create(**create_data)

            except Exception as e:
                print(e)
                return request.send_error('ERR_002')

        return request.send_info('INF_013')


class ScoreRegisterPrintAPIView(
    generics.GenericAPIView,
):
    """ Дүн хэвлэх """

    queryset = ScoreRegister.objects.all().order_by("-lesson_year")
    serializer_class = ScoreRegisterPrintSerializer

    def get(self, request, student=None):
        """ Дүнгийн тодорхойлолт (ганц оюутны хувьд) """

        # жил улиралаар хайх
        lesson_year = self.request.query_params.get('year')
        lesson_season = self.request.query_params.get('season')

        if lesson_year:
            self.queryset = self.queryset.filter(lesson_year=lesson_year)

        if lesson_season:
            self.queryset = self.queryset.filter(lesson_season=lesson_season)

        all_data = []
        score_info = {}
        lessons_qs = {}
        asses_qs = {}
        total = []

        lesson_counts = []
        lesson_code_count = []

        # үсгэн дүн тоолох нь
        asses_qs = (self.queryset.filter(student_id=student, is_delete=False).values('assessment__assesment')
            .annotate(asses_count=Count('assessment__assesment')).order_by('assessment__assesment'))

        # тухайн жил, улирал болгоны үзсэн хичээлүүдыг тоолох нь
        lessons_qs = (self.queryset.filter(student_id=student, is_delete=False ).values("lesson_year", "lesson_season__season_name")
            .annotate(less_count=Count('lesson')).order_by("lesson_season__season_name")).order_by("lesson_year")

        if asses_qs and lessons_qs:
            lesson_code_count = list(asses_qs)
            lesson_counts = list(lessons_qs)

        # тухайн оюутны мэдээлэл дүнгийн мэдээлэл
        score_qs = self.queryset.filter(student_id=student).order_by("lesson_year", "lesson_season")

        for qs in score_qs:
            year = ''

            # жил улирал
            if qs.lesson_year and qs.lesson_season:
                year = qs.lesson_year + " " + qs.lesson_season.season_name

            if year not in score_info:
                score_info[year] = []

            score_info[year].append(qs)

        # Бүх year total
        total_kr_count = 0
        total_skr_count = 0
        total_onoo_count = 0
        total_gpa_scores = 0
        total_gpa_count = 0
        total_onoo_avg = 0
        niit_gpa = 0

        degree_name = ''
        student_code = ''
        proffession = ''
        join_year = ''
        full_names = ''

        for key in score_info.keys():
            list_info = []

            # total
            onoo = 0
            total_kr = 0
            total_gpa = 0

            # суралцсан жил,улирал болгоны дүнгүүд
            for eachScore in score_info[key]:
                assessments = None
                status_num = None
                gpa = 0

                total_scores = eachScore.score_total
                status_num = eachScore.status

                # exam + teach
                total_scores = round(total_scores, 2)
                assessment = Score.objects.filter(score_max__gte=total_scores, score_min__lte=total_scores).first()
                if assessment:
                    assessments = assessment.assesment
                    gpa = assessment.gpa

                # оюутны мэдээлэл
                student_code = eachScore.student.code
                proffession = eachScore.student.group.profession.name
                join_year = eachScore.student.group.join_year
                degree_name = eachScore.student.group.degree.degree_name
                full_names = get_fullName(eachScore.student.last_name + " овогтой " + eachScore.student.first_name, False, True )

                # хичээлүүд
                list_info.append({
                    "lesson_year":eachScore.lesson_year if eachScore.lesson_year else '',
                    "lesson_season":eachScore.lesson_season.season_name if eachScore.lesson_season else '',
                    "lesson_code":eachScore.lesson.code if eachScore.lesson.code else '',
                    "lesson_name":eachScore.lesson.name if eachScore.lesson.name else '',
                    "lesson_kr":eachScore.lesson.kredit if eachScore.lesson.kredit else 0,
                    "exam_score":eachScore.exam_score if eachScore.exam_score is not None else '',
                    "teach_score":eachScore.teach_score if eachScore.teach_score is not None else '',
                    "total_scores":total_scores if total_scores else 0,
                    "assessment":assessments if assessments else '',
                    "status_num":status_num if status_num else 0,
                    "gpa": gpa,
                    'grade_letter': eachScore.grade_letter.description if eachScore.grade_letter else ''
                })

                total_kr = total_kr + eachScore.lesson.kredit
                onoo = onoo + total_scores * eachScore.lesson.kredit
                total_gpa_scores = total_gpa_scores + (gpa * eachScore.lesson.kredit)

                if eachScore.grade_letter:
                    total_skr_count = total_skr_count + eachScore.lesson.kredit

            # дундаж олох нь
            if onoo != 0:
                total_onoo = round(onoo / total_kr, 2)

            # нийт kr
            total_kr_count = total_kr_count + total_kr
            total_onoo_count = total_onoo_count + onoo

            # голч олох нь
            score = Score.objects.filter(
                score_max__gte=total_onoo, score_min__lte=total_onoo).first()

            if score:
                total_gpa=score.gpa

            # жил,улирал болгоны kr and lesson жагсаалт
            year_splitted = key.split(' ')
            all_data.append(
                {
                    "year": year_splitted[0] if len(year_splitted) > 0 else '',
                    "season": year_splitted[-1] if len(year_splitted) > 0 else '',
                    "total":{
                        "kr":total_kr,
                        "onoo":total_onoo,
                        "gpa":total_gpa,
                    },
                    "lesson_info":list_info,

                }
            )

        # ------------ Бүх жилийн total -----------
        if (total_kr_count and total_onoo_count) > 0:

            # дундаж олох нь
            total_onoo_avg = round(total_onoo_count / total_kr_count, 2)

        estimate_count = total_kr_count - total_skr_count
        print('estimate_count', estimate_count)
        print('total_kr_count', total_kr_count)
        print('total_skr_count', total_skr_count)
        print('total_gpa_scores', total_gpa_scores)
        if total_gpa_scores != 0.0:
            niit_gpa = round((total_gpa_scores / estimate_count), 1)

        total.append({
            "all_total":
            {
                "total_kr": total_kr_count if total_kr_count else "",
                "total_onoo": total_onoo_avg,
                "total_gpa":niit_gpa,
            },
            "student_info":
            {
                "full_name": full_names if full_names else "",
                "code": student_code if student_code else "",
                "proffession": proffession if proffession else "",
                "join_year": join_year if join_year else "",
                "degree_name":degree_name if degree_name else "",
            },
        })
        data = {
            "scoreregister":all_data,
            "asses_count":lesson_code_count,
            "lesson_count":lesson_counts,
            "all_total":total,
        }

        return request.send_data(data)


@permission_classes([IsAuthenticated])
class TeacherScoreAPIView(
    generics.GenericAPIView,
    mixins.ListModelMixin
):
    """ Явцын оноо """

    queryset = TeacherScore.objects
    serializer_class = TeacherScoreSerializer

    pagination_class = CustomPagination

    filter_backends = [SearchFilter]
    search_fields = ['student__code', 'student__register_num', 'student__first_name']

    def put(self, request):
        lesson_year, lesson_season = get_active_year_season()
        self.queryset = self.queryset.filter(lesson_year=lesson_year, lesson_season=lesson_season)
        school_id = self.request.query_params.get('school')
        data = request.data
        groups = data.get('groups')
        teachers = data.get('teachers')

        if school_id:
            self.queryset = self.queryset.filter(
                Q(student__group__profession__department__isnull=False, student__group__profession__department__sub_orgs=school_id) |
                Q(student__group__profession__department__isnull=True, student__group__profession__school=school_id)
            )

        lesson = self.request.query_params.get('lesson')

        if lesson:
            self.queryset = self.queryset.filter(score_type__lesson_teacher__lesson=lesson)

        if teachers:
            self.queryset = self.queryset.filter(score_type__lesson_teacher__teacher__in=teachers)

        if groups:
            self.queryset = self.queryset.filter(student__group__in=groups)

        is_fall = self.request.query_params.get('isFall')

        if is_fall == 'true':
            self.queryset = self.queryset.filter(score_type__score_type=Lesson_teacher_scoretype.SHALGALT_ONOO, score__lt=18)
        elif is_fall == 'false':
            self.queryset = self.queryset.filter(score_type__score_type=Lesson_teacher_scoretype.SHALGALT_ONOO, score__gte=18)

        # to select fields to display
        self.queryset = self.queryset.annotate(
            student_code=F('student__code'),
            group_name=F('student__group__name'),
        )

        sorting = self.request.query_params.get('sorting')

        if sorting:
            if not isinstance(sorting, str):
                sorting = str(sorting)

            self.queryset = self.queryset.order_by(sorting)

        all_list = self.list(request).data

        return request.send_data(all_list)


@permission_classes([IsAuthenticated])
class TeacherScoreReportSchoolAPIView(
    generics.GenericAPIView
):
    """ Явцын дүн тайлан """

    @has_permission(must_permissions=['lms-score-read'])
    def get(self, request):
        lesson_year, lesson_season = get_active_year_season()

        queryset = TeacherScore.objects.filter(
            lesson_year=lesson_year,
            lesson_season=lesson_season,

            score_type__score_type=Lesson_teacher_scoretype.SHALGALT_ONOO,
            score_type__lesson_teacher__lesson__in=Subquery(
                Lesson_to_teacher.objects.filter(
                    lesson=OuterRef('score_type__lesson_teacher__lesson')
                )[:1].values_list('lesson',flat=True)
            ),

            student__in=ChallengeStudents.objects.filter(
                challenge__lesson_year=lesson_year,
                challenge__lesson_season=lesson_season,
                challenge__challenge_type=Challenge.SEMESTR_EXAM,
                # challenge__is_repeat=True # i am not sure is this required here or not
            ).values_list('student',flat=True)
        )[:100].values('student__school').annotate(
            student_count=Count('*')
        ).values(school=F('student__school__name'),student_count=F('student_count'))

        response = list(queryset)

        return request.send_data(response)


@permission_classes([IsAuthenticated])
class TeacherLessonScorePrintAPIView(
    generics.GenericAPIView,
    mixins.ListModelMixin
):
    queryset = TeacherScore.objects
    serializer_class = TeacherScoreListPrintSerializer

    # to pass extra complex data to serializer, because annotate() does not support complex data like list, dict, etc
    # and because it call sql query only 1 time instead of serializer way that calls sql query on every row. Therefore database will be slowed down very hard if for example calling queryset.filter() (and any other similar calls) is made inside serializer
    def get_serializer_context(self):
        context = super().get_serializer_context()
        exam = self.request.query_params.get('exam')
        exam_committee = []
        exam_time_table_qs = ExamTimeTable.objects.filter(pk=exam).prefetch_related('teacher')
        last_exam_time_table = exam_time_table_qs.first()

        if last_exam_time_table:
            exam_committee_teachers = last_exam_time_table.teacher.all()

            if exam_committee_teachers:
                for exam_committee_teacher in exam_committee_teachers:
                    exam_committee.append(
                        {
                            'teacher_org_position': Employee.objects.filter(user=exam_committee_teacher.user.id).values_list('org_position__name', flat=True).first(),
                            'teacher_name': exam_committee_teacher.full_name,
                            'teacher_score_updated_at': last_exam_time_table.updated_at.strftime('%Y-%m-%d %H:%M:%S') if last_exam_time_table.updated_at else None
                        }
                    )

        context['exam_committee'] = exam_committee

        return context

    def put(self, request):
        exam = request.query_params.get('exam')
        lesson_year, lesson_season = get_active_year_season()
        group_id = request.data

        # Тухайн шалгалтын хуваариас хичээлийг авах
        exam_obj = ExamTimeTable.objects.get(pk=exam)
        exam_groups = Exam_to_group.objects.filter(exam=exam)
        if group_id:
            exam_groups = exam_groups.filter(group=group_id)

        group_ids = exam_groups.values_list('group', flat=True)

        self.queryset = self.queryset.filter(score_type__lesson_teacher__lesson=exam_obj.lesson, lesson_year=lesson_year, lesson_season=lesson_season)
        if len(group_ids) > 0:
            self.queryset = self.queryset.filter(student__group__in=group_ids)
        else:
            self.queryset = self.queryset.filter(score__gt=0)

        # Дүн гаргасан багшийн мэдээлэл
        teacher_id = self.queryset.values_list('score_type__lesson_teacher__teacher', flat=True).first()
        if not teacher_id:
            return request.send_error('ERR_002', 'Тухайн анги бүлэгт багшийн дүн шивэгдээгүй байна.')

        teacher = Teachers.objects.filter(id=teacher_id).first()

        student_ids = self.queryset.values_list('id', flat=True).distinct('student')
        self.queryset = self.queryset.filter(score_type__lesson_teacher__lesson=exam_obj.lesson, lesson_year=lesson_year, lesson_season=lesson_season, id__in=student_ids)

        lesson_kredit = LessonStandart.objects.filter(id=exam_obj.lesson.id).values_list('kredit', flat=True).first()

        teacher_org_position = Employee.objects.filter(user=teacher.user).values_list('org_position__name', flat=True).first()
        teacher_score_updated_at = self.queryset.values_list('updated_at', flat=True).order_by('updated_at').last()

        self.queryset = self.queryset.annotate(
            lesson_kredit=Value(lesson_kredit, output_field=FloatField()),
            teacher_name=Value(teacher.full_name, output_field=CharField()),
            teacher_org_position=Value(teacher_org_position, output_field=CharField()),
            teacher_score_updated_at=Value(teacher_score_updated_at, output_field=DateTimeField()),
        )

        all_list = self.list(request).data

        return request.send_data(all_list)


class ScoreOldV2APIView(
    generics.GenericAPIView
):
    """ Оюутан бүрийн хуучин дүн оруулах """

    def post(self, request):

        data = request.data.dict()  # Ирж байгаа датаг dict болгоно
        not_found_lesson = []  # Олдоогүй хичээлүүдийг хадгалах list
        not_found_student = []  # Олдоогүй оюутнуудыг хадгалана
        all_create_datas = []  # create хийсан датануудыг хадгалах list

        file = data.get('file')  # front-оос ирсэн файлыг авна
        group_id = data.get('group_id')  # тухайн ангийн id-г авна

        file_name = file.name  # файлын нэр
        path = save_file(file, 'score_sheet', 1)  # Түр хугацаанд файлыг folder дотор хадгалж ашиглана
        full_path = os.path.join(settings.MEDIA_ROOT, str(path))  # Хадгалсан файлын замыг авна

        reader = openpyxl_dictreader.DictReader(full_path)  # Dict reader ашиглан файлыг уншина (файлын замыг ашиглан)

        group_obj = Group.objects.get(id=group_id)  # Group моделийн датаг group_id-аа ашиглан филтер хийж олж авна
        student_group_year = group_obj.join_year  # Тухайн ангийн элссэн жил
        student_profession = group_obj.profession  # Тухайн ангийн мэргэжилүүд

        # Тухайн мэргэжилтэй холбоотой хичээлүүдийг авсан тэгэхдээ тус хичээлүүдийн зөвхөн id, code, name-ийг авч level болон нэрээр нь жагсаана
        lessons = list(LearningPlan.objects.filter(profession=student_profession)
                       .values('lesson__id', 'lesson__code', 'lesson__name')
                       .order_by('lesson_level', 'lesson__name'))

        # файл доторх мөр бүрээр нь давталд гүйлгэнэ
        for row in reader:

            # Тухайн нэг мөр датанаас
            student_code = row.get('Оюутны код')  # Оюутны код
            student_last_name = row.get('Эцэг/эхийн нэр')  # Эцэг/эхийн нэр
            student_first_name = row.get('Нэр')  # Нэр
            register = row.get('Регистр')  # Регистр гэсэн нэртэй багануудын датаг хадгална
            birth_date, gender = calculate_birthday(register)  # Оюутны регистрын дугаарыг ашиглан төрсөн өдөр болон хүйсийг олж авсан

            if not student_code or not student_last_name or not student_first_name:
                continue  # Шаардлагатай өгөгдлүүдийн аль нэг нь дутуу байвал алгасна

            # Оюутан гэсэн модел дотроос нэр болон кодын ашиглан тухайн оюутныг олно
            student = Student.objects.filter(Q(code=student_code) & Q(first_name=student_first_name, last_name=student_last_name)).first()

            # Хэрвээ оюутан олдохгүй бол
            if student is None:
                # Шинээр тэр оюутыг нэмж өгнө бас тэр ангид нь хуваальлана
                student = Student.objects.create(
                    code=student_code,
                    first_name=student_first_name,
                    last_name=student_last_name,
                    register_num=register,
                    gender=gender,
                    birth_date=birth_date,
                    group_id=group_id,
                    status_id=1,
                    department=group_obj.department,
                    school=group_obj.school,
                    citizenship=Country.objects.get(code='496')
                )
            else:
                # Хэрвээ тэр оюутан нь олдвол тэр оюутан тэр ангидаа байна уу гэдгийг шалгана
                student_exists_in_group = Student.objects.filter(group=group_id, id=student.id).exists()
                # Оюутан тэр ангидаа байхгүй бол тэр оюутныг тэр ангид нь оруулна
                if not student_exists_in_group:
                    Student.objects.filter(id=student.id).update(group=group_id)

            if not student:
                # Хэрвээ файл доторх оюутны мэдээлэл алдаатай байгаад тэр оюутан олдохгүй үед оюутан олдсонгүй гэсэн list дотор нэмнэ
                not_found_student.append({
                    'student_code': student_code,
                    'student_name': f"{student_last_name} {student_first_name}"
                })
                continue

            # Тухайн ангийн элссэн жилийг эхлэсэн болон төгссөнөөр нь хуваана
            splitted_list = student_group_year.split('-')
            start_year, end_year = int(splitted_list[0]), int(splitted_list[1])

            for lesson in lessons:
                # Хэрвээ тус мэргэжилтэй холбоотой хичээлүүд файл доторх хичээлийн кодтой тохирсон үед файл доторх хичээлийн оноог авна
                score = row.get('{}'.format(lesson.get("lesson__code")))
                if not score:
                    score = row.get(' {}'.format(lesson.get("lesson__code")))

                if not score:
                    score = row.get('{} '.format(lesson.get("lesson__code")))

                if score:
                    check_score = str(score)
                    if  check_score.isalpha() or check_score.isspace() or not check_score.isnumeric():
                        continue

                if score is None and score != 0 :
                    # Хэрвээ хичээлийн оноо олдоогүй үед бас тэр оноо нь 0-ээс ялгаатай үед хичээл олдсонгүй гэсэн list-д нэмнэ
                    not_found_lesson.append({
                        'student_code': student_code,
                        'lesson_code': lesson.get('lesson__code'),
                        'lesson_name': lesson.get('lesson__name'),
                        'exam_score': score
                    })
                    continue

                # Lesson obj-ийг lesson_id ашиглан филтер хийж авна
                lesson_obj = LessonStandart.objects.get(id=lesson.get('lesson__id'))
                # Оюутны мэргэжил болон хичээлийн id-г ашиглан сургалтын төлөвлөгөөний мэдээллийг авна
                learningplan = LearningPlan.objects.filter(profession=student_profession, lesson=lesson_obj.id).first()

                # Сургалтын төлөвлөгөөнөөс үзэх улирлуудыг листээр авах
                learningplan_season = json_load(learningplan.season) if learningplan else []

                if learningplan_season:
                    learningplan_season = learningplan_season[0]  # Эхний улирлаал аваад байх шиг байна
                    # learning plan-ий улиралд үндэслээд жил, улирлыг авсан
                    year_count = (int(learningplan_season) + 1) // 2 if int(learningplan_season) % 2 != 0 else int(learningplan_season) // 2
                    cyear_count = year_count - 1
                    season = Season.objects.filter(season_name='Намар' if int(learningplan_season) % 2 != 0 else 'Хавар').first().id

                    score_start_year = str(start_year + cyear_count)  # Эхний улирлын жил
                    score_end_year = str(end_year + cyear_count)  # Сүүлийн улирлын жил
                    lesson_year = f"{score_start_year}-{score_end_year}"  # 2 жилээ нэгтгэсэн
                else:
                    continue

                score = float(score) if isinstance(score, str) else score  # score string байвал float болгоно
                score = round(score, 2)  # цэгээс хойших эхний 2 оронгоор зааглан авна
                assessment = Score.objects.filter(score_max__gte=score, score_min__lte=score).first()  # score-ийг ашиглан түүнд тохирох үнэлгээг авна

                # create хийх болох датануудаа all_create_datas list дотор нэмж өгнө
                all_create_datas.append({
                    'student_id': student.id,
                    'student_code': student.code,
                    'lesson_id': lesson_obj.id,
                    'lesson_name': lesson_obj.name,
                    'lesson_code': lesson_obj.code,
                    'exam_score': score,
                    'assessment_id': assessment.id if assessment else None,
                    'status': ScoreRegister.START_SYSTEM_SCORE,
                    'school_id': student.school.id if student.school else None,
                    'lesson_year': lesson_year,
                    'lesson_season_id': season
                })

        remove_folder(path)  # Процесс явагдаж дууссны дараа түр зуур хадгалсан filе-аа устгана

        # front-руу буцаах датанууд
        return_datas = {
            'create_datas': all_create_datas,
            'not_found_lesson': not_found_lesson,
            'not_found_student': not_found_student,
            'all_error_datas': not_found_lesson + not_found_student,
            'file_name': file_name
        }

        return request.send_data(return_datas)

@permission_classes([IsAuthenticated])
class ScoreRefreshAPIView(
    generics.GenericAPIView
):
    """ Дүнгийн бүртгэл """

    queryset = ScoreRegister.objects.all()

    def get(self, request, group=None):
        all_student = self.queryset.filter(student__group=group)

        with transaction.atomic():
            try:
                for student_score in all_student:
                    score_total = student_score.score_total
                    score = round(score_total, 2)
                    assessment = Score.objects.filter(score_max__gte=score,score_min__lte=score).first()
                    student_score.assessment = assessment
                    student_score.save()
            except Exception as e:
                print(e)
                return request.send_error('ERR_002', 'Үнэлгээ шинэчлэхэд алдаа гарлаа дахин оролдоно уу')

        return request.send_info('INF_002', 'Амжилттай шинэчлэлээ')


@permission_classes([IsAuthenticated])
class ScoreRegisterLessonAPIView(
    generics.GenericAPIView
):
    """ Тухайн хичээлийн тухайн жил улирлын дүнтэй оюутныг авах """

    queryset = Student.objects.all()
    def get(self, request, lesson=None):
        all_students_teach_scores = []
        lesson_year, lesson_season = get_active_year_season()
        lesson_teacher_ids = Lesson_to_teacher.objects.filter(lesson=lesson).values_list('id', flat=True)
        exam = request.query_params.get('exam')
        is_repeat = request.query_params.get('is_repeat')
        if is_repeat == 'true':
            teacher_score_students = Exam_to_student.objects.filter(exam=exam).values('student', 'student__code', 'student__first_name', 'student__last_name', 'student__register_num', 'student__group__name').distinct('student')
            for student in teacher_score_students:
                obj = {}
                obj['id'] = student.get('student')
                obj['first_name'] = student.get('student__first_name')
                obj['last_name'] = student.get('student__last_name')
                obj['register_num'] = student.get('student__register_num')
                obj['code'] = student.get('student__code')
                obj['group_name'] = student.get('student__group__name')
                obj['total_score'] = 0
                obj['is_fail'] = False

                all_students_teach_scores.append(obj)
        else:
            group_ids = Exam_to_group.objects.filter(exam=exam).values_list('group', flat=True)

            # Багшийн дүнгийн задаргааны төрлүүд
            score_type_ids = Lesson_teacher_scoretype.objects.filter(lesson_teacher__in=lesson_teacher_ids).values_list('id', flat=True)

            # Багшийн дүнгийн төрөл бүрт оюутанд өгсөн оноо
            teach_score_qs = TeacherScore.objects.filter(lesson_year=lesson_year, lesson_season=lesson_season, score_type_id__in=score_type_ids, student__group__in=group_ids)

            # Дүнтэй оюутнууд
            teacher_score_students = teach_score_qs.values('student', 'student__code', 'student__first_name', 'student__last_name', 'student__register_num', 'student__group__name').distinct('student')

            # Оюутны дүн нэгтэх
            for student in teacher_score_students:
                obj = {}
                scores = teach_score_qs.filter(student=student.get('student')).values_list('score', flat=True)
                total_score = sum(scores) if scores else 0
                obj['id'] = student.get('student')
                obj['first_name'] = student.get('student__first_name')
                obj['last_name'] = student.get('student__last_name')
                obj['register_num'] = student.get('student__register_num')
                obj['code'] = student.get('student__code')
                obj['group_name'] = student.get('student__group__name')
                obj['total_score'] = total_score
                obj['is_fail'] = False
                if total_score < 42:
                    obj['is_fail'] = True

                all_students_teach_scores.append(obj)

        sorted_scores = sorted(all_students_teach_scores, key=lambda x: x['total_score'], reverse=True)
        return request.send_data(sorted_scores)

@permission_classes([IsAuthenticated])
class ReExamTeacherLessonScorePrintAPIView(
    generics.GenericAPIView,
    mixins.ListModelMixin
):
    queryset = TeacherScore.objects
    serializer_class = TeacherScoreListPrintSerializer

    # to pass extra complex data to serializer, because annotate() does not support complex data like list, dict, etc
    # and because it call sql query only 1 time instead of serializer way that calls sql query on every row. Therefore database will be slowed down very hard if for example calling queryset.filter() (and any other similar calls) is made inside serializer
    def get_serializer_context(self):
        context = super().get_serializer_context()
        exam = self.request.query_params.get('exam')
        exam_committee = []
        exam_time_table_qs = Exam_repeat.objects.filter(pk=exam).prefetch_related('teacher')
        last_exam_time_table = exam_time_table_qs.first()

        if last_exam_time_table:
            exam_committee_teachers = last_exam_time_table.teacher.all()

            if exam_committee_teachers:
                for exam_committee_teacher in exam_committee_teachers:
                    exam_committee.append(
                        {
                            'teacher_org_position': Employee.objects.filter(user=exam_committee_teacher.user.id).values_list('org_position__name', flat=True).first(),
                            'teacher_name': exam_committee_teacher.full_name,
                            'teacher_score_updated_at': last_exam_time_table.updated_at.strftime('%Y-%m-%d %H:%M:%S') if last_exam_time_table.updated_at else None
                        }
                    )

        context['exam_committee'] = exam_committee

        return context

    def put(self, request):
        exam = request.query_params.get('exam')
        lesson_year, lesson_season = get_active_year_season()
        student_ids = request.data

        # Тухайн дахин шалгалтын хуваариас хичээлийг авах
        exam_obj = Exam_repeat.objects.get(pk=exam)
        exam_students = Exam_to_student.objects.filter(exam=exam)
        if student_ids:
            exam_students = exam_students.filter(student_id__in=student_ids)

        student_ids = exam_students.values_list('student', flat=True)

        self.queryset = self.queryset.filter(score_type__lesson_teacher__lesson=exam_obj.lesson, lesson_year=lesson_year, lesson_season=lesson_season)
        if len(student_ids) > 0:
            self.queryset = self.queryset.filter(student__in=student_ids)
        else:
            self.queryset = self.queryset.filter(score__gt=0)

        # Дүн гаргасан багшийн мэдээлэл
        teacher_id = self.queryset.values_list('score_type__lesson_teacher__teacher', flat=True).first()
        if not teacher_id:
            return request.send_error('ERR_002', 'Тухайн анги бүлэгт багшийн дүн шивэгдээгүй байна.')

        teacher = Teachers.objects.filter(id=teacher_id).first()

        student_ids = self.queryset.values_list('id', flat=True).distinct('student')
        self.queryset = self.queryset.filter(score_type__lesson_teacher__lesson=exam_obj.lesson, lesson_year=lesson_year, lesson_season=lesson_season, id__in=student_ids)

        lesson_kredit = LessonStandart.objects.filter(id=exam_obj.lesson.id).values_list('kredit', flat=True).first()

        teacher_org_position = Employee.objects.filter(user=teacher.user).values_list('org_position__name', flat=True).first()
        teacher_score_updated_at = self.queryset.values_list('updated_at', flat=True).order_by('updated_at').last()

        self.queryset = self.queryset.annotate(
            lesson_kredit=Value(lesson_kredit, output_field=FloatField()),
            teacher_name=Value(teacher.full_name, output_field=CharField()),
            teacher_org_position=Value(teacher_org_position, output_field=CharField()),
            teacher_score_updated_at=Value(teacher_score_updated_at, output_field=DateTimeField()),
        )

        all_list = self.list(request).data
        print(all_list)

        return request.send_data(all_list)