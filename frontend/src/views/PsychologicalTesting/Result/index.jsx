import React, {useState, Fragment, useEffect} from 'react';

import {
    Nav,
    Card,
    NavItem,
    NavLink,
    TabContent,
} from 'reactstrap';

import Teacher from './Teacher';
import Student from './Student';
import Elsegch from './Elsegch';

function Result(){
    const [active, setActive] = useState('1')
    const [component, setComponent] = useState('')

    const navMenus = [
        {
            activeId: 1,
            name: 'Багш',
            component: <Teacher scope={active}/>
        },
        {
            activeId: 2,
            name: 'Элсэгч',
            component: <Elsegch scope={active}/>
        },
        {
            activeId: 3,
            name: 'Оюутан',
            component: <Student scope={active}/>
        }
    ]

    const toggle = tab => {
        if (active !== tab) setActive(tab)
    }

    useEffect(() => {
        var check = navMenus.find(menus => menus.activeId == active)
        setComponent(check.component)
    },[active])

    return (
        <Fragment>
            <Card body>
                <Nav tabs>
                    {
                        navMenus.map((menu, idx) => {
                            return(
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
                <TabContent className='py-50' activeTab={active}>
                    {component && component}
                </TabContent>
            </Card>
        </Fragment>
    )
};
export default Result