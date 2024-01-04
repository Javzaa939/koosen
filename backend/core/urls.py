from django.urls import path

from .views import *

urlpatterns = [
    path('teacher/', TeacherListApiView.as_view()),
    path('teacher/list/', TeacherApiView.as_view()),
    path('teacher/create/', EmployeeApiView.as_view()),
    path('teacher/lesson/', TeacherLessonListApiView.as_view()),
    path('teacher/lessonteach/', LessonToTeacherListApiView.as_view()),
    path('teacher/longlist/', TeacherLongListApiView.as_view()),
    path('teacher/listschoolfilter/', TeacherListSubschoolApiView.as_view()),

    path('teacher/part/', TeacherPartListApiView.as_view()),

    # сургуулийн жагсаалт
    path('school/', SchoolAPIView.as_view()),
    path('school/<int:pk>/', SchoolAPIView.as_view()),

    # Тэнхим
    path('department/', DepartmentListAPIView.as_view()),
    path('department/register/', DepartmentAPIView.as_view()),
    path('department/register/<int:pk>/', DepartmentAPIView.as_view()),

    path('department/teacher/<int:pk>/', DepartmentTeachersListAPIView.as_view()),

    # бүрэлдэхүүн сургууль
    path('subschool/', SubSchoolAPIView.as_view()),
    path('subschool/<int:pk>/', SubSchoolAPIView.as_view()),

    # улсын жагсаалт
    path('country/', CountryAPIView.as_view()),
    path('country/<int:pk>/', CountryAPIView.as_view()),

    # аймаг хот жагсаалт
    path('aimaghot/', AimaghotAPIView.as_view()),
    path('aimaghot/<int:pk>/', AimaghotAPIView.as_view()),

    # сум дүүрэг жагсаалт
    path('sumduureg/', SumDuuregAPIView.as_view()),
    path('sumduureg/<int:unit1>/', SumDuuregAPIView.as_view()),

    # баг хорооны жагсаалт
    path('baghoroo/', BagHorooAPIView.as_view()),
    path('baghoroo/<int:unit2>/', BagHorooAPIView.as_view()),

    # Багшийн мэдээллийн жагсаалт
    path('teachers/info/', TeacherListAPIView().as_view()),
    path('reference/teachers/info/<int:pk>/', TeacherInfoAPIView.as_view()),

    # Албан тушаалын жагсаалт
    path('position/', OrgPositionListAPIView().as_view()),

    # Хөтөлбөрийн багийн ахлагчийн жагсаалт
    path('leader/list/', DepLeaderAPIView().as_view()),

    path('dashboard/', DashboardAPIView().as_view()),

]
