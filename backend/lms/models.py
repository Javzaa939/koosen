import json
import os
import uuid
from datetime import datetime as dt

from django.conf import settings
from django.contrib.postgres.fields import ArrayField
from django.db import models
from django.db.models.functions import Lower
from django.utils import timezone
from shortuuidfield import ShortUUIDField

from core.models import *
from django.contrib.postgres.fields import ArrayField
from django.contrib.auth.models import AbstractUser, Group as AbstractGroup, Permission

from main.utils.file import (
    remove_folder,
)
from main.utils.function.utils import get_fullName

from .managers import SystemSettingsManager

# Create your models here.
# -------------------------------- Тохиргоо, лавлах сангийн мэдээллийн модел --------------------

class ProfessionalDegree(models.Model):
    """ Боловсролын зэрэг """

    org = models.ForeignKey(Schools, on_delete=models.CASCADE, verbose_name="Байгууллага", null=True)
    degree_code = models.CharField(max_length=255)
    degree_name = models.CharField(max_length=255, verbose_name="Зэргийн нэр")
    degree_eng_name = models.CharField(max_length=255, null=True, verbose_name="Зэргийн англи нэр")
    degree_uig_name = models.CharField(max_length=255, null=True, verbose_name="Зэргийн уйгаржин нэр")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class Learning(models.Model):
    """ Суралцах хэлбэр """

    org = models.ForeignKey(Schools, on_delete=models.CASCADE, verbose_name="Байгууллага", null=True)
    learn_code = models.IntegerField()
    learn_name = models.CharField(max_length=255, verbose_name="Суралцах хэлбэрийн нэр")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class StudentRegister(models.Model):
    """ Оюутны бүртгэлийн хэлбэр """

    org = models.ForeignKey(Schools, on_delete=models.CASCADE, verbose_name="Байгууллага", null=True)
    code  = models.IntegerField()
    name = models.CharField(max_length=255, verbose_name="Бүртгэлийн хэлбэрийн нэр")
    status_name_eng = models.CharField(max_length=255, verbose_name="Бүртгэлийн англи хэлбэрийн нэр", null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class LessonCategory(models.Model):
    """ Хичээлийн ангилал """

    org = models.ForeignKey(Schools, on_delete=models.CASCADE, verbose_name="Байгууллага", null=True)
    category_code = models.IntegerField()
    category_name = models.CharField(max_length=255, verbose_name="Хичээлийн ангиллын нэр")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class LessonType(models.Model):
    """ Хичээлийн төрөл """

    org = models.ForeignKey(Schools, on_delete=models.CASCADE, verbose_name="Байгууллага", null=True)
    type_code = models.IntegerField()
    type_name = models.CharField(max_length=255, verbose_name="Хичээлийн төрлийн нэр")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class LessonLevel(models.Model):
    """  Хичээлийн түвшин """

    org = models.ForeignKey(Schools, on_delete=models.CASCADE, verbose_name="Байгууллага", null=True)
    level_code = models.IntegerField()
    level_name = models.CharField(max_length=255, verbose_name=" Хичээлийн түвшний нэр")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class LessonGroup(models.Model):
    """ Хичээлийн бүлэг """

    org = models.ForeignKey(Schools, on_delete=models.CASCADE, verbose_name="Байгууллага", null=True)
    group_code = models.IntegerField()
    group_name = models.CharField(max_length=255, verbose_name="Хичээлийн бүлгийн нэр")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class Season(models.Model):
    """ Улирал """

    org = models.ForeignKey(Schools, on_delete=models.CASCADE, verbose_name="Байгууллага", null=True)
    season_code = models.IntegerField()
    season_name = models.CharField(max_length=255, verbose_name="Улирлын нэр")
    season_name_eng = models.CharField(max_length=255, verbose_name="Улирлын англи нэр", null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class Score(models.Model):
    """ Дүнгийн бүртгэл """

    org = models.ForeignKey(Schools, on_delete=models.CASCADE, verbose_name="Байгууллага", null=True)
    score_code = models.IntegerField()
    score_max = models.FloatField(verbose_name="Дүнгийн доод оноо")
    score_min = models.FloatField(verbose_name="Дүнгийн дээд оноо")
    gpa = models.FloatField(verbose_name="Голч дүн")
    assesment = models.CharField(max_length=10, verbose_name="Үсгэн үнэлгээ")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class Country(models.Model):

    """ Улс """

    AFRICA = 1
    NA = 2
    LAATC = 3
    ASIA = 4
    EUROPE = 5
    PC = 6

    CONTINENT_TYPE = (
        (AFRICA, 'Африк'),
        (NA, 'Хойд Америк'),
        (LAATC, 'Латин Америк ба Карибын тэнгис'),
        (ASIA, 'Ази'),
        (EUROPE, 'Европ'),
        (PC, 'Номхон далайн орнууд'),
    )

    code = models.CharField(max_length=20, unique=True, verbose_name='Улсын код')
    name = models.CharField(max_length=100, verbose_name='Улсын нэр')
    name_eng = models.CharField(max_length=500, null=True, verbose_name="Улсын нэр англи")
    name_uig = models.CharField(max_length=500, null=True, verbose_name="Улсын нэр уйгаржин")
    continent = models.PositiveIntegerField(choices=CONTINENT_TYPE, db_index=True, default=ASIA, verbose_name="Тивүүдийн нэр")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

# -------------------------------- Сургалт --------------------
class LessonStandart(models.Model):
    """ Хичээлийн стандарт """

    code = models.CharField(unique=True, max_length=50, verbose_name="Хичээлийн код")
    name = models.CharField(max_length=500, verbose_name="Хичээлийн нэр монгол")
    name_eng = models.CharField(max_length=500, null=True, verbose_name="Хичээлийн нэр англи")
    name_uig = models.CharField(max_length=500, null=True, verbose_name="Хичээлийн нэр уйгаржин")
    kredit = models.FloatField(verbose_name="Кредит")
    category = models.ForeignKey(LessonCategory, on_delete=models.SET_NULL, null=True, verbose_name="Хичээлийн ангилал")
    is_general = models.BooleanField(default=False, verbose_name='Ерөнхий эрдэм хичээл')
    definition = models.TextField(null=True, verbose_name="Хичээлийн тодорхойлолт")
    purpose = models.TextField(null=True, verbose_name="Хичээлийн зорилго")
    knowledge = models.TextField(null=True, verbose_name="Эзэмших мэдлэг")
    skill = models.TextField(null=True, verbose_name="Эзэмших ур чадвар")
    attitude = models.TextField(null=True, verbose_name="Хандлага төлөвшил")
    lecture_kr = models.FloatField(null=True, verbose_name="Лекцийн кредит")
    seminar_kr = models.FloatField(null=True, verbose_name="Семинарын кредит")
    laborator_kr = models.FloatField(null=True, verbose_name="Лабораторын кредит")
    practic_kr = models.FloatField(null=True, verbose_name="Практикийн кредит")
    biedaalt_kr = models.FloatField(null=True, verbose_name="Бие даалтын кредит")
    department = models.ForeignKey(Salbars, on_delete=models.SET_NULL, null=True, verbose_name="Хөтөлбөрийн баг")
    school = models.ForeignKey(SubOrgs, on_delete=models.SET_NULL, null=True, verbose_name="Сургууль")
    created_user = models.ForeignKey(User, related_name='lesson_cr_user', on_delete=models.SET_NULL, null=True, verbose_name="Бүртгэсэн хэрэглэгч")
    updated_user = models.ForeignKey(User, related_name='lesson_up_user', on_delete=models.SET_NULL, null=True, verbose_name="Зассан хэрэглэгч")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def code_name(self):
        return  self.code  + '-' + self.name


class Lesson_to_teacher(models.Model):

    def file_directory_path(instance, filename):
        return '{0}/{1}/{2}'.format(settings.LESSON_TEACHER, instance.id, filename)

    lesson = models.ForeignKey(LessonStandart, on_delete=models.PROTECT, verbose_name="Хичээл")
    teacher = models.ForeignKey(Teachers, on_delete=models.PROTECT, verbose_name="Багш")
    file = models.FileField(upload_to=file_directory_path, max_length=255, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('lesson', 'teacher')

class Lesson_teacher_scoretype(models.Model):

    QUIZ1 = 1
    QUIZ2 = 2
    IRTS = 3
    BIEDAALT1 = 4
    BIEDAALT2 = 5
    BUSAD = 6
    SHALGALT_ONOO = 7

    SCORE_TYPE = (
        (QUIZ1, "Сорил 1"),
        (QUIZ2, "Сорил 2"),
        (IRTS, "Ирц"),
        (BIEDAALT1, "Бие даалт 1"),
        (BIEDAALT2, "Бие даалт 2"),
        (BUSAD, "Бусад"),
        (SHALGALT_ONOO, "30 онооны шалгалт"),
    )

    lesson_teacher = models.ForeignKey(Lesson_to_teacher, on_delete=models.PROTECT, verbose_name="Хичээл багш")
    score_type = models.PositiveIntegerField(choices=SCORE_TYPE, db_index=True, default=BUSAD, verbose_name="Дүгнэх хэлбэр")
    score = models.FloatField(verbose_name="Дүгнэх хэлбэрт харгалзах багшийн оноо")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('lesson_teacher', 'score_type')

class Lesson_title_plan(models.Model):

    LAB = 1
    LECT = 2
    SEM = 3
    OTHER = 4
    PRACTIC = 5
    BIY_DAALT = 6

    LESSON_TYPE = (
        (LAB, 'Лаборатор'),
        (LECT, 'Лекц'),
        (SEM, 'Семинар'),
        (OTHER, 'Бусад'),
        (PRACTIC, 'Практик'),
        (BIY_DAALT, 'Бие даалт'),
    )
    lesson = models.ForeignKey(LessonStandart, on_delete=models.CASCADE, verbose_name="Хичээл")
    week = models.PositiveIntegerField(default=1, verbose_name="Долоо хоног")
    lesson_type = models.PositiveIntegerField(choices=LESSON_TYPE, db_index=True, default=LECT, verbose_name="Хичээллэх төрөл")
    title = models.CharField(max_length=500,null=True, verbose_name="Хичээлийн сэдэв")
    content = models.TextField(null=True, verbose_name="Агуулга")
    org = models.ForeignKey(Schools, on_delete=models.CASCADE, verbose_name="Байгууллага", null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('lesson', 'week', 'lesson_type')

class Lesson_materials(models.Model):

    def file_directory_path(instance, filename):
        return '{0}/{1}/{2}'.format(settings.LESSON, instance.id, filename)

    PPTX = 1
    VIDEO = 2
    BOOK = 3
    STANDART = 4
    HOMEWORK = 5
    GENERAL = 6
    EXAM = 7

    MATERIALS_TYPE = (
        (PPTX, "Хичээлийн лекц"),
        (VIDEO, "Видео хичээл"),
        (BOOK, "Ном, сурах бичиг"),
        (STANDART, "Жишиг хичээл"),
        (HOMEWORK, "Бие даалт"),
        (GENERAL, "Ерөнхий мэдээлэл"),
        (EXAM, "Шалгалт"),
    )

    SEND = 1
    APPROVE = 2
    REJECT = 3

    SEND_TYPE = (
        (SEND, 'ИЛГЭЭСЭН'),
        (APPROVE, 'БАТАЛСАН'),
        (REJECT, 'ТАТГАЛЗСАН'),
    )

    lesson = models.ForeignKey(LessonStandart, on_delete=models.CASCADE, verbose_name="Хичээл")
    only_teacher = models.BooleanField(default=True, verbose_name="Зөвхөн тухайн багшийн зааж буй оюутнуудад")
    teacher = models.ForeignKey(Teachers, on_delete=models.SET_NULL, null=True, verbose_name="Багш")
    week = models.PositiveIntegerField(verbose_name="Долоо хоног", null=True)
    body = models.TextField(verbose_name="Мэдээний хэсэг", null=True)
    material_type = models.PositiveIntegerField(choices=MATERIALS_TYPE, db_index=True, default=PPTX, verbose_name="Материалын төрөл")
    send_type = models.PositiveIntegerField(choices=SEND_TYPE, db_index=True, verbose_name="Материалын илгээсэн төрөл", null=True)
    title = models.CharField(max_length=500, verbose_name="Материалын нэр", null=True)
    description = models.TextField(null=True, verbose_name="Тайлбар")
    link = models.CharField(max_length=500, null=True, verbose_name="Холбоос хаяг")

    comment = models.TextField(null=True, verbose_name='ХБА татгалзсан тайлбар бичих')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class Lesson_material_file(models.Model):
    """ Материалын файлууд """

    def file_directory_path(instance, filename):
        return '{0}/{1}/{2}'.format(settings.LESSON, instance.id, filename)

    material = models.ForeignKey(Lesson_materials, on_delete=models.CASCADE, verbose_name='Материалийн файл')
    file = models.FileField(upload_to=file_directory_path, max_length=255, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class Lesson_assignment(models.Model):
    """ Багшийн даалгавар """

    lesson_material = models.ForeignKey(Lesson_materials, on_delete=models.CASCADE, verbose_name='Даалгаврын материал')
    score = models.FloatField(verbose_name='Оноо')

    start_date = models.DateTimeField(null=True, verbose_name="Эхлэх хугацаа")
    finish_date = models.DateTimeField(null=True, verbose_name="Дуусах хугацаа")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class AdmissionLesson(models.Model):
    """ ЭЕШ-ын хичээл """

    org = models.ForeignKey(Schools, on_delete=models.CASCADE, verbose_name="Байгууллага", null=True)
    lesson_code = models.CharField(max_length=20, unique=True, verbose_name='Элсэлтийн шалгалтын хичээлийн код')
    lesson_name = models.CharField(max_length=100, verbose_name='Элсэлтийн шалгалтын хичээлийн нэр')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class ProfessionDefinition(models.Model):
    """ Мэргэжлийн тодорхойлолт """

    EDUCATION = 1
    HUMANITY = 2
    SSIAJ = 3
    BMLAJ = 4
    NSMAS = 5
    ICT = 6
    EMC = 7
    AFFVM = 8
    HSC = 9
    SERVICE = 10

    GENERAL_DIRECT_TYPE = (
        (EDUCATION, 'Боловсрол'),
        (HUMANITY, 'Урлаг, хүмүүнлэг'),
        (SSIAJ, 'Нийгмийн шинжлэх ухаан, мэдээлэл, сэтгүүл зүй'),
        (BMLAJ, 'Бизнес, удирдахуй, хууль, эрх зүй'),
        (NSMAS, 'Байгалийн шинжлэх ухаан, математик, статистик'),
        (ICT, 'Мэдээлэл, харилцааны технологи'),
        (EMC, 'Инженер, үйлдвэрлэл, барилга угсралт'),
        (AFFVM, 'Хөдөө аж ахуй, ой, загасны аж ахуй, мал эмнэлэг'),
        (HSC, 'Эрүүл мэнд, нийгмийн халамж'),
        (SERVICE, 'Үйлчилгээ'),
    )

    profession_code = models.CharField(max_length=3, null=True, verbose_name="Мэргэжлийн код")
    code = models.CharField( max_length=50, verbose_name="Мэргэжлийн индекс")
    name = models.CharField(max_length=500, verbose_name="Мэргэжлийн нэр монгол")
    name_eng = models.CharField(max_length=500, null=True, verbose_name="Мэргэжлийн нэр англи")
    name_uig = models.CharField(max_length=500, null=True, verbose_name="Мэргэжлийн нэр уйгаржин")
    degree = models.ForeignKey(ProfessionalDegree, on_delete=models.PROTECT, verbose_name="Боловсролын зэрэг")
    dep_name = models.CharField(max_length=500, null=True, verbose_name="Мэргэжлийн төрөлжсөн чиглэл  монгол")
    dep_name_eng = models.CharField(max_length=500, null=True, verbose_name="Мэргэжлийн төрөлжсөн чиглэл англи")
    dep_name_uig = models.CharField(max_length=500, null=True, verbose_name="Мэргэжлийн төрөлжсөн чиглэл уйгаржин")
    dedication = models.TextField(null=True, verbose_name="Мэргэжлийн тодорхойлолт")
    requirement = models.TextField(null=True, verbose_name="Мэргэжлийн зорилго")
    knowledge_skill = models.TextField(null=True, verbose_name="Эзэмших мэдлэг чадвар")
    confirm_year = models.IntegerField(null=True, verbose_name="Хөтөлбөр батлагдсан он")
    duration = models.FloatField(null=True, verbose_name="Суралцах хугацаа")
    volume_kr = models.FloatField(null=True, verbose_name="Сургалтын агуулга багтаамж/багц цаг")
    introduction = models.TextField(null=True, verbose_name="Мэргэжлийн танилцуулга")
    is_together = models.BooleanField(verbose_name='Хамтарсан хөтөлбөр эсэх', default=False)
    department = models.ForeignKey(Salbars, on_delete=models.SET_NULL, null=True, verbose_name="Хөтөлбөрийн баг")
    school = models.ForeignKey(SubOrgs, on_delete=models.SET_NULL, null=True, verbose_name="Сургууль")
    poster_image = models.ImageField(upload_to='profession/', null=True, verbose_name='Танилцуулга зураг')
    created_user = models.ForeignKey(User, related_name='prof_cr_user', on_delete=models.SET_NULL, null=True, verbose_name="Бүртгэсэн хэрэглэгч")
    updated_user = models.ForeignKey(User, related_name='prof_up_user', on_delete=models.SET_NULL, null=True, verbose_name="Зассан хэрэглэгч")
    gen_direct_type = models.PositiveIntegerField(choices=GENERAL_DIRECT_TYPE, db_index=True, default=EDUCATION, verbose_name="Мэргэжлийн ерөнхий чиглэл")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # @property
    # def code_name(self):
    #     return f"{self.code} {self.name}"

class ProfessionAverageScore(models.Model):
    """ Хөтөлбөрийн хичээлийн жилийн дундаж оноо голч дүн """

    profession = models.ForeignKey(ProfessionDefinition, on_delete=models.PROTECT, verbose_name="Мэргэжил")
    lesson_year = models.CharField( max_length=20, verbose_name='Хичээлийн жил', null=True)
    lesson_season = models.ForeignKey(Season, verbose_name='Идэвхтэй улирал', on_delete=models.PROTECT, null=True)
    level = models.IntegerField(verbose_name='Курс')
    gpa_score = models.FloatField(verbose_name='Голч оноо')
    gpa = models.FloatField(verbose_name='Дүн')
    is_graduate = models.BooleanField(verbose_name='Төгсөж байгаа оюутнуудынх', default=False)
    student_count = models.IntegerField(verbose_name='Оюутны тоо')

    class Meta:
        unique_together = ('profession', 'lesson_year', 'lesson_season')


class AdmissionBottomScore(models.Model):
    """Элсэлтийн шалгалтын хичээл ба босго оноо мэргэжлээр"""

    GENERAL = 1
    SUPPORT = 2
    SCORE_TYPE = (
        (GENERAL, 'Суурь шалгалт'),
        (SUPPORT, 'Дагалдах шалгалт')
    )

    profession = models.ForeignKey(ProfessionDefinition, on_delete=models.PROTECT, verbose_name="Мэргэжил")
    admission_lesson = models.ForeignKey(AdmissionLesson, on_delete=models.PROTECT, verbose_name="ЭЕШ өгсөн хичээл")
    bottom_score = models.PositiveIntegerField(default=400, verbose_name="Босго оноо")
    score_type = models.PositiveIntegerField(choices=SCORE_TYPE, db_index=True, default=GENERAL, verbose_name="Шалгалтын хичээлийн төрөл")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class ProfessionIntroductionFile(models.Model):
    """Мэргэжлийн танилцуулга файл"""

    def file_directory_path(instance, filename):
        return '{0}/{1}/{2}'.format(settings.PROFESSION, instance.id, filename)

    profession = models.ForeignKey(ProfessionDefinition, on_delete=models.CASCADE,verbose_name="Мэргэжил")
    file = models.ImageField(upload_to=file_directory_path, max_length=255, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if self.id is None:
            saved_image = self.file
            self.file = None
            super(ProfessionIntroductionFile, self).save(*args, **kwargs)
            self.file = saved_image
            if 'force_insert' in kwargs:
                kwargs.pop('force_insert')

        super(ProfessionIntroductionFile, self).save(*args, **kwargs)


class LearningPlan(models.Model):
    """ Сургалтын төлөвлөгөө """
    BASIC = 1
    PROF_BASIC = 2
    PROFESSION = 3
    DIPLOM = 4
    QUALIFICATION = 5

    MAG_PROF_BASIC = 11
    MAG_PROFESSION = 12
    MAG_DIPLOM = 13

    DOC_PROF_BASIC = 21
    DOC_PROFESSION = 22
    DOC_DIPLOM = 23

    LESSON_LEVEL = (
        (BASIC, 'Дээд боловсролын суурь хичээл'),
        (PROF_BASIC, 'Мэргэжлийн суурь хичээл'),
        (PROFESSION, 'Мэргэжлийн хичээл'),
        (QUALIFICATION, 'Мэргэших хичээл'),
        (DIPLOM, 'Диплом'),

        (MAG_PROF_BASIC, 'Мэргэжлийн суурь хичээл'),
        (MAG_PROFESSION, 'Мэргэжлийн хичээл'),
        (MAG_DIPLOM, 'Туршилт, сорил, мэргэжлийн шалгалт'),

        (DOC_PROF_BASIC, 'Мэргэжлийн суурь хичээл'),
        (DOC_PROFESSION, 'Мэргэжлийн хичээл'),
        (DOC_DIPLOM, 'Эрдэм шинжилгээ, судалгааны ажил'),
    )
    ZAAVAL = 1
    SONGON = 2
    DADLAGA = 3
    SUDALGAA = 4
    ONOL = 5

    LESSON_TYPE = (
        (ZAAVAL, 'Заавал үзэх'),
        (SONGON, 'Сонгон судлах'),
        (DADLAGA, 'Дадлага'),
        (SUDALGAA, 'Судалгааны аргазүй'),
        (ONOL, 'Онолын суурь хичээл'),
    )

    profession = models.ForeignKey(ProfessionDefinition, on_delete=models.PROTECT, verbose_name="Мэргэжил")
    lesson = models.ForeignKey(LessonStandart, related_name="less", on_delete=models.PROTECT, verbose_name="Хичээл")
    previous_lesson = models.ForeignKey(LessonStandart, related_name="prev_less", on_delete=models.SET_NULL, null=True, verbose_name="Өмнөх холбоо хичээл")
    group_lesson = models.ForeignKey(LessonStandart, related_name="group_less", on_delete=models.SET_NULL, null=True, verbose_name="Дүн нэгтгэх хичээл")
    lesson_level = models.PositiveIntegerField(choices=LESSON_LEVEL, db_index=True, null=False, default=BASIC, verbose_name="Хичээлийн түвшин")
    lesson_type = models.PositiveIntegerField(choices=LESSON_TYPE, db_index=True, null=False, default=ZAAVAL, verbose_name="Хичээлийн төрөл")
    season = models.CharField(null=True, max_length=50, verbose_name="Хичээл үзэх улирал")
    is_check_score = models.BooleanField(default=False, verbose_name='74 -өөс дээш үнэлгээгээр тэнцэх эсэх')

    department = models.ForeignKey(Salbars, on_delete=models.SET_NULL, null=True, verbose_name="Хөтөлбөрийн баг")
    school = models.ForeignKey(SubOrgs, on_delete=models.SET_NULL, null=True, verbose_name="Сургууль")
    created_user = models.ForeignKey(User, related_name='plan_cr_user', on_delete=models.SET_NULL, null=True, verbose_name="Бүртгэсэн хэрэглэгч")
    updated_user = models.ForeignKey(User, related_name='plan_up_user', on_delete=models.SET_NULL, null=True, verbose_name="Зассан хэрэглэгч")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('profession', 'lesson', 'school')


class Profession_SongonKredit(models.Model):
    """ Cонгоны кредит """

    profession = models.ForeignKey(ProfessionDefinition, on_delete=models.CASCADE, verbose_name="Мэргэжил")
    lesson_level = models.PositiveIntegerField(choices=LearningPlan.LESSON_LEVEL, db_index=True, default=LearningPlan.BASIC, verbose_name="Хичээлийн түвшин")
    songon_kredit = models.FloatField(null=True, verbose_name="Сонгон судлах кредит")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


# -------------------------------- Системийн тохиргоо --------------------


class SystemSettings(models.Model):

    ACTIVE = 1
    INACTIVE = 2
    CLOSED = 3

    SEASON_TYPE = (
        (ACTIVE, 'Идэвхитэй'),
        (INACTIVE, 'Идэвхигүй'),
        (CLOSED, 'Хаагдсан'),
    )

    org = models.ForeignKey(Schools, on_delete=models.CASCADE, verbose_name="Байгууллага", null=True)
    active_lesson_year = models.CharField( max_length=20, verbose_name='Идэвхтэй хичээлийн жил')
    active_lesson_season = models.ForeignKey(Season, related_name='active', on_delete=models.SET_NULL, null=True, verbose_name='Идэвхтэй улирал')
    prev_lesson_year = models.CharField(max_length=20, verbose_name='Өмнөх хичээлийн жил')
    prev_lesson_season = models.ForeignKey(Season, related_name='previous', on_delete=models.SET_NULL, null=True, verbose_name='Өмнөх улирал')
    start_date = models.DateField(verbose_name='Эхлэх хугацаа')
    finish_date = models.DateField(verbose_name='Дуусах хугацаа')
    season_type = models.PositiveIntegerField(choices=SEASON_TYPE, db_index=True, null=False, default=INACTIVE, verbose_name="Улирлын төлөв")
    created_user = models.ForeignKey(User, related_name='setting_cr_user', on_delete=models.SET_NULL, null=True, verbose_name="Бүртгэсэн хэрэглэгч")
    updated_user = models.ForeignKey(User, related_name='setting_up_user', on_delete=models.SET_NULL, null=True, verbose_name="Зассан хэрэглэгч")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = SystemSettingsManager()

    class Meta:
        unique_together = ('active_lesson_year', 'active_lesson_season', 'org')


# -------------------------------- Оюутны бүртгэл --------------------
class Group(models.Model):
    """ Ангийн бүртгэл """

    name = models.CharField(max_length=100, verbose_name='Ангийн нэр')
    profession = models.ForeignKey(ProfessionDefinition, on_delete=models.PROTECT, verbose_name='Мэргэжил')
    degree = models.ForeignKey(ProfessionalDegree, on_delete=models.PROTECT,verbose_name='Боловсролын зэрэг')
    level = models.IntegerField(verbose_name='Курс')
    learning_status = models.ForeignKey(Learning, on_delete=models.PROTECT, verbose_name='Суралцах хэлбэр')
    join_year = models.CharField(max_length=10, null=True, verbose_name='Элссэн хичээлийн жил')
    teacher = models.ForeignKey(Teachers, on_delete=models.SET_NULL, null=True, verbose_name='Ангийн багш')
    department = models.ForeignKey(Salbars, on_delete=models.SET_NULL, null=True, verbose_name="Хөтөлбөрийн баг")
    school = models.ForeignKey(SubOrgs, on_delete=models.SET_NULL, null=True, verbose_name="Сургууль")
    is_finish = models.BooleanField(default=False, verbose_name="Төгссөн эсэх")
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('profession', 'degree', 'learning_status', 'join_year','name')


class Student(models.Model):
    """ Оюутан """

    def user_directory_path(instance, filename):
        return '{0}/{1}/{2}'.format(settings.STUDENTS, instance.id, filename)


    GENDER_MALE = 1
    GENDER_FEMALE = 2
    GENDER_OTHER = 3

    GENDER_TYPE = (
        (GENDER_MALE, 'эрэгтэй'),
        (GENDER_FEMALE, 'эмэгтэй'),
        (GENDER_OTHER, 'бусад'),
    )

    VISUAL = 1
    AUDITORY = 2
    SPEECH = 3
    MOVEMENT = 4
    MENTAL = 5
    ATTACHED = 6
    OTHER = 7

    DEVELOPMENT_DIFFICULTY = (
        (VISUAL, 'Харааны'),
        (AUDITORY, 'Сонсголын'),
        (SPEECH, 'Ярианы'),
        (MOVEMENT, 'Хөдөлгөөний'),
        (MENTAL, 'Сэтгэцийн'),
        (ATTACHED, 'Хавсарсан'),
        (OTHER, 'Бусад'),
    )

    IG = 1
    GG = 2
    LEL = 3
    GRANTS = 4
    IEEOF = 5
    SCHOLARSHIP = 6
    EXPENSES = 7
    OTHER = 8

    PAY_TYPE = (
        (IG, 'Засгийн газар хоорондын тэтгэлэг'),
        (GG, 'Төрөөс үзүүлэх тэтгэлэг'),
        (LEL, 'Боловсролын зээлийн сангийн хөнгөлөлттэй зээл'),
        (GRANTS, 'Төрөөс үзүүлэх буцалтгүй тусламж'),
        (IEEOF, 'Дотоод, гадаадын аж ахуйн нэгж, байгууллага, сан, хүвь хүний нэрэмжит тэтгэлэг'),
        (SCHOLARSHIP, 'Тухайн сургуулийн тэтгэлэг'),
        (EXPENSES, 'Хувийн зардал'),
        (OTHER, 'Бусад'),
    )

    code = models.CharField(unique=True, max_length=50, verbose_name='Оюутны код')
    family_name = models.CharField(max_length=100, null=True, verbose_name='Ургийн овог')
    last_name = models.CharField(max_length=100, verbose_name='Эцэг/эхийн нэр')
    first_name = models.CharField(max_length=100, verbose_name='Өөрийн нэр')
    register_num = models.CharField(max_length=20,  null=True, verbose_name='Регистрийн дугаар')
    foregin_password = models.CharField(max_length=50,  null=True, verbose_name='Гадаад пасспорт дугаар')
    gender = models.PositiveIntegerField(choices=GENDER_TYPE, db_index=True, null=False, default=GENDER_OTHER, verbose_name="Хүйс")
    yas_undes = models.CharField(max_length=100, null=True, verbose_name='Яс үндэс')
    citizenship = models.ForeignKey(Country, on_delete=models.SET_NULL, null=True, verbose_name='Харьяалал')
    birth_date = models.DateField(null=True, verbose_name="Төрсөн он сар өдөр")
    unit1 =  models.ForeignKey(AimagHot, on_delete=models.SET_NULL, null=True, verbose_name='Аймаг хот')
    unit2 = models.ForeignKey(SumDuureg, on_delete=models.SET_NULL, null=True, verbose_name='Сум дүүрэг')
    group = models.ForeignKey(Group, on_delete=models.PROTECT, verbose_name='Анги')
    status = models.ForeignKey(StudentRegister, on_delete=models.PROTECT,verbose_name='Бүртгэлийн байдал')
    phone = models.CharField(max_length=50, null=True, verbose_name='Утас')
    email = models.CharField(max_length=200, null=True, verbose_name="Цахим шуудангийн хаяг")
    last_name_eng = models.CharField(max_length=100, verbose_name='Эцэг эхийн англи нэр', null=True)
    first_name_eng = models.CharField(max_length=100, verbose_name='Өөрийн англи нэр', null=True)
    last_name_uig = models.CharField(max_length=100, verbose_name='Эцэг эхийн уйгаржин нэр', null=True)
    first_name_uig = models.CharField(max_length=100, verbose_name='Өөрийн уйгаржин нэр', null=True)
    admission_date = models.DateField(null=True, verbose_name="Элсэлтийн тушаалын огноо")
    admission_number = models.CharField(null=True, max_length=50, verbose_name="Элсэлтийн тушаалын дугаар")
    admission_before = models.CharField(max_length=100, null=True, verbose_name="Элсэхийн өмнөх байдал")
    private_score = models.FloatField(default=1000, verbose_name="Хувийн оноо")
    eysh_score = models.IntegerField(null=True, verbose_name="ЭЕШ-н оноо")
    secondary_school = models.CharField(null=True, verbose_name="Өмнөх шатны боловсролын үнэлгээний оноо", max_length=6)

    before_diplom_num = models.CharField(verbose_name='Өмнөх боловсролын гэрчилгээний дугаар', null=True, max_length=255)
    diplom_num = models.CharField(verbose_name='Диплом дугаар', null=True, max_length=255)
    is_active = models.BooleanField(default=True, verbose_name='Оюутны эрх нээлттэй эсэх')

    qr_image = models.BinaryField(verbose_name='Оюутны код QR', editable=True, null=True)
    barcode_image = models.BinaryField(verbose_name='Оюутны barcode QR', editable=True, null=True)
    definition_qr = models.BinaryField(verbose_name='Тодорхойлолтын QR', editable=True, null=True)

    image = models.ImageField(upload_to=user_directory_path, max_length=255, null=True)
    department = models.ForeignKey(Salbars, on_delete=models.SET_NULL, null=True, verbose_name="Хөтөлбөрийн баг")
    school = models.ForeignKey(SubOrgs, on_delete=models.SET_NULL, null=True, verbose_name="Сургууль")
    created_user = models.ForeignKey(User, related_name='student_cr_user', on_delete=models.SET_NULL, null=True, verbose_name="Бүртгэсэн хэрэглэгч")
    updated_user = models.ForeignKey(User, related_name='student_up_user', on_delete=models.SET_NULL, null=True, verbose_name="Зассан хэрэглэгч")
    is_mental = models.BooleanField(default=False, null=True, verbose_name='Хөгжлийн бэрхшээлтэй эсэх')
    mental_type = models.PositiveIntegerField(choices=DEVELOPMENT_DIFFICULTY,null=True, db_index=True, verbose_name="Хөгжлийн бэрхшээлийн төрөл")
    pay_type = models.PositiveIntegerField(choices=PAY_TYPE, db_index=True, default=EXPENSES, verbose_name="Төлбөр төлөлт")

    order_number = models.CharField(max_length=100, blank=True, verbose_name="Тушаалын дугаар")
    order_date = models.DateField(null=True, verbose_name="Тушаалын огноо")

    home_phone = models.CharField(max_length=50, null=True, verbose_name='Гэрийн Утас')


    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def full_name(self):

        ovog = f"{self.last_name[0].upper()}." if self.last_name else ""
        name = self.first_name.capitalize()

        if ovog and name:
            return f"{ovog}{name}"

        if name:
            return name

        return ""


class MedalType(models.Model):
    """ Медалын төрөл """

    image = models.BinaryField(verbose_name='Медалын зураг', editable=True, null=True)
    name = models.CharField(max_length=500, db_index=True, verbose_name="Нэр")


class StudentMedal(models.Model):
    """ Оюутны медал """

    student = models.ForeignKey(Student, on_delete=models.PROTECT, verbose_name="Оюутан")
    medals = ArrayField(models.IntegerField(null=True), blank=True, null=True, verbose_name='Медалууд')
    is_viewed = ArrayField(models.IntegerField(null=True), blank=True, null=True, verbose_name='Оюутны харсан медалын мэдээлэл')


class StudentAddress(models.Model):
    """ Оюутны хаягийн мэдээлэл """

    student = models.ForeignKey(Student, on_delete=models.PROTECT, verbose_name="")
    passport_unit1 = models.ForeignKey(AimagHot, related_name="pass_unit1", on_delete=models.SET_NULL, null=True, verbose_name="Иргэний үнэмлэхний аймаг хот")
    passport_unit2 = models.ForeignKey(SumDuureg, related_name="pass_unit2", on_delete=models.SET_NULL, null=True, verbose_name="Иргэний үнэмлэхний сум дүүрэг")
    passport_unit3 = models.ForeignKey(BagHoroo, related_name="pass_unit3", on_delete=models.SET_NULL, null=True, verbose_name="Иргэний үнэмлэхний баг хороо")
    passport_toot = models.CharField(max_length=50, null=True, verbose_name="Тоот")
    passport_other = models.CharField(max_length=500, null=True, verbose_name="Бусад")
    lived_unit1 = models.ForeignKey(AimagHot, related_name="live_unit1", on_delete=models.SET_NULL, null=True, verbose_name="Амьдарч буй аймаг хот")
    lived_unit2 = models.ForeignKey(SumDuureg, related_name="live_unit2", on_delete=models.SET_NULL, null=True, verbose_name="Амьдарч буй сум дүүрэ")
    lived_unit3 = models.ForeignKey(BagHoroo, related_name="live_unit3", on_delete=models.SET_NULL, null=True, verbose_name="Амьдарч буй баг хороо")
    lived_toot = models.CharField(max_length=50, null=True, verbose_name="Тоот")
    lived_other = models.CharField(max_length=500, null=True, verbose_name="Бусад")


class StudentFamily(models.Model):
    """ Гэр бүлийн байдал """

    student = models.ForeignKey(Student, on_delete=models.CASCADE, verbose_name='Оюутан')
    member = models.CharField(max_length=30, verbose_name="Оюутны хэн болох", null=True)
    last_name = models.CharField(max_length=100, verbose_name='Эцэг/Эхийн нэр')
    first_name = models.CharField(max_length=100, verbose_name='Өөрийн нэр')
    register_num = models.CharField(max_length=20, verbose_name='Регистрийн дугаар')
    employment = models.CharField(max_length=250, null=True, verbose_name='Ажил эрхлэлт')
    phone = models.CharField(max_length=50, null=True, verbose_name='Утас')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class StudentEducation(models.Model):
    """ Боловсрол """
    EDUCATION_SOB = 1
    EDUCATION_BAGA = 2
    EDUCATION_BUREN = 3
    EDUCATION_MERGEJLIIN = 4
    EDUCATION_DEED = 5

    EDUCATION_GRADE = (
        (EDUCATION_SOB, 'СӨБ'),
        (EDUCATION_BAGA, 'Бага, суурь'),
        (EDUCATION_BUREN, 'Бүрэн дунд'),
        (EDUCATION_MERGEJLIIN, 'Мэргэжлийн боловсрол'),
        (EDUCATION_DEED, 'Дээд боловсрол'),
    )


    student = models.ForeignKey(Student, on_delete=models.CASCADE, verbose_name='Оюутан')
    country = models.ForeignKey(Country, on_delete=models.SET_NULL, null=True, verbose_name='Улс')
    school_name = models.CharField(max_length=250, null=True, verbose_name='Сургуулийн нэр')
    edu_level = models.PositiveIntegerField(choices=EDUCATION_GRADE, db_index=True, default=EDUCATION_BUREN, verbose_name="Боловсролын түвшин", null=True)
    join_year = models.CharField(max_length=10, verbose_name='Элссэн он')
    graduate_year = models.CharField(max_length=10, verbose_name='Төгссөн он')
    profession = models.CharField(max_length=250, null=True, verbose_name='Эзэмшсэн мэргэжил')
    certificate_num = models.CharField(max_length=100, verbose_name='Диплом/Сертификатын дугаар')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class StudentAdmissionScore(models.Model):
    """ ЭЕШ-ын оноо """

    student = models.ForeignKey(Student, on_delete=models.CASCADE, verbose_name='Оюутан')
    confirmation_num = models.CharField(max_length=50, verbose_name='ЭЕШ-ын батламжийн дугаар')
    admission_lesson = models.ForeignKey(AdmissionLesson, on_delete=models.PROTECT, verbose_name='Элсэлтийн шалгалтын хичээл')
    score = models.FloatField(verbose_name='Оноо')
    perform = models.FloatField(verbose_name='Гүйцэтгэлийн хувь')
    exam_year = models.CharField(max_length=10, null=True, verbose_name='Шалгалт өгсөн он')
    exam_location = models.CharField(max_length=250, null=True, verbose_name='Шалгалт өгсөн газар')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class GraduationWork(models.Model):
    """ Төгсөлтийн ажил """

    ATTACHMENT_DIPLOMA = 1
    ATTACHMENT_SHALGALT = 2

    ATTACHMENT_TYPE = (
        (ATTACHMENT_DIPLOMA, 'Диплом'),
        (ATTACHMENT_SHALGALT, 'Шалгалт'),
    )

    student = models.ForeignKey(Student, on_delete=models.PROTECT, verbose_name='Оюутан')
    diplom_qr = models.BinaryField(verbose_name='Дипломын QR', editable=True, null=True)
    lesson_year = models.CharField(max_length=20, verbose_name='Хичээлийн жил')
    lesson_season = models.ForeignKey(Season, on_delete=models.SET_NULL, null=True, verbose_name='Улирал')
    lesson_type = models.PositiveIntegerField(choices=ATTACHMENT_TYPE, db_index=True, default=ATTACHMENT_DIPLOMA, verbose_name="Боловсролын түвшин", null=True)
    lesson = models.ManyToManyField(LessonStandart, blank=True, verbose_name="Хичээл")
    diplom_topic = models.CharField(max_length=250, null=True, verbose_name='Төгсөлтийн ажлын сэдэв монгол')
    diplom_topic_eng = models.CharField(max_length=250, null=True, verbose_name='Төгсөлтийн ажлын сэдэв англи')
    diplom_topic_uig = models.CharField(max_length=250, null=True, verbose_name='Төгсөлтийн ажлын сэдэв уйгаржин')
    leader = models.CharField(max_length=250, null=True, verbose_name="Удирдагчийн овог нэр цол")
    teacher = models.ForeignKey(Teachers, on_delete=models.SET_NULL, null=True)
    graduation_date = models.DateField(null=True, verbose_name="Төгсөлтийн тушаалын огноо")
    graduation_number = models.CharField(null=True, max_length=50, verbose_name="Төгсөлтийн тушаалын дугаар")
    decision_date = models.DateField(null=True, verbose_name="Шийдвэрийн огноо")
    diplom_num = models.CharField(max_length=50, null=True, verbose_name='Дипломын дугаар')
    back_diplom_num = models.CharField(max_length=50, null=True, verbose_name='Бакалаврын дипломын дугаар')
    registration_num = models.CharField(max_length=50, null=True, verbose_name='Бүртгэлийн дугаар')
    shalgalt_onoo = models.CharField(max_length=50, null=True, verbose_name='Шалгалтын оноо')
    is_check = models.BooleanField(default=False, verbose_name='Дипломын мэдээлэлтэй танилцсан эсэх')

    created_user = models.ForeignKey(User, related_name='grad_cr_user', on_delete=models.SET_NULL, null=True, verbose_name="Бүртгэсэн хэрэглэгч")
    updated_user = models.ForeignKey(User, related_name='grad_up_user', on_delete=models.SET_NULL, null=True, verbose_name="Зассан хэрэглэгч")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('student', 'lesson_year', 'lesson_season')


class StudentMovement(models.Model):
    """ Оюутны шилжилт хөдөлгөөн  """

    student = models.OneToOneField(Student, unique=True, related_name="old_st", on_delete=models.PROTECT, verbose_name='Оюутан')
    lesson_year = models.CharField(max_length=20, verbose_name='Хичээлийн жил')
    lesson_season = models.ForeignKey(Season, on_delete=models.SET_NULL, null=True, verbose_name='Улирал')
    is_internal = models.BooleanField(verbose_name='Сургууль доторх шилжилт эсэх')
    destination_school = models.ForeignKey(SubOrgs, related_name="new_school", on_delete=models.SET_NULL, null=True, verbose_name='Очих сургуулийн нэр')
    description = models.CharField(max_length=250, null=True, verbose_name='Тайлбар')
    statement = models.CharField(max_length=100, null=True,verbose_name='Тушаал')
    statement_date = models.DateField(null=True, verbose_name='Тушаалын огноо')
    student_new = models.ForeignKey(Student, related_name="new_st", on_delete=models.SET_NULL, null=True, verbose_name='Оюутан шинэ код')
    school = models.ForeignKey(SubOrgs, related_name="old_school", on_delete=models.SET_NULL, null=True, verbose_name="Сургууль")
    group = models.ForeignKey(Group,  on_delete=models.SET_NULL, null=True, verbose_name="Анги")
    created_user = models.ForeignKey(User, related_name='move_cr_user', on_delete=models.SET_NULL, null=True, verbose_name="Бүртгэсэн хэрэглэгч")
    updated_user = models.ForeignKey(User, related_name='move_up_user', on_delete=models.SET_NULL, null=True, verbose_name="Зассан хэрэглэгч")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class StudentLeave(models.Model):
    """ Оюутны чөлөөний бүртгэл """

    student = models.ForeignKey(Student, on_delete=models.PROTECT, verbose_name='Оюутан')
    lesson_year = models.CharField(max_length=20, verbose_name='Хичээлийн жил')
    lesson_season = models.ForeignKey(Season, on_delete=models.SET_NULL, null=True, verbose_name='Улирал')
    register_status = models.ForeignKey(StudentRegister, on_delete=models.PROTECT, verbose_name="Бүртгэлийн хэлбэр")
    learn_week = models.PositiveIntegerField(default=0, verbose_name="Хичээллэсэн 7 хоног")
    description = models.CharField(max_length=250, null=True, verbose_name='Тайлбар')
    statement = models.CharField(max_length=100, null=True,verbose_name='Тушаал')
    statement_date = models.DateField(null=True, verbose_name='Тушаалын огноо')
    school = models.ForeignKey(SubOrgs, on_delete=models.SET_NULL, null=True, verbose_name="Сургууль")
    created_user = models.ForeignKey(User, related_name='lv_cr_user', on_delete=models.SET_NULL, null=True, verbose_name="Бүртгэсэн хэрэглэгч")
    updated_user = models.ForeignKey(User, related_name='lv_up_user', on_delete=models.SET_NULL, null=True, verbose_name="Зассан хэрэглэгч")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('student', 'lesson_year', 'lesson_season')


class StudentLogin(AbstractUser):
    """ Оюутны нэвтрэх """

    student = models.ForeignKey(Student, on_delete=models.CASCADE, verbose_name='Оюутан')
    username = models.CharField(max_length=100, verbose_name='Нэвтрэх нэр')
    password = models.CharField(max_length=256, verbose_name='Нууц үг')
    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # region to avoid circular conflict
    groups = models.ManyToManyField(
        AbstractGroup,
        related_name="abstract_group",
        blank=True,
        help_text="The groups this user belongs to."
    )
    user_permissions = models.ManyToManyField(
        Permission,
        related_name="abstract_permissions",
        blank=True,
        help_text="Specific permissions for this user."
    )
    # endregion


class Lesson_assignment_student(models.Model):
    """ Багшийн даалгаварт хариу илгээх """

    SEND = 1
    CHECKED = 2

    ASSIGNMENT_TYPE = (
        (SEND, 'Илгээсэн'),
        (CHECKED, 'Дүгнэгдсэн'),
    )

    assignment = models.ForeignKey(Lesson_assignment, on_delete=models.PROTECT, verbose_name='Даалгавар')
    student = models.ForeignKey(Student,  on_delete=models.CASCADE, verbose_name='Оюутан' )

    status = models.PositiveIntegerField(choices=ASSIGNMENT_TYPE, db_index=True, default=SEND, verbose_name="Даалгаврын төрөл", null=True)

    description = models.TextField(verbose_name='Тайлбар', null=True)

    score = models.FloatField(verbose_name='Багшийн өгсөн оноо', null=True)
    score_comment = models.TextField(verbose_name='Тайлбар', null=True)

    start_date = models.DateTimeField(null=True, verbose_name="Эхлэх хугацаа")
    finish_date = models.DateTimeField(null=True, verbose_name="Дуусах хугацаа")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class Lesson_assignment_student_file(models.Model):
    """ Багшийн даалгаварт оюутан хариу илгээсэн файлууд """

    def file_directory_path(instance, filename):
        return '{0}/{1}/{2}'.format(settings.ASSIGNMENT, instance.id, filename)

    student_assignment = models.ForeignKey(Lesson_assignment_student, on_delete=models.CASCADE, verbose_name='Даалгаварын хариу')
    file = models.FileField(upload_to=file_directory_path, max_length=255, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


#--------------------------------------Хичээлийн хуваарь бүртгэл----------------------------------------------------


class Building(models.Model):
    """ Хичээлийн байр """

    code = models.CharField(max_length=20, verbose_name='Хичээлийн байрны код')
    name = models.CharField(max_length=100, verbose_name='Хичээлийн байрна нэр')
    org = models.ForeignKey(Schools, on_delete=models.CASCADE, null=True, blank=True, verbose_name="Харьяалагдах сургууль")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class Room(models.Model):
    """ Хичээлийн байр """

    ROOM_LAB = 1
    ROOM_LECT = 2
    ROOM_SEM = 3
    ROOM_SPORT = 4
    ROOM_LIBRARY = 5
    ROOM_GYM = 6
    ROOM_OTHER = 7

    ROOM_TYPE = (
        (ROOM_LAB, 'Лаборатор'),
        (ROOM_LECT, 'Лекц'),
        (ROOM_SEM, 'Семинар'),
        (ROOM_SPORT, 'Спорт заал'),
        (ROOM_LIBRARY, 'Номын сан'),
        (ROOM_GYM, 'Бялдаржуулах төв'),
        (ROOM_OTHER, 'Бусад'),
    )
    code = models.CharField(max_length=20, verbose_name='Өрөөний дугаар')
    name = models.CharField(max_length=100, verbose_name='Өрөөний нэр', null=True)
    description = models.CharField(max_length=100, null=True, verbose_name='Тайлбар')
    type = models.PositiveIntegerField(choices=ROOM_TYPE, db_index=True, default=ROOM_LECT, verbose_name="Өрөөний төрөл", null=True)
    volume = models.IntegerField(null=True, verbose_name="Өрөөний багтаамж")
    building = models.ForeignKey(Building, on_delete=models.SET_NULL, null=True, verbose_name="Хичээлийн байр")
    school = models.ForeignKey(SubOrgs, verbose_name="Сургууль", on_delete=models.CASCADE, null=True,)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('code', 'building')

    @property
    def full_name(self):
        """ Өрөөний нэр дугаар багтаамж төрөл"""

        full_name = ''
        code = self.code
        name = self.name
        building = self.building.code if self.building else ''

        volume = self.volume

        if building:
            full_name += building + '-'

        if code:
            full_name = full_name + code

        if name:
            full_name = full_name +  ' ' + name

        if volume:
            volume = str(volume)
            full_name = full_name + ' (' + volume +')'

        return full_name


class TimeTable(models.Model):
    """ Хичээлийн хуваарь """

    MONDAY = 1
    TUESDAY = 2
    WENDESDAY = 3
    THURSDAY = 4
    FRIDAY = 5
    SATURDAY = 6
    SUNDAY = 7

    LESSON_DAY = (
        (MONDAY, 'Даваа'),
        (TUESDAY, 'Мягмар'),
        (WENDESDAY, 'Лхагва'),
        (THURSDAY, 'Пүрэв'),
        (FRIDAY, 'Баасан'),
        (SATURDAY, 'Бямба'),
        (SUNDAY, 'Ням'),
    )

    FIRST = 1
    SECOND = 2
    THIRD = 3
    FOURTH = 4
    FIFTH = 5
    SIXTH = 6
    SEVENTH = 7
    EIGHTH = 8

    LESSON_TIME = (
        (FIRST, '1-р пар'),
        (SECOND, '2-р пар'),
        (THIRD, '3-р пар'),
        (FOURTH, '4-р пар'),
        (FIFTH, '5-р пар'),
        (SIXTH, '6-р пар'),
        (SEVENTH, '7-р пар'),
        (EIGHTH, '8-р пар'),
    )

    LAB = 1
    LECT = 2
    SEM = 3
    OTHER = 4
    PRACTIC = 5
    BIY_DAALT = 6

    LESSON_TYPE = (
        (LAB, 'Лаборатор'),
        (LECT, 'Лекц'),
        (SEM, 'Семинар'),
        (OTHER, 'Бусад'),
        (PRACTIC, 'Дадлага'),
        (BIY_DAALT, 'Бие даалт'),
    )

    ODD = 1
    EVEN = 2
    ALL = 3

    ODD_EVEN_VALUE = (
        (ODD, 'Сондгой'),
        (EVEN, 'Тэгш'),
        (ALL, 'Тогтмол'),
    )

    TANHIM = 1
    ONLINE = 2
    COMBINED = 3

    STUDY_TYPE = (
        (TANHIM, 'Танхим'),
        (ONLINE, 'Онлайн'),
        (COMBINED, 'Хосолсон'),
    )

    lesson_year = models.CharField(max_length=10, verbose_name="Хичээлийн жил")
    lesson_season = models.ForeignKey(Season, on_delete=models.PROTECT, verbose_name="Улирал")
    lesson = models.ForeignKey(LessonStandart, on_delete=models.PROTECT, verbose_name="Хичээл")
    teacher = models.ForeignKey(Teachers, on_delete=models.PROTECT, verbose_name="Багш", null=True)
    study_type = models.PositiveIntegerField(choices=STUDY_TYPE, db_index=True, default=TANHIM, verbose_name="Хичээл орох хэлбэр")
    room = models.ForeignKey(Room, on_delete=models.PROTECT, null=True, verbose_name="Хичээллэх өрөө")
    st_count = models.PositiveIntegerField(null=True, verbose_name="Оюутны тоо")
    day = models.PositiveIntegerField(choices=LESSON_DAY, db_index=True, default=MONDAY, verbose_name="Өдөр")
    time = models.PositiveIntegerField(choices=LESSON_TIME, db_index=True, default=FIRST, verbose_name="Цаг")

    choosing_times = ArrayField(models.IntegerField(null=True), blank=True,null=True,verbose_name='Сонгогдох цаг')
    choosing_deps = ArrayField(models.IntegerField(null=True), blank=True, null=True,verbose_name='Сонгогдох тэнхим')
    choosing_levels = ArrayField(models.IntegerField(null=True), blank=True,null=True,verbose_name='Сонгогдох курс')

    odd_even = models.PositiveIntegerField(choices=ODD_EVEN_VALUE, db_index=True, default=ALL, verbose_name="Тэгш сондгой")
    potok = models.PositiveIntegerField(default=1, verbose_name="Поток")
    type = models.PositiveIntegerField(choices=LESSON_TYPE, db_index=True, default=OTHER, verbose_name="Хичээллэх төрөл")
    is_optional = models.BooleanField(default=False, verbose_name="Сонгон хичээл эсэх")
    is_block = models.BooleanField(default=False, verbose_name="Блок эсэх")
    begin_week = models.PositiveIntegerField(null=True, verbose_name="Эхлэх долоо хоног")
    end_week = models.PositiveIntegerField(null=True, verbose_name="Дуусах долоо хоног")
    is_kurats = models.BooleanField(default=False, verbose_name="Курац эсэх")
    week_number = models.PositiveIntegerField(null=True, verbose_name="7 хоногийн дугаар")
    parent_kurats = models.ForeignKey("self", null=True, on_delete=models.CASCADE)
    begin_date = models.DateField(null=True, verbose_name="Эхлэх огноо")
    end_date = models.DateField(null=True, verbose_name="Дуусах огноо")
    color = models.CharField(max_length=250, null=True, verbose_name="Өнгө")
    kurats_room = models.CharField(max_length=200, null=True, verbose_name="Курацийн хичээл орох байрлал")
    support_teacher = ArrayField(models.IntegerField(null=True), blank=True,null=True,verbose_name='Туслах багш')

    school = models.ForeignKey(SubOrgs, verbose_name="Сургууль", on_delete=models.SET_NULL, null=True,)
    department = models.ForeignKey(Salbars, verbose_name="Салбар", on_delete=models.SET_NULL, null=True,)
    created_user = models.ForeignKey(User, related_name='tt_cr_user', on_delete=models.SET_NULL, null=True, verbose_name="Бүртгэсэн хэрэглэгч")
    updated_user = models.ForeignKey(User, related_name='tt_up_user', on_delete=models.SET_NULL, null=True, verbose_name="Зассан хэрэглэгч")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['lesson_year', 'lesson_season','teacher', 'day', 'time', 'odd_even', 'begin_date', 'week_number'], name='teacher constraint'),
            models.UniqueConstraint(fields=['lesson_year', 'lesson_season','room', 'day', 'time', 'odd_even', 'begin_date', 'week_number'], name='room constraint')
        ]

    def update(self, *args, **kwargs):
        kwargs.update({'updated_at': timezone.now})
        super().update(*args, **kwargs)

        return self


class TimeTable_to_group(models.Model):
    """ Хичээлийн хуваарьт хичээллэх анги """

    timetable = models.ForeignKey(TimeTable, on_delete=models.CASCADE, verbose_name="Хичээлийн хуваарь")
    group = models.ForeignKey(Group, on_delete=models.PROTECT, verbose_name="Анги")
    is_online = models.BooleanField(default=False, verbose_name='Онлайнаар хичээл үзэх анги')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class TimeTable_to_student(models.Model):
    """ Хичээлийн хуваарьт хичээллэх оюутан """

    timetable = models.ForeignKey(TimeTable, on_delete=models.CASCADE, verbose_name="Хичээлийн хуваарь")
    student = models.ForeignKey(Student, on_delete=models.PROTECT, verbose_name="Оюутан")
    add_flag = models.BooleanField(default=True, verbose_name="Нэмэх эсэх")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class ExamTimeTable(models.Model):
    """ Шалгалтын хуваарь """

    SORIL = 1
    AMAN = 2
    DASGAL = 3

    EXAM_TYPE = (
        (SORIL, 'Сорил'),
        (AMAN, 'Аман шалгалт'),
        (DASGAL, 'Дасгал'),
    )

    lesson_year = models.CharField(max_length=10, verbose_name="Хичээлийн жил")
    lesson_season = models.ForeignKey(Season, on_delete=models.PROTECT, verbose_name="Улирал")
    lesson = models.ForeignKey(LessonStandart, on_delete=models.PROTECT, verbose_name="Хичээл")
    is_online = models.BooleanField(default=False, verbose_name="Онлайн шалгалт эсэх")
    stype = models.IntegerField(choices=EXAM_TYPE, default=SORIL, verbose_name='Шалгалтын төрөл')
    room = models.ForeignKey(Room, on_delete=models.PROTECT, null=True, verbose_name="Шалгалт авах өрөө")
    room_name = models.CharField(null=True, verbose_name='Анги танхимийн нэр', max_length=255)
    begin_date = models.DateTimeField(null=True, verbose_name="Шалгалт эхлэх хугацаа")
    end_date = models.DateTimeField(null=True, verbose_name="Шалгалт дуусах хугацаа")

    teacher = models.ManyToManyField(Teachers, verbose_name="Хянах багш")
    school = models.ForeignKey(SubOrgs, verbose_name="Сургууль", on_delete=models.PROTECT)
    created_user = models.ForeignKey(User, related_name='ett_cr_user', on_delete=models.SET_NULL, null=True, verbose_name="Бүртгэсэн хэрэглэгч")
    updated_user = models.ForeignKey(User, related_name='ett_up_user', on_delete=models.SET_NULL, null=True, verbose_name="Зассан хэрэглэгч")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class Exam_to_group(models.Model):
    """ Шалгалт өгөх анги """

    ACTIVE = 1
    INACTIVE = 2

    EXAM_STATUS = (
        (ACTIVE, 'Шалгалт өгөх'),
        (INACTIVE, 'Шалгалтаас хасагдсан'),
    )
    exam = models.ForeignKey(ExamTimeTable, on_delete=models.CASCADE, verbose_name="Шалгалтын хуваарь")
    group = models.ForeignKey(Group, null=True, on_delete=models.PROTECT, verbose_name="Анги")
    student = models.ForeignKey(Student, on_delete=models.PROTECT, verbose_name="Оюутан", null=True)
    status = models.PositiveIntegerField(choices=EXAM_STATUS, db_index=True, default=ACTIVE, verbose_name="Шалгалтын төлөв")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class Exam_repeat(models.Model):
    """ Шалгалтын хуваарь """

    SORIL = 1
    AMAN = 2
    DASGAL = 3

    EXAM_TYPE = (
        (SORIL, 'Сорил'),
        (AMAN, 'Аман шалгалт'),
        (DASGAL, 'Дасгал'),
    )

    REPLACE_EXAM = 1
    ALLOW_EXAM = 2
    UPGRADE_SCORE = 3
    OTHER = 4

    EXAM_STATUS = (
        (REPLACE_EXAM, 'Нөхөн шалгалт'),
        (ALLOW_EXAM, 'Шууд тооцох шалгалт'),
        (UPGRADE_SCORE, 'Давтан шалгалт'),
        (OTHER, 'Бусад'),
    )

    lesson_year = models.CharField(max_length=10, verbose_name="Хичээлийн жил")
    lesson_season = models.ForeignKey(Season, on_delete=models.PROTECT, verbose_name="Улирал")
    lesson = models.ForeignKey(LessonStandart, on_delete=models.PROTECT, verbose_name="Хичээл")
    is_online = models.BooleanField(default=False, verbose_name="Онлайн шалгалт эсэх")
    stype = models.IntegerField(choices=EXAM_TYPE, default=SORIL, verbose_name='Шалгалтын төрөл')
    status = models.PositiveIntegerField(choices=EXAM_STATUS, db_index=True, default=OTHER, verbose_name="Шалгалтын төлөв")
    room = models.ForeignKey(Room, on_delete=models.PROTECT, null=True, verbose_name="Шалгалт авах өрөө")
    room_name = models.CharField(null=True, verbose_name='Анги танхимийн нэр', max_length=255)
    begin_date = models.DateTimeField(null=True, verbose_name="Шалгалт эхлэх хугацаа")
    end_date = models.DateTimeField(null=True, verbose_name="Шалгалт дуусах хугацаа")

    teacher = models.ManyToManyField(Teachers, verbose_name="Хянах багш")
    school = models.ForeignKey(SubOrgs, on_delete=models.SET_NULL, null=True, verbose_name="Сургууль")
    created_user = models.ForeignKey(User, related_name='er_cr_user', on_delete=models.SET_NULL, null=True, verbose_name="Бүртгэсэн хэрэглэгч")
    updated_user = models.ForeignKey(User, related_name='er_up_user', on_delete=models.SET_NULL, null=True, verbose_name="Зассан хэрэглэгч")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class Exam_to_student(models.Model):
    """ Дахин шалгалт өгөх о """

    ACTIVE = 1
    INACTIVE = 2

    EXAM_STATUS = (
        (ACTIVE, 'Шалгалт өгөх'),
        (INACTIVE, 'Шалгалтаас хасагдсан'),
    )
    exam = models.ForeignKey(Exam_repeat, on_delete=models.CASCADE, verbose_name="Шалгалтын хуваарь")
    student = models.ForeignKey(Student, on_delete=models.PROTECT, verbose_name="Оюутан", null=True)
    status = models.PositiveIntegerField(choices=EXAM_STATUS, db_index=True, default=ACTIVE, verbose_name="Шалгалтын төлөв")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


#--------------------------------------Дүнгийн бүртгэл-------------------------------------------


class GradeLetter(models.Model):
    """ Дүнгийн үсгэн үнэлгээ """

    letter = models.CharField(max_length=10, verbose_name="Үсгэн тэмдэглэгээ")
    description = models.TextField(verbose_name="Тайлбар")
    tovch = models.CharField(verbose_name="Товч утга", max_length=500, null=True)
    org = models.ForeignKey(Schools, on_delete=models.CASCADE, verbose_name="Байгууллага", null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class ScoreRegister(models.Model):
    """ Дүнгийн бүртгэл """

    TEACHER_WEB = 1
    EXAM = 2
    TRANSFER = 3
    CORRESPOND = 4
    REPLACE_EXAM = 5
    SHUUD_TOOTSOH = 6
    UPGRADE_SCORE = 7
    START_SYSTEM_SCORE = 8

    SCORE_STATUS = (
        (TEACHER_WEB, 'Багш оруулсан'),
        (EXAM, 'Шалгалтын дүн орсон'),
        (TRANSFER, 'Шилжиж ирсэн дүн'),
        (CORRESPOND, 'Дүйцүүлсэн дүн'),
        (REPLACE_EXAM, 'Нөхөн шалгалтын дүн'),
        (SHUUD_TOOTSOH, 'Шууд тооцох шалгалтын дүн'),
        (UPGRADE_SCORE, 'Дүн ахиулах шалгалтын дүн'),
        (START_SYSTEM_SCORE, 'Систем ашиглаж эхлэхэд оруулсан дүн'),
    )

    student = models.ForeignKey(Student, on_delete=models.PROTECT, verbose_name='Оюутан')
    lesson_year = models.CharField(max_length=20, null=True, verbose_name='Хичээлийн жил')
    lesson_season = models.ForeignKey(Season, on_delete=models.SET_NULL, null=True, verbose_name='Улирал')
    lesson = models.ForeignKey(LessonStandart, on_delete=models.PROTECT, verbose_name="Хичээл")
    teacher = models.ForeignKey(Teachers, on_delete=models.SET_NULL, null=True, verbose_name="Багш")
    teach_score = models.FloatField(null=True, verbose_name="Багшийн оноо")
    exam_score = models.FloatField(null=True, verbose_name="Шалгалтын оноо")
    assessment = models.ForeignKey(Score, on_delete=models.SET_NULL, null=True, verbose_name="Үсгэн үнэлгээ")
    status = models.PositiveIntegerField(choices=SCORE_STATUS, db_index=True, default=TEACHER_WEB, verbose_name="Дүнгийн бүртгэлийн байдал")
    is_delete = models.BooleanField(default=False, verbose_name="Устгагдсан эсэх")
    school = models.ForeignKey(SubOrgs, on_delete=models.SET_NULL, null=True, verbose_name="Сургууль")
    created_user = models.ForeignKey(User, related_name='score_cr_user', on_delete=models.SET_NULL, null=True, verbose_name="Бүртгэсэн хэрэглэгч")
    updated_user = models.ForeignKey(User, related_name='score_up_user', on_delete=models.SET_NULL, null=True, verbose_name="Зассан хэрэглэгч")
    grade_letter = models.ForeignKey(GradeLetter, on_delete=models.SET_NULL, null=True, verbose_name="Үсгэн үнэлгээ")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('student', 'lesson', 'lesson_year', 'lesson_season', 'school', 'is_delete')

    @property
    def score_total(self):
        full = 0
        teach_score = self.teach_score
        exam_score = self.exam_score

        if teach_score:
            full = full + teach_score

        if exam_score:
            full = full + exam_score

        return full


#------------------------------------Сургалтын төлбөр------------------------------------------------

class Payment(models.Model):

    class Meta:
        db_table = 'lms_payment'

    KIND_MONGOLBANK = 1
    KIND_QPAY = 2

    KIND_CHOICES = (
        (KIND_MONGOLBANK, 'Монгол Банк'),
        (KIND_QPAY, 'QPay'),
    )

    STUDY = 1
    DORMITORY = 2
    SPORT = 3
    GYM = 4
    SYSTEM = 5
    ADMISSION = 6

    PAYMENT_FOR = (
        (STUDY, "Сургалтын төлбөр"),
        (DORMITORY, "Дотуур байрны төлбөр"),
        (SPORT, "Заалны түрээс"),
        (GYM, "Фитнесийн төлбөр"),
        (SYSTEM, "Програм ашигласны төлбөр"),
        (ADMISSION, "Элсэлтийн хураамж"),
    )

    user = models.ForeignKey(User, on_delete=models.PROTECT, null=True)
    student = models.ForeignKey(Student, on_delete=models.PROTECT, null=True)
    admission = models.ForeignKey(to='elselt.ElseltUser', on_delete=models.PROTECT, null=True)

    total_amount = models.FloatField(null=True)
    kind = models.PositiveIntegerField(choices=KIND_CHOICES, db_index=True, null=True)
    dedication = models.PositiveBigIntegerField(choices=PAYMENT_FOR, db_index=True, default=STUDY, verbose_name="Төлбөрийн зориулалт")

    unique_id = models.CharField(max_length=300, verbose_name='qpay үүсгэхэд шаардаг unique id', null=True)
    card_number = models.CharField(max_length=500, null=True)
    bank_unique_number = models.CharField(max_length=300, verbose_name='payment_id буюу банкнаас төлбөр төлсөн эсэхийг илтгэх id')
    mongolbank_rsp = models.TextField(null=True, verbose_name='Mongol bank response')

    qpay_rsp = models.TextField(null=True, verbose_name='QPay bank response')
    q_text = models.CharField(max_length=500, verbose_name="Данс болон картын гүйлгээ дэмжих QR утга", null=True)
    qr_image = models.CharField(max_length=20000, verbose_name="Зурган хэлбэрээр үүсэх QR", null=True)

    paid_rsp = models.TextField(null=True, verbose_name="QPay дээр төлбөр төлөгдсөн эсэхийг илтгэх")

    status = models.BooleanField(default=False, verbose_name="Төлбөр төлөгдсөн эсэхийг илтгэх")
    payed_date = models.DateTimeField(verbose_name="Төлсөн огноо", null=True)
    description = models.CharField(max_length=500, null=True, verbose_name="Гүйлгээний утга")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def qpay_total_amount(self):
        qpay_payment_total = 0

        paid_rsp = self.paid_rsp

        if paid_rsp:
            paid_rsp = json.loads(paid_rsp)

            rows = paid_rsp.get('rows') if paid_rsp else None

            for row in rows:
                payment_amount = row.get('payment_amount') or 0
                qpay_payment_total += float(payment_amount)

        return qpay_payment_total


class StudentOnlinePayment(models.Model):
    """ Онлайн төлөлтийн мэдээлэл оюутны"""

    STUDY = 1
    DORMITORY = 2
    SPORT = 3
    GYM = 4

    PAYMENT_FOR = (
        (STUDY,"Сургалтын төлбөр"),
        (DORMITORY,"Дотуур байрны төлбөр"),
        (SPORT,"Заалны түрээс"),
        (GYM,"Фитнесийн төлбөр")
    )

    student = models.ForeignKey(Student, on_delete=models.PROTECT, verbose_name="Оюутан")
    dedication = models.PositiveBigIntegerField(choices=PAYMENT_FOR, db_index=True,default=STUDY, verbose_name="Төлбөрийн зориулалт")
    payment = models.FloatField(verbose_name="Төлбөр")
    payment_date = models.DateTimeField(verbose_name="Төлбөрийн огноо")
    transaction = models.CharField(max_length=100, null=True, verbose_name="Гүйлгээний дугаар")
    transaction_flag = models.PositiveIntegerField(null=True, verbose_name="Гүйлгээ амжилттай эсэх")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class OtherOnlinePayment(models.Model):
    """ Онлайн төлөлтийн мэдээлэл багш болон бусад"""

    student = models.ForeignKey(Teachers, on_delete=models.PROTECT, verbose_name="Оюутан")
    dedication = models.PositiveBigIntegerField(choices=StudentOnlinePayment.PAYMENT_FOR, db_index=True,default=StudentOnlinePayment.DORMITORY, verbose_name="Төлбөрийн зориулалт")
    payment = models.FloatField(verbose_name="Төлбөр")
    payment_date = models.DateTimeField(verbose_name="Төлбөрийн огноо")
    transaction = models.CharField(max_length=100, null=True, verbose_name="Гүйлгээний дугаар")
    transaction_flag = models.PositiveIntegerField(null=True, verbose_name="Гүйлгээ амжилттай эсэх")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class PaymentBeginBalance(models.Model):
    """ Сургалтын төлбөрийн эхний үлдэгдэл"""

    student = models.ForeignKey(Student, on_delete=models.PROTECT, verbose_name='Оюутан')
    lesson_year = models.CharField(max_length=20, verbose_name='Хичээлийн жил')
    lesson_season = models.ForeignKey(Season, on_delete=models.SET_NULL, null=True, verbose_name='Улирал')
    first_balance = models.FloatField(verbose_name="Эхний үлдэгдэл")
    school = models.ForeignKey(SubOrgs, on_delete=models.SET_NULL, null=True, verbose_name="Сургууль")
    created_user = models.ForeignKey(User, related_name='pbb_cr_user', on_delete=models.SET_NULL, null=True, verbose_name="Бүртгэсэн хэрэглэгч")
    updated_user = models.ForeignKey(User, related_name='pbb_up_user', on_delete=models.SET_NULL, null=True, verbose_name="Зассан хэрэглэгч")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        unique_together = ('student', 'lesson_year', 'lesson_season')


class PaymentSettings(models.Model):
    """ Сургалтын төлбөрийн тохиргоо"""

    A_KREDIT_PAYMENT = 1
    SEASON_PAYMENT = 2

    PAYMENT_TYPE = (
        (A_KREDIT_PAYMENT, 'Багц цагийн үнэлгээ'),
        (SEASON_PAYMENT, 'Улирлын төлбөр'),
    )

    group = models.ForeignKey(Group, on_delete=models.PROTECT, verbose_name='Анги')
    lesson_year = models.CharField(max_length=20, verbose_name='Хичээлийн жил')
    lesson_season = models.ForeignKey(Season, on_delete=models.SET_NULL, null=True, verbose_name='Улирал')
    payment = models.FloatField(verbose_name="Төлбөр")
    payment_type = models.PositiveIntegerField(choices=PAYMENT_TYPE, db_index=True, default=SEASON_PAYMENT, verbose_name="Улирал багц цагийн аль нь болох")
    school = models.ForeignKey(SubOrgs, on_delete=models.SET_NULL, null=True, verbose_name="Сургууль")
    created_user = models.ForeignKey(User, related_name='ps_cr_user', on_delete=models.SET_NULL, null=True, verbose_name="Бүртгэсэн хэрэглэгч")
    updated_user = models.ForeignKey(User, related_name='ps_up_user', on_delete=models.SET_NULL, null=True, verbose_name="Зассан хэрэглэгч")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('group', 'lesson_year', 'lesson_season')


class PaymentBalance(models.Model):
    """ Сургалтын төлбөрийн гүйлгээ"""

    ORLOGO = 1
    ZARLAGA = 2

    BALANCE_FLAG = (
        (ORLOGO, 'Төлсөн төлбөр'),
        (ZARLAGA, 'Буцаасан төлбөр'),
    )

    KHAAN = 1
    REFUND = 2
    HAND_CREATED = 3
    EXCEL = 4
    QPAY = 5

    TRANSACTION_TYPE = (
        (KHAAN, 'Хаан банк'),
        (REFUND, 'Төлбөрийн буцаалт'),
        (HAND_CREATED, 'Гараар үүсгэсэн'),
        (EXCEL, 'Excel-с оруулсан'),
        (QPAY, 'QPAY-с оруулсан'),
    )

    STUDY = 1
    REPLACE_LESSON = 2
    DORMITORY = 3
    ADMISSION = 4
    REPLACE_LESSON_REFUND = 5

    PAYMENT_TYPE = (
        (STUDY, "Сургалтын төлбөр"),
        (REPLACE_LESSON, "Хичээл нөхөлт"),
        (DORMITORY, "Дотуур байр"),
        (ADMISSION, "Элсэлтийн хураамж"),
        (REPLACE_LESSON_REFUND, "Хичээл нөхөлт буцаалт"),
    )

    student = models.ForeignKey(Student, on_delete=models.PROTECT, null=True, verbose_name='Оюутан')
    lesson_year = models.CharField(max_length=20, verbose_name='Хичээлийн жил')
    lesson_season = models.ForeignKey(Season, on_delete=models.SET_NULL, null=True, verbose_name='Улирал')
    balance_date = models.DateTimeField(verbose_name="Гүйлгээний огноо")
    balance_amount = models.FloatField(verbose_name="Гүйлгээний дүн")
    is_report = models.BooleanField(default=True, verbose_name='Тайлагнах эсэх')
    is_deleted = models.BooleanField(default=False, verbose_name='Устгасан эсэх')
    balance_desc = models.TextField(null=True, verbose_name="Гүйлгээний утга")
    flag = models.PositiveIntegerField(choices=BALANCE_FLAG, db_index=True, default=ORLOGO, verbose_name="Орлого зарлагын аль нь болох")
    transaction_type = models.PositiveIntegerField(choices=TRANSACTION_TYPE, db_index=True, default=KHAAN, verbose_name="Гүйлгээний төрөл")
    school = models.ForeignKey(SubOrgs, on_delete=models.SET_NULL, null=True, verbose_name="Сургууль")

    # Банкнаас хуулга орж ирэх үед
    record = models.FloatField(null=True, verbose_name='Гүйлгээний дугаар /Банкнаас өгнө хуулгаа дугаарлаж өгсөн тоо/')
    transaction_date = models.DateTimeField(null=True, verbose_name="Шилжүүлэг хийсэн огноо")
    post_date = models.DateTimeField(null=True, verbose_name="Гүйлгээ хийгдсэн огноо")
    journal_no = models.CharField(max_length=250, null=True, verbose_name="Журналын дугаар")
    related_account = models.CharField(max_length=100, null=True, verbose_name="Харьцсан дансны дугаар")

    payment_type = models.PositiveBigIntegerField(choices=PAYMENT_TYPE, null=True, verbose_name="Төлбөрийн зориулалт")

    created_user = models.ForeignKey(User, related_name='pb_cr_user', on_delete=models.SET_NULL, null=True, verbose_name="Бүртгэсэн хэрэглэгч")
    updated_user = models.ForeignKey(User, related_name='pb_up_user', on_delete=models.SET_NULL, null=True, verbose_name="Зассан хэрэглэгч")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class DiscountType(models.Model):
    """ Хөнгөлөлтийн төрөл"""

    code = models.CharField(max_length=20, unique=True, verbose_name='Тэтгэлэгийн төрлийн код')
    name = models.CharField(max_length=100, verbose_name='Тэтгэлэгийн төрлийн нэр')
    org = models.ForeignKey(Schools, on_delete=models.CASCADE, verbose_name="Байгууллага", null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class PaymentDiscount(models.Model):
    """Сургалтын төлбөрийн хөнгөлөлт """

    WAITING = 1
    DECLINED = 2
    APPROVED = 3
    OTHER = 4

    STATE_TYPE = (
        (WAITING, 'Хүсэлт илгээгдсэн'),
        (DECLINED, 'Татгалзсан'),
        (APPROVED, 'Зөвшөөрсөн'),
        (OTHER, 'Бусад'),
    )

    student = models.ForeignKey(Student, on_delete=models.PROTECT, verbose_name='Оюутан')
    lesson_year = models.CharField(max_length=20, verbose_name='Хичээлийн жил')
    lesson_season = models.ForeignKey(Season, on_delete=models.SET_NULL, null=True, verbose_name='Улирал')
    stipent_type = models.ForeignKey(DiscountType, on_delete=models.SET_NULL, null=True, verbose_name="Хөнгөлөлтийн төрөл")
    discount = models.FloatField(null=True, verbose_name="Хөнгөлөгдөх хувь")
    school = models.ForeignKey(SubOrgs, on_delete=models.SET_NULL, null=True, verbose_name="Сургууль")
    state = models.PositiveIntegerField(choices=STATE_TYPE, db_index=True, null=False, default=OTHER, verbose_name="Шийдвэрийн төpөл")
    created_user = models.ForeignKey(User, related_name='pd_cr_user', on_delete=models.SET_NULL, null=True, verbose_name="Бүртгэсэн хэрэглэгч")
    updated_user = models.ForeignKey(User, related_name='pd_up_user', on_delete=models.SET_NULL, null=True, verbose_name="Зассан хэрэглэгч")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class PaymentEstimate(models.Model):
    """ Сургалтын төлбөр бүртгэл """

    student = models.ForeignKey(Student, on_delete=models.PROTECT, verbose_name='Оюутан')
    lesson_year = models.CharField(max_length=20, verbose_name='Хичээлийн жил')
    lesson_season = models.ForeignKey(Season, on_delete=models.SET_NULL, null=True, verbose_name='Улирал')
    kredit = models.FloatField(null=True, verbose_name="Сонгосон багц цаг")
    first_balance = models.FloatField(null=True,verbose_name="Эхний үлдэгдэл")
    payment = models.FloatField(null=True, verbose_name="Төлбөл зохих")
    discount = models.FloatField(null=True, verbose_name="Хөнгөлөх төлбөр")
    in_balance = models.FloatField(null=True,verbose_name="Төлсөн төлбөр")
    out_balance = models.FloatField(null=True,verbose_name="Буцаасан төлбөр")
    last_balance = models.FloatField(null=True,verbose_name=" үлдэгдэл")
    reduce_payment = models.FloatField(default=0, verbose_name="Авлага бууруулах төлбөр")
    school = models.ForeignKey(SubOrgs, on_delete=models.SET_NULL, null=True, verbose_name="Сургууль")
    created_user = models.ForeignKey(User, related_name='pe_cr_user', on_delete=models.SET_NULL, null=True, verbose_name="Бүртгэсэн хэрэглэгч")
    updated_user = models.ForeignKey(User, related_name='pe_up_user', on_delete=models.SET_NULL, null=True, verbose_name="Зассан хэрэглэгч")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('student', 'lesson_year', 'lesson_season', 'school')


class PaymentSeasonClosing(models.Model):
    """ Сургалтын төлбөрийн улирлын хаалт """

    lesson_year = models.CharField(max_length=20, verbose_name='Хичээлийн жил')
    lesson_season = models.ForeignKey(Season, on_delete=models.SET_NULL, null=True, verbose_name='Улирал')
    school = models.ForeignKey(SubOrgs, on_delete=models.SET_NULL, null=True, verbose_name="Бүрэлдэхүүн сургууль")
    date = models.DateField(default=timezone.now, verbose_name="Хаалт хийсэн огноо")
    created_user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, verbose_name="Хаалт хийсэн хэрэглэгч")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


#-----------------------------------Тэтгэлэг-------------------------------------------

class Stipend(models.Model):
    """Тэтгэлэгийн бүртгэл"""

    OWN = 1
    OTHER = 2

    STIPEND_FORM = (
        (OWN, 'Сургуулийн дотоод тэтгэлэг'),
        (OTHER, 'Гадны тэтгэлэг')
    )

    is_own = models.PositiveIntegerField(choices=STIPEND_FORM, db_index=True, null=False, default=OWN, verbose_name="Сургуулийн дотоод тэтгэлэг эсэх")
    stipend_type = models.ForeignKey(DiscountType, on_delete=models.SET_NULL, null=True, verbose_name='Тэтгэлэгийн төрөл')
    lesson_year = models.CharField(max_length=20, verbose_name='Хичээлийн жил')
    lesson_season = models.ForeignKey(Season, on_delete=models.SET_NULL, null=True, verbose_name='Улирал')
    body = models.TextField(null=True, verbose_name="Тайлбар")
    start_date =  models.DateField(verbose_name="Бүртгэл эхлэх хугацаа")
    finish_date =  models.DateField(verbose_name="Бүртгэл дуусах хугацаа")
    is_open = models.BooleanField(default=True, verbose_name="Нээлттэй эсэх")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)



class StipendFile(models.Model):
    """Тэтгэлэгт хавсаргасан файл"""

    def file_directory_path(instance, filename):
        return '{0}/{1}/{2}'.format(settings.STIPEND_FILE, instance.id, filename)

    stipend = models.ForeignKey(Stipend, on_delete=models.CASCADE,verbose_name="Зураг")
    file = models.ImageField(upload_to=file_directory_path, max_length=255, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if self.id is None:
            saved_image = self.file
            self.file = None
            super(StipendFile, self).save(*args, **kwargs)
            self.file = saved_image
            if 'force_insert' in kwargs:
                kwargs.pop('force_insert')

        super(StipendFile, self).save(*args, **kwargs)


class StipentStudent(models.Model):
    """Тэтгэлэгт хамрагдах оюутны бүртгэл"""

    STUDENT_REQUEST = 1
    RETRIEVE = 2
    ALLOW = 3
    REJECT = 4


    SOLVED_TYPE = (
        (STUDENT_REQUEST, 'Оюутан хүсэлт илгээсэн'),
        (RETRIEVE, 'Буцаасан'),
        (ALLOW, 'Зөвшөөрсөн'),
        (REJECT, 'Татгалзсан'),
    )
    stipent = models.ForeignKey(Stipend, on_delete=models.PROTECT, verbose_name="Тэтгэлэг")
    student = models.ForeignKey(Student, on_delete=models.PROTECT, verbose_name="Оюутан")
    request = models.CharField(max_length=250, null=True, verbose_name="Тэтгэлэгт хамрагдах хүсэлт")
    solved_flag = models.PositiveIntegerField(choices=SOLVED_TYPE, db_index=True, default=STUDENT_REQUEST, verbose_name="Шийдвэрийн төрөл")
    solved_message = models.CharField(max_length=250, null=True, verbose_name="Шийдвэрийн тайлбар")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class StipentStudentFile(models.Model):
    """Тэтгэлэгт хамрагдах оюутны бүртгэлд хавсаргасан файл"""

    def file_directory_path(instance, filename):
        return '{0}/{1}/{2}'.format(settings.STIPEND, instance.id, filename)

    request = models.ForeignKey(StipentStudent, on_delete=models.CASCADE,verbose_name="Оюутны тэтгэлэгийн хүсэлт")
    description = models.CharField(max_length=250, null=True,verbose_name="Файлын тайлбар")
    file = models.ImageField(upload_to=file_directory_path, max_length=255, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class LearningCalendar(models.Model):
    """ Сургалтын хуанли """

    STUDENT = 1
    TEACHER = 2
    WORKER = 3
    OTHER = 4

    SCOPE = (
        (STUDENT, 'Оюутан'),
        (TEACHER, 'Багш'),
        (WORKER, 'Ажилчид'),
        (OTHER, 'Бусад'),
    )

    ADMISSION = 1
    LEARNING = 2
    GRADUATION = 3
    VOLUNTEER = 4
    HOLIDAY = 5
    MEETING = 5

    ACTION_TYPE = (
        (ADMISSION, 'Элсэлт'),
        (LEARNING, 'Сургалт'),
        (GRADUATION, 'Төгсөлт'),
        (VOLUNTEER, 'Олон нийтийн ажил'),
        (HOLIDAY, 'Баяр ёслол'),
        (MEETING, 'ХУРАЛ'),
    )

    title = models.CharField(max_length=250, verbose_name="Үйл ажиллагааны нэр")
    organiser = models.CharField(max_length=250, verbose_name="Зохион байгуулагч")
    action_type = models.PositiveIntegerField(choices=ACTION_TYPE, db_index=True, default=LEARNING, verbose_name="Үйл ажиллагааны төрөл")
    scope = models.PositiveIntegerField(choices=SCOPE, db_index=True, default=OTHER, verbose_name="Хэн хамрагдах")
    start = models.DateTimeField(verbose_name="Эхлэх хугацаа")
    end = models.DateTimeField(verbose_name="Дуусах хугацаа")
    org = models.ForeignKey(Schools, on_delete=models.CASCADE, verbose_name="Байгууллага", null=True)
    color = models.CharField(max_length=250, null=True, blank=True, default="#3788D8", verbose_name="Өнгө")
    description = models.CharField(max_length=250, null=True, verbose_name="Тайлбар")
    created_user = models.ForeignKey(User, related_name='lc_cr_user', on_delete=models.SET_NULL, null=True, verbose_name="Бүртгэсэн хэрэглэгч")
    updated_user = models.ForeignKey(User, related_name='lc_up_user', on_delete=models.SET_NULL, null=True, verbose_name="Зассан хэрэглэгч")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


#------------------------------------------------------Дотуур байр ----------------------------------------------
class DormitoryRoomType(models.Model):
    """ Дотуур байрны өрөөний төрөл"""

    STUDENT = 1
    FAMILY = 2
    FOREIGN_ROOM_ONE = 3
    FOREIGN_ROOM_TWO = 4

    RENT_TYPE = (
        (STUDENT, "Оюутан нь хичээлийн жилээр түрээслэх"),
        (FAMILY, "Айл нь сар өдрөөр түрээслэх"),
        (FOREIGN_ROOM_ONE, "Гадаад оюутан 1 ортой"),
        (FOREIGN_ROOM_TWO, "Гадаад оюутан 2 ортой"),
    )

    name = models.CharField(max_length=200, verbose_name="Өрөөний төрлийн нэр")
    rent_type = models.PositiveIntegerField(choices=RENT_TYPE, db_index=True, default=STUDENT, verbose_name="Түрээслэх хэлбэр")
    description = models.CharField(max_length=500, null=True, verbose_name="Өрөөний дэлгэрэнгүй тайлбар")
    volume = models.PositiveIntegerField(verbose_name="Өрөөний багтаамж")
    org = models.ForeignKey(Schools, on_delete=models.CASCADE, verbose_name="Байгууллага", null=True)
    # is_active = models.BooleanField(default=True, verbose_name='Идэвхтэй эсэх')
    # lesson_year = models.CharField(max_length=20, null=True, verbose_name="Хичээлийн жил", default="2024-2025")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class DormitoryRoomFile(models.Model):
    """Өрөөний танилцуулга хавсаргасан файл"""

    def file_directory_path(instance, filename):
        return '{0}/{1}/{2}'.format(settings.DORMITORY, instance.id, filename)

    request = models.ForeignKey(DormitoryRoomType, on_delete=models.CASCADE,verbose_name="Өрөөний төрөл")
    description = models.CharField(max_length=250, null=True,verbose_name="Файлын тайлбар")
    file = models.ImageField(upload_to=file_directory_path, max_length=255, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if self.id is None:
            saved_image = self.file
            self.file = None
            super(DormitoryRoomFile, self).save(*args, **kwargs)
            self.file = saved_image
            if 'force_insert' in kwargs:
                kwargs.pop('force_insert')

        super(DormitoryRoomFile, self).save(*args, **kwargs)


class DormitoryPayment(models.Model):
    """ Төлбөрийн тохиргоо """

    name = models.CharField(max_length=200, verbose_name="Дотуур байрны төлбөрийн тохиргооны нэр")
    is_ourstudent = models.BooleanField(default=True, verbose_name="Өөрийн сургуулийн оюутан эсэх")
    room_type = models.ForeignKey(DormitoryRoomType, on_delete=models.SET_NULL, null=True, verbose_name="Өрөөний төрөл")
    payment = models.FloatField(verbose_name="Жилийн төлбөр/сарын төлбөр") #өрөөний төрлийн түрээслэх хэлбэрээс хамаарна
    ransom = models.FloatField(null=True, verbose_name="Барьцаа төлбөр")
    lesson_year=models.CharField(max_length=20, verbose_name="Хичээлийн жил") #өрөөний төрлийн түрээслэх хэлбэрээс хамаарна
    start_date  =models.DateField(null=True, verbose_name="Эхлэх огноо")
    finish_date  =models.DateField(null=True, verbose_name="Дуусах огноо")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class DormitoryBalance(models.Model):
    """ Дотуур байрны төлбөрийн гүйлгээ """

    student = models.ForeignKey(Student, on_delete=models.PROTECT, null=True, verbose_name="Оюутан")
    lesson_year=models.CharField(max_length=20, null=True,verbose_name="Хичээлийн жил")
    balance_date = models.DateTimeField(verbose_name="Гүйлгээний огноо")
    balance_amount = models.FloatField(verbose_name="Гүйлгээний дүн")
    description =models.CharField(max_length=250, null=True, verbose_name="Гүйлгээний утга")
    bank = models.CharField(max_length=250, null=True, verbose_name="Банкны нэр")
    bank_account = models.CharField(max_length=250, null=True, verbose_name="Дансны дугаар")
    bank_journal_no = models.CharField(max_length=250, null=True, verbose_name="Банкин дахь гүйлгээний дугаар")
    payment = models.ForeignKey(Payment, on_delete=models.SET_NULL, null=True, verbose_name="Онлайнаар төлөлт хийсэн мэдээлэл")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class DormitoryBuilding(models.Model):
    """ Дотуур байрны хичээлийн байр """

    def file_directory_path(instance, filename):
        return '{0}/{1}/{2}'.format('dormitorybuilding', instance.id, filename)

    name = models.CharField(max_length=500, verbose_name="Хичээлийн байрны нэр")
    eng_name = models.CharField(max_length=500, null=True, blank=True, verbose_name="Хичээлийн байрны нэр")
    location = models.TextField(null=True, verbose_name="Хаяг байршил")
    location_map = models.TextField(null=True, verbose_name="Газрын зураг дах байршил")

    housemaster_last_name = models.CharField(max_length=200, null=True, blank=True, verbose_name='Байрны эрхлэгчийн овог')
    housemaster_first_name = models.CharField(max_length=200, null=True, blank=True, verbose_name='Байрны эрхлэгчийн нэр')
    housemaster_phone = models.IntegerField(null=True, verbose_name='Байрны эрхлэгчийн утасны дугаар')

    image = models.ImageField(upload_to=file_directory_path, max_length=255, null=True, verbose_name='Гадна зураг')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if self.id is None:
            saved_image = self.image
            self.image = None
            super(DormitoryBuilding, self).save(*args, **kwargs)
            self.image = saved_image
            if 'force_insert' in kwargs:
                kwargs.pop('force_insert')

        super(DormitoryBuilding, self).save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        if self.id:
            remove_file = os.path.join("dormitorybuilding", str(self.id))
            if remove_file:
                remove_folder(remove_file)

        super(DormitoryBuilding, self).delete(*args, **kwargs)


class DormitoryRegistrationSchedule(models.Model):
    """ Дотуур байрны бүртгэлийн хуваарь """

    level = models.IntegerField(verbose_name='Дамжаа')
    start_date = models.DateField(verbose_name="Бүртгэл эхлэх өдөр")
    finish_date = models.DateField(verbose_name="Бүртгэл дуусах өдөр")
    live_date = models.DateField(verbose_name="Байранд орж эхлэх өдөр")
    buildings = models.ManyToManyField(DormitoryBuilding, verbose_name="Дотуур байр")
    lesson_year=models.CharField(max_length=20, verbose_name="Хичээлийн жил", null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class DormitoryRoom(models.Model):
    """ Өрөөний бүртгэл """

    room_number = models.CharField(max_length=50, verbose_name="Өрөөний дугаар")
    room_type = models.ForeignKey(DormitoryRoomType, on_delete=models.SET_NULL, null=True, verbose_name="Өрөөний төрөл")
    gender = models.PositiveIntegerField(choices=Student.GENDER_TYPE, db_index=True, null=False, default=Student.GENDER_OTHER, verbose_name="Хүйс")
    gateway = models.CharField(max_length=50, verbose_name="Орц")
    floor = models.PositiveIntegerField(verbose_name="Давхар")
    door_number = models.CharField(max_length=50, null=True, verbose_name="Гадна хаалганы дугаар")
    building = models.ForeignKey(DormitoryBuilding, null=True, on_delete=models.CASCADE, verbose_name="Хичээлийн байр")
    is_active = models.BooleanField(default=True, verbose_name='Идэвхтэй эсэх')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class DormitoryStudent(models.Model):
    """ Дотуур байранд амьдрах хүсэлт гаргасан оюутан"""

    STUDENT_REQUEST = 1
    CONFIRM = 2
    RETRIEVE = 3
    ALLOW = 4
    REJECT = 5
    REVOKE = 6

    SOLVED_TYPE = (
        (STUDENT_REQUEST, 'Оюутан хүсэлт илгээсэн'),
        (CONFIRM, 'Баталгаажсан'),
        (RETRIEVE, 'Буцаасан'),
        (ALLOW, 'Зөвшөөрсөн'),
        (REJECT, 'Татгалзсан'),
        (REVOKE, 'Цуцалсан'),
    )

    student = models.ForeignKey(Student, on_delete=models.PROTECT, verbose_name="Оюутан")
    lesson_year=models.CharField(max_length=20, verbose_name="Хичээлийн жил")
    room_type = models.ForeignKey(DormitoryRoomType, on_delete=models.SET_NULL, null=True,verbose_name="Хүсэлт гаргах өрөөний төрөл")
    room = models.ForeignKey(DormitoryRoom, on_delete=models.SET_NULL, null=True, verbose_name="Өрөөний дугаар")
    request = models.CharField(max_length=500, null=True, verbose_name="Дотуур байранд суух хүсэлт")
    request_date = models.DateTimeField(verbose_name="Бүртгүүлсэн огноо")
    confirm_date = models.DateTimeField(null=True, verbose_name="Баталгаажуулсан огноо")
    payment = models.FloatField(null=True, verbose_name="Төлөх төлбөрийн хэмжээ")
    out_payment = models.FloatField(null=True, verbose_name="Буцаах төлбөрийн хэмжээ")
    ransom = models.FloatField(null=True, verbose_name="Барьцаа төлбөрийн хэмжээ")
    in_balance = models.FloatField(null=True, verbose_name="Төлсөн төлбөр")
    out_balance = models.FloatField(null=True, verbose_name="Буцаасан төлбөр")

    solved_flag = models.PositiveIntegerField(choices=SOLVED_TYPE, db_index=True, default=STUDENT_REQUEST, verbose_name="Шийдвэрийн төрөл")
    solved_message = models.CharField(max_length=250, null=True, verbose_name="Шийдвэрийн тайлбар")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class DormitoryOtherBalance(models.Model):
    """ Дотуур байрны бусад сургуулийн оюутнуудын төлбөрийн гүйлгээ """

    student=models.ForeignKey(Teachers, on_delete=models.PROTECT, verbose_name="Хэрэглэгч")
    lesson_year=models.CharField(max_length=20, null=True,verbose_name="Хичээлийн жил")
    balance_date = models.DateTimeField(verbose_name="Гүйлгээний огноо")
    balance_amount = models.FloatField(verbose_name="Гүйлгээний дүн")
    description =models.CharField(max_length=250, null=True, verbose_name="Гүйлгээний утга")
    bank = models.CharField(max_length=250, null=True, verbose_name="Банкны нэр")
    bank_account = models.CharField(max_length=250, null=True, verbose_name="Дансны дугаар")
    bank_journal_no = models.CharField(max_length=250, null=True, verbose_name="Банкин дахь гүйлгээний дугаар")
    payment = models.ForeignKey(Payment, on_delete=models.SET_NULL, null=True, verbose_name="Онлайнаар төлөлт хийсэн мэдээлэл")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class DormitoryOtherStudent(models.Model):
    """Дотуур байрны бусад сургуулийн оюутнууд"""

    student = models.ForeignKey(Teachers, on_delete=models.PROTECT, verbose_name="Хэрэглэгч")
    lesson_year = models.CharField(max_length=20, verbose_name="Хичээлийн жил")
    room_type = models.ForeignKey(DormitoryRoomType, on_delete=models.SET_NULL, null=True,verbose_name="Хүсэлт гаргах өрөөний төрөл")
    room = models.ForeignKey(DormitoryRoom, on_delete=models.SET_NULL, null=True, verbose_name="Өрөөний дугаар")
    request = models.CharField(max_length=500, null=True, verbose_name="Дотуур байранд суух хүсэлт")
    request_date = models.DateTimeField(verbose_name="Бүртгүүлсэн огноо")
    confirm_date = models.DateTimeField(null=True, verbose_name="Баталгаажуулсан огноо")
    payment = models.FloatField(null=True, verbose_name="Төлөх төлбөрийн хэмжээ")
    out_payment = models.FloatField(null=True, verbose_name="Буцаах төлбөрийн хэмжээ")
    ransom = models.FloatField(null=True, verbose_name="Барьцаа төлбөрийн хэмжээ")
    in_balance = models.FloatField(null=True, verbose_name="Төлсөн төлбөр")
    out_balance = models.FloatField(null=True, verbose_name="Буцаасан төлбөр")

    solved_flag = models.PositiveIntegerField(choices=DormitoryStudent.SOLVED_TYPE, db_index=True, default=DormitoryStudent.STUDENT_REQUEST, verbose_name="Шийдвэрийн төрөл")
    solved_message = models.CharField(max_length=250, null=True, verbose_name="Шийдвэрийн тайлбар")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class DormitoryFamilyContract(models.Model):
    """Дотуур байрыг сараар түрээслэгчийн гэрээ"""

    teacher = models.ForeignKey(Teachers, on_delete=models.PROTECT, verbose_name="Түрээслэгч")
    room_type = models.ForeignKey(DormitoryRoomType, on_delete=models.SET_NULL, null=True,verbose_name="Хүсэлт гаргах өрөөний төрөл")
    room = models.ForeignKey(DormitoryRoom, on_delete=models.SET_NULL, null=True, verbose_name="Өрөөний дугаар")
    start_date = models.DateField(null=True,verbose_name="Эхлэх хугацаа")
    end_date = models.DateField(null=True,verbose_name="Дуусах хугацаа")
    request = models.CharField(max_length=500, null=True, verbose_name="Байр түрээслэх хүсэлт")
    request_date = models.DateTimeField(verbose_name="Бүртгүүлсэн огноо")
    is_ourteacher = models.BooleanField(default=True, verbose_name="Өөрийн сургуулийн багш эсэх")

    solved_flag = models.PositiveIntegerField(choices=DormitoryStudent.SOLVED_TYPE, db_index=True, default=DormitoryStudent.STUDENT_REQUEST, verbose_name="Шийдвэрийн төрөл")
    solved_start_date = models.DateField(null=True,verbose_name="Эхлэх хугацаа")
    solved_finish_date = models.DateField(null=True,verbose_name="Дуусах хугацаа")
    solved_message = models.CharField(max_length=250, null=True, verbose_name="Шийдвэрийн тайлбар")
    first_uldegdel = models.FloatField(null=True, verbose_name="Түрээслэгчийн эхний үлдэгдэл")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class DormitoryEstimationFamily(models.Model):
    """ Дотуур байранд сараар төлөлт хийж суудаг оршин суугчдын тооцоо"""

    contract = models.ForeignKey(DormitoryFamilyContract, on_delete=models.PROTECT, verbose_name="Гэрээ")
    year = models.PositiveIntegerField(verbose_name="Он")
    month = models.PositiveIntegerField(verbose_name="Сар")
    first_uld = models.FloatField(null=True, verbose_name="Эхний үлдэгдэл")
    payment = models.FloatField(null=True, verbose_name="Төлөх төлбөрийн хэмжээ")
    out_payment = models.FloatField(null=True, verbose_name="Буцаах төлбөрийн хэмжээ")
    ransom = models.FloatField(null=True, verbose_name="Барьцаа төлбөрийн хэмжээ")
    in_balance = models.FloatField(null=True, verbose_name="Төлсөн төлбөр")
    out_balance = models.FloatField(null=True, verbose_name="Буцаасан төлбөр")
    lastuld = models.FloatField(null=True, verbose_name="Эцсийн үлдэгдэл")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


#----------------------------------------------------Захиалга--------------------------------------------------------
class StudentOrderSport(models.Model):
    """ Захиалга спорт заал """

    ACTIVE = 1
    ORDERED = 2
    COMFIRM = 3

    ORDER_FLAG = (
        (ACTIVE, 'Захиалах боломжтой'),
        (ORDERED, 'Захиалсан'),
        (COMFIRM, 'Баталгаажсан'),
    )

    room = models.ForeignKey(Room, on_delete=models.SET_NULL, null=True, verbose_name="Байрлал")
    day = models.DateField(verbose_name="Өдөр")
    starttime = models.TimeField(verbose_name="Эхлэх цаг")
    endtime = models.TimeField(verbose_name="Дуусах цаг")
    time_payment = models.FloatField(verbose_name="Цагийн төлбөр")
    order_flag = models.PositiveIntegerField(choices=ORDER_FLAG, db_index=True, default=ACTIVE, verbose_name="Захиалгын төлөв")
    student = models.ForeignKey(Student, on_delete=models.SET_NULL, null=True, verbose_name="Оюутан")
    teachers = models.ForeignKey(Teachers, on_delete=models.SET_NULL, null=True, verbose_name="Бусад")
    order_date = models.DateTimeField(null=True, verbose_name="Захиалга хийгдсэн огноо")
    payment = models.ForeignKey(Payment, on_delete=models.SET_NULL, null=True, verbose_name="Оюутны төлбөр төлөгдсөн мэдээлэл")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class StudentOrderLibrary(models.Model):
    """ Оюутны захиалга номын сан """

    ORDERED = 1
    REVOKE = 2
    COME = 3

    ORDER_FLAG = (
        (ORDERED, 'Захиалсан'),
        (REVOKE, 'Цуцалсан'),
        (COME, 'Ирсэн'),
    )

    student = models.ForeignKey(Student, on_delete=models.PROTECT, verbose_name="Оюутан")
    room = models.ForeignKey(Room, on_delete=models.SET_NULL, null=True, verbose_name="Байрлал")
    day = models.DateField(verbose_name="Өдөр")
    starttime = models.TimeField(verbose_name="Эхлэх цаг")
    endtime = models.TimeField(verbose_name="Дуусах цаг")
    chair_num = models.PositiveIntegerField(verbose_name="Суудлын дугаар")
    description = models.CharField(max_length=500, null=True, verbose_name="Захиалгын мэдээлэл, хүсэлт")
    order_flag = models.PositiveIntegerField(choices=ORDER_FLAG, db_index=True, default=ORDERED, verbose_name="Захиалгын төлөв")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class GymPaymentSettings(models.Model):
    """Фитнесийн сургалтын тохиргоо"""

    name = models.CharField(max_length=200, verbose_name="Сургалтын нэр")
    mount_count = models.PositiveIntegerField(verbose_name="Хичээллэх сар")
    week_day = models.CharField(max_length=50, verbose_name="Хичээллэх гарагууд")
    accepted_count = models.PositiveIntegerField(verbose_name="Долоо хоногт хичээллэх тоо")
    room = models.ForeignKey(Room, on_delete=models.SET_NULL, null=True, verbose_name="Байрлал")
    payment = models.FloatField(verbose_name="Төлбөрийн дүн")
    is_freetime = models.BooleanField(default=False, verbose_name="Чөлөөт цагийн хуваарьтай")
    start_time = models.TimeField(null=True, verbose_name="Хичээл эхлэх цаг")
    finish_time = models.TimeField(null=True, verbose_name="Хичээл дуусах цаг")
    description = models.CharField(max_length=500, null=True, verbose_name="Тайлбар")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class StudentGym(models.Model):
    """Фитнесийн оюутны бүртгэл"""

    student = models.ForeignKey(Student, on_delete=models.PROTECT, verbose_name="Оюутан")
    gym_payment = models.ForeignKey(GymPaymentSettings, on_delete=models.PROTECT, verbose_name="Сонгосон сургалт")
    start_date = models.DateField(verbose_name="Хичээллэж эхлэх огноо")
    is_confirm = models.BooleanField(default=False, verbose_name="Бүртгэл баталгаажсан эсэх")
    payment = models.ForeignKey(Payment, on_delete=models.SET_NULL, null=True,verbose_name="Төлбөр төлөгдсөн мэдээлэл")
    stop_date = models.DateField(null=True, verbose_name="Сургалт зогсоох огноо")
    stop_duration = models.PositiveIntegerField(null=True, verbose_name="Зогсоох хугацаа өдрөөр 7 оос их")
    finish_date = models.DateField(verbose_name="Хичээллэж дуусах огноо")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class OtherUserGym(models.Model):
    """Фитнесийн бусад суралцагчийн бүртгэл"""

    trainer = models.ForeignKey(Teachers, on_delete=models.PROTECT, verbose_name="Багш болон гадны суралцагч")
    gym_payment = models.ForeignKey(GymPaymentSettings, on_delete=models.PROTECT, verbose_name="Сонгосон сургалт")
    start_date = models.DateField(verbose_name="Хичээллэж эхлэх огноо")
    is_confirm = models.BooleanField(default=False, verbose_name="Бүртгэл баталгаажсан эсэх")
    payment = models.ForeignKey(Payment, on_delete=models.SET_NULL, null=True,verbose_name="Төлбөр төлөгдсөн мэдээлэл")
    stop_date = models.DateField(null=True, verbose_name="Сургалт зогсоох огноо")
    stop_duration = models.PositiveIntegerField(null=True, verbose_name="Зогсоох хугацаа өдрөөр 7 оос их")
    finish_date = models.DateField(verbose_name="Хичээллэж дуусах огноо")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class StudentOrderGym(models.Model):
    """ Оюутны захиалга бялдаржуулах төв """

    ORDERED = 1
    REVOKE = 2
    COME = 3

    ORDER_FLAG = (
        (ORDERED, 'Захиалсан'),
        (REVOKE, 'Цуцалсан'),
        (COME, 'Ирсэн'),
    )

    student = models.ForeignKey(Student, on_delete=models.PROTECT, verbose_name="Оюутан")
    gym_payment = models.ForeignKey(GymPaymentSettings, on_delete=models.PROTECT, verbose_name="Сонгосон сургалт")
    day = models.DateField(verbose_name="Өдөр")
    starttime = models.TimeField(verbose_name="Эхлэх цаг")
    endtime = models.TimeField(verbose_name="Дуусах цаг")
    order_flag = models.PositiveIntegerField(choices=ORDER_FLAG, db_index=True, default=ORDERED, verbose_name="Захиалгын төлөв")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class OtherUserOrderGym(models.Model):
    """ Бусад хэрэглэгчийн захиалга бялдаржуулах төв """

    ORDERED = 1
    REVOKE = 2
    COME = 3

    ORDER_FLAG = (
        (ORDERED, 'Захиалсан'),
        (REVOKE, 'Цуцалсан'),
        (COME, 'Ирсэн'),
    )

    student = models.ForeignKey(Teachers, on_delete=models.PROTECT, verbose_name="Оюутан")
    gym_payment = models.ForeignKey(GymPaymentSettings, on_delete=models.PROTECT, verbose_name="Сонгосон сургалт")
    day = models.DateField(verbose_name="Өдөр")
    starttime = models.TimeField(verbose_name="Эхлэх цаг")
    endtime = models.TimeField(verbose_name="Дуусах цаг")
    order_flag = models.PositiveIntegerField(choices=ORDER_FLAG, db_index=True, default=ORDERED, verbose_name="Захиалгын төлөв")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class StudentOrderHospital(models.Model):
    """ Эмнэлэгт цаг авах"""

    ORDERED = 1
    REVOKE = 2
    COME = 3

    ORDER_FLAG = (
        (ORDERED, 'Захиалсан'),
        (REVOKE, 'Цуцалсан'),
        (COME, 'Ирсэн'),
    )

    student = models.ForeignKey(Student, on_delete=models.PROTECT, verbose_name="Оюутан")
    day = models.DateField(verbose_name="Өдөр")
    starttime = models.TimeField(verbose_name="Эхлэх цаг")
    endtime = models.TimeField(verbose_name="Дуусах цаг")
    description = models.CharField(max_length=500, null=True, verbose_name="Зовиур, шалтгаан")
    order_flag = models.PositiveIntegerField(choices=ORDER_FLAG, db_index=True, default=ORDERED, verbose_name="Захиалгын төлөв")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

#------------------------------------------------------------Хүсэлт---------------------------------------------------
class StudentRequestVolunteer(models.Model):
    """Олон нийтийн ажилд оролцох хүсэлт"""

    SEND = 1
    REVOKE = 2
    ALLOW = 3
    REJECT = 4

    REQUEST_FLAG = (
        (SEND, 'Илгээсэн'),
        (REVOKE, 'Цуцалсан'),
        (ALLOW, 'Зөвшөөрсөн'),
        (REJECT, 'Татгалзсан'),
    )

    student = models.ForeignKey(Student, on_delete=models.PROTECT, verbose_name="Оюутан")
    action = models.ForeignKey(LearningCalendar, on_delete=models.SET_NULL, null=True, verbose_name="Олон нийтийн ажил")
    lesson_year = models.CharField(max_length=20, null=True, verbose_name='Хичээлийн жил')
    lesson_season = models.ForeignKey(Season, on_delete=models.SET_NULL, null=True, verbose_name='Улирал')
    description = models.TextField( null=True, verbose_name="Дэлгэрэнгүй хүсэлт")
    request_flag = models.PositiveIntegerField(choices=REQUEST_FLAG, db_index=True, default=SEND, verbose_name="Хүсэлтийн төлөв")
    answer = models.CharField(max_length=500, null=True, verbose_name="Хариулт")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class Club(models.Model):
    """Клубын бүртгэл"""

    STUDY = 1
    SPORT = 2
    CULTURE = 3
    ART = 4
    SOCIAL = 5

    CLUB_TYPE = (
        (STUDY, "Сургалт"),
        (SPORT, "Спорт"),
        (CULTURE, "Соёл урлаг"),
        (ART, "Бүтээлч урлал"),
        (SOCIAL, "Олон нийт"),
    )
    name = models.CharField(max_length=500, verbose_name="Клубын нэр")
    type = models.PositiveIntegerField(choices=CLUB_TYPE, db_index=True, default=STUDY, verbose_name="Үйл ажиллагааны чиглэл")
    purpose = models.CharField(max_length=500, null=True, verbose_name="Зорилго")
    start_year = models.PositiveIntegerField(null=True, verbose_name="Байгуулагдсан он")
    member_count = models.PositiveIntegerField(null=True, verbose_name="Идэвхтэй гишүүдийн тоо")
    leader = models.CharField(max_length=100, verbose_name="Удирдагчийн мэдээлэл")
    org = models.ForeignKey(Schools, on_delete=models.CASCADE, verbose_name="Байгууллага", null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class ClubFile(models.Model):
    """Өрөөний танилцуулга хавсаргасан файл"""

    def file_directory_path(instance, filename):
        return '{0}/{1}/{2}'.format(settings.CLUB, instance.id, filename)

    club = models.ForeignKey(Club, on_delete=models.CASCADE,verbose_name="Клуб")
    description = models.CharField(max_length=250, null=True,verbose_name="Файлын тайлбар")
    file = models.ImageField(upload_to=file_directory_path, max_length=255, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if self.id is None:
            saved_image = self.file
            self.file = None
            super(ClubFile, self).save(*args, **kwargs)
            self.file = saved_image
            if 'force_insert' in kwargs:
                kwargs.pop('force_insert')

        super(ClubFile, self).save(*args, **kwargs)


class StudentRequestClub(models.Model):
    """Оюутны клубт элсэх хүсэлтийн бүртгэл"""

    SEND = 1
    REVOKE = 2
    ALLOW = 3
    REJECT = 4

    REQUEST_FLAG = (
        (SEND, 'Илгээсэн'),
        (REVOKE, 'Цуцалсан'),
        (ALLOW, 'Зөвшөөрсөн'),
        (REJECT, 'Татгалзсан'),
    )

    student = models.ForeignKey(Student, on_delete=models.PROTECT, verbose_name="Оюутан")
    club = models.ForeignKey(Club, on_delete=models.PROTECT, verbose_name="Клуб")
    description = models.TextField(null=True, verbose_name="Дэлгэрэнгүй хүсэлт")
    request_flag = models.PositiveIntegerField(choices=REQUEST_FLAG, db_index=True, default=SEND, verbose_name="Хүсэлтийн төлөв")
    answer = models.CharField(max_length=500, null=True, verbose_name="Хариулт")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class StudentRequestTutor(models.Model):
    """Багшийн туслахаар ажиллах хүсэлт"""

    SEND = 1
    REVOKE = 2
    ALLOW = 3
    REJECT = 4

    REQUEST_FLAG = (
        (SEND, 'Илгээсэн'),
        (REVOKE, 'Цуцалсан'),
        (ALLOW, 'Зөвшөөрсөн'),
        (REJECT, 'Татгалзсан'),
    )

    student = models.ForeignKey(Student, on_delete=models.PROTECT, verbose_name="Оюутан")
    lesson_year = models.CharField(max_length=20, null=True, verbose_name='Хичээлийн жил')
    lesson_season = models.ForeignKey(Season, on_delete=models.SET_NULL, null=True, verbose_name='Улирал')
    lesson = models.ForeignKey(LessonStandart, on_delete=models.SET_NULL, null=True, verbose_name="Заах хичээл")
    teacher = models.ForeignKey(Teachers, on_delete=models.SET_NULL, null=True, verbose_name="Дагалдах багш")
    description = models.TextField( null=True, verbose_name="Дэлгэрэнгүй хүсэлт")
    request_flag = models.PositiveIntegerField(choices=REQUEST_FLAG, db_index=True, default=SEND, verbose_name="Хүсэлтийн төлөв")
    answer = models.CharField(max_length=500, null=True, verbose_name="Хариулт")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


#--------------------------------------------------------------Үйлчилгээ-----------------------------------------------------------------
class StudentNotice(models.Model):
    """Зар мэдээлэл"""

    def file_directory_path(instance, filename):
        return '{0}/{1}/{2}'.format(settings.NEWS, instance.id, filename)

    title = models.CharField(max_length=200, verbose_name="Гарчиг")
    body = models.TextField(verbose_name="Мэдээний хэсэг")
    image = models.ImageField(upload_to=file_directory_path, null=True, blank=True, verbose_name='зураг')
    scope = models.PositiveIntegerField(choices=LearningCalendar.SCOPE, db_index=True, default=LearningCalendar.OTHER, verbose_name="Хэн хамрагдах")
    student_level = models.PositiveIntegerField(null=True, verbose_name="Оюутны курс")
    department = models.ForeignKey(Salbars, on_delete=models.SET_NULL, null=True, verbose_name="Хөтөлбөрийн баг")
    is_news = models.BooleanField(default=False)
    school = models.ForeignKey(SubOrgs, on_delete=models.SET_NULL, null=True, verbose_name="Сургууль")
    org = models.ForeignKey(Schools, on_delete=models.CASCADE, verbose_name="Байгууллага", null=True)
    created_user = models.ForeignKey(User, related_name='news_cr_user', on_delete=models.SET_NULL, null=True, verbose_name="Бүртгэсэн хэрэглэгч")
    updated_user = models.ForeignKey(User, related_name='news_up_user', on_delete=models.SET_NULL, null=True, verbose_name="Зассан хэрэглэгч")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class StudentNoticeFile(models.Model):
    """Зар мэдээ хавсаргасан файл"""

    def file_directory_path(instance, filename):
        return '{0}/{1}/{2}'.format(settings.NOTICE, instance.id, filename)

    notice = models.ForeignKey(StudentNotice, on_delete=models.CASCADE,verbose_name="Зар мэдээ")
    file = models.ImageField(upload_to=file_directory_path, max_length=255, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if self.id is None:
            saved_image = self.file
            self.file = None
            super(StudentNoticeFile, self).save(*args, **kwargs)
            self.file = saved_image
            if 'force_insert' in kwargs:
                kwargs.pop('force_insert')

        super(StudentNoticeFile, self).save(*args, **kwargs)



# --------------------------------------Өргөдөл, санал хүсэлт бүртгэл-------------------------------------------
class Complaint_unit(models.Model):
    """ Хүсэлт шийдвэрлэх нэгж """

    SZ = 1
    SEDZ =2
    SA = 3
    BSZ = 4
    JA = 5
    NS1 = 6
    NS2 = 7
    XBA = 8
    MA = 9
    UM = 10
    BMA = 11
    ZB = 12
    SAD = 13
    SM = 14

    SOLVED_UNIT = (
        (SZ, "Сургуулийн захирал"),
        (SEDZ, "Сургалт эрхэлсэн дэд захирал"),
        (SA, "Санхүүгийн алба"),
        (BSZ, "Бүрэлдэхүүн сургуулийн захирал"),
        (JA, "Журналын архив"),
        (NS1, "Номын сан танхим 1"),
        (NS2, "Номын сан танхим 2"),
        (XBA, "Хөтөлбөрийн багийн ахлагч"),
        (MA, "Маркетингийн алба"),
        (UM, "Үнэлгээний мэргэжилтэн"),
        (BMA, "Бүртгэл мэдээллийн алба"),
        (ZB, "Зөвлөх багш"),
        (SAD, 'Сургалтын албаны дарга'),
        (SM, 'Сургалтын менежер')
    )

    unit = models.PositiveIntegerField(choices=SOLVED_UNIT, db_index=True, default=BMA, verbose_name="Хүсэлтийн нэгж")
    position = models.ManyToManyField(OrgPosition, blank=True, verbose_name="Хамаарах албан тушаал")
    menus = models.TextField(null=True)
    org = models.ForeignKey(Schools, on_delete=models.CASCADE, verbose_name="Байгууллага", null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class Complaint(models.Model):
    """ Өргөдөл, санал хүсэлт """

    CT_1 = 1
    CT_2 = 2
    CT_3 = 3
    CT_4 = 4
    CT_5 = 5
    CT_6 = 6


    COMPLAINT_TYPE = (
        (CT_1, 'Жилийн чөлөөнөөс ирэх'),
        (CT_2, 'Анги солих'),
        (CT_3, 'Улиран суралцах'),
        (CT_4, 'Төгсөх хүсэлт'),
        (CT_5, 'Дүнгийн зөрчил арилгуулах'),
        (CT_6, 'Бусад санал хүсэлт, гомдол'),
    )

    student = models.ForeignKey(Student, on_delete=models.PROTECT, verbose_name='Оюутан')
    lesson_year = models.CharField(max_length=20, null=True, verbose_name='Хичээлийн жил')
    lesson_season = models.ForeignKey(Season, on_delete=models.SET_NULL, null=True, verbose_name='Улирал')
    complaint_type = models.PositiveIntegerField(choices=COMPLAINT_TYPE, db_index=True, default=CT_6, verbose_name="Өргөдлийн зориулалт")
    title = models.CharField(max_length=255, verbose_name="Гарчиг")
    body = models.CharField(max_length=1000, null=True, verbose_name="Өргөдөл")
    file = models.FileField(null=True, verbose_name="Хавсаргасан файл")
    is_solved = models.PositiveIntegerField(choices=StudentRequestTutor.REQUEST_FLAG, db_index=True, default=StudentRequestTutor.SEND, verbose_name="Шийдвэрлэсэн эсэх")
    solved_message = models.CharField(max_length=500, null=True, verbose_name="Шийдвэрийн тайлбар")
    org = models.ForeignKey(Schools, on_delete=models.CASCADE, verbose_name="Байгууллага", null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class Complaint_Answer(models.Model):
    """ Өргөдөлд хариу илгээсэн бүртгэл """

    request = models.ForeignKey(Complaint, on_delete=models.PROTECT, verbose_name='Өргөдөл')
    unit = models.PositiveIntegerField(choices=Complaint_unit.SOLVED_UNIT, db_index=True, default=Complaint_unit.BMA, verbose_name="Шийдвэрлэх нэгж")
    date = models.DateField(verbose_name="Хүсэлтийн огноо")
    is_confirm = models.BooleanField(default=False, verbose_name="Зөвшөөрсөн эсэх")
    message = models.CharField(max_length=500, null=True, verbose_name="Тайлбар")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class StudentRoutingSlip(models.Model):
    """Тойрох хуудасны бүртгэл"""

    RS_1 = 1
    RS_2 = 2
    RS_3 = 3


    ROUTINGSLIP_TYPE = (
        (RS_1, 'Шилжиж явах'),
        (RS_2, 'Сургуулиас гарах'),
        (RS_3, 'Төгсөх'),
    )
    student = models.ForeignKey(Student, on_delete=models.PROTECT, verbose_name='Оюутан')
    lesson_year = models.CharField(max_length=20, null=True, verbose_name='Хичээлийн жил')
    lesson_season = models.ForeignKey(Season, on_delete=models.SET_NULL, null=True, verbose_name='Улирал')
    routingslip_type = models.PositiveIntegerField(choices=ROUTINGSLIP_TYPE, db_index=True, default=RS_3, verbose_name="Зориулалт")
    title = models.CharField(max_length=255, verbose_name="Гарчиг")
    body = models.CharField(max_length=1000, null=True, verbose_name="Хүсэлт")
    file = models.FileField(null=True, verbose_name="Хавсаргасан файл")
    is_solved = models.PositiveIntegerField(choices=StudentRequestTutor.REQUEST_FLAG, db_index=True, default=StudentRequestTutor.SEND, verbose_name="Шийдвэрлэсэн эсэх")
    solved_message = models.CharField(max_length=500, null=True, verbose_name="Шийдвэрийн тайлбар")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class RoutingSlip_Answer(models.Model):
    """ Тойрох хуудсанд хариу илгээсэн бүртгэл """

    request = models.ForeignKey(StudentRoutingSlip, on_delete=models.PROTECT, verbose_name='Тойрох хуудас')
    unit = models.PositiveIntegerField(choices=Complaint_unit.SOLVED_UNIT, db_index=True, default=Complaint_unit.BMA, verbose_name="Шийдвэрлэх нэгж")
    date = models.DateField(verbose_name="Хариулсан огноо")
    is_confirm = models.BooleanField(default=False, verbose_name="Зөвшөөрсөн эсэх")
    message = models.CharField(max_length=500, null=True, verbose_name="Тайлбар")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class StudentLeaveRequest(models.Model):
    """Чөлөөний хүсэлт бүртгэл"""

    LR_1 = 1
    LR_2 = 2
    LR_3 = 3


    LEAVE_TYPE = (
        (LR_1, 'Жилийн чөлөө'),
        (LR_2, 'Cарын чөлөө'),
        (LR_3, 'Хоногийн чөлөө'),
    )
    student = models.ForeignKey(Student, on_delete=models.PROTECT, verbose_name='Оюутан')
    lesson_year = models.CharField(max_length=20, null=True, verbose_name='Хичээлийн жил')
    lesson_season = models.ForeignKey(Season, on_delete=models.SET_NULL, null=True, verbose_name='Улирал')
    leave_type = models.PositiveIntegerField(choices=LEAVE_TYPE, db_index=True, default=LR_1, verbose_name="Чөлөөний төрөл")
    start_date = models.DateField(verbose_name="Чөлөө эхлэх огноо")
    count = models.PositiveIntegerField(null=True, verbose_name="Чөлөө авах хоног/сар")
    cause = models.CharField(max_length=200, null=True, verbose_name="Шалтгаан")
    file = models.FileField(null=True, verbose_name="Хавсаргасан файл")
    is_solved = models.PositiveIntegerField(choices=StudentRequestTutor.REQUEST_FLAG, db_index=True, default=StudentRequestTutor.SEND, verbose_name="Шийдвэрлэсэн эсэх")
    solved_message = models.CharField(max_length=500, null=True, verbose_name="Шийдвэрийн тайлбар")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class LeaveRequest_Answer(models.Model):
    """ Чөлөөний хүсэлтэнд хариу илгээсэн бүртгэл """

    request = models.ForeignKey(StudentLeaveRequest, on_delete=models.PROTECT, verbose_name='Чөлөөний хүсэлт')
    unit = models.PositiveIntegerField(choices=Complaint_unit.SOLVED_UNIT, db_index=True, default=Complaint_unit.BMA, verbose_name="Шийдвэрлэх нэгж")
    date = models.DateField(verbose_name="Хариулсан огноо")
    is_confirm = models.BooleanField(default=False, verbose_name="Зөвшөөрсөн эсэх")
    message = models.CharField(max_length=500, null=True, verbose_name="Тайлбар")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class StudentCorrespondScore(models.Model):
    """Дүнгийн дүйцүүлэлт хийх хүсэлт бүртгэл"""

    def file_directory_path(instance, filename):
        return '{0}/{1}/{2}'.format(settings.CORRESPOND, instance.id, filename)

    CS_1 = 1
    CS_2 = 2
    CS_3 = 3

    CORRESPOND_TYPE = (
        (CS_1, 'Өөр сургуулиас ирсэн'),
        (CS_2, 'Сургууль төгсөөд ирсэн'),
        (CS_3, 'Өөр мэргэжлээс ирсэн'),
    )

    student = models.ForeignKey(Student, on_delete=models.CASCADE, null=True, verbose_name='Оюутан')
    lesson_year = models.CharField(max_length=20, null=True, verbose_name='Хичээлийн жил')
    lesson_season = models.ForeignKey(Season, on_delete=models.SET_NULL, null=True, verbose_name='Улирал')
    first_name = models.CharField(max_length=100, verbose_name="Оюутны нэр", null=True)
    last_name = models.CharField(max_length=100, verbose_name="Оюутны овог", null=True)
    register_num = models.CharField(max_length=50, verbose_name='Оюутны регистрийн дугаар', null=True)
    profession = models.ForeignKey(ProfessionDefinition,  on_delete=models.CASCADE, verbose_name='Мэргэжил', null=True)
    correspond_type = models.PositiveIntegerField(choices=CORRESPOND_TYPE, db_index=True, default=CS_1, verbose_name="Дүйцүүлэлтийн төрөл")
    cause = models.CharField(max_length=200, null=True, verbose_name="Тайлбар")
    file = models.FileField(upload_to=file_directory_path, null=True, editable = True, verbose_name="Хавсаргасан файл")
    is_solved = models.PositiveIntegerField(choices=StudentRequestTutor.REQUEST_FLAG, db_index=True, default=StudentRequestTutor.SEND, verbose_name="Шийдвэрлэсэн эсэх")
    solved_message = models.CharField(max_length=500, null=True, verbose_name="Удирдлагын шийдвэр")
    phone = models.CharField(max_length=50, verbose_name='Оюутны утасны дугаар', null=True)

    student_group = models.ForeignKey(Group,on_delete=models.CASCADE, null=True, verbose_name='Суралцаж байсан анги')
    student_code = models.CharField(verbose_name='Хуучин оюутны код', null=True, max_length=80)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if self.id is None:
            saved_file = self.file
            self.file = None
            super(StudentCorrespondScore, self).save(*args, **kwargs)
            self.file = saved_file
            if 'force_insert' in kwargs:
                kwargs.pop('force_insert')

        super(StudentCorrespondScore, self).save(*args, **kwargs)

    @property
    def full_name(self):
        first_name = self.first_name
        last_name = self.last_name

        full_name = get_fullName(last_name, first_name, is_dot=False)

        return full_name


class StudentCorrespondLessons(models.Model):

    correspond = models.ForeignKey(StudentCorrespondScore, on_delete=models.CASCADE)
    correspond_lesson = models.ForeignKey(LessonStandart, on_delete=models.CASCADE, verbose_name='Дүйцүүлэх хичээл')
    correspond_kredit = models.PositiveIntegerField(verbose_name='Дүйцүүлэх кредит')
    season = models.PositiveIntegerField(db_index=True, default=1, verbose_name="Дүйцүүлэх хичээл улирал", null=True)


    learn_lesson = models.CharField(max_length=200, verbose_name='Суралцсан хичээл')
    learn_kredit = models.PositiveIntegerField(verbose_name='Суралцсан кредит')
    score = models.FloatField(verbose_name='Дүйцүүлсэн дүн', null=True)

    is_allow = models.BooleanField(default=False, verbose_name='Хичээлийг дүйцүүлэхийг зөвшөөрөх эсэх')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class Correspond_Answer(models.Model):
    """ Дүйцүүлэлтэнд хариу илгээсэн бүртгэл """

    request = models.ForeignKey(StudentCorrespondScore, on_delete=models.PROTECT, verbose_name='Дүйцүүлэлтийн хүсэлт')
    unit = models.PositiveIntegerField(choices=Complaint_unit.SOLVED_UNIT, db_index=True, default=Complaint_unit.BMA, verbose_name="Шийдвэрлэх нэгж")
    date = models.DateField(verbose_name="Хариулсан огноо")
    is_confirm = models.BooleanField(default=False, verbose_name="Зөвшөөрсөн эсэх")
    message = models.CharField(max_length=500, null=True, verbose_name="Тайлбар")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


# Чат өрөөний хэрэглэгчийн бүртгэл
class ChatRoom(models.Model):
	roomId = ShortUUIDField(verbose_name="чатөрөөний id")
	type = models.CharField(max_length=10, default='DM', verbose_name="өрөөний төрөл")
	member = models.ManyToManyField(StudentLogin, verbose_name="Тухайн өрөөнд харъялагдах хэрэглэгчидийн жагсаалт")
	name = models.CharField(max_length=20, null=True, blank=True, verbose_name="Өрөөний нэр")

	def __str__(self):
		return self.roomId + ' -> ' + str(self.name)


# Чат бичсэн бичиглэл хадгалагдана
class ChatMessage(models.Model):

    def user_directory_path(instance, filename):
        return '{0}/{1}'.format(settings.CHAT, filename)

    chat = models.ForeignKey(ChatRoom, on_delete=models.SET_NULL, null=True, verbose_name="чат өрөө")
    user = models.ForeignKey(StudentLogin, on_delete=models.SET_NULL, null=True, verbose_name="чат бичсэн хэрэглэгч")
    file = models.FileField(upload_to = user_directory_path)
    message = models.CharField(max_length=255, verbose_name="чатны агуулга")
    readed_user = models.ManyToManyField(StudentLogin, related_name='readed_user', verbose_name="тухайн чатыг уншсан хэрэглэгчид")
    timestamp = models.DateTimeField(auto_now_add=True, verbose_name="тухайн чатыг илгээсэн огноо")

    def __str__(self):
        return self.message


# Online байга хэрэглэгчид
class OnlineUser(models.Model):

	user = models.OneToOneField(StudentLogin, on_delete=models.CASCADE, verbose_name="online хэрглэгч")

	def __str__(self):
		return self.user.username

#--------------------------------------------Кредит цагийн ачаалал---------------------------------------


class TimeEstimateSettings(models.Model):
    ''' Цагийн тооцоо тохиргоо '''

    NOT_CHAMBER = 1
    TEACHER_DEGREE_KREDIT = 2

    SETTINGS_CHOICES = (
        (NOT_CHAMBER, 'Танхимийн бус кредитийн коэффициент'),
        (TEACHER_DEGREE_KREDIT, 'Багшийн зэрэглэлийн кредит норм '),
    )

    type = models.PositiveIntegerField(choices=SETTINGS_CHOICES, verbose_name='Тохиргооны төрөл')
    position = models.ForeignKey(OrgPosition, on_delete=models.CASCADE, null=True, verbose_name='Албан тушаал')

    name = models.CharField(max_length=500, verbose_name='Нэр', null=True)
    ratio = models.FloatField(verbose_name='коэффициент')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class TeacherCreditVolumePlan(models.Model):
    """ Багшийн заах цагийн ачаалал бүртгэх"""

    lesson = models.ForeignKey(LessonStandart, on_delete=models.CASCADE, null=True, verbose_name='Хичээл')
    lesson_year = models.CharField(max_length=20, null=True, verbose_name='Хичээлийн жил')
    lesson_season = models.ForeignKey(Season, on_delete=models.SET_NULL, null=True, verbose_name='Улирал')
    teacher = models.ForeignKey(Teachers, on_delete=models.PROTECT, null=True, verbose_name="Багш")
    type = models.PositiveIntegerField(choices=TimeTable.LESSON_TYPE, db_index=True, default=TimeTable.LECT, verbose_name="Хичээллэх төрөл")
    credit = models.PositiveIntegerField(null=True, verbose_name="Хичээлийн төрөлд хамаарах кредит цаг")
    department = models.ForeignKey(Salbars, on_delete=models.SET_NULL, null=True, verbose_name="Хөтөлбөрийн баг")
    school = models.ForeignKey(SubOrgs, on_delete=models.SET_NULL, null=True, verbose_name="Сургууль")
    org = models.ForeignKey(Schools, on_delete=models.CASCADE, verbose_name="Байгууллага", null=True)
    odd_even = models.PositiveIntegerField(choices=TimeTable.ODD_EVEN_VALUE, db_index=True, default=TimeTable.ALL, verbose_name="Тэгш сондгой")

    is_timetable = models.BooleanField(default=False, verbose_name="Хуваарьт бүртгэгдсэн эсэх")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class TeacherCreditVolumePlan_group(models.Model):
    """ Цагийн ачаалалд анги холбох"""

    creditvolume = models.ForeignKey(TeacherCreditVolumePlan, on_delete=models.CASCADE, null=True, verbose_name='Багшийн заах хичээлийн бүртгэл')
    group = models.ForeignKey(Group, on_delete=models.SET_NULL, null=True, verbose_name="Суралцах ангийн бүртгэл")
    st_count = models.PositiveIntegerField(null=True, verbose_name="Оюутны тоо")
    lesson_level = models.PositiveIntegerField(choices=LearningPlan.LESSON_LEVEL, db_index=True, null=False, default=LearningPlan.BASIC, verbose_name="Хичээлийн түвшин")
    exec_credit_flag = models.PositiveIntegerField(null=True, verbose_name="Гүйцэтгэлийн кр тооцох коэффициент")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class SchoolLessonLevelVolume(models.Model):
    """ Гүйцэтгэлийн кр тооцох коэффициент"""

    school = models.ForeignKey(SubOrgs, on_delete=models.SET_NULL, null=True, verbose_name="Сургууль")
    org = models.ForeignKey(Schools, on_delete=models.CASCADE, verbose_name="Байгууллага", null=True)
    lesson_level = models.PositiveIntegerField(choices=LearningPlan.LESSON_LEVEL, db_index=True, null=False, default=LearningPlan.BASIC, verbose_name="Хичээлийн түвшин")
    amount = models.PositiveIntegerField(default=40, verbose_name="Гүйцэтгэлийн кр тооцох коэфф")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class TeacherCreditEstimationA(models.Model):
    """ Багшийн А цагийн тооцоо бүртгэх"""

    lesson = models.ForeignKey(LessonStandart, on_delete=models.CASCADE, null=True, verbose_name='Хичээл')
    lesson_year = models.CharField(max_length=20, null=True, verbose_name='Хичээлийн жил')
    lesson_season = models.ForeignKey(Season, on_delete=models.SET_NULL, null=True, verbose_name='Улирал')

    teacher = models.ForeignKey(Teachers, on_delete=models.PROTECT, null=True, verbose_name="Багш")

    # Танхимийн бүртгэл
    lecture_kr = models.FloatField(null=True, verbose_name="Лекцийн цаг")
    seminar_kr = models.FloatField(null=True, verbose_name="Семинарын цаг")
    laborator_kr = models.FloatField(null=True, verbose_name="Лабораторын цаг")
    practice_kr = models.FloatField(null=True, verbose_name="Практикын цаг")
    biedaalt_kr = models.FloatField(null=True, verbose_name="Биедаалтын цаг")

    department = models.ForeignKey(Salbars, on_delete=models.SET_NULL, null=True, verbose_name="Хөтөлбөрийн баг")
    school = models.ForeignKey(SubOrgs, on_delete=models.SET_NULL, null=True, verbose_name="Сургууль")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def total_kr(self):
        total = 0

        if self.lecture_kr:
            total += self.lecture_kr

        if self.seminar_kr:
            total += self.seminar_kr

        if self.laborator_kr:
            total += self.laborator_kr

        if self.practice_kr:
            total += self.practice_kr

        if self.biedaalt_kr:
            total += self.biedaalt_kr

        return total



class TeacherCreditNotChamberEstimationA(models.Model):
    """ Багшийн танхим бус А цагийн тооцоо """

    timeestimatea = models.ForeignKey(TeacherCreditEstimationA, on_delete=models.CASCADE, verbose_name='А цагийн танхим')
    time_estimate_settings = models.ForeignKey(TimeEstimateSettings, on_delete=models.CASCADE, verbose_name='Цагийн ачааллын тохиргоо')
    amount = models.FloatField(verbose_name='Тоо хэмжээ')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class TeacherCreditEstimationA_group(models.Model):
    """ А цагийн тооцоо анги холбох"""

    creditestimation = models.ForeignKey(TeacherCreditEstimationA, on_delete=models.CASCADE, null=True, verbose_name='Багшийн заах хичээлийн бүртгэл')
    group = models.ForeignKey(Group, on_delete=models.SET_NULL, null=True, verbose_name="Суралцах ангийн бүртгэл")
    st_count = models.PositiveIntegerField(null=True, verbose_name="Оюутны тоо")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

#-----------------------------------------------Хандах эрх------------------------------------------------------------

class PermissionsTeacherScore(models.Model):
    """ Багшийн дүн оруулах эрх"""

    lesson_year = models.CharField(max_length=20, null=True, verbose_name='Хичээлийн жил')
    lesson_season = models.ForeignKey(Season, on_delete=models.SET_NULL, null=True, verbose_name='Улирал')
    teacher_scoretype = models.ForeignKey(Lesson_teacher_scoretype, on_delete=models.PROTECT, null=True, verbose_name="Багшийн дүгнэх хэлбэр")
    start_date = models.DateTimeField(null=True, verbose_name="Эхлэх хугацаа")
    finish_date = models.DateTimeField(null=True, verbose_name="Дуусах хугацаа")
    description = models.CharField(max_length=500, null=True, verbose_name='Тайлбар шалтгаан')
    created_user = models.ForeignKey(User, related_name='pts_cr_user', on_delete=models.SET_NULL, null=True, verbose_name="Бүртгэсэн хэрэглэгч")
    updated_user = models.ForeignKey(User, related_name='pts_up_user', on_delete=models.SET_NULL, null=True, verbose_name="Зассан хэрэглэгч")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('lesson_year', 'lesson_season', 'teacher_scoretype')


class PermissionsStudentChoice(models.Model):
    """ Оюутны хичээл сонголтыг төлбөрөөс хамааралгүйгээр хийх эрх"""

    lesson_year = models.CharField(max_length=20, null=True, verbose_name='Хичээлийн жил')
    lesson_season = models.ForeignKey(Season, on_delete=models.SET_NULL, null=True, verbose_name='Улирал')
    student = models.ForeignKey(Student, on_delete=models.PROTECT, null=True, verbose_name="Оюутан")
    start_date = models.DateTimeField(null=True, verbose_name="Эхлэх хугацаа")
    finish_date = models.DateTimeField(null=True, verbose_name="Дуусах хугацаа")
    description = models.CharField(max_length=500, null=True, verbose_name='Тайлбар шалтгаан')
    created_user = models.ForeignKey(User, related_name='psc_cr_user', on_delete=models.SET_NULL, null=True, verbose_name="Бүртгэсэн хэрэглэгч")
    updated_user = models.ForeignKey(User, related_name='psc_up_user', on_delete=models.SET_NULL, null=True, verbose_name="Зассан хэрэглэгч")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('lesson_year', 'lesson_season', 'student')


class PermissionsOtherInterval(models.Model):
    """ Бусад хандах эрх"""

    TIMETABLE = 1
    TEACHCORE = 2
    EXAMSCORE = 3
    REPEAT = 4
    ONLINE = 5
    YELLOW_BOOK = 6
    ADMISSION = 7
    EXAM_QUESTION = 8
    EXAM = 9
    TEACHER_TIME = 10
    PRACTICE = 10

    PERMISSION_TYPE=(
        (TIMETABLE, "Хичээлийн хуваарийн эрх"),
        (TEACHCORE, "Улирлын 70 оноо оруулах хугацаа"),
        (EXAMSCORE, "Улирлын 30 оноо оруулах хугацаа"),
        (REPEAT, "Давтан шалгалт оноо оруулах хугацаа"),
        (ONLINE, "Цахим хичээл байршуулах хугацаа"),
        (YELLOW_BOOK, "Их сургуулийн нэгдсэн төлөвлөлт /шар ном/-д мэдээлэл байршуулах хугацаа"),
        (ADMISSION, "Шинэ элсэгчдийг элсэлтийн системээс сургалтын системруу татах хугацаа"),
        (EXAM_QUESTION, "Шалгалтын даалгавар оруулах хугацаа"),
        (EXAM, "Шалгалтын хуваарь үүсгэх хугацаа"),
        (TEACHER_TIME, "Багш багц цагт тооцох мэдээлэл оруулах хугацаа"),
        (PRACTICE, "Дадлагын оноо байршуулах хугацаа")
    )

    org = models.ForeignKey(Schools, on_delete=models.CASCADE, verbose_name="Байгууллага", null=True)
    lesson_year = models.CharField(max_length=20, null=True, verbose_name='Хичээлийн жил')
    lesson_season = models.ForeignKey(Season, on_delete=models.SET_NULL, null=True, verbose_name='Улирал')
    permission_type = models.PositiveIntegerField(choices=PERMISSION_TYPE, db_index=True, null=False, default=TIMETABLE, verbose_name="Хандах эрх")
    start_date = models.DateTimeField(null=True, verbose_name="Эхлэх хугацаа")
    finish_date = models.DateTimeField(null=True, verbose_name="Дуусах хугацаа")
    created_user = models.ForeignKey(User, related_name='poi_cr_user', on_delete=models.SET_NULL, null=True, verbose_name="Бүртгэсэн хэрэглэгч")
    updated_user = models.ForeignKey(User, related_name='poi_up_user', on_delete=models.SET_NULL, null=True, verbose_name="Зассан хэрэглэгч")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class SignaturePeoples(models.Model):
    """ Гарын үсэг зурах хүмүүс
    """
    DEFINITION = 1
    DIPLOM = 2
    ATTACHMENT = 3

    DEDICATION_TYPE=(
        (DEFINITION, "Тодорхойлолт"),
        (DIPLOM, "Диплом"),
        (ATTACHMENT, "Хавсралт")
    )

    org = models.ForeignKey(Schools, on_delete=models.CASCADE, verbose_name="Байгууллага", null=True)
    dedication_type = models.PositiveIntegerField(choices=DEDICATION_TYPE, db_index=True, null=False, default=DIPLOM, verbose_name="Зориулалт")
    school_id = models.PositiveIntegerField(null=True, verbose_name="Сургууль")

    last_name = models.CharField(max_length=200, null=True, blank=True, verbose_name='Эцэг/эхийн нэр')
    first_name = models.CharField(max_length=200, null=True, blank=True, verbose_name='Өөрийн нэр')
    position_name = models.CharField(max_length=200, null=True, blank=True, verbose_name='Албан тушаалын нэр')

    last_name_eng = models.CharField(max_length=200, null=True, blank=True, verbose_name='Эцэг/эхийн нэр')
    first_name_eng = models.CharField(max_length=200, null=True, blank=True, verbose_name='Өөрийн нэр')
    position_name_eng = models.CharField(max_length=200, null=True, blank=True, verbose_name='Албан тушаалын нэр')

    last_name_uig = models.CharField(max_length=200, null=True, blank=True, verbose_name='Эцэг/эхийн нэр')
    first_name_uig = models.CharField(max_length=200, null=True, blank=True, verbose_name='Өөрийн нэр')
    position_name_uig = models.CharField(max_length=200, null=True, blank=True, verbose_name='Албан тушаалын нэр')

    is_order = models.BooleanField(default=False, verbose_name="Сортлох эсэх")
    order = models.IntegerField(default=0, null=False, blank=False, verbose_name="Зэрэглэл")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class TeacherScore(models.Model):
    """ Багш хичээлийн дүн дүнгийн төрлөөр хадгалах """

    student = models.ForeignKey(Student, on_delete=models.PROTECT, verbose_name='Оюутан')

    lesson_year = models.CharField(max_length=20, verbose_name='Хичээлийн жил')
    lesson_season = models.ForeignKey(Season, on_delete=models.SET_NULL, null=True, verbose_name='Улирал')

    score = models.FloatField(verbose_name='Багшийн дүн')
    score_type = models.ForeignKey(Lesson_teacher_scoretype, on_delete=models.SET_NULL, null=True)
    grade_letter = models.ForeignKey(GradeLetter, on_delete=models.SET_NULL, null=True, verbose_name="Үсгэн үнэлгээ")

    is_approved = models.BooleanField(default=False, verbose_name="Баталгаажсан эсэх")
    approved_date =models.DateTimeField(null=True, blank=True, verbose_name="Баталгаажсан огноо")

    created_user = models.ForeignKey(User, related_name='user_cr_user', on_delete=models.SET_NULL, null=True, verbose_name="Бүртгэсэн хэрэглэгч")
    updated_user = models.ForeignKey(User, related_name='user_up_user', on_delete=models.SET_NULL, null=True, verbose_name="Зассан хэрэглэгч")


    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


# -------------------------------------------------Цагийн багшийн цагийн тооцоо----------------------

class PartTimeTeacherCreditEstimation(models.Model):
    """Цагийн багшийн тооцоо """

    lesson_year = models.CharField(max_length=20, verbose_name='Хичээлийн жил')
    lesson_season = models.ForeignKey(Season, on_delete=models.SET_NULL, null=True, verbose_name='Улирал')

    teacher = models.ForeignKey(Teachers, on_delete=models.PROTECT, verbose_name='Багш')
    lesson = models.ForeignKey(LessonStandart, on_delete=models.PROTECT, verbose_name='Хичээл')
    lesson_type = models.PositiveIntegerField(choices=TimeTable.LESSON_TYPE, db_index=True, default=TimeTable.OTHER, verbose_name="Сургалтын хэлбэр")
    teach_date = models.DateField(verbose_name="Он сар өдөр")
    time = models.PositiveIntegerField(choices=TimeTable.LESSON_TIME, db_index=True, default=TimeTable.FIRST, verbose_name="Цаг")
    lesson_title = models.CharField(max_length=500, null=True, verbose_name="Хичээлийн сэдэв")
    st_count = models.PositiveIntegerField(verbose_name="Оюутны тоо")
    is_allowed = models.BooleanField(default=False, verbose_name="Тооцогдсон эсэх")
    cause = models.CharField(max_length=500, null=True, verbose_name="Тооцоогүй тайлбар")


    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

# ------------------------------------- Эрдэм шинжилгээ -------------------------------------------------

class InventionCategory(models.Model):
    """Бүтээлийн ангилал"""

    org = models.ForeignKey(Schools, on_delete=models.CASCADE, verbose_name="Байгууллага", null=True)
    name = models.CharField(max_length=100, verbose_name="Нэр")
    point = models.FloatField(default=0,null=False, verbose_name="Оноо")

class PublishingSize(models.Model):
    """Хэвлэлийн хэмжээ"""

    name = models.CharField(max_length=100, verbose_name="Нэр")
    org = models.ForeignKey(Schools, on_delete=models.CASCADE, verbose_name="Байгууллага", null=True)

class UserInvention(models.Model):
    """ Бүтээл """

    user = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name="Багш")
    category = models.ForeignKey(InventionCategory, on_delete=models.CASCADE, verbose_name="Бүтээлийн ангилал")
    pages_number = models.IntegerField(verbose_name="Номын хуудасны тоо")
    publishing_size = models.ForeignKey(PublishingSize, on_delete=models.CASCADE, verbose_name="Хэвлэлийн хэмжээ")
    isbn = models.CharField(max_length=100, verbose_name="ISBN дугаар")
    published_year = models.IntegerField(verbose_name="Хэвлэгдсэн он")
    name = models.CharField(max_length=100, verbose_name="Бүтээлийн нэр")
    summary = models.CharField(max_length=500, verbose_name="Товч танилцуулга")
    picture = models.ImageField(upload_to="teacher/invention",max_length=255, null=True, blank=True, verbose_name='Хавтасны зураг/Дипломын зураг оруулна уу')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class PaperCategory(models.Model):
    """Өгүүллийн ангилал"""

    name = models.CharField(max_length=200, verbose_name="Нэр")
    point = models.FloatField(default=0, null=False, verbose_name="Оноо")
    org = models.ForeignKey(Schools, on_delete=models.CASCADE, verbose_name="Байгууллага", null=True)


class UserPaper(models.Model):
    """ Бүтээл """

    PAPER_TYPE = (
        (1, 'Гадаад'),
        (2, 'Дотоод'),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name="Багш")
    papertype = models.PositiveSmallIntegerField(choices=PAPER_TYPE, verbose_name="Өгүүллийн төрөл")
    category = models.ForeignKey(PaperCategory, on_delete=models.CASCADE, verbose_name="Өгүүлэл/Илтгэлийн ангилал")
    magname = models.CharField(max_length=100, verbose_name="Сэтгүүлийн нэр")
    published_org = models.CharField(max_length=100, verbose_name="Эрхлэн гаргагч байгууллага")
    doi_number = models.CharField(max_length=100,verbose_name="DOI дугаар")
    issn_number = models.CharField(max_length=100, verbose_name="ISSN дугаар")
    published_year = models.IntegerField(verbose_name="Хэвлэгдсэн он")
    impact_factor = models.DecimalField(verbose_name="Impact Factor", max_digits = 5,decimal_places = 4)
    cite_score = models.DecimalField(verbose_name="Cite Score", max_digits = 5,decimal_places = 4)
    name = models.CharField(max_length=100, verbose_name="Өгүүлэл/Илтгэлийн нэр")
    paper_abstract = models.CharField(max_length=1000, verbose_name="Хураангуй")
    abstract_pdf = models.FileField(upload_to="teacher/paper/abstract",max_length=255, null=True, blank=True, verbose_name='Нийтлэгдсэн өгүүлэл')
    paper_link = models.CharField(max_length=100, verbose_name="Өгүүллийн холбоос")
    picture = models.ImageField(upload_to="teacher/invention",max_length=255, null=True, blank=True, verbose_name='Сэтгүүлийн нүүр')
    mag_link = models.CharField(max_length=100, verbose_name="Сэтгүүлийн холбоос", default='')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class TeacherCountry(models.Model):
    """Улс"""

    name = models.CharField(max_length=200, verbose_name="Нэр")


class NoteCategory(models.Model):
    '''Илтгэлийн ангилал'''

    name = models.CharField(max_length=200, verbose_name="Ангилалын нэр")
    point = models.FloatField(default=0,null=False, verbose_name="Оноо")
    org = models.ForeignKey(Schools, on_delete=models.CASCADE, verbose_name="Байгууллага", null=True)


class UserNote(models.Model):
    """ Илтгэл """

    PAPER_CATEGORY = (
        ('Олон улсын хэмжээний хурал', 'Олон улсын хэмжээний хурал'),
        ('Улсын хэмжээний хурал', 'Улсын хэмжээний хурал'),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name="Багш")
    category = models.ForeignKey(NoteCategory, on_delete=models.SET_NULL, verbose_name="Хурлын ангилал", null=True)
    meeting_name = models.CharField(max_length=200, verbose_name="Хурлын нэр")
    meeting_date = models.DateField(verbose_name="Хурлын огноо")
    country = models.ForeignKey(TeacherCountry,on_delete=models.CASCADE, verbose_name="Хурал зохион байгуулагдсан улс")
    country_number = models.PositiveBigIntegerField(verbose_name="Хуралд оролцсон улсын тоо")
    meeting_org_name = models.CharField(max_length=200, verbose_name="Хурал зохион байгуулсан байгууллагын нэр")
    meeting_link = models.CharField(max_length=200,verbose_name="Хурлын холбоос")
    abstract = models.CharField(verbose_name="Хураангуй", max_length=1000)
    abstract_pdf = models.FileField(upload_to="teacher/note/abstract",max_length=255, null=True, blank=True, verbose_name='Нийтлэгдсэн илтгэл')
    agenda = models.ImageField(upload_to="teacher/note/agenda",max_length=255, null=True, blank=True, verbose_name='Хурлын хөтөлбөр')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class QuotationCategory(models.Model):
    '''Эшлэлийн ангилал'''

    name = models.CharField(max_length=200, verbose_name="Ангилалын нэр")
    point = models.FloatField(default=0,null=False, verbose_name="Оноо")
    org = models.ForeignKey(Schools, on_delete=models.CASCADE, verbose_name="Байгууллага", null=True)

class UserQuotation(models.Model):
    '''Эшлэл'''

    user = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name="Багш")
    category = models.ForeignKey(QuotationCategory, on_delete=models.CASCADE, verbose_name='Эшлэлйн ангилал')
    name = models.CharField(max_length=200, verbose_name='Эшлэгдсэн бүтээлийн нэр')
    doi_number = models.CharField(max_length=200, verbose_name='DOI дугаар')
    quotation_number = models.PositiveBigIntegerField(verbose_name='Эшлэлийн тоо')
    quotation_year = models.IntegerField(verbose_name='Эшлэлд татагдсан он')
    quotation_link = models.CharField(max_length=200, verbose_name='Бүтээлийн холбоос')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

#------------------------Төсөл--------------------------------
class ProjectCategory(models.Model):
    '''Төслийн ангилал'''

    name = models.CharField(max_length=200, verbose_name="Нэр")
    point = models.FloatField(default=0,null=False, verbose_name="Оноо")
    org = models.ForeignKey(Schools, on_delete=models.CASCADE, verbose_name="Байгууллага", null=True)


class UserProject(models.Model):
    '''Төсөл'''

    user = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name="Багш")
    category = models.ForeignKey(ProjectCategory, on_delete=models.CASCADE, verbose_name='Төслийн ангилал')
    name = models.CharField(max_length=200, verbose_name='Төслийн нэр')
    contract_number = models.CharField(max_length=200, verbose_name='Гэрээний дугаар')
    finance_amount = models.PositiveBigIntegerField(verbose_name='Нийт санхүүжилтийн хэмжээ')
    start_date = models.DateField(verbose_name='Эхлэх хугацаа')
    end_date = models.DateField(verbose_name='Дуусах хугацаа')

    contract = models.FileField(upload_to='teacher/project/contract', verbose_name='Төслийн гэрээ')
    leader_name = models.CharField(max_length=200, verbose_name='Төслийн удирдагч')
    leader_percent = models.IntegerField(verbose_name='Удирдагчийн төслийн оролцоонд эзлэх хувь')
    leader_profession = models.CharField(max_length=200, verbose_name='Удирдагчийн мэргэжил')
    school = models.ForeignKey(SubOrgs, on_delete=models.CASCADE, verbose_name='Төсөл хэрэгжүүлэгч сургууль')
    science_field = models.CharField(max_length=500, verbose_name='ШУ-ы салбар', null=True)
    client_name = models.CharField(max_length=200, verbose_name='Захиалагчийн нэр')
    finance_name = models.CharField(max_length=200, verbose_name='Санхүүжүүлэгчийн нэр')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


#------------------------Гэрээт ажил--------------------------------
class UserContractWork(models.Model):
    '''Гэрээт ажил'''

    user = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name="Багш")
    name = models.CharField(max_length=200, verbose_name='Гэрээт ажлын нэр')
    contract_number = models.CharField(max_length=200, verbose_name='Гэрээний дугаар')
    contract_amount = models.PositiveBigIntegerField(verbose_name='Гэрээний дүн /төг/')
    start_date = models.DateField(verbose_name='Эхлэх хугацаа')
    end_date = models.DateField(verbose_name='Дуусах хугацаа')

    contract = models.FileField(upload_to='teacher/project/contract', verbose_name='Төслийн гэрээ')
    school = models.ForeignKey(SubOrgs, on_delete=models.CASCADE, verbose_name='Хэрэгжүүлэгч сургууль')
    leader_name = models.CharField(max_length=200, verbose_name='Гэрээт ажлын удирдагч')
    leader_profession = models.CharField(max_length=200, verbose_name='Удирдагчийн мэргэжил')
    leader_percent = models.IntegerField(verbose_name='Удирдагчийн оролцооны хувь')
    client_name = models.CharField(max_length=200, verbose_name='Захиалагчийн нэр')

    finance_name = models.CharField(max_length=200, verbose_name='Санхүүжүүлэгчийн нэр')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


#------------------------Шинэ-Бүтээлийн-Патент------------------------------
class UserPatent(models.Model):
    '''Шинэ бүтээлийн патент'''

    user = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name="Багш")
    name = models.CharField(max_length=200, verbose_name='Шинэ бүтээлийн нэр')
    register_number = models.CharField(max_length=200, verbose_name='Улсын бүртгэлийн дугаар')
    end_date = models.DateField(verbose_name='Хүчинтэй хугацаа')
    abstract = models.CharField(max_length=250, verbose_name='Товч тайлбар')
    market_usage = models.CharField(max_length=250, verbose_name='Зах зээлийн хэрэглээ')
    science_field = models.CharField(max_length=500, verbose_name='ШУ-ы салбар', null=True)

    patent_copy = models.FileField(upload_to='teacher/intellectual-property/patent', verbose_name='Патентийн хуулбар')
    start_date = models.DateField(verbose_name='Патент олгосон оюуны өмчийн газрын даргын тушаалын огноо')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

#------------------------Ашигтай-Загварын-Патент---------------------------
class UserModelCertPatent(models.Model):
    '''Ашигтай загварын патент'''

    user = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name="Багш")
    name = models.CharField(max_length=200, verbose_name='Ашигтай загварын нэр')
    register_number = models.CharField(max_length=200, verbose_name='Улсын бүртгэлийн дугаар')
    end_date = models.DateField(verbose_name='Хүчинтэй хугацаа')
    abstract = models.CharField(max_length=250, verbose_name='Товч тайлбар')
    market_usage = models.CharField(max_length=250, verbose_name='Зах зээлийн хэрэглээ')
    science_field = models.CharField(max_length=500, verbose_name='ШУ-ы салбар', null=True)

    patent_copy = models.FileField(upload_to='teacher/intellectual-property/patent', verbose_name='Патентийн хуулбар')
    start_date = models.DateField(verbose_name='Патент олгосон оюуны өмчийн газрын даргын тушаалын огноо')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

#---------------------Барааны-Тэмдгийн-Гэрчилгээ---------------------------
class UserSymbolCert(models.Model):
    '''Барааны тэмдгийн гэрчилгээ'''

    user = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name="Багш")
    register_number = models.CharField(max_length=200, verbose_name='Улсын бүртгэлийн дугаар')
    end_date = models.DateField(verbose_name='Хүчинтэй хугацаа')
    symbol_class = models.CharField(max_length=200, verbose_name="Бараа, үйлчилгээний олон улсын ангилал")

    cert_copy = models.FileField(upload_to='teacher/intellectual-property/symbol', verbose_name='Гэрчилгээний хуулбар')
    start_date = models.DateField(verbose_name='Гэрчилгээ олгосон оюуны өмчийн газрын даргын тушаалын огноо')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

#---------------------Лицензийн-Гэрчилгээ---------------------------
class UserLicenseCert(models.Model):
    '''Лицензийн гэрчилгээ'''

    LICENSE_CLASS = (
        ('Онцгой', 'Онцгой'),
        ('Онцгой бус', 'Онцгой бус'),
    )
    user = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name="Багш")
    given_name = models.CharField(max_length=200, verbose_name='Лиценз өгөгч талын нэр')
    taken_name = models.CharField(max_length=200, verbose_name='Лиценз авагч талын нэр')
    license_class = models.CharField(max_length=200, choices=LICENSE_CLASS, verbose_name='Лицензийн ангилал')

    register_number = models.CharField(max_length=200, verbose_name='Оюуны өмчийн улсын бүртгэлийн дугаар')

    end_date = models.DateField(verbose_name='Лицензийн хугацаа')
    start_date = models.DateField(verbose_name='Бүртгэгдсэн огноо')
    abstract = models.CharField(max_length=250, verbose_name='Товч мэдээлэл')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

#---------------------Зохиогчийн-Эрхийн-Гэрчилгээ---------------------------

class UserRightCert(models.Model):
    '''Зохиогчийн эрхийн гэрчилгээ'''

    user = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name="Багш")
    register_number = models.CharField(max_length=200, verbose_name='Бүртгэлийн дугаар')
    name = models.CharField(max_length=200, verbose_name='Бүтээлийн нэр')

    create_date = models.DateField(verbose_name='Туурвисан огноо')
    abstract = models.CharField(max_length=250, verbose_name='Товч тайлбар')

    science_field = models.CharField(max_length=500, verbose_name='ШУ-ы салбар', null=True)

    cert_copy = models.FileField(upload_to='teacher/intellectual-property/right-cert', verbose_name='Гэрчилгээний хуулбар')
    start_date = models.DateField(verbose_name='Гэрчилгээ олгосон оюуны өмчийн газрын даргын тушаалын огноо')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

# ----------------------------------------------------------------- Судалгааны модел -------------------------------------------------------------------------
def get_image_survey_path(instance):
    """ Судалгааны асуултын файлын замыг зааж байна """

    return os.path.join('survey', 'questions', "asuult_%s" % str(instance.id))

def get_choice_survey_image_path(instance):
    """ Судалгааны асуултын файлын замыг зааж байна """

    return os.path.join('survey', 'questions', "answer_%s" % str(instance.id))


class SurveyChoices(models.Model):
    """ Өөрийгөө сорих шалгалтын сонголттой асуултын сонголтууд """

    choices = models.CharField(verbose_name="Сонголт", max_length=250, null=False, blank=False)
    image = models.ImageField(upload_to=get_choice_survey_image_path, null=True, blank=True, verbose_name='зураг')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class SurveyQuestionTitle(models.Model):
    """ Судалгааны асуултын сэдэв """

    class Meta:
        constraints = [
            models.UniqueConstraint(
                Lower('name'),
                name='unique_name_ci'
            )
        ]

    name = models.CharField(max_length=255, null=True, verbose_name='Сэдвийн нэр')
    org = models.ForeignKey(Schools, on_delete=models.CASCADE, verbose_name="Байгууллага", null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class SurveyQuestions(models.Model):
    """ Сургалтын алба судалгааны асуултууд """

    KIND_ONE_CHOICE = 1
    KIND_MULTI_CHOICE = 2
    KIND_BOOLEAN = 3
    KIND_RATING = 4
    KIND_TEXT = 5

    KIND_CHOICES = (
        (KIND_ONE_CHOICE, 'Нэг сонголт'),
        (KIND_MULTI_CHOICE, 'Олон сонголт'),
        (KIND_BOOLEAN, 'Тийм, Үгүй сонголт'),
        (KIND_RATING, 'Үнэлгээ'),
        (KIND_TEXT, 'Бичвэр'),
    )

    kind = models.IntegerField(choices=KIND_CHOICES, null=False, blank=False, verbose_name='Асуултын төрөл')
    question = models.CharField(max_length=1000, null=False, blank=False, verbose_name="Асуулт")
    title = models.ForeignKey(SurveyQuestionTitle, on_delete=models.SET_NULL, null=True, verbose_name='Асуултын ерөнхий сэдэв')

    is_required = models.BooleanField(default=False, verbose_name="Заавал санал өгөх эсэх")
    is_rate_teacher = models.BooleanField(default=False, verbose_name='Багшийн үнэлэх асуулт эсэх')

    image = models.ImageField(upload_to='survey_question', null=True, blank=True, verbose_name='зураг')

    #  KIND_RATING үед
    rating_max_count = models.IntegerField(default=0, verbose_name="Үнэлгээний дээд тоо", null=True, blank=True)
    low_rating_word = models.CharField(max_length=100, verbose_name="Доод үнэлгээг илэрхийлэх үг")
    high_rating_word = models.CharField(max_length=100, verbose_name="Дээд үнэлгээг илэрхийлэх үг")
    rating_words = ArrayField(
        models.CharField(max_length=100),
        blank=True,
        null=True,
        verbose_name='Үнэлгээний илэрхийлэх үг'
    )

    # KIND_MULTI_CHOICE үед
    max_choice_count = models.IntegerField(default=0, verbose_name="Сонголтын хязгаар", null=True, blank=True)

    # KIND_ONE_CHOICE болон KIND_MULTI_CHOICE үед
    choices = models.ManyToManyField(SurveyChoices)

    created_by = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name="+")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class Survey(models.Model):
    """ Сургалтын алба судалгааны ажил """

    oyutans = ArrayField(
        models.IntegerField(null=True),
        blank=True,
        null=True,
        verbose_name='Оюутнуудыг хадгална'
    )

    teachers = ArrayField(
        models.IntegerField(null=True),
        blank=True,
        null=True,
        verbose_name='Багш нарыг хадгална'
    )

    SOUL_TYPE_GENERAL = 1
    SOUL_TYPE_TEACHERS_LESSONS = 2

    SOUL_TYPE_CHOICES = (
        (SOUL_TYPE_GENERAL, 'Ерөнхий судалгаа'),
        (SOUL_TYPE_TEACHERS_LESSONS, '"Багш-хичээл" судалгаа'),
    )

    is_all = models.BooleanField(default=False, verbose_name='Бүгд')
    scope_kind = models.IntegerField(choices=Notification.SCOPE_KIND_CHOICES, null=False, blank=False)

    title = models.CharField(max_length=250, null=False, blank=False, verbose_name="Гарчиг")
    description = models.TextField(null=False, blank=False, verbose_name="Тайлбар")

    image = models.ImageField(upload_to='survey', null=True, blank=True, verbose_name='зураг')

    questions = models.ManyToManyField(SurveyQuestions)
    org = models.ForeignKey(Schools, on_delete=models.CASCADE, verbose_name="Байгууллага", null=True)

    start_date = models.DateTimeField(null=False, blank=False, verbose_name="Эхлэх хугацаа")
    end_date = models.DateTimeField(null=False, blank=False, verbose_name="Дуусах хугацаа")

    is_required = models.BooleanField(default=False, verbose_name="Заавал бөглөх эсэх")
    is_hide_employees = models.BooleanField(default=False, verbose_name="Бөглөсөн албан хаагчдыг нуух эсэх")
    is_soul = models.BooleanField(default=False, verbose_name="Сэтгэл ханамжийн судалгаа эсэх")
    soul_type = models.PositiveIntegerField(choices=SOUL_TYPE_CHOICES, null=True, blank=True, verbose_name='Сэтгэл ханамжийн судалгаа төрөл')

    created_school = models.ForeignKey(SubOrgs, on_delete=models.CASCADE, null=True, blank=True, verbose_name="Харьяалагдах алба нэгж", )
    created_department = models.ForeignKey(Salbars, on_delete=models.CASCADE, null=True, blank=True, verbose_name="Салбар")

    deleted_by = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name="deleted", null=True, blank=True)
    deleted_at = models.DateTimeField(null=True, blank=True)

    created_by = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name="+")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    @staticmethod
    def get_state_filter(state_name):
        dn = dt.now()
        return {
            "all": {},
            "waiting": {
                "start_date__gt": dn
            },
            "progressing": {
                "start_date__lte": dn,
                "end_date__gt": dn,
            },
            "finish": {
                "end_date__lte": dn,
            },
        }.get(state_name)



# -------------------------------------------------------- Өөрийгөө сорих тест ------------------------------------------------------------------------------------------

def get_image_path(instance):
    """ Өөрийгөө сорих шалгалтын файлын замыг зааж байна """

    return os.path.join('challenge', 'questions', "asuult_%s" % str(instance.id))


def get_choice_image_path(instance):
    """ Өөрийгөө сорих шалгалтын сонголтын файлын замыг зааж байна """

    return os.path.join('challenge', 'questions', "answer_%s" % str(instance.id))


class PsychologicalQuestionTitle(models.Model):
    """ Асуултын сэдэв """

    name = models.CharField(max_length=255, null=True, verbose_name='Сэдвийн нэр')
    created_at = models.DateTimeField(auto_now=True)
    org = models.ForeignKey(Schools, on_delete=models.CASCADE, verbose_name="Байгууллага", null=True)


class PsychologicalQuestionChoices(models.Model):
    """ Асуултын сонголтууд """

    value = models.CharField(verbose_name="Сонголт", max_length=1000, null=False, blank=False)
    image = models.ImageField(upload_to=get_choice_image_path, null=True, blank=True, verbose_name='зураг')
    is_correct = models.BooleanField(null=False, default=False, verbose_name="Энэ сонголт зөв эсэх")

    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name="+")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class PsychologicalTestQuestions(models.Model):
    """ Сэтгэлзүйн  асуултууд """

    KIND_ONE_CHOICE = 1
    KIND_MULTI_CHOICE = 2
    KIND_BOOLEAN = 3
    KIND_RATING = 4
    KIND_TEXT = 5

    KIND_CHOICES = (
        (KIND_ONE_CHOICE, 'Нэг сонголт'),
        (KIND_MULTI_CHOICE, 'Олон сонголт'),
        (KIND_BOOLEAN, 'Тийм, Үгүй сонголт'),
        (KIND_RATING, 'Үнэлгээ'),
        (KIND_TEXT, 'Бичвэр'),
    )

    kind = models.IntegerField(choices=KIND_CHOICES, null=False, blank=False, verbose_name='Асуултын төрөл')
    # Асуултууд өөрсдийн гэсэн дугаар номертой байна
    question_number = models.PositiveIntegerField(null=True, blank=True, verbose_name="Асуултын дугаар")
    question = models.CharField(max_length=1000, null=False, blank=False, verbose_name="Асуулт")
    image = models.ImageField(upload_to=get_image_path, null=True, blank=True, verbose_name='зураг')
    org = models.ForeignKey(Schools, on_delete=models.CASCADE, verbose_name="Байгууллага", null=True)

    title = models.ManyToManyField(PsychologicalQuestionTitle, verbose_name='Асуултын ерөнхий сэдэв')
    has_score = models.BooleanField(null=True, default=False, verbose_name="Энэ асуулт оноотой юу гэдгийг шалгана")
    score = models.FloatField(null=True, verbose_name="Асуултын оноо")

    # KIND_BOOLEAN үед
    yes_or_no = models.PositiveIntegerField(null=True, verbose_name='Тийм үгүй асуултны хариулт хадгалах хэсэг') # 1 0 хадгалах

    # KIND_RATING үед
    rating_max_count = models.IntegerField(default=0, verbose_name="Үнэлгээний дээд тоо", null=True, blank=True)
    low_rating_word = models.CharField(max_length=100, verbose_name="Доод үнэлгээг илэрхийлэх үг")
    high_rating_word = models.CharField(max_length=100, verbose_name="Дээд үнэлгээг илэрхийлэх үг")

    # KIND_MULTI_CHOICE үед
    max_choice_count = models.IntegerField(default=0, verbose_name="Сонголтын хязгаар", null=True, blank=True)

    # KIND_ONE_CHOICE болон KIND_MULTI_CHOICE үед
    choices = models.ManyToManyField(PsychologicalQuestionChoices)

    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name="+")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class PsychologicalTest(models.Model):
    """ Сэтгэлзүйн сорил """

    SCOPE_EMPLOYEES = 1
    SCOPE_ELSEGCH = 2
    SCOPE_STUDENTS = 3

    SCOPE_CHOICES = (
        (SCOPE_EMPLOYEES, 'Багш ажилчид'),
        (SCOPE_ELSEGCH, 'Элсэгч'),
        (SCOPE_STUDENTS, 'Оюутан'),
    )

    TYPE_IQ = 1
    TYPE_PSY = 2

    TYPE_CHOICES = (
        (TYPE_IQ, 'IQ тест'),
        (TYPE_PSY, 'Сэтгэлзүйн сорил'),
    )

    participants = ArrayField(
        models.IntegerField(null=True),
        blank=True,
        null=True,
        verbose_name='Сорилд оролцогчдыг хадгална'
    )

    scope_kind = models.IntegerField(choices=SCOPE_CHOICES, null=True, blank=False)
    test_type = models.IntegerField(choices=TYPE_CHOICES, null=True, blank=False)
    title = models.CharField(max_length=250, null=False, blank=False, verbose_name="Гарчиг")
    description = models.TextField(null=True, blank=False, verbose_name="Тайлбар")
    duration = models.PositiveIntegerField(verbose_name='Үргэлжлэх хугацаа', null=True)
    questions = models.ManyToManyField(PsychologicalTestQuestions)

    start_date = models.DateTimeField(null=False, blank=False, verbose_name="Эхлэх хугацаа")
    end_date = models.DateTimeField(null=False, blank=False, verbose_name="Дуусах хугацаа")
    org = models.ForeignKey(Schools, on_delete=models.CASCADE, verbose_name="Байгууллага", null=True)

    created_by = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name="+")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)




def get_image_path(instance):
    """ Өөрийгөө сорих шалгалтын файлын замыг зааж байна """

    return os.path.join('challenge', 'questions', "asuult_%s" % str(instance.id))


def get_choice_image_path(instance):
    """ Өөрийгөө сорих шалгалтын сонголтын файлын замыг зааж байна """

    return os.path.join('challenge', 'questions', "answer_%s" % str(instance.id))


class QuestionChoices(models.Model):
    """ Өөрийгөө сорих шалгалтын сонголттой асуултын сонголтууд """

    choices = models.CharField(verbose_name="Сонголт", max_length=1000, null=False, blank=False)
    image = models.ImageField(upload_to=get_choice_image_path, null=True, blank=True, verbose_name='зураг')

    score = models.FloatField(default=0, verbose_name='Зөв хариултын оноо')

    created_by = models.ForeignKey(Teachers, on_delete=models.CASCADE, related_name="+")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class QuestionMainTitle(models.Model):
    """ Асуултын сэдэв """

    name = models.CharField(max_length=255, null=True, verbose_name='Сэдвийн нэр')
    is_open = models.BooleanField(default=False, verbose_name='Нээлттэй сэдэв эсэх')
    org = models.ForeignKey(Schools, on_delete=models.CASCADE, verbose_name="Байгууллага", null=True)
    created_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(Teachers, on_delete=models.CASCADE, related_name="+", null=True)


class QuestioSubTitle(models.Model):
    """ Дэд асуултын сэдэв """
    main = models.ForeignKey(QuestionMainTitle, verbose_name='Үндсэн сэдэв', on_delete=models.CASCADE)
    name = models.CharField(max_length=255, null=True, verbose_name='Сэдвийн нэр')
    created_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(Teachers, on_delete=models.CASCADE, related_name="+", null=True)


class QuestionTitle(models.Model):
    """ Асуултын сэдэв """

    lesson = models.ForeignKey(LessonStandart, on_delete=models.PROTECT, null=True, verbose_name='Хичээл')
    name = models.CharField(max_length=255, null=True, verbose_name='Сэдвийн нэр')
    is_season = models.BooleanField(default=False, verbose_name='Улирлын шалгалтын сэдэв эсэх')
    is_graduate = models.BooleanField(default=False, verbose_name='Төгсөлтийн шалгалтын сэдэв эсэх')
    is_admission = models.BooleanField(default=False, verbose_name='Элсэлтийн шалгалтын сэдэв эсэх')
    is_open = models.BooleanField(default=False, verbose_name='Нээлттэй сэдэв эсэх')
    org = models.ForeignKey(Schools, on_delete=models.CASCADE, verbose_name="Байгууллага", null=True)
    created_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(Teachers, on_delete=models.CASCADE, related_name="+", null=True)


class ChallengeQuestions(models.Model):
    """ Өөрийгөө сорих  асуултууд """


    KIND_ONE_CHOICE = 1
    KIND_MULTI_CHOICE = 2
    KIND_BOOLEAN = 3
    KIND_RATING = 4
    KIND_TEXT = 5
    KIND_SHORT_CHOICE = 6
    KIND_JISHIH_CHOICE = 7
    KIND_ESTIMATE_CHOICE = 8
    KIND_PROJECT_CHOICE = 9
    KIND_TOVCH_CHOICE = 10

    KIND_CHOICES = (
        (KIND_ONE_CHOICE, 'Нэг сонголт'),
        (KIND_SHORT_CHOICE, 'Богино нөхөх хариулт'),
        (KIND_JISHIH_CHOICE, 'Харгалзуулах, жиших'),
        (KIND_ESTIMATE_CHOICE, 'Тооцоолж бодох'),
        (KIND_PROJECT_CHOICE, 'Төсөл боловсруулах'),
        (KIND_TOVCH_CHOICE, 'Товч хариулт'),
        (KIND_MULTI_CHOICE, 'Олон сонголт'),
        (KIND_BOOLEAN, 'Үнэн, Худлыг олох'),
        (KIND_TEXT, 'Эссэ бичих'),
        (KIND_RATING, 'Үнэлгээ'),
    )

    LEVEL_EASY = 1
    LEVEL_NORMAL = 2
    LEVEL_HARD = 3
    LEVEL_HARD1 = 4
    LEVEL_HARD2 = 5
    LEVEL_HARD3 = 6

    DIFFICULTY_LEVELS = (
        (LEVEL_EASY, 'Түвшин-1'),
        (LEVEL_NORMAL, 'Түвшин-2'),
        (LEVEL_HARD, 'Түвшин-3'),
        (LEVEL_HARD1, 'Түвшин-4'),
        (LEVEL_HARD2, 'Түвшин-5'),
        (LEVEL_HARD3, 'Түвшин-6')
    )
    lesson_year = models.CharField(max_length=1000, null=False, blank=False, verbose_name="Хичээлийн жил", default='2024-2025')
    lesson_season = models.ForeignKey(Season, on_delete=models.CASCADE,  null=True)

    kind = models.IntegerField(choices=KIND_CHOICES, null=False, blank=False, verbose_name='Асуултын төрөл')
    question = models.CharField(max_length=1000, null=False, blank=False, verbose_name="Асуулт")
    description = models.TextField(null=True, blank=False, verbose_name="Асуултын тайлбар")

    is_required = models.BooleanField(default=False, verbose_name="Заавал санал өгөх эсэх")
    image = models.ImageField(upload_to=get_image_path, null=True, blank=True, verbose_name='зураг')

    score = models.FloatField(verbose_name="Асуултын оноо", null=True)
    yes_or_no = models.PositiveIntegerField(null=True, verbose_name='Тийм үгүй асуултны хариулт хадгалах хэсэг') # 1 0 хадгалах

    subject = models.ForeignKey(Lesson_title_plan, on_delete=models.SET_NULL, null=True)

    title = models.ManyToManyField(QuestionTitle, verbose_name='Асуултын ерөнхий сэдэв')
    graduate_title = models.ManyToManyField(QuestioSubTitle, verbose_name='Асуултын ерөнхий сэдэв')
    is_admission =  models.BooleanField(default=False, verbose_name="Элсэлтийн асуулт эсэх")

    level = models.IntegerField(choices=DIFFICULTY_LEVELS, default=LEVEL_NORMAL,  verbose_name='Асуултын түвшин')

    # KIND_RATING үед
    rating_max_count = models.IntegerField(default=0, verbose_name="Үнэлгээний дээд тоо", null=True, blank=True)
    low_rating_word = models.CharField(max_length=100, verbose_name="Доод үнэлгээг илэрхийлэх үг")
    high_rating_word = models.CharField(max_length=100, verbose_name="Дээд үнэлгээг илэрхийлэх үг")

    # KIND_MULTI_CHOICE үед
    max_choice_count = models.IntegerField(default=0, verbose_name="Сонголтын хязгаар", null=True, blank=True)

    # KIND_ONE_CHOICE болон KIND_MULTI_CHOICE үед
    choices = models.ManyToManyField(QuestionChoices)

    org = models.ForeignKey(Schools, on_delete=models.CASCADE, verbose_name="Байгууллага", null=True)

    created_by = models.ForeignKey(Teachers, on_delete=models.CASCADE, related_name="+")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class Challenge(models.Model):
    """ Өөрийгөө сорих тест  """


    KIND_LESSON = 1
    KIND_GROUP = 2
    KIND_STUDENT = 3

    KIND_CHOICES = (
        (KIND_LESSON, 'Хичээлийн хүрээнд'),
        (KIND_GROUP, 'Ангийн хүрээнд'),
        (KIND_STUDENT, 'Оюутны хүрээнд'),
    )

    MAX_SCORE = 1
    AVG_SCORE = 2

    ASSESS_CHOICES = (
        (MAX_SCORE, 'Хамгийн өндөр оноо'),
        (AVG_SCORE, 'Дундаж оноо'),
    )

    SEND = 1
    APPROVE = 2
    REJECT = 3

    SEND_TYPE = (
        (SEND, 'ИЛГЭЭСЭН'),
        (APPROVE, 'БАТАЛСАН'),
        (REJECT, 'ТАТГАЛЗСАН'),
    )

    SORIL1 = 1
    SORIL2 = 2
    SEMESTR_EXAM = 3
    SELF_TEST = 4
    GRADUATE = 5
    ADMISSION = 6

    CHALLENGE_TYPE = (
        (SORIL1, 'Явцын шалгалт'),
        (SORIL2, 'Cорил 2'),
        (SEMESTR_EXAM, 'Улирлын шалгалт'),
        (SELF_TEST, 'Өөрийгөө сорих тест'),
        (GRADUATE, 'Төгсөлтийн шалгалт'),
        (ADMISSION, 'Элсэлтийн шалгалт'),
    )

    #  Хамрах хүрээ нь
    lesson = models.ForeignKey(LessonStandart, on_delete=models.CASCADE, verbose_name="Хичээл", null=True)
    lesson_year = models.CharField(max_length=20, null=True, verbose_name="Хичээлийн жил")
    lesson_season = models.ForeignKey(Season, on_delete=models.CASCADE,  null=True)
    survey = models.ForeignKey(Survey, on_delete=models.SET_NULL,  null=True, verbose_name='Судалгаа')

    student = models.ManyToManyField(Student, blank=True, verbose_name="Оюутнууд")
    elselt_user = models.ManyToManyField(to='elselt.ElseltUser', blank=True, verbose_name="Элсэгчид")

    kind = models.IntegerField(choices=KIND_CHOICES, null=False, default=KIND_LESSON, blank=False)

    title = models.CharField(max_length=250, null=False, blank=False, verbose_name="Гарчиг")
    description = models.TextField(null=True, blank=False, verbose_name="Тайлбар")
    question_count = models.IntegerField(null=True, verbose_name='Нийт асуултын тоо')
    questions = models.ManyToManyField(ChallengeQuestions)

    start_date = models.DateTimeField(null=False, blank=False, verbose_name="Эхлэх хугацаа")
    end_date = models.DateTimeField(null=False, blank=False, verbose_name="Дуусах хугацаа")
    duration = models.PositiveIntegerField(verbose_name='Үргэлжлэх хугацаа', null=True)

    assess = models.IntegerField(choices=ASSESS_CHOICES, default=MAX_SCORE, verbose_name='Үнэлэх арга')
    week = models.IntegerField(null=True, verbose_name='7 хоногийн тоо')

    try_number = models.IntegerField(default=1, verbose_name='Оролдлогын тоо')

    send_type = models.PositiveIntegerField(choices=SEND_TYPE, db_index=True, verbose_name="Шалгалт илгээсэн төрөл", null=True)
    challenge_type = models.PositiveIntegerField(choices=CHALLENGE_TYPE, db_index=True, default=SORIL1, verbose_name="Шалгалтын төрөл",)
    comment = models.TextField(null=True, verbose_name='ХБА татгалзсан тайлбар бичих')

    has_shuffle = models.BooleanField(default=False, verbose_name="Холих эсэх")
    has_choice_shuffle = models.BooleanField(default=False, verbose_name="Сонголтуудыг холих эсэх")
    is_repeat = models.BooleanField(default=False, verbose_name="Давтан шалгалт эсэх")

    is_open = models.BooleanField(default=False, verbose_name="Нээлттэй эсэх")
    level = models.IntegerField(choices=ChallengeQuestions.DIFFICULTY_LEVELS, default=ChallengeQuestions.LEVEL_NORMAL,  verbose_name='Шалгалтын түвшин')

    deleted_by = models.ForeignKey(Teachers, on_delete=models.CASCADE, related_name="deleted", null=True, blank=True)
    deleted_at = models.DateTimeField(null=True, blank=True)

    org = models.ForeignKey(Schools, on_delete=models.CASCADE, verbose_name="Байгууллага", null=True)

    created_by = models.ForeignKey(Teachers, on_delete=models.CASCADE, related_name="+")
    updated_by = models.ForeignKey(User, on_delete=models.CASCADE, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    @staticmethod
    def get_state_filter(state_name):
        dn = dt.now()
        return {
            "all": {},
            "waiting": {
                "start_date__gt": dn
            },
            "progressing": {
                "start_date__lte": dn,
                "end_date__gt": dn,
            },
            "finish": {
                "end_date__lte": dn,
            },
        }.get(state_name)

class ChallengeStudents(models.Model):
    """ Шалгалтад оролцогчид """


    challenge = models.ForeignKey(Challenge, on_delete=models.PROTECT)
    student = models.ForeignKey(Student, on_delete=models.CASCADE)

    tried = models.BooleanField(default=False, verbose_name='Оюутны оролдлогын тоо дүүрсэн эсэх')

    start_time = models.DateTimeField(verbose_name='Шалгалт эхэлсэн хугацаа')
    end_time = models.DateTimeField(verbose_name='Шалгалт дуусгасан хугацаа', null=True)

    answer = models.TextField(null=True, verbose_name='Хариулт')

    score = models.FloatField(null=True, verbose_name='Оюутны авсан оноо')
    take_score = models.FloatField(null=True, verbose_name='Оюутны авах оноо')
    old_score = models.FloatField(null=True, verbose_name='Хуучин оюутны авсан оноо')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class ChallengeElseltUser(models.Model):
    """ Шалгалтад оролцогчид """

    challenge = models.ForeignKey(Challenge, on_delete=models.PROTECT)
    elselt_user = models.ForeignKey(to='elselt.ElseltUser', on_delete=models.CASCADE, null=True)

    tried = models.BooleanField(default=False, verbose_name='Элсэгчийн оролдлогын тоо дүүрсэн эсэх')

    start_time = models.DateTimeField(verbose_name='Шалгалт эхэлсэн хугацаа')
    end_time = models.DateTimeField(verbose_name='Шалгалт дуусгасан хугацаа', null=True)

    answer = models.TextField(null=True, verbose_name='Хариулт')

    score = models.FloatField(null=True, verbose_name='Элсэгчийн авсан оноо')
    take_score = models.FloatField(null=True, verbose_name='Элсэгчийн авах оноо')
    old_score = models.FloatField(null=True, verbose_name='Хуучин элсэгчийн авсан оноо')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class ChallengeSedevCount(models.Model):

    lesson_title = models.ForeignKey(Lesson_title_plan, on_delete=models.CASCADE, verbose_name='Хичээлийн гарчиг')
    status = models.IntegerField(choices=ChallengeQuestions.DIFFICULTY_LEVELS, default=ChallengeQuestions.LEVEL_NORMAL)
    count = models.IntegerField(default=0)


class ChallengeQuestionCount(models.Model):
    """ Шалгалтанд оролцох асуултын тоо болон төлөв"""

    challenge = models.ForeignKey(Challenge, on_delete=models.CASCADE, verbose_name='Шалгалт')
    question_counts = models.ManyToManyField(ChallengeSedevCount)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    updated_user = models.ForeignKey(User, on_delete=models.CASCADE)


class CalculatedGpaOfDiploma(models.Model):
    """ Хавсралтын дүнгүүдээ бодуулах
    """

    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    lesson = models.ForeignKey(LessonStandart, on_delete=models.PROTECT, verbose_name="Хичээл", null=True)
    kredit = models.FloatField(verbose_name="Кредит")
    score = models.FloatField(null=True, verbose_name="Нийт оноо")
    gpa = models.FloatField(verbose_name="Голч дүн", null=True)
    assesment = models.CharField(max_length=5, verbose_name="Үсгэн тэмдэглэгэ", null=True)
    grade_letter = models.ForeignKey(GradeLetter, on_delete=models.SET_NULL, null=True, verbose_name="Үсгэн үнэлгээ")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


# ----------------------------------------------------------------- Notification -----------------------------------------------------------------------------
class NotificationState(models.Model):
    """ Тухайн notification ийг уншсан хүмүүс """

    notif = models.ForeignKey(Notification, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)

    created_at = models.DateTimeField(auto_now_add=True)


class SoulSurvey(models.Model):
    """ Сэтгэл ханамжийн судалгаа """

    lesson_year = models.CharField(max_length=20, null=True, verbose_name="Хичээлийн жил")
    lesson_season = models.ForeignKey(Season, on_delete=models.PROTECT, verbose_name='Судалгаа')
    survey = models.ForeignKey(Survey, on_delete=models.PROTECT, verbose_name='Судалгаа')
    teacher = models.ForeignKey(Teachers, on_delete=models.PROTECT, verbose_name='Багш')
    lesson = models.ForeignKey(LessonStandart, on_delete=models.PROTECT, verbose_name='Хичээлийн стандарт', null=True)


class Pollee(models.Model):
    """ Судалгаанд оролцогчид """

    question = models.ForeignKey(SurveyQuestions, on_delete=models.CASCADE, verbose_name="Асуулт")
    answer = models.TextField(verbose_name="Хариулт", null=True)

    # KIND_ONE_CHOICE болон KIND_MULTI_CHOICE үед
    choosed_choices = models.ManyToManyField(SurveyChoices, verbose_name="Сонгосон сонголтууд", blank=True)

    survey = models.ForeignKey(Survey, on_delete=models.CASCADE, verbose_name='Судалгаа', null=True)
    soul_survey = models.ForeignKey(SoulSurvey, on_delete=models.CASCADE, verbose_name='Сэтгэл ханамжийн судалгаа', null=True)

    teacher = models.ForeignKey(Teachers, on_delete=models.CASCADE, null=True, blank=True, verbose_name='Багш')
    student = models.ForeignKey(Student, on_delete=models.CASCADE, null=True, blank=True, verbose_name='Оюутан')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


# ---------------------------------------------------------------- Crontab -------------------------------------------------------------------

class Crontab(models.Model):
    """ Crontab ажиллуулах функц """

    name = models.TextField(null=True, verbose_name='Crontab нэр')
    command = models.TextField(null=True, verbose_name='Ажиллуулах функц')
    timing = models.TextField(null=True, verbose_name='Хугацаа')
    is_active = models.BooleanField(default=False, verbose_name='Хугацаатай эсэх')
    description = models.TextField(null=True, verbose_name='Тайлбар')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class IrtsQr(models.Model):

    timetable = models.ForeignKey(TimeTable, on_delete=models.CASCADE, verbose_name="Хичээлийн хуваарь")
    qr_value = models.UUIDField(default=uuid.uuid4)

    generate_date = models.DateTimeField(null=True)
    week = models.PositiveIntegerField(null=True, verbose_name="Хэддэх долоо хоногийн QR гэдэг нь")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class RegisterIrts(models.Model):

    STATE_IRSEN = 1
    STATE_TAS = 2
    STATE_CHULUULSUN = 3
    STATE_SICK = 4

    STATE_CHOICES = (
        (STATE_IRSEN, 'Ирсэн'),
        (STATE_TAS, 'Тас'),
        (STATE_CHULUULSUN, 'Чөлөөтэй'),
        (STATE_SICK, 'Өвчтэй'),
    )

    qr = models.ForeignKey(IrtsQr, on_delete=models.CASCADE)
    student = models.ForeignKey(Student, on_delete=models.CASCADE)

    state = models.BigIntegerField(choices=STATE_CHOICES, null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class NotificationStudentState(models.Model):
    """ Тухайн notification ийг уншсан хүмүүс """

    notif = models.ForeignKey(Notification, on_delete=models.CASCADE)
    user = models.ForeignKey(StudentLogin, on_delete=models.CASCADE)

    created_at = models.DateTimeField(auto_now_add=True)


class OtherStudentInformation(models.Model):
    """ Бусад сургуулийн оюутны дэлгэрэнгүй мэдээлэл """

    student = models.ForeignKey(User, on_delete=models.PROTECT, verbose_name="Хэрэглэгч")
    school = models.CharField(max_length=500, verbose_name="Сургуулийн нэр")
    profession = models.CharField(max_length=500, verbose_name="Мэргэжил")
    course = models.IntegerField(default=1, verbose_name="Курс")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class DefinitionSignature(models.Model):
    ''' Оюутны тодорхойлолт, тушаал эд нар дээрх хүмүүс
    '''

    STUDENT_DEFINITION = 1
    STUDENT_MARK = 2
    STUDENT_DIAMETER_MARK = 3
    COMMAND = 4
    TIMETABLE = 5
    MONITOR = 6

    DEDICATION_TYPE=(
        (STUDENT_DEFINITION, 'Оюутны тодорхойлолт'),
        (STUDENT_MARK, 'Оюутны дүнгийн дэлгэрэнгүй'),
        (STUDENT_DIAMETER_MARK, 'Оюутны голч дүн'),
        (COMMAND, 'Тушаал'),
    )

    dedication_type = models.PositiveBigIntegerField(choices=DEDICATION_TYPE, db_index=True, null=False, verbose_name='Зориулалт')

    school = models.ForeignKey(Schools, on_delete=models.CASCADE, null=True, blank=True, verbose_name="Харьяалагдах сургууль")

    position_name = models.CharField(max_length=500, null=False, blank=False, verbose_name="Албан тушаал")
    name = models.CharField(max_length=100, null=False, blank=False, verbose_name="Нэр")

    order = models.IntegerField(default=0, null=False, blank=False, verbose_name="Зэрэглэл")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class StudentViz(models.Model):
    ''' Гадаад оюутны виз шийдвэрлэх
    '''

    RECIEVED = 1
    UNDER_REVIEW = 2
    DENIED = 3
    APPROVED = 4
    RETURN = 5

    STATUS_TYPE=(
        (RECIEVED, 'Хүлээн авсан'),
        (UNDER_REVIEW, 'Шалгаж байгаа'),
        (DENIED, 'Татгалзсан'),
        (APPROVED, 'Зөвшөөрсөн'),
        (RETURN, 'Буцаан олгосон')
    )
    student = models.ForeignKey(Student, on_delete=models.SET_NULL, null=True, verbose_name="Оюутан")
    status = models.PositiveBigIntegerField(choices=STATUS_TYPE, db_index=True, default=RECIEVED, verbose_name='Төлөв')
    year = models.CharField(max_length=20, verbose_name='Идэвхтэй хичээлийн жил')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

# ------------------------------------------------------- Finance model ---------------------------------------------------

class AdmissionRegister(models.Model):
    """ Элсэлтийн үйл явцын бүртгэл"""

    name = models.CharField(max_length=200, verbose_name="Элсэлтийн нэр")
    degrees = ArrayField(
        models.IntegerField(null=True),
        blank=True,
        null=True,
        verbose_name='Мэргэжлийн зэргүүдийг хадгалах'
    )
    lesson_year = models.CharField(max_length=50, verbose_name="Хичээлийн жил")
    begin_date = models.DateTimeField(verbose_name="Элсэлт эхлэх хугацаа")
    end_date = models.DateTimeField(verbose_name="Дуусах хугацаа")
    is_active = models.BooleanField(default=False, verbose_name='Идэвхтэй эсэх')
    is_store = models.BooleanField(default=False, verbose_name='Нөөцлөх эсэх')
    payment = models.IntegerField(default=0, verbose_name='Элсэлтийн хураамж')
    org = models.ForeignKey(Schools, on_delete=models.CASCADE, verbose_name="Байгууллага", null=True)

    home_description = models.CharField(max_length=5000, null=True, verbose_name='Нүүр хуудасны харуулах тайлбар')
    alert_description = models.CharField(max_length=5000, null=True, verbose_name='Тухайн элсэлтэд зориулаад санамж')
    admission_juram = models.FileField(upload_to='admission', null=True, verbose_name='Элсэлтийн журам')


class AdmissionRegisterProfession(models.Model):
    """ Элсэлт мэргэжлийн бүртгэл"""

    EESH = 1
    CIVIL_TWO = 2
    CIVIL_WORKERS = 3
    WORKERS = 4
    NOT = 5
    ADMISSION_TYPE = (
        (EESH, 'Элсэлтийн ерөнхий шалгалтын оноогоор'),
        (CIVIL_TWO, 'Дээд боловсролтой иргэн (2 жил)'),
        (CIVIL_WORKERS, 'Дээд боловсролтой албан хаагч)'),
        (WORKERS, 'Албан хаагч (бүрэн дунд боловсролтой)'),
        (NOT, 'Хамаарахгүй'),
    )

    admission=models.ForeignKey(AdmissionRegister, on_delete=models.CASCADE, verbose_name="Элсэлт")
    profession = models.ForeignKey(ProfessionDefinition, on_delete=models.PROTECT, verbose_name="Мэргэжил")
    state = models.PositiveSmallIntegerField(choices=ADMISSION_TYPE, db_index=True, null=False, default=NOT, verbose_name="Элсэлтийн төрөл")
    active = models.BooleanField(verbose_name='Идэвхтэй зарлагдах хөтөлбөр эсэх', default=True)


class AdmissionIndicator(models.Model):
    """Мэргэжил бүрийн шалгуур үзүүлэлтийн  бүртгэл"""

    PUBLIC = 1
    SPECIFIC = 2
    INDICATOR_TYPE = (
        (PUBLIC, 'Нийтлэг шалгуур'),
        (SPECIFIC, 'Тусгай шалгуур'),
    )

    EESH_EXAM = 1
    XYANALTIIN_TOO = 2
    NAS = 3
    YAL_SHIITGEL = 4
    ERUUL_MEND_ANHAN = 5
    ERUUL_MEND_MERGEJLIIN = 6
    BIE_BYALDAR = 7
    SETGEL_ZUI = 8
    TUGSSUN_SURGUULI = 9
    ESSE = 10
    HEERIIN_BELTGEL = 11
    TENTSSEN_ELSEGCHID = 12
    ESSE_MHB = 13

    INDICATOR_VALUE = (
        (EESH_EXAM, 'ЭЕШ-ын оноо'),
        (XYANALTIIN_TOO, 'Хяналтын тоо'),

        (NAS, 'Нас'),
        (YAL_SHIITGEL, 'Ял шийтгэл'),
        (ERUUL_MEND_ANHAN, 'Эрүүл мэнд анхан'),
        (ERUUL_MEND_MERGEJLIIN, 'Эрүүл мэнд мэргэжлийн'),
        (BIE_BYALDAR, 'Ур чадвар'),
        (SETGEL_ZUI, 'Сэтгэл зүйн сорил'),
        (TUGSSUN_SURGUULI, 'Төгссөн сургууль'),
        (ESSE, 'Cудалгааны ажлын агуулга чиглэл, зорилгын талаар бичсэн танилцуулга'),
        (HEERIIN_BELTGEL, 'Хээрийн бэлтгэл'),
        (ESSE_MHB, 'Монгол хэл эсcэ бичлэг')
    )

    admission_prof = models.ForeignKey(AdmissionRegisterProfession, on_delete=models.CASCADE, verbose_name="Мэргэжил")
    type = models.PositiveSmallIntegerField(choices=INDICATOR_TYPE, db_index=True, null=False, default=PUBLIC, verbose_name="Шалгуурын төpөл")
    value = models.PositiveIntegerField(choices=INDICATOR_VALUE, db_index=True, null=False, default=EESH_EXAM, verbose_name="Шалгуур үзүүлэлт")
    orderby = models.PositiveIntegerField(verbose_name="Шалгуурын эрэмбэ")
    limit_min = models.FloatField(null=True, verbose_name="Насны шалгуурын доод хязгаар")
    limit_mах = models.FloatField(null=True, verbose_name="Насны шалгуурын дээд хязгаар")


class AdmissionXyanaltToo(models.Model):
    """ Мэргэжлийн хяналтын тоо"""

    indicator=models.ForeignKey(AdmissionIndicator, on_delete=models.CASCADE, verbose_name="Шалгуур үзүүлэлт")
    norm_all = models.PositiveIntegerField(null=True, verbose_name="Нийт хяналтын тоо")
    is_gender = models.BooleanField(default=False, verbose_name="Хүйсээр ялгах эсэх")
    norm1 = models.PositiveIntegerField(null=True, verbose_name="Эрэгтэй суралцагчийн тоо")
    norm2 = models.PositiveIntegerField(null=True, verbose_name="Эмэгтэй суралцагчийн тоо")

class PrintSettings(models.Model):

    SM =1
    MM =2

    PRINT_TYPE = (
        (SM, "см"),
        (MM, "мм"),
    )

    org = models.ForeignKey(Schools, on_delete=models.CASCADE, verbose_name="Байгууллага", null=True)
    deed = models.FloatField(verbose_name="дээд хэмжээ")
    dood = models.FloatField(verbose_name="доод хэмжээ")
    right = models.FloatField(verbose_name="баруун хэмжээ")
    left = models.FloatField(verbose_name="зүүн хэмжээ")
    types = models.PositiveIntegerField(choices=PRINT_TYPE, db_index=True, default=SM, verbose_name="Хэвлэх төрөл")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class AccessHistoryLms(models.Model):
    """Хандалтын түүхүүд"""

    LMS = 1
    TEACHER = 2
    STUDENT = 3
    FINANCE = 4
    MONITORING = 5
    INITIATION = 6
    LIBRARY = 7

    SYSTEM_TYPE = (
        (LMS, "Сургалтын удирдлагийн систем"),
        (TEACHER, "Багшийн систем"),
        (STUDENT, "Oюутны систем"),
        (FINANCE, "Санхүүгийн систем"),
        (MONITORING, "Хяналтын систем"),
        (INITIATION, "Элсэлтийн систем"),
        (LIBRARY, "Номын сангийн систем"),
    )

    MOBILE = 1
    TABLET = 2
    PC = 3

    DEVICE_TYPE = (
        (MOBILE, "Утас"),
        (TABLET, "Таблет"),
        (PC, "Компютер"),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True, verbose_name="Хэрэглэгч")
    student = models.ForeignKey(StudentLogin,on_delete=models.CASCADE, null=True, blank=True, verbose_name="Оюутан")
    system_type = models.PositiveIntegerField(choices=SYSTEM_TYPE, db_index=True, null=False, verbose_name="Нэвтэрсэн системийн нэр")
    device_type = models.PositiveIntegerField(choices=DEVICE_TYPE, db_index=True, null=False, verbose_name="Нэвтэрсэн төхөөрөмжийн төрөл")
    device_name = models.CharField(max_length=50, null=True, blank=True, verbose_name="Нэвтэрсэн төхөөрөмжийн нэр")
    browser = models.CharField(max_length=50, null=True, blank=True, verbose_name="Нэвтэрсэн хэрэглэгчийн вэб хөтөч")
    os_type = models.CharField(max_length=50, null=True, blank=True, verbose_name="Нэвтэрсэн төхөөрөмжийн үйлдлийн систем")
    ip = models.CharField(max_length=16, null=True, blank=True, verbose_name="Нэвтэрсэн хэрэглэгчийн IP хаяг")
    is_logged = models.BooleanField(default=False, verbose_name="Нэвтрэлт амжилттай болсон эсэх")

    in_time = models.DateTimeField(auto_now_add=True)
    out_time = models.DateTimeField(null=True, blank=True)


class StudentGrade(models.Model):
    """ Хичээлийн улирлын үндсэн дүн """

    student = models.ForeignKey(Student, on_delete=models.CASCADE, verbose_name="Оюутан", null=True)
    lesson_year = models.CharField(max_length=20, null=True, verbose_name="Хичээлийн жил")
    lesson_season = models.ForeignKey(Season, on_delete=models.CASCADE, related_name="Улирал", null=True)
    credit = models.FloatField(verbose_name="Улирлын цуглуулсан нийт кредит")
    average = models.FloatField(verbose_name="Улирлын дундаж оноо",  null=True)
    gpa = models.FloatField(verbose_name="Улирлын голч дүн",  null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class Errors(models.Model):
    """ error хадгалах
    """

    system_type = models.PositiveIntegerField(choices=AccessHistoryLms.SYSTEM_TYPE, db_index=True, null=False, verbose_name="Нэвтэрсэн системийн нэр")
    url = models.CharField(null=False, db_index=True, max_length=254, verbose_name='URL')
    method = models.CharField(max_length=20, null=False, db_index=True, verbose_name='Method')
    code = models.CharField(max_length=50, null=False, db_index=True, verbose_name='Алдааны дугаар')
    description = models.TextField(null=True, verbose_name='Алдааны мэдэгдэл')
    headers = models.TextField(null=True, verbose_name='Request headers')
    scheme = models.TextField(null=True, verbose_name='Request scheme')
    datetime = models.DateTimeField(auto_now_add=True, verbose_name='Хүсэлт илгээсэн огноо')
    data = models.TextField(null=True, verbose_name='Request data')


class Error500(models.Model):
    """ error 500 хадгалах
    """

    system_type = models.PositiveIntegerField(choices=AccessHistoryLms.SYSTEM_TYPE, db_index=True, null=False, verbose_name="Нэвтэрсэн системийн нэр")
    url = models.CharField(null=False, db_index=True, max_length=254, verbose_name='URL')
    method = models.CharField(max_length=20, null=False, db_index=True, verbose_name='Method')
    description = models.TextField(null=True, verbose_name='Алдааны мэдэгдэл')
    headers = models.TextField(null=True, verbose_name='Request headers')
    scheme = models.TextField(null=True, verbose_name='Request scheme')
    datetime = models.DateTimeField(auto_now_add=True, verbose_name='Хүсэлт илгээсэн огноо')
    data = models.TextField(null=True, verbose_name='Request data')


class RequestLogGet(models.Model):
    """ Request-ийн GET method-үүдийн түүхийг хадгалах
    """

    system_type = models.PositiveIntegerField(choices=AccessHistoryLms.SYSTEM_TYPE, db_index=True, null=False, verbose_name="Нэвтэрсэн системийн нэр")
    url = models.CharField(null=False, db_index=True, max_length=254, verbose_name='URL')
    query_string = models.TextField(null=True, verbose_name='Query string')
    remote_ip = models.CharField(max_length=50, null=True, db_index=True, verbose_name='Remote IP')
    datetime = models.DateTimeField(auto_now_add=True, verbose_name='Хүсэлт илгээсэн огноо')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True,
                                on_delete=models.SET_NULL, db_constraint=False,
                                verbose_name='Хэрэглэгчийн ID')
    status_code = models.SmallIntegerField(null=True, verbose_name='request status code')


class RequestLogPost(models.Model):
    """ Request-ийн POST method-үүдийн түүхийг хадгалах
    """

    system_type = models.PositiveIntegerField(choices=AccessHistoryLms.SYSTEM_TYPE, db_index=True, null=False, verbose_name="Нэвтэрсэн системийн нэр")
    url = models.CharField(null=False, db_index=True, max_length=254, verbose_name='URL')
    query_string = models.TextField(null=True, verbose_name='Query string')
    remote_ip = models.CharField(max_length=50, null=True, db_index=True, verbose_name='Remote IP')
    datetime = models.DateTimeField(auto_now_add=True, verbose_name='Хүсэлт илгээсэн огноо')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True,
                                on_delete=models.SET_NULL, db_constraint=False,
                                verbose_name='Хэрэглэгчийн ID')
    data = models.TextField(null=False, verbose_name='Post data буюу body')
    status_code = models.SmallIntegerField(null=True, verbose_name='request status code')


class RequestLogPut(models.Model):
    """ Request-ийн PUT method-үүдийн түүхийг хадгалах
    """

    system_type = models.PositiveIntegerField(choices=AccessHistoryLms.SYSTEM_TYPE, db_index=True, null=False, verbose_name="Нэвтэрсэн системийн нэр")
    url = models.CharField(null=False, db_index=True, max_length=254, verbose_name='URL')
    query_string = models.TextField(null=True, verbose_name='Query string')
    remote_ip = models.CharField(max_length=50, null=True, db_index=True, verbose_name='Remote IP')
    datetime = models.DateTimeField(auto_now_add=True, verbose_name='Хүсэлт илгээсэн огноо')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True,
                                on_delete=models.SET_NULL, db_constraint=False,
                                verbose_name='Хэрэглэгчийн ID')
    data = models.TextField(null=False, verbose_name='Put data буюу body')
    status_code = models.SmallIntegerField(null=True, verbose_name='request status code')


class RequestLogDelete(models.Model):
    """ Request-ийн DELETE method-үүдийн түүхийг хадгалах
    """

    system_type = models.PositiveIntegerField(choices=AccessHistoryLms.SYSTEM_TYPE, db_index=True, null=False, verbose_name="Нэвтэрсэн системийн нэр")
    url = models.CharField(null=False, db_index=True, max_length=254, verbose_name='URL')
    query_string = models.TextField(null=True, verbose_name='Query string')
    remote_ip = models.CharField(max_length=50, null=True, db_index=True, verbose_name='Remote IP')
    datetime = models.DateTimeField(auto_now_add=True, verbose_name='Хүсэлт илгээсэн огноо')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True,
                                on_delete=models.SET_NULL, db_constraint=False,
                                verbose_name='Хэрэглэгчийн ID')
    status_code = models.SmallIntegerField(null=True, verbose_name='request status code')


class AttachmentConfig(models.Model):
    """ Хавсралтын тохиргоо ангиар нь тохируулах
    """

    MONGOLIAN = 1
    ENGLISH = 2
    UIGARJIN = 3

    ATTACHMENT_TYPE = (
        (MONGOLIAN, "Монгол"),
        (ENGLISH, "Англи"),
        (UIGARJIN, "Уйгаржин"),
    )

    # profession = models.ForeignKey(ProfessionDefinition, on_delete=models.CASCADE, verbose_name="Мэргэжил")
    group = models.ForeignKey(Group, on_delete=models.CASCADE, verbose_name="Мэргэжил", null=True)
    row_count = ArrayField(models.IntegerField(null=True), blank=True,null=True,verbose_name='Туслах багш')
    atype = models.IntegerField(choices=ATTACHMENT_TYPE, default=MONGOLIAN, verbose_name="Хавсралтын төрөл")
    is_lastname = models.BooleanField(default=False, verbose_name='Овог харуулах эсэх')
    is_center = models.BooleanField(default=False, verbose_name='Голлуулах эсэх')
    give_date = models.DateField(verbose_name='Олгосон огноо', null=True)


# ----------------------------------------------- Цахим сургалт ----------------------------------------------------------------------------------------------
class QuezChoices(models.Model):
    """Цахим сургалтын асуултын сонголтууд """

    choices = models.CharField(verbose_name="Сонголт", max_length=1000, null=False, blank=False)
    image = models.ImageField(upload_to=get_choice_image_path, null=True, blank=True, verbose_name='зураг')

    score = models.FloatField(default=0, verbose_name='Зөв хариултын оноо')

    created_by = models.ForeignKey(Teachers, on_delete=models.CASCADE, related_name="+")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)



class QuezQuestions(models.Model):
    """ Цахим сургалтын асуулт """


    KIND_ONE_CHOICE = 1
    KIND_MULTI_CHOICE = 2
    KIND_BOOLEAN = 3
    KIND_RATING = 4
    KIND_TEXT = 5
    KIND_SHORT_CHOICE = 6
    KIND_JISHIH_CHOICE = 7
    KIND_ESTIMATE_CHOICE = 8
    KIND_PROJECT_CHOICE = 9
    KIND_TOVCH_CHOICE = 10

    KIND_CHOICES = (
        (KIND_ONE_CHOICE, 'Нэг сонголт'),
        (KIND_SHORT_CHOICE, 'Богино нөхөх хариулт'),
        (KIND_JISHIH_CHOICE, 'Харгалзуулах, жиших'),
        (KIND_ESTIMATE_CHOICE, 'Тооцоолж бодох'),
        (KIND_PROJECT_CHOICE, 'Төсөл боловсруулах'),
        (KIND_TOVCH_CHOICE, 'Товч хариулт'),
        (KIND_MULTI_CHOICE, 'Олон сонголт'),
        (KIND_BOOLEAN, 'Үнэн, Худлыг олох'),
        (KIND_TEXT, 'Эссэ бичих'),
        (KIND_RATING, 'Үнэлгээ'),
    )

    kind = models.IntegerField(choices=KIND_CHOICES, null=False, blank=False, verbose_name='Асуултын төрөл')
    question = models.CharField(max_length=1000, null=False, blank=False, verbose_name="Асуулт")

    image = models.ImageField(upload_to=get_image_path, null=True, blank=True, verbose_name='зураг')

    score = models.FloatField(verbose_name="Асуултын оноо", null=True)
    yes_or_no = models.PositiveIntegerField(null=True, verbose_name='Тийм үгүй асуултны хариулт хадгалах хэсэг') # 1 0 хадгалах

    # KIND_RATING үед
    rating_max_count = models.IntegerField(default=0, verbose_name="Үнэлгээний дээд тоо", null=True, blank=True)
    low_rating_word = models.CharField(max_length=100, verbose_name="Доод үнэлгээг илэрхийлэх үг", null=True)
    high_rating_word = models.CharField(max_length=100, verbose_name="Дээд үнэлгээг илэрхийлэх үг", null=True)

    # KIND_MULTI_CHOICE үед
    max_choice_count = models.IntegerField(default=0, verbose_name="Сонголтын хязгаар", null=True, blank=True)

    # KIND_ONE_CHOICE болон KIND_MULTI_CHOICE үед
    choices = models.ManyToManyField(QuezChoices, blank=True)

    created_by = models.ForeignKey(Teachers, on_delete=models.CASCADE, related_name="+")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)



class LessonMaterial(models.Model):
    """ Хичээлийн материал """

    FILE = 1
    VIDEO = 2
    IMAGE = 3
    AUDIO = 4

    MATERIAL_TYPE = (
        (FILE, "Файл"),
        (VIDEO, "Video хичээл"),
        (IMAGE, "Зураг"),
        (AUDIO, "Audio"),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name='Материал оруулсан хэрэглэгч')
    material_type = models.IntegerField(choices=MATERIAL_TYPE, default=FILE, verbose_name='Материалын төрөл')
    path = models.FileField(verbose_name='Файлуудын замыг хадгалах хэсэг', upload_to='efile')
    created_at = models.DateTimeField(auto_created=True, verbose_name='Үүсгэсэн огноо')




class HomeWork(models.Model):
    """ Гэрийн даалгавар """

    description = models.TextField(verbose_name='Тайлбар')
    start_date = models.DateTimeField(verbose_name='Эхлэх хугацаа', null=True)
    end_date = models.DateTimeField(verbose_name='Дуусах хугацаа', null=True)
    score = models.FloatField(verbose_name='Дүгнэх огноо', null=True)
    file = models.FileField(verbose_name='Гэрийн даалгаварт хавсаргах файл', null=True,  upload_to='homework')
    created_user = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name='Материал оруулсан хэрэглэгч')
    created_at = models.DateTimeField(auto_created=True, verbose_name='Үүсгэсэн огноо')


class Seminar(models.Model):
    """ Семинарын даалгавар """

    description = models.TextField(verbose_name='Тайлбар')
    start_date = models.DateTimeField(verbose_name='Эхлэх хугацаа', null=True)
    end_date = models.DateTimeField(verbose_name='Дуусах хугацаа', null=True)
    score = models.FloatField(verbose_name='Дүгнэх огноо', null=True)
    file = models.FileField(verbose_name='Семинарт хавсаргах файл', null=True,  upload_to='homework')
    created_user = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name='Семинар оруулсан хэрэглэгч')
    created_at = models.DateTimeField(auto_created=True, verbose_name='Үүсгэсэн огноо')


class SeminarStudent(models.Model):
    """ Семинарын оюутнууд"""

    SEND = 1
    CHECKED = 2

    ASSIGNMENT_TYPE = (
        (SEND, 'Илгээсэн'),
        (CHECKED, 'Дүгнэгдсэн'),
    )

    homework = models.ForeignKey(Seminar, on_delete=models.CASCADE, verbose_name="Гэрийн даалгавар")
    student = models.ForeignKey(Student, on_delete=models.CASCADE, verbose_name="Оюутан")
    status = models.IntegerField(choices=ASSIGNMENT_TYPE, db_index=True, default=SEND, verbose_name="Даалгаврын төрөл", null=True)
    score = models.FloatField(verbose_name='Дүгнэгдсэн оноо', null=True)
    score_comment = models.TextField(verbose_name='Дүгнэх үеинй тайлбар', null=True)
    send_file = models.FileField(verbose_name='Илгээсэн файл', upload_to='seminar', null=True)
    description = models.TextField(verbose_name='Тайлбар', null=True)
    created_at = models.DateTimeField(auto_now=True, verbose_name='Үүсгэсэн огноо')



class HomeWorkStudent(models.Model):
    """ Гэрийн даалгавар оюутнууд"""

    SEND = 1
    CHECKED = 2

    ASSIGNMENT_TYPE = (
        (SEND, 'Илгээсэн'),
        (CHECKED, 'Дүгнэгдсэн'),
    )

    homework = models.ForeignKey(HomeWork, on_delete=models.CASCADE, verbose_name="Гэрийн даалгавар")
    student = models.ForeignKey(Student, on_delete=models.CASCADE, verbose_name="Оюутан")
    status = models.IntegerField(choices=ASSIGNMENT_TYPE, db_index=True, default=SEND, verbose_name="Даалгаврын төрөл", null=True)
    score = models.FloatField(verbose_name='Дүгнэгдсэн оноо', null=True)
    score_comment = models.TextField(verbose_name='Дүгнэх үеинй тайлбар', null=True)
    send_file = models.FileField(verbose_name='Илгээсэн файл', upload_to='homework', null=True)
    description = models.TextField(verbose_name='Тайлбар', null=True)
    created_at = models.DateTimeField(auto_now=True, verbose_name='Үүсгэсэн огноо')


class WeekMaterials(models.Model):
    """ Тухайн 7 хоногт оруулах файлууд """

    is_leks = models.BooleanField(default=True, verbose_name='Лекц эсэх')
    description = models.TextField(verbose_name='Тайлбар')
    material = models.ForeignKey(LessonMaterial, on_delete=models.CASCADE, verbose_name='Хичээлийн материал')
    created_at = models.DateTimeField(auto_now=True)


class ELearn(models.Model):
    """ Цахим хичээл """

    lesson = models.ForeignKey(LessonStandart, on_delete=models.CASCADE, verbose_name='Хичээл', null=True)
    title = models.TextField(null=True, verbose_name='Хичээлийн нэр гарчиг')
    description = models.CharField(verbose_name='Тайлбар', max_length=1000, null=True)

    teacher = models.ForeignKey(Teachers, on_delete=models.CASCADE, verbose_name='Багш', null=True)
    image = models.FileField(upload_to='online', verbose_name='Зураг', null=True)

    students = models.ManyToManyField(Student, blank=True, verbose_name='Хичээл үзэх оюутнууд')

    start_date = models.DateTimeField(null=True, verbose_name='Эхлэх хугацаа')
    end_date = models.DateTimeField(null=True, verbose_name='Дуусах хугацаа')

    is_end_exam = models.BooleanField(default=True, verbose_name='Төгсөлтийн шалгалттай эсэх')
    is_certificate = models.BooleanField(default=False, verbose_name='Сертификаттай эсэх')

    created_user = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name='Үүсгэсэн хэрэглэгч', null=True)
    created_at = models.DateTimeField(auto_now=True, null=True)


class OnlineInfo(models.Model):
    """ Тухайн цахим хичээлд хамаарах бүлэг"""
    elearn = models.ForeignKey(ELearn, on_delete=models.CASCADE, verbose_name='Цахим хичээл', null=True)
    title = models.TextField(null=True, verbose_name='Хичээлийн нэр гарчиг')
    related_info = models.ForeignKey("self", null=True, on_delete=models.CASCADE, verbose_name='Өмнөх бүлгээс хамаарах эсэх')


class OnlineSubInfo(models.Model):
    """ Цахим хичээлийн хэсгүүд """

    PDF = 1
    VIDEO = 2
    TEXT = 3
    AUDIO = 4
    QUIZ = 5

    MATERIAL_TYPE = (
        (PDF, "PDF"),
        (VIDEO, "Video хичээл"),
        (TEXT, "TEXT"),
        (QUIZ, "Шалгалт"),
    )

    parent_title = models.ForeignKey(OnlineInfo, verbose_name='Parent', on_delete=models.CASCADE)
    title = models.CharField(null=True, verbose_name='Хичээлийн нэр гарчиг', max_length=500)
    file_type = models.IntegerField(choices=MATERIAL_TYPE, default=TEXT, verbose_name='Материалын төрөл')
    text = models.TextField(null=True, verbose_name='ТEXT төрлийн мэдээлэл')
    file = models.FileField(null=True, verbose_name='ФАЙЛ төрлийн мэдээлэл')
    quiz = models.ManyToManyField(QuezQuestions, blank=True, verbose_name='Цахим сургалтын сорил шалгалт')


class ELearnProgress(models.Model):
    """ Цахим хичээл оролцогчид """

    online_sub_info = models.ForeignKey(OnlineSubInfo, on_delete=models.CASCADE)
    student = models.ForeignKey(Student, on_delete=models.CASCADE)

    current_try_number = models.IntegerField(default=0, null=True, verbose_name="Сургалт өгсөн оролдлогийн тоо")

    start_time = models.DateTimeField(verbose_name='Сургалт эхэлсэн хугацаа',null=False)
    end_time = models.DateTimeField(verbose_name='Сургалт дуусгасан хугацаа', null=True)

    answer = models.TextField(null=True, verbose_name='Хариулт')

    # KIND_ONE_CHOICE болон KIND_MULTI_CHOICE үед
    choosed_choices = models.ManyToManyField(QuezChoices, verbose_name="Сонгосон сонголтууд", blank=True)

    score = models.FloatField(null=True, verbose_name='Оюутны авсан оноо')
    take_score = models.FloatField(null=True, verbose_name='Оюутны авах оноо')
    score_set_by = models.ForeignKey(Teachers, on_delete=models.SET_NULL, verbose_name='Оюутны авсан оноог өгсөн багш', null=True)

    question = models.ForeignKey(QuezQuestions, on_delete=models.CASCADE, verbose_name="Асуулт")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class OnlineWeek(models.Model):
    """ Цахим хичээлийн 7 хоног """

    LEKTS_SHOW = 1
    CHALLENGE = 2
    HOMEWORK = 3
    SHOW_TYPE = (
        (LEKTS_SHOW, "Лекц үзснээр тооцох"),
        (CHALLENGE, "Шалгалт үзсэнээр"),
        (HOMEWORK, "Гэрийн даалгавар, семинар ажил хийснээр")
    )

    week_number = models.IntegerField(verbose_name='7 хоногийн дугаар')
    start_date = models.DateTimeField(null=True, verbose_name='Тухайн хичээлийн эхлэх хугацаа')
    end_date = models.DateTimeField(null=True, verbose_name='Тухайн хичээлийн дуусах хугацаа')
    is_lock = models.BooleanField(verbose_name='Өмнөх 7 хоногийн хичээлээс хамаарах')
    before_week = models.ForeignKey("self", null=True, on_delete=models.CASCADE, verbose_name='Хамаарах өмнөх 7 хоног')
    showed_type = models.IntegerField(choices=SHOW_TYPE, default=CHALLENGE, verbose_name='Хичээл үзсэнээр тооцох төрөл')
    challenge = models.ForeignKey(Challenge, on_delete=models.SET_NULL, null=True, verbose_name='7 хоногийн шалгалт')
    homework = models.ForeignKey(HomeWork, on_delete=models.SET_NULL, null=True, verbose_name='Гэрийн даалгавар')
    challenge_check_score = models.FloatField(null=True, verbose_name='Шалгалтаар тооцох оноо')

    description = models.CharField(verbose_name='Тайлбар', max_length=1000, null=True)
    lekts_file = models.FileField(verbose_name='Лекцийн материал', null=True)
    materials = models.ManyToManyField(WeekMaterials, verbose_name='Тухайн 7 хоногийн материалууд')

    work_type = models.IntegerField(choices=HomeWorkStudent.ASSIGNMENT_TYPE, db_index=True, default=HomeWorkStudent.CHECKED, verbose_name="Даалгаврын тооцох төрөл", null=True)

    created_user = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name='Үүсгэсэн хэрэглэгч', null=True)
    created_at = models.DateTimeField(auto_now=True)


class OnlineLesson(models.Model):
    """ Цахим хичээл """

    WEEK = 1
    DATE = 2

    CREATE_TYPE = (
        (WEEK, "Долоо хоног"),
        (DATE, "Хугацаагаар"),
    )

    lesson = models.ForeignKey(LessonStandart, on_delete=models.CASCADE, verbose_name='Хичээл', null=True)
    teacher = models.ForeignKey(Teachers, on_delete=models.CASCADE, verbose_name='Багш', null=True)
    create_type = models.IntegerField(choices=CREATE_TYPE, default=WEEK, verbose_name='Үүсгэх төрөл')
    students = models.ManyToManyField(Student, verbose_name='Хичээл үзэх оюутнууд')
    total_score = models.FloatField(verbose_name='Нийт үнэлэх оноо', null=True)
    start_date = models.DateTimeField(null=True, verbose_name='Эхлэх хугацаа')
    end_date = models.DateTimeField(null=True, verbose_name='Дуусах хугацаа')
    is_end_exam = models.BooleanField(default=True, verbose_name='Төгсөлтийн шалгалттай эсэх')
    is_certificate = models.BooleanField(default=False, verbose_name='Сертификаттай эсэх')
    plan = models.TextField(verbose_name='Сургалтын төлөвлөгөө', null=True)
    weeks = models.ManyToManyField(OnlineWeek, blank=True, verbose_name='7 хоногууд')

    created_user = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name='Үүсгэсэн хэрэглэгч', null=True)
    created_at = models.DateTimeField(auto_now=True, null=True)


class OnlineWeekStudent(models.Model):
    """ Оюутны лекцийн материал хадгалах хэсэг """
    SEND = 1
    CHECKED = 2

    ASSIGNMENT_TYPE = (
        (SEND, 'Илгээсэн'),
        (CHECKED, 'Дүгнэгдсэн'),
    )
    week = models.ForeignKey(OnlineWeek, verbose_name='7 хоног', on_delete=models.CASCADE)
    student = models.ForeignKey(Student, verbose_name='Оюутан', on_delete=models.CASCADE)
    lekts_file = models.FileField(upload_to='student_lekts', verbose_name='Лекцийн материал хөтөлсөн зураг', null=True)
    status = models.IntegerField(choices=ASSIGNMENT_TYPE, db_index=True, default=SEND, verbose_name="Лекцийн материал төрөл", null=True)
    created_at = models.DateTimeField(auto_now=True, verbose_name='Үүсгэсэн огноо')


class BiyDaalt(models.Model):
    """ Бие даалт """

    guidelines = models.TextField(verbose_name='Удирдамж', null=True)
    check_week = models.ForeignKey(OnlineWeek, verbose_name='Шалгах 7 хоног', on_delete=models.CASCADE)
    score = models.FloatField(verbose_name='Дүгнэх огноо', null=True)
    file = models.FileField(verbose_name='Хавсаргах файл', null=True,  upload_to='biydaalt')

    created_user = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name='Бие даалт оруулсан хэрэглэгч')
    created_at = models.DateTimeField(auto_created=True, verbose_name='Үүсгэсэн огноо')


class BiyDaaltStudent(models.Model):
    """ Бие даалт """

    SEND = 1
    CHECKED = 2

    ASSIGNMENT_TYPE = (
        (SEND, 'Илгээсэн'),
        (CHECKED, 'Дүгнэгдсэн'),
    )

    biydaalt = models.ForeignKey(BiyDaalt, verbose_name='7 хоног', on_delete=models.CASCADE)
    student = models.ForeignKey(Student, verbose_name='Оюутан', on_delete=models.CASCADE)
    file = models.FileField(upload_to='student_biydaalt', verbose_name='Оюутны илгээсэн файл', null=True)
    status = models.IntegerField(choices=ASSIGNMENT_TYPE, db_index=True, default=SEND, verbose_name="Бие даалтын төрөл", null=True)
    created_at = models.DateTimeField(auto_now=True, verbose_name='Үүсгэсэн огноо')


class Announcement(models.Model):
    """ Зарлал"""

    title = models.CharField(verbose_name='Зарлал гарчиг', max_length=500)
    body = models.TextField(verbose_name='Зарлалын бие хэсэг', null=True)
    is_online = models.BooleanField(default=True, verbose_name="Online хичээлийн зарлал эсэх")
    week_number = models.IntegerField(verbose_name='7 хоногийн дугаар', null=True)
    online_lesson = models.ForeignKey(OnlineLesson, on_delete=models.CASCADE, verbose_name='Онлайн хичээл', null=True)
    timetable = models.ForeignKey(TimeTable, on_delete=models.CASCADE, verbose_name='Хичээлийн хуваарь', null=True)
    org = models.ForeignKey(Schools, on_delete=models.CASCADE, verbose_name="Байгууллага", null=True)

    created_user = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name='Үүсгэсэн хэрэглэгч', null=True)
    created_at = models.DateTimeField(auto_now_add=True)



class AnnouncementComment(models.Model):
    """ Зарлал сэтгэгдэл """

    announcement = models.ForeignKey(StudentNotice, verbose_name='Зар мэдээ', on_delete=models.CASCADE)
    student = models.ForeignKey(Student, verbose_name='Оюутан', null=True, on_delete=models.CASCADE)
    user = models.ForeignKey(User, verbose_name='Хэрэглэгч', null=True, on_delete=models.CASCADE)
    comment = models.TextField(verbose_name='Сэтгэгдэл', null=True)
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Сэтгэгдэл үлдээсэн хугацаа')



# ----------------------------------------------------------Суралцагчийн хөтөч -------------------------------------------------------------------------
class Rule(models.Model):
    """ Багш ажилчдын дүрэм журам """

    STUDENT = 1
    TEACHER = 2

    STYPE = (
        (STUDENT, 'Оюутан'),
        (TEACHER, 'Багш')
    )
    title = models.CharField(max_length=1000, verbose_name='Гарчиг')
    file = models.FileField(upload_to='rule', verbose_name='Файл')
    stype = models.IntegerField(choices=STYPE, default=STUDENT)
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Үүсгэсэн хугацаа')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)


class Structure(models.Model):
    """ Их сургуулийн бүтэц зохион байгуулалт """

    title = models.CharField(max_length=1000, verbose_name='Гарчиг')
    link = models.CharField(max_length=1000, verbose_name='Линк', null=True)
    file = models.FileField(upload_to='structure', verbose_name='Файл', null=True)
    created_user = models.ForeignKey(User, on_delete=models.SET_NULL,related_name='create_user', null=True, verbose_name='Үүсгэсэн хэрэглэгч')
    updated_user = models.ForeignKey(User, on_delete=models.SET_NULL, related_name='update_user', null=True, verbose_name='Зассан хэрэглэгч')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class StudentDevelop(models.Model):
    """ Суралцагчийн хөгжил """

    title = models.CharField(max_length=1000, verbose_name='Гарчиг')
    link = models.CharField(max_length=1000, verbose_name='Линк', null=True)
    file = models.FileField(upload_to='develop', verbose_name='Файл', null=True)
    created_user = models.ForeignKey(User, on_delete=models.SET_NULL, related_name='cr_user', null=True, verbose_name='Үүсгэсэн хэрэглэгч')
    updated_user = models.ForeignKey(User, on_delete=models.SET_NULL, related_name='up_user',  null=True, verbose_name='Зассан хэрэглэгч')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class Library(models.Model):
    """ Номын сан танилцуулга"""

    title = models.CharField(max_length=1000, verbose_name='Гарчиг')
    file = models.FileField(upload_to='lib', verbose_name='Файл', null=True)
    link = models.CharField(max_length=1000, verbose_name='Линк', null=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, related_name='l_cr_user', null=True, verbose_name='Үүсгэсэн хэрэглэгч')
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, verbose_name='Зассан хэрэглэгч')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class StudentPsycholocal(models.Model):
    """ Сэтгэл зүйн булан """

    title = models.CharField(max_length=1000, verbose_name='Гарчиг')
    link = models.CharField(max_length=1000, verbose_name='Линк', null=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, related_name='p_cr_user', null=True, verbose_name='Үүсгэсэн хэрэглэгч')
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, verbose_name='Зассан хэрэглэгч')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class StudentRules(models.Model):
    """ Номын сангийн журам """

    title = models.CharField(max_length=1000, verbose_name='Гарчиг')
    file = models.FileField(upload_to='rules', verbose_name='Файл', null=True)

    created_user = models.ForeignKey(User, on_delete=models.SET_NULL,related_name='lib_user', null=True, verbose_name='Үүсгэсэн хэрэглэгч')
    updated_user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, verbose_name='Зассан хэрэглэгч')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class Health(models.Model):
    """ Эрүүл мэнд танилцуулга """

    title = models.CharField(max_length=1000, verbose_name='Гарчиг')
    link = models.CharField(max_length=1000, verbose_name='Тайлбар', null=True)

    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, related_name='health_user', null=True, verbose_name='Үүсгэсэн хэрэглэгч')
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, verbose_name='Зассан хэрэглэгч')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class StudentTime(models.Model):
    """ Номын сангийн цагийн хуваарь """

    title = models.CharField(max_length=1000, verbose_name='Гарчиг', null=True)
    file = models.FileField(upload_to='time', verbose_name='Файл', null=True)

    created_user = models.ForeignKey(User, on_delete=models.SET_NULL,related_name='time_user', null=True, verbose_name='Үүсгэсэн хэрэглэгч')
    updated_user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, verbose_name='Зассан хэрэглэгч')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class HealthHelp(models.Model):
    """ Эрүүл мэнд зөвлөмж """

    title = models.CharField(max_length=1000, verbose_name='Гарчиг')
    file = models.FileField(upload_to='healt_help', verbose_name='Файл', null=True)

    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, related_name='help_user', null=True, verbose_name='Үүсгэсэн хэрэглэгч')
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, verbose_name='Зассан хэрэглэгч')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class PsycholocalHelp(models.Model):
    """ Сэтгэл зүйн зөвлөмж """

    title = models.CharField(max_length=1000, verbose_name='Гарчиг')
    file = models.FileField(upload_to='psy_help', verbose_name='Файл', null=True)

    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, related_name='psy_user', null=True, verbose_name='Үүсгэсэн хэрэглэгч')
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, verbose_name='Зассан хэрэглэгч')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class MentalStudent(models.Model):
    """ Элсэгчдийн сэтгэлзүйн сорил """

    user = models.ForeignKey(Student, on_delete=models.CASCADE, verbose_name='Оюутан', null=True)
    challenge = models.ForeignKey(PsychologicalTest, on_delete=models.CASCADE, verbose_name='Сэтгэлзүйн сорил')
    description = models.TextField(verbose_name='Тайлбар', null=True)
    answer = models.TextField(null=True, verbose_name='Хариулт')
    score = models.FloatField(null=True, verbose_name='Элсэгчийн нийт оноо')
    start_time = models.DateTimeField(null=True, verbose_name='Шалгалт өгч эхэлсэн хугацаа')
    end_time = models.DateTimeField(null=True, verbose_name='Шалгалт өгч дууссан хугацаа')

    created_at = models.DateTimeField(auto_now=True)
    updated_at = models.DateTimeField(auto_now=True)
