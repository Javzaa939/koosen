import { lazy } from "react";

const ElseltRegister = lazy(() => import("@views/Elselt/Register"))
const ElseltProfession = lazy(() => import("@views/Elselt/Register/Profession"))
const SysInfo = lazy(() => import("@views/Elselt/SysInfo"))

const ElseltRoutes = [
    {
        path: 'elselt/register/',
        element: <ElseltRegister />
    },
    {
        path: 'elselt/sysinfo/',
        element: <SysInfo />
    },
    {
        path: 'elselt/profession/',
        element: <ElseltProfession />
    },
]

export default ElseltRoutes
