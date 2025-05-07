import os
from datetime import date
from rest_framework import serializers
from django.core.exceptions import ValidationError

import base64

from django.conf import settings
from django.db.models.fields.files import ImageFieldFile
from django.db.models.functions import Cast, ExtractYear
from django.db.models import Avg, PositiveIntegerField
from django.db.models import F, Sum

from lms.models import Payment, Student, StudentAdmissionScore, StudentLeave
from lms.models import StudentRegister
from lms.models import Group
from lms.models import StudentMovement
from lms.models import StudentFamily
from lms.models import StudentAddress
from lms.models import Salbars
from lms.models import Country
from lms.models import StudentEducation
from lms.models import GraduationWork
from lms.models import StudentLeave
from lms.models import ProfessionalDegree
from lms.models import TimeTable
from lms.models import LessonStandart
from lms.models import Score
from lms.models import ScoreRegister
from lms.models import Teachers
from lms.models import Room
from lms.models import SubOrgs
from lms.models import PaymentEstimate
from lms.models import PaymentBalance
from lms.models import StipentStudent
from lms.models import Stipend
from lms.models import StipentStudentFile
from lms.models import DiscountType
from lms.models import DormitoryBalance
from lms.models import DormitoryRoom
from lms.models import DormitoryRoomType
from lms.models import DormitoryStudent
from lms.models import SignaturePeoples
from lms.models import Schools
from lms.models import Season
from lms.models import CalculatedGpaOfDiploma
from lms.models import LearningPlan
from lms.models import StudentViz
from lms.models import StudentCorrespondScore
from lms.models import StudentCorrespondLessons
from lms.models import AttachmentConfig, StudentMedal, MedalType

from surgalt.serializers import ProfessionDefinitionSerializer

from settings.serializers import LearningListSerializer
from settings.serializers import ProfessionalDegreeListSerializer
from settings.serializers import LearningListSerializer
from core.serializers import TeacherListSerializer
from core.serializers import DepartmentRegisterSerailizer
from settings.serializers import AdmissionLessonListSerializer
from core.serializers import CountryListSerializer
from core.serializers import AimaghotListSerializer
from core.serializers import SumDuuregListSerializer
from core.serializers import BagHorooListSerializer
# from surgalt.serializers import LessonStandartSerialzier
from surgalt.serializers import SeasonSerializer

from main.utils.file import split_root_path

from main.utils.function.utils import get_fullName
from main.utils.function.utils import fix_format_date
from main.utils.function.utils import json_load
from main.utils.function.utils import get_active_year_season
from main.utils.function.utils import get_fullName, start_time, end_time, str2bool


# ------------------- Оюутан бүртгэл -----------------

# Оюутан бүртгэл
class StudentRegisterSerializer(serializers.ModelSerializer):
    image = serializers.ImageField(default='')
    department_name = serializers.CharField(source='department.name', default='')
    group_name = serializers.CharField(source='group.name', default='')

    class Meta:
        model = Student
        fields = "__all__"


#Оюутны бүртгэлийн хэлбэр
class StudentRegisterInfoSerializer(serializers.ModelSerializer):
    image = serializers.ImageField(default='')

    class Meta:
        model = StudentRegister
        fields = "__all__"


class GroupInfoSerializer(serializers.ModelSerializer):
    profession = ProfessionDefinitionSerializer(many=False)
    class Meta:
        model = Group
        fields = "id", "name", 'profession'


# Бүртгэлийн байдал
class StatusSerializer(serializers.ModelSerializer):

    class Meta:
        model = StudentRegister
        fields = "name"


# Тэнхимээр
class DepartmentsSerializer(serializers.ModelSerializer):

    class Meta:
        model = Salbars
        exclude = "created_at", "updated_at"


# Анги жагсаалт
class GroupListSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()

    class Meta:
        model = Group
        fields = "id", 'name', 'join_year'

    def get_name(self,obj):
        name = obj.name
        year = obj.join_year

        #элссэн он дамжааны нэрийг нийлүүлсэн
        return_name = name + ' ('+ year[0:4] + ')'

        return return_name

# Харьяалал
class CountrySerializer(serializers.ModelSerializer):
    class Meta:
        model = Country
        exclude = "created_at", "updated_at"


class GroupListSerializerWithProfessional(serializers.ModelSerializer):
    """ Ангийн бүртгэл лист
    """
    profession = ProfessionDefinitionSerializer(many=False, read_only=True)
    degree = ProfessionalDegreeListSerializer(many=False)

    class Meta:
        model = Group
        fields = "id", 'name', 'profession', 'degree', 'join_year', 'level'


class StudentInfoSerializer(serializers.ModelSerializer):
    group = GroupListSerializer(many=False, read_only=True)
    citizenship = CountryListSerializer(many=False, read_only=True)
    unit1 = AimaghotListSerializer(many=False, read_only=True)
    unit2 = SumDuuregListSerializer(many=False, read_only=True)
    status = StudentRegisterInfoSerializer(read_only=True)
    department = DepartmentRegisterSerailizer(many=False, read_only=True)

    class Meta:
        model = Student
        exclude = "created_at", "updated_at"


class StudentInfoPageSerializer(serializers.ModelSerializer):

    group = GroupListSerializer(many=False, read_only=True)
    department = DepartmentRegisterSerailizer(many=False, read_only=True)
    gender = serializers.CharField(source='get_gender_display')

    class Meta:
        model = Student
        exclude = "created_at", "updated_at"


# Оюутан бүртгэлын жагсаалт
class StudentRegisterListSerializer(serializers.ModelSerializer):

    department_name = serializers.CharField(source='department.name', default='')
    status_name = serializers.CharField(source='status.name', default='')
    group_name = serializers.CharField(source='group.name', default='')
    group_level = serializers.CharField(source='group.level', default='')
    profession_name = serializers.CharField(source='group.profession.name', default='')
    school_name = serializers.CharField(source='group.school.name', default='')
    title = serializers.SerializerMethodField()
    correspondlessons = serializers.SerializerMethodField()
    corres_id = serializers.SerializerMethodField()
    is_payed = serializers.SerializerMethodField()


    class Meta:
        model = Student
        fields = "id", 'code', 'first_name', 'last_name', 'register_num', 'department_name', 'group_name', 'status_name', 'profession_name', 'title', 'group_level', 'phone', 'group', 'school_name', 'correspondlessons', 'corres_id', 'is_active', 'is_payed'

    def get_corres_id(self,obj):

        corres = StudentCorrespondScore.objects.filter(student=obj).first()

        return corres.id if corres else ''

    def get_title(self, obj):
        graduate = GraduationWork.objects.filter(student=obj.id).first()

        return graduate.diplom_topic if graduate else ''

    def get_correspondlessons(self, obj):

        qs_lesson = []
        year, season = get_active_year_season()

        corresp = StudentCorrespondScore.objects.filter(lesson_year=year.strip(), lesson_season=season, student=obj).first()
        if corresp:
            qs_lesson = StudentCorrespondLessons.objects.all().annotate(
                my_season=Cast('season', PositiveIntegerField())
            ).order_by('my_season').filter(correspond=corresp.id).values()

        return list(qs_lesson)

    def get_is_payed(self, obj):

        is_payed = Payment.objects.filter(student=obj,dedication=Payment.SYSTEM, status=True).first()

        return True if is_payed else False


class StudentDownloadSerializer(serializers.ModelSerializer):
    """ Excel download """

    department_name = serializers.CharField(source='department.name', default='')
    status_name = serializers.CharField(source='status.name', default='')
    group_name = serializers.CharField(source='group.name', default='')
    group_level = serializers.CharField(source='group.level', default='')
    profession_name = serializers.CharField(source='group.profession.name', default='')
    school_name = serializers.CharField(source='group.school.name', default='')
    degree_name = serializers.CharField(source='group.degree.degree_name', default='')
    join_year = serializers.CharField(source='group.join_year')
    dep_name= serializers.CharField(source='group.profession.dep_name')
    profession_code= serializers.CharField(source='group.profession.code')
    learning_status=serializers.CharField(source='group.learning_status.learn_name', default='')
    full_name = serializers.SerializerMethodField(read_only=True)
    deplom_num = serializers.SerializerMethodField()
    lesson_year = serializers.SerializerMethodField()
    graduation_number = serializers.SerializerMethodField()
    registration_num = serializers.SerializerMethodField()
    total_kr = serializers.SerializerMethodField()
    total_gpa = serializers.SerializerMethodField()
    graduate_year = serializers.SerializerMethodField()
    give_date = serializers.SerializerMethodField()

    class Meta:
        model = Student
        fields = '__all__'

    def get_full_name(self, obj):

        first_name = obj.first_name
        last_name = obj.last_name
        full_name = get_fullName(last_name, first_name, is_dot=False)

        return full_name

    def get_deplom_num(self, obj):

        graduate = GraduationWork.objects.filter(student=obj.id).first()
        return graduate.diplom_num if  graduate else ''

    def get_graduation_number(self, obj):

        graduate = GraduationWork.objects.filter(student=obj.id).first()
        return graduate.graduation_number if  graduate else ''

    def get_lesson_year(self, obj):

        graduate = GraduationWork.objects.filter(student=obj.id).first()
        return graduate.lesson_year if  graduate else ''

    def get_registration_num(self, obj):

        graduate = GraduationWork.objects.filter(student=obj.id).first()
        return graduate.registration_num if  graduate else ''

    def get_total_kr(self, obj):

        # Төгсөлтийн ажлын голч оноог татах гэж байгаа бол
        scoreRegister  = CalculatedGpaOfDiploma.objects.filter(student=obj).aggregate(max_kredit=Sum('kredit'))
        # else: # Үзсэн бүх хичээлийн кредит
        #     scoreRegister = ScoreRegister.objects.filter(student=stud_id).aggregate(max_kredit=Sum('lesson__kredit'))

        return scoreRegister.get('max_kredit')

    def get_total_gpa(self, obj):

        final_gpa = 0
        all_kredit = 0
        all_s_kredit = 0
        all_gpa = 0
        final_score = '0.0'

        scoreRegister = CalculatedGpaOfDiploma.objects.filter(student=obj)

        for lesson_score in scoreRegister:
            # Бүх голч нэмэх
            if not lesson_score.grade_letter:
                all_gpa = all_gpa + (lesson_score.gpa * lesson_score.kredit)

            # Бүх нийт кредит нэмэх
            all_kredit = all_kredit + lesson_score.kredit
            if lesson_score.grade_letter:
                all_s_kredit = all_s_kredit + lesson_score.kredit

            # Дундаж оноо
            # Нийт кредитээс S үнэлгээ буюу тооцов үнэлгээг хасаж голч бодогдоно
            estimate_kredit = all_kredit - all_s_kredit

            if all_gpa != 0:
                final_gpa = all_gpa / estimate_kredit

                final_score = format(final_gpa, ".1f")

        return final_score

    def get_give_date (self, obj):

        olgoson_ognoo = AttachmentConfig.objects.filter(group=obj.group).first()
        return olgoson_ognoo.give_date if olgoson_ognoo else ''

    def get_graduate_year(self,obj):

        graduate_year = GraduationWork.objects.filter(student=obj).annotate(grad_year=ExtractYear('decision_date')).first()
        return graduate_year.grad_year if  graduate_year else ''

# ----------------Оюутны шилжилт хөдөлгөөн -------------------

class StudentMovementSerializer(serializers.ModelSerializer):

    class Meta:
        model = StudentMovement
        fields = "__all__"


class StudentMovementListSerializer(serializers.ModelSerializer):
    ''' Оюутны шилжилт хөдөлгөөн жагсаалт '''

    student = StudentRegisterListSerializer(many=False)
    student_new = StudentRegisterListSerializer(many=False)
    school_name = serializers.CharField(source='destination_school.name', default='')
    school_dep = serializers.SerializerMethodField()
    full_name = serializers.SerializerMethodField()
    last_name = serializers.CharField(source='student.last_name', default='')
    corres_type = serializers.SerializerMethodField()
    is_solved = serializers.SerializerMethodField()
    correspond_type = serializers.SerializerMethodField()

    group = GroupInfoSerializer(many=False)
    pro_name = serializers.CharField(source='group.profession.name', default='')

    class Meta:
        model = StudentMovement
        fields = "__all__"

    def get_school_dep(self, obj):

        if obj.group:
            school_name = obj.group.school.name
            school_id = obj.group.school.id
            pro_name = obj.group.profession.name
            pro_id = obj.group.profession.id
            dep_name = obj.group.department.name
            dep_id = obj.group.department.id
            group_name = obj.group.name
            group_id = obj.group.id

            school_data = {
                "school": school_name,
                "school_id": school_id,
                "pro_name": pro_name,
                "pro_id": pro_id,
                "dep": dep_name,
                "dep_id": dep_id,
                "group": group_name,
                "group_id": group_id
            }
            return school_data

        return None


    def get_is_solved(self, obj):

        name = 1
        year, season = get_active_year_season()
        correspond = StudentCorrespondScore.objects.filter(student=obj.student.id, lesson_year=year.strip(), lesson_season=season).first()
        if correspond:
            name = correspond.is_solved

        return name

    def get_corres_type(self, obj):

        name = ''
        year, season = get_active_year_season()
        correspond = StudentCorrespondScore.objects.filter(student=obj.student.id, lesson_year=year.strip(), lesson_season=season).first()
        if correspond:
            name = correspond.get_is_solved_display()

        return name


    def get_full_name(self, obj):

        full_name = obj.student.full_name()
        code = obj.student.code

        code_name = code + " " + full_name

        return code_name

    def correspond_type(self, obj):
        "Дүйцүүлэлтийн төрөл"

        data = {}
        corr_obj = StudentCorrespondScore.objects.filter(student=obj.student.id).first()
        typeId = corr_obj.correspond_type

        lesson_is_allow = StudentCorrespondLessons.objects.filter(correspond=corr_obj).first().is_allow
        data ={
            'typeId':typeId,
            'is_allow':lesson_is_allow
        }
        return data


# --------------------- Ангийн бүртгэл ----------------------

class StudentGroupRegisterSerailizer(serializers.ModelSerializer):

    class Meta:
        model = Group
        fields = "__all__"


class StudentGroupRegisterListSerailizer(serializers.ModelSerializer):

    profession = ProfessionDefinitionSerializer(many=False)
    learning_status = LearningListSerializer(many=False)
    degree = ProfessionalDegreeListSerializer(many=False)
    teacher = TeacherListSerializer(many=False)
    department = DepartmentRegisterSerailizer(many=False)
    students = serializers.SerializerMethodField()
    year = serializers.SerializerMethodField()

    class Meta:
        model = Group
        fields = "__all__"

    def get_students(self, obj):
        all_data = Student.objects.filter(group=obj).values()

        return list(all_data)

    def get_year(self,obj):
        year = obj.join_year

        return  year[0:4]
# --------------------------------------- Оюутны гэр бүлийн байдал ----------------------------------------------

class StudentFamilySerializer(serializers.ModelSerializer):
    """ Оюутны гэр бүлийн байдал """

    class Meta:
        model = StudentFamily
        fields = '__all__'


# --------------------------------------- Оюутны боловсрол ----------------------------------------------

class StudentEducationListSerializer(serializers.ModelSerializer):
    """ Оюутны боловсролын мэдээлэл """

    country = CountryListSerializer(many=False, read_only=True)

    class Meta:
        model = StudentEducation
        fields = '__all__'

class StudentEducationSerializer(serializers.ModelSerializer):
    """ Оюутны боловсролын мэдээлэл """

    class Meta:
        model = StudentEducation
        fields = '__all__'


# --------------------------------------- Оюутны хаягийн ----------------------------------------------

class StudentAddressListSerializer(serializers.ModelSerializer):
    """ Оюутны хаягийн жагсаалт мэдээлэл """

    passport_unit1 = AimaghotListSerializer(many=False, read_only=True)
    passport_unit2 = SumDuuregListSerializer(many=False, read_only=True)
    passport_unit3 = BagHorooListSerializer(many=False, read_only=True)
    lived_unit1 = AimaghotListSerializer(many=False, read_only=True)
    lived_unit2 = SumDuuregListSerializer(many=False, read_only=True)
    lived_unit3 = BagHorooListSerializer(many=False, read_only=True)

    class Meta:
        model = StudentAddress
        fields = '__all__'


class StudentAddressSerializer(serializers.ModelSerializer):

    class Meta:
        model = StudentAddress
        fields = '__all__'


class StudentMedalSerializer(serializers.ModelSerializer):

    class Meta:
        model = StudentMedal
        fields = '__all__'


class MedalTypeSerializer(serializers.ModelSerializer):
    new_image = serializers.SerializerMethodField()
    is_checked = serializers.SerializerMethodField()

    class Meta:
        model = MedalType
        fields = "__all__"

    def get_new_image(self, obj):
        if obj.image:
            return base64.b64encode(obj.image).decode('utf-8')
        return None

    def get_is_checked(self, obj):
        student = self.context.get('student')
        is_checked = StudentMedal.objects.filter(student=student, medals__overlap=[obj.id]).exists()

        return is_checked


class StudentAdmissionScoreListSerializer(serializers.ModelSerializer):

    admission_lesson = AdmissionLessonListSerializer(many=False, read_only=True)

    class Meta:
        model = StudentAdmissionScore
        fields = '__all__'


class StudentAdmissionScoreSerializer(serializers.ModelSerializer):

    class Meta:
        model = StudentAdmissionScore
        fields = '__all__'


class StudentListSerializer(serializers.ModelSerializer):

    full_name = serializers.SerializerMethodField(read_only=True)
    group = GroupListSerializerWithProfessional(many=False, read_only=True)
    citizenship = CountryListSerializer(many=False, read_only=True)
    school_name = serializers.CharField(source='group.school.name', default='')
    school_name_uig = serializers.CharField(source='group.school.name_uig', default='')
    school_name_eng = serializers.CharField(source='group.school.name_eng', default='')
    graduation_work = serializers.SerializerMethodField()

    class Meta:
        model = Student
        fields = ["id", 'code', 'first_name', 'last_name', 'register_num', 'full_name', 'group', 'citizenship', 'last_name_eng', 'first_name_eng', 'last_name_uig', 'first_name_uig', 'school_name', 'school_name_uig', 'school_name_eng', 'eysh_score', 'secondary_school', 'graduation_work' ]

    def get_full_name(self, obj):
        first_name = obj.first_name
        last_name = obj.last_name
        full_name = get_fullName(last_name, first_name, is_strim_first=True)

        full_name = obj.code + " " + full_name + " " + obj.register_num

        return full_name

    def get_graduation_work(self, obj):

        data = dict()
        if GraduationWork.objects.filter(student=obj).exists():
            data = GraduationWorkSerializer(GraduationWork.objects.get(student=obj)).data
        return data

class StudentSimpleListSerializer(serializers.ModelSerializer):

    full_name = serializers.SerializerMethodField(read_only=True)
    class Meta:
        model = Student
        fields = ["id", 'code', 'first_name', 'last_name', 'register_num', 'full_name' ]

    def get_full_name(self, obj):
        first_name = obj.first_name
        last_name = obj.last_name
        full_name = get_fullName(last_name, first_name, is_strim_first=True)

        full_name = obj.code + " " + full_name + " " + obj.register_num

        return full_name
class StudentListWithGroupSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField(read_only=True)
    class Meta:
        model = Student
        fields = ["id", 'code', 'first_name', 'last_name', 'register_num', 'group', 'full_name' ]

    def get_full_name(self, obj):
        first_name = obj.first_name
        last_name = obj.last_name
        full_name = get_fullName(last_name, first_name, is_strim_first=True)

        full_name = obj.code + " " + full_name + " " + obj.register_num

        return full_name

# төгсөлтын ажлын жагсаалт
class GraduationWorkStudentListSerializer(serializers.ModelSerializer):
    student = StudentListSerializer()

    class Meta:
        model = GraduationWork
        fields = "__all__"


# --------------------------------------- Оюутны чөлөөний бүртгэл  ----------------------------------------------
class StudentLeaveSerializer(serializers.ModelSerializer):

    class Meta:
        model = StudentLeave
        fields = '__all__'

# чөлөөний бүртгэл жагсаалт
class StudentLeaveListSerailizer(serializers.ModelSerializer):
    student = StudentListSerializer(many=False)
    lesson_season = SeasonSerializer(many=False)
    register_status = StudentRegisterInfoSerializer(many=False)

    class Meta:
        model = StudentLeave
        fields = "id", "student", "lesson_year", "lesson_season", "register_status", "learn_week", "description", "statement", "statement_date", "school"


# --------------------- Төгсөлтийн ажил -------------
class GraduationWorkSerializer(serializers.ModelSerializer):

    class Meta:
        model = GraduationWork
        fields = "__all__"


# Төгсөлтийн ажил жагсаалт
class GraduationWorkListSerailizer(serializers.ModelSerializer):
    student = StudentListSerializer(many=False)
    lesson_season = SeasonSerializer(many=False)
    lesson = serializers.SerializerMethodField()

    class Meta:
        model = GraduationWork
        fields = "__all__"

    def get_lesson(self, obj):

        data = list()
        lessons = obj.lesson.all().order_by('id')

        for lesson in lessons:
            les_data = LessonStandartSerializer(lesson, many=False).data
            data.append(les_data)

        return data


# --------------------- Боловсролын зээлийн сан -------------

# ЭЕШ-ын онооны жагсаалт
class StudentAdmissionScoreListSerializer(serializers.ModelSerializer):
    admission_lesson = AdmissionLessonListSerializer(many=False)

    class Meta:
        model = StudentAdmissionScore
        fields = ["id","student", "confirmation_num", "admission_lesson","score", "perform","exam_year","exam_location"]


# Боловсролын зээлийн сан жагсаалт
class EducationalLoanFundListSerializer(serializers.ModelSerializer):
    score = serializers.SerializerMethodField()
    score_code = serializers.SerializerMethodField()
    degree_code = serializers.SerializerMethodField()
    is_finish = serializers.SerializerMethodField()

    class Meta:
        model = Student
        fields = ["last_name", "first_name", "register_num","score","score_code", "degree_code", "is_finish"]

    def get_score(self, obj):
        "эеш-ын онооны жагсаалт"

        stud_id = obj.id
        score = StudentAdmissionScore.objects.filter(student=stud_id).aggregate(scores=Avg("score"))
        return score

    def get_degree_code(self, obj):
        "боловсролын зэрэг"

        group = obj.group
        degree_obj = ProfessionalDegree.objects.filter(group=group).first()
        stud_degrees = degree_obj.degree_name
        return stud_degrees

    def get_is_finish(self, obj):
        " төгссөн эсэх "

        student = obj.id
        group_finish = Group.objects.filter(student=student).first()
        finish = group_finish.is_finish
        return finish

    def get_score_code(self, obj):
        # Голч дүнгийн жагсаалт

        score_assesment = ''
        final_gpa = 0
        stud_id = obj.id
        scoreRegister = ScoreRegister.objects.filter(student=stud_id) \
                                    .values(
                                        "id",
                                        "teach_score",
                                        "exam_score",
                                        "lesson__kredit"
                                    )
        max_kredit = 0
        all_score = 0
        for scoreData in scoreRegister:
            total_score = 0
            if scoreData['teach_score']:
                total_score = scoreData['teach_score']
            if scoreData['exam_score']:
                total_score = total_score + scoreData['exam_score']
            if scoreData['lesson__kredit']:
                all_score = all_score + total_score * scoreData['lesson__kredit']
                max_kredit = max_kredit + scoreData['lesson__kredit']

        if all_score > 0:
            if max_kredit != 0:
                final_gpa = round((all_score / max_kredit), 2)
                score_qs = Score.objects.filter(score_max__gte=final_gpa, score_min__lte=final_gpa).first()
                if score_qs:
                    score_assesment = score_qs.gpa
        return score_assesment


class TeacherSerializer(serializers.ModelSerializer):

    class Meta:
        model = Teachers
        fields = ["full_name"]


class RoomSerializer(serializers.ModelSerializer):

    class Meta:
        model = Room
        exclude = ["created_at", "updated_at"]


class LessonStandartSerializer(serializers.ModelSerializer):

    class Meta:
        model = LessonStandart
        fields = ["id", "name", "code", "kredit", "category", "knowledge", "skill", "name_eng", "name_uig"]


class SchoolSerializer(serializers.ModelSerializer):

    class Meta:
        model = SubOrgs
        fields = '__all__'


class LessonScheduleSerializer(serializers.ModelSerializer):
    teacher = TeacherSerializer(many=False)
    room = RoomSerializer(many=False)
    event_id = serializers.CharField(source='id', default='')
    lesson = LessonStandartSerializer(many=False)
    school = SchoolSerializer(many=False)
    type = serializers.SerializerMethodField()

    class Meta:
        model = TimeTable
        fields = "__all__"

    def get_type(self, obj):
        type_name = obj.get_type_display()
        return type_name


class PaymentBalanceSerializer(serializers.ModelSerializer):
    """ Төлбөрийн бүх гүйлгээ """

    class Meta:
        model = PaymentBalance
        fields = 'balance_date', 'balance_amount'


class PaymentEstimateSerializer(serializers.ModelSerializer):
    season_name = serializers.CharField(source='lesson_season.season_name', default='')
    balance_iluu = serializers.SerializerMethodField(read_only=True)
    balance_dutuu = serializers.SerializerMethodField(read_only=True)
    balance_detail = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = PaymentEstimate
        fields = '__all__'

    def get_balance_iluu(self, obj):
        balance_iluu = 0
        last_balance = obj.last_balance

        if last_balance > 0:
            balance_iluu = last_balance

        return balance_iluu

    def get_balance_dutuu(self, obj):
        balance_dutuu = 0
        last_balance = obj.last_balance

        if last_balance < 0:
            balance_dutuu = last_balance

        return balance_dutuu

    def get_balance_detail(self, obj):

        lesson_year = obj.lesson_year
        lesson_season = obj.lesson_season

        queryset = PaymentBalance.objects.filter(lesson_year=lesson_year, lesson_season=lesson_season, student=obj.student).order_by('lesson_year', 'lesson_season')
        paymentBalanceData = PaymentBalanceSerializer(queryset, many=True).data

        return paymentBalanceData


class StipendTypeSerializer(serializers.ModelSerializer):

    class Meta:
        model = DiscountType
        fields = "code", "name"


class StipendListSerializer(serializers.ModelSerializer):
    ''' Идэвхитэй тэтгэлэгийн жагсаалт '''

    stipend_type = StipendTypeSerializer(many=False)

    class Meta:
        model = Stipend
        fields = "id", "stipend_type", "lesson_year", "lesson_season",  "start_date", "finish_date", "is_open"


class StipentStudentSerializer(serializers.ModelSerializer):
    ''' Тэтгэлэгт хамрагдах оюутны бүртгэл '''

    stipent = StipendListSerializer(many=False)
    check_stipend = serializers.SerializerMethodField()
    files = serializers.SerializerMethodField(read_only=True)
    created_at = serializers.SerializerMethodField()

    class Meta:
        model = StipentStudent
        fields = "__all__"

    def get_created_at(self, obj):

        fixed_date = fix_format_date(obj.created_at)
        return fixed_date

    def get_check_stipend(self, obj):
        " Тэтгэлэгийн хугацаа дууссан эсэх "

        stipent_id = obj.stipent.id
        now_date = date.today()

        check_stipend = True

        qs = Stipend.objects.filter(
            id=stipent_id,
            start_date__lte=now_date,
            finish_date__gte=now_date,
            is_open=True
        )

        if not qs:
            check_stipend = False

        return check_stipend

    def get_files(self, obj):

        id = obj.id
        files = []

        if settings.DEBUG:
            base_url = 'http://localhost:8000/files/'
        else:
            # TODO: domain
            base_url = 'http://student.utilitysolution.mn/files/'

        qs_list = StipentStudentFile.objects.filter(request=id)

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


# Өрөөний дугаар
class DormitoryRoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = DormitoryRoom
        fields = ["id", "room_number", "room_type", "gender", "gateway", "floor", "door_number"]


# Хүсэлт гаргах өрөөний төрөл
class DormitoryRoomTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = DormitoryRoomType
        fields = 'id', "name", "volume"


# Дотуур байранд амьдрах хүсэлт гаргасан оюутны жагасаалт
class DormitoryStudentListSerializer(serializers.ModelSerializer):
    room = DormitoryRoomSerializer(many=False)
    room_type = DormitoryRoomTypeSerializer(many=False)
    solved_flag_name = serializers.SerializerMethodField()
    is_payment = serializers.SerializerMethodField()

    class Meta:
        model = DormitoryStudent
        exclude = ["created_at", "updated_at"]

    def get_solved_flag_name(self, obj):
        " Шийдвэрийн төрөл "

        solved_flag_name = obj.get_solved_flag_display()

        return solved_flag_name

    def get_is_payment(self, obj):
        ''' Төлбөр төлөгдсөн эсэх'''

        student_id = obj.student
        lesson_year = obj.lesson_year
        is_payment = False

        check_payment = DormitoryBalance.objects.filter(student=student_id, lesson_year=lesson_year)

        if check_payment:
            is_payment = True

        return is_payment


class SignaturePeoplesSerializer(serializers.ModelSerializer):

    class Meta:
        model = SignaturePeoples
        fields = "__all__"


class BigSchoolsSerializer(serializers.ModelSerializer):

    logo_url = serializers.SerializerMethodField()

    class Meta:
        model = Schools
        fields = "__all__"

    def get_logo_url(self, obj):
        ''' Лого
        '''

        return str(obj.logo)


class StudentDefinitionSerializer(serializers.ModelSerializer):

    group = StudentGroupRegisterListSerailizer(many=False, read_only=True)
    status = StudentRegisterInfoSerializer(read_only=True)
    department = DepartmentRegisterSerailizer(many=False, read_only=True)

    score_code = serializers.SerializerMethodField()
    graduation_work = serializers.SerializerMethodField()
    profession_name = serializers.SerializerMethodField()

    class Meta:
        model = Student
        fields = "__all__"

    def get_profession_name(self, obj):
        profession_name = obj.group.profession.name
        split_name = profession_name

        if '/' in profession_name:
            split_name = profession_name.split('/')[0]

        if '(' in profession_name:
            split_name = profession_name.split('(')[0]

        return split_name

    def get_score_code(self, obj):
        # Голч дүнгийн жагсаалт

        score_assesment = ''
        final_gpa = 0
        stud_id = obj.id
        scoreRegister = ScoreRegister.objects.filter(student=stud_id) \
            .values(
                "id",
                "teach_score",
                "exam_score",
                "lesson__kredit"
            )
        max_kredit = 0
        all_score = 0
        count = 0
        for scoreData in scoreRegister:
            total_score = 0
            if scoreData['teach_score']:
                total_score = scoreData['teach_score']
            if scoreData['exam_score']:
                total_score = total_score + scoreData['exam_score']
            if scoreData['lesson__kredit']:
                all_score = all_score + total_score * scoreData['lesson__kredit']
                max_kredit = max_kredit + scoreData['lesson__kredit']
                count = count + 1

        if all_score > 0:
            if max_kredit != 0:
                final_gpa = round((all_score / max_kredit), 2)
                score_qs = Score.objects.filter(score_max__gte=final_gpa, score_min__lte=final_gpa).first()
                if score_qs:
                    score_assesment = score_qs.gpa
        return { 'score_code': score_assesment, 'max_kredit': max_kredit }

    def get_graduation_work(self, obj):

        data = dict()

        if obj.status.code == 5:
            data = GraduationWorkSerializer(GraduationWork.objects.get(student=obj)).data

        return data


class ScoreRegisterDefinitionSerializer(serializers.ModelSerializer):

    lesson = LessonStandartSerializer(many=False, read_only=True)

    assessment = serializers.SerializerMethodField()
    gpa = serializers.SerializerMethodField()
    lesson_season = SeasonSerializer(many=False)

    class Meta:
        model = ScoreRegister
        fields = "__all__"

    def get_assessment(self, obj):

        total_score = round(obj.score_total, 2)
        assessment = Score.objects.filter(score_max__gte=total_score, score_min__lte=total_score).first()

        return assessment.assesment if assessment else ''

    def get_gpa(self, obj):

        total_score = round(obj.score_total, 2)
        assessment = Score.objects.filter(score_max__gte=total_score, score_min__lte=total_score).first()

        return assessment.gpa if assessment else ''


class ScoreRegisterSerializer(serializers.ModelSerializer):

    class Meta:
        model = ScoreRegister
        fields = "__all__"


class SeasonSerializer(serializers.ModelSerializer):

    class Meta:
        model = Season
        exclude = "created_at", "updated_at"


class CalculatedGpaOfDiplomaSerializer(serializers.ModelSerializer):

    class Meta:
        model = CalculatedGpaOfDiploma
        exclude = "created_at", "updated_at"


class GraduationWorkPrintSerailizer(serializers.ModelSerializer):

    lesson = serializers.SerializerMethodField()

    class Meta:
        model = GraduationWork
        fields = "__all__"

    def get_lesson(self, obj):

        data = list()
        lessons = obj.lesson.all()

        for lesson in lessons:

            les_data = LessonStandartSerializer(lesson, many=False).data

            score_reg_qs = ScoreRegister.objects.filter(student=obj.student, lesson=lesson).last()
            if score_reg_qs:
                score_reg_data = ScoreRegisterDefinitionSerializer(score_reg_qs, many=False).data
                les_data['score_register'] = score_reg_data
            else:
                les_data['score_register'] = None

            data.append(les_data)

        return data


class StudentAttachmentSerializer(serializers.ModelSerializer):

    group = StudentGroupRegisterListSerailizer(many=False, read_only=True)
    status = StudentRegisterInfoSerializer(read_only=True)
    department = DepartmentRegisterSerailizer(many=False, read_only=True)
    citizenship = CountrySerializer(many=False, read_only=True)

    score_code = serializers.SerializerMethodField(read_only=True)
    graduation_work = serializers.SerializerMethodField(read_only=True)
    full_name = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Student
        fields = "__all__"

    def get_full_name(self, obj):
        return obj.code + " " + obj.full_name()

    def get_graduation_work(self, obj):

        data = dict()
        data = GraduationWorkSerializer(GraduationWork.objects.get(student__id=obj.id)).data

        return data

    def get_score_code(self, obj):
        # Голч дүнгийн жагсаалт

        score_assesment = ''
        final_gpa = 0
        stud_id = obj.id
        scoreRegister = ScoreRegister.objects.filter(student=stud_id) \
            .values(
                "id",
                "teach_score",
                "exam_score",
                "lesson__kredit"
            )
        max_kredit = 0
        all_score = 0
        count = 0
        for scoreData in scoreRegister:
            total_score = 0
            if scoreData['teach_score']:
                total_score = scoreData['teach_score']
            if scoreData['exam_score']:
                total_score = total_score + scoreData['exam_score']
            if scoreData['lesson__kredit']:
                all_score = all_score + total_score * scoreData['lesson__kredit']
                max_kredit = max_kredit + scoreData['lesson__kredit']
                count = count + 1

        if all_score > 0:
            if max_kredit != 0:
                final_gpa = round((all_score / max_kredit), 2)
                score_qs = Score.objects.filter(score_max__gte=final_gpa, score_min__lte=final_gpa).first()
                if score_qs:
                    score_assesment = score_qs.gpa
        return { 'score_code': score_assesment, 'max_kredit': max_kredit }


class CalculatedGpaOfDiplomaPrintSerializer(serializers.ModelSerializer):

    lesson = serializers.SerializerMethodField()

    class Meta:
        model = CalculatedGpaOfDiploma
        exclude = "created_at", "updated_at"

    def get_lesson(self, obj):

        all_data = dict()

        student_prof_qs = self.context['student_prof_qs']

        lesson_first_data = obj.lesson

        lesson = LessonStandartSerializer(lesson_first_data, many=False).data

        learning_plan_qs = LearningPlan.objects.filter(lesson=lesson_first_data, profession=student_prof_qs).first()

        if learning_plan_qs:
            learningplan_season = learning_plan_qs.season

            if learningplan_season:
                learningplan_season = json_load(learningplan_season)
                if isinstance(learningplan_season, list) and len(learningplan_season) > 0:
                    learningplan_season = learningplan_season[0]

            all_data['lesson_level'] = learning_plan_qs.lesson_level
            all_data['lesson_type'] = learning_plan_qs.lesson_type
            all_data['season'] = int(learningplan_season) if learningplan_season else 13
        else:
            all_data['lesson_level'] = 9
            all_data['lesson_type'] = 9
            all_data['season'] = 13

        all_data['lesson'] = lesson

        return all_data

class StudentListsSerializer(serializers.ModelSerializer):
    group = GroupListSerializerWithProfessional(many=False, read_only=True)

    class Meta:
        model= Student
        fields= "__all__"

# Гадаад оюутны виз жагсаалт
class StudentVizListSerializer(serializers.ModelSerializer):
    student = StudentListsSerializer(many=False)

    class Meta:
        model = StudentViz
        fields = "__all__"

# Гадаад оюутны виз
class StudentVizSerializer(serializers.ModelSerializer):

    class Meta:
        model = StudentViz
        fields = "__all__"


class StudentDefinitionListLiteSerializer(serializers.ModelSerializer):

    group_name = serializers.CharField(source='group.name', default='')
    degree_name = serializers.CharField(source="group.degree.degree_name", default='')
    status_name = serializers.CharField(source="status.name", default='')
    status_code = serializers.IntegerField(source="status.code", default=None)
    profession_name = serializers.SerializerMethodField()
    profession_eng_name = serializers.CharField(source="group.profession.name_eng", default='')
    group_level = serializers.CharField(source='group.level', default='')
    group_join_year = serializers.CharField(source='group.join_year', default='')
    graduation_work = serializers.SerializerMethodField()
    school_data = serializers.SerializerMethodField()


    class Meta:
        model = Student
        fields = "id", "code", "first_name", "last_name", "register_num", "group_name", "degree_name", "status_name", "profession_name", "group_level", "group_join_year", "graduation_work", "status_code", "school_data", 'profession_eng_name'

    def get_profession_name(self, obj):
        profession_name = obj.group.profession.name
        split_name = profession_name

        if '/' in profession_name:
            split_name = profession_name.split('/')[0]

        if '(' in profession_name:
            split_name = profession_name.split('(')[0]

        return split_name

    def get_graduation_work(self, obj):

        data = dict()

        if obj.status.code == 5:
            graduation_data = GraduationWork.objects.filter(student=obj).first()

            data["diplom_num"] = graduation_data.diplom_num if graduation_data.diplom_num else ""
            data["graduation_year"] = graduation_data.graduation_date if graduation_data.graduation_date else ""

        return data

    def get_school_data(self, obj):

        school_qs = SubOrgs.objects.filter(id=obj.school.id).first()
        school_data = SchoolSerializer(school_qs, many=False).data

        return school_data