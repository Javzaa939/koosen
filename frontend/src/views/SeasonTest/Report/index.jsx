import React, { useState, useEffect } from 'react'
import { Card, Nav, NavItem, NavLink, TabContent } from 'reactstrap'
import Lists from './Lists'
import List3 from './List3'
import Report1 from './Report1'
import Report2 from './Report2'
import Report4 from './Report4'
import UpdateChallengeStudentsScoreButton from './UpdateChallengeStudentsScoresButton'

export default function Report() {
    const [activeTab, setActiveTab] = useState(0)
    const [component, setComponent] = useState('')

    const button_list = [
        {
            name: 'Тайлан 1',
            icon: 'Activity',
            id: 0,
            component: <Report1 key="tab1" />
        },
        {
            name: 'Тайлан 2',
            icon: 'Activity',
            id: 1,
            component: <Report2 key="tab2" />
        },
        {
            name: 'Тайлан 3',
            icon: 'Activity',
            id: 2,
            component:<List3/>
        },
        {
            name: 'Тайлан 4',
            icon: 'Activity',
            id: 3,
            component: <Report4 key="tab4" />
        },
        {
            name: 'Тайлан 5',
            icon: 'Activity',
            id: 4,
            component:<Lists/>
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
        <>
            <UpdateChallengeStudentsScoreButton />
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
        </>
    )
}
