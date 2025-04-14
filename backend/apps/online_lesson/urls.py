from django.urls import path
from .views import *

urlpatterns = [
    # хичээл
    path('', OnlineLessonListAPIView.as_view(), name='online-lesson-list-create'),
    path('plan/<int:pk>/', OnlineLessonPlanAPIView.as_view()),
    path('<int:pk>/', OnlineLessonDetailAPIView.as_view(), name='online-lesson-detail'),
    path('lesson_material/<int:pk>/', LessonMaterialDetailAPIView.as_view(), name='lesson-material-detail'),

    # хичээлийн 7 хоног
    path('online_week/<int:pk>/', OnlineWeekAPIView.as_view()),
    path('online_week/', OnlineWeekAPIView.as_view(), name='online_week-detail'),

    path('online_week/lekts/', OnlineWeekLektsAPIView.as_view()),
    path('online_week/lekts/<int:pk>/', OnlineWeekLektsAPIView.as_view()),

    # Зарлал
    path('announcement/', AnnouncementAPIView.as_view()),
    path('announcement/<int:pk>/', AnnouncementAPIView.as_view()),
    path('global_announcement/', GlobalAnnouncementAPIView.as_view()),

    # Гэрийн даалгавар
    path('online_homework/',  HomeWorkAPIView.as_view()),
    path('online_homework/<int:pk>/',  HomeWorkAPIView.as_view()),

    # Илгээсэн гэрийн даалгавар
    path('sent_home_work/<int:pk>/',SentHomeWorkAPIView.as_view()),

    # Илгээсэн лекцийн материал
    path('sent_lecture_file/<int:pk>/', SentLectureAPIView.as_view()),
    path('sent_lecture_file/all/<int:pk>/', SummarizeLessonMaterialAPIView.as_view()),

    # Хичээлийн материал
    path('material/<int:pk>/', LessonMaterialDetailAPIView.as_view()),
    path('material/', LessonMaterialDetailAPIView.as_view()),

    # Хичээл сонгох API
    path('choose_online_lesson/', LessonListAPIView.as_view()),

    # Сонгогдсон хичээлийг судалж буй оюутнууд
    path('get_group/',getAllGroups.as_view()),

    path('lesson_students/', LessonStudentsAPIView.as_view(), name='lesson_students'),
    path('lesson_students/<int:pk>/', LessonStudentsAPIView.as_view()),

    path('test/<int:pk>/',OnlineLessonTestAPIView.as_view()),

    path('remote/',RemoteLessonAPIView.as_view()),
    path('remote/<int:pk>/',RemoteLessonAPIView.as_view()),

    path('remote/students/',RemoteLessonStudentsAPIView.as_view()),
    path('remote/students/<int:pk>/',RemoteLessonStudentsAPIView.as_view()),

    path('remote/online-info/',RemoteLessonOnlineInfoAPIView.as_view()),
    path('remote/online-info/<int:pk>/',RemoteLessonOnlineInfoAPIView.as_view()),

    path('remote/online-sub-info/',RemoteLessonOnlineSubInfoAPIView.as_view()),
    path('remote/online-sub-info/<int:pk>/',RemoteLessonOnlineSubInfoAPIView.as_view()),

]
