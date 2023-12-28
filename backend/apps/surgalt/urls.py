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
from .views import ChallengeAPIView
from .views import ChallengeApprovePIView
from .views import ChallengeSelectAPIView
from .views import ChallengeSendAPIView
from .views import ChallengeAllAPIView
from .views import QuestionsAPIView
from .views import QuestionsListAPIView
from .views import LessonsTeacher
from .views import HomeworkStudentsListAPIView
from .views import StudentHomeworkListAPIView
from .views import StudentHomeworkMultiEditAPIView
from .views import LessonOneApiView
from .views import LessonAllApiView
from .views import LessonKreditApiView
from .views import LessonSedevApiView
from .views import LessonMaterialApiView
from .views import LessonMaterialGeneralApiView
from .views import LessonMaterialAssignmentApiView
from .views import LessonMaterialSendApiView
from .views import LessonMaterialApproveApiView
from .views import LessonEditorImage
from .views import LessonImage


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

    # --------------------------------------------------------------Tест-----------------------------------------------------------------------------

    path('challenge/', ChallengeAPIView.as_view()),
    path('challenge/<int:pk>/', ChallengeAPIView.as_view()),
    path('challenge/all/', ChallengeAllAPIView.as_view()),
    path('challenge/select/', ChallengeSelectAPIView.as_view()),
    path('challenge/send/<int:pk>/', ChallengeSendAPIView.as_view()),
    path('challenge/approve/', ChallengeApprovePIView.as_view()),

    path('questions/', QuestionsAPIView.as_view()),
    path('questions/list/', QuestionsListAPIView.as_view()),
    path('questions/<int:pk>/', QuestionsAPIView.as_view()),

    path('lesson/list/', LessonsTeacher.as_view()),
    path('lesson/studentlist/', HomeworkStudentsListAPIView.as_view()),

    path('lesson/homework/', StudentHomeworkListAPIView.as_view()),
    path('lesson/homework/<int:pk>/', StudentHomeworkListAPIView.as_view()),
    path('lesson/assignment/score/', StudentHomeworkMultiEditAPIView.as_view()),

    path('lesson/getone/<int:pk>/', LessonOneApiView.as_view()),

    path('lesson/getall/', LessonAllApiView.as_view()),

    path('lesson/kredit/<int:pk>/', LessonKreditApiView.as_view()),
    path('lesson/sedev/<int:pk>/', LessonSedevApiView.as_view()),

    path('lesson/material/<int:pk>/', LessonMaterialApiView.as_view()),

    path('lesson/material/general/<int:pk>/', LessonMaterialGeneralApiView.as_view()),
    path('lesson/material/assignment/<int:pk>/', LessonMaterialAssignmentApiView.as_view()),

    path('lesson/material/send-material/<int:lesson>/', LessonMaterialSendApiView.as_view()),

    path('lesson/approve/', LessonMaterialApproveApiView.as_view()),

    path('lesson/editor/image/<int:pk>/', LessonEditorImage.as_view()),

    path('lesson/image/<int:pk>/', LessonImage.as_view()),
]
