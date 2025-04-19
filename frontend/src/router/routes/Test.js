import { lazy } from "react";

const Test = lazy(() => import("@views/Test/"))
const ShowDetail = lazy(() => import("@views/Test/DetailShow"))

const EQuestions = lazy(() => import("@views/Test/EQuestions/"))
const Challenge = lazy(() => import("@views/Test/Test/"))
const SeasonTest = lazy(() => import("@views/SeasonTest/Test/"))
const SeasonTestQuestion = lazy(() => import("@views/SeasonTest/Question/"))
const GraduateQuestion = lazy(() => import("@views/GraduateTest/Question/"))
const GraduateTest = lazy(() => import("@views/GraduateTest/Test/"))

const AddStudent = lazy(() => import("@views/Test/Test/AddStudent/"))
const AddStudentSeason = lazy(() => import("@views/SeasonTest/Test/AddStudent/"))
const AddStudentGraduate = lazy(() => import("@views/GraduateTest/Test/AddStudent/"))

const TestReport = lazy(() => import("@views/SeasonTest/Report/"))

const ExamSchedule = lazy(() => import("@views/Test/ExamSchedule"))
const Teacher = lazy(() => import("@views/Test/Teachers"))

const TestRoutes = [
    {
        path: '/challenge/challenge/',
        element: <Test />
    },
    {
        path: '/challenge/detail/:detid',
        element: <ShowDetail />
    },
    {
        path: '/challenge/equestion/',
        element: <EQuestions />
    },
    {
        path: '/challenge/teacher/',
        element: <Teacher />
    },
    {
        path: '/challenge/test/',
        element: <Challenge/>
    },
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
        path: '/challenge/test/addstudent/:challenge_id/:lesson_id',
        element: <AddStudent/>
    },
    {
        path: '/challenge-season/addstudent/:challenge_id/:lesson_id',
        element: <AddStudentSeason/>
    },
    {
        path: 'challenge/exam_schedule/',
        element: <ExamSchedule/>
    },
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
]

export default TestRoutes;