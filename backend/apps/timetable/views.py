import os
import traceback
import pandas as pd
from django.utils import timezone
from datetime import datetime, timedelta
import json

from rest_framework import mixins
from rest_framework import generics
from rest_framework.filters import SearchFilter
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes

from main.utils.function.pagination import CustomPagination
from main.utils.file import save_file, remove_folder
from main.utils.function.utils import str2bool, remove_key_from_dict, isLightOrDark, get_active_year_season, magicFunction, get_dates_from_week, get_lesson_choice_student
from main.utils.function.utils import has_permission, get_error_obj, get_fullName, get_teacher_queryset, get_weekday_kurats_date, start_time, end_time, dict_fetchall

from django.db import transaction
from django.conf import settings
from django.db import connection
from django.db.models import Q, Count, Case, When,F, Max, FloatField, Value, IntegerField, Exists, OuterRef

from core.models import Employee, Teachers, SubOrgs
from lms.models import Room
from lms.models import Season
from lms.models import Lesson_to_teacher
from lms.models import Building
from lms.models import TimeTable
from lms.models import TimeTable_to_group
from lms.models import ExamTimeTable
from lms.models import Exam_to_group
from lms.models import Student
from lms.models import TimeTable_to_student
from lms.models import Group
from lms.models import Exam_repeat
from lms.models import ScoreRegister
from lms.models import LessonStandart
from lms.models import SystemSettings
from lms.models import LearningPlan
from lms.models import TeacherCreditVolumePlan
from lms.models import TeacherCreditVolumePlan_group
from lms.models import Exam_to_student
from lms.models import (
    Challenge,
    TeacherScore,
    ChallengeStudents,
    DefinitionSignature,
    Lesson_teacher_scoretype,
)

from .serializers import Exam_repeatLiseSerializer, Exam_repeatSerializer
from .serializers import RoomSerializer
from .serializers import BuildingSerializer
from .serializers import TimeTableSerializer
from .serializers import TimeTableListSerializer
from .serializers import RoomListSerializer
from .serializers import RoomInfoSerializer
from .serializers import ExamTimeTableSerializer
from .serializers import ExamTimeTableListSerializer
from .serializers import StudentScoreListSerializer
from .serializers import PotokSerializer
from .serializers import ExamTimeTableAllSerializer
from .serializers import (
    TimetablePrintSerializer,
    ChallengeStudentsSerializer,
    TeacherScoreStudentsSerializer,
)
from surgalt.serializers import ChallengeListSerializer

@permission_classes([IsAuthenticated])
class BuildingAPIView(
    mixins.CreateModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    mixins.RetrieveModelMixin,
    mixins.ListModelMixin,
    generics.GenericAPIView
):
    """ Хичээлийн байр """

    queryset = Building.objects.all()
    serializer_class = BuildingSerializer

    @has_permission(must_permissions=['lms-timetable-building-read'])
    def get(self, request, pk=None):
        " хичээлийн байр жагсаалт "

        if pk:
            standart = self.retrieve(request, pk).data
            return request.send_data(standart)

        less_standart_list = self.list(request).data
        return request.send_data(less_standart_list)

    @has_permission(must_permissions=['lms-timetable-building-create'])
    def post(self, request):
        " хичээлийн байр шинээр үүсгэх "

        request_data = request.data
        serializer = self.get_serializer(data=request_data)

        if serializer.is_valid(raise_exception=False):
            try:
                with transaction.atomic():
                    self.perform_create(serializer)
            except Exception:
                return request.send_error("ERR_002")
            return request.send_info("INF_001")
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

    @has_permission(must_permissions=['lms-timetable-building-update'])
    def put(self, request, pk=None):
        " хичээлийн байр засах "

        request_data = request.data
        instance = self.get_object()

        serializer = self.get_serializer(instance, data=request_data)

        if serializer.is_valid(raise_exception=False):
            try:
                with transaction.atomic():
                    self.perform_update(serializer)
            except Exception:
                return request.send_error("ERR_002")
            return request.send_info("INF_001")

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

    @has_permission(must_permissions=['lms-timetable-building-delete'])
    def delete(self, request, pk=None):
        " хичээлийн байр устгах "

        self.destroy(request, pk)
        return request.send_info("INF_003")


@permission_classes([IsAuthenticated])
class RoomAPIView(
    mixins.CreateModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    mixins.RetrieveModelMixin,
    mixins.ListModelMixin,
    generics.GenericAPIView
):
    """ Өрөө """

    queryset = Room.objects.all()
    serializer_class = RoomSerializer

    @has_permission(must_permissions=['lms-timetable-room-read'])
    def get(self, request, pk=None):
        " Өрөө жагсаалт "
        self.serializer_class = RoomInfoSerializer

        if pk:
            room = self.retrieve(request, pk).data
            return request.send_data(room)

        room_list = self.list(request).data
        return request.send_data(room_list)

    @has_permission(must_permissions=['lms-timetable-room-create'])
    def post(self, request):
        " Өрөө шинээр үүсгэх "

        request_data = request.data
        serializer = self.get_serializer(data=request_data)

        if serializer.is_valid(raise_exception=False):
            self.create(request).data
            return request.send_info("INF_001")
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

    @has_permission(must_permissions=['lms-timetable-room-update'])
    def put(self, request, pk=None):
        " Өрөө засах "

        request_data = request.data
        instance = self.get_object()

        serializer = self.get_serializer(instance, data=request_data)

        if serializer.is_valid(raise_exception=False):
            try:
                with transaction.atomic():
                    self.update(request).data
            except Exception:
                return request.send_error("ERR_002")
        else:
            errors = []
            for key in serializer.errors:
                msg = "Хоосон байна"
                if key == 'code':
                    msg = "Код давхцаж байна"

                return_error = {
                    "field": key,
                    "msg": msg
                }

                errors.append(return_error)

            if len(errors) > 0:
                return request.send_error("ERR_003", errors)


        return request.send_info("INF_001")

    @has_permission(must_permissions=['lms-timetable-room-delete'])
    def delete(self, request, pk=None):
        " Өрөө устгах "

        self.destroy(request, pk)
        return request.send_info("INF_003")


@permission_classes([IsAuthenticated])
class RoomListAPIView(
    mixins.CreateModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    mixins.RetrieveModelMixin,
    mixins.ListModelMixin,
    generics.GenericAPIView
):
    """ Өрөө """

    queryset = Room.objects
    serializer_class = RoomListSerializer

    def get_queryset(self):
        queryset = self.queryset
        room_type = self.request.query_params.get('room_type')
        if room_type:
            queryset = queryset.filter(type=room_type)

        return queryset

    def get(self, request):

        all_list = self.list(request).data
        return request.send_data(all_list)

@permission_classes([IsAuthenticated])
class TimeTableAPIView(
    mixins.CreateModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    mixins.RetrieveModelMixin,
    mixins.ListModelMixin,
    generics.GenericAPIView
):
    """  Цагийн хуваарь """

    queryset = TimeTable.objects.all()
    serializer_class = TimeTableSerializer

    pagination_class = CustomPagination

    filter_backends = [SearchFilter]
    search_fields = ['room__code', 'room__name', 'day', 'time', 'lesson__name', 'teacher__first_name']

    @has_permission(must_permissions=['lms-timetable-register-read'])
    def get(self, request, pk=None):
        "  Цагийн хуваарь жагсаалт "

        self.serializer_class = TimeTableListSerializer
        if pk:
            instance = self.queryset.filter(pk=pk).first()
            time_table = self.get_serializer(instance, many=False).data
            return request.send_data(time_table)

        time_table_list = self.list(request).data

        return request.send_data(time_table_list)

    @has_permission(must_permissions=['lms-timetable-register-create'])
    def post(self, request):
        " Цагийн хуваарь шинээр үүсгэх "

        st_time = start_time()
        errors = []
        user = request.user

        kweek_days = []
        kweek_list = []
        all_group_student_count = 0

        request_data = request.data
        queryset = self.queryset

        # Ангийн жагсаалт
        group_data = request_data.get('group')
        lesson = request_data.get('lesson')

        # Хичээлийн жил улирал ирэхгүй бол
        lesson_year, lesson_season = get_active_year_season()

        teacher = request_data.get('teacher')
        time = request_data.get('time')
        day = request_data.get('day')
        room = request_data.get('room')
        odd_even = request_data.get('odd_even_list')
        st_count = request_data.get('st_count')
        support_teacher = request_data.get('support_teacher')

        if 'support_teacher' in request_data:
            del request_data['support_teacher']

        # Туслах багш
        if support_teacher:
            request_data['support_teacher'] = [support_teacher]

        # Энгийн хичээлийн хуваарь
        is_simple = request_data.get('is_simple')

        # block хичээлийн хуваарь
        is_block = request_data.get('is_block')
        begin_week = request_data.get('begin_week')
        end_week = request_data.get('end_week')

        # kurats хичээлийн хуваарь
        is_kurats = request_data.get('is_kurats')
        begin_date = request_data.get('begin_date')
        end_date = request_data.get('end_date')

        # Курац хуваарийн өдрүүдийн хэддүгээр 7 хоног вэ гэдгийн жагсаалт
        kweek_ids = []

        kurats_times = request_data.get('kurats_time')

        add_students = request_data.get('students')
        remove_students = request_data.get('remove_students')

        # Сонгон хичээл эсэх
        is_optional = request_data.get('is_optional')

        # Онлайн хичээл эсэх
        study_type = request_data.get('study_type')

        # Онлайнаар хичээл үзэх анги
        add_online_group = request_data.get('addgroup')

        if 'lesson_year' in request_data and not request_data['lesson_year']:
            request_data['lesson_year'] = lesson_year

        if 'lesson_season' in request_data and not request_data['lesson_season']:
            request_data['lesson_season'] = lesson_season

        if study_type != TimeTable.ONLINE and not is_kurats and not room:

            errors = get_error_obj("Хоосон байна.", 'room')
            if len(errors) > 0:
                return request.send_error("ERR_003", errors)

        if not is_kurats:
            qs_timetable = self.queryset.filter(lesson_year=lesson_year, lesson_season_id=lesson_season, day=day, time=time, odd_even__in=odd_even)

        # Курац байх үед сонгосон өдрүүдийн гаригууд, цагуудтай ижил хуваариудыг авна.
        if is_kurats:
            kweek_list = get_weekday_kurats_date(begin_date, end_date)
            for kweek in kweek_list:
                kweek_days.append(kweek.get('weekday'))
                kweek_ids.append(kweek.get('weekNum'))

            qs_timetable = self.queryset.filter(lesson_year=lesson_year, lesson_season_id=lesson_season, day__in=kweek_days, time__in=kurats_times, odd_even__in=odd_even, end_date__gt=begin_date, end_date__lt=end_date)

        timetable_ids = qs_timetable.values_list('id', flat=True)

        # Ангийн өгөгдлийг dataнаас устгах
        request_data = remove_key_from_dict(request_data, 'group')

        # Сонгон хичээл биш үед анги заавал бөглөх ёстой
        if not is_optional and not group_data:
            msg = "Хоосон байна"
            errors = get_error_obj(msg, 'group')
            if len(errors) > 0:
                return request.send_error("ERR_003", errors)

        request_data['created_user'] = user.id
        if not request_data.get('school'):
            lesson_data = LessonStandart.objects.get(id=lesson)
            if lesson_data and lesson_data.school:
                request_data['school'] = lesson_data.school.id if lesson_data else None

        serializer = self.get_serializer(data=request_data)
        if serializer.is_valid(raise_exception=False):

            group_ids = [item.get('id') for item in group_data]

            # Сонгосон ангийн тоог авах хэсэг
            group_student_count = Student.objects.filter(group_id__in=group_ids).count()
            all_group_student_count += group_student_count

            # Онлайнаар хичээл үзэх анги
            if len(add_online_group) > 0:
                add_online_group_ids = [item.get('id') for item in add_online_group]
                group_student_count = Student.objects.filter(group_id_in=add_online_group_ids).count()
                all_group_student_count += group_student_count

            if len(remove_students) > 0:
                all_group_student_count -= len(remove_students)

            if len(add_students) > 0:
                all_group_student_count += len(add_students)

            # Хуваарийн суралцагчдын тоо хуваарьд шивэгдсэн ангиудын хүүхдийн тооноос бага байгаа эсэх
            if all_group_student_count > int(st_count):
                msg = "Сонгосон ангиудын нийт оюутны тоо хуваарийн суралцагчийн тооноос хэтэрсэн байна."
                errors = get_error_obj(msg, 'st_count')
                if len(errors) > 0:
                    return request.send_error("ERR_003", errors)

            qs_teacher = qs_timetable.filter(teacher_id=teacher)

            # Багшийн давхцал
            if len(qs_teacher) > 0:
                teacher_obj = qs_teacher.last()
                lesson = teacher_obj.lesson.name
                time = teacher_obj.time
                day = teacher_obj.day

                msg = "Энэ багш нь {lesson} хичээлийн {day}-{time} дээр хуваарьтай байна.".format(lesson=lesson, day=day, time=time)

                errors = get_error_obj(msg, 'teacher')
                if len(errors) > 0:
                    return request.send_error("ERR_003", errors)

            # Өрөөний давхцал
            if study_type != TimeTable.ONLINE and room:
                qs_room = qs_timetable.filter(room_id=room)
                if len(qs_room) > 0:
                    room_obj = qs_room.last()
                    lesson = room_obj.lesson.name
                    msg = "Энэ өрөө нь {day}-{time} дээр {lesson} хичээлийн хуваарьтай байна.".format(lesson=lesson, day=day, time=time)

                    errors = get_error_obj(msg, 'room')
                    if len(errors) > 0:
                        return request.send_error("ERR_003", errors)

            # Block болон курац хуваарь үед тухайн сонгогдсон ангийн энгийн хичээлийн хуваарийн өдөр цагтай давхцаж байгааг шалгах
            if not is_simple:
                timetable_simple_ids = qs_timetable.filter(is_kurats=False, is_block=False).values_list('id', flat=True)
                for group in group_data:
                    group_id = group.get('id')

                    for timetable_id in timetable_simple_ids:
                        qs_kurats = TimeTable_to_group.objects.filter(group_id=group_id, timetable_id=timetable_id)
                        timetable_simple = TimeTable.objects.get(id=timetable_id)

                        if qs_kurats:
                            lesson_name = timetable_simple.lesson.name

                            day = timetable_simple.day
                            time = timetable_simple.time

                            msg = "{day}-{time} дээр {lesson_name} хичээлийн хуваарьтай давхцаж байна.".format(lesson_name=lesson_name, day=day, time=time)
                            if is_kurats:
                                key = 'begin_date'
                            else:
                                key = 'begin_week'

                            errors = get_error_obj(msg, key)

                            return request.send_error("ERR_003", errors)

            if not is_optional:
                # Онлайнаар хичээл үзэх ангийн хичээлийг давхар шалгана
                if len(add_online_group) > 0:
                    group_data = group_data + add_online_group

                for timetable_id in timetable_ids:
                    qs = self.queryset.get(pk=timetable_id)
                    # Сонгосон өдөр цагтай хуваариудын хичээлийн нэр
                    lesson = qs.lesson.name

                    for group in group_data:
                        group_id = group.get('id')

                        # Тухайн сонгосон анги сонгогдсон өдөр цаг дээр хичээлтэй байж болохгүй
                        qs_timetable_group = TimeTable_to_group.objects.filter(timetable_id=timetable_id, group_id=group_id)
                        if qs_timetable_group:
                            qs_groups = qs_timetable_group.last()
                            group_name = qs_groups.group.name
                            msg = "{group_name} анги нь {day}-{time} дээр {lesson} хичээлийн хуваарьтай байна.".format(group_name=group_name, lesson=lesson, day=day, time=time)
                            errors = get_error_obj(msg, 'group')
                            if len(errors) > 0:
                                return request.send_error("ERR_003", errors)

                # Block хуваарь нь сонгогдсон 7 хоногууд дээр тухайн анги хичээлтэй эсэх
                if is_block:
                    block_timetables = queryset.filter(lesson_year=lesson_year, lesson_season_id=lesson_season, is_block=True)

                    for btimetable in block_timetables:
                        lesson = btimetable.lesson.name

                        # Эхлэх 7 хоногоос дуусах 7 хоногуудын хоорондох 7 хоног бүрээр шалгах
                        for block_week in range(begin_week, end_week + 1):
                            for group in group_data:
                                group_id = group.get('id')
                                qs_timetable_group = TimeTable_to_group.objects.filter(timetable=btimetable, group_id=group_id).last()

                                if qs_timetable_group:
                                    group_name = qs_timetable_group.group.name

                                    t_begin_week = btimetable.begin_week
                                    t_end_week = btimetable.end_week

                                    if t_begin_week == block_week or t_end_week == block_week:
                                        key = 'begin_week'
                                        if block_week == end_week:
                                            key = 'end_week'

                                        msg = '{group_name} анги нь {day}-{time} дээр {block_week}-р 7 хоногт {lesson} хичээлийн хуваарьтай байна'.format(
                                            group_name=group_name,
                                            day=day,
                                            time=time,
                                            block_week=block_week,
                                            lesson=lesson
                                        )

                                        errors = get_error_obj(msg, key)
                                        if len(errors) > 0:
                                            return request.send_error("ERR_003", errors)

                # Нэмэлтээр судлаж байгаа оюутны хуваарийг шалгах
                if len(add_students) > 0:
                    qs_students = Student.objects.filter(id__in=add_students).values('group', 'code', 'id')

                    # Сонгосон ангийн оюутан нэмэлтээр элсэгч оюутнаар нэмэгдэж байгаа эсэх
                    for student in qs_students:
                        student_code = student.get('code')
                        student_group = student.get('group')
                        student_id = student.get('id')

                        # Нэмэлт элсэгчийн оюутны нэмэлт хуваарь болон хасалт хийлгэсэн байх queryset
                        qs_student = TimeTable_to_student.objects.filter(student_id=student_id)

                        # Сонгогдсон ангийн оюутан эсэхийг шалгах
                        if group_data:
                            for group in group_data:
                                obj_group = Group.objects.filter(pk=group.get('id')).last()

                                if group.get('id') == student_group:
                                    msg = "{student_code}-той оюутан нь {group_name} анги учир давхар хуваарь сонгох боломжгүй.".format(student_code=student_code, group_name=obj_group.name)

                                    error_obj = get_error_obj(msg, 'student')
                                    if len(error_obj) > 0:
                                        return request.send_error("ERR_003", error_obj)

                        for timetable_id in timetable_ids:
                            rm_timetable_id = ''
                            qs = TimeTable.objects.filter(pk=timetable_id).first()
                            lesson = qs.lesson.name # Давхардаж байгаа хичээлийн нэр

                            # Өөрөөсөө өөр нэмэлт хуваариуд
                            qs_student_timetable = qs_student.filter(add_flag=True, timetable_id=timetable_id)

                            if len(qs_student_timetable) > 0:
                                msg = "{student_code}-той оюутан нь {day}-{time} дээр {lesson} хичээлийн нэмэлт хуваарьтай байна.".format(student_code=student_code, lesson=lesson, day=day, time=time)
                                error_obj = get_error_obj(msg, 'student')
                                if len(error_obj) > 0:
                                    return request.send_error("ERR_003", error_obj)

                            # Тухайн оюутан ангийн хувиараасаа хасалт хийлгэсэн эсэх
                            qs_student_rm = qs_student.filter(add_flag=False).last()
                            if len(qs_student_rm) > 0:
                                rm_timetable_id = qs_student_rm.timetable_id # Нэмэлтээр судлаж байгаа оюутны хасалт хийлгэсэн хуваарь

                            # Хасалт хийлгээгүй үед л нэмэлтээр судалж байгаа оюутны ангийг тухайн хуваарь дээр хичээтэйг шалгана
                            if len(qs_student_rm) > 0 and rm_timetable_id != timetable_id:

                                qs_timetable_group = TimeTable_to_group.objects.filter(timetable_id=timetable_id, group_id=student_group).last()
                                student_group_qs = Group.objects.filter(id=student_group).last()

                                if len(qs_timetable_group) > 0:
                                    msg = "{student_code}-той оюутны {group_name} анги нь {day}-{time} дээр {lesson} хичээлийн хуваарьтай байна.".format(student_code=student_code, group_name=student_group_qs.name, lesson=lesson, day=day, time=time)
                                    error_obj = get_error_obj(msg, 'student')
                                    if len(error_obj) > 0:
                                        return request.send_error("ERR_003", error_obj)

                    # Сонгоогүй ангийн оюутан хасалт хийлгэсэн  эсэхийг шалгах
                    if len(remove_students) > 0:
                        qs_rm_students = Student.objects.filter(id__in=remove_students).values('group', 'code')
                        for rm_students in qs_rm_students:
                            student_rm_code = rm_students.get('code')
                            student_rm_group = rm_students.get('group')

                            if len(group_data) > 0:
                                group_ids = [item.get('id') for item in group_data]

                                if student_rm_group not in group_ids:
                                    msg = "{student_code}-той оюутан нь сонгогдсон ангийн оюутан биш учир хуваариас хасалт хийх боломжгүй.".format(student_code=student_rm_code)
                                    error_obj = get_error_obj(msg, 'exclude_student')
                                    if len(error_obj) > 0:
                                        return request.send_error("ERR_003", error_obj)
            end_time(st_time, 'Шалгалт хийж дуусах хугацаа')
            try:
                with transaction.atomic():
                    # Тухайн хичээлийн хуваарьт байгаа багш хичээл холбогдоогүй бол шинээр үүсгэх
                    qs_lesson_teacher = Lesson_to_teacher.objects.filter(lesson=request_data.get('lesson'), teacher=request_data.get('teacher'))
                    if len(qs_lesson_teacher) == 0:

                        Lesson_to_teacher.objects.create(
                            lesson_id=request_data.get('lesson'),
                            teacher_id=request_data.get('teacher')
                        )

                    if study_type == TimeTable.COMBINED and len(add_online_group) > 0:
                        group_data = magicFunction(group_data, add_online_group)

                    if is_kurats:
                        kurats_ids = []
                        for kweek in kweek_list:
                            kday = kweek.get('weekday')
                            weekNum = kweek.get('weekNum')
                            for ktime in kurats_times:
                                request_data['day'] = kday
                                request_data['time'] = ktime
                                request_data['week_number'] = weekNum

                                kserializer = self.get_serializer(data=request_data)
                                kserializer.is_valid(raise_exception=True)

                                self.perform_create(kserializer)

                                table_data = kserializer.data

                                # Цагийн хуваарийн хүснэгтийн id
                                table_id = table_data.get('id')
                                kurats_ids.append(table_id)

                                # Хуваарь дээр ангиуд шивэх хэсэг
                                if len(group_data) > 0:
                                    group_datas = []
                                    for row in group_data:
                                        group_id = row.get("id")
                                        group_datas.append(
                                            TimeTable_to_group(
                                                group_id=row.get("id"),
                                                timetable_id=table_id
                                            )
                                        )

                                    TimeTable_to_group.objects.bulk_create(group_datas)

                                # Онлайнаар үзэж байгаа ангиудыг хадгалах
                                if len(add_online_group) > 0:
                                    add_online_group_datas = []
                                    for row in add_online_group:
                                        add_online_group_datas.append(
                                            TimeTable_to_group(
                                                group_id=row.get("id"),
                                                timetable_id=table_id,
                                                is_online = True
                                            )
                                        )

                                    TimeTable_to_group.objects.bulk_create(add_online_group_datas)

                                # Нэмэлтээр үзэж байгаа оюутан
                                if len(add_students) > 0:
                                    add_students_datas = []
                                    for student in add_students:
                                        add_students_datas.append(
                                            TimeTable_to_student(
                                                timetable_id = table_id,
                                                student_id = student,
                                                add_flag = True
                                            )
                                        )

                                    TimeTable_to_student.objects.bulk_create(add_students_datas)

                                # Хувиараас хасалт хийлгэж байгаа оюутан
                                if len(remove_students) > 0:
                                    remove_students_datas = []
                                    for rstudent in remove_students:
                                        remove_students_datas.append(
                                            TimeTable_to_student(
                                                timetable_id = table_id,
                                                student_id = rstudent,
                                                add_flag = False
                                            )
                                        )

                                    TimeTable_to_student.objects.bulk_create(remove_students_datas)

                        # Курац parent ids хадгалах
                        parent_id = kurats_ids[0]

                        qs_timetable = TimeTable.objects.filter(id__in=kurats_ids).update(
                            parent_kurats=parent_id
                        )
                    else:
                        table_data = self.create(request).data

                        # Цагийн хуваарийн хүснэгтийн id
                        table_id=table_data.get('id')

                        # Хуваарь дээр ангиуд шивэх хэсэг
                        if len(group_data) > 0:
                            group_datas = []

                            for row in group_data:
                                group_id = row.get("id")
                                group_datas.append(
                                    TimeTable_to_group(
                                        group_id=row.get("id"),
                                        timetable_id=table_id
                                    )
                                )

                            TimeTable_to_group.objects.bulk_create(group_datas)

                        # Онлайнаар үзэж байгаа ангиудыг хадгалах
                        if len(add_online_group) > 0:
                            add_online_group_datas = []
                            for row in add_online_group:
                                add_online_group_datas.append(
                                    TimeTable_to_group(
                                        group_id=row.get("id"),
                                        timetable_id=table_id,
                                        is_online = True
                                    )
                                )

                            TimeTable_to_group.objects.bulk_create(add_online_group_datas)

                        # Нэмэлтээр үзэж байгаа оюутан
                        if len(add_students) > 0:
                            add_students_datas = []
                            for student in add_students:
                                add_students_datas.append(
                                    TimeTable_to_student(
                                        timetable_id = table_id,
                                        student_id = student,
                                        add_flag = True
                                    )
                                )

                            TimeTable_to_student.objects.bulk_create(add_students_datas)

                        # Хувиараас хасалт хийлгэж байгаа оюутан
                        if len(remove_students) > 0:
                            remove_students_datas = []
                            for rstudent in remove_students:
                                remove_students_datas.append(
                                    TimeTable_to_student(
                                        timetable_id = table_id,
                                        student_id = rstudent,
                                        add_flag = False
                                    )
                                )

                            TimeTable_to_student.objects.bulk_create(remove_students_datas)

                    end_time(st_time, 'Хадгалах хугацаа')
                    return request.send_info("INF_001")
            except Exception as e:
                print(e)
                return request.send_error("ERR_002", "Хичээлийн хуваарь давхцаж байна.")
        else:
            print(serializer.errors)
            # Олон алдааны мессэж буцаах бол үүнийг ашиглана
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

    @has_permission(must_permissions=['lms-timetable-register-update'])
    def put(self, request, pk=None):
        "  Цагийн хуваарь засах "

        errors = []
        kweek_days = []
        kweek_list = []
        all_group_student_count = 0
        user = request.user

        request_data = request.data

        request_data['updated_user'] = user.id
        request_data['updated_at'] = timezone.now()

        instance = TimeTable.objects.get(pk=pk)

        old_potok = instance.potok
        old_lesson = instance.lesson

        lesson = request_data.get('lesson')

        teacher = request_data.get('teacher')
        time = request_data.get('time')
        day = request_data.get('day')
        room = request_data.get('room')
        odd_even = request_data.get('odd_even_list')
        st_count = request_data.get('st_count')

        support_teacher = request_data.get('support_teacher')

        if 'support_teacher' in request_data:
            del request_data['support_teacher']

        # Туслах багш
        if support_teacher:
            request_data['support_teacher'] = [support_teacher]
        elif instance.support_teacher and not support_teacher:
            request_data['support_teacher'] = []

        lesson_year, lesson_season = get_active_year_season()

        # Энгийн хичээлийн хуваарь
        is_simple = request_data.get('is_simple')

        # block хичээлийн хуваарь
        is_block = request_data.get('is_block')
        begin_week = request_data.get('begin_week')
        end_week = request_data.get('end_week')
        study_type = request_data.get('study_type')

        # kurats хичээлийн хуваарь
        is_kurats = request_data.get('is_kurats')
        begin_date = request_data.get('begin_date')
        end_date = request_data.get('end_date')
        kurats_times = request_data.get('kurats_time')

        # Нэмэлтээр судлаж буй оюутнууд
        add_students = request_data.get('add_students')
        remove_students = request_data.get('remove_students')

        # Орж ирсэн group ids
        new_group_ids = []

        # Ангийн жагсаалт
        group_data = request_data.get('group')

        # Сонгон хичээл эсэх
        is_optional = request_data.get('is_optional')

        # Хуучин курац хуваарийн ids
        old_timetable_ids = TimeTable.objects.filter(is_kurats=True, potok=old_potok, lesson=old_lesson).values_list('id', flat=True)

        if study_type != TimeTable.ONLINE and not room:

            errors = get_error_obj("Хоосон байна.", 'room')
            if len(errors) > 0:
                return request.send_error("ERR_003", errors)

        # Курац байх үед сонгосон өдрүүдийн гаригууд, цагуудтай ижил хуваариудыг авна.
        if is_kurats:
            queryset = self.queryset.exclude(id__in=old_timetable_ids)

            kweek_list = get_weekday_kurats_date(begin_date, end_date)
            for kweek in kweek_list:
                kweek_days.append(kweek.get('weekday'))

                qs_timetable = queryset.filter(lesson_year=lesson_year, lesson_season_id=lesson_season, day__in=kweek_days, time__in=kurats_times, odd_even__in=odd_even)

        else:
            queryset = self.queryset.exclude(id=pk)

            qs_timetable = queryset.filter(lesson_year=lesson_year, lesson_season_id=lesson_season, day=day, time=time, odd_even__in=odd_even)

        timetable_ids = qs_timetable.values_list('id', flat=True)

        # Ангийн өгөгдлийг dataнаас устгах
        request_data = remove_key_from_dict(request_data, 'group')

        # Сонгон хичээл биш үед анги заавал бөглөх ёстой
        if not is_optional and not group_data:
            msg = "Хоосон байна"
            error_obj = get_error_obj(msg, 'group')
            if len(error_obj) > 0:
                return request.send_error("ERR_003", error_obj)

        serializer = self.get_serializer(instance, data=request_data)

        if serializer.is_valid(raise_exception=False):

            # Сонгосон ангийн тоог авах хэсэг
            group_ids = [item.get('id') for item in group_data]
            group_student_count = Student.objects.filter(group_id__in=group_ids).count()
            all_group_student_count += group_student_count

            if remove_students:
                all_group_student_count -= len(remove_students)

            if add_students:
                all_group_student_count += len(add_students)

            # Хуваарийн суралцагчдын тоо хуваарьд шивэгдсэн ангиудын хүүхдийн тооноос бага байгаа эсэх
            if st_count and all_group_student_count > int(st_count):
                msg = "Сонгосон ангиудын нийт оюутны тоо хуваарийн суралцагчийн тооноос хэтэрсэн байна."
                errors = get_error_obj(msg, 'st_count')
                if len(errors) > 0:
                    return request.send_error("ERR_003", errors)

            qs_teacher = qs_timetable.filter(teacher_id=teacher).first()
            qs_room = queryset.filter(lesson_year=lesson_year, lesson_season_id=lesson_season, room_id=room, day=day, time=time).first()

            # Тухайн багшийн давхцлыг шалгах
            if qs_teacher != None:
                lesson = qs_teacher.lesson.name
                time = qs_teacher.time
                day = qs_teacher.day

                msg = "Энэ багш нь {lesson} хичээлийн {day}-{time} дээр хуваарьтай байна.".format(lesson=lesson, day=day, time=time)

                error_obj = get_error_obj(msg, 'teacher')
                if len(error_obj) > 0:
                    return request.send_error("ERR_003", error_obj)

            # Тухайн өрөөний давхцлыг шалгах
            if not is_kurats and len(qs_timetable) > 0:
                qs_room = qs_timetable.filter(room_id=room).first()
                if qs_room:
                    lesson = qs_room.lesson.name
                    msg = "Энэ өрөө нь {day}-{time} дээр {lesson} хичээлийн хуваарьтай байна.".format(lesson=lesson, day=day, time=time)

                    error_obj = get_error_obj(msg, 'room')
                    if len(error_obj) > 0:
                        return request.send_error("ERR_003", error_obj)

            # Block болон курац хуваарь үед тухайн сонгогдсон ангийн энгийн хичээлийн хуваарийн өдөр цагтай давхцаж байгааг шалгах
            if not is_simple:
                timetable_simple_ids = qs_timetable.filter(is_kurats=False, is_block=False).values_list('id', flat=True)
                for group in group_data:

                    qs_kurats_group = TimeTable_to_group.objects.filter(group_id=group.get('id'), timetable_id__in=timetable_simple_ids)
                    timetable_simple = TimeTable.objects.exclude(id=pk).filter(id__in=timetable_simple_ids).last()

                    if len(qs_kurats_group) > 0:
                        lesson_name = timetable_simple.lesson.name

                        day = timetable_simple.day
                        time = timetable_simple.time

                        msg = "{day}-{time} дээр {lesson_name} хичээлийн хуваарьтай давхцаж байна.".format(lesson_name=lesson_name, day=day, time=time)
                        if is_kurats:
                            key = 'begin_date'
                        else:
                            key = 'begin_week'

                        errors = get_error_obj(msg, key)

                        return request.send_error("ERR_003", errors)

            # Сонгон хичээл биш тухайн ангийн хичээлийн хуваарийн давхцалыг шалгах
            if not is_optional and len(timetable_ids) > 0:
                qs = queryset.filter(id__in=timetable_ids).first()

                # Сонгосон өдөр цагтай хуваариудын хичээлийн нэр
                lesson = qs.lesson.name

                for group in group_data:
                    group_id = group.get('id')

                    # Тухайн сонгосон анги сонгогдсон өдөр цаг дээр хичээлтэй байж болохгүй
                    qs_timetable_group = TimeTable_to_group.objects.filter(timetable_id=qs.id, group_id=group_id).first()
                    if qs_timetable_group != None:
                        group_name = qs_timetable_group.group.name
                        msg = "{group_name} анги нь {day}-{time} дээр {lesson} хичээлийн хуваарьтай байна.".format(group_name=group_name, lesson=lesson, day=day, time=time)
                        errors = get_error_obj(msg, 'group')
                        if len(errors) > 0:
                            return request.send_error("ERR_003", errors)

                # Block хуваарь нь сонгогдсон 7 хоногууд дээр тухайн анги хичээлтэй эсэх
                if is_block:
                    block_timetables = queryset.filter(lesson_year=lesson_year, lesson_season_id=lesson_season, is_block=True)

                    for btimetable in block_timetables:
                        lesson = btimetable.lesson.name

                        # Эхлэх 7 хоногоос дуусах 7 хоногуудын хоорондох 7 хоног бүрээр шалгах
                        for block_week in range(begin_week, end_week + 1):
                            for group in group_data:
                                group_id = group.get('id')
                                qs_timetable_group = TimeTable_to_group.objects.filter(timetable=btimetable, group_id=group_id).first()

                                if len(qs_timetable_group) > 0:
                                    group_name = qs_timetable_group.group.name

                                    t_begin_week = btimetable.begin_week
                                    t_end_week = btimetable.end_week

                                    if t_begin_week == block_week or t_end_week == block_week:
                                        key = 'begin_week'
                                        if block_week == end_week:
                                            key = 'end_week'

                                        msg = '{group_name} анги нь {day}-{time} дээр {block_week}-р 7 хоногт {lesson} хичээлийн хуваарьтай байна'.format(
                                            group_name=group_name,
                                            day=day,
                                            time=time,
                                            block_week=block_week,
                                            lesson=lesson
                                        )

                                        errors = get_error_obj(msg, key)
                                        if len(errors) > 0:
                                            return request.send_error("ERR_003", errors)

                # Нэмэлтээр судлаж байгаа оюутны хуваарийг шалгах
                if add_students:
                    qs_students = Student.objects.filter(id__in=add_students).values('group', 'code', 'id')

                    # Сонгосон ангийн оюутан нэмэлтээр элсэгч оюутнаар нэмэгдэж байгаа эсэх
                    for student in qs_students:
                        student_code = student.get('code')
                        student_group = student.get('group')
                        student_id = student.get('id')

                        # Нэмэлт элсэгчийн оюутны нэмэлт хуваарь болон хасалт хийлгэсэн байх queryset
                        qs_student = TimeTable_to_student.objects.filter(student_id=student_id)

                        # Сонгогдсон ангийн оюутан эсэхийг шалгах
                        if group_data:
                            for group in group_data:
                                sgroup_id = group.get('id')
                                obj_group = qs_group.filter(pk=group.get('id')).first()

                                if sgroup_id == student_group:
                                    msg = "{student_code}-той оюутан нь {group_name} анги учир давхар хуваарь сонгох боломжгүй.".format(student_code=student_code, group_name=obj_group.name)

                                    error_obj = get_error_obj(msg, 'student')
                                    if len(error_obj) > 0:
                                        return request.send_error("ERR_003", error_obj)

                        for timetable_id in timetable_ids:
                            rm_timetable_id = ''

                            qs = TimeTable.objects.filter(pk=timetable_id).first()
                            lesson = qs.lesson.name # Давхардаж байгаа хичээлийн нэр

                            # Өөрөөсөө өөр нэмэлт хуваариуд
                            qs_student_timetable = qs_student.exclude(timetable_id=pk).filter(add_flag=True, timetable_id=timetable_id)

                            if len(qs_student_timetable) > 0:
                                msg = "{student_code}-той оюутан нь {day}-{time} дээр {lesson} хичээлийн нэмэлт хуваарьтай байна.".format(student_code=student_code, lesson=lesson, day=day, time=time)
                                error_obj = get_error_obj(msg, 'student')
                                if len(error_obj) > 0:
                                    return request.send_error("ERR_003", error_obj)

                            # Тухайн оюутан ангийн хувиараасаа хасалт хийлгэсэн эсэх
                            qs_student_rm = qs_student.exclude(timetable_id=pk).filter(add_flag=False).first()
                            if qs_student_rm != None:
                                rm_timetable_id = qs_student_rm.timetable_id # Нэмэлтээр судлаж байгаа оюутны хасалт хийлгэсэн хуваарь

                            # Хасалт хийлгээгүй үед л нэмэлтээр судалж байгаа оюутны ангийг тухайн хуваарь дээр хичээлтэйг шалгана
                            if qs_student_rm != None and rm_timetable_id != timetable_id:

                                qs_timetable = TimeTable_to_group.objects.filter(timetable_id=timetable_id, group_id=student_group).first()
                                student_group_qs = qs_group.filter(id=student_group).first()

                                if qs_timetable != None:
                                    msg = "{student_code}-той оюутны {group_name} анги нь {day}-{time} дээр {lesson} хичээлийн хуваарьтай байна.".format(student_code=student_code, group_name=student_group_qs.name, lesson=lesson, day=day, time=time)
                                    error_obj = get_error_obj(msg, 'student')
                                    if len(error_obj) > 0:
                                        return request.send_error("ERR_003", error_obj)

                # Сонгоогүй ангийн оюутан хасалт хийлгэсэн  эсэхийг шалгах
                if remove_students:
                    qs_rm_students = Student.objects.filter(id__in=remove_students).values('group', 'code')
                    for rm_students in qs_rm_students:
                        student_rm_code = rm_students.get('code')
                        student_rm_group = rm_students.get('group')

                        if group_data:
                            group_ids = []
                            for group in group_data:
                                group_ids.append(group.get('id'))

                            if student_rm_group not in group_ids:
                                msg = "{student_code}-той оюутан нь сонгогдсон ангийн оюутан биш учир хуваариас хасалт хийх боломжгүй.".format(student_code=student_rm_code)
                                error_obj = get_error_obj(msg, 'exclude_student')
                                if len(error_obj) > 0:
                                    return request.send_error("ERR_003", error_obj)

            try:
                with transaction.atomic():
                    # Тухайн хичээлийн хуваарьт байгаа багш хичээл холбогдоогүй бол шинээр үүсгэх
                    qs_lesson_teacher = Lesson_to_teacher.objects.filter(lesson=request_data.get('lesson'), teacher=request_data.get('teacher'))

                    if len(qs_lesson_teacher) == 0:
                        Lesson_to_teacher.objects.create(
                            lesson_id=request_data.get('lesson'),
                            teacher_id=request_data.get('teacher')
                        )

                    # Цагийн хуваарийн хүснэгтийн id
                    qs = TimeTable_to_group.objects.filter(timetable_id=pk)
                    qs_stu = TimeTable_to_student.objects.filter(timetable_id=pk)

                    # Хуучин ангийн ids
                    old_group_ids = list(qs.values_list('group', flat=True))

                    students_ids = qs_stu.filter(add_flag=False).values_list('student', flat=True)
                    student_group_ids = Student.objects.filter(id__in=students_ids).values('group', 'id')
                    kurats_ids = []
                    if is_kurats:
                        if len(old_timetable_ids) > 0:
                            old_queysets = TimeTable.objects.filter(id__in=old_timetable_ids)
                            if old_queysets:
                                old_queysets.delete()

                                request_data = remove_key_from_dict(request_data, ['event_id', 'parent_kurats'])

                        for kweek in kweek_list:
                            kday = kweek.get('weekday')

                            for ktime in kurats_times:
                                request_data['day'] = kday
                                request_data['time'] = ktime

                                kserializer = TimeTableSerializer(data=request_data)

                                kserializer.is_valid(raise_exception=True)

                                self.perform_create(kserializer)

                                table_data = kserializer.data

                                # Цагийн хуваарийн хүснэгтийн id
                                table_id = table_data.get('id')
                                kurats_ids.append(table_id)

                                # Хувиараас хасалт хийлгэж байгаа оюутан хадгалах хэсэг
                                if remove_students:
                                    add_remove_students = []
                                    for rstudent in remove_students:
                                        add_remove_students.append(
                                            TimeTable_to_student(
                                                timetable_id = table_id,
                                                student_id = rstudent,
                                                add_flag = False
                                            )
                                        )

                                    TimeTable_to_student.objects.bulk_create(add_remove_students)

                                # Хуваарь дээр ангиуд шивэх хэсэг
                                if group_data:
                                    group_add_datas = []
                                    for row in group_data:
                                        group_add_datas.append(
                                            TimeTable_to_group(
                                                timetable_id = table_id,
                                                group_id =  row.get("id")
                                            )
                                        )

                                    TimeTable_to_group.objects.bulk_create(group_add_datas)

                                # Нэмэлтээр үзэж байгаа оюутан хадгалах хэсэг
                                if add_students:
                                    add_students_datas = []
                                    for student in add_students:
                                        add_students_datas.append(
                                            TimeTable_to_student(
                                                timetable_id = table_id,
                                                student_id = student,
                                                add_flag = True
                                            )
                                        )
                                    TimeTable_to_student.objects.bulk_create(add_students_datas)

                        # Курац parent ids хадгалах
                        parent_id = kurats_ids[0]

                        qs_timetable = TimeTable.objects.filter(id__in=kurats_ids).update(
                            parent_kurats=parent_id
                        )

                    else:
                        # self.update(request).data
                        self.perform_update(serializer)

                        # Цагийн хуваарийн хүснэгтийн id
                        qs = TimeTable_to_group.objects.filter(timetable_id=pk)
                        qs_stu = TimeTable_to_student.objects.filter(timetable_id=pk)

                        # Хуучин ангийн ids
                        old_group_ids = list(qs.values_list('group', flat=True))

                        students_ids = qs_stu.filter(add_flag=False).values_list('student', flat=True)
                        student_group_ids = Student.objects.filter(id__in=students_ids).values('group', 'id')

                        # Хувиараас хасалт хийлгэж байгаа оюутан
                        if remove_students:
                            qs_rm_stu = qs_stu.filter(add_flag=False)

                            # Хуучин хасалт хийгдсэн оюутны ids
                            old_remove_ids = list(qs_rm_stu.values_list('student', flat=True))

                            # Хасалт хийлгэж байгааг оюутныг хадгалах хэсэг
                            remove_student_data = []
                            for rstudent in remove_students:
                                student_qs = qs_rm_stu.filter(student_id=rstudent).last()
                                if student_qs != None:
                                    remove_student_data.append(
                                        TimeTable_to_student(
                                            timetable_id = pk,
                                            student_id = rstudent,
                                            add_flag = False
                                        )
                                    )
                            if len(remove_student_data) > 0:
                                TimeTable_to_student.objects.bulk_create(remove_student_data)

                            # Хасалт хийлгэж байгаа оюутан өөрчлөгдсөн бол устгах хэсэг
                            for old_rm_id in old_remove_ids:
                                if not (old_rm_id in remove_students):
                                    obj_rm = qs_rm_stu.filter(student_id=old_rm_id)
                                    if obj_rm:
                                        obj_rm.delete()
                        else:
                            qs_stu.filter(add_flag=False).delete()

                        # Хуваарь дээр ангиуд шивэх хэсэг
                        if len(group_data) > 0:
                            for row in group_data:
                                group_id = row.get("id")
                                new_group_ids.append(group_id)

                                qs_timegroup = qs.filter(group_id=group_id)

                                if len(qs_timegroup) == 0:
                                    obj = TimeTable_to_group.objects.create(
                                        timetable_id = pk,
                                        group_id =  group_id
                                    )

                            for old_group_id in old_group_ids:
                                if not (old_group_id in  new_group_ids):
                                    qs_group = qs.filter(group_id=old_group_id)

                                    if len(qs_group) > 0:
                                        qs_group.delete()

                                    for student in student_group_ids:
                                        student_group_id = student.get('group')
                                        student_id = student.get('id')

                                        if old_group_id == student_group_id:
                                            qs_rm  = qs_stu.filter(student_id=student_id, add_flag=False)
                                            if len(qs_rm) > 0:
                                                qs_rm.delete()
                        else:
                            qs.delete()

                            # Анги устгах үед хасалт хийгдсэн оюутнууд устгагдана
                            for student in student_group_ids:
                                student_group_id = student.get('group')
                                student_id = student.get('id')

                                for old_group_id in old_group_ids:
                                    if old_group_id == student_group_id:
                                        qs_rm  = qs_stu.filter(student_id=student_id, add_flag=False)
                                        if len(qs_rm) > 0:
                                            qs_rm.delete()


                        # Нэмэлтээр үзэж байгаа оюутан
                        if add_students:
                            qs_add_stu = qs_stu.filter(add_flag=True)

                            # Хуучин оюутны ids
                            old_stu_ids = list(qs_add_stu.values_list('student', flat=True))

                            # Нэмэлтээр хуваарь сонгож байгаа оюутныг хадгалах хэсэг
                            for student in add_students:
                                student_qs = qs_add_stu.filter(student_id=student).last()
                                if student_qs != None:
                                    obj = TimeTable_to_student.objects.create(
                                        timetable_id = pk,
                                        student_id = student,
                                        add_flag = True
                                    )

                            # Нэмэлтээр хуваарь сонгож байгаа өөрчлөгдсөн бол устгах хэсэг
                            for old_stu_id in old_stu_ids:
                                if not (old_stu_id in add_students):
                                    obj_add_stu = qs_add_stu.filter(student_id=old_stu_id)
                                    if len(obj_add_stu) > 0:
                                        obj_add_stu.delete()
                        else:
                            qs_stu.filter(add_flag=True).delete()

                    return request.send_info("INF_002")
            except Exception as e:
                print(e)
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

    @has_permission(must_permissions=['lms-timetable-register-delete'])
    def delete(self, request, pk=None):
        "  Цагийн хуваарь устгах "

        self.destroy(request, pk)

        return request.send_info("INF_003")


@permission_classes([IsAuthenticated])
class ExamTimeTableAPIView(
    mixins.CreateModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    mixins.RetrieveModelMixin,
    mixins.ListModelMixin,
    generics.GenericAPIView
):
    """ Шалгалтын хуваарь """

    queryset = ExamTimeTable.objects.all().order_by('begin_date')
    serializer_class = ExamTimeTableSerializer

    pagination_class = CustomPagination

    filter_backends = [SearchFilter]
    search_fields = ['lesson__name', 'room__name',  'room__code', 'lesson__code']

    def get_queryset(self):
        queryset = self.queryset
        year, season = get_active_year_season()

        day = self.request.query_params.get('day')
        stype = self.request.query_params.get('stype')
        lesson = self.request.query_params.get('lesson')
        teacher = self.request.query_params.get('teacher')
        time = self.request.query_params.get('time')
        school = self.request.query_params.get('school')

        queryset = queryset.filter(lesson_year=year, lesson_season=season)

        # Өдрөөр хайлт хийх
        if day:
            queryset = queryset.filter(day=day)

        # Хичээлээр хайлт хийх
        if lesson:
            queryset = queryset.filter(lesson=lesson)

        # Багшаар хайлт хийх
        if teacher:
            queryset = queryset.filter(teacher__in=[teacher])

        # Цагаар хайлт хийх
        if time:
            queryset = queryset.filter(time=time)

        # Сургуулиар хайлт хийх
        if school:
            exam_ids = Exam_to_group.objects.filter(group__school=school).values_list('exam', flat=True)
            queryset = queryset.filter(id__in=exam_ids)

        # Төрлөөр хайх хайлт хийх
        if stype:

            queryset = queryset.filter(stype=stype)

        return queryset

    @has_permission(must_permissions=['lms-timetable-exam-read'])
    def get(self, request, pk=None):
        " Шалгалтын хуваарь жагсаалт "

        self.serializer_class = ExamTimeTableAllSerializer

        if pk:
            self.serializer_class = ExamTimeTableListSerializer
            standart = self.retrieve(request, pk).data
            return request.send_data(standart)

        less_standart_list = self.list(request).data
        return request.send_data(less_standart_list)

    @has_permission(must_permissions=['lms-timetable-exam-create'])
    @transaction.atomic
    def post(self, request):
        " Шалгалтын хуваарь шинээр үүсгэх "

        error_obj = []
        request_data = request.data
        sid = transaction.savepoint()

        # Оюутаны жагсаалт
        # student_data = request_data.get('student')

        # room = request_data.get('room')
        # lesson = request_data.get('lesson')
        # school = request_data.get('school')

        teachers = request_data.get('teacher')
        # lesson_year = request_data.get('lesson_year')
        # lesson_season = request_data.get('lesson_season')
        end_datetime = request_data.get('end_date')
        begin_datetime = request_data.get('begin_date')
        groups = request_data.get('group')

        begin_datetime = datetime.fromisoformat(begin_datetime)
        end_datetime = datetime.fromisoformat(end_datetime)

        # Group dataнаас оюутан устгах
        if 'student' in request_data:
            request_data = remove_key_from_dict(request_data, 'student')

        if 'group' in request_data:
            del request_data['group']

        serializer = self.get_serializer(data=request_data)
        def is_overlapping(dts,dte,dts2,dte2):
            if dts == None and dte == None:

                return False

            elif dts == None:
                if dts2 > dte:

                    return False
                else:

                    return True

            elif dte == None:
                if dte2 < dts:

                    return False
                else:

                    return True

            elif dte2 < dts or dts2 > dte:

                return False

            else:

                return True

        school = Group.objects.filter(id__in=groups).values_list('school', flat=True).first()
        request_data['school'] = school

        try:
            if serializer.is_valid(raise_exception=False):
                # exam_table_qs = (
                #     ExamTimeTable.objects
                #         .filter(
                #             school=school,
                #             lesson_year=lesson_year,
                #             lesson_season=lesson_season
                #         )
                #         .exclude(Q(begin_date__gt=end_datetime)|Q(end_date__lt=begin_datetime))
                # )

                # qs_exam_teacher = exam_table_qs.filter(teacher__in=teachers)

                # qs_exam_room = exam_table_qs.filter(room=room)

                # qs_exam_lesson = exam_table_qs.filter(lesson=lesson).last()

                # # Тухайн хичээлийн жил, улирал, "selected datetime range" шалгалтын хуваарийн жагсаалт
                # qs_examtimetable_ids = exam_table_qs.values_list(
                #         'id',
                #         flat=True
                #     ).distinct()

                # Шалгалтыг хянах багшийн хуваарь давхцаж байгаа эсэхийг шалгана
                # NOTE ДХИС хүсэлтээр болиулав
                # if qs_exam_teacher:
                #     qs_exam_teacher_times = qs_exam_teacher.values(
                #             'begin_date',
                #             'end_date',
                #             'lesson__name'
                #         )

                #     for teacher in qs_exam_teacher_times:
                #         start = teacher.get('begin_date')
                #         end = teacher.get('end_date')

                #         if is_overlapping(start,end,begin_datetime,end_datetime):
                #             lesson = teacher.get('lesson__name')

                #             msg = "Энэ багш нь {lesson} хичээлийн {exam_date} өдрийн {begin_time}-{end_time} цагийн хооронд шалгалттай байна." \
                #                 .format(
                #                     lesson=lesson,
                #                     exam_date=start.date(),
                #                     begin_time=start,
                #                     end_time=end
                #                 )

                #             error_obj = get_error_obj(msg, 'teacher')

                # # Шалгалт авах өрөө давхцаж байгаа эсэхийг шалгана
                # if qs_exam_room and not request_data.get('is_online'):
                #     qs_exam_rooms = qs_exam_room.values(
                #             'begin_date',
                #             'end_date',
                #             'lesson__name'
                #         )

                #     for rooms in qs_exam_rooms:
                #         start = rooms.get('begin_date')
                #         end = rooms.get('end_date')

                #         if is_overlapping(start,end,begin_datetime,end_datetime):
                #             lesson = rooms.get('lesson__name')

                #             msg = "Энэ өрөө нь {exam_date} өдрийн {begin_time}-{end_time} цагийн хооронд {lesson} хичээлийн шалгалттай байна." \
                #                 .format(
                #                     lesson=lesson,
                #                     exam_date=start.date(),
                #                     begin_time=start,
                #                     end_time=end
                #                 )

                #             error_obj = get_error_obj(msg, 'room')

                # NOTE ангийн шалгалтын хуваарийн давхцлыг шалгах
                # if groups and qs_examtimetable_ids:

                # # Оюутаны цаг давхцаж байгаа эсэхийг шалгана
                # if student_data and qs_examtimetable_ids:
                    # for exam_timetable_id in qs_examtimetable_ids:
                    #     exam_qs = ExamTimeTable.objects.filter(
                    #             pk=exam_timetable_id
                    #         ).first()

                    #     lesson = exam_qs.lesson.name
                    #     start = exam_qs.begin_date
                    #     end = exam_qs.end_date
                    #     students = []

                    #     for student_id in student_data:
                    #         qs = Exam_to_group.objects.filter(
                    #                 exam=exam_timetable_id,
                    #                 student=student_id
                    #             )

                    #         if qs:
                    #             for stu in qs:
                    #                 student_code = stu.student.code
                    #                 if student_code not in students:
                    #                     students.append(student_code)

                    #             if is_overlapping(start,end,begin_datetime,end_datetime):
                    #                 if students:
                    #                     msg = '''{student_code} кодтой {text} {exam_date} өдрийн {begin_time}-{end_time} цагийн хооронд {lesson} хичээлийн шалгалттай байна.''' \
                    #                         .format(
                    #                             student_code=', '.join(['{}'.format(f) for f in students]),
                    #                             lesson=lesson,
                    #                             exam_date=start.date(),
                    #                             begin_time=start,
                    #                             end_time=end,
                    #                             text='оюутнууд' if len(students) > 1 else 'оюутан'
                    #                         )

                    #                     error_obj = get_error_obj(msg, 'student')

                # Тухайн хичээлийн шалгалтыг нэг цагт авч буй эсэхийг шалгана
                # if qs_exam_lesson:
                #     start = qs_exam_lesson.begin_date
                #     end = qs_exam_lesson.end_date
                #     lesson = qs_exam_lesson.lesson.name

                #     if is_overlapping(start,end,begin_datetime,end_datetime):
                #         msg = '''{lesson} хичээлийн шалгалт {exam_date} өдрийн {begin_time}-{end_time} цагийн хооронд байна.''' \
                #             .format(
                #                 lesson=lesson,
                #                 exam_date=start.date(),
                #                 begin_time=start,
                #                 end_time=end
                #             )

                #         error_obj = get_error_obj(msg, 'lesson')

                # if len(error_obj) > 0:

                #     return request.send_error("ERR_003", error_obj)

                create_groups = []
                try:
                    with transaction.atomic():
                        exam_data = self.create(request).data

                        # Шалгалтын хуваарийн хүснэгтийн id
                        exam_table_id = exam_data.get('id')
                        # Багшийг олноор нэмэх
                        ExamTimeTable.objects.get(id=exam_table_id).teacher.set(teachers)
                        if groups:
                            for group in groups:
                                if not Exam_to_group.objects.filter(exam=exam_table_id, group=group).exists():
                                    create_groups.append(
                                        Exam_to_group(
                                            exam_id=exam_table_id,
                                            group_id=group
                                        )
                                    )
                            Exam_to_group.objects.bulk_create(create_groups)

                    return request.send_info("INF_001")

                except Exception:
                    traceback.print_exc()

                    return request.send_error("ERR_002", "Шалгалтын хуваарь давхцаж байна.")

            else:
                transaction.savepoint_rollback(sid)
                print(serializer.errors)

                return request.send_error_valid(serializer.errors)

        except Exception as e:
            traceback.print_exc()

            return request.send_error('ERR_002', e.__str__())

    @has_permission(must_permissions=['lms-timetable-exam-update'])
    def put(self, request, pk=None):
        " Шалгалтын хуваарь засах "

        error_obj = []

        request_data = request.data

        instance = self.get_object()

        # Оюутаны жагсаалт
        student_data = request_data.get('student')

        room = request_data.get('room')
        lesson = request_data.get('lesson')
        school = request_data.get('school')

        teacher = request_data.get('teacher')
        lesson_year = request_data.get('lesson_year')
        lesson_season = request_data.get('lesson_season')

        end_datetime = request_data.get('end_date')
        begin_datetime = request_data.get('begin_date')

        begin_datetime = datetime.fromisoformat(begin_datetime)
        end_datetime = datetime.fromisoformat(end_datetime)
        groups = request_data.get('group')
        teachers = request_data.get('teacher')

        # Group dataнаас юутан устгах
        if student_data:
            request_data = remove_key_from_dict(request_data, 'student')

        serializer = self.get_serializer(instance, data=request_data, partial=True)
        create_groups = []
        try:
            if serializer.is_valid(raise_exception=False):
                serializer.save()
                ExamTimeTable.objects.get(id=pk).teacher.set(teachers)
                if groups:
                    current_groups = Exam_to_group.objects.filter(exam=pk)
                    groups_to_delete = current_groups.exclude(group_id__in=groups)
                    groups_to_delete.delete()

                    for group in groups:
                        if not Exam_to_group.objects.filter(exam=pk, group=group).exists():
                            create_groups.append(
                                Exam_to_group(
                                    exam_id=pk,
                                    group_id=group
                                )
                            )
                    Exam_to_group.objects.bulk_create(create_groups)
                # exam_table_qs = ExamTimeTable.objects.filter(
                #     school=school,
                #     lesson_year=lesson_year,
                #     lesson_season=lesson_season,
                # ).exclude(id=pk)

                # if exam_table_qs:

                #     # qs_exam_teacher = exam_table_qs.filter(teacher__in=teacher)

                #     qs_exam_room = exam_table_qs.filter(room=room).last()

                #     qs_exam_lesson = ExamTimeTable.objects.filter(
                #         school=school,
                #         lesson_year=lesson_year,
                #         lesson_season=lesson_season,
                #         lesson=lesson
                #     ).last()

                #     # Тухайн хичээлийн жил, улирал, өдрийн шалгалтын хуваарийн жагсаалт
                #     qs_examtimetable_ids = exam_table_qs.values_list(
                #         'id',
                #         flat=True
                #     ).distinct()

                    # Шалгалтыг хянах багшийн хуваарь давхцаж байгаа эсэхийг шалгана
                    # NOTE дараа нь давхцалыг шалгана
                    # if qs_exam_teacher:
                    #     start = qs_exam_teacher.begin_time
                    #     end = qs_exam_teacher.end_time
                    #     lesson = qs_exam_teacher.lesson.name

                    #     if (start <= begin_time and end >= begin_time) or (start <= end_time and end >= end_time) or (start >= begin_time and end <= end_time):

                    #         msg = "Энэ багш нь {lesson} хичээлийн {exam_date} өдрийн {begin_time}-{end_time} цагийн хооронд шалгалттай байна." \
                    #             .format(
                    #                 lesson=lesson,
                    #                 exam_date=exam_date,
                    #                 begin_time=start,
                    #                 end_time=end
                    #             )

                    #         error_obj = get_error_obj(msg, 'teacher')

                    # Шалгалтын өрөө давхцаж байгаа эсэхийг шалгана
                    # NOTE давхцал шалгах
                    # if qs_exam_room:
                    #     start = qs_exam_room.begin_date
                    #     end = qs_exam_room.end_date
                    #     lesson = qs_exam_room.lesson.name

                    #     if (start <= begin_time and end >= begin_time) or (start <= end_time and end >= end_time) or (start >= begin_time and end <= end_time):

                    #             msg = "Энэ өрөө нь {exam_date} өдрийн {begin_time}-{end_time} цагийн хооронд {lesson} хичээлийн шалгалттай байна." \
                    #                 .format(
                    #                     lesson=lesson,
                    #                     exam_date=exam_date,
                    #                     begin_time=start,
                    #                     end_time=end
                    #                 )

                    #             error_obj = get_error_obj(msg, 'room')

                    # # Оюутаны цаг давхцаж байгаа эсэхийг шалгана
                    # if student_data:

                    #     if qs_examtimetable_ids:
                    #         for exam_timetable_id in qs_examtimetable_ids:

                    #             exam_qs = ExamTimeTable.objects.filter(
                    #                     pk=exam_timetable_id
                    #                 ).first()

                    #             lesson = exam_qs.lesson.name
                    #             start = exam_qs.begin_time
                    #             end = exam_qs.end_time
                    #             students = []

                    #             for student_id in student_data:
                    #                 # Шалгалтын хуваарь давхцаж байгаа оюутнуудын мэдээлэл авах
                    #                 qs = Exam_to_group.objects.filter(
                    #                         exam=exam_timetable_id,
                    #                         student=student_id
                    #                     )

                    #                 if qs:
                    #                     for stu in qs:
                    #                         student_code = stu.student.code
                    #                         if student_code not in students:
                    #                             students.append(student_code)

                    #                     if (start <= begin_time and end >= begin_time) or (start <= end_time and end >= end_time) or (start >= begin_time and end <= end_time):
                    #                         if students:
                    #                             msg = '''{student_code} кодтой {text} {exam_date} өдрийн {begin_time}-{end_time} цагийн хооронд {lesson} хичээлийн шалгалттай байна.''' \
                    #                                 .format(
                    #                                     student_code=', '.join(['{}'.format(f) for f in students]),
                    #                                     lesson=lesson,
                    #                                     exam_date=exam_date,
                    #                                     begin_time=start,
                    #                                     end_time=end,
                    #                                     text='оюутнууд' if len(students) > 1 else 'оюутан'
                    #                                 )

                    #                             error_obj = get_error_obj(msg, 'student')

                    # Тухайн хичээлийн шалгалтыг нэг цагт авч буй эсэхийг шалгана
                    # NOTE дараа нь давхал шалгах
                    # if qs_exam_lesson:

                    #     start = qs_exam_lesson.begin_time
                    #     end = qs_exam_lesson.end_time
                    #     check_exam_date = qs_exam_lesson.exam_date
                    #     lesson = qs_exam_lesson.lesson.name

                    #     if start != begin_time or end != end_time or str(check_exam_date) != exam_date:
                    #         msg = '''{lesson} хичээлийн шалгалт {exam_date} өдрийн {begin_time}-{end_time} цагийн хооронд байна.''' \
                    #             .format(
                    #                 lesson=lesson,
                    #                 exam_date=check_exam_date,
                    #                 begin_time=start,
                    #                 end_time=end
                    #             )

                    #         error_obj = get_error_obj(msg, 'lesson')

                    # if len(error_obj) > 0:
                    #     return request.send_error("ERR_003", error_obj)


                        # Шалгалтын хуваарийн хүснэгтийн id
                        # exam_qs = Exam_to_group.objects.filter(exam=pk)

                        # # Хуучин шалгалт өгөх байсан оюутаны жагсаалт
                        # old_student_ids = list(exam_qs.values_list('student', flat=True).distinct())

                        # # Зөвхөн оюутан сонгосон бол
                        # if student_data:
                            # for student_id in student_data:
                            #     qs_timegroup = exam_qs.filter(student=student_id)

                            #     if not qs_timegroup:
                            #         obj = Exam_to_group.objects.update_or_create(
                            #             exam_id=pk,
                            #             student_id=student_id
                            #         )

                            # for old_student_id in old_student_ids:
                            #     if not (old_student_id in student_data):
                            #         qs_student = exam_qs.filter(
                            #                 student=old_student_id
                            #             )
                            #         if qs_student:
                            #             qs_student.delete()

                return request.send_info("INF_002")
            else:
                return request.send_error_valid(serializer.errors)

        except Exception as e:
            return request.send_error('ERR_002', e.__str__())

    @has_permission(must_permissions=['lms-timetable-exam-delete'])
    def delete(self, request, pk=None):
        " Шалгалтын хуваарь устгах "

        self.destroy(request, pk)
        return request.send_info("INF_003")


@permission_classes([IsAuthenticated])
class Exam_repeatListAPIView(
    mixins.CreateModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    mixins.RetrieveModelMixin,
    mixins.ListModelMixin,
    generics.GenericAPIView
):
    queryset = Exam_repeat.objects.all()
    serializer_class = Exam_repeatSerializer

    pagination_class = CustomPagination

    filter_backends = [SearchFilter]
    search_fields = ['lesson__name', 'lesson__code', 'teacher__first_name','teacher__last_name']

    def get_queryset(self):
        queryset = self.queryset
        status = self.request.query_params.get('status')
        teacher = self.request.query_params.get('teacher')
        lesson_year = self.request.query_params.get('lesson_year')
        lesson_season = self.request.query_params.get('lesson_season')

        if lesson_year:
            queryset = queryset.filter(lesson_year=lesson_year)

        if lesson_season:
            queryset = queryset.filter(lesson_season=lesson_season)

        if status:
            queryset = queryset.filter(status=status)

        if teacher:
            queryset = queryset.filter(teacher=teacher)

        return queryset

    def get(self, request, pk=None):
        self.serializer_class = Exam_repeatLiseSerializer

        if pk:
            repeat = self.retrieve(request, pk).data
            return request.send_data(repeat)

        all_result = self.list(request).data
        return request.send_data(all_result)

    @transaction.atomic
    def post(self, request):
        " Дахин шалгалт өгөх бүртгэл шинээр үүсгэх "
        self.serializer_class = Exam_repeatSerializer

        request_data = request.data
        students = request_data.get('students')
        teachers = request_data.get('teacher')

        if students:
            request_data = remove_key_from_dict(request_data,'students')
        else:
            return request.send_error("ERR_001", "Сурагчгүй шалгалт авах боломжгүй")

        create_students = []
        serializer = self.get_serializer(data=request_data)

        try:
            if serializer.is_valid(raise_exception=False):
                try:
                    with transaction.atomic():
                        exam_instance = serializer.save()

                        # Шалгалтын хуваарийн хүснэгтийн id
                        exam_table_id = exam_instance.id
                        # Багшийг олноор нэмэх
                        Exam_repeat.objects.get(id=exam_table_id).teacher.set(teachers)
                        if students:
                            for student in students:
                                if not Exam_to_student.objects.filter(exam=exam_table_id, student=student).exists():
                                    create_students.append(
                                        Exam_to_student(
                                            exam_id=exam_table_id,
                                            student_id=student
                                        )
                                    )
                            Exam_to_student.objects.bulk_create(create_students)

                    return request.send_info("INF_001")

                except Exception:
                    traceback.print_exc()

                    return request.send_error("ERR_002", "Шалгалтын хуваарь давхцаж байна.")
            else:
                print(serializer.errors)

                return request.send_error_valid(serializer.errors)

        except Exception as e:
            traceback.print_exc()

            return request.send_error('ERR_002', e.__str__())

    @transaction.atomic
    def put(self, request, pk=None):
        " Дахин шалгалт өгөх бүртгэл шинээр үүсгэх "

        request_data = request.data
        instance = self.get_object()

        serializer = self.get_serializer(instance, data=request_data)

        try:
            self.update(request).data

        except Exception as e:
            print(e)
            return request.send_error("ERR_002")

        return request.send_info("INF_002")

    def delete(self, request, pk=None):
        " Дахин шалгалт өгөх бүртгэл устгах "

        exam_qs = self.queryset.filter(id=pk).first()
        if exam_qs:
            lesson = exam_qs.lesson
            status = exam_qs.status
            id = exam_qs.id
            lesson_year = exam_qs.lesson_year
            lesson_season = exam_qs.lesson_season
            students = Exam_to_student.objects.filter(exam=id).values_list('student',flat=True)

            score_qs = ScoreRegister.objects.filter(lesson=lesson,student_id__in=students,status=int(status)+4,lesson_year=lesson_year,lesson_season=lesson_season,is_delete=False)
            if score_qs:
                return request.send_error("ERR_003", 'Энэ шалгалтын дүн нь орсон тул устгах боломжгүй.')

            Exam_to_student.objects.filter(exam=id).delete()

        self.destroy(request, pk)
        return request.send_info("INF_003")


class ExamListAPIView(
    generics.GenericAPIView,
    mixins.ListModelMixin
):

    queryset = Exam_repeat.objects.all()
    serializer_class = Exam_repeatLiseSerializer
    def get(self, request, pk=None):

        lesson_year, lesson_season = get_active_year_season()
        self.queryset = self.queryset.filter(lesson_year=lesson_year, lesson_season=lesson_season)
        all_result = self.list(request).data
        return request.send_data(all_result)


class ExamRepeatStudentScoreListAPIView(
    mixins.ListModelMixin,
    generics.GenericAPIView
):

    queryset = ScoreRegister.objects.all()
    serializer_class = StudentScoreListSerializer

    @has_permission(must_permissions=['lms-stipend-read'])
    def get(self, request, student=None, lesson=None):

        lesson_year = self.request.query_params.get('lesson_year')
        lesson_season = self.request.query_params.get('lesson_season')
        if student and lesson:
            self.queryset = self.queryset.filter(
                    lesson=lesson,
                    student=student,
                    is_delete=False
                )

        all_result = self.list(request).data

        return request.send_data(all_result)

@permission_classes([IsAuthenticated])
class TimeTablePotok(
    generics.GenericAPIView,
    mixins.ListModelMixin
):

    queryset = TimeTable.objects
    serializer_class = PotokSerializer

    def get_queryset(self):
        queryset = self.queryset.filter(is_kurats=False, is_block=False)

        year = self.request.query_params.get('year')
        season = self.request.query_params.get('season')
        lesson = self.request.query_params.get('lesson')
        potok = self.request.query_params.get('potok')
        school = self.request.query_params.get('school')

        if school:
            queryset = queryset.filter(school=school)

        # Жил хайлт хийх
        if year:
            queryset = queryset.filter(lesson_year=year)

        # Улирал хайлт хийх
        if season:
            queryset = queryset.filter(lesson_season=season)

        # Хичээлээр хайлт хийх
        if lesson:
            queryset = queryset.filter(lesson=lesson)

        if potok:
            queryset = queryset.filter(potok=potok)

        return queryset

    def get(self, request):
        """ Нэг хичээлийн нэг потокийн хуваарь """

        datas = self.list(request).data

        return request.send_data(datas)


@permission_classes([IsAuthenticated])
class TimeTable1APIView(
    generics.GenericAPIView,
    mixins.CreateModelMixin,
    mixins.ListModelMixin
):

    queryset = TimeTable.objects.all()
    serializer_class = TimeTableSerializer

    def get(self, request):
        queryset = self.queryset

        year = self.request.query_params.get('year')
        season = self.request.query_params.get('season')
        is_calendar = self.request.query_params.get('isCalendar')
        dep_id = self.request.query_params.get('selectedValue')

        # Хичээлийн жил
        if year:
            queryset = queryset.filter(lesson_year=year)

        # Хичээлийн улирал
        if season:
            queryset = queryset.filter(lesson_season=season)

        if not year and not season:
            year, season = get_active_year_season()

        if str2bool(is_calendar):
            timetables = queryset.filter(is_kurats=True).values('end_date', 'begin_date', 'potok', 'lesson').distinct('end_date', 'begin_date', 'potok', 'lesson')
            time_ids = []

            for timetable in timetables:
                end_date = timetable.get('end_date')
                begin_date = timetable.get('begin_date')
                potok = timetable.get('potok')
                lesson = timetable.get('lesson')

                obj_time = TimeTable.objects.filter(is_kurats=True).filter(end_date=end_date, begin_date=begin_date, potok=potok, lesson=lesson).first()
                time_id = obj_time.id

                time_ids.append(time_id)

            queryset = queryset.filter(id__in=time_ids)
        else:
            queryset = queryset.filter(is_kurats=False)

        # Хөтөлбөрийн багаар хайлт хийх
        if dep_id:
            group_ids = Group.objects.filter(department_id=dep_id).values_list('id', flat=True)
            t_ids = TimeTable_to_group.objects.filter(group_id__in=group_ids).values_list('timetable', flat=True)

            queryset = queryset.filter(id__in=t_ids)

        self.queryset = queryset

        self.serializer_class = TimeTableListSerializer

        serializer = self.list(request)

        timetable_list = serializer.data

        def check_score_lesson(lesson, teacher):
            score = ScoreRegister.objects.filter(lesson_year=year, lesson_season=season, lesson=lesson, teacher=teacher, teach_score__isnull=False).first()
            if score:
                return True

            return False

        for clist in timetable_list:

            begin_date = clist.get('begin_date')
            end_date = clist.get('end_date')
            times = []
            if begin_date and end_date:
                times = TimeTable.objects.filter(is_kurats=True).filter(end_date=end_date, begin_date=begin_date).values_list('time', flat=True).distinct('time')
                clist['times'] = list(times)

            # Хичээлийн дүн орсон эсэхийг шалгах
            teacher = clist.get('teacher').get('id')
            t_lesson = clist.get('lesson').get('id')
            is_score = check_score_lesson(t_lesson, teacher)
            clist['is_score'] = is_score

            # Өнгө шалгах
            if clist.get('color'):
                color_type = isLightOrDark(clist.get('color'))
                clist['textColor'] = color_type
                clist['scolor'] = clist.get('color')

            clist['color'] = clist.get('color')

        return request.send_data(timetable_list)


@permission_classes([IsAuthenticated])
class TimeTableKuratsAPIView(
    generics.GenericAPIView,
    mixins.CreateModelMixin,
    mixins.ListModelMixin
):

    queryset = TimeTable.objects.all()
    serializer_class = TimeTableSerializer

    def get(self, request):

        dep_id = self.request.query_params.get('selectedValue')
        start_date = request.query_params.get('start')
        end_date = request.query_params.get('end')

        year, season = get_active_year_season()

        start_month = datetime.strptime(start_date, '%Y-%m-%d')
        end_month = datetime.strptime(end_date, '%Y-%m-%d')
        queryset = self.queryset.filter(is_kurats=True, lesson_year=year, begin_date__gte=start_month, end_date__lte=end_month)

        timetables = queryset.values('end_date', 'begin_date', 'potok', 'lesson').distinct('end_date', 'begin_date', 'lesson', 'potok')
        time_ids = []

        for timetable in timetables:
            end_date = timetable.get('end_date')
            begin_date = timetable.get('begin_date')
            potok = timetable.get('potok')
            lesson = timetable.get('lesson')

            obj_time = TimeTable.objects.filter(is_kurats=True).filter(end_date=end_date, begin_date=begin_date, potok=potok, lesson=lesson).first()
            time_id = obj_time.id

            time_ids.append(time_id)

        self.queryset = self.queryset.filter(id__in=time_ids)

        # Хөтөлбөрийн багаар хайлт хийх
        if dep_id:
            group_ids = Group.objects.filter(department_id=dep_id).values_list('id', flat=True)
            t_ids = TimeTable_to_group.objects.filter(group_id__in=group_ids).values_list('timetable', flat=True)

            self.queryset = self.queryset.filter(id__in=t_ids)

        self.serializer_class = TimeTableListSerializer

        serializer = self.list(request)

        timetable_list = serializer.data

        def check_score_lesson(lesson, teacher):
            score = ScoreRegister.objects.filter(lesson_year=year, lesson_season=season, lesson=lesson, teacher=teacher, teach_score__isnull=False).first()
            if score:
                return True

            return False

        for clist in timetable_list:

            begin_date = clist.get('begin_date')
            end_date = clist.get('end_date')
            times = []
            if begin_date and end_date:
                times = TimeTable.objects.filter(is_kurats=True).filter(end_date=end_date, begin_date=begin_date).values_list('time', flat=True).distinct('time')
                clist['times'] = list(times)

            # Хичээлийн дүн орсон эсэхийг шалгах
            teacher = clist.get('teacher').get('id')
            t_lesson = clist.get('lesson').get('id')
            is_score = check_score_lesson(t_lesson, teacher)
            clist['is_score'] = is_score

            # Өнгө шалгах
            if clist.get('color'):
                color_type = isLightOrDark(clist.get('color'))
                clist['textColor'] = color_type
                clist['scolor'] = clist.get('color')

            clist['color'] = clist.get('color')

        return request.send_data(timetable_list)


@permission_classes([IsAuthenticated])
class TimeTableNewAPIView(
    generics.GenericAPIView,
    mixins.CreateModelMixin,
    mixins.ListModelMixin
):

    queryset = TimeTable.objects.all().filter(is_kurats=False)
    serializer_class = TimeTableSerializer

    def get(self, request):
        st_time = start_time()
        # queryset = self.get_queryset()
        week = get_dates_from_week()

        begin_date = week.get('start_date')
        end_date = week.get('end_date')
        is_volume = request.query_params.get('is_volume')

        if not begin_date and not end_date:
            current_date = datetime.today()
            begin_date = current_date - timedelta(days=current_date.weekday())
            end_date = begin_date + timedelta(days=6)

        dep_id = self.request.query_params.get('selectedValue')

        year, season = get_active_year_season()

        self.queryset = self.queryset.filter(lesson_year=year.strip(), lesson_season=season)

        estimate_query = '''
            SELECT 8 as day, true as is_default, ls.school_id, tt.id as event_id,  tt.lesson_id AS lesson, ls.is_general,  tt.teacher_id as teacher, ls.name as lesson_name,  CONCAT(SUBSTRING(cu.last_name, 1, 1), '.', cu.first_name) as teacher_name,
            CASE
                WHEN tt.type = 1 THEN 'Лаб'
                WHEN tt.type  = 2 THEN 'Лк'
                WHEN tt.type  = 3 THEN 'Сем'
                WHEN tt.type  = 4 THEN 'Бу'
                WHEN tt.type  = 5 THEN 'Прак'
                WHEN tt.type  = 6 THEN 'Б/д'
            ELSE ''
            END AS title,

            CASE
                WHEN tt.type = 1 THEN 'Лаборатори'
                WHEN tt.type  = 2 THEN 'Лекц'
                WHEN tt.type  = 3 THEN 'Семинар'
                WHEN tt.type  = 4 THEN 'Бусад'
                WHEN tt.type  = 5 THEN 'Практик'
                WHEN tt.type  = 6 THEN 'Бие даалт'
            ELSE ''
            END AS type_name,
            t.group,
            ta.group_list,
            public.get_time(tt.id) as time
            FROM lms_teachercreditvolumeplan tt
            LEFT JOIN lms_lessonstandart ls
            ON tt.lesson_id = ls.id
            LEFT JOIN core_userinfo cu
            ON tt.teacher_id = cu.id,
            LATERAL (
                SELECT ARRAY(
                    SELECT gr.name
                    FROM lms_TeacherCreditVolumePlan_group ttg
                    LEFT JOIN lms_group gr ON ttg.group_id = gr.id
                    WHERE ttg.creditvolume_id=tt.id

                ) AS group
            ) t,

            LATERAL (
                SELECT ARRAY(
                    SELECT  CAST(gr.id as varchar)
                    FROM lms_TeacherCreditVolumePlan_group ttg
                    LEFT JOIN lms_group gr ON ttg.group_id = gr.id
                    WHERE ttg.creditvolume_id=tt.id

                ) AS group_list
            ) ta

            WHERE tt.lesson_year='{year}' and tt.lesson_season_id ='{season}' and tt.teacher_id is not null and is_timetable is false {dep_condition}
        '''.format(year=year, season=season, dep_condition=f"AND tt.id in ( SELECT creditvolume_id FROM lms_TeacherCreditVolumePlan_group WHERE group_id in (SELECT id FROM lms_group WHERE department_id={dep_id}))" if dep_id else '')

        query = '''
            SELECT tt.color, tt.is_optional, ls.school_id, tt.id as event_id, tt.day, tt.time,  tt.lesson_id AS lesson, ls.is_general,  tt.room_id AS room, tt.teacher_id as teacher, ls.name as lesson_name,  CONCAT(r.code , ' ', r.name) as room_name, CONCAT(SUBSTRING(cu.last_name, 1, 1), '.', cu.first_name) as teacher_name,
            CASE
                WHEN tt.type = 1 THEN 'Лаб'
                WHEN tt.type  = 2 THEN 'Лк'
                WHEN tt.type  = 3 THEN 'Сем'
                WHEN tt.type  = 4 THEN 'Бу'
                WHEN tt.type  = 5 THEN 'Прак'
                WHEN tt.type  = 6 THEN 'Б/д'
            ELSE ''
            END AS title,

            CASE
                WHEN tt.type = 1 THEN 'Лаборатори'
                WHEN tt.type  = 2 THEN 'Лекц'
                WHEN tt.type  = 3 THEN 'Семинар'
                WHEN tt.type  = 4 THEN 'Бусад'
                WHEN tt.type  = 5 THEN 'Практик'
                WHEN tt.type  = 6 THEN 'Бие даалт'
            ELSE ''
            END AS type_name,
            t.group,
            ta.group_list,
            (SELECT  case when COUNT(*)>0 THEN True ELSE False end gg FROM lms_scoreregister  ls WHERE ls.lesson_id = tt.lesson_id and ls.teacher_id = tt.teacher_id and lesson_year='{year}' and lesson_season_id={season})  as is_score,
            public.get_color(tt.color) as textColor

            FROM lms_timetable tt
            LEFT JOIN lms_lessonstandart ls
            ON tt.lesson_id = ls.id
            LEFT JOIN lms_room r
            ON tt.room_id = r.id
            LEFT JOIN core_userinfo cu
            ON tt.teacher_id = cu.id,
            LATERAL (
                SELECT ARRAY(
                    SELECT gr.name
                    FROM lms_timetable_to_group ttg
                    LEFT JOIN lms_group gr ON ttg.group_id = gr.id
                    WHERE ttg.timetable_id=tt.id

                ) AS group
            ) t,

            LATERAL (
                SELECT ARRAY(
                    SELECT  CAST(gr.id as varchar)
                    FROM lms_timetable_to_group ttg
                    LEFT JOIN lms_group gr ON ttg.group_id = gr.id
                    WHERE ttg.timetable_id=tt.id

                ) AS group_list
            ) ta

            WHERE tt.lesson_year='{year}' and tt.lesson_season_id ={season} {dep_condition} and is_kurats is false
        '''.format(year=year, season=season, begin_date=begin_date, end_date=end_date, dep_condition=f"AND tt.id in ( SELECT timetable_id FROM lms_timetable_to_group WHERE group_id in (SELECT id FROM lms_group WHERE department_id={dep_id}))" if dep_id else '')

        cursor = connection.cursor()
        cursor.execute(query)
        rows = list(dict_fetchall(cursor))

        if is_volume:
            # Цагийн ачаалал
            credit_cursor = connection.cursor()
            credit_cursor.execute(estimate_query)
            estimate_rows = list(dict_fetchall(credit_cursor))
            for est_row in estimate_rows:
                rows.append(est_row)

        return request.send_data(rows)

    def put(self, request, pk=None):
        errors = []

        datas = request.data

        estimate = TeacherCreditVolumePlan.objects.get(pk=pk)

        day = datas.get('day')
        time = datas.get('time')
        odd_even = datas.get('odd_even')
        school = datas.get('school')

        lesson = estimate.lesson
        teacher = estimate.teacher
        year, season = get_active_year_season()

        season_obj = Season.objects.get(id=season)
        school_obj = SubOrgs.objects.get(pk=school)

        group_ids = TeacherCreditVolumePlan_group.objects.filter(creditvolume=pk).values_list('group', flat=True)

        st_count = Student.objects.filter(group_id__in=group_ids).count()

        datas['st_count'] = st_count

        qs_timetable = self.queryset.filter(lesson_year=year, lesson_season_id=season, day=day, time=time, odd_even__in=[odd_even])

        timetable_ids = qs_timetable.values_list('id', flat=True)

        qs_teacher = qs_timetable.filter(teacher_id=teacher)

        # Багшийн давхцал
        if len(qs_teacher) > 0:
            teacher_obj = qs_teacher.first()
            clesson = teacher_obj.lesson.name
            time = teacher_obj.time
            day = teacher_obj.day

            msg = "Энэ багш нь {lesson} хичээлийн {day}-{time} дээр хуваарьтай байна.".format(lesson=clesson, day=day, time=time)

            return request.send_error("ERR_003", msg)

        # Сонгон хичээл биш тухайн ангийн хичээлийн хуваарийн давхцалыг шалгах
        if len(timetable_ids) > 0:
            qs = self.queryset.filter(id__in=timetable_ids).first()

            # Сонгосон өдөр цагтай хуваариудын хичээлийн нэр
            glesson = qs.lesson.name
            for group in group_ids:

                # Тухайн сонгосон анги сонгогдсон өдөр цаг дээр хичээлтэй байж болохгүй
                qs_timetable_group = TimeTable_to_group.objects.filter(timetable_id__in=timetable_ids, group_id=group)
                if len(qs_timetable_group) > 0:
                    qs_groups = qs_timetable_group.first()
                    group_name = qs_groups.group.name
                    msg = "{group_name} анги нь {day}-{time} дээр {lesson} хичээлийн хуваарьтай байна.".format(group_name=group_name, lesson=glesson, day=day, time=time)
                    return request.send_error("ERR_003", msg)

        datas['lesson_id'] = lesson.id
        datas['teacher_id'] = teacher.id
        datas['school'] = school_obj if school_obj else None
        datas['type'] = estimate.type
        datas['lesson_season'] = season_obj
        datas['lesson_year'] = year
        datas['created_user_id'] = request.user.id

        try:
            with transaction.atomic():
                table_data, created = self.queryset.update_or_create(
                    lesson=lesson,
                    teacher=teacher,
                    type=estimate.type,
                    lesson_year=year,
                    lesson_season=season_obj,
                    defaults={
                        **datas
                    }
                )
                # Цагийн хуваарийн хүснэгтийн id
                table_id=table_data.id

                if len(group_ids) > 0:
                    group_datas = []

                    for group_id in group_ids:
                        timetable_group = TimeTable_to_group.objects.filter(group_id=group_id, timetable_id=table_id).first()
                        if not timetable_group:
                            group_datas.append(
                                TimeTable_to_group(
                                    group_id=group_id,
                                    timetable_id=table_id
                                )
                            )

                    TimeTable_to_group.objects.bulk_create(group_datas)

                estimate.is_timetable = True
                estimate.save()

                return request.send_info("INF_001")

        except Exception as e:
            print(e)
            print(e)
            return request.send_error("ERR_002", "Хичээлийн хуваарь давхцаж байна.")


@permission_classes([IsAuthenticated])
class TimeTableResource(
    generics.GenericAPIView
):
    """ Хичээлийн хуваарийн resource """

    def get(self, request):
        all_list = []
        qs_lesson = LessonStandart.objects
        qs_room = Room.objects

        # Хэрэглэгчид дундаас багш нарыг авах queryset
        qs_teacher = get_teacher_queryset()

        qs_tgroup = TimeTable_to_group.objects

        school = self.request.query_params.get('school')

        selectedValue = self.request.query_params.get('selectedValue')

        # Calendar төрөл (энгийн, курац)
        stype = self.request.query_params.get('stype')

        year = self.request.query_params.get('lesson_year')
        season = self.request.query_params.get('lesson_season')

        queryset = TimeTable.objects.all().filter(is_kurats=False)
        credit_queryset = TeacherCreditVolumePlan.objects.all().exclude(teacher__isnull=True)

        # Хичээлийн жил
        if year:
            queryset = queryset.filter(lesson_year=year)
            credit_queryset = credit_queryset.filter(lesson_year=year)

        # Хичээлийн улирал
        if season:
            queryset = queryset.filter(lesson_season=season)
            credit_queryset = credit_queryset.filter(lesson_season=season)

        if school:
            queryset = queryset.filter(school=school)
            qs_tgroup = qs_tgroup.filter(group__school=school)
            credit_queryset = credit_queryset.filter(school=school)

        try:
            # Ангиар хайлт хийх хэсэг
            if stype == 'group':
                if selectedValue:
                    qs_tgroup = qs_tgroup.filter(group__department_id=selectedValue)

                timetable_group_ids = qs_tgroup.order_by('group__name').values('group')

                for tgroup in timetable_group_ids:
                    obj_datas = {}
                    group_id = tgroup.get('group')

                    obj_group = Group.objects.filter(id=group_id).first()
                    obj_datas['title'] = obj_group.name
                    obj_datas['id'] =  '{group_id}'.format(group_id=group_id)

                    all_list.append(obj_datas)

            # Багшаар хайлт хийх хэсэг
            elif stype == 'teacher':

                if school:
                    qs_teacher = qs_teacher.filter(Q(Q(sub_org=school) | Q(sub_org__org_code=10)))
                if selectedValue:
                    qs_teacher = qs_teacher.filter(salbar_id=selectedValue)

                all_list = qs_teacher.values('id', 'first_name', 'last_name')

                for item in all_list:
                    firstName = item.get('first_name')
                    lastName = item.get('last_name')
                    teacher_id = item.get('id')

                    fullName = get_fullName(lastName, firstName, is_dot=True, is_strim_first=True)
                    lesson = Lesson_to_teacher.objects.filter(teacher_id=teacher_id).last()

                    item['title'] = fullName
                    item['lesson_id'] = lesson.lesson.id if lesson else ""

            # Хичээлээр хайх үед тухайн сургуулийн сургалтын төлөвлөгөөнд байгаа идэвхтэй улиралд шивэгдсэн хичээлүүдийг авна
            elif stype == 'lesson':

                # Идэвхтэй жил
                qs_set = SystemSettings.objects.filter(season_type=SystemSettings.ACTIVE).last()
                active_season = qs_set.active_lesson_season
                season_code = active_season.season_code

                qs_lplan = LearningPlan.objects.all()

                if school:
                    qs_lplan = qs_lplan.filter(school=school)
                even_i = []
                odd_i = []

                if selectedValue:
                    qs_lplan = qs_lplan.filter(department_id=selectedValue)

                for i in range(1,13):
                    if i % 2 == 0:
                        even_i.append(str(i))
                    else:
                        odd_i.append(str(i))

                # Идэвхтэй улиралд байгаа хичээлүүдийг авах
                if season_code == 1:
                    lookups = [Q(season__contains=str(value)) for value in odd_i]

                    # Combine the individual lookups using the OR operator (|) for a match on any of the values
                    filter_query = Q()
                    for lookup in lookups:
                        filter_query |= lookup

                    lesson_ids = qs_lplan.filter(filter_query).values_list('lesson', flat=True).distinct('lesson')
                else:
                    lookups = [Q(season__contains=str(value)) for value in even_i]

                    # Combine the individual lookups using the OR operator (|) for a match on any of the values
                    filter_query = Q()
                    for lookup in lookups:
                        filter_query |= lookup

                    lesson_ids = qs_lplan.filter(filter_query).values_list('lesson', flat=True).distinct('lesson')

                for lesson_id in lesson_ids:
                    lesson = qs_lesson.filter(id=lesson_id).last()

                    # Хичээл багш холбогдсон байгаа хичээлийг авна.
                    teachers = Lesson_to_teacher.objects.filter(lesson_id=lesson_id).values_list('teacher', flat=True)
                    for teacher_id in teachers:
                        obj_datas= {}

                        teacher = qs_teacher.filter(id=teacher_id).first()
                        if not teacher:
                            continue

                        firstName = teacher.first_name if teacher else ''
                        lastName =teacher.last_name if teacher else ''
                        fullName = None

                        if firstName and lastName:
                            fullName = get_fullName(lastName, firstName, is_dot=True, is_strim_first=True)

                        obj_datas['title'] = fullName if fullName else lesson.name
                        obj_datas['lesson'] = lesson.name if lesson else ''
                        obj_datas['id'] = '{}_{}'.format(lesson_id, teacher_id)

                        all_list.append(obj_datas)
            else:
                all_list = qs_room.values('id', 'code').order_by('code')

                for item in all_list:
                    room_obj = qs_room.filter(id=item.get('id')).first()
                    item['title'] = room_obj.full_name

        except Exception as e:
            print(e)
            return request.send_error('ERR_002')

        return request.send_data(list(all_list))


@permission_classes([IsAuthenticated])
class TimeTableResource1(
    generics.GenericAPIView
):
    """ Хичээлийн хуваарийн resource """

    def get(self, request):
        all_list = []

        # Хэрэглэгчид дундаас багш нарыг авах queryset
        qs_teacher = get_teacher_queryset()
        year, season = get_active_year_season()

        week = get_dates_from_week()

        is_volume = request.query_params.get('is_volume')

        if str2bool(is_volume):
            qs_tgroup = TeacherCreditVolumePlan_group.objects.filter(creditvolume__lesson_year=year, creditvolume__lesson_season=season)
            time_tablequeryset = TeacherCreditVolumePlan.objects.exclude(teacher__isnull=True).filter(lesson_year=year.strip(), lesson_season=season)
        else:
            time_tablequeryset = TimeTable.objects.filter(lesson_year=year, lesson_season=season)
            timetable_ids = time_tablequeryset.values_list('id', flat=True)
            qs_tgroup = TimeTable_to_group.objects.filter(timetable__in=list(timetable_ids))

        school = self.request.query_params.get('school')
        selectedValue = self.request.query_params.get('selectedValue')

        # Хайх төрлөөс хамаараад сонгогдсон утга
        option_filter = self.request.query_params.get('option')

        # Calendar төрөл (энгийн, курац)
        stype = self.request.query_params.get('stype')


        if selectedValue:
            group_ids = Group.objects.filter(department_id=selectedValue).values_list('id', flat=True)
            if is_volume:
                t_ids = qs_tgroup.filter(group_id__in=group_ids).values_list('creditvolume', flat=True)
            else:
                t_ids = qs_tgroup.filter(group_id__in=group_ids).values_list('timetable', flat=True)

            time_tablequeryset = time_tablequeryset.filter(id__in=t_ids)

        if school:
            qs_tgroup = qs_tgroup.filter(group__school=school)
            time_tablequeryset = time_tablequeryset.filter(Q(Q(school=school) | Q(lesson__is_general=True)))

        try:
            # Ангиар хайлт хийх хэсэг
            if stype == 'group':
                if selectedValue:
                    qs_tgroup = qs_tgroup.filter(group__department=selectedValue)

                if option_filter:
                    qs_tgroup = qs_tgroup.filter(group=option_filter)

                groups = qs_tgroup.order_by('group__name').values('group__name', 'group')

                for tgroup in groups:
                    obj_datas = {}

                    obj_datas['title'] = tgroup.get('group__name')
                    obj_datas['id'] =  '{group_id}'.format(group_id=tgroup.get('group'))

                    all_list.append(obj_datas)

            # Багшаар хайлт хийх хэсэг
            elif stype == 'teacher':

                timetable_teachers = time_tablequeryset.values_list('teacher', flat=True)
                qs_teacher = qs_teacher.filter(id__in=timetable_teachers)

                if school:
                    qs_teacher = qs_teacher.filter(Q(Q(sub_org=school) | Q(sub_org__org_code=10)))

                if selectedValue:
                    qs_teacher = qs_teacher.filter(salbar_id=selectedValue)

                if option_filter:
                    qs_teacher = qs_teacher.filter(id=option_filter)

                all_list = qs_teacher.values('id', 'first_name', 'last_name')

                for item in all_list:
                    firstName = item.get('first_name')
                    lastName = item.get('last_name')
                    teacher_id = item.get('id')

                    fullName = get_fullName(lastName, firstName, is_dot=True, is_strim_first=True)
                    lesson = Lesson_to_teacher.objects.filter(teacher_id=teacher_id).first()

                    item['title'] = fullName
                    item['lesson_id'] = lesson.lesson.id if lesson else ""

            # Хичээлээр хайх үед тухайн сургуулийн сургалтын төлөвлөгөөнд байгаа идэвхтэй улиралд шивэгдсэн хичээлүүдийг авна
            elif stype == 'lesson':
                if option_filter:
                    time_tablequeryset = time_tablequeryset.filter(lesson=option_filter)

                lesson_ids = time_tablequeryset.values('lesson', 'teacher', 'lesson__name', 'teacher__first_name', 'teacher__last_name')

                for timetable in lesson_ids:
                    lesson_id = timetable.get('lesson')
                    teacher_id = timetable.get('teacher')
                    lesson__name = timetable.get('lesson__name')
                    firstName = timetable.get('teacher__first_name')
                    lastName = timetable.get('teacher__last_name')

                    obj_datas= {}
                    fullName = None

                    if firstName and lastName:
                        fullName = get_fullName(lastName, firstName, is_dot=True, is_strim_first=True)

                        # Хичээлийг багшаар групп хийх
                        # obj_datas['lesson'] = fullName if fullName else lesson.name
                        # obj_datas['title'] = lesson.name if lesson else ''

                    obj_datas['title'] = fullName if fullName else firstName
                    obj_datas['lesson'] = lesson__name
                    obj_datas['id'] = '{}_{}'.format(lesson_id, teacher_id)

                    all_list.append(obj_datas)
            else:
                room_ids = time_tablequeryset.values_list('room', flat=True)
                room_queryset = Room.objects.filter(id__in=room_ids)
                if option_filter:
                    room_queryset = room_queryset.filter(id=option_filter)

                all_list = room_queryset.values('id', 'code').order_by('code')

                for item in all_list:
                    room_obj =  Room.objects.filter(id=item.get('id')).first()
                    item['title'] = room_obj.full_name

                return request.send_data(list(all_list))

        except Exception as e:
            print(e)
            return request.send_error('ERR_002')

        return request.send_data(list(all_list))



@permission_classes([IsAuthenticated])
class TimeTableSelectOption(
    generics.GenericAPIView
):
    """ Хичээлийн хуваарийн хайлтын select option """

    def get(self, request):

        all_list = []
        qs_group = Group.objects.order_by('name')
        qs_lesson = LessonStandart.objects.order_by('name')

        qs_room = Room.objects.order_by('code')
        qs_teacher = get_teacher_queryset()

        school = self.request.query_params.get('school')
        stype = self.request.query_params.get('stype')

        try:
            if stype == 'group':
                if school:
                    qs_group = qs_group.filter(school=school)

                all_list = list(qs_group.values('id', 'name'))

                for group in all_list:
                    group['itemId'] = group.get('id')
                    group['itemName'] = group.get('name')

            elif stype == 'teacher':
                all_list = qs_teacher.values('id', 'first_name', 'last_name')

                for item in all_list:
                    firstName = item.get('first_name')
                    lastName = item.get('last_name')
                    fullName = get_fullName(lastName, firstName, is_dot=True, is_strim_first=True)

                    item['itemId'] = item.get('id')
                    item['itemName'] = fullName

            elif stype == 'lesson':
                all_list = qs_lesson.values('id', 'name')

                for item in all_list:
                    item['itemId'] = item.get('id')
                    item['itemName'] = item.get('name')

            else:
                all_list = qs_room.values('id', 'code')

                for item in all_list:
                    room_obj = qs_room.filter(id=item.get('id')).first()
                    item['itemId'] = item.get('id')
                    item['itemName'] = room_obj.full_name

        except Exception as e:
            print(e)
            return request.send_error('ERR_002')

        return request.send_data(list(all_list))


@permission_classes([IsAuthenticated])
class TimeTableEvent(
    generics.GenericAPIView
):
    """ Event change """
    queryset = TimeTable.objects.all()

    def put(self, request, pk):

        datas = request.data
        user = request.user

        datas['updated_user'] = user.id
        datas['updated_at'] = timezone.now()

        day = datas.get('day')
        time = datas.get('time')
        teacher = datas.get('teacher')
        lesson = datas.get('lesson')
        lesson_year = datas.get('lesson_year')
        lesson_season = datas.get('lesson_season')
        odd_even = datas.get('odd_even')
        is_online = datas.get('odd_even')

        # Хичээлийн хуваариас буцаад цагийн ачаалал руу зөөж байгаа гэсэн үг
        if day == 0:
            timetable_group_ids = TimeTable_to_group.objects.filter(timetable=pk).values_list('group', flat=True)
            credit_volume_group = TeacherCreditVolumePlan_group.objects.filter(creditvolume__teacher=teacher, creditvolume__lesson=lesson, creditvolume__lesson_year=lesson_year, creditvolume__lesson_season=lesson_season, group_id__in=timetable_group_ids).first()
            credit_volume = credit_volume_group.creditvolume if credit_volume_group else None

            credit_volume_obj = TeacherCreditVolumePlan.objects.filter(id=credit_volume).first()

            with transaction.atomic():
                if credit_volume_obj:
                    credit_volume_obj.is_timetable = False
                    credit_volume_obj.save()

                # Цагийн ачаалал руу зөөх үед хичээлийн хуваарь устгах
                self.queryset.filter(id=pk).delete()

                return request.send_info('INF_002')

        qs_timetable = self.queryset.filter(id=pk).first()
        if not qs_timetable:
            return request.send_error('ERR_002', 'Хуваарийн мэдээлэл олдсонгүй')

        timetable_room = qs_timetable.room
        timetable_teacher = qs_timetable.teacher

        timetable_qs = self.queryset.exclude(id=pk).filter(lesson_year=lesson_year, lesson_season_id=lesson_season, day=day, time=time, odd_even=odd_even)
        timetables = timetable_qs.values_list('id', flat=True)
        for timetable in timetables:
            timetable_obj = self.queryset.filter(id=timetable, teacher=timetable_teacher).first()
            if timetable_obj:
                firstname = timetable_teacher.first_name
                tname = ''
                type_name = timetable_obj.get_type_display()

                if type_name:
                    tname = type_name[0:3]

                lesson_name = timetable_obj.lesson.name
                msg = "Тухайн цаг дээр {firstname} багш {lesson_name}({tname}) хичээлийн хуваарьтай байна.".format(firstname=firstname, day=day, time=time, lesson_name=lesson_name, tname=tname)

                return request.send_error('ERR_002', msg)


        qs_room = timetable_qs.filter(room=timetable_room).first()
        if qs_room and not is_online:
            lesson = qs_room.lesson.name
            room_name = timetable_room.full_name
            msg = "{room_name} өрөө нь {day}-{time} дээр {lesson} хичээлийн хуваарьтай байна.".format(room_name=room_name, lesson=lesson, day=day, time=time)

            return request.send_error('ERR_002', msg)

        try:
            with transaction.atomic():
                qs_timetable.update(
                    **datas
                )

            return request.send_info('INF_002')
        except Exception as e:
            print(e)
            return request.send_error('ERR_002', 'Хуваарь хадгалахад алдаа гарлаа.')


@permission_classes([IsAuthenticated])
class TimeTableFile(
    generics.GenericAPIView
):
    """ Хичээлийн хуваарь excel файлаар хадгалах """

    def post(self, request):

        request_data = request.data

        file = request_data.get('file')
        ext = request_data.get('ext')

        if not file:
            return request.send_error('ERR_002', 'Файл оруулна уу')

        file_save_folder = os.path.join(settings.MEDIA_ROOT, settings.TIMETABLE)

        if not os.path.exists(file_save_folder):
            os.mkdir(file_save_folder)

        try:
            file_save_path = save_file(file, settings.TIMETABLE, '')
            file_path = os.path.join(settings.MEDIA_ROOT, file_save_path)

            if ext == 'xlsx':
                excel_data = pd.read_excel(file_path)
            else:
                excel_data = pd.read_csv(file_path)

            json_str = excel_data.to_json(orient='records')
            remove_folder(file_save_path)
        except Exception as e:
            print(e)

        return request.send_info('INF_013')


@permission_classes([IsAuthenticated])
class ExamTimeTableCreateAPIView(
    generics.GenericAPIView
):
    """ Шалгалтын хуваарь үүсгэх """

    queryset = ExamTimeTable.objects.all()

    def get(self, request):
        year, season = get_active_year_season()

        lesson_season = Season.objects.get(id=season)
        school = request.query_params.get('school')

        timetables = TimeTable.objects.filter(lesson_year=year, lesson_season=season)
        if school:
            timetables = timetables.filter(school=school)

        timetables = timetables.values('lesson', 'school').distinct('lesson')

        exam_to_group_datas = []
        exam_ids = []
        try:
            with transaction.atomic():
                for timetable in timetables:
                    lesson = timetable.get('lesson')
                    create_lesson = timetable.get('school')

                    all_students = get_lesson_choice_student(lesson=lesson, lesson_season=season, lesson_year=year)

                    # Шалгалт үүсгэх
                    exam, created = ExamTimeTable.objects.update_or_create(
                        lesson_id=lesson,
                        lesson_year=year.strip(),
                        lesson_season=lesson_season,
                        defaults={
                            'school_id': create_lesson,
                            'created_user': request.user,
                        }
                    )

                    print('Шалгалт үүсч байна')

                    exam_ids.append(exam.id)

                    for student in all_students:
                        exam_to_group_datas.append(
                            Exam_to_group(
                                exam=exam,
                                student=student,
                                group=student.group
                            )
                        )

                exam_to_groups = Exam_to_group.objects.filter(exam_id__in=exam_ids)

                if len(exam_to_groups) > 0:
                    exam_to_groups.delete()

                # Exam_to_group үүсгэх
                if len(exam_to_group_datas) > 0:
                    Exam_to_group.objects.bulk_create(exam_to_group_datas)

        except Exception as e:
            print(e)
            return request.send_error('ERR_002', 'Хуваарь хадгалахад алдаа гарлаа.')

        return request.send_info('INF_001')


@permission_classes([IsAuthenticated])
class TimeTablePrint(
    generics.GenericAPIView,
):
    """ Хичээлийн хуваарь хэвлэх """

    def get(self, request):

        school = request.query_params.get('school')

        lesson_year, lesson_season = get_active_year_season()

        season_obj = Season.objects.get(pk=lesson_season)

        timetable_ids = TimeTable.objects.filter(lesson_year=lesson_year, lesson_season=lesson_season, school=school).values_list('id', flat=True)

        timetable_group = TimeTable_to_group.objects.filter(timetable__in=timetable_ids, group__profession__school=school).values('group', 'group__name').distinct('group')

        user = request.user

        employee = Employee.objects.filter(user=user, state=Employee.STATE_WORKING).first()
        position_name = employee.org_position.name if employee.org_position else ''

        user_info = Teachers.objects.filter(user=user, action_status=Teachers.APPROVED).first()

        info = {}
        info['bolovsruulsan_name'] = user_info.full_name if user_info else ''
        info['bolovsruulsan_position'] = position_name

        sign_obj = DefinitionSignature.objects.filter(dedication_type=DefinitionSignature.TIMETABLE).first()

        info['director_name'] = sign_obj.name if sign_obj else ''
        info['director_position'] = sign_obj.position_name if sign_obj else ''

        school_obj = SubOrgs.objects.get(id=school)
        monit_obj = DefinitionSignature.objects.filter(dedication_type=DefinitionSignature.TIMETABLE, school=school_obj.id).first()

        info['hynasan_name'] = monit_obj.name if monit_obj else ''
        info['hynasan_position'] = sign_obj.position_name if sign_obj else ''
        info['school_name'] = school_obj.name if school_obj else ''
        info['lesson_year'] = lesson_year if lesson_year else ''
        info['lesson_season'] = season_obj.season_code if season_obj else lesson_season

        all_datas = []

        for group_obj in list(timetable_group):
            obj = {}
            obj['name'] = group_obj.get('group__name')

            timetable_group_ids = TimeTable_to_group.objects.filter(group=group_obj.get('group'), timetable__lesson_year=lesson_year, timetable__lesson_season=lesson_season).values_list('timetable', flat=True)
            timetable_qs = TimeTable.objects.filter(id__in=list(timetable_group_ids)).order_by('day', 'time')
            data = TimetablePrintSerializer(timetable_qs, many=True).data
            obj['schedule']= data
            all_datas.append(obj)

        return_datas = {
            'data': all_datas,
            'info': info
        }

        return request.send_data(return_datas)


@permission_classes([IsAuthenticated])
class ExamTimeTableListAPIView(
    mixins.ListModelMixin,
    generics.GenericAPIView
):
    """ Шалгалтын хуваарийн жагсаалт """

    queryset = ExamTimeTable.objects.all()
    serializer_class = ExamTimeTableSerializer

    @has_permission(must_permissions=['lms-timetable-exam-read'])
    def get(self, request, pk=None):
        " Шалгалтын хуваарь жагсаалт "

        is_online = self.request.query_params.get("is_online")
        lesson_year, lesson_season = get_active_year_season()
        self.queryset = self.queryset.filter(lesson_year=lesson_year, lesson_season=lesson_season)

        if is_online:
            is_online = str2bool(is_online)
            self.queryset = self.queryset.filter(is_online=is_online)

        self.serializer_class = ExamTimeTableAllSerializer

        less_standart_list = self.list(request).data
        return request.send_data(less_standart_list)


@permission_classes([IsAuthenticated])
class ExamTimeTableScoreListAPIView(
    mixins.ListModelMixin,
    generics.GenericAPIView
):
    """ Шалгалтын дүн татах """

    queryset = ExamTimeTable.objects.all()
    serializer_class = ExamTimeTableSerializer

    @has_permission(must_permissions=['lms-timetable-exam-score-download'])
    @transaction.atomic()
    def put(self, request, pk=None):
        """
            pk- ExamTimeTable id
        """

        sid = transaction.savepoint()
        challenge_student_data = list()

        try:

            lesson = self.request.query_params.get("lesson")
            lesson_year = self.request.query_params.get("lesson_year")
            lesson_season = self.request.query_params.get("lesson_season")

            instance = self.get_object()

            # Шалгалт өгсөн анги
            exam_groups = Exam_to_group.objects.filter(exam=instance).values_list('group', flat=True)

            # Онлайнаар шалгалт өгсөн бол энд дүн нь байгаа
            challenge_qs = Challenge.objects.filter(challenge_type=Challenge.SEMESTR_EXAM, lesson=lesson, lesson_year=lesson_year, lesson_season=lesson_season)
            challenge_students = ChallengeStudents.objects.filter(challenge__in=challenge_qs, student__group__in=exam_groups).order_by('score')

            if challenge_students.count() == 0:
                return request.send_data([])

            scoretype_qs = Lesson_teacher_scoretype.objects.filter(score_type=Lesson_teacher_scoretype.BUSAD, lesson_teacher__lesson=lesson).first()

            # 70-н оноо оруулсан багш
            other_lesson_teacher = scoretype_qs.lesson_teacher if scoretype_qs else None

            scoretype = Lesson_teacher_scoretype.objects.filter(lesson_teacher=other_lesson_teacher, score_type=Lesson_teacher_scoretype.SHALGALT_ONOO).first()

            if not scoretype:
                scoretype = Lesson_teacher_scoretype.objects.create(
                    lesson_teacher=other_lesson_teacher,
                    score_type=Lesson_teacher_scoretype.SHALGALT_ONOO,
                    score=30
                )

            for challenge_student in challenge_students:
                student = challenge_student.student
                score = challenge_student.score or 0                     # авсан оноо
                take_score = challenge_student.take_score or 0           # авах оноо
                exam_score = 0
                if score != 0:
                    # 30 оноонд хувилсан
                    # (Авсан оноо * Хувиргах оноо) / авах оноо
                    exam_score = round((score * 30) / take_score)

                teach_score = TeacherScore.objects.filter(score_type=scoretype, student=student, lesson_season=lesson_season, lesson_year=lesson_year)

                # Дүн орчихсон байвал update хийнэ
                if teach_score:
                    teach_score.update(
                        score=float(exam_score) if exam_score else 0,
                        lesson_year=lesson_year,
                        lesson_season=lesson_season
                    )

                    teach_score = teach_score.first()
                else:
                    teach_score = TeacherScore.objects.create(
                        lesson_year=lesson_year,
                        lesson_season_id=lesson_season,
                        student=student,
                        score_type=scoretype,
                        score=float(exam_score) if exam_score else 0
                    )

        except Exception as e:
            print('e', e)
            return request.send_error("ERR_002", "Шалгалтын дүн татахад алдаа гарлаа")

        challenge_students_ids = challenge_students.values_list("student_id", flat=True)
        teach_score = TeacherScore.objects.filter(score_type=scoretype, student__in=challenge_students_ids, lesson_season=lesson_season, lesson_year=lesson_year)
        challenge_student_data = TeacherScoreStudentsSerializer(teach_score, many=True).data

        return request.send_info("INF_021", challenge_student_data)

@permission_classes([IsAuthenticated])
class Exam_repeatTestListAPIView(
    mixins.CreateModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    mixins.RetrieveModelMixin,
    mixins.ListModelMixin,
    generics.GenericAPIView
):
    queryset = ExamTimeTable.objects.all()

    def get(self, request, pk=None):
        self.serializer_class = ExamTimeTableListSerializer
        lesson_year, lesson_season = get_active_year_season()

        queryset = self.queryset.filter(lesson_year=lesson_year,lesson_season=lesson_season)
        if pk:
            queryset = self.queryset.filter(lesson=pk)
            repeat = self.serializer_class(queryset,many=True).data
            return request.send_data(repeat)

        all_result = self.list(request).data
        return request.send_data(all_result)

@permission_classes([IsAuthenticated])
class ExamrepeatStudentsAPIView(
    mixins.CreateModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    mixins.RetrieveModelMixin,
    mixins.ListModelMixin,
    generics.GenericAPIView
):
    def get(self , request, pk=None):
        if pk:
            students = Exam_to_student.objects.filter(exam=pk).select_related('student')

            datas = [
                {
                    "student_id": obj.student.id,
                    "code": obj.student.code,
                    "student_name": f"{obj.student.code}-{obj.student.last_name[0]}.{obj.student.first_name}",
                    "group_name":f"{obj.student.group.profession.name} - {obj.student.group.name}"
                }
                for obj in students
            ]
            return request.send_data(datas)

        return request.send_error("ERR_004")

    def post(self, request,pk=None):
        data = request.data

        try:
            groups = Exam_to_group.objects.filter(exam__in=data).values_list('group_id',flat=True)
            student_ids = Student.objects.filter(group_id__in=groups).values_list('id',flat=True)

            exam_qs = ExamTimeTable.objects.values_list('lesson', flat=True)

            # Нийт 3 аас илүү хичээл дээр унасан сурагчид
            exclude_qs = TeacherScore.objects.filter(score__gt=0, student_id__in=student_ids, score_type__lesson_teacher__lesson__in=exam_qs).values('student_id').annotate(
                    scored_lesson_count=Count('score_type__lesson_teacher__lesson__name', distinct=True),
                    is_fail=Exists(
                        TeacherScore.objects.filter(score_type__lesson_teacher__lesson=pk, student=OuterRef('student'), score_type__score_type=Lesson_teacher_scoretype.SHALGALT_ONOO, score__lt=18)
                    ),
                    success_scored_lesson_count=Count(
                        Case(
                            When(
                                Q(score_type__score_type=Lesson_teacher_scoretype.SHALGALT_ONOO) &
                                Q(score__gte=18),
                                then='score_type__lesson_teacher__lesson__name'
                            )
                        ),
                        distinct=True
                    ),
                    failed_scored_lesson_count=F('scored_lesson_count') - F('success_scored_lesson_count')
                    ).filter(failed_scored_lesson_count__gte=3, is_fail=True)

            exclude_qs = exclude_qs.values_list('student_id', flat=True)

            excluded_student_ids = list(exclude_qs)

            excluded_students = TeacherScore.objects.filter(
                Q(score_type__score_type=Lesson_teacher_scoretype.SHALGALT_ONOO),
                (Q(score__lt=18) | Q(score__isnull=True)),
                student_id__in=excluded_student_ids,
                score_type__lesson_teacher__lesson=pk
            ).values(
                'student_id',
                'student__first_name',
                'student__last_name',
                'student__code',
                'score',
                'student__group__name',
                'student__group__profession__name'
            ).distinct('student_id')

            queryset = (
                TeacherScore.objects
                .filter(
                    score_type__lesson_teacher__lesson=pk
                )
                .annotate(
                    is_exam=Exists(
                        TeacherScore.objects.filter(score_type__lesson_teacher__lesson=pk, student=OuterRef('student'), score_type__score_type=Lesson_teacher_scoretype.SHALGALT_ONOO)
                    ),
                    exam_score=(
                        Case(
                            When(
                                is_exam=True,
                                then='score',
                            ),
                            When(
                                is_exam=False,
                                then=Value(0),
                            ),
                            default=Value(1001), output_field=FloatField(),
                        )
                    ),
                    stype=(
                        Case(
                            When(
                                is_exam=True,
                                then='score_type__score_type',
                            ),
                            When(
                                is_exam=False,
                                then=Value(Lesson_teacher_scoretype.SHALGALT_ONOO),
                            ),
                            default=Value(8), output_field=IntegerField(),
                        )
                    ),
                )
                .filter(
                    Q(
                        Q(is_exam=False) |
                        Q(is_exam=True, score__lt=18)
                    ),
                    stype=Lesson_teacher_scoretype.SHALGALT_ONOO,  # Optional: filter specific type
                    student_id__in=student_ids,  # Filter by student IDs
                )
                .exclude(student_id__in=excluded_student_ids)
            )

            return_list = queryset.values('student_id', 'student__first_name','student__last_name','student__code','score','student__group__name','student__group__profession__name').order_by('score')
            response_data = {
                "included_students": list(return_list),
                "excluded_students": list(excluded_students),
            }

            return request.send_data(response_data)
        except Exception as e:
            return request.send_error('ERR_002', f"An error occurred: {str(e)}")

@permission_classes([IsAuthenticated])
class ExamRepeatTimeTableScoreListAPIView(
    mixins.ListModelMixin,
    generics.GenericAPIView
):
    """ Шалгалтын дүн татах """

    queryset = Exam_repeat.objects.all()
    serializer_class = ExamTimeTableSerializer

    @has_permission(must_permissions=['lms-timetable-exam-score-download'])
    @transaction.atomic()
    def put(self, request, pk=None):
        """
            pk- Exam-repeat id
        """

        challenge_student_data = list()
        try:

            lesson = self.request.query_params.get("lesson")
            lesson_year = self.request.query_params.get("lesson_year")
            lesson_season = self.request.query_params.get("lesson_season")

            instance = self.get_object()

            # Шалгалт өгсөн сурагчид
            exam_students = Exam_to_student.objects.filter(exam=instance).values_list('student', flat=True)

            # Онлайнаар шалгалт өгсөн бол энд дүн нь байгаа
            challenge_qs = Challenge.objects.filter(challenge_type=Challenge.SEMESTR_EXAM, lesson=lesson, lesson_year=lesson_year, lesson_season=lesson_season, is_repeat=True)
            challenge_students = ChallengeStudents.objects.filter(challenge__in=challenge_qs, student__in=exam_students)

            if challenge_students.count() == 0:
                return request.send_data([])

            scoretype_qs = Lesson_teacher_scoretype.objects.filter(score_type=Lesson_teacher_scoretype.BUSAD, lesson_teacher__lesson=lesson).first()

            # 70-н оноо оруулсан багш
            other_lesson_teacher = scoretype_qs.lesson_teacher if scoretype_qs else None

            scoretype = Lesson_teacher_scoretype.objects.filter(lesson_teacher=other_lesson_teacher, score_type=Lesson_teacher_scoretype.SHALGALT_ONOO).first()
            if not scoretype:
                scoretype = Lesson_teacher_scoretype.objects.create(
                    lesson_teacher=other_lesson_teacher,
                    score_type=Lesson_teacher_scoretype.SHALGALT_ONOO,
                    score=30
                )

            for challenge_student in challenge_students:
                student = challenge_student.student
                challenge_student_obj = ChallengeStudents.objects.filter(challenge__in=challenge_qs, student=student).order_by('-updated_at').first()
                score = challenge_student_obj.score or 0                     # авсан оноо
                take_score = challenge_student_obj.take_score or 0           # авах оноо

                exam_score = 0
                if score != 0:
                    # 30 оноонд хувилсан
                    # (Авсан оноо * Хувиргах оноо) / авах оноо
                    exam_score = (score * 30) / take_score

                teach_score = TeacherScore.objects.filter(score_type=scoretype, student=student, lesson_season=lesson_season, lesson_year=lesson_year)

                # Дүн орчихсон байвал update хийнэ
                if teach_score:
                    teach_score.update(
                        score=round(exam_score) if exam_score else 0,
                        lesson_year=lesson_year,
                        lesson_season=lesson_season
                    )

                    teach_score = teach_score.first()
                else:
                    teach_score = TeacherScore.objects.create(
                        lesson_year=lesson_year,
                        lesson_season_id=lesson_season,
                        student=student,
                        score_type=scoretype,
                        score=round(exam_score) if exam_score else 0
                    )

        except Exception as e:
            print('e', e)
            return request.send_error("ERR_002", "Шалгалтын дүн татахад алдаа гарлаа")

        challenge_students_ids = challenge_students.values_list("student_id", flat=True)
        teach_score = TeacherScore.objects.filter(score_type=scoretype, student__in=challenge_students_ids, lesson_season=lesson_season, lesson_year=lesson_year)
        challenge_student_data = TeacherScoreStudentsSerializer(teach_score, many=True).data

        return request.send_info("INF_021", challenge_student_data)

@permission_classes([IsAuthenticated])
class ExamrepeatAddStudentAPIView(
    mixins.CreateModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    mixins.RetrieveModelMixin,
    mixins.ListModelMixin,
    generics.GenericAPIView
):
    def post(self, request,pk=None):
        student_id = request.data
        if Exam_to_student.objects.filter(exam=pk, student_id=student_id).exists():
            return request.send_error("ERR_002","Тухайн оюутан шалгалт өгөх оюутан дотор байна")

        obj = Exam_to_student(
            exam_id=pk,
            student_id=student_id
        )
        obj.save()
        return request.send_info("INF_022")