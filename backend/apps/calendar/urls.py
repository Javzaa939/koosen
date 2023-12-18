from django.urls import path

from .views import LearningCalendarAPIView
from .views import VolentuurAPIView


urlpatterns = [
    path('info/', LearningCalendarAPIView.as_view()),
    path('info/<int:pk>/', LearningCalendarAPIView.as_view()),

    path('volentuur/', VolentuurAPIView.as_view()),
    path('volentuur/<int:pk>/', VolentuurAPIView.as_view()),

]
