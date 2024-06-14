import React, { useEffect, useState } from 'react'
import { Card, CardBody, CardHeader, Nav, NavItem, NavLink, TabContent } from 'reactstrap'
import Email from './Email'

function Tailan() {

    const nav_menus = [
        {
            active_id: 1,
            name: 'Имейл',
            component: <Email/>
        },
    ]
    const [component, setComponent] = useState('')
    const [active, setActive] = useState(1)

    useEffect(() => {
        var check = nav_menus.find(menus => menus.active_id == active)
        setComponent(check.component)
    }, [active])

    const toggle = (active_id) => {
        setActive(active_id)
    }


    return (
        <Card>
            <CardBody>
                <div>
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
                <TabContent className='py-50' activeTab={active}>
                    {
                        component && component
                    }
                </TabContent>
                </div>
            </CardBody>
        </Card>
    )
}

export default Tailan
