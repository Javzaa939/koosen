import { lazy } from "react";

const Test = lazy(() => import("@views/Test/"))
const ShowDetail = lazy(() => import("@views/Test/DetailShow"))

// const Questions = lazy(() => import("@views/TestProgram/Question/"))
const EQuestions = lazy(() => import("@views/Test/EQuestions/"))
// const Topic = lazy(() => import("@views/TestProgram/EQuestions/Topic/"))
// const TopicQuestions = lazy (() => import("@views/TestProgram/EQuestions/Topic/Question/"))
const Challenge = lazy(() => import("@views/Test/Test/"))
const AddStudent = lazy(() => import("@views/Test/Test/AddStudent/"))

const Detail = lazy(() => import("@views/Test/DetailShow"))
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
    // {
        // path: '/challenge/question/',
        // element: <Questions />
    // },
    {
        path: '/challenge/equestion/',
        element: <EQuestions />
    },
    {
        path: '/challenge/teacher/',
        element: <Teacher />
    },
    // {
    //     path: '/challenge/equestion/topic/:lesson_id',
    //     element: <Topic />
    // },
    // {
    //     path: '/challenge/equestion/topic/question/:question_id',
    //     element: <TopicQuestions />
    // },
    {
        path: '/challenge/test/',
        element: <Challenge/>
    },
    {
        path: '/challenge/test/addstudent/:challenge_id/:lesson_id',
        element: <AddStudent/>
    },
    // {
    //     path: 'challenge/detail/:detail_id',
    //     element: <Detail/>
    // },
    {
        path: 'challenge/exam_schedule/',
        element: <ExamSchedule/>
    }
]

export default TestRoutes;