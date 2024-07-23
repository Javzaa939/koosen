import React, {useState, Fragment, useEffect} from 'react';
import {downloadExcelReport} from './Participants/downloadExcelReport';
import {RiDownloadFill} from "react-icons/ri";

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

function Result(){
    const [active, setActive] = useState('1')
    const [component, setComponent] = useState('')

    const {isLoading, fetchData} = useLoader({});

    const navMenus = [
        {
            activeId: 1,
            name: 'Багш',
            component: <Teacher scope={active}/>
        },
        {
            activeId: 2,
            name: 'Элсэгч',
            component: <Elsegch scope={active}/>
        },
        {
            activeId: 3,
            name: 'Оюутан',
            component: <Student scope={active}/>
        }
    ]

    const toggle = tab => {
        if (active !== tab) setActive(tab)
    }

    useEffect(() => {
        var check = navMenus.find(menus => menus.activeId == active)
        setComponent(check.component)
    },[active])

    const excelApi = useApi().challenge.psychologicalTestResult

    async function resultExcelReport() {
        const {success, data} = await fetchData(excelApi.excelResult());
        if(success){
            downloadExcelReport(data)
        }
    }

    return (
        <Fragment>
            <Card body>
                <Row className='d-flex align-items-center justify-content-between'>
                    <Col>
                        <Nav tabs>
                            {
                                navMenus.map((menu, idx) => {
                                    return(
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
                    <Col className="me-2 d-flex justify-content-end">
                        <Button
                            color='primary'
                            className='d-flex align-items-center px-75'
                            id='state_button'
                            onClick={() => resultExcelReport()}
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