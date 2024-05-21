import { lazy } from "react";

const StudyPlan = lazy(() => import("@views/Study/StudyPlan"))
const PrintProfession = lazy(() => import("@views/Study/StudyPlan/PrintProfession"))

const StudyPlanRoutes = [
    {
        path: '/study/plan',
        element: <StudyPlan />
    },
    {
        path: 'study/studyplan/printprofession',
        element: <PrintProfession />,
        meta : {
            layout: 'blank'
        }
    },
]

export default StudyPlanRoutes
