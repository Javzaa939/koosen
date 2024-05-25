import { lazy } from "react";

const TestQuestions = lazy(() => import("@views/PsychologicalTesting/Question"))
const TestExam = lazy(() => import("@views/PsychologicalTesting/Exam"))

const PsychologicalTestingRoutes = [
    {
        path: 'psychologicaltesting/create_questions',
        element: <TestQuestions />
    },
    {
        path: 'psychologicaltesting/exam',
        element: <TestExam />
    },
]

export default PsychologicalTestingRoutes
