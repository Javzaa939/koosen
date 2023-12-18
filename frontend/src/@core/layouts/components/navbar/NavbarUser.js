// ** Dropdowns Imports
import UserDropdown from "./UserDropdown"
import { MuiNotification } from '@lms_components/MuiNotification'

import { notif_instance } from "@hooks/useApi"

// import './style.css'

const NavbarUser = () => {

    return (
        <ul className="nav navbar-nav  ms-auto d-flex align-items-center justify-content-end flex-end">
            <MuiNotification instance={notif_instance}/>
            <UserDropdown/>
        </ul>
  )
}
export default NavbarUser
