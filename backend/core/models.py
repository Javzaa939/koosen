from django.apps import apps
from django.contrib.auth.models import AbstractUser
from django.contrib.postgres.fields import ArrayField
from django.db import models

from .managers import EmployeeManager, SalbarManager, SubOrgManager

# # -------------------------------- HRMS модел --------------------


class Zone(models.Model):
    """Бүсчлэл"""

    name = models.CharField(unique=True, max_length=50)
    code = models.CharField(default=None, null=True, max_length=100)
    updated_at = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)


class AimagHot(models.Model):

    name = models.CharField(unique=True, max_length=50)
    code = models.CharField(default=None, null=True, max_length=100)
    buschlel = models.ForeignKey(
        Zone, null=True, blank=True, on_delete=models.CASCADE, verbose_name="Бүсчлэл"
    )
    updated_at = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)


class SumDuureg(models.Model):

    unit1 = models.ForeignKey(AimagHot, on_delete=models.CASCADE)
    name = models.CharField(max_length=50)
    code = models.CharField(default=None, null=True, max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class BagHoroo(models.Model):

    unit2 = models.ForeignKey(SumDuureg, on_delete=models.CASCADE)
    name = models.CharField(max_length=50)
    code = models.CharField(default=None, null=True, max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class PropertyType(models.Model):
    """Өмчийн хэлбэр"""

    name = models.CharField(
        max_length=255, null=True, blank=True, verbose_name="Өмчийн төрөлийн нэр"
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class EducationalInstitutionCategory(models.Model):
    """Сургалтын байгууллагын ангилал"""

    name = models.CharField(
        max_length=255,
        null=True,
        blank=True,
        verbose_name="Сургалтын байгууллагын ангилалын нэр",
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class Schools(models.Model):
    """
    Хамгийн том Байгууллага
    """

    name = models.CharField(max_length=250, null=False)
    name_eng = models.CharField(max_length=250, null=True)

    address = models.CharField(
        max_length=250, verbose_name="Байгууллагын хаяг:", null=True, blank=True
    )
    web = models.CharField(
        max_length=250, verbose_name="Байгууллагын веб:", null=True, blank=True
    )
    social = models.CharField(
        max_length=250,
        verbose_name="Байгууллагын сошиал холбоос:",
        null=True,
        blank=True,
    )
    logo = models.ImageField(
        upload_to="orgs/logo", null=True, blank=True, verbose_name="лого"
    )

    email = models.EmailField(
        max_length=254,
        unique=True,
        blank=False,
        null=True,
        verbose_name="И-мэйл",
        error_messages={"unique": "И-мэйл давхцсан байна"},
    )
    email_use_tls = models.BooleanField(default=False)
    phone_number = models.IntegerField(
        null=True, blank=True, verbose_name="Утасны дугаар"
    )
    home_phone = models.IntegerField(null=True, blank=True, verbose_name="Факс")
    todorkhoilolt_signature = models.ImageField(
        upload_to="orgs/logo", null=True, blank=True, verbose_name="лого"
    )
    todorkhoilolt_tamga = models.ImageField(
        upload_to="orgs/logo", null=True, blank=True, verbose_name="лого"
    )

    email_host_user = models.EmailField(
        max_length=255,
        unique=False,
        blank=False,
        null=True,
        verbose_name="Системийн и-мэйл",
    )
    email_use_tls = models.BooleanField(default=False, verbose_name="USE TLS")
    email_host_name = models.CharField(
        max_length=255, null=True, blank=True, verbose_name="HOST NAME"
    )
    email_host = models.CharField(
        max_length=255, null=True, blank=True, verbose_name="EMAIL HOST"
    )
    email_port = models.IntegerField(null=True, blank=True, verbose_name="EMAIL PORT")
    email_password = models.CharField(
        max_length=255, null=True, blank=True, verbose_name="EMAIL PASSWORD"
    )

    unit1 = models.ForeignKey(
        AimagHot,
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        verbose_name="аймаг,хот",
    )
    unit2 = models.ForeignKey(
        SumDuureg,
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        verbose_name="сум, дүүрэг",
    )

    property_type = models.ForeignKey(
        PropertyType,
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        verbose_name="Өмчийн хэлбэр",
    )
    educational_institution_category = models.ForeignKey(
        EducationalInstitutionCategory,
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        verbose_name="Сургалтын байгууллагын ангилал",
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        # First save the School itself (so it has an ID)
        is_new = self.pk is None
        super().save(*args, **kwargs)

        if is_new:
            StudentRegister = apps.get_model("lms", "StudentRegister")
            Season = apps.get_model("lms", "Season")

            static_student_register_data = [
                {"name": "Суралцаж буй", "code": 1},
                {"name": "Төгссөн", "code": 2},
                {"name": "Жилийн чөлөө авсан", "code": 3},
                {"name": "Сургуулиас гарсан", "code": 4},
                {"name": "Шилжсэн", "code": 5},
                {"name": "Сурахгүй байгаа", "code": 6},
            ]

            static_season_data = [
                {"season_code": 1, "season_name": "Намар"},
                {"season_code": 2, "season_name": "Хавар"},
            ]

            # Create StudentRegister if not exists
            for value in static_student_register_data:
                StudentRegister.objects.get_or_create(
                    org=self, code=value["code"], defaults={"name": value["name"]}
                )

            # Create Season if not exists
            for value in static_season_data:
                Season.objects.get_or_create(
                    org=self,
                    season_code=value["season_code"],
                    defaults={"season_name": value["season_name"]},
                )


class BankInfo(models.Model):

    name = models.CharField(max_length=250, null=False)
    image = models.ImageField(
        upload_to="logo", null=True, blank=True, verbose_name="Банк лого зураг"
    )
    order = models.IntegerField(
        default=0, null=False, blank=False, verbose_name="Зэрэглэл"
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class SubOrgs(models.Model):
    """Байгууллагын охин байгууллага эсвэл дэд байгууллага"""

    org = models.ForeignKey(
        Schools, on_delete=models.CASCADE, verbose_name="Байгууллага сонгох"
    )
    org_code = models.CharField(
        max_length=2,
        null=True,
        unique=True,
        blank=True,
        verbose_name="Байгууллагын код",
    )

    name = models.CharField(max_length=250, verbose_name="Байгууллага нэр:", null=False)
    name_eng = models.CharField(
        max_length=500, null=True, blank=True, verbose_name="Байгууллага нэр англи"
    )
    name_uig = models.CharField(
        max_length=500, null=True, blank=True, verbose_name="Байгууллага нэр уйгаржин"
    )

    address = models.CharField(
        max_length=250, verbose_name="Байгууллагын хаяг:", null=True, blank=True
    )
    web = models.CharField(
        max_length=250, verbose_name="Байгууллагын веб:", null=True, blank=True
    )
    social = models.CharField(
        max_length=250,
        verbose_name="Байгууллагын сошиал холбоос:",
        null=True,
        blank=True,
    )
    logo = models.ImageField(
        upload_to="suborgs/logo", null=True, blank=True, verbose_name="лого"
    )
    is_school = models.BooleanField(
        default=False, null=True, verbose_name="Сургууль эсэх"
    )

    zahiral_name = models.CharField(
        max_length=250, verbose_name="Захирал нэр", null=True, blank=True
    )
    zahiral_name_eng = models.CharField(
        max_length=500, null=True, blank=True, verbose_name="Захирал нэр англи"
    )
    zahiral_name_uig = models.CharField(
        max_length=500, null=True, blank=True, verbose_name="Захирал нэр уйгаржин"
    )

    tsol_name = models.CharField(
        max_length=250, verbose_name="Цол нэр", null=True, blank=True
    )
    tsol_name_eng = models.CharField(
        max_length=500, null=True, blank=True, verbose_name="Цол нэр англи"
    )
    tsol_name_uig = models.CharField(
        max_length=500, null=True, blank=True, verbose_name="Цол нэр уйгаржин"
    )

    erdem_tsol_name = models.CharField(
        max_length=250, verbose_name="Эрдмийн цол нэр", null=True, blank=True
    )
    erdem_tsol_name_eng = models.CharField(
        max_length=500, null=True, blank=True, verbose_name="Эрдмийн цол нэр англи"
    )
    erdem_tsol_name_uig = models.CharField(
        max_length=500, null=True, blank=True, verbose_name="Эрдмийн цол нэр уйгаржин"
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = SubOrgManager()

    def __str__(self):
        return self.name


class User(AbstractUser):

    LOGIN_TYPE_MAIN = 1
    LOGIN_TYPE_SIMPLE = 2
    LOGIN_TYPE_STUDENT = 3

    LOGIN_TYPE = (
        (LOGIN_TYPE_MAIN, "Үндсэн"),
        (LOGIN_TYPE_SIMPLE, "Энгийн хүн"),
        (LOGIN_TYPE_STUDENT, "Оюутан"),
    )

    real_photo = models.ImageField(
        upload_to="user/profile",
        max_length=255,
        null=True,
        blank=True,
        verbose_name="Хэрэглэгчийн profile зураг",
    )
    phone_number = models.IntegerField(
        null=True,
        blank=True,
        verbose_name="Утасны дугаар",
        unique=True,
        error_messages={"unique": "Бүртгэлтэй дугаар байна."},
    )
    email = models.EmailField(
        max_length=254,
        unique=True,
        blank=False,
        null=True,
        verbose_name="И-мэйл",
        error_messages={"unique": "И-мэйл давхцсан байна"},
    )
    password = models.CharField(max_length=256, null=True)
    username = models.CharField(max_length=255, unique=True, null=True)
    home_phone = models.IntegerField(
        null=True, blank=True, verbose_name="Гэрийн утасны дугаар"
    )
    mail_verified = models.BooleanField(
        null=True, blank=True, default=False, verbose_name="Гэрийн утасны дугаар"
    )
    login_type = models.PositiveIntegerField(
        choices=LOGIN_TYPE,
        db_index=True,
        null=False,
        default=LOGIN_TYPE_MAIN,
        verbose_name="Хэрэглэгчийн төлөв",
    )

    USERNAME_FIELD = "username"
    REQUIRED_FIELDS = []

    @property
    def info(self):
        """userinfo дундаас яг зөвшөөрөгдсөн userinfo хайж олно"""
        return self.teachers_set.filter(
            action_status=Teachers.APPROVED, action_status_type=Teachers.ACTION_TYPE_ALL
        ).first()

    @property
    def employee(self):
        return self.employee_set.filter(state=Employee.STATE_WORKING).first()

    @property
    def full_name(self):
        return self.info.full_name


class Salbars(models.Model):
    """
    Тухайн дэд байгууллагын салбар
    """

    class Meta:
        verbose_name = "Салбар Тэнхим"

    org = models.ForeignKey(
        Schools, on_delete=models.CASCADE, verbose_name="Байгууллага"
    )
    sub_orgs = models.ForeignKey(
        SubOrgs, on_delete=models.CASCADE, verbose_name="Дэд байгууллага"
    )
    name = models.CharField(
        max_length=250, null=True, verbose_name="Нэр", help_text="Энэ бол тайлбар"
    )
    code = models.CharField(
        max_length=250, unique=True, verbose_name="Код", help_text="Энэ бол тайлбар"
    )

    parent = models.ForeignKey("self", on_delete=models.CASCADE, null=True, blank=True)
    branch_pos = models.IntegerField(default=0)

    address = models.CharField(
        max_length=250, verbose_name="Байгууллагын хаяг:", null=True, blank=True
    )
    web = models.CharField(
        max_length=250, verbose_name="Байгууллагын веб:", null=True, blank=True
    )
    social = models.CharField(
        max_length=250,
        verbose_name="Байгууллагын сошиал холбоос:",
        null=True,
        blank=True,
    )
    logo = models.ImageField(
        upload_to="salbars/logo", null=True, blank=True, verbose_name="лого"
    )
    is_hotolboriin_bag = models.BooleanField(
        default=False, null=True, verbose_name="Хөтөлбөрийн баг эсэх"
    )
    leader = models.ForeignKey(
        User,
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        verbose_name="Хөтөлбөрийн багийн ахлагч",
    )

    created_user = models.ForeignKey(
        User,
        related_name="salbar_cr_user",
        on_delete=models.SET_NULL,
        null=True,
        verbose_name="Бүртгэсэн хэрэглэгч",
    )
    updated_user = models.ForeignKey(
        User,
        related_name="salbar_up_user",
        on_delete=models.SET_NULL,
        null=True,
        verbose_name="Зассан хэрэглэгч",
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = SalbarManager()

    # def __str__(self):
    #     return self.name


class Permissions(models.Model):
    """Эрхүүд нь"""

    name = models.CharField(max_length=250, null=False)
    description = models.CharField(max_length=1000, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.description} - {self.name}"


class Roles(models.Model):
    """Системийн нийт role ууд"""

    org = models.ForeignKey(
        Schools, on_delete=models.CASCADE, verbose_name="Байгууллага", null=True
    )
    name = models.CharField(max_length=250, null=False)
    description = models.CharField(max_length=1000, null=True)
    permissions = models.ManyToManyField(Permissions)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class MainPosition(models.Model):
    """Үндсэн төрөлүүд"""

    name = models.CharField(max_length=250, null=False, verbose_name="Нэр")
    code = models.CharField(max_length=255, null=True, blank=True, verbose_name="Код")


class OrgPosition(models.Model):
    """Тухайн байгууллагын албан тушаал"""

    org = models.ForeignKey(Schools, on_delete=models.CASCADE)
    description = models.CharField(
        max_length=5000, null=True, blank=True, verbose_name="Тайлбар"
    )
    name = models.CharField(max_length=250, null=False)
    permissions = models.ManyToManyField(Permissions)
    roles = models.ManyToManyField(Roles)
    is_hr = models.BooleanField(
        default=False, verbose_name="Хүний нөөцийн ажилтан эсэх"
    )
    is_director = models.BooleanField(
        default=False, verbose_name="Удирдах албан тушаалтан эсэх"
    )
    removed_perms = models.ManyToManyField(
        Permissions, related_name="remove", blank=True
    )
    is_teacher = models.BooleanField(default=False, verbose_name="Багшлах эсэх")
    main_position = models.ForeignKey(
        MainPosition,
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        verbose_name="Үндсэн албан тушаалын төрөлүүд",
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # def __str__(self):
    #     return self.name


class Teachers(models.Model):
    """Хэрэглэгчийн тухайн байгуулг дахь бүртгэл"""

    GENDER_MALE = 1
    GENDER_FEMALE = 2
    GENDER_OTHER = 3

    GENDER_TYPE = (
        (GENDER_MALE, "эрэгтэй"),
        (GENDER_FEMALE, "эмэгтэй"),
        (GENDER_OTHER, "бусад"),
    )

    BLOOD_O = 1
    BLOOD_A = 2
    BLOOD_B = 3
    BLOOD_AB = 4

    BLOOD_TYPE = (
        (BLOOD_O, "O/I/"),
        (BLOOD_A, "A/II/"),
        (BLOOD_B, "B/III/"),
        (BLOOD_AB, "AB/IV/"),
    )

    PENDING = 1
    APPROVED = 2
    DECLINED = 3

    ACTION_STATUS = (
        (PENDING, "Хүлээгдэж буй"),
        (APPROVED, "Зөвшөөрсөн"),
        (DECLINED, "Цуцалсан"),
    )

    ACTION_TYPE_GENERAL = 1
    ACTION_TYPE_EXTRA = 2
    ACTION_TYPE_ALL = 3

    ACTION_TYPE = (
        (ACTION_TYPE_GENERAL, "ерөнхий мэдээлэл"),
        (ACTION_TYPE_EXTRA, "нэмэлт мэдээлэл"),
        (ACTION_TYPE_ALL, "бүх мэдээлэл"),
    )

    user = models.ForeignKey(User, null=True, on_delete=models.CASCADE, verbose_name="Хэрэглэгч")
    urgiin_ovog = models.CharField(
        default="", null=True, max_length=100, verbose_name="Ургийн овог", blank=True
    )
    last_name = models.CharField(
        default="", null=True, max_length=50, verbose_name="Эцэг эхийн нэр"
    )
    first_name = models.CharField(
        default="", null=True, max_length=50, verbose_name="Хэрэглэгчийн нэр"
    )
    code = models.CharField(unique=True, null=True, max_length=100, verbose_name="Хэрэглэгчийн код")
    register = models.CharField(
        null=True,
        blank=False,
        max_length=10,
        unique=False,
        verbose_name="Регистрийн дугаар",
    )
    gender = models.PositiveIntegerField(
        choices=GENDER_TYPE,
        db_index=True,
        null=False,
        default=GENDER_OTHER,
        verbose_name="Хүйс",
    )
    ys_undes = models.CharField(
        default="", null=True, max_length=150, verbose_name="Яс үндэс", blank=True
    )
    action_status = models.PositiveIntegerField(
        choices=ACTION_STATUS,
        db_index=True,
        null=False,
        default=PENDING,
        verbose_name="Өөрчлөх, үүсгэх төлөв",
    )
    action_status_type = models.PositiveIntegerField(
        choices=ACTION_TYPE,
        db_index=True,
        null=False,
        default=ACTION_TYPE_ALL,
        verbose_name="Өөрчлөх, үүсгэх төлөв төрөл",
    )
    blood_type = models.PositiveIntegerField(
        choices=BLOOD_TYPE,
        db_index=True,
        null=True,
        blank=True,
        default=None,
        verbose_name="Цусны бүлэг",
    )
    address = models.CharField(
        default="",
        null=True,
        max_length=500,
        verbose_name="Оршин суугаа хаяг",
        blank=True,
    )

    unit1 = models.ForeignKey(
        AimagHot,
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        verbose_name="Төрсөн газар /аймаг,хот/",
    )
    unit2 = models.ForeignKey(
        SumDuureg,
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        verbose_name="Төрсөн газар /сум, дүүрэг/",
    )
    emdd_number = models.CharField(
        default="",
        null=True,
        max_length=256,
        verbose_name="ЭМДД-ийн дугаар",
        blank=True,
    )
    ndd_number = models.CharField(
        default="", null=True, max_length=256, verbose_name="НДД-ийн дугаар", blank=True
    )

    org = models.ForeignKey(
        Schools,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        verbose_name="Харьяалагдах алба нэгж",
    )
    sub_org = models.ForeignKey(
        SubOrgs,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        verbose_name="Харьяалагдах алба нэгж",
    )
    salbar = models.ForeignKey(
        Salbars, on_delete=models.CASCADE, null=True, blank=True, verbose_name="Салбар"
    )

    birthday = models.DateField(null=True, verbose_name="Төрсөн өдөр")
    updated_at = models.DateTimeField(
        auto_now=True, verbose_name="Системд өгөгдөл шинээр оруулсан огноо"
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Үүсгэсэн огноо")

    created_user = models.ForeignKey(
        User,
        related_name="teachers_cr_user",
        on_delete=models.SET_NULL,
        null=True,
        verbose_name="Бүртгэсэн хэрэглэгч",
    )
    updated_user = models.ForeignKey(
        User,
        related_name="teachers_up_user",
        on_delete=models.SET_NULL,
        null=True,
        verbose_name="Зассан хэрэглэгч",
    )

    @property
    def full_name(self):
        name = None
        ovog = f"{self.last_name[0].upper()}." if self.last_name else ""
        name = self.first_name.capitalize() if self.first_name else ""

        if ovog and name:
            return f"{ovog}{name}"

        if name:
            return name

        return self.user.email


class Employee(models.Model):
    """Хэрэглэгчийн тухайн байгуулг дахь бүртгэл"""

    STATE_WORKING = 1
    STATE_FIRED = 2
    STATE_LEFT = 3
    STATE_MOVE = 4
    STATE_RETIRED = 5

    STATE = (
        (STATE_WORKING, "Ажиллаж байгаа"),
        (STATE_FIRED, "Халагдсан (Чөлөөлөгдсөн)"),
        (STATE_LEFT, "Гарсан"),
        (STATE_MOVE, "Шилжсэн"),
        (STATE_RETIRED, "Тэтгэвэрт гарсан"),
    )

    WORKER_TYPE_CONTRACT = 1
    WORKER_TYPE_EMPLOYEE = 2
    WORKER_TYPE_PARTTIME = 3

    WORKER_TYPE = (
        (WORKER_TYPE_CONTRACT, "Гэрээт ажилтан."),
        (WORKER_TYPE_EMPLOYEE, "Үндсэн ажилтан."),
        (WORKER_TYPE_PARTTIME, "Түр ажилтан."),
    )

    TEACHER_RANK_TYPE_TRAINEE = 1
    TEACHER_RANK_TYPE_TEACHER = 2
    TEACHER_RANK_TYPE_SENIOR = 3
    TEACHER_RANK_TYPE_ASSOCIATE_PRO = 4
    TEACHER_RANK_TYPE_PRO = 5

    TEACHER_RANK_TYPE = (
        (TEACHER_RANK_TYPE_TRAINEE, "Дадлагажигч багш"),
        (TEACHER_RANK_TYPE_TEACHER, "Багш"),
        (TEACHER_RANK_TYPE_SENIOR, "Ахлах багш"),
        (TEACHER_RANK_TYPE_ASSOCIATE_PRO, "Дэд профессор"),
        (TEACHER_RANK_TYPE_PRO, "Профессор"),
    )

    EDUCATION_LEVEL_TRAINEE = 1
    EDUCATION_LEVEL_TEACHER = 2
    EDUCATION_LEVEL_SENIOR = 3
    EDUCATION_LEVEL_ASSOCIATE_PRO = 4

    EDUCATION_LEVEL = (
        (EDUCATION_LEVEL_TRAINEE, "Дипломын"),
        (EDUCATION_LEVEL_TEACHER, "Бакалавр"),
        (EDUCATION_LEVEL_SENIOR, "Магистр"),
        (EDUCATION_LEVEL_ASSOCIATE_PRO, "Доктор"),
    )

    DEGREE_TYPE_ASSOCIATE_PRO = 1
    DEGREE_TYPE_PRO = 2
    DEGREE_TYPE_ACADEMICIAN = 3

    DEGREE_TYPE = (
        (DEGREE_TYPE_ASSOCIATE_PRO, "Дэд профессор"),
        (DEGREE_TYPE_PRO, "Профессор"),
        (DEGREE_TYPE_ACADEMICIAN, "Академич"),
    )

    org = models.ForeignKey(
        Schools,
        blank=True,
        null=True,
        on_delete=models.CASCADE,
        verbose_name="Байгууллага",
    )
    sub_org = models.ForeignKey(
        SubOrgs,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        verbose_name="Харьяалагдах алба нэгж",
    )
    salbar = models.ForeignKey(
        Salbars, on_delete=models.CASCADE, null=True, blank=True, verbose_name="Салбар"
    )
    user = models.ForeignKey(User, null=True, on_delete=models.CASCADE, verbose_name="Хэрэглэгч")
    org_position = models.ForeignKey(
        OrgPosition,
        blank=True,
        null=True,
        on_delete=models.SET_NULL,
        verbose_name="Албан тушаал",
    )
    state = models.PositiveIntegerField(
        choices=STATE,
        db_index=True,
        null=False,
        default=STATE_WORKING,
        verbose_name="Ажилтны төлөв(Ажиллаж байгаа, Халагдсан эсэг)",
    )
    worker_type = models.PositiveIntegerField(
        choices=WORKER_TYPE,
        db_index=True,
        null=False,
        default=WORKER_TYPE_EMPLOYEE,
        verbose_name="Ажилтны төлөв(Ажиллаж байгаа, Халагдсан эсэг)",
    )

    time_user = models.CharField(
        null=True,
        max_length=500,
        blank=True,
        verbose_name="Цаг өгөх төхөөрөмжөөс таних ID",
    )
    time_register_employee = models.CharField(
        max_length=500,
        blank=True,
        null=True,
        unique=True,
        verbose_name="Хэрэглэгчийн цагаа бүртгүүлэх ID",
    )
    register_code = models.CharField(
        null=True, max_length=500, blank=True, unique=True, verbose_name="Ажилтны код"
    )

    basic_salary_information = models.IntegerField(
        blank=True, null=True, default=0, verbose_name="Үндсэн цалингийн мэдээлэл"
    )
    work_for_hire = models.BooleanField(
        null=True, blank=True, default=False, verbose_name="Хөлсөөр ажиллах эсэх"
    )
    hourly_wage_information = models.IntegerField(
        blank=True, null=True, default=0, verbose_name="Нэг цагийн цалингийн мэдээлэл"
    )
    hire_wage_information = models.IntegerField(
        blank=True,
        null=True,
        default=0,
        verbose_name="Хөлсөөр ажиллах цалингийн мэдээлэл",
    )

    date_joined = models.DateTimeField(
        auto_now_add=True, verbose_name="Ажилд орсон хугацаа"
    )
    date_left = models.DateTimeField(
        blank=True, null=True, verbose_name="Ажлаас гарсан хугацаа"
    )

    teacher_rank_type = models.PositiveIntegerField(
        choices=TEACHER_RANK_TYPE,
        db_index=True,
        null=True,
        blank=True,
        default=None,
        verbose_name="Албан тушаал",
    )
    education_level = models.PositiveIntegerField(
        choices=EDUCATION_LEVEL,
        db_index=True,
        null=True,
        blank=True,
        default=None,
        verbose_name="Боловсролын түвшин",
    )
    degree_type = models.PositiveIntegerField(
        choices=DEGREE_TYPE,
        db_index=True,
        null=True,
        blank=True,
        default=None,
        verbose_name="Эрдмийн зэрэг",
    )
    updated_at = models.DateTimeField(auto_now=True)

    created_user = models.ForeignKey(
        User,
        related_name="employee_cr_user",
        on_delete=models.SET_NULL,
        null=True,
        verbose_name="Бүртгэсэн хэрэглэгч",
    )
    updated_user = models.ForeignKey(
        User,
        related_name="employee_up_user",
        on_delete=models.SET_NULL,
        null=True,
        verbose_name="Зассан хэрэглэгч",
    )

    objects = EmployeeManager()

    @property
    def is_hr(self):
        return self.user.is_superuser or (
            self.org_position.is_hr if self.org_position else False
        )

    @property
    def real_photo(self):
        return self.user.real_photo

    @property
    def full_name(self):
        return self.user.full_name

    @staticmethod
    def exactly_our_employees(request):
        return Employee.objects.filter(**request.org_filter)

    @staticmethod
    def get_filter(request):
        filters = {"org": request.org_filter.get("org")}

        if "sub_org" in request.org_filter:
            filters["sub_org"] = request.org_filter.get("sub_org").id

        if "salbar" in request.org_filter:
            filters["salbar"] = request.org_filter.get("salbar").id

        return filters


# -----------------------------------------------Notification--------------------------------------------------------------------------------


class NotificationType(models.Model):
    """notif ийн төрөл"""

    name = models.CharField(max_length=255, null=False, blank=False)
    color = models.CharField(max_length=255, null=False, blank=False)
    code = models.CharField(max_length=255, null=True, blank=True, unique=True)
    level = models.IntegerField(default=0)


# class Employee(Employee):
#     pass


class Orgs(Schools):
    pass


class Notification(models.Model):
    """Үндсэн notif"""

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
        (SCOPE_KIND_ORG, "Байгууллага"),
        (SCOPE_KIND_SUBORG, "Дэд байгууллага"),
        (SCOPE_KIND_SALBAR, "Салбар"),
        (SCOPE_KIND_POS, "Албан тушаал"),
        (SCOPE_KIND_EMPLOYEE, "Алба хаагч"),
        (SCOPE_KIND_USER, "Хэрэглэгч"),
        (SCOPE_KIND_ALL, "Бүгд"),
        (SCOPE_KIND_OYUTAN, "Оюутан"),
        (SCOPE_KIND_PROFESSION, "Мэргэжил"),
        (SCOPE_KIND_KURS, "Курс"),
        (SCOPE_KIND_GROUP, "Анги"),
    )

    FROM_KIND_ORG = 1
    FROM_KIND_SUBORG = 2
    FROM_KIND_SALBAR = 3
    FROM_KIND_POS = 4
    FROM_KIND_EMPLOYEE = 5
    FROM_KIND_USER = 6
    FROM_KIND_OYUTAN = 7

    FROM_KIND_CHOICES = (
        (FROM_KIND_ORG, "Байгууллага"),
        (FROM_KIND_SUBORG, "Дэд байгууллага"),
        (FROM_KIND_SALBAR, "Салбар"),
        (FROM_KIND_POS, "Албан тушаал"),
        (FROM_KIND_EMPLOYEE, "Алба хаагч"),
        (FROM_KIND_USER, "Хэрэглэгч"),
        (FROM_KIND_OYUTAN, "Оюутан"),
    )

    #  notif хамрах хүрнээ
    org = models.ManyToManyField(Orgs, blank=True, verbose_name="Байгууллага")
    sub_org = models.ManyToManyField(
        SubOrgs, blank=True, verbose_name="Харьяалагдах алба нэгж"
    )
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
    scope_kind = models.IntegerField(
        choices=SCOPE_KIND_CHOICES, null=False, blank=False
    )

    from_org = models.ForeignKey(
        Orgs, on_delete=models.CASCADE, null=True, blank=True, related_name="from_org"
    )
    from_sub_org = models.ForeignKey(
        SubOrgs,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        verbose_name="Харьяалагдах алба нэгж",
        related_name="from_sub_org",
    )
    from_salbar = models.ForeignKey(
        Salbars,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        verbose_name="Салбар",
        related_name="from_salbar",
    )
    from_org_position = models.ForeignKey(
        OrgPosition,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="from_pos",
    )
    from_employees = models.ForeignKey(
        Employee,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="from_employees",
    )
    from_users = models.ForeignKey(
        User, on_delete=models.CASCADE, null=True, blank=True, related_name="from_user"
    )
    from_kind = models.IntegerField(choices=FROM_KIND_CHOICES, null=False, blank=False)

    tree_org = models.ForeignKey(
        Orgs, on_delete=models.CASCADE, null=True, blank=True, related_name="tree_org"
    )
    tree_sub_org = models.ForeignKey(
        SubOrgs,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        verbose_name="Харьяалагдах алба нэгж",
        related_name="tree_sub_org",
    )
    tree_salbar = models.ForeignKey(
        Salbars,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        verbose_name="Салбар",
        related_name="tree_salbar",
    )
    tree_org_position = models.ForeignKey(
        OrgPosition,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="tree_pos",
    )
    tree_kind = models.BooleanField(default=False)

    title = models.CharField(max_length=255, null=False, blank=False)
    ntype = models.ForeignKey(
        NotificationType, on_delete=models.CASCADE, null=False, blank=False
    )
    content = models.TextField(null=True, blank=True)
    url = models.URLField(null=True, blank=True)

    created_by = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        null=True,
        verbose_name="Үүсгэсэн",
        related_name="+",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class UserProfessionInfo(models.Model):
    """
    Хэрэглэгчийн мэргэжил дээшлүүлсэн байдал 3.1. Мэргэшлийн бэлтгэл
    """

    WHERE_COUNTRY_DOTOOD = 1
    WHERE_COUNTRY_GADAAD = 2

    WHERE_COUNTRY_TYPE = (
        (WHERE_COUNTRY_DOTOOD, "Дотоодод"),
        (WHERE_COUNTRY_GADAAD, "Гадаадад"),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    where = models.CharField(
        max_length=256, verbose_name="ХААНА, ЯМАР БАЙГУУЛЛАГАД", null=True, blank=True
    )

    start_date = models.DateField(verbose_name="Элссэн он сар", null=True, blank=True)
    end_date = models.DateField(verbose_name="Төгссөн он сар", null=True, blank=True)
    learned_days = models.IntegerField(
        verbose_name="Хугацаа хоногоор", default=0, null=True, blank=True
    )

    profession = models.CharField(
        max_length=256, verbose_name="эзэмшсэн мэргэжил", null=True, blank=True
    )
    license_number = models.CharField(
        max_length=256,
        verbose_name="Үнэмлэх, гэрчилгээний дугаар",
        null=True,
        blank=True,
    )

    where_country = models.PositiveBigIntegerField(
        choices=WHERE_COUNTRY_TYPE,
        db_index=True,
        default=WHERE_COUNTRY_DOTOOD,
        verbose_name="Мэргэжил дээшлүүлсэн байдал",
        null=True,
        blank=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True, verbose_name="Системд өгөгдөл шинээр оруулсан огноо"
    )
