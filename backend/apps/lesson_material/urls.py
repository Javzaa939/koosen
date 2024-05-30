from django.urls import path
from .views import *

urlpatterns = [
    path('material/', LessonMaterialAPIView.as_view())
]