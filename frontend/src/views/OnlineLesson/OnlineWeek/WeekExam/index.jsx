import React, { useState, Fragment, useEffect } from 'react';
import { downloadExcelReport } from './Participants/downloadExcelReport';
import { downloadIQExcelReport } from './Participants/downloadIQExcelReport';
import {
    Col,
    Row,
    Nav,
    Card,
    Button,
    NavItem,
    NavLink,
    TabContent,
    UncontrolledTooltip,
} from 'reactstrap';

import useLoader from '@hooks/useLoader';
import useApi from '@hooks/useApi';
import Elsegch from './Result';
// import CreateTest from '@src/views/Test/create_test';
// import CreateQuestion from '@src/views/Test/create_question';

function WeekExam() {
    const [active, setActive] = useState('1');
    const [component, setComponent] = useState('');

    const { Loader, isLoading, fetchData } = useLoader({ isFullScreen: false });

    const navMenus = [
        {
            activeId: 1,
            name: 'Дүн',
            component: <Elsegch scope={active} />,
        },
        // {
        //     activeId: 2,
        //     name: 'Шалгалтын жагсаалт',
        //     component: <CreateTest/>
        // },
        // {
        //     activeId: 3,
        //     name: 'Шалгалтын асуултууд',
        //     component:    <CreateQuestion/>
        // }
    ];

    const toggle = (tab) => {
        if (active !== tab) setActive(tab);
    };

    useEffect(() => {
        var check = navMenus.find((menus) => menus.activeId == active);
        setComponent(check.component);
    }, [active]);

    const excelApi = useApi().challenge.psychologicalTestResult;

    async function resultExcelReport() {
        const { success, data } = await fetchData(excelApi.excelResult());
        if (success) {
            downloadExcelReport(data);
        }
    }

    async function IQresultExcelReport() {
        const { success, data } = await fetchData(excelApi.iqExcelResult());
        if (success) {
            downloadIQExcelReport(data);
        }
    }

    return (
        <Fragment>
            {isLoading && Loader}
            <Card body>
                <Row className="d-flex align-items-center justify-content-between">
                    <Col>
                        <Nav tabs>
                            {navMenus.map((menu, idx) => {
                                return (
                                    <NavItem key={idx}>
                                        <NavLink
                                            active={active == menu.activeId}
                                            onClick={() => {
                                                toggle(menu.activeId);
                                            }}
                                        >
                                            {menu.name}
                                        </NavLink>
                                    </NavItem>
                                );
                            })}
                        </Nav>
                    </Col>
                </Row>
                <TabContent className="py-50" activeTab={active}>
                    {component && component}
                </TabContent>
            </Card>
        </Fragment>
    );
}
export default WeekExam;

