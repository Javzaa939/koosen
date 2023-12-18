from django.urls import path

from .views import StudentOrderSportAPIView
from .views import GymPaymentSettingsAPIView
from .views import StudentGymAPIView
from .views import StudentOrderHospitalAPIView
from .views import GymPaymentSettingsListAPIView
from .views import StudentOrderLibraryAPIView

urlpatterns = [

    # Спорт заалны цаг
    path('sport/', StudentOrderSportAPIView.as_view()),
    path('sport/<int:pk>/', StudentOrderSportAPIView.as_view()),

    # Эмнэлэг
    path('hospital/', StudentOrderHospitalAPIView.as_view()),
    path('hospital/<int:pk>/', StudentOrderHospitalAPIView.as_view()),

    # Фитнесийн төлбөрийн тохиргоо
    path('gym/payment/', GymPaymentSettingsAPIView.as_view()),
    path('gym/payment/<int:pk>/', GymPaymentSettingsAPIView.as_view()),
    path('gym/payment/list/', GymPaymentSettingsListAPIView.as_view()),

    # Фитнест бүртгүүлсэн оюутаны жагсаалт
    path('gym/student/', StudentGymAPIView.as_view()),
    path('gym/student/<int:pk>/', StudentGymAPIView.as_view()),

    # Номын санд цаг захиалсан оюутны жагсаалт
    path('library/', StudentOrderLibraryAPIView.as_view()),
    path('library/<int:pk>/', StudentOrderLibraryAPIView.as_view()),

]
