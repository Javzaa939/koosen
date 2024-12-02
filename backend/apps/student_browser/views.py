import os
from rest_framework import mixins
from rest_framework import generics

from django.db import transaction
from django.conf import settings

from main.utils.file import remove_folder

from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes
from main.utils.function.pagination import CustomPagination

from main.utils.function.utils import null_to_none, has_permission, create_file_to_cdn, remove_file_from_cdn
from main.utils.file import save_file
from rest_framework.filters import SearchFilter

from lms.models import Structure
from lms.models import StudentDevelop
from lms.models import Library
from lms.models import StudentPsycholocal
from lms.models import Health, StudentRules, StudentTime
from lms.models import StudentTime
from core.models import SubOrgs, Salbars

from .serializers import *

from django.core.files.uploadedfile import InMemoryUploadedFile


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

    @has_permission(must_permissions=['lms-browser-structure-read'])
    def get(self, request, pk=None):
        """ Их сургуулийн бүтэц зохион байгуулалт жагсаалт """

        return_data = self.list(request).data
        return request.send_data(return_data)

    @has_permission(must_permissions=['lms-browser-structure-create'])
    def post(self, request, **kwargs ):
        " Их сургуулийн бүтэц зохион байгуулалт нэмэх "

        data = request.data.dict()
        data = null_to_none(data)
        created_user = data.get('created_user')
        updated_user = data.get('updated_user')
        file = data.get('file')
        title = data.get('title')
        link = data.get('link')
        isFileChanged = isinstance(file, InMemoryUploadedFile)

        if not file:
            return request.send_error("ERR_002", "Файл заавал оруулна уу.")

        if file and isFileChanged:

            # files руу файл хадгалах
            save_file(file, 'structure')

            # cdn руу хадгалах
            relative_path = create_file_to_cdn('structure', file)

            if relative_path:
                data['file'] = relative_path.get('full_path')

            if data:
                Structure.objects.create(
                    title=title,
                    link=link,
                    file=relative_path.get('full_path').split('dxis/')[1],
                    created_user_id=created_user,
                    updated_user_id=updated_user,
                )
            else:
                return request.send_error("ERR_002")

        return request.send_info("INF_001")

    @has_permission(must_permissions=['lms-browser-structure-delete'])
    def delete(self, request, pk=None):

        """ Их сургуулийн бүтэц зохион байгуулалт устгах """
        instance = self.queryset.filter(id=pk).first()

        if instance.file:
            file_path = str(instance.file)

            # files -с файл устгана
            remove_file = os.path.join(settings.MEDIA_ROOT, file_path)
            if remove_file:
                remove_folder(remove_file)

            # cdn- с файл устгана
            remove_files = os.path.join(settings.CDN_MAIN_FOLDER, file_path)
            remove_file_from_cdn(remove_files, is_file=True)

        self.destroy(request, pk)
        return request.send_info("INF_003")


@permission_classes([IsAuthenticated])
class StudentListAPIView(
    generics.GenericAPIView
):
    ''' Салбар сургуулиар хөтөлбөр харуулах '''
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

    queryset = StudentDevelop.objects.all()
    serializer_class = StudentDevelopSerializer

    pagination_class = CustomPagination

    @has_permission(must_permissions=['lms-browser-hugjil-read'])
    def get(self, request, pk=None):
        """  Суралцагчийн хөгжил жагсаалт """

        return_data = self.list(request).data
        return request.send_data(return_data)

    @has_permission(must_permissions=['lms-browser-hugjil-create'])
    def post(self, request):
        "  Суралцагчийн хөгжил нэмэх "

        data = request.data
        data = null_to_none(data)
        created_user = data.get('created_user')
        updated_user = data.get('updated_user')
        link = data.get('link')
        body = data.get('body')
        title = data.get('title')
        file = data.get('file')

        if not file:
            return request.send_error("ERR_002", "Файл заавал оруулна уу.")
        else:
            if file:

                # files руу файл хадгалах
                save_file(file, 'develop')

                # cdn руу хадгалах
                relative_path = create_file_to_cdn('develop', file)

                if relative_path:
                    data['file'] = relative_path.get('full_path')

        try:
            if data:
                StudentDevelop.objects.create(
                    file=relative_path.get('full_path').split('dxis/')[1],
                    created_user_id=created_user,
                    link=link,
                    body=body,
                    title=title,
                    updated_user_id=updated_user,
                )
        except Exception as e:
            print(e)
            return request.send_error("ERR_002")

        return request.send_info("INF_001")

    @has_permission(must_permissions=['lms-browser-hugjil-update'])
    def put(self, request, pk=None):
        "  Суралцагчийн хөгжил засах "

        request_data = request.data

        # зассан хэрэглэгч
        updated_user = request_data.get('updated_user')
        request_data['updated_user']= updated_user

        instance = self.queryset.filter(id=pk).first()
        serializer = self.get_serializer(instance, data=request_data)

        if serializer.is_valid(raise_exception=False):
            self.perform_update(serializer)
            return request.send_info('INF_002')
        else:
            return request.send_error_valid(serializer.errors)

    @has_permission(must_permissions=['lms-browser-hugjil-delete'])
    def delete(self, request, pk=None):
        """ Суралцагчийн хөгжил устгах """
        instance = self.queryset.filter(id=pk).first()

        if instance.file:
            file_path = str(instance.file)

            # files -с файл устгана
            remove_file = os.path.join(settings.MEDIA_ROOT, file_path)
            if remove_file:
                remove_folder(remove_file)

            # cdn- с файл устгана
            remove_files = os.path.join(settings.CDN_MAIN_FOLDER, file_path)
            remove_file_from_cdn(remove_files, is_file=True)

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



@permission_classes([IsAuthenticated])
class StudentRulesAPIView(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    generics.GenericAPIView
):
    '''  Номын сангийн журам '''

    queryset = StudentRules.objects.all()
    serializer_class = StudentRulesSerializer

    pagination_class = CustomPagination

    def get(self, request, pk=None):
        """  Номын сангийн журам жагсаалт """

        return_data = self.list(request).data
        return request.send_data(return_data)

    def post(self, request):
        "  Номын сангийн журам нэмэх "

        data = request.data
        data = null_to_none(data)
        created_user = data.get('created_user')
        updated_user = data.get('updated_user')
        title = data.get('title')


        file = data.get('file')
        if not file:
            return request.send_error("ERR_002", "Файл заавал оруулна уу.")
        else:

            # files руу файл хадгалах
            save_file(file, 'rules')

            # cdn руу хадгалах
            relative_path = create_file_to_cdn('rules', file)

        try:
            StudentRules.objects.create(
                title=title,
                file=relative_path.get('full_path').split('dxis/')[1],
                created_user_id=created_user,
                updated_user_id=updated_user,
            )

        except Exception as e:
            print(e)
            return request.send_error("ERR_002")

        return request.send_info("INF_001")

    def put(self, request, pk=None):
        "  Номын сангийн журам засах "

        request_data = request.data

        # зассан хэрэглэгч
        updated_user = request_data.get('updated_user')
        request_data['updated_user']= updated_user
        request_data['created_user']= updated_user

        instance = self.queryset.filter(id=pk).first()
        serializer = self.get_serializer(instance, data=request_data)

        if serializer.is_valid(raise_exception=False):
            self.perform_update(serializer)
            return request.send_info('INF_002')
        else:
            return request.send_error_valid(serializer.errors)

    def delete(self, request, pk=None):
        """ Номын сангийн журам устгах """
        instance = self.queryset.filter(id=pk).first()
        if instance.file:
            file_path = str(instance.file)

            remove_file = os.path.join(settings.MEDIA_ROOT, file_path)
            if remove_file:
                remove_folder(remove_file)

            # cdn- с файл устгана
            remove_files = os.path.join(settings.CDN_MAIN_FOLDER, file_path)
            remove_file_from_cdn(remove_files, is_file=True)

        self.destroy(request, pk)
        return request.send_info("INF_003")

@permission_classes([IsAuthenticated])
class StudentTimeAPIView(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    generics.GenericAPIView
):
    ''' номын сангийн цагийн хуваарь '''

    queryset = StudentTime.objects.all()
    serializer_class = StructureSerializer

    pagination_class = CustomPagination

    def get(self, request, pk=None):
        """ номын сангийн цагийн хуваарь жагсаалт """

        return_data = self.list(request).data
        return request.send_data(return_data)

    def post(self, request, **kwargs ):
        " номын сангийн цагийн хуваарь нэмэх "

        data = request.data
        data = null_to_none(data)
        created_user = data.get('created_user')
        updated_user = data.get('updated_user')
        file = data.get('file')
        title = data.get('title')
        isFileChanged = isinstance(file, InMemoryUploadedFile)

        if not file:
            return request.send_error("ERR_002", "Файл заавал оруулна уу.")

        if file and isFileChanged:
            relative_path = create_file_to_cdn('structure', file)

        with transaction.atomic():
            if relative_path:
                StudentTime.objects.create(
                    file=relative_path.get('full_path').split('dxis/')[1],
                    title=title,
                    created_user_id=created_user,
                    updated_user_id=updated_user
                )
                return request.send_error("ERR_002")

        return request.send_info("INF_001")

    def delete(self, request, pk=None):
        """номын сангийн цагийн хуваарь устгах """

        instance = self.queryset.filter(id=pk).first()
        if instance.file:
            file_path = str(instance.file)

            # files-с файл устгана
            remove_file = os.path.join(settings.MEDIA_ROOT, file_path)
            if remove_file:
                remove_folder(remove_file)

            # cdn-с файл устгана
            remove_files = os.path.join(settings.CDN_MAIN_FOLDER, file_path)
            remove_file_from_cdn(remove_files, is_file=True)

        self.destroy(request, pk)
        return request.send_info("INF_003")