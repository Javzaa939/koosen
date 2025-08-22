from django.conf import settings

from ..utils import get_service_template, service_template


def sync_group_list(token=settings.ESIS_TOKEN) -> dict:
    """
    Бүлгийн жагсаалт
    """
    ESIS_URL = "https://hub.esis.edu.mn/svc/api/hub/group/list"
    result = service_template(ESIS_URL, "esis", "Group", "student_group_id", token)
    return result


def sync_teacher_list(token=settings.ESIS_TOKEN) -> dict:
    """
    Багшийн жагсаалт
    """
    esis_url = "https://hub.esis.edu.mn/svc/api/hub/teacher/list"
    app_name = "esis"
    model_name = "Teacher"
    uniq_key = "person_id"
    result = service_template(esis_url, app_name, model_name, uniq_key, token)
    return result


def sync_program_list(token=settings.ESIS_TOKEN) -> dict:
    """
    Сургалтын хөтөлбөрийн жагсаалт
    """
    esis_url = "https://hub.esis.edu.mn/svc/api/hub/program/list"
    app_name = "esis"
    model_name = "Program"
    uniq_key = "program_of_study_id"
    result = service_template(esis_url, app_name, model_name, uniq_key, token)
    return result


def sync_student_list(token=settings.ESIS_TOKEN) -> dict:
    """
    Сурагчийн жагсаалт
    """
    esis_url = "https://hub.esis.edu.mn/svc/api/hub/student/list"
    app_name = "esis"
    model_name = "Student"
    uniq_key = "person_id"
    result = service_template(esis_url, app_name, model_name, uniq_key, token)
    return result


def sync_program_stage(program_of_study_id: int, token: str = settings.ESIS_TOKEN):
    """
    Сургалтын хөтөлбөр түвшингийн жагсаалт
    """

    url = "https://hub.esis.edu.mn/svc/api/hub/program/stage/list/{PROGRAM_OF_STUDY_ID}".format(
        PROGRAM_OF_STUDY_ID=program_of_study_id
    )
    app_name = "esis"
    model_name = "ProgramStage"
    uniq_key = "program_stage_id"
    result = service_template(url, app_name, model_name, uniq_key, token)
    return result


def sync_program_stage_plan(
    program_of_study_id: int, program_stage_id: int, token: str = settings.ESIS_TOKEN
):
    """
    Сургалтын хөтөлбөрийн төлөвлөгөөний жагсаалт
    """

    url = "https://hub.esis.edu.mn/svc/api/hub/program/stage/plan/list/{PROGRAM_OF_STUDY_ID}/{PROGRAM_STATE_ID}".format(
        PROGRAM_OF_STUDY_ID=program_of_study_id,
        PROGRAM_STATE_ID=program_stage_id,
    )
    app_name = "esis"
    model_name = "ProgramStagePlan"
    uniq_key = "program_plan_id"
    result = service_template(url, app_name, model_name, uniq_key, token)
    return result


def sync_course(
    program_of_study_id: int,
    program_stage_id: int,
    program_plan_id: int,
    token: str = settings.ESIS_TOKEN,
):
    """
    Сургалтын хөтөлбөрийн хичээлийн жагсаалт
    """

    url = "https://hub.esis.edu.mn/svc/api/hub/program/stage/plan/course/list/{PROGRAM_OF_STUDY_ID}/{PROGRAM_STATE_ID}/{PROGRAM_PLAN_ID}".format(
        PROGRAM_OF_STUDY_ID=program_of_study_id,
        PROGRAM_STATE_ID=program_stage_id,
        PROGRAM_PLAN_ID=program_plan_id,
    )
    app_name = "esis"
    model_name = "Course"
    uniq_key = "course_id"
    result = service_template(url, app_name, model_name, uniq_key, token)
    return result


def sync_teacher_profile(person_id: int, token: str = settings.ESIS_TOKEN):
    """
    Багшийн ерөнхий мэдээлэл
    """
    url = "https://hub.esis.edu.mn/svc/api/hub/teacher/profile/{person_id}".format(
        person_id=person_id,
    )
    app_name = "esis"
    model_name = "TeacherProfile"
    uniq_key = "person_id"
    result = service_template(url, app_name, model_name, uniq_key, token)
    return result


def get_student_movement_v2(
    begin_date: str,
    token: str = settings.ESIS_TOKEN,
):
    """
    Суралцагчийн шилжилт хөдөлгөөний жагсаалт /Шинэчилсэн/
    """

    url = (
        "https://hub.esis.edu.mn/svc/api/hub/student/movement/v2/:{begin_date}".format(
            begin_date=begin_date,
        )
    )

    app_name = "esis"
    model_name = "Student"

    result = get_service_template(url, app_name, model_name, token)
    if result["status"] == "success":
        return result["data"]
    else:
        return None


def get_teacher_movement_v2(
    begin_date: str,
    token: str = settings.ESIS_TOKEN,
):
    """
    Байгууллагын багшийн шилжилт хөдөлгөөн
    """

    url = (
        "https://hub.esis.edu.mn/svc/api/hub/teacher/movement/v2/:{begin_date}".format(
            begin_date=begin_date,
        )
    )

    result = get_service_template(url, token)
    if result["status"] == "success":
        return result["data"]
    else:
        return None


def get_check_teacher(person_id: int, token: str = settings.ESIS_TOKEN):
    """
    Багш эсэх шалгах
    """
    url = "https://hub.esis.edu.mn/svc/api/hub/teacher/check/:{person_id}".format(
        person_id=person_id,
    )
    result = get_service_template(url, token)
    if result["status"] == "success":
        return result["data"]
    else:
        return None


def get_student_by_group(student_group_id: int, token: str = settings.ESIS_TOKEN):
    """
    Бүлгийн суралцагчийн жагсаалт
    """
    url = "https://hub.esis.edu.mn/svc/api/hub/student/list/:{student_group_id}".format(
        student_group_id=student_group_id,
    )
    app_name = "esis"
    model_name = "Student"
    result = get_service_template(url, app_name, model_name, token)
    if result["status"] == "success":
        return result["data"]
    else:
        return None


def get_year_end_grade(
    student_group_id: int, program_element_id: int, token: str = settings.ESIS_TOKEN
):
    """
    Жилийн эцсийн дүн харах
    """
    url = "https://hub.esis.edu.mn/svc/api/hub/group/list/grade/:{student_group_id}/:{program_element_id}".format(
        student_group_id=student_group_id,
        program_element_id=program_element_id,
    )
    result = get_service_template(url, token)
    if result["status"] == "success":
        return result["data"]
    else:
        return None


def get_grade_schema(grading_schema_id: int, token: str = settings.ESIS_TOKEN):
    """
    Хичээлийн дүнгийн мэдээлэл /Дүнгийн схем/
    """
    url = "https://hub.esis.edu.mn/svc/api/hub/schema/grade/list/:{grading_schema_id}/:{program_element_id}".format(
        grading_schema_id=grading_schema_id,
    )
    result = get_service_template(url, token)
    if result["status"] == "success":
        return result["data"]
    else:
        return None


def get_group_attendance(
    student_group_id: int, day_date: str, token: str = settings.ESIS_TOKEN
):
    """
    Хүүхэд өдрийн ирц харах
    """
    url = "https://hub.esis.edu.mn/svc/api/hub/group/list/attendance/:{student_group_id}/:{day_date}".format(
        student_group_id=student_group_id,
        day_date=day_date,
    )
    result = get_service_template(url, token)
    if result["status"] == "success":
        return result["data"]
    else:
        return None


def get_schema_grade_list(grading_schema_id: int, token: str = settings.ESIS_TOKEN):
    """
    Хичээлийн дүнгийн мэдээлэл /Дүнгийн схем/
    """
    url = "https://hub.esis.edu.mn/svc/api/hub/schema/grade/list/:{grading_schema_id}".format(
        grading_schema_id=grading_schema_id,
    )
    result = get_service_template(url, token)
    if result["status"] == "success":
        return result["data"]
    else:
        return None


def get_day_attendance(
    student_group_id: int, day_date: str, token: str = settings.ESIS_TOKEN
):
    """
    Хүүхэд өдрийн ирц харах
    """
    url = "https://hub.esis.edu.mn/svc/api/hub/group/list/attendance/:{student_group_id}/:{day_date}".format(
        student_group_id=student_group_id,
        day_date=day_date,
    )
    result = get_service_template(url, token)
    if result["status"] == "success":
        return result["data"]
    else:
        return None


def get_attendance_list(
    academic_year: str,
    person_id: int,
    group_id: int,
    session_id: int,
    token: str = settings.ESIS_TOKEN,
):
    """
    Цахим сургалтын ирцийн мэдээлэл
    """
    url = "https://hub.esis.edu.mn/svc/api/hub/attendance/list/:{academic_year}/:{person_id}/:{group_id}/:{session_id}".format(
        academic_year=academic_year,
        person_id=person_id,
        group_id=group_id,
        session_id=session_id,
    )
    result = get_service_template(url, token)
    if result["status"] == "success":
        return result["data"]
    else:
        return None


def get_assignment_2(
    academic_year: str,
    group_id: int,
    token: str = settings.ESIS_TOKEN,
):
    """
    Цахим сургалтын үнэлгээ харах
    """
    url = "https://hub.esis.edu.mn/svc/api/hub/assignment2/list/:{academic_year}/:{group_id}".format(
        academic_year=academic_year,
        group_id=group_id,
    )
    result = get_service_template(url, token)
    if result["status"] == "success":
        return result["data"]
    else:
        return None
