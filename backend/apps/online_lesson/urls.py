from django.urls import path
from .views import OnlineLessonListAPIView, OnlineLessonDetailAPIView, LessonMaterialDetailAPIView

urlpatterns = [
    # хичээл
    path('', OnlineLessonListAPIView.as_view()),
    path('<int:pk>/', OnlineLessonDetailAPIView.as_view()),

    # Хичээлийн материал
    path('material/<int:pk>/', LessonMaterialDetailAPIView.as_view()),
    path('material/', LessonMaterialDetailAPIView.as_view()),
]
