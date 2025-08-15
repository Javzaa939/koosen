import { lazy } from "react";

const School = lazy(() => import("@views/Reference/School"))
const SubSchool = lazy(() => import("@views/Reference/SubSchool"))
const Departments = lazy(() => import("@views/Reference/Departments"))
const Teachers = lazy(() => import("@views/Reference/Teacher"))
const INFO = lazy(() => import("@views/Reference/Teacher/INFO"))
const Positions = lazy(() => import("@views/Reference/Position"))

const ReferenceRoutes = [
    {
        path: 'reference/school/',
        element: <School />
    },
    {
        path: 'reference/subschool/',
        element: <SubSchool />
    },
    {
        path: 'reference/departments/',
        element: <Departments />
    },
    {
        path: 'reference/teachers/',
        element: <Teachers />
    },
    {
        path: 'reference/teachers/:teacher_id/info/',
        element: <INFO />
    },
    {
        path: 'reference/position/',
        element: <Positions />
    },
]

export default ReferenceRoutes
