from django.urls import path

from .views import *

urlpatterns = [
    path('', ElseltApiView.as_view()),
    path('desc/<int:pk>/', ElseltDescApiView.as_view()),
    path('<int:pk>/', ElseltApiView.as_view()),
    path('all/', AdmissionYearAPIView.as_view()),
    path('all/active/', AdmissionYearActiveAPIView.as_view()),

    path('dashboard/', DashboardAPIView.as_view()),
    path('dashboard/excel/', DashboardExcelAPIView.as_view()),

    # Элсэгчдийн мэдээлэл
    path('admissionuserdata/', AdmissionUserInfoAPIView.as_view()),
    path('admissionuserdata/<int:pk>/', AdmissionUserInfoAPIView.as_view()),
    path('admissionuserdata/all/', AdmissionUserAllChange.as_view()),
    path('admissionuserdata/gpa_check/',GpaCheckUserInfoAPIView.as_view()),
    path('admissionuserdata/gpa_check/confirm/',GpaCheckConfirmUserInfoAPIView.as_view()),
    path('admissionuserdata/eyesh_check/',EyeshCheckUserInfoAPIView.as_view()),

    path('profession/', ElseltProfession.as_view()),
    path('profession/<int:pk>/', ElseltProfession.as_view()),

    # Элсэлт явагдаж байгаа хөтөлбөрийн жагсаалт
    path('profession/list/', ElseltActiveListProfession.as_view()),

    # Элсэлтийн системийн мэдээлэл
    path('sysinfo/', ElseltSysInfo.as_view()),
    path('sysinfo/<int:pk>/', ElseltSysInfo.as_view()),
    path('profession/shalguur/', ProfessionShalguur.as_view()),
    path('gpa/<int:pk>/', AdmissionGpaAPIView.as_view()),

    # Элсэгчдэд мэдээлэл илгээх хэсэг
    path('admissionuserdata/email/', AdmissionUserEmailAPIView.as_view()),

    # Элсэгчдэд мессеж илгээх хэсэг
    path('admissionuserdata/message/', AdmissionUserMessageAPIView.as_view()),

    # Эрүүл мэнд анхан шатны үзлэг
    path('justice/', AdmissionJusticeListAPIView.as_view()),
    path('justice/<int:pk>/', AdmissionJusticeListAPIView.as_view()),

    # Эрүүл мэнд анхан шатны үзлэг
    path('health/anhan/', ElseltHealthAnhanShat.as_view()),
    path('health/anhan/<int:pk>/', ElseltHealthAnhanShat.as_view()),

    # Эрүүл мэнд мэргэжлийн үзлэг хэсэг
    path('health/professional/', ElseltHealthProfessional.as_view()),
    path('health/professional/<int:pk>/', ElseltHealthProfessional.as_view()),

    # Эрүүл мэнд бие бялдарын үзлэг
    path('health/physical/', ElseltHealthPhysical.as_view()),
    path('health/physical/<int:pk>/', ElseltHealthPhysical.as_view()),

    # Эрүүл мэндийн нарийвчилсан мэдээллийг хадгалах with POSTMAN
    path('health-up/create', ElseltHealthPhysicalCreateAPIView.as_view()),

    # Бүх шалгуурыг даваад тэнцсэн жагсаалт
    path('approve/', ElseltStateApprove.as_view()),

    # Элсэгчдийн ярилцлага
    path('interview/',ConversationUserSerializerAPIView.as_view()),
    path('interview/<int:pk>/', ConversationUserSerializerAPIView.as_view()),

]

