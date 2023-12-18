// ** Router imports
import { lazy, useContext } from 'react'

// ** Router imports
import { useRoutes, Navigate } from "react-router-dom"

// ** Layouts
import BlankLayout from '@layouts/BlankLayout'

// ** GetRoutes
import { getRoutes } from "./routes"

// ** Hooks Imports
import { useLayout } from "@hooks/useLayout"
import AuthContext from '@context/AuthContext'

// ** Components
const Error = lazy(() => import('@views/Error'))
const Login = lazy(() => import('@views/Login'))
const NewPassword = lazy(() => import("@views/NewPassword"))
const ResetPassword = lazy(() => import("@views/ResetPassword"))
const NotAuthorized = lazy(() => import('@views/NotAuthorized'))
const ForgotPassword = lazy(() => import("@views/ForgotPassword"))

const HomeRoute = "/calendar"
const LoginRoute = "/login"

const Router = () => {
    // ** Hooks
    const { layout } = useLayout()
    const { user } = useContext(AuthContext)

    const allRoutes = getRoutes(layout)

    /** Хоосон '/' орж ирэхэд хаашаа үсэргэхийг заана */
    function getHomeRoute()
    {
        if (Object.keys(user).length > 0)
        {
            return HomeRoute
        }
        else
        {
            return LoginRoute
        }
    }

    const routes = [
        {
            path: '/',
            index: true,
            element: <Navigate replace to={getHomeRoute()} />
        },
        {
            path: '/login',
            children: [{ path: '/login', element: <Login /> }]
        },
        {
            path: '/new-password',
            element: <BlankLayout />,
            children: [{ path: '/new-password/:token', element: <NewPassword /> }]
        },
        {
            path: '/forgot-password',
            element: <BlankLayout />,
            children: [{ path: '/forgot-password', element: <ForgotPassword /> }]
        },
        {
            path: '/reset-password',
            element: <BlankLayout />,
            children: [{ path: '/reset-password', element: <ResetPassword /> }]
        },
        {
            path: '/auth/not-auth',
            element: <BlankLayout />,
            children: [{ path: '/auth/not-auth', element: <NotAuthorized /> }]
        },
        {
            path: '/404error',
            element: <BlankLayout />,
            children: [{ path: '/404error', element: <Error /> }]
        },
        {
            path: '*',
            element: <BlankLayout />,
            children: [{ path: '*', element: <Error /> }]
        },
        ...allRoutes
    ]

    return useRoutes(routes)
}

export default Router
