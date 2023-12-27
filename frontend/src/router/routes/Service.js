import { lazy } from "react";

const NewsList = lazy(() => import("@views/Service"))
const Show = lazy(() => import("@views/Service/Show"))
const ShowAd = lazy(() => import("@views/Service/ShowAd"))

const ServiceRoutes = [

    {
        path: 'service',
        element: <NewsList/>
    },
    {
        path: 'service/show/:newsid',
        element: <Show/>
    },
    {
        path: 'service/showad/:newsid',
        element: <ShowAd/>
    },
]

export default ServiceRoutes