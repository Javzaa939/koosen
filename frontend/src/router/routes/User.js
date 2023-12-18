import { lazy } from "react";

const User = lazy(() => import("@views/User"))
const UserDetail = lazy(() => import("@views/User/Detail"))

const UserRoutes = [
    {
        path: '/user',
        element: <User />
    },
    {
        path: 'user/:userID/',
        element: <UserDetail />
    },
]

export default UserRoutes
