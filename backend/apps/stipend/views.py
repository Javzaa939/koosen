from django.db import transaction

from rest_framework import mixins
from rest_framework import generics
from django.conf import settings
import os

from main.utils.function.utils import has_permission, override_get_queryset, get_active_year_season

from main.utils.function.pagination import CustomPagination

from .serializers import StipendSerializer
from .serializers import StipendListSerializer
from .serializers import StipendStudentListSerializer
from .serializers import StipendStudentSerializer
from .serializers import StatisticsInfoSerializer

from main.utils.function.utils import str2bool, get_domain_url

from main.utils.file import save_file

from rest_framework.filters import SearchFilter

from lms.models import Stipend
from lms.models import StipentStudent
from lms.models import StipentStudentFile
from lms.models import Student
from lms.models import ProfessionalDegree


class StipendAPIView(
    mixins.CreateModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    mixins.RetrieveModelMixin,
    mixins.ListModelMixin,
    generics.GenericAPIView
):

    queryset = Stipend.objects.all()
    serializer_class = StipendSerializer

    pagination_class = CustomPagination

    filter_backends = [SearchFilter]
    search_fields = ['stipend_type__name','stipend_type__code','body','start_date','finish_date']

    @has_permission(must_permissions=['lms-stipend-read'])
    def get(self, request, pk=None):
        self.serializer_class = StipendListSerializer
        if pk:
            stipend = self.retrieve(request, pk).data
            return request.send_data(stipend)

        all_stipends = self.list(request).data
        return request.send_data(all_stipends)

    @has_permission(must_permissions=['lms-stipend-create'])
    def post(self, request):
        " Тэтгэлэг бүртгэл шинээр үүсгэх "

        data = request.data
        serializer = self.get_serializer(data=data)

        if serializer.is_valid(raise_exception=False):
            is_success = False
            with transaction.atomic():
                try:
                    self.create(request).data

                    is_success = True
                except Exception:
                    raise
            if is_success:
                return request.send_info("INF_001")

            return request.send_error("ERR_002")
        else:
            # Олон алдааны мессэж буцаах бол үүнийг ашиглана
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

        return request.send_info("INF_001")

    @has_permission(must_permissions=['lms-stipend-update'])
    def put(self, request, pk=None):
        " Тэтгэлэг бүртгэл шинэчлэх "

        request_data = request.data
        instance = self.get_object()

        serializer = self.get_serializer(instance, data=request_data)

        if serializer.is_valid(raise_exception=False):
            is_success = False
            with transaction.atomic():
                try:
                    self.update(request).data
                    is_success = True
                except Exception:
                    raise
            if is_success:
                return request.send_info("INF_001")

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

            return request.send_error("ERR_002")

    @has_permission(["lms-stipend-delete"])
    def delete(self, request, pk=None):
        " Тэтгэлэг бүртгэл  устгах "

        requestStipend = StipentStudent.objects.filter(stipent=pk)
        if requestStipend:
            return request.send_error("ERR_002", "Энэ тэтгэлэгт хүсэлт илгээсэн тул устгах боломжгүй.")

        self.destroy(request, pk)
        return request.send_info("INF_003")


class StipendRequestAPIView(
    mixins.CreateModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    mixins.RetrieveModelMixin,
    mixins.ListModelMixin,
    generics.GenericAPIView
):

    queryset = StipentStudent.objects.all()
    serializer_class = StipendStudentSerializer

    pagination_class = CustomPagination

    filter_backends = [SearchFilter]
    search_fields = ['student__code', 'student__first_name', 'request', 'stipent__stipend_type__name']

    def get_queryset(self):

        queryset = self.queryset
        schoolId = self.request.query_params.get('schoolId')
        lesson_year = self.request.query_params.get('lesson_year')
        lesson_season = self.request.query_params.get('lesson_season')
        solved = self.request.query_params.get('solved')
        stipend = self.request.query_params.get('stipend')

        if lesson_year:
            queryset = queryset.filter(stipent__lesson_year=lesson_year)

        if lesson_season:
            queryset = queryset.filter(stipent__lesson_season=lesson_season)

        if schoolId:
            queryset = queryset.filter(student__school=schoolId)

        if solved:
            queryset = queryset.filter(solved_flag=solved)

        if stipend:
            queryset = queryset.filter(stipent__stipend_type=stipend)

        return queryset

    @has_permission(must_permissions=['lms-stipend-request-read'])
    def get(self, request, pk=None):
        self.serializer_class = StipendStudentListSerializer
        if pk:
            stipend = self.retrieve(request, pk).data
            return request.send_data(stipend)

        all_stipends = self.list(request).data
        return request.send_data(all_stipends)

    @has_permission(must_permissions=['lms-stipend-request-update'])
    def put(self, request, pk=None):
        """ Тэтгэлэгийн хүсэлтээд хариулах """

        request_data = request.data
        instance = self.queryset.filter(id=pk).first()

        serializer = self.get_serializer(instance, data=request_data)

        if serializer.is_valid(raise_exception=False):
            is_success = False
            with transaction.atomic():
                try:
                    self.perform_update(serializer)
                    is_success = True
                except Exception:
                    raise
            if is_success:
                return request.send_info("INF_001")

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

            return request.send_error("ERR_002")
        
class StipendFileAPIView(
    generics.GenericAPIView,
):

    def post(self, request):
        """file hadgalah
        """

        data = request.data
        file = data.get('file')

        path = save_file(file, 'stipend_image', settings.STIPEND_FILE)

        domain = get_domain_url()

        file_path = os.path.join(settings.MEDIA_URL, path)

        return_url = '{domain}{path}'.format(domain=domain, path=file_path)

        return request.send_data(return_url)


class StatisticsInfoAPIView(
    mixins.ListModelMixin,
    generics.GenericAPIView
):


    queryset = Student.objects.all()
    serializer_class = StatisticsInfoSerializer

    def get(self, request):

        queryset = self.queryset
        data = list()
        range_pro = range(0, len(ProfessionalDegree.objects.all())+1)
        student_state = 0
        disability_student = 0
        pay_type = Student.PAY_TYPE
        pay_type = ((0, "Бүгд"), *pay_type)

        for key in pay_type:
            key_data = list()
            if key[0]==0:
                student_state = queryset
                student_men = len(queryset.filter(gender=1))
                student_women = len(queryset.filter(gender=2))
                all_student_count = student_men + student_women
                dict_data = {
                    "pay_type_id": 0,
                    "pay_type_name": "Бүгд",
                    "all_student_count": all_student_count,
                    "student_men": student_men,
                    "student_women": student_women
                }
                key_data.append(dict_data)
            else:
                student_state = queryset.filter(pay_type=key[0])
                student_state_men = len(student_state.filter(gender=1))
                student_state_women = len(student_state.filter(gender=2))
                student_state_all = student_state_men + student_state_women

                dict_data = {
                    "pay_type_id": key[0],
                    "pay_type_name": key[1],
                    "all_student_count": student_state_all,
                    "student_men": student_state_men,
                    "student_women": student_state_women
                }
                key_data.append(dict_data)

            student_edu_pro = student_state
            profession = list()

            for id in range_pro:
                if id==0:
                    student_edu_men = len(student_edu_pro.filter(gender=1))
                    student_edu_women = len(student_edu_pro.filter(gender=2))
                    all_student_edu = student_edu_men + student_edu_women
                    dict_data = {
                        "degree_id": 0,
                        "degree_name": "Бүгд",
                        "all_student": all_student_edu,
                        "student_men": student_edu_men,
                        "student_women": student_edu_women
                    }
                    profession.append(dict_data)

                else:
                    student_edu = student_edu_pro.filter(group__degree=id)
                    student_edu_men = len(student_edu.filter(gender=1))
                    student_edu_women = len(student_edu.filter(gender=2))
                    all_student_edu = student_edu_men + student_edu_women
                    degree = ProfessionalDegree.objects.filter(id=id).first()

                    dict_data = {
                        "degree_id": degree.id if degree else  id,
                        "degree_name": degree.degree_name if degree else  '',
                        "degree_code": degree.degree_code if degree else  '',
                        "all_student": all_student_edu,
                        "student_men": student_edu_men,
                        "student_women": student_edu_women
                    }
                    profession.append(dict_data)
            disability_student_edu = student_state.filter(is_mental=True)
            disability = list()
            development_difficulty = Student.DEVELOPMENT_DIFFICULTY
            development_difficulty = ((0, "Бүгд"), *development_difficulty)

            for idx_name in development_difficulty:
                if idx_name[0]==0:
                    disability_student_men = len(disability_student_edu.filter(gender=1))
                    disability_student_women = len(disability_student_edu.filter(gender=2))
                    all_disability_student = disability_student_men + disability_student_women
                    dict_data = {
                        "disability_type_id": 0,
                        "disability_type_name": "Бүгд",
                        "all_student": all_disability_student,
                        "student_men": disability_student_men,
                        "student_women": disability_student_women
                    }
                    disability.append(dict_data)
                else:
                    disability_student = disability_student_edu.filter(mental_type=idx_name[0])
                    disability_student_men = len(disability_student.filter(gender=1))
                    disability_student_women = len(disability_student.filter(gender=2))
                    all_disability_student = disability_student_men + disability_student_women
                    dict_data = {
                        "disability_type_id": idx_name[0],
                        "disability_type_name": idx_name[1],
                        "all_student": all_disability_student,
                        "student_men": disability_student_men,
                        "student_women": disability_student_women
                    }
                    disability.append(dict_data)

            key_data = {
                "pay_type_id": key[0],
                "pay_type": key[1],
                "all_data": key_data,
                "profesion": profession,
                "disability": disability,
            }

            data.append(key_data)

        return request.send_data(data)
