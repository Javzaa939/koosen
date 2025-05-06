import os
import math
import json

from rest_framework import serializers

from django.db.models import Q, F, Count, Value, CharField
from django.db.models.functions import Concat

from django.conf import settings

from datetime import datetime

from apps import surgalt
from main.utils.function.utils import remove_key_from_dict
from core.fns import WithChoices

from elselt.models import ElseltUser

from lms.models import LessonStandart, TeacherScore
from lms.models import Lesson_title_plan
from lms.models import LessonCategory
from lms.models import ProfessionalDegree
from lms.models import LearningPlan
from lms.models import ProfessionDefinition
from lms.models import LessonGroup
from lms.models import LessonLevel
from lms.models import LessonType
from lms.models import Season
from lms.models import Lesson_to_teacher
from lms.models import Group
from lms.models import Student
from lms.models import ScoreRegister
from lms.models import TimeTable
from lms.models import TimeTable_to_group
from lms.models import AdmissionBottomScore
from lms.models import AdmissionLesson
from lms.models import Challenge
from lms.models import ChallengeQuestions
from lms.models import QuestionChoices
from lms.models import AimagHot
from lms.models import SumDuureg
from lms.models import Lesson_assignment_student
from lms.models import Lesson_assignment_student_file
from lms.models import Lesson_materials
from lms.models import Lesson_material_file
from lms.models import Lesson_assignment, AdmissionRegisterProfession
from lms.models import PsychologicalTest
from lms.models import PsychologicalTestQuestions,PsychologicalQuestionChoices
from lms.models import ExamTimeTable
from lms.models import QuestionTitle,ChallengeSedevCount
from lms.models import ChallengeStudents

from main.utils.file import split_root_path

from core.models import Teachers, Employee

from core.serializers import DepartmentRegisterSerailizer

def get_fullName(firstName='', lastName="", is_dot=True, is_strim_first=False):
    """ return fullName
        firstName: Эхэнд бичигдэх нэр
        lastName: Сүүлд бичигдэх нэр
        is_dot: Дунд нь цэг байх эсэх
        is_strim_first: Эхний нэрийн эхний үсгийг авах эсэх
    """

    full_name = ''

    if is_strim_first:
        firstName = firstName[0]

    if firstName:
        full_name += firstName

    if is_dot:
        full_name += '. '
    else:
        full_name += ' '

    if lastName:
        full_name += lastName

    return full_name

def check_datetime(input_datetime):
    """ datetime төрөлтэй эсэх """
    is_datetime = True
    if not isinstance(input_datetime, datetime):
        is_datetime = False

    return is_datetime


def fix_format_date(input_date, format='%Y-%m-%d %H:%M:%S'):
    """ Date format хөрвүүлэх """

    date_data = ''

    is_date = check_datetime(input_date)

    if is_date:
        date_data = input_date.strftime(format)

    return date_data

# fix_format_date функцтай адил гэхдээ serializer дотроо нэмэлт функц бичих шаардлагагүй
class DateOnlyField(serializers.Field):
    def to_representation(self, value):
        # postgre datetime-ийг date-рүү хөрвүүлнэ
        if isinstance(value, datetime):
            return value.date().isoformat()
        return value

    def to_internal_value(self, data):
        # оролтын data-г date болгоно
        try:
            return datetime.strptime(data, '%Y-%m-%d %H:%M:%S').date()
        except ValueError:
            raise serializers.ValidationError('Оролтын дата нь %Y-%m-%d %H:%M:%S хэлбэртэй байх шаардлагатай.')

# Хичээлийн ангилал
class LessonCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = LessonCategory
        fields = "id", "category_code", "category_name"


# Хичээлийн стандартын жагсаалт
class LessonStandartListSerializer(serializers.ModelSerializer):
    category = LessonCategorySerializer(many=False)
    department = DepartmentRegisterSerailizer(many=False)
    teachers = serializers.SerializerMethodField()
    professions = serializers.SerializerMethodField()
    is_score = serializers.SerializerMethodField()
    ckredit = serializers.SerializerMethodField()

    class Meta:
        model = LessonStandart
        fields = "code", 'name', 'department', 'category', 'teachers', 'id', 'ckredit', 'professions', 'is_score', 'name_eng', 'name_uig'

    def get_is_score(self, obj):
        """ Тухайн хичээл дүнтэй эсэх"""
        return ScoreRegister.objects.filter(lesson=obj).exists()

    def get_professions(self, obj):
        # Хөтөлбөрийн жагсаалт
        check = list(LearningPlan.objects.filter(lesson=obj).annotate(prof_name=Concat("profession__code", Value(" "), "profession__name", output_field=CharField())).order_by('profession__code').values_list('prof_name', flat=True).distinct())

        profession_names = ','.join(check)
        return profession_names

    def get_ckredit(self, obj):
        kredit = 0.0 if math.isnan(obj.kredit) else obj.kredit
        return kredit

    def get_teachers(self, obj):

        teacher_name = ''
        teacher_list = []
        teacher_ids = Lesson_to_teacher.objects.filter(lesson_id=obj.id).values_list('teacher', flat=True)
        if len(teacher_ids) > 0:
            for teacher_id in teacher_ids:
                full_name = ""
                emp_data = Teachers.objects.filter(id=teacher_id, action_status=Teachers.APPROVED).first()
                if emp_data:
                    user_id = emp_data.user
                    userinfo_data = Employee.objects.filter(user=user_id, state=Employee.STATE_WORKING).first()

                    register_code = None
                    if userinfo_data:
                        register_code = userinfo_data.register_code
                    if register_code:
                        full_name = register_code
                    if emp_data.first_name:
                        full_name += emp_data.first_name

                    teacher_list.append({'id': teacher_id, 'name': full_name})
                    teacher_name = teacher_name + ', ' if teacher_name else ''
                    teacher_name += full_name


        datas = {
            'teachers': teacher_list,
            'teacher_name': teacher_name
        }

        return datas

# Хичээлийн стандарт
class LessonStandartSerializer(serializers.ModelSerializer):

    full_name = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = LessonStandart
        fields = "id", 'name', 'code', 'full_name'

    def get_full_name(self, obj):
        return obj.code_name


class LessonStandartCreateSerializer(serializers.ModelSerializer):

    class Meta:
        model = LessonStandart
        fields = "__all__"



class LessonStandartBagtsKrSerializer(serializers.ModelSerializer):

    class Meta:
        model = LessonStandart
        fields = ["id", "lecture_kr", "seminar_kr", "laborator_kr", "practic_kr","biedaalt_kr"]

class LessonTitlePlanSerializer(serializers.ModelSerializer):

    # lesson = LessonStandartBagtsKrSerializer(many=False)
    class Meta:
        model = Lesson_title_plan
        fields = "__all__"

# ------------------ Боловсролын зэрэг -----------------
class ProfessionalDegreeSerializer(serializers.ModelSerializer):

    class Meta:
        model = ProfessionalDegree
        fields = ["id", "degree_code", "degree_name"]



class AdmissionLessonSerializer(serializers.ModelSerializer):

    class Meta:
        model = AdmissionLesson
        fields = "__all__"


# Мэргэжлийн тодорхойлолт жагсаалт
class ProfessionDefinitionListSerializer(serializers.ModelSerializer):
    degree = ProfessionalDegreeSerializer(many=False)
    department = DepartmentRegisterSerailizer(many=False)
    general_base = serializers.FloatField()
    professional_base = serializers.FloatField()
    professional_lesson = serializers.FloatField()
    admission_lesson = serializers.SerializerMethodField()
    groups = serializers.SerializerMethodField()
    gen_direct_type_name = serializers.CharField(source="get_gen_direct_type_display", read_only=True)

    class Meta:
        model = ProfessionDefinition
        exclude = ["created_at", "updated_at"]

    def get_admission_lesson(self, obj):

        profId = obj.id
        adm_obj = AdmissionBottomScore.objects.filter(profession_id=profId).annotate(type_name=WithChoices(AdmissionBottomScore.SCORE_TYPE, 'score_type'), lesson_name=F('admission_lesson__lesson_name')).values()
        return list(adm_obj)

    def get_groups(self, obj):

        adm_obj = Group.objects.filter(profession=obj).values_list('name', flat=True)
        return list(adm_obj)


# Мэргэжлийн тодорхойлолт
class ProfessionDefinitionSerializer(serializers.ModelSerializer):

    full_name = serializers.SerializerMethodField(read_only=True)
    prof_name = serializers.SerializerMethodField(read_only=True)
    state = serializers.SerializerMethodField(read_only=True)
    adm_register = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = ProfessionDefinition
        fields = "__all__"

    def get_full_name(self, obj):
        """ Мэргэжлийн зэргийн нэр код нэгтгэх """

        full_name = ''
        code = obj.code
        name = obj.name

        ognoo = obj.confirm_year

        degree = obj.degree
        if degree:
            degree_code = degree.degree_code

        if code:
            full_name += code
        if name:
            full_name = full_name +  ' ' + name

        if degree_code:
            full_name = full_name + '({degree_code})'.format(degree_code=degree_code)

        if ognoo:
            full_name = full_name + '({ognoo})'.format(ognoo=ognoo)

        return full_name

    def get_prof_name(self, obj):
        """ Мэргэжлийн нэр код нэгтгэх """

        full_name = ''
        code = obj.code
        name = obj.name

        if code:
            full_name += code
        if name:
            full_name = full_name +  ' ' + name

        return full_name

    def get_state(self, obj):
        state = ''
        admission = self.context.get('admission')
        if admission:
            admission_prof_obj = AdmissionRegisterProfession.objects.filter(profession=obj, admission=admission).first()
            state = admission_prof_obj.state
        return state

    def get_adm_register(self, obj):
        admission_prof_obj = dict()
        admission = self.context.get('admission')
        if admission:
            admission_prof_obj = AdmissionRegisterProfession.objects.filter(profession=obj, admission=admission).values().first()
        return admission_prof_obj

# ------------------- Сургалтын төлөвлөгөө ---------------------


# Хичээлийн стандарт
class LessonStandartSerialzier(serializers.ModelSerializer):

    full_name = serializers.SerializerMethodField(read_only=True)
    class Meta:
        model = LessonStandart
        fields = "id", "code", "name", "full_name"

    def get_full_name(self, obj):
        """ Хичээлийн нэр код нэгтгэх """

        full_name = ''
        code = obj.code
        name = obj.name

        if code:
            full_name += code
        if name:
            full_name +=  ' ' + name

        return full_name


# Хичээлийн бүлэг
class LessonGroupSerialzier(serializers.ModelSerializer):

    class Meta:
        model = LessonGroup
        fields = "id", "group_code", "group_name"


# Хичээлийн түвшин
class LessonLevelSerialzier(serializers.ModelSerializer):

    class Meta:
        model = LessonLevel
        fields = "id", "level_code", "level_name"


# Хичээлийн төрөл
class LessonTypeSerialzier(serializers.ModelSerializer):

    class Meta:
        model = LessonType
        fields = "id", "type_code", "type_name"


# улирал
class SeasonSerializer(serializers.ModelSerializer):

    class Meta:
        model = Season
        fields = "id", "season_code", "season_name"


# Сургалтын төлөвлөгөө жагсаалт
class LearningPlanListSerializer(serializers.ModelSerializer):
    profession = ProfessionDefinitionSerializer(many=False)
    lesson = LessonStandartSerialzier(many=False)
    previous_lesson = LessonStandartSerialzier(many=False)
    group_lesson = LessonStandartSerialzier(many=False)
    season = SeasonSerializer(many=False)

    class Meta:
        model = LearningPlan
        fields = "__all__"


# Сургалтын төлөвлөгөө
class LearningPlanSerializer(serializers.ModelSerializer):

    class Meta:
        model = LearningPlan
        fields = "__all__"


# Сургалтын төлөвлөгөө
class ProfessionLearningPlanSerializer(serializers.ModelSerializer):
    season = serializers.SerializerMethodField()

    class Meta:
        model = LearningPlan
        fields = "id", "lesson_level", "lesson_type", "season", "lesson", "previous_lesson", "group_lesson", "is_check_score"

    def get_season(self, obj):
        cseason = list()
        season = obj.season
        if season:
            season = season.replace("'", ' ')
            season = season.replace(",", ' ')
            seasons = season.replace('[', ' ').replace(']', ' ').split()

            for value in seasons:
                cseason.append(int(value))

        return cseason


class GroupSerializer(serializers.ModelSerializer):

    class Meta:
        model = Group
        fields = "__all__"


# Хичээлийн стандарт
class LessonStandartPlanPrintSerializer(serializers.ModelSerializer):

    student_study = serializers.SerializerMethodField()

    class Meta:
        model = LessonStandart
        fields = "__all__"

    def get_student_study(self, obj):

        all_data = list()

        max_student = 1

        request = self.context['request']

        data = request.data

        lesson_year = request.query_params.get('lesson_year')
        lesson_season = request.query_params.get('lesson_season')
        profession = request.query_params.get('profession')
        student = request.query_params.get('student')
        season = request.query_params.get('season')

        group_queryset = data.get('group_queryset')

        for group in group_queryset:

            value = 1

            group_data = dict()
            group_data['group_id'] = group.id

            students_queryset = Student.objects.filter(group=group)

            # мэргэжил байгаа үед мэргэжилээр filter хийх
            if profession:
                students_queryset = students_queryset.filter(group__profession=profession)

            # оюутан байгаа үед оюутнаар filter хийх
            if student:
                students_queryset = students_queryset.filter(id=student)

            time_table_qs = TimeTable.objects.filter(lesson_year=lesson_year, lesson_season=lesson_season, lesson=obj.id).values_list('id', flat=True)

            time_table_to_group_count = TimeTable_to_group.objects.filter(timetable__in=time_table_qs, group=group).count()

            score_queryset =  ScoreRegister.objects.filter(
                Q(student__in=students_queryset) & (Q(status=ScoreRegister.TEACHER_WEB ) | Q(status=ScoreRegister.EXAM) | Q(status=ScoreRegister.START_SYSTEM_SCORE )) & Q(lesson=obj.id)
            )

            # улирал байгаа үед хичээлийн улиралаар filter хийх
            if season:
                score_queryset = score_queryset.filter(lesson_season=season)

            score_reg_count = score_queryset.count()

            if score_reg_count >= max_student:
                value = 2

            elif time_table_to_group_count >= max_student:
                value = 3

            group_data['value'] = value

            all_data.append(group_data)

        return all_data


class LearningPlanPrintSerializer(serializers.ModelSerializer):

    lesson = LessonStandartPlanPrintSerializer()

    class Meta:
        model = LearningPlan
        fields = "__all__"

# --------------------------- Элсэлтийн шалгалтын хичээл ба босго оноо мэргэжлээр --------------

class AdmissionBottomScoreSerializer(serializers.ModelSerializer):

    class Meta:
        model = AdmissionBottomScore
        fields = "__all__"


class AdmissionBottomScoreListSerializer(serializers.ModelSerializer):
    profession = ProfessionDefinitionSerializer(many=False)
    admission_lesson = AdmissionLessonSerializer(many=False)
    lessons = serializers.SerializerMethodField()
    class Meta:
        model = AdmissionBottomScore
        fields = "__all__"

    def get_lessons(self, obj):
        all_data = list()

        qs = ProfessionDefinition.objects.filter(id=obj.profession_id).values('id', 'name')

        if qs:
            all_data = list(qs)

        return all_data
    
class GroupListSerializer(serializers.ModelSerializer):

    class Meta:
        model = Group
        fields = "__all__"

class AimaghotListSerializer(serializers.ModelSerializer):

     class Meta:
        model = AimagHot
        exclude = "created_at", "updated_at"

class SumDuuregListSerializer(serializers.ModelSerializer):

    class Meta:
        model = SumDuureg
        fields = "id", "name", "unit1"

    
class TeacherListSerializer(serializers.ModelSerializer):
    """ Багшийн жагсаалтыг харуулах serializer """

    unit1 = AimaghotListSerializer(many=False, read_only=True)
    unit2 = SumDuuregListSerializer(many=False, read_only=True)
    full_name = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Teachers
        fields = ["id", "last_name", "first_name", "register", 'full_name', 'unit1', 'unit2']

    def get_full_name(self, obj):
        """ Багшийн бүтэн нэр авах """

        firstName = obj.first_name
        lastName = obj.last_name[0:1]

        fullName = ''
        full_name = get_fullName(lastName, firstName, is_dot=True)

        qs_worker = Employee.objects.filter(user=obj.user).last()
        if qs_worker:
            register_code = qs_worker.register_code
            if register_code:
                fullName = register_code + ' ' + full_name
            else:
                fullName = full_name

        return fullName

class SubjectSerializer(serializers.ModelSerializer):

    class Meta:
        model = Lesson_title_plan
        fields = 'id', 'title'

class QuestionChoicesSerializer(serializers.ModelSerializer):

    checked = serializers.SerializerMethodField()
    imageName = serializers.SerializerMethodField()
    class Meta:
        model = QuestionChoices
        fields = '__all__'

    def get_checked(self, obj):

        checked = False

        if obj.score != 0:
            checked = True

        return checked

    def get_imageName(self, obj):
        image_name = ''
        image = obj.image
        if image:
            image = image.path if image else ''
            image_name = os.path.basename(image)

        return image_name

class StudentSerializer(serializers.ModelSerializer):

    full_name = serializers.SerializerMethodField()
    group_name = serializers.CharField(source='group.name', default='')

    class Meta:
        model = Student
        fields = ["id", "code", "last_name", "first_name", "full_name", 'register_num', 'group_name']

    def get_full_name(self, obj):

        return obj.full_name()

class ChallengeQuestionListSerializer(serializers.ModelSerializer):

    kind_name = serializers.SerializerMethodField()
    choices = QuestionChoicesSerializer(read_only=True, many=True)
    subject = SubjectSerializer(read_only=True)

    lesson_id = serializers.CharField(default='', source='subject.lesson.id')
    imageName = serializers.SerializerMethodField()
    title = serializers.SerializerMethodField()

    class Meta:
        model = ChallengeQuestions
        fields = '__all__'


    def get_kind_name(self, obj):
        return obj.get_kind_display()

    def get_imageName(self, obj):
        image_name = ''
        image = obj.image
        if image:
            image = image.path if image else ''
            image_name = os.path.basename(image)

        return image_name

    def get_title(self,obj):
        titles = obj.title.all()
        title_names = [title.name for title in titles]
        return title_names


class ChallengeQuestionsAnswersSerializer(serializers.ModelSerializer):

    reliability = serializers.SerializerMethodField()

    class Meta:
        model = ChallengeQuestions
        fields = 'reliability', 'question', 'id'

    def get_reliability(self, obj):

        return getattr(obj, 'reliability', 0)


class ChallengeSerializer(serializers.ModelSerializer):

    class Meta:
        model = Challenge
        exclude = ['questions']


class ChallengeQuestionSerializer(serializers.ModelSerializer):

    class Meta:
        model = Challenge
        fields = '__all__'

class ChallengeListSerializer(serializers.ModelSerializer):
    startAt = serializers.SerializerMethodField()
    endAt = serializers.SerializerMethodField()

    # scopeName = serializers.SerializerMethodField()
    lesson = LessonStandartSerializer()
    is_student = serializers.SerializerMethodField()
    teacher_name = serializers.CharField(source='created_by.full_name', default='')

    # student = StudentSerializer(read_only=True, many=True)
    # group = serializers.SerializerMethodField()

    # questions = ChallengeQuestionListSerializer(read_only=True, many=True)
    # created_by = TeacherListSerializer(read_only=True)

    class Meta:
        model = Challenge
        fields = '__all__'

    def get_startAt(self, obj):
        return fix_format_date(obj.start_date)

    def get_endAt(self, obj):
        return fix_format_date(obj.end_date)

    def get_is_student(self, obj):
        challenge = Challenge.objects.get(id=obj.id)
        challenge_student_ids = ChallengeStudents.objects.filter(challenge=challenge, answer__isnull=False).values('student').distinct().count()

        return challenge_student_ids


    # def get_scopeName(self, obj):
    #     return obj.get_kind_display()


    # def get_group(self, obj):
    #     groups = []

    #     if obj.kind == Challenge.KIND_GROUP:

    #         group_ids = obj.student.all().values_list('group', flat=True)

    #         group_qs = Group.objects.filter(id__in=group_ids)

    #         groups = GroupListSerializer(group_qs, many=True).data

    #     return list(groups)

class LessonAssignmentStudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = '__all__'

class LessonAssignmentAssigmentListSerializer(serializers.ModelSerializer):

    student = LessonAssignmentStudentSerializer(many=False)
    homework_files = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Lesson_assignment_student
        fields = '__all__'

    def get_homework_files(self, obj):

        if settings.DEBUG:
            base_url = 'http://localhost:8000/files/'
        else:
            # TODO: domain
            # student_url = settings.STUDENT_URL
            student_url = 'http://student.utilitysolution.mn'
            base_url = '{student_url}/files/'.format(student_url=student_url)

        files = list()

        qs_list = Lesson_assignment_student_file.objects.filter(student_assignment=obj)

        if qs_list:
            for qs in qs_list:
                if qs.file:
                    try:
                        path = split_root_path(qs.file.path)
                        path = os.path.join(base_url, path)

                    except ValueError:
                        return files

                data = {
                    'file': path,
                }

                files.append(data)

        return files

class LessonAssignmentAssigmentSerializer(serializers.ModelSerializer):

    student = LessonAssignmentStudentSerializer(many=False, read_only=True)

    class Meta:
        model = Lesson_assignment_student
        fields = '__all__'

class LessonTitleSerializer(serializers.ModelSerializer):

    class Meta:
        model = Lesson_title_plan
        fields = '__all__'

class LessonMaterialSerializer(serializers.ModelSerializer):

    class Meta:
        model = Lesson_materials
        fields = '__all__'

class LessonMaterialFileSerializer(serializers.ModelSerializer):

    file_name = serializers.SerializerMethodField()

    class Meta:
        model = Lesson_material_file
        fields = '__all__'

    def get_file_name(self, obj):

        file_name = ''
        file = obj.file.path if obj.file else ''
        if file:
            file_name = os.path.basename(file)

        return file_name

class Lesson_assignmentSerializer(serializers.ModelSerializer):

    startDate = serializers.SerializerMethodField()
    finishDate = serializers.SerializerMethodField()

    class Meta:
        model = Lesson_assignment
        fields = "__all__"

    def get_startDate(self, obj):
        return fix_format_date(obj.start_date)

    def get_finishDate(self, obj):
        return fix_format_date(obj.finish_date)

class LessonMaterialListSerializer(serializers.ModelSerializer):

    material = serializers.SerializerMethodField()
    material_type_name = serializers.SerializerMethodField()
    teacher = TeacherListSerializer()
    lesson = LessonStandartSerializer()
    createdAt = serializers.SerializerMethodField()
    homework = serializers.SerializerMethodField()
    homework_status = serializers.SerializerMethodField()

    class Meta:
        model = Lesson_materials
        fields = '__all__'

    def get_material_type_name(self, obj):

        return obj.get_material_type_display()

    def get_material(self, instance):
        files = Lesson_material_file.objects.filter(material=instance.id)

        request = self.context.get('request')

        return LessonMaterialFileSerializer(files, many=True, context={'request': request}).data

    def get_createdAt(self, obj):
        return fix_format_date(obj.created_at)

    def get_homework(self, obj):

        return_data = {}
        material_type = obj.material_type

        if material_type == Lesson_materials.HOMEWORK:
            lesson_assignment = Lesson_assignment.objects.filter(lesson_material=obj.id).first()
            return_data = Lesson_assignmentSerializer(lesson_assignment, many=False).data

        return return_data

    def get_homework_status(self, obj):
        lesson_assignment_qs = Lesson_assignment.objects.filter(lesson_material=obj.id).first()

        ass_student_qs = {'send_total': 0, 'checked_total': 0}

        if lesson_assignment_qs:
            ass_student_qs = (
                Lesson_assignment_student
                .objects
                .filter(
                    assignment=lesson_assignment_qs
                )
                .aggregate(
                    send_total=Count(F('status'), filter=Q(status=Lesson_assignment_student.SEND)),
                    checked_total=Count(F('status'), filter=Q(status=Lesson_assignment_student.CHECKED)),
                )
            )

        return ass_student_qs

class LessonTeacherSerializer(serializers.ModelSerializer):

    class Meta:
        model = Lesson_to_teacher
        fields = '__all__'


class ProfessionDefinitionJustProfessionSerializer(serializers.ModelSerializer):

    full_name = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = ProfessionDefinition
        fields = '__all__'

    def get_full_name(self, obj):
        """ Мэргэжлийн зэргийн нэр код нэгтгэх """

        full_name = ''
        code = obj.code
        name = obj.name

        ognoo = obj.confirm_year

        degree = obj.degree
        if degree:
            degree_code = degree.degree_code

        if code:
            full_name += code
        if name:
            full_name = full_name +  ' ' + name

        if degree_code:
            full_name = full_name + '({degree_code})'.format(degree_code=degree_code)

        if ognoo:
            full_name = full_name + '({ognoo})'.format(ognoo=ognoo)

        return full_name


class PsychologicalTestSerializer(serializers.ModelSerializer):
    class Meta:
        model = PsychologicalTest
        exclude = ['questions']

class PsychologicalQuestionChoicesSerializer(serializers.ModelSerializer):

    class Meta:
        model = PsychologicalQuestionChoices
        fields = '__all__'

class PsychologicalTestQuestionsSerializer(serializers.ModelSerializer):
    choices = PsychologicalQuestionChoicesSerializer(many=True, read_only=True)

    class Meta:
        model = PsychologicalTestQuestions
        fields = '__all__'


class PsychologicalTestScopeSerializer(serializers.ModelSerializer):

    class Meta:
        model = PsychologicalTest
        fields = ['id']


class TeachersSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = Teachers
        fields = ["id", "register", "last_name", "first_name", "full_name"]

    def get_full_name(self, obj):

        return obj.full_name


class ElsegchSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = ElseltUser
        fields = ["id", "code", "register", "last_name", "first_name", "full_name"]

    def get_full_name(self, obj):

        return obj.full_name


class PsychologicalTestResultSerializer(serializers.ModelSerializer):
    state = serializers.SerializerMethodField(read_only=True)
    start_date = DateOnlyField()
    end_date = DateOnlyField()

    class Meta:
        model = PsychologicalTest
        fields = ['id', 'title', 'description', 'duration', 'start_date', 'end_date', 'state']

    def get_state(self, obj):
        state = 2
        now = datetime.now()

        if obj.start_date > now: state = 1
        if obj.end_date < now: state = 3
        return state


class PsychologicalTestParticipantsSerializer(serializers.ModelSerializer):

    class Meta:
        model = PsychologicalTest
        fields = ['participants']

class ChallengeLessonSerializer(serializers.ModelSerializer):

    class Meta:
        model = LessonStandart
        fields = ['id', 'name', 'code', 'kredit']

class TeacherExamTimeTableSerializer(serializers.ModelSerializer):
    lesson = ChallengeLessonSerializer()
    class Meta:
        model = ExamTimeTable
        fields = '__all__'

class QuestionTitleSerializer(serializers.ModelSerializer):

    lesson = serializers.CharField(source="lesson.name", read_only=True)
    challengequestions_count = serializers.SerializerMethodField()
    class Meta:
        model = QuestionTitle
        fields = '__all__'

    def get_challengequestions_count(self, obj):
        return obj.challengequestions_set.count()

class ChallengeSedevSerializer(serializers.ModelSerializer):
    lesson_title = LessonTitleSerializer()

    class Meta:
        model = ChallengeSedevCount
        fields = '__all__'

class ChallengeDetailSerializer(serializers.ModelSerializer):
    challenge_type_name = serializers.SerializerMethodField()

    class Meta:
        model = Challenge
        fields = ['title', 'start_date', 'end_date', 'duration', 'try_number', 'assess', 'challenge_type_name']

    def get_challenge_type_name(self, obj):

        return obj.get_challenge_type_display()


class ChallengeStudentsSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    student_code = serializers.SerializerMethodField()
    answer_json = serializers.SerializerMethodField()
    still_score = serializers.SerializerMethodField()

    class Meta:
        model = ChallengeStudents
        fields = ['challenge', 'score', 'take_score', 'answer_json', "tried", "id", "student_name", "student_code", 'answer', 'still_score']

    def get_still_score(self, obj):
        """ Өгч байгаа шалгалт """
        score = 0

        try:
            if obj.answer:
                answer_json = obj.answer.replace("'", '"')
                answer_json = json.loads(answer_json)
                if answer_json:
                    # Тестэн доторх асуултууд
                    for question_id, choice_id in answer_json.items():
                        #Асуултан доторх хариулт

                        # NOTE: choice_id нь array ирээд алдаа гараад байсан учир энэ нөхцлийг бичив. javzaa bichsen
                        if choice_id and isinstance(choice_id, list):
                            for ch_id in choice_id:
                                choice_obj = QuestionChoices.objects.filter(id=ch_id).values('score', 'challengequestions__question').first()

                                # Оноо байвал зөв хариулт гэж үзнэ
                                if choice_obj and choice_obj.get('score') > 0:
                                    score += choice_obj.get('score')

                        elif choice_id:
                            choice_obj = QuestionChoices.objects.filter(id=choice_id).values('score','challengequestions__question').first()

                            # Оноо байвал зөв хариулт гэж үзнэ
                            if choice_obj and choice_obj.get('score') > 0:
                                score += choice_obj.get('score')

            return score

        except json.JSONDecodeError:
            return None


    def get_student_name(self, obj):
        data = Student.objects.filter(id=obj.student.id).values('first_name').first()
        name = data.get('first_name')

        return name

    def get_student_code(self, obj):
        data = Student.objects.filter(id=obj.student.id).values('code').first()
        code = data.get('code')

        return code

    def get_answer_json(self, obj):
        answers = []

        try:
            if obj.answer:
                answer_json = obj.answer.replace("'", '"')
                answer_json = json.loads(answer_json)
                if answer_json:

                # Тестэн доторх асуултууд
                    for question_id, choice_id in answer_json.items():
                        #Асуултан доторх хариулт

                        # NOTE: choice_id нь array ирээд алдаа гараад байсан учир энэ нөхцлийг бичив. javzaa bichsen
                        if choice_id and isinstance(choice_id, list):
                            for ch_id in choice_id:
                                choice_obj = QuestionChoices.objects.filter(id=ch_id).values('score', 'challengequestions__question').first()
                                # choice дотроо is_right-г үүсгэнэ
                                is_right = False

                                # Оноо байвал зөв хариулт гэж үзнэ
                                if choice_obj and choice_obj.get('score') > 0:
                                    is_right = True

                                answers.append({
                                    'question_id': question_id,
                                    'question_text': choice_obj.get('challengequestions__question') if choice_obj else '',
                                    'is_answered_right': is_right
                                })
                        elif choice_id:
                            choice_obj = QuestionChoices.objects.filter(id=choice_id).values('score','challengequestions__question').first()

                            # choice дотроо is_right-г үүсгэнэ
                            is_right = False

                            # Оноо байвал зөв хариулт гэж үзнэ
                            if choice_obj and choice_obj.get('score') > 0:
                                is_right = True

                            answers.append({
                                'question_id': question_id,
                                'question_text': choice_obj.get('challengequestions__question') if choice_obj else '',
                                'is_answered_right': is_right
                            })

            return answers

        except json.JSONDecodeError:
            return None


class ChallengeReport2StudentsSerializer(serializers.ModelSerializer):
    student_idnum = serializers.IntegerField()
    student_first_name = serializers.CharField()
    student_last_name = serializers.CharField()
    student_code = serializers.CharField()
    group_name = serializers.CharField()
    scored_lesson_count = serializers.IntegerField()
    exam_type_scored_lesson_count = serializers.IntegerField()
    success_scored_lesson_count = serializers.IntegerField()
    failed_scored_lesson_count = serializers.IntegerField()

    class Meta:
        model = TeacherScore
        fields = ["student_idnum", "student_first_name", "student_last_name", "student_code", "exam_type_scored_lesson_count", "scored_lesson_count", "success_scored_lesson_count", "failed_scored_lesson_count", 'group_name']


class ChallengeReport2StudentsDetailSerializer(serializers.ModelSerializer):
    student_first_name = serializers.CharField()
    student_last_name = serializers.CharField()
    student_code = serializers.CharField()
    lesson_name = serializers.CharField()
    exam_score = serializers.FloatField()
    exam_teacher_first_name = serializers.CharField()
    exam_teacher_last_name = serializers.CharField()
    teach_score = serializers.FloatField()
    teach_teacher_first_name = serializers.CharField()
    teach_teacher_last_name = serializers.CharField()

    class Meta:
        model = TeacherScore
        fields = ["student_first_name", "student_last_name", "student_code", "lesson_name", "exam_score", "exam_teacher_first_name", "exam_teacher_last_name", "teach_score", "teach_teacher_first_name", "teach_teacher_last_name"]


class ChallengeReport4Serializer(serializers.ModelSerializer):

    full_name = serializers.SerializerMethodField()
    answers = serializers.SerializerMethodField()

    class Meta:
        model = ChallengeStudents
        fields = 'id', 'full_name', 'answers'

    def get_full_name(self, obj):

        return obj.student.full_name()

    def get_answers(self, obj):
        answers = surgalt.views.ChallengeReportAPIView.parse_answers(obj.answer, obj.challenge.id)

        for answer in answers:
            remove_key_from_dict(answer, ['question_text', 'choice_id', 'question_title'])

        return answers


class ChallengeGroupsSerializer(serializers.ModelSerializer):
    group_name = serializers.CharField()
    student_count = serializers.IntegerField()
    A2_count = serializers.IntegerField()
    A_count = serializers.IntegerField()
    B2_count = serializers.IntegerField()
    B_count = serializers.IntegerField()
    C2_count = serializers.IntegerField()
    C_count = serializers.IntegerField()
    D_count = serializers.IntegerField()
    F_count = serializers.IntegerField()

    class Meta:
        model = ChallengeStudents
        fields = ['group_name', 'student_count', 'A_count', 'B_count', 'C_count', 'D_count', 'F_count', 'A2_count', 'B2_count', 'C2_count']


class ChallengeProfessionsSerializer(serializers.ModelSerializer):
    profession_name = serializers.CharField()
    student_count = serializers.IntegerField()
    A2_count = serializers.IntegerField()
    A_count = serializers.IntegerField()
    B2_count = serializers.IntegerField()
    B_count = serializers.IntegerField()
    C2_count = serializers.IntegerField()
    C_count = serializers.IntegerField()
    D_count = serializers.IntegerField()
    F_count = serializers.IntegerField()

    class Meta:
        model = ChallengeStudents
        fields = ['profession_name', 'student_count', 'A_count', 'B_count', 'C_count', 'D_count', 'F_count', 'A2_count', 'B2_count', 'C2_count']


class StudentChallengeSerializer(serializers.ModelSerializer):

    challenge = serializers.SerializerMethodField()
    test_detail = serializers.SerializerMethodField()
    class Meta:
        model = Student
        fields = ["id", "code", "last_name", "first_name", "challenge", "test_detail"]

    def get_challenge(self, obj):

        test_id = self.context.get('test_id')

        challenge_student_qs = ChallengeStudents.objects.filter(challenge=test_id, student=obj).order_by('id')
        data = ChallengeStudentsSerializer(challenge_student_qs, many=True).data

        return data

    def get_test_detail(self, obj):

        test_id = self.context.get('test_id')

        data_qs = Challenge.objects.filter(id=test_id)
        result = ChallengeDetailSerializer(data_qs, many=True).data

        return result

class ChallengeDetailTableStudentsSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    student_code = serializers.SerializerMethodField()
    answer_json = serializers.SerializerMethodField()
    challenge_name = serializers.CharField(source="challenge.title", read_only=True)
    usgen_unelgee=serializers.SerializerMethodField()
    huvi_unelgee=serializers.SerializerMethodField()

    class Meta:
        model = ChallengeStudents
        fields = ['challenge', 'score', 'take_score', 'answer_json', "tried", "id", "student_name", "student_code", 'answer','challenge_name','usgen_unelgee','huvi_unelgee']

    def get_student_name(self, obj):
        data = Student.objects.filter(id=obj.student.id).values('first_name').first()
        name = data.get('first_name')

        return name

    def get_student_code(self, obj):
        data = Student.objects.filter(id=obj.student.id).values('code').first()
        code = data.get('code')

        return code

    def get_answer_json(self, obj):
        try:
            answer_json = []
            if obj.answer:
                answer_json = json.loads(obj.answer)

                # Тестэн доторх асуултууд
                for question in answer_json:
                    if not isinstance(question, dict):
                        return answer_json

                    #Асуултан доторх хариултууд
                    choices = question.get('choices')
                    for choice in choices:
                        # choice дотроо is_right-г үүсгэнэ
                        choice['is_right'] = False
                        choice_obj = QuestionChoices.objects.get(id=choice.get('id'))

                        # Оноо байвал зөв хариулт гэж үзнэ
                        if choice_obj.score != 0:
                            choice['is_right'] = True

                        choice['score'] = choice_obj.score

            return answer_json
        except json.JSONDecodeError:
            return None

    def get_usgen_unelgee(self,obj):

        if obj.take_score and obj.score:

            percentage = (obj.score / obj.take_score) * 100

            if percentage >= 90:
                return "A"
            elif 80 <= percentage < 90:
                return "B"
            elif 70 <= percentage < 80:
                return "C"
            elif 60 <= percentage < 70:
                return "D"
            else:
                return "F"

        return "Дүн ороогүй"

    def get_huvi_unelgee(self,obj):

        if obj.take_score and obj.score:

            percentage = (obj.score / obj.take_score) * 100
            return round(percentage, 1)

        return "Дүн ороогүй"