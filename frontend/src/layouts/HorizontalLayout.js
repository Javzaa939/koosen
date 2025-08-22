// ** React Imports

// ** Core Layout Import
// !Do not remove the Layout import

// ** Menu Items Array
import navigation from "@src/navigation/horizontal"

const HorizontalLayout = (props) => {

    return (
      <Layout menuData={navigation} {...props}>
        <Outlet />
      </Layout>
    )
}

export default HorizontalLayout
