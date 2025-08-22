// ** React Imports

// ** Utils
import { getUserData, getHomeRouteForLoggedInUser } from "@utils"

const PublicRoute = ({ children, route }) => {
  if (route) {
    const user = getUserData()

    const restrictedRoute = route.meta && route.meta.restricted

    if (user && restrictedRoute) {
      return <Navigate to={getHomeRouteForLoggedInUser(user.role)} />
    }
  }

  return <Suspense fallback={null}>{children}</Suspense>
}

export default PublicRoute
