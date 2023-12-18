from django.urls import path

from .views import *

urlpatterns = [
    # Сургалтын төлбөрийн эхний үлдэгдэл
    path('beginbalance/', BeginBalanceAPIView.as_view()),
    path('beginbalance/<int:pk>/', BeginBalanceAPIView.as_view()),

    # Сургалтын төлбөрийн гүйлгээ
    path('paymentbalance/', PaymentBalanceAPIView.as_view()),
    path('paymentbalance/<int:pk>/', PaymentBalanceAPIView.as_view()),

    # Сургалтын төлбөрийн тохиргоо
    path('paymentsettings/', PaymentSettingsAPIView.as_view()),
    path('paymentsettings/<int:pk>/', PaymentSettingsAPIView.as_view()),

    # Сургалтын төлбөрийн тооцоо
    path('estimate/', PaymentEstimateAPIView.as_view()),

    # Сургалтын төлбөрийн хөнгөлөлт
    path('discount/', PaymentDiscountAPIView.as_view()),
    path('discount/<int:pk>/', PaymentDiscountAPIView.as_view()),

    # Сургалтын төлбөрийн улирлын хаалт
    path('seasonclosed/', SeasonClosingAPIView.as_view()),

]
