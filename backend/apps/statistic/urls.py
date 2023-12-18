from django.urls import path

from .views import *

urlpatterns = [

    # статистик
    path('db1/', StatisticAPIView.as_view()),
    path('db3/', StatisticDB3APIView.as_view()),


]
