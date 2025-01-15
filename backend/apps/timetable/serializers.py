
from datetime import datetime

from rest_framework import serializers
from django.db.models import F, Sum
from lms.models import Room
from lms.models import Building
from lms.models import TimeTable
from lms.models import TimeTable_to_group, TimeTable_to_student
from lms.models import Group
from lms.models import Student
from lms.models import Exam_to_group
from lms.models import ExamTimeTable
from lms.models import LessonStandart, ScoreRegister, Score, CalculatedGpaOfDiploma, StudentRegister
from lms.models import Exam_repeat, TeacherCreditVolumePlan, TeacherCreditVolumePlan_group, Teachers, ChallengeStudents, TeacherScore

from student.serializers import StudentListSerializer
from surgalt.serializers import LessonStandartSerialzier
from core.serializers import SubSchoolListSerailizer

from main.utils.function.utils import get_fullName, start_time, end_time, str2bool

from ..surgalt.serializers import LessonStandartListSerializer
from core.serializers import TeacherListSerializer


# Хичээлийн байр
class BuildingSerializer(serializers.ModelSerializer):

    class Meta:
        model = Building
        fields = "__all__"


# Хичээлийн өрөө
class RoomSerializer(serializers.ModelSerializer):

    class Meta:
        model = Room
        fields = "__all__"


class RoomInfoSerializer(serializers.ModelSerializer):

    building = BuildingSerializer(many=False)
    school = SubSchoolListSerailizer(many=False)
    type_name = serializers.SerializerMethodField()

    class Meta:
        model = Room
        fields = "__all__"

    def get_type_name(self, obj):
        room_type = None

        if obj:
            room_type = obj.get_type_display()

        return room_type


class RoomListSerializer(serializers.ModelSerializer):

    full_name = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Room
        fields = "__all__"

    def get_full_name(self, obj):
        """ Өрөөний нэр дугаар багтаамж төрөл"""

        full_name = ''
        code = obj.code
        name = obj.name
        volume = obj.volume

        type = obj.get_type_display()

        build = obj.building.code if obj.building else ''

        if build:
            full_name = build + '-'
        if code:
            full_name += code
        if name:
            full_name = full_name +  ' ' + name

        if type:
            full_name = full_name + ' ' + type

        if volume:
            full_name = full_name + ' (' + str(volume) +')'

        return full_name


class TimeTableAllListSerializer(serializers.ModelSerializer):
    event_id = serializers.IntegerField(source='id')
    group = serializers.SerializerMethodField()
    type_name = serializers.SerializerMethodField(read_only=True)
    title = serializers.SerializerMethodField(read_only=True)
    teacher_name = serializers.SerializerMethodField()
    room_name = serializers.SerializerMethodField()
    lesson_name = serializers.SerializerMethodField()
    group_list = serializers.SerializerMethodField()

    class Meta:
        model = TimeTable
        fields = ['id', 'day', 'time', 'event_id', 'group', 'type_name', 'title', 'teacher_name', 'room_name', 'lesson_name', 'odd_even', 'group_list', 'color']

    def get_teacher_name(self, obj):
        return obj.teacher.full_name

    def get_lesson_name(self, obj):
        return obj.lesson.code_name

    def get_room_name(self, obj):
        return obj.room.full_name if obj.room else ''

    def get_type_name(self, obj):
        return obj.get_type_display()

    def get_title(self, obj):
        short_name = ''

        type_name = obj.get_type_display()

        if type_name == 'Лекц':
            short_name = "Лк"
        elif type_name == 'Семинар':
            short_name = "Сем"
        elif type_name == 'Лаборатор':
            short_name = "Лаб"
        elif type_name == 'Практик':
            short_name = 'Пра'
        elif type_name == 'Бие даалт':
            short_name = 'Б/д'
        elif type_name == 'Бусад':
            short_name = 'Бу'

        return short_name

    def get_group(self, obj):
        group_names = ''
        group_list = []
        qs = TimeTable_to_group.objects.filter(timetable_id=obj.id)

        if len(qs) > 0:
            group_list = qs.values_list('group__name', flat=True)

        if len(group_list) > 0:
            group_names = ', '.join(group_list)

        return group_names

    def get_group_list(self, obj):
        qs_group = []
        qs = TimeTable_to_group.objects.filter(timetable_id=obj.id, is_online=False)
        if len(qs) > 0:
            group_ids = qs.values_list('group', flat=True)
            qs_group = Group.objects.filter(id__in=group_ids).values('id', 'name')

        return list(qs_group)


# Цагийн хуваарь
class TimeTableListSerializer(serializers.ModelSerializer):

    lesson = LessonStandartListSerializer(many=False, read_only=True)
    teacher = TeacherListSerializer(many=False, read_only=True)
    support_teachers = serializers.SerializerMethodField()
    room = RoomListSerializer(many=False, read_only=True)

    group = serializers.SerializerMethodField()
    group_list = serializers.SerializerMethodField()
    online_group_list = serializers.SerializerMethodField()
    student_rm_list = serializers.SerializerMethodField()
    event_id = serializers.IntegerField(source='id')
    student_add_list = serializers.SerializerMethodField()
    # short_name = serializers.SerializerMethodField(read_only=True)
    type_name = serializers.SerializerMethodField(read_only=True)
    title = serializers.SerializerMethodField(read_only=True)

    times = serializers.SerializerMethodField()

    class Meta:
        model = TimeTable
        exclude = ['created_at', 'updated_at', 'support_teacher']

    def get_support_teachers(self, obj):
        teacher_id = 0
        teacher_ids = obj.support_teacher if obj.support_teacher is not None else []
        if len(teacher_ids) > 0:
            teacher_id = teacher_ids[0]
        return teacher_id

    def get_group(self, obj):
        group_names = ''
        group_list = []
        qs = TimeTable_to_group.objects.filter(timetable_id=obj.id)
        if len(qs) > 0:
            group_list = qs.values_list('group__name', flat=True)

        if len(group_list) > 0:
            group_names = ', '.join(group_list)

        return group_names

    def get_group_list(self, obj):
        qs_group = []
        qs = TimeTable_to_group.objects.filter(timetable_id=obj.id, is_online=False)
        if len(qs) > 0:
            group_ids = qs.values_list('group', flat=True)
            qs_group = Group.objects.filter(id__in=group_ids).values('id', 'name')

        return list(qs_group)

    def get_online_group_list(self, obj):
        qs_group = []
        qs = TimeTable_to_group.objects.filter(timetable_id=obj.id, is_online=True)
        if len(qs) > 0:
            group_ids = qs.values_list('group', flat=True)
            qs_group = Group.objects.filter(id__in=group_ids).values('id', 'name')

        return list(qs_group)

    def get_student_rm_list(self, obj):
        student_list = []
        qs = TimeTable_to_student.objects.filter(timetable_id=obj.id, add_flag=False)
        if len(qs) > 0:
            student_ids = qs.values_list('student', flat=True)
            student_list = Student.objects.filter(id__in=student_ids).values('id', 'first_name')

        return list(student_list)

    def get_student_add_list(self, obj):
        student_list = []
        qs = TimeTable_to_student.objects.filter(timetable_id=obj.id, add_flag=True)
        if len(qs) > 0:
            student_ids = qs.values_list('student', flat=True)
            student_list = Student.objects.filter(id__in=student_ids).values('id', 'first_name')

        return list(student_list)

    def get_times(self, obj):
        times = []
        if obj.is_kurats == True:
            parent_kurats = obj.parent_kurats

            times = TimeTable.objects.filter(parent_kurats=parent_kurats).values_list('time', flat=True).distinct('time')
        return list(times)
    # def get_short_name(self, obj):
    #     """ Хичээлийн хуваарийн төрлийн нэр авах """

    #     type_name = obj.get_type_display()
    #     short_name = ''
    #     if type_name == 'Лекц':
    #         short_name = "Лк"
    #     elif type_name == 'Семинар':
    #         short_name = "Сем"
    #     elif type_name == 'Лаборатор':
    #         short_name = "Лаб"
    #     elif type_name == 'Практик':
    #         short_name = 'Пра'
    #     elif type_name == 'Бие даалт':
    #         short_name = 'Б/д'
    #     elif type_name == 'Бусад':
    #         short_name = 'Бу'

    #     return short_name

    def get_type_name(self, obj):
        return obj.get_type_display()

    def get_title(self, obj):
        short_name = ''
        # radio_name = self.context['request'].query_params.get('type')

        type_name = obj.get_type_display()
        # room = obj.room
        # teacher = obj.teacher
        # lesson = obj.lesson
        # odd_even = obj.odd_even
        # title = ""

        # if teacher:
        #     first = teacher.first_name
        #     fname = first[0:4]

        # if lesson:
        #     lesson_code = lesson.code
        #     l_code = lesson_code[-5:]

        # if room:
        #     room_num = room.code

        if type_name == 'Лекц':
            short_name = "Лк"
        elif type_name == 'Семинар':
            short_name = "Сем"
        elif type_name == 'Лаборатор':
            short_name = "Лаб"
        elif type_name == 'Практик':
            short_name = 'Пра'
        elif type_name == 'Бие даалт':
            short_name = 'Б/д'
        elif type_name == 'Бусад':
            short_name = 'Бу'

        # if radio_name == 'lesson':
        #     title = short_name  + ' ' +  (room_num if room else '')

        # if radio_name == 'group':
        #     title = short_name + ' ' + fname if teacher else '' + ' ' +  l_code if lesson else '' + ' ' + room_num if room else ''

        # if radio_name == 'teacher':
        #     title = short_name + ' ' + l_code if lesson else '' + ' ' + room_num if room else ''

        # if radio_name == 'room':
        #     title = short_name + ' ' + fname if teacher else '' + ' ' + l_code if lesson else ''

        # if odd_even == 1:
        #     title = 'Cон ' + title
        # elif odd_even == 2:
        #     title = 'Тэгш ' + title

        return short_name


class TeacherCreditVolumePlanSerializer(serializers.ModelSerializer):

    lesson = LessonStandartListSerializer(many=False, read_only=True)
    teacher = TeacherListSerializer(many=False, read_only=True)
    group = serializers.SerializerMethodField()
    group_list = serializers.SerializerMethodField()
    event_id = serializers.IntegerField(source='id')
    short_name = serializers.SerializerMethodField(read_only=True)
    title = serializers.SerializerMethodField(read_only=True)
    day = serializers.IntegerField(default=8)
    time = serializers.SerializerMethodField(default=0)
    is_default = serializers.BooleanField(default=True)
    type_name = serializers.SerializerMethodField()

    class Meta:
        model = TeacherCreditVolumePlan
        exclude = ['created_at', 'updated_at']

    def get_group(self, obj):
        group_names = ''
        group_list = []
        qs = TeacherCreditVolumePlan_group.objects.filter(creditvolume=obj.id)
        if qs:
            group_ids = qs.values_list('group', flat=True)
            for group_id in list(group_ids):
                qs_group = Group.objects.filter(id=group_id).first()
                if qs_group:
                    group_list.append(qs_group.name)

        if group_list:
            group_names = ', '.join(group_list)

        return group_names

    def get_group_list(self, obj):
        group_list = []
        qs = TeacherCreditVolumePlan_group.objects.filter(creditvolume=obj.id)
        if qs:
            group_ids = qs.values_list('group', flat=True)
            for group_id in list(group_ids):
                qs_group = Group.objects.filter(id=group_id).values('id', 'name')
                if qs_group:
                    qs_group = list(qs_group)
                    group_list.append(qs_group[0])

        return group_list

    def get_short_name(self, obj):
        """ Хичээлийн хуваарийн төрлийн нэр авах """

        type_name = obj.get_type_display()
        short_name = ''
        if type_name == 'Лекц':
            short_name = "Лк"
        elif type_name == 'Семинар':
            short_name = "Сем"
        elif type_name == 'Лаборатор':
            short_name = "Лаб"
        elif type_name == 'Практик':
            short_name = 'Пра'
        elif type_name == 'Бие даалт':
            short_name = 'Б/д'
        elif type_name == 'Бусад':
            short_name = 'Бу'

        return short_name

    def get_type_name(self, obj):
        return obj.get_type_display()

    def get_title(self, obj):

        type_name = obj.get_type_display()
        if type_name == 'Лекц':
            short_name = "Лк"
        elif type_name == 'Семинар':
            short_name = "Сем"
        elif type_name == 'Лаборатор':
            short_name = "Лаб"
        elif type_name == 'Практик':
            short_name = 'Пра'
        elif type_name == 'Бие даалт':
            short_name = 'Б/д'
        elif type_name == 'Бусад':
            short_name = 'Бу'

        return short_name

    def get_time(self, obj):

        est_qs = self.context.get('queryset').filter(lesson=obj.lesson, lesson_year=obj.lesson_year, lesson_season=obj.lesson_season, teacher=obj.teacher)

        time = 1

        if est_qs:
            for idx, x in enumerate(est_qs):
                if x.id == obj.id:
                    time = idx + 1

        return time

class TimeTableSerializer(serializers.ModelSerializer):

    class Meta:
        model = TimeTable
        fields = "__all__"


class ExamTimeTableSerializer(serializers.ModelSerializer):

    class Meta:
        model = ExamTimeTable
        fields = "__all__"


# Хичээлийн стандарт
class LessonStandartSerialzier(serializers.ModelSerializer):

    class Meta:
        model = LessonStandart
        fields = "id", "name", "code", "kredit"


class RoomExamListSerializer(serializers.ModelSerializer):

    full_name = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Room
        fields = "id", "name", "full_name"

    def get_full_name(self, obj):
        """ Өрөөний нэр дугаар багтаамж төрөл"""

        full_name = ''
        code = obj.code
        name = obj.name

        type = obj.get_type_display()

        volume = str(obj.volume)

        if code:
            full_name += code
        if name:
            full_name = full_name +  ' ' + name

        if type:
            full_name = full_name + ' ' + type

        if volume:
            full_name = full_name + ' (' + volume +')'

        return full_name


class ExamTimeTableAllSerializer(serializers.ModelSerializer):
    lesson_name = serializers.CharField(source='lesson.name', default='')
    lesson_code = serializers.CharField(source='lesson.code', default='')
    room_name = serializers.CharField(source='room.full_name', default='')
    teacher_names = serializers.SerializerMethodField()
    group_names = serializers.SerializerMethodField()
    stype_name = serializers.SerializerMethodField()
    group = serializers.SerializerMethodField()
    lesson_id = serializers.CharField(source='lesson.id', default='')
    is_expired = serializers.SerializerMethodField()
    groups = serializers.SerializerMethodField()
    class Meta:
        model = ExamTimeTable
        fields = "__all__"

    def get_groups(self, obj):
       groups = Exam_to_group.objects.filter(exam=obj).annotate(name=F('group__name')).values('group', 'name')
       return list(groups)

    def get_teacher_names(self, obj):
        teachers = Teachers.objects.filter(id__in=obj.teacher.values_list('id', flat=True))
        names = []
        for teacher in teachers:
            names.append(teacher.full_name)
        return ', '.join(names)

    def get_group_names(self, obj):
        groups = Exam_to_group.objects.filter(exam=obj).values_list('group__name', flat=True)
        return ', '.join(groups)

    def get_stype_name(self, obj):
        return obj.get_stype_display()

    def get_group(self, obj):
        exam_groups = Exam_to_group.objects.filter(exam=obj).values_list('group', flat=True)

        return list(exam_groups)

    def get_is_expired(self, obj):
        is_expired = datetime.now() >= obj.end_date
        return is_expired


class ExamTimeTableListSerializer(serializers.ModelSerializer):

    lesson = LessonStandartSerialzier( read_only=True)
    teacher = TeacherListSerializer(read_only=True, many=True)
    room = RoomExamListSerializer(read_only=True)
    # student_list = serializers.SerializerMethodField()
    # student_group_list = serializers.SerializerMethodField()


    class Meta:
        model = ExamTimeTable
        fields = "__all__"

    # def get_student_list(self, obj):

    #     request = self.context.get('request')
    #     school = request.query_params.get('school')

    #     student_list = []
    #     status = StudentRegister.objects.filter(name__contains='Суралцаж буй').first()

    #     student_queryset = Exam_to_group.objects.filter(exam_id=obj.id, student__status=status)
    #     if school:
    #         student_queryset = student_queryset.filter(group__school=school)

    #     students = student_queryset.values('student', 'student__id', 'student__code', 'student__last_name', 'student__first_name', 'student__group').order_by('student__first_name')

    #     if len(students) > 0:
    #         for student in list(students):
    #             student_datas = {}
    #             exam_student = Exam_to_group.objects.filter(exam_id=obj.id, student=student.get('student__id')).first()

    #             student_group = student.get('student__group')
    #             student_id = student.get('student')
    #             student_datas['code'] = student.get('student__code')
    #             student_datas['last_name'] = student.get('student__last_name')
    #             student_datas['first_name'] = student.get('student__first_name')
    #             student_datas['group'] = student_group
    #             student_datas['id'] = student.get('student__id')
    #             student_datas['status'] = exam_student.status

    #             exam_score = 0
    #             teach_score = 0
    #             result_score = 0
    #             score = ScoreRegister.objects.filter(student=student_id, lesson_year=obj.lesson_year, lesson_season=obj.lesson_season, lesson=obj.lesson).first()

    #             if score:
    #                 exam_score = score.exam_score if score.exam_score else 0
    #                 teach_score = score.teach_score if score.teach_score else 0

    #             student_datas['exam'] = exam_score
    #             student_datas['teach_score'] = teach_score
    #             result_score = exam_score + teach_score
    #             student_datas['result_score'] = result_score
    #             result_score = round(result_score, 2)

    #             assessment = Score.objects.filter(score_max__gte=result_score,score_min__lte=result_score).first()

    #             student_datas['assesment'] = assessment.assesment if assessment else ''
    #             timetable_group = TimeTable_to_group.objects.filter(group=student_group, timetable__lesson=obj.lesson, timetable__lesson_year=obj.lesson_year, timetable__lesson_season=obj.lesson_season).values_list('timetable', flat=True).distinct('timetable__lesson')

    #             if len(timetable_group) > 0:
    #                 timetable = TimeTable.objects.filter(id__in=timetable_group).first()
    #                 teacher = Teachers.objects.get(id=timetable.teacher.id)
    #                 student_datas['teacher_name'] = teacher.full_name if teacher else ''

    #             student_list.append(student_datas)

    #         if len(student_list) > 0:
    #             student_list = sorted(student_list, key=lambda x: x["result_score"], reverse=True)

    #     return student_list

    # def get_student_group_list(self, obj):

    #     group_list = list()
    #     request = self.context.get('request')
    #     school = request.query_params.get('school')
    #     group_queryset = Exam_to_group.objects.filter(exam_id=obj.id)
    #     if school:
    #         group_queryset = group_queryset.filter(group__school=school)

    #     groups = group_queryset.values('student__group', 'student__group__name').distinct('student__group')
    #     for group in list(groups):
    #         group_list.append({
    #             'id': group.get('student__group'),
    #             'name': group.get('student__group__name'),
    #         })

    #     return group_list

class GroupListSerializer(serializers.ModelSerializer):
    ''' Анги бүлгийн жагсаалт '''

    class Meta:
        model = Group
        fields = "id", "name"


class GpaPrintSerializer(serializers.ModelSerializer):
    ''' Голч дүнгийн жагсаалт '''

    full_name = serializers.SerializerMethodField(read_only=True)
    group = GroupListSerializer(many=False, read_only=True)

    class Meta:
        model = Student
        fields = ["id", 'code', 'register_num', 'full_name', 'group']

    def get_full_name(self, obj):

        first_name = obj.first_name
        last_name = obj.last_name
        full_name = get_fullName(last_name, first_name, is_strim_first=True)

        full_name = full_name + ' ' + obj.code

        return full_name


class ScoreGpaListSerializer(serializers.ModelSerializer):
    ''' Голч дүнгийн жагсаалт '''

    total_gpa = serializers.SerializerMethodField()
    total_avg = serializers.SerializerMethodField()
    total_kr = serializers.SerializerMethodField()
    full_name = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Student
        fields = "code", "total_gpa", "total_kr", "full_name", "total_avg", 'register_num', 'first_name', 'last_name'

    def get_full_name(self, obj):

        first_name = obj.first_name
        last_name = obj.last_name
        full_name = get_fullName(last_name, first_name, is_dot=False)

        return full_name

    def get_total_kr(self, obj):
        # Нийт багц цаг

        request = self.context.get('request')
        status = request.query_params.get('status')

        stud_id = obj.id

        # Төгсөлтийн ажлын голч оноог татах гэж байгаа бол
        if str2bool(status):
            scoreRegister  = CalculatedGpaOfDiploma.objects.filter(student=stud_id).aggregate(max_kredit=Sum('kredit'))
        else: # Үзсэн бүх хичээлийн кредит
            scoreRegister = ScoreRegister.objects.filter(student=stud_id).aggregate(max_kredit=Sum('lesson__kredit'))

        return scoreRegister.get('max_kredit')

    def get_total_gpa(self, obj):

        request = self.context.get('request')
        status = request.query_params.get('status')

        final_gpa = 0

        all_kredit = 0
        all_s_kredit = 0
        all_gpa = 0
        final_score = '0.0'

        # Оюутны дүнгүүдээр давталт гүйлгэх
        if str2bool(status):
            scoreRegister = CalculatedGpaOfDiploma.objects.filter(student=obj)
        else:
            scoreRegister = ScoreRegister.objects.filter(student=obj)

        for lesson_score in scoreRegister:
            if str2bool(status):
                score_obj = Score.objects.filter(score_max__gte=lesson_score.score, score_min__lte=lesson_score.score).first()
            else:
                score_obj = Score.objects.filter(score_max__gte=lesson_score.score_total, score_min__lte=lesson_score.score_total).first()

            # Бүх голч нэмэх
            if str2bool(status):
                if not lesson_score.grade_letter:
                    all_gpa = all_gpa + (lesson_score.gpa * lesson_score.kredit)
            else:
                if not lesson_score.grade_letter:
                    all_gpa = all_gpa + (score_obj.gpa * lesson_score.lesson.kredit)

            # Бүх нийт кредит нэмэх
            if str2bool(status):
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

            if all_gpa != 0:
                final_gpa = all_gpa / estimate_kredit

                final_score = format(final_gpa, ".1f")

        return final_score

    def get_total_avg(self, obj):
        # Дүнгийн онооны дундаж

        score_avg = 0
        request = self.context.get('request')
        status = request.query_params.get('status')

        all_kredit = 0
        all_s_kredit = 0
        all_score = 0
        final_score = 0

        # Оюутны дүнгүүдээр давталт гүйлгэх
        if str2bool(status):
            scoreRegister = CalculatedGpaOfDiploma.objects.filter(student=obj)
        else:
            scoreRegister = ScoreRegister.objects.filter(student=obj)

        for lesson_score in scoreRegister:

            # Нийт дүн
            if str2bool(status):
                if not lesson_score.grade_letter:
                    all_score = all_score + (lesson_score.score * lesson_score.kredit)
            else:
                if not lesson_score.grade_letter:
                    all_score = all_score + (lesson_score.score_total * lesson_score.lesson.kredit)

            # Бүх нийт кредит нэмэх
            if str2bool(status):
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

            if all_score != 0:
                final_gpa = all_score / estimate_kredit

                final_score = format(final_gpa, ".1f")

        return final_score


# ---------------- Дахин шалгалт ----------------

class Exam_repeatSerializer(serializers.ModelSerializer):
    class Meta:
        model = Exam_repeat
        fields = "__all__"


# Дахин шалгалтын жагсаалт
class Exam_repeatLiseSerializer(serializers.ModelSerializer):
    lesson_name = serializers.SerializerMethodField()
    teacher_names = serializers.SerializerMethodField()
    stype_name = serializers.SerializerMethodField(read_only=True)
    status_name = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Exam_repeat
        fields = "__all__"

    def get_stype_name(self, obj):
        return obj.get_stype_display()

    def get_teacher_names(self, obj):
            teachers = Teachers.objects.filter(id__in=obj.teacher.values_list('id', flat=True))
            names = []
            for teacher in teachers:
                names.append(teacher.full_name)
            return ', '.join(names)

    def get_status_name(self, obj):
        return obj.get_status_display()

    def get_lesson_name(self,obj):
        return f'{obj.lesson.code} {obj.lesson.name}'

class StudentScoreListSerializer(serializers.ModelSerializer):
    assessment = serializers.CharField(source="assessment.assesment", default='')

    class Meta:
        model = ScoreRegister
        fields = "teach_score", "exam_score", "assessment"


class PotokSerializer(serializers.ModelSerializer):

    lesson = LessonStandartListSerializer(many=False, read_only=True)
    teacher = TeacherListSerializer(many=False, read_only=True)
    room = RoomListSerializer(many=False, read_only=True)
    group = serializers.SerializerMethodField()
    type_time = serializers.SerializerMethodField(read_only=True)
    day_name = serializers.SerializerMethodField(read_only=True)
    time_name = serializers.SerializerMethodField(read_only=True)
    odd_even_name = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = TimeTable
        fields = 'id', 'lesson', 'teacher', 'room', 'group', 'type_time', 'day_name', 'time_name', 'odd_even_name', 'is_block', 'is_kurats', 'potok', "kurats_room", 'begin_week', 'end_week', 'begin_date', 'end_date'

    def get_group(self, obj):
        group_names = ''
        group_list = []
        qs = TimeTable_to_group.objects.filter(timetable_id=obj.id)
        if qs:
            group_ids = qs.values_list('group', flat=True)
            for group_id in list(group_ids):
                qs_group = Group.objects.filter(id=group_id).first()
                if qs_group:
                    group_list.append(qs_group.name)

        if group_list:
            group_names = ', '.join(group_list)

        return group_names

    def get_day_name(seld, obj):

        return obj.get_day_display()

    def get_type_time(self, obj):
        """ Хичээлийн хуваарийн төрлийн нэр авах """

        type_name = obj.get_type_display()
        return type_name

    def get_time_name(self, obj):
        """ Хичээлийн хуваарийн төрлийн нэр авах """

        type_name = obj.get_time_display()
        return type_name

    def get_odd_even_name(seld, obj):

        return obj.get_odd_even_display()


class TimetablePrintSerializer(serializers.ModelSerializer):
    room_name = serializers.CharField(source='room.code', default='')
    lesson_name = serializers.SerializerMethodField()
    teacher_name = serializers.CharField(source='teacher.full_name', default='')

    class Meta:
        model = TimeTable
        fields = 'id', 'day', 'time', 'teacher_name', 'lesson_name', 'odd_even', 'room_name'

    def get_lesson_name(self, obj):

        name = obj.lesson.name
        type_name = obj.get_type_display()

        lesson_name = name + ' ' + '/' + type_name + "/"

        return lesson_name


class ChallengeStudentsSerializer(serializers.ModelSerializer):

    class Meta:
        model = ChallengeStudents
        fields = ['id', 'challenge', 'score', 'take_score', 'student']

    def to_representation(self, instance):
        data = super().to_representation(instance)

        first_name = instance.student.first_name
        last_name = instance.student.last_name
        full_name = get_fullName(last_name, first_name, is_strim_first=True)

        data['student_name'] = full_name
        data['student_code'] = instance.student.code

        return data


class TeacherScoreStudentsSerializer(serializers.ModelSerializer):

    class Meta:
        model = TeacherScore
        fields = ['id', 'score', 'student']

    def to_representation(self, instance):
        data = super().to_representation(instance)

        first_name = instance.student.first_name
        last_name = instance.student.last_name
        full_name = get_fullName(last_name, first_name, is_strim_first=True)

        data['student_name'] = full_name
        data['take_score'] = instance.score_type.score
        data['student_code'] = instance.student.code

        return data
