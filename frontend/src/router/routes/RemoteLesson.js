import { lazy } from "react";

const Remote = lazy(() => import("@views/RemoteLesson"))
const Lesson = lazy(() => import("@views/RemoteLesson/Lesson"))

const RemoteRoutes = [
    {
        path: 'remote_lesson',
        element: <Remote />
    },
    {
        path: 'remote_lesson/:id',
        element: <Lesson />
    },
]

export default RemoteRoutes
