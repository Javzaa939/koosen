import { lazy } from "react";

const Library = lazy(() => import("@views/Order/Library"))
const Sport = lazy(() => import("@views/Order/Sport"))
const Gym = lazy(() => import("@views/Order/Gym"))
const Hospital = lazy(() => import("@views/Order/Hospital"))

const OrderRoutes = [
    {
        path: 'order/library',
        element: <Library />
    },
    {
        path: 'order/sport',
        element: <Sport />
    },
    {
        path: 'order/gym',
        element: <Gym />
    },
    {
        path: 'order/hospital',
        element: <Hospital />
    }
]

export default OrderRoutes
