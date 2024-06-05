import os
from rest_framework import generics, mixins
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes
from lms.models import OnlineLesson, LessonMaterial
from .serializers import OnlineLessonSerializer, LessonMaterialSerializer, LessonMaterialPostSerializer
from django.shortcuts import get_object_or_404
from django.conf import settings
from main.utils.function.utils import get_domain_url
from main.utils.file import save_file
from django.utils import timezone

from rest_framework.response import Response
from rest_framework.status import HTTP_201_CREATED

# OnlineLesson List and Create View
@permission_classes([IsAuthenticated])
class OnlineLessonListAPIView(
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    generics.GenericAPIView
):
    ''' Handles listing and creating online lessons '''
    queryset = OnlineLesson.objects.all()
    serializer_class = OnlineLessonSerializer

    def get(self, request, *args, **kwargs):
        return self.list(request, *args, **kwargs)

    def post(self, request, *args, **kwargs):
         return self.create(request, *args, **kwargs)

# OnlineLesson Retrieve, Update, and Delete View
@permission_classes([IsAuthenticated])
class OnlineLessonDetailAPIView(
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    mixins.ListModelMixin,
    generics.GenericAPIView
):
    ''' Онлайн хичээл '''
    queryset = OnlineLesson.objects.all()
    serializer_class = OnlineLessonSerializer

    def get(self, request, pk=None):
        return self.retrieve(request)

    def put(self, request, *args, **kwargs):
        return self.update(request, *args, **kwargs)

    def delete(self, request, *args, **kwargs):
        return self.destroy(request, *args, **kwargs)


    # Онлайн хичээлийн file хэсэг
# @permission_classes([IsAuthenticated])
class LessonMaterialDetailAPIView(
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    generics.GenericAPIView,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    mixins.RetrieveModelMixin,
):
    queryset = LessonMaterial.objects.all()
    serializer_class = LessonMaterialSerializer

    def get(self,request,pk=None):
        if pk:
            instance = LessonMaterial.objects.filter(user=pk).distinct('user')
            return_datas = self.get_serializer(instance,many=True).data
            return request.send_data(return_datas)

        self.queryset = self.queryset.distinct('user')
        serializer = self.list(request).data
        return request.send_data(serializer)

    def post(self, request):
     serializer = self.get_serializer(data=request.data)
     if serializer.is_valid():
        file = request.data.get('path')
        path = save_file(file, 'online_lesson', settings.EFILE)
        domain = get_domain_url()
        file_path = os.path.join(settings.MEDIA_URL, path)
        return_url = '{}{}'.format(domain, file_path)
        serializer.validated_data['material_type'] = request.data.get('material_type')
        serializer.validated_data['path'] = return_url
        serializer.validated_data['created_at'] = timezone.now()
        self.perform_create(serializer)
        return request.send_info("INF_001")

    def delete(self, request, pk=None):
        if pk:
            file = get_object_or_404(LessonMaterial,id=pk)
            file.delete()
            return request.send_info("INF_003")
        return request.send_info("No pk")
