import { lazy } from "react";
const Teacher = lazy(() => import("@views/Role/Teachers"))
const Busad = lazy(() => import("@views/Role/Busads"))
const Crontab = lazy(() => import("@views/Role/Crontab"))

const Student = lazy(() => import("@views/Role/Student"))

const RoleRoutes = [
    {
        path: 'role/teacher',
        element: <Teacher />,

    },
    {
        path: 'role/student',
        element: <Student />
    },
    {
        path: 'role/busad',
        element: <Busad />
    },
    {
        path: 'role/crontab',
        element: <Crontab />
    },
]

export default RoleRoutes
