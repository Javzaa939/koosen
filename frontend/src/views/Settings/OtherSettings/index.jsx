import React, { useEffect, useState } from 'react'

import { Card, Nav, NavItem, NavLink, TabContent } from 'reactstrap'

import Season from '../Season'
import Score from '../Score'
import AdmissionLesson from '../AdmissionLesson'
import Country from '../Country'


function Other() {

    const [activeTab, setActiveTab] = useState(0)
    const [component, setComponent] = useState('')

    const button_list = [
        {
            name: 'Улирал',
            id: 0,
            icon: 'Activity',
            component: <Season />
        },
        {
            name: 'Боловсролын зэрэг',
            icon: 'Activity',
            id: 1,
            component: <Score />
        },
        {
            name: 'Бүртгэлийн хэлбэр',
            icon: 'Activity',
            id: 2,
            component: <AdmissionLesson />
        },
        {
            name: 'Өрөөний бүртгэл',
            icon: 'Activity',
            id: 3,
            component: <Country />
        }
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

export default Other