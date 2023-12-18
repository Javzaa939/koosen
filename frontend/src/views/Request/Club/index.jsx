import React, { Fragment, useState, useEffect } from 'react'

import { Card, Nav, NavItem, NavLink, TabContent, Row, Col, CardBody } from 'reactstrap'

import { useTranslation } from 'react-i18next';
import ClubRegister from './ClubRegister';
import ClubRegisterStudents from './ClubRegisterStudents';

const Club = () => {

    const { t } = useTranslation()

    const [active, setActive] = useState(1)
    const [component, setComponent] = useState('')

    const nav_menus = [
        {
            active_id: 1,
            name: t('Клубын бүртгэл'),
            component: <ClubRegister />
        },
        {
            active_id: 2,
            name: t('Оюутны жагсаалт'),
            component: <ClubRegisterStudents is_header={true} />
        },
    ]

    useEffect(() => {
        var check = nav_menus.find(menus => menus.active_id == active)
        setComponent(check.component)
    }, [active])

    const toggle = (active_id) => {
        setActive(active_id)
    }

    return (
        <Fragment>
            <Card>
                <CardBody>
                    <Row>
                        <Col md={12}>
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
                        </Col>
                        <Col md={12}>
                            <TabContent className='py-50' activeTab={''}>
                                {
                                    component && component
                                }
                            </TabContent>
                        </Col>
                    </Row>
                </CardBody>
            </Card>
        </Fragment>
    );
};

export default Club;
