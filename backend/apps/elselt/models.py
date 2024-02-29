from django.db import models

from lms.models import (
    AimagHot,
    AdmissionRegisterProfession
)
class ElseltUser(models.Model):

    class Meta:
        db_table = 'elselt_user'
        managed = False

    first_name = models.CharField(max_length=150, blank=True, verbose_name='Нэр')
    last_name = models.CharField(max_length=150, blank=True, verbose_name='Овог')
    code=models.CharField(max_length=200, verbose_name="Бүртгэлийн дугаар", default="")
    password=models.CharField(max_length=200, verbose_name="Нууц үг", default="")
    register = models.CharField(max_length=20, verbose_name="Регистрийн дугаар")
    email = models.CharField(max_length=254, unique=True, blank=False, null=True, verbose_name="И-мэйл", error_messages={ "unique": "И-мэйл давхцсан байна" })
    mobile = models.CharField(max_length=30, verbose_name="Өөрийн утасны дугаар", default="")
    parent_mobile = models.CharField(max_length=30, verbose_name="Шаардлагатай үед холбоо барих утас", default="")
    exam_loc = models.CharField(max_length=200, verbose_name="Шалгалт өгсөн газар", default="")
    exam_loc_code = models.SmallIntegerField(verbose_name="Шалгалт өгсөн газар", default=0)
    year = models.SmallIntegerField(verbose_name="Шалгалт өгсөн он", default=2023)
    semester = models.CharField(max_length=30, verbose_name="Улирал", default="")
    image = models.ImageField(upload_to='elselt', null=True, verbose_name='Хэрэглэгчийн зураг')
    aimag = models.ForeignKey(AimagHot, on_delete=models.CASCADE, null=True, verbose_name='Үндсэн захиргаа - Аймаг/хот')

    created = models.DateTimeField(auto_now_add=True, null=True, verbose_name='Огноо')

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    @property
    def is_anonymous(self):
        return True

    @property
    def is_authenticated(self):
        return False

    def __str__(self):
        return self.email

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


class UserInfo(models.Model):
    """ Хэрэглэгчийн дэлгэрэнгүй мэдээлэл """
    class Meta:
        db_table = 'elselt_userinfo'
        managed = False

    user = models.ForeignKey(ElseltUser, on_delete=models.CASCADE, verbose_name='Хэрэглэгч')
    graduate_school = models.CharField(max_length=255, null=True, verbose_name='Төгссөн сургууль')
    graduate_school_year = models.IntegerField(null=True, verbose_name='Төгссөн он')
    graduate_profession = models.CharField(max_length=255, null=True, verbose_name='Төгссөн мэргэжил')
    diplom_pdf = models.FileField(upload_to='diplom/', null=True, verbose_name='Дипломын файл')
    emongolia_diplom_pdf = models.FileField(upload_to='emongolia/', null=True, verbose_name='EMongolia дээд боловсролын байгууллагын дипломын тодорхойлолт файл')
    tsol_name = models.CharField(max_length=255, null=True, verbose_name='Цолын нэр')
    work_organization = models.CharField(max_length=255, null=True, verbose_name='Ажиллаж байгаа байгууллагын нэр')
    work_heltes = models.CharField(max_length=255, null=True, verbose_name='Хэлтэс газар')
    position_name = models.CharField(max_length=255, null=True, verbose_name='Албан тушаал')
    gpa = models.FloatField(null=True, verbose_name='Голч дүн')
    graduate_pdf = models.FileField(upload_to='diplom/', null=True, verbose_name='Төгссөн тушаал/ архивын лавлагаа хавсаргах')


class AdmissionUserProfession(models.Model):

    class Meta:
        db_table = 'elselt_admissionuserprofession'
        managed = False

    STATE_SEND = 1
    STATE_APPROVE = 2
    STATE_REJECT = 3

    STATE = (
        (STATE_SEND, 'ИЛГЭЭСЭН'),
        (STATE_APPROVE, 'ТЭНЦСЭН'),
        (STATE_REJECT, 'ТЭНЦЭЭГҮЙ'),
    )

    user = models.ForeignKey(ElseltUser, verbose_name='Элсэгч', on_delete=models.CASCADE)
    profession = models.ForeignKey(AdmissionRegisterProfession, verbose_name='Элссэн мэргэжил', on_delete=models.PROTECT)
    state = models.PositiveIntegerField(choices=STATE, db_index=True, null=False, default=STATE_SEND, verbose_name="Тэнцсэн эсэх")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class ContactInfo(models.Model):
    """ Холбоо барих """

    class Meta:
        db_table = 'elselt_contactinfo'
        managed=False

    email = models.CharField(max_length=500, verbose_name='Байгууллагын и-мэйл')
    address = models.CharField(max_length=5000, verbose_name='Байгууллагын хаяг')
    jijvvr_mobile = models.IntegerField(verbose_name='Жижүүрийн дугаар')
    mobile = models.IntegerField(verbose_name='Байгууллагын дугаар')
    contact_mobile = models.IntegerField(verbose_name='Олон нийттэй харилцах хэсгийн дугаар')

    admission_juram = models.FileField(upload_to='admission', null=True, verbose_name='Элсэлтийн журам')
    admission_advice = models.FileField(upload_to='admission', null=True, verbose_name='Элсэгчдэд зориулсан зөвлөмж')
    home_description = models.CharField(max_length=5000, null=True, verbose_name='Нүүр хуудасны харуулах тайлбар')
    alert_description = models.CharField(max_length=5000, null=True, verbose_name='Тухайн элсэлтэд зориулаад санамж гаргах')

    home_image = models.ImageField(upload_to='home/', null=True, verbose_name='Нүүр зураг')