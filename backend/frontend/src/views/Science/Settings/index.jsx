import React, { useState, Fragment, useEffect } from 'react'

import { TabContent, Nav, NavItem, NavLink, Card } from 'reactstrap'

import CHAMBER from './Champer'

export default function Settings() {

    const nav_menus = [
        {
            active_id: 1,
            name: 'Бүтээлийн ангилал',
            component: <CHAMBER type={'buteel'}/>
        },
        {
            active_id: 2,
            name: 'Өгүүллийн ангилал',
            component: <CHAMBER type={'uguulel'}/>
        },
        {
            active_id: 3,
            name: 'Төслийн ангилал',
            component: <CHAMBER type={'tosol'}/>
        },
        {
            active_id: 5,
            name: 'Илтгэлийн ангилал',
            component: <CHAMBER type={'sub_angilal'}/>
        },
        {
            active_id: 6,
            name: 'Эшлэл ангилал',
            component: <CHAMBER type={'quotation'}/>
        },
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
