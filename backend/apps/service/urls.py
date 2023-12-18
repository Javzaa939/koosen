from django.urls import path

from .views import StudentNoticeAPIView
from .views import StudentNoticeFileAPIView

urlpatterns = [

    # Зар мэдээ
    path('news/', StudentNoticeAPIView.as_view()),
    path('news/<int:pk>/', StudentNoticeAPIView.as_view()),
    path('news/file/', StudentNoticeFileAPIView.as_view()),

]
