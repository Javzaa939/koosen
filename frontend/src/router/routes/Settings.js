import { lazy } from "react";

const Student = lazy(() => import("@views/Settings/StudentSettings"))
const Teacher = lazy(() => import("@views/Settings/TeacherSettings"))
const Permission = lazy(() => import("@views/Settings/Permission"))
const Role = lazy(() => import("@views/Settings/Role"))
const Mail = lazy(() => import("@views/Settings/Mail"))

const SettingsRoutes = [
    {
        path: 'settings/student/',
        element: <Student />
    },
    {
        path: 'settings/teacher/',
        element: <Teacher />
    },
    {
        path: 'settings/permission/',
        element: <Permission />
    },
    {
        path: 'settings/role/',
        element: <Role />
    },
    {
        path: 'settings/mail/',
        element: <Mail />
    },
]

export default SettingsRoutes
