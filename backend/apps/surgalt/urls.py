from django.urls import path

from .views import *

urlpatterns = [
    # Хичээлийн стандарт
    path('lessonstandart/', LessonStandartAPIView.as_view()),
    path('lessonstandart/<int:pk>/', LessonStandartAPIView.as_view()),
    path('lessonstandart/group/<int:group>/', LessonStandartGroupAPIView.as_view()),
    path('lessonstandart/list/teacher/', LessonsApiView.as_view()),

    path('lessonstandart/list/', LessonStandartListAPIView.as_view()),
    path('lessonstandart/list/exam/', LessonStandartExamListAPIView.as_view()),
    path('lessonstandart/list/profession/<int:profession>/', LessonStandartProfessionListAPIView.as_view()),

    path('lessonstandart/student/list/', LessonStandartStudentListAPIView.as_view()),
    path('lessonstandart/type/<int:pk>/', LessonStandartBagtsAPIView.as_view()),

    path('lessonstandart/timetable-list/', LessonStandartTimetableListAPIView.as_view()),

    # Хичээлийн сэдэвчилсэн төлөвлөгөө
    path('lessonstandart/titleplan/', LessonTitlePlanAPIView.as_view()),
    path('lessonstandart/titleplan/<int:lessonID>/', LessonTitlePlanAPIView.as_view()),
    path('lessonstandart/titleplan/<int:lessonID>/<int:pk>/', LessonTitlePlanAPIView.as_view()),

    path('lessonstandart/select_bottom/', LessonSearchAPIView.as_view()),
    path('lessonstandart/search/', LessonSearchStudentAPIView.as_view()),

    # Мэргэжлийн тодорхойлолт
    path('profession/', ProfessionDefinitionAPIView.as_view()),
    path('profession/<int:pk>/', ProfessionDefinitionAPIView.as_view()),
    path('profession/list/', ProfessionDefinitionListAPIView.as_view()),
    path('profession/poster-file/', ProfessionPosterFile.as_view()),
    path('profession/poster-file/<int:pk>/', ProfessionPosterFile.as_view()),
    path('profession/plan/', ProfessionPlanListAPIView.as_view()),
    path('profession/file/', ProfessionIntroductionFileAPIView.as_view()),
    path('profession/intro/<int:pk>/', ProfessionIntroductionFileAPIView.as_view()),
    path('profession/print/plan/', ProfessionPrintPlanAPIView.as_view()),

    # Мэргэжлийн тодорхойлолт хувилах
    path('profession/copy/', CopyProfesisonAPIView.as_view()),

    # Сургалтын төлөвлөгөө
    path('plan/', LearningPlanAPIView.as_view()),
    path('plan/list/<int:salbar>/<int:level>/<int:type>/<int:profession>/', LearningPlanListAPIView.as_view()),
    path('plan/<int:pk>/', LearningPlanAPIView.as_view()),
    path('plan/profession/', LearningPlanProfessionDefinitionAPIView.as_view()),

    # Хөтөлбөр батлагдсан он
    path('confirmyear/', ConfirmYearListAPIView.as_view()),

    # Элсэлтийн шалгалтын хичээл ба босго оноо мэргэжлээр
    path('profession/score/<int:pk>/', AdmissionBottomScoreAPIView.as_view()),

    # Тухайн оюутны дипломын хичээлүүд
    path('lessonstandart/diploma/list/', LessonStandartDiplomaListAPIView.as_view()),

    # Мэргэжлийн тодорхойлолтоос зөвхөн мэргэжлийн нэр авах
    path('profession/justprofession/', ProfessionJustProfessionAPIView.as_view()),

    # --------------------------------------------------------------Tест-----------------------------------------------------------------------------

    path('challenge/', ChallengeAPIView.as_view()),
    path('challenge/<int:pk>/', ChallengeAPIView.as_view()),
    path('challenge/all/', ChallengeAllAPIView.as_view()),
    path('challenge/select/', ChallengeSelectAPIView.as_view()),
    path('challenge/send/<int:pk>/', ChallengeSendAPIView.as_view()),
    path('challenge/approve/', ChallengeApprovePIView.as_view()),
    path('challenge/timetable/', TeacherExaminationScheduleAPIView.as_view()),

    path('challenge/add/sedev/count/', ChallengeSedevCountAPIView.as_view()),
    path('challenge/add/sedev/count/<int:pk>/', ChallengeSedevCountAPIView.as_view()),

    path('challenge/add/level/count/', ChallengeLevelCountAPIView.as_view()),
    path('challenge/add/level/count/<int:pk>/', ChallengeLevelCountAPIView.as_view()),

	path('challenge/add/', ChallengeAddInformationAPIView.as_view()),
    path('challenge/add/<int:pk>/', ChallengeAddInformationAPIView.as_view()),
    path('challenge/add/student/', ChallengeAddStudentAPIView.as_view()),
	path('challenge/add/student/<int:pk>/<int:student>/', ChallengeAddStudentAPIView.as_view()),
    path('challenge/add/student/addKind/<int:pk>/', ChallengeAddKindAPIView.as_view()),
    path('challenge/add/student/delete/', ChallengeAddStudentDeleteAPIView.as_view()),
    path('challenge/add/question/list/', ChallengeQuestionsAPIView.as_view()),
    path('challenge/questions/<int:pk>/', TestQuestionsAllAPIView.as_view()),
	path('challenge/questions/difficulty_levels/', TestQuestionsDifficultyLevelsAPIView.as_view()),
	path('challenge/students-score/', ChallengeStudentsScoreAPIView.as_view()),
	path('challenge/report/', ChallengeReportAPIView.as_view()),
	path('challenge/report/chart/', ChallengeStudentReportAPI.as_view()),

    path('challenge/student/', ChallengeSearchStudentAPIView.as_view()),

    path('questions/', QuestionsAPIView.as_view()),
    path('questions/<int:pk>/', QuestionsAPIView.as_view()),
    path('questions/test/', TestQuestionsAPIView.as_view()),
    path('questions/test/list/', TestQuestionsListAPIView.as_view()),
    path('questions/list/', QuestionsListAPIView.as_view()),
    path('questions/title/', QuestionsTitleAPIView.as_view()),
    path('questions/title/<int:pk>/', QuestionsTitleAPIView.as_view()),
    path('questions/title/list/<int:pk>/', QuestionsTitleListAPIView.as_view()),
    path('questions/level/list/', QuestionsLevelListAPIView.as_view()),
    path('questions/excel/',QuestionExcelAPIView.as_view()),


    path('psychological_test_question/title/', PsychologicalQuestionTitleAPIView.as_view()),
    path('psychological_test_question/title/list/', PsychologicalQuestionTitleListAPIView.as_view()),
    path('psychological_test_question/title/<int:pk>/', PsychologicalQuestionTitleAPIView.as_view()),

    path('psychological_test_question/', PsychologicalTestQuestionsAPIView.as_view()),
    path('psychological_test_question/list/', PsychologicalTestQuestionsAPIView.as_view()),
    path('psychological_test_question/<int:pk>/', PsychologicalTestQuestionsAPIView.as_view()),

    path('psychological_test/', PsychologicalTestAPIView.as_view()),
    path('psychological_test/<int:pk>/', PsychologicalTestAPIView.as_view()),

    path('psychological_test_one/', PsychologicalTestOneAPIView.as_view()),
    path('psychological_test_one/<int:pk>/', PsychologicalTestOneAPIView.as_view()),

    path('psychological_test/options/', PsychologicalTestOptionsAPIView.as_view()),
    path('psychological_test/scope_option/', PsychologicalTestScopeOptionsAPIView.as_view()),
    path('psychological_test/scope_list/', PsychologicalTestScopesAPIView.as_view()),
    path('psychological_test/add_scope/<int:pk>/', PsychologicalTestScopeOptionsAPIView.as_view()),

    path('psychological_test_result/', PsychologicalTestResultAPIView.as_view()),
    path('psychological_test_result_participants/', PsychologicalTestResultParticipantsAPIView.as_view()),
    path('psychological_test_result_show/', PsychologicalTestResultShowAPIView.as_view()),

    path('psychological_test_result_excel/', PsychologicalTestResultExcelAPIView.as_view()),
    path('iq_test_result_excel/', IQTestResultExcelAPIView.as_view()),

    path('lesson/list/', LessonsTeacher.as_view()),
    path('lesson/studentlist/', HomeworkStudentsListAPIView.as_view()),

    path('lesson/homework/', StudentHomeworkListAPIView.as_view()),
    path('lesson/homework/<int:pk>/', StudentHomeworkListAPIView.as_view()),
    path('lesson/assignment/score/', StudentHomeworkMultiEditAPIView.as_view()),

    path('lesson/getone/', LessonOneApiView.as_view()),
    path('lesson/getone/<int:pk>/', LessonOneApiView.as_view()),

    path('lesson/getall/', LessonAllApiView.as_view()),

    path('lesson/kredit/<int:pk>/', LessonKreditApiView.as_view()),
    path('lesson/sedev/<int:pk>/', LessonSedevApiView.as_view()),

    path('lesson/material/<int:pk>/', LessonMaterialApiView.as_view()),

    path('lesson/material/general/<int:pk>/', LessonMaterialGeneralApiView.as_view()),
    path('lesson/material/assignment/<int:pk>/', LessonMaterialAssignmentApiView.as_view()),

    path('lesson/material/send-material/<int:lesson>/', LessonMaterialSendApiView.as_view()),

    path('lesson/approve/', LessonMaterialApproveApiView.as_view()),
    path('lesson/challenge/', LessonChallengeApiView.as_view()),

    path('lesson/editor/image/<int:pk>/', LessonEditorImage.as_view()),

    path('lesson/image/<int:pk>/', LessonImage.as_view()),

    # Хөтөлбөрөөс хамаарч мэргэжлийн жагсаалт авах нь
    path('prof/list/<int:depId>/', ProfessionAPIView.as_view()),

    # Мэргэжлээс хамаарч ангийн жагсаалт авах нь
    path('group/list/<int:profId>/', GroupAPIView.as_view()),

    # Сургуулиас хамаарч хөтөлбөрийн багийн жагсаалт авах нь
    path('depart/list/<int:sub_org>/', SubOrgDepartListAPIView().as_view()),

    path('teacher/list/',TestTeacherApiView.as_view()),
    path('teacher/lesson/list/<int:pk>/',TestLessonTeacherApiView.as_view()),
    path('challenge/details/', ChallengeDetailApiView.as_view()),
    path('challenge/details/one/<int:pk>/', ChallengeTestDetailApiView.as_view()),
    path('challenge/result/', TestResultShowAPIView.as_view()),

    path('challenge/analysis/', AnalysisApiView.as_view()),
    path('challenge/analysis2/', Analysis2ApiView.as_view()),
    path('challenge/details/table/', ChallengeDetailTableApiView.as_view()),

    path('lessonstandart/group/score/<int:pk>/', LessonStandartGroupScoreAPIView.as_view()),
    path('lessonstandart/group/score/', LessonStandartGroupScoreAPIView.as_view()),
]
