import { lazy } from "react";

const StudyPlan = lazy(() => import("@views/UserStudent/Student/StudyPlanV2"))
const ScoreInformation = lazy(() => import("@views/UserStudent/Student/ScoreInformation"))
const StudentAttendance = lazy(() => import("@views/UserStudent/Student/StudentAttendance"))
const ScoreTeacher = lazy(() => import("@views/UserStudent/ScoreTeacher/"))
const PaymentInformation = lazy(() => import("@views/UserStudent/Student/PaymentInformation"))
const PersonalInformationPrint = lazy(() => import("@views/UserStudent/Student/PaymentInformation/SeasonPayment/Print"))
const EbarimtPrint = lazy(() => import("@views/UserStudent/Student/PaymentInformation/Print"))
const SmallPrint = lazy(() => import("@views/UserStudent/Student/PaymentInformation/SmallPrint"))

const StudentRoutes = [
    {
        path: 'user-student/student/score-information',
        element: <ScoreInformation/>
    },
    {
        path: 'user-student/student/offer-study-plan',
        element: <StudyPlan/>
    },
    {
        path: 'user-student/student/student-attendance',
        element: <StudentAttendance/>
    },
    {
        path: 'user-student/student/score-teacher/',
        element: <ScoreTeacher />,
    },
    {
        path: 'user-student/student/payment-information',
        element: <PaymentInformation/>
    },
    {
        path: 'user-student/student/payment-information/print',
        element: <PersonalInformationPrint />,
        meta: {
            layout: 'blank'
        }
    },
    {
        path: 'user-student/student/payment-information/ebarimt/print',
        element: <EbarimtPrint />,
        meta: {
            layout: 'blank'
        }
    },
    {
        path: 'user-student/student/payment-information/ebarimt/small_print',
        element: <SmallPrint />,
        meta: {
            layout: 'blank'
        }
    },
]
export default StudentRoutes
