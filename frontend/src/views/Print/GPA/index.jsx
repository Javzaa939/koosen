import React, { useEffect, useState } from 'react'

import { Card, Nav, NavItem, NavLink, TabContent } from 'reactstrap'

import GPAStudent from './GPAStudent'
import GPAProfession from './GPAProfession'
function Student() {

    const [activeTab, setActiveTab] = useState(0)
    const [component, setComponent] = useState('')

    const button_list = [
        {
            name: 'Оюутнаар',
            id: 0,
            icon: 'Activity',
            component: <GPAStudent />
        },
        {
            name: 'Хөтөлбөрөөр',
            icon: 'Activity',
            id: 1,
            component: <GPAProfession />
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

export default Student