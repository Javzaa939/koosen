from rest_framework import serializers
from django.db.models import Count, Q
from core.models import Teachers, Employee
from core.models import Schools
from core.models import SubOrgs
from core.models import Salbars
from core.models import AimagHot
from core.models import SumDuureg
from core.models import BagHoroo
from core.models import OrgPosition

from core.models import User
from core.models import Permissions
from core.models import  Roles, MainPosition


from lms.models import TimeTable, QuestionTitle, ChallengeQuestions
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
from main.utils.function.utils import build_url

from main.utils.function.utils import fix_format_date

class UserRegisterSerializer(serializers.ModelSerializer):

    class Meta:
        model = User
        fields = 'email', 'password', 'phone_number', 'home_phone'

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        instance = self.Meta.model(**validated_data)
        if password is not None:
            instance.set_password(password)

        instance.save()

        return instance


class UserSerializer(serializers.ModelSerializer):

    class Meta:
        model = User
        fields = '__all__'


class UserInfoSerializer(serializers.ModelSerializer):

    class Meta:
        model = Teachers
        fields = "__all__"


class EmployeeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Employee
        fields = '__all__'


class SubSchoolListSerailizer(serializers.ModelSerializer):
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
        fields = ["id", "last_name", "first_name",'full_name', 'rank_name']

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

        return f"{obj.last_name} {obj.first_name}"


class TeacherLessonListSerializer(serializers.ModelSerializer):
    """ Багшийн жагсаалтыг харуулах serializer """

    class Meta:
        model = Teachers
        fields = "__all__"


# Сургууль жагсаалт
class SchoolsRegisterSerailizer(serializers.ModelSerializer):
    logo = serializers.SerializerMethodField()

    class Meta:
        model = Schools
        fields = "__all__"

    def get_logo(self, obj):
        # API options
        is_use_cdn = False

        result = None

        if obj.logo:
            if is_use_cdn:
                result = build_url(obj.logo.name)

            else:
                request = self.context.get('request')

                if request:
                    result = request.build_absolute_uri(obj.logo.url)

        return result

    @staticmethod
    def create_defualt_role(name, description, permissions_names, org_id):
        try:
            org_position=''

            role = Roles.objects.filter(name=name, org_id=org_id).first()
            if role:
                is_hr = False
                is_director = False
                if role.name.lower() == 'хүний нөөц':
                    is_hr = True
                if role.name.lower() == 'удирдах ажилтан':
                    is_director = True
                org_position = OrgPosition.objects.create(
                    name=name,
                    description=description,
                    org_id=org_id,
                    is_hr=is_hr,
                    is_director=is_director
                )
                org_position.roles.add(role)
            else:
                permissions = None
                filters = Q()
                permissions_list = []
                for role_name in permissions_names.split(','):
                    if role_name:
                        permissions_list.append(str(role_name.strip()))

                if 'main' in  permissions_list:
                    filters.add(Q(name__endswith='main'), Q.OR)
                    permissions_list.remove('main')
                if 'read' in  permissions_list:
                    filters.add(Q(name__endswith='read'), Q.OR)
                    permissions_list.remove('read')
                if 'create' in  permissions_list:
                    filters.add(Q(name__endswith='create'), Q.OR)
                    permissions_list.remove('create')
                if 'update' in  permissions_list:
                    filters.add(Q(name__endswith='update'), Q.OR)
                    permissions_list.remove('update')
                if 'delete' in  permissions_list:
                    filters.add(Q(name__endswith='delete'), Q.OR)
                    permissions_list.remove('delete')
                if 'refuse' in  permissions_list:
                    filters.add(Q(name__endswith='refuse'), Q.OR)
                    permissions_list.remove('refuse')
                if 'edit' in  permissions_list:
                    filters.add(Q(name__endswith='edit'), Q.OR)
                    permissions_list.remove('edit')
                if 'approve' in  permissions_list:
                    filters.add(Q(name__endswith='approve'), Q.OR)
                    permissions_list.remove('approve')
                if 'restore' in  permissions_list:
                    filters.add(Q(name__endswith='restore'), Q.OR)
                    permissions_list.remove('restore')

                if 'lms-login' in  permissions_list:
                    filters.add(Q(name__endswith='lms-login'), Q.OR)
                    permissions_list.remove('lms-login')

                filters.add(Q(name__in=permissions_list), Q.OR)

                if filters:
                    permissions = Permissions.objects.filter(filters)
                role_new = Roles.objects.create(name=name, description=description, org_id=org_id)

                if permissions:
                    role_new.permissions.set(permissions)

                if role_new:
                    is_hr = False
                    is_director = False
                    if name.lower() == 'хүний нөөц':
                        is_hr = True
                    if name.lower() == 'удирдах ажилтан':
                        is_director = True
                    org_position, created = OrgPosition.objects.update_or_create(
                        name=name,
                        description=description,
                        org_id=org_id,
                        is_hr=is_hr,
                        is_director=is_director
                    )
                    org_position.roles.add(role_new)
            return True
        except Exception as e:
            print('e', e)
            return False


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
    school_eng = serializers.CharField(source="sub_orgs.name_eng", default="")
    school_uig = serializers.CharField(source="sub_orgs.name_uig", default="")
    leaders = serializers.SerializerMethodField()

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

    class Meta:
        model = SubOrgs
        fields = '__all__'


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
        fields = ["id", "last_name", "first_name", "salbar", "sub_org", "code", "org_position", "state", "full_name", 'rank_name']


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
        fields = ["id", "last_name", "first_name", "salbar", "sub_org", "code", "full_name", 'rank_name']
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
    code = serializers.SerializerMethodField()
    email = serializers.SerializerMethodField()
    org_position_name = serializers.SerializerMethodField()
    org_position = serializers.SerializerMethodField()
    state = serializers.SerializerMethodField()
    full_name = serializers.SerializerMethodField()
    phone_number = serializers.SerializerMethodField()
    lesson_names = serializers.SerializerMethodField()

    class Meta:
        model = Teachers
        fields = ["id", "last_name", "first_name", "salbar", "sub_org", "code", "org_position", "state", "full_name", 'register', 'org_position_name', 'email', 'phone_number', 'register', 'rank_type', 'rank_name', 'rank_rate', 'lesson_names']

    def get_email(self, obj):
        return User.objects.get(id=obj.user.id).email

    def get_phone_number(self, obj):
        return User.objects.get(id=obj.user.id).phone_number

    def get_code(self, obj):
        register_code = ""
        qs_worker = Employee.objects.filter(user=obj.user).first()
        if qs_worker:
            register_code = qs_worker.register_code

        return  register_code

    def get_org_position_name(self, obj):
        pos_name = ''
        qs_worker = Employee.objects.filter(user=obj.user).first()
        if qs_worker:
            org_pos = qs_worker.org_position
            if org_pos:
                pos_name = org_pos.name

        return pos_name

    def get_org_position(self, obj):
        position = None
        qs_worker = Employee.objects.filter(user=obj.user).first()
        if qs_worker:
            org_pos = qs_worker.org_position
            if org_pos:
                position = org_pos.id

        return position

    def get_state(self, obj):
        state_name = ''
        state = Employee.objects.filter(user=obj.user).first()

        if state:
            state_name = state.state
            return state_name

    def get_full_name(self, obj):
        """ Багшийн бүтэн нэр авах """

        return obj.full_name

    def get_lesson_names(self, obj):
        """ Багшийн асуулт үүсгэсэн хичээлүүд"""

        title_ids = QuestionTitle.objects.filter(created_by=obj).values_list('id', flat=True)
        lessons = (
            ChallengeQuestions.objects.filter(title__in=title_ids)
            .annotate(question_count=Count('id'))
            .filter(question_count__gt=0).values_list('title__lesson__name', flat=True).distinct()
        )

        result = []

        # to avoid "TypeError: sequence item 0: expected str instance, NoneType found". And because i do not know how this lesson names should be returned, for example: may be count of None items is required
        for ind, lesson in enumerate(lessons):
            new_item = lesson

            if lesson == None:
                new_item = 'None'
            result.append(new_item)
        return ', '.join(result)


class EmployeePostSerializer(serializers.ModelSerializer):
    class Meta:
        model = Employee
        fields = ["user", "register_code",'org_position',  'org', "sub_org", "salbar", "state"]


class UserFirstRegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = 'email', 'phone_number'


class UserSaveSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = 'email', 'phone_number', 'password', 'username'

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        instance = self.Meta.model(**validated_data)
        if password is not None:
            instance.set_password(password)

        instance.save()

        return instance

class PermissionSerializer(serializers.ModelSerializer):

    class Meta:
        model = Permissions
        fields = "__all__"

class OrgPositionPostSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrgPosition
        fields = ["id", "name", "is_teacher", "name", "description", "org", "is_director", "is_hr", "created_at", "updated_at", 'main_position']

class MainPositionSerializer(serializers.ModelSerializer):

    class Meta:
        model = MainPosition
        fields = "__all__"

class OrgPositionSerializer(serializers.ModelSerializer):
    org = SubSchoolsSerializer(many=False)
    permissions = PermissionSerializer(many=True)
    removed_perms = PermissionSerializer(many=True)
    created_at = serializers.SerializerMethodField()
    class Meta:
        model = OrgPosition
        fields = ["id", "name", "is_teacher", "name", "description", "org", "is_director", "is_hr", "created_at", "updated_at", "permissions", "removed_perms", "main_position"]


    def get_created_at(self, obj):

        fixed_date = fix_format_date(obj.created_at, format='%Y-%m-%d %H:%M:%S')
        return fixed_date

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


class DashboardSerializer(serializers.ModelSerializer):

    class Meta:
        model = Teachers
        fields = "__all__"


def generate_model_serializer(Model, inserted_fields='__all__'):

    ''' Serializer үүсгэх функц '''

    # Inserted_fields байгаа тохиолдолд авч string-г list болгож хувиргах
    if not inserted_fields == '__all__':

        inserted_fields = inserted_fields.replace(',', '').split()

    # Serializer үүсгэх хэсэг
    class TemplateSerializer(serializers.ModelSerializer):

        class Meta:
            model = Model
            fields = inserted_fields

    return TemplateSerializer
