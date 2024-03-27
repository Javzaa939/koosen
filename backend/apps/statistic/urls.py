from django.urls import path

from .views import *

urlpatterns = [

    # статистик
    path('db1/', StatisticAPIView.as_view()),
    path('db3/', StatisticDB3APIView.as_view()),
    path('db4/', StatisticDB4APIView.as_view()),
    path('db5/', StatisticDB5APIView.as_view()),
    path('db6/', StatisticDB6APIView.as_view()),
    path('db7/', StatisticDB7APIView.as_view()),
    path('db8/', StatisticDB8APIView.as_view()),
    path('db9/', StatisticDB9APIView.as_view()),
    path('db10/', StatisticDB10APIView.as_view()),
    path('db12/', StatisticDB12APIView.as_view()),
    path('db14/', StatisticDB14APIView.as_view()),
    path('db16/', StatisticDB16APIView.as_view()),
    path('db17/', StatisticDB17APIView.as_view()),
    path('db18/', StatisticDB18APIView.as_view()),
]
