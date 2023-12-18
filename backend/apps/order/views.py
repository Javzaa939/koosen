from rest_framework import mixins
from rest_framework import generics

from datetime import date, timedelta
from django.db import transaction
from dateutil import parser

from rest_framework.filters import SearchFilter

from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes

from main.utils.function.pagination import CustomPagination

from main.utils.function.utils import override_get_queryset,str2bool,time_tango

from lms.models import Room
from lms.models import StudentGym
from lms.models import StudentOrderSport
from lms.models import GymPaymentSettings
from lms.models import StudentOrderLibrary
from lms.models import StudentOrderHospital

from .serializers import StudentOrderSportSerializer
from .serializers import StudentOrderSportListSerializer
from .serializers import GymPaymentSettingsSerializer
from .serializers import StudentGymSerializer
from .serializers import StudentOrderHospitalSerializer
from .serializers import GymPaymentSettingsListSerializer
from .serializers import StudentOrderLibrarySerializer


# ----------------- Спорт заалны цагийн бүртгэл ---------------
@permission_classes([IsAuthenticated])
class StudentOrderSportAPIView(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    generics.GenericAPIView
):
    ''' Спорт заалны цаг '''

    queryset = StudentOrderSport.objects.all()
    serializer_class = StudentOrderSportSerializer

    def get(self, request, pk=None):

        self.serializer_class = StudentOrderSportListSerializer

        return_datas = []
        now_date = date.today()
        room = request.query_params.get('room')

        # Өнөөдрөөс хойших датаг авна
        self.queryset = self.queryset.filter(day__gte=now_date)

        if pk:
            return_datas = self.retrieve(request, pk).data
            return request.send_data(return_datas)

        if room:
            self.queryset = self.queryset.filter(room=room)

            return_datas = self.list(request).data

        return request.send_data(return_datas)

    def post(self, request):
        request_data = request.data
        room = request_data.get('room')
        all_dates = request_data.get('dates')
        time_payment = request_data.get('time_payment')
        create_sport_list = list()

        # NOTE Заалны цагийг 8-21 цаг хүртэл олгоно гэж тооцоолоод эдгээр цаг орж ирэх юм бол хадгалахгүй
        delete_time_ids = ['22', '23', '00', '01', '02', '03', '04', '05', '06', '07', '08']

        with transaction.atomic():
            try:
                if all_dates:
                    pass

                for cdate in all_dates:
                    start = cdate.get('start')
                    end = cdate.get('end')
                    start_date = parser.isoparse(start)
                    end_date = parser.isoparse(end)

                    range_times = end_date - start_date
                    total_seconds = range_times.total_seconds()  # Секунд руу хөрвүүлнэ
                    td_in_hours = total_seconds // 3600          # Секундээс цагаа олно

                    # NOTE дараалсан цаг биш үед цаг бүрээр нь хадгална
                    if not int(td_in_hours) == 1:
                        start_date = parser.isoparse(start)
                        end_date = start_date + timedelta(minutes=60)

                        create_sport_list.append(
                            StudentOrderSport(
                                room=Room.objects.get(id=room),
                                day=start_date,
                                starttime=start_date,
                                endtime=end_date,
                                time_payment=time_payment,
                                order_flag=StudentOrderSport.ACTIVE,
                            )
                        )

                        i = 1
                        while i < int(td_in_hours):
                            start_date = start_date + timedelta(minutes=60)
                            end_date = start_date + timedelta(minutes=60)
                            i = i + 1

                            if end_date.strftime('%H') not in delete_time_ids:
                                create_sport_list.append(
                                    StudentOrderSport(
                                        room=Room.objects.get(id=room),
                                        day=start_date,
                                        starttime=start_date,
                                        endtime=end_date,
                                        time_payment=time_payment,
                                        order_flag=StudentOrderSport.ACTIVE,
                                    )
                                )
                    else:
                        create_sport_list.append(
                            StudentOrderSport(
                                room=Room.objects.get(id=room),
                                day=start_date,
                                starttime=start_date,
                                endtime=end_date,
                                time_payment=time_payment,
                                order_flag=StudentOrderSport.ACTIVE,
                            )
                        )

                self.queryset.bulk_create(create_sport_list)

            except Exception as e:
                print(e.__str__())
                return request.send_error("ERR_002")

        return request.send_info("INF_001")

    def delete(self, request, pk=None):
        self.destroy(request, pk)

        return request.send_info("INF_003")


# ------------------------- Эмнэлэг -----------------------------
@permission_classes([IsAuthenticated])
class StudentOrderHospitalAPIView(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    generics.GenericAPIView,
):
    ''' Эмнэлэгт цаг захиалсан оюутны жагсаалт '''

    queryset = StudentOrderHospital.objects.all()
    serializer_class = StudentOrderHospitalSerializer

    filter_backends = [SearchFilter]
    pagination_class = CustomPagination

    search_fields = [
        'day',
        'starttime',
        'endtime',
        'description',
        'student__code',
        'student__first_name',
        'student__last_name',
    ]

    def get_queryset(self):
        queryset = self.queryset

        sorting = self.request.query_params.get('sorting')
        is_today = self.request.query_params.get('is_today')
        flag = self.request.query_params.get('flag')

        if is_today:
            is_today = str2bool(is_today)
            if is_today:
                now_date = date.today()
                queryset = queryset.filter(day=now_date)

        if flag:
            queryset = queryset.filter(order_flag=flag)

        if sorting:
            if not isinstance(sorting, str):
                sorting = str(sorting)

            queryset = queryset.order_by(sorting)

        return queryset

    def get(self, request, pk=None):

        if pk:
            return_datas = self.retrieve(request, pk).data
            return request.send_data(return_datas)

        return_datas = self.list(request).data

        return request.send_data(return_datas)


# ----------------- Фитнесийн төлбөрийн тохиргоо ---------------

@permission_classes([IsAuthenticated])
class GymPaymentSettingsAPIView(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    generics.GenericAPIView
):
    ''' Фитнесийн төлбөрийн тохиргоо '''

    queryset = GymPaymentSettings.objects.all().order_by('-updated_at')
    serializer_class = GymPaymentSettingsSerializer
    pagination_class = CustomPagination

    def get_queryset(self):
        return override_get_queryset(self)

    def get(self, request, pk=None):

        if pk:
            return_datas = self.retrieve(request, pk).data
            return request.send_data(return_datas)

        return_datas = self.list(request).data

        return request.send_data(return_datas)

    def post(self, request):
        request_data = request.data

        serializer = self.get_serializer(data=request_data)

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

    def put(self, request, pk=None):

        request_data = request.data

        instance = self.get_object()

        serializer = self.get_serializer(instance, data=request_data)

        if serializer.is_valid(raise_exception=False):
            is_success = False
            with transaction.atomic():
                try:
                    self.update(request, pk)
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

    def delete(self, request, pk=None):
        self.destroy(request, pk)

        return request.send_info("INF_003")


@permission_classes([IsAuthenticated])
class GymPaymentSettingsListAPIView(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    generics.GenericAPIView,
):
    ''' Фитнесийн тохиргооны жагсаалт '''

    queryset = GymPaymentSettings.objects.all()
    serializer_class = GymPaymentSettingsListSerializer

    def get(self, request):

        return_datas = self.list(request).data

        return request.send_data(return_datas)


@permission_classes([IsAuthenticated])
class StudentGymAPIView(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    generics.GenericAPIView,
):
    ''' Фитнест бүртгүүлсэн оюутны тохиргоо '''

    queryset = StudentGym.objects.all()
    serializer_class = StudentGymSerializer

    filter_backends = [SearchFilter]
    pagination_class = CustomPagination

    search_fields = [
        'student__code',
        'student__first_name',
        'start_date',
        'gym_payment__name',
        'gym_payment__payment'
    ]

    def get_queryset(self):
        queryset = self.queryset

        sorting = self.request.query_params.get('sorting')
        gym_payment_id = self.request.query_params.get('gym_payment_id')

        if gym_payment_id:
            queryset = queryset.filter(gym_payment=gym_payment_id)

        if sorting:
            if not isinstance(sorting, str):
                sorting = str(sorting)

            queryset = queryset.order_by(sorting)

        return queryset

    def get(self, request, pk=None):

        if pk:
            return_datas = self.retrieve(request, pk).data
            return request.send_data(return_datas)

        return_datas = self.list(request).data

        return request.send_data(return_datas)


#  ----------------- Номын сан  -----------------------
@permission_classes([IsAuthenticated])
class StudentOrderLibraryAPIView(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    generics.GenericAPIView,
):
    ''' Номын санд цаг захиалсан оюутны жагсаалт  '''

    queryset = StudentOrderLibrary.objects.all().order_by('room', 'chair_num')
    serializer_class = StudentOrderLibrarySerializer

    filter_backends = [SearchFilter]
    pagination_class = CustomPagination

    search_fields = [
        'student__code',
        'student__first_name',
        'student__last_name',
        'day',
        'starttime',
        'endtime',
        'chair_num',
    ]

    def get_queryset(self):
        queryset = self.queryset

        sorting = self.request.query_params.get('sorting')
        room_id = self.request.query_params.get('room')
        is_today = self.request.query_params.get('is_today')
        flag = self.request.query_params.get('flag')

        if is_today:
            is_today = str2bool(is_today)
            if is_today:
                now_date = date.today()
                queryset = queryset.filter(day=now_date)

        if flag:
            queryset = queryset.filter(order_flag=flag)

        if room_id:
            queryset = queryset.filter(room=room_id)

        if sorting:
            if not isinstance(sorting, str):
                sorting = str(sorting)

            queryset = queryset.order_by(sorting)

        return queryset

    def get(self, request, pk=None):

        if pk:
            return_datas = self.retrieve(request, pk).data
            return request.send_data(return_datas)

        return_datas = self.list(request).data

        return request.send_data(return_datas)
