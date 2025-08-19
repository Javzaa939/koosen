from django.db import models

from common.mixins.model_mixins import TimeAuditModel


class Group(TimeAuditModel):

    class Meta:
        verbose_name = "Анги"

    academic_level = models.CharField(
        max_length=255, verbose_name="Ангийн код", null=True, blank=True
    )
    academic_level_name = models.CharField(
        max_length=255, verbose_name="Ангийн нэр", null=True, blank=True
    )

    student_group_id = models.PositiveBigIntegerField(
        verbose_name="Бүлгийн код", null=True, blank=False, unique=True
    )
    program_of_study_id = models.PositiveBigIntegerField(
        verbose_name="Хөтөлбөр ID", null=True, blank=False
    )
    program_stage_id = models.PositiveBigIntegerField(
        verbose_name="Түвшин ID", null=True, blank=False
    )
    program_plan_id = models.PositiveBigIntegerField(
        verbose_name="Төлөвлөгөөний ID", null=True, blank=False
    )

    student_group_name = models.CharField(
        max_length=255, verbose_name="Бүлгийн нэр", null=True, blank=True
    )
    teacher_id = models.PositiveBigIntegerField(
        verbose_name="Анги удирдсан багшийн ID", null=True, blank=False
    )
    teacher_name = models.CharField(
        max_length=255, verbose_name="Анги удирдсан багшийн нэр", null=True, blank=True
    )
    academic_year = models.CharField(
        max_length=255, verbose_name="Тухайн хичээлийн жил", null=True, blank=True
    )


class Teacher(TimeAuditModel):

    class Meta:
        verbose_name = "Багш"

    institution_id = models.BigIntegerField(
        verbose_name="Байгууллагын ID", null=True, blank=False
    )
    person_id = models.BigIntegerField(
        verbose_name="Хүний ID", null=True, blank=False, unique=True
    )
    display_name = models.CharField(
        max_length=255, verbose_name="Багшийн товч нэр", null=True, blank=True
    )
    last_name = models.CharField(
        max_length=255, verbose_name="Эцэг/эх/ийн нэр", null=True, blank=True
    )
    first_name = models.CharField(
        max_length=255, verbose_name="Өөрийн нэр", null=True, blank=True
    )
    date_of_birth = models.CharField(
        max_length=255, verbose_name="Төрсөн огноо", null=True, blank=True
    )
    microsoft_email = models.EmailField(
        max_length=255, verbose_name="Багшийн цахим хаяг", null=True, blank=True
    )
    google_email = models.EmailField(
        max_length=255, verbose_name="Багшийн цахим хаяг", null=True, blank=True
    )
    all_email = models.TextField(verbose_name="Бүх цахим хаяг", null=True, blank=True)
    assignment_name = models.CharField(
        max_length=255, null=True, blank=True, verbose_name="Багшийн албан тушаал"
    )
    instructor_type_id = models.IntegerField(
        verbose_name="Багшийн төрлийн ID", null=True, blank=False
    )
    type_name = models.CharField(
        max_length=255, verbose_name="Төрөл", null=True, blank=True
    )
    academic_organization_id = models.BigIntegerField(
        verbose_name="Заах аргын нэгдлийн ID", null=True, blank=False
    )
    academic_org_name = models.CharField(
        max_length=255, verbose_name="Заах аргын нэгдлийн нэр", null=True, blank=True
    )
    username = models.CharField(
        max_length=255, verbose_name="Багшийн нэвтрэх нэр", null=True, blank=True
    )
    instructor_availability = models.CharField(
        max_length=50,
        verbose_name="Багшийн бүртгэл идэвхитэй эсэх",
        null=True,
        blank=True,
    )
    instructor_id = models.BigIntegerField(
        verbose_name="Багшийн ID", null=True, blank=False
    )
    register = models.CharField(
        max_length=20, verbose_name="Регистрийн дугаар", null=True, blank=True
    )
    first_name_mgl = models.CharField(
        max_length=255,
        verbose_name="Өөрийн нэр /Монгол бичгээр/",
        null=True,
        blank=True,
    )
    last_name_mgl = models.CharField(
        max_length=255,
        verbose_name="Эцэг/эх/ийн нэр /Монгол бичгээр/",
        null=True,
        blank=True,
    )
    family_name_mgl = models.CharField(
        max_length=255,
        verbose_name="Ургийн овог /Монгол бичгээр/",
        null=True,
        blank=True,
    )


class Program(TimeAuditModel):

    class Meta:
        verbose_name = "Сургалтын хөтөлбөр"

    program_of_study_id = models.BigIntegerField(
        verbose_name="Сургалтын хөтөлбөрийн код",
        null=True,
        blank=False,
        unique=True,
    )
    program_of_study_name = models.CharField(
        max_length=255, verbose_name="Сургалтын хөтөлбөрийн нэр", null=True, blank=True
    )
    program_classification = models.CharField(
        max_length=50, verbose_name="Хөтөлбөрийн ангилал код", null=True, blank=True
    )
    program_classification_name = models.CharField(
        max_length=255, verbose_name="Хөтөлбөрийн ангилал нэр", null=True, blank=True
    )
    education_level = models.CharField(
        max_length=100, verbose_name="Боловсролын түвшин код", null=True, blank=True
    )
    education_level_name = models.CharField(
        max_length=255, verbose_name="Боловсролын түвшин нэр", null=True, blank=True
    )


class Student(TimeAuditModel):

    class Meta:
        verbose_name = "Сурагч"
        verbose_name_plural = "Сурагчид"

    person_id = models.BigIntegerField(
        verbose_name="Хүний ID", null=True, blank=False, unique=True
    )
    first_name = models.CharField(
        max_length=255, verbose_name="Өөрийн нэр", null=True, blank=True
    )
    last_name = models.CharField(
        max_length=255, verbose_name="Эцэг/эх/ийн нэр", null=True, blank=True
    )
    date_of_birth = models.CharField(
        max_length=255, verbose_name="Төрсөн огноо", null=True, blank=True
    )
    gender_code = models.CharField(
        max_length=10, verbose_name="Хүйсийн код", null=True, blank=True
    )
    academic_level = models.CharField(
        max_length=50, verbose_name="Ангийн код", null=True, blank=True
    )
    academic_level_name = models.CharField(
        max_length=255, verbose_name="Ангийн нэр", null=True, blank=True
    )
    student_group_id = models.BigIntegerField(
        verbose_name="Бүлгийн код", null=True, blank=False
    )
    student_group_name = models.CharField(
        max_length=255, verbose_name="Бүлгийн нэр", null=True, blank=True
    )
    program_of_study_id = models.BigIntegerField(
        verbose_name="Сургалтын хөтөлбөр ID", null=True, blank=False
    )
    program_plan_id = models.BigIntegerField(
        verbose_name="Сургалтын Төлөвлөгөө ID", null=True, blank=False
    )
    microsoft_email = models.EmailField(
        max_length=255, verbose_name="MICROSOFT_EMAIL", null=True, blank=True
    )
    microsoft_password = models.CharField(
        max_length=255, verbose_name="MICROSOFT_PASSWORD", null=True, blank=True
    )
    google_email = models.EmailField(
        max_length=255, verbose_name="Сурагчийн цахим хаяг", null=True, blank=True
    )
    google_password = models.CharField(
        max_length=255, verbose_name="GOOGLE_PASSWORD", null=True, blank=True
    )
    primary_nid_number = models.CharField(
        max_length=50, verbose_name="medle нууц үг", null=True, blank=True
    )
    program_stage_id = models.BigIntegerField(
        verbose_name="Түвшин ID", null=True, blank=False
    )
    academic_year = models.CharField(
        max_length=10, verbose_name="Тухайн хичээлийн жилийн он", null=True, blank=True
    )
    civil_id = models.BigIntegerField(verbose_name="CIVIL_ID", null=True, blank=False)
    institution_id = models.BigIntegerField(
        verbose_name="Байгууллагын ID", null=True, blank=False
    )
    register = models.CharField(
        max_length=20, verbose_name="Сурагчийн регистрийн дугаар", null=True, blank=True
    )
    first_name_mgl = models.CharField(
        max_length=255,
        verbose_name="Өөрийн нэр /Монгол бичгээр/",
        null=True,
        blank=True,
    )
    last_name_mgl = models.CharField(
        max_length=255,
        verbose_name="Эцэг/эх/ийн нэр /Монгол бичгээр/",
        null=True,
        blank=True,
    )
    family_name_mgl = models.CharField(
        max_length=255,
        verbose_name="Ургийн овог /Монгол бичгээр/",
        null=True,
        blank=True,
    )


class Subject(TimeAuditModel):

    class Meta:
        verbose_name = "Судлагдахуун"
        verbose_name_plural = "Судлагдахууны жагсаалт"

    subject_area_id = models.BigIntegerField(
        verbose_name="Судлагдахууны ID", null=True, blank=False, unique=True
    )
    subject_name = models.CharField(
        max_length=255, verbose_name="Судлагдахууны нэр", null=True, blank=True
    )
    subject_name_mgl = models.CharField(
        max_length=255,
        verbose_name="Судлагдахууны нэр /Монгол бичгээр/",
        null=True,
        blank=True,
    )


class ProgramStage(TimeAuditModel):
    class Meta:
        verbose_name = "Сургалтын хөтөлбөрийн түвшин"

    program_stage_id = models.BigIntegerField(
        verbose_name="Сургалтын төлөвлөгөөний үе шатын код",
        # null=True,
        # blank=True,
        unique=True,
    )
    program_of_study_id = models.BigIntegerField(
        verbose_name="Сургалтын хөтөлбөрийн код", null=True
    )
    last_stage_flag = models.CharField(
        max_length=255, verbose_name="Хөтөлбөрийн ангилал код", null=True, blank=True
    )
    academic_level = models.CharField(
        max_length=255, verbose_name="Ангийн код", null=True, blank=True
    )
    program_stage_name = models.CharField(
        max_length=255,
        verbose_name="Сургалтын төлөвлөгөөний үе шатын нэр",
        null=True,
        blank=True,
    )


class ProgramStagePlan(TimeAuditModel):

    class Meta:
        verbose_name = "Сургалтын хөтөлбөрийн төлөвлөгөө"

    program_plan_id = models.BigIntegerField(
        verbose_name="Сургалтын төлөвлөгөөний код",
        null=True,
        unique=True,
    )
    program_stage_id = models.BigIntegerField(
        verbose_name="Сургалтын төлөвлөгөөний үе шатын код",
        null=True,
    )
    program_of_study_id = models.BigIntegerField(
        verbose_name="Сургалтын хөтөлбөрийн код",
        null=True,
    )
    program_plan_name = models.CharField(
        max_length=255,
        verbose_name="Сургалтын төлөвлөгөөний нэр",
        null=True,
        blank=True,
    )
    program_plan_type = models.CharField(
        max_length=255,
        verbose_name="Сургалтын төлөвлөгөөний төрөл",
        null=True,
        blank=True,
    )
    plan_type_name = models.CharField(
        max_length=255,
        verbose_name="Сургалтын төлөвлөгөөний төрөл нэр",
        null=True,
        blank=True,
    )
    degree_id = models.IntegerField(
        verbose_name="Боловсролын зэргийн код",
        null=True,
    )
    degree_name = models.CharField(
        max_length=255, verbose_name="Боловсролын зэргийн нэр", null=True, blank=True
    )


class Course(TimeAuditModel):

    class Meta:
        verbose_name = "Хичээл"

    course_id = models.BigIntegerField(
        verbose_name="Хичээлийн код", null=True, unique=True
    )
    course_name = models.CharField(
        max_length=255, verbose_name="Хичээлийн нэр", null=True, blank=True
    )
    enrollment_category = models.CharField(
        max_length=255, verbose_name="Хичээл судлах төрөл код", null=True, blank=True
    )
    enrollment_category_name = models.CharField(
        max_length=255, verbose_name="Хичээл судлах төрөл нэр", null=True, blank=True
    )
    program_element_id = models.BigIntegerField(
        verbose_name="Хөтөлбөрийн элементийн код", null=True
    )
    program_stage_id = models.BigIntegerField(
        verbose_name="Сургалтын хөтөлбөрийн үе шатын код", null=True
    )
    program_plan_id = models.BigIntegerField(
        verbose_name="Сургалтын төлөвлөгөөний код", null=True
    )
    program_of_study_id = models.BigIntegerField(
        verbose_name="Сургалтын хөтөлбөрийн код", null=True
    )
    subject_area_id = models.BigIntegerField(
        verbose_name="Судлагдахууны код", null=True
    )
    subject_area_name = models.CharField(
        max_length=255, verbose_name="Судлагдахууны нэр", null=True, blank=True
    )
    course_contact_hours = models.IntegerField(
        verbose_name="Элементийн багц цаг", null=True
    )
    avg_contact_hours = models.IntegerField(
        verbose_name="Долоо хоногт орох дундаж цаг", null=True
    )
    grading_scheme_id = models.BigIntegerField(
        verbose_name="Дүнгийн схемийн код", null=True
    )
    grading_scheme_name = models.CharField(
        max_length=255, verbose_name="Дүнгийн схемийн нэр", null=True, blank=True
    )
    course_classification = models.CharField(
        max_length=10, verbose_name="Хичээлийн ангилал", null=True, blank=True
    )
    course_classification_name = models.CharField(
        max_length=255, verbose_name="Хичээлийн ангилал нэр", null=True, blank=True
    )


class TeacherProfile(TimeAuditModel):
    person_id = models.BigIntegerField(
        verbose_name="Хэрэглэгчийн ID", null=True, unique=True
    )
    institution_id = models.BigIntegerField(verbose_name="Байгууллагын ID", null=True)
    job_code = models.CharField(
        max_length=50, verbose_name="Ажлын код", null=True, blank=True
    )
    job_name = models.CharField(
        max_length=255, verbose_name="Ажлын нэр", null=True, blank=True
    )

    total = models.CharField(
        max_length=255, verbose_name="Нийт ажилласан жил", null=True, blank=True
    )
    edu = models.CharField(
        max_length=255,
        verbose_name="Боловсролын салбарт ажилласан жил",
        null=True,
        blank=True,
    )
    current_job = models.CharField(
        verbose_name="Тухайн ажил мэргэжлээр ажилласан жил",
        null=True,
        blank=True,
        max_length=255,
    )
    current_org = models.CharField(
        verbose_name="Тухайн байгууллагад ажилласан жил",
        null=True,
        blank=True,
        max_length=255,
    )
    servant = models.CharField(
        verbose_name="Төрийн албанд ажилласан жил",
        null=True,
        blank=True,
        max_length=255,
    )
    real_servant = models.CharField(
        verbose_name="ТЖА-нд ажилласан жил", null=True, blank=True, max_length=255
    )
    high_edu = models.CharField(
        verbose_name="Дээд боловсролын салбарт ажилласан жил", null=True, max_length=255
    )

    assignment_name = models.CharField(
        max_length=255, verbose_name="Албан тушаалын нэр", null=True, blank=True
    )
    type_name = models.CharField(
        max_length=255, verbose_name="Ажил эрхлэлийн төрөл", null=True, blank=True
    )
    academic_organization_id = models.BigIntegerField(
        verbose_name="Академик байгууллагын ID", null=True
    )
    academic_org_name = models.CharField(
        max_length=255, verbose_name="Академик байгууллагын нэр", null=True, blank=True
    )

    microsoft_email = models.CharField(
        verbose_name="Албаны цахим шуудан (Medle)",
        null=True,
        blank=True,
        max_length=255,
    )
    google_email = models.CharField(
        verbose_name="Албаны цахим шуудан (Google)",
        null=True,
        blank=True,
        max_length=255,
    )
    username = models.CharField(
        max_length=255, verbose_name="Нэвтрэх нэр", null=True, blank=True
    )

    date_of_birth = models.CharField(
        verbose_name="Төрсөн өдөр", null=True, blank=True, max_length=255
    )
    gender_code = models.CharField(
        max_length=100, verbose_name="Хүйс", null=True, blank=True
    )
    phone_number = models.CharField(
        max_length=20, verbose_name="Утасны дугаар", null=True, blank=True
    )
    last_name = models.CharField(
        max_length=100, verbose_name="Овог", null=True, blank=True
    )
    first_name = models.CharField(
        max_length=100, verbose_name="Нэр", null=True, blank=True
    )
    aimag_city_name = models.CharField(
        max_length=100, verbose_name="Хот/Аймаг", null=True, blank=True
    )
    soum_district_name = models.CharField(
        max_length=100, verbose_name="Сум/Дүүрэг", null=True, blank=True
    )
    education_name = models.CharField(
        max_length=255, verbose_name="Боловсролын түвшин", null=True, blank=True
    )
