from django.urls import path

from .views import *


urlpatterns = [

    # Их сургуулийн бүтэц зохион байгуулалт
    path('structure/', StudentStructureAPIView.as_view()),
    path('structure/<int:pk>/', StudentStructureAPIView.as_view()),

    # Сургалтын хөтөлбөр
    path('salbar/', StudentListAPIView.as_view()),

    # Суралцагчын хөгжил
    path('develop/', StudentDevelopAPIView.as_view()),
    path('develop/<int:pk>/', StudentDevelopAPIView.as_view()),

    # Номын сан танилцуулга
    path('library/', StudentLibraryAPIView.as_view()),
    path('library/<int:pk>/', StudentLibraryAPIView.as_view()),

    # Сэтгэл зүйн булан
    path('psycholocal/', StudentPsycholocalAPIView.as_view()),
    path('psycholocal/<int:pk>/', StudentPsycholocalAPIView.as_view()),

    # Эрүүл мэнд
    path('health/', HealthAPIView.as_view()),
    path('health/<int:pk>/', HealthAPIView.as_view()),

]
