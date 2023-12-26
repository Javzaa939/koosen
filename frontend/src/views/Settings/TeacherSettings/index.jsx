import React, { useEffect, useState } from 'react'

import { Card, Nav, NavItem, NavLink, TabContent } from 'reactstrap'
import Score from '../ActiveYear'
import Signature from '../Signature'
import Learning from '../../TimeTable/Building'
import Room from '../../TimeTable/Room'

function Teacher() {

    const [activeTab, setActiveTab] = useState(0)
    const [component, setComponent] = useState('')

    const button_list = [
        {
            name: 'Ажиллах жил',
            id: 0,
            icon: 'Activity',
            component: <Score />
        },
        {
            name: 'Тодорхойлолтын гарын үсэг',
            icon: 'Activity',
            id: 1,
            component: <Signature />
        },
        {
            name: 'Хичээлийн байр',
            icon: 'Activity',
            id: 2,
            component: <Learning />
        },
        {
            name: 'Өрөөний бүртгэл',
            icon: 'Activity',
            id: 3,
            component: <Room />
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

export default Teacher