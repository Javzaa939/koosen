from django.urls import path

from .views import StipendAPIView
from .views import StipendRequestAPIView
from .views import StipendFileAPIView
from .views import StatisticsInfoAPIView

urlpatterns = [
    # Тэтгэлэг бүртгэл
    path('register/', StipendAPIView.as_view() ),
    path('register/<int:pk>/', StipendAPIView.as_view() ),
    path('register/file/', StipendFileAPIView.as_view()),

    # Тэтгэлэг хүсэлт
    path('request/', StipendRequestAPIView.as_view() ),
    path('request/<int:pk>/', StipendRequestAPIView.as_view() ),

    # Тэтгэлэг статистикийн мэдээ
    path('information/', StatisticsInfoAPIView.as_view() )
]
