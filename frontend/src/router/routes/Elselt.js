import { lazy } from "react";

const ElseltYlshiitgel = lazy(() => import("@views/Elselt/Ylshiitgel"))
const ElseltRegister = lazy(() => import("@views/Elselt/Register"))
const ElseltProfession = lazy(() => import("@views/Elselt/Register/Profession"))
const Dashboard = lazy(() => import("@views/Elselt/Dashboard"))
const SysInfo = lazy(() => import("@views/Elselt/SysInfo"))
const User = lazy(() => import("@views/Elselt/User"))
const Tailan = lazy(() => import("@views/Elselt/Tailan"))
const Details = lazy(() => import("@views/Elselt/User/Details"))
const AnhanShat = lazy(() => import("@views/Elselt/Health/AnhanShat"))
const Mergejliin = lazy(() => import("@views/Elselt/Health/Mergejliin"))
const Physical = lazy(() => import("@src/views/Elselt/Health/Physical"))
const MessageTailan = lazy(() => import("@views/Elselt/Tailan/Message"))
const InterView = lazy(() => import("@views/Elselt/InterView"))
const FieldPreparation = lazy(()=>import("@views/Elselt/FieldPreparation"))
const Log = lazy(()=>import("@views/Elselt/Log"))
const ElseltRoutes = [
    {
        path: 'elselt/ylshiitgel/',
        element: <ElseltYlshiitgel />
    },
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
    {
        path: 'elselt/dashboard/',
        element: <Dashboard />
    },
    {
        path: 'elselt/tailan/',
        element: <Tailan />
    },
    {
        path: 'elselt/message',
        element: <MessageTailan />
    },
    {
        path: 'elselt/health/anhan',
        element: <AnhanShat />
    },
    {
        path: 'elselt/health/mergejliin',
        element: <Mergejliin />
    },
    {
        path: 'elselt/physical/',
        element: <Physical />
    },
    {
        path: 'elselt/interview/',
        element: <InterView />
    },
    {
        path: 'elselt/preparation/',
        element: <FieldPreparation />
    },
    {
        path: 'elselt/log/',
        element: <Log />
    },
]

export default ElseltRoutes
