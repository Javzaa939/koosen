import { lazy } from "react";

const PaymentSettings = lazy(() => import("@views/StudyPayment/PaymentSettings"))
const PaymentBeginBalance = lazy(() => import("@views/StudyPayment/PaymentBeginBalance"))
const PaymentBalance = lazy(() => import("@views/StudyPayment/PaymentBalance"))
const PaymentEstimate = lazy(() => import("@views/StudyPayment/PaymentEstimate"))
const PaymentDiscount = lazy(() => import("@views/StudyPayment/PaymentDiscount"))

const PaymentSettingsRoutes = [
    {
        path: 'studypayment/settings/',
        element: <PaymentSettings />
    },
    {
        path: 'studypayment/start-balance/',
        element: <PaymentBeginBalance />
    },
    {
        path: 'studypayment/transactions/',
        element: <PaymentBalance />
    },
    {
        path: 'studypayment/bill/',
        element: <PaymentEstimate />
    },
    {
        path: 'studypayment/Discount/',
        element: <PaymentDiscount />
    },
]

export default PaymentSettingsRoutes
