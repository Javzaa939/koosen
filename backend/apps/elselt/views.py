from rest_framework import mixins
from rest_framework import generics

from django.db import transaction

from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes
from main.utils.function.utils import has_permission
from main.utils.function.pagination import CustomPagination


from lms.models import (
    AdmissionRegister,
    ContactInfo
)

from .serializer import (
    AdmissionSerializer,
    ElseltSysInfoSerializer
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

        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid(raise_exception=False):
            self.perform_create(serializer)
        else:
            return request.send_error_valid(serializer.errors)

        return request.send_info('INF_001')

    def put(self, request, pk=None):
        instance = self.get_object()
        serializer = self.get_serializer(instance=instance, data=request.data, partial=True)
        if serializer.is_valid(raise_exception=False):
            self.perform_update(serializer)
        else:
            return request.send_error_valid(serializer.errors)

        return request.send_info('INF_002')

    def delete(self, request, pk=None):
        self.destroy(request, pk)

        return request.send_info("INF_003")


class ElseltProfession(
    generics.GenericAPIView
):
    """ Элсэлтийн мэргэжил """

    def get(self, request):
        elselt = request.query_params.get('elselt')
        return request.send_data([])

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

        datas = []
        info = self.queryset.first()

        datas = self.list(request).data

        return request.send_data(datas)


    def post(self, request):

        data = request.data
        contact_info_serializer = ElseltSysInfoSerializer(data=data)
        if not contact_info_serializer.is_valid():
            return request.send_error_valid(contact_info_serializer.errors)

        contact_info_serializer.save()
        return request.send_info("INF_001")


    def put(self, request, pk=None):

        data = request.data
        instance = self.get_object()
        errors = []

        # contact_info_serializer = ElseltSysInfoSerializer(data=data)
        # if not contact_info_serializer.is_valid():
        #     return request.send_error_valid(contact_info_serializer.errors)

        # contact_info_serializer.save()
        serializer = self.get_serializer(instance, data=data)
        if serializer.is_valid(raise_exception=True):
            self.update(request, pk)
            print(serializer.errors,'errors')

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

