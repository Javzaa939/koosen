from django.db import models

from common.mixins.model_mixins import TimeAuditModel


class Group(TimeAuditModel):

    class Meta:
        verbose_name = "Анги"

    academic_level = models.CharField(max_length=255, verbose_name="Ангийн код")
    academic_level_name = models.CharField(max_length=255, verbose_name="Ангийн нэр")

    student_group_id = models.PositiveBigIntegerField(verbose_name="Бүлгийн код")
    program_of_study_id = models.PositiveBigIntegerField(verbose_name="Хөтөлбөр ID")
    program_stage_id = models.PositiveBigIntegerField(verbose_name="Түвшин ID")
    program_plan_id = models.PositiveBigIntegerField(verbose_name="Төлөвлөгөөний ID")

    student_group_name = models.CharField(max_length=255, verbose_name="Бүлгийн нэр")
    teacher_id = models.PositiveBigIntegerField(verbose_name="Анги удирдсан багшийн ID")
    teacher_name = models.CharField(
        max_length=255, verbose_name="Анги удирдсан багшийн нэр"
    )
    academic_year = models.CharField(
        max_length=255, verbose_name="Тухайн хичээлийн жил"
    )


class Teacher(TimeAuditModel):

    class Meta:
        verbose_name = "Багш"

    institution_id = models.BigIntegerField(verbose_name="Байгууллагын ID")
    person_id = models.BigIntegerField(verbose_name="Хүний ID")
    display_name = models.CharField(max_length=255, verbose_name="Багшийн товч нэр")
    last_name = models.CharField(max_length=255, verbose_name="Эцэг/эх/ийн нэр")
    first_name = models.CharField(max_length=255, verbose_name="Өөрийн нэр")
    date_of_birth = models.DateField(verbose_name="Төрсөн огноо")
    microsoft_email = models.EmailField(
        max_length=255, verbose_name="Багшийн цахим хаяг"
    )
    google_email = models.EmailField(max_length=255, verbose_name="Багшийн цахим хаяг")
    all_email = models.TextField(verbose_name="Бүх цахим хаяг")
    assignment_name = models.CharField(
        max_length=255, verbose_name="Багшийн албан тушаал"
    )
    instructor_type_id = models.IntegerField(verbose_name="Багшийн төрлийн ID")
    type_name = models.CharField(max_length=255, verbose_name="Төрөл")
    academic_organization_id = models.BigIntegerField(
        verbose_name="Заах аргын нэгдлийн ID"
    )
    academic_org_name = models.CharField(
        max_length=255, verbose_name="Заах аргын нэгдлийн нэр"
    )
    username = models.CharField(max_length=255, verbose_name="Багшийн нэвтрэх нэр")
    instructor_availability = models.CharField(
        max_length=50, verbose_name="Багшийн бүртгэл идэвхитэй эсэх"
    )
    instructor_id = models.BigIntegerField(verbose_name="Багшийн ID")
    register = models.CharField(max_length=20, verbose_name="Регистрийн дугаар")
    first_name_mgl = models.CharField(
        max_length=255, verbose_name="Өөрийн нэр /Монгол бичгээр/"
    )
    last_name_mgl = models.CharField(
        max_length=255, verbose_name="Эцэг/эх/ийн нэр /Монгол бичгээр/"
    )
    family_name_mgl = models.CharField(
        max_length=255, verbose_name="Ургийн овог /Монгол бичгээр/"
    )


class Program(TimeAuditModel):

    class Meta:
        verbose_name = "Сургалтын хөтөлбөр"

    program_of_study_id = models.BigIntegerField(
        verbose_name="Сургалтын хөтөлбөрийн код"
    )
    program_of_study_name = models.CharField(
        max_length=255, verbose_name="Сургалтын хөтөлбөрийн нэр"
    )
    program_classification = models.CharField(
        max_length=50, verbose_name="Хөтөлбөрийн ангилал код"
    )
    program_classification_name = models.CharField(
        max_length=255, verbose_name="Хөтөлбөрийн ангилал нэр"
    )
    education_level = models.CharField(
        max_length=100, verbose_name="Боловсролын түвшин код"
    )
    education_level_name = models.CharField(
        max_length=255, verbose_name="Боловсролын түвшин нэр"
    )


class Student(TimeAuditModel):

    class Meta:
        verbose_name = "Сурагч"
        verbose_name_plural = "Сурагчид"

    person_id = models.BigIntegerField(verbose_name="Хүний ID")
    first_name = models.CharField(max_length=255, verbose_name="Өөрийн нэр")
    last_name = models.CharField(max_length=255, verbose_name="Эцэг/эх/ийн нэр")
    date_of_birth = models.DateField(verbose_name="Төрсөн огноо")
    gender_code = models.CharField(max_length=10, verbose_name="Хүйсийн код")
    academic_level = models.CharField(max_length=50, verbose_name="Ангийн код")
    academic_level_name = models.CharField(max_length=255, verbose_name="Ангийн нэр")
    student_group_id = models.BigIntegerField(verbose_name="Бүлгийн код")
    student_group_name = models.CharField(max_length=255, verbose_name="Бүлгийн нэр")
    program_of_study_id = models.BigIntegerField(verbose_name="Сургалтын хөтөлбөр ID")
    program_plan_id = models.BigIntegerField(verbose_name="Сургалтын Төлөвлөгөө ID")
    microsoft_email = models.EmailField(max_length=255, verbose_name="MICROSOFT_EMAIL")
    microsoft_password = models.CharField(
        max_length=255, verbose_name="MICROSOFT_PASSWORD"
    )
    google_email = models.EmailField(
        max_length=255, verbose_name="Сурагчийн цахим хаяг"
    )
    google_password = models.CharField(max_length=255, verbose_name="GOOGLE_PASSWORD")
    primary_nid_number = models.CharField(max_length=50, verbose_name="medle нууц үг")
    program_stage_id = models.BigIntegerField(verbose_name="Түвшин ID")
    academic_year = models.CharField(
        max_length=10, verbose_name="Тухайн хичээлийн жилийн он"
    )
    civil_id = models.BigIntegerField(verbose_name="CIVIL_ID")
    institution_id = models.BigIntegerField(verbose_name="Байгууллагын ID")
    register = models.CharField(
        max_length=20, verbose_name="Сурагчийн регистрийн дугаар"
    )
    first_name_mgl = models.CharField(
        max_length=255, verbose_name="Өөрийн нэр /Монгол бичгээр/"
    )
    last_name_mgl = models.CharField(
        max_length=255, verbose_name="Эцэг/эх/ийн нэр /Монгол бичгээр/"
    )
    family_name_mgl = models.CharField(
        max_length=255, verbose_name="Ургийн овог /Монгол бичгээр/"
    )


class Subject(TimeAuditModel):

    class Meta:
        verbose_name = "Судлагдахуун"
        verbose_name_plural = "Судлагдахууны жагсаалт"

    subject_area_id = models.BigIntegerField(verbose_name="Судлагдахууны ID")
    subject_name = models.CharField(max_length=255, verbose_name="Судлагдахууны нэр")
    subject_name_mgl = models.CharField(
        max_length=255, verbose_name="Судлагдахууны нэр /Монгол бичгээр/"
    )

