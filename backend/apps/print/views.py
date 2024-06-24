from datetime import datetime
from dateutil import parser
from django.db import transaction
from django.db.models import F, Subquery, OuterRef, Count
from django.db.models.functions import Substr

from lms.models import Student, TimeTable_to_group, TimeTable_to_student
from lms.models import TimeTable
from lms.models import GraduationWork
from lms.models import ScoreRegister
from lms.models import LessonStandart, Season
from lms.models import Group, Score, ProfessionDefinition, CalculatedGpaOfDiploma
from lms.models import ProfessionAverageScore, AdmissionIndicator

from elselt.models import AdmissionUserProfession, UserInfo
from elselt.serializer import AdmissionUserInfoSerializer

from rest_framework import mixins
from rest_framework import generics
from rest_framework.filters import SearchFilter
from rest_framework.permissions import IsAuthenticated

from main.utils.function.pagination import CustomPagination

from rest_framework.permissions import IsAuthenticated
from student.serializers import StudentListSerializer
from apps.timetable.serializers import TimeTableListSerializer, TimeTableSerializer
from apps.timetable.serializers import ScoreGpaListSerializer

from .serializers import ScoreRegisterSerializer
from .serializers import GraduationWorkListSerializer
from .serializers import ProfessionAverageScoreSerializer
from .serializers import GroupListFilterSubSchoolSerializer

from main.utils.function.utils import get_lesson_choice_student, student__full_name, score_register__score_total, lesson_standart__code_name
from main.utils.function.utils import str2bool, has_permission
from rest_framework.decorators import permission_classes

class StudentListByLessonTeacherAPIView(
    mixins.ListModelMixin,
    generics.GenericAPIView,
):

    queryset = Student.objects.all()
    serializer_class = StudentListSerializer
    filter_backends = [SearchFilter]
    search_fields = ['code' , 'first_name' , 'last_name']

    def get(self, request, pk=None):
        lesson = self.request.query_params.get('lesson')
        teacher = self.request.query_params.get('teacher')
        lesson_year = self.request.query_params.get('lesson_year')
        lesson_season = self.request.query_params.get('lesson_season')
        school = self.request.query_params.get('school')
        group = self.request.query_params.get('group')
        all_student = get_lesson_choice_student(lesson=lesson, teacher=teacher, lesson_year=lesson_year, lesson_season=lesson_season, school=school,group=group)
        self.queryset = self.queryset.filter(id__in=all_student)
        all_list = self.list(request).data

        return request.send_data(all_list)

# Хичээл Хуваарь харуулах
class ScheduleAPIView(
    mixins.ListModelMixin,
    generics.GenericAPIView,
):

    queryset = TimeTable.objects.all()
    serializer_class = TimeTableSerializer
    filter_backends = [SearchFilter]
    pagination_class = CustomPagination
    search_fields = ['room__code', 'room__name', 'lesson__name', 'teacher__first_name', 'teacher__last_name']
    def get_queryset(self):
        queryset = self.queryset
        lesson_year = self.request.query_params.get('lesson_year')
        school = self.request.query_params.get('school')
        lesson_season = self.request.query_params.get('lesson_season')
        room = self.request.query_params.get('room')
        student = self.request.query_params.get('student')
        group = self.request.query_params.get('group')
        teacher = self.request.query_params.get('teacher')
        lesson = self.request.query_params.get('lesson')

        # Сургуулиар хайлт хийх
        if school:
            queryset = queryset.filter(school = school)

        # Хичээлийн улиралаар хайлт хийх
        if lesson_season:
            queryset = queryset.filter(lesson_season = lesson_season )

        # Хичээлийн жилээр хайлт хийх
        if lesson_year:
            queryset = queryset.filter(lesson_year = lesson_year )

        # Багшаар хайлт хийх хэсэг
        if teacher:
            queryset = queryset.filter(teacher=teacher)

        # Өрөөгөөр хайлт хийх хэсэг
        if room:
            queryset = queryset.filter(room=room)

        # Хичээлээр хайлт хийх хэсэг
        if lesson:
            queryset = queryset.filter(lesson=lesson)

        # Оюутнаар хайлт хийх хэсэг
        if student:
            student_group = Student.objects.filter(id=student).values_list('group', flat=True).distinct()
            timetables_to_group = TimeTable_to_group.objects.filter(group__in=student_group)
            timetable_ids1 = timetables_to_group.values_list('timetable', flat=True)

            timetables = TimeTable_to_student.objects.filter(student=student, add_flag=True)
            timetable_ids2 = timetables.values_list('timetable', flat=True)

            timetable_ids = timetable_ids1.union(timetable_ids2)

            queryset = queryset.filter(id__in=timetable_ids)

        # Ангиар хайлт хийх хэсэг
        if group:
            timetables_to_group = TimeTable_to_group.objects.filter(group=group)
            timetable_ids = timetables_to_group.values_list('timetable', flat=True).distinct()
            queryset = queryset.filter(id__in=timetable_ids)

        return queryset

    def get(self, request):
        self.serializer_class = TimeTableListSerializer
        all_schedule = self.list(request).data

        return request.send_data(all_schedule)


@permission_classes([IsAuthenticated])
class GpaAPIView(
    mixins.ListModelMixin,
    generics.GenericAPIView,
):
    ''' Голч дүн '''

    queryset = Student.objects.all()
    serializer_class = ScoreGpaListSerializer

    pagination_class = CustomPagination

    filter_backends = [SearchFilter]
    search_fields = ['code', 'last_name', 'first_name']

    def get_queryset(self):
        queryset = self.queryset
        group = self.request.query_params.get('group')
        degree = self.request.query_params.get('degree')
        schoolId = self.request.query_params.get('school')
        sorting = self.request.query_params.get('sorting')
        department = self.request.query_params.get('department')
        profession = self.request.query_params.get('profession')
        status = self.request.query_params.get('status')

        # Сургуулиар хайлт хийх
        if schoolId:
            queryset = queryset.filter(school=schoolId)

        # Тэнхимээр хайх
        if department:
            queryset = queryset.filter(department=department)

        # Ангиар хайх
        if group:
            queryset = queryset.filter(group=group)

        # Боловсролын зэргээр хайлт хийх
        if degree:
            queryset = queryset.filter(group__degree=degree)

        # Мэргэжлээр хайх
        if profession:
            queryset = queryset.filter(group__profession=profession)

        if sorting:
            if not isinstance(sorting, str):
                sorting = str(sorting)

            queryset = queryset.order_by(sorting)

        return queryset

    def get(self, request):

        student_ids = []
        stud_qs = self.queryset.values()

        lesson_year = request.query_params.get('lesson_year')
        lesson_season = request.query_params.get('lesson_season')

        score_qs = ScoreRegister.objects
        if lesson_year:
            score_qs = score_qs.filter(lesson_year=lesson_year)

        if lesson_season:
            score_qs = score_qs.filter(lesson_season=lesson_season)

        if stud_qs:
            for qs in stud_qs:
                student_id = qs.get('id')

                score_list = score_qs.filter(student=student_id)

                if not score_list:
                    student_ids.append(student_id)

        if student_ids:
            self.queryset = self.queryset.exclude(id__in=student_ids)

        all_data = self.list(request).data

        return request.send_data(all_data)


@permission_classes([IsAuthenticated])
class GroupListAPIView(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    generics.GenericAPIView,
):
    """ Дүнгийн жагсаалт"""

    queryset = ScoreRegister.objects.all().order_by('student__first_name')
    serializer_class = ScoreRegisterSerializer
    pagination_class = CustomPagination

    filter_backends = [SearchFilter]
    search_fields = ['student__code', 'student__first_name','lesson__name', 'exam_score', 'teach_score']

    def get_queryset(self):
        queryset = self.queryset

        lesson_season = self.request.query_params.get('lesson_season')
        lesson_year = self.request.query_params.get('lesson_year')
        lesson = self.request.query_params.get('lesson')

        department = self.request.query_params.get('department')
        group = self.request.query_params.get('group')
        sorting = self.request.query_params.get('sorting')

        is_season = self.request.query_params.get('is_season')
        school = self.request.query_params.get('school')

        if school:
            queryset = queryset.filter(school=school)

        # улиралаар хайлт хийнэ
        if str2bool(is_season):
            if lesson_season:
                queryset = queryset.filter(lesson_season=lesson_season)

            if lesson_year:
                queryset = queryset.filter(lesson_year=lesson_year)

        # тэнхимээр хайх
        if department:
            queryset = queryset.filter(student__department=department)

        # ангиар хайх
        if group:
            queryset = queryset.filter(student__group=group)

        # хичээлээр хайх
        if lesson:
            queryset = queryset.filter(lesson=lesson)

        if sorting:
            if not isinstance(sorting, str):
                sorting = str(sorting)

            queryset = queryset.order_by(sorting)

        return queryset

    @has_permission(must_permissions=['lms-print-score-read'])
    def get(self, request):

        all_list = self.list(request).data
        return request.send_data(all_list)
    
@permission_classes([IsAuthenticated])
class GroupListNoLimitAPIView(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    generics.GenericAPIView,
):
    """Ангийн дүнгийн жагсаалт"""

    queryset = ScoreRegister.objects.all().select_related("student", "student__group", "lesson", "lesson_season", "assessment").values("student__last_name", "student__first_name", "student__code", "student__id", "lesson__kredit", "lesson_year", "lesson_season", "lesson_season__season_name", "teach_score", "exam_score", "lesson__code", "lesson__name", "assessment__assesment")

    @has_permission(must_permissions=['lms-print-score-read'])
    def get(self, request):

        group = request.query_params.get('group') # 45
        qs = self.queryset
        lesson_qs = LessonStandart.objects.all().values("id", "code", "name", "kredit")
        score_qs = qs.filter(student__group=group, is_delete=False).distinct('student')
        group_lessons = qs.filter(student__group=group, is_delete=False).distinct('lesson').values_list('lesson', flat=True)
        all_data = []
        result_datas = []
        grade_lesson_list = []
        kredits = {}
        seasons = {}
        grade_dict = {}
        lesson_totals = {lesson: {"total_score": 0, "student_count": 0} for lesson in group_lessons}
        id = 0

        # Хичээлүүдийн үнэлгээний нийлбэрийг хадгалах dict-н хүснэгт бэлдэх нь
        while id < len(group_lessons):
            grade_dict = {
                "A": 0,
                "B": 0,
                "C": 0,
                "D": 0,
                "F": 0
            }
            grade_lesson_list.append(grade_dict)
            id += 1

        # Сурагчаар гүйлгэх нь
        for group_list in score_qs:
            # Сурагчдын бүтэн нэрийг авах хэсэг
            full_name = student__full_name(group_list["student__last_name"], group_list["student__first_name"])
            code_name = group_list["student__code"] + '-' + full_name

            # Хэрэгтэй хувьсагчдыг зарлах хэсэг
            lessons = {}
            total_kr = 0
            total_score = 0
            total_gpa = 0
            id = 0
            lesson_standart = None
            grade_dict = {
                "A": 0,
                "B": 0,
                "C": 0,
                "D": 0,
                "F": 0
            }

            # Үзсэн хичээлийг тоолох
            lesson_count = 0
            # Хичээлээр гүйлгэх нь
            for lesson in group_lessons:
                # Сурагчын id болон хичээлээр хайх хэсэг
                score = qs.filter(student=group_list["student__id"], lesson=lesson).first()

                # score байхгүй үед
                if not score:

                    # Хичээлийн жилийг авах хэсэг
                    lesson_year = ""

                    # Хичээлийн улиралыг авах хэсэг
                    lesson_season = ""
                    lesson_standart = lesson_qs.filter(id=lesson).first()
                    lesson_standart_name = lesson_standart__code_name(lesson_standart["code"], lesson_standart["name"]) if lesson_standart else None

                    if not lesson_standart:
                        continue

                    # Хичээлийн кредит авах хэсэг
                    kredit = lesson_standart["kredit"]

                    # Хичээлийн нэр авах хэсэг
                    lesson_name = lesson_standart_name

                    # Хичээлийн дүн авах хэсэг
                    total = 0

                else:
                    lesson_count = lesson_count + 1
                    # Хичээлийн жилийг авах хэсэг
                    if score["lesson_year"]:
                        lesson_year = score["lesson_year"]
                    else:
                        lesson_year = ""

                    # Хичээлийн улиралыг авах хэсэг
                    if score["lesson_season"]:
                        lesson_season = score["lesson_season__season_name"]
                    else:
                        lesson_season = ""

                    # Хичээлийн кредит авах хэсэг
                    kredit = score["lesson__kredit"]

                    # Хичээлийн нэр авах хэсэг
                    lesson_name = lesson_standart__code_name(score["lesson__code"], score["lesson__name"])

                    # Хичээлийн дүн авах хэсэг
                    total = score_register__score_total(score["teach_score"], score["exam_score"])

                    # Сурагчын хичээлүүдийн үнэлгээний нийлбэр дүнг бодох хэсэг
                    if score["assessment__assesment"]:
                        if score["assessment__assesment"] == "A":
                            grade_dict["A"] += 1
                            grade_lesson_list[id]["A"] += 1

                        elif score["assessment__assesment"] == "B":
                            grade_dict["B"] += 1
                            grade_lesson_list[id]["B"] += 1

                        elif score["assessment__assesment"] == "C":
                            grade_dict["C"] += 1
                            grade_lesson_list[id]["C"] += 1

                        elif score["assessment__assesment"] == "D":
                            grade_dict["D"] += 1
                            grade_lesson_list[id]["D"] += 1

                        elif score["assessment__assesment"] == "F":
                            grade_dict["F"] += 1
                            grade_lesson_list[id]["F"] += 1

                # Дүнг gpa-руу хөрвүүлэх
                score_qs = Score.objects.filter(score_max__gte=total, score_min__lte=total).first()
                if score_qs:
                    gpa = score_qs.gpa

                # Нийлбэр gpa
                total_gpa = total_gpa + gpa

                # Нийлбэр оноо
                total_score = total_score + total

                # Нийлбэр кредит
                total_kr = total_kr + kredit

                # Хичээлийн нэрний дагуу дүнг оруулах хэсэг
                lessons[lesson_name] = total

                # Хичээлийн жил болон улирлыг нэгтгэх хэсэг
                lesson_year_season = lesson_year + '-' + lesson_season
                kredits[lesson_name] = kredit
                seasons[lesson_name] = lesson_year_season

                # Add score to lesson totals
                if isinstance(total, (int, float)):
                    lesson_totals[lesson]["total_score"] += total
                    lesson_totals[lesson]["student_count"] += 1

                id += 1

            # Дундаж дүн болон голч
            avg_score = round(total_score / lesson_count, 2)
            avg_gpa = round(total_gpa / lesson_count, 2)


            # Сурагчын бодогдсон мэдээллийг үндсэн хүснэгт рүү нэгтгэх хэсэг
            all_data.append(
                {
                    'Овог/нэр': code_name,
                    **lessons,
                    'A': grade_dict['A'],
                    'B': grade_dict['B'],
                    'C': grade_dict['C'],
                    'D': grade_dict['D'],
                    'F': grade_dict['F'],
                    "үзсэн кредит": total_kr,
                    "нийт хичээлийн тоо": lesson_count,
                    "голч дүн": avg_score,
                    "gpa": avg_gpa
                }
            )
        id = 0

        # Хичээл болгоны үнэлгээний нийлбэрийг мөр дата хэлбэрээр үндсэн хүснэгт рүү оруулах хэсэг
        for key in grade_dict:
            id = 0

            for lesson in group_lessons:
                # Хичээлийн нэрийг хайж авах хэсэг
                lesson_standart = lesson_qs.filter(id=lesson).first()
                lesson_standart_name = lesson_standart__code_name(lesson_standart["code"], lesson_standart["name"]) if lesson_standart else ""
                lessons[lesson_standart_name] = grade_lesson_list[id][key]

                id += 1

            all_data.append(
                {
                    'Овог/нэр': key,
                    **lessons,
                    'A': '',
                    'B': '',
                    'C': '',
                    'D': '',
                    'F': '',
                }
            )

        lesson_avg_scores = {}
        total_students = {}
        for lesson in group_lessons:
            lesson_standart = lesson_qs.filter(id=lesson).first()
            lesson_standart_name = lesson_standart__code_name(lesson_standart["code"], lesson_standart["name"]) if lesson_standart else ""
            total_score = lesson_totals[lesson]["total_score"]
            student_count = lesson_totals[lesson]["student_count"]
            average_score = round(total_score / student_count, 2) if student_count > 0 else '-'
            lesson_avg_scores[lesson_standart_name] = average_score
            total_students[lesson_standart_name] = student_count

        all_data.append(
            {
                'Овог/нэр': 'Дундаж оноо',
                **lesson_avg_scores,
                'A': '',
                'B': '',
                'C': '',
                'D': '',
                'F': '',
            }
        )

        all_data.append(
            {
                'Овог/нэр': 'Нийт оюутан оноо',
                **total_students,
                'A': '',
                'B': '',
                'C': '',
                'D': '',
                'F': '',
            }
        )
        merged_datas = result_datas + all_data

        return request.send_data(merged_datas)



@permission_classes([IsAuthenticated])
class LessonListAPIView(
    mixins.ListModelMixin,
    generics.GenericAPIView,
):
    """ Хичээлийн жагсаалт """

    queryset = ScoreRegister.objects.all().order_by('student__first_name')
    serializer_class = ScoreRegisterSerializer
    pagination_class = CustomPagination

    filter_backends = [SearchFilter]
    search_fields = ['student__code', 'student__first_name','lesson__name', 'exam_score', 'teach_score']

    def get_queryset(self):
        queryset = self.queryset
        lesson = self.request.query_params.get('lesson')
        select_season = self.request.query_params.get('select_season')
        select_year = self.request.query_params.get('select_year')
        group = self.request.query_params.get('group')
        sorting = self.request.query_params.get('sorting')

        # хичээлээр хайлт хийнэ
        if lesson:
            queryset = queryset.filter(lesson=lesson)

        # Сонгогдсон хичээлийн жил улирлаар хайх
        if select_season:
            queryset = queryset.filter(lesson_season=select_season)
        if select_year:
            queryset = queryset.filter(lesson_year=select_year)


        # ангиар хайлт хийнэ
        if group:
            queryset = queryset.filter(student__group=group)

        if sorting:
            if not isinstance(sorting, str):
                sorting = str(sorting)

            queryset = queryset.order_by(sorting)
        return queryset

    @has_permission(must_permissions=['lms-print-score-read'])
    def get(self, request):

        all_list = self.list(request).data
        return request.send_data(all_list)


@permission_classes([IsAuthenticated])
class StudentListAPIView(
    mixins.ListModelMixin,
    mixins.DestroyModelMixin,
    generics.GenericAPIView,
):
    """ Оюутны жагсаалт """

    queryset = ScoreRegister.objects.all().order_by('student__first_name')
    serializer_class = ScoreRegisterSerializer
    pagination_class = CustomPagination

    filter_backends = [SearchFilter]
    search_fields = ['student__code', 'student__first_name','lesson__name', 'exam_score', 'teach_score', 'assessment__assesment']

    def get_queryset(self):
        queryset = self.queryset
        student = self.request.query_params.get('student')
        select_season = self.request.query_params.get('select_season')
        select_year = self.request.query_params.get('select_year')
        sorting = self.request.query_params.get('sorting')
        school = self.request.query_params.get('school')

        # оюутангаар хайлт хийнэ
        if student:
            queryset = queryset.filter(student=student)

        # Сонгогдсон хичээлийн жил улирлаар хайх
        if select_season:
            queryset = queryset.filter(lesson_season=select_season)

        if select_year:
            queryset = queryset.filter(lesson_year=select_year)

        if school:
            queryset = queryset.filter(school=school)

        if sorting:
            if not isinstance(sorting, str):
                sorting = str(sorting)

            queryset = queryset.order_by(sorting)
        return queryset

    @has_permission(must_permissions=['lms-print-score-read'])
    def get(self, request):

        all_list = self.list(request).data
        return request.send_data(all_list)

    def delete(self, request, pk=None):

        self.destroy(request, pk).data
        return request.send_info("INF_003")


@permission_classes([IsAuthenticated])
class GraduationWorkAPIView(
    mixins.ListModelMixin,
    generics.GenericAPIView,
):
    ''' Төгсөлтийн ажид '''

    queryset = GraduationWork.objects.all()
    serializer_class = GraduationWorkListSerializer

    pagination_class = CustomPagination

    filter_backends = [SearchFilter]
    search_fields = ['student__code', 'student__last_name', 'student__first_name']

    def get_queryset(self):
        queryset = self.queryset
        learning = self.request.query_params.get('learning')
        lesson_year = self.request.query_params.get('lesson_year')
        lesson_season = self.request.query_params.get('lesson_season')
        group = self.request.query_params.get('group')
        degree = self.request.query_params.get('degree')
        schoolId = self.request.query_params.get('school')
        sorting = self.request.query_params.get('sorting')
        department = self.request.query_params.get('department')
        profession = self.request.query_params.get('profession')

        if learning:
            queryset = queryset.filter(student__group__learning_status=learning)

        # Сургуулиар хайлт хийх
        if schoolId:
            queryset = queryset.filter(student__school=schoolId)

        # Тэнхимээр хайх
        if department:
            queryset = queryset.filter(student__group__department=department)

        # Ангиар хайх
        if group:
            queryset = queryset.filter(student__group=group)

        # Боловсролын зэргээр хайлт хийх
        if degree:
            queryset = queryset.filter(student__group__degree=degree)

        # Мэргэжлээр хайх
        if profession:
            queryset = queryset.filter(student__group__profession=profession)

        if lesson_year:
            queryset = queryset.filter(lesson_year=lesson_year)

        if lesson_season:
            queryset = queryset.filter(lesson_season=lesson_season)

        if sorting:
            if not isinstance(sorting, str):
                sorting = str(sorting)

            queryset = queryset.order_by(sorting)

        return queryset

    def get(self, request):

        all_data = self.list(request).data

        return request.send_data(all_data)


@permission_classes([IsAuthenticated])
class AdmissionAPIView(
    mixins.ListModelMixin,
    generics.GenericAPIView,
):
    ''' Элсэлтийн тушаал '''

    queryset = AdmissionUserProfession.objects.all().order_by('created_at')
    serializer_class = AdmissionUserInfoSerializer

    pagination_class = CustomPagination
    filter_backends = [SearchFilter]
    search_fields = ['user__first_name', 'user__register', 'user__email', 'gpa']

    def get_queryset(self):

        # Эрүүл мэнд, Бие бялдар гэх мэт шат дараалсан шалгуур үзүүлэлтгүй элсэлтийн мэргэжлүүд
        # TODO цаашдаа элсэгч нь бүх үе шатыг давсны дараа элсэлтйин тушаал руу орох тул яаж шүүхийг тэр үед нь шийдий
        all_not_shalguur_profession_ids = AdmissionIndicator.objects.filter(admission_prof__admission__is_active=True) \
                                .exclude(value__in=[AdmissionIndicator.EESH_EXAM, AdmissionIndicator.ERUUL_MEND, AdmissionIndicator.BIE_BYALDAR, AdmissionIndicator.SETGEL_ZUI]) \
                                .values_list('admission_prof', flat=True)

        # Тэнцсэн төлөвтэй шалгуур үзүүлэлтүүдгүй элсэгчдийг шүүх
        queryset = self.queryset.filter(state=AdmissionUserProfession.STATE_APPROVE, profession__in=all_not_shalguur_profession_ids)
        userinfo_qs = UserInfo.objects.filter(user=OuterRef('user')).values('gpa')[:1]

        queryset = (
            queryset
            .annotate(
                gpa=Subquery(userinfo_qs),
            )
        )

        admission = self.request.query_params.get('admission')
        profession = self.request.query_params.get('profession')
        sorting = self.request.query_params.get('sorting')

        if admission:
            queryset = queryset.filter(profession__admission=admission)

        if profession:
            queryset = queryset.filter(profession__profession__id=profession)

        # Sort хийх үед ажиллана
        if sorting:
            if not isinstance(sorting, str):
                sorting = str(sorting)

            queryset = queryset.order_by(sorting)

        return queryset

    def get(self, request):

        all_data = self.list(request).data

        return request.send_data(all_data)

    def put(self, request):

        student_data = request.data
        sid = transaction.savepoint()
        try:
            with transaction.atomic():
                now =datetime.now()
                admission_date = parser.parse(student_data["admission_date"])
                self.queryset.filter(pk__in=student_data["id"]).update(admission_date=admission_date, admission_number=student_data["admission_number"], updated_at=now)
        except Exception as e:
            transaction.savepoint_rollback(sid)
            return request.send_error("ERR_002", e.__str__)

        return request.send_info('INF_002')


@permission_classes([IsAuthenticated])
class AdmissionPrintAPIView(
    mixins.ListModelMixin,
    generics.GenericAPIView,
):
    ''' Элсэлтийн тушаал хэвлэлтэнд зориулсан api '''

    queryset = Student.objects.all()
    # serializer_class = AdmissionPrintListSerializer

    def get(self, request):

        queryset = self.queryset.filter(group__level=1)
        learning = self.request.query_params.get('learning')
        group = self.request.query_params.get('group')
        degree = self.request.query_params.get('degree')
        schoolId = self.request.query_params.get('school')
        department = self.request.query_params.get('department')
        profession = self.request.query_params.get('profession')

        if learning:
            queryset = queryset.filter(group__learning_status=learning)

        # Сургуулиар хайлт хийх
        if schoolId:
            queryset = queryset.filter(school=schoolId)

        # Тэнхимээр хайх
        if department:
            queryset = queryset.filter(department=department)

        # Ангиар хайх
        if group:
            queryset = queryset.filter(group=group)

        # Боловсролын зэргээр хайлт хийх
        if degree:
            queryset = queryset.filter(group__degree=degree)

        # Мэргэжлээр хайх
        if profession:
            queryset = queryset.filter(group__profession=profession)

        stud_qs = queryset.distinct("group").values("group", "group__name")
        prof_data = list(stud_qs)

        datas = queryset.values("id", "code", "last_name", "first_name", "register_num", "group","group__name", "school", "department", "group__profession__name", "group__profession__code", "foregin_password", "citizenship")
        all_data = list(datas)

        return request.send_data(
            {
                'groups': prof_data,
                'students': all_data
            }
        )

class GroupsListFilterWithSubSchoolApiView(
    generics.GenericAPIView,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin
):
    """ Багшийн урт жагсаалт """

    queryset = Group.objects.all()
    serializer_class = GroupListFilterSubSchoolSerializer

    def get(self, request):
        school = self.request.query_params.get('school')
        self.queryset = self.queryset.exclude(school=True) # Аль нэг салбар сургуульд хамаардаггүй багш нарыг "аних филтэр"

        if school:
            self.queryset = self.queryset.filter(school=school)

            final_data = self.list(request).data
            return request.send_data(final_data)

        teach_info = self.list(request).data

        return request.send_data(teach_info)


class GpaProfessionAPIView(
    generics.GenericAPIView,
    mixins.ListModelMixin
):
    """ Хөтөлбөрөөр голч дүн """

    queryset = ProfessionAverageScore.objects.all()
    serializer_class = ProfessionAverageScoreSerializer
    pagination_class = CustomPagination

    filter_backends = [SearchFilter]
    search_fields = ['profession__code', 'profession__name']

    def get_queryset(self):
        queryset = self.queryset
        degree = self.request.query_params.get('degree')
        department = self.request.query_params.get('department')
        level = self.request.query_params.get('level')
        status = self.request.query_params.get('status')
        sorting = self.request.query_params.get('sorting')

        # Тэнхимээр хайх
        if department:
            queryset = queryset.filter(profession__department=department)

        # Түвшингээр хайх
        if level:
            queryset = queryset.filter(level=level)

        # Түвшингээр хайх
        if str2bool(status):
            queryset = queryset.filter(is_graduate=True)

        # Боловсролын зэргээр хайлт хийх
        if degree:
            queryset = queryset.filter(profession__degree=degree)

        if sorting:
            if not isinstance(sorting, str):
                sorting = str(sorting)

            queryset = queryset.order_by(sorting)

        return queryset

    def get(self, request):

        data = self.list(request).data
        return request.send_data(data)

    def post(self, request):
        student_queryset = Student.objects.all()
        score_queryset = ScoreRegister.objects.all()
        gradution_queryset = GraduationWork.objects.all()

        level = self.request.query_params.get('level')

        # Төгсөлтийн ажлаас бодох эсэх
        status = str2bool(self.request.query_params.get('status'))

        department = self.request.query_params.get('department')
        profession = self.request.query_params.get('profession')

        # Хичээлийн жил хайх
        if level and level != 0:
            gradution_queryset = gradution_queryset.filter(student__group__level=level)
            score_queryset = score_queryset.filter(student__group__level=level)
            student_queryset = student_queryset.filter(group__level=level)

        # Хөтөлбөрөөр хайх
        if department:
            student_queryset = student_queryset.filter(department=department)

        # Мэргэжлээр хайх
        if profession:
            gradution_queryset = gradution_queryset.filter(student__group__profession=profession)
            student_queryset = student_queryset.filter(group__profession=profession)

        # Төгсөх гэж байгаа төлөвтэй оюутнууд
        if status:
            level = 0
            student_ids = gradution_queryset.values_list('student', flat=True)
            student_queryset = student_queryset.filter(id__in=student_ids)

        all_student = 0
        all_student_gpa = 0
        all_student_score = 0

        # Нийт оюутнаар дүн бодох
        for student in student_queryset:

            if status:
                all_lessons_score = CalculatedGpaOfDiploma.objects.filter(student=student)
            else:
                all_lessons_score = score_queryset.filter(student=student)

            all_gpa = 0
            all_kredit = 0
            all_score = 0
            all_s_kredit = 0
            if len(all_lessons_score) > 0:

                all_student += 1

                # Оюутны дүнгүүдээр давталт гүйлгэх
                for lesson_score in all_lessons_score:
                    if status:
                        score_obj = Score.objects.filter(score_max__gte=lesson_score.score, score_min__lte=lesson_score.score).first()
                    else:
                        score_obj = Score.objects.filter(score_max__gte=lesson_score.score_total, score_min__lte=lesson_score.score_total).first()

                    # Нийт дүн
                    if status:
                        if not lesson_score.grade_letter:
                            all_score = all_score + (lesson_score.score * lesson_score.kredit)
                    else:
                        if not lesson_score.grade_letter:
                            all_score = all_score + (lesson_score.score_total * lesson_score.lesson.kredit)

                    # Бүх голч нэмэх
                    if status:
                        if not lesson_score.grade_letter:
                            all_gpa = all_gpa + (lesson_score.gpa * lesson_score.kredit)
                    else:
                        if not lesson_score.grade_letter:
                            all_gpa = all_gpa + (score_obj.gpa * lesson_score.lesson.kredit)

                    # Бүх нийт кредит нэмэх
                    if status:
                        all_kredit = all_kredit + lesson_score.kredit
                        if lesson_score.grade_letter:
                            all_s_kredit = all_s_kredit + lesson_score.kredit
                    else:
                        all_kredit = all_kredit + lesson_score.lesson.kredit
                        if lesson_score.grade_letter:
                            all_s_kredit = all_s_kredit + lesson_score.lesson.kredit

                # Дундаж оноо
                # Нийт кредитээс S үнэлгээ буюу тооцов үнэлгээг хасаж голч бодогдоно
                estimate_kredit = all_kredit - all_s_kredit

                final_gpa = all_gpa / estimate_kredit

                # Нийт голч оноо
                final_score = all_score / estimate_kredit

                # Оюутны нийт голчийг нэмэх
                all_student_gpa = all_student_gpa + final_gpa

                # Оюутны нийт оноо нэмэх
                all_student_score = all_student_score + final_score

        # Нийт голч дундаж оноо
        if all_student_gpa == 0 and all_student == 0:
            final_student_gpa = 0
        else:
            final_student_gpa = round((all_student_gpa / all_student), 2)

        # Нийт дундаж оноо
        if all_student_score == 0 and all_student == 0:
            final_student_score = 0
        else:
            final_student_score = round((all_student_score / all_student), 2)

        with transaction.atomic():
            try:
                self.queryset.update_or_create(
                    profession=ProfessionDefinition.objects.get(pk=profession),
                    level=level,
                    defaults={
                        'is_graduate': True if status else False,
                        'student_count': all_student,
                        'gpa_score': final_student_score,
                        'gpa': final_student_gpa,
                    }
                )
            except Exception as e:
                print(e)
                return request.send_error('ERR_001', 'Алдаа гарлаа')

        return request.send_data([])