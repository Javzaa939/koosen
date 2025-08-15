// ** React Imports
import { Navigate } from "react-router-dom"
import { useContext, Suspense } from "react"

// ** Context Imports
import AuthContext from '@context/AuthContext'

const PrivateRoute = ({ children, route }) => {
  // ** Hooks & Vars
  const { user } = useContext(AuthContext)

  if (route) {
    let action = null
    let resource = null
    let restrictedRoute = false

    if (route.meta) {
      action = route.meta.action
      resource = route.meta.resource
      restrictedRoute = route.meta.restricted
    }
    if (Object.keys(user).length === 0) {
      return <Navigate to="/login" />
    }
    if (Object.keys(user).length > 0) {
      return <Navigate to="/calendar" />
    }
    if (user && restrictedRoute) {
      return <Navigate to="/" />
    }
    if (user && restrictedRoute && user.role === "client") {
      return <Navigate to="/access-control" />
    }
    if (!user)) {
      return <Navigate to="/misc/not-authorized" replace />
    }
  }

  return <Suspense fallback={null}>{children}</Suspense>
}

export default PrivateRoute
