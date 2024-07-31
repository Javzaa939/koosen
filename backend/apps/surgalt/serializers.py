import os

from rest_framework import serializers

from django.db.models import Q, F, Count

from django.conf import settings

from datetime import datetime

from core.fns import WithChoices

from elselt.models import ElseltUser

from lms.models import LessonStandart
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

    class Meta:
        model = LessonStandart
        fields = "__all__"

    def get_teachers(self, obj):

        teacher_name = ''
        teacher_list = []
        teacher_ids = Lesson_to_teacher.objects.filter(lesson_id=obj.id).values_list('teacher_id', flat=True)
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
        fields = "__all__"

    def get_full_name(self, obj):
        return obj.code_name


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
    gen_direct_type_name = serializers.CharField(source="get_gen_direct_type_display", read_only=True)

    class Meta:
        model = ProfessionDefinition
        exclude = ["created_at", "updated_at"]

    def get_admission_lesson(self, obj):

        profId = obj.id
        adm_obj = AdmissionBottomScore.objects.filter(profession_id=profId).annotate(type_name=WithChoices(AdmissionBottomScore.SCORE_TYPE, 'score_type'), lesson_name=F('admission_lesson__lesson_name')).values()
        return list(adm_obj)


# Мэргэжлийн тодорхойлолт
class ProfessionDefinitionSerializer(serializers.ModelSerializer):

    full_name = serializers.SerializerMethodField(read_only=True)
    prof_name = serializers.SerializerMethodField(read_only=True)
    state = serializers.SerializerMethodField(read_only=True)

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

# ------------------- Сургалтын төлөвлөгөө ---------------------


# Хичээлийн стандарт
class LessonStandartSerialzier(serializers.ModelSerializer):

    full_name = serializers.SerializerMethodField(read_only=True)
    class Meta:
        model = LessonStandart
        fields = "id", "code", "name", "full_name", 'kredit'

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

    class Meta:
        model = Student
        fields = ["id", "code", "full_name", "group"]

    def get_full_name(self, obj):

        return obj.full_name

class ChallengeQuestionListSerializer(serializers.ModelSerializer):

    kind_name = serializers.SerializerMethodField()
    choices = QuestionChoicesSerializer(read_only=True, many=True)
    subject = SubjectSerializer(read_only=True)

    lesson_id = serializers.CharField(default='', source='subject.lesson.id')
    imageName = serializers.SerializerMethodField()

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

    scopeName = serializers.SerializerMethodField()
    lesson = LessonStandartSerializer()

    student = StudentSerializer(read_only=True, many=True)
    group = serializers.SerializerMethodField()

    questions = ChallengeQuestionListSerializer(read_only=True, many=True)
    created_by = TeacherListSerializer(read_only=True)

    class Meta:
        model = Challenge
        fields = '__all__'

    def get_startAt(self, obj):
        return fix_format_date(obj.start_date)

    def get_endAt(self, obj):
        return fix_format_date(obj.end_date)

    def get_scopeName(self, obj):
        return obj.get_kind_display()


    def get_group(self, obj):
        groups = []

        if obj.kind == Challenge.KIND_GROUP:

            group_ids = obj.student.all().values_list('group', flat=True)

            group_qs = Group.objects.filter(id__in=group_ids)

            groups = GroupListSerializer(group_qs, many=True).data

        return list(groups)

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
    start_date = DateOnlyField()
    end_date = DateOnlyField()

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

    class Meta:
        model = Teachers
        fields = ["id", "register", "last_name", "first_name"]

class StudentSerializer(serializers.ModelSerializer):

    class Meta:
        model = Student
        fields = ['id', 'code', 'last_name', 'first_name', 'group']


class ElsegchSerializer(serializers.ModelSerializer):

    class Meta:
        model = ElseltUser
        fields = ["id", "code", "last_name", "first_name"]


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