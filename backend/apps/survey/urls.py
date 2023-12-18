from django.urls import path

from .views import (
    SurveyQuestionsAPIView,
    PolleeApiView,
    SurveyRangeAPIView,
    SurveyAPIView,
    SurveyAllListAPIView
)

urlpatterns = [
    path('', SurveyAPIView.as_view()),
    path('list/', SurveyAllListAPIView.as_view()),
    path('<int:pk>/', SurveyAPIView.as_view()),

    # Багшийг үнэлэх судалгааны асуулт
    path('questions/', SurveyQuestionsAPIView.as_view()),
    path('questions/<int:pk>/', SurveyQuestionsAPIView.as_view()),


    # Судалгааны асуултны хариулт
    path('pollee/', PolleeApiView.as_view()),
    path('pollee/<int:pk>/', PolleeApiView.as_view()),

    path('surveyrange/', SurveyRangeAPIView.as_view()),
    path('surveyrange/<int:pk>', SurveyRangeAPIView.as_view()),
]
