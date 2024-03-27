from django.urls import path

from .views import StudentNoticeAPIView
from .views import StudentNoticeFileAPIView
from .views import StudentNoticeNotNewsAPIView
from .views import CalendarNoticeApiView


urlpatterns = [

    # Зар мэдээ
    path('news/', StudentNoticeAPIView.as_view()),
    path('news/<int:pk>/', StudentNoticeAPIView.as_view()),
    path('news/file/', StudentNoticeFileAPIView.as_view()),

    # Зөвхөн зар
    path('news/ad/', StudentNoticeNotNewsAPIView.as_view()),
    path('news/ad/<int:pk>/', StudentNoticeNotNewsAPIView.as_view()),

    # Зар мэдээ Хуанлид зориулсан
    path('news/calendar/', CalendarNoticeApiView.as_view()),

]
