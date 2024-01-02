import os
import pandas as pd
from django.utils import timezone
from datetime import datetime, timedelta

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
from django.db.models import Q

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

    @has_permission(must_permissions=['lms-timetable-building-update'])
    def put(self, request, pk=None):
        " хичээлийн байр засах "

        request_data = request.data
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
            with transaction.atomic():
                try:
                    self.create(request).data

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

                if key == 'non_field_errors':
                    msg = "Өрөөний дугаар давхцаж байна"
                    key = 'code'

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
            with transaction.atomic():
                try:
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
            with transaction.atomic():
                try:
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
                                if group_data:
                                    for row in group_data:
                                        group_id = row.get("id")

                                        obj = TimeTable_to_group.objects.create(
                                            timetable_id = table_id,
                                            group_id =  group_id
                                        )

                                # Онлайнаар үзэж байгаа ангиудыг хадгалах
                                if add_online_group:
                                    for row in add_online_group:
                                        group_id = row.get("id")

                                        obj = TimeTable_to_group.objects.create(
                                            timetable_id = table_id,
                                            group_id =  group_id,
                                            is_online = True
                                        )

                                # Нэмэлтээр үзэж байгаа оюутан
                                if add_students:
                                    for student in add_students:
                                        obj = TimeTable_to_student.objects.create(
                                            timetable_id = table_id,
                                            student_id = student,
                                            add_flag = True
                                        )

                                # Хувиараас хасалт хийлгэж байгаа оюутан
                                if remove_students:
                                    for rstudent in remove_students:
                                        obj = TimeTable_to_student.objects.create(
                                            timetable_id = table_id,
                                            student_id = rstudent,
                                            add_flag = False
                                        )

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

        lesson_year, lesson_season = get_active_year_season()

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
            if all_group_student_count > int(st_count):
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
            if not is_kurats:
                qs_room = qs_timetable.filter(room_id=room).last()
                if qs_room != None:
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
            if not is_optional:
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

            with transaction.atomic():
                try:
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

    queryset = ExamTimeTable.objects.all()
    serializer_class = ExamTimeTableSerializer

    pagination_class = CustomPagination

    filter_backends = [SearchFilter]
    search_fields = ['lesson__name', 'room__name', 'exam_date', 'begin_time', 'end_time', 'teacher__first_name', 'teacher__last_name', 'room__volume', 'room__code']

    def get_queryset(self):
        queryset = self.queryset
        year, season = get_active_year_season()

        day = self.request.query_params.get('day')
        group = self.request.query_params.get('group_id')
        lesson = self.request.query_params.get('lesson')
        teacher = self.request.query_params.get('teacher')
        time = self.request.query_params.get('time')
        school = self.request.query_params.get('school')

        # Өдрөөр хайлт хийх
        if day:
            queryset = queryset.filter(day=day)

        # Хичээлээр хайлт хийх
        if lesson:
            queryset = queryset.filter(lesson=lesson)

        # Багшаар хайлт хийх
        if teacher:
            lesson_ids = TimeTable.objects.filter(teacher=teacher, lesson_year=year, lesson_season=season).values_list('lesson', flat=True).distinct('lesson')
            queryset = queryset.filter(lesson__in=lesson_ids)

        # Цагаар хайлт хийх
        if time:
            queryset = queryset.filter(time=time)

        # Сургуулиар хайлт хийх
        if school:
            lesson_ids = TimeTable.objects.filter(school=school, lesson_year=year, lesson_season=season).values_list('lesson', flat=True).distinct('lesson')
            queryset = queryset.filter(lesson__in=list(lesson_ids))

        # Ангиар хайлт хийх
        if group:
            qs_timetable = Exam_to_group.objects.filter(
                    group_id=group
                ) \
                .values_list('exam', flat=True)

            queryset = queryset.filter(id__in=list(qs_timetable))

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
        student_data = request_data.get('student')

        room = request_data.get('room')
        lesson = request_data.get('lesson')
        school = request_data.get('school')
        teacher = request_data.get('teacher')
        end_time = request_data.get('end_time')
        exam_date = request_data.get('exam_date')
        begin_time = request_data.get('begin_time')
        lesson_year = request_data.get('lesson_year')
        lesson_season = request_data.get('lesson_season')

        # Group dataнаас оюутан устгах
        if 'student' in request_data:
            request_data = remove_key_from_dict(request_data, 'student')

        serializer = self.get_serializer(data=request_data)

        try:

            if serializer.is_valid(raise_exception=False):

                exam_table_qs = ExamTimeTable.objects.filter(
                        school=school,
                        lesson_year=lesson_year,
                        lesson_season=lesson_season,
                        exam_date=exam_date,
                    )

                qs_exam_teacher = exam_table_qs.filter(teacher=teacher)

                qs_exam_room = exam_table_qs.filter(room=room)

                qs_exam_lesson = ExamTimeTable.objects.filter(
                        school=school,
                        lesson_year=lesson_year,
                        lesson_season=lesson_season,
                        lesson=lesson
                    ).last()

                # Тухайн хичээлийн жил, улирал, өдрийн шалгалтын хуваарийн жагсаалт
                qs_examtimetable_ids = exam_table_qs.values_list(
                        'id',
                        flat=True
                    ).distinct()

                # Шалгалтыг хянах багшийн хуваарь давхцаж байгаа эсэхийг шалгана
                if qs_exam_teacher:
                    qs_exam_teacher_times = qs_exam_teacher.values(
                            'begin_time',
                            'end_time',
                            'lesson__name'
                        )

                    for teacher in qs_exam_teacher_times:
                        start = teacher.get('begin_time')
                        end = teacher.get('end_time')

                        if (start <= begin_time and end >= begin_time) or (start <= end_time and end >= end_time) or (start >= begin_time and end <= end_time):
                            lesson = teacher.get('lesson__name')

                            msg = "Энэ багш нь {lesson} хичээлийн {exam_date} өдрийн {begin_time}-{end_time} цагийн хооронд шалгалттай байна." \
                                .format(
                                    lesson=lesson,
                                    exam_date=exam_date,
                                    begin_time=start,
                                    end_time=end
                                )

                            error_obj = get_error_obj(msg, 'teacher')

                # Шалгалт авах өрөө давхцаж байгаа эсэхийг шалгана
                if qs_exam_room:
                    qs_exam_rooms = qs_exam_room.values(
                            'begin_time',
                            'end_time',
                            'lesson__name'
                        )

                    for rooms in qs_exam_rooms:
                        start = rooms.get('begin_time')
                        end = rooms.get('end_time')

                        if (start <= begin_time and end >= begin_time) or (start <= end_time and end >= end_time) or (start >= begin_time and end <= end_time):
                            lesson = rooms.get('lesson__name')

                            msg = "Энэ өрөө нь {exam_date} өдрийн {begin_time}-{end_time} цагийн хооронд {lesson} хичээлийн шалгалттай байна." \
                                .format(
                                    lesson=lesson,
                                    exam_date=exam_date,
                                    begin_time=start,
                                    end_time=end
                                )

                            error_obj = get_error_obj(msg, 'room')

                # Оюутаны цаг давхцаж байгаа эсэхийг шалгана
                if student_data:

                    if qs_examtimetable_ids:
                        for exam_timetable_id in qs_examtimetable_ids:

                            exam_qs = ExamTimeTable.objects.filter(
                                    pk=exam_timetable_id
                                ).first()

                            lesson = exam_qs.lesson.name
                            start = exam_qs.begin_time
                            end = exam_qs.end_time
                            students = []

                            for student_id in student_data:

                                qs = Exam_to_group.objects.filter(
                                        exam=exam_timetable_id,
                                        student=student_id
                                    )

                                if qs:
                                    for stu in qs:
                                        student_code = stu.student.code
                                        if student_code not in students:
                                            students.append(student_code)

                                    if (start <= begin_time and end >= begin_time) or (start <= end_time and end >= end_time) or (start >= begin_time and end <= end_time):
                                        if students:
                                            msg = '''{student_code} кодтой {text} {exam_date} өдрийн {begin_time}-{end_time} цагийн хооронд {lesson} хичээлийн шалгалттай байна.''' \
                                                .format(
                                                    student_code=', '.join(['{}'.format(f) for f in students]),
                                                    lesson=lesson,
                                                    exam_date=exam_date,
                                                    begin_time=start,
                                                    end_time=end,
                                                    text='оюутнууд' if len(students) > 1 else 'оюутан'
                                                )

                                            error_obj = get_error_obj(msg, 'student')

                # Тухайн хичээлийн шалгалтыг нэг цагт авч буй эсэхийг шалгана
                if qs_exam_lesson:

                    start = qs_exam_lesson.begin_time
                    end = qs_exam_lesson.end_time
                    check_exam_date = qs_exam_lesson.exam_date
                    lesson = qs_exam_lesson.lesson.name

                    if start != begin_time or end != end_time or str(check_exam_date) != exam_date:
                        msg = '''{lesson} хичээлийн шалгалт {exam_date} өдрийн {begin_time}-{end_time} цагийн хооронд байна.''' \
                            .format(
                                lesson=lesson,
                                exam_date=check_exam_date,
                                begin_time=start,
                                end_time=end
                            )

                        error_obj = get_error_obj(msg, 'lesson')

                if len(error_obj) > 0:
                    return request.send_error("ERR_003", error_obj)

                with transaction.atomic():
                    try:
                        exam_data = self.create(request).data

                        # Шалгалтын хуваарийн хүснэгтийн id
                        exam_table_id = exam_data.get('id')

                        if student_data:
                            for student_id in student_data:

                                qs_timegroup = Exam_to_group.objects.filter(
                                        exam_id=exam_table_id,
                                        student=student_id
                                    )

                                if not qs_timegroup:
                                    obj = Exam_to_group.objects.create(
                                        exam_id=exam_table_id,
                                        student_id=student_id
                                    )

                            return request.send_info("INF_001")

                        return request.send_info("INF_001")

                    except Exception as e:
                        print(e)
                        return request.send_error("ERR_002", "Шалгалтын хуваарь давхцаж байна.")

            else:
                transaction.savepoint_rollback(sid)
                return request.send_error_valid(serializer.errors)

        except Exception as e:
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
        end_time = request_data.get('end_time')
        is_online = request_data.get('is_online')
        exam_date = request_data.get('exam_date')
        begin_time = request_data.get('begin_time')
        lesson_year = request_data.get('lesson_year')
        lesson_season = request_data.get('lesson_season')

        # Group dataнаас юутан устгах
        if student_data:
            request_data = remove_key_from_dict(request_data, 'student')

        serializer = self.get_serializer(instance, data=request_data)

        try:
            if serializer.is_valid(raise_exception=False):
                exam_table_qs = ExamTimeTable.objects.filter(
                        school=school,
                        lesson_year=lesson_year,
                        lesson_season=lesson_season,
                        exam_date=exam_date,
                    ).exclude(id=pk)

                if exam_table_qs:

                    qs_exam_teacher = exam_table_qs.filter(teacher=teacher).exclude(id=pk).last()

                    qs_exam_room = exam_table_qs.filter(room=room).exclude(id=pk).last()

                    qs_exam_lesson = ExamTimeTable.objects.filter(
                            school=school,
                            lesson_year=lesson_year,
                            lesson_season=lesson_season,
                            lesson=lesson
                        ).exclude(id=pk).last()

                    # Тухайн хичээлийн жил, улирал, өдрийн шалгалтын хуваарийн жагсаалт
                    qs_examtimetable_ids = exam_table_qs.values_list(
                            'id',
                            flat=True
                        ).exclude(id=pk).distinct()

                    # Шалгалтыг хянах багшийн хуваарь давхцаж байгаа эсэхийг шалгана
                    if qs_exam_teacher:
                        start = qs_exam_teacher.begin_time
                        end = qs_exam_teacher.end_time
                        lesson = qs_exam_teacher.lesson.name

                        if (start <= begin_time and end >= begin_time) or (start <= end_time and end >= end_time) or (start >= begin_time and end <= end_time):

                            msg = "Энэ багш нь {lesson} хичээлийн {exam_date} өдрийн {begin_time}-{end_time} цагийн хооронд шалгалттай байна." \
                                .format(
                                    lesson=lesson,
                                    exam_date=exam_date,
                                    begin_time=start,
                                    end_time=end
                                )

                            error_obj = get_error_obj(msg, 'teacher')

                    # Шалгалтын өрөө давхцаж байгаа эсэхийг шалгана
                    if qs_exam_room:
                        start = qs_exam_room.begin_time
                        end = qs_exam_room.end_time
                        lesson = qs_exam_room.lesson.name

                        if (start <= begin_time and end >= begin_time) or (start <= end_time and end >= end_time) or (start >= begin_time and end <= end_time):

                                msg = "Энэ өрөө нь {exam_date} өдрийн {begin_time}-{end_time} цагийн хооронд {lesson} хичээлийн шалгалттай байна." \
                                    .format(
                                        lesson=lesson,
                                        exam_date=exam_date,
                                        begin_time=start,
                                        end_time=end
                                    )

                                error_obj = get_error_obj(msg, 'room')

                    # Оюутаны цаг давхцаж байгаа эсэхийг шалгана
                    if student_data:

                        if qs_examtimetable_ids:
                            for exam_timetable_id in qs_examtimetable_ids:

                                exam_qs = ExamTimeTable.objects.filter(
                                        pk=exam_timetable_id
                                    ).first()

                                lesson = exam_qs.lesson.name
                                start = exam_qs.begin_time
                                end = exam_qs.end_time
                                students = []

                                for student_id in student_data:
                                    # Шалгалтын хуваарь давхцаж байгаа оюутнуудын мэдээлэл авах
                                    qs = Exam_to_group.objects.filter(
                                            exam=exam_timetable_id,
                                            student=student_id
                                        )

                                    if qs:
                                        for stu in qs:
                                            student_code = stu.student.code
                                            if student_code not in students:
                                                students.append(student_code)

                                        if (start <= begin_time and end >= begin_time) or (start <= end_time and end >= end_time) or (start >= begin_time and end <= end_time):
                                            if students:
                                                msg = '''{student_code} кодтой {text} {exam_date} өдрийн {begin_time}-{end_time} цагийн хооронд {lesson} хичээлийн шалгалттай байна.''' \
                                                    .format(
                                                        student_code=', '.join(['{}'.format(f) for f in students]),
                                                        lesson=lesson,
                                                        exam_date=exam_date,
                                                        begin_time=start,
                                                        end_time=end,
                                                        text='оюутнууд' if len(students) > 1 else 'оюутан'
                                                    )

                                                error_obj = get_error_obj(msg, 'student')

                    # Тухайн хичээлийн шалгалтыг нэг цагт авч буй эсэхийг шалгана
                    if qs_exam_lesson:

                        start = qs_exam_lesson.begin_time
                        end = qs_exam_lesson.end_time
                        check_exam_date = qs_exam_lesson.exam_date
                        lesson = qs_exam_lesson.lesson.name

                        if start != begin_time or end != end_time or str(check_exam_date) != exam_date:
                            msg = '''{lesson} хичээлийн шалгалт {exam_date} өдрийн {begin_time}-{end_time} цагийн хооронд байна.''' \
                                .format(
                                    lesson=lesson,
                                    exam_date=check_exam_date,
                                    begin_time=start,
                                    end_time=end
                                )

                            error_obj = get_error_obj(msg, 'lesson')

                    if len(error_obj) > 0:
                        return request.send_error("ERR_003", error_obj)

                with transaction.atomic():
                    try:
                        self.update(request).data

                        # Шалгалтын хуваарийн хүснэгтийн id
                        exam_qs = Exam_to_group.objects.filter(exam=pk)

                        # Хуучин шалгалт өгөх байсан оюутаны жагсаалт
                        old_student_ids = list(exam_qs.values_list('student', flat=True).distinct())

                        # Зөвхөн оюутан сонгосон бол
                        if student_data:
                            for student_id in student_data:
                                qs_timegroup = exam_qs.filter(student=student_id)

                                if not qs_timegroup:
                                    obj = Exam_to_group.objects.update_or_create(
                                        exam_id=pk,
                                        student_id=student_id
                                    )

                            for old_student_id in old_student_ids:
                                if not (old_student_id in student_data):
                                    qs_student = exam_qs.filter(
                                            student=old_student_id
                                        )
                                    if qs_student:
                                        qs_student.delete()

                        return request.send_info("INF_002")

                    except Exception as e:
                        return request.send_error("ERR_002")
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
    search_fields = ['student__code', 'student__last_name', 'student__first_name','lesson__name', 'lesson__code']

    def get_queryset(self):
        queryset = self.queryset
        status = self.request.query_params.get('status')
        lesson_year = self.request.query_params.get('lesson_year')
        lesson_season = self.request.query_params.get('lesson_season')

        if lesson_year:
            queryset = queryset.filter(lesson_year=lesson_year)

        if lesson_season:
            queryset = queryset.filter(lesson_season=lesson_season)

        if status:
            queryset = queryset.filter(status=status)

        return queryset

    @has_permission(must_permissions=['lms-stipend-read'])
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

        data = request.data
        lesson = data.get('lesson')
        student = data.get('student')
        status = data.get('status')
        lesson_year = data.get('lesson_year')
        lesson_season = data.get('lesson_season')
        serializer = self.get_serializer(data=data)

        sid = transaction.savepoint()

        try:
            serializer = self.serializer_class(data=data, many=False)
            if not serializer.is_valid():
                transaction.savepoint_rollback(sid)
                return request.send_error_valid(serializer.errors)

            score_qs = ScoreRegister.objects.filter(
                student=student,
                lesson=lesson,
                is_delete=False
            ).exclude(lesson_year=lesson_year,lesson_season=lesson_season).first()

            # ---------------- Шууд тооцох шалгалт ---------------
            if int(status) == Exam_repeat.ALLOW_EXAM and score_qs:
                lesson_name = score_qs.lesson.name
                msg = "'{lesson_name}' хичээлийг өмнө нь үзсэн учир шууд тооцох шалгалтыг өгөх боломжгүй".format(lesson_name=lesson_name)

                return request.send_error("ERR_002", msg)

            # --------------- Нөхөн шалгалт ----------------
            if int(status) == Exam_repeat.REPLACE_EXAM:
                if score_qs:
                    exam_score = score_qs.exam_score
                    lesson_name = score_qs.lesson.name

                    if exam_score:
                        msg = "'{lesson_name}' хичээлийн шалгалтын оноо '{score}' байгаа учир нөхөн шалгалтыг өгөх боломжгүй" \
                            .format(
                                lesson_name=lesson_name,
                                score=exam_score
                            )

                        return request.send_error("ERR_002", msg)

                else:
                    return request.send_error("ERR_002", "Тухайн хичээл дээр нөхөн шалгалт өгөх боломжгүй байна")

            # --------------- Дүн ахиулах шалгалт ----------------
            if int(status) == Exam_repeat.UPGRADE_SCORE and not score_qs:

                return request.send_error("ERR_002", "Дүн ахиулах шалгалтыг зөвхөн өмнө нь хичээлийг үзсэн үед өгөх боломжтой.")

            self.create(request).data

        except Exception:
            return request.send_error("ERR_002")

        return request.send_info("INF_001")

    @transaction.atomic
    def put(self, request, pk=None):
        " Дахин шалгалт өгөх бүртгэл шинээр үүсгэх "

        request_data = request.data
        lesson = request_data.get('lesson')
        student = request_data.get('student')
        status = request_data.get('status')
        lesson_year = request_data.get('lesson_year')
        lesson_season = request_data.get('lesson_season')
        instance = self.get_object()

        serializer = self.get_serializer(instance, data=request_data)

        try:
            if not serializer.is_valid(raise_exception=False):
                return request.send_error_valid(serializer.errors)

            score_qs = ScoreRegister.objects.filter(
                    student=student,
                    lesson=lesson,
                    is_delete=False,
                ).exclude(lesson_year=lesson_year,lesson_season=lesson_season).first()

            # ---------------- Шууд тооцох шалгалт ---------------
            if int(status) == Exam_repeat.ALLOW_EXAM and score_qs:
                lesson_name = score_qs.lesson.name
                msg = "'{lesson_name}' хичээлийг өмнө нь үзсэн учир шууд тооцох шалгалтыг өгөх боломжгүй".format(lesson_name=lesson_name)

                return request.send_error("ERR_002", msg)

            # --------------- Нөхөн шалгалт ----------------
            if int(status) == Exam_repeat.REPLACE_EXAM:
                if score_qs:
                    exam_score = score_qs.exam_score
                    lesson_name = score_qs.lesson.name

                    if exam_score:
                        msg = "'{lesson_name}' хичээлийн шалгалтын оноо '{score}' байгаа учир нөхөн шалгалтыг өгөх боломжгүй" \
                            .format(
                                lesson_name=lesson_name,
                                score=exam_score
                            )

                        return request.send_error("ERR_002", msg)
                else:
                    return request.send_error("ERR_002", "Тухайн хичээл дээр нөхөн шалгалт өгөх боломжгүй байна")

            # --------------- Дүн ахиулах шалгалт ----------------
            if int(status) == Exam_repeat.UPGRADE_SCORE and not score_qs:
                return request.send_error("ERR_002", "Дүн ахиулах шалгалтыг зөвхөн өмнө нь хичээлийг үзсэн үед өгөх боломжтой.")

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
            student = exam_qs.student
            status = exam_qs.status
            lesson_year = exam_qs.lesson_year
            lesson_season = exam_qs.lesson_season

            score_qs = ScoreRegister.objects.filter(lesson=lesson,student=student,status=int(status)+4,lesson_year=lesson_year,lesson_season=lesson_season,is_delete=False)
            if score_qs:
                return request.send_error("ERR_003", 'Энэ шалгалтын дүн нь орсон тул устгах боломжгүй.')

        self.destroy(request, pk)
        return request.send_info("INF_003")


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

        if not begin_date and not end_date:
            current_date = datetime.today()
            begin_date = current_date - timedelta(days=current_date.weekday())
            end_date = begin_date + timedelta(days=6)

        dep_id = self.request.query_params.get('selectedValue')

        year, season = get_active_year_season()

        self.queryset = self.queryset.filter(lesson_year=year.strip(), lesson_season=season)

        # Хөтөлбөрийн багаар хайлт хийх
        if dep_id:
            group_ids = Group.objects.filter(department_id=dep_id).values_list('id', flat=True)
            t_ids = TimeTable_to_group.objects.filter(group_id__in=group_ids).values_list('timetable', flat=True)

            self.queryset = self.queryset.filter(id__in=t_ids)

        query = '''
            SELECT tt.color, tt.id as event_id, tt.day, tt.time,  tt.lesson_id AS lesson,  tt.room_id AS room, tt.teacher_id as teacher, ls.name as lesson_name, tt.odd_even, CONCAT(r.code , ' ', r.name) as room_name, CONCAT(SUBSTRING(cu.last_name, 1, 1), '.', cu.first_name) as teacher_name,
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
            (SELECT  case when COUNT(*)>0 THEN True ELSE False end gg FROM lms_scoreregister  ls WHERE ls.lesson_id = tt.lesson_id and ls.teacher_id = tt.teacher_id)  as is_score,
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

            WHERE tt.lesson_year='{year}' and tt.lesson_season_id ='{season}' and tt.begin_date >='{begin_date}' and tt.end_date <= '{end_date}' or  tt.begin_date is null
        '''.format(year=year, season=season, begin_date=begin_date, end_date=end_date)

        cursor = connection.cursor()
        cursor.execute(query)
        rows = list(dict_fetchall(cursor))

        return request.send_data(rows)

    def put(self, request, pk=None):
        errors = []

        queryset = TimeTable.objects.all()
        datas = request.data

        estimate = TeacherCreditVolumePlan.objects.get(pk=pk)

        day = datas.get('day')
        time = datas.get('time')
        odd_even = datas.get('odd_even')

        lesson = estimate.lesson
        teacher = estimate.teacher

        year = datas.get('lesson_year')
        season = datas.get('lesson_season')

        if not year and not season:
            year, season = get_active_year_season()

        group_ids = TeacherCreditVolumePlan_group.objects.filter(creditvolume=pk).values_list('group', flat=True)

        st_count = Student.objects.filter(group_id__in=group_ids).count()

        datas['st_count'] = st_count

        qs_timetable = queryset.filter(lesson_year=year, lesson_season_id=season, day=day, time=time, odd_even__in=[odd_even])

        timetable_ids = qs_timetable.values_list('id', flat=True)

        qs_teacher = qs_timetable.filter(teacher_id=teacher)

        # Багшийн давхцал
        if qs_teacher:
            teacher_obj = qs_teacher.last()
            clesson = teacher_obj.lesson.name
            time = teacher_obj.time
            day = teacher_obj.day

            msg = "Энэ багш нь {lesson} хичээлийн {day}-{time} дээр хуваарьтай байна.".format(lesson=clesson, day=day, time=time)

            errors = get_error_obj(msg, 'teacher')
            if len(errors) > 0:
                return request.send_error("ERR_003", errors)

        # Сонгон хичээл биш тухайн ангийн хичээлийн хуваарийн давхцалыг шалгах
        for timetable_id in timetable_ids:
            qs = queryset.filter(pk=timetable_id).first()

            # Сонгосон өдөр цагтай хуваариудын хичээлийн нэр
            glesson = qs.lesson.name
            for group in group_ids:

                # Тухайн сонгосон анги сонгогдсон өдөр цаг дээр хичээлтэй байж болохгүй
                qs_timetable_group = TimeTable_to_group.objects.filter(timetable_id=timetable_id, group_id=group)
                if qs_timetable_group:
                    qs_groups = qs_timetable_group.last()
                    group_name = qs_groups.group.name
                    msg = "{group_name} анги нь {day}-{time} дээр {lesson} хичээлийн хуваарьтай байна.".format(group_name=group_name, lesson=glesson, day=day, time=time)
                    errors = get_error_obj(msg, 'group')
                    if len(errors) > 0:
                        return request.send_error("ERR_003", errors)

        datas['lesson'] = lesson.id
        datas['teacher'] = teacher.id
        datas['school'] = lesson.school.id
        datas['type'] = estimate.type
        datas['created_user'] = request.user.id

        self.queryset = queryset
        serializer = self.get_serializer(data=datas)

        if serializer.is_valid(raise_exception=False):
            with transaction.atomic():
                try:
                    table_data = self.create(request).data
                    # Цагийн хуваарийн хүснэгтийн id
                    table_id=table_data.get('id')

                    # Хуваарь дээр ангиуд шивэх хэсэг
                    if group_ids:
                        for group_id in group_ids:
                            obj = TimeTable_to_group.objects.create(
                                timetable_id = table_id,
                                group_id =  group_id
                            )

                    estimate.is_timetable = True
                    estimate.save()

                    return request.send_info("INF_001")

                except Exception as e:
                    return request.send_error("ERR_002", "Хичээлийн хуваарь давхцаж байна.")
        else:
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

        begin_date = week.get('start_date')
        end_date = week.get('end_date')

        qs_tgroup = TimeTable_to_group.objects.all()

        school = self.request.query_params.get('school')
        selectedValue = self.request.query_params.get('selectedValue')

        # Calendar төрөл (энгийн, курац)
        stype = self.request.query_params.get('stype')

        time_tablequeryset = TimeTable.objects.all().filter(lesson_year=year.strip(), lesson_season=season)

        if end_date and begin_date:
            time_tablequeryset = time_tablequeryset.filter(Q(begin_date__isnull=True) | Q(begin_date__gte=begin_date, end_date__lte=end_date))

        if school:
            qs_tgroup = qs_tgroup.filter(group__school=school)
            time_tablequeryset = time_tablequeryset.filter(school=school)

        try:
            # Ангиар хайлт хийх хэсэг
            if stype == 'group':
                if selectedValue:
                    qs_tgroup = qs_tgroup.filter(group__department=selectedValue)

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

                if selectedValue:
                    qs_teacher = qs_teacher.filter(salbar_id=selectedValue)

                if school:
                    qs_teacher = qs_teacher.filter(Q(Q(sub_org=school) | Q(sub_org__org_code=10)))

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
                all_list = Room.objects.values('id', 'code').order_by('code')

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

    def put(self, request, pk):

        datas = request.data
        user = request.user

        datas['updated_user'] = user.id
        datas['updated_at'] = timezone.now()

        day = datas.get('day')
        time = datas.get('time')
        lesson_year = datas.get('lesson_year')
        lesson_season = datas.get('lesson_season')
        odd_even = datas.get('odd_even')
        is_online = datas.get('odd_even')

        qs_timetable = TimeTable.objects.filter(id=pk)
        if not qs_timetable:
            return request.send_error('ERR_002', 'Хуваарийн мэдээлэл олдсонгүй')

        timetable = qs_timetable.last()
        timetable_room = timetable.room
        timetable_teacher = timetable.teacher

        timetable_qs = TimeTable.objects.exclude(id=pk).filter(lesson_year=lesson_year, lesson_season_id=lesson_season, day=day, time=time, odd_even=odd_even)
        timetables = timetable_qs.values_list('id', flat=True)
        for timetable in timetables:
            timetable_obj = TimeTable.objects.filter(id=timetable, teacher=timetable_teacher).first()
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
            file_save_path = save_file(file, '', settings.TIMETABLE)
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
        with transaction.atomic():
            try:
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