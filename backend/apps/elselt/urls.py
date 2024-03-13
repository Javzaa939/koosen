from django.urls import path

from .views import *

urlpatterns = [
    path('', ElseltApiView.as_view()),
    path('<int:pk>/', ElseltApiView.as_view()),
    path('all/', AdmissionYearAPIView.as_view()),

    # Элсэгчдийн мэдээлэл
    path('admissionuserdata/', AdmissionUserInfoAPIView.as_view()),
    path('admissionuserdata/<int:pk>/', AdmissionUserInfoAPIView.as_view()),

    path('profession/', ElseltProfession.as_view()),
    path('profession/<int:pk>/', ElseltProfession.as_view()),

    # Элсэлт явагдаж байгаа хөтөлбөрийн жагсаалт
    path('profession/list/', ElseltActiveListProfession.as_view()),

    # Элсэлтийн системийн мэдээлэл
    path('sysinfo/', ElseltSysInfo.as_view()),
    path('sysinfo/<int:pk>/', ElseltSysInfo.as_view()),
    path('profession/shalguur/', ProfessionShalguur.as_view()),
    path('gpa/<int:pk>/', AdmissionGpaAPIView.as_view())
]