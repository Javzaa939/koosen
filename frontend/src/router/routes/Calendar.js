import { lazy } from "react";

const Calendar = lazy(() => import("@views/Calendar"))

const CalendarRoutes = [
    {
        path: 'calendar/',
        element: <Calendar />
    },
]

export default CalendarRoutes
