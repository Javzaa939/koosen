from django.urls import path

from .views import *

urlpatterns = [
    path('', ElseltApiView.as_view()),
    path('<int:pk>/', ElseltApiView.as_view()),

    path('profession/', ElseltProfession.as_view()),
    path('profession/<int:pk>/', ElseltProfession.as_view()),

    # Элсэлтийн системийн мэдээлэл
    path('sysinfo/', ElseltSysInfo.as_view()),
    path('sysinfo/<int:pk>/', ElseltSysInfo.as_view()),
    path('profession/shalguur/', ProfessionShalguur.as_view())
]