from django.db import models

from common.mixins.model_mixins import TimeAuditModel


class EducationLevel(TimeAuditModel):

    class Meta:
        verbose_name = "Боловсролын түвшин"

    name = models.CharField(max_length=255, verbose_name="Нэр")
    code = models.CharField(max_length=255, verbose_name="Код")


class AcademicShift(TimeAuditModel):

    class Meta:
        verbose_name = "Сургалтын хэлбэр"

    name = models.CharField(max_length=255, verbose_name="Нэр")
    code = models.CharField(max_length=255, verbose_name="Код")


class AcademicLoad(TimeAuditModel):

    class Meta:
        verbose_name = "Сургалтын ачаалал"

    name = models.CharField(max_length=255, verbose_name="Нэр")
    code = models.CharField(max_length=255, verbose_name="Код")


class DisabilityReason(TimeAuditModel):

    class Meta:
        verbose_name = "Хөдөлтөрийн чадвар алдалтын төрөл"

    name = models.CharField(max_length=255, verbose_name="Нэр")
    code = models.CharField(max_length=255, verbose_name="Код")


class DisabilityType(TimeAuditModel):

    class Meta:
        verbose_name = "Хөгжлийн бэрхшээлийн төрөл"

    name = models.CharField(max_length=255, verbose_name="Нэр")
    code = models.CharField(max_length=255, verbose_name="Код")


class DisabilityCategory(TimeAuditModel):

    class Meta:
        verbose_name = "Хөгжлийн бэрхшээлийн хэлбэр"

    name = models.CharField(max_length=255, verbose_name="Нэр")
    code = models.CharField(max_length=255, verbose_name="Код")


class StudentLivingPalace(TimeAuditModel):

    class Meta:
        verbose_name = "Амьдарч буй газар"

    name = models.CharField(max_length=255, verbose_name="Нэр")
    code = models.CharField(max_length=255, verbose_name="Код")


class OrphanCategory(TimeAuditModel):

    class Meta:
        verbose_name = "Өнчний хэлбэр"

    name = models.CharField(max_length=255, verbose_name="Нэр")
    code = models.CharField(max_length=255, verbose_name="Код")


class OrphanGuardianType(TimeAuditModel):

    class Meta:
        verbose_name = "Асран хамгаалагчийн хэлбэр"

    name = models.CharField(max_length=255, verbose_name="Нэр")
    code = models.CharField(max_length=255, verbose_name="Код")


class OrphanType(TimeAuditModel):

    class Meta:
        verbose_name = "Өнчний төрөл"

    name = models.CharField(max_length=255, verbose_name="Нэр")
    code = models.CharField(max_length=255, verbose_name="Код")


class AttendReason(TimeAuditModel):

    class Meta:
        verbose_name = "Ирцийн шалтгаан"

    name = models.CharField(max_length=255, verbose_name="Нэр")
    code = models.CharField(max_length=255, verbose_name="Код")


class TextbookAcquiredSource(TimeAuditModel):

    class Meta:
        verbose_name = "Олж авсан эх сурвалж"

    name = models.CharField(max_length=255, verbose_name="Нэр")
    code = models.CharField(max_length=255, verbose_name="Код")
