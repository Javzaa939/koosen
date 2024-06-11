from rest_framework import mixins
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes
from rest_framework.filters import SearchFilter

from django.core.mail import send_mail
from django.core.mail import send_mass_mail
from django.template.loader import render_to_string
from django.db import transaction
from django.db.models import F, Subquery, OuterRef, Count, Q
from django.db.models.functions import Substr

from main.utils.function.utils import json_load, make_connection, get_domain_url_link, get_domain_url, null_to_none
from main.utils.function.pagination import CustomPagination
from main.decorators import login_required
from rest_framework.response import Response
from rest_framework import status
import hashlib
import datetime as dt


from lms.models import (
    AdmissionRegister,
    AdmissionRegisterProfession,
    ProfessionDefinition,
    AdmissionIndicator,
    AdmissionXyanaltToo,
    AimagHot
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
    AdmissionUserInfoSerializer,
    AdmissionUserProfessionSerializer,
    EmailInfoSerializer,
    HealthUserSerializer,
    HealthUserDataSerializer,
    HealthUpUserInfoSerializer,
    HealthUpUserSerializer,
    PhysqueUserSerializer,
    HealthPhysicalUserInfoSerializer,
    ElseltApproveSerializer,
)

from elselt.models import (
    AdmissionUserProfession,
    UserInfo,
    ElseltUser,
    ContactInfo,
    EmailInfo,
    HealthUser,
    PhysqueUser,
    HealthUpUser,
    AdmissionUserProfession
)

from core.models import (
    User,
    Employee,
    Schools
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
        datas = request.data.dict()
        degree_ids = json_load(datas.get('degrees'))
        datas['degrees'] = degree_ids
        self.serializer_class = AdmissionPostSerializer

        serializer = self.get_serializer(data=datas)
        if serializer.is_valid(raise_exception=False):
            self.perform_create(serializer)
        else:
            return request.send_error_valid(serializer.errors)

        return request.send_info('INF_001')

    def put(self, request, pk=None):
        instance = self.get_object()

        datas = request.data.dict()
        degree_ids = json_load(datas.get('degrees'))
        datas['degrees'] = degree_ids

        self.serializer_class = AdmissionPostSerializer
        serializer = self.get_serializer(instance=instance, data=datas, partial=True)

        if serializer.is_valid(raise_exception=False):
            self.perform_update(serializer)
        else:
            return request.send_error_valid(serializer.errors)

        return request.send_info('INF_002')

    def delete(self, request, pk=None):
        with transaction.atomic():
            # Тухайн элсэлтэд бүртгүүлсэн хэрэглэгчдийг устгах
            AdmissionUserProfession.objects.filter(profession__admission=pk).delete()

        self.destroy(request, pk)

        return request.send_info("INF_003")


@permission_classes([IsAuthenticated])
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

        datas = ProfessionDefinitionSerializer(querysets, many=True, context={'admission': elselt}).data
        admission_datas =AdmissionProfessionSerializer(admission_querysets, many=True).data

        return_datas = {
            'datas': datas,
            'admission_datas': admission_datas
        }

        return request.send_data(return_datas)

    def post(self, request):

        datas = self.create(request).data
        return request.send_info('INF_001', datas)

    def put(self, request):

        datas = request.data
        with transaction.atomic():
            AdmissionRegisterProfession.objects.filter(
                admission=datas.get('admission'),
                profession=datas.get('profession')
            ).update(state=datas.get('state'))

        return request.send_info('INF_002')

    def delete(self, request, pk=None):
        elselt = request.query_params.get('elselt')
        user_admission = AdmissionUserProfession.objects.filter(profession=pk)

        if len(user_admission) > 0:
            request.send_error('ERR_002', 'Энэ хөтөлбөрт элсэгчид бүртгүүлсэн тул устгах боломжгүй')

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
class ElseltActiveListProfession(
    generics.GenericAPIView,
    mixins.ListModelMixin,
    mixins.CreateModelMixin
):
    """ Идэвхитэй элсэлтийн мэргэжил """

    queryset = AdmissionRegisterProfession.objects.all()
    serializer_class = AdmissionActiveProfession

    def get(self, request):

        elselt = request.query_params.get('elselt')
        if elselt:
            self.queryset = self.queryset.filter(admission=elselt)

        all_data = self.list(request).data

        return request.send_data(all_data)


@permission_classes([IsAuthenticated])
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

        old_shalguur_ids = AdmissionIndicator.objects.filter(admission_prof=admission_prof).values_list('value', flat=True)
        first_set = set(list(old_shalguur_ids))
        sec_set = set(shalguur_ids)

        # Устгах ids
        delete_ids = first_set - sec_set
        with transaction.atomic():
            try:
                # Check болиулсан үед устгана
                AdmissionIndicator.objects.filter(admission_prof=admission_prof, value__in=delete_ids).delete()
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

    queryset = AdmissionUserProfession.objects.all().order_by('created_at')

    serializer_class = AdmissionUserInfoSerializer
    pagination_class = CustomPagination

    filter_backends = [SearchFilter]
    search_fields = ['user__first_name', 'user__register', 'user__email', 'gpa', 'org']

    def get_queryset(self):
        queryset = self.queryset
        queryset = queryset.annotate(gender=(Substr('user__register', 9, 1)))

        userinfo_qs = UserInfo.objects.filter(user=OuterRef('user')).values('gpa')[:1]
        userinfo_org = UserInfo.objects.filter(user=OuterRef('user')).values('work_organization')[:1]

        queryset = (
            queryset
            .annotate(
                gpa=Subquery(userinfo_qs),
                org=Subquery(userinfo_org),
            )
        )

        lesson_year_id = self.request.query_params.get('lesson_year_id')
        profession_id = self.request.query_params.get('profession_id')
        unit1_id = self.request.query_params.get('unit1_id')
        state = self.request.query_params.get('state')
        age_state = self.request.query_params.get('age_state')
        gpa_state = self.request.query_params.get('gpa_state')
        gender = self.request.query_params.get('gender')
        sorting = self.request.query_params.get('sorting')

        if lesson_year_id:
            queryset = queryset.filter(profession__admission=lesson_year_id)

        if profession_id:
            queryset = queryset.filter(profession__profession__id=profession_id)

        if unit1_id:
            queryset = queryset.filter(user__aimag__id=unit1_id)

        if state:
            queryset = queryset.filter(state=state)
        
        if age_state:
            queryset = queryset.filter(age_state = age_state)

        if gpa_state:
            user_ids = UserInfo.objects.filter(gpa_state=gpa_state).values_list('user', flat=True)
            queryset = queryset.filter(user__in=user_ids)

        if gender:
            if gender == 'Эрэгтэй':
                queryset = queryset.filter(gender__in=['1', '3', '5', '7', '9'])
            else:
                queryset = queryset.filter(gender__in=['0', '2', '4', '6', '8'])

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

    @transaction.atomic()
    def put(self, request, pk=None):
        data = request.data.copy()
        instance = self.get_object()

        try:
            # Элсэгчийн хөтөлбөр засах
            serializer = AdmissionUserProfessionSerializer(instance, data=data, partial=True)

            if not serializer.is_valid(raise_exception=False):
                return request.send_error_valid(serializer.errors)

            serializer.save()

        except Exception as e:
            return request.send_error('ERR_002', e.__str__())

        return request.send_info('INF_002')


class AdmissionUserAllChange(
    generics.GenericAPIView,
    mixins.UpdateModelMixin
):

    queryset = AdmissionUserProfession.objects.all()
    pagination_class = CustomPagination

    filter_backends = [SearchFilter]
    search_fields = ['user__first_name', 'user__register', 'user__email']

    def put(self, request):

        data = request.data
        sid = transaction.savepoint()
        try:
            with transaction.atomic():
                now = dt.datetime.now()
                self.queryset.filter(pk__in=data["students"]).update(state=data["state"], updated_at=now, state_description=data["state_description"])
        except Exception as e:
            transaction.savepoint_rollback(sid)
            return request.send_error("ERR_002", e.__str__)

        return request.send_info("INF_002")


class AdmissionUserEmailAPIView(
    generics.GenericAPIView,
    mixins.ListModelMixin
):

    queryset = EmailInfo.objects.all().order_by('send_date')
    serializer_class = EmailInfoSerializer

    pagination_class = CustomPagination

    filter_backends = [SearchFilter]
    search_fields = ['user__first_name', 'user__register', 'user__email', 'gpa']

    def get_queryset(self):

        queryset = self.queryset
        userinfo_qs = UserInfo.objects.filter(user=OuterRef('user')).values('gpa')[:1]

        queryset = (
            queryset
            .annotate(
                gpa=Subquery(userinfo_qs),
            )
        )

        queryset = queryset.annotate(gender=(Substr('user__register', 9, 1)))

        lesson_year_id = self.request.query_params.get('lesson_year_id')
        profession_id = self.request.query_params.get('profession_id')
        unit1_id = self.request.query_params.get('unit1_id')
        state = self.request.query_params.get('state')
        gpa_state = self.request.query_params.get('gpa_state')
        gender = self.request.query_params.get('gender')
        sorting = self.request.query_params.get('sorting')

        if lesson_year_id:
            admission_id = AdmissionRegisterProfession.objects.filter(admission=lesson_year_id).values_list('id', flat=True)
            user_ids = AdmissionUserProfession.objects.filter(profession__in=admission_id).values_list('user', flat=True)
            queryset = queryset.filter(user__in=user_ids)

        if profession_id:
            profession_ids = AdmissionRegisterProfession.objects.filter(profession=profession_id).values_list('id', flat=True)
            user_ids = AdmissionUserProfession.objects.filter(profession__in=profession_ids).values_list('user', flat=True)
            queryset = queryset.filter(user__in=user_ids)

        if unit1_id:
            queryset = queryset.filter(user__aimag__id=unit1_id)

        if state:
            user_ids = AdmissionUserProfession.objects.filter(state=state).values_list('user', flat=True)
            queryset = queryset.filter(user__in=user_ids)

        if gpa_state:
            user_ids = UserInfo.objects.filter(gpa_state=gpa_state).values_list('user', flat=True)
            queryset = queryset.filter(user__in=user_ids)

        if gender:
            if gender == 'Эрэгтэй':
                queryset = queryset.filter(gender__in=['1', '3', '5', '7', '9'])
            else:
                queryset = queryset.filter(gender__in=['0', '2', '4', '6', '8'])

        # Sort хийх үед ажиллана
        if sorting:
            if not isinstance(sorting, str):
                sorting = str(sorting)

            queryset = queryset.order_by(sorting)

        return queryset


    def get(self, request):

        send_data = self.list(request).data

        return request.send_data(send_data)

    @login_required()
    @transaction.atomic()
    def post(self, request):

        user = request.user
        data = request.data

        sid = transaction.savepoint()
        try:
            with transaction.atomic():

                link_domain = get_domain_url_link()
                link_domain = get_domain_url()
                logo_url = "{domain}/static/media/dxis_logo.png".format(domain=link_domain)

                datas = {
                    'logo_url': logo_url,
                    'description': data['description'] if data['description'] else ""
                }

                html_body = render_to_string('mail_state.html', datas)

                create_email_info = []

                for value in data["students"]:
                    create_email_info.append(
                        EmailInfo(
                            user_id = value,
                            message = html_body,
                            send_user_id = user.id,
                        )
                    )

                self.queryset.bulk_create(create_email_info)

                config = {
                    "email_password": user.employee.org.email_password,
                    "email_port": user.employee.org.email_port,
                    "email_host": user.employee.org.email_host,
                    "email_use_tsl": user.employee.org.email_use_tls,
                }

                for mail in data["email_list"]:
                    send_mail(
                        subject = 'Элсэлт',
                        message = 'Дотоод хэргийн их сургууль',
                        from_email = user.employee.org.email_host_user,
                        recipient_list = [mail],
                        connection = make_connection(user.employee.org.email_host_user, config),
                        html_message = html_body
                    )


        except Exception as e:
            print(e)
            transaction.savepoint_rollback(sid)
            return request.send_error("ERR_002", e.__str__)
        return request.send_info('INF_001')


@permission_classes([IsAuthenticated])
class AdmissionYearAPIView(
    generics.GenericAPIView,
    mixins.ListModelMixin,
):

    queryset = AdmissionRegister.objects.all()
    serializer_class = AdmissionSerializer

    def get(self, request):

        all_data = self.list(request).data

        return request.send_data(all_data)


@permission_classes([IsAuthenticated])
class AdmissionGpaAPIView(
    generics.GenericAPIView,
    mixins.UpdateModelMixin
):
    @transaction.atomic()
    def put(self, request, pk=None):

        data = request.data
        UserInfo.objects.update_or_create(
            id=pk,
            defaults=data,
        )

        return request.send_info("INF_002")


@permission_classes([IsAuthenticated])
class DashboardAPIView(
    generics.GenericAPIView
):
    """ Дашбоард мэдээлэл """

    queryset = AdmissionUserProfession.objects.all()
    def get(self, request):

        elselt = request.query_params.get('elselt')

        if elselt == 'all' or not elselt:
            admission_ids = AdmissionRegister.objects.all().values_list('id', flat=True)
        else:
            admission_ids = [elselt]

        queryset = self.queryset.annotate(gender=(Substr('user__register', 9, 1)))
        queryset = queryset.filter(profession__admission__in=admission_ids)
        all_student = queryset.count()
        male =  queryset.filter(gender__in=['1', '3', '5', '7', '9']).count()
        female =  queryset.filter(gender__in=['0', '2', '4', '6', '8']).count()
        bachelor = queryset.filter(profession__profession__degree__degree_code='D').count()
        master = queryset.filter(profession__profession__degree__degree_code='E').count()
        doctor = queryset.filter(profession__profession__degree__degree_code='F').count()

        # Аймгаар дотор нь хүйсээр нь ялгах
        female_qs = (
            queryset
                .filter(gender__in=['0', '2', '4', '6', '8'], user__aimag=OuterRef('user__aimag'))
                .annotate(count=Count("*"))
                .values("count")
        )
        female_qs.query.set_group_by()

        male_qs = (
            queryset
                .filter(gender__in=['1', '3', '5', '7', '9'], user__aimag=OuterRef('user__aimag'))
                .annotate(count=Count("*"))
                .values("count")
        )
        male_qs.query.set_group_by()

        aimag_subquery =Subquery(
            AimagHot.objects.filter(
                id=OuterRef('user__aimag')
            ).values('name')[:1]
        )

        aimag_queryset = queryset.annotate(name=aimag_subquery)

        aimag_values = (
            aimag_queryset
            .values('name')
            .annotate(
                total=Count("name"),
                male=Subquery(male_qs),
                female=Subquery(female_qs)
            )
            .order_by('name')
            .exclude(total=0)
            .values('name', 'total', 'male', 'female')
        )

        # Мэргэжлээр хүйсээр
        prof_query =Subquery(
            ProfessionDefinition.objects.filter(
                id=OuterRef('profession__profession')
            ).values('name')[:1]
        )

        prof_queryset = queryset.annotate(prof_name=prof_query)

        pfemale_qs = (
            queryset
                .filter(gender__in=['0', '2', '4', '6', '8'], profession=OuterRef('profession'))
                .annotate(count=Count("*"))
                .values("count")
        )
        pfemale_qs.query.set_group_by()

        pmale_qs = (
            queryset
                .filter(gender__in=['1', '3', '5', '7', '9'], profession=OuterRef('profession'))
                .annotate(count=Count("*"))
                .values("count")
        )
        pmale_qs.query.set_group_by()
        prof_values = (
            prof_queryset
            .values('prof_name')
            .annotate(
                total=Count("prof_name"),
                male=Subquery(pmale_qs),
                female=Subquery(pfemale_qs)
            )
            .order_by('prof_name')
            .exclude(total=0)
            .values('prof_name', 'total', 'male', 'female')
        )

        datas = {
            'all_student': all_student,
            'male': male,
            'female': female,
            'master': master,
            'doctor': doctor,
            'bachelor': bachelor,
            'haryalal': list(aimag_values),
            'profs': list(prof_values)
        }

        return request.send_data(datas)


@permission_classes([IsAuthenticated])
class ElseltDescApiView(
    generics.GenericAPIView
):
    """ Мэдээллийг шалгаад тайлбар оруулах """

    def put(self, request, pk=None):

        admisson_user = AdmissionUserProfession.objects.get(pk=pk)
        user = admisson_user.user.id

        with transaction.atomic():
            UserInfo.objects.filter(
                user=user
            ).update(
                **request.data
            )

        return request.send_info('INF_002')


@permission_classes([IsAuthenticated])
class ElseltHealthAnhanShat(
    generics.GenericAPIView,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.DestroyModelMixin
):

    queryset = AdmissionUserProfession.objects.all().order_by('created_at')

    serializer_class = HealthUserDataSerializer
    pagination_class = CustomPagination

    filter_backends = [SearchFilter]
    search_fields = ['user__first_name', 'user__first_name', 'user__register']

    def get_queryset(self):
        queryset = self.queryset
        queryset = queryset.annotate(gender=(Substr('user__register', 9, 1)))

        # Эрүүл мэндийн шалгуур үзүүлэлттэй мэргэжлүүд
        # TODO Одоогоор идэвхтэй байгаа элсэлтээс л харуулж байгаа гэсэн үг
        health_profession_ids = AdmissionIndicator.objects.filter(admission_prof__admission__is_active=True, value__in=[AdmissionIndicator.ERUUL_MEND]).values_list('admission_prof', flat=True)
        queryset = queryset.filter(profession__in=health_profession_ids)

        gender = self.request.query_params.get('gender')
        sorting = self.request.query_params.get('sorting')
        state  = self.request.query_params.get('state')

        # Ял шийтгэл, Насны үзүүлэлтүүдэд ТЭНЦЭЭГҮЙ элсэгчдийг хасах
        queryset = queryset.exclude(justice_state=AdmissionUserProfession.STATE_REJECT, age_state=AdmissionUserProfession.STATE_REJECT)

        if gender:
            if gender == 'Эрэгтэй':
                queryset = queryset.filter(gender__in=['1', '3', '5', '7', '9'])
            else:
                queryset = queryset.filter(gender__in=['0', '2', '4', '6', '8'])

        # Sort хийх үед ажиллана
        if sorting:
            if not isinstance(sorting, str):
                sorting = str(sorting)

            queryset = queryset.order_by(sorting)

        if state:
            user_id = HealthUser.objects.filter(state=state).values_list('user', flat=True)
            queryset = queryset.filter(user__in=user_id)

        return queryset

    def get(self, request, pk=None):

        if pk:
            all_data = self.retrieve(request, pk).data

            return request.send_data(all_data)

        all_data = self.list(request).data

        return request.send_data(all_data)


    @transaction.atomic
    def post(self, request):

        data = request.data
        serializer = HealthUserSerializer(data=data)
        data = null_to_none(data)

        if serializer.is_valid():

            serializer.save()
            return request.send_info('INF_001')

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


    @transaction.atomic
    def put(self, request, pk=None):

        data = request.data
        health_user = HealthUser.objects.filter(id=pk).first()
        serializer = HealthUserSerializer(health_user, data)

        if serializer.is_valid():

            serializer.save()
            return request.send_info('INF_002')

        else:
            error_obj = []
            print(serializer.errors)
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


    @transaction.atomic
    def delete(self, request, pk=None):

        self.destroy(request, pk)
        return request.send_info('INF_003')


@permission_classes([IsAuthenticated])
class ElseltHealthProfessional(
    generics.GenericAPIView,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.DestroyModelMixin
):

    queryset = HealthUser.objects.all().order_by('created_at')

    serializer_class = HealthUpUserInfoSerializer
    pagination_class = CustomPagination

    filter_backends = [SearchFilter]
    search_fields = ['user__first_name', 'user__first_name', 'user__register']

    def get_queryset(self):
        queryset = self.queryset
        queryset = queryset.annotate(gender=(Substr('user__register', 9, 1)))
        gender = self.request.query_params.get('gender')
        sorting = self.request.query_params.get('sorting')
        state  = self.request.query_params.get('state')

        queryset = queryset.filter(state=AdmissionUserProfession.STATE_APPROVE)

        if gender:
            if gender == 'Эрэгтэй':
                queryset = queryset.filter(gender__in=['1', '3', '5', '7', '9'])
            else:
                queryset = queryset.filter(gender__in=['0', '2', '4', '6', '8'])

        # Sort хийх үед ажиллана
        if sorting:
            if not isinstance(sorting, str):
                sorting = str(sorting)

            queryset = queryset.order_by(sorting)

        if state:
            if state == '1':
                user_id = HealthUpUser.objects.filter(Q(Q(state=2) | Q(state=3))).values_list('user', flat=True)
                queryset = queryset.filter(state=2).exclude(user_id__in=user_id)
            else:
                user_id = HealthUpUser.objects.filter(state=state).values_list('user', flat=True)
                queryset = queryset.filter(user__in=user_id)

        return queryset

    def get(self, request, pk=None):

        if pk:
            all_data = self.retrieve(request, pk).data

            return request.send_data(all_data)

        all_data = self.list(request).data

        return request.send_data(all_data)


    @transaction.atomic
    def post(self, request):

        data = request.data
        serializer = HealthUpUserSerializer(data=data)

        if serializer.is_valid():

            serializer.save()
            return request.send_info('INF_001')

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


    @transaction.atomic
    def put(self, request, pk=None):

        data = request.data
        health_user = HealthUpUser.objects.filter(id=pk).first()
        serializer = HealthUpUserSerializer(health_user, data)

        if serializer.is_valid():

            serializer.save()
            return request.send_info('INF_002')

        else:
            error_obj = []
            print(serializer.errors)
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


    @transaction.atomic
    def delete(self, request, pk=None):

        self.destroy(request, pk)
        return request.send_info('INF_003')

@permission_classes([IsAuthenticated])
class ElseltHealthPhysical(
    generics.GenericAPIView,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.DestroyModelMixin
):

    queryset = AdmissionUserProfession.objects.all().order_by('created_at')

    serializer_class = HealthPhysicalUserInfoSerializer
    physique_serializer_class = PhysqueUserSerializer
    pagination_class = CustomPagination

    filter_backends = [SearchFilter]
    search_fields = ['user__first_name', 'user__first_name', 'user__register']

    def get_queryset(self):
        queryset = self.queryset
        queryset = queryset.annotate(gender=(Substr('user__register', 9, 1)))

        # Бие бялдар шалгуур үзүүлэлттэй мэргэжлүүд
        # TODO Одоогоор идэвхтэй байгаа элсэлтээс л харуулж байгаа гэсэн үг Дараа жил яахыг үл мэднэ
        physical_profession_ids = AdmissionIndicator.objects.filter(admission_prof__admission__is_active=True, value__in=[AdmissionIndicator.BIE_BYALDAR]).values_list('admission_prof', flat=True)

        # Бие бялдар шалгуур үзүүлэлттэй мэргэжилд бүртгүүлсэн элсэгчид
        queryset = queryset.filter(profession__in=physical_profession_ids)

        sorting = self.request.query_params.get('sorting')
        state  = self.request.query_params.get('state')

        # Нарийн мэргэжлийн үзлэгт тэнцсэн хүүхдүүд бие бялдарын шалгалтад орно
        healt_user_ids = HealthUpUser.objects.filter(state=AdmissionUserProfession.STATE_APPROVE).values_list('user', flat=True)
        queryset = queryset.filter(age_state=AdmissionUserProfession.STATE_APPROVE, justice_state=AdmissionUserProfession.STATE_APPROVE, user__in=healt_user_ids)

        # Sort хийх үед ажиллана
        if sorting:
            if not isinstance(sorting, str):
                sorting = str(sorting)

            queryset = queryset.order_by(sorting)

        # Төлөвөөр хайхаар бол тухайн мэргэжлийн эмнэлгийн үзлэгийн төлөвөөс хайна
        if state:
            user_ids = HealthUpUser.objects.filter(state=state).values_list('user', flat=True)
            queryset = queryset.filter(user__in=user_ids)

        return queryset

    def get(self, request, pk=None):

        if pk:
            all_data = self.retrieve(request, pk).data

            return request.send_data(all_data)

        all_data = self.list(request).data

        return request.send_data(all_data)

    @transaction.atomic
    def post(self, request):

        new_serializer = None

        try:
            data = request.data
            sid = transaction.savepoint()

            serializer = self.physique_serializer_class(data=data)

            if not serializer.is_valid():
                transaction.savepoint_rollback(sid)
                return request.send_error_valid(serializer.errors)

            new_serializer = serializer.save()

        except Exception as e:
            print(e)
            return request.send_error('ERR_002', 'Хадгалахад алдаа гарлаа')

        return request.send_info('INF_001', new_serializer.id if new_serializer else '')


    @transaction.atomic
    def put(self, request, pk=None):

        try:
            if not pk:
                return request.send_error('ERR_005')

            data = request.data
            physque_user = PhysqueUser.objects.filter(id=pk).first()
            serializer = PhysqueUserSerializer(physque_user, data)

            if not serializer.is_valid(raise_exception=False):
                return request.send_error_valid(serializer.errors)

            serializer.save()

        except Exception as e:
            print(e)
            return request.send_error('ERR_002')

        return request.send_info("INF_002")


    @transaction.atomic
    def delete(self, request, pk=None):

        return request.send_info('INF_003')


 # -------------------Элсэгчдийн нарийн мэргэжилийн шатны эрүүл мэндийн үзлэг-------------------------#
class ElseltHealthPhysicalCreateAPIView(
    generics.GenericAPIView,
):

    queryset = HealthUpUser.objects.all()
    serializer_class = HealthUpUserSerializer

    @transaction.atomic
    def post(self, request):
        api_key = request.META.get('HTTP_X_API_KEY')
        # Манай гаргасан sha256
        data_to_verify = 'utility_solution'
        verification_hash = hashlib.sha256(data_to_verify.encode('utf-8')).hexdigest()

        if api_key and api_key == verification_hash:
            try:
                data = request.data
                user_register = data.get('user')

                try:
                    if not ElseltUser.objects.filter(register__iexact=user_register).exists():
                        return Response({'status': '404 Not Found', 'message': f'{user_register} регистрийн дугаартай тохирох хэрэглэгч олдсонгүй'}, status=status.HTTP_404_NOT_FOUND)
                    else:
                        user = ElseltUser.objects.filter(register__iexact=user_register).first()
                except ElseltUser.DoesNotExist:
                    return Response({'status': '404 Not Found', 'message': f'{user_register} регистрийн дугаартай тохирох хэрэглэгч олдсонгүй'}, status=status.HTTP_404_NOT_FOUND)

                data['user'] = user.id

                sid = transaction.savepoint()

                serializer = self.serializer_class(data=data)
                if not serializer.is_valid():
                    transaction.savepoint_rollback(sid)
                    return Response({'status': '400 Bad Request', 'message': 'Оруулсан өгөгдөл буруу байна'}, status=status.HTTP_400_BAD_REQUEST)

                serializer.save()
                transaction.savepoint_commit(sid)

            except Exception as e:
                print(e)
                return Response({'status': '500 Internal Server Error', 'message': 'Өгөгдлийн төрлөө шалгана уу'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            return Response({'status': '200 OK', 'message': 'Хүсэлт амжиллтай'}, status=status.HTTP_200_OK)
        else:
            return Response({'status': '403 Forbidden', 'message': 'API key буруу '}, status=status.HTTP_403_FORBIDDEN)


class ElseltStateApprove(
    generics.GenericAPIView,
    mixins.ListModelMixin,
    mixins.UpdateModelMixin,
):
    """ Элсэгч бүх шалгуурыг даваад тэнцсэн """

    queryset = AdmissionUserProfession
    serializer_class = ElseltApproveSerializer

    pagination_class = CustomPagination

    filter_backends = [SearchFilter]
    search_fields = ['user__first_name', 'user__last_name', 'user__register', 'profession__profession__name', 'admission_number', 'admission_date']

    def get_queryset(self):
        profession = self.request.query_params.get('profession')
        admission = self.request.query_params.get('admission')
        sorting = self.request.query_params.get('sorting')
        queryset = self.queryset.objects.filter(state=AdmissionUserProfession.STATE_APPROVE)

        if admission:
            queryset = queryset.filter(profession__admission=admission)

        if profession:
            queryset = queryset.filter(profession__profession__id=profession)

        # Sort хийх үед ажиллана
        if sorting:
            if not isinstance(sorting, str):
                sorting = str(sorting)

            queryset = queryset.order_by(sorting)

        return queryset

    def get(self, request):
        " тэнцсэн элсэгчидын жагсаалт "

        all_data = self.list(request).data
        return request.send_data(all_data)

    def post(self, request):
        " Тэнцсэн элсэгчдын тушаал шинээр үүсгэх нь "

        datas = request.data
        users = datas.get('id')                             # Элсэгч
        admission_date = datas.get('admission_date')        # Элсэлтийн тушаалын огноо
        admission_number = datas.get('admission_number')    # Элсэлтийн тушаалын дугаар

        with transaction.atomic():
            try:
                for user in users:
                    AdmissionUserProfession.objects.update_or_create(
                        id=user,
                        defaults={
                            "admission_number": admission_number,
                            "admission_date": admission_date
                        }
                    )

            except Exception as e:
                return request.send_error('ERR_002')

        return request.send_info('INF_001', "Амжилттай тушаал үүслээ")
