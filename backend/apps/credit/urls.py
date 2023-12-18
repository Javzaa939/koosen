from django.urls import path

from .views import *

urlpatterns = [

    # Багшийн цагийн ачаалал
    path('volume/', TeacherCreditVolumePlanAPIView.as_view()),
    path('volume/<int:pk>/', TeacherCreditVolumePlanAPIView.as_view()),
    path('volume/estimate/', TeacherCreditVolumePlanEstimateAPIView.as_view()),
    path('volume/print/', TeacherCreditVolumePlanPrintAPIView.as_view()),

    # Цагийн ачаалал тохиргоо
    path('settings/', CreditSettingsAPIView.as_view()),
    path('settings/<int:pk>/', CreditSettingsAPIView.as_view()),
    path('settings/all/', CreditSettingsAllAPIView.as_view()),

    path('settings/performance/', CreditSettingsPerformancePIView.as_view()),
    path('settings/performance/<int:pk>/', CreditSettingsPerformancePIView.as_view()),

    # A цагийн тооцоо
    path('a_estimation/', TeacherAEstimationAPIView.as_view()),
    path('a_estimation/<int:pk>/', TeacherAEstimationAPIView.as_view()),
    path('a_estimation/estimate/', TeacherAEstimationEstimateAPIView.as_view()),
    # path('a_estimation/print/', TeacherAEstimationPrintAPIView.as_view()),

    # Танхимийн бус цагийн төрөл
    path('a_estimation/chamber/', TeacherAEstimationChamberAPIView.as_view()),

    # Цагийн багшийн тооцооны нэгтгэл
    path('part-time/', TeacherPartTime.as_view())
]
