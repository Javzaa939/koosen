from django.test import TestCase

# Create your tests here.
from django.urls import path

from .views import *



urlpatterns = [

    # Их сургуулийн бүтэц зохион байгуулалт
    path('structure/', StudentStructureAPIView.as_view()),
    path('structure/<int:pk>/', StudentStructureAPIView.as_view()),
    path('salbar/<int:pk>/', StudentListAPIView.as_view()),

]
