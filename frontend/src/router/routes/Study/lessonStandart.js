import { lazy } from "react";

const LessonStandart = lazy(() => import("@views/Study/LessonStandart"))
const Edit = lazy(()=> import("@views/Study/LessonStandart/Edit"))

const LessonStandartRoutes = [
    {
        path: '/study/lessonStandart',
        element: <LessonStandart />
    },
    {
        path: '/study/lessonStandart/:standart_Id/',
        element: <Edit />
    },
]

export default LessonStandartRoutes
