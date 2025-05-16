import { lazy } from "react";

// admission challenge
const AdmissionQuestion = lazy(() => import("@views/AdmissionChallenge/Question"))

// progress challenge
const Test = lazy(() => import("@views/Test/"))
const ShowDetail = lazy(() => import("@views/Test/DetailShow"))
const EQuestions = lazy(() => import("@views/Test/EQuestions/"))
const Challenge = lazy(() => import("@views/Test/Test/"))
const AddStudent = lazy(() => import("@views/Test/Test/AddStudent/"))
const ExamSchedule = lazy(() => import("@views/Test/ExamSchedule"))
const Teacher = lazy(() => import("@views/Test/Teachers"))

// season challenge
const SeasonTest = lazy(() => import("@views/SeasonTest/Test/"))
const SeasonTestQuestion = lazy(() => import("@views/SeasonTest/Question/"))
const AddStudentSeason = lazy(() => import("@views/SeasonTest/Test/AddStudent/"))
const TestReport = lazy(() => import("@views/SeasonTest/Report/"))

// graduate challenge
const GraduateQuestion = lazy(() => import("@views/GraduateTest/Question/"))
const GraduateTest = lazy(() => import("@views/GraduateTest/Test/"))
const AddStudentGraduate = lazy(() => import("@views/GraduateTest/Test/AddStudent/"))


const TestRoutes = [
    // #region admission challenge
    // "Asuultyn san" page
    {
        path: '/admission-challenge/question/',
        element: <AdmissionQuestion />
    },
    // #endregion

    // #region progress challenge
    // "Asuultyn san" page
    {
        path: '/challenge/teacher/',
        element: <Teacher />
    },
    {
        path: '/challenge/equestion/',
        element: <EQuestions />
    },

    // "Online shalgalt" page
    {
        path: '/challenge/challenge/',
        element: <Test />
    },
    {
        path: '/challenge/detail/:detid',
        element: <ShowDetail />
    },
    {
        path: '/challenge/test/addstudent/:challenge_id/:lesson_id',
        element: <AddStudent/>
    },
    {
        path: '/challenge/test/',
        element: <Challenge/>
    },
    {
        path: 'challenge/exam_schedule/',
        element: <ExamSchedule/>
    },
    // #endregion

    // #region season challenge
    {
        path: '/challenge-question/',
        element: <SeasonTestQuestion/>
    },
    {
        path: '/challenge-season/',
        element: <SeasonTest/>
    },
    {
        path: '/challenge-report/',
        element: <TestReport/>
    },
    {
        path: '/challenge-season/addstudent/:challenge_id/:lesson_id',
        element: <AddStudentSeason/>
    },
    // #endregion

    // #region graduate challenge
    {
        path: '/graduate-question/',
        element: <GraduateQuestion/>
    },
    {
        path: 'challenge-graduate/',
        element: <GraduateTest/>
    },
    {
        path: '/challenge/graduate-test/addstudent/:challenge_id/',
        element: <AddStudentGraduate/>
    },
    // #endregion
]

export default TestRoutes;