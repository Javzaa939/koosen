from rest_framework import serializers

from core.models import Teachers, Employee
from core.models import Schools
from core.models import SubOrgs
from core.models import Salbars
from core.models import AimagHot
from core.models import SumDuureg
from core.models import BagHoroo
from core.models import OrgPosition
from core.models import User

from lms.models import TimeTable
from lms.models import LessonStandart
from lms.models import Country
from lms.models import Room
from lms.models import DormitoryFamilyContract
from lms.models import DormitoryRoomType
from lms.models import DormitoryRoom
from lms.models import Lesson_to_teacher
from lms.models import LessonCategory
from lms.models import Group
from lms.models import ProfessionDefinition
from lms.models import Learning
from lms.models import ProfessionalDegree
from lms.models import Student
from lms.models import UserInvention
from lms.models import InventionCategory
from lms.models import UserPaper
from lms.models import PaperCategory
from lms.models import StudentRequestTutor
from lms.models import UserNote
from lms.models import TeacherCountry
from lms.models import UserQuotation
from lms.models import QuotationCategory
from lms.models import UserProject
from lms.models import ProjectCategory
from lms.models import UserContractWork
from lms.models import UserPatent
from lms.models import UserModelCertPatent
from lms.models import UserSymbolCert
from lms.models import UserLicenseCert
from lms.models import UserRightCert

class SubSchoolListSerailizer(serializers.ModelSerializer):
    """ Дэд сургуулийн жагсаалт """

    class Meta:
        model = SubOrgs
        fields = "__all__"



# ---------- country ---------------

class CountryListSerializer(serializers.ModelSerializer):

    class Meta:
        model = Country
        fields = "__all__"


# aimag hot
class AimaghotListSerializer(serializers.ModelSerializer):

     class Meta:
        model = AimagHot
        exclude = "created_at", "updated_at"


# sumduureg
class SumDuuregListSerializer(serializers.ModelSerializer):

    class Meta:
        model = SumDuureg
        fields = "id", "name", "unit1"


# baghoroo
class BagHorooListSerializer(serializers.ModelSerializer):

    class Meta:
        model = BagHoroo
        fields = "id", "name", "unit2"


class DepartmentsSerializer(serializers.ModelSerializer):

    class Meta:
        model = Salbars
        fields = ["id", "name"]


class SubSchoolsSerializer(serializers.ModelSerializer):

    class Meta:
        model = SubOrgs
        fields = ["id","name"]


class LessonTeacherListSerializer(serializers.ModelSerializer):
    """ Багшийн жагсаалтыг харуулах serializer """


    full_name = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Teachers
        fields = ["id", "last_name", "first_name",'full_name']

    def get_full_name(self, obj):
        """ Багшийн бүтэн нэр авах """

        return obj.full_name


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

        return obj.full_name

class TeacherLessonListSerializer(serializers.ModelSerializer):
    """ Багшийн жагсаалтыг харуулах serializer """

    class Meta:
        model = Teachers
        fields = "__all__"


# Сургууль жагсаалт
class SchoolsRegisterSerailizer(serializers.ModelSerializer):

    class Meta:
        model = Schools
        fields = "__all__"

# дэд байгууллага шинээр үүсгэх
class SubSchoolsRegisterPostSerailizer(serializers.ModelSerializer):

    class Meta:
        model = SubOrgs
        fields = ["is_school", "org", "name", "name_eng","name_uig", "zahiral_name", "zahiral_name_uig","zahiral_name_eng", "tsol_name", "tsol_name_eng", "tsol_name_uig", "erdem_tsol_name","erdem_tsol_name_eng", "erdem_tsol_name_uig"]

# дэд байгууллага
class SubschoolSerailizer(serializers.ModelSerializer):

    class Meta:
        model = SubOrgs
        fields = "__all__"


 # Байгууллага
class SchoolsSerailizer(serializers.ModelSerializer):

    class Meta:
        model = Schools
        fields = "__all__"

class TeachersSerializer(serializers.ModelSerializer):

    full_name = serializers.SerializerMethodField()
    class Meta:
        model = Teachers
        fields = "__all__"

    def get_full_name(self, obj):
        return obj.full_name


class DepartmentRegisterSerailizer(serializers.ModelSerializer):
    """ Салбар, тэнхим ахлах бүртгэх """

    school = serializers.CharField(source="sub_orgs.name", default="")
    leaders = serializers.SerializerMethodField()
    lead = serializers.SerializerMethodField()

    class Meta:
        model = Salbars
        fields = "__all__"

    def get_leaders(self, obj):
        name = ''
        user = obj.leader

        if user:
            teacher = Teachers.objects.filter(user=user).first()
            if teacher:
                name = teacher.full_name

        return name

    def get_lead(self, obj):

        teacher_id = None
        user = obj.leader
        if user:
            teacher = Teachers.objects.filter(user=user).first()
            if teacher:
                teacher_id = teacher.id

        return teacher_id


class DepartmentRegisterListSerailizer(serializers.ModelSerializer):
    """ Салбар, тэнхим хөтөлбөрийн ахлах жагсаалт """

    class Meta:
        model = Salbars
        fields = "__all__"



class DepartmentListSerailizer(serializers.ModelSerializer):
    """ Салбар, тэнхим бүртгэх """

    class Meta:
        model = Salbars
        fields = ["id", 'name']

class DepartmentPostSerailizer(serializers.ModelSerializer):
    """ тэнхим шинээр бүртгэх """

    class Meta:
        model = Salbars
        fields = ["org", 'name', "address", "web", "social", "is_hotolboriin_bag", "leader", "sub_orgs"]

# ----------------- дэд сургууль --------------------

class SubSchoolRegisterSerailizer(serializers.ModelSerializer):

    class Meta:
        model = SubOrgs
        fields = "__all__"

class SubSchoolPutRegisterSerailizer(serializers.ModelSerializer):
    "засах"

    class Meta:
        model = SubOrgs
        fields = "id", "name_eng","name_uig",  "zahiral_name", "zahiral_name_eng", "zahiral_name_uig", "tsol_name", "tsol_name_eng", "tsol_name_uig", "org"

# Байгууллага сонгох
class OrgSerailizer(serializers.ModelSerializer):

    class Meta:
        model = Schools
        fields = "__all__"



# Багшийн мэдээллийн урт жагсаалт
class TeacherLongListSerializer(serializers.ModelSerializer):
    salbar = DepartmentsSerializer(many=False)
    sub_org = SubSchoolsSerializer(many=False)
    code = serializers.SerializerMethodField()
    org_position = serializers.SerializerMethodField()
    state = serializers.SerializerMethodField()
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = Teachers
        fields = ["id", "last_name", "first_name", "salbar", "sub_org", "code", "org_position", "state", "full_name"]


    def get_code(self, obj):
        """ Багшийн код авах """
        register_code = ""
        qs_worker = Employee.objects.filter(user=obj.user).first()
        if qs_worker:
            register_code = qs_worker.register_code

        return  register_code

    def get_org_position(self, obj):
        " албан тушаал "

        pos_name = ''
        qs_worker = Employee.objects.filter(user=obj.user).first()
        if qs_worker:
            org_pos = qs_worker.org_position
            if org_pos:
                pos_name = org_pos.name

        return pos_name


    def get_state(self, obj):
        " Ажиллаж байгаа "
        state_name = ''
        state = Employee.objects.filter(state=Employee.STATE_WORKING).first()

        if state:
            state_name = state.state
            return state_name

    def get_full_name(self, obj):
        """ Багшийн бүтэн нэр авах """

        return obj.full_name

class EmployeePostSerializer(serializers.ModelSerializer):

    class Meta:
        model = Employee
        fields = ["org", "sub_org", "salbar", "user", "org_position"]

class TeacherPostSerializer(serializers.ModelSerializer):

    class Meta:
        model = Teachers
        fields = ["first_name","last_name", "org",  "sub_org", "salbar", "user"]

    # Багшийн мэдээллийн урт жагсаалт
class TeacherListSchoolFilterSerializer(serializers.ModelSerializer):
    # salbar = DepartmentsSerializer(many=False)
    # sub_org = SubSchoolsSerializer(many=False)
    code = serializers.SerializerMethodField()
    full_name = serializers.SerializerMethodField()
    # org_position = serializers.SerializerMethodField()
    # state = serializers.SerializerMethodField()

    class Meta:
        model = Teachers
        fields = ["id", "last_name", "first_name", "salbar", "sub_org", "code", "full_name"]
        # fields = ["id", "last_name", "first_name", "salbar", "sub_org", "code", "org_position", "state", "full_name"]


    def get_code(self, obj):
        """ Багшийн код авах """
        register_code = ""
        qs_worker = Employee.objects.filter(user=obj.user).first()
        if qs_worker:
            register_code = qs_worker.register_code

        return  register_code

    # def get_org_position(self, obj):
    #     " албан тушаал "

    #     pos_name = ''
    #     qs_worker = Employee.objects.filter(user=obj.user).first()
    #     if qs_worker:
    #         org_pos = qs_worker.org_position
    #         if org_pos:
    #             pos_name = org_pos.name

    #     return pos_name


    # def get_state(self, obj):
    #     " Ажиллаж байгаа "
    #     state_name = ''
    #     state = Employee.objects.filter(state=Employee.STATE_WORKING).first()

    #     if state:
    #         state_name = state.state
    #         return state_name

    def get_full_name(self, obj):
        """ Багшийн бүтэн нэр авах """

        return obj.full_name


# Багшийн мэдээллийн жагсаалт
class TeacherNameSerializer(serializers.ModelSerializer):
    salbar = DepartmentsSerializer(many=False)
    sub_org = SubSchoolsSerializer(many=False)
    code = serializers.SerializerMethodField()
    org_position = serializers.SerializerMethodField()
    state = serializers.SerializerMethodField()
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = Teachers
        fields = ["id", "last_name", "first_name", "salbar", "sub_org", "code", "org_position", "state", "full_name"]


    def get_code(self, obj):
        """ Багшийн код авах """
        register_code = ""
        qs_worker = Employee.objects.filter(user=obj.user).first()
        if qs_worker:
            register_code = qs_worker.register_code

        return  register_code

    def get_org_position(self, obj):
        " албан тушаал "

        pos_name = ''
        qs_worker = Employee.objects.filter(user=obj.user).first()
        if qs_worker:
            org_pos = qs_worker.org_position
            if org_pos:
                pos_name = org_pos.name

        return pos_name


    def get_state(self, obj):
        " Ажиллаж байгаа "
        state_name = ''
        state = Employee.objects.filter(state=Employee.STATE_WORKING).first()

        if state:
            state_name = state.state
            return state_name

    def get_full_name(self, obj):
        """ Багшийн бүтэн нэр авах """

        return obj.full_name

class EmployeePostSerializer(serializers.ModelSerializer):
    class Meta:
        model = Employee
        fields = ["user", "register_code",'org_position',  'org', "sub_org", "salbar", "state"]

class OrgPositionSerializer(serializers.ModelSerializer):

    class Meta:
        model = OrgPosition
        fields = ["id", "name"]

# --------------------- Багшийн мэдээлэл -------------------------

class TeacherInfoSerializer(serializers.ModelSerializer):
    """ Багшийн ерөнхий мэдээлэл """

    salbar = DepartmentsSerializer(many=False)
    sub_org = SubSchoolsSerializer(many=False)
    code = serializers.SerializerMethodField()
    phone_number = serializers.SerializerMethodField()
    email = serializers.SerializerMethodField()
    gender = serializers.SerializerMethodField()
    org_position = serializers.SerializerMethodField(read_only=True)


    class Meta:
        model = Teachers
        fields = "id", "last_name", "first_name", "code", "salbar", "sub_org", "phone_number", "email", "register", "gender", "birthday", "org_position",  "address"

    def get_code(self, obj):
        """ код авах """
        register_code = ""
        qs_worker = Employee.objects.filter(user=obj.user).first()
        if qs_worker:
            register_code = qs_worker.register_code

        return  register_code

    def get_phone_number(self, obj):
        """ утасны дугаар авах """
        phone_number = ""
        qs_user =User.objects.filter(email=obj.user).first()
        if qs_user:
            phone_number = qs_user.phone_number

        return  phone_number

    def get_email(self, obj):
        """ утасны дугаар авах """
        phone_number = ""
        qs_user =User.objects.filter(email=obj.user).first()
        if qs_user:
            phone_number = qs_user.email

        return  phone_number

    def get_gender(self, obj):
        """ хүйс авах """

        gender = obj.get_gender_display()
        return  gender

    def get_org_position(self, obj):
        " албан тушаал "

        pos_name = ''
        qs_worker = Employee.objects.filter(user=obj.user).first()
        if qs_worker:
            org_pos = qs_worker.org_position
            if org_pos:
                pos_name = org_pos.name

        return pos_name

# ------------ Хичээлийн хуваарйин мэдээлэл -----------------

class CategorySerializer(serializers.ModelSerializer):
    " Хичээлийн ангилал "

    class Meta:
        model = LessonCategory
        fields = "__all__"

class LessonListSerializer(serializers.ModelSerializer):
    '''  Хичээлийн жагсаалт '''
    category = CategorySerializer(many=False)

    class Meta:
        model = LessonStandart
        fields = "id", "code", "name", "kredit", "category", "definition", "purpose", "knowledge", "skill"


class RoomSerializer(serializers.ModelSerializer):
    "өрөө"

    class Meta:
        model = Room
        exclude = ["created_at", "updated_at"]


class ScheduleSerializer(serializers.ModelSerializer):
    " Хичээлийн хуваарь "

    lesson = LessonListSerializer(many=False, read_only=True)
    room = RoomSerializer(many=False, read_only=True)
    type_name = serializers.SerializerMethodField(read_only=True)
    study_type_name = serializers.SerializerMethodField(read_only=True)
    day_name = serializers.SerializerMethodField(read_only=True)
    time_name = serializers.SerializerMethodField(read_only=True)


    class Meta:
        model = TimeTable
        fields = "id","day", "time", "type", "study_type", "lesson", "room", "type_name", "study_type_name", "lesson_season", "lesson_year", "time_name", "day_name"

    def get_day_name(self, obj):
        " өдөр "

        lesson_day = obj.get_day_display()
        return lesson_day

    def get_time_name(self, obj):
        " цаг "

        lesson_time = obj.get_time_display()
        return lesson_time

    def get_type_name(self, obj):
        " Хичээллэх төрөл "

        lesson_type = obj.get_type_display()
        return lesson_type

    def get_study_type_name(self, obj):
        " Хичээл орох хэлбэр "

        less_study_types = obj.get_study_type_display()
        return less_study_types

# ---------- Дотуур байр түрээслэгчийн жагсаал --------------

class RoomTypeSerializer(serializers.ModelSerializer):
    "өрөөний төрөл"

    class Meta:
        model = DormitoryRoomType
        fields = "__all__"


class DormitoryRoomSerializer(serializers.ModelSerializer):
    "өрөө"

    class Meta:
        model = DormitoryRoom
        fields = "__all__"


class DormitoryFamilyContractSerializer(serializers.ModelSerializer):
    " Дотуур байр түрээслэгчийн жагсаалт "

    room_type = RoomTypeSerializer(many=False)
    room = DormitoryRoomSerializer(many=False)

    class Meta:
        model = DormitoryFamilyContract
        fields = "id", "teacher","room_type", "room", "solved_start_date","solved_finish_date"

# -------- заах хичээлийн мэдээлэл ------------------

class Lesson_to_teacherSerializer(serializers.ModelSerializer):
    '''  Хичээлийн жагсаалт '''

    lesson = LessonListSerializer(many=False)

    class Meta:
        model = Lesson_to_teacher
        fields = "__all__"


# -------- удирдлагын мэдээлэл ------------------

class ProfessionDefinitionSerialzier(serializers.ModelSerializer):
     " Мэргэжил "
     class Meta:
        model = ProfessionDefinition
        fields = "__all__"


class LearningSerialzier(serializers.ModelSerializer):
     "Суралцах хэлбэр"

     class Meta:
        model = Learning
        fields = "__all__"

class DegreeSerialzier(serializers.ModelSerializer):
     "Боловсролын зэрэг"

     class Meta:
        model = ProfessionalDegree
        fields = "__all__"


class GroupSerializer(serializers.ModelSerializer):
    ''' Удирдах ангийн жагсаалт '''

    profession = ProfessionDefinitionSerialzier(many=False)
    learning_status = LearningSerialzier(many=False)
    degree = DegreeSerialzier(many=False)

    class Meta:
        model = Group
        fields = "__all__"

# ------------------ Багшийн туслахаар ажиллах хүсэлтийн мэдээлэл ---------------

class StudentListSerializer(serializers.ModelSerializer):
    "Оюутны мэдээлэл"

    class Meta:
        model = Student
        fields = "id", "code", "full_name"


class StudentRequestTutorSerializer(serializers.ModelSerializer):
    ''' Багшийн туслахаар ажиллах хүсэлт жагсаалт '''

    student= StudentListSerializer(many=False)
    lesson = LessonListSerializer(many=False)

    class Meta:
        model = StudentRequestTutor
        fields = "__all__"

# ------------------ Эрдэм шинжилгээ мэдээлэл ---------------

class InventionCategorySerializer(serializers.ModelSerializer):
    " Бүтээлийн ангилал "

    class Meta:
        model = InventionCategory
        fields = "id", "name"

class PaperCategorySerializer(serializers.ModelSerializer):
    " Өгүүллийн ангилал "

    class Meta:
        model = PaperCategory
        fields = "id", "name"

class UserInventionSerializer(serializers.ModelSerializer):
    " Бүтээл "

    category = InventionCategorySerializer(many=False)

    class Meta:
        model = UserInvention
        fields = "__all__"

class UserPaperSerializer(serializers.ModelSerializer):
    " Бүтээл, Өгүүлэл "

    category = PaperCategorySerializer(many=False)
    papertype_name = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = UserPaper
        fields = "id","user", "name", "papertype", "papertype_name", "published_year", "doi_number", "issn_number", "category"

    def get_papertype_name(self, obj):
        " Өгүүллийн төрөл "

        papertype_names = obj.get_papertype_display()
        return papertype_names

class CountrySerializer(serializers.ModelSerializer):

    class Meta:
        model = TeacherCountry
        fileds = "__all__"


class UserNoteSerializer(serializers.ModelSerializer):
    " Илтгэл "

    # country = CountrySerializer(many=False)
    category_name = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = UserNote
        fields = ["id", "user", "category", "meeting_name", "country_number", "country", "meeting_org_name", "category_name", "meeting_date"]

    def get_category_name(self, obj):
        " Өгүүллийн төрөл "

        category_names = obj.get_category_display()
        return category_names

class QuotationCategorySerializer(serializers.ModelSerializer):
    " Эшлэлийн ангилал "

    class Meta:
        model = QuotationCategory
        fields = "id", "name"

class UserQuotationSerializer(serializers.ModelSerializer):
    " Эшлэл "

    category = QuotationCategorySerializer(many=False)

    class Meta:
        model = UserQuotation
        fields = ["id", "user", "category", "name", "doi_number", "quotation_number", "quotation_year", "quotation_link"]


# ------------------- Төсөл, Гэрээт ажил -----------------
class ProjectCategorySerializer(serializers.ModelSerializer):
    "Төслийн ангилал"

    class Meta:
        model = ProjectCategory
        fields = "id", "name"

class UserProjectSerializer(serializers.ModelSerializer):
    " Төсөл "

    category = ProjectCategorySerializer(many=False)

    class Meta:
        model = UserProject
        fields = "__all__"

class UserContractWorkSerializer(serializers.ModelSerializer):
    " Гэрээт ажил "

    class Meta:
        model = UserContractWork
        fields = "__all__"


# --------------------------- Шинэ-Бүтээлийн-Патент ------------------

class UserPatentSerializer(serializers.ModelSerializer):
    " Шинэ-Бүтээлийн-Патент "

    class Meta:
        model = UserPatent
        fields = "__all__"

class UserModelCertPatentSerializer(serializers.ModelSerializer):
    " Ашигтай загварын патент"

    class Meta:
        model = UserModelCertPatent
        fields = "__all__"

class UserSymbolCertSerializer(serializers.ModelSerializer):
    " Барааны тэмдгийн гэрчилгээ "

    class Meta:
        model = UserSymbolCert
        fields = "__all__"

class UserLicenseCertSerializer(serializers.ModelSerializer):
    " Лицензийн гэрчилгээ"

    class Meta:
        model = UserLicenseCert
        fields = "__all__"

class UserRightCertSerializer(serializers.ModelSerializer):
    " Зохиогчийн эрхийн гэрчилгээ "

    class Meta:
        model = UserRightCert
        fields = "__all__"


class DepartmentUpdateSerailizer(serializers.ModelSerializer):
    """ Салбар, тэнхим бүртгэх """

    class Meta:
        model = Salbars
        fields = "__all__"
