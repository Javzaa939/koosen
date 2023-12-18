import { lazy } from "react";

const ProfessionDefinition = lazy(() => import("@views/Study/ProfessionDefinition"))
const Edit = lazy(() => import("@views/Study/ProfessionDefinition/Edit"))

const ProfessionDefinitionRoutes = [
    {
        path: '/study/profession-definition/',
        element: <ProfessionDefinition />
    },
    {
        path: '/study/profession-definition/:definition_Id',
        element: <Edit />
    },
]

export default ProfessionDefinitionRoutes
