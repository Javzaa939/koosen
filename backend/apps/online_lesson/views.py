from rest_framework import generics, mixins
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes
from lms.models import OnlineLesson, LessonMaterial
from .serializers import OnlineLessonSerializer, LessonMaterialSerializer, LessonMaterialPostSerializer
from django.shortcuts import get_object_or_404

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
        self.serializer_class = LessonMaterialPostSerializer
        self.create(request)
        return request.send_info("INF_001")

    def delete(self, request, pk=None):
        if pk:
            file = get_object_or_404(LessonMaterial,id=pk)
            file.delete()
            return request.send_info("INF_003")
        return request.send_info("No pk")
