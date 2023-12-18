import { lazy } from "react";

const StudyPlan = lazy(() => import("@views/Study/StudyPlan"))

const StudyPlanRoutes = [
    {
        path: '/study/plan',
        element: <StudyPlan />
    },
]

export default StudyPlanRoutes
