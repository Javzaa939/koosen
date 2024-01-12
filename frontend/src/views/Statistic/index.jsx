import React, { useEffect, useState } from "react";
import {
    Card,
    TabContent,
    Nav,
    NavItem,
    NavLink,
    CardHeader,
    CardBody
} from 'reactstrap'


import ADB1 from "./ADB1";
import ADB2 from "./ADB2";
import ADB3 from "./ADB3";
// import ADB4 from "./ADB4";
// import ADB5 from "./ADB5";
// import ADB6 from "./ADB6";
// import ADB7 from "./ADB7";
// import ADB8 from "./ADB8";
// import ADB9 from "./ADB9";
// import ADB10 from "./ADB10";
// import ADB11 from "./ADB11";
// import ADB12 from "./ADB12";
// import ADB13 from "./ADB13";
// import ADB14 from "./ADB14";
// import ADB15 from "./ADB15";
// import ADB16 from "./ADB16";
// import ADB17 from "./ADB17";
// import ADB18 from "./ADB18";


import './style.scss'
import Blank from "./Blank";


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
            // component: <Blank />
            component: <ADB2 />
        },
        {
            active_id: 3,
            name: 'А-ДБ-3',
            // component: <Blank />
            component: <ADB3 />
        },
        {
            active_id: 4,
            name: 'А-ДБ-4',
            component: <Blank />
            // component: <ADB4 />
        },
        {
            active_id: 5,
            name: 'А-ДБ-5',
            // component: <ADB5 />
            component: <Blank zasvar />
        },
        {
            active_id: 6,
            name: 'А-ДБ-6',
            // component: <ADB6 />
            component: <Blank />
        },
        {
            active_id: 7,
            name: 'А-ДБ-7',
            // component: <ADB7 />
            component: <Blank />
        },
        {
            active_id: 8,
            name: 'А-ДБ-8',
            // component: <ADB8 />
            component: <Blank/>
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