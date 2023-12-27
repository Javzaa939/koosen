import { lazy } from "react";

const NewsList = lazy(() => import("@views/Service"))
const News = lazy(() => import("@views/Service/News"))
const NewsDetail = lazy(() => import("@views/Service/NewsDetail"))

const ServiceRoutes = [

    {
        path: 'service',
        element: <NewsList/>
    },
    {
        path: 'service/news',
        element: <News/>
    },
    {
        path: 'service/news/:newsid',
        element: <NewsDetail />
    }
]

export default ServiceRoutes