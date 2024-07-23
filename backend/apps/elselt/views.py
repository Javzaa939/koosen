import hashlib
import datetime as dt
import requests
from collections import Counter

from rest_framework import mixins
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes
from rest_framework.filters import SearchFilter
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.db import transaction
from django.db.models import F, Subquery, OuterRef, Count, Q, Sum, Exists
from django.db.models import Value, Case, When, IntegerField
from django.db.models.functions import Substr, Cast

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
    AimagHot,
    AdmissionLesson,
    AdmissionBottomScore
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
    ArmyUserInfoSerializer,
    StateChangeLogInfoSerializer,
    EyeshOrderUserInfoSerializer,
    ElseltEyeshSerializer,
    UserScoreSerializer,
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
    ArmyUser,
    StateChangeLog,
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
    search_fields = ['user__first_name', 'user__register', 'user__email', 'gpa', 'org', 'user__code', 'user__last_name', 'user__mobile']

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
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')

        # Бүртгүүлсэн огноогоор хайх хэсэг
        filters = {}
        if start_date:
            filters['user__created__gte'] = start_date
        if end_date:
            filters['user__created__lte'] = end_date

        if filters:
            queryset = queryset.filter(**filters)

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
            user_ids = StateChangeLog.objects.filter(now_state=now_state, change_state=AdmissionUserProfession.STATE_APPROVE, type=StateChangeLog.STATE).values_list('user', flat=True)
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

            professions= AdmissionUserProfession.objects.filter(profession=profession_id).first()
            profession_name= professions.profession.profession.name if professions else ''

            serializer = AdmissionUserProfessionSerializer(instance, data=data, partial=True)
            if not serializer.is_valid(raise_exception=False):
                return request.send_error_valid(serializer.errors)

            serializer.save(updated_user=logged_user)
            profession_change_log = StateChangeLog(
                user=instance.user,
                type=StateChangeLog.PROFESSION,
                now_profession=instance.profession.profession.name,
                change_profession= profession_name,
                now_state=AdmissionUserProfession.STATE_SEND,
                change_state=AdmissionUserProfession.STATE_SEND,
                updated_user=logged_user,
            )
            profession_change_log.save()

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
                    if student.state != eval(data.get("state")):
                        StateChangeLog.objects.create(
                            user=student.user,
                            type=StateChangeLog.STATE,
                            indicator=AdmissionIndicator.TENTSSEN_ELSEGCHID,
                            now_state=student.state,
                            change_state=data.get("state"),
                            updated_user=request.user if request.user.is_authenticated else None,
                            updated_at=now
                        )

                self.queryset.filter(pk__in=data["students"]).update(
                    state=data.get("state"),
                    state_description=data.get("state_description")
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
        start_date=self.request.query_params.get('start_date')
        end_date=self.request.query_params.get('end_date')

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

        filters = {}
        if start_date:
            filters['send_date__gte'] = start_date
        if end_date:
            filters['send_date__lte'] = end_date

        if filters:
            queryset = queryset.filter(**filters)

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
        profession_ids = self.queryset.values_list('profession__profession', flat=True).distinct('profession__profession')
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

        # AdmissionRegisterProfession-ий ID-г мэргэжилүүддээ тохируулан авна
        admission_register_profession_ids = AdmissionRegisterProfession.objects.filter(
            profession__in=professions
        ).values_list('id', flat=True)

        # AdmissionRegisterProfession-ий ID-г ашиглан AdmissionIndicator-уудыг олно
        admission_indicators = AdmissionIndicator.objects.filter(
            admission_prof__in=admission_register_profession_ids
        )

        # Хяналтын тоонуудын өгөгдлүүдийг олж авсан мэргэжилийн индикатороо ашиглан авна
        admission_xyanlat_too = AdmissionXyanaltToo.objects.filter(
            indicator__in=admission_indicators
        ).values(
            'norm_all',
            'norm1',
            'norm2',
            'indicator__admission_prof'
        )

        # Хяналтын тоонуудыг aggregate хийх case-үүдийг хадгалах list-үүд
        xyanalt_male_cases = []
        xyanalt_female_cases = []
        xyanalt_all_cases = []

        # AdmissionIndicator-ийн admission_prof-ийн id-нь манай үндсэн queryset-ийн profession-тэй ижил байх case-үүдэд
        # хүйс болон бүгд-ээр нь хяналтын тоонуудыг aggregate хийж авах нөхцлүүдийг бичиж өгсөн
        for value in admission_xyanlat_too:
            # 30%-иар нэмэгдүүлсэн
            norm1_value = (value['norm1'] if value['norm1'] is not None else 0) + (value['norm1'] * 0.3 if value['norm1'] is not None else 0)
            norm2_value = (value['norm2'] if value['norm2'] is not None else 0) + (value['norm2'] * 0.3 if value['norm2'] is not None else 0)
            norm_all_value = (value['norm_all'] if value['norm_all'] is not None else 0) + (value['norm_all'] * 0.3 if value['norm_all'] is not None else 0)

            # Үндсэн нөхцөл
            condition = Q(profession=value['indicator__admission_prof'])

            xyanalt_male_cases.append(When(condition, then=Value(norm1_value)))
            xyanalt_female_cases.append(When(condition, then=Value(norm2_value)))
            xyanalt_all_cases.append(When(condition, then=Value(norm_all_value)))

        health_profession_ids = AdmissionIndicator.objects.filter(admission_prof__admission__is_active=True, value__in=[AdmissionIndicator.ERUUL_MEND_ANHAN], ).values_list('admission_prof', flat=True)
        # Анхан шат тэнцсэн хэрэглэгчид
        anhan_shat_ids = HealthUser.objects.filter(state=AdmissionUserProfession.STATE_APPROVE).values_list('user', flat=True)
        health_users = HealthUser.objects.filter(user__in=anhan_shat_ids).values_list('user', flat=True)

        # Бие бялдар шалгуур үзүүлэлттэй мэргэжилд бүртгүүлсэн элсэгчид
        physical_profession_ids = AdmissionIndicator.objects.filter(admission_prof__admission__is_active=True, value__in=[AdmissionIndicator.BIE_BYALDAR]).values_list('admission_prof', flat=True)

        # Нарийн мэргэжлийн үзлэгт тэнцсэн хүүхдүүд бие бялдарын шалгалтад орно
        healt_user_ids = HealthUpUser.objects.filter(state=AdmissionUserProfession.STATE_APPROVE).values_list('user', flat=True)

        # annotate хийж өгөх dynamic field-үүдээ хэтэрхий их байгаа учир энд зарлаж өгөв
        aggregations = {
            # Хяналтын тоо/Бүртгүүлсэн
            'total_male_users': Count('id', filter=Q(gender=1)),
            'total_female_users': Count('id', filter=Q(gender=2)),

            # Насны шаардлага хангасан
            'age_state_true_male': Count('id', filter=Q(gender=1, age_state=AdmissionUserProfession.STATE_APPROVE)),
            'age_state_false_male': Count('id', filter=Q(gender=1, age_state=AdmissionUserProfession.STATE_REJECT)),
            'age_state_true_female': Count('id', filter=Q(gender=2, age_state=AdmissionUserProfession.STATE_APPROVE)),
            'age_state_false_female': Count('id', filter=Q(gender=2, age_state=AdmissionUserProfession.STATE_REJECT)),

            # Дипломын голч дүнгийн шаардлага хангасан эсэх
            'gpa_state_true_male': Count('id', filter=Q(gender=1, gpa_state=AdmissionUserProfession.STATE_APPROVE)),
            'gpa_state_false_male': Count('id', filter=Q(gender=1, gpa_state=AdmissionUserProfession.STATE_REJECT)),
            'gpa_state_true_female': Count('id', filter=Q(gender=2, gpa_state=AdmissionUserProfession.STATE_APPROVE)),
            'gpa_state_false_female': Count('id', filter=Q(gender=2, gpa_state=AdmissionUserProfession.STATE_REJECT)),

            # Хяналтын тоо
            'hynalt_number_male': Case(*xyanalt_male_cases, default=Value(0), output_field=IntegerField()),
            'hynalt_number_female': Case(*xyanalt_female_cases, default=Value(0), output_field=IntegerField()),
            'hynalt_number_all': Case(*xyanalt_all_cases, default=Value(0), output_field=IntegerField()),

            # ЭЕШ шалгуур оноо
            'yesh_state_true_male': Count('id', filter=Q(gender=1, yesh_state=AdmissionUserProfession.STATE_APPROVE)),
            'yesh_state_true_female': Count('id', filter=Q(gender=2, yesh_state=AdmissionUserProfession.STATE_APPROVE)),
            'yesh_state_false_male': Count(
                'id',filter=Q(
                        Q(gender=1, yesh_state=AdmissionUserProfession.STATE_REJECT),
                        ~Q(yesh_description__icontains='хяналтын тоонд багтсангүй')
                    )
            ),
            'yesh_state_false_female': Count(
                'id',filter=Q(
                        Q(gender=2, yesh_state=AdmissionUserProfession.STATE_REJECT),
                        ~Q(yesh_description__icontains='хяналтын тоонд багтсангүй')
                    )
            ),
            'yesh_state_false_xyanalt': Count('id', filter=Q(yesh_state=AdmissionUserProfession.STATE_REJECT, yesh_description__icontains='Хяналтын тоонд багтсангүй')),

            # Монгол хэл бичгийн шалгалт
            'yesh_mhb_state_true_male': Count('id', filter=Q(gender=1, yesh_mhb_state=AdmissionUserProfession.STATE_APPROVE)),
            'yesh_mhb_state_false_male': Count('id', filter=Q(gender=1, yesh_mhb_state=AdmissionUserProfession.STATE_REJECT)),
            'yesh_mhb_state_true_female': Count('id', filter=Q(gender=2, yesh_mhb_state=AdmissionUserProfession.STATE_APPROVE)),
            'yesh_mhb_state_false_female': Count('id', filter=Q(gender=2, yesh_mhb_state=AdmissionUserProfession.STATE_REJECT)),

            # Анхан шатны үзлэг
            'health_user_true_male_users': Count('id', filter=Q(gender=1, user__healthuser__state=AdmissionUserProfession.STATE_APPROVE)),
            'health_user_true_female_users': Count('id', filter=Q(gender=2, user__healthuser__state=AdmissionUserProfession.STATE_APPROVE)),
            'health_user_false_male_users': Count('id', filter=Q(gender=1, user__healthuser__state=AdmissionUserProfession.STATE_REJECT)),
            'health_user_false_female_users': Count('id', filter=Q(gender=2, user__healthuser__state=AdmissionUserProfession.STATE_REJECT)),
            'health_user_send_male_users': Count(
                'id',filter=Q(
                    Q(gender=1),
                    Q(profession__in=health_profession_ids),
                    Q(age_state=AdmissionUserProfession.STATE_APPROVE),
                    Q(gpa_state__in=[AdmissionUserProfession.STATE_APPROVE, AdmissionUserProfession.STATE_SEND]),
                    Q(Q(first_state=AdmissionUserProfession.STATE_APPROVE) | Q(yesh_state=AdmissionUserProfession.STATE_APPROVE)),
                    Q(user__healthuser__isnull=True)
                )
            ),
            'health_user_send_female_users': Count(
                'id',filter=Q(
                    Q(gender=2),
                    Q(profession__in=health_profession_ids),
                    Q(age_state=AdmissionUserProfession.STATE_APPROVE),
                    Q(gpa_state__in=[AdmissionUserProfession.STATE_APPROVE, AdmissionUserProfession.STATE_SEND]),
                    Q(Q(first_state=AdmissionUserProfession.STATE_APPROVE) | Q(yesh_state=AdmissionUserProfession.STATE_APPROVE)),
                    Q(user__healthuser__isnull=True)
                )
            ),

            # Эрүүл мэндийн үзлэг шинжилгээний дүгнэлт
            'health_up_user_true_male_users': Count('id', filter=Q(gender=1, user__healthupuser__state=AdmissionUserProfession.STATE_APPROVE)),
            'health_up_user_true_female_users': Count('id', filter=Q(gender=2, user__healthupuser__state=AdmissionUserProfession.STATE_APPROVE)),
            'health_up_user_false_male_users': Count('id', filter=Q(gender=1, user__healthupuser__state=AdmissionUserProfession.STATE_REJECT)),
            'health_up_user_false_female_users': Count('id', filter=Q(gender=2, user__healthupuser__state=AdmissionUserProfession.STATE_REJECT)),
            'health_up_user_out_male_users': Count(
                'id',filter=Q(
                    Q(gender=1),
                    Q(user__in=health_users),
                    Q(user__healthupuser__isnull=True)
                )
            ),
            'health_up_user_out_female_users': Count(
                'id',filter=Q(
                    Q(gender=2),
                    Q(user__in=health_users),
                    Q(user__healthupuser__isnull=True)
                )
            ),

            # Эрүүгийн хариуцлага хүлээж байсан эсэх шаардлага
            'justice_state_true_male': Count('id', filter=Q(gender=1, justice_state=AdmissionUserProfession.STATE_APPROVE)),
            'justice_state_true_female': Count('id', filter=Q(gender=2, justice_state=AdmissionUserProfession.STATE_APPROVE)),
            'justice_state_false_male': Count('id', filter=Q(gender=1, justice_state=AdmissionUserProfession.STATE_REJECT)),
            'justice_state_false_female': Count('id', filter=Q(gender=2, justice_state=AdmissionUserProfession.STATE_REJECT)),

            # Бие бялдрын шалгалт
            'physque_state_true_male': Count('id', filter=Q(gender=1, user__physqueuser__state=AdmissionUserProfession.STATE_APPROVE)),
            'physque_state_true_female': Count('id', filter=Q(gender=2, user__physqueuser__state=AdmissionUserProfession.STATE_APPROVE)),
            'physque_state_false_male': Count('id', filter=Q(gender=1, user__physqueuser__state=AdmissionUserProfession.STATE_REJECT)),
            'physque_state_false_female': Count('id', filter=Q(gender=2, user__physqueuser__state=AdmissionUserProfession.STATE_REJECT)),
            'physque_state_out_male': Count(
                'id',filter=Q(
                    Q(gender=1),
                    Q(user__in=healt_user_ids),
                    Q(profession__in=physical_profession_ids),
                    Q(user__physqueuser__isnull=True)
                )
            ),
            'physque_state_out_female': Count(
                'id',filter=Q(
                    Q(gender=2),
                    Q(user__in=healt_user_ids),
                    Q(profession__in=physical_profession_ids),
                    Q(user__physqueuser__isnull=True)
                )
            ),

            # Нийт
            'total': Count('id')
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
                    'physque_state_false_male', 'physque_state_false_female', 'physque_state_out_male',
                    'physque_state_out_female', 'hynalt_number_male', 'hynalt_number_all', 'hynalt_number_female',
                    'yesh_mhb_state_true_male', 'yesh_mhb_state_false_male', 'yesh_mhb_state_true_female',
                    'yesh_mhb_state_false_female', 'yesh_state_true_male', 'yesh_state_true_female',
                    'yesh_state_false_male', 'yesh_state_false_female', 'yesh_state_false_xyanalt', 'total')
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

    queryset = AdmissionUserProfession.objects.all()

    serializer_class = HealthUserDataSerializer
    pagination_class = CustomPagination

    filter_backends = [SearchFilter]
    search_fields = ['user__first_name', 'user__first_name', 'user__register']

    def get_queryset(self):
        queryset = self.queryset
        date_query = HealthUser.objects.filter(user=OuterRef('user')).values('updated_at')[:1]
        queryset = queryset.annotate(
            gender=(Substr('user__register', 9, 1)),
            user_email=F("user__email"),
            degree_name=F("profession__profession__degree__degree_name"),
            profession_name=F("profession__profession__name"),
            update_date=Subquery(date_query)
        ).order_by('update_date')

        # Эрүүл мэндийн шалгуур үзүүлэлттэй мэргэжлүүд
        # TODO Одоогоор идэвхтэй байгаа элсэлтээс л харуулж байгаа гэсэн үг
        health_profession_ids = AdmissionIndicator.objects.filter(admission_prof__admission__is_active=True, value__in=[AdmissionIndicator.ERUUL_MEND_ANHAN], ).values_list('admission_prof', flat=True)
        queryset = queryset.filter(profession__in=health_profession_ids)

        gender = self.request.query_params.get('gender')
        sorting = self.request.query_params.get('sorting')
        state  = self.request.query_params.get('state')
        elselt = self.request.query_params.get('elselt')
        profession = self.request.query_params.get('profession')
        start_date=self.request.query_params.get('start_date')
        end_date=self.request.query_params.get('end_date')

        queryset = queryset.filter(
            age_state=AdmissionUserProfession.STATE_APPROVE,
            gpa_state__in=[AdmissionUserProfession.STATE_APPROVE, AdmissionUserProfession.STATE_SEND],
        )

        # ЭШ тэнцсэн болон анхан мэдээлэлээрээ тэнцсэн
        queryset = queryset.filter(
            Q(Q(first_state=AdmissionUserProfession.STATE_APPROVE) | Q(yesh_state=AdmissionUserProfession.STATE_APPROVE))
        )

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

        if state:
            if state == '1':
                exclude_ids = HealthUser.objects.filter(Q(Q(state=AdmissionUserProfession.STATE_APPROVE) | Q(state=AdmissionUserProfession.STATE_REJECT))).values_list('user', flat=True)
                user_id = AdmissionUserProfession.objects.exclude(user__in=exclude_ids).values_list('user', flat=True)
            else:
                user_id = HealthUser.objects.filter(state=state).order_by('updated_at').values_list('user', flat=True)
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

        try:
            with transaction.atomic():
                now = dt.datetime.now()
                student = HealthUser.objects.filter(user=user).first()

                if student.state != eval(data.get('state')):
                    StateChangeLog.objects.create(
                        user=student.user,
                        type=StateChangeLog.STATE,
                        indicator=AdmissionIndicator.ERUUL_MEND_ANHAN,
                        now_state=student.state,
                        change_state=data.get("state"),
                        updated_user=request.user if request.user.is_authenticated else None,
                        updated_at=now
                    )
        except Exception as e:
            return request.send_error("ERR_004", str(e))

        health_user = HealthUser.objects.filter(id=pk).first()
        serializer = HealthUserSerializer(health_user, data)

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
        start_date=self.request.query_params.get('start_date')
        end_date=self.request.query_params.get('end_date')


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

        filters = {}
        if start_date:
            filters['updated_at__gte'] = start_date
        if end_date:
            filters['updated_at__lte'] = end_date

        if filters:
            dates = HealthUpUser.objects.filter(**filters).values_list('user', flat=True)
            queryset = queryset.filter(user__in=dates)

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

        user = data.get('user')
        try:
            with transaction.atomic():
                now = dt.datetime.now()
                student = HealthUpUser.objects.filter(user=user).first()

                if student.state != data.get('state'):
                    StateChangeLog.objects.create(
                        user=student.user,
                        type=StateChangeLog.STATE,
                        indicator=AdmissionIndicator.ERUUL_MEND_MERGEJLIIN,
                        now_state=student.state, # Хуучин төлөв
                        change_state=data.get("state"),
                        updated_user=request.user if request.user.is_authenticated else None,
                        updated_at=now
                    )
        except Exception as e:
            return request.send_error("ERR_004", str(e))

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
        gender = self.request.query_params.get('gender')

        # Бие бялдар шалгуур үзүүлэлттэй мэргэжлүүд
        # TODO Одоогоор идэвхтэй байгаа элсэлтээс л харуулж байгаа гэсэн үг Дараа жил яахыг үл мэднэ
        physical_profession_ids = AdmissionIndicator.objects.filter(admission_prof__admission__is_active=True, value__in=[AdmissionIndicator.BIE_BYALDAR]).values_list('admission_prof', flat=True)

        # Бие бялдар шалгуур үзүүлэлттэй мэргэжилд бүртгүүлсэн элсэгчид
        queryset = queryset.filter(profession__in=physical_profession_ids)

        sorting = self.request.query_params.get('sorting')
        state  = self.request.query_params.get('state')
        elselt = self.request.query_params.get('elselt')
        profession = self.request.query_params.get('profession')
        start_date=self.request.query_params.get('start_date')
        end_date=self.request.query_params.get('end_date')

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

        if gender:
            if gender == 'Эрэгтэй':
                queryset = queryset.filter(gender__in=['1', '3', '5', '7', '9'])
            else:
                queryset = queryset.filter(gender__in=['0', '2', '4', '6', '8'])
        if state:
            if state == '1':
                user_id = HealthUpUser.objects.filter(state=2).values_list('user', flat=True)
                exclude_ids = PhysqueUser.objects.filter(state__in=[AdmissionUserProfession.STATE_APPROVE, AdmissionUserProfession.STATE_REJECT]).values_list('user', flat=True)
                queryset = queryset.filter(user_id__in=user_id).exclude(user__in=exclude_ids)
            else:
                user_id = PhysqueUser.objects.filter(state=state).values_list('user', flat=True)
                queryset = queryset.filter(user__in=user_id)

        filters = {}
        if start_date:
            filters['updated_at__gte'] = start_date
        if end_date:
            filters['updated_at__lte'] = end_date

        if filters:
            dates = PhysqueUser.objects.filter(**filters).values_list('user', flat=True)
            queryset = queryset.filter(user__in=dates)
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
            with transaction.atomic():
                now = dt.datetime.now()
                student = PhysqueUser.objects.filter(user=user).first()

                if student.state != eval(data.get('state')):
                    StateChangeLog.objects.create(
                        user_id=user,
                        type=StateChangeLog.STATE,
                        indicator=AdmissionIndicator.BIE_BYALDAR,
                        now_state=student.state,
                        change_state=data.get("state"),
                        updated_user=request.user if request.user.is_authenticated else None,
                        updated_at=now
                    )
        except Exception as e:
            return request.send_error("ERR_004", str(e))

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
                    print(serializer.errors)
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

    queryset = AdmissionUserProfession.objects.all()
    serializer_class = ElseltApproveSerializer

    pagination_class = CustomPagination

    filter_backends = [SearchFilter]
    search_fields = ['user__first_name', 'user__last_name', 'user__register', 'profession__profession__name', 'admission_number', 'admission_date']

    def get_queryset(self):
        queryset = self.queryset.annotate(
            gender=(Substr('user__register', 9, 1))
        )
        gender = self.request.query_params.get('gender')

        profession = self.request.query_params.get('profession')
        admission = self.request.query_params.get('admission')
        sorting = self.request.query_params.get('sorting')
        queryset = queryset.filter(state=AdmissionUserProfession.STATE_APPROVE)

        if admission:
            queryset = queryset.filter(profession__admission=admission)

        if profession:
            queryset = queryset.filter(profession__profession__id=profession)

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
        gender = self.request.query_params.get('gender')

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
        justice_state = self.request.query_params.get('justice_state')
        sorting = self.request.query_params.get('sorting')

        # Сэтгэлзүйн сорилд тэнцсэн элсэгчид
        healt_user_ids = ConversationUser.objects.filter(Q(Q(state=ConversationUser.STATE_APPROVE) | Q(state=ConversationUser.STATE_CONDIITON))).values_list('user', flat=True)
        queryset = queryset.filter(user__in=healt_user_ids)

        if elselt:
            queryset = queryset.filter(profession__admission=elselt)

        if profession:
            queryset = queryset.filter(profession__profession__id=profession)

        if gender:
            if gender == 'Эрэгтэй':
                queryset = queryset.filter(gender__in=['1', '3', '5', '7', '9'])
            else:
                queryset = queryset.filter(gender__in=['0', '2', '4', '6', '8'])

        if justice_state:
            queryset = queryset.filter(justice_state=justice_state)

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

    def put(self, request):

        data = request.data
        try:
            with transaction.atomic():
                now = dt.datetime.now()
                students = self.queryset.filter(user__in=data["students"])
                for student in students:
                    if student.justice_state != eval(data.get("justice_state")):
                        StateChangeLog.objects.create(
                            user=student.user,
                            type=StateChangeLog.STATE,
                            indicator=AdmissionIndicator.YAL_SHIITGEL,
                            now_state=student.justice_state,
                            change_state=data.get("justice_state"),
                            updated_user=request.user if request.user.is_authenticated else None,
                            updated_at=now
                        )

                # Төлөв шинэчлэх
                self.queryset.filter(user__in=data["students"]).update(
                    justice_state=data.get("justice_state"),
                    justice_description=data.get("justice_description")
                )
        except Exception as e:
            return request.send_error("ERR_002", e.__str__)

        return request.send_info("INF_002")


@permission_classes([IsAuthenticated])
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
        queryset = queryset.annotate(gender=(Substr('user__register', 9, 1)))
        gender = self.request.query_params.get('gender')

        sorting = self.request.query_params.get('sorting')
        state = self.request.query_params.get('state')
        elselt = self.request.query_params.get('elselt')
        profession = self.request.query_params.get('profession')
        start_date=self.request.query_params.get('start_date')
        end_date=self.request.query_params.get('end_date')

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

        if gender:
            if gender == 'Эрэгтэй':
                queryset = queryset.filter(gender__in=['1', '3', '5', '7', '9'])
            else:
                queryset = queryset.filter(gender__in=['0', '2', '4', '6', '8'])
        if state:
            if state == '1':
                exclude_ids = ConversationUser.objects.filter(Q(Q(state=AdmissionUserProfession.STATE_APPROVE) | Q(state=AdmissionUserProfession.STATE_REJECT))).values_list('user', flat=True)
                user_id = AdmissionUserProfession.objects.filter(state=state).exclude(user__in=exclude_ids).values_list('user', flat=True)
            else:
                user_id = ConversationUser.objects.filter(state=state).values_list('user', flat=True)

            queryset = queryset.filter(user__in=user_id)

        filters = {}
        if start_date:
            filters['created_at__gte'] = start_date
        if end_date:
            filters['created_at__lte'] = end_date

        if filters:
            queryset = queryset.filter(**filters)

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
        user = data.get('user')

        with transaction.atomic():
            now = dt.datetime.now()

            student = ConversationUser.objects.filter(user=user).first()

            if student.state != eval(data.get('state')):
                StateChangeLog.objects.create(
                    user=student.user,
                    type=StateChangeLog.STATE,
                    indicator=AdmissionIndicator.SETGEL_ZUI,
                    now_state=student.state,
                    change_state=data.get("state"),
                    updated_user=request.user if request.user.is_authenticated else None,
                    updated_at=now
                )

            ConversationUser.objects.filter(
               user=data.get('user')
            ).update(state=data.get("state"),updated_at=now,description=data.get("description"))

        return request.send_info('INF_002')


@permission_classes([IsAuthenticated])
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
        user = data.get('user')
        with transaction.atomic():
            now = dt.datetime.now()
            student = ArmyUser.objects.filter(user=user).first()

            if student.state != eval(data.get("state")):
                StateChangeLog.objects.create(
                    user=student.user,
                    type=StateChangeLog.STATE,
                    indicator=AdmissionIndicator.HEERIIN_BELTGEL,
                    now_state=student.state,
                    change_state=data.get("state"),
                    updated_user=request.user if request.user.is_authenticated else None,
                    updated_at=now
                )

            ArmyUser.objects.filter(
                user=data.get('user')
            ).update(state=data.get("state"),updated_at=now,description=data.get("description"))

        return request.send_info('INF_002')


@permission_classes([IsAuthenticated])
class LogSerializerAPView(
    generics.GenericAPIView,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin
    ):

    queryset = StateChangeLog.objects.all()
    serializer_class = StateChangeLogInfoSerializer

    pagination_class = CustomPagination

    filter_backends = [SearchFilter]
    search_fields = [ 'user__first_name', 'user__last_name', 'user__register', 'user__mobile']

    def get_queryset(self):
        queryset = self.queryset

        sorting = self.request.query_params.get('sorting')
        profession = self.request.query_params.get('profession')
        elselt = self.request.query_params.get('elselt')
        menu_option = self.request.query_params.get('menu_option')

        if menu_option:
            queryset = queryset.filter(type=menu_option)

        if profession:
            queryset = queryset.filter(
                user__admissionuserprofession__profession__profession=profession
            )

        if elselt:
            queryset = queryset.filter(user__admissionuserprofession__profession__admission=elselt)

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


@permission_classes([IsAuthenticated])
class HynaltNumberIsGenderAPIView(generics.GenericAPIView):
    """ Мэргэжлийн хяналтын тоо хүйсээс хамаарах эсэх """

    def get(self, request):
        is_gender = True

        # query parametr-үүд
        profession = request.query_params.get('profession')

        if profession:
            # Мэргэжлийн хяналтын тооны queryset
            hynalt_qs = AdmissionXyanaltToo.objects.filter(
                indicator__admission_prof=profession
            ).first()

            # Хэрвээ тус мэргэжилээр тодорхойлогдсон qs байвал
            if hynalt_qs:
                is_gender = hynalt_qs.is_gender

        return request.send_data(is_gender)


@permission_classes([IsAuthenticated])
class HynaltNumberAPIView(generics.GenericAPIView):
    """ Хөтөлбөр болох хүйсээс хамаарсан хяналтын тоо """

    def get(self, request):
        # Хяналтын тооны анхны утга
        hynalt_number = 0

        # query параметрүүд
        gender = request.query_params.get('gender')
        profession = request.query_params.get('profession')

        # Норм түлхүүрийг тогтоох
        norm_key = 'norm_all'
        if gender == "1":
            norm_key = 'norm1'
        if gender == "2":
            norm_key = 'norm2'

        if profession:
            # Хүйсээр ялгах эсэхээр filter хийнэ
            filter_args = {'indicator__admission_prof': profession}
            if gender and int(gender) == 3:
                filter_args['is_gender'] = False
            else:
                filter_args['is_gender'] = True

            hynalt_obj = AdmissionXyanaltToo.objects.filter(**filter_args).values(norm_key)

            # hynalt_obj хоосон биш үед
            if hynalt_obj:
                # Хяналтын тоог буцаана
                hynalt_number = hynalt_obj[0][norm_key]

        return request.send_data(hynalt_number)


@permission_classes([IsAuthenticated])
class UserScoreSortAPIView(generics.GenericAPIView):
    """ЭЕШ онооны эрэмбэлэлт"""

    queryset = UserScore.objects.all().annotate(gender=(Substr('user__register', 9, 1)))

    def post(self, request):
        data = request.data
        try:
            # front-ooс ирсэн хичээлүүдээ ашиглан AdmissionLesson-д байгаа хичээлүүдийн нэрсийг авна
            lessons = data.get('lesson')
            profession = data.get('profession')
            total_elsegch = data.get('totalElsegch')
            gender = data.get('gender')
            lesson_names = AdmissionLesson.objects.filter(id__in=lessons).values_list('lesson_name', flat=True)

            adm_queryset = AdmissionUserProfession.objects.annotate(gender=(Substr('user__register', 9, 1))).filter(
                profession=profession ,
                age_state=AdmissionUserProfession.STATE_APPROVE,
                yesh_mhb_state=AdmissionUserProfession.STATE_APPROVE
            )

            if int(gender) == 1: # Эрэгтэй хэрэглэгчид
                adm_queryset = adm_queryset.filter(
                    gender__in=['1', '3', '5', '7', '9']
                ).values_list('user', flat=True)

            if int(gender) == 2:
                adm_queryset = adm_queryset.filter(
                    gender__in=['0', '2', '4', '6', '8']
                ).values_list('user', flat=True)

            # Элсэгчийн ids
            user_ids = adm_queryset.values_list('user', flat=True)

            # Хэрвээ тус хичээл AdmissionLesson-д байхгүй бол олдсонгүй гэсэн мэдээллийг буцаана
            if not lesson_names:
                return request.send_error('ERR_002', 'ЭШ-ийн хичээлүүдийн дотор тус хичээл олдсонгүй')

            # AdmissionLesson-ээс ганц хичээл олдвол
            if len(lesson_names) == 1:
                # Single lesson function-ийг ажиллуулна
                self.process_single_lesson(lesson_names, profession, total_elsegch, gender, user_ids)
            else:
                # Нэгээс олон хичээл байвал уг function-ийг дуудна
                self.process_multiple_lessons(lesson_names, profession, total_elsegch, gender, user_ids)

        except Exception as e:
            print(e)
            return request.send_error('ERR_002', 'Хадгалахад алдаа гарлаа')
        return request.send_info('INF_001')

    # Нэг ЭЕШ-ийн хичээлээр оноог эрэмбэлхэд ашиглах function
    def process_single_lesson(self, lesson_names, profession, total_elsegch, gender, user_ids):
        # Элсэлтэд бүртгэгдсэн мэргэжил
        profession_obj = AdmissionRegisterProfession.objects.get(pk=profession)

        # UserScore-д тус хичээлийн нэр дээр бүртгэлтэй оноотой хэрэглэгчдийн ElseltUser-ийн id-г олж авна
        if int(gender) == 1: # Эрэгтэй хэрэглэгчид
            user_score_users = self.queryset.filter(
                user__in=user_ids,
                lesson_name__in=lesson_names,
                gender__in=['1', '3', '5', '7', '9']
            ).values_list('user', flat=True)

        if int(gender) == 2:
            user_score_users = self.queryset.filter(
                user__in=user_ids,
                lesson_name__in=lesson_names,
                gender__in=['0', '2', '4', '6', '8']
            ).values_list('user', flat=True)

        if int(gender) == 3:
            user_score_users = self.queryset.filter(
                user__in=user_ids,
                lesson_name__in=lesson_names,
            ).values_list('user', flat=True)

        # ЭШ өгсөн хүүхдүүд
        yesh_score_user_ids = user_score_users.values_list('user', flat=True)

        # Шалгаж байгаа хичээлээр огт ЭШ өгөөгүй хүүхдүүд
        not_yesh_score_user_ids = list(set(user_ids) - set(yesh_score_user_ids))

        # ЭШ өгөөгүй хүүхдүүдийг state өөрчлөх
        AdmissionUserProfession.objects.filter(user__in=not_yesh_score_user_ids).update(
            yesh_state=AdmissionUserProfession.STATE_REJECT,
            yesh_description='Шалгуур хичээлээр ЭШ өгөөгүй.'
        )

        # Counter ашиглан тус хэрэглэгч уг шалгалтыг хэдэн удаа өгснийг тоолно
        counts = Counter(user_score_users)

        # Уг хичээлийн шалгалтыг нэг удаа өгсөн хэрэглэгчид
        single_score_users = [item for item in user_score_users if counts[item] == 1]
        single_users_scores = [
            {'score': self.queryset.filter(user=user, lesson_name__in=lesson_names).values_list('scaledScore', flat=True).first(), 'user': user}
            for user in single_score_users
        ]

        # Нэгээс олон удаа уг хичээлээр шалгалт өгсөн хэрэглэгчид
        multi_score_users = [item for item in user_score_users if counts[item] > 1]
        # max() ашиглан хамгийн их оноог user дээрээ хадгална
        multi_users_scores = [
            {'score': max(self.queryset.filter(user=user, lesson_name__in=lesson_names).values_list('scaledScore', flat=True)), 'user': user}
            for user in multi_score_users
        ]

        # Давхардсан утгуудийг хасна multi_users_scores дотроос
        seen = set()
        unique_multi_users = []
        # multi_users_scores дотроо loop гүйлгээд
        for value in multi_users_scores:
            # item дотор value-гийн утгуудаас бүрдэх tuple-ийг хадгална
            item = tuple(value.items()) # tuple болгодгоно set() ашиглаж duplicated value-г арилгахад туслана
            if item not in seen:
                # Тэгээд seen дотор item маань байхгүй байвал үндсэн list-үүгээ value-гаа нэмнээ
                seen.add(item)
                unique_multi_users.append(value)

        # Бүх оноонуудаа нэмээд
        all_scores = unique_multi_users + single_users_scores

        bottom_score_obj = AdmissionBottomScore.objects.filter(
                admission_lesson__lesson_name__in=lesson_names,
                profession=profession_obj.profession,
                score_type=AdmissionBottomScore.GENERAL,
            ).first()

        # Хичээлийн өосго оноо
        bottom_score = bottom_score_obj.bottom_score

        # Тэгээд save_scores function-ийг ашиглан нийт датагаа хадгална
        self.save_scores(all_scores, total_elsegch, bottom_score)

    # Нэгээс олон ЭЕШ-ийн хичээлээр оноог эрэмбэлхэд ашиглах function
    def process_multiple_lessons(self, lesson_names, profession, total_elsegch, gender, user_ids):

        # Элсэлтэд бүртгэгдсэн мэргэжил
        profession_obj = AdmissionRegisterProfession.objects.get(pk=profession)

        # UserScore-д тус хичээлийн нэр дээр бүртгэлтэй оноотой хэрэглэгчдийн ElseltUser-ийн id, lesson_name болон ЭЕШ оноог олж авна
        # {'user': 806, 'lesson_name': 'Нийгэм судлал', 'scaledScore': 626} иймэрдүү датанаас бүрдсэн list ирнэ
        if int(gender) == 1: # Эрэгтэй хэрэглэгчид
            elsegch_users = self.queryset.filter(
                user__in=user_ids,
                lesson_name__in=lesson_names,
                gender__in=['1', '3', '5', '7', '9']
            ).values('user', 'lesson_name', 'scaledScore')

        if int(gender) == 2:
            elsegch_users = self.queryset.filter(
                user__in=user_ids,
                lesson_name__in=lesson_names,
                gender__in=['0', '2', '4', '6', '8']
            ).values('user', 'lesson_name', 'scaledScore')

        if int(gender) == 3:
            elsegch_users = self.queryset.filter(
                user__in=user_ids,
                lesson_name__in=lesson_names,
            ).values('user', 'lesson_name', 'scaledScore')

        # ЭШ өгсөн хүүхдүүд
        yesh_score_user_ids = elsegch_users.values_list('user', flat=True)

        # Шалгаж байгаа хичээлээр огт ЭШ өгөөгүй хүүхдүүд
        not_yesh_score_user_ids = list(set(user_ids) - set(yesh_score_user_ids))

        # ЭШ өгөөгүй хүүхдүүдийг state өөрчлөх
        AdmissionUserProfession.objects.filter(user__in=not_yesh_score_user_ids).update(
            yesh_state=AdmissionUserProfession.STATE_REJECT,
            yesh_description='Шалгуур хичээлээр ЭШ өгөөгүй.'
        )

        # Тус хэрэглэгч нэг шалгалтыг олон удаа өгсөн бол зөвхөн хамгийн өндөр оноог нь авна
        max_scores = {}
        for item in elsegch_users:
            # key дотор хэрэглэгийн id болон хичээлийн нэр хоёрыг аваад
            key = (item['user'], item['lesson_name'])
            # Хэрвээ key-нь max_scores дотор байхгүй эсвэл байгаад гэхдээ ижил key-тэй датаны scaledScore-оос их оноотой байвал
            if key not in max_scores or item['scaledScore'] > max_scores[key]['scaledScore']:
                # тус key-гээр илэрхийлэгдэх value-г max_score дотор хадгална
                max_scores[key] = item

        # Тэгээд max_scores-ийн value-г нь аваад тус хичээлийн шалгалтын хамгийн их оноотой датанаас бүрдэх list-ийг үүсгэнэ
        users_with_max_score = list(max_scores.values()) # Ингэснээр нэг хичээл дээр нэг л хэрэглэгчийн дата үүснэ

        # Дараа нь ижил хэрэглэгчтэй өөр хичээлийн датануудыг group-лэнэ
        grouped_data = {}
        # users_with_max_score дотор loop гүйлгээд
        for item in users_with_max_score:
            # user_id-д item-ийн user-ийн утгыг хадгалаад
            user_id = item['user']

            # AdmissionBottomScore-оос тус хичээлийн Суурь шалгалт-уу эсвэл Дагалдах шалгалт-уу гэдгийг тодорхойлж өгөөд
            score_type = AdmissionBottomScore.objects.filter(
                admission_lesson__lesson_name=item['lesson_name'],
                profession=profession_obj.profession
            ).values_list('score_type', flat=True).first()

            # lesson_info дотор group-лэх датаны мэдээллийг оруулж өгнө
            lesson_info = {
                'lesson_name': item['lesson_name'],
                'scaledScore': item['scaledScore'],
                'user': item['user'],
                'score_type': score_type
            }

            # Хэрвээ тухайн хэрэглэчийн id grouped_data дотор байвал
            if user_id in grouped_data:
                # Тэр дотроо хичээлийн мэдээллээ нэмж өгнө
                grouped_data[user_id].append(lesson_info)
            else:
                # Байхгүй бол үүсгэж өгнө
                grouped_data[user_id] = [lesson_info]
            # Эцэст нь иймэрдүү дата үүснэ
            # 4712: [
            #   {'lesson_name': 'Математик', 'scaledScore': 599, 'user': 4712, 'score_type': 1},
            #   {'lesson_name': 'Нийгэм судлал', 'scaledScore': 634, 'user': 4712, 'score_type': 2}
            # ]

        # Дараагаар үндсэн list дотроо зөвхөн тухайн хэрэглэгч дотор 2 хичээлийн мэдээлэл group-лэгдсэн датаг нэмнэ
        grouped_list = [group for group in grouped_data.values() if len(group) == 2]

        # 2 хичээлийн нэг хичээлээр ЭШ өгөөгүй хүүхдүүд
        grouped_one_list = [group for group in grouped_data.values() if len(group) == 1]

        # 2 хичээлийн аль нэгнийхэн босго оноонд хүрээгүй тохиолдодл state солиж тэнцүүлэхгүй
        users_to_remove = []

        for item in grouped_list:
            for sub_item in item:
                # Тухайн хичээлийн босго оноо
                bottomscore = AdmissionBottomScore.objects.filter(admission_lesson__lesson_name=sub_item['lesson_name'], profession=profession_obj.profession, score_type=sub_item['score_type']).values_list('bottom_score', flat=True).first()
                if bottomscore > sub_item['scaledScore']:
                    users_to_remove.append(sub_item['user'])
                    break

        # Одоо 2 хичээлийн 70, 30-аар хувилсан нийт оноог олно
        all_scores = []

        # Үндсэн list дотроо loop гүйлгээд
        for group in grouped_list:
            # user_scores дотор нийт жинлэгдсэн оноог хадгална
            user_scores = {}

            for entry in group:
                # Мэдээллүүдээ багцалж аваад
                user = entry['user']
                score_type = entry['score_type']
                scaled_score = entry['scaledScore']

                # Хэрвээ тус хичээлийн score_type GENERAL байвал weight-ийг 70% гэж үзнэ
                # Бусад үед дагалдах хичээл гэж ойлгоод 30% байна
                weight = 0.7 if score_type == AdmissionBottomScore.GENERAL else 0.3
                weighted_score = scaled_score * weight

                # Хэрвээ user_scores дотор тухайн хэрэглэгчийн id-аар илэрхийлэгдэх
                # key-тэй оноо байвал тэр оноон дээр нь нэмнэ
                if user in user_scores:
                    user_scores[user] += weighted_score
                else: # Байхгүй бол тус key-гээр оноог үүсгэнэ
                    user_scores[user] = weighted_score

            # Нийт жинлэгдсэн оноо үүссэний дараа
            for user, score in user_scores.items():
                # all_score дотроо датагаа user,score-оор нь цэгцлэнэ
                all_scores.append({'score': round(score), 'user': user})

        all_one_scores = []
        # 2 хичээлээр шалгаж байгаа үед 1 хичээлээр нь ЭШ өгсөн элсэгчид
        for group_one in grouped_one_list:
            # user_scores дотор нийт жинлэгдсэн оноог хадгална
            user_scores = {}

            for entry in group_one:
                # Мэдээллүүдээ багцалж аваад
                user = entry['user']
                score_type = entry['score_type']
                scaled_score = entry['scaledScore']

                # Хэрвээ тус хичээлийн score_type GENERAL байвал weight-ийг 70% гэж үзнэ
                # Бусад үед дагалдах хичээл гэж ойлгоод 30% байна
                weighted_score = scaled_score * 1

                # Хэрвээ user_scores дотор тухайн хэрэглэгчийн id-аар илэрхийлэгдэх
                # key-тэй оноо байвал тэр оноон дээр нь нэмнэ
                if user in user_scores:
                    user_scores[user] += weighted_score
                else: # Байхгүй бол тус key-гээр оноог үүсгэнэ
                    user_scores[user] = weighted_score

            # Нийт жинлэгдсэн оноо үүссэний дараа
            for user, score in user_scores.items():
                # all_one_scores дотроо датагаа user,score-оор нь цэгцлэнэ
                all_one_scores.append({'score': round(score), 'user': user})

        approved_user_bottom_score = [item for item in all_scores if item['user'] not in users_to_remove]
        rejected_user_bottom_score = [item for item in all_scores if item['user'] in users_to_remove]

        # Scores-оор орж ирсэн датаг score-уудийг нь ашиглан эрэмбэлэнэ
        sorted_approve_scores = sorted(approved_user_bottom_score, key=lambda x: x['score'], reverse=True)

        # Босго оноо даваагүй элсэгчид
        sorted_rejected_scores = sorted(rejected_user_bottom_score, key=lambda x: x['score'], reverse=True)

        # ЭШ-ийн 2 хичээлийн 1-г л өгсөн элсэгчид
        sorted_one_rejected_scores = sorted(all_one_scores, key=lambda x: x['score'], reverse=True)

        approve_order_no = 0
        # Тухайн sort хийсэн датаг index-ээс шалтгаалан order_no-уудыг нэмж өгнө
        for idx, item in enumerate(sorted_approve_scores):
            approve_order_no = idx + 1
            item['order_no'] = approve_order_no
            if approve_order_no <= int(total_elsegch):
                # Зөвхөн эрх зүй мэргэжилд шууд тэнцэнэ.
                if profession_obj.profession.name.upper() == 'ЭРХ ЗҮЙ':
                    item['state'] = AdmissionUserProfession.STATE_APPROVE

                item['yesh_state'] = AdmissionUserProfession.STATE_APPROVE

                # Хэрэглэгчийн датаг хадгалах хэсэг
                user = item['user']
                user = AdmissionUserProfession.objects.filter(user=user)

                approve_obj = AdmissionUserProfession.objects.filter(
                    user=item['user']
                ).first()
                if approve_obj:
                    approve_obj.score_avg = item['score']
                    approve_obj.order_no = item['order_no']
                    approve_obj.yesh_state = item['yesh_state']
                    approve_obj.yesh_description = 'ЭШ босго оноонд тэнцэв'

                    if item.get('state'):
                        approve_obj.state = item['state']
                        approve_obj.state_description = 'Эрх зүйн хөтөлбөрт тэнцэв'
                    approve_obj.save()
            else:
                item['yesh_state'] = AdmissionUserProfession.STATE_REJECT
                item['yesh_description'] = 'Хяналтын тоонд багтсангүй.'

                # ЭШ оноогоор тэнцсэн ч хяналтын тоонд багтсаагүй датаг хадгалах хэсэг
                user = item['user']
                user = AdmissionUserProfession.objects.filter(user=user)

                reject_obj = AdmissionUserProfession.objects.filter(
                    user=item['user']
                ).first()

                if reject_obj:
                    reject_obj.score_avg = item['score']
                    reject_obj.order_no = item['order_no']
                    reject_obj.yesh_state = item['yesh_state']
                    reject_obj.yesh_description = item['yesh_description']
                    reject_obj.save()

        # ЭШ босго оноо тэнцээгүй элсэгчид
        for idx, item in enumerate(sorted_rejected_scores):
            approve_order_no = approve_order_no + 1
            item['order_no'] = approve_order_no
            item['yesh_state'] = AdmissionUserProfession.STATE_REJECT
            item['yesh_description'] = 'ЭШ-ийн оноо босго онооны шалгуурыг хангасангүй.'

            # ЭШ оноогоор тэнцсэн ч хяналтын тоонд багтсаагүй датаг хадгалах хэсэг
            reject_off_obj = AdmissionUserProfession.objects.filter(
                user=item['user']
            ).first()

            if reject_off_obj:
                reject_off_obj.score_avg = item['score']
                reject_off_obj.order_no = item['order_no']
                reject_off_obj.yesh_state = item['yesh_state']
                reject_off_obj.yesh_description = item['yesh_description']
                reject_off_obj.save()

        # ЭШ 2 хичээлээр шалгаж байхад 1 хичээлээр л ЭШ өгсөн элсэгчид
        for idx, item in enumerate(sorted_one_rejected_scores):
            approve_order_no = approve_order_no + 1
            item['order_no'] = approve_order_no
            item['yesh_state'] = AdmissionUserProfession.STATE_REJECT
            item['yesh_description'] = 'ЭШ-ын шалгуур хичээл дутуу учраас тэнцсэнгүй.'

            # ЭШ 2 хичээлээр шалгаж байхад 1 хичээлээр л ЭШ өгсөн элсэгчид датаг хадгалах хэсэг
            reject_one_off_obj = AdmissionUserProfession.objects.filter(
                user=item['user']
            ).first()

            if reject_one_off_obj:
                reject_one_off_obj.score_avg = item['score']
                reject_one_off_obj.order_no = item['order_no']
                reject_one_off_obj.yesh_state = item['yesh_state']
                reject_one_off_obj.yesh_description = item['yesh_description']
                reject_one_off_obj.save()

    # Нийт өгөгдлөө update хийх function
    def save_scores(self, scores, total_elsegch, bottom_score):
        """ЭШ дүн хадгалах хэсэг
            Keyword arguments:
            scores -- нийт дүн
            total_elsegch -- тэнцүүлэх элсэгтийн тоо
            profession_name -- мэргэжил нэр
            Return: return_description
        """

        # TODO Шалгаж байгаа хөтөлбөрийн босго оноог хүүхдийн хичээлийн оноо давж байгааг шалгах

        # Scores-оор орж ирсэн датаг score-уудийг нь ашиглан эрэмбэлэнэ
        sorted_scores = sorted(scores, key=lambda x: x['score'], reverse=True)

        # Тухайн sort хийсэн датаг index-ээс шалтгаалан order_no-уудыг нэмж өгнө
        for idx, item in enumerate(sorted_scores):
            item['order_no'] = idx + 1

        approved = []
        rejected = []

        # Тэнцсэн болон тэнцээгүй хэрэглэгчидийг ялгана
        for item in sorted_scores:
            if item['score'] >= bottom_score:
                # Нийт авах элсэгчдийн тоон дотор эрэмбэлсэн хэрэглэгчийн эрэмбийн дугаар байвал
                if item['order_no'] <= int(total_elsegch):
                    item['yesh_state'] = AdmissionUserProfession.STATE_APPROVE
                    item['yesh_description'] = 'ЭШ босго оноо тэнцсэн'
                    approved.append(item)
                else:
                    item['yesh_state'] = AdmissionUserProfession.STATE_REJECT
                    item['yesh_description'] = 'ЭШ-ийн оноогоор хяналтын тоонд багтсангүй.'
                    rejected.append(item)
            else:
                item['yesh_state'] = AdmissionUserProfession.STATE_REJECT
                item['yesh_description'] = 'ЭШ-ийн оноо босго онооны шалгуурыг хангасангүй'
                rejected.append(item)

        rejected_objects = []

        # Bulk_update бэлдэж өгсөн тэнцсэн хэрэглэгчдэд
        for data in approved:

            user = data['user']
            user = AdmissionUserProfession.objects.filter(user=user)

            approve_obj = AdmissionUserProfession.objects.filter(
                user=data['user']
            ).first()

            if approve_obj:
                approve_obj.score_avg = data['score']
                approve_obj.order_no = data['order_no']
                approve_obj.yesh_state = data['yesh_state']
                approve_obj.yesh_description = data['yesh_description']
                approve_obj.save()

        # Bulk_update бэлдэж өгсөн тэнцээгүй хэрэглэгчдэд
        for data in rejected:
            obj = AdmissionUserProfession.objects.filter(
                user=data['user']
            ).first()

            if obj:
                obj.score_avg = data['score']
                obj.order_no = data['order_no']
                obj.yesh_state = data['yesh_state']
                obj.yesh_description = data['yesh_description']
                rejected_objects.append(obj)

        AdmissionUserProfession.objects.bulk_update(
            rejected_objects, ['score_avg', 'order_no', 'yesh_state', 'yesh_description']
        )

@permission_classes([IsAuthenticated])
class PhysicalScoreSortAPIView(generics.GenericAPIView):
    """ Бие бялдар оноо эрэмбэлэх """

    queryset = PhysqueUser.objects.all().annotate(gender=(Substr('user__register', 9, 1)))

    def post(self, request):
        data = request.data
        try:
            gender = data.get('gender')
            profession = data.get('profession')

            health_check_subquery = HealthUpUser.objects.filter(
                user=OuterRef('user'),
                state=AdmissionUserProfession.STATE_APPROVE
            )

            adm_queryset = AdmissionUserProfession.objects.annotate(gender=(Substr('user__register', 9, 1))).filter(
                profession=profession,
                age_state=AdmissionUserProfession.STATE_APPROVE,
                yesh_state=AdmissionUserProfession.STATE_APPROVE
            ).filter(Exists(health_check_subquery))

            if gender == 1: # Эрэгтэй хэрэглэгчид
                adm_queryset = adm_queryset.filter(
                    gender__in=['1', '3', '5', '7', '9']
                )

            if gender == 2: # Эмэгтэй хэрэглэгчид
                adm_queryset = adm_queryset.filter(
                    gender__in=['0', '2', '4', '6', '8']
                )

            users = adm_queryset.values('user', 'score_avg')

            # list ашиглан score_avg, physice_score авах
            score_list = list()
            for value in list(users):
                score_avg = PhysqueUser.objects.filter(user=value['user']).first()
                if score_avg:
                    score_list.append({
                        'id': score_avg.id,
                        'physice_score': score_avg.physice_score,
                        'score_avg': value.get('score_avg')
                    })

            # Хосолсон оноог 70/30 харьцаагаар тооцоолox
            combined_scores = []
            for item in score_list:
                if item['score_avg'] != 0:
                    combined_score = item['score_avg'] * 0.7 + item['physice_score'] * 0.3
                else:
                    combined_score = 0
                combined_scores.append({
                    'id': item['id'],
                    'combined_score': combined_score
                })

            combined_scores = sorted(combined_scores, key=lambda x: x['combined_score'], reverse=True)

            # order_no update хийх
            for idx, score in enumerate(combined_scores):
                if score['combined_score'] != 0:
                    PhysqueUser.objects.filter(pk=score['id']).update(order_no=idx + 1)
                else:
                    PhysqueUser.objects.filter(pk=score['id']).update(order_no=None)

        except Exception as e:
            print(e)
            return request.send_error('ERR_002', 'Хадгалахад алдаа гарлаа')

        return request.send_info('INF_001')

@permission_classes([IsAuthenticated])
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
                    scaledScore = data['scaledScore']

                    # UserScore instance байгаа үгүйг шалгана
                    existing_user_score = UserScore.objects.filter(
                        Q(user_id=user_id) & Q(lesson_name=lesson_name) & Q(year = year) & Q(semester=semester) &Q(scaledScore = scaledScore)
                    ).first()

                    # Хэрэв оноо байх үед
                    if existing_user_score:
                        existing_user_score.percentage_score = data['percentage_score']
                        existing_user_score.raw_score = data['raw_score']
                        existing_user_score.word_score = data['word_score']
                        existing_user_score.exam_loc = data['exam_loc']
                        existing_user_score.exam_loc_code = data['exam_loc_code']
                        existing_user_score.school_name = data['school_name']
                        existing_user_score.semester = data['semester']
                        existing_user_score.school_code = data['school_code']
                        existing_user_score.year = data['year']
                        existing_user_score.scaledScore = data['scaledScore']
                        update_data_list.append(existing_user_score)
                    else:
                    # Шинэ OBJECT үүсгэх
                        bulk_update_datas.append(UserScore(**data))

                # Bulk Шинэ OBJECT үүсгэх
                UserScore.objects.bulk_create(bulk_update_datas)

                # Bulk update existing instances
                UserScore.objects.bulk_update(update_data_list, [
                     'percentage_score', 'raw_score', 'word_score',
                    'exam_loc', 'exam_loc_code', 'school_name', 'school_code', 'scaledScore'
                ])

            #UserScore бүх датаг UserScoreSerializer ашиглан датаг авна
            all_datas = UserScore.objects.filter(user__admissionuserprofession__profession = profession)

            return_datas = UserScoreSerializer(all_datas, many=True).data

        except Exception as e:
            return Response({'error': str(e)}, status=500)

        #is_success false үед тэнцээгүй сурагчдын төлөвийг өөрчилж хадгалах
        failed_entries = [item for item in return_datas if not item['is_success']]
        success_entries = [item for item in return_datas if item['is_success']]

        with transaction.atomic():
            for item in failed_entries:
                user_id = item['user']
                admission_user_data = AdmissionUserProfession.objects.get(user__id=user_id)
                admission_user_data.state = AdmissionUserProfession.STATE_REJECT
                admission_user_data.state_description = 'Монгол хэл бичигийн шалгалтанд тэнцээгүй'
                admission_user_data.yesh_mhb_state = AdmissionUserProfession.STATE_REJECT
                admission_user_data.yesh_mhb_description = 'Монгол хэл бичигийн шалгалтанд тэнцээгүй'
                admission_user_data.save()

            for item in success_entries:
                user_id = item['user']
                admission_user_data = AdmissionUserProfession.objects.get(user__id=user_id)
                admission_user_data.yesh_mhb_state = AdmissionUserProfession.STATE_APPROVE
                admission_user_data.yesh_mhb_description = 'Монгол хэл бичигийн шалгалтанд тэнцсэн'
                admission_user_data.state_description = ''
                admission_user_data.state = AdmissionUserProfession.STATE_SEND
                admission_user_data.save()

        #AdmissionUserProfession тэнцсэн тэнцээгүй сурагч
        failed_student = queryset.filter(yesh_mhb_state = AdmissionUserProfession.STATE_REJECT).count()
        passed_student = queryset.filter(Q(yesh_mhb_state=AdmissionUserProfession.STATE_APPROVE)).count()

        send_data = {
            'total_count' : failed_student + passed_student,
            'failed_student_count': failed_student,
            'passed_student_count': passed_student,
        }

        return request.send_data(send_data)


@permission_classes([IsAuthenticated])
class EyeshOrderUserInfoAPIView(
      generics.GenericAPIView,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.DestroyModelMixin
):
    """ Элсэгчийн ЭЕШ ийн оноо жагсаалт харуулах """

    queryset = AdmissionUserProfession.objects.all().order_by('order_no')

    serializer_class = EyeshOrderUserInfoSerializer
    pagination_class = CustomPagination

    filter_backends = [SearchFilter]
    search_fields = ['user__first_name', 'user__register', 'user__email', 'user__last_name', 'user__mobile', 'user__code']

    def get_queryset(self):
        user_ids = UserScore.objects.values_list('user', flat=True)
        queryset = self.queryset.filter(user__in=user_ids)
        queryset = queryset.annotate(gender=(Substr('user__register', 9, 1)))
        gender = self.request.query_params.get('gender')
        # queryset = queryset.filter(state__in=[AdmissionUserProfession.STATE_SEND, AdmissionUserProfession.STATE_APPROVE])

        elselt = self.request.query_params.get('elselt')
        profession = self.request.query_params.get('profession')
        yesh_state = self.request.query_params.get('yesh_state')
        yesh_mhb_state = self.request.query_params.get('yesh_mhb_state')

        if elselt:
            queryset = queryset.filter(profession__admission=elselt)

        if profession:
            queryset = queryset.filter(profession = profession)

        if gender:
            if gender == 'Эрэгтэй':
                queryset = queryset.filter(gender__in=['1', '3', '5', '7', '9'])
            else:
                queryset = queryset.filter(gender__in=['0', '2', '4', '6', '8'])

        if yesh_state and yesh_state.isdigit():
            queryset = queryset.filter(yesh_state=yesh_state)

        if yesh_mhb_state and yesh_mhb_state.isdigit():
            queryset = queryset.filter(yesh_mhb_state=yesh_mhb_state)

        return queryset

    def get(self, request, pk = None):

        if pk:
            all_data = self.retrieve(request, pk).data

            return request.send_data(all_data)

        all_data = self.list(request).data

        return request.send_data(all_data)

    def put(self, request, pk=None):

        data = request.data
        user = data.get('user')

        sid = transaction.savepoint()
        try:
            with transaction.atomic():
                now = dt.datetime.now()
                student = self.queryset.filter(user=user).first()

                if student.yesh_state != data.get("yesh_state"):
                    StateChangeLog.objects.create(
                        user=student.user,
                        type=StateChangeLog.STATE,
                        indicator=AdmissionIndicator.EESH_EXAM,
                        now_state=student.yesh_state,
                        change_state=data.get("yesh_state"),
                        updated_user=request.user if request.user.is_authenticated else None,
                        updated_at=now
                    )

                    student.yesh_state = data.get("yesh_state")
                    student.updated_at = now
                    student.yesh_description = data.get("yesh_description")
                    student.save()
        except Exception as e:
            transaction.savepoint_rollback(sid)
            return request.send_error("ERR_004", str(e))

        return request.send_info('INF_002')


@permission_classes([IsAuthenticated])
class AdmissionUserFirstAPIView(
    generics.GenericAPIView
):
    """ Элсэлтийн анхан шат мэдээллийн төлөв шалгах """

    queryset = AdmissionUserProfession.objects.all()
    def put(self, request, pk=None):
        data = request.data

        with transaction.atomic():
            self.queryset.filter(user=data.get('user')).update(
                first_state = data.get('first_state'),
                first_description = data.get('first_description'),
            )

        return request.send_info('INF_002')