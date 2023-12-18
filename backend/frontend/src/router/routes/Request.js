import { lazy } from "react";

const Complaint = lazy(() => import("@views/Request/Complaint"))
const ComplaintPrint = lazy(() => import("@views/Request/Complaint/print"))
const Correspond = lazy(() => import("@views/Request/Correspond"))
const CorrespondPrint = lazy(() => import("@views/Request/Correspond/Print"))
const Leave = lazy(() => import("@views/Request/Leave"))
const LeavePrint = lazy(() => import("@views/Request/Leave/print"))
const Motion = lazy(() => import("@views/Request/Motion"))
const RoutingSlip = lazy(() => import("@views/Request/RoutingSlip"))
const RoutingSlipPrint = lazy(() => import("@views/Request/RoutingSlip/Print"))
const RequestUnit = lazy(() => import("@views/Request/Unit"))
const Volunteer = lazy(() => import("@views/Request/Volunteer"))
const Club = lazy(() => import("@views/Request/Club"))
const Tutor = lazy(() => import("@views/Request/Tutor"))

const RequestRoutes = [
    {
        path: 'request/unit',
        element: <RequestUnit />
    },
    {
        path: 'request/complaint',
        element: <Complaint />
    },
    {
        path: 'request/complaint/print/:complaintId',
        element: <ComplaintPrint />,
        meta: {
            layout: 'blank'
        }
    },
    {
        path: 'request/correspond',
        element: <Correspond />
    },
    {
        path: 'request/correspond/print/:correspondId',
        element: <CorrespondPrint />,
        meta: {
            layout: 'blank'
        }
    },
    {
        path: 'request/leave',
        element: <Leave />
    },
    {
        path: 'request/leave/print/:leaveId',
        element: <LeavePrint />,
        meta: {
            layout: 'blank'
        }
    },
    {
        path: 'request/motion',
        element: <Motion />
    },
    {
        path: 'request/routingslip',
        element: <RoutingSlip />
    },
    {
        path: 'request/routingslip/print/:routingslipId',
        element: <RoutingSlipPrint />,
        meta: {
            layout: 'blank'
        },
    },
    {
        path: 'request/volunteer',
        element: <Volunteer />
    },
    {
        path: 'request/club',
        element: <Club />
    },
    {
        path: 'request/tutor',
        element: <Tutor />
    },
]

export default RequestRoutes
