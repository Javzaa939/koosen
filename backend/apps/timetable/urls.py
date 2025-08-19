from django.urls import path

from .views import *

urlpatterns = [
    # Хичээлийн байр
    path('building/', BuildingAPIView.as_view()),
    path('building/<int:pk>/', BuildingAPIView.as_view()),

    # Өрөөний бүртгэл
    path('room/', RoomAPIView.as_view()),
    path('room/list/', RoomListAPIView.as_view()),
    path('room/<int:pk>/', RoomAPIView.as_view()),

    # Цагийн ачааллаас хичээлийн хуваарь авах
    path('resource1/', TimeTableResource1.as_view()),
    path('register-new/', TimeTableNewAPIView.as_view()),

    # Цагийн хуваарь File excel файл оруулсан датаг бааз руу хадгалах
    path('register/excel-import/', TimeTableExcelImportAPIView.as_view()),

    # Timetable multi delete modal
    path('list/teacher/', TimeTableListAPIView.as_view()),
    path('list/select-groups/', TimeTableSelectGroupsAPIView.as_view()),
    path('list/select-lessons/', TimeTableSelectLessonsAPIView.as_view()),

    # Цагийн ачааллаас
    path('register/new/<int:pk>/', TimeTableNewAPIView.as_view()),

    path('print/', TimeTablePrint.as_view()),
    path('date/', TimeTableDate.as_view()),

    # Цагийн хуваарь үүссэний дараа
    path('register/', TimeTableAPIView.as_view()),
    path('register/<int:pk>/', TimeTableAPIView.as_view()),
    path('register/simple/', TimeTableSimpleAPIView.as_view()),

    # Цагийн хуваариас event зөөх үед үүссэний дараа
    path('event/<int:pk>/', TimeTableEvent.as_view()),

    # Хичээлийн хуваарь шивэх V1
    # path('register1/', TimeTable1APIView.as_view()),
    path('register1/kurats/', TimeTableKuratsAPIView.as_view()),
    path('resource/', TimeTableResource.as_view()),

    path('file/', TimeTableFile.as_view()),

    # Хичээлийн хуваарийн хайлтын select option авах
    path('resource/select/', TimeTableSelectOption.as_view()),

    # Поток хайлт
    path('list/', TimeTablePotok.as_view()),

    # Шалгалтын хуваарь
    path('examtimetable/', ExamTimeTableAPIView.as_view()),
    path('examtimetable/create/', ExamTimeTableCreateAPIView.as_view()),
    path('examtimetable/<int:pk>/', ExamTimeTableAPIView.as_view()),
    path('examtimetable/list/', ExamTimeTableListAPIView.as_view()),
    path('examtimetable/score/<int:pk>/', ExamTimeTableScoreListAPIView.as_view()),

    # Дахин шалгалтын бүртгэл
    path('exam_repeat/', Exam_repeatListAPIView.as_view()),
    path('exam_repeat/<int:pk>/', Exam_repeatListAPIView.as_view()),
    path('exam_repeat/list/', ExamListAPIView.as_view()),
    path('exam_repeat/list_exam/<int:pk>/', Exam_repeatTestListAPIView.as_view()),
    path('exam_repeat/list_exam/students/', ExamrepeatStudentsAPIView.as_view()),
    path('exam_repeat/list_exam/students/<int:pk>/', ExamrepeatStudentsAPIView.as_view()),
    path('exam_repeat/list_exam/one_student/<int:pk>/', ExamrepeatAddStudentAPIView.as_view()),
    path('exam_repeat/score/<int:student>/<int:lesson>/', ExamRepeatStudentScoreListAPIView.as_view()),
    path('exam_repeat/score/<int:pk>/', ExamRepeatTimeTableScoreListAPIView.as_view()),
]
