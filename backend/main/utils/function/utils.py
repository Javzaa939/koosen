import json
import math
import time

from datetime import date

from random import randint
from crontab import CronTab

from io import BytesIO
import PIL.Image as Image

from django.apps import apps
from django.conf import settings
from django.db import connections

from django.db.models import PositiveIntegerField
from django.db.models.functions import Cast

from datetime import datetime, timedelta
from django.db.models import Q
from django.db.models import CharField
from django.db.models import DateTimeField

from django.db.models.query import QuerySet

from django.shortcuts import get_object_or_404
from django.shortcuts import reverse
from operator import or_
from functools import reduce

def list_to_dict(data):
    """ List датаг Dict рүү хөрвүүлэх """

    extract_data = json.dumps(data)
    parsed_data = json.loads(extract_data)
    return parsed_data


def check_datetime(input_datetime):
    """ datetime төрөлтэй эсэх """
    is_datetime = True
    if not isinstance(input_datetime, datetime):
        is_datetime = False

    return is_datetime


def fix_format_date(input_date, format='%Y-%m-%d %H:%M:%S'):
    """ Date format хөрвүүлэх """

    date_data = ''

    is_date = check_datetime(input_date)

    if is_date:
        date_data = input_date.strftime(format)

    return date_data


def time_tango(date, time):
    """ Date болон цаг нийлүүлэх """

    return datetime.combine(date, time)


def str2bool(v):
    """ string утгыг boolean рүү хувиргах """

    return v.lower() in ("yes", "true", "t", "1", "True")


def null_to_none(datas):
    """ str null утгыг None руу хөрвүүлэх """

    for key, value in datas.items():
        if isinstance(value, str):
            if value == 'null':
                datas[key] = None

    return datas


def remove_key_from_dict(input_dict, keys):
    """ Dict-ээс key ашиглаж дата устгах """

    if isinstance(keys, list):
        for key in keys:
            del input_dict[key]
    else:
        del input_dict[keys]

    return input_dict


def _filter_queries(model, search_item='', fields=[]):
    """ field өгсөн байвал field-с өгөөгүй бол model-ийн field-н утгаар хайна """

    if not search_item:
        return model

    if len(fields) > 0:
        queries = [Q(**{f + "__icontains": search_item}) for f in fields if f]
    else:
        char_fields = [f for f in model._meta.fields if isinstance(f, CharField)]
        date_fields = [f for f in model._meta.fields if isinstance(f, DateTimeField)]
        fields = char_fields + date_fields

    qs = Q()
    for query in queries:
        qs = qs | query

    filtered_qs = model.filter(qs)
    return filtered_qs


def filter_queries(model, search_item=''):
    """ Моделийн бүр field -ээс хайлтын утгаар хайна """

    if not search_item:
        return model.objects

    char_fields = [f for f in model._meta.fields if isinstance(f, CharField)]
    date_fields = [f for f in model._meta.fields if isinstance(f, DateTimeField)]
    fields = char_fields + date_fields

    queries = [Q(**{f.name + "__icontains": search_item}) for f in fields]

    qs = Q()
    for query in queries:
        qs = qs | query

    filtered_qs = model.filter(qs)
    return filtered_qs


def override_get_queryset(self):
    """ Хайлт болон эрэмблэлттэй жагсаалт гаргах үед queryset буцаана """

    queryset = self.queryset
    search_value = self.request.query_params.get('search')
    sorting = self.request.query_params.get('sorting')
    schoolId = self.request.query_params.get('schoolId')
    lesson_year =  self.request.query_params.get('lesson_year')
    lesson_season = self.request.query_params.get('lesson_season')
    lesson = self.request.query_params.get('lesson')
    school = self.request.query_params.get('school')
    department = self.request.query_params.get('department')
    if isinstance(queryset, QuerySet):
        queryset = queryset.all()

    # Хайлт хийх үед ажиллана.
    if search_value:
        queryset = filter_queries(queryset.model, search_value)

    # Сургуулиар хайх
    if schoolId:
        queryset=queryset.filter(school_id=schoolId)

    if school:
        queryset=queryset.filter(school=school)

    # Хичээлийн жилээр хайлт хийх
    if lesson_year:
        queryset = queryset.filter(lesson_year=lesson_year)

    # Хичээлийн улиралаар хайлт хийх
    if lesson_season:
        queryset = queryset.filter(lesson_season=lesson_season)

    # Хичээлээр хайлт хийх
    if lesson:
        queryset = queryset.filter(lesson=lesson)

    # Тэнхимээр хайлт хийх
    if department:
        queryset = queryset.filter(department=department)

    # Sort хийх үед ажиллана
    if sorting:
        if not isinstance(sorting, str):
            sorting = str(sorting)

        queryset = queryset.order_by(sorting)

    return queryset

def default_rsp():
    rsp = {
        'success': False,
        'error': ''
    }

    return rsp


def json_load(data):
    if isinstance(data, str):
        data = json.loads(data)
    return data


def json_dumps(data):
    if isinstance(data, dict) or isinstance(data, list):
        data = json.dumps(data, ensure_ascii=False)
    return data


def generate_random_numbers(n):
    """ Random digit N number """

    range_start = 10 ** (n - 1)
    range_end = (10 ** n) - 1

    return randint(range_start, range_end)


def get_user_permissions(user):
    """ Хэрэглэгчийн бүх эрхийг авах
        RETURN list
    """

    Employee = apps.get_model('core', 'Employee')
    Permissions = apps.get_model('core', 'Permissions')
    emp_list = Employee.objects.filter(user=user,state=Employee.STATE_WORKING).first()

    permissions = []

    if user.is_superuser:
        permissions = list(Permissions.objects.all().filter(name__startswith='lms').values_list('name', flat=True))

    elif emp_list and not user.is_superuser:
        permissions = list(emp_list.org_position.roles.values_list("permissions__name", flat=True))
        removed_perms = list(emp_list.org_position.removed_perms.values_list("name", flat=True))
        permissions = permissions + list(emp_list.org_position.permissions.values_list("name", flat=True))

        removed_perms = set(removed_perms)
        permissions = set(permissions)
        permissions = permissions.difference(removed_perms)

    return list(permissions)


def has_permission(allowed_permissions=[], must_permissions=[], back_url=None):
    """ Хэрэглэгчийн эрх дунд зөвшөөрөгдсөн эрх байгаа эсэхийг шалгах нь
        allowed_permissions = аль нэг эрх нь байхад л зөвшөөрнө гэж үзнэ
        must_permissions = бүх эрх нь байж байж л зөвшөөрөгдөнө
    """
    def decorator(view_func):

        def wrap(self, request, *args, **kwargs):

            permissions = []
            if request.user:
                permissions = get_user_permissions(request.user)

            if permissions:
                def check_allowed_perm():
                    """ Аль нэг эрх нь байгааг шалгах """
                    check = any(item in permissions for item in allowed_permissions)
                    return check

                def check_must_perm():
                    """ Бүх эрх нь байгааг шалгах """
                    check = all(item in permissions for item in must_permissions)
                    return check

            has_perm = False

            if allowed_permissions:
                has_perm = check_allowed_perm()

            if must_permissions:
                has_perm = check_must_perm()

            if not has_perm:
                request.send_error("ERR_011", "Хэрэглэгч эрхгүй байна.")

            return view_func(self, request, *args, **kwargs)

        return wrap

    return decorator


def get_fullName(firstName='', lastName="", is_dot=True, is_strim_first=False):
    """ return fullName
        firstName: Эхэнд бичигдэх нэр
        lastName: Сүүлд бичигдэх нэр
        is_dot: Дунд нь цэг байх эсэх
        is_strim_first: Эхний нэрний эхний үсгийг авах эсэх
    """

    full_name = ''

    if is_strim_first:
        if len(firstName)>0:
            firstName = firstName[0]

    if firstName:
        full_name += firstName

    if is_dot:
        full_name += '. '
    else:
        full_name += ' '

    if lastName:
        full_name += lastName

    return full_name


def get_error_obj(msg='', field=""):
    """ Input error мессеж буцаадаг хэсгийг return"""
    errors = []
    if field:
        return_error = {
            "field": field,
            "msg": msg
        }
        errors.append(return_error)

    return errors

def get_lesson_choice_student(lesson='', teacher='', school='',lesson_year='', lesson_season='', group=''):
    """ Хичээл сонголт харуулах function """

    TimeTable = apps.get_model('lms', 'TimeTable')
    TimeTable_to_group = apps.get_model('lms', 'TimeTable_to_group')
    TimeTable_to_student = apps.get_model('lms', 'TimeTable_to_student')
    Student = apps.get_model('lms', 'Student')
    StudentRegister = apps.get_model('lms', 'StudentRegister')
    status = StudentRegister.objects.filter(Q(Q(name__contains='Суралцаж буй') | Q(code=1))).first()
    all_student = []

    timetable = TimeTable.objects.all()

    if not lesson_season and not lesson_year:
        return all_student

    if school:
        timetable = timetable.filter(school=school)

    # Тухайн хичээлийн идэвхтэй жилийн хичээлийн хуваарь
    timetable = timetable.filter(lesson_year=lesson_year, lesson_season=lesson_season, lesson=lesson)

    # Багшаар хайх хэсэг
    if teacher:
        timetable = timetable.filter(teacher=teacher)

    timetable_id = timetable.values_list('id',flat=True)

    # Хичээлийн хуваарийн ангиуд
    timetable_group = TimeTable_to_group.objects.filter(timetable__in=timetable_id)

    if group:
        timetable_group = timetable_group.filter(group=group)

    # Хуваарьтай ангийн ids
    timetable_group_id = timetable_group.values_list('group', flat=True)

    # Тухайн хичээлийн хуваарь дээр нэмэлтээр үзэж байгаа оюутнууд
    timetable_student1 = TimeTable_to_student.objects.filter(timetable__in=timetable_id, add_flag=True)

    # Ангиар хайх хэсэг
    if group:
        timetable_student1 = timetable_student1.filter(student__group=group)

    # Нэмэлтээр үзэж байгаа оюутны ids
    timetable_student1_id = timetable_student1.values_list('student', flat=True)

    # Тухайн хичээлийн хуваарь дээр хасалт хийлгэсэн оюутнууд
    timetable_student2 = TimeTable_to_student.objects.filter(timetable__in=timetable_id, add_flag=False)

    # Хасалт хийлгэсэн оюутны ids
    timetable_student2_id = timetable_student2.values_list('student', flat=True)

    qs_student = Student.objects.all()

    # Сургуулиар хайлт хийх хэсэг
    if school:
        qs_student = qs_student.filter(school=school)

    # Тухайн хуваарь дээр хичээл үзэж байгаа ангийн оюутнууд бас нэмэлтээр үзэж байгаа оюутнууд
    group_student = qs_student.filter(Q(group__in = timetable_group_id) | Q(id__in=timetable_student1_id)).filter(status=status)

    # Тухайн хуваарь дээр хасалт хийлгэсэн оюутнуудыг хасах хэсэг
    all_student = group_student.exclude(id__in =timetable_student2_id)

    return all_student

def get_schedule(lesson_year = '', school = '' , lesson_season = '' , room = '' , student = '', group = '', teacher = '', lesson = ''):
    """ Хичээл Хуваарь харуулах function """

    TimeTable = apps.get_model('lms', 'TimeTable')
    TimeTable_to_group = apps.get_model('lms', 'TimeTable_to_group')
    TimeTable_to_student = apps.get_model('lms', 'TimeTable_to_student')
    Student = apps.get_model('lms', 'Student')
    StudentRegister = apps.get_model('lms', 'StudentRegister')

    schedule = []

    if not school or not lesson_season or not lesson_year :
        return schedule

    timetable = TimeTable.objects.filter(lesson_year=lesson_year, lesson_season=lesson_season, school=school)

    # Багшаар хайлт хийх хэсэг
    if teacher:
        timetable = timetable.filter(teacher=teacher)

    # Өрөөгөөр хайлт хийх хэсэг
    if room:
        timetable = timetable.filter(room=room)

    # Оюутнаар хайлт хийх хэсэг
    if student:
        timetable = timetable.filter(student=student)

    # Хичээлээр хайлт хийх хэсэг
    if lesson:
        timetable = timetable.filter(lesson=lesson)

    # Ангиар хайлт хийх хэсэг
    if group:
        timetable_group = timetable_group.filter(group=group)

    # Хайлтын үр дүнгээс гарсан хичээлийн хуваарийн ids
    timetable_ids = timetable.values_list('id',flat=True)

    # Тухайн хайлт хийсэн хуваарьтай ангийн мэдээлэл
    timetable_group = TimeTable_to_group.objects.filter(timetable__in=timetable_ids)

    # Тухайн хайлт хийсэн хуваарьтай ангийн ids
    timetable_group_ids = timetable_group.values_list('group', flat=True)

    # Хайлтын үр дүнгээс гарсан хичээлийн хуваарийг нэмэлтээр үзэж байгаа оюутны мэдээлэл
    timetable_student1 = TimeTable_to_student.objects.filter(timetable__in=timetable_ids, add_flag=True)

    # Ангиар хайлт хийсэн байвал нэмэлтээр үзэж байгаа оюутны ангиар хайлт хийх хэсэг
    if group:
        timetable_student1 = timetable_student1.filter(student__group=group)

    # Нэмэлтээр үзэж байгаа оюутны ids
    timetable_student1_ids = timetable_student1.values_list('student', flat=True)

    # Хайлтын үр дүнгээс гарсан хичээлийн хуваариас хасалт хийлгэсэн оюутны мэдээлэл
    timetable_student2 = TimeTable_to_student.objects.filter(timetable__in =timetable_ids, add_flag=False)

    # Хасалт хийлгэсэн оюутнуудын ids
    timetable_student2_id = timetable_student2.values_list('student', flat=True)

    status = StudentRegister.objects.filter(name__contains='Суралцаж буй').first()

    # Тухайн хуваарийг үзэж байгаа ангийн оюутнууд
    group_student = Student.objects.exclude(Q(id__in=timetable_student2_id)).filter(status=status).filter(Q(group__in=timetable_group_ids, school=school)).values_list('id', flat=True)

    # Тухайн хуваарийг нэмэлтээр үзэж байгаа ангийн оюутнууд
    add_student = Student.objects.filter(id__in=list(timetable_student1_ids), school=school).values_list('id', flat=True)

    # Оюутны мэдээллийг нэгтгэж байгаа хэсэг
    schedule = add_student.union(group_student)

    return schedule

def get_connection_db():
    db = get_primary_db_name()
    return connections[db]


def get_primary_db_name():
    primary_db = 'default'
    if settings.DEBUG:
        return primary_db

    for db_name in settings.DATABASES:
        try:
            sql = """
                SELECT pg_is_in_recovery()
            """
            cursor = connections[db_name].cursor()
            cursor.execute(sql)
            value = cursor.fetchone()

            is_read_only = value[0]
            if not is_read_only:
                primary_db = db_name
                break

        except:
            pass

    return primary_db


def get_teacher_queryset():
    """ Бүх хэрэглэгчдээс багш төлөвтэй хэрэглэгчийг л авах хэсэг
        return querysets
    """

    Teacher = apps.get_model('core', 'Teachers')
    Employee = apps.get_model('core', 'Employee')

    queryset = Teacher.objects.all().filter(action_status=Teacher.APPROVED).order_by('id')

    teacher_queryset = queryset.values_list('user', flat=True)
    qs_employee_user = Employee.objects.filter(user_id__in=list(teacher_queryset), state=Employee.STATE_WORKING, org_position__is_teacher=True).values_list('user', flat=True)
    if len(qs_employee_user) > 0:
        queryset = queryset.filter(user_id__in = list(qs_employee_user))
        #sub_org__isnull=False  Дараа нь багшийн бүртгэл бүтэн болох үед ажиллана

    return queryset



def get_weekday_kurats_date(kurats_start_date, kurats_end_date):
    """ Курац хуваарийн эхлэх өдрөөс 7 хоногийн хэд дэх өдрийг авах
        хичээлийн хэд дэх 7 хоног гэдгийг буцаана
        return list
    """

    # Тухайн хичээлийн жилийн 16 7 хоног
    weeks = get_16week_start_date()

    ksdatetime = datetime.strptime(kurats_start_date, '%Y-%m-%d')
    kedatetime = datetime.strptime(kurats_end_date, '%Y-%m-%d')

    # Курацын эхлэх дуусах өдрүүдийн хооронд дох өдрүүд
    kdelta = kedatetime - ksdatetime
    kurats_day_list = []

    for week in weeks:
        start_date =  datetime.strptime(week.get('start_date'), '%Y-%m-%d')
        end_date = datetime.strptime(week.get('end_date'), '%Y-%m-%d')

        delta = end_date - start_date

        for i in range(delta.days + 1):
            day = start_date + timedelta(days=i)

            for j in range(kdelta.days + 1):
                kweek_kurats = {}
                kday = ksdatetime + timedelta(days=j)
                weekday = kday.weekday() + 1

                if day == kday:
                    kweek_kurats['weekNum'] = week.get('id')
                    kweek_kurats['weekday'] = weekday
                    kurats_day_list.append(kweek_kurats)

    return kurats_day_list


def hex_to_rgb(value):
    value = value.lstrip('#')
    lv = len(value)

    return tuple(int(value[i:i + lv // 3], 16) for i in range(0, lv, lv // 3))


def isLightOrDark(color):
    rgbColor = list(hex_to_rgb(color))

    [r, g, b] = rgbColor
    hsp = math.sqrt(0.299 * (r * r) + 0.587 * (g * g) + 0.114 * (b * b))

    if hsp > 127.5:
        return 'black'
    else:
        return 'white'


def get_student_score_register(student_id, season='', lesson_year = '',):
    """ student_id өгч сурагчийн голч дүн хэдэн кридэт үзсэнийг буцаана
    """

    total_kr = 0
    total_score = 0
    score_obj = dict()

    ScoreRegister = apps.get_model('lms', 'ScoreRegister')
    Score = apps.get_model('lms', 'Score')

    filter = {
        'student__id': student_id,
        'lesson_year__contains': lesson_year,
    }

    if season:
        filter['lesson_season__season_code'] = season

    stud_score_info = ScoreRegister.objects.filter(
        **filter
    )

    if stud_score_info:

        for score_data in stud_score_info:
            score = score_data.score_total
            total_kr = total_kr + score_data.lesson.kredit
            total_score = total_score + score * score_data.lesson.kredit

        average = total_score / total_kr

        score_obj = Score.objects.filter(score_max__gte=average, score_min__lte=average).values("assesment", 'gpa').last()

    return (
    {
        'total_kr': total_kr,
        'total_score': total_score,
        'score_obj': score_obj
    })


def get_domain_url():
    """ domain url авах """

    if settings.DEBUG is False:
        domain_url = 'http://sis.uia.gov.mn'
    else:
        domain_url = 'http://localhost:8000'

    return domain_url


def get_position(user):
    """ Хэрэглэгчийн албан тушаал буцаана """

    position_id = ''
    User = apps.get_model('core', 'User')
    Employee = apps.get_model('core', 'Employee')

    get_object_or_404(User, id=user)

    org = Employee.objects.filter(user=user, state=Employee.STATE_WORKING).first()

    if org and org.org_position:
        position_id = org.org_position.id

    return position_id


def get_menu_unit(menu_id):
    ''' Тухайн цэсний шийдвэрлэх нэгжүүдийг буцаана '''

    c_menu_list = []
    Complaint_unit = apps.get_model('lms', 'Complaint_unit')

    c_queryset = Complaint_unit.objects.all().annotate(my_season=Cast('unit', PositiveIntegerField())).order_by('unit')
    all_values = c_queryset.values('menus', 'id', 'unit')

    for jvalues in all_values:
        jmenus = json_load(jvalues.get('menus'))
        c_unit_id = jvalues.get('unit')
        j_id = jvalues.get('id')

        c_obj = c_queryset.filter(id=j_id).first()
        unit_name = c_obj.get_unit_display()

        for jmenus_dict in jmenus if jmenus else []:
            for key in jmenus_dict:
                if jmenus_dict[key] == menu_id:
                    c_menu_data = {}

                    c_menu_data['id'] = c_unit_id
                    c_menu_data['name'] = unit_name

                    c_menu_list.append(c_menu_data)

    return c_menu_list


def get_unit_user(user):
    """ Хэрэглэгчийн албан тушаалд хамаарагдах шийдвэрлэх нэгжийг буцаана """

    c_units =[]
    Complaint_unit = apps.get_model('lms', 'Complaint_unit')

    c_queryset = Complaint_unit.objects.all()

    position_id = get_position(user)

    if not position_id:
        return c_units

    units = c_queryset.filter(position=position_id).values('unit', 'id')

    for unit in units:
        c_data = {}
        c_id = unit.get('id')
        unit_id = unit.get('unit')

        c_obj = c_queryset.filter(id=c_id).first()
        unit_name = c_obj.get_unit_display()

        c_data['unit_id'] = unit_id
        c_data['unit_name'] = unit_name

        c_units.append(c_data)

    return c_units


def get_16week_start_date():
    ''' Хичээл эхлэх өдрөөс 16н 7 хоногийг тооцоолох
        return list
    '''
    week_list = []

    SystemSettings = apps.get_model('lms', 'SystemSettings')
    qs_activeyear = SystemSettings.objects.filter(season_type=SystemSettings.ACTIVE).first()

    if qs_activeyear:
        end_date = qs_activeyear.start_date


        for x in range(25):
            obj_datas = {}
            start_date  = end_date

            end_date = start_date + timedelta(days=7)
            enddate = end_date - timedelta(days=1)
            obj_datas['id'] = x + 1
            obj_datas['start_date'] = start_date.strftime('%Y-%m-%d')
            obj_datas['end_date'] = enddate.strftime('%Y-%m-%d')

            week_list.append(obj_datas)

    return week_list


def get_week_num_from_date(current_date=datetime.today().strftime('%Y-%m-%d')):
    """ Хэддэх 7 хоног вэ гэдгийг буцаана
        return int
    """

    weeks = get_16week_start_date()

    weekNum = ''

    for week in weeks:
        start_date =  datetime.strptime(week.get('start_date'), '%Y-%m-%d')
        end_date = datetime.strptime(week.get('end_date'), '%Y-%m-%d')

        delta = end_date - start_date

        for i in range(delta.days + 1):
            day = start_date + timedelta(days=i)
            cday = day.strftime('%Y-%m-%d')
            if cday == current_date:
                weekNum = week.get('id')

    return weekNum

def get_dates_from_week():
    week = get_week_num_from_date()
    weeks = get_16week_start_date()


    for day_week in weeks:
        if day_week.get('id') == week:
            return day_week


def get_active_year_season():
    """ Идэвхтэй хичээлийн жил """

    SystemSettings = apps.get_model('lms', 'SystemSettings')
    qs_activeyear = SystemSettings.objects.filter(season_type=SystemSettings.ACTIVE).first()

    year = qs_activeyear.active_lesson_year.strip() if qs_activeyear else None
    season = qs_activeyear.active_lesson_season.id

    return year, season


def magicFunction(a, b):
    """ two "lists of dictionaries substract """

    a = [tuple(sorted(d.items())) for d in a]
    b = [tuple(sorted(d.items())) for d in b]

    return [dict(kvs) for kvs in set(a).difference(b)]

# service_url дуудах функц
def get_service_url(request, request_url):

    url = reverse(request_url)
    absolute_url = request.build_absolute_uri(url)

    # NOTE production server байх үед protocol нь http байвал https рүү replace хийнэ SSL тохируулсны дараа
    # if not settings.DEBUG:
    #     absolute_url = absolute_url.replace('http', 'https')

    return absolute_url

def add_crontab(command, minute, hour, day, month, week):
    """ Crontab нэмэх
        command: ажиллуулах функц URL
    """

    cron = CronTab(user=True)
    job = cron.new(command=command)

    if minute:
        job.minute.on(minute)
    if hour:
        job.hour.on(hour)
    if day:
        job.dom.on(day)
    if month:
        job.month.on(month)
    if week:
        job.dow.on(week)

    save_sting = str(job)
    cron.write()

    return save_sting

def remove_cron(request, obj):
    """ Crontab устгах """

    function = obj.command

    command = 'curl ' + get_service_url(request, function)
    my_cron = CronTab(user=True)

    for job in my_cron:
        if command in str(job.command):
            my_cron.remove(job)
            my_cron.write()


def get_active_student():
    """ Суралцаж буй статустай оюутны авах """

    Student = apps.get_model('lms', 'Student')
    StudentRegister = apps.get_model('lms', 'StudentRegister')

    st_state = StudentRegister.objects.filter(name__icontains='Суралцаж буй').first()

    qs_students = Student.objects.filter(status=st_state)

    return qs_students

def calculate_birthday(register):
    """ Регистрийн дугаараас төрсөн огноо, хүйс тодорхойлох function
        return birth_date, gender
    """
    gender = ''
    try:
        # РД-аас төрсөн өдөр бодох
        if register[4] in ['2', '3']:
            year = int('20' + register[2:4])
            month = int(register[4:6]) - 20
        else:
            year = int('19' + register[2:4])
            month = int(register[4:6])

        day = int(register[6:8])

        # РД-аас хүйс бодох
        Student = apps.get_model("lms", 'Student')
        last_number = int(register[-2])
        if (last_number % 2) == 0:
            gender = Student.GENDER_FEMALE
        else:
            gender = Student.GENDER_MALE

        return date(year, month, day), gender

    except Exception as e:
        return None, gender


def bytes_image_encode(image):
    """ Base64 зургийг image болгох
    """

    img = Image.open(BytesIO(image))

    return img


def split_text_number(string):
    """ string-с үсэг тоо ялгах """

    letters = ''
    numbers = ''

    for char in string:
        if char.isalpha():
            letters += char
        elif char.isdigit():
            numbers += char

    return letters, numbers

def get_position_ids(names=[]):
    """
        албан тушаалын
        return: id
    """
    OrgPosition = apps.get_model('core', 'OrgPosition')

    query = reduce(or_, (Q(name__iexact=name) for name in names))
    pos_obj = OrgPosition.objects.filter(query).first()
    pos_ids = pos_obj.id
    return pos_ids


def start_time():
    return time.time()


def end_time(start_time, text=""):
    _time = time.time() - start_time
    print(text, time.time() - start_time)
    return _time

def dict_fetchall(cursor):
    "Return all rows from a cursor as a dict"
    columns = [col[0] for col in cursor.description if col]
    for row in cursor.fetchall():
        yield dict(zip(columns, row))


def student__full_name(last_name, first_name):

    ovog = f"{last_name[0].upper()}." if last_name else ""
    name = first_name.capitalize()

    if ovog and name:
        return f"{ovog}{name}"

    if name:
        return name

    return ""


def lesson_standart__code_name(code, name):
    return code + "-" + name


def score_register__score_total(teach_score, exam_score):
        full = 0

        if teach_score:
            full = full + teach_score

        if exam_score:
            full = full + exam_score

        return full

