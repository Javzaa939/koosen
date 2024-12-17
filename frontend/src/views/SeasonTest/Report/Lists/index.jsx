import React, { useState, useEffect } from 'react'
import { Card, Nav, NavItem, NavLink, TabContent } from 'reactstrap'
import List5 from '../List5'
import List6 from '../List6'

export default function Lists() {
    const [activeTab, setActiveTab] = useState(0)
    const [component, setComponent] = useState('')

    const button_list = [
        {
            name: 'Дүнгийн шинжилгээ 1',
            id: 0,
            icon: 'Activity',
            component: <List5 />
        },
        {
            name: 'Дүнгийн шинжилгээ 2',
            icon: 'Activity',
            id: 1,
            component: <List6/>
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
            <Nav tabs className="d-flex justify-content-center">
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
