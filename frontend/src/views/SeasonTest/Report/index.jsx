import React, { useState, useEffect } from 'react'
import { Card, Nav, NavItem, NavLink, TabContent } from 'reactstrap'
import List from './List'

export default function Report() {
    const [activeTab, setActiveTab] = useState(0)
    const [component, setComponent] = useState('')

    const button_list = [
        {
            name: 'Тайлан 1',
            id: 0,
            icon: 'Activity',
            component: <List />
        },
        {
            name: 'Тайлан 2',
            icon: 'Activity',
            id: 1,
        },
        {
            name: 'Тайлан 3',
            icon: 'Activity',
            id: 2,
        },
        {
            name: 'Тайлан 4',
            icon: 'Activity',
            id: 3,
        },
        {
            name: 'Тайлан 5',
            icon: 'Activity',
            id: 4,
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
