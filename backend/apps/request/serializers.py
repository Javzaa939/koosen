
import os

from django.conf import settings
from rest_framework import serializers
from django.db.models.functions import Cast
from django.db.models import PositiveIntegerField
from django.db.models.fields.files import ImageFieldFile

from lms.models import Club
from lms.models import Score
from lms.models import Employee
from lms.models import Student
from lms.models import ClubFile
from lms.models import Complaint
from lms.models import Teachers
from lms.models import LessonStandart
from core.models import OrgPosition
from lms.models import Complaint_unit
from lms.models import Complaint_Answer
from lms.models import Correspond_Answer
from lms.models import StudentRoutingSlip
from lms.models import RoutingSlip_Answer
from lms.models import StudentRequestClub
from lms.models import LeaveRequest_Answer
from lms.models import StudentLeaveRequest

from lms.models import StudentRequestTutor
from lms.models import StudentCorrespondScore
from lms.models import StudentRequestVolunteer
from lms.models import StudentCorrespondLessons

from lms.models import Score
from core.models import OrgPosition

from main.utils.function.utils import json_load, get_menu_unit

from apps.calendar.serializers import LearningCalVolentoorSerializer

from main.utils.file import split_root_path
from main.utils.function.utils import json_load, get_menu_unit, get_domain_url, get_fullName


# Хүсэлт шийвдэрлэх нэгж
class ComplaintUnitSerializer(serializers.ModelSerializer):

    class Meta:
        model = Complaint_unit
        fields = "__all__"


class OrgPositionSerializer(serializers.ModelSerializer):

    class Meta:
        model = OrgPosition
        fields = ["id", 'name']


class ComplaintUnitListSerializer(serializers.ModelSerializer):

    unit_name = serializers.SerializerMethodField()
    positions = serializers.SerializerMethodField()
    position = OrgPositionSerializer(many=True)
    menus_names = serializers.SerializerMethodField(read_only=True)
    menus = serializers.SerializerMethodField()

    class Meta:
        model = Complaint_unit
        fields = "__all__"

    def get_unit_name(self, obj):

        unit_name = obj.get_unit_display()

        return unit_name

    def get_positions(self, obj):
        positions = list()
        for position in obj.position.all():
            position_name = position.name
            positions.append(position_name)

        positions = ', '.join(positions)

        return positions

    def get_menus_names(self, obj):
        names = list()
        menus = obj.menus
        if menus:
            menus = json_load(menus)
            for menu in menus:
                for key, value in menu.items():
                    if (key == 'name'):
                        names.append(value)

        names = ', '.join(names)

        return names

    def get_menus(self, obj):
        r_menus = list()
        menus = obj.menus
        if menus:
            r_menus = json_load(menus)

        return r_menus

class StudentSerializer(serializers.ModelSerializer):

    full_name = serializers.SerializerMethodField()

    class Meta:
        model = Student
        fields = ["id", "code", "full_name"]

    def get_full_name(self, obj):

        return obj.full_name()


class StudentAllSerializer(serializers.ModelSerializer):

    full_name = serializers.SerializerMethodField()

    class Meta:
        model = Student
        fields = "__all__"

    def get_full_name(self, obj):

        return obj.full_name()


class ComplaintSerializer(serializers.ModelSerializer):

    class Meta:
        model = Complaint
        fields = "__all__"


class ComplaintAnswerSerializer(serializers.ModelSerializer):

    class Meta:
        model = Complaint_Answer
        fields = "__all__"


class ComplaintListSerializer(serializers.ModelSerializer):

    lesson_season = serializers.SerializerMethodField()
    complaint_type = serializers.SerializerMethodField()
    file = serializers.SerializerMethodField()
    answers = serializers.SerializerMethodField()

    student = StudentSerializer(many=False)

    class Meta:
        model = Complaint
        fields = "__all__"

    def get_file(self, obj):

        file_url = ''

        if obj.file:
            file_url = f'{settings.MUIS_STUDENT_MEDIA_URL}{obj.file}'

        return file_url


    def get_lesson_season(self, obj):

        data = {
            'season_name': obj.lesson_season.season_name,
            'season_code': obj.lesson_season.season_code,
        }

        return data

    def get_complaint_type(self, obj):

        data = {
            'complaint_name': obj.get_complaint_type_display(),
            'complaint_id': obj.complaint_type,
        }

        return data

    def get_answers(self, obj):
        c_id = obj.id
        menu_id = self.context['request'].query_params.get('menu')

        c_unit_list = get_menu_unit(menu_id)

        answers = Complaint_Answer.objects.filter(request=c_id).values('unit', 'id', 'date', 'is_confirm', 'message')
        for c_unit in c_unit_list:
            unit_id = c_unit.get('id')

            is_answer = False
            for i, answer in enumerate(answers):
                a_unit_id = answer.get('unit')

                if unit_id == a_unit_id:
                    is_answer = True
                    c_unit['date'] = answer.get('date')
                    c_unit['is_confirm'] = answer.get('is_confirm')
                    c_unit['message'] = answer.get('message')

            c_unit['is_answer'] = is_answer

        return c_unit_list


class CorrespondLessonSerializer(serializers.ModelSerializer):

    class Meta:
        model = StudentCorrespondLessons
        exclude = "created_at", "updated_at", 'correspond'


class CorrespondLessonListSerializer(serializers.ModelSerializer):

    class Meta:
        model = StudentCorrespondLessons
        exclude = "created_at", "updated_at"


class CorrespondSerializer(serializers.ModelSerializer):

    class Meta:
        model = StudentCorrespondScore
        fields = '__all__'


class CorrespondListSerializer(serializers.ModelSerializer):
    correspondlessons = serializers.SerializerMethodField()
    correspond_type_name = serializers.SerializerMethodField()
    full_name = serializers.SerializerMethodField()
    file_name = serializers.SerializerMethodField()
    degree = serializers.SerializerMethodField()
    profession_name = serializers.SerializerMethodField()
    isSolved = serializers.SerializerMethodField()
    degree_name = serializers.SerializerMethodField()
    group_name = serializers.SerializerMethodField()
    now_group = serializers.SerializerMethodField()
    answers = serializers.SerializerMethodField()
    answer_count = serializers.SerializerMethodField()

    class Meta:
        model = StudentCorrespondScore
        exclude = ['updated_at', 'created_at']

    def get_correspond_type_name(self, obj):
        return obj.get_correspond_type_display()

    def get_full_name(self, obj):

        return obj.full_name

    def get_file_name(self, obj):

        file_name = ''
        file = obj.file.path if obj.file else ''
        if file:
            file_name = os.path.basename(file)

        return file_name

    def get_degree(self, obj):

        degreeId = ''
        degree = obj.profession.degree
        if degree:
            degreeId = degree.id

        return degreeId

    def get_degree_name(self, obj):

        degreeName = ''
        degree = obj.profession.degree
        if degree:
            degreeName = degree.degree_name

        return degreeName

    def get_group_name(self, obj):

        group_name = ''
        student_group = obj.student_group
        if student_group:
            group_name = student_group.name

        return group_name

    def get_now_group(self, obj):
        """ Тухайн оюутан анги хооронд шилжилт хөдөлгөөн хийлгэсэн бол """

        ret_values = {}
        if obj.student_group:
            ret_values['id'] = obj.student_group.id
            ret_values['name'] = obj.student_group.name

        return ret_values


    def get_profession_name(self, obj):

        return obj.profession.name

    def get_isSolved(self, obj):
        c_id = obj.id

        menu_id = self.context['request'].query_params.get('menu')
        c_unit_list = get_menu_unit(menu_id)

        for i, unit in enumerate(c_unit_list):

            if unit.get('id') == Complaint_unit.BMA:
                del c_unit_list[i]

        c_queryset = Correspond_Answer.objects.all()
        answer_ids = c_queryset.filter(request=c_id).values_list('id', flat=True)
        if len(answer_ids) == 0:
           return 0 # Хэн ч шийдвэрлээгүй үед ИЛГЭЭСЭН

        for answer_id in answer_ids:
            answer_obj = c_queryset.filter(id=answer_id).first()

            if answer_obj:
                if not answer_obj.is_confirm:
                    return 2 # Татгалзсан

        if len(c_unit_list) == len(answer_ids):
            return 3 # ЗӨВШӨӨРСӨН
        else:
            return 1 # ШИЙДЭГДЭЖ БАЙГАА

    # Хүсэлтийг шийдвэрлэсэн нэгжүүд
    def get_answers(self, obj):

        c_id = obj.id
        menu_id = self.context['request'].query_params.get('menu')

        c_unit_list = get_menu_unit(menu_id)

        answers = Correspond_Answer.objects.filter(request=c_id).values('unit', 'id', 'is_confirm')
        for c_unit in c_unit_list:
            unit_id = c_unit.get('id')

            is_answer = False
            is_confirm = False
            for answer in answers:
                a_unit_id = answer.get('unit')

                if unit_id == a_unit_id:
                    is_answer = True

                is_confirm = answer.get('is_confirm')

            c_unit['is_confirm'] = is_confirm
            c_unit['is_answer'] = is_answer

        return c_unit_list

    def get_correspondlessons(self, obj):
        qs_lesson = StudentCorrespondLessons.objects.all().annotate(
            my_season=Cast('season', PositiveIntegerField())
        ).order_by('my_season').filter(correspond=obj.id)

        return list(qs_lesson.values())

    def get_answer_count(self, obj):

        is_answered = False
        menu_id = self.context['request'].query_params.get('menu')

        c_unit_list = get_menu_unit(menu_id)

        for i, unit in enumerate(c_unit_list):

            if unit.get('id') == Complaint_unit.BMA:
                del c_unit_list[i]

        c_queryset = Correspond_Answer.objects.all()
        answer_ids = c_queryset.filter(request=obj.id).values_list('id', flat=True)


        if len(c_unit_list) == len(answer_ids):
            is_answered = True

        return is_answered


class CorrespondPrintListSerializer(serializers.ModelSerializer):

    correspondlessons = serializers.SerializerMethodField()
    correspond_type_name = serializers.SerializerMethodField()
    full_name = serializers.SerializerMethodField()
    file_name = serializers.SerializerMethodField()
    degree = serializers.SerializerMethodField()
    profession_name = serializers.SerializerMethodField()
    isSolved = serializers.SerializerMethodField()
    degree_name = serializers.SerializerMethodField()
    group_name = serializers.SerializerMethodField()
    answers = serializers.SerializerMethodField()
    answer_count = serializers.SerializerMethodField()
    student_now_group = serializers.SerializerMethodField()

    class Meta:
        model = StudentCorrespondScore
        exclude = ['updated_at', 'created_at']

    def get_correspond_type_name(self, obj):
        return obj.get_correspond_type_display()

    def get_full_name(self, obj):

        return obj.full_name

    def get_file_name(self, obj):

        file_name = ''
        file = obj.file.path if obj.file else ''
        if file:
            file_name = os.path.basename(file)

        return file_name

    def get_degree(self, obj):

        degreeId = ''
        degree = obj.profession.degree
        if degree:
            degreeId = degree.id

        return degreeId

    def get_degree_name(self, obj):

        degreeName = ''
        degree = obj.profession.degree
        if degree:
            degreeName = degree.degree_name

        return degreeName

    def get_group_name(self, obj):

        group_name = ''
        student_group = obj.student_group
        if student_group:
            group_name = student_group.name

        return group_name

    def get_student_now_group(self, obj):

        group_name = ''
        if obj.student:
            group_name = obj.student.group.name if obj.student.group else ''

        return group_name

    def get_profession_name(self, obj):

        return obj.profession.name

    def get_isSolved(self, obj):
        c_id = obj.id

        menu_id = self.context['request'].query_params.get('menu')
        c_unit_list = get_menu_unit(menu_id)

        for i, unit in enumerate(c_unit_list):

            if unit.get('id') == Complaint_unit.BMA:
                del c_unit_list[i]

        c_queryset = Correspond_Answer.objects.all()
        answer_ids = c_queryset.filter(request=c_id).values_list('id', flat=True)
        if len(answer_ids) == 0:
           return 0 # Хэн ч шийдвэрлээгүй үед ИЛГЭЭСЭН

        for answer_id in answer_ids:
            answer_obj = c_queryset.filter(id=answer_id).first()

            if answer_obj:
                if not answer_obj.is_confirm:
                    return 2 # Татгалзсан

        if len(c_unit_list) == len(answer_ids):
            return 3 # ЗӨВШӨӨРСӨН
        else:
            return 1 # ШИЙДЭГДЭЖ БАЙГАА

    # Хүсэлтийг шийдвэрлэсэн нэгжүүд
    def get_answers(self, obj):

        c_id = obj.id
        menu_id = self.context['request'].query_params.get('menu')

        c_unit_list = get_menu_unit(menu_id)

        answers = Correspond_Answer.objects.filter(request=c_id).values('unit', 'id', 'is_confirm')
        for c_unit in c_unit_list:
            unit_id = c_unit.get('id')

            is_answer = False
            is_confirm = False
            for answer in answers:
                a_unit_id = answer.get('unit')

                if unit_id == a_unit_id:
                    is_answer = True

                is_confirm = answer.get('is_confirm')

            c_unit['is_confirm'] = is_confirm
            c_unit['is_answer'] = is_answer

        return c_unit_list

    def get_correspondlessons(self, obj):
        all_datas = []
        lesson_season_ids = StudentCorrespondLessons.objects.all().order_by('season').filter(correspond=obj.id).values_list('season', flat=True).distinct('season')

        for lesson_season_id in lesson_season_ids:
            lobj = {}
            lobj['id'] = lesson_season_id
            lesson_values = StudentCorrespondLessons.objects.filter(season=lesson_season_id, correspond=obj.id).values(
                'correspond_lesson__name',
                'correspond_lesson',
                'correspond_kredit',
                'learn_lesson',
                'learn_kredit',
                'score',
                'is_allow'
            )

            for lesson_value in lesson_values:
                score = lesson_value.get('score')
                assessment = Score.objects.filter(score_max__gte=score,score_min__lte=score).first()
                lesson_value['assessment'] = assessment.assesment if assessment else ''

            lobj['datas'] = list(lesson_values)

            all_datas.append(lobj)

        return all_datas

    def get_answer_count(self, obj):

        is_answered = False
        menu_id = self.context['request'].query_params.get('menu')

        c_unit_list = get_menu_unit(menu_id)

        for i, unit in enumerate(c_unit_list):

            if unit.get('id') == Complaint_unit.BMA:
                del c_unit_list[i]

        c_queryset = Correspond_Answer.objects.all()
        answer_ids = c_queryset.filter(request=obj.id).values_list('id', flat=True)


        if len(c_unit_list) == len(answer_ids):
            is_answered = True

        return is_answered


class Correspond_AnswerSerializer(serializers.ModelSerializer):

    unit_name = serializers.SerializerMethodField(read_only=True)
    class Meta:
        model = Correspond_Answer
        fields = '__all__'

    def get_unit_name(self, obj):
        return obj.get_unit_display()

class RequestAnswerVolunteerSerializer(serializers.ModelSerializer):

    student = StudentSerializer(many=False)
    action = LearningCalVolentoorSerializer(many=False)

    class Meta:
        model = StudentRequestVolunteer
        fields = '__all__'

class RequestAnswerVolunteerPutSerializer(serializers.ModelSerializer):

    class Meta:
        model = StudentRequestVolunteer
        fields = ['answer', 'request_flag']


class ClubSerializer(serializers.ModelSerializer):

    class Meta:
        model = Club
        fields = '__all__'


class ClubListSerializer(serializers.ModelSerializer):
    type_name = serializers.SerializerMethodField()
    files = serializers.SerializerMethodField()

    class Meta:
        model = Club
        fields = '__all__'

    def get_type_name(self, obj):

        type_name = obj.get_type_display()

        return type_name

    def get_files(self, obj):

        id = obj.id
        files = []

        base_url = f'{get_domain_url()}{settings.MEDIA_URL}'

        qs_list = ClubFile.objects.filter(club=id)
        if qs_list:
            for qs in qs_list:
                if isinstance(qs.file, ImageFieldFile):
                    try:
                        path = split_root_path(qs.file.path)
                        path = os.path.join(base_url, path)
                    except ValueError:
                        return files

                data = {
                    'id': qs.id,
                    'description': qs.description,
                    'file': path
                }

                files.append(data)

        return files


class ClubSettingsListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Club
        fields = ['id', 'name']


class StudentRequestClubSerializer(serializers.ModelSerializer):
    ''' Клубт бүртгүүлсэн оюутны жагсаалт '''

    student = StudentSerializer(many=False)
    club = ClubSettingsListSerializer(many=False)

    class Meta:
        model = StudentRequestClub
        fields = "__all__"


class LeaveRequestAnswerSerializer(serializers.ModelSerializer):

    class Meta:
        model = LeaveRequest_Answer
        fields = "__all__"


class LeaveRequestListSerializer(serializers.ModelSerializer):

    lesson_season = serializers.SerializerMethodField()
    leave_type = serializers.SerializerMethodField()
    file = serializers.SerializerMethodField()

    student = StudentSerializer(many=False)
    answers = serializers.SerializerMethodField()

    class Meta:
        model = StudentLeaveRequest
        fields = "__all__"

    def get_file(self, obj):

        file_url = ''

        if obj.file:
            file_url = f'{settings.MUIS_STUDENT_MEDIA_URL}{obj.file}'

        return file_url

    def get_lesson_season(self, obj):

        data = {
            'season_name': obj.lesson_season.season_name,
            'season_code': obj.lesson_season.season_code,
        }

        return data

    def get_leave_type(self, obj):

        data = {
            'leave_name': obj.get_leave_type_display(),
            'leave_id': obj.leave_type,
        }

        return data

    def get_answers(self, obj):
        c_id = obj.id
        menu_id = self.context['request'].query_params.get('menu')

        c_unit_list = get_menu_unit(menu_id)

        answers = LeaveRequest_Answer.objects.filter(request=c_id).values('unit', 'id', 'date', 'is_confirm', 'message')
        for c_unit in c_unit_list:
            unit_id = c_unit.get('id')

            is_answer = False
            for i, answer in enumerate(answers):
                a_unit_id = answer.get('unit')

                if unit_id == a_unit_id:
                    is_answer = True
                    c_unit['date'] = answer.get('date')
                    c_unit['is_confirm'] = answer.get('is_confirm')
                    c_unit['message'] = answer.get('message')

            c_unit['is_answer'] = is_answer

        return c_unit_list


class LeaveRequestPrintSerializer(serializers.ModelSerializer):

    group = serializers.SerializerMethodField()
    answers = serializers.SerializerMethodField()
    student = StudentAllSerializer(many=False)

    class Meta:
        model = StudentLeaveRequest
        fields = "__all__"

    def get_group(self, obj):

        datas = dict()

        datas['group_name'] = obj.student.group.name
        datas['school_name'] = obj.student.group.school.name

        return datas

    def get_answers(self, obj):
        c_id = obj.id
        menu_id = self.context['request'].query_params.get('menu')

        c_unit_list = get_menu_unit(menu_id)

        answers = LeaveRequest_Answer.objects.filter(request=c_id).values('unit', 'id', 'date', 'is_confirm', 'message')
        for c_unit in c_unit_list:
            unit_id = c_unit.get('id')

            is_answer = False
            for i, answer in enumerate(answers):
                a_unit_id = answer.get('unit')

                if unit_id == a_unit_id:
                    is_answer = True
                    c_unit['date'] = answer.get('date')
                    c_unit['is_confirm'] = answer.get('is_confirm')
                    c_unit['message'] = answer.get('message')

            c_unit['is_answer'] = is_answer

        return c_unit_list


class ComplaintRequestPrintSerializer(serializers.ModelSerializer):

    group = serializers.SerializerMethodField()
    answers = serializers.SerializerMethodField()
    student = StudentAllSerializer(many=False)

    class Meta:
        model = Complaint
        fields = "__all__"

    def get_group(self, obj):

        datas = dict()

        datas['group_name'] = obj.student.group.name
        datas['school_name'] = obj.student.group.school.name
        datas['join_year'] = obj.student.group.join_year
        datas['profession'] = obj.student.group.profession.name

        return datas

    def get_answers(self, obj):
        c_id = obj.id
        menu_id = self.context['request'].query_params.get('menu')

        c_unit_list = get_menu_unit(menu_id)

        answers = Complaint_Answer.objects.filter(request=c_id).values('unit', 'id', 'date', 'is_confirm', 'message')
        for c_unit in c_unit_list:
            unit_id = c_unit.get('id')

            is_answer = False
            for i, answer in enumerate(answers):
                a_unit_id = answer.get('unit')

                if unit_id == a_unit_id:
                    is_answer = True
                    c_unit['date'] = answer.get('date')
                    c_unit['is_confirm'] = answer.get('is_confirm')
                    c_unit['message'] = answer.get('message')

            c_unit['is_answer'] = is_answer

        return c_unit_list


class RoutingSerializer(serializers.ModelSerializer):

    student = StudentAllSerializer(many=False)
    type_name = serializers.SerializerMethodField()
    file_name = serializers.SerializerMethodField()
    profession_name = serializers.SerializerMethodField()
    school_name = serializers.SerializerMethodField()
    isSolved = serializers.SerializerMethodField()
    answers = serializers.SerializerMethodField()
    answer_count = serializers.SerializerMethodField()
    group = serializers.SerializerMethodField()

    class Meta:
        model = StudentRoutingSlip
        fields = '__all__'

    def get_type_name(self, obj):

        type_name = obj.get_routingslip_type_display()

        return type_name

    def get_file_name(self, obj):
        file_name = ''
        file = obj.file
        if file:
            file = file.path if file else ''
            file_name = os.path.basename(file)

        return file_name

    def get_profession_name(self, obj):

        return obj.student.group.profession.name

    def get_group(self, obj):

        datas = dict()

        datas['group_name'] = obj.student.group.name
        datas['school_name'] = obj.student.group.school.name
        datas['join_year'] = obj.student.group.join_year
        datas['profession'] = obj.student.group.profession.name

        return datas

    def get_school_name(self, obj):
        return obj.student.school.name

    def get_isSolved(self, obj):
        c_id = obj.id

        menu_id = self.context['request'].query_params.get('menu')
        c_unit_list = get_menu_unit(menu_id)

        c_queryset = RoutingSlip_Answer.objects.all()
        answer_ids = c_queryset.filter(request=c_id).values_list('id', flat=True)
        if len(answer_ids) == 0:
           return 0 # Хэн ч шийдвэрлээгүй үед ИЛГЭЭСЭН

        for answer_id in answer_ids:
            answer_obj = c_queryset.filter(id=answer_id).first()

            if answer_obj:
                if not answer_obj.is_confirm:
                    return 2 # Татгалзсан

        if len(c_unit_list) == len(answer_ids):
            return 3 # ЗӨВШӨӨРСӨН
        else:
            return 1 # ШИЙДЭГДЭЖ БАЙГАА

    def get_answers(self, obj):
        c_id = obj.id
        menu_id = self.context['request'].query_params.get('menu')

        c_unit_list = get_menu_unit(menu_id)

        answers = RoutingSlip_Answer.objects.filter(request=c_id).values('unit', 'id', 'date', 'is_confirm', 'message')
        for c_unit in c_unit_list:
            unit_id = c_unit.get('id')

            is_answer = False

            for answer in answers:
                a_unit_id = answer.get('unit')

                if unit_id == a_unit_id:
                    is_answer = True
                    c_unit['date'] = answer.get('date')
                    c_unit['is_confirm'] = answer.get('is_confirm')
                    c_unit['message'] = answer.get('message')

            c_unit['is_answer'] = is_answer

        return c_unit_list

    def get_answer_count(self, obj):

        is_answered = False
        menu_id = self.context['request'].query_params.get('menu')

        c_unit_list = get_menu_unit(menu_id)

        c_queryset = RoutingSlip_Answer.objects.all()
        answer_ids = c_queryset.filter(request=obj.id).values_list('id', flat=True)

        if len(c_unit_list) - 1 == len(answer_ids):
            is_answered = True

        return is_answered


class RoutingSlip_AnswerSerializer(serializers.ModelSerializer):

    class Meta:
        model = RoutingSlip_Answer
        fields = "__all__"

# -------------- Багшийн туслахаар ажиллах хүсэлт ------------------

class LessonSerializer(serializers.ModelSerializer):
    class Meta:
        model = LessonStandart
        fields = "id", "code", "name"


class TeacherSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField(read_only=True)
    code = serializers.SerializerMethodField(read_only=True)


    class Meta:
        model = Teachers
        fields = "id", "last_name", "first_name", "full_name", "code"

    def get_full_name(self, obj):
        """ Багшийн бүтэн нэр авах """

        full_name = ''
        first_name = obj.first_name
        last_name = obj.last_name

        full_name = get_fullName(last_name,first_name, is_strim_first=True)

        return full_name


    def get_code(self, obj):
        "Багшийн код авах"

        str = " "
        register_code = ''
        full_names = ''
        full_names = obj.full_name

        qs_worker = Employee.objects.filter(user=obj.user).last()
        if qs_worker:
            register_code = qs_worker.register_code

        if register_code:
            register_code += str + full_names

        return register_code


class RequestAnswerTutorSerializer(serializers.ModelSerializer):
    student = StudentSerializer(many=False)
    teacher = TeacherSerializer(many=False)
    lesson = LessonSerializer(many=False)

    class Meta:
        model = StudentRequestTutor
        fields = "__all__"

# Багшийн туслахаар ажиллах хүсэлт засах
class RequestAnswerTutorPutSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentRequestTutor
        fields = ["answer", "request_flag"]
