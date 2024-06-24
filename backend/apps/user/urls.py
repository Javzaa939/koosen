from django.urls import path

from .views import UserDetailAPI
from .views import UserAPILoginView
from .views import UserAPILogoutView
from .views import UserMenuAPI

urlpatterns = [
    path('login/', UserAPILoginView.as_view()),
    path('logged/', UserAPILoginView.as_view()),
    path('logout/', UserAPILogoutView.as_view()),
    path('access-history/', UserDetailAPI.as_view()),
    path('menu/', UserMenuAPI.as_view())
]