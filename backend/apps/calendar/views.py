from rest_framework import mixins
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes

from django.db import transaction
from django.db.models import F

from main.utils.function.utils import remove_key_from_dict
from main.utils.function.utils import get_week_num_from_date

from lms.models import LearningCalendar

from .serializers import LearningCalendarListeSerializer
from .serializers import LearningCalVolentoorSerializer


@permission_classes([IsAuthenticated])
class LearningCalendarAPIView(
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    mixins.DestroyModelMixin,
    mixins.UpdateModelMixin,
    generics.GenericAPIView,
    mixins.RetrieveModelMixin
):
    """ Сургалтын хуанли """

    queryset = LearningCalendar.objects.all().distinct('title', 'organiser')
    serializer_class = LearningCalendarListeSerializer

    def get(self, request, pk=None):
        " Сургалтын хуанлийн жагсаалт "

        scopeType = self.request.query_params.getlist('scopeType')
        org = getattr(request, 'org_filter', {}).get('org')

        if org:
            self.queryset = self.queryset.filter(org=org)

        return_datas = dict()
        calendar_qs = self.queryset
        active_week = get_week_num_from_date()

        if not pk:
            calendar_qs = calendar_qs.filter(scope__in=scopeType)

        if pk:
            calendar_qs = calendar_qs.filter(id=pk)

        calendar_qs = calendar_qs.values(
                "scope",
                "organiser",
                "description",
                "action_type",
                "title",
                "start",
                "end",
                "color",
                cal_id=F("id"),
            )

        return_datas = {
            'active_week': active_week,
            'datas': list(calendar_qs)
        }

        return request.send_data(return_datas)

    def post(self, request):
        " Сургалтын үйл ажиллагаа үүсгэх "

        request_data = request.data
        scope_ids = request_data.get('scope_ids')
        title = request_data.get('title')
        organiser = request_data.get('organiser')
        start = request_data.get('start')
        end = request_data.get('end')
        description = request_data.get('description')
        action_type = request_data.get('action_type')
        org = getattr(request, 'org_filter', {}).get('org')

        if not org:
            return request.send_error("ERR_002", "Үйл ажиллагаа нэмэх эрхгүй байна")

        request_data["org"] = org.id

        request_data = remove_key_from_dict(request_data, 'scope')

        serializer = self.get_serializer(data=request_data)

        if serializer.is_valid(raise_exception=False):
            is_success = False
            with transaction.atomic():
                try:
                    if scope_ids:
                        for scope in scope_ids:
                            scope_id = scope.get('id')
                            scope_color = scope.get('color')
                            LearningCalendar.objects.create(
                                end=end,
                                org_id=org.id,
                                title=title,
                                start=start,
                                scope=scope_id,
                                color=scope_color,
                                organiser=organiser,
                                description=description,
                                action_type=action_type,
                            )
                    else:
                        self.create(request).data

                    is_success = True
                except Exception:
                    raise
            if is_success:
                return request.send_info("INF_001")

            return request.send_error("ERR_002")
        else:
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

    def put(self, request, pk=None):
        '''
            Үйл ажиллагаа засах
        '''

        request_data = request.data

        instance = self.get_object()

        serializer = self.get_serializer(instance, data=request_data)

        if serializer.is_valid(raise_exception=False):
            is_success = False
            with transaction.atomic():
                try:
                    self.update(request).data
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
        " Үйл ажиллагаа устгах "

        self.destroy(request, pk)
        return request.send_info("INF_003")

class VolentuurAPIView(
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    generics.GenericAPIView,
):
    """ Сургалтын хуанли дээрх үйл ажиллагааны төрөл """

    queryset = LearningCalendar.objects
    serializer_class = LearningCalVolentoorSerializer

    def get(self, request, pk=None):
        " Олон нийтийн ажилд оролцох төрлийн жагсаалт "

        self.queryset = self.queryset.filter(action_type=LearningCalendar.VOLUNTEER, scope=LearningCalendar.STUDENT)
        self.queryset = self.queryset.filter(action_type=LearningCalendar.VOLUNTEER)
        if pk:
            data = self.retrieve(request, pk).data
            return request.send_data(data)

        return_data = self.list(request).data

        return request.send_data(return_data)
