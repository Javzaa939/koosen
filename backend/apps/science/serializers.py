from datetime import datetime

from django.db.models import F, Sum

from lms.models import (
    UserInvention,
    UserPaper,
    UserNote,
    UserPatent,
    UserProject,
    ProjectCategory,
    UserQuotation,
    QuotationCategory,
    UserSymbolCert,
    UserModelCertPatent,
    UserLicenseCert,
    UserRightCert,
    InventionCategory,
    PaperCategory,
    NoteCategory,
    GraduationWork,
    Student
)

from core.models import (
    Teachers,
    Employee,
    OrgPosition,
)

from core.serializers import (
    SubschoolSerailizer,
    TeacherNameSerializer
)

from student.serializers import (
    StudentRegisterListSerializer
)

from rest_framework import serializers
from main.utils.function.utils import get_active_year_season


# ----------------------------------------------------------------------Өгүүллийн ангилал-----------------------------------------------------------------------------------
class PaperCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = PaperCategory
        fields = "__all__"


#----------------------------------------------------------- Эрдэм шинжилгээний Өгүүлэлийн жагсаалт--------------------------------------------------------------------------

class UserTeacherPaperSerializer(serializers.ModelSerializer):
    category = PaperCategorySerializer()

    class Meta:
        model = UserPaper
        fields = "__all__"


class UserPaperSerializer(serializers.ModelSerializer):

    point = serializers.SerializerMethodField()
    datas = serializers.SerializerMethodField()
    full_name = serializers.SerializerMethodField()
    name = serializers.SerializerMethodField()

    class Meta:
        model = UserPaper
        fields = "full_name", 'point', 'datas', 'name'

    def get_full_name(self, obj):

        qs = Teachers.objects.filter(user=obj.user).first()

        qs_full_name = 0

        if qs:
            qs_full_name = qs.full_name

        return qs_full_name

    def get_point(self, obj):
        """ Багшийн нийт өгүүллийн оноог олно """

        sum_point = 0
        user_id = obj.user

        today = datetime.today()

        this_year = today.strftime("%Y")

        category_ids = UserPaper.objects.filter(user=user_id,  published_year=this_year).values_list('category', flat=True)
        point_list = PaperCategory.objects.filter(id__in=category_ids).values_list('point', flat=True)

        sum_point = sum(point_list)

        return sum_point

    def get_datas(self, obj):
        """ Нэг багшийн өгүүлэл """

        datas = []
        user_id = obj.user

        today = datetime.today()

        this_year = today.strftime("%Y")

        qs_userpaper = UserPaper.objects.filter(user=user_id, published_year=this_year)

        datas = UserTeacherPaperSerializer(qs_userpaper, many=True).data

        return datas

    def get_name(self, obj):

        qs = Employee.objects.filter(user=obj.user).first()
        qs = OrgPosition.objects.filter(pk=qs.org_position_id).first()

        qs_name = 0

        if qs:
            qs_name = qs.name

        return qs_name


 #--------------------------------------Эрдэм шинжилгээний илтгэл жагсаалт-------------------------------------------------------------------------------
class UserNoteListSerializer(serializers.ModelSerializer):

    country_name = serializers.CharField(source='country.name', default='')
    category_name = serializers.CharField(source='category.name', default='')
    class Meta:
        model = UserNote
        fields = "__all__"


class UserNoteSerializer(serializers.ModelSerializer):

    org_position_name = serializers.SerializerMethodField()
    full_name = serializers.SerializerMethodField()
    point = serializers.SerializerMethodField()
    datas = serializers.SerializerMethodField()

    class Meta:
        model = UserNote
        fields = "__all__"

    def get_org_position_name(self, obj):

        org_position_name = None

        qs = Employee.objects.filter(user=obj.user).first()

        if qs:
            org_position_name = qs.org_position.name

        return org_position_name

    def get_full_name(self, obj):

        full_name = 0

        qs = Teachers.objects.filter(user=obj.user).first()

        if qs:
            full_name = qs.full_name

        return full_name

    def get_point(seld, obj):
        sum_point = 0
        user_id = obj.user

        today = datetime.today()

        this_year = today.strftime("%Y")

        category_ids = UserNote.objects.filter(user=user_id,  meeting_date__year=this_year).values_list('category', flat=True)
        point_list = NoteCategory.objects.filter(id__in=category_ids).values_list('point', flat=True)

        sum_point = sum(point_list)

        return sum_point

    def get_datas(self, obj):
        user_id = obj.user

        today = datetime.today()

        this_year = today.strftime("%Y")

        qs_usernote = UserNote.objects.filter(user=user_id,  meeting_date__year=this_year)

        datas = UserNoteListSerializer(qs_usernote, many=True).data
        return datas


class UserNoteCategory(serializers.ModelSerializer):


    class Meta:
        model = NoteCategory
        fields = "__all__"


#--------------------------------------Эрдэм шинжилгээний бүтээлийн жагсаалт--------------------------------------
class UserInventionListSerializer(serializers.ModelSerializer):

    publishing_size_name = serializers.CharField(source="publishing_size.name")
    category_name = serializers.CharField(source="category.name")

    class Meta:
        model = UserInvention
        fields = "__all__"


class UserInventionSerializer(serializers.ModelSerializer):

    full_name = serializers.SerializerMethodField()
    org_position_name = serializers.SerializerMethodField()
    point = serializers.SerializerMethodField()
    datas = serializers.SerializerMethodField()

    class Meta:
        model = UserInvention
        fields = "id", 'full_name', 'org_position_name', 'point', 'datas'

    def get_org_position_name(self, obj):

        org_position_name = None

        qs = Employee.objects.filter(user=obj.user).first()

        if qs:
            org_position_name = qs.org_position.name

        return org_position_name

    def get_full_name(self, obj):

        full_name = 0

        qs = Teachers.objects.filter(user=obj.user).first()

        if qs:
            full_name = qs.full_name

        return full_name

    def get_point(self, obj):

        sum_point = 0
        user_id = obj.user

        today = datetime.today()

        this_year = today.strftime("%Y")

        category_ids = UserInvention.objects.filter(user=user_id,  published_year=this_year).values_list('category', flat=True)
        point_list = InventionCategory.objects.filter(id__in=category_ids).values_list('point', flat=True)

        sum_point = sum(point_list)

        return sum_point

    def get_datas(self, obj):

        user = obj.user
        today = datetime.today()

        this_year = today.strftime("%Y")

        qs_invention = UserInvention.objects.filter(user=user, published_year=this_year)
        datas = UserInventionListSerializer(qs_invention, many=True).data

        return datas

# ---------------------------------------Эрдэм шинжилгээ оюуны өмчийн бүтээл  жагсаалт------------------------------------------------------------------------


class UserPatentSerializer(serializers.ModelSerializer):
    org_position_name = serializers.SerializerMethodField()
    full_name = serializers.SerializerMethodField()
    register_code = serializers.SerializerMethodField()

    class Meta:
        model = UserPatent
        fields = "__all__"

    def get_org_position_name(self, obj):

        org_position_name = None

        qs = Employee.objects.filter(user=obj.user).first()

        if qs:
            org_position_name = qs.org_position.name

        return org_position_name

    def get_full_name(self, obj):

        full_name = 0

        qs = Teachers.objects.filter(user=obj.user).first()

        if qs:
            full_name = qs.full_name

        return full_name


    def get_register_code(self, obj):

        register_code = None

        qs = Employee.objects.filter(user=obj.user).first()

        if qs:
            register_code = qs.register_code

        return register_code


#--------------------------------------Эрдэм шинжилгээний төслийн жагсаалт--------------------------------------
class ProjectCategorySerializer(serializers.ModelSerializer):

    class Meta:
        model = ProjectCategory
        fields = '__all__'


class UserProjectListSerializer(serializers.ModelSerializer):
    category = ProjectCategorySerializer()
    school = SubschoolSerailizer()

    class Meta:
        model = UserProject
        fields = "__all__"

class UserProjectSerializer(serializers.ModelSerializer):

    full_name = serializers.SerializerMethodField()
    point = serializers.SerializerMethodField()
    org_position_name = serializers.SerializerMethodField()
    datas = serializers.SerializerMethodField()

    class Meta:
        model = UserProject
        fields = "id", "full_name", "point", "org_position_name", "datas"

    def get_org_position_name(self, obj):

        org_position_name = None

        qs = Employee.objects.filter(user=obj.user).first()

        if qs:
            org_position_name = qs.org_position.name

        return org_position_name

    def get_full_name(self, obj):

        full_name = 0

        qs = Teachers.objects.filter(user=obj.user).first()

        if qs:
            full_name = qs.full_name

        return full_name


    def get_point(self, obj):
        """ Багшийн нийт төслийн оноог олно """

        sum_point = 0
        user_id = obj.user

        today = datetime.today()

        this_year = today.strftime("%Y")

        category_ids = UserProject.objects.filter(user=user_id, start_date__year=this_year).values_list('category', flat=True)
        point_list = ProjectCategory.objects.filter(id__in=category_ids).values_list('point', flat=True)

        sum_point = sum(point_list)

        return sum_point

    def get_datas(self, obj):

        user = obj.user
        today = datetime.today()

        this_year = today.strftime("%Y")

        qs_projects = UserProject.objects.filter(user=user, start_date__year=this_year)

        datas = UserProjectListSerializer(qs_projects, many=True).data

        return datas


#--------------------------------------Эрдэм шинжилгээний Эшлэл жагсаалт--------------------------------------

class QuotationCategorySerializer(serializers.ModelSerializer):

    class Meta:
        model = QuotationCategory
        fields = '__all__'


class UserQuotationListSerializer(serializers.ModelSerializer):
    category = QuotationCategorySerializer()

    class Meta:
        model = UserQuotation
        fields = "__all__"

class UserQuotationSerializer(serializers.ModelSerializer):

    full_name = serializers.SerializerMethodField()
    org_position_name = serializers.SerializerMethodField()
    point = serializers.SerializerMethodField()
    datas = serializers.SerializerMethodField()

    class Meta:
        model = UserQuotation
        fields = "id", 'full_name', 'org_position_name', 'point', 'datas'


    def get_full_name(self, obj):

        full_name = 0

        qs = Teachers.objects.filter(user=obj.user).first()

        if qs:
            full_name = qs.full_name

        return full_name

    def get_org_position_name(self, obj):

        org_position_name = None

        qs = Employee.objects.filter(user=obj.user).first()

        if qs:
            org_position_name = qs.org_position.name if qs.org_position else ''

        return org_position_name

    def get_point(self, obj):
        """ Багшийн нийт эшлэл оноог олно """

        user_id = obj.user

        today = datetime.today()
        this_year = today.strftime("%Y")

        category_total = UserQuotation.objects.filter(user=user_id, quotation_year=this_year).annotate(total=F('quotation_number') * F('category__point')).aggregate(total_num=Sum('total'))

        return category_total.get('total_num') if category_total else 0

    def get_datas(self, obj):

        user = obj.user
        today = datetime.today()
        this_year = today.strftime("%Y")

        qs_quotation = UserQuotation.objects.filter(user=user, quotation_year=this_year)

        datas = UserQuotationListSerializer(qs_quotation, many=True).data

        return datas


# ---------------------------------------------Эрдэм шинжилгээний Барааны тэмдгийн гэрчилгээ-------------------------------------------------------------------
class UserSymbolCertSerializer(serializers.ModelSerializer):
    org_position_name = serializers.SerializerMethodField()
    full_name = serializers.SerializerMethodField()
    register_code = serializers.SerializerMethodField()

    class Meta:
        model = UserSymbolCert
        fields = "__all__"

    def get_org_position_name(self, obj):

        org_position_name = None

        qs = Employee.objects.filter(user=obj.user).first()

        if qs:
            org_position_name = qs.org_position.name

        return org_position_name

    def get_full_name(self, obj):

        full_name = 0

        qs = Teachers.objects.filter(user=obj.user).first()

        if qs:
            full_name = qs.full_name

        return full_name


    def get_register_code(self, obj):

        register_code = None

        qs = Employee.objects.filter(user=obj.user).first()

        if qs:
            register_code = qs.register_code

        return register_code


# ---------------------------------------------Эрдэм шинжилгээний Барааны тэмдгийн гэрчилгээ-------------------------------------------------------------------
class UserModelCertPatentSerializer(serializers.ModelSerializer):
    org_position_name = serializers.SerializerMethodField()
    full_name = serializers.SerializerMethodField()
    register_code = serializers.SerializerMethodField()

    class Meta:
        model = UserModelCertPatent
        fields = "__all__"

    def get_org_position_name(self, obj):

        org_position_name = None

        qs = Employee.objects.filter(user=obj.user).first()

        if qs:
            org_position_name = qs.org_position.name

        return org_position_name

    def get_full_name(self, obj):

        full_name = 0

        qs = Teachers.objects.filter(user=obj.user).first()

        if qs:
            full_name = qs.full_name

        return full_name


    def get_register_code(self, obj):

        register_code = None

        qs = Employee.objects.filter(user=obj.user).first()

        if qs:
            register_code = qs.register_code

        return register_code


# ---------------------------------------------Эрдэм шинжилгээний Лицензийн-Гэрчилгээ-------------------------------------------------------------------
class UserLicenseCertSerializer(serializers.ModelSerializer):

    class Meta:
        model = UserLicenseCert
        fields = "__all__"

    def get_org_position_name(self, obj):

        org_position_name = None

        qs = Employee.objects.filter(user=obj.user).first()

        if qs:
            org_position_name = qs.org_position.name

        return org_position_name

    def get_full_name(self, obj):

        full_name = 0

        qs = Teachers.objects.filter(user=obj.user).first()

        if qs:
            full_name = qs.full_name

        return full_name


    def get_register_code(self, obj):

        register_code = None

        qs = Employee.objects.filter(user=obj.user).first()

        if qs:
            register_code = qs.register_code

        return register_code


# ---------------------------------------------Эрдэм шинжилгээний Зохиогчийн-Эрхийн-Гэрчилгээ-------------------------------------------------------------------

class UserRightCertSerializer(serializers.ModelSerializer):
    org_position_name = serializers.SerializerMethodField()
    full_name = serializers.SerializerMethodField()
    register_code = serializers.SerializerMethodField()

    class Meta:
        model = UserRightCert
        fields = "__all__"

    def get_org_position_name(self, obj):

        org_position_name = None

        qs = Employee.objects.filter(user=obj.user).first()

        if qs:
            org_position_name = qs.org_position.name

        return org_position_name

    def get_full_name(self, obj):

        full_name = 0

        qs = Teachers.objects.filter(user=obj.user).first()

        if qs:
            full_name = qs.full_name

        return full_name


    def get_register_code(self, obj):

        register_code = None

        qs = Employee.objects.filter(user=obj.user).first()

        if qs:
            register_code = qs.register_code

        return register_code


#------------------------------------------------------------Эрдэм шинжилгээний бүтээлийн жагсаалт-----------------------------------------------------------
class InventionCategorySerializer(serializers.ModelSerializer):


    class Meta:
        model = InventionCategory
        fields = "__all__"


class GraduationWorkSerializer(serializers.ModelSerializer):

    teacher = TeacherNameSerializer()
    score = serializers.SerializerMethodField()
    datas = serializers.SerializerMethodField()

    class Meta:
        model = GraduationWork
        fields = '__all__'

    def get_score(self, obj):
        teacher = obj.teacher

        year, season = get_active_year_season()
        student_qs = GraduationWork.objects.filter(lesson_year=year, lesson_season=season, teacher=teacher).values_list('student', flat=True)

        count = student_qs.count()

        return count

    def get_datas(self, obj):
        teacher = obj.teacher

        year, season = get_active_year_season()
        student_ids = GraduationWork.objects.filter(lesson_year=year, lesson_season=season, teacher=teacher).values_list('student', flat=True)

        student_qs = Student.objects.filter(id__in=student_ids).all()

        datas = StudentRegisterListSerializer(student_qs, many=True).data

        return datas