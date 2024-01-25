// ** React Imports
import  React,{ Fragment, useState, useEffect } from 'react'

// ** Third Party Components
import classnames from 'classnames'
import { Card, Row, Col } from 'reactstrap'

import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';

// ** Calendar App Component Imports
import Calendar from './Calendar'
import SidebarLeft from './SidebarLeft'
import AddEventSidebar from './Add'

// ** Custom Hooks
import { useRTL } from '@hooks/useRTL'
import  useUpdateEffect  from '@hooks/useUpdateEffect'

// ** Styles
import '@styles/react/apps/app-calendar.scss'

import { VOLUNTEER_ACTION_TYPE } from '@utility/consts'


import {Book, User} from 'react-feather'
import StatsHorizontal from '@components/widgets/stats/StatsHorizontal'

import '@styles/react/apps/app-users.scss'


import './style.scss'
import { bottom } from '@popperjs/core';
const CalendarComponent = () => {


    const blankEvent = {
        title: '',
        start: '',
        end: '',
    }


    // ** states
    const [addSidebarOpen, setAddSidebarOpen] = useState(false)
    const [leftSidebarOpen, setLeftSidebarOpen] = useState(false)
    const [datas, setDatas] = useState([])
    const [edit_id, setEditId] = useState('')
    const [is_new, setNew] = useState(false)
    const [searchChecked, setSearchChecked] = useState([])
    const [dates, setDates] = useState(blankEvent)
    const [active_week, setActiveWeek] = useState(1)

    // ** Hooks
    const [isRtl] = useRTL()

    // Api
    const calendarListApi = useApi().calendar

    // ** AddEventSidebar Toggle Function
    const handleAddEventSidebar = () => {
        setAddSidebarOpen(!addSidebarOpen)
        if (addSidebarOpen) {
            setEditId('')
        }
    }

    // ** LeftSidebar Toggle Function
    const toggleSidebar = val => setLeftSidebarOpen(val)


    // Card
    const parentschoolApi1 = useApi().calendar1
    const { fetchData } = useLoader({})


    //Салбарын өгөгдөл авах
    const [ info, setinfo ] = useState({
        salbar_data: []
    })

    async function getDatas1() {
        const {success, data} = await fetchData(parentschoolApi1.get())
        if(success) {
            setinfo(data)
        }
    }

    useEffect(() => {
        getDatas1()
    },[])



    async function getDatas() {
        const { success, data } = await fetchData(calendarListApi.get(searchChecked))
        if(success) {
            setActiveWeek(data?.active_week)

            if (data.datas) {

                var calendarDatas = data.datas

                calendarDatas.forEach(data => {
                    if (data.action_type == VOLUNTEER_ACTION_TYPE) {
                        data['title'] = 'ОНА' + ' ' + data?.title
                        data['color'] = '#e9ff70'
                    } else {
                        data['textColor'] = 'white'
                    }
                });

                setDatas(calendarDatas)
            }
        }
    }

    useEffect(
        () =>
        {
            getDatas()
        },
        []
    )

    useUpdateEffect(
        () =>
        {
            getDatas()
        },
        [searchChecked]
    )

    return (
        <Fragment>
            <div className=' pt-0'>
                    <Row>
                        <Col lg='3' sm='6'>
                            <StatsHorizontal
                            color='warning'
                            statTitle='Нийт хөтөлбөрийн тоо'
                            icon={<Book size={20} />}
                            renderStats={<h3 className='fw-bolder mb-75'>{info?.total_profession}</h3>}
                            />
                        </Col>
                        <Col lg='3' sm='6'>
                            <StatsHorizontal
                            color='warning'
                            statTitle='Нийт E - Хичээлийн тоо'
                            icon={<Book size={20} />}
                            renderStats={<h3 className='fw-bolder mb-75'>{info?.total_studies}</h3>}
                            />
                        </Col>
                        <Col lg='3' sm='6'>
                            <StatsHorizontal
                                color='primary'
                                statTitle='Нийт зөвлөх багшийн тоо'
                                icon={<User size={20} />}
                                renderStats={<h3 className='fw-bolder mb-75'>{info?.total_workers}</h3>}
                            />
                        </Col>
                        <Col lg='3' sm='6'>
                            <StatsHorizontal
                            color='danger'
                            statTitle='Нийт суралцагчдын тоо'
                            icon={<User size={20} />}
                            renderStats={<h3 className='fw-bolder mb-75'>{info?.total_studies}</h3>}
                            />
                        </Col>
                    </Row>
            </div>

            <div className='app-calendar overflow-hidden border'>
                <Row className='g-0'>
                    <Col
                        id='app-calendar-sidebar'
                        className={classnames('col app-calendar-sidebar flex-grow-0 overflow-hidden d-flex flex-column', {
                            show: leftSidebarOpen
                        })}
                    >
                        <SidebarLeft
                            toggleSidebar={toggleSidebar}
                            handleAddEventSidebar={handleAddEventSidebar}
                            searchValue={setSearchChecked}
                            setNew={setNew}
                            active_week={active_week}
                        />
                    </Col>
                    <Col className='position-relative'>
                        <Calendar
                            isRtl={isRtl}
                            toggleSidebar={toggleSidebar}
                            handleAddEventSidebar={handleAddEventSidebar}
                            eventDatas={datas}
                            setEditId={setEditId}
                            setNew={setNew}
                            blankEvent={blankEvent}
                            getDates={setDates}
                        />
                    </Col>
                    <div
                        className={classnames('body-content-overlay', {
                            show: leftSidebarOpen === true
                        })}
                        onClick={() => toggleSidebar(false)}
                    ></div>
                </Row>
            </div>
            <AddEventSidebar
                open={addSidebarOpen}
                handleAddEventSidebar={handleAddEventSidebar}
                refreshDatas={getDatas}
                editId={edit_id}
                is_new={is_new}
                dates={dates}
            />
        </Fragment>
    )
}

export default CalendarComponent
