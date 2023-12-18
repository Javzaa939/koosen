import { lazy } from "react";

const Volume = lazy(() => import("@views/CreditEstimation/Volume"))
const VolumePrint = lazy(() => import("@views/CreditEstimation/Volume/Print"))
const AEstimation = lazy(() => import("@views/CreditEstimation/AEstimation"))
const Confrontation = lazy(() => import("@views/CreditEstimation/Confrontation"))
const ConfrontationPrint = lazy(() => import("@views/CreditEstimation/Confrontation/Print"))
const Settings = lazy(() => import("@views/CreditEstimation/Settings"))
const PartTime = lazy(() => import("@views/CreditEstimation/PartTime"))
const PartTimePrint = lazy(() => import("@views/CreditEstimation/PartTime/Print"))

const LessonPrint = lazy(() => import("@views/CreditEstimation/AEstimation/LessonPrint"))
const EstimationPrint = lazy(() => import("@views/CreditEstimation/AEstimation/Print"))

const CreditRoutes = [
    {
        path: 'credit/volume/',
        element: <Volume />
    },
    {
        path: 'credit/a_estimation/',
        element: <AEstimation />
    },
    {
        path: 'credit/confrontation/',
        element: <Confrontation />
    },
    {
        path: 'credit/part-time/',
        element: <PartTime />
    },
    {
        path: 'credit/part-time/print/',
        element: <PartTimePrint />,
        meta: {
            layout: 'blank'
        },
    },
    {
        path: 'credit/confrontation/print/',
        element: <ConfrontationPrint />,
        meta: {
            layout: 'blank'
        },
    },
    {
        path: 'credit/volume/print/',
        element: <VolumePrint />,
        meta: {
            layout: 'blank'
        },
    },
    {
        path: 'credit/settings/',
        element: <Settings />
    },
    {
        path: 'credit/estimationa/print/',
        element: <EstimationPrint />,
        meta: {
            layout: 'blank'
        },
    },
    {
        path: 'credit/a_estimation/lessons/print/',
        element: <LessonPrint />,
        meta: {
            layout: 'blank'
        },
    },
]

export default CreditRoutes
