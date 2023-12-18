import { lazy } from 'react'

const RoomType = lazy(() => import("@views/Dormitory/RoomType"))
const Rooms = lazy(() => import("@views/Dormitory/Rooms"))
const PaymentConfig = lazy(() => import("@views/Dormitory/PaymentConfig"))
const DormitoryRegistration = lazy(() => import("@views/Dormitory/DormitoryRegistration"))
const DormitoryEstimate = lazy(() => import("@views/Dormitory/DormitoryEstimate"))
const Request = lazy(() => import("@views/Dormitory/Request"))
const DormitoryTransaction = lazy(() => import("@views/Dormitory/DormitoryTransaction"))

const Dormitory = [
    {
        path: 'dormitory/room-types/',
        element: <RoomType />
    },
    {
        path: 'dormitory/rooms/',
        element: <Rooms />
    },
    {
        path: 'dormitory/payment-config/',
        element: <PaymentConfig />
    },
    {
        path: 'dormitory/dormitory-registration/',
        element: <DormitoryRegistration />
    },
    {
        path: 'dormitory/dormitory-estimate/',
        element: <DormitoryEstimate />
    },
    {
        path: 'dormitory/request/',
        element: <Request />
    },
    {
        path: 'dormitory/dormitory-transaction/',
        element: <DormitoryTransaction />
    },
]

export default Dormitory
