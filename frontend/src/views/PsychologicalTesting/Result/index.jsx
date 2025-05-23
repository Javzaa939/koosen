import React, { useState, Fragment, useEffect } from 'react';
import { downloadExcelReport } from './Participants/downloadExcelReport';
import { RiDownloadFill } from "react-icons/ri";
import {downloadIQExcelReport} from './Participants/downloadIQExcelReport'
import {
    Col,
    Row,
    Nav,
    Card,
    Button,
    NavItem,
    NavLink,
    TabContent,
    UncontrolledTooltip
} from 'reactstrap';

import useLoader from "@hooks/useLoader";
import useApi from "@hooks/useApi";
import Teacher from './Teacher';
import Student from './Student';
import Elsegch from './Elsegch';
import { IQresultExcelReport, resultExcelReport } from './helpers';

function Result() {
    const [active, setActive] = useState('1')
    const [component, setComponent] = useState('')
    const [adm, setAdm] = useState('')

    const { Loader, isLoading, fetchData } = useLoader({ isFullScreen: false });

    const navMenus = [
        {
            activeId: 1,
            name: 'Багш',
            component: <Teacher scope={active} />
        },
        {
            activeId: 2,
            name: 'Элсэгч',
            component: <Elsegch scope={active} adm={adm} setAdm={setAdm}/>
        },
        {
            activeId: 3,
            name: 'Оюутан',
            component: <Student scope={active} adm={adm} active={active} />
        }
    ]

    const toggle = tab => {
        if (active !== tab) setActive(tab)
    }

    useEffect(() => {
        var check = navMenus.find(menus => menus.activeId == active)
        setComponent(check.component)
    }, [active])

    const excelApi = useApi().challenge.psychologicalTestResult

    return (
        <Fragment>
            {isLoading && Loader}
            <Card body>
                <Row className='d-flex align-items-center justify-content-between'>
                    <Col>
                        <Nav tabs>
                            {
                                navMenus.map((menu, idx) => {
                                    return (
                                        <NavItem key={idx}>
                                            <NavLink
                                                active={active == menu.activeId}
                                                onClick={() => {
                                                    toggle(menu.activeId)
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
                    <Col className="me-2 d-flex justify-content-end gap-1">
                        <Button
                            color='primary'
                            disabled={(adm || active !== 2) ? false : true}
                            className='d-flex align-items-center px-75'
                            id='test_button'
                            onClick={() => IQresultExcelReport(active, excelApi, adm, data)}
                        >
                            <RiDownloadFill className='me-25' />
                           IQ Test
                        </Button>
                        <UncontrolledTooltip target='test_button'>
                            IQ test өгсөн оролцогчдын үр дүнг татах
                        </UncontrolledTooltip>
                        <Button
                            color='primary'
                            className='d-flex align-items-center px-75'
                            id='state_button'
                            disabled={(adm || active !== 2) ? false : true}
                            onClick={() => resultExcelReport(active, excelApi, adm, data)}
                        >
                            <RiDownloadFill className='me-25' />
                            Оноо татах
                        </Button>
                        <UncontrolledTooltip target='state_button'>
                            Сэтгэлзүйн сорил өгсөн оролцогчдын үр дүнг татах
                        </UncontrolledTooltip>
                    </Col>
                </Row>
                <TabContent className='py-50' activeTab={active}>
                    {component && component}
                </TabContent>
            </Card>
        </Fragment>
    )
};
export default Result