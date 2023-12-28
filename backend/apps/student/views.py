import os

from googletrans import Translator

from datetime import date

from rest_framework import mixins
from rest_framework import generics

from django.conf import settings
from django.db import transaction
from django.db.models import Max, Sum, F, FloatField, Q, Value
from django.db.models.functions import Replace, Upper
from django.db.models.functions import Coalesce
from django.contrib.auth.hashers import make_password

from main.utils.function.pagination import CustomPagination
from main.decorators import login_required

from rest_framework.filters import SearchFilter
from main.utils.file import remove_folder, split_root_path
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes
from main.utils.function.pagination import CustomPagination
from main.utils.function.utils import str2bool, has_permission, get_lesson_choice_student, remove_key_from_dict, get_fullName, get_student_score_register, calculate_birthday, null_to_none, bytes_image_encode, get_active_year_season,start_time
# from main.khur.XypClient import citizen_regnum, highschool_regnum

from lms.models import Student, StudentAdmissionScore, StudentEducation, StudentLeave, StudentLogin, TimeTable
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
from lms.models import Exam_to_group, PaymentSettings
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
from lms.models import StudentViz
from lms.models import SystemSettings
from lms.models import PaymentBeginBalance
from lms.models import Country

from core.models import SubSchools, SumDuureg, BagHoroo, AimagHot

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
from .serializers import StudentAddressSerializer
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
from .serializers import CalculatedGpaOfDiplomaPrintSerializer
from .serializers import StudentAttachmentSerializer
from .serializers import GraduationWorkPrintSerailizer
from .serializers import StudentVizListSerializer
from .serializers import StudentVizSerializer
from .serializers import StudentSimpleListSerializer

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

    queryset = Group.objects.all().order_by('level')
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
                return request.send_error_valid(serializer.errors)

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


def generate_student_code(school_id, group):
    """ Оюутны код generate хийх """

    school_code = SubSchools.objects.get(pk=school_id).org_code
    group_qs = Group.objects.get(pk=group)
    profession_code = group_qs.profession.profession_code
    degree_code = group_qs.profession.degree.degree_code
    lesson_year = group_qs.join_year

    settings_qs = SystemSettings.objects.filter(season_type=SystemSettings.ACTIVE).last()

    with_start = '001'
    student_register_count = 1

    season = settings_qs.active_lesson_season.id
    # lesson_year = settings_qs.active_lesson_year

    season_qs = (
        Season
        .objects
        .filter(
            pk=season
        )
        .annotate(
            search_text=Upper('season_name'),
            desc=Replace('search_text', Value('H'), Value('Н')),
            last_text=Replace('desc', Value('X'), Value('Х')),
        )
        .filter(
            last_text__icontains='ХАВАР',
        )
    ).first()

    now_date = date.today().year
    now_date = str(now_date)

    year = int(now_date[2:4])

    if season_qs:
        year = int(lesson_year[-2:])
    else:
        year = int(lesson_year[2:4])

    generate_code = f'{degree_code}{year}{school_code}{profession_code}'

    student_qs = (
        Student
        .objects
        .filter(
            group__profession=group_qs.profession,
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

    if student_qs:
        check_code = student_qs.code
        student_register_count = int(check_code[-3:]) + 1

    new_student_code = f'{int(student_register_count):0{len(with_start)}d}'

    generate_code = f'{generate_code}{new_student_code}'

    return generate_code


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
    search_fields = ['department__name', 'code', 'first_name', 'register_num']

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
        # is_khur = data.get('is_khur')
        regnum = data.get('register_num')
        citizenship = data.get('citizenship')
        # data = remove_key_from_dict(data, 'is_khur')
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

        check_qs = Student.objects.filter(code=student_code)

        if check_qs:
            # Оюутны код давхцаж байвал
            student_code = generate_student_code(school_id, group)

        data['code'] = student_code

        try:
            serializer = self.serializer_class(data=data, many=False)
            if not serializer.is_valid():
                transaction.savepoint_rollback(sid)
                return request.send_error_valid(serializer.errors)

            # Оюутан бүртгүүлэх үед оюутны нэвтрэх нэр нууц үгийг хадгалах хэсэг
            password = '0123456789'

            hashed_password = make_password(password)
            serializer.save()

            student_data = serializer.data
            student_id = student_data.get('id')

            # student_obj = self.queryset.get(pk=student_id)

            # if image:
            #     img = bytes_image_encode(image)
            #     logo_root = os.path.join(settings.STUDENTS, str(student_id))
            #     path = os.path.join(settings.MEDIA_ROOT, logo_root)

            #     if not os.path.exists(logo_root):
            #         os.makedirs(path)

            #     image_path = os.path.join(path, "picture.jpg" )
            #     img = img.convert('RGB')
            #     img.save(image_path)

            #     save_file_path = split_root_path(image_path)

            #     student_obj.image = save_file_path
            #     student_obj.save()

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
            if qs_timetable or score_reg or address or exam or estimate:
                return request.send_error("ERR_002", "Оюутны бүртгэлийн мэдээлэл устгах боломжгүй байна.")

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
        if group:
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

        status = StudentRegister.objects.filter(name__contains='Суралцаж буй').first()
        self.queryset = self.queryset.filter(status=status)

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

        # Сургууль хайлт
        if schoolId:
            queryset = queryset.filter(school_id=schoolId)

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
            key = score_data.lesson_year + " " +score_data.lesson_season.season_name

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
                    assessment = Score.objects.filter(
                        score_max__gte=score, score_min__lte=score).first()

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
                        "assessment": assessment.assesment if eachSeason.lesson else "",
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
        # хуучин зураг
        old_image = instance.image

        data = remove_key_from_dict(data, 'image')

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
        serializer = self.get_serializer(data=data)

        # qs = self.queryset.filter(student_id=student)

        try:
            if serializer.is_valid(raise_exception=False):
                obj = self.queryset.filter(student_id=student).update_or_create(
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


class GraduationWorkAPIView(
    mixins.CreateModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    mixins.RetrieveModelMixin,
    mixins.ListModelMixin,
    generics.GenericAPIView
):
    queryset = GraduationWork.objects.all()
    serializer_class = GraduationWorkSerializer

    pagination_class = CustomPagination

    filter_backends = [SearchFilter]

    search_fields = ['student__code', 'student__first_name', 'diplom_num', 'lesson__code', 'lesson__name', 'diplom_topic', 'leader']

    @has_permission(must_permissions=['lms-student-graduate-read'])
    def get(self, request, pk=None):
        " Төгсөлтийн ажил жагсаалт "

        self.serializer_class = GraduationWorkListSerailizer

        department = self.request.query_params.get('department')
        degree = self.request.query_params.get('degree')
        school = self.request.query_params.get('school')
        group = self.request.query_params.get('group')

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

        except Exception:
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

        self.destroy(request, pk)
        return request.send_info("INF_003")


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

    queryset = Student.objects.all()

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

        qs = self.queryset.filter(dedication_type=dedication_type).order_by('order')
        data = self.serializer_class(qs, many=True).data

        return request.send_data(data)

    @transaction.atomic
    def post(self, request):

        data = request.data

        # transaction savepoint зарлах нь хэрэв алдаа гарвад roll back хийнэ
        sid = transaction.savepoint()

        order = 1

        max_order = SignaturePeoples.objects.aggregate(Max('order')).get('order__max')
        if max_order:
            order = max_order + 1

        data['order'] = order
        data['is_order'] = True

        try:
            serializer = self.serializer_class(data=data, many=False)
            if not serializer.is_valid():
                transaction.savepoint_rollback(sid)
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
        school_qs = Schools.objects.all().first()

        school_data = BigSchoolsSerializer(school_qs, many=False).data
        student_data = StudentDefinitionSerializer(student_qs, many=False).data

        all_data['school'] = school_data
        all_data['student'] = student_data

        if data.get('all_year') == True:
            score = get_student_score_register(student_id)
        else:
            score = get_student_score_register(student_id, data.get('season_code'), data.get('year_value'))

            season_name = Season.objects.filter(season_code=data.get('season_code')).last()
            all_data['season_name'] = season_name.season_name

        if score['total_kr'] == 0:
            return request.send_data(all_data)

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

        all_score_register_qs = ScoreRegister.objects.filter(lesson_id__in=request.data, student_id=student_id)

        lesson_ids = all_score_register_qs.values_list('lesson', flat=True)

        bagtsad_no_hariyalagdah = LearningPlan.objects.filter(lesson__in=lesson_ids, profession=profession_obj, group_lesson__isnull=False).values_list('group_lesson', flat=True).distinct()

        for bagtsad_no_hariyalagdah_id in bagtsad_no_hariyalagdah:
            grouped_lessons_ids = LearningPlan.objects.filter(lesson__in=lesson_ids, profession=profession_obj, group_lesson=bagtsad_no_hariyalagdah_id).values_list('lesson', flat=True)
            grouped_datas[bagtsad_no_hariyalagdah_id] = grouped_lessons_ids

            grouped_ids.extend(grouped_lessons_ids)

        unique_ids = list(set(lesson_ids) - set(grouped_ids))

        for grouped_data in grouped_datas:

            score_register_kredit_sum = ScoreRegister.objects.filter(lesson__in=grouped_datas[grouped_data], student_id=student_id).aggregate(Sum('lesson__kredit')).get('lesson__kredit__sum')
            score_register_score_sum = ScoreRegister.objects.filter(lesson__in=grouped_datas[grouped_data], student_id=student_id).aggregate(total=Sum(Coalesce(Coalesce(F('exam_score'), 0, output_field=FloatField()) + Coalesce(F('teach_score'), 0, output_field=FloatField()), 0, output_field=FloatField()) * F('lesson__kredit'))).get('total')
            score_register_score = score_register_score_sum / score_register_kredit_sum
            score_qs = Score.objects.filter(score_max__gte=score_register_score, score_min__lte=score_register_score).first()

            created_cal_qs = CalculatedGpaOfDiploma.objects.create(student_id=student_id, kredit=score_register_kredit_sum, score=score_register_score, gpa=score_qs.gpa, assesment=score_qs.assesment)
            created_cal_qs.lesson.add(*grouped_datas[grouped_data])

        for unique_id in unique_ids:
            score_register_qs = ScoreRegister.objects.filter(student_id=student_id, lesson_id=unique_id).last()

            created_cal_qs = CalculatedGpaOfDiploma.objects.create(student_id=student_id, kredit=score_register_qs.lesson.kredit, score=((score_register_qs.teach_score or 0) + (score_register_qs.exam_score or 0)), gpa=score_register_qs.assessment.gpa, assesment=score_register_qs.assessment.assesment)
            created_cal_qs.lesson.add(score_register_qs.lesson)

        return request.send_info("INF_013", list(lesson_ids))


@permission_classes([IsAuthenticated])
class StudentGpaDiplomaValuesAPIView(
    generics.GenericAPIView
):

    def get(self, request):

        score_assesment = ''
        max_kredit = 0
        all_score = 0

        student_id = self.request.query_params.get('id')
        qs = CalculatedGpaOfDiploma.objects.filter(student_id=student_id)

        student_prof_qs = Student.objects.get(id=student_id).group.profession

        all_data = dict()
        calculated_data = list()

        for data in qs:

            data = CalculatedGpaOfDiplomaPrintSerializer(data, context={ "student_prof_qs": student_prof_qs }, many=False).data
            calculated_data.append(data)
            max_kredit = max_kredit + data['kredit']
            all_score = all_score + (data['score'] * data['kredit'])

        newlist = sorted(calculated_data, key=lambda i: (i['lesson']['lesson_level'], i['lesson']['lesson_type'], i['lesson']['season']))

        final_gpa = all_score / max_kredit
        score_qs = Score.objects.filter(score_max__gte=final_gpa, score_min__lte=final_gpa).first()

        if score_qs:
            score_assesment = score_qs.gpa

        all_data['score'] = { 'assesment': score_assesment, 'max_kredit': max_kredit }
        all_data['lessons'] = newlist

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


class StudentDownloadAPIView(
    generics.GenericAPIView,
    mixins.ListModelMixin
):

    queryset = Student.objects.all().order_by('code')
    filter_backends = [SearchFilter]
    search_fields = ['department__name', 'code', 'first_name', 'register_num']

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

        return queryset

    def get( self, request, pk=None):
        "Оюутны бүртгэл жагсаалт"

        self.serializer_class = StudentRegisterListSerializer

        student_list = self.list(request, pk).data
        return request.send_data(student_list)


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


class StudentScoreLessonAPIView(
    generics.GenericAPIView
):
    """ Оюутны дүнтэй хичээлүүдийг авах """

    @login_required()
    def get(self, request, student=None):

        lesson_scores = ScoreRegister.objects.filter(student=student).annotate(score_total=Coalesce(F('exam_score'), 0, output_field=FloatField()) + Coalesce(F('teach_score'), 0, output_field=FloatField())).values('lesson__id', 'lesson__name', 'lesson__kredit', 'score_total')

        return request.send_data(list(lesson_scores))


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
