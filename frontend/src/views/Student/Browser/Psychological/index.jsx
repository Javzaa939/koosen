import React, { useEffect, useState } from 'react'

import { Card, Nav, NavItem, NavLink, TabContent } from 'reactstrap'

import Taniltsuulga from './Taniltsuulga'
import Help from './Help'

function Health() {

    const [activeTab, setActiveTab] = useState(0)
    const [component, setComponent] = useState('')

    const button_list = [
        {
            name: 'Танилцуулга',
            id: 0,
            icon: 'Activity',
            component: <Taniltsuulga />
        },
        {
            name: 'Зөвлөмж',
            icon: 'Activity',
            id: 1,
            component: <Help />
        },
    ]


    const toggleTab = tab => {
        if (activeTab !== tab) {
            setActiveTab(tab)
        }
    }

    useEffect(() => {
        var check = button_list.find(menus => menus.id == activeTab)
        setComponent(check.component)
    },[activeTab])


    return (
        <Card>
            <Nav tabs>
            {button_list.map(button => {
                return(
                    <NavItem key={button?.id}>
                        <NavLink active={activeTab === button?.id} onClick={() => toggleTab(button?.id)}>
                            <span className='fw-bold'>{button?.name}</span>
                        </NavLink>
                    </NavItem>
            )})}
            </Nav>
            <TabContent className='py-50' activeTab={activeTab} >
                {
                    component && component
                }
            </TabContent>
        </Card>
    )
}

export default Health