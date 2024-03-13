from rest_framework import mixins
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes
from rest_framework.filters import SearchFilter

from django.db import transaction
from django.db.models import F, Subquery, OuterRef
from django.db.models.functions import Substr

from main.utils.function.utils import has_permission
from main.utils.function.pagination import CustomPagination

import datetime as dt


from lms.models import (
    AdmissionRegister,
    AdmissionRegisterProfession,
    ProfessionDefinition,
    AdmissionIndicator,
    AdmissionXyanaltToo,
)

from surgalt.serializers import (
    ProfessionDefinitionSerializer
)

from .serializer import (
    AdmissionSerializer,
    ElseltSysInfoSerializer,
    AdmissionProfessionSerializer,
    AdmissionPostSerializer,
    AdmissionActiveProfession,
    AdmissionUserInfoSerializer
)

from elselt.models import (
    AdmissionUserProfession,
    UserInfo,
    ElseltUser,
    ContactInfo
)


@permission_classes([IsAuthenticated])
class ElseltApiView(
    generics.GenericAPIView,
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin
):
    """ Элсэлт бүртгэх """

    queryset = AdmissionRegister.objects.all()
    serializer_class = AdmissionSerializer

    pagination_class = CustomPagination

    def get(self, request):
        datas = self.list(request).data
        return request.send_data(datas)

    def post(self, request):
        self.serializer_class = AdmissionPostSerializer
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid(raise_exception=False):
            self.perform_create(serializer)
        else:
            return request.send_error_valid(serializer.errors)

        return request.send_info('INF_001')

    def put(self, request, pk=None):
        instance = self.get_object()
        self.serializer_class = AdmissionPostSerializer
        serializer = self.get_serializer(instance=instance, data=request.data, partial=True)
        if serializer.is_valid(raise_exception=False):
            self.perform_update(serializer)
        else:
            print
            return request.send_error_valid(serializer.errors)

        return request.send_info('INF_002')

    def delete(self, request, pk=None):
        self.destroy(request, pk)

        return request.send_info("INF_003")


class ElseltProfession(
    generics.GenericAPIView,
    mixins.ListModelMixin,
    mixins.CreateModelMixin
):
    """ Элсэлтийн мэргэжил """

    queryset = AdmissionRegisterProfession.objects.all()
    serializer_class = AdmissionProfessionSerializer

    def get(self, request):
        elselt = request.query_params.get('elselt')

        admission_querysets = self.queryset.filter(admission=elselt)
        prof_ids = self.queryset.filter(admission=elselt).values_list('profession', flat=True)
        querysets = ProfessionDefinition.objects.filter(id__in=list(prof_ids))

        datas = ProfessionDefinitionSerializer(querysets, many=True).data
        admission_datas =AdmissionProfessionSerializer(admission_querysets, many=True).data

        return_datas = {
            'datas': datas,
            'admission_datas': admission_datas
        }

        return request.send_data(return_datas)

    def post(self, request):

        datas = self.create(request).data
        return request.send_info('INF_001', datas)

    def delete(self, request, pk=None):
        elselt = request.query_params.get('elselt')
        user_admission = AdmissionUserProfession.objects.filter(profession=pk)

        if len(user_admission) > 0:
            request.send_error('ERR_002', 'Энэ хөтөлбөрт элсэгчид бүртгүүлсэн тул устгах боломжгүй')

        with transaction.atomic():
            self.queryset.filter(admission=elselt, profession=pk).delete()

        return request.send_info('INF_003')


class ProfessionShalguur(
    generics.GenericAPIView
):
    """ Мэргэжилд шалгуур нэмэх """

    def post(self, request):
        datas = request.data
        shalguur_ids = datas.get('shalguurIds')
        hynaltToo = datas.get('hynaltToo') # Нийт хяналтын тоо
        nasYear = datas.get('nasYear') # Насны хязгаар
        admission = datas.get('admission')

        def return_type(shalguur_id):
            if shalguur_id in [1, 2]:
                return AdmissionIndicator.PUBLIC
            else:
                return AdmissionIndicator.SPECIFIC

        # Элсэлтэд бүртгэлтэй байгаа мэргэжил
        admission_prof = AdmissionRegisterProfession.objects.get(pk=admission)

        with transaction.atomic():
            try:
                for idx, shalguur_id in enumerate(shalguur_ids):
                    obj, created = AdmissionIndicator.objects.update_or_create(
                        value=shalguur_id,
                        admission_prof=admission_prof,
                        defaults={
                            'type': return_type(shalguur_id),
                            'orderby': idx,
                            'limit_min': nasYear.get('limit_min') if nasYear.get('limit_min') else None,
                            'limit_mах': nasYear.get('limit_max') if nasYear.get('limit_max') else None
                        }
                    )

                    # Хэрвээ хяналтын тоо байвал
                    if shalguur_id == AdmissionIndicator.XYANALTIIN_TOO and hynaltToo.get('norm_all'):
                        AdmissionXyanaltToo.objects.update_or_create(
                            indicator=obj,
                            defaults={
                                'norm_all': hynaltToo.get('norm_all'),
                                'norm1': hynaltToo.get('norm1') if hynaltToo.get('norm1') else None,
                                'norm2': hynaltToo.get('norm2') if hynaltToo.get('norm2') else None,
                                'is_gender': True if hynaltToo.get('norm2') and hynaltToo.get('norm1') else False
                            }
                        )
            except Exception as e:
                return request.send_error('ERR_001', 'Системийн админд хандана уу')

        return request.send_info('INF_001')


class ElseltActiveListProfession(
    generics.GenericAPIView,
    mixins.ListModelMixin,
    mixins.CreateModelMixin
):
    """ Идэвхитэй элсэлтийн мэргэжил """

    queryset = AdmissionRegisterProfession.objects.all()
    serializer_class = AdmissionActiveProfession

    def get(self, request):

        now = dt.date.today()

        self.queryset = (
            self.queryset
            .filter(
                admission__begin_date__lte=now,
                admission__end_date__gte=now,
                admission__is_active=True
            )
        )


        all_data = self.list(request).data

        return request.send_data(all_data)


class ElseltSysInfo(
    generics.GenericAPIView,
    mixins.RetrieveModelMixin,
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    mixins.UpdateModelMixin
):
    """ Элсэлтийн системийн мэдээлэл """
    queryset = ContactInfo.objects.all()
    serializer_class = ElseltSysInfoSerializer

    def get(self, request):

        info = self.queryset.first()
        serializer = self.get_serializer(info)

        return request.send_data(serializer.data)

    def post(self, request):

        data = request.data.dict()
        home_image = data.get('home_image')
        if home_image == 'null' or not home_image:
            del data['home_image']

        serializer = self.get_serializer(data=data)
        if serializer.is_valid(raise_exception=False):
            self.perform_create(serializer)
        else:
            return request.send_error_valid(serializer.errors)

        return request.send_info("INF_001")


    def put(self, request, pk=None):
        data = request.data.dict()
        instance = self.get_object()
        errors = []
        home_image = data.get('home_image')
        if home_image == 'null' or not home_image or isinstance(home_image, str):
            del data['home_image']

        serializer = self.get_serializer(instance, data=data)
        if serializer.is_valid(raise_exception=False):
            self.perform_update(serializer)

            if home_image == 'null' or not home_image:
                obj = self.queryset.get(pk=pk)
                obj.home_image = None
                obj.save()
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

    def post(self, request):

        datas = self.create(request).data
        return request.send_info('INF_001', datas)

    def delete(self, request, pk=None):
        elselt = request.query_params.get('elselt')

        with transaction.atomic():
            self.queryset.filter(admission=elselt, profession=pk).delete()

        return request.send_info('INF_003')



@permission_classes([IsAuthenticated])
class ProfessionShalguur(
    generics.GenericAPIView
):
    """ Мэргэжилд шалгуур нэмэх """

    def post(self, request):
        datas = request.data
        shalguur_ids = datas.get('shalguurIds')
        hynaltToo = datas.get('hynaltToo') # Нийт хяналтын тоо
        nasYear = datas.get('nasYear') # Насны хязгаар
        admission = datas.get('admission')

        def return_type(shalguur_id):
            if shalguur_id in [1, 2]:
                return AdmissionIndicator.PUBLIC
            else:
                return AdmissionIndicator.SPECIFIC

        # Элсэлтэд бүртгэлтэй байгаа мэргэжил
        admission_prof = AdmissionRegisterProfession.objects.get(pk=admission)

        with transaction.atomic():
            try:
                for idx, shalguur_id in enumerate(shalguur_ids):
                    obj, created = AdmissionIndicator.objects.update_or_create(
                        value=shalguur_id,
                        admission_prof=admission_prof,
                        defaults={
                            'type': return_type(shalguur_id),
                            'orderby': idx,
                            'limit_min': nasYear.get('limit_min') if nasYear.get('limit_min') else None,
                            'limit_mах': nasYear.get('limit_max') if nasYear.get('limit_max') else None
                        }
                    )

                    # Хэрвээ хяналтын тоо байвал
                    if shalguur_id == AdmissionIndicator.XYANALTIIN_TOO and hynaltToo.get('norm_all'):
                        AdmissionXyanaltToo.objects.update_or_create(
                            indicator=obj,
                            defaults={
                                'norm_all': hynaltToo.get('norm_all'),
                                'norm1': hynaltToo.get('norm1') if hynaltToo.get('norm1') else None,
                                'norm2': hynaltToo.get('norm2') if hynaltToo.get('norm2') else None,
                                'is_gender': True if hynaltToo.get('norm2') and hynaltToo.get('norm1') else False
                            }
                        )
            except Exception as e:
                return request.send_error('ERR_001', 'Системийн админд хандана уу')

        return request.send_info('INF_001')


@permission_classes([IsAuthenticated])
class AdmissionUserInfoAPIView(
    generics.GenericAPIView,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
):

    queryset = AdmissionUserProfession.objects.all()

    serializer_class = AdmissionUserInfoSerializer
    pagination_class = CustomPagination

    filter_backends = [SearchFilter]
    search_fields = ['user__first_name', 'user__register', 'user__email', 'gpa']

    def get_queryset(self):

        queryset = self.queryset
        queryset = queryset.annotate(gender=(Substr('user__register', 9, 1)))

        userinfo_qs = UserInfo.objects.filter(user=OuterRef('user')).values('gpa')[:1]

        queryset = (
            queryset
            .annotate(
                gpa=Subquery(userinfo_qs),
            )
        )

        lesson_year_id = self.request.query_params.get('lesson_year')
        profession_id = self.request.query_params.get('profession_id')
        unit1_id = self.request.query_params.get('unit1_id')
        state = self.request.query_params.get('state')
        gender = self.request.query_params.get('gender')
        sorting = self.request.query_params.get('sorting')

        if lesson_year_id:
            queryset = queryset.filter(profession__admission__id=lesson_year_id)

        if profession_id:
            queryset = queryset.filter(profession__profession__id=profession_id)

        if unit1_id:
            queryset = queryset.filter(user__aimag__id=unit1_id)

        if state:
            queryset = queryset.filter(state=state)

        if gender:
            if gender == 'Эрэгтэй':
                queryset = queryset = queryset.filter(gender__in=['1', '3', '5', '7', '9'])
            else:
                queryset = queryset = queryset.filter(gender__in=['0', '2', '4', '6', '8'])

        # Sort хийх үед ажиллана
        if sorting:
            if not isinstance(sorting, str):
                sorting = str(sorting)

            queryset = queryset.order_by(sorting)

        return queryset

    def get(self, request, pk=None):

        if pk:

            all_data = self.retrieve(request, pk).data

            return request.send_data(all_data)

        all_data = self.list(request).data

        return request.send_data(all_data)


class AdmissionYearAPIView(
    generics.GenericAPIView,
    mixins.ListModelMixin,
):

    queryset = AdmissionRegister.objects.all()
    serializer_class = AdmissionSerializer

    def get(self, request):

        all_data = self.list(request).data

        return request.send_data(all_data)


class AdmissionGpaAPIView(
    generics.GenericAPIView,
    mixins.UpdateModelMixin
):
    @transaction.atomic()
    def put(self, request, pk=None):

        data = request.data
        UserInfo.objects.update_or_create(
            id=pk,
            defaults=data
        )

        return request.send_info("INF_002")