from django.urls import path

from .views import (
    UserInventionAPIView,
    UserPaperAPIView,
    UserNoteAPIView,
    UserPatentAPIView,
    UserProjectAPIView,
    UserQuotationAPIView,
    UserSymbolCertAPIView,
    UserModelCertPatentAPIView,
    UserlicenseCertAPIView,
    UserRightCertAPIView,
    InventionCategoryAPIView,
    PaperCategoryAPIView,
    InventionCategoryListAPIView,
    ProjectCategoryListAPIView,
    ProjectCategoryAPIView,
    UserPaperCategoryAPIView,
    UserNoteCategoryAPIView,
    ScienceApiView,
    ScienceStudentApiView,
    PatentAPIView,
    EstimateAPIView,
    ReportAPIView
)

urlpatterns = [

    # Эрдэм шинжилгээний өгүүлэл
    path('papers/', UserPaperAPIView.as_view()),
    path('papers/category/', UserPaperCategoryAPIView.as_view()),

    # Эрдэм шинжилггээний илтгэл
    path('notes/', UserNoteAPIView.as_view()),
    path('notes/values/', UserNoteCategoryAPIView.as_view()),
    path('notes/<int:pk>/', UserNoteAPIView.as_view()),

    # Эрдэм шинжилгээний бүтээл
    path('invention/', UserInventionAPIView.as_view()),

    # Эрдэм шинжилгээ оюуны өмчийн бүтээл  жагсаалт
    # path('patent/', UserPatentAPIView.as_view()),
    # path('patent/<int:pk>/', UserPatentAPIView.as_view()),

    # Эрдэм шинжилгээний төсөл
    path('project/', UserProjectAPIView.as_view()),
    path('project/<int:pk>/', UserProjectAPIView.as_view()),

    # Эрдэм шинжилгээний төсөл ангилал
    path('project/category/', ProjectCategoryListAPIView.as_view()),

    # Эрдэм шинжилгээний эшлэл
    path('quotation/', UserQuotationAPIView.as_view()),
    path('quotation/<int:pk>/', UserQuotationAPIView.as_view()),

    # Эрдэм шинжилгээний Барааны-Тэмдгийн-Гэрчилгээ
    path('symbolcert/', UserSymbolCertAPIView.as_view()),
    path('symbolcert/<int:pk>/', UserSymbolCertAPIView.as_view()),

    # Эрдэм шинжилгээний Ашигтай-Загварын-Патент
    path('modelcert/', UserModelCertPatentAPIView.as_view()),
    path('modelcert/<int:pk>/', UserModelCertPatentAPIView.as_view()),

    # Эрдэм шинжилгээний Лицензийн гэрчилгээ
    path('licensecert/', UserlicenseCertAPIView.as_view()),
    path('licensecert/<int:pk>/', UserlicenseCertAPIView.as_view()),

    # Эрдэм шинжилгээний Зохиогчийн эрхийн гэрчилгээ
    path('rightcert/', UserRightCertAPIView.as_view()),
    path('rightcert/<int:pk>/', UserRightCertAPIView.as_view()),

    # Эрдэм шинжилгээний бүтээлийн ангилал
    path('inventioncategory/list/', InventionCategoryListAPIView.as_view()),

    # Эрдэм шинжилгээний Өгүүлэлийн ангилал
    path('category/', PaperCategoryAPIView.as_view()),
    path('category/<int:pk>/', PaperCategoryAPIView.as_view()),

    # Эрдэм шинжилгээний төслийн ангилал
    path('projectcategory/', ProjectCategoryAPIView.as_view()),
    path('projectcategory/<int:pk>/', ProjectCategoryAPIView.as_view()),

    path('settings/', ScienceApiView.as_view()),
    path('settings/<int:pk>/', ScienceApiView.as_view()),

    # Оюутан удирдсан байдал
    path('student/', ScienceStudentApiView.as_view()),

    # Оюуны өмч
    path('patent/', PatentAPIView.as_view()),

    # Б цагийн тооцооны нэгтгэл
    path('estimate/', EstimateAPIView.as_view()),

    # Тайлан
    path('report/', ReportAPIView.as_view()),

]
