from django.urls import path

from .views import *

urlpatterns = [
    # Оюутны бүртгэл
    path('info/', StudentRegisterAPIView.as_view()),
    path('info/download/', StudentDownloadAPIView.as_view()),
    path('info/list/', StudentListAPIView.as_view()),
    path('info/graduate/', StudentGraduateListAPIView.as_view()),
    path('info/group/', StudentGroupAPIView.as_view()),
    path('info/<int:pk>/', StudentRegisterAPIView.as_view()),
    path('info/detail/<int:pk>/', StudentDetailAPIView.as_view()),
    path('info/all/<int:pk>/', StudentInfoAPIView.as_view()),
    path('info/simplelist/', StudentsListSimpleAPIView.as_view()),

    # Оюутны бүртгэл тайлан
    path('group/dashboard/', GroupReportAPI().as_view()),
    path('report/', StudentReportAPI().as_view()),
    path('course/', StudentCourseAPI().as_view()),
    path('profession/', StudentProfessionAPI().as_view()),
    path('province/', StudentProvinceAPI().as_view()),
    path('school/', StudentSchoolAPI().as_view()),
    path('report/payment/', StudentReportPaymentAPI().as_view()),

    # Оюутны дэлгэрэнгүй мэдээлэл
    path('info/lesson/<int:lessonId>/', StudentLessonListAPIView.as_view()),

    path('definition/', StudentDefinitionListAPIView.as_view()),
    path('definition/lite/', StudentDefinitionListLiteAPIView.as_view()),
    path('definition/value/', StudentDefinitionValueListAPIView.as_view()),
    path('definition/season/option/', StudentSeasonOptionAPIView.as_view()),
    path('definition/sum/', DefinitionSumAPIView.as_view()),

    # Оюутны гэр бүлийн байдал
    path('family/', StudentFamilyAPIView.as_view()),
    path('family/<int:student>/', StudentFamilyAPIView.as_view()),
    path('family/<int:student>/<int:pk>/', StudentFamilyAPIView.as_view()),

    # Оюутны боловсролын мэдээлэл
    path('education/', StudentEducationAPIView.as_view()),
    path('education/<int:student>/', StudentEducationAPIView.as_view()),
    path('education/<int:student>/<int:pk>/', StudentEducationAPIView.as_view()),

    # Оюутны хаягийн мэдээлэл
    path('address/', StudentAddressAPIView.as_view()),
    path('address/<int:student>/', StudentAddressAPIView.as_view()),
    path('address/<int:student>/<int:pk>/', StudentAddressAPIView.as_view()),

    # Оюутны ЭЕШ-ийн оноо мэдээлэл
    path('admission/', StudentAdmissionAPIView.as_view()),
    path('admission/<int:student>/', StudentAdmissionAPIView.as_view()),
    path('admission/<int:student>/<int:pk>/', StudentAdmissionAPIView.as_view()),

    # Оюутны шилжилт хөдөлгөөн явсан бүртгэл
    path('movement/', StudentMovementAPIView.as_view()),
    path('movement/<int:pk>/', StudentMovementAPIView.as_view()),

    # Оюутны шилжилт хөдөлгөөн ирсэн бүртгэл
    path('arrive/', StudentArrivedAPIView.as_view()),
    path('arrive/<int:pk>/', StudentArrivedAPIView.as_view()),
    path('arrive/approve/<int:pk>/', StudentArrivedApproveAPIView.as_view()),

    # Ангийн бүртгэл
    path('group/', GroupAPIView.as_view()),
    path('group/class/', ClassAPIView.as_view()),
    path('group/list/', StudentGroupListAPIView.as_view()),
    path('group/list/<int:pk>/', StudentGroupListAPIView.as_view()),
    path('group/one/<int:pk>/', GroupOneAPIView.as_view()),
    path('group/timetable/<int:lesson>/', GroupTimetableAPIView.as_view()),
    path('group/lesson/<int:group>/', GroupLessonAPIView.as_view()),
    path('group/exam/', TestGroupAPIView.as_view()),
    path('group/exam-to-group/lesson/<int:lesson>/', ExamToGroupGroupLessonAPIView.as_view()),

    # Оюутны чөлөөний бүртгэл
    path('leave/', StudentLeaveAPIView.as_view()),
    path('leave/<int:pk>/', StudentLeaveAPIView.as_view()),
    path('leave-students/', StudentLeaveStudentsAPIView.as_view()),

    # Төгсөлтийн ажил
    path('graduation/', GraduationWorkAPIView.as_view()),
    path('graduation/group/', SignatureGroupAPIView.as_view()),

    # Төгсөлтийн ажлын загвар файл оруулах
    path('graduation/import/', GraduationWorkImportAPIView.as_view()),
    path('graduation/<int:pk>/', GraduationWorkAPIView.as_view()),

    # Төгсөлтийн ажлын qr татах
    path('graduation/qr/', GraduationWorkQrAPIView.as_view()),

    # Боловсролын зээлийн сан
    path('edu_loan_fund/', EducationalLoanFundAPIView.as_view()),

    # Гарын үсэг
    path('signature/', SignatureAPIView.as_view()),
    path('signature/<int:pk>/', SignatureAPIView.as_view()),
    path('signature/changeorder/', SignatureChangeOrderApiView.as_view()),

    # Оюутны дүнгийн мэдээлэл авах
    path('score-register/', StudentScoreRegisterAPIView.as_view()),
    path('calculate-gpa-diploma/', StudentCalculateGpaDiplomaAPIView.as_view()),

    # Ангиар нь хавсралтын дүн хадгалах
    path('calculate-gpa-diploma/group/', StudentCalculateGpaDiplomaGroupAPIView.as_view()),

    # Мэргэжлээр нь хавсралтын тохиргоо хадгалах
    path('calculate-gpa-diploma/config/', StudentAttachmentConfigAPIView.as_view()),

    # Хавсралт хэвлэх үед голч бодох
    path('gpa-diploma-values/', StudentGpaDiplomaValuesAPIView.as_view()),

    # Гадаад оюутны визний мэдээлэл
    path('viz-status/', StudentVizStatusAPIView.as_view()),

    path('score-lesson/<int:student>/', StudentScoreLessonAPIView.as_view()),

    # тушаал гаргах
    path('command/', CommandAPIView.as_view()),
    path('graduate/list/', StudentCommandListAPIView.as_view()),
    path('regisanddiplom/<int:pk>/', RegistrationAndDiplomAPIView.as_view()),

    # Төгссөн оюутны жагсаалт
    path('info/graduate1/', StudentGraduate1APIView.as_view()),

    # Оюутны нууц үгийг сэргээх
    path('defaultPass/<int:pk>/', DefaultPassApi().as_view()),

    # Оюутны эрх хаах/нээх
    path('rightActivation/<int:pk>/', RightActivationApi().as_view()),

    # excel import хийх
    path('import/', StudentImportAPIView().as_view()),

    # дата оруулах
    path('postData/', StudentPostDataAPIView().as_view()),

]
