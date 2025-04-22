import math
from datetime import datetime
from dateutil import parser
from django.db import transaction
from django.db.models import F, Subquery, OuterRef, FloatField, Q, CharField
from django.db.models.functions import Coalesce, Concat
from collections import defaultdict

from lms.models import Student, TimeTable_to_group, TimeTable_to_student
from lms.models import TimeTable
from lms.models import GraduationWork
from lms.models import ScoreRegister
from lms.models import StudentRegister
from lms.models import GradeLetter
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

        lesson_year = request.query_params.get('lesson_year')
        lesson_season = request.query_params.get('lesson_season')

        score_qs = ScoreRegister.objects
        if lesson_year:
            score_qs = score_qs.filter(lesson_year=lesson_year)

        if lesson_season:
            score_qs = score_qs.filter(lesson_season=lesson_season)

        score_student_ids = score_qs.values_list('student', flat=True)

        self.queryset = self.queryset.filter(id__in=score_student_ids)

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

    queryset = ScoreRegister.objects.all().select_related("student", "student__group", "lesson", "lesson_season", "assessment", "grade_letter").values("student__last_name", "student__first_name", "student__code", "student__id", "lesson__kredit", "lesson_year", "lesson_season", "lesson_season__season_name", "teach_score", "exam_score", "lesson__code", "lesson__name", "assessment__assesment", "grade_letter__letter")

    @has_permission(must_permissions=['lms-print-score-read'])
    def get(self, request):

        chosen_year = request.GET.getlist('chosen_year')
        chosen_season = request.GET.getlist('chosen_season')
        is_season = request.query_params.get('is_season')
        student_qs = Student.objects.all()

        if is_season and str2bool(is_season):
            # улиралаар хайлт хийнэ
            if chosen_season:
                self.queryset = self.queryset.filter(lesson_season__in=chosen_season)

            if chosen_year:
                self.queryset = self.queryset.filter(lesson_year__in=chosen_year)

        group = request.query_params.get('group') # 45
        lesson_qs = LessonStandart.objects.all().values("id", "code", "name", "kredit")

        if group:
            student_qs = student_qs.filter(group=group, status__name__icontains='Суралцаж буй')

        self.queryset = (
            self.queryset
            .filter(
                student__group=group,
                is_delete=False
            )
            .annotate(
                season=Concat(("lesson_year"), Value("-"), F("lesson_season"), output_field=CharField()),
            )
        )

        # score_qs = self.queryset.distinct('student')
        student_qs = student_qs.values('id', 'first_name', 'last_name', 'code', 'register_num')

        # group_lessons = self.queryset.filter(lesson__in=[1984]).distinct('lesson').values_list('lesson', flat=True)
        group_lessons = self.queryset.distinct('lesson').values_list('lesson', flat=True)
        lesson_years = self.queryset.distinct('lesson_year').values_list('lesson_year', flat=True)
        lesson_seasons = self.queryset.distinct('lesson_season').values_list('lesson_season', flat=True)

        before_lessons_data = []
        lessons_data = []
        after_lessons_data = []
        kredits = {}
        # seasons = []

        group_name = Group.objects.filter(id=group).values('name').first().get('name', '')

        # region to count "assessment", "grade_letter" columns
        assessment_dict = {
            "A+": 0,
            "A": 0,
            "B+": 0,
            "B": 0,
            "C+": 0,
            "C": 0,
            "D": 0,
            "F": 0
        }

        assessment_dict_rows_blank = {
            "A+": {},
            "A": {},
            "B+": {},
            "B": {},
            "C+": {},
            "C": {},
            "D": {},
            "F": {}
        }

        assessment_lesson_list = []

        # region to count "grade_letter" column in right side
        # region to specify order to sort
        order = ["TC","W","E","R","CR","S"]
        order_map = {value: index for index, value in enumerate(order)}

        # to place unspecified values at the end
        default_index = len(order)
        # endregion to specify order to sort

        grade_letters_list = GradeLetter.objects.values_list('letter', flat=True)
        grade_letters_list = sorted(grade_letters_list, key=lambda x: order_map.get(x, default_index))

        # to remove other letters that not specified in order
        grade_letters_list = [item for item in grade_letters_list if item in order]

        grade_letters_dict = {letter: 0 for letter in grade_letters_list}
        grade_letter_dict_rows_blank = {letter: {} for letter in grade_letters_list}
        grade_letter_lesson_list = []
        # endregion

        id = 0

        # Хичээлүүдийн үнэлгээний нийлбэрийг хадгалах dict-н хүснэгт бэлдэх нь
        while id < len(group_lessons):
            # to make new address in memory with copy() (and further copy() calls). Otherwise it will be always just replacing previous values so lessons will have same values
            assessment_dict_rows = assessment_dict_rows_blank.copy()
            grade_letter_dict_rows = grade_letter_dict_rows_blank.copy()

            for lesson_year in lesson_years:
                # region to count assessments
                if not lesson_year in assessment_dict_rows['A+']:
                    assessment_dict_rows['A+'] = assessment_dict_rows['A+'].copy()
                    assessment_dict_rows['A+'][lesson_year] = {}

                if not lesson_year in assessment_dict_rows['A']:
                    assessment_dict_rows['A'] = assessment_dict_rows['A'].copy()
                    assessment_dict_rows['A'][lesson_year] = {}

                if not lesson_year in assessment_dict_rows['B+']:
                    assessment_dict_rows['B+'] = assessment_dict_rows['B+'].copy()
                    assessment_dict_rows['B+'][lesson_year] = {}

                if not lesson_year in assessment_dict_rows['B']:
                    assessment_dict_rows['B'] = assessment_dict_rows['B'].copy()
                    assessment_dict_rows['B'][lesson_year] = {}

                if not lesson_year in assessment_dict_rows['C+']:
                    assessment_dict_rows['C+'] = assessment_dict_rows['C+'].copy()
                    assessment_dict_rows['C+'][lesson_year] = {}

                if not lesson_year in assessment_dict_rows['C']:
                    assessment_dict_rows['C'] = assessment_dict_rows['C'].copy()
                    assessment_dict_rows['C'][lesson_year] = {}

                if not lesson_year in assessment_dict_rows['D']:
                    assessment_dict_rows['D'] = assessment_dict_rows['D'].copy()
                    assessment_dict_rows['D'][lesson_year] = {}

                if not lesson_year in assessment_dict_rows['F']:
                    assessment_dict_rows['F'] = assessment_dict_rows['F'].copy()
                    assessment_dict_rows['F'][lesson_year] = {}
                # endregion

                # to count grade letters
                for key in grade_letter_dict_rows:
                    if not lesson_year in grade_letter_dict_rows[key]:
                        grade_letter_dict_rows[key] = grade_letter_dict_rows[key].copy()
                        grade_letter_dict_rows[key][lesson_year] = {}

                for lesson_season in lesson_seasons:
                    # to count assessments
                    assessment_dict_rows['A+'][lesson_year][lesson_season] = 0
                    assessment_dict_rows['A'][lesson_year][lesson_season] = 0
                    assessment_dict_rows['B+'][lesson_year][lesson_season] = 0
                    assessment_dict_rows['B'][lesson_year][lesson_season] = 0
                    assessment_dict_rows['C+'][lesson_year][lesson_season] = 0
                    assessment_dict_rows['C'][lesson_year][lesson_season] = 0
                    assessment_dict_rows['D'][lesson_year][lesson_season] = 0
                    assessment_dict_rows['F'][lesson_year][lesson_season] = 0

                    # to count grade letters
                    for key in grade_letter_dict_rows:
                        grade_letter_dict_rows[key][lesson_year][lesson_season] = 0

            assessment_lesson_list.append(assessment_dict_rows)
            grade_letter_lesson_list.append(grade_letter_dict_rows)
            id += 1
        # endregion

        def replace_hyphen_to_zero(dict_input):
            result = {}

            for key, value in dict_input.items():
                if value == '-':
                    result[key] = 0
                else:
                    result[key] = value

            return result

        # Сурагчаар гүйлгэх нь
        for group_list in student_qs:
            lessons = {}

            # to count "assessment" columns
            assessment_counts_dict = assessment_dict.copy()

            # to count "grade_letter" columns
            grade_letter_counts_dict = grade_letters_dict.copy()

            # судалсан кр column
            total_kr = 0

            # тооцсон кр column
            total_kr_with_assessments = 0

            # Голч дүн, голч оноо олох нийлбэр
            total_gpa_onoo = 0
            total_score_onoo = 0

            # Голч дүн, голч оноо
            total_gpa = 0
            avg_score = 0

            # to get column "Хичээлийн тоо"
            letters_sum = 0

            for lesson_year in lesson_years:
                for lesson_season in lesson_seasons:
                    lesson_standart = None
                    ys_full_name = f'{lesson_year}-{lesson_season}'
                    # Хичээлээр гүйлгэх нь
                    for id, lesson in enumerate(group_lessons):
                        # Сурагчын id болон хичээлээр хайх хэсэг
                        score = self.queryset.filter(student=group_list["id"], lesson=lesson, lesson_year=lesson_year, lesson_season=lesson_season).first()

                        # score байхгүй үед
                        if not score:
                            lesson_standart = lesson_qs.filter(id=lesson).first()
                            lesson_standart_name = lesson_standart__code_name(lesson_standart["code"], lesson_standart["name"]) if lesson_standart else None

                            if not lesson_standart:
                                continue

                            # Хичээлийн кредит авах хэсэг
                            kredit = 0.0 if math.isnan(lesson_standart["kredit"]) else lesson_standart["kredit"]

                            # Хичээлийн нэр авах хэсэг
                            lesson_name = lesson_standart_name

                            # Хичээлийн дүн авах хэсэг
                            total = '-'

                        else:
                            # Хичээлийн кредит авах хэсэг
                            kredit = 0.0 if math.isnan(score["lesson__kredit"]) else score["lesson__kredit"]

                            # Хичээлийн нэр авах хэсэг
                            lesson_name = lesson_standart__code_name(score["lesson__code"], score["lesson__name"])
                            # Шалгалтадаа унасан гэж үзнэ
                            if score["exam_score"] < 18:
                                score["assessment__assesment"]  = 'F'
                                score["exam_score"] = 0

                            # Хичээлийн дүн авах хэсэг
                            total = score_register__score_total(score["teach_score"], score["exam_score"])
                            # Сурагчын хичээлүүдийн үнэлгээний нийлбэр дүнг бодох хэсэг
                            if score["assessment__assesment"] and score["assessment__assesment"] in assessment_dict:
                                assessment_letter = score["assessment__assesment"]
                                assessment_counts_dict[assessment_letter] += 1

                                # to avoid "TypeError: can only concatenate str (not "int") to str" because some of previous students have not assessment. To change '-' back to 0 for math operations
                                if assessment_lesson_list[id][assessment_letter][lesson_year][lesson_season] == '-':
                                    assessment_lesson_list[id][assessment_letter][lesson_year][lesson_season] = 0

                                assessment_lesson_list[id][assessment_letter][lesson_year][lesson_season] += 1

                                # to get "toocson kr" value. In definition document 0 (zero) score not counted so it skipped here too
                                if score['grade_letter__letter'] != 'S':
                                    total_kr_with_assessments += kredit
                                    assess_qs = Score.objects.filter(score_max__gte=total, score_min__lte=total).first()
                                    if assess_qs:
                                        chanar = kredit * assess_qs.gpa

                                    total_score = total * kredit

                                    total_gpa_onoo += chanar
                                    total_score_onoo += total_score

                                # to get column "Хичээлийн тоо"
                                letters_sum += 1

                            else:
                                # to set "-" for one of any assessment in rows summary (footer) because some scoreregister record has teach or exam score but has not assessment. to not ruin excel formatting because it (sign "-") indicate that this lesson should be included in data
                                if assessment_lesson_list[id]['F'][lesson_year][lesson_season] == 0:
                                    assessment_lesson_list[id]['F'][lesson_year][lesson_season] = '-'

                            # to get grade letter count
                            if score['grade_letter__letter'] and score["assessment__assesment"] in grade_letters_dict:
                                grade_letter = score['grade_letter__letter']
                                grade_letter_counts_dict[grade_letter] += 1
                                grade_letter_lesson_list[id][grade_letter][lesson_year][lesson_season] += 1

                                # to get column "Хичээлийн тоо"
                                if grade_letter != 'S':
                                    letters_sum += 1

                        # to fill "-" if previously key was added else to not fill and to not add key
                        if (
                            (f'{ys_full_name}_-_-_{lesson_name}' in lessons and not score) or
                            score
                        ):
                            if f'{ys_full_name}_-_-_{lesson_name}' not in kredits:
                                kredits[f'{ys_full_name}_-_-_{lesson_name}'] = kredit

                            # Хичээлийн нэрний дагуу дүнг оруулах хэсэг
                            lessons[f'{ys_full_name}_-_-_{lesson_name}'] = total

                            # нийт кр
                            total_kr = total_kr + kredit

                    # Голч оноо, голч дүн
                    if total_gpa_onoo != 0:
                        total_gpa = round(total_gpa_onoo / total_kr_with_assessments, 1)

                    if total_score_onoo != 0:
                        avg_score = round(total_score_onoo / total_kr_with_assessments, 1)

            # Сурагчын бодогдсон мэдээллийг үндсэн хүснэгт рүү нэгтгэх хэсэг
            before_lessons_data.append(
                {
                    'Овог': group_list["last_name"],
                    'Нэр':group_list["first_name"],
                    'Оюутны код':group_list["code"],
                    'Регистрийн дугаар':group_list["register_num"],
                }
            )

            lessons_data.append(lessons)

            # to get columns "Амжилт", "Чанар"
            replaced_hyphen = replace_hyphen_to_zero(assessment_counts_dict)
            a = replaced_hyphen['A+'] + replaced_hyphen['A']
            b = replaced_hyphen['B+'] + replaced_hyphen['B']
            c = replaced_hyphen['C+'] + replaced_hyphen['C']
            d = replaced_hyphen['D']

            # to get column "Амжилт"
            success = f"{round((((a + b + c + d) * 100) / letters_sum), 1):.1f}%" if letters_sum else '-'

            # to get column "Чанар"
            quality = f"{round((((a + b) * 100) / letters_sum), 1):.1f}%" if letters_sum else '-'

            after_lessons_data.append(
                {
                    'Судалсан кр': total_kr,
                    'Тооцсон кр': total_kr_with_assessments,
                    'Голч оноо': avg_score,
                    'Голч дүн': total_gpa,
                    'A+': assessment_counts_dict['A+'],
                    'A': assessment_counts_dict['A'],
                    'B+': assessment_counts_dict['B+'],
                    'B': assessment_counts_dict['B'],
                    'C+': assessment_counts_dict['C+'],
                    'C': assessment_counts_dict['C'],
                    'D': assessment_counts_dict['D'],
                    'F': assessment_counts_dict['F'],
                    **grade_letter_counts_dict,
                    'Хичээлийн тоо': letters_sum,
                    'Амжилт': success,
                    'Чанар': quality,
                }
            )

        # to collect all year+season+lesson names
        all_keys = kredits.keys()

        # to sort by year+season+lesson names lessons and year+season columns. should be same to merge excel cells properly
        is_united_sort_direction_reverse = False

        # to sort by year+season+lesson names lessons columns
        all_keys = sorted(all_keys, reverse=is_united_sort_direction_reverse)

        # region to get seasons with its' lessons count for excel year-season cells merging
        seasons_list = []
        ys_dict = defaultdict(int)

        for key in all_keys:
            ys = key.split('_-_-_')[0]
            ys_dict[ys] += 1

        for ys, count in ys_dict.items():
            seasons_list.append({
                'season': ys,
                'count': count,
            })
        # endregion

        # region kredits row
        before_kredits_data = [{
            'Овог': 'Кредит',
            'Нэр':'',
            'Оюутны код':'',
            'Регистрийн дугаар': '',
        }]

        # to make same order as in all_keys of year+season+lesson names, because kredits fields are not sorted
        kredits_data = [dict(sorted(kredits.items(), key=lambda x: all_keys.index(x[0])))]

        after_kredits_data = [{
            'Судалсан кр': '',
            'Тооцсон кр': '',
            'Голч оноо': '',
            'Голч дүн': '',
            'A+': '',
            'A': '',
            'B+': '',
            'B': '',
            'C+': '',
            'C': '',
            'D': '',
            'F': '',
            **{letter: '' for letter in grade_letters_list},
            'Хичээлийн тоо': '',
            'Амжилт': '',
            'Чанар': '',
        }]

        # to merge lists for excel columns
        for dict1, dict2, dict3 in zip(before_kredits_data, kredits_data, after_kredits_data):
            dict1.update(dict2)
            dict1.update(dict3)

        all_kredits_rows = before_kredits_data
        # endregion

        # region students data row
        # to add lack year+season+lesson names if student has not them and to fill empty cells by "-"
        for item in lessons_data:
            for key in all_keys:
                if key not in item:
                    item[key] = "-"

            # to make same order as in all_keys of year+season+lesson names after adding new key because new key always adding in to the end of dict
            item = dict(sorted(item.items(), key=lambda x: all_keys.index(x[0])))

        # to merge lists for excel columns
        for dict1, dict2, dict3 in zip(before_lessons_data, lessons_data, after_lessons_data):
            dict1.update(dict2)
            dict1.update(dict3)

        all_lessons_rows = before_lessons_data
        # endregion

        # region footer rows
        footer_rows = []
        col_count = 0

        # Хичээл болгоны үнэлгээний нийлбэрийг мөр дата хэлбэрээр үндсэн хүснэгт рүү оруулах хэсэг
        for lesson_year in lesson_years:
            for lesson_season in lesson_seasons:
                ys_full_name = f'{lesson_year}-{lesson_season}'

                for lesson_ind, lesson in enumerate(group_lessons):
                    # Хичээлийн нэрийг хайж авах хэсэг
                    lesson_standart = lesson_qs.filter(id=lesson).first()
                    lesson_standart_name = lesson_standart__code_name(lesson_standart["code"], lesson_standart["name"]) if lesson_standart else ""

                    # region to skip columns without any value
                    is_all_assessments_empty = True

                    for assessment_key in assessment_dict:
                        if assessment_lesson_list[lesson_ind][assessment_key][lesson_year][lesson_season] == "-" or assessment_lesson_list[lesson_ind][assessment_key][lesson_year][lesson_season] > 0:
                            is_all_assessments_empty = False
                    # endregion

                    if not is_all_assessments_empty:
                        col_count += 1
                        total_students_count = 0
                        next_rows_start_index = 0

                        # to add assessment rows
                        for row_ind, key in enumerate(assessment_dict):
                            # to add first columns
                            if col_count == 1 and row_ind >= len(footer_rows):
                                footer_rows.append({
                                    'Овог': key,
                                    'Нэр':'',
                                    'Оюутны код':'',
                                    'Регистрийн дугаар': '',
                                })

                            # to add lesson columns
                            footer_rows[row_ind].update({
                                f'{ys_full_name}_-_-_{lesson_standart_name}': assessment_lesson_list[lesson_ind][key][lesson_year][lesson_season],
                                'Судалсан кр': '',
                                'Тооцсон кр': '',
                                'Голч оноо': '',
                                'Голч дүн': '',
                                'A+': '',
                                'A': '',
                                'B+': '',
                                'B': '',
                                'C+': '',
                                'C': '',
                                'D': '',
                                'F': '',
                                **{letter: '' for letter in grade_letters_list},
                                'Хичээлийн тоо': '',
                                'Амжилт': '',
                                'Чанар': '',
                            })

                            if assessment_lesson_list[lesson_ind][key][lesson_year][lesson_season] != '-':
                                total_students_count += assessment_lesson_list[lesson_ind][key][lesson_year][lesson_season]

                            next_rows_start_index += 1

                        # to add grade_letter rows
                        for grade_letter in grade_letters_list:
                            row_ind = next_rows_start_index

                            # to add first columns
                            if col_count == 1 and row_ind >= len(footer_rows):
                                footer_rows.append({
                                    'Овог': grade_letter,
                                    'Нэр':'',
                                    'Оюутны код':'',
                                    'Регистрийн дугаар': '',
                                })

                            # to add lesson columns
                            footer_rows[row_ind].update({
                                f'{ys_full_name}_-_-_{lesson_standart_name}': grade_letter_lesson_list[lesson_ind][grade_letter][lesson_year][lesson_season],
                                'Судалсан кр': '',
                                'Тооцсон кр': '',
                                'Голч оноо': '',
                                'Голч дүн': '',
                                'A+': '',
                                'A': '',
                                'B+': '',
                                'B': '',
                                'C+': '',
                                'C': '',
                                'D': '',
                                'F': '',
                                **{letter: '' for letter in grade_letters_list},
                                'Хичээлийн тоо': '',
                                'Амжилт': '',
                                'Чанар': '',
                            })

                            total_students_count += grade_letter_lesson_list[lesson_ind][grade_letter][lesson_year][lesson_season]
                            next_rows_start_index += 1

                        # region to add total assessed and graded student count row
                        row_ind = next_rows_start_index

                        # to add first columns
                        if col_count == 1 and row_ind >= len(footer_rows):
                            footer_rows.append({
                                'Овог': 'Дүгнэгдсэн оюутны тоо',
                                'Нэр':'',
                                'Оюутны код':'',
                                'Регистрийн дугаар': '',
                            })

                        # to add lesson columns
                        footer_rows[row_ind].update({
                            f'{ys_full_name}_-_-_{lesson_standart_name}': total_students_count,
                            'Судалсан кр': '',
                            'Тооцсон кр': '',
                            'Голч оноо': '',
                            'Голч дүн': '',
                            'A+': '',
                            'A': '',
                            'B+': '',
                            'B': '',
                            'C+': '',
                            'C': '',
                            'D': '',
                            'F': '',
                            **{letter: '' for letter in grade_letters_list},
                            'Хичээлийн тоо': '',
                            'Амжилт': '',
                            'Чанар': '',
                        })

                        next_rows_start_index += 1
                        # endregion

                        # to add success and quality rows
                        replaced_hyphen_a = assessment_lesson_list[lesson_ind]['A'][lesson_year][lesson_season] if assessment_lesson_list[lesson_ind]['A'][lesson_year][lesson_season] != '-' else 0
                        replaced_hyphen_a2 = assessment_lesson_list[lesson_ind]['A+'][lesson_year][lesson_season] if assessment_lesson_list[lesson_ind]['A+'][lesson_year][lesson_season] != '-' else 0
                        replaced_hyphen_b = assessment_lesson_list[lesson_ind]['B'][lesson_year][lesson_season] if assessment_lesson_list[lesson_ind]['B'][lesson_year][lesson_season] != '-' else 0
                        replaced_hyphen_b2 = assessment_lesson_list[lesson_ind]['B+'][lesson_year][lesson_season] if assessment_lesson_list[lesson_ind]['B+'][lesson_year][lesson_season] != '-' else 0
                        replaced_hyphen_c = assessment_lesson_list[lesson_ind]['C'][lesson_year][lesson_season] if assessment_lesson_list[lesson_ind]['C'][lesson_year][lesson_season] != '-' else 0
                        replaced_hyphen_c2 = assessment_lesson_list[lesson_ind]['C+'][lesson_year][lesson_season] if assessment_lesson_list[lesson_ind]['C+'][lesson_year][lesson_season] != '-' else 0
                        replaced_hyphen_d = assessment_lesson_list[lesson_ind]['D'][lesson_year][lesson_season] if assessment_lesson_list[lesson_ind]['D'][lesson_year][lesson_season] != '-' else 0
                        a = replaced_hyphen_a + replaced_hyphen_a2
                        b = replaced_hyphen_b + replaced_hyphen_b2
                        c = replaced_hyphen_c + replaced_hyphen_c2
                        d = replaced_hyphen_d

                        # region to add success row
                        row_ind = next_rows_start_index

                        # to add first columns
                        if col_count == 1 and row_ind >= len(footer_rows):
                            footer_rows.append({
                                'Овог': 'Амжилт',
                                'Нэр':'',
                                'Оюутны код':'',
                                'Регистрийн дугаар': '',
                            })

                        success = f"{round((((a + b + c + d) * 100) / total_students_count), 1):.1f}%" if total_students_count else '-'

                        # to add lesson columns
                        footer_rows[row_ind].update({
                            f'{ys_full_name}_-_-_{lesson_standart_name}': success
                        })

                        # to add last columns
                        if col_count == 1:
                            footer_rows[row_ind].update({
                                'Судалсан кр': '',
                                'Тооцсон кр': '',
                                'Голч оноо': '',
                                'Голч дүн': '',
                                'A+': '',
                                'A': '',
                                'B+': '',
                                'B': '',
                                'C+': '',
                                'C': '',
                                'D': '',
                                'F': '',
                                **{letter: '' for letter in grade_letters_list},
                                'Хичээлийн тоо': '',
                                'Амжилт': '',
                                'Чанар': '',
                            })

                        next_rows_start_index += 1
                        # endregion

                        # region to add quality row
                        row_ind = next_rows_start_index

                        # to add first columns
                        if col_count == 1 and row_ind >= len(footer_rows):
                            footer_rows.append({
                                'Овог': 'Чанар',
                                'Нэр':'',
                                'Оюутны код':'',
                                'Регистрийн дугаар': '',
                            })

                        quality = f"{round((((a + b) * 100) / total_students_count), 1):.1f}%" if total_students_count else '-'

                        # to add lesson columns
                        footer_rows[row_ind].update({
                            f'{ys_full_name}_-_-_{lesson_standart_name}': quality
                        })

                        # to add last columns
                        if col_count == 1:
                            footer_rows[row_ind].update({
                                'Судалсан кр': '',
                                'Тооцсон кр': '',
                                'Голч оноо': '',
                                'Голч дүн': '',
                                'A+': '',
                                'A': '',
                                'B+': '',
                                'B': '',
                                'C+': '',
                                'C': '',
                                'D': '',
                                'F': '',
                                **{letter: '' for letter in grade_letters_list},
                                'Хичээлийн тоо': '',
                                'Амжилт': '',
                                'Чанар': '',
                            })
                        # endregion
        # endregion footer rows

        # to merge all rows data
        merged_rows = all_kredits_rows + all_lessons_rows + footer_rows

        dataz = {
            'seasons': seasons_list,
            'datas': merged_rows,
            'lessons_length': sum(year_season["count"] for year_season in seasons_list),
            'group_name': group_name
        }

        return request.send_data(dataz)


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
    search_fields = ['student__code', 'student__first_name','lesson__name', 'exam_score', 'teach_score', 'assessment__assesment', 'student__last_name', 'student__register_num']

    def get_queryset(self):
        queryset = self.queryset
        group = self.request.query_params.get('group')
        select_season = self.request.query_params.get('select_season')
        select_year = self.request.query_params.get('select_year')
        sorting = self.request.query_params.get('sorting')
        school = self.request.query_params.get('school')

        start = self.request.query_params.get('start')
        end = self.request.query_params.get('end')
        lesson = self.request.query_params.get('lesson')

        # оюутангаар хайлт хийнэ
        if group:
            queryset = queryset.filter(student__group=group)

        if lesson:
            queryset = queryset.filter(lesson=lesson)

        # Сонгогдсон хичээлийн жил улирлаар хайх
        if select_season:
            queryset = queryset.filter(lesson_season=select_season)

        if select_year:
            queryset = queryset.filter(lesson_year=select_year)

        if school:
            queryset = queryset.filter(school=school)

        if start and end:
            score_ids = queryset.annotate(score_total=Coalesce(F('exam_score'), 0, output_field=FloatField()) + Coalesce(F('teach_score'), 0, output_field=FloatField())).filter(score_total__gte=start, score_total__lte=end).values_list('id', flat=True)
            queryset = queryset.filter(id__in=score_ids)

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
                                .exclude(value__in=[AdmissionIndicator.EESH_EXAM, AdmissionIndicator.ERUUL_MEND_ANHAN, AdmissionIndicator.BIE_BYALDAR, AdmissionIndicator.SETGEL_ZUI]) \
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


@permission_classes([IsAuthenticated])
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
        self.queryset = self.queryset.exclude(is_finish=True)

        if school:
            self.queryset = self.queryset.filter(school=school)

        final_data = self.list(request).data
        return request.send_data(final_data)


@permission_classes([IsAuthenticated])
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

@permission_classes([IsAuthenticated])
class GroupListNoLimitAllAPIView(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    generics.GenericAPIView,
):
    """Ангийн дүнгийн жагсаалт"""

    queryset = ScoreRegister.objects.all().select_related("student", "student__group", "lesson", "lesson_season", "assessment", "grade_letter").values("student__last_name", "student__first_name", "student__code", "student__id", "lesson__kredit", "lesson_year", "lesson_season", "lesson_season__season_name", "teach_score", "exam_score", "lesson__code", "lesson__name", "assessment__assesment", "grade_letter__letter","student__register_num")

    @has_permission(must_permissions=['lms-print-score-read'])
    def get(self, request):

        status = StudentRegister.objects.filter(Q(Q(name__contains='Суралцаж буй') | Q(code=1))).first()

        if status:
            self.queryset = self.queryset.filter(student__status=status)

        chosen_year = request.query_params.getlist('lesson_year')
        chosen_season = request.query_params.get('lesson_season')
        profession = request.query_params.get('profession')

        if chosen_year:
            self.queryset = self.queryset.filter(lesson_year__in=chosen_year)

        if chosen_season:
            self.queryset = self.queryset.filter(lesson_season=lesson_season)

        profession_name = ''

        group = request.query_params.get('group') # 45
        qs = self.queryset.annotate(
            season=Concat(("lesson_year"), Value("-"), F("lesson_season__season_name"), output_field=CharField()),
        ).order_by('season')
        lesson_qs = LessonStandart.objects.all().values("id", "code", "name", "kredit")

        self.queryset = (
            self.queryset
            .filter(
                student__group=group,
                is_delete=False
            )
            .annotate(
                season=Concat(("lesson_year"), Value("-"), F("lesson_season"), output_field=CharField()),
            )
        )

        score_qs = self.queryset.distinct('student')
        # group_lessons = self.queryset.filter(lesson__in=[1984]).distinct('lesson').values_list('lesson', flat=True)
        group_lessons = self.queryset.distinct('lesson').values_list('lesson', flat=True)
        lesson_years = self.queryset.distinct('lesson_year').values_list('lesson_year', flat=True)
        lesson_seasons = self.queryset.distinct('lesson_season').values_list('lesson_season', flat=True)

        before_lessons_data = []
        lessons_data = []
        after_lessons_data = []
        kredits = {}
        seasons = []

        group_name = Group.objects.filter(id=group).values('name').first().get('name', '')

        if profession:
            profession_name = ProfessionDefinition.objects.filter(id=profession).values('name').first().get('name','')

        # region to count "assessment", "grade_letter" columns
        assessment_dict = {
            "A+": 0,
            "A": 0,
            "B+": 0,
            "B": 0,
            "C+": 0,
            "C": 0,
            "D": 0,
            "F": 0
        }

        assessment_dict_rows_blank = {
            "A+": {},
            "A": {},
            "B+": {},
            "B": {},
            "C+": {},
            "C": {},
            "D": {},
            "F": {}
        }

        assessment_lesson_list = []

        # region to count "grade_letter" column in right side
        # region to specify order to sort
        order = ["WF","W","E","R","CR","S"]
        order_map = {value: index for index, value in enumerate(order)}

        # to place unspecified values at the end
        default_index = len(order)
        # endregion to specify order to sort

        grade_letters_list = GradeLetter.objects.values_list('letter', flat=True)
        grade_letters_list = sorted(grade_letters_list, key=lambda x: order_map.get(x, default_index))

        # to remove other letters that not specified in order
        grade_letters_list = [item for item in grade_letters_list if item in order]

        grade_letters_dict = {letter: 0 for letter in grade_letters_list}
        grade_letter_dict_rows_blank = {letter: {} for letter in grade_letters_list}
        grade_letter_lesson_list = []
        # endregion

        id = 0

        # Хичээлүүдийн үнэлгээний нийлбэрийг хадгалах dict-н хүснэгт бэлдэх нь
        while id < len(group_lessons):
            # to make new address in memory with copy() (and further copy() calls). Otherwise it will be always just replacing previous values so lessons will have same values
            assessment_dict_rows = assessment_dict_rows_blank.copy()
            grade_letter_dict_rows = grade_letter_dict_rows_blank.copy()

            for lesson_year in lesson_years:
                # region to count assessments
                if not lesson_year in assessment_dict_rows['A+']:
                    assessment_dict_rows['A+'] = assessment_dict_rows['A+'].copy()
                    assessment_dict_rows['A+'][lesson_year] = {}

                if not lesson_year in assessment_dict_rows['A']:
                    assessment_dict_rows['A'] = assessment_dict_rows['A'].copy()
                    assessment_dict_rows['A'][lesson_year] = {}

                if not lesson_year in assessment_dict_rows['B+']:
                    assessment_dict_rows['B+'] = assessment_dict_rows['B+'].copy()
                    assessment_dict_rows['B+'][lesson_year] = {}

                if not lesson_year in assessment_dict_rows['B']:
                    assessment_dict_rows['B'] = assessment_dict_rows['B'].copy()
                    assessment_dict_rows['B'][lesson_year] = {}

                if not lesson_year in assessment_dict_rows['C+']:
                    assessment_dict_rows['C+'] = assessment_dict_rows['C+'].copy()
                    assessment_dict_rows['C+'][lesson_year] = {}

                if not lesson_year in assessment_dict_rows['C']:
                    assessment_dict_rows['C'] = assessment_dict_rows['C'].copy()
                    assessment_dict_rows['C'][lesson_year] = {}

                if not lesson_year in assessment_dict_rows['D']:
                    assessment_dict_rows['D'] = assessment_dict_rows['D'].copy()
                    assessment_dict_rows['D'][lesson_year] = {}

                if not lesson_year in assessment_dict_rows['F']:
                    assessment_dict_rows['F'] = assessment_dict_rows['F'].copy()
                    assessment_dict_rows['F'][lesson_year] = {}
                # endregion

                # to count grade letters
                for key in grade_letter_dict_rows:
                    if not lesson_year in grade_letter_dict_rows[key]:
                        grade_letter_dict_rows[key] = grade_letter_dict_rows[key].copy()
                        grade_letter_dict_rows[key][lesson_year] = {}

                for lesson_season in lesson_seasons:
                    # to count assessments
                    assessment_dict_rows['A+'][lesson_year][lesson_season] = 0
                    assessment_dict_rows['A'][lesson_year][lesson_season] = 0
                    assessment_dict_rows['B+'][lesson_year][lesson_season] = 0
                    assessment_dict_rows['B'][lesson_year][lesson_season] = 0
                    assessment_dict_rows['C+'][lesson_year][lesson_season] = 0
                    assessment_dict_rows['C'][lesson_year][lesson_season] = 0
                    assessment_dict_rows['D'][lesson_year][lesson_season] = 0
                    assessment_dict_rows['F'][lesson_year][lesson_season] = 0

                    # to count grade letters
                    for key in grade_letter_dict_rows:
                        grade_letter_dict_rows[key][lesson_year][lesson_season] = 0

            assessment_lesson_list.append(assessment_dict_rows)
            grade_letter_lesson_list.append(grade_letter_dict_rows)
            id += 1
        # endregion

        def replace_hyphen_to_zero(dict_input):
            result = {}

            for key, value in dict_input.items():
                if value == '-':
                    result[key] = 0
                else:
                    result[key] = value

            return result

        # Сурагчаар гүйлгэх нь
        for group_list in score_qs:
            if group_list['student__id'] in [2271] or True:
                lessons = {}

                # to count "assessment" columns
                assessment_counts_dict = assessment_dict.copy()

                # to count "grade_letter" columns
                grade_letter_counts_dict = grade_letters_dict.copy()

                # судалсан кр column
                total_kr = 0

                # тооцсон кр column
                total_kr_with_assessments = 0

                # Голч дүн, голч оноо олох нийлбэр
                total_gpa_onoo = 0
                total_score_onoo = 0

                # Голч дүн, голч оноо
                total_gpa = 0
                avg_score = 0

                # to get column "Хичээлийн тоо"
                letters_sum = 0

                for lesson_year in lesson_years:
                    for lesson_season in lesson_seasons:
                        lesson_standart = None
                        ys_full_name = f'{lesson_year}-{lesson_season}'

                        # Хичээлээр гүйлгэх нь
                        for id, lesson in enumerate(group_lessons):
                            # Сурагчын id болон хичээлээр хайх хэсэг
                            score = self.queryset.filter(student=group_list["student__id"], lesson=lesson, lesson_year=lesson_year, lesson_season=lesson_season).first()

                            # score байхгүй үед
                            if not score:
                                lesson_standart = lesson_qs.filter(id=lesson).first()
                                lesson_standart_name = lesson_standart__code_name(lesson_standart["code"], lesson_standart["name"]) if lesson_standart else None

                                if not lesson_standart:
                                    continue

                                # Хичээлийн кредит авах хэсэг
                                kredit = lesson_standart["kredit"]

                                # Хичээлийн нэр авах хэсэг
                                lesson_name = lesson_standart_name

                                # Хичээлийн дүн авах хэсэг
                                total = '-'

                            else:
                                # Хичээлийн кредит авах хэсэг
                                kredit = score["lesson__kredit"]

                                # Хичээлийн нэр авах хэсэг
                                lesson_name = lesson_standart__code_name(score["lesson__code"], score["lesson__name"])

                                # Шалгалтадаа унасан гэж үзнэ
                                if score["exam_score"] < 18:
                                    score["assessment__assesment"]  = 'F'
                                    score["exam_score"] = 0

                                # Хичээлийн дүн авах хэсэг
                                total = score_register__score_total(score["teach_score"], score["exam_score"])

                                # Сурагчын хичээлүүдийн үнэлгээний нийлбэр дүнг бодох хэсэг
                                if score["assessment__assesment"] and score["assessment__assesment"] in assessment_dict:
                                    assessment_letter = score["assessment__assesment"]
                                    assessment_counts_dict[assessment_letter] += 1

                                    # to avoid "TypeError: can only concatenate str (not "int") to str" because some of previous students have not assessment. To change '-' back to 0 for math operations
                                    if assessment_lesson_list[id][assessment_letter][lesson_year][lesson_season] == '-':
                                        assessment_lesson_list[id][assessment_letter][lesson_year][lesson_season] = 0

                                    assessment_lesson_list[id][assessment_letter][lesson_year][lesson_season] += 1

                                    # to get "toocson kr" value. In definition document 0 (zero) score not counted so it skipped here too
                                    if score['grade_letter__letter'] != 'S':
                                        chanar = 0
                                        total_kr_with_assessments += kredit
                                        score_assessment_qs = Score.objects.filter(score_max__gte=total, score_min__lte=total).first()
                                        if score_assessment_qs:
                                            chanar = kredit * score_assessment_qs.gpa

                                        total_score = total * kredit

                                        total_gpa_onoo += chanar
                                        total_score_onoo += total_score

                                    # to get column "Хичээлийн тоо"
                                    letters_sum += 1

                                else:
                                    # to set "-" for one of any assessment in rows summary (footer) because some scoreregister record has teach or exam score but has not assessment. to not ruin excel formatting because it (sign "-") indicate that this lesson should be included in data
                                    if assessment_lesson_list[id]['F'][lesson_year][lesson_season] == 0:
                                        assessment_lesson_list[id]['F'][lesson_year][lesson_season] = '-'

                                # to get grade letter count
                                if score['grade_letter__letter'] and score["assessment__assesment"] in grade_letters_dict:
                                    grade_letter = score['grade_letter__letter']
                                    grade_letter_counts_dict[grade_letter] += 1
                                    grade_letter_lesson_list[id][grade_letter][lesson_year][lesson_season] += 1

                                    # to get column "Хичээлийн тоо"
                                    if grade_letter != 'S':
                                        letters_sum += 1

                            # to fill "-" if previously key was added else to not fill and to not add key
                            if (
                                (f'{ys_full_name}_-_-_{lesson_name}' in lessons and not score) or
                                score
                            ):
                                if f'{ys_full_name}_-_-_{lesson_name}' not in kredits:
                                    kredits[f'{ys_full_name}_-_-_{lesson_name}'] = kredit

                                # Хичээлийн нэрний дагуу дүнг оруулах хэсэг
                                lessons[f'{ys_full_name}_-_-_{lesson_name}'] = total

                                # нийт кр
                                total_kr = total_kr + kredit

                        # Голч оноо, голч дүн
                        total_gpa = round(total_gpa_onoo / total_kr_with_assessments, 1) if total_kr_with_assessments != 0 else 0
                        avg_score = round(total_score_onoo / total_kr_with_assessments, 1) if total_kr_with_assessments != 0 else 0

                # Сурагчын бодогдсон мэдээллийг үндсэн хүснэгт рүү нэгтгэх хэсэг
                before_lessons_data.append(
                    {
                        'Овог': group_list["student__last_name"],
                        'Нэр':group_list["student__first_name"],
                        'Оюутны код':group_list["student__code"],
                        'Регистерийн дугаар':group_list["student__register_num"]
                    }
                )

                lessons_data.append(lessons)

                # to get columns "Амжилт", "Чанар"
                replaced_hyphen = replace_hyphen_to_zero(assessment_counts_dict)
                a = replaced_hyphen['A+'] + replaced_hyphen['A']
                b = replaced_hyphen['B+'] + replaced_hyphen['B']
                c = replaced_hyphen['C+'] + replaced_hyphen['C']
                d = replaced_hyphen['D']

                # to get column "Амжилт"
                success = f"{round((((a + b + c + d) * 100) / letters_sum), 1):.1f}%" if letters_sum else '-'

                # to get column "Чанар"
                quality = f"{round((((a + b) * 100) / letters_sum), 1):.1f}%" if letters_sum else '-'

                after_lessons_data.append(
                    {
                        'Судалсан кр': total_kr,
                        'Тооцсон кр': total_kr_with_assessments,
                        'Голч оноо': avg_score,
                        'Голч дүн': total_gpa,
                        'A+': assessment_counts_dict['A+'],
                        'A': assessment_counts_dict['A'],
                        'B+': assessment_counts_dict['B+'],
                        'B': assessment_counts_dict['B'],
                        'C+': assessment_counts_dict['C+'],
                        'C': assessment_counts_dict['C'],
                        'D': assessment_counts_dict['D'],
                        'F': assessment_counts_dict['F'],
                        **grade_letter_counts_dict,
                        'Хичээлийн тоо': letters_sum,
                        'Амжилт': success,
                        'Чанар': quality,
                    }
                )

        # to collect all year+season+lesson names
        all_keys = kredits.keys()

        # to sort by year+season+lesson names lessons and year+season columns. should be same to merge excel cells properly
        is_united_sort_direction_reverse = False

        # to sort by year+season+lesson names lessons columns
        all_keys = sorted(all_keys, reverse=is_united_sort_direction_reverse)

        # region to get seasons with its' lessons count for excel year-season cells merging
        seasons_list = []
        ys_dict = defaultdict(int)

        for key in all_keys:
            ys = key.split('_-_-_')[0]
            ys_dict[ys] += 1

        for ys, count in ys_dict.items():
            seasons_list.append({
                'season': ys,
                'count': count,
            })
        # endregion

        # region kredits row
        before_kredits_data = [{
            'Овог': 'Кредит',
            'Нэр':'',
            'Оюутны код':'',
            'Регистерийн дугаар':''
        }]

        # to make same order as in all_keys of year+season+lesson names, because kredits fields are not sorted
        kredits_data = [dict(sorted(kredits.items(), key=lambda x: all_keys.index(x[0])))]

        after_kredits_data = [{
            'Судалсан кр': '',
            'Тооцсон кр': '',
            'Голч оноо': '',
            'Голч дүн': '',
            'A+': '',
            'A': '',
            'B+': '',
            'B': '',
            'C+': '',
            'C': '',
            'D': '',
            'F': '',
            **{letter: '' for letter in grade_letters_list},
            'Хичээлийн тоо': '',
            'Амжилт': '',
            'Чанар': '',
        }]

        # to merge lists for excel columns
        for dict1, dict2, dict3 in zip(before_kredits_data, kredits_data, after_kredits_data):
            dict1.update(dict2)
            dict1.update(dict3)

        all_kredits_rows = before_kredits_data
        # endregion

        # region students data row
        # to add lack year+season+lesson names if student has not them and to fill empty cells by "-"
        for item in lessons_data:
            for key in all_keys:
                if key not in item:
                    item[key] = "-"

            # to make same order as in all_keys of year+season+lesson names after adding new key because new key always adding in to the end of dict
            item = dict(sorted(item.items(), key=lambda x: all_keys.index(x[0])))

        # to merge lists for excel columns
        for dict1, dict2, dict3 in zip(before_lessons_data, lessons_data, after_lessons_data):
            dict1.update(dict2)
            dict1.update(dict3)

        all_lessons_rows = before_lessons_data
        # endregion

        # region footer rows
        footer_rows = []
        col_count = 0

        # Хичээл болгоны үнэлгээний нийлбэрийг мөр дата хэлбэрээр үндсэн хүснэгт рүү оруулах хэсэг
        for lesson_year in lesson_years:
            for lesson_season in lesson_seasons:
                ys_full_name = f'{lesson_year}-{lesson_season}'

                for lesson_ind, lesson in enumerate(group_lessons):
                    # Хичээлийн нэрийг хайж авах хэсэг
                    lesson_standart = lesson_qs.filter(id=lesson).first()
                    lesson_standart_name = lesson_standart__code_name(lesson_standart["code"], lesson_standart["name"]) if lesson_standart else ""

                    # region to skip columns without any value
                    is_all_assessments_empty = True

                    for assessment_key in assessment_dict:
                        if assessment_lesson_list[lesson_ind][assessment_key][lesson_year][lesson_season] == "-" or assessment_lesson_list[lesson_ind][assessment_key][lesson_year][lesson_season] > 0:
                            is_all_assessments_empty = False
                    # endregion

                    if not is_all_assessments_empty:
                        col_count += 1
                        total_students_count = 0
                        next_rows_start_index = 0

                        # to add assessment rows
                        for row_ind, key in enumerate(assessment_dict):
                            # to add first columns
                            if col_count == 1 and row_ind >= len(footer_rows):
                                footer_rows.append({
                                    'Овог': key,
                                    'Нэр':'',
                                    'Оюутны код':'',
                                    'Регистерийн дугаар':''
                                })

                            # to add lesson columns
                            footer_rows[row_ind].update({
                                f'{ys_full_name}_-_-_{lesson_standart_name}': assessment_lesson_list[lesson_ind][key][lesson_year][lesson_season],
                                'Судалсан кр': '',
                                'Тооцсон кр': '',
                                'A+': '',
                                'A': '',
                                'B+': '',
                                'B': '',
                                'C+': '',
                                'C': '',
                                'D': '',
                                'F': '',
                                **{letter: '' for letter in grade_letters_list},
                                'Хичээлийн тоо': '',
                                'Амжилт': '',
                                'Чанар': '',
                            })

                            if assessment_lesson_list[lesson_ind][key][lesson_year][lesson_season] != '-':
                                total_students_count += assessment_lesson_list[lesson_ind][key][lesson_year][lesson_season]

                            next_rows_start_index += 1

                        # to add grade_letter rows
                        for grade_letter in grade_letters_list:
                            row_ind = next_rows_start_index

                            # to add first columns
                            if col_count == 1 and row_ind >= len(footer_rows):
                                footer_rows.append({
                                    'Овог': grade_letter,
                                    'Нэр':'',
                                    'Оюутны код':'',
                                    'Регистерийн дугаар':''
                                })

                            # to add lesson columns
                            footer_rows[row_ind].update({
                                f'{ys_full_name}_-_-_{lesson_standart_name}': grade_letter_lesson_list[lesson_ind][grade_letter][lesson_year][lesson_season],
                                'Судалсан кр': '',
                                'Тооцсон кр': '',
                                'A+': '',
                                'A': '',
                                'B+': '',
                                'B': '',
                                'C+': '',
                                'C': '',
                                'D': '',
                                'F': '',
                                **{letter: '' for letter in grade_letters_list},
                                'Хичээлийн тоо': '',
                                'Амжилт': '',
                                'Чанар': '',
                            })

                            total_students_count += grade_letter_lesson_list[lesson_ind][grade_letter][lesson_year][lesson_season]
                            next_rows_start_index += 1

                        # region to add total assessed and graded student count row
                        row_ind = next_rows_start_index

                        # to add first columns
                        if col_count == 1 and row_ind >= len(footer_rows):
                            footer_rows.append({
                                'Овог': 'Дүгнэгдсэн оюутны тоо',
                                'Нэр':'',
                                'Оюутны код':'',
                                'Регистерийн дугаар':''
                            })

                        # to add lesson columns
                        footer_rows[row_ind].update({
                            f'{ys_full_name}_-_-_{lesson_standart_name}': total_students_count,
                            'Судалсан кр': '',
                            'Тооцсон кр': '',
                            'A+': '',
                            'A': '',
                            'B+': '',
                            'B': '',
                            'C+': '',
                            'C': '',
                            'D': '',
                            'F': '',
                            **{letter: '' for letter in grade_letters_list},
                            'Хичээлийн тоо': '',
                            'Амжилт': '',
                            'Чанар': '',
                        })

                        next_rows_start_index += 1
                        # endregion

                        # to add success and quality rows
                        replaced_hyphen_a = assessment_lesson_list[lesson_ind]['A'][lesson_year][lesson_season] if assessment_lesson_list[lesson_ind]['A'][lesson_year][lesson_season] != '-' else 0
                        replaced_hyphen_a2 = assessment_lesson_list[lesson_ind]['A+'][lesson_year][lesson_season] if assessment_lesson_list[lesson_ind]['A+'][lesson_year][lesson_season] != '-' else 0
                        replaced_hyphen_b = assessment_lesson_list[lesson_ind]['B'][lesson_year][lesson_season] if assessment_lesson_list[lesson_ind]['B'][lesson_year][lesson_season] != '-' else 0
                        replaced_hyphen_b2 = assessment_lesson_list[lesson_ind]['B+'][lesson_year][lesson_season] if assessment_lesson_list[lesson_ind]['B+'][lesson_year][lesson_season] != '-' else 0
                        replaced_hyphen_c = assessment_lesson_list[lesson_ind]['C'][lesson_year][lesson_season] if assessment_lesson_list[lesson_ind]['C'][lesson_year][lesson_season] != '-' else 0
                        replaced_hyphen_c2 = assessment_lesson_list[lesson_ind]['C+'][lesson_year][lesson_season] if assessment_lesson_list[lesson_ind]['C+'][lesson_year][lesson_season] != '-' else 0
                        replaced_hyphen_d = assessment_lesson_list[lesson_ind]['D'][lesson_year][lesson_season] if assessment_lesson_list[lesson_ind]['D'][lesson_year][lesson_season] != '-' else 0
                        a = replaced_hyphen_a + replaced_hyphen_a2
                        b = replaced_hyphen_b + replaced_hyphen_b2
                        c = replaced_hyphen_c + replaced_hyphen_c2
                        d = replaced_hyphen_d

                        # region to add success row
                        row_ind = next_rows_start_index

                        # to add first columns
                        if col_count == 1 and row_ind >= len(footer_rows):
                            footer_rows.append({
                                'Овог': 'Амжилт',
                                'Нэр':'',
                                'Оюутны код':'',
                                'Регистерийн дугаар':''
                            })

                        success = f"{round((((a + b + c + d) * 100) / total_students_count), 1):.1f}%" if total_students_count else '-'

                        # to add lesson columns
                        footer_rows[row_ind].update({
                            f'{ys_full_name}_-_-_{lesson_standart_name}': success
                        })

                        # to add last columns
                        if col_count == 1:
                            footer_rows[row_ind].update({
                                'Судалсан кр': '',
                                'Тооцсон кр': '',
                                'A+': '',
                                'A': '',
                                'B+': '',
                                'B': '',
                                'C+': '',
                                'C': '',
                                'D': '',
                                'F': '',
                                **{letter: '' for letter in grade_letters_list},
                                'Хичээлийн тоо': '',
                                'Амжилт': '',
                                'Чанар': '',
                            })

                        next_rows_start_index += 1
                        # endregion

                        # region to add quality row
                        row_ind = next_rows_start_index

                        # to add first columns
                        if col_count == 1 and row_ind >= len(footer_rows):
                            footer_rows.append({
                                'Овог': 'Чанар',
                                'Нэр':'',
                                'Оюутны код':'',
                            'Регистерийн дугаар':''
                            })

                        quality = f"{round((((a + b) * 100) / total_students_count), 1):.1f}%" if total_students_count else '-'

                        # to add lesson columns
                        footer_rows[row_ind].update({
                            f'{ys_full_name}_-_-_{lesson_standart_name}': quality
                        })

                        # to add last columns
                        if col_count == 1:
                            footer_rows[row_ind].update({
                                'Судалсан кр': '',
                                'Тооцсон кр': '',
                                'A+': '',
                                'A': '',
                                'B+': '',
                                'B': '',
                                'C+': '',
                                'C': '',
                                'D': '',
                                'F': '',
                                **{letter: '' for letter in grade_letters_list},
                                'Хичээлийн тоо': '',
                                'Амжилт': '',
                                'Чанар': '',
                            })
        # endregion

        # to merge all rows data
        merged_rows = all_kredits_rows + all_lessons_rows + footer_rows

        dataz = {
            'seasons': seasons_list,
            'datas': merged_rows,
            'lessons_length': sum(year_season["count"] for year_season in seasons_list),
            'group_name':profession_name + ' ' +  group_name
        }

        return request.send_data(dataz)