import React, { useEffect, useState } from "react";

import {
    Card,
    TabContent,
    Nav,
    NavItem,
    NavLink,
    CardHeader,
    CardBody
} from 'reactstrap'

import Teachers from "./Teachers";
import Student from "./Student";
import Busad from "./Busads";

function RoleRoutes() {

    const [component, setComponent] = useState('')
    const [active, setActive] = useState(1)

    const nav_menus = [

        {
            active_id: 1,
            name: 'Багшийн дүнгийн эрх',
            component: < Teachers/>
        },
        {
            active_id: 2,
            name: 'Бусад эрх',
            component: < Busad/>
        },
        {
            active_id: 3,
            name: 'Төлбөргүй сонголтын эрх',
            component: < Student/>
        }
    ]

    useEffect(() => {
        var check = nav_menus.find(menus => menus.active_id == active)
        setComponent(check.component)
    }, [active])

    const toggle = (active_id) => {
        setActive(active_id)
    }

    return(
        <Card>
            <CardBody>
                <Nav tabs className="flex-nowrap tabscroll overflow-auto pb-50">
                    {
                        nav_menus.map((menu, idx) => {
                            return(
                                <NavItem key={idx} style={{ minWidth: 100 }}>
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
                <TabContent className='py-50' activeTab={active}>
                    {
                        component && component
                    }
                </TabContent>
            </CardBody>
        </Card>
    )
}

export default RoleRoutes