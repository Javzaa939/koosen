from django.urls import path

from .views import *

urlpatterns = [
    # Системийн хандалт
    path('sys-info/', SysInfoApiView.as_view()),
    path('teacher/', TeacherListApiView.as_view()),
    path('teacher/<int:pk>/', TeacherListApiView.as_view()),
    path('teacher/all/', TeacherAllListApiView.as_view()),
    path('teacher/list/', TeacherApiView.as_view()),
    path('teacher/lesson/', TeacherLessonListApiView.as_view()),
    path('teacher/lessonteach/', LessonToTeacherListApiView.as_view()),
    path('teacher/longlist/', TeacherListApiView.as_view()),
    path('teacher/listschoolfilter/', TeacherListSubschoolApiView.as_view()),
    path('teacher/create/', EmployeeApiView.as_view()),
    path('teacher/create/<int:pk>/', EmployeeApiView.as_view()),
    path('teacher/reset-password/<int:pk>/', TeacherResetPassword.as_view()),

    path('teacher/part/', TeacherPartListApiView.as_view()),

    # сургуулийн жагсаалт
    path('school/', SchoolAPIView.as_view()),
    path('school/<int:pk>/', SchoolAPIView.as_view()),

    # Хөтөлбөрийн баг
    path('department/', DepartmentListAPIView.as_view()),
    path('department/register/', DepartmentAPIView.as_view()),
    path('department/register/<int:pk>/', DepartmentAPIView.as_view()),

    path('department/<int:pk>/', DepartmentListAPIView.as_view()),
    path('department/teacher/<int:pk>/', DepartmentTeachersListAPIView.as_view()),

    # бүрэлдэхүүн сургууль сургууль
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
    path('position/<int:pk>/', OrgPositionListAPIView().as_view()),
    path('position/permission/', PermissionListAPIView().as_view()),

    # Хөтөлбөрийн багийн ахлагчийн жагсаалт
    path('leader/list/', DepLeaderAPIView().as_view()),

    # Хуанли доторх картнуудын жагсаалт
    path('calendarCard/', CalendarCountAPIView().as_view()),

    # Dynamic api
    path('crud/', CRUDAPIView.as_view()),
    path('crud/<int:pk>/', CRUDAPIView.as_view()),

    # ABLE
    path('able/get-position/', AblePositionAPIView.as_view()),
    path('able/get-worker/', AbleWorkerAPIView.as_view())
]
