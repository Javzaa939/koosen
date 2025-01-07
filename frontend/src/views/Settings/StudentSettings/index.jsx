import React, { useEffect, useState } from 'react'

import { Card, Nav, NavItem, NavLink, TabContent } from 'reactstrap'

import Learning from '../Learning'
import ProfessionalDegree from '../ProfessionalDegree'
import StudentRegisterType from '../StudentRegisterType'
import DiscountType from '../DiscountType'
import LessonCategory from '../LessonCategory'
import LessonGroup from '../LessonGroup'
import Score from '../Score'
import AdmissionLesson from '../AdmissionLesson'
import UsgenUnelgee from '../UsgenUnelgee'

function Student() {

    const [activeTab, setActiveTab] = useState(0)
    const [component, setComponent] = useState('')

    const button_list = [
        {
            name: 'Суралцах хэлбэр',
            id: 0,
            icon: 'Activity',
            component: <Learning />
        },
        {
            name: 'Боловсролын зэрэг',
            icon: 'Activity',
            id: 1,
            component: <ProfessionalDegree />
        },
        {
            name: 'Бүртгэлийн хэлбэр',
            icon: 'Activity',
            id: 2,
            component: <StudentRegisterType />
        },
        {
            name: 'Төлбөрийн хөнгөлөлтийн төрөл',
            icon: 'Activity',
            id: 3,
            component: <DiscountType />
        },
        {
            name: 'Хичээлийн ангилал',
            icon: 'Activity',
            id: 4,
            component: <LessonCategory />
        },
        {
            name: 'Хичээлийн бүлэг',
            icon: 'Activity',
            id: 5,
            component: <LessonGroup />
        },
        {
            name: 'Үнэлгээний бүртгэл',
            icon: 'Activity',
            id: 6,
            component: <Score />
        },
        {
            name: 'ЭЕШ-ын хичээл',
            icon: 'Activity',
            id: 7,
            component: <AdmissionLesson />
        },
        {
            name: 'Үсгэн үнэлгээ',
            icon: 'Activity',
            id: 8,
            component: <UsgenUnelgee />
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