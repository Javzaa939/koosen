import { lazy } from "react";

const ScoreRegister = lazy(() => import("@views/Score/ScoreRegister"))
const Correspond = lazy(() => import("@views/Score/Correspond"))
const RepeatExam = lazy(() => import("@views/Score/RepeatExam"))
const GradeList = lazy(() => import("@views/Score/GradeList"))
const PrintScore = lazy(() => import("@views/Score/GradeList/PrintScore"))
const ProgressScore = lazy(() => import("@views/Score/ProgressScore"))

const Score = [
    {
        path: 'score/score-register/',
        element: <ScoreRegister />
    },
    {
        path: 'score/correspond/',
        element: <Correspond />
    },
    {
        path: 'score/re-examscore/',
        element: <RepeatExam />
    },
    {
        path: 'score/preview-score/',
        element: <GradeList />
    },
    {
        path: 'score/preview-score/print',
        element: <PrintScore />,
        meta: {
            layout: 'blank'
        }
    },
    {
        path: 'score/progress-score/',
        element: <ProgressScore />
    }
]

export default Score
