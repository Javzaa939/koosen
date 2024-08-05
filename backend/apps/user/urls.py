from django.urls import path

from .views import UserDetailAPI
from .views import UserAPILoginView
from .views import UserAPILogoutView
from .views import UserMenuAPI
from .views import UserForgotPasswordAPI
from .views import UserForgotPasswordConfirmAPI

urlpatterns = [
    path('login/', UserAPILoginView.as_view()),
    path('logged/', UserAPILoginView.as_view()),
    path('logout/', UserAPILogoutView.as_view()),
    path('access-history/', UserDetailAPI.as_view()),
    path('menu/', UserMenuAPI.as_view()),
    path('forgot-password/', UserForgotPasswordAPI.as_view()),
    path('forgot-password-confirm/', UserForgotPasswordConfirmAPI.as_view())
]