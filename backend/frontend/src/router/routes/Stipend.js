import { lazy } from "react";

const Register = lazy(() => import("@views/Stipend/Register"))
const Request = lazy(() => import("@views/Stipend/Request"))

const StipendRoutes = [
    {
        path: 'stipend/register/',
        element: <Register />
    },
    {
        path: 'stipend/request/',
        element: <Request />
    },
]

export default StipendRoutes
