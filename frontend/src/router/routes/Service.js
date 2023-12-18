import { lazy } from "react";

const News = lazy(() => import("@views/Service/News"))
const NewsDetail = lazy(() => import("@views/Service/NewsDetail"))

const ServiceRoutes = [
    {
        path: 'service/news',
        element: <News />
    },
    {
        path: 'service/news/:newsid',
        element: <NewsDetail />
    }
]

export default ServiceRoutes
