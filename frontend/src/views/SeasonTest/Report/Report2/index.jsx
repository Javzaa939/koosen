import React, { useState, useEffect } from 'react'
import { Card, Nav, NavItem, NavLink, TabContent } from 'reactstrap'
import ReportDatatable from './ReportDatatable'
import { useTranslation } from 'react-i18next'

export default function Report2() {
    const [activeTab, setActiveTab] = useState(0)
    const [component, setComponent] = useState('')
    const { t } = useTranslation()

    const button_list = [
        {
            name: t('Оюутнаар'),
            icon: 'Activity',
            id: 0,
            component: <ReportDatatable key="tab1" report='students' />
        },
        {
            name: t('Ангиар'),
            icon: 'Activity',
            id: 1,
            component: <ReportDatatable key="tab2" report='groups' />
        },
        {
            name: t('Хөтөлбөрөөр'),
            icon: 'Activity',
            id: 2,
            component: <ReportDatatable key="tab3" report='professions' />
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
