import { lazy } from "react";

const Building = lazy(() => import("@views/TimeTable/Building"))
const Room = lazy(() => import("@views/TimeTable/Room"))
const AddV2 = lazy(() => import("@views/TimeTable/Register/AddV2"))
const ExamTimeTable = lazy(() => import("@views/TimeTable/ExamTimeTable"))
const ExamReport = lazy (() => import("@views/TimeTable/ExamTimeTable/ExamReport"))
const ExamRepeat = lazy (() => import("@views/TimeTable/ExamRepeat"))

const TimetableRoutes = [
    {
        path: 'timetable/building/',
        element: <Building />
    },
    {
        path: 'timetable/room/',
        element: <Room />
    },
    {
        path: 'timetable/register/',
        element: <AddV2 />,
        // meta: {
        //     layout: 'blank',
        // }
    },
    {
        path: 'timetable/exam-register/',
        element: <ExamTimeTable />
    },
    {
        path: 'timetable/exam-re/',
        element: <ExamRepeat />
    },
    {
        path: 'timetable/examreport/:id',
        element: <ExamReport />,
        meta: {
            layout: 'blank',
        }
    },
]

export default TimetableRoutes
