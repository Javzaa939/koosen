import { useContext } from "react"

// ** React Imports
import { Link, useNavigate } from "react-router-dom"

// ** Custom Components
import Avatar from "@components/avatar"

// ** Third Party Components
import { Power } from "react-feather"

// ** Reactstrap Imports
import {
    UncontrolledDropdown,
    DropdownMenu,
    DropdownToggle,
    DropdownItem
} from "reactstrap"

import AuthContext from '@context/AuthContext'
import useApi from '@hooks/useApi'
import useLoader from '@hooks/useLoader'

const UserDropdown = () => {
    const { user, setUser } = useContext(AuthContext)
    const { fetchData } = useLoader({})

    const userApi = useApi().user
    const navigate = useNavigate()

    const logOut = async() => {
        const { success, data } = await fetchData(userApi.logout())
        if(success)
        {
            setUser({})
            navigate('/login')
        }
    }

    return (
        <UncontrolledDropdown tag="li" className="dropdown-user nav-item">
            <DropdownToggle
                href="/"
                tag="a"
                className="nav-link dropdown-user-link"
                onClick={(e) => e.preventDefault()}
            >
                <div className="user-nav d-sm-flex d-none">
                    <span className="user-name fw-bold">{user.full_name}</span>
                    {/* <span className="user-status">{user.position}</span> */}
                </div>
                {
					user.real_photo != null && user.real_photo
					?
						<Avatar
							img={user.real_photo}
							imgHeight="35"
							imgWidth="35"
							status="online"
						/>
					:
						<Avatar
							initials
							color = {'light-success'}
							content = {user?.full_name || ''}
							contentStyles = {{
								borderRadius: 0,
							}}
							status="online"
						/>
				}
            </DropdownToggle>
            <DropdownMenu end>
                <DropdownItem tag={Link} to="/login" onClick={(e) => logOut()}>
                    <Power size={14} className="me-75" />
                    <span className="align-middle">Гарах</span>
                </DropdownItem>
            </DropdownMenu>
        </UncontrolledDropdown>
    )
}

export default UserDropdown
