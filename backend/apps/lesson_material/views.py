from rest_framework import mixins
from rest_framework import generics
from lms.models import LessonMaterial
from .serializer import LessonMaterialSerializer

class LessonMaterialAPIView(
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    generics.GenericAPIView,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    mixins.RetrieveModelMixin,
):
    queryset = LessonMaterial.objects.all()
    serializer_class = LessonMaterialSerializer

    def get(self, request):

        return_datas = self.list(request).data

        return request.send_data(return_datas)

    # def post(self, request):
    #     data = request.data
    #     serializer = self.get_serializer(data=data)

    #     if serializer.is_valid(raise_exception = False):