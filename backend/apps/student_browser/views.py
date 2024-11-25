import os
from rest_framework import mixins
from rest_framework import generics

from django.db import transaction
from django.conf import settings

from main.utils.file import remove_folder

from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes
from main.utils.function.pagination import CustomPagination

from main.utils.function.utils import null_to_none, has_permission
from main.utils.file import save_file
from rest_framework.filters import SearchFilter

from lms.models import Structure
from lms.models import StudentDevelop
from lms.models import Library
from lms.models import StudentPsycholocal
from lms.models import Health
from core.models import SubOrgs, Salbars

from .serializers import StructureSerializer
from .serializers import StructureListSerializer
from .serializers import StudentDevelopSerializer
# from .serializers import StudentDevelopListSerializer
from .serializers import LibrarySerializer
from .serializers import StudentPsycholocalSerializer
from .serializers import HealthSerializer


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

    queryset = Structure.objects.all()
    serializer_class = StructureSerializer

    pagination_class = CustomPagination

    filter_backends = [SearchFilter]
    search_fields = ['title']

    @has_permission(must_permissions=['lms-browser-structure-read'])
    def get(self, request, pk=None):
        """ Их сургуулийн бүтэц зохион байгуулалт жагсаалт """
        self.serializer_class = StructureListSerializer

        if pk:
            datas = self.retrieve(request, pk).data
            return request.send_data(datas)

        return_data = self.list(request).data
        return request.send_data(return_data)

    @has_permission(must_permissions=['lms-browser-structure-create'])
    def post(self, request):
        " Их сургуулийн бүтэц зохион байгуулалт нэмэх "

        data = request.data
        data = null_to_none(data)
        created_user = data.get('created_user')

        data['created_user']= created_user

        file = data.get('file')
        if file:
            #  file хадгалах
            save_file(file, 'structure')

        serializer = self.get_serializer(data=data)

        try:
            if serializer.is_valid():
                with transaction.atomic():
                    self.perform_create(serializer)
                    # if file:
                    #     data = create_file_to_cdn(settings.STRUCTURE, file)
            else:
                print(serializer.errors)
                return request.send_error("ERR_002")

        except Exception as e:
            print(e)
            return request.send_error("ERR_002")

        return request.send_info("INF_001")

    @has_permission(must_permissions=['lms-browser-structure-update'])
    def put(self, request, pk=None):
        " Их сургуулийн бүтэц зохион байгуулалт засах "

        request_data = request.data
        print("request", request_data)
        file = request_data.get('file')
        request_data['updated_user'] = request_data.get('updated_user')

        instance = self.get_object()
        old_file = instance.file
        serializer = self.get_serializer(instance, data=request_data, partial=True)

        # файл хадгалса эсэх
        if old_file:
            old_file_path = old_file.path

            old_file_name = os.path.basename(old_file_path)
            if file != old_file_name:
                remove_path = os.path.join(settings.MEDIA_ROOT, str(pk), old_file_name)
                remove_folder(remove_path)

        if serializer.is_valid(raise_exception=False):
            self.perform_update(serializer)
            return request.send_info('INF_002')
        else:
            # return request.send_error_valid(serializer.errors)
            error_obj = []
            # Олон алдааны мессэж буцаах бол үүнийг ашиглана
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

    @has_permission(must_permissions=['lms-browser-structure-delete'])
    def delete(self, request, pk=None):
        """Их сургуулийн бүтэц зохион байгуулалт устгах """

        instance = self.queryset.filter(id=pk).first()
        file_old = instance.file
        old_file_path = file_old.path
        old_file_name = os.path.basename(old_file_path)

        if old_file_name:
            remove_path = os.path.join(settings.MEDIA_ROOT, str(pk), old_file_name)
            remove_folder(remove_path)

        self.destroy(request, pk)
        return request.send_info("INF_003")


@permission_classes([IsAuthenticated])
class StudentListAPIView(
    generics.GenericAPIView
):
    ''' Салбар сургуулиар хөтөлбөр харуулав '''
    def get(self, request):
        """ Сургалтын хөтөлбөр жагсаалт """

        qs_obj = []
        sub_orgs = SubOrgs.objects.filter(org_id=1).order_by('id')

        for sub_org in sub_orgs:

            salbar_qs = Salbars.objects.filter(sub_orgs_id=sub_org.id).values('id', 'name')
            qs_obj.append({
                'sub_org_id': sub_org.id,
                'sub_org_name': sub_org.name,
                'salbars': list(salbar_qs)
            })
        return request.send_data(qs_obj)


@permission_classes([IsAuthenticated])
class StudentDevelopAPIView(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    generics.GenericAPIView
):
    '''  Суралцагчийн хөгжил '''

    queryset = StudentDevelop.objects.all().order_by('-created_at')
    serializer_class = StudentDevelopSerializer

    pagination_class = CustomPagination

    filter_backends = [SearchFilter]
    search_fields = ['title']


    @has_permission(must_permissions=['lms-browser-hugjil-read'])
    def get(self, request, pk=None):
        """  Суралцагчийн хөгжил жагсаалт """
        # self.serializer_class = StudentDevelopListSerializer
        if pk:
            datas = self.retrieve(request, pk).data
            return request.send_data(datas)

        return_data = self.list(request).data
        return request.send_data(return_data)

    @has_permission(must_permissions=['lms-browser-hugjil-create'])
    def post(self, request):
        "  Суралцагчийн хөгжил нэмэх "

        data = request.data
        data = null_to_none(data)
        created_user = data.get('created_user')
        updated_user = data.get('updated_user')

        data['created_user']= created_user
        data['updated_user']= updated_user

        file = data.get('file')
        if file:
            #  file хадгалах
            save_file(file, 'structure')

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

    @has_permission(must_permissions=['lms-browser-hugjil-update'])
    def put(self, request, pk=None):
        "  Суралцагчийн хөгжил засах "

        request_data = request.data
        file = request_data.get('file')

        instance = self.queryset.filter(id=pk).first()
        old_file = instance.file

        if old_file:
            old_file_path = old_file.path
            old_file_name = os.path.basename(old_file_path)

            if file != old_file_name:
                remove_path = os.path.join(settings.MEDIA_ROOT, str(pk), old_file_name)
                remove_folder(remove_path)

        serializer = self.get_serializer(instance, data=request_data)
        # Хуучин файл хадгалсан эсэх
        if serializer.is_valid(raise_exception=False):
            self.perform_update(serializer)
            return request.send_info('INF_002')
        else:
            return request.send_error_valid(serializer.errors)

    @has_permission(must_permissions=['lms-browser-hugjil-delete'])
    def delete(self, request, pk=None):
        """ Суралцагчийн хөгжил устгах """

        instance = self.queryset.filter(id=pk).first()
        file_old = instance.file
        old_file_path = file_old.path
        old_file_name = os.path.basename(old_file_path)

        if old_file_name:
            remove_path = os.path.join(settings.MEDIA_ROOT, str(pk), old_file_name)
            remove_folder(remove_path)

        self.destroy(request, pk)
        return request.send_info("INF_003")


@permission_classes([IsAuthenticated])
class StudentLibraryAPIView(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    generics.GenericAPIView
):
    """ Номын сан танилуулга """

    queryset = Library.objects.all().order_by('-created_at')
    serializer_class = LibrarySerializer

    pagination_class = CustomPagination

    filter_backends = [SearchFilter]
    search_fields = ['title']

    @has_permission(must_permissions=['lms-browser-library-read'])
    def get(self, request, pk=None):
        """  Номын сан танилуулга жагсаалт """

        if pk:
            datas = self.retrieve(request, pk).data
            return request.send_data(datas)

        return_data = self.list(request).data
        return request.send_data(return_data)

    @has_permission(must_permissions=['lms-browser-library-create'])
    def post(self, request):
        "  Номын сан танилуулга нэмэх "

        data = request.data
        data = null_to_none(data)
        created_user = data.get('created_user')
        updated_user = data.get('updated_user')

        data['created_user']= created_user
        data['updated_user']= updated_user

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

    @has_permission(must_permissions=['lms-browser-library-update'])
    def put(self, request, pk=None):
        "  Номын сан танилуулга засах "

        request_data = request.data

        instance = self.queryset.filter(id=pk).first()
        serializer = self.get_serializer(instance, data=request_data)

        # Хуучин файл хадгалсан эсэх
        if serializer.is_valid(raise_exception=False):
            self.perform_update(serializer)
            return request.send_info('INF_002')
        else:
            return request.send_error_valid(serializer.errors)

    @has_permission(must_permissions=['lms-browser-library-delete'])
    def delete(self, request, pk=None):
        """ Номын сан танилуулга устгах """

        self.destroy(request, pk)
        return request.send_info("INF_003")


@permission_classes([IsAuthenticated])
class StudentPsycholocalAPIView(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    generics.GenericAPIView
):
    """Сэтгэл зүйн булан """

    queryset = StudentPsycholocal.objects.all().order_by('-created_at')
    serializer_class = StudentPsycholocalSerializer

    pagination_class = CustomPagination

    filter_backends = [SearchFilter]
    search_fields = ['title']

    @has_permission(must_permissions=['lms-browser-bulan-read'])
    def get(self, request, pk=None):
        """  Сэтгэл зүйн булан жагсаалт """

        if pk:
            datas = self.retrieve(request, pk).data
            return request.send_data(datas)

        return_data = self.list(request).data
        return request.send_data(return_data)

    @has_permission(must_permissions=['lms-browser-bulan-create'])
    def post(self, request):
        " Сэтгэл зүйн булан нэмэх "

        data = request.data
        data = null_to_none(data)
        created_user = data.get('created_user')
        updated_user = data.get('updated_user')

        data['created_user']= created_user
        data['updated_user']= updated_user

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

    @has_permission(must_permissions=['lms-browser-bulan-update'])
    def put(self, request, pk=None):
        "  Сэтгэл зүйн булан засах "

        request_data = request.data
        instance = self.queryset.filter(id=pk).first()
        serializer = self.get_serializer(instance, data=request_data)

        # Хуучин файл хадгалсан эсэх
        if serializer.is_valid(raise_exception=False):
            self.perform_update(serializer)
            return request.send_info('INF_002')
        else:
            return request.send_error_valid(serializer.errors)

    @has_permission(must_permissions=['lms-browser-bulan-delete'])
    def delete(self, request, pk=None):
        """ Сэтгэл зүйн булан устгах """

        self.destroy(request, pk)
        return request.send_info("INF_003")


@permission_classes([IsAuthenticated])
class HealthAPIView(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    generics.GenericAPIView
):
    """Эрүүл мэнд """

    queryset = Health.objects.all().order_by('-created_at')
    serializer_class = HealthSerializer

    pagination_class = CustomPagination

    filter_backends = [SearchFilter]
    search_fields = ['title']



    @has_permission(must_permissions=['lms-browser-health-read'])
    def get(self, request, pk=None):
        """  Эрүүл мэнд жагсаалт """

        if pk:
            datas = self.retrieve(request, pk).data
            return request.send_data(datas)

        return_data = self.list(request).data
        return request.send_data(return_data)

    @has_permission(must_permissions=['lms-browser-health-create'])
    def post(self, request):
        " Эрүүл мэнд нэмэх "

        data = request.data
        data = null_to_none(data)
        created_user = data.get('created_user')
        updated_user = data.get('updated_user')

        data['created_user']= created_user
        data['updated_user']= updated_user

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

    @has_permission(must_permissions=['lms-browser-health-update'])
    def put(self, request, pk=None):
        "  Эрүүл мэнд засах "

        request_data = request.data
        instance = self.queryset.filter(id=pk).first()
        serializer = self.get_serializer(instance, data=request_data)

        # Хуучин файл хадгалсан эсэх
        if serializer.is_valid(raise_exception=False):
            self.perform_update(serializer)
            return request.send_info('INF_002')
        else:
            return request.send_error_valid(serializer.errors)

    @has_permission(must_permissions=['lms-browser-health-delete'])
    def delete(self, request, pk=None):
        """ Эрүүл мэнд устгах """

        self.destroy(request, pk)
        return request.send_info("INF_003")