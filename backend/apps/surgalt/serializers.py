from rest_framework import serializers

from django.db.models import Q

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
from lms.models import Profession_SongonKredit
from lms.models import Lesson_to_teacher
from lms.models import Group
from lms.models import Student
from lms.models import ScoreRegister
from lms.models import TimeTable
from lms.models import TimeTable_to_group
from lms.models import AdmissionBottomScore
from lms.models import AdmissionLesson


from core.models import Teachers, Employee

from core.serializers import DepartmentRegisterSerailizer

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
    teacher_name = serializers.SerializerMethodField()

    class Meta:
        model = LessonStandart
        fields = "__all__"

    def get_teachers(self, obj):

        teacher_list = []
        teacher_ids = Lesson_to_teacher.objects.filter(lesson_id=obj.id).values_list('teacher_id', flat=True)
        if teacher_ids:
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
                    if userinfo_data:
                        full_name += emp_data.first_name

                    teacher_list.append({'id': teacher_id, 'name': full_name})

        return teacher_list

    def get_teacher_name(self, obj):

        teacher_name = ""
        teacher_ids = Lesson_to_teacher.objects.filter(lesson_id=obj.id).values_list('teacher_id',flat=True)
        if teacher_ids:
            for teacher_id in teacher_ids:
                full_name = ""
                emp_data = Teachers.objects.filter(id=teacher_id, action_status=Teachers.APPROVED).first()
                if emp_data:
                    user_id = emp_data.user
                    userinfo_data = Employee.objects.filter(user=user_id,state=Employee.STATE_WORKING).first()
                    register_code = None

                    if userinfo_data:
                        full_name = emp_data.first_name
                        register_code = userinfo_data.register_code

                        if register_code:
                            full_name = full_name + " " + register_code

                    teacher_name = teacher_name + ', ' if teacher_name else ''
                    teacher_name += full_name

        return teacher_name


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
    general_base = serializers.SerializerMethodField()
    professional_base = serializers.SerializerMethodField()
    professional_lesson = serializers.SerializerMethodField()
    admission_lesson = serializers.SerializerMethodField()
    gen_direct_type_name = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = ProfessionDefinition
        exclude = ["created_at", "updated_at"]

    def get_general_base(self, obj):

        general_base = ''
        songon_prof = Profession_SongonKredit.objects.filter(profession=obj.id, lesson_level=LearningPlan.BASIC).values('songon_kredit').first()
        if songon_prof:
            general_base = songon_prof['songon_kredit']

        return general_base

    def get_professional_base(self, obj):

        general_base = ''
        songon_prof = Profession_SongonKredit.objects.filter(profession=obj.id, lesson_level=LearningPlan.PROF_BASIC).values('songon_kredit').first()
        if songon_prof:
            general_base = songon_prof['songon_kredit']

        return general_base

    def get_professional_lesson(self, obj):

        general_base = ''
        songon_prof = Profession_SongonKredit.objects.filter(profession=obj.id, lesson_level=LearningPlan.PROFESSION).values('songon_kredit').first()
        if songon_prof:
            general_base = songon_prof['songon_kredit']

        return general_base

    def get_admission_lesson(self, obj):

        lesson_list = []
        lesson_ids = list(AdmissionBottomScore.objects.filter(profession=obj.id).values())
        if lesson_ids:
            lesson_list =  lesson_ids

        return lesson_list

    def get_gen_direct_type_name(self, obj):
        "Мэргэжлийн ерөнхий чиглэл"
        type_name = obj.get_gen_direct_type_display()
        return type_name


# Мэргэжлийн тодорхойлолт
class ProfessionDefinitionSerializer(serializers.ModelSerializer):

    full_name = serializers.SerializerMethodField(read_only=True)
    prof_name = serializers.SerializerMethodField(read_only=True)

    # degree = ProfessionalDegreeSerializer(read_only=True)post үйлдэл хийхэд алдаа гарч байгаа тул comment хийв.

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

        year = request.query_params.get('lesson_year')
        season = request.query_params.get('lesson_season')

        group_queryset = data.get('group_queryset')

        for group in group_queryset:

            value = 1

            group_data = dict()
            group_data['group_id'] = group.id

            students_queryset = Student.objects.filter(group=group)

            time_table_qs = TimeTable.objects.filter(lesson_year=year, lesson_season=season, lesson=obj.id).values_list('id', flat=True)

            time_table_to_group_count = TimeTable_to_group.objects.filter(timetable__in=time_table_qs, group=group).count()

            score_reg_count = ScoreRegister.objects.filter(
                Q(student__in=students_queryset) & (Q(status=ScoreRegister.TEACHER_WEB ) | Q(status=ScoreRegister.EXAM) | Q(status=ScoreRegister.START_SYSTEM_SCORE )) & Q(lesson=obj.id)
            ).count()

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

