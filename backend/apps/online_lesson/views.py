from rest_framework import generics, mixins
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes
from lms.models import OnlineLesson, LessonMaterial
from .serializers import OnlineLessonSerializer, LessonMaterialSerializer
from django.db.models import Count

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
            instance = LessonMaterial.objects.filter(user=pk)
            return_datas = self.get_serializer(instance,many=True).data
            return request.send_data(return_datas)

        counts = LessonMaterial.objects.values('user').annotate(count=Count('id'))
        
        # Creating a dictionary for a more user-friendly response
        result = {item['user']: item['count'] for item in counts}
        
        return request.send_data(result)

    def post(self,request):

       return self.create(request)

    def delete(self, request, pk=None):
        if pk:
            self.destroy(request, pk)
            return request.send_info("INF_003")
        return request.send_info("No pk")

    # def get(self, request, *args, **kwargs):
    #     return self.retrieve(request, *args, **kwargs)
