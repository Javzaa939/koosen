import React, { useState, Fragment, useEffect } from 'react'

import { TabContent, Nav, NavItem, NavLink, Card } from 'reactstrap'
import AnhanShat from './AnhanShat'
import Mergejliin from './Mergejliin'

export default function Health() {

    const nav_menus = [
        {
            active_id: 1,
            name: 'Анхан шат',
            component: <AnhanShat/>
        },
        {
            active_id: 2,
            name: 'Мэргэжлийн',
            component: <Mergejliin/>
        }
    ]

    const [active, setActive] = useState('1')
    const [component, setComponent] = useState('')

    const toggle = tab => {
        if (active !== tab) {
            setActive(tab)
        }
    }

    useEffect(() => {
        var check = nav_menus.find(menus => menus.active_id == active)
        setComponent(check.component)
    },[active])

    return (
        <Fragment>
            <Card body>
                <Nav tabs>
                    {
                        nav_menus.map((menu, idx) => {
                            return(
                                <NavItem key={idx}>
                                    <NavLink
                                        active={active == menu.active_id}
                                        onClick={() => {
                                            toggle(menu.active_id)
                                        }}
                                    >
                                        {menu.name}
                                    </NavLink>
                                </NavItem>
                            )
                        })
                    }
                </Nav>
                <TabContent className='py-50' activeTab={active} >
                    {
                        component && component
                    }
                </TabContent>
            </Card>
        </Fragment>
    )
}
