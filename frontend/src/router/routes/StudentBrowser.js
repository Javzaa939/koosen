import { lazy } from "react";

const Structure = lazy(() => import("@src/views/Student/Browser/Structure"))
const Surgalt = lazy(() => import("@src/views/Student/Browser/Surgalt"))
const Oyutni_hugjil = lazy(() => import("@src/views/Student/Browser/Oyutni_hugjil"))
const Rules = lazy(() => import("@src/views/Student/Browser/Rules"))
const Psychological = lazy(() => import("@src/views/Student/Browser/Psychological"))
const Library = lazy(() => import("@src/views/Student/Browser/Library"))
const Other = lazy(() => import("@src/views/Student/Browser/Other"))
const Health = lazy(() => import("@src/views/Student/Browser/Health"))

const StudentBrowserRoutes = [
    {
        path: 'browser/structure/',
        element: <Structure />
    },
    {
        path: 'browser/surgalt/',
        element: <Surgalt />
    },
    {
        path: 'browser/juram/',
        element: <Rules />
    },
    {
        path: 'browser/hugjil/',
        element: <Oyutni_hugjil />
    },
    {
        path: 'browser/psychological/',
        element: <Psychological />
    },
    {
        path: 'browser/library/',
        element: <Library />
    },
    {
        path: 'browser/health/',
        element: <Health />
    },
    {
        path: 'browser/other/',
        element: <Other />
    },
]

export default StudentBrowserRoutes