import { lazy } from "react";

const Group = lazy(() => import("@views/Student/Group"))
const Register = lazy(() => import("@views/Student/Register"))
const Detail = lazy(() => import("@views/Student/Register/Detail"))
const Transfer = lazy(() => import("@views/Student/Transfer"))
const Graduation =lazy(() => import("@views/Student/Graduation"))
const LoanFund =lazy(() => import("@views/Student/LoanFund"))
const Leave = lazy(() => import("@views/Student/Leave"))
const Info = lazy(() => import("@views/Student/Info"))
const Specification = lazy(() => import("@views/Student/Definition/Specification"))
const LearningTrue = lazy(() => import("@views/Student/Definition/LearningTrue"))
const CreditCalculation = lazy(() => import("@views/Student/Definition/CreditCalculation"))
const AmountDetails = lazy(() => import("@views/Student/Definition/AmountDetails"))
const Sum = lazy(() => import("@views/Student/Definition/Sum"))

const PrintMongolia = lazy(() => import("@views/Student/Graduation/PrintMongolia"))
const PrintEnglish = lazy(() => import("@views/Student/Graduation/PrintEnglish"))
const PrintNational = lazy(() => import("@views/Student/Graduation/PrintNational"))

const PrintAttachmentMongolia = lazy(() => import("@views/Student/Attachment/PrintMongolia"))
const PrintAttachmentEnglish = lazy(() => import("@views/Student/Attachment/PrintEnglish"))
const PrintAttachmentNational = lazy(() => import("@views/Student/Attachment/PrintNational"))
const Attachment = lazy(() => import("@views/Student/Attachment"))
const AttachmentStudent = lazy(() => import("@views/Student/Attachment/Student"))
const Viz = lazy(() => import("@views/Student/Viz"))
const StatementPrint = lazy(() => import("@views/Student/Transfer/Irsen/Print"))
const ScoreSeasonPrint = lazy(() => import("@views/Student/Definition/ScoreSeason"))
//nemsen zuil ni
const Graduates = lazy(() => import("@views/Student/Graduates"))
const Enrollment = lazy(() => import("@views/Student/Enrollment"))

const StudentRoutes = [
     //shineer nemsen zam ni:
    {
        path: 'student/graduates/',
        element: <Graduates />
    },
    {
        path: 'student/group/',
        element: <Group />
    },
    {
        path: 'student/register/',
        element: <Register />
    },
    {
        path: 'student/register/:studentId/detail/',
        element: <Detail />
    },
    {
        path: 'student/shift/',
        element: <Transfer />
    },
    {
        path: 'student/shift/1/',
        element: <Transfer />
    },
    {
        path: 'student/shift/print/',
        element: <StatementPrint />,
        meta: {
            layout: 'blank'
        }
    },
    {
        path: 'student/graduation/',
        element: <Graduation />
    },
    {
        path: 'student/educational-loan-fund/',
        element: <LoanFund />
    },
    {
        path: 'student/leave/',
        element: <Leave />
    },
    {
        path: 'student/:studentId/info/',
        element: <Info />
    },
    {
        path: 'student/specification/',
        element: <Specification />
    },
    {
        path: 'student/learning-true/',
        element: <LearningTrue />,
        meta: {
            layout: 'blank'
        }
    },
    {
        path: 'student/amount-details/',
        element: <AmountDetails />,
        meta: {
            layout: 'blank'
        }
    },
    {
        path: 'student/sum/',
        element: <Sum />,
        meta: {
            layout: 'blank'
        }
    },
    {
        path: 'student/credit-calculation/',
        element: <CreditCalculation />,
        meta: {
            layout: 'blank'
        }
    },
    {
        path: 'student/graduation/print-mongolia/',
        element: <PrintMongolia />,
        meta: {
            layout: 'blank'
        }
    },
    {
        path: 'student/graduation/print-english/',
        element: <PrintEnglish />,
        meta: {
            layout: 'blank'
        }
    },
    {
        path: 'student/graduation/print-national/',
        element: <PrintNational />,
        meta: {
            layout: 'blank'
        }
    },
    {
        path: 'student/attachment',
        element: <Attachment />
    },
    {
        path: 'student/attachment/print-mongolia/',
        element: <PrintAttachmentMongolia />,
        meta: {
            layout: 'blank'
        }
    },
    {
        path: 'student/attachment/print-english/',
        element: <PrintAttachmentEnglish />,
        meta: {
            layout: 'blank'
        }
    },
    {
        path: 'student/attachment/print-national/',
        element: <PrintAttachmentNational />,
        meta: {
            layout: 'blank'
        }
    },
    {
        path: 'student/attachment/attachment-student/',
        element: <AttachmentStudent />
    },
    {
        path: 'student/viz-status/',
        element: <Viz />,
    },
    {
        path: 'student/student-season-print/',
        element: <ScoreSeasonPrint />,
        meta: {
            layout: 'blank'
        }
    },
    {
        path: 'student/enrollment/',
        element: <Enrollment />
    },
]

export default StudentRoutes
