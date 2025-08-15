// ** React Imports
import { Fragment, useState, useEffect } from 'react'
import { Book, User } from 'react-feather'
import {
    Card,
    CardBody,
    CardTitle,
    Row,
    Col,
    CardText,
    CardHeader,
    DropdownMenu,
    DropdownItem,
    DropdownToggle,
    UncontrolledDropdown
 } from 'reactstrap'

import { TrendingUp, Box, DollarSign } from 'react-feather'
import classnames from 'classnames'
import Avatar from '@components/avatar'
import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';
import { useRTL } from '@hooks/useRTL'

// ** Calendar App Component Imports
import Calendar from './Calendar'
// import SidebarLeft from './SidebarLeft'
import AddEventSidebar from './Add'
// import SwiperFade from './SwiperFade';
import AccessHistory from './AccessHistory'

import '@styles/react/apps/app-calendar.scss'

import { VOLUNTEER_ACTION_TYPE } from '@utility/consts'

import StatsHorizontal from '@components/widgets/stats/StatsHorizontal'


const CalendarComponent = () => {

    const blankEvent = {
        title: '',
        start: '',
        end: '',
    }

    const { fetchData } = useLoader({})

    // ** states
    const [addSidebarOpen, setAddSidebarOpen] = useState(false)
    const [leftSidebarOpen, setLeftSidebarOpen] = useState(false)
    const [datas, setDatas] = useState([])
    const [edit_id, setEditId] = useState('')
    const [is_new, setNew] = useState(false)
    const [searchChecked, setSearchChecked] = useState([])
    const [dates, setDates] = useState(blankEvent)
    const [active_week, setActiveWeek] = useState(1)
    const [info, setInfo] = useState({
        salbar_data: []
    })

    const [selectItem, setSelectItem] = useState(
        {
            'id': 'day',
            'name': 'Өнөөдөр'
        }
    )
    const [systemInfo, setSystemInfo] = useState(
        {
            'total': 0,
            'sis': 0,
            'student': 0,
            'teacher': 0
        }
    )

    const [datas1, setDatas1] = useState([])
    const date_list = [
        {
            'id': 'day',
            'name': 'Өнөөдөр'
        },
        {
            'id': 'week',
            'name': 'Сүүлийн 7 хоног'
        },
        {
            'id': 'last_month',
            'name': 'Сүүлийн 1 сар'
        },
        {
            'id': 'three_month',
            'name': 'Сүүлийн 3 сар'
        },
    ]

    // ** Hooks
    const [isRtl] = useRTL()

    // Api
    const calendarListApi = useApi().calendar
    const parentschoolApi = useApi().calendarCard
    const calendarNewsApi = useApi().calendarNews
    const coreApi = useApi().hrms

    // ** AddEventSidebar Toggle Function
    const handleAddEventSidebar = () => {
        setAddSidebarOpen(!addSidebarOpen)
        if (addSidebarOpen) {
            setEditId('')
        }
    }

    // ** LeftSidebar Toggle Function
    const toggleSidebar = val => setLeftSidebarOpen(val)

    async function getDatas()
    {
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

    useEffect(() => {
        getDatas()
    },[searchChecked])


    // Хуанли дах card-уудын мэдээлэл
    async function getDatas1() {
        const {success, data} = await fetchData(parentschoolApi.get())
        if(success) {
            setInfo(data)
        }
    }

    useEffect(
        () =>
        {
            getDatas1()
        },
        []
    )


    // Хуанли дах мэдээлэллийн хэсэг

    async function getDatas2()
    {
        const { success, data } = await fetchData(calendarNewsApi.get())
        if(success)
        {
            setDatas1(data)
        }
    }

    useEffect(
        () =>
        {
            getDatas2()
        },
        []
    )

    const handleSysChange = (item) => {
        setSelectItem(item)
    }

    async function getSysInfo() {
        const { success, data } = await fetchData(coreApi.get(selectItem?.id))
        if (success) {
            setSystemInfo(data)
        }
    }

    useEffect(
        () =>
        {
            getSysInfo()
        },
        [selectItem]
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
                            statTitle='Нийт хичээлийн тоо'
                            icon={<Book size={20} />}
                            renderStats={<h3 className='fw-bolder mb-75'>{info?.total_studies}</h3>}
                        />
                    </Col>
                    <Col lg='3' sm='6'>
                        <StatsHorizontal
                            color='primary'
                            statTitle='Нийт багшийн тоо'
                            icon={<User size={20} />}
                            renderStats={<h3 className='fw-bolder mb-75'>{info?.total_workers}</h3>}
                        />
                    </Col>
                    <Col lg='3' sm='6'>
                        <StatsHorizontal
                            color='danger'
                            statTitle='Нийт суралцагчдын тоо'
                            icon={<User size={20} />}
                            renderStats={<h3 className='fw-bolder mb-75'>{info?.total_students}</h3>}
                        />
                    </Col>
                </Row>
                {/* <Row>
                    <Card>
                        <CardHeader>
                            <CardTitle tag={'h4'}>Системийн хандалтын мэдээлэл</CardTitle>
                            <UncontrolledDropdown className='chart-dropdown'>
                            <DropdownToggle color='' className='bg-transparent btn-sm border-0 p-50'>
                                {selectItem?.name}
                            </DropdownToggle>
                            <DropdownMenu end>
                                {date_list.map(item => (
                                    <DropdownItem className='w-100' key={item?.id} onClick={() => handleSysChange(item)}>
                                        {item.name}
                                    </DropdownItem>
                                ))}
                            </DropdownMenu>
                            </UncontrolledDropdown>
                        </CardHeader>
                        <CardBody className='statistics-body'>
                            <Row>
                                <Col key={'student'} className='mb-2'>
                                    <div className='d-flex align-items-center'>
                                        <Avatar color={'light-primary'} icon={<TrendingUp size={24} />} className='me-2' />
                                        <div className='my-auto'>
                                            <h4 className='fw-bolder mb-0'>{systemInfo?.total}</h4>
                                            <CardText className='font-small-3 mb-0'>{'Системийн нийт хандалт'}</CardText>
                                        </div>
                                    </div>
                                </Col>
                                <Col key={'student'} className='mb-2'>
                                    <div className='d-flex align-items-center'>
                                        <Avatar color={'light-primary'} icon={<Box size={24} />} className='me-2' />
                                        <div className='my-auto'>
                                            <h4 className='fw-bolder mb-0'>{systemInfo?.sis}</h4>
                                            <CardText className='font-small-3 mb-0'>{'Сургалтын удирдлагын хандалт'}</CardText>
                                        </div>
                                    </div>
                                </Col>
                                <Col key={'student'} className='mb-2'>
                                    <div className='d-flex align-items-center'>
                                        <Avatar color={'light-primary'} icon={<Book size={24} />} className='me-2' />
                                        <div className='my-auto'>
                                            <h4 className='fw-bolder mb-0'>{systemInfo?.teacher}</h4>
                                            <CardText className='font-small-3 mb-0'>{'Багшийн систем хандалт'}</CardText>
                                        </div>
                                    </div>
                                </Col>
                                <Col key={'student'} className='mb-2'>
                                    <div className='d-flex align-items-center'>
                                        <Avatar color={'light-primary'} icon={<User size={24} />} className='me-2' />
                                        <div className='my-auto'>
                                            <h4 className='fw-bolder mb-0'>{systemInfo?.student}</h4>
                                            <CardText className='font-small-3 mb-0'>{'Оюутны систем хандалт'}</CardText>
                                        </div>
                                    </div>
                                </Col>
                            </Row>
                        </CardBody>
                    </Card>
                </Row> */}
            </div>

            <div className='app-calendar overflow-hidden border'>
                <Row className='g-0'>
                    <Col
                        id='app-calendar-sidebar'
                        className={classnames('col app-calendar-sidebar flex-grow-0 overflow-hidden d-flex flex-column', {
                            show: leftSidebarOpen
                        })}
                    >
                        {/* <SidebarLeft */}
                        {/*     toggleSidebar={toggleSidebar} */}
                        {/*     handleAddEventSidebar={handleAddEventSidebar} */}
                        {/*     searchValue={setSearchChecked} */}
                        {/*     setNew={setNew} */}
                        {/*     active_week={active_week} */}
                        {/* /> */}
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

                    <Col lg="3" sm="9" className="m-2">
                        <Card className="text-center">
                            <CardBody>
                                <CardTitle tag="h3">
                                    Сүүлд нэмэгдсэн мэдээ, мэдээлэл
                                </CardTitle>
                                {datas1.length > 0 ? (
                                    <></>
                                    {/* <SwiperFade datas={datas1} /> */}
                                ) : (
                                    <h5>Мэдээлэл байхгүй байна!</h5>
                                )}
                            </CardBody>
                        </Card>
                        <AccessHistory />
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
