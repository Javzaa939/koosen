from django.urls import path
from .views import ProfessionalDegreeAPIView
from .views import LearningAPIView
from .views import StudentRegisterAPIView
from .views import LessonCategoryAPIView
from .views import LessonGroupAPIView
from .views import LessonTypeAPIView
from .views import LessonLevelAPIView
from .views import ScoreAPIView
from .views import SeasonAPIView
from .views import SystemSettingsAPIView
from .views import DiscountTypeAPIView
from .views import AdmissionLessonAPIView
from .views import SystemSettingsActiveYearAPIView
from .views import CountryAPIView
from .views import SignatureAPIView
from .views import SignatureDataTableAPIView
from .views import SignatureTableAPIView
from .views import SignatureOrderAPIView
from .views import PermissionAPIView
from .views import RolesAPIView
from .views import PermissionListAPIView


urlpatterns = [
    # Боловсролын зэрэг
    path('professionaldegree/', ProfessionalDegreeAPIView.as_view()),
    path('professionaldegree/<int:pk>/', ProfessionalDegreeAPIView.as_view()),

    # Суралцах хэлбэр
    path('learning/', LearningAPIView.as_view()),
    path('learning/<int:pk>/', LearningAPIView.as_view()),

    # Оюутны бүртгэлийн хэлбэр
    path('studentregister/', StudentRegisterAPIView.as_view()),
    path('studentregister/<int:pk>/', StudentRegisterAPIView.as_view()),

    # Хичээлийн ангилал
    path('lessoncategory/', LessonCategoryAPIView.as_view()),
    path('lessoncategory/<int:pk>/', LessonCategoryAPIView.as_view()),

    # Хичээлийн төрөл
    path('lessontype/', LessonTypeAPIView.as_view()),
    path('lessontype/<int:pk>/', LessonTypeAPIView.as_view()),

    # Хичээлийн түвшин
    path('lessonlevel/', LessonLevelAPIView.as_view()),
    path('lessonlevel/<int:pk>/', LessonLevelAPIView.as_view()),

    # Хичээлийн бүлэг
    path('lessongroup/', LessonGroupAPIView.as_view()),
    path('lessongroup/<int:pk>/', LessonGroupAPIView.as_view()),

    # Улирал
    path('season/', SeasonAPIView.as_view()),
    path('season/<int:pk>/', SeasonAPIView.as_view()),

    # Дүнгийн бүртгэл
    path('score/', ScoreAPIView.as_view()),
    path('score/<int:pk>/', ScoreAPIView.as_view()),

    # Ажиллах жил бүртгэл
    path('activeyear/', SystemSettingsAPIView.as_view()),
    path('activeyear/<int:pk>/', SystemSettingsAPIView.as_view()),
    path('activeyear/active/', SystemSettingsActiveYearAPIView.as_view()),

    # ЭЕШ-ын хичээл
    path('admissionlesson/', AdmissionLessonAPIView.as_view()),
    path('admissionlesson/<int:pk>/', AdmissionLessonAPIView.as_view()),

    # Төлбөрийн хөнгөлөлтийн төрөл
    path('discounttype/', DiscountTypeAPIView.as_view()),
    path('discounttype/<int:pk>/', DiscountTypeAPIView.as_view()),

    # Улсын нэр
    path('country/', CountryAPIView.as_view()),
    path('country/<int:pk>/', CountryAPIView.as_view()),

    # Улирал
    path('signature/', SignatureAPIView.as_view()),
    path('signature/data-table/', SignatureDataTableAPIView.as_view()),
    path('signature/table/', SignatureTableAPIView.as_view()),
    path('signature/changeorder/', SignatureOrderAPIView.as_view()),
    path('signature/<int:pk>/', SignatureAPIView.as_view()),

    # Эрх
    path('permission/', PermissionAPIView.as_view()),
    path('permission/<int:pk>/', PermissionAPIView.as_view()),
    path('permission/list/', PermissionListAPIView.as_view()),

    # Role
    path('role/', RolesAPIView.as_view()),
    path('role/<int:pk>/', RolesAPIView.as_view()),
]
