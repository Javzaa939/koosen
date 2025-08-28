import os
from rest_framework import mixins
from rest_framework import generics
from rest_framework import serializers

from django.db import transaction
from django.db.models import Q
from django.conf import settings

from main.utils.file import remove_folder

from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes
from main.utils.function.pagination import CustomPagination
from main.utils.function.utils import get_domain_url
from main.utils.function.utils import has_permission, null_to_none

from main.utils.file import save_file

from lms.models import LearningCalendar, Student, StudentNotice

from .serializers import StudentNoticeSerializer
from .serializers import StudentNoticeListSerializer

from rest_framework.filters import SearchFilter

# ----------------- Зар мэдээ ---------------
@permission_classes([IsAuthenticated])
class StudentNoticeAPIView(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    generics.GenericAPIView
):
    ''' Зар мэдээлэл '''

    queryset = StudentNotice.objects.all()
    serializer_class = StudentNoticeSerializer

    pagination_class = CustomPagination

    filter_backends = [SearchFilter]
    search_fields = ['title']

    @has_permission(must_permissions=['lms-service-news-read'])
    def get(self, request, pk=None):
        """ Зар мэдээний жагсаалт """

        self.serializer_class = StudentNoticeListSerializer
        self.queryset = self.queryset.filter(is_news=True).order_by('-created_at')

        if pk:
            instance = StudentNotice.objects.filter(id=pk).first()
            return_datas = self.get_serializer(instance).data
            return request.send_data(return_datas)

        return_datas = self.list(request).data

        return request.send_data(return_datas)

    @has_permission(must_permissions=['lms-service-news-create'])
    def post(self, request):
        " зар мэдээ нэмэх "

        data = request.data.dict()
        data = null_to_none(data)

        if 'department' in data and not data.get('department'):
            del data['department']

        serializer = self.get_serializer(data=data)

        try:
            if serializer.is_valid():
                with transaction.atomic():
                    self.perform_create(serializer)
            else:
                print(serializer.errors)
                return request.send_error("ERR_002")

        except Exception as e:
            print(e)
            return request.send_error("ERR_002")

        return request.send_info("INF_001")

    @has_permission(must_permissions=['lms-service-news-update'])
    def put(self, request, pk=None):
        " зар мэдээ засах "

        request_data = request.data

        instance = self.get_object()

        serializer = self.get_serializer(instance, data=request_data, partial=True)

        if serializer.is_valid(raise_exception=False):
            self.perform_update(serializer)
            return request.send_info('INF_002')
        else:
            return request.send_error_valid(serializer.errors)

    @has_permission(must_permissions=['lms-service-news-delete'])
    def delete(self, request, pk=None):
        self.destroy(request, pk)

        return request.send_info("INF_003")


class StudentNoticeFileAPIView(
    generics.GenericAPIView,
    mixins.DestroyModelMixin,
    ):
        queryset = StudentNotice.objects.all()

        def delete(self, request, pk=None):

            # NOTE: Файл засаж байгаа үед хуучин файлыг устгана
            remove_file = os.path.join(settings.NOTICE, str(pk))
            if remove_file:
                remove_folder(remove_file)

            self.destroy(request, pk)

            return request.send_info("INF_003")


class StudentNoticeFileAPIView(
    generics.GenericAPIView,
):

    def post(self, request):
        """ Зар мэдээ нэмэх
        """

        data = request.data
        file = data.get('file')

        path = save_file(file, 'news_images', settings.NEWS)

        domain = get_domain_url()

        file_path = os.path.join(settings.MEDIA_URL, path)

        return_url = '{domain}{path}'.format(domain=domain, path=file_path)

        return request.send_data(return_url)

class StudentNoticeNotNewsAPIView(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    generics.GenericAPIView
):
    ''' Зар мэдээлэл '''

    queryset = StudentNotice.objects.all()
    serializer_class = StudentNoticeSerializer

    pagination_class = CustomPagination

    filter_backends = [SearchFilter]
    search_fields = ['title']

    @has_permission(must_permissions=['lms-service-news-read'])
    def get(self, request, pk=None):
        """ Зар мэдээний жагсаалт """

        self.serializer_class = StudentNoticeListSerializer
        self.queryset = self.queryset.order_by('-created_at')

        if self.queryset:
            self.queryset = self.queryset.filter(is_news=False)

        if pk:
            student_noctice_qs = StudentNotice.objects.filter(id=pk)
            if not student_noctice_qs:
                return request.send_data({})

            return_datas = self.retrieve(request, pk).data
            return request.send_data(return_datas)

        return_datas = self.list(request).data

        return request.send_data(return_datas)


# ----------------- Хуанли Зар Мэдээ ---------------

@permission_classes([IsAuthenticated])
class CalendarNoticeApiView(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    generics.GenericAPIView
):

    queryset = StudentNotice.objects.all()
    serializer_class = StudentNoticeSerializer

    @staticmethod
    def get_org(student):
        result = None

        if student.school:
            result = student.school.org

        if not result:
            if student.department:
                result = student.department.org

        if not result:
            if student.department and student.department.sub_orgs:
                result = student.department.sub_orgs.org

        if not result:
            if student.group.school:
                result = student.group.school.org

        if not result:
            if student.group.department:
                result = student.group.department.org

        if not result:
            if student.group.department and student.group.department.sub_orgs:
                result = student.group.department.sub_orgs.org

        if not result:
            if student.group.profession and student.group.profession.school:
                result = student.group.profession.school.org

        if not result:
            if student.group.profession and student.group.profession.department:
                result = student.group.profession.department.org

        if not result:
            if student.group.profession and student.group.profession.department and student.group.profession.department.sub_orgs:
                result = student.group.profession.department.sub_orgs.org

        return result

    @staticmethod
    def get_sub_org(student):
        result = student.school

        if not result:
            if student.department:
                result = student.department.sub_orgs

        if not result:
            result = student.group.school

        if not result:
            result = student.group.school

        if not result:
            if student.group.department:
                result = student.group.department.sub_orgs

        if not result:
            if student.group.profession:
                result = student.group.profession.school

        if not result:
            if student.group.profession and student.group.profession.department:
                result = student.group.profession.department.sub_orgs

        return result

    @staticmethod
    def get_department(student):
        result = student.department

        if not result:
            result = student.group.department

        if not result:
            if student.group.profession:
                result = student.group.profession.department

        return result

    @staticmethod
    def filter_for_student(queryset, student_id):
        # to reduce sql queries for related fields
        student = Student.objects.select_related(
            'group__profession__department__sub_orgs__org',
            'group__profession__department__org',

            'group__profession__school__org',

            'group__department__sub_orgs__org',
            'group__department__org',

            'group__school__org',

            'department__sub_orgs__org',
            'department__org',

            'school__org',
        ).get(id=student_id)

        # to get any filled field
        department = CalendarNoticeApiView.get_department(student)
        sub_org = CalendarNoticeApiView.get_sub_org(student)
        org = CalendarNoticeApiView.get_org(student)

        # scope, student_level, department, is_news, school, org
        q_conditions_other = Q(
            Q(
                Q(scope=LearningCalendar.OTHER) |
                Q(student_level__isnull=True) |
                Q(department__isnull=True) |
                Q(school__isnull=True) |
                Q(org__isnull=True)
            )
        )

        q_conditions = Q(
            q_conditions_other |
            Q(
                ~Q(q_conditions_other) &
                Q(
                    Q(scope=LearningCalendar.STUDENT) |
                    Q(student_level=student.group.level) |
                    Q(department=department) |
                    Q(school=sub_org) |
                    Q(org=org)
                )
            )
        )

        result = queryset.filter(q_conditions)
        return result

    @has_permission(must_permissions=['lms-service-news-read'])
    def get(self, request):

        self.serializer_class = StudentNoticeListSerializer

        if request.session.get('_is_student'):
            self.queryset = self.filter_for_student(self.queryset, request.user.student_id)

        self.queryset = self.queryset.filter(is_news=True).order_by('-created_at')[:5]

        return_datas = self.get_serializer(self.queryset, many=True).data
        return request.send_data(return_datas)
