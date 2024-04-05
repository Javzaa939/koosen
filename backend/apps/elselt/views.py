from rest_framework import mixins
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes
from rest_framework.filters import SearchFilter

from django.core.mail import send_mail
from django.core.mail import send_mass_mail
from django.template.loader import render_to_string
from django.db import transaction
from django.db.models import F, Subquery, OuterRef, Count
from django.db.models.functions import Substr

from main.utils.function.utils import json_load, make_connection, get_domain_url_link, get_domain_url
from main.utils.function.pagination import CustomPagination
from main.decorators import login_required

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
    HealthUserDataSerializer
)

from elselt.models import (
    AdmissionUserProfession,
    UserInfo,
    ElseltUser,
    ContactInfo,
    EmailInfo,
    HealthUser
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

    queryset = AdmissionUserProfession.objects.all().order_by('created_at')

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

        lesson_year_id = self.request.query_params.get('lesson_year_id')
        profession_id = self.request.query_params.get('profession_id')
        unit1_id = self.request.query_params.get('unit1_id')
        state = self.request.query_params.get('state')
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
                        message = 'Элсэлтийн дүн гарлаа',
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
    search_fields = ['full_name', 'user_register']

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
