from django.urls import path

from .views import LessonStandartAPIView
from .views import LessonStandartListAPIView
from .views import ProfessionDefinitionAPIView
from .views import ProfessionDefinitionListAPIView
from .views import ProfessionIntroductionFileAPIView
from .views import LearningPlanAPIView
from .views import LearningPlanListAPIView
from .views import ConfirmYearListAPIView
from .views import LessonStandartStudentListAPIView
from .views import LessonStandartDiplomaListAPIView
from .views import ProfessionPlanListAPIView
from .views import LessonStandartBagtsAPIView
from .views import LessonTitlePlanAPIView
from .views import LearningPlanProfessionDefinitionAPIView
from .views import ProfessionPrintPlanAPIView
from .views import AdmissionBottomScoreAPIView
from .views import LessonStandartTimetableListAPIView
from .views import LessonStandartProfessionListAPIView

urlpatterns = [
    # Хичээлийн стандарт
    path('lessonstandart/', LessonStandartAPIView.as_view()),
    path('lessonstandart/list/', LessonStandartListAPIView.as_view()),

    path('lessonstandart/list/profession/<int:profession>/', LessonStandartProfessionListAPIView.as_view()),

    path('lessonstandart/student/list/', LessonStandartStudentListAPIView.as_view()),
    path('lessonstandart/<int:pk>/', LessonStandartAPIView.as_view()),
    path('lessonstandart/type/<int:pk>/', LessonStandartBagtsAPIView.as_view()),

    path('lessonstandart/timetable-list/', LessonStandartTimetableListAPIView.as_view()),

    # Хичээлийн сэдэвчилсэн төлөвлөгөө
    path('lessonstandart/titleplan/', LessonTitlePlanAPIView.as_view()),
    path('lessonstandart/titleplan/<int:lessonID>/', LessonTitlePlanAPIView.as_view()),
    path('lessonstandart/titleplan/<int:lessonID>/<int:pk>/', LessonTitlePlanAPIView.as_view()),

    # Мэргэжлийн тодорхойлолт
    path('profession/', ProfessionDefinitionAPIView.as_view()),
    path('profession/<int:pk>/', ProfessionDefinitionAPIView.as_view()),
    path('profession/list/', ProfessionDefinitionListAPIView.as_view()),
    path('profession/plan/', ProfessionPlanListAPIView.as_view()),
    path('profession/file/', ProfessionIntroductionFileAPIView.as_view()),
    path('profession/intro/<int:pk>/', ProfessionIntroductionFileAPIView.as_view()),
    path('profession/print/plan/', ProfessionPrintPlanAPIView.as_view()),

    # Сургалтын төлөвлөгөө
    path('plan/', LearningPlanAPIView.as_view()),
    path('plan/list/<int:salbar>/<int:level>/<int:type>/<int:profession>/', LearningPlanListAPIView.as_view()),
    path('plan/<int:pk>/', LearningPlanAPIView.as_view()),
    path('plan/profession/', LearningPlanProfessionDefinitionAPIView.as_view()),

    # Хөтөлбөр батлагдсан он
    path('confirmyear/', ConfirmYearListAPIView.as_view()),

    # Элсэлтийн шалгалтын хичээл ба босго оноо мэргэжлээр
    path('profession/score/<int:pk>/', AdmissionBottomScoreAPIView.as_view()),

    # Тухайн оюутны дипломын хичээлүүд
    path('lessonstandart/diploma/list/', LessonStandartDiplomaListAPIView.as_view()),
]
