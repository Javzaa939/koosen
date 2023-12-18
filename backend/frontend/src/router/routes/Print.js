import { lazy } from "react";

const LessonChoice = lazy(() => import("@views/Print/LessonChoice"))
const Schedule = lazy(() => import("@views/Print/Schedule"))
// const ExamName = lazy(() => import("@views/Print/ExamName"))
const GPA = lazy(() => import("@views/Print/GPA"))
const Graduation = lazy(() => import("@views/Print/Graduation"))
const Enrollment = lazy(() => import("@views/Print/Enrollment"))

const PrintRoutes = [
    {
        path: 'print/lessonchoice/',
        element: <LessonChoice />
    },
    {
        path: 'print/schedule/',
        element: <Schedule />
    },
    {
        path: 'print/gpa/',
        element: <GPA />
    },
    {
        path: 'print/graduation/',
        element: <Graduation />
    },
    {
        path: 'print/enrollment/',
        element: <Enrollment />
    },
]

export default PrintRoutes
