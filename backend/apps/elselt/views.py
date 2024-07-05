import hashlib
import datetime as dt
import requests
from itertools import groupby
from datetime import datetime, timedelta
from rest_framework import mixins
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes
from rest_framework.filters import SearchFilter
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.db import transaction
from django.db.models import F, Subquery, OuterRef, Count, Q
from django.db.models import Value, Case, When, IntegerField
from django.db.models.functions import Substr

from main.utils.function.utils import (
    json_load,
    find_gender,
    null_to_none,
    get_domain_url,
    make_connection,
    check_phone_number,
    get_domain_url_link,
    send_message_unitel,
    send_message_skytel,
    send_message_gmobile,
    send_message_mobicom,
    calculate_birthday,
)

from main.utils.function.pagination import CustomPagination
from main.decorators import login_required
from rest_framework.response import Response
from rest_framework import status


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
    HealthPhysicalUserInfoSerializer,
    GpaCheckUserInfoSerializer,
    GpaCheckConfirmUserInfoSerializer,
    EyeshCheckUserInfoSerializer,
    MessageInfoSerializer,
    HealthUpUserStateSerializer,
    ConversationUserInfoSerializer,
    ElseltEyeshSerializer,
    UserScoreSerializer,
    ConversationUserInfoSerializer,
    ArmyUserInfoSerializer
)

from elselt.models import (
    AdmissionUserProfession,
    UserInfo,
    ElseltUser,
    ContactInfo,
    EmailInfo,
    MessageInfo,
    HealthUser,
    PhysqueUser,
    HealthUpUser,
    AdmissionUserProfession,
    ConversationUser,
    UserScore,
    ConversationUser,
    ArmyUser,
    StateChangeLog,
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
        if elselt and elselt != 'undefined':
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
                                'norm1': hynaltToo.get('norm1') if hynaltToo.get('norm1') else 0,
                                'norm2': hynaltToo.get('norm2') if hynaltToo.get('norm2') else 0,
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
        now_state = self.request.query_params.get('now_state')
        gender = self.request.query_params.get('gender')
        sorting = self.request.query_params.get('sorting')
        gpa = self.request.query_params.get('gpa')
        justice_state = self.request.query_params.get('justice_state')
        is_justice = self.request.query_params.get('is_justice')

        if is_justice:
            justice_profession_ids = AdmissionIndicator.objects.filter(admission_prof__admission__is_active=True, value__in=[AdmissionIndicator.YAL_SHIITGEL]).values_list('admission_prof', flat=True)
            queryset = queryset.filter(profession__in=justice_profession_ids)

        if lesson_year_id:
            queryset = queryset.filter(profession__admission=lesson_year_id)

        if profession_id:
            queryset = queryset.filter(profession__profession__id=profession_id)

        if unit1_id:
            queryset = queryset.filter(user__aimag__id=unit1_id)

        if state:
            queryset = queryset.filter(state=state)

        if age_state:
            queryset = queryset.filter(age_state=age_state)

        if gpa_state:
            user_ids = UserInfo.objects.filter(gpa_state=gpa_state).values_list('user', flat=True)
            queryset = queryset.filter(user__in=user_ids)

        if justice_state:
            queryset = queryset.filter(justice_state=justice_state)

        # Дахин тэнцүүлсэн эсэх төлөвөөр хайх үед ажиллана.
        if now_state:
            user_ids = StateChangeLog.objects.filter(now_state=now_state, change_state=AdmissionUserProfession.STATE_APPROVE).values_list('user', flat=True)
            queryset = queryset.filter(user__in=user_ids)

        if gender:
            if gender == 'Эрэгтэй':
                queryset = queryset.filter(gender__in=['1', '3', '5', '7', '9'])
            else:
                queryset = queryset.filter(gender__in=['0', '2', '4', '6', '8'])
        if gpa:
            gpa_value = float(gpa)
            queryset = queryset.filter(gpa__lte = gpa_value)

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
            logged_user = request.user
            profession_id=data.get('profession')

            profession_name = ''

            if profession_id:

                professions= AdmissionUserProfession.objects.filter(profession=profession_id).first()
                profession_name= professions.profession.profession.name if professions else ''

            profession_change_log = StateChangeLog(
                user=instance.user,
                type=StateChangeLog.PROFESSION,
                now_profession=instance.profession.profession.name,
                change_profession= profession_name,
                updated_user=logged_user,
            )
            profession_change_log.save()

            serializer = AdmissionUserProfessionSerializer(instance, data=data, partial=True)
            if not serializer.is_valid(raise_exception=False):
                return request.send_error_valid(serializer.errors)

            serializer.save(updated_user=logged_user)

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
                students = self.queryset.filter(pk__in=data["students"])
                for student in students:
                    if data.get("state"):
                        old_state = student.state
                        student.state = data.get("state")
                        student.updated_at = now
                        student.state_description = data.get("state_description")
                        student.save()

                        StateChangeLog.objects.create(
                            user=student.user,
                            type=StateChangeLog.STATE,
                            now_state=old_state,
                            change_state=data.get("state"),
                            updated_user=request.user if request.user.is_authenticated else None,
                            updated_at=now
                        )
                    else:
                        old_justice_state = student.justice_state
                        student.updated_at = now
                        student.justice_state = data.get("justice_state")
                        student.justice_description = data.get("justice_description")
                        student.save()

                        StateChangeLog.objects.create(
                            user=student.user,
                            type=StateChangeLog.PROFESSION,
                            now_state=old_justice_state,
                            change_state=data.get("justice_state"),
                            updated_user=request.user if request.user.is_authenticated else None,
                            updated_at=now
                        )
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



class AdmissionYearAPIView(
    generics.GenericAPIView,
    mixins.ListModelMixin,
):

    queryset = AdmissionRegister.objects.all()
    serializer_class = AdmissionSerializer

    def get(self, request):

        all_data = self.list(request).data
        return request.send_data(all_data)

class AdmissionYearActiveAPIView(
    generics.GenericAPIView,
    mixins.ListModelMixin,
):

    queryset = AdmissionRegister.objects.all()
    serializer_class = AdmissionSerializer

    def get(self, request):
        "идэвхитэй элсэлт"

        self.queryset = self.queryset.filter(is_active=True)
        active_data = self.list(request).data
        return request.send_data(active_data)


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
            admission_ids = AdmissionRegister.objects.values_list('id', flat=True)
        else:
            admission_ids = [elselt]

        queryset = self.queryset.filter(profession__admission__in=admission_ids).annotate(
            gender=Substr('user__register', 9, 1)
        )

        all_student = queryset.count()
        male = queryset.filter(gender__in=['1', '3', '5', '7', '9']).count()
        female = queryset.filter(gender__in=['0', '2', '4', '6', '8']).count()
        bachelor = queryset.filter(profession__profession__degree__degree_code='D').count()
        master = queryset.filter(profession__profession__degree__degree_code='E').count()
        doctor = queryset.filter(profession__profession__degree__degree_code='F').count()

        aimag_values = queryset.values('user__aimag').annotate(
            name=Subquery(
                AimagHot.objects.filter(id=OuterRef('user__aimag')).values('name')[:1]
            ),
            total=Count('id'),
            male=Count('id', filter=Q(gender__in=['1', '3', '5', '7', '9'])),
            female=Count('id', filter=Q(gender__in=['0', '2', '4', '6', '8']))
        ).order_by('name').exclude(total=0).values('name', 'total', 'male', 'female')

        prof_values = queryset.values('profession__profession').annotate(
            prof_name=Subquery(
                ProfessionDefinition.objects.filter(id=OuterRef('profession__profession')).values('name')[:1]
            ),
            total=Count('id'),
            male=Count('id', filter=Q(gender__in=['1', '3', '5', '7', '9'])),
            female=Count('id', filter=Q(gender__in=['0', '2', '4', '6', '8']))
        ).order_by('prof_name').exclude(total=0).values('prof_name', 'total', 'male', 'female')

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
class DashboardExcelAPIView(
    generics.GenericAPIView
):
    """ Дашбоард тайлан """

    queryset = AdmissionUserProfession.objects.all()

    def get(self, request):
        # Profession Definition-ний id-г хадгална
        elselt = self.request.query_params.get('elselt')
        if elselt and elselt != 'all':
            self.queryset = self.queryset.filter(profession__admission=elselt)

        # Хурдан болгохын тулд шаардлагатай field-үүдэд select_related ашигласан
        profession_ids = self.queryset.values_list('profession__profession', flat=True).distinct()
        professions = ProfessionDefinition.objects.filter(id__in=profession_ids).select_related('school')

        # Үндсэн queryset дээрээ gender-ийг нь annotate хийж өгсөн
        queryset = self.queryset.annotate(
            last_char=Substr('user__register', 9, 1),
            gender=Case(
                # Сүүлийн бичлэгүүд нь ингэж төгссөн бол эмэгтэй
                When(Q(last_char__in=['0', '2', '4', '6', '8']), then=Value(2)),
                # Бусад нөхцлүүдэд default утга нь эрэгтэй
                default=Value(1),
                # Буцах утга нь int төрөлтэй байна
                output_field=IntegerField()
            )
        )

        # annotate хийж өгөх dynamic field-үүдээ хэтэрхий их байгаа учир энд зарлаж өгөв
        aggregations = {
            'total_male_users': Count('id', filter=Q(gender=1)),
            'total_female_users': Count('id', filter=Q(gender=2)),
            'age_state_true_male': Count('id', filter=Q(gender=1, age_state=AdmissionUserProfession.STATE_APPROVE)),
            'age_state_false_male': Count('id', filter=Q(gender=1, age_state=AdmissionUserProfession.STATE_REJECT)),
            'age_state_true_female': Count('id', filter=Q(gender=2, age_state=AdmissionUserProfession.STATE_APPROVE)),
            'age_state_false_female': Count('id', filter=Q(gender=2, age_state=AdmissionUserProfession.STATE_REJECT)),
            'gpa_state_true_male': Count('id', filter=Q(gender=1, gpa_state=AdmissionUserProfession.STATE_APPROVE)),
            'gpa_state_false_male': Count('id', filter=Q(gender=1, gpa_state=AdmissionUserProfession.STATE_REJECT)),
            'gpa_state_true_female': Count('id', filter=Q(gender=2, gpa_state=AdmissionUserProfession.STATE_APPROVE)),
            'gpa_state_false_female': Count('id', filter=Q(gender=2, gpa_state=AdmissionUserProfession.STATE_REJECT)),
            'health_user_true_male_users': Count('id', filter=Q(gender=1, user__healthuser__state=AdmissionUserProfession.STATE_APPROVE)),
            'health_user_true_female_users': Count('id', filter=Q(gender=2, user__healthuser__state=AdmissionUserProfession.STATE_APPROVE)),
            'health_user_false_male_users': Count('id', filter=Q(gender=1, user__healthuser__state=AdmissionUserProfession.STATE_REJECT)),
            'health_user_false_female_users': Count('id', filter=Q(gender=2, user__healthuser__state=AdmissionUserProfession.STATE_REJECT)),
            'health_user_send_male_users': Count('id', filter=Q(gender=1, user__healthuser__isnull=True)),
            'health_user_send_female_users': Count('id', filter=Q(gender=2, user__healthuser__isnull=True)),
            'health_up_user_true_male_users': Count('id', filter=Q(gender=1, user__healthupuser__state=AdmissionUserProfession.STATE_APPROVE)),
            'health_up_user_true_female_users': Count('id', filter=Q(gender=2, user__healthupuser__state=AdmissionUserProfession.STATE_APPROVE)),
            'health_up_user_false_male_users': Count('id', filter=Q(gender=1, user__healthupuser__state=AdmissionUserProfession.STATE_REJECT)),
            'health_up_user_false_female_users': Count('id', filter=Q(gender=2, user__healthupuser__state=AdmissionUserProfession.STATE_REJECT)),
            'health_up_user_out_male_users': Count('id', filter=Q(gender=1, user__healthupuser__isnull=True)),
            'health_up_user_out_female_users': Count('id', filter=Q(gender=2, user__healthupuser__isnull=True)),
            'justice_state_true_male': Count('id', filter=Q(gender=1, justice_state=AdmissionUserProfession.STATE_APPROVE)),
            'justice_state_true_female': Count('id', filter=Q(gender=2, justice_state=AdmissionUserProfession.STATE_APPROVE)),
            'justice_state_false_male': Count('id', filter=Q(gender=1, justice_state=AdmissionUserProfession.STATE_REJECT)),
            'justice_state_false_female': Count('id', filter=Q(gender=2, justice_state=AdmissionUserProfession.STATE_REJECT)),
            'physque_state_true_male': Count('id', filter=Q(gender=1, user__physqueuser__state=AdmissionUserProfession.STATE_APPROVE)),
            'physque_state_true_female': Count('id', filter=Q(gender=2, user__physqueuser__state=AdmissionUserProfession.STATE_APPROVE)),
            'physque_state_false_male': Count('id', filter=Q(gender=1, user__physqueuser__state=AdmissionUserProfession.STATE_REJECT)),
            'physque_state_false_female': Count('id', filter=Q(gender=2, user__physqueuser__state=AdmissionUserProfession.STATE_REJECT)),
            'physque_state_out_male': Count('id', filter=Q(gender=1, user__physqueuser__isnull=True)),
            'physque_state_out_female': Count('id', filter=Q(gender=2, user__physqueuser__isnull=True)),
        }

        # Бүх хөтөлбөрүүдээрээ үндсэн queryset-ээс авах датануудаас aggregate-үүдээ ашиглан авна
        # Ингэж ашиглавал элсэгч бүрээрээ for гүйлгэх биш хэдхэн хөтөлбөрүүдээрээ for гүйлгэж хурдтай болгоно
        profession_data = (
            # Датагаа хуваарьлаж өгөхөд бидэнд хөтөлбөрийн id-ууд хэрэгтэй
            queryset.values('profession__profession')
            .annotate(**aggregations)
            .values('profession__profession', 'total_male_users', 'total_female_users',
                    'age_state_true_male', 'age_state_false_male', 'age_state_true_female', 'age_state_false_female',
                    'gpa_state_true_male', 'gpa_state_false_male', 'gpa_state_true_female', 'gpa_state_false_female',
                    'health_user_true_male_users', 'health_user_true_female_users', 'health_user_false_male_users',
                    'health_user_false_female_users', 'health_user_send_male_users', 'health_user_send_female_users',
                    'health_up_user_true_male_users', 'health_up_user_true_female_users', 'health_up_user_false_male_users',
                    'health_up_user_false_female_users', 'health_up_user_out_male_users', 'health_up_user_out_female_users',
                    'justice_state_true_male', 'justice_state_true_female', 'justice_state_false_male',
                    'justice_state_false_female', 'physque_state_true_male', 'physque_state_true_female',
                    'physque_state_false_male', 'physque_state_false_female', 'physque_state_out_male', 'physque_state_out_female')
        )

        # Үндсэн хөтөлбөрийн мэдээллүүддээр хөтөлбөрийн нэр болон салбар сургуулийн нэр нэмэгдэж орсон
        profession_info = {p.id: {'profession': p.name, 'suborg': p.school.name} for p in professions}

        # Буцаах өгөгдөлөө бэлдэж байна
        result = list()
        # annotate хийсэн дата дотроо loop гүйлгээд
        for data in profession_data:
            # хөтөлбөрийн id-г нь аваад
            profession_id = data['profession__profession']
            # Тухайн id-д нь тохирох датаг нь хадгалаад
            profession_info[profession_id].update(data)
            # Сүүлд нь result дотроо тус key-гийн датаг хадгална
            result.append(profession_info[profession_id])

        return request.send_data(result)


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
        queryset = queryset.annotate(
            gender=(Substr('user__register', 9, 1)),
            user_email=F("user__email"),
            degree_name=F("profession__profession__degree__degree_name"),
            profession_name=F("profession__profession__name"),
        )

        # Эрүүл мэндийн шалгуур үзүүлэлттэй мэргэжлүүд
        # TODO Одоогоор идэвхтэй байгаа элсэлтээс л харуулж байгаа гэсэн үг
        health_profession_ids = AdmissionIndicator.objects.filter(admission_prof__admission__is_active=True, value__in=[AdmissionIndicator.ERUUL_MEND]).values_list('admission_prof', flat=True)
        queryset = queryset.filter(profession__in=health_profession_ids)

        gender = self.request.query_params.get('gender')
        sorting = self.request.query_params.get('sorting')
        state  = self.request.query_params.get('state')
        elselt = self.request.query_params.get('elselt')
        profession = self.request.query_params.get('profession')
        start_date=self.request.query_params.get('start_date')
        end_date=self.request.query_params.get('end_date')


        # Ял шийтгэл, Насны үзүүлэлтүүдэд ТЭНЦЭЭГҮЙ элсэгчдийг хасах
        queryset = queryset.exclude(age_state=AdmissionUserProfession.STATE_REJECT, gpa_state=AdmissionUserProfession.STATE_REJECT, state__in=[AdmissionUserProfession.STATE_REJECT, AdmissionUserProfession.STATE_APPROVE])
        if gender:
            if gender == 'Эрэгтэй':
                queryset = queryset.filter(gender__in=['1', '3', '5', '7', '9'])
            else:
                queryset = queryset.filter(gender__in=['0', '2', '4', '6', '8'])

        # элсэлт
        if elselt:
            queryset = queryset.filter(profession__admission=elselt)

        # хөтөлбөр
        if profession:
            queryset = queryset.filter(profession=profession)

        # Sort хийх үед ажиллана
        if sorting:
            if not isinstance(sorting, str):
                sorting = str(sorting)

            queryset = queryset.order_by(sorting)

        filters = {}
        if start_date:
            filters['updated_at__gte'] = start_date
        if end_date:
            filters['updated_at__lte'] = end_date

        if filters:
            dates = HealthUser.objects.filter(**filters).values_list('user', flat=True)
            queryset = queryset.filter(user__in=dates)
            return queryset

        if state:
            if state == '1':
                exclude_ids = HealthUser.objects.filter(Q(Q(state=AdmissionUserProfession.STATE_APPROVE) | Q(state=AdmissionUserProfession.STATE_REJECT))).values_list('user', flat=True)
                user_id = AdmissionUserProfession.objects.exclude(user__in=exclude_ids).values_list('user', flat=True)
            else:
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
        user = data.get('user').get('id')

        if 'user' in data:
            del data['user']

        data['user'] = user

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
        user = data.get('user').get('id')

        if 'user' in data:
            del data['user']

        data['user'] = user

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
        admission = self.request.query_params.get("lesson_year_id")
        profession = self.request.query_params.get('profession_id')

        # Анхан шат тэнцсэн хэрэглэгчид
        anhan_shat_ids = HealthUser.objects.filter(state=AdmissionUserProfession.STATE_APPROVE).values_list('user', flat=True)
        queryset = queryset.filter(user__in=anhan_shat_ids)

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

        if admission:
            queryset = queryset.filter(
                user__admissionuserprofession__profession__admission__id=admission
            )

        if profession:
            queryset = queryset.filter(
                user__admissionuserprofession__profession__profession=profession
            )


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
        data['updated_user'] = request.user.id

        if health_user:
            # төлөв солих үед ажиллах serializer
            serializer_state = HealthUpUserStateSerializer(health_user, data)

            if serializer_state.is_valid():
                serializer_state.save()
            return request.send_info('INF_013')

        if serializer.is_valid():

            serializer.save()
            return request.send_info('INF_002')

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
        elselt = self.request.query_params.get('elselt')
        profession = self.request.query_params.get('profession')

        # Нарийн мэргэжлийн үзлэгт тэнцсэн хүүхдүүд бие бялдарын шалгалтад орно
        healt_user_ids = HealthUpUser.objects.filter(state=AdmissionUserProfession.STATE_APPROVE).values_list('user', flat=True)
        queryset = queryset.filter(user__in=healt_user_ids)

        # элсэлт
        if elselt:
            queryset = queryset.filter(profession__admission=elselt)

        # хөтөлбөр
        if profession:
            queryset = queryset.filter(profession__profession__id=profession)

        # Sort хийх үед ажиллана
        if sorting:
            if not isinstance(sorting, str):
                sorting = str(sorting)

            queryset = queryset.order_by(sorting)

        if state:
            if state == '1':
                user_id = HealthUpUser.objects.filter(state=2).values_list('user', flat=True)
                exclude_ids = PhysqueUser.objects.filter(state__in=[AdmissionUserProfession.STATE_APPROVE, AdmissionUserProfession.STATE_REJECT]).values_list('user', flat=True)
                queryset = queryset.filter(user_id__in=user_id).exclude(user__in=exclude_ids)
            else:
                user_id = PhysqueUser.objects.filter(state=state).values_list('user', flat=True)
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
        sid = transaction.savepoint()
        new_serializer = None
        data = request.data
        user = data.get('user').get('id')
        if 'user' in data:
            del data['user']

        data['user'] = user
        try:
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

        data = request.data
        user = data.get('user').get('id')
        if 'user' in data:
            del data['user']

        data['user'] = user
        try:
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

                # Өмнө нь бүртгүүлсэн бол update хийнэ
                if self.queryset.filter(user=user).exists():
                    instance = self.queryset.filter(user=user).first()
                    serializer = self.serializer_class(instance=instance, data=data, partial=True)
                else:
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


class GpaCheckUserInfoAPIView(
 generics.GenericAPIView,
    mixins.RetrieveModelMixin,
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    mixins.UpdateModelMixin
):
    ''' Голч шалгах API '''

    queryset = AdmissionUserProfession.objects.all().order_by('created_at')
    serializer_class = GpaCheckUserInfoSerializer

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

        if lesson_year_id:
            queryset = queryset.filter(profession__admission=lesson_year_id)

        if profession_id:
            queryset = queryset.filter(profession__profession__id=profession_id)


        return queryset

    def get(self, request, pk=None):
        limit = self.request.query_params.get('limit')
        if pk:
            all_data = self.retrieve(request, pk).data
            return request.send_data(all_data)

        # Бүртгүүлэгчийн голч created_at аар эрэмбэлэх
        queryset = self.get_queryset().order_by('-gpa','created_at')
        serializer = GpaCheckUserInfoSerializer(queryset, many=True)
        data = serializer.data
        if limit:
            limit = int(limit)

            # орж ирсэн тоогоор датаг ангилах
            data= data[limit:]
            for entry in data:
                gpa = entry.get('userinfo', {}).get('gpa')

                # Бүртгүүлэгчийн голч  оруулсан голчоос бага эсэхийг шалгаж төлөвийн өөрчилж харуулах
                if gpa is not None and float(gpa) < float(self.request.query_params.get('gpa', 0)):
                    entry['gpa_description'] = "Голч оноо хүрээгүй"
                else:
                    entry['gpa_description'] = "Хяналтын тоонд багтаагүй"

        return request.send_data(data)


class GpaCheckConfirmUserInfoAPIView(
    generics.GenericAPIView,
    mixins.RetrieveModelMixin,
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    mixins.UpdateModelMixin
):
    """ Төлөв хадгалах API """

    queryset = AdmissionUserProfession.objects.all().order_by('created_at')

    serializer_class = GpaCheckConfirmUserInfoSerializer

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

        if lesson_year_id:
            queryset = queryset.filter(profession__admission=lesson_year_id)

        if profession_id:
            queryset = queryset.filter(profession__profession__id=profession_id)

        return queryset

    def get(self, request, pk=None):
        limit = self.request.query_params.get('limit')
        if pk:
            all_data = self.retrieve(request, pk).data
            return request.send_data(all_data)

        queryset = self.get_queryset().order_by('-gpa', 'created_at')
        serializer = GpaCheckUserInfoSerializer(queryset, many=True)
        data = serializer.data
        if limit:
            limit = int(limit)

            # Тоонд багтсан дата
            confirmed_data = data[:limit]

            # Тоонд багтаагүй дата
            unconfirmed_data = data[limit:]
            with transaction.atomic():

                # Тэнцээгүй элсэгчдийг төлөв өөрчлөх loop
                for entry in unconfirmed_data:
                    gpa = entry.get('userinfo', {}).get('gpa', 0)
                    if float(gpa) < float(self.request.query_params.get('gpa', 0)):
                        entry['gpa_state'] = AdmissionUserProfession.STATE_REJECT
                        entry['gpa_description'] = "Голч оноо хүрээгүй"
                        entry['state'] = AdmissionUserProfession.STATE_REJECT
                    else :
                        entry['gpa_state'] = AdmissionUserProfession.STATE_REJECT
                        entry['gpa_description'] = "Хяналтын тоонд багтаагүй"
                        entry['state'] = AdmissionUserProfession.STATE_REJECT

                    # Өөрчилсөн төлөвийг хадгалах
                    obj = AdmissionUserProfession.objects.get(pk=entry['id'])
                    obj.gpa_state = entry['gpa_state']
                    obj.definition = entry['gpa_description']
                    obj.state = entry['state']
                    obj.save()

                # Тэнцсэн элсэгчдийг төлөв өөрчлөх loop
                for entry in confirmed_data:
                    obj = AdmissionUserProfession.objects.get(pk=entry['id'])
                    obj.gpa_state = AdmissionUserProfession.STATE_APPROVE
                    obj.save()

            return request.send_info('INF_002')
        else:
            return request.send_error('ERR_001')



class EyeshCheckUserInfoAPIView(
    generics.GenericAPIView,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
):

    queryset = AdmissionUserProfession.objects.all().order_by('created_at')

    serializer_class = EyeshCheckUserInfoSerializer

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

        if lesson_year_id:
            queryset = queryset.filter(profession__admission=lesson_year_id)

        if profession_id:
            queryset = queryset.filter(profession__profession__id=profession_id)


        return queryset

    def get(self, request, pk=None):
        limit = self.request.query_params.get('limit')
        if pk:

            all_data = self.retrieve(request, pk).data

            return request.send_data(all_data)

        all_data = self.list(request).data
        all_data.sort(key=lambda x: x.get('eesh_check', 0),reverse=True)
        if limit:
            limit = int(limit)
            all_data = all_data[limit:]

        return request.send_data(all_data)


class AdmissionUserMessageAPIView(
    generics.GenericAPIView,
    mixins.ListModelMixin
):

    queryset = MessageInfo.objects.all().order_by('send_date')
    serializer_class = MessageInfoSerializer

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
        with transaction.atomic():
            try:
                create_email_info = []
                # Элсэгчдийн утасны дугаар
                phone_numbers = data.get('phone_numbers')
                # Үүрэн холбоогоор нь ангилсан дугаарнууд
                typed_phonenumbers = check_phone_number(phone_numbers)

                all_success_count = 0

                # Нийт дугаарыг үүрэн холбоогоор нь ялгаж мессеж илгээх
                for key, value in typed_phonenumbers.items():
                    if key == 'mobicom':
                        success_mobi, msg, success_count, not_found_numbers = send_message_mobicom(value, data.get('description'))
                        all_success_count = all_success_count + success_count

                    if key == 'skytel':
                        success_sky, msg, success_count_s, not_found_numbers = send_message_skytel(value, data.get('description'))
                        all_success_count = all_success_count + success_count_s

                    if key == 'unitel':
                        success_uni, msg, success_count_u, not_found_numbers = send_message_unitel(value, data.get('description'))
                        all_success_count = all_success_count + success_count_u

                    if key == 'gmobile':
                        success_g, msg, success_count_g, not_found_numbers = send_message_gmobile(value, data.get('description'))
                        all_success_count = all_success_count + success_count_g

                # Мессеж үүсгэх элсэгч бүр дээр
                for value in data["students"]:
                    create_email_info.append(
                        MessageInfo(
                            user_id = value,
                            message = data.get('description'),
                            send_user_id = user.id,
                        )
                    )

                self.queryset.bulk_create(create_email_info)

            except Exception as e:
                print(e)
                transaction.savepoint_rollback(sid)
                return request.send_error("ERR_002")

        return request.send_info('INF_001')


@permission_classes([IsAuthenticated])
class AdmissionJusticeListAPIView(
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

        elselt = self.request.query_params.get('elselt')
        profession = self.request.query_params.get('profession')
        state = self.request.query_params.get('state')
        sorting = self.request.query_params.get('sorting')

        # Сэтгэлзүйн сорилд тэнцсэн элсэгчид
        healt_user_ids = ConversationUser.objects.filter(Q(Q(state=ConversationUser.STATE_APPROVE) | Q(state=ConversationUser.STATE_CONDIITON))).values_list('user', flat=True)
        queryset = queryset.filter(user__in=healt_user_ids)

        if elselt:
            queryset = queryset.filter(profession__admission=elselt)

        if profession:
            queryset = queryset.filter(profession__profession__id=profession)

        if state:
            if state == '1':
                exclude_ids = PhysqueUser.objects.filter(Q(Q(state=AdmissionUserProfession.STATE_APPROVE) | Q(state=AdmissionUserProfession.STATE_REJECT))).values_list('user', flat=True)
                user_id = AdmissionUserProfession.objects.filter(state=state).exclude(user__in=exclude_ids).values_list('user', flat=True)
            else:
                user_id = PhysqueUser.objects.filter(state=state).values_list('user', flat=True)

            queryset = queryset.filter(user__in=user_id)

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

class ConversationUserSerializerAPIView(
    generics.GenericAPIView,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.DestroyModelMixin):

    queryset = AdmissionUserProfession.objects.all().order_by('created_at')
    serializer_class = ConversationUserInfoSerializer

    pagination_class = CustomPagination

    filter_backends = [SearchFilter]
    search_fields = ['user__first_name', 'user__register', 'user__email', 'user__last_name', 'user__mobile']

    def get_queryset(self):
        queryset = self.queryset

        sorting = self.request.query_params.get('sorting')
        state = self.request.query_params.get('state')
        elselt = self.request.query_params.get('elselt')
        profession = self.request.query_params.get('profession')

        # Бие бялдарт тэнцсэн элсэгчид
        biy_byldar_ids = PhysqueUser.objects.filter(state=AdmissionUserProfession.STATE_APPROVE).values_list('user',flat=True)
        queryset = queryset.filter(user__in=biy_byldar_ids)

        # Sort хийх үед ажиллана
        if sorting:
            if not isinstance(sorting, str):
                sorting = str(sorting)

            queryset = queryset.order_by(sorting)

        if elselt:
            queryset = queryset.filter(user__admissionuserprofession__profession__admission=elselt)

        if profession:
            queryset = queryset.filter(
                user__admissionuserprofession__profession__profession=profession
            )

        if state:
            if state == '1':
                exclude_ids = ConversationUser.objects.filter(Q(Q(state=AdmissionUserProfession.STATE_APPROVE) | Q(state=AdmissionUserProfession.STATE_REJECT))).values_list('user', flat=True)
                user_id = AdmissionUserProfession.objects.filter(state=state).exclude(user__in=exclude_ids).values_list('user', flat=True)
            else:
                user_id = ConversationUser.objects.filter(state=state).values_list('user', flat=True)

            queryset = queryset.filter(user__in=user_id)


        return queryset

    def get(self, request, pk=None):

        if pk:
            all_data = self.retrieve(request, pk).data
            return request.send_data(all_data)

        all_data = self.list(request).data
        return request.send_data(all_data)

    def post(self, request):

        data = request.data
        try:
            data['user'] = ElseltUser.objects.get(pk=data.get('user'))
            ConversationUser.objects.create(**data)
        except Exception as e:
            print(e)
            return request.send_error('ERR_002', 'Хадгалахад алдаа гарлаа')

        return request.send_info('INF_001')

    def put(self, request,pk=None):

        data = request.data
        with transaction.atomic():
            now = dt.datetime.now()
            ConversationUser.objects.filter(
               user=data.get('user')
            ).update(state=data.get("state"),updated_at=now,description=data.get("description"))

        return request.send_info('INF_002')

class ArmyUserSerializerAPView(
    generics.GenericAPIView,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.DestroyModelMixin):

    queryset = AdmissionUserProfession.objects.all().order_by('created_at')
    serializer_class = ArmyUserInfoSerializer

    pagination_class = CustomPagination

    filter_backends = [SearchFilter]
    search_fields = ['user__first_name', 'user__register', 'user__email', 'user__last_name', 'user__mobile']

    def get_queryset(self):
        queryset = self.queryset

        sorting = self.request.query_params.get('sorting')
        state = self.request.query_params.get('state')
        elselt = self.request.query_params.get('elselt')
        profession = self.request.query_params.get('profession')

        # Ял шийтгэлд тэнцсэн элсэгчид
        yl_shiitgel_ids = AdmissionUserProfession.objects.filter(justice_state=AdmissionUserProfession.STATE_APPROVE).values_list('user',flat=True)

        queryset = queryset.filter(user__in=yl_shiitgel_ids)

        # # Sort хийх үед ажиллана
        if sorting:
            if not isinstance(sorting, str):
                sorting = str(sorting)

            queryset = queryset.order_by(sorting)

        if elselt:
            queryset = queryset.filter(user__admissionuserprofession__profession__admission=elselt)

        if profession:
            queryset = queryset.filter(
                user__admissionuserprofession__profession__profession=profession
            )

        if state:
            if state == '1':
                exclude_ids = ArmyUser.objects.filter(Q(Q(state=AdmissionUserProfession.STATE_APPROVE) | Q(state=AdmissionUserProfession.STATE_REJECT))).values_list('user', flat=True)
                user_id = AdmissionUserProfession.objects.filter(justice_state=AdmissionUserProfession.STATE_APPROVE).exclude(user__in=exclude_ids).values_list('user', flat=True)
            else:
                user_id = ArmyUser.objects.filter(state=state).values_list('user', flat=True)

            queryset = queryset.filter(user__in=user_id)


        return queryset

    def get(self, request, pk=None):

        if pk:
            all_data = self.retrieve(request, pk).data
            return request.send_data(all_data)

        all_data = self.list(request).data
        return request.send_data(all_data)

    def post(self, request):

        data = request.data
        try:
            data['user'] = ElseltUser.objects.get(pk=data.get('user'))
            ArmyUser.objects.create(**data)
        except Exception as e:
            print(e)
            return request.send_error('ERR_002', 'Хадгалахад алдаа гарлаа')

        return request.send_info('INF_001')

    def put(self, request,pk=None):

        data = request.data
        with transaction.atomic():
            now = dt.datetime.now()
            ArmyUser.objects.filter(
            user=data.get('user')
            ).update(state=data.get("state"),updated_at=now,description=data.get("description"))

        return request.send_info('INF_002')

class ElseltEyeshAPIView(
    generics.GenericAPIView,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.DestroyModelMixin
):
    """ Элсэгчийн ЭЕШ ийн оноо татах """

    BLOCKCHAIN_API_TOKEN = ''

    queryset = AdmissionUserProfession.objects.all()
    serializer_class = ElseltEyeshSerializer

    def refresh_token(self):
        token_url = 'http://blockchain.eec.mn/api/v1/auth'

        # TODO elselt_setting гэдэг модел дээр хадгалаастай байгаа тэндээс уншина.
        data = {
            "password": "a05TeVRnOUxOTUQ2",
            "username": "info@uia.gov.mn"
        }
        response = requests.post(token_url, data=data)
        response.raise_for_status()
        new_token = response.json().get('data').get('token')
        if new_token:
            self.BLOCKCHAIN_API_TOKEN = new_token
            return new_token

    def get_data(self, data):
        all_data = []
        data_url = 'http://blockchain.eec.mn/api/v1/student'
        headers = {}

        for item in data:
            params = {'registerNo': item}
            response = requests.get(data_url, params=params, headers=headers)

            if response.status_code == 401:
                new_token = self.refresh_token()
                if new_token:
                    headers['Authorization'] = f'Bearer {new_token}'
                    response = requests.get(data_url, params=params, headers=headers)
                else:
                    print("Failed to refresh token or obtain new token.")
                    return None
            try:
                response.raise_for_status()
                data = response.json()
                if data['status']:
                    all_data.append(data)
            except requests.exceptions.RequestException as e:
                print(f"An error occurred while calling the external API: {e}")
                return None
        return all_data

    def extract_lesson(self, external_data):

        #external_data орж ирж буй бүх хүүхдийн эеш
        data = []

        for student in external_data:
            #Хэрэгтэй датаг авах
            student_data = student.get('data', {})

            #Тухайн сурагч бүрийн регистр авах
            register_no = student_data.get('registerNo')
            user_instance = ElseltUser.objects.filter(register__iexact=register_no).first()
            pupil_data = student_data.get('pupil', [])

            for pupil in pupil_data:
                exams = pupil.get('pupilExam', [])

                for exam in exams:
                    # lesson_id = exam.get('lessonId')
                    scaledScore = exam.get('scaledScore')
                    percentage_score = exam.get('percentageScore')
                    lesson_name = exam.get('lessonName')
                    raw_score = exam.get('rawScore')
                    word_score = exam.get('wordScore')
                    exam_loc = pupil.get('examLoc')
                    exam_loc_code = pupil.get('examLocCode')
                    school_name = pupil.get('schoolName')
                    semester = pupil.get('semester')
                    school_code = pupil.get('schoolCode')
                    year = pupil.get('year')

                    # exam датаг data - д хадгалах
                    data.append({
                        'user_id':user_instance.id,
                        'lesson_name': lesson_name,
                        'scaledScore': scaledScore,
                        'percentage_score': percentage_score,
                        'raw_score': raw_score,
                        'word_score': word_score,
                        'exam_loc': exam_loc,
                        'exam_loc_code': exam_loc_code,
                        'school_name': school_name,
                        'semester': semester,
                        'school_code': school_code,
                        'year': year
                    })
        return data

    def get(self, request):
        profession = request.query_params.get('profession')
        elselt = request.query_params.get('elselt')
        queryset = self.queryset

        if elselt:
            queryset = queryset.filter(profession__admission=elselt)
        if profession:
            queryset = queryset.filter(profession=profession)

        bulk_update_datas = []

        #регистрээр нь шүүх
        datas = queryset.values_list('user__register', flat=True)

        #Шүүсэн датаг http://blockchain.eec.mn/api/v1/student луу явуулах функц
        datas = self.get_data(datas)

        #base -d хадгалах функц
        extracted_data = self.extract_lesson(datas)

        try:
            with transaction.atomic():
                update_data_list = []
                for data in extracted_data:
                    user_id = data['user_id']
                    lesson_name = data['lesson_name']
                    year = data['year']
                    semester = data['semester']

                    # UserScore instance байгаа үгүйг шалгана
                    existing_user_score = UserScore.objects.filter(
                        Q(user_id=user_id) & Q(lesson_name=lesson_name) & Q(year = year) & Q(semester=semester)
                    ).first()

                    # Хэрэв оноо байх үед
                    if existing_user_score:
                        existing_user_score.scaledScore = data['scaledScore']
                        existing_user_score.percentage_score = data['percentage_score']
                        existing_user_score.raw_score = data['raw_score']
                        existing_user_score.word_score = data['word_score']
                        existing_user_score.exam_loc = data['exam_loc']
                        existing_user_score.exam_loc_code = data['exam_loc_code']
                        existing_user_score.school_name = data['school_name']
                        existing_user_score.semester = data['semester']
                        existing_user_score.school_code = data['school_code']
                        existing_user_score.year = data['year']
                        update_data_list.append(existing_user_score)
                    else:
                    # Шинэ OBJECT үүсгэх
                        bulk_update_datas.append(UserScore(**data))

                # Bulk Шинэ OBJECT үүсгэх
                UserScore.objects.bulk_create(bulk_update_datas)

                # Bulk update existing instances
                UserScore.objects.bulk_update(update_data_list, [
                    'scaledScore', 'percentage_score', 'raw_score', 'word_score',
                    'exam_loc', 'exam_loc_code', 'school_name', 'school_code'
                ])

            #UserScore бүх датаг UserScoreSerializer ашиглан датаг авна
            all_datas = UserScore.objects.filter(user__admissionuserprofession__profession = profession)

            return_datas = UserScoreSerializer(all_datas, many=True).data

        except Exception as e:
            return Response({'error': str(e)}, status=500)

        #is_success false үед тэнцээгүй сурагчдын төлөвийг өөрчилж хадгалах
        failed_entries = [item for item in return_datas if not item['is_success']]

        with transaction.atomic():
            for item in failed_entries:
                user_id = item['user']
                admission_user_data = AdmissionUserProfession.objects.get(user__id=user_id)
                admission_user_data.state = AdmissionUserProfession.STATE_REJECT
                admission_user_data.state_description = 'Монгол хэл бичигийн шалгалтанд тэнцээгүй'
                admission_user_data.yesh_state = AdmissionUserProfession.STATE_REJECT
                admission_user_data.yesh_description = 'Монгол хэл бичигийн шалгалтанд тэнцээгүй'
                admission_user_data.save()

        return request.send_data(return_datas)