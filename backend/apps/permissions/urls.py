from django.urls import path
from .views import *

app_name = "permissions"

urlpatterns = [

    # Багшийн дүн оруулах хандах эрхүүд
    path('teachers/', PermissionTeacherAPIView.as_view()),
    path('teachers/<int:pk>/', PermissionTeacherAPIView.as_view()),

    # Хичээлийн хуваарьт шивэгдсэн багшийн мэдээлэл
    path('teacher_info/', TimetableTeacherAPIView.as_view()),

    # Хичээлийн хуваарьт шивэгдсэн багшийн заах хичээлүүд
    path('lesson_info/', TeacherAndLessonAPIView.as_view()),

    # Дүгнэх хэлбэрүүд авах
    path('type/', LessonTeacherScoretypeAPIView.as_view()),

    # Бусад хандах эрхүүд
    path('other/', PermissionOtherAPIView.as_view()),
    path('other/<int:pk>/', PermissionOtherAPIView.as_view()),

    # Оюутны хичээл сонголтыг төлбөрөөс хамааралгүйгээр хийх эрх
    path('student/', PermissionsStudentChoiceAPIView.as_view()),
    path('student/<int:pk>/', PermissionsStudentChoiceAPIView.as_view()),

    path('students/', PermissionsStudentAPIView.as_view()),
    path('students/select_bottom/', PermissionsStudentSelectAPIView.as_view()),

    # Хандах эрх шалгах
    path('check/', PermissionsCheckAPIView.as_view()),

    # Мэдэгдэл илгээх crontab
    path('crontab/', CrontabAPIView.as_view()),
    path('crontab/<int:pk>/', CrontabAPIView.as_view()),
    path('crontab/active/<int:pk>/', CrontabActiveAPIView.as_view()),
    path('crontab/limit/<int:pk>/', CrontabLimitAPIView.as_view()),

    path('crontab/send-attendance/', send_attendance, name='send-attendance')

]
