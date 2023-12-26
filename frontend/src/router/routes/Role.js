import { lazy } from "react";

const Role = lazy(() => import("@views/Role"))
const RoleRoutes = [
    {
        path: 'role',
        element: <Role />
    }
]

export default RoleRoutes
