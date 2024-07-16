import { lazy } from "react";

const TestQuestions = lazy(() => import("@views/PsychologicalTesting/Question"))
const TestExam = lazy(() => import("@views/PsychologicalTesting/Exam"))
const TestResult = lazy(() => import("@views/PsychologicalTesting/Result"))
const TestAddElements = lazy(() => import("@views/PsychologicalTesting/Exam/AddElements"))
const TestShowParticipants = lazy(() => import("@views/PsychologicalTesting/Result/Participants"))

const PsychologicalTestingRoutes = [
    {
        path: 'psychologicaltesting/create_questions',
        element: <TestQuestions />
    },
    {
        path: 'psychologicaltesting/exam',
        element: <TestExam />
    },
    {
        path: 'psychologicaltesting/result',
        element: <TestResult />
    },
    {
        path: 'psychologicaltesting/addstudent/:challenge_id',
        element: <TestAddElements/>
    },
    {
        path: 'psychologicaltesting/showparticipants/:challenge_id',
        element: <TestShowParticipants/>
    }
]

export default PsychologicalTestingRoutes
