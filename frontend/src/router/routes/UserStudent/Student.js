import { lazy } from "react";

const StudyPlan = lazy(() => import("@views/UserStudent/Student/StudyPlanV2"))
const ScoreInformation = lazy(() => import("@views/UserStudent/Student/ScoreInformation"))
const StudentAttendance = lazy(() => import("@views/UserStudent/Student/StudentAttendance"))
const ScoreTeacher = lazy(() => import("@views/UserStudent/ScoreTeacher/"))

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
]
export default StudentRoutes
