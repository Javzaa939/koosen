from django.urls import path
from .views import StudentListByLessonTeacherAPIView
from .views import ScheduleAPIView
from .views import GpaAPIView
from .views import *

urlpatterns = [
    path('choice/', StudentListByLessonTeacherAPIView.as_view()),

    # Хичээлийн хуваарь
    path('schedule/', ScheduleAPIView.as_view()),

    # Голч дүн
    path('gpa/', GpaAPIView.as_view()),

    # анги дүн
    path('group/', GroupListAPIView.as_view()),

    # анги дүн
    path('groupnolimit/', GroupListNoLimitAPIView.as_view()),

    # Ангийн жагсаалт
    path('groupsubschool/', GroupsListFilterWithSubSchoolApiView.as_view()),

    # хичээл дүн
    path('lesson/', LessonListAPIView.as_view()),

    # оюутан дүн
    path('student/', StudentListAPIView.as_view()),

    #  Төгсөлтийн ажил
    path('graduationwork/', GraduationWorkAPIView.as_view()),

    #  Элсэлтийн тушаал
    path('admission/', AdmissionAPIView.as_view()),

    #  Элсэлтийн тушаал хэвлэх
    path('admission/print/', AdmissionPrintAPIView.as_view()),

]
