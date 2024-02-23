import { lazy } from "react";

const ElseltRegister = lazy(() => import("@views/Elselt/Register"))

const ElseltRoutes = [
    {
        path: 'elselt/register/',
        element: <ElseltRegister />
    },
]

export default ElseltRoutes
