from rest_framework import mixins
from rest_framework import generics

from rest_framework.filters import SearchFilter
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes

from django.db import transaction
from django.db.models import  Count, Sum, F

from datetime import datetime

from core.models import (
    Teachers,
    Employee,
)

from lms.models import (
    UserInvention,
    UserPaper,
    UserNote,
    UserPatent,
    UserProject,
    UserQuotation,
    UserSymbolCert,
    UserModelCertPatent,
    UserLicenseCert,
    UserRightCert,
    InventionCategory,
    PaperCategory,
    ProjectCategory,
    NoteCategory,
    GraduationWork,
    UserContractWork,
    QuotationCategory
)

from .serializers import (
    UserInventionSerializer,
    UserPaperSerializer,
    UserNoteSerializer,
    UserPatentSerializer,
    UserProjectSerializer,
    UserQuotationSerializer,
    UserSymbolCertSerializer,
    UserModelCertPatentSerializer,
    UserLicenseCertSerializer,
    UserRightCertSerializer,
    UserPatentSerializer,
    UserProjectSerializer,
    InventionCategorySerializer,
    UserPatentSerializer,
    PaperCategorySerializer,
    ProjectCategorySerializer,
    UserNoteCategory,
    GraduationWorkSerializer,
    TeacherNameSerializer,
    QuotationCategorySerializer
)

from main.utils.function.pagination import CustomPagination
from main.utils.function.utils import get_teacher_queryset, get_active_year_season

@permission_classes([IsAuthenticated])
class UserInventionAPIView(
    mixins.ListModelMixin,
    generics.GenericAPIView
):

    """ Эрдэм шинжилгээний бүтээлийн жагсаалт """

    queryset = UserInvention.objects.all()
    serializer_class = UserInventionSerializer

    qs_employee = Employee.objects.all()
    qs_teachers = Teachers.objects.all()
    qs_userinvention = UserInvention.objects.all()

    pagination_class = CustomPagination

    def get(self, request):

        queryset = self.queryset
        qs_teachers = self.qs_teachers

        user_ids = []
        userinvention_ids = []

        # Хайх утгаар нь олох
        salbar = self.request.query_params.get('salbar')
        subschools = self.request.query_params.get('sub_org')
        teacher = self.request.query_params.get('teachers')
        published_year = self.request.query_params.get('published_year')
        category = self.request.query_params.get('category')

        # Тэнхимээр хайлт хийх
        if salbar:
            qs_teachers = qs_teachers.filter(salbar=salbar)

        # Бүрэлдэхүүн сургуулиар хайлт хийх
        if subschools:
            qs_teachers = qs_teachers.filter(sub_org=subschools)

        # Багшаар хайлт хийх
        if teacher:
            qs_teachers = qs_teachers.filter(pk=teacher)

            user_ids = qs_teachers.values_list('user', flat=True).distinct()

            queryset = queryset.filter(user__in=user_ids)

        # Хэвлэгдсэн он оор хайлт хийх
        if published_year:
            queryset = queryset.filter(published_year=published_year)

        # Өгүүллийн ангилалаар хайлт хийх
        if category:
            queryset = queryset.filter(category=category)

        self.queryset = queryset

        user_ids = self.queryset.values_list('user', flat=True).distinct('user')

        # Багшаар group хийх хэсэг
        for user_id in user_ids:
            qs_paper = self.queryset.filter(user=user_id).first()

            if qs_paper:
                userinvention_ids.append(qs_paper.id)

        self.queryset = self.queryset.filter(id__in=userinvention_ids)

        all_list = self.list(request).data

        return request.send_data(all_list)


@permission_classes([IsAuthenticated])
class UserPaperAPIView(
    mixins.ListModelMixin,
    generics.GenericAPIView
):
    """  Эрдэм шинжилгээ Өгүүллийн жагсаалт """

    queryset = UserPaper.objects.all()
    qs_teachers = Teachers.objects.all()

    serializer_class = UserPaperSerializer
    pagination_class = CustomPagination

    def get(self, request, pk=None):

        sub_org = self.request.query_params.get('sub_org')
        salbar = self.request.query_params.get('salbar')
        teachers = self.request.query_params.get('teachers')
        published_year = self.request.query_params.get('published_year')
        category = self.request.query_params.get('category')

        if sub_org:
            self.qs_teachers = self.qs_teachers.filter(sub_org=sub_org)

        if salbar:
            self.qs_teachers = self.qs_teachers.filter(salbar=salbar)

        if teachers:
            self.qs_teachers = self.qs_teachers.filter(pk=teachers)

        if published_year:
            self.queryset = self.queryset.filter(published_year=published_year)

        if category:
            self.queryset = self.queryset.filter(category=category)

        user_ids = self.queryset.values_list('user', flat=True).distinct('user')

        userpaper_ids = []

        # Багшаар group хийх хэсэг
        for user_id in user_ids:
            qs_paper = self.queryset.filter(user=user_id).first()

            if qs_paper:
                userpaper_ids.append(qs_paper.id)

        self.queryset = self.queryset.filter(id__in=userpaper_ids, )

        all_list = self.list(request).data

        return request.send_data(all_list)


@permission_classes([IsAuthenticated])
class UserNoteAPIView(
    mixins.ListModelMixin,
    generics.GenericAPIView,
    mixins.RetrieveModelMixin,

):
    """  Эрдэм шинжилгээ Илтгэлийн жагсаалт """

    queryset = UserNote.objects.all()
    serializer_class = UserNoteSerializer

    pagination_class = CustomPagination

    filter_backends = [SearchFilter]
    search_fields = ['meeting_name', 'meeting_org_name', 'meeting_date']

    def get(self, request, pk=None):

        category = self.request.query_params.get('category')
        salbar = self.request.query_params.get('salbar')

        # Тэнхимээр хайлт хийх
        if salbar:
            qs = Teachers.objects.filter(salbar=salbar).values_list('id', flat=True)
            self.queryset = self.queryset.filter(user__in=qs)

        # Илтгэлийн ангилалаар хайлт хийх
        if category:
            self.queryset = self.queryset.filter(category=category)

        user_ids = self.queryset.values_list('user', flat=True).distinct('user')

        usernote_ids = []

        # Багшаар group хийх хэсэг
        for user_id in user_ids:
            qs_paper = self.queryset.filter(user=user_id).first()

            if qs_paper:
                usernote_ids.append(qs_paper.id)

        self.queryset = self.queryset.filter(id__in=usernote_ids)

        all_list = self.list(request).data

        return request.send_data(all_list)


@permission_classes([IsAuthenticated])
class UserPatentAPIView(
    mixins.ListModelMixin,
    generics.GenericAPIView,
    mixins.RetrieveModelMixin,

):
    """  Эрдэм шинжилгээ оюуны өмчийн бүтээл  жагсаалт """

    queryset = UserPatent.objects.all()
    serializer_class = UserPatentSerializer

    pagination_class = CustomPagination

    def get(self, request, pk=None):

        begin_date = self.request.query_params.get('begin_date')
        end_date = self.request.query_params.get('end_date')
        register_number = self.request.query_params.get('register_number')
        salbar = self.request.query_params.get('salbar')
        science_field = self.request.query_params.get('science_field')

        # Тэнхимээр хайлт хийх
        if salbar:
            self.qs_teachers = self.qs_teachers.filter(salbar=salbar)

         # Илтгэлийн хураангуйгаар хайлт хийх
        if register_number:
            self.queryset = self.queryset.filter(register_number = register_number)

        # ШУ-ы салбарaap хайлт хийх
        if science_field:
            self.queryset = self.queryset.filter(science_field=science_field)

         # Хурлын огноогоор хайлт хийх
        if begin_date and end_date:
            self.queryset = self.queryset.filter(start_date__lte=end_date,start_date__gte=begin_date)

        if pk:
            row_data = self.retrieve(request, pk).data
            return request.send_data(row_data)

        all_list = self.list(request).data

        return request.send_data(all_list)


@permission_classes([IsAuthenticated])
class ProjectCategoryListAPIView(
    mixins.ListModelMixin,
    generics.GenericAPIView,
    mixins.RetrieveModelMixin,

):

    """  Эрдэм шинжилгээ Төсөл хөтөлбөрийн ангилалын жагсаалт """

    queryset = ProjectCategory.objects.all()
    qs_teachers = Teachers.objects.all()

    serializer_class = ProjectCategorySerializer

    def get(self, request, pk=None):

        category = self.request.query_params.get('category')

        # Төсөл хөтөлбөрийн ангилалаар хайж байна
        if category:
            self.queryset = self.queryset.filter(category=category)

        # Төсөл хөтөлбөрийн төрлөөр

        if pk:
            row_data = self.retrieve(request, pk).data
            return request.send_data(row_data)

        all_list = self.list(request).data

        return request.send_data(all_list)


@permission_classes([IsAuthenticated])
class UserProjectAPIView(
    mixins.ListModelMixin,
    generics.GenericAPIView,
    mixins.RetrieveModelMixin,

):
    """  Эрдэм шинжилгээ Төсөл хөтөлбөрийн  жагсаалт """

    queryset = UserProject.objects.all()
    serializer_class = UserProjectSerializer

    qs_teachers = Teachers.objects.all()

    pagination_class = CustomPagination
    filter_backends = [SearchFilter]

    def get(self, request, pk=None):

        sorting = self.request.query_params.get('sorting')

        if sorting:
            if not isinstance(sorting, str):
                sorting = str(sorting )

        start_date = self.request.query_params.get('start_date')
        category = self.request.query_params.get('category')
        sub_category = self.request.query_params.get('sub_category')
        salbar = self.request.query_params.get('salbar')
        teacher = self.request.query_params.get('teacher')

        # Тэнхимээр хайлт хийх
        if salbar:
            teacher_user_ids = self.qs_teachers.filter(salbar=salbar).values_list('user', flat=True)
            self.queryset = self.queryset.filter(user_id__in=teacher_user_ids)

        # Багшаар хайлт хийх
        if teacher:
            user_ids = self.qs_teachers.filter(id=teacher).values_list('user', flat=True)
            self.queryset = self.queryset.filter(user_id__in=user_ids)

        # Төслийн төрөлөөр хайлт хийх
        if category:
            self.queryset = self.queryset.filter(category=category)

        # Төслийн ангилалаар хайлт хийх
        if sub_category:
            self.queryset = self.queryset.filter(sub_category=sub_category)

         # Төслийн огноогоор хайлт хийх
        if start_date:
            self.queryset = self.queryset.filter(start_date__year=start_date)

        user_ids = self.queryset.values_list('user', flat=True).distinct('user')

        userproject_ids = []

        # Багшаар group хийх хэсэг
        for user_id in user_ids:
            qs_paper = self.queryset.filter(user=user_id).first()

            if qs_paper:
                userproject_ids.append(qs_paper.id)

        self.queryset = self.queryset.filter(id__in=userproject_ids)

        all_list = self.list(request).data

        return request.send_data(all_list)


@permission_classes([IsAuthenticated])
class UserQuotationAPIView(
    mixins.ListModelMixin,
    generics.GenericAPIView,
    mixins.RetrieveModelMixin,

):
    """  Эрдэм шинжилгээ Эшлэл жагсаалт """

    queryset = UserQuotation.objects.all()
    serializer_class = UserQuotationSerializer

    pagination_class = CustomPagination

    filter_backends = [SearchFilter]
    search_fields = ['name','doi_number', 'quotation_number', 'quotation_year', 'quotation_link', 'category__name']

    def get(self, request, pk=None):

        salbar = self.request.query_params.get('salbar')
        category = self.request.query_params.get('category')
        quotation_year = self.request.query_params.get('quotation_year')

        user_ids = self.queryset.values_list('user', flat=True).distinct('user')

        userquotation_ids = []

        # Багшаар group хийх хэсэг
        for user_id in user_ids:
            qs_paper = self.queryset.filter(user=user_id).first()

            if qs_paper:
                userquotation_ids.append(qs_paper.id)

        self.queryset = self.queryset.filter(id__in=userquotation_ids)

        # Тэнхимээр хайлт хийх
        if salbar:
            user_ids = Teachers.objects.filter(salbar=salbar).values_list('user', flat=True)
            self.queryset = self.queryset.filter(user__in=user_ids)

        # Төслийн ангилалаар хайлт хийх
        if category:
            self.queryset = self.queryset.filter(category=category)

        # Эшлэлд татагдсан оноор хайлт хийх
        if quotation_year:
            self.queryset = self.queryset.filter(quotation_year=quotation_year)

        all_list = self.list(request).data

        return request.send_data(all_list)



@permission_classes([IsAuthenticated])
class UserSymbolCertAPIView(
    mixins.ListModelMixin,
    generics.GenericAPIView,
    mixins.RetrieveModelMixin,

):

      """  Эрдэм шинжилгээ Барааны-Тэмдгийн-Гэрчилгээ жагсаалт """

      queryset = UserSymbolCert.objects.all()
      serializer_class = UserSymbolCertSerializer

      pagination_class = CustomPagination

      def get(self, request, pk=None):

        begin_date = self.request.query_params.get('begin_date')
        end_date = self.request.query_params.get('end_date')
        salbar = self.request.query_params.get('salbar')
        register_number = self.request.query_params.get('register_number')

        # Тэнхимээр хайлт хийх
        if salbar:
            self.qs_teachers = self.qs_teachers.filter(salbar=salbar)

        # Улсын бүртгэлийн дугаараар хайлт хийх
        if register_number:
            self.queryset = self.queryset.filter(register_number=register_number)

         # Гэрчилгээ олгосон огноогоор хайлт хийх
        if begin_date and end_date:
            self.queryset = self.queryset.filter(start_date__lte=end_date,start_date__gte=begin_date)

        if pk:
            row_data = self.retrieve(request, pk).data
            return request.send_data(row_data)

        all_list = self.list(request).data

        return request.send_data(all_list)


@permission_classes([IsAuthenticated])
class UserModelCertPatentAPIView(
    mixins.ListModelMixin,
    generics.GenericAPIView,
    mixins.RetrieveModelMixin,

):

      """  Эрдэм шинжилгээ Ашигтай-Загварын-Патент жагсаалт """

      queryset = UserModelCertPatent.objects.all()
      serializer_class = UserModelCertPatentSerializer

      pagination_class = CustomPagination

      def get(self, request, pk=None):

        begin_date = self.request.query_params.get('begin_date')
        end_date = self.request.query_params.get('end_date')
        salbar = self.request.query_params.get('salbar')
        name = self.request.query_params.get('name')
        science_field = self.request.query_params.get('science_field')

        # Тэнхимээр хайлт хийх
        if salbar:
            self.qs_teachers = self.qs_teachers.filter(salbar=salbar)

        # Ашигтай загварын нэрээр хайлт хийх
        if name:
            self.queryset = self.queryset.filter(name=name)

        # ШУ-ы салбарaap хайлт хийх
        if science_field:
            self.queryset = self.queryset.filter(science_field=science_field)

        # Гэрчилгээ олгосон огноогоор хайлт хийх
        if begin_date and end_date:
            self.queryset = self.queryset.filter(start_date__lte=end_date,start_date__gte=begin_date)

        if pk:
            row_data = self.retrieve(request, pk).data
            return request.send_data(row_data)

        all_list = self.list(request).data

        return request.send_data(all_list)


@permission_classes([IsAuthenticated])
class UserlicenseCertAPIView(
    mixins.ListModelMixin,
    generics.GenericAPIView,
    mixins.RetrieveModelMixin,
):
      '''Лицензийн гэрчилгээ'''

      queryset = UserLicenseCert.objects.all()
      serializer_class = UserLicenseCertSerializer

      pagination_class = CustomPagination

      def get(self, request, pk=None):

        begin_date = self.request.query_params.get('begin_date')
        end_date = self.request.query_params.get('end_date')
        salbar = self.request.query_params.get('salbar')
        license_class = self.request.query_params.get('license_class')

        # Тэнхимээр хайлт хийх
        if salbar:
            self.qs_teachers = self.qs_teachers.filter(salbar=salbar)

        # Лицензийн ангилалaap хайлт хийх
        if license_class:
            self.queryset = self.queryset.filter(license_class=license_class)

        # Бүртгэгдсэн огноогоор хайлт хийх
        if begin_date and end_date:
            self.queryset = self.queryset.filter(start_date__lte=end_date,start_date__gte=begin_date)

        if pk:
            row_data = self.retrieve(request, pk).data
            return request.send_data(row_data)

        all_list = self.list(request).data

        return request.send_data(all_list)


@permission_classes([IsAuthenticated])
class UserRightCertAPIView(
    mixins.ListModelMixin,
    generics.GenericAPIView,
    mixins.RetrieveModelMixin,
):

    '''Зохиогчийн эрхийн гэрчилгээ'''

    queryset = UserRightCert.objects.all()
    serializer_class = UserRightCertSerializer

    pagination_class = CustomPagination

    def get(self, request, pk=None):

        begin_date = self.request.query_params.get('begin_date')
        end_date = self.request.query_params.get('end_date')
        salbar = self.request.query_params.get('salbar')
        name = self.request.query_params.get('name')
        abstract = self.request.query_params.get('abstract')
        register_number = self.request.query_params.get('register_number')

        # Тэнхимээр хайлт хийх
        if salbar:
            self.qs_teachers = self.qs_teachers.filter(salbar=salbar)

        # Товч тайлбараар хайлт хийх
        if abstract:
            self.queryset = self.queryset.filter(abstract=abstract)

        # Бүтээлийн нэрээр хайлт хийх
        if name:
            self.queryset = self.queryset.filter(name=name)

        # Бүртгэлийн дугаараар хайлт хийх
        if register_number:
            self.queryset = self.queryset.filter(register_number=register_number)

        # Бүртгэгдсэн огноогоор хайлт хийх
        if begin_date and end_date:
            self.queryset = self.queryset.filter(start_date__lte=end_date,start_date__gte=begin_date)

        if pk:
            row_data = self.retrieve(request, pk).data
            return request.send_data(row_data)

        all_list = self.list(request).data

        return request.send_data(all_list)


@permission_classes([IsAuthenticated])
class InventionCategoryListAPIView(
      mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    generics.GenericAPIView
):

    queryset = InventionCategory.objects.all()
    serializer_class = InventionCategorySerializer

    def get(self, request, pk=None):
        "Эрдэм шинжилгээний бүтээлийн ангилал харах"

        if pk:
            row_data = self.retrieve(request, pk).data
            return request.send_data(row_data)

        all_list = self.list(request).data

        return request.send_data(all_list)


@permission_classes([IsAuthenticated])
class InventionCategoryAPIView(
      mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    generics.GenericAPIView
):

    queryset = InventionCategory.objects.all()
    serializer_class = InventionCategorySerializer
    pagination_class = CustomPagination

    def get(self, request, pk=None):
        "Эрдэм шинжилгээний бүтээлийн ангилал харах"

        if pk:
            row_data = self.retrieve(request, pk).data
            return request.send_data(row_data)

        all_list = self.list(request).data

        return request.send_data(all_list)


@permission_classes([IsAuthenticated])
class PaperCategoryAPIView(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    generics.GenericAPIView
):

    queryset = PaperCategory.objects.all()
    serializer_class = PaperCategorySerializer

    pagination_class = CustomPagination

    def get(self, request, pk=None):

        # Өгүүллийн ангилал харах
        if pk:
            row_data = self.retrieve(request, pk).data
            return request.send_data(row_data)

        all_list = self.list(request).data

        return request.send_data(all_list)


@permission_classes([IsAuthenticated])
class ProjectCategoryAPIView(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    generics.GenericAPIView
):

    queryset = ProjectCategory.objects.all()
    serializer_class = ProjectCategorySerializer
    pagination_class = CustomPagination

    def get(self, request, pk=None):
        "Эрдэм шинжилгээний бүтээлийн ангилал харах"

        if pk:
            row_data = self.retrieve(request, pk).data
            return request.send_data(row_data)

        all_list = self.list(request).data

        return request.send_data(all_list)


@permission_classes([IsAuthenticated])
class UserPaperCategoryAPIView(
    generics.GenericAPIView,
    mixins.ListModelMixin
):
    """ Өгүүллийн ангилал """

    queryset = PaperCategory.objects.all()
    serializer_class = PaperCategorySerializer

    def get(self, request):

        all_data = self.list(request).data
        return request.send_data(all_data)


class UserNoteCategoryAPIView(
    generics.GenericAPIView,
    mixins.ListModelMixin
):
    """ Илтгэлийн төрөл """

    queryset = NoteCategory.objects.all()
    serializer_class = UserNoteCategory

    def get(self, request):

        all_data = self.list(request).data
        return request.send_data(all_data)


class ScienceApiView(
    generics.GenericAPIView,
):
    """ Тохиргооны хэсэг авах """

    def get(self, request):

        ctype = request.query_params.get('type')

        # Бүтээлийн ангилал авах хэсэг
        if ctype == 'buteel':
            qs_uguulel = InventionCategory.objects.all()
            all_datas = InventionCategorySerializer(qs_uguulel, many=True).data
        elif ctype == 'uguulel':
            qs_buteel = PaperCategory.objects.all()
            all_datas = PaperCategorySerializer(qs_buteel, many=True).data
        elif ctype == 'tosol':
            qs_tosol = ProjectCategory.objects.all()
            all_datas = ProjectCategorySerializer(qs_tosol, many=True).data
        elif ctype == 'sub_angilal':
            qs_tosol = NoteCategory.objects.all()
            all_datas = UserNoteCategory(qs_tosol, many=True).data
        elif ctype == 'quotation':
            qs_quotation = QuotationCategory.objects.all()
            all_datas = QuotationCategorySerializer(qs_quotation, many=True).data

        return request.send_data(all_datas)

    def post(self, request):
        ctype = request.query_params.get('type')

        datas = request.data
        with transaction.atomic():
            try:
                if ctype == 'buteel':
                    InventionCategory.objects.create(**datas)
                elif ctype == 'uguulel':
                    PaperCategory.objects.create(**datas)
                elif ctype == 'tosol':
                    ProjectCategory.objects.create(**datas)
                elif ctype == 'sub_angilal':
                    NoteCategory.objects.create(**datas)
                elif ctype == 'quotation':
                    QuotationCategory.objects.create(**datas)

            except Exception as e:
                print(e)
                return request.send_error('ERR_002')

        return request.send_info('INF_001')

    def put(self, request):
        ctype = request.query_params.get('type')

        datas = request.data

        with transaction.atomic():
            try:
                if ctype == 'buteel':
                    InventionCategory.objects.filter(id=datas.get('id')).update(**datas)
                elif ctype == 'uguulel':
                    PaperCategory.objects.filter(id=datas.get('id')).update(**datas)
                elif ctype == 'tosol':
                    ProjectCategory.objects.filter(id=datas.get('id')).update(**datas)
                elif ctype == 'sub_angilal':
                    NoteCategory.objects.filter(id=datas.get('id')).update(**datas)
                elif ctype == 'quotation':
                    QuotationCategory.objects.filter(id=datas.get('id')).update(**datas)

            except Exception as e:
                print(e)
                return request.send_error('ERR_002')

        return request.send_info('INF_002')

    def delete(self, request, pk=None):
        ctype = request.query_params.get('type')

        with transaction.atomic():
            if ctype == 'buteel':
                InventionCategory.objects.filter(id=pk).delete()
            elif ctype == 'uguulel':
                PaperCategory.objects.filter(id=pk).delete()
            elif ctype == 'tosol':
                ProjectCategory.objects.filter(id=pk).delete()
            elif ctype == 'sub_angilal':
                NoteCategory.objects.filter(id=pk).delete()
            elif ctype == 'quotation':
                QuotationCategory.objects.filter(id=pk).delete()

        return request.send_info('INF_003')


@permission_classes([IsAuthenticated])
class ScienceStudentApiView(
    generics.GenericAPIView,
    mixins.ListModelMixin
):
    """ Оюутан удирдсан байдал """

    queryset = GraduationWork.objects.all()
    serializer_class = GraduationWorkSerializer

    pagination_class = CustomPagination

    filter_backends = [SearchFilter]
    search_fields = ['diplom_topic', 'leader', 'graduation_date', 'graduation_number']

    def get(self, request):

        teacher_ids = self.queryset.values_list('teacher', flat=True).distinct('teacher').order_by('teacher')

        self.queryset = self.queryset.filter(teacher_id__in=teacher_ids)

        all_data = self.list(request).data

        return request.send_data(all_data)


class PatentAPIView(
    generics.GenericAPIView,
    mixins.ListModelMixin
):
    """ Оюуны өмчийн байдал """

    queryset = UserPatent.objects.all()

    def get(self, request):
        return request.send_data([])


@permission_classes([IsAuthenticated])
class EstimateAPIView(
    generics.GenericAPIView,
    mixins.ListModelMixin
):
    """ Б цагийн тооцооны нэгтгэл """

    queryset = Teachers.objects.all().order_by('first_name')
    serializer_class = TeacherNameSerializer

    pagination_class = CustomPagination

    filter_backends = [SearchFilter]
    search_fields = ['first_name', 'last_name']


    def get(self, request):

        today = datetime.today()

        this_year = today.strftime("%Y")

        school = request.query_params.get('school')
        department = request.query_params.get('salbar')

        qs_teachers = get_teacher_queryset()

        if school:
            qs_teachers = qs_teachers.filter(sub_org=school)

        if department:
            qs_teachers = qs_teachers.filter(salbar=department)

        serializer_data = self.get_serializer(qs_teachers, many=True).data

        for data in serializer_data:
            total_score = 0

            teacher_id = data.get('id')
            teacher = Teachers.objects.filter(id=teacher_id).first()
            user_id = teacher.user

            invention_count = UserInvention.objects.filter(user=user_id, published_year=this_year).aggregate(Count('category__point')).get('category__point__count')
            total_score += invention_count

            paper_count = UserPaper.objects.filter(user=user_id, published_year=this_year).aggregate(Count('category__point')).get('category__point__count')
            total_score += paper_count

            note_count = UserNote.objects.filter(user=user_id, meeting_date__year=this_year).aggregate(Count('category__point')).get('category__point__count')
            total_score += note_count

            quotation_count = UserQuotation.objects.filter(user=user_id, quotation_year=this_year).annotate(total=F('quotation_number') * F('category__point')).aggregate(total_num=Sum('total'))
            total_score += quotation_count.get('total_num') if quotation_count.get('total_num') else 0

            project_count = UserProject.objects.filter(user=user_id, start_date__year=this_year).aggregate(Count('category__point')).get('category__point__count')
            total_score += project_count

            contract_count = UserContractWork.objects.filter(user=user_id, start_date__year=this_year, end_date__year=this_year).count()
            total_score += contract_count

            patent_count = UserPatent.objects.filter(user=user_id, end_date__year__gte=this_year).count()
            total_score += patent_count

            cert_patent_count = UserModelCertPatent.objects.filter(user=user_id, end_date__year=this_year).count()
            total_score += cert_patent_count

            symbol_cert_count = UserSymbolCert.objects.filter(user=user_id, end_date__year=this_year).count()
            total_score += symbol_cert_count

            license_cert_count = UserLicenseCert.objects.filter(user=user_id, start_date__year=this_year, end_date__year=this_year).count()
            total_score += license_cert_count

            right_cert_count = UserRightCert.objects.filter(user=user_id, create_date__year=this_year).count()
            total_score += right_cert_count

            # Оюутан удирдсан байдал

            year, season = get_active_year_season()
            student_qs = GraduationWork.objects.filter(lesson_year=year, lesson_season=season, teacher=teacher).values_list('student', flat=True)

            count = student_qs.count()
            total_score += count

            data['score'] = total_score

        all_data = list(filter(lambda i: i['score'] != 0, serializer_data))

        return request.send_data(all_data)


class ReportAPIView(APIView):

    def get(self, request):
        ''' 1 Жилийн chart-д зориулсан мэдээлэл
        '''
        year = request.GET.get('year')
        before_year = int(year) - 1

        # Өгүүлэл
        user_paper_count = UserPaper.objects.filter(published_year=year).count()
        user_paper_bef_count = UserPaper.objects.filter(published_year=before_year).count()

        # Илтгэл
        user_note_count = UserNote.objects.filter(meeting_date__year=year).count()
        user_note_bef_count = UserNote.objects.filter(meeting_date__year=before_year).count()

        # Төсөл хөтөлбөр
        user_project_count = UserProject.objects.filter(start_date__year=year).count()
        user_project_bef_count = UserProject.objects.filter(start_date__year=before_year).count()

        # Бүтээл
        user_invent_count = UserInvention.objects.filter(published_year=year).count()
        user_invent_bef_count = UserInvention.objects.filter(published_year=before_year).count()

        # Эшлэл
        user_quot_count = UserQuotation.objects.filter(quotation_year=year).count()
        user_quot_bef_count = UserQuotation.objects.filter(quotation_year=before_year).count()

        # Оюутан удирдсан байдал
        graduation_work_count = GraduationWork.objects.filter(lesson_year__startswith=year).count()
        graduation_work_bef_count = GraduationWork.objects.filter(lesson_year__startswith=before_year).count()

        # Оюуны өмчийн байдал
        user_patent_count = UserPatent.objects.filter(start_date__year=year).count()
        user_patent_bef_count = UserPatent.objects.filter(start_date__year=before_year).count()


        all_count = user_paper_count + user_note_count + user_project_count + user_invent_count + user_quot_count + graduation_work_count + user_patent_count
        all_bef_count = user_paper_bef_count + user_note_bef_count + user_project_bef_count + user_invent_bef_count + user_quot_bef_count + graduation_work_bef_count + user_patent_bef_count
        difference = 0

        if all_count >= all_bef_count:
            difference = all_count - all_bef_count
        else:
            difference = all_bef_count - all_count

        all_data = {
            'user_paper_count': user_paper_count,
            'user_note_count': user_note_count,
            'user_project_count': user_project_count,
            'user_invent_count': user_invent_count,
            'user_quot_count': user_quot_count,
            'graduation_work_count': graduation_work_count,
            'user_patent_count': user_patent_count,
            'is_grew_up': all_count >= all_bef_count,
            'difference': difference,
            'all_count': all_count
        }

        return request.send_data(all_data)
