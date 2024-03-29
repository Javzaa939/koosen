import { lazy } from "react";

const ElseltRegister = lazy(() => import("@views/Elselt/Register"))
const ElseltProfession = lazy(() => import("@views/Elselt/Register/Profession"))
// const Dashboard = lazy(() => import("@views/Elselt/Dashboard"))
const SysInfo = lazy(() => import("@views/Elselt/SysInfo"))
const User = lazy(() => import("@views/Elselt/User"))
const Tailan = lazy(() => import("@views/Elselt/Tailan"))
const Details = lazy(() => import("@views/Elselt/User/Details"))

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
    {
        path: 'elselt/user/',
        element: <User />
    },
    {
        path: 'elselt/user/:student',
        element: <Details />
    },
    // {
    //     path: 'elselt/dashboard/',
    //     element: <Dashboard />
    // },
    {
        path: 'elselt/tailan/',
        element: <Tailan />
    },
]

export default ElseltRoutes
