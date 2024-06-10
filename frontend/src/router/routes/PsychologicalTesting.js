import { lazy } from "react";

const TestQuestions = lazy(() => import("@views/PsychologicalTesting/Question"))
const TestExam = lazy(() => import("@views/PsychologicalTesting/Exam"))
const TestAddElements = lazy(() => import("@views/PsychologicalTesting/Exam/AddElements"))

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
        path: 'psychologicaltesting/addstudent/:challenge_id',
        element: <TestAddElements/>
    }
]

export default PsychologicalTestingRoutes
