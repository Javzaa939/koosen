from django.db import models
from django.contrib.auth.models import AbstractUser
from django.contrib.postgres.fields import ArrayField


# # -------------------------------- HRMS модел --------------------

class Zone(models.Model):
    ''' Бүсчлэл
    '''
    class Meta:
        db_table = 'core_buschlel'
        managed = False

    name = models.CharField(unique=True, max_length=50)
    code = models.CharField(default=None, null=True, max_length=100)
    updated_at = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)

class AimagHot(models.Model):

    class Meta:
        db_table = 'core_unit1'
        managed = False

    name = models.CharField(unique=True, max_length=50)
    code = models.CharField(default=None, null=True, max_length=100)
    buschlel = models.ForeignKey(Zone, null=True, blank=True, on_delete=models.CASCADE, verbose_name="Бүсчлэл")
    updated_at = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)


class SumDuureg(models.Model):

    class Meta:
        db_table = 'core_unit2'
        managed = False

    unit1 = models.ForeignKey(AimagHot, on_delete=models.CASCADE)
    name = models.CharField(max_length=50)
    code = models.CharField(default=None, null=True, max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class BagHoroo(models.Model):

    class Meta:
        db_table = 'core_unit3'
        managed = False

    unit2 = models.ForeignKey(SumDuureg, on_delete=models.CASCADE)
    name = models.CharField(max_length=50)
    code = models.CharField(default=None, null=True, max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class PropertyType(models.Model):
    """ Өмчийн хэлбэр
    """
    class Meta:
        db_table = 'core_propertytype'
        managed = False

    name = models.CharField(max_length=255, null=True, blank=True, verbose_name="Өмчийн төрөлийн нэр")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class EducationalInstitutionCategory(models.Model):
    """ Сургалтын байгууллагын ангилал
    """
    class Meta:
        db_table = 'core_educationalinstitutioncategory'
        managed = False

    name = models.CharField(max_length=255, null=True, blank=True, verbose_name="Сургалтын байгууллагын ангилалын нэр")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class Schools(models.Model):
    """
        Хамгийн том Байгууллага
    """
    class Meta:
        db_table = 'core_orgs'
        managed = False


    name = models.CharField(max_length=250, null=False)
    name_eng = models.CharField(max_length=250, null=True)

    address = models.CharField(max_length=250, verbose_name='Байгууллагын хаяг:', null=True, blank=True)
    web = models.CharField(max_length=250, verbose_name='Байгууллагын веб:', null=True, blank=True)
    social = models.CharField(max_length=250, verbose_name='Байгууллагын сошиал холбоос:', null=True, blank=True)
    logo = models.ImageField(upload_to="orgs/logo", null=True, blank=True, verbose_name='лого')

    email = models.EmailField(max_length=254, unique=True, blank=False, null=True, verbose_name="И-мэйл", error_messages={ "unique": "И-мэйл давхцсан байна" })
    phone_number = models.IntegerField(null=True, blank=True, verbose_name="Утасны дугаар")
    home_phone = models.IntegerField(null=True, blank=True, verbose_name="Факс")
    todorkhoilolt_signature = models.ImageField(upload_to="orgs/logo", null=True, blank=True, verbose_name='лого')
    todorkhoilolt_tamga = models.ImageField(upload_to="orgs/logo", null=True, blank=True, verbose_name='лого')

    unit1 = models.ForeignKey(AimagHot, null=True, blank=True, on_delete=models.CASCADE, verbose_name='аймаг,хот')
    unit2 = models.ForeignKey(SumDuureg, null=True, blank=True, on_delete=models.CASCADE, verbose_name='сум, дүүрэг')

    property_type = models.ForeignKey(PropertyType, null=True, blank=True, on_delete=models.CASCADE, verbose_name="Өмчийн хэлбэр")
    educational_institution_category = models.ForeignKey(EducationalInstitutionCategory, null=True, blank=True, on_delete=models.CASCADE, verbose_name="Сургалтын байгууллагын ангилал")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class SubSchools(models.Model):
    """ Байгууллагын охин байгууллага эсвэл дэд байгууллага
    """
    class Meta:
        db_table = 'core_suborgs'
        managed = False

    org = models.ForeignKey(Schools, on_delete=models.CASCADE, verbose_name='Байгууллага сонгох')
    org_code = models.CharField(max_length=2, null=True, unique=True, blank=True, verbose_name="Байгууллагын код")

    name = models.CharField(max_length=250, verbose_name='Байгууллага нэр:', null=False)
    name_eng = models.CharField(max_length=500, null=True, blank=True, verbose_name="Байгууллага нэр англи")
    name_uig = models.CharField(max_length=500, null=True, blank=True, verbose_name="Байгууллага нэр уйгаржин")

    address = models.CharField(max_length=250, verbose_name='Байгууллагын хаяг:', null=True, blank=True)
    web = models.CharField(max_length=250, verbose_name='Байгууллагын веб:', null=True, blank=True)
    social = models.CharField(max_length=250, verbose_name='Байгууллагын сошиал холбоос:', null=True, blank=True)
    logo = models.ImageField(upload_to="suborgs/logo", null=True, blank=True, verbose_name='лого')
    is_school = models.BooleanField(default=False, null=True, verbose_name="Сургууль эсэх")

    zahiral_name = models.CharField(max_length=250, verbose_name='Захирал нэр', null=True, blank=True)
    zahiral_name_eng = models.CharField(max_length=500, null=True, blank=True, verbose_name="Захирал нэр англи")
    zahiral_name_uig = models.CharField(max_length=500, null=True, blank=True, verbose_name="Захирал нэр уйгаржин")

    tsol_name = models.CharField(max_length=250, verbose_name='Цол нэр', null=True, blank=True)
    tsol_name_eng = models.CharField(max_length=500, null=True, blank=True, verbose_name="Цол нэр англи")
    tsol_name_uig = models.CharField(max_length=500, null=True, blank=True, verbose_name="Цол нэр уйгаржин")

    # erdem_tsol_name = models.CharField(max_length=250, verbose_name='Эрдмийн цол нэр', null=True, blank=True)
    # erdem_tsol_name_eng = models.CharField(max_length=500, null=True, blank=True, verbose_name="Эрдмийн цол нэр англи")
    # erdem_tsol_name_uig = models.CharField(max_length=500, null=True, blank=True, verbose_name="Эрдмийн цол нэр уйгаржин")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class User(AbstractUser):
    class Meta:
        db_table = 'core_user'
        managed = False

    LOGIN_TYPE_MAIN = 1
    LOGIN_TYPE_SIMPLE = 2
    LOGIN_TYPE_STUDENT = 3

    LOGIN_TYPE = (
        (LOGIN_TYPE_MAIN, 'Үндсэн'),
        (LOGIN_TYPE_SIMPLE, 'Энгийн хүн'),
        (LOGIN_TYPE_STUDENT, 'Оюутан'),
    )

    real_photo = models.ImageField(upload_to="user/profile",max_length=255, null=True, blank=True, verbose_name='Хэрэглэгчийн profile зураг')
    phone_number = models.IntegerField(null=True, blank=True, verbose_name="Утасны дугаар", unique=True, error_messages={'unique': 'Бүртгэлтэй дугаар байна.'})
    email = models.EmailField(max_length=254, unique=True, blank=False, null=True, verbose_name="И-мэйл", error_messages={ "unique": "И-мэйл давхцсан байна" })
    password = models.CharField(max_length=256, null=True)
    username = models.CharField(max_length=30, unique=True, null=True)
    home_phone = models.IntegerField(null=True, blank=True, verbose_name="Гэрийн утасны дугаар")
    mail_verified = models.BooleanField(null=True, blank=True, default=False, verbose_name="Гэрийн утасны дугаар")
    login_type = models.PositiveIntegerField(choices=LOGIN_TYPE, db_index=True, null=False, default=LOGIN_TYPE_SIMPLE, verbose_name="Хэрэглэгчийн төлөв")

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    @property
    def info(self):
        """ userinfo дундаас яг зөвшөөрөгдсөн userinfo хайж олно """
        return self.teachers_set.filter(action_status=Teachers.APPROVED, action_status_type=Teachers.ACTION_TYPE_ALL).first()

    @property
    def employee(self):
        return self.employee_set.filter(state=Employee.STATE_WORKING).first()

    @property
    def full_name(self):
        return self.info.full_name


class Departments(models.Model):
    """
        Тухайн дэд байгууллагын салбар
    """
    class Meta:
        db_table = 'core_salbars'
        managed = False

    org = models.ForeignKey(Schools, on_delete=models.CASCADE, verbose_name="Байгууллага")
    sub_orgs = models.ForeignKey(SubSchools, on_delete=models.CASCADE, verbose_name="Дэд байгууллага")
    name = models.CharField(max_length=250, null=True, verbose_name="Нэр", help_text="Энэ бол тайлбар")

    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True)
    branch_pos = models.IntegerField(default=0)

    address = models.CharField(max_length=250, verbose_name='Байгууллагын хаяг:', null=True, blank=True)
    web = models.CharField(max_length=250, verbose_name='Байгууллагын веб:', null=True, blank=True)
    social = models.CharField(max_length=250, verbose_name='Байгууллагын сошиал холбоос:', null=True, blank=True)
    logo = models.ImageField(upload_to="salbars/logo", null=True, blank=True, verbose_name='лого')
    is_hotolboriin_bag = models.BooleanField(default=False, null=True, verbose_name="Хөтөлбөрийн баг эсэх")
    leader = models.ForeignKey(User, null=True, blank=True, on_delete=models.CASCADE, verbose_name="Хөтөлбөрийн багийн ахлагч")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


class Permissions(models.Model):
    """ Эрхүүд нь """

    class Meta:
        db_table = 'core_permissions'
        managed = False

    name = models.CharField(max_length=250, null=False)
    description = models.CharField(max_length=1000, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.description} - {self.name}"


class Roles(models.Model):
    """ Системийн нийт role ууд """

    class Meta:
        db_table = 'core_roles'
        managed = False

    name = models.CharField(max_length=250, null=False)
    description = models.CharField(max_length=1000, null=True)
    permissions = models.ManyToManyField(Permissions)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class OrgPosition(models.Model):
    """ Тухайн байгууллагын албан тушаал
    """
    class Meta:
        db_table = 'core_orgposition'
        managed = False

    org = models.ForeignKey(Schools, on_delete=models.CASCADE)
    description = models.CharField(max_length=5000, null=True, blank=True, verbose_name="Тайлбар")
    name = models.CharField(max_length=250, null=False)
    permissions = models.ManyToManyField(Permissions)
    roles = models.ManyToManyField(Roles)
    is_hr = models.BooleanField(default=False, verbose_name="Хүний нөөцийн ажилтан эсэх")
    is_director =  models.BooleanField(default=False, verbose_name="Удирдах албан тушаалтан эсэх")
    removed_perms = models.ManyToManyField(Permissions, related_name="remove", blank=True)
    is_teacher = models.BooleanField(default=False, verbose_name="Багшлах эсэх")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # def __str__(self):
    #     return self.name


class Teachers(models.Model):
    """ Хэрэглэгчийн тухайн байгуулг дахь бүртгэл """
    class Meta:
        db_table = 'core_userinfo'
        managed = False

    GENDER_MALE = 1
    GENDER_FEMALE = 2
    GENDER_OTHER = 3

    GENDER_TYPE = (
        (GENDER_MALE, 'эрэгтэй'),
        (GENDER_FEMALE, 'эмэгтэй'),
        (GENDER_OTHER, 'бусад'),
    )

    BLOOD_O = 1
    BLOOD_A = 2
    BLOOD_B = 3
    BLOOD_AB = 4

    BLOOD_TYPE = (
        (BLOOD_O, 'O/I/'),
        (BLOOD_A, 'A/II/'),
        (BLOOD_B, 'B/III/'),
        (BLOOD_AB, 'AB/IV/'),
    )

    PENDING = 1
    APPROVED = 2
    DECLINED = 3

    ACTION_STATUS = (
        (PENDING, 'Хүлээгдэж буй'),
        (APPROVED, 'Зөвшөөрсөн'),
        (DECLINED, 'Цуцалсан'),
    )

    ACTION_TYPE_GENERAL = 1
    ACTION_TYPE_EXTRA = 2
    ACTION_TYPE_ALL = 3

    ACTION_TYPE = (
        (ACTION_TYPE_GENERAL, 'ерөнхий мэдээлэл'),
        (ACTION_TYPE_EXTRA, 'нэмэлт мэдээлэл'),
        (ACTION_TYPE_ALL, 'бүх мэдээлэл'),
    )

    user = models.ForeignKey(User,on_delete=models.CASCADE, verbose_name="Хэрэглэгч")
    urgiin_ovog = models.CharField(default='', null=True , max_length=100, verbose_name="Ургийн овог", blank=True)
    last_name = models.CharField(default='', null=True , max_length=50, verbose_name="Эцэг эхийн нэр")
    first_name = models.CharField(default='', null=True , max_length=50, verbose_name="Хэрэглэгчийн нэр")
    register = models.CharField(null=True, blank=False , max_length=10, unique=False, verbose_name="Регистрийн дугаар")
    gender = models.PositiveIntegerField(choices=GENDER_TYPE, db_index=True, null=False, default=GENDER_OTHER, verbose_name="Хүйс")
    ys_undes = models.CharField(default='', null=True , max_length=150, verbose_name="Яс үндэс", blank=True)
    action_status =  models.PositiveIntegerField(choices=ACTION_STATUS, db_index=True, null=False, default=PENDING, verbose_name="Өөрчлөх, үүсгэх төлөв")
    action_status_type =  models.PositiveIntegerField(choices=ACTION_TYPE, db_index=True, null=False, default=ACTION_TYPE_ALL, verbose_name="Өөрчлөх, үүсгэх төлөв төрөл")
    blood_type =  models.PositiveIntegerField(choices=BLOOD_TYPE, db_index=True, null=True, blank=True, default=None, verbose_name="Цусны бүлэг")
    address = models.CharField(default='', null=True , max_length=500, verbose_name="Оршин суугаа хаяг", blank=True)

    unit1 = models.ForeignKey(AimagHot, null=True, blank=True, on_delete=models.CASCADE, verbose_name='Төрсөн газар /аймаг,хот/')
    unit2 = models.ForeignKey(SumDuureg, null=True, blank=True, on_delete=models.CASCADE, verbose_name='Төрсөн газар /сум, дүүрэг/')
    emdd_number = models.CharField(default='', null=True, max_length=256, verbose_name="ЭМДД-ийн дугаар", blank=True)
    ndd_number = models.CharField(default='', null=True, max_length=256, verbose_name="НДД-ийн дугаар", blank=True)
    body_height = models.FloatField(default=0, verbose_name="Биеийн өндөр")
    body_weight = models.FloatField(default=0, verbose_name="Биеийн жин")

    org = models.ForeignKey(Schools, blank=True, null=True, on_delete=models.CASCADE, verbose_name="Байгууллага")
    sub_org = models.ForeignKey(SubSchools, on_delete=models.CASCADE, null=True, blank=True, verbose_name="Харьяалагдах алба нэгж")
    salbar = models.ForeignKey(Departments, on_delete=models.CASCADE, null=True, blank=True, verbose_name="Салбар")

    birthday = models.DateField(null=True, verbose_name="Төрсөн өдөр")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Системд өгөгдөл шинээр оруулсан огноо")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Үүсгэсэн огноо")

    @property
    def full_name(self):
        name = None
        ovog = f"{self.last_name[0].upper()}." if self.last_name else ""
        name = self.first_name.capitalize() if self.first_name else  ""

        if ovog and name:
            return f"{ovog}{name}"

        if name:
            return name

        return self.user.email


class Employee(models.Model):
    """ Хэрэглэгчийн тухайн байгуулг дахь бүртгэл """

    class Meta:
        db_table = 'core_employee'
        managed = False

    STATE_WORKING = 1
    STATE_FIRED = 2
    STATE_LEFT = 3

    STATE = (
        (STATE_WORKING, 'Ажиллаж байгаа'),
        (STATE_FIRED, 'Халагдсан'),
        (STATE_LEFT, 'Гарсан'),
    )

    WORKER_TYPE_CONTRACT = 1
    WORKER_TYPE_EMPLOYEE = 2
    WORKER_TYPE_PARTTIME = 3

    WORKER_TYPE = (
        (WORKER_TYPE_CONTRACT, 'Гэрээт ажилтан.'),
        (WORKER_TYPE_EMPLOYEE, 'Үндсэн ажилтан.'),
        (WORKER_TYPE_PARTTIME, 'Түр ажилтан.'),
    )

    org = models.ForeignKey(Schools, blank=True, null=True, on_delete=models.CASCADE, verbose_name="Байгууллага")
    sub_org = models.ForeignKey(SubSchools, on_delete=models.CASCADE, null=True, blank=True, verbose_name="Харьяалагдах алба нэгж")
    salbar = models.ForeignKey(Departments, on_delete=models.CASCADE, null=True, blank=True, verbose_name="Салбар")
    user = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name="Хэрэглэгч")
    org_position = models.ForeignKey(OrgPosition, blank=True, null=True, on_delete=models.SET_NULL, verbose_name="Албан тушаал")
    state = models.PositiveIntegerField(choices=STATE, db_index=True, null=False, default=STATE_WORKING, verbose_name="Ажилтны төлөв(Ажиллаж байгаа, Халагдсан эсэг)")
    worker_type = models.PositiveIntegerField(choices=WORKER_TYPE, db_index=True, null=False, default=WORKER_TYPE_EMPLOYEE, verbose_name="Ажилтны төлөв(Ажиллаж байгаа, Халагдсан эсэг)")

    time_user = models.CharField(null=True, max_length=500, blank=True, verbose_name="Цаг өгөх төхөөрөмжөөс таних ID")
    time_register_employee = models.CharField(max_length=500, blank=True, null=True, unique=True, verbose_name='Хэрэглэгчийн цагаа бүртгүүлэх ID')
    register_code = models.CharField(null=True, max_length=500, blank=True, unique=True, verbose_name="Ажилтны код")

    basic_salary_information = models.IntegerField(blank=True, null=True, default=0, verbose_name='Үндсэн цалингийн мэдээлэл')
    work_for_hire = models.BooleanField(null=True, blank=True, default=False, verbose_name="Хөлсөөр ажиллах эсэх")
    hourly_wage_information = models.IntegerField(blank=True, null=True, default=0, verbose_name='Нэг цагийн цалингийн мэдээлэл')
    hire_wage_information = models.IntegerField(blank=True, null=True, default=0, verbose_name='Хөлсөөр ажиллах цалингийн мэдээлэл')

    date_joined = models.DateTimeField(auto_now_add=True, verbose_name="Ажилд орсон хугацаа")
    date_left = models.DateTimeField(blank=True, null=True, verbose_name="Ажлаас гарсан хугацаа")
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def full_name(self):
        return self.user.get_full_name()


# -----------------------------------------------Notification--------------------------------------------------------------------------------

class NotificationType(models.Model):
    """ notif ийн төрөл """

    class Meta:
        db_table = 'core_notificationtype'
        managed = False

    name = models.CharField(max_length=255, null=False, blank=False)
    color = models.CharField(max_length=255, null=False, blank=False)
    code = models.CharField(max_length=255, null=True, blank=True, unique=True)
    level = models.IntegerField(default=0)


# class Employee(Employee):
#     class Meta:
#         db_table = 'core_employee'
#         managed = False
#     pass

class Orgs(Schools):
    pass


class SubOrgs(SubSchools):
    pass


class Salbars(Departments):
    pass

class Notification(models.Model):
    """ Үндсэн notif """

    class Meta:
        db_table = 'core_notification'
        managed = False

    SCOPE_KIND_ORG = 1
    SCOPE_KIND_SUBORG = 2
    SCOPE_KIND_SALBAR = 3
    SCOPE_KIND_POS = 4
    SCOPE_KIND_EMPLOYEE = 5
    SCOPE_KIND_USER = 6
    SCOPE_KIND_ALL = 7
    SCOPE_KIND_OYUTAN = 8
    SCOPE_KIND_PROFESSION = 9
    SCOPE_KIND_KURS = 10
    SCOPE_KIND_GROUP = 11

    SCOPE_KIND_CHOICES = (
        (SCOPE_KIND_ORG, 'Байгууллага'),
        (SCOPE_KIND_SUBORG, 'Дэд байгууллага'),
        (SCOPE_KIND_SALBAR, 'Салбар'),
        (SCOPE_KIND_POS, 'Албан тушаал'),
        (SCOPE_KIND_EMPLOYEE, 'Алба хаагч'),
        (SCOPE_KIND_USER, 'Хэрэглэгч'),
        (SCOPE_KIND_ALL, 'Бүгд'),
        (SCOPE_KIND_OYUTAN, 'Оюутан'),
        (SCOPE_KIND_PROFESSION, 'Мэргэжил'),
        (SCOPE_KIND_KURS, 'Курс'),
        (SCOPE_KIND_GROUP, 'Анги'),
    )

    FROM_KIND_ORG = 1
    FROM_KIND_SUBORG = 2
    FROM_KIND_SALBAR = 3
    FROM_KIND_POS = 4
    FROM_KIND_EMPLOYEE = 5
    FROM_KIND_USER = 6
    FROM_KIND_OYUTAN = 7

    FROM_KIND_CHOICES = (
        (FROM_KIND_ORG, 'Байгууллага'),
        (FROM_KIND_SUBORG, 'Дэд байгууллага'),
        (FROM_KIND_SALBAR, 'Салбар'),
        (FROM_KIND_POS, 'Албан тушаал'),
        (FROM_KIND_EMPLOYEE, 'Алба хаагч'),
        (FROM_KIND_USER, 'Хэрэглэгч'),
        (FROM_KIND_OYUTAN, 'Оюутан'),
    )

    #  notif хамрах хүрнээ
    org = models.ManyToManyField(Orgs, blank=True, verbose_name="Байгууллага")
    sub_org = models.ManyToManyField(SubOrgs, blank=True, verbose_name="Харьяалагдах алба нэгж")
    salbar = models.ManyToManyField(Salbars, blank=True, verbose_name="Салбар")
    org_position = models.ManyToManyField(OrgPosition, blank=True)
    employees = models.ManyToManyField(Employee, blank=True)
    users = models.ManyToManyField(User, blank=True)
    kurs = ArrayField(
        models.IntegerField(null=True),
        blank=True,
        null=True,
    )
    profs = ArrayField(
        models.IntegerField(null=True),
        blank=True,
        null=True,
    )
    groups = ArrayField(
        models.IntegerField(null=True),
        blank=True,
        null=True,
    )
    oyutans = ArrayField(
        models.IntegerField(null=True),
        blank=True,
        null=True,
    )
    is_all = models.BooleanField(default=False)
    scope_kind = models.IntegerField(choices=SCOPE_KIND_CHOICES, null=False, blank=False)

    from_org = models.ForeignKey(Orgs, on_delete=models.CASCADE, null=True, blank=True, related_name="from_org")
    from_sub_org = models.ForeignKey(SubOrgs, on_delete=models.CASCADE, null=True, blank=True, verbose_name="Харьяалагдах алба нэгж", related_name="from_sub_org")
    from_salbar = models.ForeignKey(Salbars, on_delete=models.CASCADE, null=True, blank=True, verbose_name="Салбар", related_name="from_salbar")
    from_org_position = models.ForeignKey(OrgPosition, on_delete=models.CASCADE, null=True, blank=True, related_name="from_pos")
    from_employees = models.ForeignKey(Employee, on_delete=models.CASCADE, null=True, blank=True, related_name="from_employees")
    from_users = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True, related_name="from_user")
    from_kind = models.IntegerField(choices=FROM_KIND_CHOICES, null=False, blank=False)

    tree_org = models.ForeignKey(Orgs, on_delete=models.CASCADE, null=True, blank=True, related_name="tree_org")
    tree_sub_org = models.ForeignKey(SubOrgs, on_delete=models.CASCADE, null=True, blank=True, verbose_name="Харьяалагдах алба нэгж", related_name="tree_sub_org")
    tree_salbar = models.ForeignKey(Salbars, on_delete=models.CASCADE, null=True, blank=True, verbose_name="Салбар", related_name="tree_salbar")
    tree_org_position = models.ForeignKey(OrgPosition, on_delete=models.CASCADE, null=True, blank=True, related_name="tree_pos")
    tree_kind = models.BooleanField(default=False)

    title = models.CharField(max_length=255, null=False, blank=False)
    ntype = models.ForeignKey(NotificationType, on_delete=models.CASCADE, null=False, blank=False)
    content = models.TextField(null=True, blank=True)
    url = models.URLField(null=True, blank=True)

    created_by = models.ForeignKey(User, on_delete=models.CASCADE, null=True, verbose_name="Үүсгэсэн", related_name="+")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
