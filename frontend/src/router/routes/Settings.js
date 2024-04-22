import { lazy } from "react";

const Student = lazy(() => import("@views/Settings/StudentSettings"))
const Teacher = lazy(() => import("@views/Settings/TeacherSettings"))
const Country = lazy(() => import("@views/Settings/Country"))
const Mail = lazy(() => import("@views/Settings/Mail"))
const Permission = lazy(() => import("@views/Settings/Permission"))
const Role = lazy(() => import("@views/Settings/Role"))
const Able = lazy(() => import("@views/Settings/Able"))


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
        path: 'settings/country/',
        element: <Country />
    },
    {
        path: 'settings/mail/',
        element: <Mail />
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
        path: 'settings/able/',
        element: <Able />
    },
]

export default SettingsRoutes