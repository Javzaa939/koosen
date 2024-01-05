import React, { useState, Fragment, useEffect } from 'react'

import { TabContent, Nav, NavItem, NavLink, Card } from 'reactstrap'
import List from './List'

import PerformanceList from './Performance/List'

const NOT_CHAMBER = 1
const TEACHER_DEGREE_KREDIT = 2
const PERFORMANCE_KREDIT = 3

export default function Settings() {

    const nav_menus = [
        {
            active_id: 1,
            name: 'Тэнхимийн бус кредит',
            component: <List type={NOT_CHAMBER}/>
        },
        {
            active_id: 2,
            name: 'Багшийн зэрэглэлийн кредит',
            component: <List type={TEACHER_DEGREE_KREDIT}/>
        },
        {
            active_id: 3,
            name: 'Гүйцэтгэлийн кредитийн коэффициент',
            component: <PerformanceList type={PERFORMANCE_KREDIT}/>
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
