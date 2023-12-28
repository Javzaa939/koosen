import { lazy } from "react";

const Student = lazy(() => import("@views/Settings/StudentSettings"))
const Teacher = lazy(() => import("@views/Settings/TeacherSettings"))

const SettingsRoutes = [
    {
        path: 'settings/student/',
        element: <Student />
    },
    {
        path: 'settings/teacher/',
        element: <Teacher />
    },
]

export default SettingsRoutes
