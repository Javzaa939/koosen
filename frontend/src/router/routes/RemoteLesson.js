import { lazy } from "react";

const Remote = lazy(() => import("@views/RemoteLesson"))

const RemoteRoutes = [
    {
        path: 'remote_lesson',
        element: <Remote />
    },
]

export default RemoteRoutes
