import os
from rest_framework import mixins
from rest_framework import generics
from rest_framework import serializers

from django.db import transaction
from django.conf import settings

from main.utils.file import remove_folder

from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes
from main.utils.function.pagination import CustomPagination
from main.utils.function.utils import get_domain_url
from main.utils.function.utils import has_permission, null_to_none

from main.utils.file import save_file

from lms.models import Structure
from core.models import SubOrgs, Salbars


from .serializers import StructureSerializer
from .serializers import StructureListSerializer
from django.db.models import F, Subquery, OuterRef, Count

from rest_framework.filters import SearchFilter

# ----------------- Их сургуулийн бүтэц зохион байгуулалт ---------------
@permission_classes([IsAuthenticated])
class StudentStructureAPIView(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    generics.GenericAPIView
):
    ''' Их сургуулийн бүтэц зохион байгуулалт '''

    queryset = Structure.objects.all().order_by('-created_at')
    serializer_class = StructureSerializer

    pagination_class = CustomPagination

    filter_backends = [SearchFilter]
    search_fields = ['title']

    # @has_permission(must_permissions=['lms-service-news-read'])
    def get(self, request, pk=None):
        """ Их сургуулийн бүтэц зохион байгуулалт жагсаалт """

        self.serializer_class = StructureListSerializer

        if pk:
            instance = Structure.objects.filter(id=pk).first()
            return_datas = self.get_serializer(instance).data
            return request.send_data(return_datas)

        return_datas = self.list(request).data
        return request.send_data(return_datas)

    # @has_permission(must_permissions=['lms-service-news-create'])
    def post(self, request):
        " Их сургуулийн бүтэц зохион байгуулалт нэмэх "

        data = request.data.dict()
        print("data", data)

        data = null_to_none(data)
        file= data.get('file')
        if file:
            print("file", file)
            path = save_file(file, 'structure')
            print("path", path)
            # domain = get_domain_url()
            # print("domain", domain)

            # file_path = os.path.join(settings.MEDIA_URL, path)
            # print("file_path", file_path)

            # return_url = '{domain}{path}'.format(domain=domain, path=file_path)
            # print("return_url", return_url)

        # return request.send_data(return_url)

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

    # @has_permission(must_permissions=['lms-service-news-update'])
    def put(self, request, pk=None):
        " Их сургуулийн бүтэц зохион байгуулалт засах "

        request_data = request.data

        instance = self.get_object()

        serializer = self.get_serializer(instance, data=request_data, partial=True)

        if serializer.is_valid(raise_exception=False):
            self.perform_update(serializer)
            return request.send_info('INF_002')
        else:
            return request.send_error_valid(serializer.errors)

    # @has_permission(must_permissions=['lms-service-news-delete'])
    def delete(self, request, pk=None):
        """Их сургуулийн бүтэц зохион байгуулалт устгах """
        self.destroy(request, pk)

        # NOTE: Файл засаж байгаа үед хуучин файлыг устгана
        # remove_file = os.path.join(settings.NOTICE, str(pk))
        # if remove_file:
        #     remove_folder(remove_file)

        self.destroy(request, pk)

        return request.send_info("INF_003")

class StudentListAPIView(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    generics.GenericAPIView
    ):


    ''' Сургалтын хөтөлбөр, хичээлийн хуваарь '''

    queryset = Salbars.objects.all()

    filter_backends = [SearchFilter]
    search_fields = ['title']

    def get(self, request, pk=None):
        """ Сургалтын хөтөлбөр, хичээлийн хуваарь жагсаалт """

        # salbar_data = Salbars.objects.filter(org_id=pk).values('sub_orgs', 'name')
        org_qs = SubOrgs.objects.filter(org_id=pk).values_list("id", "name")
        print("org_qs", org_qs)

        # gj = Salbars.objects.annotate(sub_org=Subquery(org_qs))
        # print("gj", gj)

        # for qs in org_qs:
        #     print("qs", qs)
            # salbar_key = Salbars.objects.filter(org_id=pk).values_list('sub_orgs', 'sub_orgs__name', 'name')
            # qs.append(salbar_key)

        salbar_data = Salbars.objects.filter(org_id=pk).values_list('sub_orgs', 'sub_orgs__name', 'name')
        print("salbar_data", salbar_data)

        datas = list(salbar_data)
        return request.send_data(datas)