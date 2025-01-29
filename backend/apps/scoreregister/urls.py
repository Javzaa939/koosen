from django.urls import path

from .views import *

urlpatterns = [

    # Дүнгийн бүртгэл
    path('register/', ScoreRegisterAPIView.as_view()),
    path('register/<int:pk>/', ScoreRegisterAPIView.as_view()),

    path('register/list/', ScoreRegisterListAPIView.as_view()),
    path('register/download/', ScoreTeacherDownloadAPIView.as_view()),
    path('register/old/', ScoreOldAPIView.as_view()),
    path('register/old/v2/', ScoreOldV2APIView.as_view()),
    path('register/old/<int:pk>/', ScoreOldAPIView.as_view()),
    path('register/import/', ScoreImportAPIView.as_view()),

    # path('register/student/', ScoreRegisterStudentView.as_view()),

    # Дүйцүүлсэн дүн
    path('correspond/', CorrespondAPIView.as_view()),
    path('correspond/<int:pk>/', CorrespondAPIView.as_view()),

    # Дахин шалгалтын дүн
    path('rescore/', ReScoreAPIView.as_view()),
    path('rescore/student/', ReScoreStudentView.as_view()),
    path('rescore/<int:pk>/', ReScoreAPIView.as_view()),

    # Score info. Shows students list by lesson. Print button in "Цагийн хуваарь/Шалгалтын хуваарь" page
    path('print/', TeacherLessonScorePrintAPIView.as_view()),
    path('print/re_exam/', ReExamTeacherLessonScorePrintAPIView.as_view()),

    # дүнгийн тодорхойлолт
    path('print/<int:student>/', ScoreRegisterPrintAPIView.as_view()),

    path('register/refresh/<int:group>/', ScoreRefreshAPIView.as_view()),
    path('register/challenge/<int:lesson>/', ScoreRegisterLessonAPIView.as_view()),

    # Явцын оноо
    path('teacher-score/', TeacherScoreAPIView.as_view()),

    # Явцын дүн тайлан
	path('teacher-score/report/school/', TeacherScoreReportSchoolAPIView.as_view()),
]
