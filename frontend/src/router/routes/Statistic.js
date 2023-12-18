import { lazy } from "react";

const Statistic = lazy(() => import("@views/Statistic"))

const StatisticRoutes = [
    {
        path: 'statistic',
        element: <Statistic />
    },

]

export default StatisticRoutes
