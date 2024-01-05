from rest_framework import mixins
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes
from rest_framework.filters import SearchFilter

from main.utils.function.utils import filter_queries
from main.utils.function.pagination import CustomPagination
from main.utils.function.utils import get_teacher_queryset, remove_key_from_dict, null_to_none,override_get_queryset
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
from core.models import Notification


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
from .serializers import SubSchoolsRegisterPostSerailizer
from .serializers import DepartmentPostSerailizer
from .serializers import EmployeePostSerializer


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
        teacher_ids = []

        if lesson:
            teacher_ids = TimeTable.objects.filter(lesson=lesson).values_list('teacher', flat=True)

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
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin

):
    """" Сургууль, Хамгийн том Байгууллага"""

    queryset = Schools.objects.all()
    serializer_class = SchoolsRegisterSerailizer

    def get(self, request, pk=None):
        " Сургуулийн жагсаалт "
        instance = Schools.objects.first()
        school_data = self.get_serializer(instance).data

        return request.send_data(school_data)


@permission_classes([IsAuthenticated])
class DepartmentAPIView(
    generics.GenericAPIView,
    mixins.UpdateModelMixin,
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.DestroyModelMixin,
):
    """"Салбар, тухайн дэд байгууллагын салбар """

    queryset = Salbars.objects.all().order_by("-created_at")

    serializer_class = DepartmentRegisterSerailizer

    filter_backends = [SearchFilter]
    search_fields = ['name']


    def get(self, request, pk=None):
        " Салбарын жагсаалт "

        school = self.request.query_params.get('school')

        if school:
            self.queryset = self.queryset.filter(sub_orgs=school)

        if pk:
            group = self.retrieve(request, pk).data
            return request.send_data(group)

        group_list = self.list(request).data
        return request.send_data(group_list)

    def post(self, request):
        " Салбар, Тэнхим шинээр үүсгэх "

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

            return request.send_error("ERR_002")

    def put(self, request, pk=None):
        " Тэнхимийн мэдээлэл засах "

        self.serializer_class = DepartmentRegisterListSerailizer

        department = self.queryset.get(id=pk)
        if not department:
            return request.send_error("ERR_002", "Тэнхимийн мэдээлэлэ олдсонгүй")

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

    def delete(self, request, pk=None):
        " устгах "

        qs = self.queryset.filter(id=pk).first()

        if qs:
            qs.delete()

        return request.send_info("INF_003")


@permission_classes([IsAuthenticated])
class DepartmentListAPIView(
    generics.GenericAPIView,
    mixins.RetrieveModelMixin,
    mixins.ListModelMixin,
):
    """"Салбар, тухайн дэд байгууллагын салбар """

    queryset = Salbars.objects.all()
    serializer_class = DepartmentListSerailizer

    def get(self, request, pk=None):
        " Салбарын жагсаалт "

        school = self.request.query_params.get('school')
        if school:
            self.queryset = self.queryset.filter(sub_orgs=school)

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
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    generics.GenericAPIView,
):
    """" Бүрэлдэхүүн сургууль """

    queryset = SubOrgs.objects.order_by("-created_at")
    serializer_class = SubSchoolRegisterSerailizer

    filter_backends = [SearchFilter]
    search_fields = ['name', 'zahiral_name', 'erdem_tsol_name']

    def get(self, request, pk=None):
        " Бүрэлдэхүүн сургуулийн жагсаалт "
        self.serializer_class = SubSchoolListSerailizer

        if pk:
            group = self.retrieve(request, pk).data
            return request.send_data(group)

        group_list = self.list(request).data
        return request.send_data(group_list)

    def post(self, request):
        " бүрэлдэхүүн сургууль шинээр үүсгэх "

        self.serializer_class = SubSchoolsRegisterPostSerailizer
        datas = request.data

        school = Schools.objects.first()

        datas['org'] = school.id

        serializer = self.get_serializer(data=datas)

        if serializer.is_valid(raise_exception=False):
            with transaction.atomic():
                try:
                    self.perform_create(serializer)
                except Exception:
                    return request.send_error("ERR_002")
            return request.send_info("INF_001")
        else:
            error_obj = []
            for key in serializer.errors:
                msg = "Хоосон байна"

                return_error = {
                    "field": key,
                    "msg": msg
                }

                error_obj.append(return_error)
            print(error_obj)
            if len(error_obj) > 0:
                return request.send_error("ERR_003", error_obj)

            return request.send_error("ERR_002")

    def put(self, request, pk=None):
        " Дэд сургуулийн мэдээлэл засах "
        self.serializer_class = SubSchoolPutRegisterSerailizer

        subschool = self.queryset.get(id=pk)
        if not subschool:
            return request.send_error("ERR_002", "Дэд сургуулийн мэдээлэл олдсонгүй")

        errors = []
        datas = request.data
        data = null_to_none(datas)
        org = data.get("org")
        name_eng = data.get("name_eng")
        name_uig = data.get("name_uig")
        zahiral_name = data.get("zahiral_name")
        zahiral_name_eng = data.get("zahiral_name_eng")
        zahiral_name_uig = data.get("zahiral_name_uig")
        tsol_name = data.get("tsol_name")
        tsol_name_eng = data.get("tsol_name_eng")
        tsol_name_uig = data.get("tsol_name_uig")
        erdem_tsol_name = data.get("erdem_tsol_name")
        erdem_tsol_name_eng = data.get("erdem_tsol_name_eng")
        erdem_tsol_name_uig = data.get("erdem_tsol_name_uig")

        instance = self.get_object()
        serializer = self.get_serializer(data=data)
        if serializer.is_valid(raise_exception=False):
            with transaction.atomic():
                try:
                    qs = self.queryset.filter(id=pk)
                    if qs:
                        qs.update(
                            org=org,
                            name_eng=name_eng,
                            name_uig=name_uig,
                            zahiral_name=zahiral_name,
                            zahiral_name_eng=zahiral_name_eng,
                            zahiral_name_uig=zahiral_name_uig,
                            tsol_name=tsol_name,
                            tsol_name_eng=tsol_name_eng,
                            tsol_name_uig =tsol_name_uig,
                            erdem_tsol_name =erdem_tsol_name,
                            erdem_tsol_name_eng =erdem_tsol_name_eng,
                            erdem_tsol_name_uig=erdem_tsol_name_uig,
                        )
                except Exception:
                    raise

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

    def delete(self, request, pk=None):
        " устгах "

        # SubOrgs.objects.filter(pk=pk).delete()

        self.destroy(request, pk)
        return request.send_info("INF_003")

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
    mixins.RetrieveModelMixin,
    mixins.CreateModelMixin
):
    """ Багшийн жагсаалт """

    queryset = Teachers.objects.all().order_by("created_at")
    serializer_class = TeacherNameSerializer

    pagination_class = CustomPagination

    filter_backends = [SearchFilter]
    search_fields = ['first_name', 'last_name', 'register']

    def get_queryset(self):
        "Багшийн мэдээллийг сургууль, Хөтөлбөрийн багаар харуулах "

        queryset = get_teacher_queryset()

        sub_org = self.request.query_params.get('sub_org')
        salbar = self.request.query_params.get('salbar')
        sorting = self.request.query_params.get('sorting')


        # Бүрэлдэхүүн сургууль
        if sub_org:
            queryset = queryset.filter(sub_org=sub_org)

        # салбар, тэнхим
        if salbar:
            queryset = queryset.filter(salbar=salbar)

        # Sort хийх үед ажиллана
        if sorting:
            if not isinstance(sorting, str):
                sorting = str(sorting)

            queryset = queryset.order_by(sorting)

        return queryset

    def get(self, request):
        " нийт багшийн жагсаалт"

        teach_info = self.list(request).data
        return request.send_data(teach_info)


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
        " Багшийн мэдээлэл шинээр үүсгэх "

        datas = request.data
        serializer = self.get_serializer(data=datas)
        if serializer.is_valid(raise_exception=False):
            with transaction.atomic():
                try:
                    self.perform_create(serializer)
                except Exception:
                    return request.send_error("ERR_002")
            return request.send_info("INF_001")
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

            return request.send_error("ERR_002")

@permission_classes([IsAuthenticated])
class TeacherLongListApiView(
    generics.GenericAPIView,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin
):
    """ Багшийн урт жагсаалт """

    queryset = Teachers.objects.all()
    serializer_class = TeacherLongListSerializer

    def get(self, request):

        teach_info = self.list(request).data
        return request.send_data(teach_info)


@permission_classes([IsAuthenticated])
class TeacherListSubschoolApiView(
    generics.GenericAPIView,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin
):
    """ Багшийн урт жагсаалт """

    queryset = Teachers.objects.all()
    serializer_class = TeacherListSchoolFilterSerializer

    def get(self, request):
        school = self.request.query_params.get('school')
        self.queryset = self.queryset.exclude(sub_org__isnull=True) # Аль нэг салбар сургуульд хамаардаггүй багш нарыг "аних филтэр"

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
):
    """ Албан тушаалын жагсаалт """

    queryset = OrgPosition.objects
    serializer_class = OrgPositionSerializer

    def get(self, request):

        self.queryset = self.queryset.filter(is_teacher=True)
        datas = self.list(request).data
        return request.send_data(datas)

@permission_classes([IsAuthenticated])
class DepLeaderAPIView(
    generics.GenericAPIView,
    mixins.ListModelMixin,
):
    """ Тэнхимийн эрхлэгч жагсаалт """

    queryset = Teachers.objects.all()
    serializer_class = TeachersSerializer

    def get(self, request):

        school = request.query_params.get('school')

        qs_teachers = get_teacher_queryset()
        self.queryset = qs_teachers
        # if school:
        #     self.queryset = self.queryset.filter(sub_org_id=school)

        datas = self.list(request).data
        return request.send_data(datas)


class TeacherPartListApiView(
    generics.GenericAPIView,
    mixins.ListModelMixin
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
