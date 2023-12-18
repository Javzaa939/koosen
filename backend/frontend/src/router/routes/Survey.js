import { lazy } from "react";

const Survey = lazy(() => import("@views/Survey/SurveyMain"))
const SurveyResults = lazy(() => import("@views/Survey/Results"))
const TeacherEvaluation = lazy(() => import("@views/TeacherEvaluation/Question"))
const ResultDetail = lazy(() => import("@views/Survey/Results/ResultDetail"))

const SurveyRoutes = [
    {
        path: 'survey/surveymain',
        element: <Survey />
    },
    {
        path:'survey/results',
        element: <SurveyResults />
    },
    {
        path: 'evaluation/question',
        element: <TeacherEvaluation />
    },
    {
        path:'survey/results/resultdetail/:id/',
        element: <ResultDetail />
    }
]

export default SurveyRoutes
