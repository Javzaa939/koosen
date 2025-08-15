import json
import requests
from datetime import datetime, timedelta
from dateutil.relativedelta import relativedelta
from rest_framework import mixins
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes
from rest_framework.filters import SearchFilter

from django.db import transaction
from django.conf import settings

from .serializers import (
    generate_model_serializer
)

from main.utils.function.utils import filter_queries
from main.utils.function.pagination import CustomPagination
from main.utils.function.utils import get_teacher_queryset, null_to_none, calculate_birthday

from django.apps import apps
from django.db import transaction
from django.db.models import Q

from core.models import Schools
from core.models import Salbars
from core.models import SubOrgs
from core.models import AimagHot
from core.models import SumDuureg
from core.models import BagHoroo
from core.models import Teachers
from core.models import Employee
from core.models import OrgPosition
from core.models import User
from core.models import Permissions


from lms.models import Country
from lms.models import TimeTable
from lms.models import Lesson_to_teacher
from lms.models import TeacherCreditVolumePlan
from lms.models import DormitoryFamilyContract
from lms.models import Group
from lms.models import StudentRequestTutor
from lms.models import UserInvention
from lms.models import UserPaper
from lms.models import UserNote
from lms.models import UserQuotation
from lms.models import UserProject
from lms.models import UserContractWork
from lms.models import UserPatent
from lms.models import UserModelCertPatent
from lms.models import UserSymbolCert
from lms.models import UserLicenseCert
from lms.models import UserRightCert

from .serializers import SchoolsRegisterSerailizer
from .serializers import DepartmentRegisterSerailizer
from .serializers import DepartmentListSerailizer
from .serializers import SubSchoolRegisterSerailizer
from .serializers import SubSchoolListSerailizer
from .serializers import TeacherListSerializer
from .serializers import CountryListSerializer
from .serializers import AimaghotListSerializer
from .serializers import BagHorooListSerializer
from .serializers import SumDuuregListSerializer
from .serializers import TeacherNameSerializer
from .serializers import OrgPositionSerializer
from .serializers import TeacherLessonListSerializer
from .serializers import TeacherInfoSerializer
from .serializers import ScheduleSerializer
from .serializers import DormitoryFamilyContractSerializer
from .serializers import Lesson_to_teacherSerializer
from .serializers import GroupSerializer
from .serializers import StudentRequestTutorSerializer
from .serializers import UserInventionSerializer
from .serializers import UserPaperSerializer
from .serializers import UserNoteSerializer
from .serializers import UserQuotationSerializer
from .serializers import UserProjectSerializer
from .serializers import UserContractWorkSerializer
from .serializers import UserPatentSerializer
from .serializers import UserModelCertPatentSerializer
from .serializers import UserSymbolCertSerializer
from .serializers import UserLicenseCertSerializer
from .serializers import UserRightCertSerializer
from .serializers import TeachersSerializer
from .serializers import DepartmentRegisterListSerailizer
from .serializers import SubSchoolPutRegisterSerailizer
from .serializers import TeacherLongListSerializer
from .serializers import LessonTeacherListSerializer
from .serializers import TeacherListSchoolFilterSerializer
from .serializers import DepartmentPostSerailizer
from .serializers import EmployeePostSerializer
from .serializers import UserRegisterSerializer
from .serializers import UserInfoSerializer
from .serializers import EmployeeSerializer, UserSerializer, PermissionSerializer, OrgPositionPostSerializer

from lms.models import ProfessionDefinition
from lms.models import LessonStandart
from lms.models import Student
from lms.models import AccessHistoryLms
from django.contrib.auth.hashers import make_password


@permission_classes([IsAuthenticated])
class TeacherListApiView(
    generics.GenericAPIView,
    mixins.ListModelMixin,
):
    """ Хэрэглэгчийн api """

    queryset = Teachers.objects
    serializer_class = TeacherListSerializer

    def get_queryset(self):
        queryset = get_teacher_queryset()

        school = self.request.query_params.get('school')

        depart = self.request.query_params.get('department')

        if school:
            queryset = queryset.filter(sub_org=school)

        if depart:
            queryset = queryset.filter(salbar_id=depart)

        return queryset

    def get(self, request, pk=None):

        list_data = self.list(request).data
        return request.send_data(list_data)

@permission_classes([IsAuthenticated])
class TeacherLessonListApiView(
    generics.GenericAPIView,
    mixins.ListModelMixin,
):
    """ Сонгосон хичээлээс хамаарах багшийн жагсаалт """

    queryset = Teachers.objects
    serializer_class = LessonTeacherListSerializer

    def get(self, request):

        lesson = self.request.query_params.get('lesson')
        school = self.request.query_params.get('school')
        teacher_ids = []

        # qs_teacher = get_teacher_queryset()

        # self.queryset = qs_teacher
        # if school:
        #     self.queryset = self.queryset.filter(Q(Q(sub_org=school) | Q(sub_org__org_code=10)))

        if lesson:
            # teacher_ids = TimeTable.objects.filter(lesson=lesson).values_list('teacher', flat=True)
            teacher_ids = Lesson_to_teacher.objects.filter(lesson=lesson).values_list('teacher', flat=True)

            self.queryset = self.queryset.filter(id__in=teacher_ids)

        list_data = self.list(request).data

        return request.send_data(list_data)


@permission_classes([IsAuthenticated])
class LessonToTeacherListApiView(
    generics.GenericAPIView,
    mixins.ListModelMixin,
):
    """ Хичээл заах багшийн жагсаалт """

    queryset = Teachers.objects
    serializer_class = TeacherListSerializer

    def get(self, request):

        lesson = self.request.query_params.get('lesson')
        teacher_ids = []

        qs_teacher = get_teacher_queryset()

        if lesson:
            qs = Lesson_to_teacher.objects.filter(lesson=lesson)

            teacher_ids = qs.values_list('teacher', flat=True)

            self.queryset = self.queryset.filter(id__in=teacher_ids)

        list_data = self.list(request).data
        return request.send_data(list_data)


@permission_classes([IsAuthenticated])
class SchoolAPIView(
    generics.GenericAPIView,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin
):
    """" Сургууль, Хамгийн том Байгууллага"""

    queryset = Schools.objects
    serializer_class = SchoolsRegisterSerailizer

    def get(self, request, pk=None):
        " Сургуулийн жагсаалт "
        if pk:
            group = self.retrieve(request, pk).data
            return request.send_data(group)

        datas = self.list(request).data
        return request.send_data(datas)

    def put(self, request):

        datas = request.data
        instance = Schools.objects.first()
        with transaction.atomic():
            Schools.objects.filter(pk=instance.id).update(
                **datas
            )

        return request.send_info('INF_002')

    @transaction.atomic()
    def post(self, request):
        datas = request.data
        serializer = self.serializer_class(data=datas)

        try:
            if not serializer.is_valid():
                return request.send_error_valid('ERR_002', serializer.errors)

            serializer.save()

        except Exception as e:
            print('e', e)
            return request.send_error("ERR_002")

        return request.send_info('INF_001')

    def delete(self, request, pk=None):
        qs = self.queryset.filter(id=pk).first()
        if qs:
            qs.delete()

        return request.send_info("INF_003")


@permission_classes([IsAuthenticated])
class DepartmentAPIView(
    generics.GenericAPIView,
    mixins.UpdateModelMixin,
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin
):
    """"Салбар, тухайн дэд байгууллагын салбар """

    queryset = Salbars.objects
    serializer_class = DepartmentRegisterSerailizer

    def get_queryset(self):
        queryset = self.queryset
        school = self.request.query_params.get('school')
        search = self.request.query_params.get('search')
        if school:
            queryset = queryset.filter(sub_orgs=school)
        if search:
            queryset = queryset.filter(name__icontains=search)
        return queryset

    def get(self, request, pk=None):
        " Салбарын жагсаалт "

        if pk:
            group = self.retrieve(request, pk).data
            return request.send_data(group)

        group_list = self.list(request).data
        return request.send_data(group_list)

    def post(self, request):

        self.serializer_class = DepartmentPostSerailizer
        datas = request.data
        sub_org = SubOrgs.objects.filter(id=datas.get('sub_orgs')).first()
        datas['org'] = sub_org.org.id
        serializer = self.get_serializer(data=datas)

        if serializer.is_valid(raise_exception=False):
            with transaction.atomic():
                try:
                    self.perform_create(serializer)
                except Exception:
                    return request.send_error("ERR_002")
            return request.send_info("INF_001")

        else:
            return request.send_error_valid(serializer.errors)

    def delete(self, request, pk=None):
        qs = self.queryset.filter(id=pk).first()
        if qs:
            qs.delete()

        return request.send_info("INF_003")

    def put(self, request, pk=None):
        " хөтөлбөрийн багийн мэдээлэл засах "

        self.serializer_class = DepartmentRegisterListSerailizer

        department = self.queryset.get(id=pk)
        if not department:
            return request.send_error("ERR_002", "Хөтөлбөрийн баг олдсонгүй")

        errors = []
        datas = request.data

        leader = datas.get('lead') # Багш
        if leader:
            teacher = Teachers.objects.get(id=leader)
            user = teacher.user.id

            datas['leader'] = user

        instance = self.get_object()

        if 'lead' in datas:
            del datas['lead']

        if 'leaders' in datas:
            del datas['leaders']

        if 'branch_pos' in datas:
            del datas['branch_pos']

        serializer = self.get_serializer(instance, data=datas)
        if serializer.is_valid(raise_exception=True):
            serializer.save()

        else:
            for key in serializer.errors:
                return_error = {
                    "field": key,
                    "msg": serializer.errors
                }

                errors.append(return_error)

            if len(errors) > 0:
                return request.send_error("ERR_003", errors)

        return request.send_info("INF_002")

@permission_classes([IsAuthenticated])
class DepartmentListAPIView(
    generics.GenericAPIView,
    mixins.ListModelMixin,
):
    """"Салбар, тухайн дэд байгууллагын салбар """

    queryset = Salbars.objects
    serializer_class = DepartmentListSerailizer

    def get_queryset(self):
        queryset = self.queryset
        school = self.request.query_params.get('school')
        if school:
            queryset = queryset.filter(sub_orgs=school)

        return queryset

    def get(self, request, pk=None):
        " Салбарын жагсаалт "
        self.serializer_class = DepartmentListSerailizer

        if pk:
            group = self.retrieve(request, pk).data
            return request.send_data(group)

        group_list = self.list(request).data
        return request.send_data(group_list)


@permission_classes([IsAuthenticated])
class DepartmentTeachersListAPIView(
    generics.GenericAPIView,
    mixins.ListModelMixin,
):
    """ Багшийн заах цагийн ачаалал бүртгэх
    """
    queryset = TeacherCreditVolumePlan.objects
    serializer_class = TeacherLessonListSerializer

    def get(self, request, pk=None):
        """ Багшийн жагсаалт
        """

        if pk != 0:
            teacher_credit_volume_plan_ids = self.queryset.filter(department=pk).distinct('teacher').values_list('teacher', flat=True)
            qs = Teachers.objects.filter(id__in=teacher_credit_volume_plan_ids)
            data = self.serializer_class(qs, many=True).data
            return request.send_data(data)

        return request.send_data(list())


@permission_classes([IsAuthenticated])
class SubSchoolAPIView(
    generics.GenericAPIView,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin
):
    """" Дэд сургууль """

    queryset = SubOrgs.objects.all().filter(is_school=True).order_by('name')
    serializer_class = SubSchoolRegisterSerailizer

    def get(self, request, pk=None):
        " дэд сургуулийн жагсаалт "
        self.serializer_class = SubSchoolListSerailizer

        if pk:
            group = self.retrieve(request, pk).data
            return request.send_data(group)

        group_list = self.list(request).data
        return request.send_data(group_list)

    @transaction.atomic()
    def post(self, request):

        data = request.data
        data['is_school'] = True

        serializer = self.serializer_class(data=data)

        if not serializer.is_valid():

            return request.send_error('ERR_002', serializer.errors)

        serializer.save()

        return request.send_info('INF_001')

    def put(self, request, pk=None):
        " Дэд сургуулийн мэдээлэл засах "
        self.serializer_class = SubSchoolPutRegisterSerailizer

        subschool = self.queryset.get(id=pk)
        if not subschool:
            return request.send_error("ERR_002", "Дэд сургуулийн мэдээлэл олдсонгүй")

        datas = request.data
        data = null_to_none(datas)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=data, partial=True)
        if serializer.is_valid(raise_exception=False):
            serializer.save()
        else:
            return request.send_error_valid(serializer.errors)

        return request.send_info("INF_002")

    def delete(self, request, pk=None):
        self.destroy(request)
        return request.send_info('INF_003')


@permission_classes([IsAuthenticated])
class CountryAPIView(
    generics.GenericAPIView,
    mixins.RetrieveModelMixin,
    mixins.ListModelMixin,
):
    """" улсын жагсаалт """

    queryset = Country.objects
    serializer_class = CountryListSerializer

    def get(self, request, pk=None):

        country_list = self.list(request).data
        return request.send_data(country_list)

@permission_classes([IsAuthenticated])
class AimaghotAPIView(
    generics.GenericAPIView,
    mixins.RetrieveModelMixin,
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
):
    """" аймаг хотын жагсаалт """

    queryset = AimagHot.objects
    serializer_class = AimaghotListSerializer

    def get(self, request):

        data = self.list(request).data
        return request.send_data(data)

@permission_classes([IsAuthenticated])
class SumDuuregAPIView(
    generics.GenericAPIView,
    mixins.RetrieveModelMixin,
    mixins.ListModelMixin,
):
    """" сум дүүргийн жагсаалт """

    queryset = SumDuureg.objects
    serializer_class = SumDuuregListSerializer

    def get(self, request, unit1=None):
        if unit1:
            qs = self.queryset.filter(unit1=unit1).values("id", "name", "code")
            sum_duureg_list = list(qs)
            return request.send_data(sum_duureg_list)

@permission_classes([IsAuthenticated])
class BagHorooAPIView(
    generics.GenericAPIView,
    mixins.RetrieveModelMixin,
    mixins.ListModelMixin,
):
    """" баг хорооны жагсаалт """

    queryset = BagHoroo.objects
    serializer_class = BagHorooListSerializer

    def get(self, request, unit2=None):
        if unit2:
            qs = self.queryset.filter(unit2=unit2).values("id", "code", "name")
            bag_horoo_list = list(qs)
            return request.send_data(bag_horoo_list)

@permission_classes([IsAuthenticated])
class TeacherListAPIView(
    generics.GenericAPIView,
    mixins.ListModelMixin,
):
    queryset = Teachers.objects
    serializer_class = TeacherNameSerializer

    """ Багшийн мэдээллийн жагсаалт """

    def get_queryset(self):
        "Багшийн мэдээллийг сургууль, Хөтөлбөрийн багаар харуулах "

        queryset = self.queryset
        teacher_queryset = queryset.all().values_list('user', flat=True)
        qs_employee_user = Employee.objects.filter(user_id__in=list(teacher_queryset), org_position__is_teacher=True, state=Employee.STATE_WORKING).values_list('user', flat=True)
        if qs_employee_user:
            queryset = queryset.filter(user_id__in = list(qs_employee_user))

        sub_org = self.request.query_params.get('sub_org')

        # сургууль
        if sub_org:
            queryset = queryset.filter(sub_org=sub_org)

        salbar = self.request.query_params.get('salbar')
        # салбар, тэнхим
        if salbar:
            queryset = queryset.filter(salbar=salbar)

        return queryset

    def get(self, request):
        " нийт багшийн жагсаалт"

        teach_info = self.list(request).data
        return request.send_data(teach_info)

@permission_classes([IsAuthenticated])
class TeacherApiView(
    generics.GenericAPIView,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin
):
    """ Багшийн жагсаалт """

    queryset = Teachers.objects.all()
    serializer_class = TeacherNameSerializer

    pagination_class = CustomPagination

    filter_backends = [SearchFilter]
    search_fields = ['first_name', 'register', 'user__email', 'user__phone_number']

    def get_queryset(self):
        "Багшийн мэдээллийг сургууль, Хөтөлбөрийн багаар харуулах "

        queryset = get_teacher_queryset(False)

        # Бүх төвөвтэй багшийн жагсаалт
        state = self.request.query_params.get('state')
        sub_org = self.request.query_params.get('sub_org')
        salbar = self.request.query_params.get('salbar')
        position = self.request.query_params.get('position')
        sorting = self.request.query_params.get('sorting')

        teacher_queryset = queryset.all().values_list('user', flat=True)
        qs_employee_user = Employee.objects.filter(user__in=list(teacher_queryset))

        # Төлвөөр хайх
        if state:
            state = int(state)
            qs_employee_user = qs_employee_user.filter(state=state)
            user_ids = qs_employee_user.values_list('user', flat=True)
            queryset = queryset.filter(user__in=user_ids)

        # Бүрэлдэхүүн сургууль
        if sub_org:
            queryset = queryset.filter(sub_org=sub_org)

        # салбар, тэнхим
        if salbar:
            queryset = queryset.filter(salbar=salbar)

        # Албан тушаалаар хайх
        if position:
            qs_employee_user = qs_employee_user.filter(org_position=position)
            user_ids = qs_employee_user.values_list('user', flat=True)
            queryset = queryset.filter(user__in=user_ids)

        # Sort хийх үед ажиллана
        if sorting:
            if not isinstance(sorting, str):
                sorting = str(sorting)

            queryset = queryset.order_by(sorting)

        # if search:
        #     queryset = filter_queries(queryset.model, search)

        return queryset

    def get(self, request):
        " нийт багшийн жагсаалт"

        teach_info = self.list(request).data

        return request.send_data(teach_info)


@permission_classes([IsAuthenticated])
class TeacherListApiView(
    generics.GenericAPIView,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.DestroyModelMixin
):
    """ Багшийн урт жагсаалт """

    queryset = Teachers.objects.all()
    serializer_class = TeacherLongListSerializer

    def get(self, request):
        self.queryset = get_teacher_queryset() # Аль нэг салбар сургуульд хамаардаггүй багш нарыг "аних филтэр"

        school = self.request.query_params.get('school')
        department = self.request.query_params.get('department')

        if school:
            self.queryset = self.queryset.filter(sub_org=school)

        if department:
            self.queryset = self.queryset.filter(salbar=department)

        teach_info = self.list(request).data

        return request.send_data(teach_info)

    def delete(self, request, pk=None):

        with transaction.atomic():
            teacher = self.get_object()

            user = User.objects.filter(id=teacher.user.id).first()

            # Ажилтны мэдээлэл устгах
            Employee.objects.filter(user=user).delete()

            # User мэдээлэл устгах
            user.delete()
            # self.destroy(request)
        return request.send_info('INF_003')


@permission_classes([IsAuthenticated])
class TeacherAllListApiView(
    generics.GenericAPIView,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin
):
    """ Багшийн  жагсаалт """

    queryset = Teachers.objects.all()
    serializer_class = TeacherListSchoolFilterSerializer

    def get(self, request):
        self.queryset = get_teacher_queryset()

        school = self.request.query_params.get('school')
        department = self.request.query_params.get('department')

        if school:
            self.queryset = self.queryset.filter(sub_org=school)

        if department:
            self.queryset = self.queryset.filter(salbar=department)

        teach_info = self.list(request).data

        return request.send_data(teach_info)


@permission_classes([IsAuthenticated])
class TeacherListSubschoolApiView(
    generics.GenericAPIView,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin
):
    """ Багшийн урт жагсаалт """

    queryset = Teachers.objects.all().order_by('first_name')
    serializer_class = TeacherListSchoolFilterSerializer

    def get(self, request):
        school = self.request.query_params.get('school')
        self.queryset = get_teacher_queryset()
        if school:
            self.queryset = self.queryset.filter(sub_org=school)

            final_data = self.list(request).data
            return request.send_data(final_data)

        teach_info = self.list(request).data

        return request.send_data(teach_info)


@permission_classes([IsAuthenticated])
class TeacherInfoAPIView(
    mixins.ListModelMixin,
    generics.GenericAPIView,
):
    """ Багшийн дэлгэрэнгүй мэдээлэл """

    queryset = Teachers.objects
    serializer_class = TeacherInfoSerializer

    def get(self, request, pk=None):
        """ pk: teacher_id
            user_id: нэвтэрсэн хэрэглэгч-н id user_core model-д хадгалагдана
        """

        user_id = ""
        teacher = self.get_object()
        if not teacher:
            return request.send_data(dict())

        # ----- Ерөнхий мэдээлэл -----
        mainInfo = self.get_serializer(teacher, many=False).data

        # ----- Хичээлийн хуваарь мэдээлэл -----
        timetables = TimeTable.objects.filter(teacher=pk)

        serializer_timetable = ScheduleSerializer(timetables, many=True).data
        schedule = list(serializer_timetable)

        # ----- Дотуур байр түрээслэгч мэдээлэл-----
        dormitory = DormitoryFamilyContract.objects.filter(teacher=pk)
        serializer_dormitory = DormitoryFamilyContractSerializer(dormitory, many=True).data
        dormitory_list = list(serializer_dormitory)

        # ----- Заах хичээл мэдээлэл -----
        lessons = Lesson_to_teacher.objects.filter(teacher=pk)
        lesson_ser = Lesson_to_teacherSerializer(lessons, many=True).data
        lesson_info = list(lesson_ser)

        # ----- Удирдах ангийн мэдээлэл -----
        group = Group.objects.filter(teacher=pk)
        group_ser = GroupSerializer(group, many=True).data
        group_info = list(group_ser)

        # ----- Багшийн туслахаар ажиллах хүсэлт мэдээлэл -----
        requestutor = StudentRequestTutor.objects.filter(teacher=pk)
        requestutor_ser = StudentRequestTutorSerializer(requestutor, many=True).data
        requestutor_info = list(requestutor_ser)

        # ------------- Эрдэм шинжилгээ мэдээлэл ------------
        user_id = self.queryset.filter(id=pk).values_list("user", flat=True).first()
        if user_id:

            # ----------------Хэвлэн нийтлэл ------------------
            "Бүтээл"
            invention = UserInvention.objects.filter(user=user_id)
            invention_ser = UserInventionSerializer(invention, many=True).data
            invention_info = list(invention_ser)

            "Өгүүлэл"
            paper = UserPaper.objects.filter(user=user_id)
            paper_ser = UserPaperSerializer(paper, many=True).data
            paper_info = list(paper_ser)

            " Илтгэл "
            note = UserNote.objects.filter(user=user_id)
            note_ser = UserNoteSerializer(note, many=True).data
            note_info = list(note_ser)

            " Эшлэл "
            quotation = UserQuotation.objects.filter(user=user_id)
            quotation_ser = UserQuotationSerializer(quotation, many=True).data
            quotation_info = list(quotation_ser)

            # ------------- Төсөл, Гэрээт ажил -------------

            " Төсөл "
            project = UserProject.objects.filter(user=user_id)
            project_ser = UserProjectSerializer(project, many=True).data
            project_info = list(project_ser)

            " Гэрээт ажил"
            contractwork = UserContractWork.objects.filter(user=user_id)
            contractwork_ser = UserContractWorkSerializer(contractwork, many=True).data
            contractwork_info = list(contractwork_ser)

            #-------------------------- Оюуны өмч  -------------------------

            " Шинэ бүтээлийн патент"
            patent = UserPatent.objects.filter(user=user_id)
            patent_ser = UserPatentSerializer(patent, many=True).data
            patent_info = list(patent_ser)

            " Ашигтай загварын патент "
            certpatent = UserModelCertPatent.objects.filter(user=user_id)
            certpatent_ser = UserModelCertPatentSerializer(certpatent, many=True).data
            certpatent_info = list(certpatent_ser)

            " Барааны-Тэмдгийн-Гэрчилгээ "
            symbolcert = UserSymbolCert.objects.filter(user=user_id)
            symbolcert_ser = UserSymbolCertSerializer(symbolcert, many=True).data
            symbolcert_info = list(symbolcert_ser)

            " Лицензийн гэрчилгээ "
            licensecert = UserLicenseCert.objects.filter(user=user_id)
            licensecert_ser = UserLicenseCertSerializer(licensecert, many=True).data
            licensecert_info = list(licensecert_ser)

            " Зохиогчийн эрхийн гэрчилгээ "
            rightcert = UserRightCert.objects.filter(user=user_id)
            rightcert_ser = UserRightCertSerializer(rightcert, many=True).data
            rightcert_info = list(rightcert_ser)

        datas = {
            'mainInfo': mainInfo if mainInfo else [],
            'timetableData': schedule if schedule else [],
            'dormitoryData': dormitory_list if dormitory_list else [],
            "lessonTeachData": lesson_info if lesson_info else [],
            "groupData":group_info if group_info else [],
            'requestTutorData': requestutor_info if requestutor_info else [],
            'inventionData': invention_info if invention_info else [],
            'paperData': paper_info if paper_info else [],
            'noteData': note_info if note_info else [],
            "quotationData": quotation_info if quotation_info else [],
            "projectData":project_info if project_info else [],
            "contractworkData": contractwork_info if contractwork_info else [],
            "patentData": patent_info if patent_info else [],
            "certpatentData": certpatent_info if certpatent_info else [],
            "symbolcertData": symbolcert_info if symbolcert_info else [],
            "licensecertData": licensecert_info if licensecert_info else [],
            "rightcertData": rightcert_info if rightcert_info else [],
        }

        return request.send_data(datas)

@permission_classes([IsAuthenticated])
class OrgPositionListAPIView(
    generics.GenericAPIView,
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    mixins.UpdateModelMixin,
    mixins.RetrieveModelMixin,
    mixins.DestroyModelMixin
):
    """ Албан тушаалын жагсаалт """

    queryset = OrgPosition.objects
    serializer_class = OrgPositionSerializer

    filter_backends = [SearchFilter]
    search_fields = ['org__name', 'name', "created_at"]

    def get(self, request, pk=None):

        if pk:
            group = self.retrieve(request, pk).data
            return request.send_data(group)

        datas = self.list(request).data
        return request.send_data(datas)

    def post(self, request):

        self.serializer_class = OrgPositionPostSerializer

        with transaction.atomic():
            try:
                self.create(request).data
            except Exception as e:
                print(e)
                return request.send_error('ERR_002')
        return request.send_info("INF_001")

    def put(self, request, pk=None):
        # self.serializer_class = OrgPositionPostSerializer

        request_data = request.data
        instance = self.queryset.filter(id=pk).first()

        serializer = self.get_serializer(instance, data=request_data)

        if serializer.is_valid(raise_exception=False):
            is_success = False
            with transaction.atomic():
                try:
                    self.update(request).data
                    is_success = True
                except Exception:
                    print(e)

            if is_success:
                return request.send_info("INF_002")

            return request.send_error("ERR_002")
        else:
            error_obj = []
            for key in serializer.errors:
                msg = "Хоосон байна"

                return_error = {
                    "field": key,
                    "msg": msg
                }

                error_obj.append(return_error)

            if len(error_obj) > 0:
                return request.send_error("ERR_003", error_obj)

        return request.send_info("INF_002")

    def delete(self, request, pk=None):
        if pk:
            self.destroy(request, pk)

        return request.send_info('INF_003')
@permission_classes([IsAuthenticated])
class PermissionListAPIView(
    generics.GenericAPIView,
    mixins.ListModelMixin,
):
    """ Албан тушаалын жагсаалт """

    queryset = Permissions.objects
    serializer_class = PermissionSerializer

    def get(self, request):

        datas = self.list(request).data
        return request.send_data(datas)

@permission_classes([IsAuthenticated])
class DepLeaderAPIView(
    generics.GenericAPIView,
    mixins.ListModelMixin,
):
    """ Хөтөлбөрийн багийн ахлагч жагсаалт """

    queryset = Teachers.objects.all()
    serializer_class = TeachersSerializer

    def get(self, request):

        school = request.query_params.get('school')

        qs_teachers = get_teacher_queryset()
        self.queryset = qs_teachers

        if school:
            self.queryset  = self.queryset.filter(sub_org=school)

        datas = self.list(request).data
        return request.send_data(datas)


class TeacherPartListApiView(
    generics.GenericAPIView,
    mixins.ListModelMixin,
):
    """ Цагийн багшийн жагсаалт авах """

    queryset = Teachers.objects.all()
    serializer_class = TeachersSerializer

    def get(self, request):

        school = request.query_params.get('school')

        user_ids = Employee.objects.filter(worker_type=Employee.WORKER_TYPE_CONTRACT).values_list('user', flat=True)
        self.queryset  = self.queryset.filter(user__id__in=user_ids)

        if school:
            self.queryset  = self.queryset.filter(sub_org=school)

        all_data = self.list(request).data

        return request.send_data(all_data)


# Хуанли цэс доторх картнууд

@permission_classes([IsAuthenticated])
class CalendarCountAPIView(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    generics.CreateAPIView
):

    def get(self, request):

        school = request.query_params.get('school')
        collected_data = dict()

        STUDYING_CODE = 1           # Суралцаж байгаа сурагчид
        TAKE_LEAVE = 2              # Чөлөө авсан сурагчид

        teacher_qs = get_teacher_queryset()

        profession_queryset = ProfessionDefinition.objects
        lessons_queryset = LessonStandart.objects
        students_queryset = Student.objects
        if school:
            profession_queryset = profession_queryset.filter(school=school)
            teacher_qs = teacher_qs.filter(sub_org=school)
            lessons_queryset = lessons_queryset.filter(school=school)
            students_queryset = students_queryset.filter(group__school=school)

        collected_data['total_profession'] = profession_queryset.count()
        collected_data['total_workers'] = teacher_qs.count()
        collected_data['total_studies'] = lessons_queryset.count()
        collected_data['total_students'] = students_queryset.filter(status__code=1).count()
        salbar_data = []

        collected_data['salbar_data'] = salbar_data

        return request.send_data(collected_data)


@permission_classes([IsAuthenticated])
class EmployeeApiView(
    generics.GenericAPIView,
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin
):
    """ Багшийн жагсаалт """

    queryset = Employee.objects.all()
    serializer_class = EmployeePostSerializer

    pagination_class = CustomPagination

    filter_backends = [SearchFilter]
    search_fields = ['first_name', 'last_name', 'register_code']

    def post(self, request):
        with transaction.atomic():

            sid = transaction.savepoint()
            if not request.data.get('email'):
                del request.data['email']

            def check_field(field, value):
                if not request.data.get(field):
                    request.data[field] = value

            check_field('body_height', 0)
            check_field('body_weight', 0)
            check_field('emdd_number', None)
            check_field('hudul_number', None)
            check_field('ndd_number', None)
            check_field("home_phone", 0)
            check_field("register_code", None)

            check_user = Teachers.objects.filter(register=request.data['register'], action_status=Teachers.APPROVED, user__email=request.data['email'])
            sub_org = SubOrgs.objects.get(id=request.data.get('sub_org'))

            if check_user and check_user.exists:
                return request.send_error_valid(
                    [
                        {
                            'field': 'register',
                            'msg': 'Системд бүртгэлтэй хэрэглэгч байна'
                        }
                    ]
                )
            else:
                # Register ийн сүүлийн 8 оронг нууц үг болгох нь
                request.data['password'] = request.data['register'][-8:]
                request.data['org'] = sub_org.org.id

                # User моделийн датаг эхлэээд үүсгэнэ
                user_serializer = UserRegisterSerializer(
                    data=request.data,
                )

                if not user_serializer.is_valid():
                    transaction.savepoint_rollback(sid)
                    return request.send_error_valid(user_serializer.errors)

                #  UserInfo үүсгэхэд хэрэгтэй датануудыг цуглуулах нь
                user = user_serializer.save()
                request.data['user'] = str(user.id)
                request.data['birthday'], request.data['gender'] = calculate_birthday(request.data['register'])
                if not request.data['birthday']:
                    request.data['birthday'] = '1985-01-01'

                request.data['action_status'] = Teachers.APPROVED
                request.data['action_status_type'] = Teachers.ACTION_TYPE_ALL

                userinfo_serializer = UserInfoSerializer(
                    data=request.data,
                )

                if not userinfo_serializer.is_valid():
                    transaction.savepoint_rollback(sid)
                    return request.send_error_valid(userinfo_serializer.errors)
                userinfo_serializer.save()

            if 'worker_type' in request.data:
                request.data['worker_type'] = Employee.WORKER_TYPE_EMPLOYEE

            employee_serializer = EmployeeSerializer(data=request.data)
            if not employee_serializer.is_valid(raise_exception=True):
                transaction.savepoint_rollback(sid)
                return request.send_error_valid(employee_serializer.errors)

            employee_serializer.save()

        return request.send_info("INF_001")

    def put(self, request, pk=None):
        datas = request.data
        salbar = datas.get('salbar')
        if salbar:
            salbar_obj = Salbars.objects.filter(id=salbar).first()
            sub_org = salbar_obj.sub_orgs
            datas['sub_org'] = sub_org.id

        instance = Teachers.objects.filter(id=pk).first()
        user_obj = User.objects.get(id=instance.user.id)
        user_serializer = UserSerializer(user_obj, data=request.data, partial=True)
        if not user_serializer.is_valid():
            return request.send_error_valid(user_serializer.errors)

        user = user_serializer.save()
        datas['user'] = str(user.id)

        userinfo_serializer = UserInfoSerializer(instance, data=datas, partial=True)
        if not userinfo_serializer.is_valid():
            return request.send_error_valid(userinfo_serializer.errors)

        userinfo_serializer.save()
        employee_obj = Employee.objects.filter(user=user_obj).first()
        employee_serializer = EmployeeSerializer(employee_obj, data=datas, partial=True)
        if not employee_serializer.is_valid(raise_exception=True):
            return request.send_error_valid(employee_serializer.errors)

        employee_serializer.save()
        return request.send_info("INF_002")


@permission_classes([IsAuthenticated])
class CRUDAPIView(
    generics.GenericAPIView,
    mixins.RetrieveModelMixin,
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
):

    '''
        Динамик API

        Энэ API-р дурын моделийн crud үйлдлийг хийх боломжтой.
        params-р моделийн нэрийг явуулсанаар ажиллана.

        Variables

        app_name - Модел байгаа app-н нэр.
        model_name - Моделийн нэр.
        fields - Авах field-н нэр
        custom_search - GET хүсэлтийг filter-лэх эсэх
        filter_data = Хайх field болон утгийн хэсэг
        generate_model_serializer() - Тухайн моделийн serializer-г үүсгэх функц.
    '''

    filter_backends = [SearchFilter]
    pagination_class = CustomPagination

    def get(self, request, pk=None):

        app_name = request.query_params.get('app_name')
        model_name = request.query_params.get('model_name')
        fields = request.query_params.get('fields')

        data = {}

        if app_name:
            data['app_name'] = app_name

        if model_name:
            data['model_name'] = model_name

        if fields:
            data['fields'] = fields

        # Модел байгаа эсэхийг шалгах
        try:
            model = apps.get_model(data['app_name'], data['model_name'])
            self.queryset = model.objects.all()

        except:
            return request.send_error('ERR_013')

        custom_search = request.query_params.get('custom_search')

        if custom_search:

            filter_data = request.query_params.get('filter_data')
            print(filter_data)
            filter_data = json.loads(filter_data)

            self.queryset = self.queryset.filter(**filter_data)

        # Field байгаа эсэхийг шалгах
        try:
            self.serializer_class = generate_model_serializer(model, data['fields'])

        except:
            self.serializer_class = generate_model_serializer(model)

        # pk байгаа үед тухайн pk-тай объектыг авах
        if pk:
            try:
                all_data = self.retrieve(request, pk).data

            except:
                return request.send_error('ERR_014')

            return request.send_data(all_data)

        try:
            all_data = self.list(request, pk).data

        except:
            return request.send_error('ERR_014')

        return request.send_data(all_data)


    @transaction.atomic()
    def post(self, request):

        data = request.data

        # Модел байгаа эсэхийг шалгах
        try:
            model = apps.get_model(data['app_name'], data['model_name'])
            self.queryset = model.objects.all()

        except:
            return request.send_error('ERR_013')

        self.serializer_class = generate_model_serializer(model)
        serializer = self.serializer_class(data=data)

        if not serializer.is_valid():

            return request.send_error('ERR_002', serializer.errors)

        serializer.save()

        return request.send_info('INF_001')


    @transaction.atomic()
    def put(self, request, pk=None):

        data = request.data

        # Модел байгаа эсэхийг шалгах
        try:
            model = apps.get_model(data['app_name'], data['model_name'])
            self.queryset = model.objects.all()

        except:
            return request.send_error('ERR_013')

        self.serializer_class = generate_model_serializer(model)
        instance = self.get_object()

        serializer = self.serializer_class(instance, data=data)

        if not serializer.is_valid():

            return request.send_error('ERR_002', serializer.errors)

        serializer.save()

        return request.send_info('INF_002')


    def delete(self, request, pk=None):

        data = request.data

        # Модел байгаа эсэхийг шалгах
        try:
            model = apps.get_model(data['app_name'], data['model_name'])
            self.queryset = model.objects.all()

        except:
            return request.send_error('ERR_013')

        self.destroy(request, pk)

        return request.send_info('INF_003')


@permission_classes([IsAuthenticated])
class TeacherResetPassword(
    generics.GenericAPIView
):
    """ Багшийн нууц үг сэргээх """

    queryset = User.objects

    def put(self, request, pk=None):
        self.queryset = self.queryset.filter(teachers__id=pk)
        default_password = self.queryset.values_list('teachers__register',flat=True).first()

        if default_password and len(default_password) >= 8:
            with transaction.atomic():
                hashed_password = make_password(default_password[-8:])
                self.queryset.update(password=hashed_password)
        else:
            return request.send_error('ERR_002')

        return request.send_info('INF_018')


@permission_classes([IsAuthenticated])
class AblePositionAPIView(
    generics.GenericAPIView,
):
    def get(self, request):

        header = {
            'token': settings.GPT,
        }

        url = 'https://uia.able.mn/insight.php/?a=ableApi&tsk=getPositions&key=uia'

        rsp = requests.get(url=url, headers=header)
        if rsp.status_code == 200:
            datas = rsp.json()
            count = 0
            create_datas = []
            crete_namess = []
            for data in datas:
                name = data.get('name')
                position_obj = OrgPosition.objects.filter(name__icontains=name).first()
                if not position_obj:
                    is_teacher = False
                    if name in ['Багш', 'багш']:
                        is_teacher = True

                    if name not in crete_namess:
                        create_datas.append(
                            OrgPosition(
                                name=name,
                                is_teacher=is_teacher,
                                org=Schools.objects.first(),
                            )
                        )

                    crete_namess.append(name)
                else:
                    position_obj.name=name
                    position_obj.save()

            OrgPosition.objects.bulk_create(create_datas)
        return request.send_info('INF_020')


@permission_classes([IsAuthenticated])
class AbleWorkerAPIView(
    generics.GenericAPIView,
):
    def get(self, request):
        dep_datas = []
        count = 0
        employee = None

        def find_data_from_list_by_key(list, key, value):
            return next(filter(lambda x: x[key] == value, list), None)

        def get_key_from_name(name):
            for key, value in Employee.EDUCATION_LEVEL:
                if value == name:
                    return key
            return None

        header = {
            'token': settings.GPT
        }
        url = 'https://uia.able.mn/insight.php/?a=ableApi&tsk=getWorkers&key=uia'
        rsp = requests.get(url=url, headers=header)

        dep_url = 'https://uia.able.mn/insight.php/?a=ableApi&tsk=getDeps&key=uia'
        dep_rsp = requests.get(url=dep_url, headers=header)

        try:
            if dep_rsp.status_code == 200:
                dep_datas = dep_rsp.json()

            if rsp.status_code == 200:
                datas = rsp.json()
                count = 0
                in_count = 0
                create_datas = []
                for data in datas:
                    reg_number = data.get('reg_number')
                    last_name = data.get('last_name')
                    first_name = data.get('first_name')
                    position_name = data.get('app_name')

                    rank_type = data.get('rank_type')
                    rank_name = data.get('rank_name')
                    rank_rate = data.get('rank_rate')

                    personal_mail = data.get('personal_mail')
                    subschool_id = data.get('com_id')
                    dep_id = data.get('dep_id')
                    edu_rank = data.get('edu_rank')

                    teacher = Teachers.objects.filter(Q(Q(register=reg_number) | Q(user__email__iexact=personal_mail))).first()
                    position = OrgPosition.objects.filter(name__iexact=position_name).first()
                    data['org_position'] = position.id if position else None

                    if teacher:
                        in_count += 1
                        teacher.rank_name = rank_name
                        teacher.rank_type = rank_type
                        teacher.rank_rate = rank_rate
                        teacher.save()

                        employee = Employee.objects.filter(user=teacher.user).first()

                        if not employee:
                            data['register_code'] = data.get('id_number')
                            data['user'] = teacher.user.id

                            # register_code ягаадч юм давхцаад байгааг ингэж шийдсэн
                            if Employee.objects.filter(register_code=data.get('id_number')).exists():
                                data['register_code'] = data.get('app_id')

                            employee_serializer = EmployeeSerializer(data=data)
                            if not employee_serializer.is_valid(raise_exception=True):
                                print('Employee үүсч чадсангүй 1')
                                break

                            employee_serializer.save()

                        else:
                            employee.org_position = position if position else None

                            employee.save()
                    else:
                        def check_field(field, value):
                            if not data.get(field):
                                data[field] = value

                        check_field('body_height', 0)
                        check_field('body_weight', 0)
                        check_field('emdd_number', None)
                        check_field('hudul_number', None)
                        check_field('ndd_number', None)
                        check_field("home_phone", 0)
                        check_field("register_code", None)

                        data['password'] = reg_number[-8:]
                        data['email'] = personal_mail
                        data['register'] = reg_number
                        data['register_code'] = data.get('id_number')

                        school_data = find_data_from_list_by_key(dep_datas, 'id', subschool_id)
                        if school_data:
                            name = school_data['name']
                            school = SubOrgs.objects.filter(name__iexact=name).first()
                            data['sub_org'] = school.id if school else None
                            sub_list = school_data['subs']
                            sub_data = find_data_from_list_by_key(sub_list, 'id', dep_id)
                            if sub_data:
                                salbar_obj = Salbars.objects.filter(sub_orgs=school, name__iexact=sub_data['name']).first()
                                if salbar_obj:
                                    data['salbar'] = salbar_obj.id
                                else:
                                    data['salbar'] = None
                            else:
                                data['salbar'] = None

                        # User моделийн датаг эхлэээд үүсгэнэ
                        user_serializer = UserRegisterSerializer(
                            data=data,
                        )

                        if not user_serializer.is_valid():
                            print('User үүсч чадсангүй')
                            break

                        user = user_serializer.save()
                        data['user'] = str(user.id)
                        data['birthday'], data['gender'] = calculate_birthday(reg_number)
                        data['action_status_type'] = Teachers.ACTION_TYPE_ALL
                        data['action_status'] = Teachers.APPROVED

                        userinfo_serializer = UserInfoSerializer(
                            data=data,
                        )

                        if not userinfo_serializer.is_valid():
                            print('UserInfo үүсч чадсангүй')
                            break
                        userinfo_serializer.save()

                        if 'worker_type' in data:
                            data['worker_type'] = Employee.WORKER_TYPE_EMPLOYEE

                        level = get_key_from_name(edu_rank)
                        if level:
                            data['education_level'] = level

                        # register_code ягаадч юм давхцаад байгааг ингэж шийдсэн
                        if Employee.objects.filter(register_code=data.get('id_number')).exists():
                            data['register_code'] = data.get('app_id')

                        employee_serializer = EmployeeSerializer(data=data)
                        if not employee_serializer.is_valid(raise_exception=True):
                            print('Employee үүсч чадсангүй')
                            break

                        employee_serializer.save()
                        count += 1
                        print('Амжилттай үүслээ', count)

        except Exception as e:
            print('e', e)
            return request.send_error("ERR_002", "Able-с мэдээлэл татахад алдаа гарлаа")

        return_datas = {
            'new': count,
        }
        return request.send_info('INF_020', return_datas)



@permission_classes([IsAuthenticated])
class SysInfoApiView(
    generics.GenericAPIView,
):
    """ Системийн хандалт"""

    queryset = AccessHistoryLms.objects.all()

    def get(self, request):
        stype = request.query_params.get('stype')
        cfilter = {}
        today = datetime.today().date()
        if stype == 'day':
            cfilter['in_time__date'] = today
        elif stype == 'week':
            start_of_week = today - timedelta(days=today.weekday())  # Monday
            end_of_week = start_of_week + timedelta(days=6)  # Sunday
            cfilter['in_time__range'] = (start_of_week, end_of_week)

        elif stype == 'last_month':
            first_day_this_month = today.replace(day=1)
            last_month_last_day = first_day_this_month - timedelta(days=1)
            last_month_first_day = last_month_last_day.replace(day=1)
            cfilter['in_time__range'] = (last_month_first_day, last_month_last_day)

        elif stype == 'three_month':
            three_months_ago = today - relativedelta(months=3)
            cfilter['in_time__range'] = (three_months_ago, today)

        queryset = self.queryset.filter(**cfilter)

        return request.send_data({
            'total': queryset.count(),
            'sis': queryset.filter(system_type=AccessHistoryLms.LMS).count(),
            'student': queryset.filter(system_type=AccessHistoryLms.STUDENT).count(),
            'teacher': queryset.filter(system_type=AccessHistoryLms.TEACHER).count(),
        })
