import requests

from rest_framework import generics, mixins
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser
from rest_framework.decorators import permission_classes
from rest_framework.decorators import parser_classes

from django.shortcuts import get_object_or_404
from django.conf import settings
from django.utils import timezone

from lms.models import OnlineLesson, LessonMaterial
from .serializers import OnlineLessonSerializer, LessonMaterialSerializer

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

# @permission_classes([IsAuthenticated])
class LessonMaterialDetailAPIView(
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    generics.GenericAPIView,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    mixins.RetrieveModelMixin,
):
    """ Online хичээлийн API"""

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

    @parser_classes([MultiPartParser])
    def post(self, request):
     serializer = self.get_serializer(data=request.data)

     if serializer.is_valid():
        file = request.FILES.get('path')

        # CDN server дээр файлаа хадгалах url
        cdn_url = 'http://127.0.0.1:8001/cdn/save-file/'

        # Хадгалах зам
        path = settings.ONLINE_LESSON

        cdn_data = {
            'path':path
        }
        files = {'file':file}

        # CDN server дээр файлаа хадгалах post method
        response = requests.post(cdn_url, data = cdn_data,files=files)

        # CDN server дээр файлаа шалгах url
        cdn_get_url = 'http://127.0.0.1:8001/cdn/check-file/'

        # Зөвхөн файлийн нэрийг авна
        file_name = file.name

        cdn_get_data = {
            'path':path,
            'is_file':file_name
        }

        # CDN server дээр файлаа шалгах get method
        get_response = requests.get(cdn_get_url , json = cdn_get_data)
        get_response_data = get_response.json()

        # Хэрэв тухайн файл үүссэн байвал
        if get_response_data.get('success'):

            # Тухайн cdn server файлийг хадгалсан full path  ийг буцааж байгаа
            full_path = get_response_data.get('data', {}).get('full_path')

            # Тухайн file-ийн мэдээллийг base руу хадгалах үйлдэл
            serializer.validated_data['material_type'] = request.data.get('material_type')
            serializer.validated_data['path'] = full_path
            serializer.validated_data['created_at'] = timezone.now()
            self.perform_create(serializer)

            return request.send_info("INF_001")

    def delete(self, request, pk=None):

        if pk:
            file = get_object_or_404(LessonMaterial,id=pk)

            # Base аас path ийн авах
            file_path = str(file.path)

            # CDN server delete url
            cdn_delete_url = 'http://127.0.0.1:8001/cdn/delete-file/'
            cdn_delete_data = {
                'path':file_path,
                'is_file':True
            }

            # CDN SERVER delete method
            response = requests.delete(cdn_delete_url , json = cdn_delete_data)

            data = response.json()

            # Хэрэв тухайн файл server-ээс устсан бол True буцаан тэр үед base-аас устган
            if data.get('success'):
                file.delete()

                return request.send_info("INF_003")

            else:
                return request.send_error("ERR_002")

        return request.send_info("Тухайн файл олдсонгүй")
