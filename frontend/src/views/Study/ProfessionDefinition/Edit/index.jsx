
import React, { useState, Fragment, useEffect } from 'react'

import { useNavigate } from 'react-router-dom'

import { TabContent, Nav, NavItem, NavLink, Card } from 'reactstrap'

import { ChevronsLeft } from 'react-feather'

import Introduction from './Introduction'
import MainInformation from './MainInformation'
import LessonName from './LessonName'

import { useTranslation } from 'react-i18next'


const Detail = () => {
    const { t } = useTranslation()
    const nav_menus = [
        {
            active_id: 1,
            name: t('Хөтөлбөр'),
            component: <MainInformation />
        },
        {
            active_id: 2,
            name: t('Хөтөлбөрийн танилцуулга'),
            component: <Introduction />
        },
        {
            active_id: 3,
            name: t('ЭЕШ-ын хичээл'),
            component: <LessonName />
        },
    ]
    const navigation = useNavigate()

    const [active, setActive] = useState('1')
    const [component, setComponent] = useState('')

    const toggle = tab => {
        if (active !== tab) {
            setActive(tab)
        }
    }

    useEffect(() => {
        var check = nav_menus.find(menus => menus.active_id == active)
        setComponent(check.component)
    },[active])

    return (
        <Fragment>
            <Card body>
                <div role="button" style={{fontSize: "15px"}} onClick={() => navigation('/study/profession-definition/')}>
                    <ChevronsLeft/>{t('Буцах')}
                </div>
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
export default Detail

