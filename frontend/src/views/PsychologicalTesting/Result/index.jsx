import { Fragment, useEffect, useState } from 'react';
import {
    Card,
    Col,
    Nav,
    NavItem,
    NavLink,
    Row,
    TabContent
} from 'reactstrap';

import useApi from "@hooks/useApi";
import useLoader from "@hooks/useLoader";
import Elsegch from './Elsegch';
import Student from './Student';
import Teacher from './Teacher';

function Result() {
    const [active, setActive] = useState('1')
    const [component, setComponent] = useState('')
    const [adm, setAdm] = useState('')

    const { Loader, isLoading, fetchData } = useLoader({ isFullScreen: false });

    const navMenus = [
        {
            activeId: 1,
            name: 'Багш',
            component: <Teacher scope={active} />
        },
        {
            activeId: 2,
            name: 'Элсэгч',
            component: <Elsegch scope={active} adm={adm} setAdm={setAdm}/>
        },
        {
            activeId: 3,
            name: 'Оюутан',
            component: <Student scope={active} adm={adm} active={active} />
        }
    ]

    const toggle = tab => {
        if (active !== tab) setActive(tab)
    }

    useEffect(() => {
        var check = navMenus.find(menus => menus.activeId == active)
        setComponent(check.component)
    }, [active])

    const excelApi = useApi().challenge.psychologicalTestResult

    return (
        <Fragment>
            {isLoading && Loader}
            <Card body>
                <Row className='d-flex align-items-center justify-content-between'>
                    <Col>
                        <Nav tabs>
                            {
                                navMenus.map((menu, idx) => {
                                    return (
                                        <NavItem key={idx}>
                                            <NavLink
                                                active={active == menu.activeId}
                                                onClick={() => {
                                                    toggle(menu.activeId)
                                                }}
                                            >
                                                {menu.name}
                                            </NavLink>
                                        </NavItem>
                                    )
                                })
                            }
                        </Nav>
                    </Col>
                </Row>
                <TabContent className='py-50' activeTab={active}>
                    {component && component}
                </TabContent>
            </Card>
        </Fragment>
    )
};
export default Result