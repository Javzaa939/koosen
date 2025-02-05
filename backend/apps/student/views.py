from collections import defaultdict
import os
import traceback
import requests
from googletrans import Translator
import openpyxl_dictreader

from datetime import date

from rest_framework import mixins
from rest_framework import generics
import pandas as pd

from django.conf import settings
from django.db import transaction
from django.db.models import Max, Sum, F, FloatField, Q, Value, Count, OuterRef, Subquery, Func
from django.db.models.functions import Replace, Upper, Coalesce
from django.contrib.auth.hashers import make_password
from django.db import connection
from django.utils import timezone

from main.utils.function.pagination import CustomPagination
from main.decorators import login_required

from rest_framework.filters import SearchFilter
from main.utils.file import remove_folder, split_root_path
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes
from main.utils.function.pagination import CustomPagination
from main.utils.function.utils import str2bool, has_permission, get_lesson_choice_student, remove_key_from_dict, get_fullName, get_student_score_register, calculate_birthday, null_to_none, bytes_image_encode, get_active_year_season,start_time, json_load, dict_fetchall, unit_static_datas, undefined_to_none
# from main.khur.XypClient import citizen_regnum, highschool_regnum
from main.utils.file import save_file, remove_folder
from lms.models import Learning, Payment, ProfessionalDegree, Student, StudentAdmissionScore, StudentEducation, StudentLeave, StudentLogin, TimeTable
from lms.models import StudentMovement
from lms.models import Group
from lms.models import StudentFamily
from lms.models import StudentAddress
from lms.models import StudentEducation
from lms.models import TimeTable_to_group
from lms.models import TimeTable_to_student
from lms.models import GraduationWork
from lms.models import StudentLeave
from lms.models import ExamTimeTable
from lms.models import Exam_to_group, PaymentSettings, TeacherScore
from lms.models import ScoreRegister, PaymentEstimate
from lms.models import Score
from lms.models import Employee
from lms.models import StipentStudent
from lms.models import DormitoryStudent
from lms.models import LearningPlan
from lms.models import SignaturePeoples
from lms.models import Schools
from lms.models import Season
from lms.models import CalculatedGpaOfDiploma
from lms.models import StudentRegister
from lms.models import LessonStandart
from lms.models import StudentViz, ChallengeStudents
from lms.models import SystemSettings
from lms.models import PaymentBeginBalance
from lms.models import Country, ProfessionAverageScore, AttachmentConfig, ProfessionDefinition

from core.models import SubOrgs, AimagHot, SumDuureg, User, Salbars

from .serializers import StudentListSerializer
from .serializers import StudentRegisterSerializer
from .serializers import StudentRegisterListSerializer
from .serializers import StudentMovementSerializer
from .serializers import StudentMovementListSerializer
from .serializers import StudentGroupRegisterSerailizer
from .serializers import StudentGroupRegisterListSerailizer
from .serializers import StudentInfoSerializer
from .serializers import StudentFamilySerializer
from .serializers import StudentEducationSerializer
from .serializers import StudentEducationListSerializer
from .serializers import SignaturePeoplesSerializer
from .serializers import StudentAddressListSerializer
from .serializers import StudentDownloadSerializer
from .serializers import StudentAdmissionScoreSerializer
from .serializers import StudentAdmissionScoreListSerializer
from .serializers import GroupListSerializer
from .serializers import StudentLeaveSerializer
from .serializers import GraduationWorkSerializer
from .serializers import GraduationWorkListSerailizer
from .serializers import StudentLeaveSerializer
from .serializers import StudentLeaveListSerailizer
from .serializers import EducationalLoanFundListSerializer
from .serializers import StudentInfoPageSerializer
from .serializers import LessonScheduleSerializer
from .serializers import PaymentEstimateSerializer
from .serializers import StipentStudentSerializer
from .serializers import DormitoryStudentListSerializer
from .serializers import BigSchoolsSerializer
from .serializers import StudentDefinitionSerializer
from .serializers import ScoreRegisterDefinitionSerializer
from .serializers import SeasonSerializer
from .serializers import SchoolSerializer
from .serializers import StudentAttachmentSerializer
from .serializers import GraduationWorkPrintSerailizer
from .serializers import StudentVizListSerializer
from .serializers import StudentVizSerializer
from .serializers import StudentSimpleListSerializer
from .serializers import GraduationWorkStudentListSerializer
from .serializers import StudentDefinitionListLiteSerializer

translator = Translator()

STUDY_YEAR = 12

@permission_classes([IsAuthenticated])
class GroupOneAPIView(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    generics.GenericAPIView
):
    """ Нэг анги бүртгэлийн мэдээлэл авах """

    queryset = Group.objects.all()
    serializer_class = StudentGroupRegisterListSerailizer

    def get(self, request, pk=None):

        group = self.retrieve(request, pk).data
        return request.send_data(group)

    @transaction.atomic
    def put(self, request, pk=None):
        " Ангийн бүртгэл засах "

        self.serializer_class = StudentGroupRegisterSerailizer

        request_data = request.data
        instance = self.get_object()

        is_finish = request_data.get('is_finish')
        old_is_finish = instance.is_finish
        finish_students = request_data.get('finish_students')
        group_id = request_data.get('id')

        request_data = remove_key_from_dict(request_data, ['finish_students', 'students'])

        serializer = self.get_serializer(instance, data=request_data)

        try:
            if not serializer.is_valid(raise_exception=False):
                return request.send_error_valid(serializer.errors)

            if is_finish:
                Student.objects.filter(id__in=finish_students, group=group_id).update(
                    status=StudentRegister.objects.filter(Q(name__contains='Төгссөн') or Q(code=2)).last()
                )
            elif not is_finish and old_is_finish:
                Student.objects.filter(group=group_id).update(
                    status=StudentRegister.objects.filter(Q(name__contains='Суралцаж буй') or Q(code=1)).last()
                )

            self.perform_create(serializer)

        except Exception:
            return request.send_error("ERR_002")

        return request.send_info("INF_002")

    def delete(self, request, pk=None):
        " Ангийн жагсаалт  устгах "

        student_qs = Student.objects.filter(group=pk).first()

        if student_qs:
            return request.send_error("ERR_003", 'Устгах боломжгүй байна')

        check_qs = TimeTable_to_group.objects.filter(group=pk)

        if check_qs:
            return request.send_error("ERR_003", 'Устгах боломжгүй байна')

        exam_check_qs = Exam_to_group.objects.filter(group=pk)
        if exam_check_qs:
            return request.send_error("ERR_003", 'Устгах боломжгүй байна')

        payment_check_qs = PaymentSettings.objects.filter(group=pk)
        if payment_check_qs:
            return request.send_error("ERR_003", 'Устгах боломжгүй байна')

        self.destroy(request, pk)
        return request.send_info("INF_003")


@permission_classes([IsAuthenticated])
class GroupAPIView(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    generics.GenericAPIView
):
    """" Анги """

    queryset = Group.objects.all().order_by('level','join_year')
    serializer_class = StudentGroupRegisterSerailizer

    pagination_class = CustomPagination

    filter_backends = [SearchFilter]
    search_fields = ['name', 'level', 'profession__name', 'join_year']

    def get_queryset(self):

        queryset = self.queryset

        school = self.request.query_params.get('school')
        salbar = self.request.query_params.get('salbar')
        degree = self.request.query_params.get('degree')
        profession = self.request.query_params.get('profession')
        join = self.request.query_params.get('join')
        sorting = self.request.query_params.get('sorting')

        # search_value = self.request.query_params.get('search')

        # Сургуулиар хайлт хийх
        if school:
            queryset = queryset.filter(school=school)

        # Салбараар хайлт хийх
        if salbar:
            queryset = queryset.filter(department=salbar)

        # Зэргээр хайлт хийх
        if degree:
            queryset = queryset.filter(degree=degree)

        # Мэргэжлээр хайлт хийх
        if profession:
            queryset = queryset.filter(profession=profession)

        # Элссэн хичээлийн жилээр хайлт хийх
        if join:
            queryset = queryset.filter(join_year=join)

        # Sort хийх үед ажиллана
        if sorting:
            if not isinstance(sorting, str):
                sorting = str(sorting)

            queryset = queryset.order_by(sorting)
        # хайлт хийх
        # if search_value:
        #     queryset = filter_queries(queryset.model, search_value)

        return queryset

    @has_permission(must_permissions=['lms-student-group-read'])
    def get(self, request, pk=None):
        " Ангийн жагсаалт "
        self.serializer_class = StudentGroupRegisterListSerailizer

        if pk:
            group = self.retrieve(request, pk).data
            return request.send_data(group)

        only_study = self.request.query_params.get('study')

        if only_study:
            self.queryset = self.queryset.exclude(is_finish=str2bool(only_study))

        group_list = self.list(request).data

        return request.send_data(group_list)

    @has_permission(must_permissions=['lms-student-group-create'])
    @transaction.atomic
    def post(self, request):
        "Ангийн бүртгэл шинээр үүсгэх"

        data = request.data

        # transaction savepoint зарлах нь хэрэв алдаа гарвад roll back хийнэ
        sid = transaction.savepoint()

        try:
            serializer = self.serializer_class(data=data, many=False)
            if not serializer.is_valid():
                transaction.savepoint_rollback(sid)
                return request.send_error("ERR_002","Тухайн анги бүлэг бүртгэлтэй байна")

            serializer.save()

        except Exception:
            return request.send_error("ERR_002")

        return request.send_info("INF_001")

    @has_permission(must_permissions=['lms-student-group-update'])
    @transaction.atomic
    def put(self, request, pk=None):
        " Ангийн бүртгэл засах "

        request_data = request.data
        instance = self.get_object()

        serializer = self.get_serializer(instance, data=request_data)

        try:
            if not serializer.is_valid(raise_exception=False):
                return request.send_error_valid(serializer.errors)

            serializer.save()

        except Exception as e:
            print(e)
            return request.send_error("ERR_002")

        return request.send_info("INF_002")

    @has_permission(must_permissions=['lms-student-group-delete'])
    def delete(self, request, pk=None):
        " Ангийн жагсаалт  устгах "

        self.destroy(request, pk)
        return request.send_info("INF_003")


def generate_student_code(school_id, group, is_two=False):
    """ Оюутны код generate хийх """

    school_code = SubOrgs.objects.get(pk=school_id).org_code
    group_qs = Group.objects.get(pk=group)
    degree_code = group_qs.profession.degree.degree_code
    lesson_year = group_qs.join_year
    duration = group_qs.profession.duration or 4
    profession_code = group_qs.profession.profession_code

    year = int(lesson_year[2:4])

    now_date = date.today()

    # to get month of end of study for specific degree
    if degree_code == 'MB' or degree_code == 'MC':
        duration = (
            SystemSettings.objects
            .filter(
                active_lesson_year=lesson_year,
                start_date__lte=now_date,
                finish_date__gte=now_date
            ).first().finish_date.month
        )
        duration = f'{duration:0{2}d}' if duration is not None else None
    else:
        duration = int(duration)

    generate_code = f'{degree_code}{school_code}{year}{duration}{profession_code}'

    student_qs = (
        Student
        .objects
        .filter(
            group__profession__profession_code=group_qs.profession.profession_code,
            school=school_id
        )
        .annotate(
            student_code=Upper('code'),
            desc=Replace('student_code', Value('Е'), Value('E')),
            search_text=Replace('desc', Value('С'), Value('C')),
        )
        .filter(
            search_text__istartswith=generate_code,
        )
        .order_by('-code')
    ).first()

    with_start = '001'
    student_register_count = 1

    print(student_qs)
    if student_qs:
        check_code = student_qs.code
        student_register_count = int(check_code[-3:]) + 1

    new_student_code = f'{int(student_register_count):0{len(with_start)}d}'

    full_generate_code = f'{generate_code}{new_student_code}'

    if is_two:
        return full_generate_code, generate_code

    return full_generate_code


@permission_classes([IsAuthenticated])
class StudentRegisterAPIView(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    generics.GenericAPIView
):
    """ Оюутан бүртгэл """

    queryset = Student.objects.all().order_by('created_at')
    serializer_class = StudentRegisterSerializer

    pagination_class = CustomPagination

    filter_backends = [SearchFilter]
    search_fields = ['code', 'department__name', 'first_name', 'register_num', 'last_name']

    def get_queryset(self):
        queryset = self.queryset
        department = self.request.query_params.get('department')
        degree = self.request.query_params.get('degree')
        profession = self.request.query_params.get('profession')
        join_year = self.request.query_params.get('join_year')
        group = self.request.query_params.get('group')
        schoolId = self.request.query_params.get('schoolId')
        status = self.request.query_params.get('status')
        level = self.request.query_params.get('level')
        isPayed = self.request.query_params.get('isPayed')

        # сургуулиар хайлт хийх
        if schoolId:
            queryset = queryset.filter(school_id=schoolId)

        # Хөтөлбөрийн багаар хайлт хийх
        if department:
            queryset = queryset.filter(department_id=department)

        # Боловсролын зэргээр хайлт хийх
        if degree:
            queryset = queryset.filter(group__degree_id=degree)

        # Мэргэжлээр хайлт хийх
        if profession:
            queryset = queryset.filter(group__profession_id=profession)

        # Элссэн хичээлийн жилээр хайлт хийх
        if join_year:
            queryset = queryset.filter(group__join_year=join_year)

        # Ангиар хайлт хийх
        if group:
            queryset = queryset.filter(group_id=group)

        if status:
            queryset = queryset.filter(status=status)

        if level:
            queryset = queryset.filter(group__level=level)

        if isPayed:
            payed_status_condition = Q(payment__status=True, payment__dedication=Payment.SYSTEM)

            # "2" is not payed
            if isPayed == '2':
                payed_status_condition = ~payed_status_condition

            queryset = queryset.filter(payed_status_condition)

        if status:
            queryset = queryset.filter(status=status)
        else:
            status__in = StudentRegister.objects.filter(name__icontains='Суралцаж буй').values_list('id', flat=True)
            queryset = queryset.filter(status__in=status__in)

        return queryset

    def get(self, request, pk=None):
        "Оюутны бүртгэл жагсаалт"

        self.serializer_class = StudentRegisterListSerializer

        if pk:
            student = self.retrieve(request, pk).data
            return request.send_data(student)

        student_list = self.list(request, pk).data
        return request.send_data(student_list)

    @transaction.atomic
    def post(self, request):
        " Оюутны бүртгэл шинээр үүсгэх "

        is_success = True
        image = None

        data = request.data
        is_khur = data.get('is_khur')
        regnum = data.get('register_num')
        citizenship = data.get('citizenship')
        data = remove_key_from_dict(data, 'is_khur')
        citizen_name = None
        student_code = data.get("code")
        school_id = data.get("school")
        group = data.get("group")

        # transaction savepoint зарлах нь хэрэв алдаа гарвад roll back хийнэ
        sid = transaction.savepoint()

        if not school_id:
            return request.send_error('ERR_002', 'Салбар сургууль сонгоно уу')

        if citizenship:
            citizenship_qs = Country.objects.filter(id=citizenship).first()

            if citizenship_qs:
                citizen_name = citizenship_qs.name
                citizen_name = citizen_name.upper()

            if citizen_name and citizen_name == 'МОНГОЛ':
                data['foregin_password'] = regnum
                birth_date, gender = calculate_birthday(regnum)

                data['gender'] = gender
                data['birth_date'] = birth_date

        # if is_khur:
        #     khur_data = citizen_regnum(regnum)
        #     highschool = highschool_regnum(regnum)

        #     if khur_data:
        #         last_name = khur_data['lastname']
        #         first_name = khur_data['firstname']
        #         family_name = khur_data['surname'] # Urgiin ovog
        #         nationality = khur_data['nationality'] # Ys vndes
        #         image = khur_data['image'] # Irgenii vnemlehiin zurag
        #         aimagCode = khur_data['aimagCityCode']
        #         sumCode = aimagCode + khur_data['soumDistrictCode']
        #         bagCode = sumCode + khur_data['bagKhorooCode']
        #         address_detail = khur_data['passportAddress']

        #         data['last_name'] = last_name
        #         data['first_name'] = first_name
        #         data['family_name'] = family_name
        #         data['yas_undes'] = nationality

        #     if highschool:
        #         degreeNumber = highschool['degreeNumber'] # Бүрэн дунд сургуулийн дугаар
        #         orgName = highschool['orgName'] # Төгссөн сургуулийн нэр
        #         year = highschool['year'] # Төгссөн жил

        #         joined_year = str(int(year) - 12) if year else ''

        if not student_code:
            student_code = generate_student_code(school_id, group)
            check_qs = Student.objects.filter(code=student_code).exists()

            if check_qs:
                # Оюутны код давхцаж байвал
                student_code = generate_student_code(school_id, group)

            print(student_code)
            data['code'] = student_code

        if 'gender' in data and not data.get('gender'):
            del data['gender']

        data['created_user'] = request.user.pk

        try:
            serializer = self.serializer_class(data=data, many=False)
            if not serializer.is_valid():
                print(serializer.errors)
                transaction.savepoint_rollback(sid)
                return request.send_error_valid(serializer.errors)

            # Оюутан бүртгүүлэх үед оюутны нэвтрэх нэр нууц үгийг хадгалах хэсэг
            password = regnum[-8:]

            hashed_password = make_password(password)
            serializer.save()

            student_data = serializer.data
            student_id = student_data.get('id')

            student_obj = self.queryset.get(pk=student_id)

            if image:
                img = bytes_image_encode(image)
                logo_root = os.path.join(settings.STUDENTS, str(student_id))
                path = os.path.join(settings.MEDIA_ROOT, logo_root)

                if not os.path.exists(logo_root):
                    os.makedirs(path)

                image_path = os.path.join(path, "picture.jpg" )
                img = img.convert('RGB')
                img.save(image_path)

                save_file_path = split_root_path(image_path)

                student_obj.image = save_file_path
                student_obj.save()

            if student_id:
                StudentLogin.objects.update_or_create(
                    student_id=student_id,
                    defaults={
                        'username': student_code,
                        'password': hashed_password
                    }

                )

                # if is_khur and aimagCode:
                #     unit1 = AimagHot.objects.filter(code=aimagCode).last()
                #     sum_duureg = SumDuureg.objects.filter(code=sumCode, unit1=unit1).last()
                #     bag_khoroo = BagHoroo.objects.filter(code=bagCode, unit2=sum_duureg).last()

                #     StudentAddress.objects.update_or_create(
                #         student=student_obj,
                #         defaults={
                #             'passport_unit1': unit1,
                #             'passport_unit2': sum_duureg,
                #             'passport_unit3': bag_khoroo,
                #             'passport_other': address_detail
                #         }
                #     )

                # # Боловсролын мэдээлэл
                # if  is_khur and degreeNumber:
                #     StudentEducation.objects.update_or_create(
                #         student=student_obj,
                #         defaults={
                #             'school_name': orgName,
                #             'edu_level': StudentEducation.EDUCATION_BUREN,
                #             'join_year': joined_year,
                #             'graduate_year': year,
                #             'certificate_num': degreeNumber,
                #         }
                #     )

        except Exception as e:
            print('exception', e)
            return request.send_error("ERR_002")

        return request.send_info("INF_001")

    def delete(self, request, pk=None):
        " Оюутны бүртгэл устгах "

        qs_student = Student.objects.filter(pk=pk)
        if not qs_student:
            request.send_error("ERR_001", 'Оюутны мэдээлэл олдсонгүй')

        with transaction.atomic():

            # Гэр бүлийн мэдээлэл устгах
            qs_family = StudentFamily.objects.filter(student_id=pk)
            if qs_family:
                qs_family.delete()

            # Хаягийн мэдээлэл устгах
            qs_address = StudentAddress.objects.filter(student_id=pk)
            if qs_address:
                qs_address.delete()

            # Боловсролын мэдээлэл
            qs_education = StudentEducation.objects.filter(student_id=pk)
            if qs_education:
                qs_education.delete()

            # ЭЕШ-ын мэдээлэл
            qs_admission = StudentAdmissionScore.objects.filter(student_id=pk)
            if qs_admission:
                qs_admission.delete()

            qs_timetable = TimeTable_to_student.objects.filter(student_id=pk)
            score_reg = ScoreRegister.objects.filter(student=pk)
            address = StudentAddress.objects.filter(student=pk)
            exam = Exam_to_group.objects.filter(student=pk)
            estimate = PaymentEstimate.objects.filter(student=pk)
            if qs_timetable:
                qs_timetable.delete()

            if address:
                address.delete()

            if exam:
                exam.delete()

            if estimate:
                estimate.delete()

            if score_reg:
                return request.send_error("ERR_002", "Дүнгийн мэдээлэлтэй учир устгах боломжгүй.")

            # Оюутны ерөнхий мэдээлэл устгах
            qs_student.delete()

        return request.send_info("INF_003")


@permission_classes([IsAuthenticated])
class StudentListAPIView(
    mixins.ListModelMixin,
    generics.GenericAPIView
):
    """ Оюутны жагсаалт """

    queryset = Student.objects.all()
    serializer_class = StudentListSerializer

    def get(self, request):
        qs = TimeTable_to_group.objects

        lesson = request.query_params.get('lesson')
        teacher = request.query_params.get('teacher')
        class_id = request.query_params.get('class_id')
        school_id = request.query_params.get('school')

        department = request.query_params.get('department')
        degree = request.query_params.get('degree')
        profession = request.query_params.get('profession')
        join_year = request.query_params.get('join_year')
        group = request.query_params.get('group')

        state = request.query_params.get('state')

        if state != 'undefined' and state is not None and state:

            if state == '2':
                qs_start = (int(state) - 2) * 10
                qs_filter = int(state) * 10
            else:
                qs_start = (int(state) - 1) * 10
                qs_filter = int(state) * 10

        # Хөтөлбөрийн багаар хайлт хийх
        if school_id:
            self.queryset = self.queryset.filter(school=school_id)

        # Хөтөлбөрийн багаар хайлт хийх
        if department:
            self.queryset = self.queryset.filter(department_id=department)

        # Боловсролын зэргээр хайлт хийх
        if degree:
            self.queryset = self.queryset.filter(group__degree_id=degree)

        # Мэргэжлээр хайлт хийх
        if profession:
            self.queryset = self.queryset.filter(group__profession_id=profession)

        # Элссэн хичээлийн жилээр хайлт хийх
        if join_year:
            self.queryset = self.queryset.filter(group__join_year=join_year)

        # Ангиар хайлт хийх
        if group != 'undefined' and group:
            self.queryset = self.queryset.filter(group_id=group)

        # Тухайн хичээлийг үзэж буй оюутнуудын жагсаалт
        if lesson:
            student_ids = qs.filter(
                    add_flag=True,
                    timetable__lesson=lesson,
                ) \
                .values_list('student', flat=True).distinct()
            self.queryset = self.queryset.filter(id__in=student_ids)

        if teacher:
            qs = TimeTable_to_group.objects
            group_ids = qs.filter(timetable__teacher=teacher).values_list('group', flat=True)
            self.queryset = self.queryset.filter(group__in=group_ids)

        if class_id:
            self.queryset = self.queryset.filter(group=class_id)

        if state != 'undefined' and state is not None and state:
            status = StudentRegister.objects.filter(name__contains='Суралцаж буй').first()
            self.queryset = self.queryset.filter(status=status)

            self.queryset = self.queryset.order_by('id')[qs_start:qs_filter]

        all_list = self.list(request).data
        return request.send_data(all_list)


# @permission_classes([IsAuthenticated])
class StudentsListSimpleAPIView(
    mixins.ListModelMixin,
    generics.GenericAPIView
):
    """ Оюутны жагсаалт """

    queryset = Student.objects.all()
    serializer_class = StudentSimpleListSerializer

    def get(self, request):

        all_list = self.list(request).data

        return request.send_data(all_list)


@permission_classes([IsAuthenticated])
class GroupReportAPI(
    mixins.ListModelMixin,
    generics.GenericAPIView,
):

    ''' Оюутны бүртгэлийн нийт анги бүлгийн тоо '''

    def get(self, request):

        school = request.query_params.get('school')

        extra_filter = {}

        if school:
            extra_filter.update({'school': school})

        status = Learning.objects.values('id', 'learn_name').order_by('id')

        def fill_data(chart_data):
            sorted_data = []
            if len(chart_data) != len(status):

                for grade in status:
                    name = grade['learn_name']
                    has = False
                    for item in chart_data:
                        aname = item['name']
                        has = name == aname
                        if has is True:
                            break

                    if has is False:
                        chart_data.append({
                            'name': name,
                            "count": 0,
                            "id": grade['id'],
                        })
                sorted_data = sorted(chart_data, key=lambda d: d['id'])

            return sorted_data if len(sorted_data) else chart_data

        label = []
        data = {}

        if school:
            label_obj = ProfessionalDegree.objects.annotate(name=F('degree_name')).values('id', 'name')
        else:
            label_obj = SubOrgs.objects.filter(is_school=True).values('id', 'name')

        for index, item in enumerate(label_obj):
            if school:
                label_obj_filter = {'degree': item.get('id')}
            else:
                label_obj_filter = {'school': item.get('id')}

            group = list(
                Group
                .objects
                .filter(
                    **extra_filter,
                    **label_obj_filter
                )
                .values('learning_status', 'learning_status__learn_name')
                .annotate(count=Count("learning_status"), id=F('learning_status'), name=F('learning_status__learn_name'))
                .values('id', 'count', 'name')
                .order_by('id')
            )
            group = fill_data(group)

            key = f"group_{index}_{''.join(word[0].upper() for word in item.get('name').split())}"
            label.append({
                "key": key,
                "name": item.get('name')
            })

            data[key] = group

        data = {
            "label": label,
            "data": data,
            "ylabel": [[item.get('id'), item.get('learn_name').capitalize()] for item in status],
        }

        return request.send_data(data)


@permission_classes([IsAuthenticated])
class StudentReportAPI(
    mixins.ListModelMixin,
    generics.GenericAPIView,
):

    ''' Оюутны бүртгэл тайлан '''

    def get(self, request):

        school = request.query_params.get('school')

        currentYear = request.GET.get("currentYear")

        extra_filter = {}

        if school:
            extra_filter.update({'group__school': school})

        exclude_filter = {
            'status__name__icontains': 'Төгссөн'
        }

        if currentYear:
            currentYear = timezone.now().year
            currentYear = f"{currentYear}-{currentYear + 1}"
            extra_filter.update({
                "group__join_year": currentYear,
            })

        status = StudentRegister.objects.exclude(name__icontains='Төгссөн').values('code', 'name').order_by('code')

        def fill_data(chart_data):
            sorted_data = []
            if len(chart_data) != len(status):

                for grade in status:
                    name = grade['name']
                    has = False
                    for item in chart_data:
                        aname = item['name']
                        has = name == aname
                        if has is True:
                            break

                    if has is False:
                        chart_data.append({
                            'name': name,
                            "count": 0,
                            "code": grade['code'],
                        })
                sorted_data = sorted(chart_data, key=lambda d: d['code'])

            return sorted_data if len(sorted_data) else chart_data

        label = []
        data = {}

        # male
        student = list(
            Student
            .objects
            .filter(
                **extra_filter,
                gender=Student.GENDER_MALE
            )
            .exclude(**exclude_filter)
            .values('status__code', 'status__name')
            .annotate(count=Count("status__code"), code=F('status__code'), name=F('status__name'))
            .values('code', 'count', 'name')
            .order_by('code')
        )
        student = fill_data(student)

        label.append({
            "key": Student.GENDER_MALE,
            "name": Student.GENDER_TYPE[Student.GENDER_MALE - 1][1].capitalize()
        })

        data[Student.GENDER_MALE] = student

        # female
        student = list(
            Student
            .objects
            .filter(
                **extra_filter,
                gender=Student.GENDER_FEMALE
            )
            .exclude(**exclude_filter)
            .values('status__code', 'status__name')
            .annotate(count=Count("status__code"), code=F('status__code'), name=F('status__name'))
            .values('code', 'count', 'name')
            .order_by('code')
        )
        student = fill_data(student)

        label.append({
            "key": Student.GENDER_FEMALE,
            "name": Student.GENDER_TYPE[Student.GENDER_FEMALE - 1][1].capitalize()
        })

        data[Student.GENDER_FEMALE] = student

        data = {
            "label": label,
            "data": data,
            "ylabel": [[item.get('code'), item.get('name').capitalize()] for item in status],
        }

        return request.send_data(data)


@permission_classes([IsAuthenticated])
class StudentCourseAPI(
    mixins.ListModelMixin,
    generics.GenericAPIView,
):

    ''' Оюутны бүртгэлийн нийт суралцагчийн тоо хүйсээр '''

    def get(self, request):

        school = request.query_params.get('school')

        extra_filter = dict()

        if school:
            extra_filter.update({'group__school': school})

        total = Student.objects.filter(**extra_filter).exclude(status__name__icontains='Төгссөн').count()

        student_qs = (
            Student
            .objects
            .annotate(
                group__level=F('group__level'),
            )
            .filter(
                **extra_filter,
            )
            .exclude(status__name__icontains='Төгссөн')
        )

        male_qs = (
            student_qs
            .filter(
                gender=Student.GENDER_MALE,
                group__level=OuterRef("level"),
            )
            .annotate(count=Count("*"))
            .values("count")
        )
        male_qs.query.set_group_by()

        female_qs = (
            student_qs
            .filter(
                gender=Student.GENDER_FEMALE,
                group__level=OuterRef("level"),
            )
            .annotate(count=Count("*"))
            .values("count")
        )
        female_qs.query.set_group_by()

        total_qs = (
            student_qs
            .filter(
                group__level=OuterRef("level"),
            )
            .annotate(count=Count("*"))
            .values("count")
        )
        total_qs.query.set_group_by()

        chart_data = list(
            Group
            .objects
            .values("level")
            .annotate(count=Count("*"))
            .values("level", "count")
            .annotate(
                total=Subquery(total_qs),
                male=Subquery(male_qs),
                female=Subquery(female_qs),
            )
            .values("level", "total", "male", "female")
            .order_by('level')
        )

        data = {
            "data": chart_data,
            "total": total
        }

        return request.send_data(data)


@permission_classes([IsAuthenticated])
class StudentProfessionAPI(
    mixins.ListModelMixin,
    generics.GenericAPIView,
):

    ''' Оюутны бүртгэлийн нийт суралцагчийн тоо хөтөлбөрөөр '''

    def get(self, request):

        school = request.query_params.get('school')

        extra_filter = dict()

        if school:
            extra_filter.update({'group__school': school})

        total = Student.objects.filter(**extra_filter).exclude(status__name__icontains='Төгссөн').count()

        student_qs = (
            Student
            .objects
            .annotate(
                profession=F('group__profession'),
            )
            .filter(
                **extra_filter,
            )
            .exclude(status__name__icontains='Төгссөн')
        )

        male_qs = (
            student_qs
            .filter(
                gender=Student.GENDER_MALE,
                profession=OuterRef("pk"),
            )
            .annotate(count=Count("*"))
            .values("count")
        )
        male_qs.query.set_group_by()

        female_qs = (
            student_qs
            .filter(
                gender=Student.GENDER_FEMALE,
                profession=OuterRef("pk"),
            )
            .annotate(count=Count("*"))
            .values("count")
        )
        female_qs.query.set_group_by()

        total_qs = (
            student_qs
            .filter(
                profession=OuterRef("pk"),
            )
            .annotate(count=Count("*"))
            .values("count")
        )
        total_qs.query.set_group_by()

        chart_data = list(
            ProfessionDefinition
            .objects
            .values("name")
            .annotate(count=Count("*"))
            .values("name", "count")
            .annotate(
                total=Subquery(total_qs),
                male=Subquery(male_qs),
                female=Subquery(female_qs),
            )
            .filter(
                total__gt=0
            )
            .values("name", "total", "male", "female")
            .order_by('name')
        )

        data = {
            "data": chart_data,
            "total": total
        }

        return request.send_data(data)


@permission_classes([IsAuthenticated])
class StudentProvinceAPI(
    mixins.ListModelMixin,
    generics.GenericAPIView,
):

    ''' Оюутны бүртгэлийн нийт суралцагчийн тоо аймгаар '''

    def get(self, request):

        school = request.query_params.get('school')

        extra_filter = dict()

        if school:
            extra_filter.update({'group__school': school})

        unit_names = unit_static_datas()

        student_qs = Student.objects.filter(**extra_filter).exclude(status__name__icontains='Төгссөн')

        # for declare gender types
        gender_values = [Student.GENDER_MALE, Student.GENDER_FEMALE]

        # Аймаг хадгалагдаагүй байсан учир регистрийн дугаараас аймаг олсон
        query = Q()
        for key in unit_names.keys():
            query |= Q(register_num__startswith=key)

        # to get all students with aimag letter at the start of register_num
        student_aimag = student_qs.filter(query)

        # to extract first letter
        class Left(Func):
            function = 'LEFT'
            template = '%(function)s(%(expressions)s, 1)'

        # to count by first letter of aimag
        student_aimag_counts = (
            student_aimag
            .annotate(first_letter=Left(F('register_num')))
            .values('first_letter', 'gender')
            .annotate(count=Count('id'))
        )

        # to group letters with same aimag
        grouped_letters = defaultdict(list)

        for letter, name in unit_names.items():
            grouped_letters[name].append(letter)

        # to collect aimag count pairs
        chart_data = []
        total = 0

        for aimag_name, letters in grouped_letters.items():
            # to initialize counters for genders
            gender_totals = {value: 0 for value in gender_values}

            # to count by letters
            for item in student_aimag_counts:
                if item['first_letter'] in letters:
                    if item['gender'] in gender_totals:
                        gender_totals[item['gender']] += item['count']

            total_by_aimag = gender_totals[gender_values[0]] + gender_totals[gender_values[1]]

            # to add data to summary list
            chart_data.append({
                'name': aimag_name,
                'male_student_total': gender_totals[gender_values[0]],
                'female_student_total': gender_totals[gender_values[1]],
                'total': total_by_aimag
            })

            total += total_by_aimag

        # to sort by aimag name
        chart_data = sorted(chart_data, key=lambda x: x['name'])

        data = {
            "haryalal": chart_data,
            "total": total
        }

        return request.send_data(data)


@permission_classes([IsAuthenticated])
class StudentReportPaymentAPI(
    mixins.ListModelMixin,
    generics.GenericAPIView,
):
    """Оюутны бүртгэлийн нийт суралцагчийн тоо хөтөлбөрөөр. Payment"""

    def get(self, request):

        school = request.query_params.get("school")
        extra_filter_Q = Q()

        if school:
            extra_filter_Q = Q(
                Q(
                    group__profession__department__isnull=True,
                    group__profession__school=school,
                )
                | Q(
                    group__profession__department__isnull=False,
                    group__profession__department__sub_orgs=school,
                )
            )

        exclude_filter = {"status__name__icontains": "Төгссөн"}
        student_qs = Student.objects.filter(extra_filter_Q).exclude(**exclude_filter)
        total = student_qs.count()
        template = request.query_params.get("template")
        level1_condition = None

        if template == "1":
            level1_condition = Q(
                Q(
                    group__profession__department__isnull=False,
                    group__profession__department__sub_orgs=OuterRef("pk"),
                )
                | Q(
                    group__profession__department__isnull=True,
                    group__profession__school=OuterRef("pk"),
                )
            )

            by_model = SubOrgs
        elif template == "2":
            level1_condition = Q(group__profession__department=OuterRef("pk"))
            by_model = Salbars
        elif template == "3":
            level1_condition = Q(group__profession=OuterRef("pk"))
            by_model = ProfessionDefinition
        elif template == "4":
            level1_condition = Q(group=OuterRef("pk"))
            by_model = Group
        else:

            return request.send_error("ERR_002")

        labels_level2 = [
            {"key": "paid", "label": "Төлсөн"},
            {"key": "unpaid", "label": "Төлсөнгүй"},
        ]

        level2_conditions = {
            labels_level2[0]["key"]: Q(
                payment__status=True, payment__dedication=Payment.SYSTEM
            ),
            labels_level2[1]["key"]: Q(
                Q(
                    payment__isnull=False,
                    payment__status=False,
                    payment__dedication=Payment.SYSTEM,
                )
                | Q(payment__isnull=True)
            ),
        }

        level2_qs = {}

        for key in level2_conditions:
            level2_qs[key] = (
                student_qs.filter(level2_conditions[key] & level1_condition)
                .annotate(count=Count("*"))
                .values("count")
            )

            level2_qs[key].query.set_group_by()

        chart_data_qs = (
            by_model.objects.annotate(
                **{
                    labels_level2[0]["key"]: Subquery(
                        level2_qs[labels_level2[0]["key"]]
                    ),
                    labels_level2[1]["key"]: Subquery(
                        level2_qs[labels_level2[1]["key"]]
                    ),
                },
                total=F(labels_level2[0]["key"]) + F(labels_level2[1]["key"]),
            )
            .filter(total__gt=0)
            .values("name", "total", labels_level2[0]["key"], labels_level2[1]["key"])
            .order_by("name")
        )

        chart_data = list(chart_data_qs)
        data = {"data": chart_data, "total": total, "labels_level2": labels_level2}

        return request.send_data(data)


@permission_classes([IsAuthenticated])
class StudentSchoolAPI(
    mixins.ListModelMixin,
    generics.GenericAPIView,
):

    ''' Оюутны бүртгэлийн нийт суралцагчийн тоо сургуулиар '''

    def get(self, request):

        school = request.query_params.get('school')

        extra_filter_ylabel = {
            'is_school': True
        }

        schools = SubOrgs.objects.filter(**extra_filter_ylabel).values('id', 'name')

        extra_filter = {
            "group__school__isnull": False
        }

        if school:
            extra_filter.update({'group__school': school})

        def fill_data(chart_data):
            sorted_data = []
            if len(chart_data) != len(schools):

                for grade in schools:
                    name = grade.get('name')
                    has = False
                    for item in chart_data:
                        aname = item['school_name']
                        has = name == aname
                        if has is True:
                            break

                    if has is False:
                        chart_data.append({
                            'school_name': name,
                            "count": 0,
                            "school_code": grade.get('id'),
                        })

                sorted_data = sorted(chart_data, key=lambda d: d['school_code'])

            return sorted_data if len(sorted_data) else chart_data

        male_student = (
            Student
            .objects
            .filter(
                **extra_filter,
                gender=Student.GENDER_MALE
            )
            .exclude(status__name__icontains='Төгссөн')
            .values("group__school", 'group__school__name')
            .annotate(count=Count("group__school"), school_code=F('group__school'), school_name=F('group__school__name'))
            .values("school_code", 'count', 'school_name')
        )
        male_student = fill_data(list(male_student))

        female_student = (
            Student
            .objects
            .filter(
                **extra_filter,
                gender=Student.GENDER_FEMALE
            )
            .exclude(status__name__icontains='Төгссөн')
            .values("group__school", 'group__school__name')
            .annotate(count=Count("group__school"), school_code=F('group__school'), school_name=F('group__school__name'))
            .values("school_code", 'count', 'school_name')
        )
        female_student = fill_data(list(female_student))

        data = {
            "label": [
                {
                    "key": "male_student",
                    "name": "Эрэгтэй"
                },
                {
                    "key": "female_student",
                    "name": "Эмэгтэй"
                },
            ],
            "data": {
                'male_student': male_student,
                'female_student': female_student,
            },
            "ylabel": [item.get('name') for item in schools]
        }

        return request.send_data(data)


# @permission_classes([IsAuthenticated])
class StudentMovementAPIView(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    generics.GenericAPIView
):
    """ Оюутан шилжилт хөдөлгөөн """

    queryset = StudentMovement.objects.all()
    serializer_class = StudentMovementSerializer

    pagination_class = CustomPagination

    filter_backends = [SearchFilter]
    search_fields = ['student__last_name', 'student__code', 'student__first_name', 'destination_school__name']

    def get_queryset(self):
        queryset = self.queryset
        school = self.request.query_params.get('school')
        checked = self.request.query_params.get('checked')

        # сургуулиар хайлт хийх
        if school:
            queryset = queryset.filter(school_id=school)

        if checked:
            if str2bool(checked):
                queryset = queryset.filter(is_internal=True)

        return queryset

    # @has_permission(must_permissions=['lms-student-movement-read'])
    def get( self, request, pk=None):
        "Оюутны шилжилт хөдөлгөөн жагсаалт"

        self.serializer_class = StudentMovementListSerializer

        if pk:
            stud = self.retrieve(request, pk).data
            return request.send_data(stud)

        stud_list = self.list(request, pk).data
        return request.send_data(stud_list)

    @has_permission(must_permissions=['lms-student-movement-create'])
    @transaction.atomic
    def post(self, request):
        " Оюутны шилжилт хөдөлгөөн шинээр үүсгэх "

        data = request.data
        status = None
        student = data.get('student')
        serializer = self.get_serializer(data=data)

        # transaction savepoint зарлах нь хэрэв алдаа гарвад roll back хийнэ
        sid = transaction.savepoint()

        status_rg = StudentRegister.objects.filter(name__contains='Шилжсэн')

        if status_rg:
            status = status_rg.first()

        try:
            serializer = self.serializer_class(data=data, many=False)
            if not serializer.is_valid():
                transaction.savepoint_rollback(sid)
                return request.send_error_valid(serializer.errors)

            serializer.save()

            if status:
                Student.objects.filter(pk=student).update(
                    status=status
                )

        except Exception:
            return request.send_error("ERR_002")

        return request.send_info("INF_001")

    @has_permission(must_permissions=['lms-student-movement-update'])
    @transaction.atomic
    def put(self, request, pk=None):
        " Оюутны шилжилт хөдөлгөөн засах "

        data = request.data
        instance = self.get_object()

        try:
            serializer = self.get_serializer(instance, data=data)
            if not serializer.is_valid(raise_exception=False):
                return request.send_error_valid(serializer.errors)

            self.perform_update(serializer)

        except Exception as e:
            print(e)
            return request.send_error("ERR_002")

        return request.send_info("INF_002")

    @has_permission(must_permissions=['lms-student-movement-delete'])
    def delete(self, request, pk=None):
        " Оюутны шилжилт хөдөлгөөн устгах "

        self.destroy(request, pk)
        return request.send_info("INF_003")


@permission_classes([IsAuthenticated])
class StudentArrivedAPIView(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    generics.GenericAPIView
):
    """ Оюутан шилжилт хөдөлгөөн """

    queryset = StudentMovement.objects.all()
    serializer_class = StudentMovementSerializer

    pagination_class = CustomPagination

    filter_backends = [SearchFilter]
    search_fields = ['student__last_name', 'student__code', 'student__first_name', 'destination_school__name', 'statement_date']

    def get_queryset(self):
        queryset = self.queryset
        school = self.request.query_params.get('school')
        statement = self.request.query_params.get('statement')

        # сургуулиар хайлт хийх
        if school:
            queryset = queryset.filter(destination_school=school)

        if statement:
            queryset = queryset.filter(statement=statement)

        queryset = queryset.filter(is_internal=True)

        return queryset

    @has_permission(must_permissions=['lms-student-movement-read'])
    def get( self, request, pk=None):
        "Оюутны шилжилт хөдөлгөөн жагсаалт"

        self.serializer_class = StudentMovementListSerializer

        start = request.query_params.get('start')
        end = request.query_params.get('end')

        if end:
            self.queryset = self.queryset.filter(updated_at__date__range=[start,end])

        if pk:
            stud = self.retrieve(request, pk).data
            return request.send_data(stud)

        stud_list = self.list(request, pk).data
        return request.send_data(stud_list)

    @has_permission(must_permissions=['lms-student-movement-put'])
    def put( self, request, pk=None):
        "Оюутны шилжилт хөдөлгөөн жагсаалт"

        datas = request.data
        ids = datas.get('ids')

        with transaction.atomic():
            self.queryset.filter(id__in=ids).update(
                statement=datas.get('statement'),
                statement_date=datas.get('statement_date')
            )

        return request.send_data([])


@permission_classes([IsAuthenticated])
class StudentGroupListAPIView(generics.GenericAPIView, mixins.ListModelMixin):
    """ Анги бүлгийн жагсаалт """

    queryset = Group.objects
    serializer_class = GroupListSerializer

    def get_queryset(self):
        queryset = self.queryset
        schoolId = self.request.query_params.get('schoolId')
        depId = self.request.query_params.get('department')
        degree = self.request.query_params.get('degree')
        profession = self.request.query_params.get('profession')
        join_year = self.request.query_params.get('join_year')
        level = self.request.query_params.get('level')

        # Сургууль хайлт
        # if schoolId:
        #     queryset = queryset.filter(school_id=schoolId)

        # Салбар танхим хайлт
        if depId:
            queryset = queryset.filter(department_id=depId)

        # Боловсролын зэрэг хайлт
        if degree:
            queryset = queryset.filter(degree_id=degree)

        # Мэргэжлээр хайх
        if profession:
            queryset = queryset.filter(profession_id=profession)

        # Элссэн хичээлийн жил
        if join_year:
            queryset = queryset.filter(join_year=join_year)

        if level:
            queryset = queryset.filter(level=level)

        return queryset

    def get(self, request, pk=None):

        # Хичээлийн хуваарийн үед тухайн хуваарьт бүртгэгдсэн сургуулийн ангиудын жагсаалтыг авах
        if pk:
            qs_timetable = TimeTable.objects.filter(id=pk).last()
            school_id = qs_timetable.school

            self.queryset = self.queryset.filter(school_id=school_id)

        all_list = self.list(request).data

        return request.send_data(all_list)


@permission_classes([IsAuthenticated])
class ClassAPIView(generics.GenericAPIView, mixins.ListModelMixin,):
    """ Багшаас хамаарах анги бүлгийн жагсаалт """

    queryset = Group.objects
    serializer_class = StudentGroupRegisterSerailizer

    def get(self, request):

        teacherId = self.request.query_params.get('teacher')
        lessonId = self.request.query_params.get('lesson')

        qs = TimeTable_to_group.objects

        if teacherId:
            qs = qs.filter(timetable__teacher=teacherId)

        if lessonId:
            qs = qs.filter(timetable__lesson=lessonId)

        group_ids = qs.values_list('group', flat=True)

        self.queryset = self.queryset.filter(id__in=group_ids)

        list_data = self.list(request).data
        return request.send_data(list_data)


@permission_classes([IsAuthenticated])
class StudentInfoAPIView(
    generics.GenericAPIView,
):
    """ Оюутны дэлгэрэнгүй хэсэг """

    queryset = Student.objects
    serializer_class = StudentInfoPageSerializer

    def get(self, request, pk=None):
        """ pk: student_id """

        year = request.query_params.get('year')
        season = request.query_params.get('season')
        timetableData=None

        # Сурагчийг хайна
        student = Student.objects.filter(id=pk).last()
        if not student:
            return request.send_data(dict())

        # ----- Ерөнхий мэдээлэл -----
        mainInfo = self.get_serializer(student, many=False).data

        # ----- Сурагчийн хаягийн мэдээлэл -----
        studentAddress = StudentAddress.objects.filter(student=student).last()
        studentAddressData = StudentAddressListSerializer(studentAddress, many=False).data

        # ----- Хичээлийн хуваарь -----

        # Тухайн оюутны ангийн хичээлийн хуваариуд
        timetable_ids = TimeTable_to_group.objects.filter(group=student.group).values_list('timetable', flat=True)

        # Тухайн оюутны сонгон хичээлийн хуваариуд
        student_timetable_ids = TimeTable_to_student.objects.filter(student_id=student, add_flag=True).values_list('timetable', flat=True)

        # Бүх хичээлийн хуваарийн ids
        all_timetable_ids = timetable_ids.union(student_timetable_ids)

        if year and season:
            timetableQuery = TimeTable.objects.filter(id__in=all_timetable_ids, lesson_year=year, lesson_season=season).order_by('day', 'time')
            timetableData = LessonScheduleSerializer(timetableQuery, many=True).data

        # ----- Дүнгийн мэдээлэл -----

        student_score_mini_detail = get_student_score_register(student.id)
        total_kr = 0
        score_all_data = []
        result = {}

        stud_score_info = ScoreRegister.objects.filter(student=student)

        for score_data in stud_score_info:
            # хичээлийн жил улирал авах нь
            key = None
            year = score_data.lesson_year
            season = score_data.lesson_season
            if year and season:
                key = year + " " + season.season_name

            if key not in result:
                result[key] = []

            # оюутны мэдээлэл
            result[key].append(score_data)

        for key in result.keys():
            season_info = []
            total_kr = 0
            onoo = 0

            for eachSeason in result[key]:

                # тухайн хичээлийн exam+teach оноо
                score = eachSeason.score_total

                # үсгэн үнэлгээ
                if score:
                    score = round(score, 2)
                    assessment = Score.objects.filter(
                        score_max__gte=score, score_min__lte=score).first()
                    if assessment:
                        assesment = assessment.assesment

                register_code = ""
                teacher = eachSeason.teacher

                # багшийн  код авах нь
                if teacher:
                    qs_worker = Employee.objects.filter(
                        user=eachSeason.teacher.user).first()
                    register_code = qs_worker.register_code

                season_info.append(
                    {
                        "lesson": eachSeason.lesson_year if eachSeason.lesson_year else "",
                        "lesson_code": eachSeason.lesson.code if eachSeason.lesson else "",
                        "lesson_name": eachSeason.lesson.name if eachSeason.lesson else "",
                        "lesson_krt": eachSeason.lesson.kredit if eachSeason.lesson else "",
                        "score": score if score else "",
                        "assessment": assesment if eachSeason.lesson else "",
                        "teacher_code": register_code if register_code else "",
                        "teacher_full_name": get_fullName(eachSeason.teacher.first_name, eachSeason.teacher.last_name, True, True) if eachSeason.teacher else "",
                    }
                )
                # хичээлийн кр
                total_kr = total_kr + eachSeason.lesson.kredit
                onoo = onoo + score * eachSeason.lesson.kredit
            # онооны дундаж олох нь
            # round() таслалаас хойш 2 орон авах
            total_onoo = round(onoo / total_kr, 2)
            # голч олох нь
            score = Score.objects.filter(
                score_max__gte=total_onoo, score_min__lte=total_onoo).first()

            score_all_data.append(
                {
                    "season_info": season_info,
                    "year_season": key,
                    "total": {
                        "kredit": total_kr if total_kr else "",
                        "onoo": total_onoo if total_onoo else "",
                        "gpa": score.gpa if score else "",
                    }
                }
            )

        # ----- Төлбөрийн дэлгэрэнгүй -----

        paymentEstimateQuery = PaymentEstimate.objects.filter(student=student).order_by('lesson_year', 'lesson_season')
        paymentEstimateData = PaymentEstimateSerializer(paymentEstimateQuery, many=True).data

        # ----- Тэтгэлэгийн хүсэлт -----

        stipentStudentQuery = StipentStudent.objects.filter(student=student).order_by('created_at')
        stipentStudentData = StipentStudentSerializer(stipentStudentQuery, many=True).data

        # ----- Дотуур байр -----

        dormitoryQuery = DormitoryStudent.objects.filter(student=student).order_by('lesson_year')
        dormitoryData = DormitoryStudentListSerializer(dormitoryQuery, many=True).data

        # ----- Гэр бүлийн байдал -----

        familyQuery = StudentFamily.objects.filter(student=student)
        familyData = StudentFamilySerializer(familyQuery, many=True).data

        datas = {
            'mainInfo': mainInfo,
            'studentAddressData': studentAddressData,
            'timetableData': timetableData,
            'scoreRegisterData': score_all_data,
            'student_score_mini_detail': student_score_mini_detail,
            'paymentEstimateData': paymentEstimateData,
            'stipentStudentData': stipentStudentData,
            'dormitoryData': dormitoryData,
            'familyData': familyData,
        }

        return request.send_data(datas)


@permission_classes([IsAuthenticated])
class StudentDetailAPIView(
    generics.GenericAPIView,
    mixins.RetrieveModelMixin,
    mixins.CreateModelMixin,
    mixins.UpdateModelMixin
):
    """ Оюутны мэдээлэл дэлгэрэнгүй хэсэг """

    queryset = Student.objects
    serializer_class = StudentInfoSerializer

    def get(self, request, pk=None):
        """ pk: student_id """

        sdatas = self.retrieve(request, pk).data

        return request.send_data(sdatas)

    @transaction.atomic
    def put(self, request, pk=None):

        self.serializer_class = StudentRegisterSerializer
        data = request.data.dict()

        image = data.get('image')
        change_image = str2bool(data.get("change_image"))
        instance = self.get_object()

        data = null_to_none(data)

        data['updated_user'] = request.user.pk

        # хуучин зураг
        old_image = instance.image

        data = remove_key_from_dict(data, 'image')

        if data.get('pay_type') == '0':
            data['pay_type'] = Student.OTHER

        if change_image and old_image:
            remove_image = os.path.join(settings.STUDENTS, str(instance.id))
            remove_folder(remove_image)

        if not change_image and instance.image:
            data['image'] = old_image

        if change_image and image:
            data['image'] = image

        try:
            serializer = self.get_serializer(instance, data=data)
            if not serializer.is_valid(raise_exception=False):
                return request.send_error_valid(serializer.errors)

            serializer.save()

            # Оюутны мэдээллээ засахад нэвтрэх нэрийг засах
            StudentLogin.objects.filter(student=pk).update(
                username=data.get('code')
            )
            return request.send_info("INF_002", serializer.data)

        except Exception as e:
            print(e)
            return request.send_error("ERR_002")


@permission_classes([IsAuthenticated])
class StudentFamilyAPIView(
    generics.GenericAPIView,
    mixins.CreateModelMixin,
    mixins.DestroyModelMixin,
    mixins.UpdateModelMixin
):
    """ Оюутны гэр бүлийн байдал """

    queryset = StudentFamily.objects
    serializer_class = StudentFamilySerializer

    def get(self, request, pk=None, student=None):

        queryset = self.queryset.filter(student_id=student)
        datas = self.get_serializer(queryset, many=True).data

        return request.send_data(datas)

    @transaction.atomic
    def post(self, request):

        request_data = request.data
        serializer = self.get_serializer(data=request_data)

        # transaction savepoint зарлах нь хэрэв алдаа гарвад roll back хийнэ
        sid = transaction.savepoint()

        try:
            serializer = self.serializer_class(data=request_data, many=False)
            if not serializer.is_valid():
                transaction.savepoint_rollback(sid)
                return request.send_error_valid(serializer.errors)

            serializer.save()

        except Exception:
            return request.send_error("ERR_002")

        return request.send_info("INF_001")

    @transaction.atomic
    def put(self, request, student=None, pk=None):
        data = request.data
        instance = self.get_object()

        try:
            serializer = self.get_serializer(instance, data=data)
            if not serializer.is_valid(raise_exception=False):
                return request.send_error_valid(serializer.errors)

            self.perform_update(serializer)

        except Exception as e:
            print(e)
            return request.send_error("ERR_002")

        return request.send_info("INF_002")

    def delete(self, request, student=None, pk=None):

        self.destroy(request, pk)

        return request.send_info("INF_003")


@permission_classes([IsAuthenticated])
class StudentEducationAPIView(
    generics.GenericAPIView,
    mixins.CreateModelMixin,
    mixins.DestroyModelMixin,
    mixins.UpdateModelMixin
):
    """ Оюутны боловсрол """

    queryset = StudentEducation.objects
    serializer_class = StudentEducationSerializer

    def get(self, request, pk=None, student=None):
        self.serializer_class = StudentEducationListSerializer

        queryset = self.queryset.filter(student_id=student)
        datas = self.get_serializer(queryset, many=True).data

        return request.send_data(datas)

    @transaction.atomic
    def post(self, request):

        request_data = request.data
        serializer = self.get_serializer(data=request_data)

        # transaction savepoint зарлах нь хэрэв алдаа гарвад roll back хийнэ
        sid = transaction.savepoint()

        try:
            serializer = self.serializer_class(data=request_data, many=False)
            if not serializer.is_valid():
                transaction.savepoint_rollback(sid)
                return request.send_error_valid(serializer.errors)

            serializer.save()

        except Exception:
            return request.send_error("ERR_002")

        return request.send_info("INF_001")

    @transaction.atomic
    def put(self, request, student=None, pk=None):
        data = request.data
        instance = self.get_object()

        try:
            serializer = self.get_serializer(instance, data=data)
            if not serializer.is_valid(raise_exception=False):
                return request.send_error_valid(serializer.errors)

            self.perform_update(serializer)

        except Exception as e:
            print(e)
            return request.send_error("ERR_002")

        return request.send_info("INF_002")

    def delete(self, request, student=None, pk=None):

        self.destroy(request, pk)

        return request.send_info("INF_003")


@permission_classes([IsAuthenticated])
class StudentAddressAPIView(
    generics.GenericAPIView,
    mixins.CreateModelMixin,
    mixins.DestroyModelMixin,
    mixins.UpdateModelMixin
):
    """ Оюутны гэр бүлийн байдал """

    queryset = StudentAddress.objects
    serializer_class = StudentAddressListSerializer

    def get(self, request, pk=None, student=None):

        queryset = self.queryset.filter(student_id=student)
        datas = self.get_serializer(queryset, many=True).data

        return request.send_data(datas)

    @transaction.atomic
    def post(self, request, pk=None, student=None):

        data = request.data
        serializer = self.get_serializer(data=data, many=False)

        # qs = self.queryset.filter(student_id=student)

        try:
            if serializer.is_valid(raise_exception=False):
                obj, created = self.queryset.filter(student_id=student).update_or_create(
                    student_id=student,
                    defaults={
                        "passport_unit1_id": AimagHot.objects.get(pk=data.get('passport_unit1')).pk if data.get('passport_unit1') else None,
                        "passport_unit2_id": SumDuureg.objects.get(pk=data.get('passport_unit2')).pk if data.get('passport_unit2') else None,
                        "passport_unit3_id": SumDuureg.objects.get(pk=data.get('passport_unit3')).pk if data.get('passport_unit3') else None,
                        'passport_toot': data.get('passport_toot'),
                        'passport_other': data.get('passport_other'),
                        "lived_unit1": data.get('lived_unit1'),
                        "lived_unit2": data.get('lived_unit2'),
                        "lived_unit3": data.get('lived_unit3'),
                        'lived_toot': data.get('lived_toot'),
                        'lived_other': data.get('lived_other')
                    }
                )

                # if student:
                #     check_qs = StudentAddress.objects.filter(student=student)

                #     if check_qs:
                #         check_qs.update(
                #             passport_unit1 = AimagHot.objects.get(pk=data.get('passport_unit1')).pk if data.get('passport_unit1') else None,
                #             passport_unit2 = SumDuureg.objects.get(pk=data.get('passport_unit2')).pk if data.get('passport_unit2') else None,
                #             passport_unit3 = SumDuureg.objects.get(pk=data.get('passport_unit3')).pk if data.get('passport_unit3') else None,
                #             passport_toot = data.get('passport_toot'),
                #             passport_other = data.get('passport_other'),
                #             lived_unit1 = data.get('lived_unit1'),
                #             lived_unit2 = data.get('lived_unit2'),
                #             lived_unit3 = data.get('lived_unit3'),
                #             lived_toot = data.get('lived_toot'),
                #             lived_other = data.get('lived_other')
                #         )
                #     else:
                #         obj = StudentAddress.objects.create(
                #             student=Student.objects.get(pk=student),
                #             passport_unit1 = AimagHot.objects.get(pk=data.get('passport_unit1')) if data.get('passport_unit1') else None,
                #             passport_unit2 = SumDuureg.objects.get(pk=data.get('passport_unit2')) if data.get('passport_unit2') else None,
                #             passport_unit3 = SumDuureg.objects.get(pk=data.get('passport_unit3')) if data.get('passport_unit3') else None,
                #             passport_toot = data.get('passport_toot'),
                #             passport_other = data.get('passport_other'),
                #             lived_unit1 = data.get('lived_unit1'),
                #             lived_unit2 = data.get('lived_unit2'),
                #             lived_unit3 = data.get('lived_unit3'),
                #             lived_toot = data.get('lived_toot'),
                #             lived_other = data.get('lived_other')
                #         )
            else:
                return request.send_error_valid(serializer.errors)

        except Exception as e:
            print(e)
            return request.send_error("ERR_002")

        return request.send_info("INF_001")


@permission_classes([IsAuthenticated])
class StudentAdmissionAPIView(
    generics.GenericAPIView,
    mixins.CreateModelMixin,
    mixins.DestroyModelMixin,
    mixins.UpdateModelMixin
):
    """ Оюутны ЭЕШ-ийн оноо """

    queryset = StudentAdmissionScore.objects
    serializer_class = StudentAdmissionScoreSerializer

    def get(self, request, pk=None, student=None):
        self.serializer_class = StudentAdmissionScoreListSerializer

        queryset = self.queryset.filter(student_id=student)
        datas = self.get_serializer(queryset, many=True).data

        return request.send_data(datas)

    @transaction.atomic
    def post(self, request):
        """
            ЭЕШ-ын оноо шинээр бүртгэх
            confirmation_num: ЭЕШ-ын батламжийн дугаар
        """

        request_data = request.data
        serializer = self.get_serializer(data=request_data)

        # transaction savepoint зарлах нь хэрэв алдаа гарвад roll back хийнэ
        sid = transaction.savepoint()

        lesson = request_data.get("admission_lesson")
        confirmation_num = request_data.get("confirmation_num")
        if confirmation_num:
            qs = self.queryset.filter(confirmation_num=confirmation_num)
            if qs:
                return request.send_error("ERR_002", "Энэ батламжийн дугаар давхцаж байна")

        if lesson:
            qs = self.queryset.filter(admission_lesson_id=lesson)
            if qs:
                return request.send_error("ERR_002", "Энэ хичээл бүртгэгдсэн байна")

        try:
            serializer = self.serializer_class(data=request_data, many=False)
            if not serializer.is_valid():
                transaction.savepoint_rollback(sid)
                return request.send_error_valid(serializer.errors)

            serializer.save()

        except Exception:
            return request.send_error("ERR_002")

        return request.send_info("INF_001")

    @transaction.atomic
    def put(self, request, student=None, pk=None):
        data = request.data
        instance = self.get_object()

        try:
            serializer = self.get_serializer(instance, data=data)
            if not serializer.is_valid(raise_exception=False):
                return request.send_error_valid(serializer.errors)

            self.perform_update(serializer)

        except Exception as e:
            print(e)
            return request.send_error("ERR_002")

        return request.send_info("INF_002")

    def delete(self, request, student=None, pk=None):

        self.destroy(request, pk)

        return request.send_info("INF_003")


class StudentGroupAPIView(
    generics.GenericAPIView,
    mixins.ListModelMixin
):
    """ Тухайн ангиас бусад оюутны жагсаалт авах """

    queryset = Student.objects
    serializer_class  = StudentListSerializer

    def get_queryset(self):
        st_time = start_time()
        queryset = self.queryset
        group_ids = self.request.query_params.getlist('group_ids')

        # Оюутан авах төрөл
        get_type = self.request.query_params.get('type')

        if len(group_ids) > 0:
            # Нэмэх оюутан
            if str2bool(get_type):
                queryset = queryset.exclude(group_id__in=group_ids)
            else:
                queryset = queryset.filter(group_id__in=group_ids)

        return queryset

    def get(self, request):

        student_list = self.list(request).data
        return request.send_data(student_list)


@permission_classes([IsAuthenticated])
class StudentLessonListAPIView(
    mixins.ListModelMixin,
    generics.GenericAPIView
):
    """
        Шалгалтын хуваарьт ашиглагдах тухайн хичээлийг үзэж байгаа оюутнуудын жагсаалт
    """

    queryset = Student.objects.all()
    serializer_class = StudentListSerializer

    def get(self, request, lessonId):

        examId = self.request.query_params.get('exam')
        school_id = self.request.query_params.get('schoolId')
        group_limit = self.request.query_params.get('group_limit')
        lesson_year = self.request.query_params.get('lesson_year')
        lesson_season = self.request.query_params.get('lesson_season')

        check_exam_ids = []
        exam_check_student_ids = []

        # Сургуулиар хайлт хийх
        if school_id:
            self.queryset = self.queryset.filter(school=school_id)

        # Тухайн хичээлийн шалгалтыг өгөх боломжтой оюутан
        if school_id:
            if examId:
                # Засах үед
                check_exam_ids = ExamTimeTable.objects.filter(
                        school=school_id,
                        lesson_year=lesson_year,
                        lesson_season=lesson_season,
                        lesson=lessonId,
                    ).exclude(id=examId).values_list('id', flat=True)

            else:
                check_exam_ids = ExamTimeTable.objects.filter(
                        school=school_id,
                        lesson_year=lesson_year,
                        lesson_season=lesson_season,
                        lesson=lessonId,
                    ).values_list('id', flat=True)

        if check_exam_ids:
            # Тухайн хичээлийн шалгалтын хуваарьт орсон оюутаны id

            exam_check_student_ids = Exam_to_group.objects.filter(
                    exam__in=check_exam_ids,
                ).values_list('student', flat=True)

        all_student = get_lesson_choice_student(
                lesson=lessonId,
                lesson_year=lesson_year,
                lesson_season=lesson_season,
                school=school_id
            )

        self.queryset = self.queryset.filter(
                id__in=all_student
            ).exclude(id__in=exam_check_student_ids)

        all_list = self.list(request).data

        if examId:
            exam_student_ids = Exam_to_group.objects.filter(
                    exam=examId,
                    exam__lesson=lessonId
                ).values_list('student', flat=True)

            for result in all_list:
                for id in exam_student_ids:
                    if id == result.get('id'):
                        result['selected'] = True

        elif group_limit:
            count = 0
            for result in all_list:
                count += 1
                result['selected'] = False
                if int(group_limit) >= count:
                    result['selected'] = True

        else:
            for result in all_list:
                result['selected'] = True

        return request.send_data(all_list)


# TODO эрхүүдийг шалгах
# @permission_classes([IsAuthenticated])
class StudentLeaveAPIView(
    generics.GenericAPIView,
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    mixins.RetrieveModelMixin,
):
    """ Оюутны чөлөөний бүртгэл """

    queryset = StudentLeave.objects.all()
    serializer_class = StudentLeaveSerializer

    pagination_class = CustomPagination
    filter_backends = [SearchFilter]
    search_fields = ['student__code', 'student__first_name', 'student__last_name', 'register_status__name', 'learn_week', 'statement', 'statement_date', 'lesson_year']

    def get_queryset(self):
        queryset = self.queryset
        lesson_year = self.request.query_params.get('year')
        register_status = self.request.query_params.get('state')
        school = self.request.query_params.get('school')

        if school:
            queryset = queryset.filter(school_id=school)

        # Хичээлийн жилээр хайлт хийх
        if lesson_year:
            queryset = queryset.filter(lesson_year=lesson_year)

        # Бүртгэлийн хэлбэр хайлт хийх
        if register_status:
            queryset = queryset.filter(register_status_id=register_status)

        return queryset

    @has_permission(must_permissions=['lms-student-leave-read'])
    def get(self, request, pk=None):
        self.serializer_class = StudentLeaveListSerailizer

        if pk:
            leave_info = self.retrieve(request, pk).data
            return request.send_data(leave_info)

        leave_list = self.list(request).data
        return request.send_data(leave_list)

    @has_permission(must_permissions=['lms-student-leave-create'])
    @transaction.atomic
    def post(self, request):
        " Оюутны чөлөөний бүртгэл үүсгэх "

        data = request.data
        student = data.get("student")
        register_status = data.get('register_status')
        serializer = self.get_serializer(data=data)

        # transaction savepoint зарлах нь хэрэв алдаа гарвад roll back хийнэ
        sid = transaction.savepoint()

        score_info = self.queryset.filter(student_id=student)

        if score_info:
            return request.send_error('ERR_002', 'Оюутан бүртгэгдсэн байна')

        try:
            serializer = self.serializer_class(data=data, many=False)
            if not serializer.is_valid():
                transaction.savepoint_rollback(sid)
                return request.send_error_valid(serializer.errors)

            status_obj = StudentRegister.objects.get(pk=register_status)

            # Оюутны төлөвийг өөрчлөх
            Student.objects.filter(pk=student).update(status=status_obj)

            serializer.save()

        except Exception:
            return request.send_error("ERR_002")

        return request.send_info("INF_001")

    @has_permission(must_permissions=['lms-student-leave-update'])
    @transaction.atomic
    def put(self, request, student=None, pk=None):
        data = request.data
        instance = self.get_object()

        student_leave = self.queryset.filter(student_id=student).exclude(id=pk)

        if student_leave:
            return request.send_error('ERR_002', 'Оюутан бүртгэгдсэн байна')

        try:
            serializer = self.get_serializer(instance, data=data)
            if not serializer.is_valid(raise_exception=False):
                return request.send_error_valid(serializer.errors)

            self.perform_update(serializer)

        except Exception as e:
            print(e)
            return request.send_error("ERR_002")

        return request.send_info("INF_002")

    @has_permission(must_permissions=['lms-student-leave-delete'])
    def delete(self, request, pk=None):
        "Оюутны чөлөөний бүртгэл устгах "

        self.destroy(request, pk)
        return request.send_info("INF_003")


class StudentLeaveStudentsAPIView(
    generics.GenericAPIView
):
    @has_permission(must_permissions=['lms-student-leave-update'])
    @transaction.atomic
    def put(self, request):

        data = request.data

        StudentLeave.objects.filter(id__in=data.get('student_ids')).update(statement=data.get('statement'), statement_date=data.get('statement_date'))

        return request.send_info("INF_002")


@permission_classes([IsAuthenticated])
class GraduationWorkAPIView(
    mixins.CreateModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    mixins.RetrieveModelMixin,
    mixins.ListModelMixin,
    generics.GenericAPIView
):
    queryset = GraduationWork.objects.all().order_by('-updated_at')
    serializer_class = GraduationWorkSerializer

    pagination_class = CustomPagination

    filter_backends = [SearchFilter]

    search_fields = ['student__code', 'student__first_name', 'diplom_num', 'lesson__code', 'lesson__name', 'diplom_topic', 'leader', 'student__register_num', 'student__last_name', 'registration_num']

    @has_permission(must_permissions=['lms-student-graduate-read'])
    def get(self, request, pk=None):
        " Төгсөлтийн ажил жагсаалт "

        self.serializer_class = GraduationWorkListSerailizer

        department = self.request.query_params.get('department')
        degree = self.request.query_params.get('degree')
        school = self.request.query_params.get('school')
        group = self.request.query_params.get('group')

        # lesson_year, lesson_season = get_active_year_season()

        # self.queryset = self.queryset.filter(lesson_year=lesson_year, lesson_season=lesson_season)

        if school:
            self.queryset = self.queryset.filter(student__school_id=school)

        if department:
            self.queryset = self.queryset.filter(student__department_id=department)

        if degree:
            self.queryset = self.queryset.filter(student__group__degree_id=degree)

        if group:
            self.queryset = self.queryset.filter(student__group_id=group)

        if pk:
            graduation_info = self.retrieve(request, pk).data
            return request.send_data(graduation_info)

        graduation_list = self.list(request).data

        return request.send_data(graduation_list)

    @has_permission(must_permissions=['lms-student-graduate-create'])
    @transaction.atomic
    def post(self, request):
        " Төгсөлтийн ажил шинээр үүсгэх "

        # transaction savepoint зарлах нь хэрэв алдаа гарвад roll back хийнэ
        sid = transaction.savepoint()

        data = request.data
        lesson_ids = data['lesson']

        if lesson_ids and None in lesson_ids:
            return request.send_error('ERR_002', 'Дипломын хичээл сонгоно уу')

        del data['lesson']
        student = data.get("student")

        graduate_info = self.queryset.filter(student=student)
        if graduate_info:
            return request.send_error('ERR_002', 'Оюутан бүртгэгдсэн байна')

        try:
            serializer = self.serializer_class(data=data, many=False)
            if not serializer.is_valid():
                transaction.savepoint_rollback(sid)
                return request.send_error_valid(serializer.errors)

            created_qs = self.create(request).data
            created_qs = self.queryset.get(id=created_qs.get("id"))
            created_qs.lesson.add(*lesson_ids)

        except Exception as e:
            print(e)
            return request.send_error("ERR_002")

        return request.send_info("INF_001")

    @has_permission(must_permissions=['lms-student-graduate-update'])
    def put(self, request, pk=None):
        "Төгсөлтийн ажил засах"

        data = request.data
        lesson_ids = data['lesson']
        del data['lesson']

        student = data.get("student")
        instance = self.get_object()

        if 'diplom_qr' in data:
            del data['diplom_qr']

        student_qs = self.queryset.filter(student_id=student).exclude(id=pk)
        if student_qs:
            return request.send_error('ERR_002', 'Оюутан бүртгэгдсэн байна')

        try:
            serializer = self.get_serializer(instance, data=data)
            if not serializer.is_valid(raise_exception=False):
                return request.send_error_valid(serializer.errors)

            updated_qs = self.update(request).data
            updated_qs = self.queryset.get(id=updated_qs.get("id"))
            # updated_qs.lesson.all().remove()
            updated_qs.lesson.clear()
            updated_qs.lesson.add(*lesson_ids)

        except Exception as e:
            print(e)
            return request.send_error("ERR_002")

        return request.send_info("INF_002")

    @has_permission(must_permissions=['lms-student-graduate-delete'])
    def delete(self, request, pk=None):
        " Төгсөлтийн ажил устгах "

        obj = self.get_object()

        # Хавсралтын хичээлүүдийг устгах
        CalculatedGpaOfDiploma.objects.filter(student=obj.student).delete()
        self.destroy(request, pk)
        return request.send_info("INF_003")


@permission_classes([IsAuthenticated])
class GraduationWorkImportAPIView(
    generics.GenericAPIView
):
    """ Төгсөлтийн ажил загвар файл оруулах """

    queryset = GraduationWork.objects
    def post(self, request):
        data = request.data

        file = data.get('file')

        # Файл түр хадгалах
        path = save_file(file, 'tugsult', 1)

        full_path = os.path.join(settings.MEDIA_ROOT, str(path))

        reader = openpyxl_dictreader.DictReader(full_path)
        for row in reader:
            student_code = row.get('Оюутны код')
            registration_num = row.get('* Бүртгэлийн дугаар')
            diplom_num = row.get('* Дипломын дугаар')
            eysh_score = row.get('ЭШ-ийн шалгалтын оноо')
            secondary_school = row.get('Өмнөх шатны боловсролын үнэлгээний дундаж оноо')
            shalgalt_onoo = row.get('Дипломын ажлын оноо')
            back_diplom_num = row.get('Өмнөх боловсролын дипломын дугаар')

            student_obj = Student.objects.get(code=student_code)
            with transaction.atomic():

                # Төгсөлтийн ажлыг шинэчлэх хэсэг
                GraduationWork.objects.filter(student=student_obj).update(
                    shalgalt_onoo=shalgalt_onoo if shalgalt_onoo else None,
                    back_diplom_num=back_diplom_num if back_diplom_num else None,
                )

                # Хэрвээ дипломын дугаар байвал update хийнэ
                if registration_num:
                    GraduationWork.objects.filter(student=student_obj).update(
                        registration_num=registration_num,
                    )

                # Хэрвээ дипломын дугаар байвал update хийнэ
                if diplom_num:
                    GraduationWork.objects.filter(student=student_obj).update(
                        diplom_num=diplom_num,
                    )

                # ЭЕШ-н оноо болон Өмнөх шатны боловсролын үнэлгээний дундаж оноо хадгалах
                if eysh_score:
                    student_obj.eysh_score = eysh_score

                if secondary_school:
                    student_obj.secondary_school = secondary_school

                student_obj.save()

        # Хадгалсны дараа файл устгах
        remove_folder(path)

        return request.send_info('INF_002')

class StudentGraduateListAPIView(
    generics.GenericAPIView,
    mixins.ListModelMixin
):
    """ Төгсөлтийн оюутан бүртгэлийг жагсаалт """

    queryset = Student.objects.all()
    serializer_class = StudentListSerializer

    def get_queryset(self):
        queryset = self.queryset
        school = self.request.query_params.get('school')
        department = self.request.query_params.get('department')
        degree = self.request.query_params.get('degree')
        group = self.request.query_params.get('group')

        if school:
            queryset = queryset.filter(school_id=school)

        if department:
            queryset = queryset.filter(department_id=department)

        if degree:
            queryset = queryset.filter(group__degree_id=degree)

        if group:
            queryset = queryset.filter(group_id=group)

        return queryset

    def get(self, request):
        student_list = self.list(request).data
        return request.send_data(student_list)

@permission_classes([IsAuthenticated])
class EducationalLoanFundAPIView(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    generics.GenericAPIView
):
    """ Боловсролын зээлийн сан жагсаалт """

    queryset = Student.objects.filter(pay_type=Student.LEL)

    serializer_class = EducationalLoanFundListSerializer
    pagination_class = CustomPagination

    filter_backends = [SearchFilter]
    search_fields = ['code', 'register_num', 'first_name', 'last_name', 'status__name', 'register_num']

    @has_permission(must_permissions=['lms-student-loanfund-read'])
    def get(self, request, pk=None):
        " боловсролын зээлийн сан жагсаалт "

        queryset = self.queryset
        schoolId = request.query_params.get('school')
        degree = request.query_params.get('degree')
        group = request.query_params.get('group')
        sorting = request.query_params.get('sorting')

        if schoolId:
            queryset = queryset.filter(school=schoolId)

        # Зэрэг
        if degree:
            queryset = queryset.filter(group__degree_id=degree)

        # анги
        if group:
            queryset = queryset.filter(group_id=group)

        if sorting:
            if not isinstance(sorting, str):
                sorting = str(sorting)

            queryset = queryset.order_by(sorting)

        self.queryset = queryset

        edu_list = self.list(request).data

        return request.send_data(edu_list)


class GroupTimetableAPIView(
    generics.GenericAPIView,
):
    """ Тухайн хичээл сургалтын төлөвлөгөөнд багтсан мэргэжлийн ангийг авах """

    def get(self, request, lesson=None):

        school = request.query_params.get('school')
        qs_group = Group.objects.all().order_by('name')
        # professions = LearningPlan.objects.filter(lesson=lesson).values_list('profession', flat=True)

        # if school:
        #     qs_group = qs_group.filter(school=school)

        groups = qs_group.values('id', 'name')

        return request.send_data(list(groups))


@permission_classes([IsAuthenticated])
class StudentDefinitionListAPIView(
    mixins.ListModelMixin,
    generics.GenericAPIView
):
    """ Тодорхойлолт
    """

    queryset = Student.objects.all()
    serializer_class = StudentListSerializer

    pagination_class = CustomPagination

    filter_backends = [SearchFilter]
    search_fields = ['department__name', 'code', 'first_name', 'last_name', 'register_num']

    def get(self, request):
        "Оюутны бүртгэл жагсаалт"

        schoolId = request.query_params.get('school')

        if schoolId:
            self.queryset = self.queryset.filter(school=schoolId)

        student_list = self.list(request).data
        return request.send_data(student_list)


@permission_classes([IsAuthenticated])
class SignatureAPIView(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    generics.GenericAPIView
):
    """ Гарын үсэг
    """

    queryset = SignaturePeoples.objects.all()
    serializer_class = SignaturePeoplesSerializer

    def get(self, request):

        dedication_type = self.request.query_params.get('type')
        school_id = request.query_params.get('school_id')

        if school_id:
            self.queryset = self.queryset.filter(school_id=school_id)

        qs = self.queryset.filter(dedication_type=dedication_type).order_by('order')
        data = self.serializer_class(qs, many=True).data

        return request.send_data(data)

    @transaction.atomic
    def post(self, request):

        data = request.data

        order = 1

        max_order = SignaturePeoples.objects.aggregate(Max('order')).get('order__max')
        if max_order:
            order = max_order + 1

        data['order'] = order
        data['is_order'] = True

        try:
            serializer = self.serializer_class(data=data, many=False)
            if not serializer.is_valid():
                return request.send_error_valid(serializer.errors)

            serializer.save()

        except Exception:
            return request.send_error("ERR_002")

        return request.send_info("INF_001")

    def put(self, request, pk=None):

        data = request.data

        instance = self.get_object()

        try:
            serializer = self.get_serializer(instance, data=data)
            if not serializer.is_valid(raise_exception=False):
                return request.send_error_valid(serializer.errors)

            self.update(request).data

        except Exception as e:
            print(e)
            return request.send_error("ERR_002")

        return request.send_info("INF_002")

    def delete(self, request, pk=None):
        " Төгсөлтийн ажил устгах "

        self.destroy(request, pk)
        return request.send_info("INF_003")


@permission_classes([IsAuthenticated])
class SignatureChangeOrderApiView(
    generics.GenericAPIView
):
    """ order-ийг солих
    """

    queryset = SignaturePeoples.objects

    def post(self, request):

        dedication_type_num = self.request.query_params.get('type')

        from_id = request.data.get('from_id')
        to_id = request.data.get('to_id')

        from_qs = self.queryset.filter(id=from_id)
        from_order = from_qs.last().order

        to_qs = self.queryset.filter(id=to_id)
        to_order = to_qs.last().order

        is_up = from_order > to_order

        if is_up:

            reduce_order_values = self.queryset.filter(dedication_type=dedication_type_num, order__lt=from_order, order__gte=to_order).order_by('order')

            for x in range(reduce_order_values.__len__()):
                if x == reduce_order_values.__len__() - 1:
                    reduce_order_values[x].order = from_order
                else:
                    reduce_order_values[x].order = reduce_order_values[x + 1].order

                reduce_order_values[x].save()

        else:

            reduce_order_values = self.queryset.filter(dedication_type=dedication_type_num, order__gt=from_order, order__lte=to_order).order_by('-order')

            for x in range(reduce_order_values.__len__()):
                if x == reduce_order_values.__len__() - 1:
                    reduce_order_values[x].order = from_order
                else:
                    reduce_order_values[x].order = reduce_order_values[x + 1].order

                reduce_order_values[x].save()

        from_qs.update(order=to_order)

        return request.send_info("INF_013")


@permission_classes([IsAuthenticated])
class StudentDefinitionValueListAPIView(
    generics.GenericAPIView
):
    """ Оюутны тодорхойлолтын утгууд
    """

    @has_permission(must_permissions=['lms-student-definition-read'])
    def get(self, request):

        all_data = dict()

        type = self.request.query_params.get('type')
        student_id = self.request.query_params.get('id')

        student_qs = Student.objects.get(id=student_id)
        school_qs = Schools.objects.all().first()

        year, season = get_active_year_season()
        season_name = 'Намар'

        school_data = BigSchoolsSerializer(school_qs, many=False).data

        all_data['school'] = school_data

        student_data = StudentDefinitionSerializer(student_qs, many=False).data

        if type == 'def3':
            score_register_qs = ScoreRegister.objects.filter(student=student_qs, is_delete=False)
            score_register_data = ScoreRegisterDefinitionSerializer(score_register_qs, many=True).data

            all_data['score_register'] = score_register_data

        if type == 'def2':

            name = Season.objects.get(id=season)

            if name.season_name == 'Намар':
                season_name = 'Хавар'

            season = Season.objects.filter(season_name__contains=season_name).first()

            splitted_list = student_qs.group.join_year.split('-')

            start_year = int(splitted_list[0]) # Анги эхэлсэн жил

            year_split =  year.split('-')

            now_end_year = int(year_split[1]) # Active хичээлийн жил дууссан жил

            now_kurs = now_end_year - start_year # Тухайн ангийн одоо байгаа курс

            # Сургалтын төлөвлөгөө дээр улирал нь тэгш байна
            if season_name == 'Хавар':
                learn_season = now_kurs * 2
                seasons = [str(val * 2) for val in range(1,learn_season)]
            else:
                learn_season = (now_kurs * 2) - 1
                seasons = [str((val * 2) + 1 ) for val in range(1, learn_season)]

            lookups = [Q(season__contains=str(value)) for value in seasons]

            filter_query = Q()
            for lookup in lookups:
                filter_query |= lookup

            season_lessons = LearningPlan.objects.filter(profession=student_qs.group.profession).filter(filter_query).values_list('lesson', flat=True)

            scores_lesson = ScoreRegister.objects.filter(student=student_qs, lesson__in=season_lessons).annotate(score_total=Coalesce(F('exam_score'), 0, output_field=FloatField()) + Coalesce(F('teach_score'), 0, output_field=FloatField())).filter(score_total__lt=50).values_list('lesson', flat=True)

            # Ирэх улиралд үзэх сургалтын төлөвлөгөөний хичээлийг авах
            lessons = LearningPlan.objects.filter(profession=student_qs.group.profession, season__contains=learn_season).values_list('lesson', flat=True)

            all_lessons = list(lessons) + list(scores_lesson)

            study_kredits = LessonStandart.objects.filter(id__in=all_lessons).annotate(kr_count=F('kredit')).values('id', 'name', 'kr_count')

            all_data['study_kredit'] = list(study_kredits)

        student_data['lesson_year'] = year
        student_data['lesson_season'] = season_name

        all_data['student'] = student_data

        return request.send_data(all_data)


class StudentSeasonOptionAPIView(
    generics.GenericAPIView
):
    """ Оюутны боломжит жил
    """

    queryset = ScoreRegister.objects

    def get(self, request):

        code = request.query_params.get('code')

        year_datas = self.queryset.filter(student__id=code).values_list('lesson_year', flat=True).distinct()
        season_qs = Season.objects.all()
        season_datas = SeasonSerializer(season_qs, many=True).data

        data = {
            'have_dun': year_datas.__len__() != 0,
            'year': list(year_datas),
            'season': season_datas
        }

        return request.send_data(data)


class DefinitionSumAPIView(
    generics.GenericAPIView
):
    """ Голч дүн
    """

    queryset = Student.objects
    serializer_class = StudentInfoSerializer

    def post(self, request):

        data = request.data
        all_data = dict()

        student_id = data.get('student_id')

        student_qs = Student.objects.get(id=student_id)
        school_qs = SubOrgs.objects.filter(id=student_qs.school.id).first()
        school_data = SchoolSerializer(school_qs, many=False).data
        student_data = StudentDefinitionSerializer(student_qs, many=False).data

        all_data['school'] = school_data
        all_data['student'] = student_data

        if data.get('all_year') == True:
            score = get_student_score_register(student_id)
        else:
            score = get_student_score_register(student_id, data.get('season_code'), data.get('year_value'))

            season_name = ''
            season_name_eng = ''
            if data.get('season_code'):
                season_name = Season.objects.filter(season_code=data.get('season_code')).first().season_name
                season_name_eng = Season.objects.filter(season_code=data.get('season_code')).first().season_name_eng

            all_data['season_name'] = season_name
            all_data['season_name_eng'] = season_name_eng

        # if score['total_kr'] == 0:
        #     return request.send_data(all_data)

        all_data['score'] = score
        return request.send_data(all_data)


@permission_classes([IsAuthenticated])
class StudentScoreRegisterAPIView(
    generics.GenericAPIView
):

    def get(self, request):

        all_data = dict()

        student_id = self.request.query_params.get('id')

        student_qs = Student.objects.get(id=student_id)
        student_data = StudentAttachmentSerializer(student_qs, many=False).data

        score_register_qs = ScoreRegister.objects.filter(student=student_qs, is_delete=False)
        score_register_data = ScoreRegisterDefinitionSerializer(score_register_qs, many=True).data

        calculated_gpa_qs_count = CalculatedGpaOfDiploma.objects.filter(student_id=student_id).count()

        all_data['score_register'] = score_register_data
        all_data['student'] = student_data
        all_data['calculated_length'] = calculated_gpa_qs_count

        return request.send_data(all_data)


@permission_classes([IsAuthenticated])
class StudentCalculateGpaDiplomaAPIView(
    generics.GenericAPIView
):

    def get(self, request):

        student_id = self.request.query_params.get('id')
        calculated_gpa_qs = CalculatedGpaOfDiploma.objects.filter(student_id=student_id).values_list('lesson', flat=True)

        return request.send_data(list(calculated_gpa_qs))

    def post(self, request):

        student_id = self.request.query_params.get('id')

        # Тухайн оюутаны бүх эхлээд устгах
        calculated_gpa_qs = CalculatedGpaOfDiploma.objects.filter(student_id=student_id)
        calculated_gpa_qs.delete()

        grouped_datas = dict()
        grouped_ids = list()

        profession_obj = Student.objects.get(pk=student_id).group.profession

        # Оюутны бүх дүн
        all_score_register_qs = ScoreRegister.objects.filter(lesson_id__in=request.data, student_id=student_id)

        # Оюутны дүнтэй хичээлүүд
        lesson_ids = all_score_register_qs.values_list('lesson', flat=True)

        # Багцлагдсан хичээлүүдийг багцалсан хичээлүүдийг аварх
        bagtsad_hariyalagdah = LearningPlan.objects.filter(lesson__in=lesson_ids, profession=profession_obj, group_lesson__isnull=False).values_list('group_lesson', flat=True).distinct()

        # Багцалсан хичээлээр багцлуусан хичээлүүдийг авах
        for bagtsad_hariyalagdah_id in bagtsad_hariyalagdah:
            grouped_lessons_ids = LearningPlan.objects.filter(lesson__in=lesson_ids, profession=profession_obj, group_lesson=bagtsad_hariyalagdah_id).values_list('lesson', flat=True)

            # Багц хичээлд хамаарагдах хичээлүүд
            grouped_datas[bagtsad_hariyalagdah_id] = grouped_lessons_ids

            # Багцлуулсан хичээлүүдийн ids
            grouped_ids.extend(grouped_lessons_ids)

        # Нийт хичээлээс багцлуулсан хичээлүүдийг хасч үлдсэн хичээлийг авах
        unique_ids = list(set(lesson_ids) - set(grouped_ids)  - set(bagtsad_hariyalagdah))

        # Багцалсан хичээлээр
        for grouped_data in grouped_datas:

            # Багц хичээлийн нийт кредитийг олох
            score_register_kredit_sum = ScoreRegister.objects.filter(lesson__in=grouped_datas[grouped_data], student_id=student_id).aggregate(Sum('lesson__kredit')).get('lesson__kredit__sum')

            # Багц хичээлийн нийт дүнг олох
            score_register_score_sum = ScoreRegister.objects.filter(lesson__in=grouped_datas[grouped_data], student_id=student_id).aggregate(total=Sum(Coalesce(Coalesce(F('exam_score'), 0, output_field=FloatField()) + Coalesce(F('teach_score'), 0, output_field=FloatField()), 0, output_field=FloatField()) * F('lesson__kredit'))).get('total')

            if score_register_score_sum != 0:
                # Дундаж дүн
                score_register_score = round((score_register_score_sum / score_register_kredit_sum), 2)

                # Үсгэн үнэлгээ
                score_qs = Score.objects.filter(score_max__gte=score_register_score, score_min__lte=score_register_score).first()

                # Дипломын хичээл бодуулах хэсгийг үүсгэх
                created_cal_qs = CalculatedGpaOfDiploma.objects.create(
                    lesson_id=grouped_data,
                    student_id=student_id,
                    kredit=score_register_kredit_sum,
                    score=score_register_score,
                    gpa=score_qs.gpa,
                    assesment=score_qs.assesment
                )

        for unique_id in unique_ids:
            score_register_qs = ScoreRegister.objects.filter(student_id=student_id, lesson_id=unique_id).first()

            # Дипломын хичээл бодуулах хэсгийг үүсгэх
            created_cal_qs = CalculatedGpaOfDiploma.objects.create(
                lesson_id=unique_id,
                student_id=student_id, kredit=score_register_qs.lesson.kredit,
                score=((score_register_qs.teach_score or 0) + (score_register_qs.exam_score or 0)),
                gpa=score_register_qs.assessment.gpa if score_register_qs.assessment else None,
                assesment=score_register_qs.assessment.assesment if score_register_qs.assessment else None,
                grade_letter=score_register_qs.grade_letter
            )

        return request.send_info("INF_013", list(lesson_ids))


@permission_classes([IsAuthenticated])
class StudentCalculateGpaDiplomaGroupAPIView(
    generics.GenericAPIView
):
    """ Хавсралтийн дүнг ангиар нь нэг загвараар хадгалах """

    def post(self, request):
        # Загварыг нь дуурайлгах оюутан
        student_id = request.data
        grouped_datas = {}
        grouped_ids = []
        all_create_datas = []

        student_obj = Student.objects.get(pk=student_id)

        # Тухайн загвар болгох гэж оюутны хичээлүүд
        calculated_lesson_ids = CalculatedGpaOfDiploma.objects.filter(student_id=student_id).values_list('lesson', flat=True)

        # Ангийн бүх оюутнууд
        all_students_group = GraduationWork.objects.exclude(student=student_id).filter(student__group=student_obj.group).values_list('student', flat=True)

        # Өмнө нь хадгалчихсан байж байгаад дахин загвар хадгалах дарвал өмнөх загвараар хадгалсан датаг устгах
        if len(CalculatedGpaOfDiploma.objects.exclude(student=student_id).filter(student_id__in=all_students_group)) > 0:
            CalculatedGpaOfDiploma.objects.exclude(student=student_id).filter(student_id__in=all_students_group).delete()

        # Багцлагдсан хичээлүүдийг багцалсан хичээлүүдийг аварх
        bagtsad_hariyalagdah = LearningPlan.objects.filter(lesson__in=calculated_lesson_ids, profession=student_obj.group.profession, group_lesson__isnull=False).values_list('group_lesson', flat=True).distinct()

        # Багцалсан хичээлээр багцлуусан хичээлүүдийг авах
        for bagtsad_hariyalagdah_id in bagtsad_hariyalagdah:
            grouped_lessons_ids = LearningPlan.objects.filter(lesson__in=calculated_lesson_ids, profession=student_obj.group.profession, group_lesson=bagtsad_hariyalagdah_id).values_list('lesson', flat=True)

            # Багц хичээлд хамаарагдах хичээлүүд
            grouped_datas[bagtsad_hariyalagdah_id] = grouped_lessons_ids

            # Багцлуулсан хичээлүүдийн ids
            grouped_ids.extend(grouped_lessons_ids)

        # Нийт хичээлээс багцлуулсан хичээлүүдийг хасч үлдсэн хичээлийг авах
        unique_ids = list(set(calculated_lesson_ids) - set(grouped_ids))

        # Ангийн бүх хүүхдүүдээр үүсгэх датаг бэлдэх
        for one_student_id in all_students_group:
            # Багцалсан хичээлээр
            for grouped_data in grouped_datas:

                # Багц хичээлийн нийт кредитийг олох
                score_register_kredit_sum = ScoreRegister.objects.filter(lesson__in=grouped_datas[grouped_data], student_id=one_student_id).aggregate(Sum('lesson__kredit')).get('lesson__kredit__sum')

                # Багц хичээлийн нийт дүнг олох
                score_register_score_sum = ScoreRegister.objects.filter(lesson__in=grouped_datas[grouped_data], student_id=one_student_id).aggregate(total=Sum(Coalesce(Coalesce(F('exam_score'), 0, output_field=FloatField()) + Coalesce(F('teach_score'), 0, output_field=FloatField()), 0, output_field=FloatField()) * F('lesson__kredit'))).get('total')

                # Дундаж дүн
                score_register_score = round((score_register_score_sum / score_register_kredit_sum), 2)

                # Үсгэн үнэлгээ
                score_qs = Score.objects.filter(score_max__gte=score_register_score, score_min__lte=score_register_score).first()

                # Дипломын хичээл бодуулах хэсгийг үүсгэх
                created_cal_qs = CalculatedGpaOfDiploma(
                    lesson_id=grouped_data,
                    student_id=one_student_id,
                    kredit=score_register_kredit_sum,
                    score=score_register_score,
                    gpa=score_qs.gpa,
                    assesment=score_qs.assesment
                )
                all_create_datas.append(created_cal_qs)

            for unique_id in unique_ids:
                score_register_qs = ScoreRegister.objects.filter(student_id=one_student_id, lesson_id=unique_id).first()
                # Дүн байхгүй бол үргэлжлүүлэх давталтыг
                if not score_register_qs:
                    continue

                # Дипломын хичээл бодуулах хэсгийг үүсгэх
                created_cal_qs = CalculatedGpaOfDiploma(
                    lesson_id=unique_id,
                    student_id=one_student_id,
                    kredit=score_register_qs.lesson.kredit if score_register_qs else 0,
                    score=score_register_qs.score_total,
                    gpa=score_register_qs.assessment.gpa if score_register_qs.assessment else None,
                    assesment=score_register_qs.assessment.assesment if score_register_qs.assessment else None,
                    grade_letter=score_register_qs.grade_letter
                )

                all_create_datas.append(created_cal_qs)

        # Бэлдсэн бүх өгөгдлөө нэг дор хадгалах
        CalculatedGpaOfDiploma.objects.bulk_create(all_create_datas)

        return request.send_info('INF_019')


@permission_classes([IsAuthenticated])
class StudentAttachmentConfigAPIView(
    generics.GenericAPIView
):
    """ Хавсрлатын тохиргоо """

    queryset = AttachmentConfig.objects.all()

    def get(self, request):

        group = request.query_params.get('group')
        type_name = request.query_params.get('type')
        if type_name == 'mongolian':
            stype = AttachmentConfig.MONGOLIAN
        elif type_name == 'english':
            stype = AttachmentConfig.ENGLISH
        else:
            stype = AttachmentConfig.UIGARJIN

        self.queryset = self.queryset.filter(group=group, atype=stype)

        datas = self.queryset.values().first()

        return request.send_data(datas if datas else {})

    def post(self, request):
        data = request.data
        row_count = json_load(data.get('row_count'))
        type_name = data.get('type')

        if type_name == 'mongolian':
            stype = AttachmentConfig.MONGOLIAN
        elif type_name == 'english':
            stype = AttachmentConfig.ENGLISH
        else:
            stype = AttachmentConfig.UIGARJIN

        with transaction.atomic():
            self.queryset.update_or_create(
                group=Group.objects.get(pk=data.get('group')),
                atype=stype,
                defaults={
                    'row_count': row_count,
                    'is_lastname': data.get('is_lastname'),
                    'is_center': data.get('is_center'),
                    'give_date': data.get('give_date'),
                }
            )

        return request.send_info('INF_001')

@permission_classes([IsAuthenticated])
class StudentGpaDiplomaValuesAPIView(
    generics.GenericAPIView
):

    def get(self, request):

        score_assesment = ''
        max_kredit = 0
        all_score = 0
        all_gpa_score = 0
        final_score = '0.0'

        student_id = self.request.query_params.get('id')

        # Дипломын голч бодогдсон хичээлүүд
        qs = CalculatedGpaOfDiploma.objects.filter(student_id=student_id, lesson__isnull=False)

        student_prof_qs = Student.objects.get(id=student_id).group.profession

        all_data = dict()

        learning_plan_levels = LearningPlan.objects.filter(profession=student_prof_qs).values_list('lesson_level', flat=True).distinct('lesson_level')

        all_learn_levels = dict(LearningPlan.LESSON_LEVEL)

        all_datas = []
        # Нийт тооцов кредитийг хадгалах
        all_s_kredit = 0
        for level in list(learning_plan_levels):
            obj_datas = {}
            lesson_datas = []
            if level == LearningPlan.DIPLOM or level == LearningPlan.MAG_DIPLOM or level == LearningPlan.DOC_DIPLOM:
                continue

            obj_datas['name'] = all_learn_levels[level]

            if level == LearningPlan.BASIC:
                obj_datas['eng_name'] = 'Education subject'
                obj_datas['uig_name'] = 'ᠳᠡᢉᠡᠳᠦ ᠪᠣᠯᠪᠠᠰᠤᠷᠠᠯ ᠤ᠋ᠨ ᠰᠠᠭᠤᠷᠢ ᢈᠢᠴᠢᠶᠡᠯ'
            if level == LearningPlan.PROF_BASIC or level == LearningPlan.MAG_PROF_BASIC or level == LearningPlan.DOC_PROF_BASIC:
                obj_datas['eng_name'] = 'Courses'
                obj_datas['uig_name'] = 'ᠮᠡᠷᢉᠡᠵᠢᠯ ᠦ᠋ᠨ ᠰᠠᠭᠤᠷᠢ ᢈᠢᠴᠢᠶᠡᠯ'
            if level == LearningPlan.PROFESSION or level == LearningPlan.MAG_PROFESSION or level == LearningPlan.DOC_PROFESSION or level == LearningPlan.QUALIFICATION :
                obj_datas['eng_name'] = 'Major courses'
                obj_datas['uig_name'] = 'ᠮᠡᠷᢉᠡᠵᠢᠯ ᠦ᠋ᠨ ᢈᠢᠴᠢᠶᠡᠯ'

            # Дипломын хичээлээр давталт гүйлгэх
            master_lessons = []
            for data_qs in qs:
                lesson_first_data = data_qs.lesson

                query = '''
                    select lp.lesson_level, ls.name, ls.code, ls.id, ls.name_eng, ls.name_uig, ls.kredit from lms_learningplan lp
                    inner join lms_lessonstandart ls
                    on lp.lesson_id=ls.id
                    where lp.profession_id = {profession_id} and lp.lesson_id = {lesson_id}
                '''.format(profession_id=student_prof_qs.id, lesson_id=lesson_first_data.id)

                cursor = connection.cursor()
                cursor.execute(query)
                rows = list(dict_fetchall(cursor))

                if len(rows) > 0:
                    is_master = False
                    # Магистрийн дипломын хичээлийг хавсралтанд мэргэжлийн хичээлд хамт харуулах хэсэг
                    if rows[0]['lesson_level'] == LearningPlan.MAG_DIPLOM or rows[0]['lesson_level'] == LearningPlan.DOC_DIPLOM:
                        if rows[0]['lesson_level'] == LearningPlan.DOC_DIPLOM:
                            rows[0]['lesson_level'] = LearningPlan.DOC_PROFESSION

                        if rows[0]['lesson_level'] == LearningPlan.MAG_DIPLOM:
                            rows[0]['lesson_level'] = LearningPlan.MAG_PROFESSION

                        is_master = True

                    if rows[0]['lesson_level'] == level:
                        lesson = rows[0]
                        lesson['score'] = data_qs.score
                        lesson['assesment'] = data_qs.assesment
                        lesson['grade_letter'] = data_qs.grade_letter.description if data_qs.grade_letter else ''

                        # Магистрийн 2 хичээлийг хамгийн сүүлд нь оруулах
                        if is_master:
                            master_lessons.append(lesson)
                        else:
                            lesson_datas.append(lesson)

                        max_kredit = max_kredit + lesson.get('kredit')
                        score_qs = Score.objects.filter(score_max__gte=data_qs.score, score_min__lte=data_qs.score).first()

                        # Үсгэн үнэлгээ буюу S тооцов дүн оруулвал кредитийг нь тооцоод дүнд нөлөөлөхгүй
                        if not data_qs.grade_letter:
                            all_score = all_score + (score_qs.gpa * lesson.get('kredit'))
                            all_gpa_score = all_gpa_score + (data_qs.score * lesson.get('kredit'))
                        else:
                            all_s_kredit = all_s_kredit + lesson.get('kredit')

            # Хичээлтэй хэсгийн датаг л нэмнэ
            # if len(lesson_datas) > 0:
            #     # Магистрийн ажил
            sorted_lessons = []
            if len(master_lessons) > 0:
                sorted_lessons = sorted(master_lessons, key=lambda x: x["grade_letter"])

            lesson_datas.extend(sorted_lessons)
            obj_datas['lessons'] = lesson_datas
            all_datas.append(obj_datas)

        final_gpa = '0.0'
        if all_score != 0 and all_gpa_score != 0:
            # Нийт кредитээс S үнэлгээ буюу тооцов үнэлгээг хасаж голч бодогдоно
            estimate_kredit = max_kredit - all_s_kredit
            final_gpa = all_score / estimate_kredit
            # Нийт голч оноо
            final_score = all_gpa_score / estimate_kredit
            final_gpa = format(final_gpa, ".1f")
            # Нийт голч оноог бутархай руу шилжүүлэх
            final_score = format(final_score, ".1f")

        average_score_prof = ProfessionAverageScore.objects.filter(profession=student_prof_qs, is_graduate=True, level=0).first()
        all_data['score'] = { 'assesment': final_gpa, 'max_kredit': max_kredit, 'average_score': final_score, 'average_score_prof': format(average_score_prof.gpa, ".1f") if average_score_prof else '0.0' }
        all_data['lessons'] = all_datas

        # GraduationWork
        graduationwork_qs = GraduationWork.objects.filter(student_id=student_id).last()
        all_data['graduation_work'] = GraduationWorkPrintSerailizer(graduationwork_qs, many=False).data

        return request.send_data(all_data)


@permission_classes([IsAuthenticated])
class StudentVizStatusAPIView(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    generics.GenericAPIView
):
    """ гадаад оюутны визний мэдээлэл шийдвэрлэх """

    queryset = StudentViz.objects.all().order_by("-created_at")
    serializer_class = StudentVizListSerializer

    pagination_class = CustomPagination

    def get_queryset(self):

        queryset = self.queryset

        school = self.request.query_params.get('school')
        department = self.request.query_params.get('department')
        profession = self.request.query_params.get('profession')
        group = self.request.query_params.get('group')
        status = self.request.query_params.get('status')

        # Сургуулиар хайлт хийх
        if school:
            queryset = queryset.filter(student__school=school)

        # Хөтөлбөрийн багаар хайлт хийх
        if department:
            queryset = queryset.filter(student__department=department)

        # Мэргэжлээр хайлт хийх
        if profession:
            queryset = queryset.filter(student__group__profession_id=profession)

        # Ангиар хайлт хийх
        if group:
            queryset = queryset.filter(student__group=group)

        # Төлөв
        if status:
            queryset = queryset.filter(status=status)

        return queryset

    @has_permission(must_permissions=['lms-foreign-student-viz-read'])
    def get(self, request, pk=None):
        " гадаад оюутны визний жагсаалт "
        if pk:
            data = self.retrieve(request, pk).data
            return request.send_data(data)

        list_data = self.list(request).data
        return  request.send_data(list_data)

    @has_permission(must_permissions=['lms-foreign-student-viz-create'])
    def post(self, request):
        " гадаад оюутны виз шинээр үүсгэх "
        self.serializer_class = StudentVizSerializer

        with transaction.atomic():
            all_datas = request.data

            status = all_datas.get('status')
            students = all_datas.get('student')
            year = all_datas.get('year')

            if not year:
                return request.send_error("ERR_002", "Жил сонгоно уу!")

            if not status:
                return request.send_error("ERR_002", "Төлөв сонгоно уу")

            if not students:
                return request.send_error("ERR_002", "Оюутан сонгоно уу")

            if status and students and year:
                for st in students:
                    all_datas['student']=st
                    all_datas["status"]=status
                    all_datas["year"]=year

                    serializer = self.get_serializer(data=all_datas)

                    if serializer.is_valid(raise_exception=False):
                        self.create(request).data

                return request.send_info("INF_001")

    @has_permission(must_permissions=['lms-foreign-student-viz-update'])
    def put(self, request):
        " гадаад оюутны визний мэдээлэл засах "

        self.serializer_class = StudentVizSerializer

        with transaction.atomic():
            all_datas = request.data
            status = all_datas.get('status')
            data_id = all_datas.get('id')

            if not status:
                return request.send_error("ERR_002", "Төлөв сонгоно уу")

            StudentViz.objects.filter(id__in=data_id).update(status=status)

            return request.send_info("INF_002")


@permission_classes([IsAuthenticated])
class StudentDownloadAPIView(
    generics.GenericAPIView,
    mixins.ListModelMixin
):

    queryset = Student.objects.all().order_by('code')
    filter_backends = [SearchFilter]
    search_fields = ['department__name', 'code', 'first_name', 'register_num']

    def get_queryset(self):
        queryset = self.queryset.all()
        department = self.request.query_params.get('department')
        degree = self.request.query_params.get('degree')
        profession = self.request.query_params.get('profession')
        join_year = self.request.query_params.get('join_year')
        group = self.request.query_params.get('group')
        schoolId = self.request.query_params.get('schoolId')
        status = self.request.query_params.get('status')
        level = self.request.query_params.get('level')
        isPayed = self.request.query_params.get('isPayed')

        # сургуулиар хайлт хийх
        if schoolId:
            queryset = queryset.filter(school_id=schoolId)

        # Хөтөлбөрийн багаар хайлт хийх
        if department:
            queryset = queryset.filter(department_id=department)

        # Боловсролын зэргээр хайлт хийх
        if degree:
            queryset = queryset.filter(group__degree_id=degree)

        # Мэргэжлээр хайлт хийх
        if profession:
            queryset = queryset.filter(group__profession_id=profession)

        # Элссэн хичээлийн жилээр хайлт хийх
        if join_year:
            queryset = queryset.filter(group__join_year=join_year)

        # Ангиар хайлт хийх
        if group:
            queryset = queryset.filter(group_id=group)

        if status:
            queryset = queryset.filter(status=status)

        if level:
            queryset = queryset.filter(group__level=level)

        if isPayed:
            payed_status_condition = Q(payment__status=True, payment__dedication=Payment.SYSTEM)

            # "2" is not payed
            if isPayed == '2':
                payed_status_condition = ~payed_status_condition

            queryset = queryset.filter(payed_status_condition)

        return queryset

    def get( self, request, pk=None):
        "Оюутны бүртгэл жагсаалт"

        self.serializer_class = StudentDownloadSerializer

        student_list = self.list(request, pk).data
        return request.send_data(student_list)


@permission_classes([IsAuthenticated])
class GroupLessonAPIView(
    generics.GenericAPIView,
):
    """ Тухайн ангийн үзсэн хичээлүүдийг олох """

    def get(self, request, group=None):

        season = None
        group_obj = Group.objects.get(id=group)

        lesson_ids = ScoreRegister.objects.filter(student__group=group).values_list('lesson', flat=True)

        all_list = list(LessonStandart.objects.filter(id__in=lesson_ids).values('id', 'name', 'code', 'kredit'))

        seasons = list(LearningPlan.objects.filter(lesson__in=lesson_ids, profession=group_obj.profession).values('lesson', 'season'))

        for clist in all_list:
            full_name = ''
            name = clist.get('name')
            code = clist.get('code')
            p_id = clist.get('id')
            kredit = clist.get('kredit')

            for lseason in seasons:
                if p_id == lseason.get('lesson'):
                    season = lseason.get('season') if lseason.get('season') else ''

            clist['season'] = season if season else ''

            if code:
                full_name += code
            if name:
                full_name +=  ' ' + name

            clist['full_name'] = full_name
            clist['correspond_lesson_id'] = p_id
            clist['correspond_kredit'] = kredit

            del clist['code']
            del clist['name']
            del clist['kredit']

        return request.send_data(all_list)


@permission_classes([IsAuthenticated])
class StudentScoreLessonAPIView(
    generics.GenericAPIView
):
    """ Оюутны дүнтэй хичээлүүдийг авах """

    @login_required()
    def get(self, request, student=None):

        lesson_scores = ScoreRegister.objects.filter(student=student).annotate(score_total=Coalesce(F('exam_score'), 0, output_field=FloatField()) + Coalesce(F('teach_score'), 0, output_field=FloatField())).values('lesson__id', 'lesson__name', 'lesson__kredit', 'score_total')

        return request.send_data(list(lesson_scores))


@permission_classes([IsAuthenticated])
class StudentArrivedApproveAPIView(
    generics.GenericAPIView
):
    """ Шилжилт хөдөлгөөнийг батлах """

    def post(self, request, pk=None):

        datas = {}

        movement_obj = StudentMovement.objects.get(pk=pk)

        datas = request.data

        group = datas.get('group')

        old_student = movement_obj.student

        old_datas = Student.objects.filter(pk=old_student.id).values()

        datas = old_datas[0]

        group_obj = Group.objects.get(pk=group)

        new_code = generate_student_code(group_obj.school.id, group)

        datas['code'] = new_code
        # datas['group'] = group_obj
        # datas['school'] = group_obj.school
        # datas['department'] = group_obj.department
        datas['admission_before'] = 'Бүрэлдэхүүн сургууль институтийн хооронд шилжилт'

        datas = remove_key_from_dict(datas, 'id')

        with transaction.atomic():
            try:
                new_student = Student.objects.create(
                    **datas
                )

                new_student.group = group_obj
                new_student.department = group_obj.department
                new_student.school = group_obj.school
                new_student.save()

                movement_obj.group = group_obj
                movement_obj.student_new = new_student
                movement_obj.save()

                year, season = get_active_year_season()

                create_datas = {}
                # Төлбөрийн мэдээлэл шилжүүлэх
                cdatas = PaymentBeginBalance.objects.filter(student=old_student, lesson_year=year, lesson_season=season).first()
                if cdatas:
                    first_balance = cdatas.first_balance

                    create_datas['student'] = new_student
                    create_datas['lesson_year'] = year
                    create_datas['lesson_year'] = season
                    create_datas['first_balance'] = first_balance

                    PaymentBeginBalance.objects.create(**create_datas)

            except Exception as e:
                return request.send_error('ERR_002', e.__str__())

        return request.send_info('INF_001', 'Амжилттай шилжилт хөдөлгөөн хийлээ.')


@permission_classes([IsAuthenticated])
class SignatureGroupAPIView(
    generics.GenericAPIView
):
    """ Төгсөгчдийг ангиар нь үүсгэх """

    queryset = GraduationWork.objects.all()

    @has_permission(must_permissions=['lms-student-graduate-create'])
    def post(self, request):

        user = request.user
        lesson_year, lesson_season = get_active_year_season()
        datas = request.data
        group = datas.get('group')
        students = datas.get('students')
        group_obj = Group.objects.get(pk=group)

        if 'students' in datas:
            del datas['students']

        if 'group' in datas:
            del datas['group']

        datas['lesson_year'] = lesson_year
        datas['lesson_season_id'] = lesson_season
        datas['lesson_type'] = GraduationWork.ATTACHMENT_SHALGALT
        datas['created_user'] = user

        # Тухайн ангийн мэргэжил
        profession = group_obj.profession

        # Тухайн ангийн боловсролын зэрэг
        degree_code = group_obj.degree.degree_code

        # Мэргэжлийн зэргээс хамаарч дипломын хичээл
        lessons = LearningPlan.objects.filter(profession=profession, lesson_level=LearningPlan.DIPLOM).values_list('lesson', flat=True)

        if degree_code == 'E':
            lessons = LearningPlan.objects.filter(profession=profession, lesson_level=LearningPlan.MAG_DIPLOM).values_list('lesson', flat=True)
        elif degree_code == 'F':
            lessons = LearningPlan.objects.filter(profession=profession, lesson_level=LearningPlan.DOC_DIPLOM).values_list('lesson', flat=True)

        with transaction.atomic():
            try:
                for student in students:
                    datas['student_id'] = student.get('id')
                    graduate_obj, created = GraduationWork.objects.update_or_create(
                        student_id = student.get('id'),
                        lesson_year = lesson_year,
                        lesson_season_id = lesson_season,
                        defaults={
                            **datas
                        }
                    )

                    graduate_obj.lesson.add(*list(lessons))
            except Exception as e:
                return request.send_error('ERR_002')

        return request.send_info('INF_001')


class CommandAPIView(
    generics.GenericAPIView,
    mixins.CreateModelMixin,
):
    queryset = GraduationWork.objects.all()

    def post(self, request):
        "Тушаал шинээр үүсгэх нь "

        user = request.user
        lesson_year, lesson_season = get_active_year_season()

        datas = request.data
        students = datas.get('students')
        decision_date = datas.get('decision_date')
        graduation_date = datas.get('graduation_date')
        graduation_number = datas.get('graduation_number')

        datas['lesson_year'] = lesson_year
        datas['lesson_season_id'] = lesson_season
        datas['lesson_type'] = GraduationWork.ATTACHMENT_SHALGALT
        datas['created_user'] = user

        with transaction.atomic():
            try:
                for student in students:
                    GraduationWork.objects.update_or_create(
                        student_id = student.get('id'),
                        lesson_year = lesson_year,
                        lesson_season_id = lesson_season,
                        defaults={
                            "decision_date":decision_date,
                            "graduation_number":graduation_number,
                            "graduation_date":graduation_date
                        }
                    )

            except Exception as e:
                return request.send_error('ERR_002')

        return request.send_info('INF_001')


@permission_classes([IsAuthenticated])
class StudentCommandListAPIView(
    mixins.ListModelMixin,
    generics.GenericAPIView
):
    """ Төгсөлтын ажлын оюутны жагсаалт """

    queryset = GraduationWork.objects.all()
    serializer_class = GraduationWorkStudentListSerializer

    def get(self, request):
        " Идэвхитэй жил, улиралд төгсөх оюутны жагсаалт "

        year = self.request.query_params.get('year')
        season = self.request.query_params.get('season')
        school = self.request.query_params.get('school')

        if school:
            self.queryset = self.queryset.filter(student__group__school=school)

        stud_qs = self.queryset.filter(lesson_year=year, lesson_season=season).values_list('student', flat=True)
        student_data = Student.objects.filter(id__in=stud_qs).values("id", "code", "last_name", "first_name")

        data = list(student_data)
        return request.send_data(data)


@permission_classes([IsAuthenticated])
class RegistrationAndDiplomAPIView(
    generics.GenericAPIView,
    mixins.UpdateModelMixin
):
    """ Төгсөлтийн ажлын дипломын дугаар болон бүртгэлийн дугаар засах """

    queryset = GraduationWork.objects.all()

    @transaction.atomic
    def put(self, request, pk=None):
        """ diplom_num : дипломын дугаар
            registration_num : бүртгэлийн дугаар
        """

        request_data = request.data

        with transaction.atomic():
            try:
                qs = self.queryset.filter(id=pk)

                if request_data:
                    qs.update(
                        **request_data
                    )

            except Exception as e:
                print(e)
                return request.send_error("ERR_002")

        return request.send_info('INF_002')


# Төгссөн оюутны мэдээлэл авах
@permission_classes([IsAuthenticated])
class StudentGraduate1APIView(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    generics.GenericAPIView
):
    queryset = Student.objects.all().order_by('first_name')
    serializer_class = StudentListSerializer

    pagination_class = CustomPagination
    filter_backends = [SearchFilter]
    search_fields = ['first_name', 'last_name', 'code', 'register_num', 'group__name', 'group__profession__name']

    def get_queryset(self):
        queryset = self.queryset
        department = self.request.query_params.get('department')
        degree = self.request.query_params.get('degree')
        profession = self.request.query_params.get('profession')
        group = self.request.query_params.get('group')
        if department:
            queryset = queryset.filter(department=department)
        if degree:
            queryset = queryset.filter(group__degree_id=degree)
        if profession:
            queryset = queryset.filter(group__profession_id=profession)
        if group:
            queryset = queryset.filter(group_id=group)
        return queryset

    def get(self, request):

        status = StudentRegister.objects.filter(Q(Q(code=2) | Q(name__icontains='Төгссөн'))).first()
        self.queryset = self.queryset.filter(status=status)

        all_list = self.list(request).data

        return request.send_data(all_list)


@permission_classes([IsAuthenticated])
class DefaultPassApi(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    generics.CreateAPIView
):
    # Оюутны нууц үгийг default-аар өгөх
    def put(self, request, pk = None):

        if pk is None:
            return request.send_error('ERR_012')

        student_obj = Student.objects.filter(id=pk).first()
        if student_obj:
            passwordDefault = student_obj.register_num[-8:]
            hashed_password = make_password(passwordDefault)

            with transaction.atomic():
                stud_login = StudentLogin.objects.filter(student=student_obj.id).first()

                if stud_login:
                    StudentLogin.objects.filter(student=student_obj.id).update(password=hashed_password)

                else:
                    StudentLogin.objects.create(student_id=student_obj.id, username=student_obj.code, password=hashed_password, is_active=True)
            return request.send_info('INF_018')
        else:
            return request.send_error('ERR_012')


@permission_classes([IsAuthenticated])
class RightActivationApi(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    generics.CreateAPIView
):
    # Оюутны эрх хаах/нээх
    def put(self, request, pk = None):

        if pk is None:
            return request.send_error('ERR_012')

        student_obj = Student.objects.filter(id=pk).first()

        if student_obj:
            with transaction.atomic():
                student_obj.is_active=not student_obj.is_active
                student_obj.save()

            return request.send_info('INF_018')
        else:
            return request.send_error('ERR_012')


class StudentDefinitionListLiteAPIView(
    mixins.ListModelMixin,
    generics.GenericAPIView
):
    """ Тодорхойлолт багасгасан хэлбэр (Оюутайн цэсний тодорхойлолт хэсэгт зориулав)"""

    queryset = Student.objects.all()
    serializer_class = StudentDefinitionListLiteSerializer

    pagination_class = CustomPagination

    filter_backends = [SearchFilter]
    search_fields = ['department__name', 'code', 'first_name', 'last_name', 'register_num']

    def get_queryset(self):

        queryset = self.queryset

        group = self.request.query_params.get('group')
        profession = self.request.query_params.get("profession")
        department = self.request.query_params.get("department")
        status = self.request.query_params.get("status")

        # undefine утгыг none руу хөрвүүлэв
        group, profession, department = undefined_to_none([group, profession, department])

        if department:
            queryset = queryset.filter(department=department)

        if profession:
            queryset = queryset.filter(group__profession_id=profession)

        if group:
            queryset = queryset.filter(group_id=group)

        if status:
            queryset = queryset.filter(status=status)

        return queryset

    def get(self, request):
        "Оюутны бүртгэл жагсаалт"

        schoolId = request.query_params.get('school')

        if schoolId:
            self.queryset = self.queryset.filter(school=schoolId)

        student_list = self.list(request).data
        return request.send_data(student_list)


class StudentImportAPIView(
    generics.GenericAPIView
):
    """ Оюутны жагсаалт import хийх """

    @transaction.atomic()
    def post(self, request):


        datas = request.data
        file = datas.get("file")

        # Файл түр хадгалах
        path = save_file(file, 'student', 1)
        full_path = os.path.join(settings.MEDIA_ROOT, str(path))

        error_datas = list()
        correct_datas = list()

        excel_data = pd.read_excel(full_path)
        datas = excel_data.to_dict(orient='records')

        try:
            for created_data in datas:
                pay_type_id = 8 # төлбөр төлөлтын төрөл

                group = created_data.get('Анги/дамжаа')
                register_num = created_data.get('Регистрийн дугаар')
                last_name = created_data.get('Эцэг эхийн нэр')
                first_name = created_data.get('Өөрийн нэр')
                last_name_uig = created_data.get('Эцэг эхийн нэр уйгаржин')
                first_name_uig = created_data.get('Өөрийн нэр уйгаржин')
                phone = created_data.get('Утасны дугаар')
                birth_date, gender = calculate_birthday(register_num)
                status = created_data.get('Төлөв')
                code = created_data.get('Суралцагчдын код')

                pay_type_id = Student.EXPENSES

                if not code or isinstance(code, float):
                    continue

                status_id = None

                if isinstance(group, float):
                    continue

                if isinstance(phone, float):
                    phone = ''

                # суралцах хэлбэр
                status_id = StudentRegister.objects.filter(Q(Q(name__icontains='Суралцаж буй') | Q(code=1))).first()

                group_obj = Group.objects.filter(name__iexact=str(group)).first()

                obj = {
                    'group': group,
                    'register_num': register_num,
                    'last_name': last_name,
                    'first_name': first_name,
                    'phone': phone,
                    'status': status,
                    'last_name_uig': last_name_uig,
                    'first_name_uig': first_name_uig,
                    'gender': gender,
                    'birth_date': birth_date,
                    'pay_type': pay_type_id,
                    'code': code,
                }

                student_qs = Student.objects.filter(code=code).first()

                if code and group_obj and pay_type_id and register_num and last_name and first_name and phone and status_id:
                    correct_datas.append(obj)
                else:
                    error_datas.append(obj)

                if file:
                    remove_folder(full_path)

        except Exception as e:
            return request.send_error('ERR_012')

        return_datas = {
            'create_datas': correct_datas,
            'all_error_datas': error_datas,
            'file_name': file.name,
            'not_found_student': error_datas,
        }

        return request.send_data(return_datas)


class StudentPostDataAPIView(
    generics.GenericAPIView
):
    """ Дата оруулах  """

    @transaction.atomic()
    def post(self, request):

        datas = request.data
        all_datas = list()
        created_studentlogin_datas = list()
        user = request.user

        string_fields = [
            'code',
            'group',
            'register_num',
            'last_name',
            'last_name_uig',
            'first_name',
            'first_name_uig'
            'status',
            'birth_date'
        ]

        try:
            with transaction.atomic():
                for created_data in datas:
                    # to normalize string data
                    for string_field in string_fields:
                        string_field_value = created_data.get(string_field)

                        if string_field_value:
                            created_data[string_field] = str(string_field_value).strip()

                    #region to get data from import function indirectly
                    # string fields
                    code = created_data.get('code')
                    group = created_data.get('group')
                    register_num = created_data.get('register_num')
                    family_name = created_data.get('family_name')
                    last_name = created_data.get('last_name')
                    first_name = created_data.get('first_name')
                    last_name_uig = created_data.get('last_name_uig')
                    first_name_uig = created_data.get('first_name_uig')
                    status = created_data.get('status')
                    birth_date = created_data.get('birth_date')

                    # not string fields
                    phone = created_data.get('phone')
                    gen = created_data.get('gender')
                    pay_type_id = created_data.get('pay_type')
                    #endregion to get data from import function indirectly

                    status_id = None

                    # суралцах хэлбэр
                    if status:
                        status_id = StudentRegister.objects.filter(name__icontains=status).first()

                        if not status_id:
                            count = StudentRegister.objects.count()
                            status_id = StudentRegister.objects.create(name=status, code=count+1)

                    group_obj = Group.objects.filter(name__iexact=group).first()

                    if not group_obj:
                        continue

                    if Student.objects.filter(code=code).exists():
                        Student.objects.filter(code=code).update(group=group_obj)
                        continue

                    qs = Student(
                        school=group_obj.school if group_obj else None,
                        code=code,
                        family_name=family_name,
                        register_num=register_num,
                        last_name=last_name,
                        first_name=first_name,
                        gender=gen,
                        phone=phone,
                        citizenship=Country.objects.get(name__icontains='Монгол'),
                        pay_type=pay_type_id,
                        status=status_id,
                        group=group_obj,
                        department=group_obj.department,
                        last_name_uig=last_name_uig,
                        first_name_uig=first_name_uig,
                        created_user=user,
                        birth_date=birth_date
                    )

                    # Оюутан бүртгүүлэх үед оюутны нэвтрэх нэр нууц үгийг хадгалах хэсэг
                    password = register_num[-8:]

                    hashed_password = make_password(password)

                    student_login_qs = StudentLogin(
                        username=code,
                        password=hashed_password,
                        student=qs,
                    )

                    created_studentlogin_datas.append(student_login_qs)
                    all_datas.append(qs)

                if len(all_datas) > 0:
                    Student.objects.bulk_create(all_datas)

                if len(created_studentlogin_datas) > 0:
                    StudentLogin.objects.bulk_create(created_studentlogin_datas)

        except Exception as e:
            print(e)
            traceback.print_exc()
            return request.send_error('ERR_002')

        return request.send_info("INF_001")


class GraduationWorkQrAPIView(
    generics.GenericAPIView
):
    """ Дипломын QR cerify-аас татах """

    queryset = GraduationWork.objects.all()

    def get(self, request):

        not_found_student = []
        group = request.query_params.get('group')

        # Тухайн идэвхтэй жилийн QR татна
        lesson_year, lesson_season = get_active_year_season()

        # Төгсөгчдийн мэдээллийг авах
        students = self.queryset.filter(lesson_year=lesson_year, lesson_season=lesson_season, student__group=group, diplom_qr__isnull=True) \
                    .annotate(
                        first_name=F('student__first_name'),
                        last_name=F('student__last_name'),
                        code=F('student__code'),
                        register=F('student__register_num')
                    ).values(
                        'id',
                        'first_name',
                        'last_name',
                        'code',
                        'register',
                        'diplom_num'
                    )
        with transaction.atomic():
            for student in students:
                diplom_num = student.get('diplom_num')
                graduation_id = student.get('id')

                data = {
                    'cert_number': diplom_num
                }

                url = 'https://certify.mn/service/api/v2/certification/qr/generate'
                headers = {
                    'x-api-key': '1k88nvH5.6aoyqjJWKFwrrjv29WYGg6mPVtAIujGE',
                    'Content-Type': 'application/json'
                }

                res = requests.post(url, headers=headers, json=data)
                print(res.status_code)

                # 404 Not Found: Дипломын дугаар буруу эсвэл уг дипломын дугаар үүсээгүй үед
                if res.status_code == 404:
                    not_found_student.append(
                        student
                    )

                if res.status_code == 200:

                    # base64 өөр зураг илгээж байгаа
                    image_data = res.content

                    # QR ийг хадгалах
                    self.queryset.filter(id=graduation_id).update(diplom_qr=image_data)

        return request.send_data(not_found_student)


class TestGroupAPIView(
    generics.GenericAPIView
):
    """ Шалгалтын анги """

    def get(self, request):
        exam = request.query_params.get('exam')
        is_show_all = request.query_params.get('isShowAll')
        profession = request.query_params.get('profession')
        group_ids = ChallengeStudents.objects

        if exam:
            group_ids = group_ids.filter(challenge=exam)

        elif is_show_all != 'true':

            return request.send_data(None)

        group_ids = group_ids.values_list('student__group', flat=True).distinct()

        group_qs = Group.objects.filter(id__in=group_ids)

        if profession:
            group_qs = group_qs.filter(profession=profession)

        datas = group_qs.values('id', 'name')

        return request.send_data(list(datas))


class GroupByTeacherScoreAPIView(
    generics.GenericAPIView
):
    """ Дүн нь гарсан хүүхдээс ангийн жагсаалт авах """

    def get(self, request):
        profession = request.query_params.get('profession')

        group_ids = TeacherScore.objects.values_list('student__group', flat=True).distinct()

        group_qs = Group.objects.filter(id__in=group_ids)

        if profession:
            group_qs = group_qs.filter(profession=profession)

        datas = group_qs.values('id', 'name')

        return request.send_data(list(datas))

# def update(diplom_num, path):
#     with open(path, 'rb') as f:
#         image_data = f.read()
#         print(GraduationWork.objects.filter(diplom_num=diplom_num))
#         GraduationWork.objects.filter(diplom_num=diplom_num).update(
#             diplom_qr = image_data
#         )
#     return 'success'

# path = '/home/daria/Pictures/viber_image_2024-11-13_10-33-16-539.jpg'
# diplom_num = '8202400201'

# ocunt = update(diplom_num, path)

# print(ocunt)


class ExamToGroupGroupLessonAPIView(
    generics.GenericAPIView
):
    """ Шалгалтын анги. To take group list """

    def get(self, request, lesson=None):
        # NOTE exam_to_group has not data for some lessons sometimes. For example: lesson id = 1075 (if TeacherScore.score_type.lesson_teacher.lesson.id=1075 then TeacherScore.Student.group.name exist but exam_to_group__exam__lesson=1075 not exist
        datas = Group.objects.filter(exam_to_group__exam__lesson=lesson).values('id', 'name')

        return request.send_data(list(datas))

