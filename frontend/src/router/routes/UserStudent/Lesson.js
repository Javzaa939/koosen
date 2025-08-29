import { lazy } from "react";

const LessonSchedule = lazy(() => import("@views/UserStudent/Lesson/LessonSchedule"))
const ExaminationSchedule = lazy(() => import("@views/UserStudent/Lesson/ExaminationSchedule"))
const Graduate = lazy(() => import("@views/UserStudent/Lesson/Graduate"))

const LessonRoutes = [
    {
        path: 'user-student/lesson/lesson-schedule',
        element: <LessonSchedule />
    },
    {
        path: 'user-student/lesson/examination-schedule',
        element: <ExaminationSchedule />
    },
    // {
    //     path: 'user-student/student/graduate',
    //     element: <Graduate />
    // },
]

export default LessonRoutes
