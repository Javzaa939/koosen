from django.db import models

from lms.models import (
    AimagHot,
    AdmissionRegisterProfession,
    User,
    PsychologicalTest,
    AdmissionIndicator
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
    image = models.ImageField(upload_to='elselt', null=True, verbose_name='Хэрэглэгчийн зураг')
    aimag = models.ForeignKey(AimagHot, on_delete=models.CASCADE, null=True, verbose_name='Үндсэн захиргаа - Аймаг/хот')
    is_payment = models.BooleanField(default=False, verbose_name="Бүртгэлийн хураамж төлсөн эсэх")
    justice_file = models.FileField(upload_to='justice/', null=True, verbose_name='Ял шийтгэлийн сервис файл Emongolia')

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


class UserScore(models.Model):
    """ Хэрэглэгчийн ЭЕШ онооны мэдээлэл """

    class Meta:
        db_table = 'elselt_userscore'
        managed = False

    user = models.ForeignKey(ElseltUser, on_delete=models.CASCADE, verbose_name='Элсэгч')
    exam_loc = models.CharField(max_length=200, verbose_name="Шалгалт өгсөн газар", default="")
    exam_loc_code = models.IntegerField(verbose_name="Шалгалт өгсөн газар", default=0)
    year = models.IntegerField(verbose_name="Шалгалт өгсөн он")
    semester = models.CharField(max_length=30, verbose_name="Улирал", default="")
    school_code = models.IntegerField(verbose_name="Сургуулийн код", null=True)
    school_name = models.CharField(verbose_name="Сургуулийн нэр", max_length=500)
    lesson_name = models.CharField(verbose_name="Хичээлийн нэр", max_length=500)
    scaledScore = models.IntegerField(verbose_name="ЭЕШ оноо", null=True)
    raw_score = models.IntegerField(verbose_name="Анхны оноо", null=True)
    percentage_score = models.IntegerField(verbose_name="Хувь", null=True)
    word_score = models.CharField(verbose_name="Үсгэн үнэлгээ", max_length=255, null=True)


class Setting(models.Model):
    class Meta:
        db_table = 'elselt_setting'
        managed = False

    une = models.IntegerField(verbose_name="Нэгжийн үнэ", default=1)
    eec_api_url = models.CharField(verbose_name="EEC API зам", default="", max_length=500)
    eec_api_username = models.CharField(verbose_name="EEC api username", default="", max_length=500)
    eec_api_password = models.CharField(verbose_name="EEC api password", default="", max_length=500)
    qpay_api_url = models.CharField(verbose_name="QPAY API зам", max_length=500)
    qpay_api_username = models.CharField(verbose_name="Qpay api username", default="", max_length=500)
    qpay_api_password = models.CharField(verbose_name="Qpay api password", default="", max_length=500)
    qpay_api_call = models.CharField(max_length=200, verbose_name="QPay api call_back", default="")
    qpay_api_invoice_code = models.CharField(max_length=200, verbose_name="QPay invoice_code", default="")

    class Meta:
        verbose_name = ("Элсэлтийн тохиргоо")
        verbose_name_plural = ("4 Элсэлтийн тохиргоонууд")


class UserInfo(models.Model):
    """ Хэрэглэгчийн дэлгэрэнгүй мэдээлэл """
    class Meta:
        db_table = 'elselt_userinfo'
        managed = False

    STATE_CORRECT = 1
    STATE_EDIT = 2

    STATE = (
        (STATE_CORRECT, 'МЭДЭЭЛЭЛ ЗӨВ'),
        (STATE_EDIT, 'ЗАССАН'),
    )

    user = models.ForeignKey(ElseltUser, on_delete=models.CASCADE, verbose_name='Хэрэглэгч')
    graduate_school = models.CharField(max_length=1000, null=True, verbose_name='Төгссөн сургууль')
    graduate_school_year = models.IntegerField(null=True, verbose_name='Төгссөн он')
    graduate_profession = models.CharField(max_length=1000, null=True, verbose_name='Төгссөн мэргэжил')
    diplom_pdf = models.FileField(upload_to='diplom/', null=True, verbose_name='Дипломын файл')
    emongolia_diplom_pdf = models.FileField(upload_to='emongolia/', null=True, verbose_name='EMongolia дээд боловсролын байгууллагын дипломын тодорхойлолт файл')
    tsol_name = models.CharField(max_length=1000, null=True, verbose_name='Цолын нэр')
    work_organization = models.CharField(max_length=1000, null=True, verbose_name='Ажиллаж байгаа байгууллагын нэр')
    work_heltes = models.CharField(max_length=1000, null=True, verbose_name='Хэлтэс газар')
    position_name = models.CharField(max_length=1000, null=True, verbose_name='Албан тушаал')

    gpa = models.FloatField(null=True, verbose_name='Голч дүн')
    gpa_state = models.PositiveIntegerField(choices=STATE, db_index=True, null=False, default=STATE_CORRECT, verbose_name="Голчийн мэдээлэл зассан төлөв")

    graduate_pdf = models.FileField(upload_to='diplom/', null=True, verbose_name='Төгссөн тушаал/ архивын лавлагаа хавсаргах')
    esse_pdf = models.FileField(upload_to='diplom/', null=True, verbose_name='Эссэ бичсэн файлаа хавсаргах')
    ndsh_file = models.FileField(upload_to='ndsh/', null=True, verbose_name='НД-ын шимтгэл төлөлтийн лавлагаа файл')
    other_file = models.FileField(upload_to='other/', null=True, verbose_name='Бусад файл')
    invention_file = models.FileField(upload_to='invention/', null=True, verbose_name='Бүтээлийн жагсаалт файл')
    info_description = models.TextField(null=True, verbose_name='Мэдээллийг шалгаад үлдээх тайлбар')


class AdmissionUserProfession(models.Model):

    class Meta:
        db_table = 'elselt_admissionuserprofession'

    STATE_SEND = 1
    STATE_APPROVE = 2
    STATE_REJECT = 3

    STATE = (
        (STATE_SEND, 'БҮРТГҮҮЛСЭН'),
        (STATE_APPROVE, 'ТЭНЦСЭН'),
        (STATE_REJECT, 'ТЭНЦЭЭГҮЙ'),
    )

    user = models.ForeignKey(ElseltUser, verbose_name='Элсэгч', on_delete=models.CASCADE, null=True)
    profession = models.ForeignKey(AdmissionRegisterProfession, verbose_name='Элссэн мэргэжил', on_delete=models.PROTECT, null=True)
    description = models.CharField(max_length=5000, null=True, verbose_name='Хөтөлбөр сольсон тайлбар')

    score_avg = models.FloatField(null=True,verbose_name='ЭШ дундаж оноо')
    order_no = models.IntegerField(null=True, verbose_name='ЭШ оноогоор эрэмбэлэх ')

    # Элсэгч бүх шалгуурыг даваад тэнцсэн төлөв тайлбар
    state = models.PositiveIntegerField(choices=STATE, db_index=True, null=True, default=STATE_SEND, verbose_name="Тэнцсэн элсэгчийн төлөв")
    state_description = models.CharField(max_length=5000, null=True, verbose_name='Тэнцсэн төлөвийн тайлбар')

    # Элсэгч ял шийтгэлтэй эсэх тайлбар
    justice_state = models.PositiveIntegerField(choices=STATE, db_index=True, null=True, default=STATE_SEND, verbose_name="Ял шийтгэлтэй эсэх")
    justice_description = models.CharField(max_length=5000, null=True, verbose_name='Ял шийтгэлтэй бол тайлбар')

    # Тухайн элсэлтэд нас гэсэн шалгуур үзүүлэлттэй бол элсэгчийн насыг шалгаж тэнцсэн эсэх төлөв
    age_state = models.PositiveIntegerField(choices=STATE,  null=True, default=STATE_SEND, verbose_name="Нас шалгуурт тэнцсэн эсэх")
    age_description = models.CharField(max_length=5000, null=True, verbose_name='Нас шалгуурт тэнцээгүй тайлбар')

    # Тухайн элсэлтэд голч онооны шалгуур үзүүлэлттэй бол элсэгчийн голчыг шалгаж тэнцсэн эсэх төлөв
    gpa_state = models.PositiveIntegerField(choices=STATE,  null=True, default=STATE_SEND, verbose_name="Голч шалгуурт тэнцсэн эсэх")
    gpa_description = models.CharField(max_length=5000, null=True, verbose_name='Голч шалгуурт тэнцээгүй тайлбар')

    # Элсэгчийн элсэлтийн тушаалын дугаар огноо
    admission_date = models.DateField(null=True, verbose_name="Элсэлтийн тушаалын огноо")
    admission_number = models.CharField(null=True, max_length=50, verbose_name="Элсэлтийн тушаалын дугаар")

    # Элсэгч ЭШ оноогоор босго оноо даваад тэнцэх  төлөв тайлбар
    yesh_state = models.PositiveIntegerField(choices=STATE, db_index=True, null=True, default=STATE_SEND, verbose_name="Элсэгч ЭШ оноогоор босго онооны төлөв")
    yesh_description = models.CharField(max_length=5000, null=True, verbose_name='Элсэгч ЭШ оноогоор босго онооны төлөвийн тайлбар')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    updated_user = models.ForeignKey(User, on_delete=models.SET_NULL, verbose_name='Зассан хэрэглэгч', null=True)


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
    admission_advice = models.FileField(upload_to='admission', null=True, verbose_name='Элсэгчдэд зориулсан зөвлөмж')
    home_image = models.ImageField(upload_to='home/', null=True, verbose_name='Нүүр зураг')


class EmailInfo(models.Model):
    """ Элсэгчийн и-мэйл тайлан """

    user = models.ForeignKey(ElseltUser, on_delete=models.CASCADE, verbose_name='Элсэгч')
    message = models.TextField(null=True, max_length=5000, verbose_name='Илгээсэн мессэж')
    send_user = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name='И-мэйл илгээсэн хэрэглэгч')
    send_date = models.DateTimeField(auto_now=True, verbose_name='И-мэйл илгээсэн хугацаа')


class MessageInfo(models.Model):
    """ Элсэгчийн мессеж тайлан """

    user = models.ForeignKey(ElseltUser, on_delete=models.CASCADE, verbose_name='Элсэгч')
    message = models.TextField(null=True, max_length=5000, verbose_name='Илгээсэн мессэж')
    send_user = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name='Мессеж илгээсэн хэрэглэгч')
    send_date = models.DateTimeField(auto_now=True, verbose_name='Мессеж илгээсэн хугацаа')


# -------------------------------------------------------- Сонгон шалгаруулалт -------------------------------------------------------------------------------------------------

class HealthUser(models.Model):
    """ Элсэгчийн анхан шатны эрүүл мэндийн үзлэг """

    user = models.ForeignKey(ElseltUser, on_delete=models.CASCADE, verbose_name='Элсэгч')
    height = models.FloatField(verbose_name='Өндөр')
    weight = models.FloatField(verbose_name='Жин')
    is_chalk = models.BooleanField(default=False, verbose_name='Шарх сорвитой эсэх')
    is_tattoo = models.BooleanField(default=False, verbose_name='Шивээстэй эсэх')
    is_drug = models.BooleanField(default=False, verbose_name='Мансууруулах эм, сэтгэцэд нөлөөт бодисын хамаарлын шинжилгээ')
    description = models.TextField(verbose_name='Тайлбар', null=True)
    state = models.IntegerField(choices=AdmissionUserProfession.STATE, default=AdmissionUserProfession.STATE_SEND, verbose_name="Эрүүл мэндийн анхан шатны үзлэгт тэнцсэн эсэх төлөв")
    created_at = models.DateTimeField(auto_now=True)
    updated_at = models.DateTimeField(auto_now=True)
    updated_user = models.ForeignKey(User, verbose_name='Зассан хэрэглэгч', null=True, on_delete=models.CASCADE)


class HealthUpUser(models.Model):
    """ Элсэгчийн нарийн мэргэжлийн шатны эрүүл мэндийн үзлэг """

    user = models.ForeignKey(ElseltUser, on_delete=models.CASCADE, verbose_name='Элсэгч')
    state = models.IntegerField(choices=AdmissionUserProfession.STATE, default=AdmissionUserProfession.STATE_SEND, verbose_name="Эрүүл мэндийн анхан шатны үзлэгт тэнцсэн эсэх төлөв")
    belly = models.CharField(max_length=5000, null=True, verbose_name='Дотор')
    nerve = models.CharField(max_length=5000, null=True, verbose_name='Мэдрэл')
    ear_nose = models.CharField(max_length=5000, null=True, verbose_name='Чих хамар хоолой')
    eye = models.CharField(max_length=5000, null=True, verbose_name='Нүд')
    teeth = models.CharField(max_length=5000, null=True, verbose_name='Шүд')
    surgery = models.CharField(max_length=5000, null=True, verbose_name='Мэс засал')
    femini = models.CharField(max_length=5000, null=True, verbose_name='Эмэгтэйчүүд')
    heart = models.CharField(max_length=5000, null=True, verbose_name='Зүрх судас')
    phthisis = models.CharField(max_length=5000, null=True, verbose_name='сүрьеэ')
    allergies = models.CharField(max_length=5000, null=True, verbose_name='арьс харшил')
    contagious = models.CharField(max_length=5000, null=True, verbose_name='халдварт өвчин')
    neuro_phychic = models.CharField(max_length=5000, null=True, verbose_name='сэтгэц мэдрэл')
    injury = models.CharField(max_length=5000, null=True, verbose_name='гэмтэл')
    bzdx = models.CharField(max_length=5000, null=True, verbose_name='БЗДХ')

    description = models.TextField(verbose_name='Тайлбар', null=True)
    created_at = models.DateTimeField(auto_now=True)
    updated_at = models.DateTimeField(auto_now=True)
    updated_user = models.ForeignKey(User, verbose_name='Зассан хэрэглэгч', null=True, on_delete=models.CASCADE)


class PhysqueUser(models.Model):
    """ Элсэгчдийн бие бялдарын үзүүлэлт """

    user = models.ForeignKey(ElseltUser, on_delete=models.CASCADE, verbose_name='Элсэгч')
    state = models.IntegerField(choices=AdmissionUserProfession.STATE, default=AdmissionUserProfession.STATE_SEND, verbose_name="Эрүүл мэндийн анхан шатны үзлэгт тэнцсэн эсэх төлөв")
    description = models.TextField(verbose_name='Тайлбар', null=True)

    turnik = models.FloatField(verbose_name='Савлуурт суниах')
    belly_draught = models.FloatField(verbose_name='Гэдэсний таталт')
    patience_1000m= models.FloatField(verbose_name='Тэсвэр 1000 м')
    speed_100m = models.FloatField(verbose_name='Хурд 100 м')
    speed_100m = models.FloatField(verbose_name='Хурд 100 м')
    quickness = models.FloatField(verbose_name='Авхаалж самбаа')
    flexible = models.FloatField(verbose_name='Уян хатан')
    total_score = models.FloatField(verbose_name='Нийт оноо')

    created_at = models.DateTimeField(auto_now=True)
    updated_at = models.DateTimeField(auto_now=True)
    updated_user = models.ForeignKey(User, verbose_name='Зассан хэрэглэгч', null=True, on_delete=models.CASCADE)

    @property
    def score_physque(self):
        """ Ур чадварын шалгалтын оноог бодож гаргах """
        x = 0
        if self.total_score > 0 and self.total_score < 59:
            x = 200 + self.total_score * 4.66
        else:
            x = 480 + (self.total_score - 60) * 8

        return round(x, 2)


class MentalUser(models.Model):
    """ Элсэгчдийн сэтгэлзүйн сорил """

    class Meta:
        db_table = 'elselt_mentaluser'

    user = models.ForeignKey(ElseltUser, on_delete=models.CASCADE, verbose_name='Элсэгч')
    challenge = models.ForeignKey(PsychologicalTest, on_delete=models.CASCADE, verbose_name='Сэтгэлзүйн сорил', null=True)

    description = models.TextField(verbose_name='Тайлбар', null=True)
    answer = models.TextField(null=True, verbose_name='Хариулт')
    score = models.FloatField(null=True, verbose_name='Элсэгчийн нийт оноо')
    start_time = models.DateTimeField(null=True, verbose_name='Шалгалт өгч эхэлсэн хугацаа')
    end_time = models.DateTimeField(null=True, verbose_name='Шалгалт өгч дууссан хугацаа')

    created_at = models.DateTimeField(auto_now=True)
    updated_at = models.DateTimeField(auto_now=True)
    updated_user = models.ForeignKey(User, verbose_name='Зассан хэрэглэгч', null=True, on_delete=models.CASCADE)


class ConversationUser(models.Model):
    """ Элсэгчдийн ярилцлага """

    STATE_CONDIITON = 1
    STATE_APPROVE = 2
    STATE_REJECT = 3

    STATE = (
        (STATE_APPROVE, 'ТЭНЦЭНЭ'),
        (STATE_REJECT, 'ТЭНЦЭХГҮЙ'),
        (STATE_CONDIITON, 'НӨХЦӨЛТЭЙ'),
    )

    user = models.ForeignKey(ElseltUser, on_delete=models.CASCADE, verbose_name='Элсэгч')
    state = models.IntegerField(choices=STATE, default=STATE_CONDIITON, null=True, verbose_name="тэнцсэн эсэх төлөв")
    description = models.TextField(verbose_name='Тайлбар', null=True)

    created_at = models.DateTimeField(auto_now=True)
    updated_at = models.DateTimeField(auto_now=True)
    updated_user = models.ForeignKey(User, verbose_name='Зассан хэрэглэгч', null=True, on_delete=models.CASCADE)


class ArmyUser(models.Model):
    """ Цэргийн хээрийн бэлтгэл ярилцлага """

    user = models.ForeignKey(ElseltUser, on_delete=models.CASCADE, verbose_name='Элсэгч')
    state = models.IntegerField(choices=AdmissionUserProfession.STATE, default=AdmissionUserProfession.STATE_SEND, verbose_name="тэнцсэн эсэх төлөв")
    description = models.TextField(verbose_name='Тайлбар', null=True)

    created_at = models.DateTimeField(auto_now=True)
    updated_at = models.DateTimeField(auto_now=True)
    updated_user = models.ForeignKey(User, verbose_name='Зассан хэрэглэгч', null=True, on_delete=models.CASCADE)


class StateChangeLog(models.Model):
    ''' Элсэгч дээр төлөв болон хөтөлбөр сольсон лог харуулах '''

    PROFESSION = 1
    STATE = 2

    TYPE = (
        (PROFESSION, 'ХӨТӨЛБӨР'),
        (STATE, 'ТӨЛӨВ'),
    )

    user = models.ForeignKey(ElseltUser, on_delete=models.CASCADE, verbose_name='Элсэгч')
    type = models.IntegerField(choices=TYPE, verbose_name='Лог төрөл', default=STATE)
    now_profession = models.CharField(verbose_name='Одоогийн төлөв', max_length=255, null=True)
    change_profession = models.CharField(verbose_name='Одоогийн төлөв', max_length=255, null=True)
    indicator = models.IntegerField(choices=AdmissionIndicator.INDICATOR_VALUE, default=AdmissionIndicator.ERUUL_MEND, verbose_name='шалгуурын төрөл')
    now_state = models.IntegerField(choices=AdmissionUserProfession.STATE, default=AdmissionUserProfession.STATE_REJECT, verbose_name='ямар төлөвт шилжиж байгаан')
    change_state = models.IntegerField(choices=AdmissionUserProfession.STATE, default=AdmissionUserProfession.STATE_REJECT, verbose_name='ямар төлөвт шилжиж байгаан')

    updated_at = models.DateTimeField(auto_now=True)
    updated_user = models.ForeignKey(User, on_delete=models.SET_NULL, verbose_name='Зассан хэрэглэгч', null=True)