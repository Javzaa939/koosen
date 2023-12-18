import React, { useEffect, useState } from "react";
import {
    Card,
    TabContent,
    Nav,
    NavItem,
    NavLink,
    CardHeader,
    CardTitle,
    Button,
    CardBody
} from 'reactstrap'

import ADB2 from "./ADB2";

import ADB1 from "./ADB1";
import './style.scss'
import Blank from "./Blank";
import ADB3 from "./ADB3";

function Statistic() {


    const [component, setComponent] = useState('')
    const [active, setActive] = useState(1)


    const nav_menus = [

        {
            active_id: 1,
            name: 'A-ДБ-1',
            component: <ADB1 />
        },
        {
            active_id: 2,
            name: 'А-ДБ-2',
            component: <ADB2 />
        },
        {
            active_id: 3,
            name: 'А-ДБ-3',
            component: <ADB3 />
        },
        {
            active_id: 4,
            name: 'А-ДБ-4',
            component: <Blank />
        },
        {
            active_id: 5,
            name: 'А-ДБ-5',
            component: <Blank />
        },
        {
            active_id: 6,
            name: 'А-ДБ-6',
            component: <Blank />
        },
        {
            active_id: 7,
            name: 'А-ДБ-7',
            component: <Blank />
        },
        {
            active_id: 8,
            name: 'А-ДБ-8',
            component: <Blank />
        },
        {
            active_id: 9,
            name: 'А-ДБ-9',
            component: <Blank />
        },
        {
            active_id: 10,
            name: 'А-ДБ-10',
            component: <Blank />
        },
        {
            active_id: 11,
            name: 'А-ДБ-11',
            component: <Blank />
        },
        {
            active_id: 12,
            name: 'А-ДБ-12',
            component: <Blank />
        },
        {
            active_id: 13,
            name: 'А-ДБ-13',
            component: <Blank />
        },
        {
            active_id: 14,
            name: 'А-ДБ-14',
            component: <Blank />
        },
        {
            active_id: 15,
            name: 'А-ДБ-15',
            component: <Blank />
        },
        {
            active_id: 151,
            name: 'А-ДБ-15.1',
            component: <Blank />
        },
        {
            active_id: 16,
            name: 'А-ДБ-16',
            component: <Blank />
        },
        {
            active_id: 17,
            name: 'А-ДБ-17',
            component: <Blank />
        },
        {
            active_id: 18,
            name: 'А-ДБ-18',
            component: <Blank />
        }
    ]

    useEffect(() => {
        var check = nav_menus.find(menus => menus.active_id == active)
        setComponent(check.component)
    }, [active])

    const toggle = (active_id) => {
        setActive(active_id)
    }

    return(
        <Card>
            <CardHeader>
                <h3>Статистик мэдээ</h3>
            </CardHeader>
            <CardBody>
                {/* <Nav tabs> */}
                <Nav tabs className="flex-nowrap tabscroll overflow-auto pb-50">
                    {
                        nav_menus.map((menu, idx) => {
                            return(
                                <NavItem key={idx} style={{ minWidth: 100 }}>
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
            </CardBody>
        </Card>
    )
}

export default Statistic;