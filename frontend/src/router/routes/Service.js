import { lazy } from "react";

const NewsList = lazy(() => import("@views/Service"))
const Show = lazy(() => import("@views/Service/Show"))

const ServiceRoutes = [

    {
        path: 'service',
        element: <NewsList/>
    },
    {
        path: 'service/show/:newsid',
        element: <Show/>
    },
]

export default ServiceRoutes