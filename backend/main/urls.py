"""backend URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.urls import path
from django.urls import include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
      # ерөнхий ашиглаж болох urls
    path("core/", include("core.urls")),

    # Хэрэглэгч
    path('user/', include("apps.user.urls")),

    # Тохиргоо
    path('settings/', include("apps.settings.urls")),

    # Сургалт
    path('learning/', include("apps.surgalt.urls")),

    # Оюутан
    path('student/', include("apps.student.urls")),

    # Цагийн хуваарь
    path('timetable/', include("apps.timetable.urls")),

    # Сургалтын төлбөр
    path('payment/', include("apps.payment.urls")),

    # Дүйцүүлсэн дүн
    path('score/', include("apps.scoreregister.urls")),

    # хичээл
    path('print/', include("apps.print.urls")),

    # Тэтгэлэг
    path('stipend/', include("apps.stipend.urls")),

    # Сургалтын хуанли
    path('calendar/', include("apps.calendar.urls")),

    # Дотуур байр
    path('dormitory/', include("apps.dormitory.urls")),

    # Хүсэлт
    path('request/', include("apps.request.urls")),

    # Захиалга
    path('order/', include("apps.order.urls")),

    # Үйлчилгээ
    path('service/', include("apps.service.urls")),

    # Цагийн тооцоо
    path('credit/', include("apps.credit.urls")),

    # Хандах эрх
    path('permissions/', include("apps.permissions.urls")),

    # Судалгаа
    path('survey/', include("apps.survey.urls")),

    # Эрдэм шинжилгээ
    path('science/', include("apps.science.urls")),


    # NOTIF URL
    path('p/', include("lms_package.urls")),

    # статистик
    path('statistic/', include("apps.statistic.urls")),

    # элсэлт
    path('elselt/', include("apps.elselt.urls")),

    # Онлайн хичээл
     path('online_lesson/', include('apps.online_lesson.urls')),
]

if settings.DEBUG is False:
    urlpatterns = [
        path('api/', include(urlpatterns))
    ]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
