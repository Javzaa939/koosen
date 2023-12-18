from django.urls import path

from .views import ComplaintUnitListAPIView
from .views import ComplaintAPIView
from .views import ComplaintAnswerAPIView
from .views import CorrespondAPIView
from .views import CorrespondLessonAPIView
from .views import CorrespondAnswerAPIView
from .views import RequestAnswerVolunteerAPIView
from .views import ClubListAPIView
from .views import StudentRequestClubAPIView
from .views import ClubSettingsListAPIView
from .views import CorrespondApprove
from .views import LeaveAnswerAPIView
from .views import LeaveAPIView
from .views import RoutingAPIView
from .views import RoutingAnswerAPIView
from .views import CorrespondPrintAPIView
from .views import *

urlpatterns = [

    # Хүсэлт шийдвэрлэх нэгж
    path('unit/', ComplaintUnitListAPIView.as_view()),
    path('unit/<int:pk>/', ComplaintUnitListAPIView.as_view()),

    # Өргөдөл
    path('complaint/', ComplaintAPIView.as_view()),
    path('complaint/<int:pk>/', ComplaintAPIView.as_view()),
    path('answercomplaint/', ComplaintAnswerAPIView.as_view()),

    # Чөлөөний хүсэлт
    path('leave/', LeaveAPIView.as_view()),
    path('leave/<int:pk>/', LeaveAPIView.as_view()),
    path('leaveanswer/', LeaveAnswerAPIView.as_view()),

    # Дүнгийн дүйцүүлэлт хийлгэх хүсэлт
    path('correspond/', CorrespondAPIView.as_view()),
    path('correspond/<int:pk>/', CorrespondAPIView.as_view()),
    path('correspond/lesson/<int:pk>/', CorrespondLessonAPIView.as_view()),
    path('correspond/print/<int:pk>/', CorrespondPrintAPIView.as_view()),
    path ('correspond/approve/<int:pk>/', CorrespondApprove.as_view()),

    # Дүйцүүлэлт хүсэлт шийдвэрлэх
    path('correspond/answer/', CorrespondAnswerAPIView.as_view()),
    path('correspond/answer/<int:correspond>/', CorrespondAnswerAPIView.as_view()),

    # Клуб
    path('club/', ClubListAPIView.as_view()),
    path('club/<int:pk>/', ClubListAPIView.as_view()),
    path('club/list/', ClubSettingsListAPIView.as_view()),

    # Клубт бүртгүүлсэн оюутны жагсаалт
    path('club/student/', StudentRequestClubAPIView.as_view()),
    path('club/student/<int:pk>/', StudentRequestClubAPIView.as_view()),

    # Олон нийтийн ажил хүсэлт шийдвэрлэх
    path('volunteer/', RequestAnswerVolunteerAPIView.as_view()),
    path('volunteer/<int:pk>/', RequestAnswerVolunteerAPIView.as_view()),

    # Тойрох хуудас хүсэлт
    path('routing/', RoutingAPIView.as_view()),
    path('routing/<int:pk>/', RoutingAPIView.as_view()),

    path('routing/answer/', RoutingAnswerAPIView.as_view()),

    # багшийн хүсэлт шийдвэрлэх
    path('tutor/', RequestAnswerTutorAPIView.as_view()),
    path('tutor/<int:pk>/', RequestAnswerTutorAPIView.as_view()),
]
