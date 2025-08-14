from django.urls import path

from .views import *


urlpatterns = [

    # Оюутны байрны өрөөний бүртгэл
    path('room/', DormitoryRoomAPIView.as_view()),
    path('room/<int:pk>/', DormitoryRoomAPIView.as_view()),
    path('room/list/', DormitoryRoomListAPIView.as_view()),

    # Оюутны байрны өрөөний төрөл
    path('type/', DormitoryRoomTypeAPIView.as_view()),
    path('type/list/', DormitoryRoomTypeListAPIView.as_view()),
    path('type/<int:pk>/', DormitoryRoomTypeAPIView.as_view()),
    path('type/file/<int:pk>/', DormitoryRoomTypeFileAPIView.as_view()),

    # Оюутны байранд амьдрах хүсэлт шийдвэрлэх
    path('request/', DormitoryRequestAPIView.as_view()),
    path('request/<int:pk>/', DormitoryRequestAPIView.as_view()),

    # Оюутны байранд амьдрах гадны оюутны хүсэлт шийдвэрлэх
    path('request/another/', DormitoryAnotherStudentRequestAPIView.as_view()),
    path('request/another/<int:pk>/', DormitoryAnotherStudentRequestAPIView.as_view()),

    # Дотуур байранд амьдрах гадны айлын хүсэлт
    path('request/rent/', DormitoryFamilyContractAPIView.as_view()),
    path('request/rent/<int:pk>/', DormitoryFamilyContractAPIView.as_view()),

    # Оюутны байрны төлбөрийн тохиргоо
    path('payment/', DormitoryPaymentAPIView.as_view()),
    path('payment/<int:pk>/', DormitoryPaymentAPIView.as_view()),

    # ------------------- Оюутны байрны төлбөрийн тооцоо --------------------
    path('estimate/our/', OurDormitoryStudentEstimateAPIView.as_view()),
    path('estimate/our/<int:pk>/', OurDormitoryStudentEstimateAPIView.as_view()),

    path('estimate/another/', DormitoryOtherStudentEstimateRequestAPIView.as_view()),
    path('estimate/another/<int:pk>/', DormitoryOtherStudentEstimateRequestAPIView.as_view()),

    path('estimate/family/', DormitoryEstimationFamilyEstimateRequestAPIView.as_view()),
    path('estimate/family/<int:pk>/', DormitoryEstimationFamilyEstimateRequestAPIView.as_view()),

]
