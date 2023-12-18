// ** React Imports
import { Fragment, useState, useContext } from 'react'
import { useParams } from 'react-router-dom'

// ** Reactstrap Imports
import { TabContent, TabPane, Nav, NavItem, NavLink, Row, Col  } from 'reactstrap'
import { User, Lock } from 'react-feather'

// ** User View Components
import ChangePass from './ChangePassword'
import UserInfo from './UserInformation'
import UserMainPage from './Main'

// ** Styles
import '@styles/react/apps/app-users.scss'

import AuthContext from '@context/AuthContext'

const UserDetails = () => {

    // ** Hooks
    const { userID } = useParams()
    const { user } = useContext(AuthContext)

    const [active, setActive] = useState('1')

    const toggleTab = tab => {
        if (active !== tab) {
            setActive(tab)
        }
    };

    return(
        <>
            {
            // Хэрэглэгчийн мэдээлэл зөвхөн админ хэрэглэгчт эсвэл нэвтэрсэн хэрэглэгчийн мэдээлэл өөрт харагдана.
            (user.is_superuser || user?.id.toString() === userID.toString()) &&
                <Fragment>
                    <Row>
                    <Col xl='5' lg='5' xs={{ order: 1 }} md={{ order: 0, size: 5 }}>
                        <UserInfo isAdmin={user.is_superuser}/>
                    </Col>
                    <Col xl='7' lg='7' xs={{ order: 0 }} md={{ order: 1, size: 7 }}>
                    <Nav pills className='mb-2'>
                        <NavItem>
                        <NavLink active={active === '1'} onClick={() => toggleTab('1')}>
                            <User className='font-medium-3 me-50' />
                            <span className='fw-bold'>Account</span>
                        </NavLink>
                        </NavItem>
                        {
                            //Нууц үг солих таб зөвхөн нэвтэрсэн хэрэглэгчт харагдана.
                            user.id.toString() === userID.toString() &&
                            <NavItem>
                            <NavLink active={active === '2'} onClick={() => toggleTab('2')}>
                                <Lock className='font-medium-3 me-50' />
                                <span className='fw-bold'>Нууц үг солих</span>
                            </NavLink>
                            </NavItem>
                        }
                    </Nav>
                    <TabContent activeTab={active}>
                        <TabPane tabId='1'>
                            <UserMainPage/>
                        </TabPane>
                        <TabPane tabId='2'>
                            <ChangePass />
                        </TabPane>
                    </TabContent>
                    </Col>
                    </Row>
                </Fragment>
            }
        </>
  )
}
export default UserDetails
