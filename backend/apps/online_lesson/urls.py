from django.urls import path
from .views import OnlineLessonListAPIView, OnlineLessonDetailAPIView, LessonMaterialDetailAPIView

urlpatterns = [
    # хичээл
    path('', OnlineLessonListAPIView.as_view(), name='online-lesson-list-create'),
    path('<int:pk>/', OnlineLessonDetailAPIView.as_view(), name='online-lesson-detail'),
    path('lesson_material/<int:pk>/', LessonMaterialDetailAPIView.as_view(), name='lesson-material-detail'),

    # Хичээлийн материал
    path('material/<int:pk>/', LessonMaterialDetailAPIView.as_view()),
    path('material/', LessonMaterialDetailAPIView.as_view()),
]
