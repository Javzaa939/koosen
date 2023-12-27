import os
from rest_framework import mixins
from rest_framework import generics

from datetime import date, timedelta
from django.db import transaction
from dateutil import parser
from django.conf import settings

from main.utils.file import remove_folder

from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes
from main.utils.function.pagination import CustomPagination
from main.utils.function.utils import str2bool, get_domain_url
from main.utils.function.utils import has_permission

from main.utils.file import save_file

from lms.models import StudentNotice
from lms.models import StudentNoticeFile

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
        self.queryset = self.queryset.order_by('-created_at')

        data = StudentNotice.objects.all()

        if data:
            self.queryset = self.queryset.filter(is_news=True)

        if pk:
            student_noctice_qs = StudentNotice.objects.filter(id=pk)
            if not student_noctice_qs:
                return request.send_data({})

            return_datas = self.retrieve(request, pk).data
            return request.send_data(return_datas)

        return_datas = self.list(request).data

        return request.send_data(return_datas)

    @has_permission(must_permissions=['lms-service-news-create'])
    def post(self, request):
        " зар мэдээ нэмэх "

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
        # if serializer.is_valid(raise_exception=False):
        #     with transaction.atomic():
        #         try:

        #             print('5555')
        #             self.create(request).data
        #             print('66')

        #         except Exception:
        #             return request.send_error("ERR_002")

        #     return request.send_info("INF_001")

        # return request.send_info("INF_001")

    @has_permission(must_permissions=['lms-service-news-update'])
    def put(self, request, pk=None):
        " зар мэдээ засах "

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

            return request.send_error("ERR_002")

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