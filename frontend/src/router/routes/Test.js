import { lazy } from "react";

const CreateQuestion = lazy(() => import("@views/Test/create_question"))
const CreateTest = lazy(() => import("@views/Test/create_test"))

const TestRoutes = [
    {
        path: '/test/create_question/',
        element: <CreateQuestion />
    },
    {
        path: '/test/create_test/',
        element: <CreateTest />
    },
]

export default TestRoutes;