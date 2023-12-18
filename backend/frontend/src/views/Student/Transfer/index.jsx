// ** React Imports
import { Fragment, useState, useEffect } from 'react'

import { Card, TabContent, Nav, NavItem, NavLink } from 'reactstrap'

import { useTranslation } from "react-i18next";

import Irsen from './Irsen'

import Yvsan from './Yvsan'

const Transfer = () => {

    const { t } = useTranslation()

    const [component, setComponent] = useState('')

    const [active, setActive] = useState(1)

    const nav_menus = [
        {
            active_id: 1,
            name: t('Шилжиж явсан'),
            component: <Yvsan />
        },
        {
            active_id: 4,
            name: t('Шилжиж ирсэн'),
            component: <Irsen />
        },
    ]

    useEffect(() => {
        var check = nav_menus.find(menus => menus.active_id == active)
        setComponent(check.component)
    }, [active])

    const toggle = (active_id) => {
        setActive(active_id)
    }

    return (
        <Fragment>
            <Card>
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
            </Card>
        </Fragment>
    )
}

export default Transfer;
