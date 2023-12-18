// ** React Imports
import { Fragment, useState, useRef } from 'react'

// ** Third Party Components
import { Card, CardBody, Row, Col, Spinner, Modal, ModalHeader, ModalBody } from 'reactstrap'

import useApi from '@hooks/useApi';
import useToast from "@hooks/useToast";
import { useRTL } from '@hooks/useRTL'
import useLoader from '@hooks/useLoader';
import useModal from "@hooks/useModal";

// ** Full Calendar & it's Plugins
import FullCalendar from '@fullcalendar/react'
import timeGridPlugin from '@fullcalendar/timegrid'

import interactionPlugin from "@fullcalendar/interaction";

import { useTranslation } from 'react-i18next'

import useWindowDimensions from '@lms_components/useWindowDimensions'

import moment from 'moment'

import { Eye } from 'react-feather'

// ** Styles
import '@styles/react/apps/app-calendar.scss'

const Calendar = ({ room_id, eventDatas, getDateRange, handleAddEventSidebar, refreshDatas, setCalendar }) => {

    // ** Refs
    const calendarRef = useRef(null)
    const addToast = useToast()
    const { showWarning } = useModal()

    // ** Hooks
    const [isRtl] = useRTL()

    const { t } = useTranslation()

    // Дэлгэцний өргөн, өндөр авах
    const { width } = useWindowDimensions()

    const { isLoading, fetchData } = useLoader({})

    // ** states
    const [datas, setDatas] = useState([])
    const [popoverOpen, setPopoverOpen] = useState(false)

    // Api
    const sportApi = useApi().order.sports

    function handlePop() {
        setPopoverOpen(!popoverOpen)
    }

    async function handleDeleteEvent(id) {
        const { success } = await fetchData(sportApi.delete(id))
        if(success) {
            refreshDatas()
        }
    }

    function handleClickEvent(datas) {
        // Event дээр дарахад ажиллах функц
        const id = datas._def.extendedProps.eventId
        const order_flag = datas._def.extendedProps.order_flag
        const date = datas._def.extendedProps.day
        const start = datas._def.extendedProps.starttime
        const end = datas._def.extendedProps.endtime

        var range_date = datas._instance.range

        const blankEvent = {
            startStr: range_date.start,
            endStr: range_date.end,
        }

        setDatas(datas.extendedProps)

        if (id) {
            return (
                order_flag === 1
                ?
                    showWarning({
                        header: {
                            title: `${t('Цаг устгах')}`,
                        },
                        question: `Та '${date}' өдрийн '${start.replace('00:00', '00')}-${end.replace('00:00', '00')}' цагийг устгахдаа итгэлтэй байна уу?`,
                        onClick: () => handleDeleteEvent(id),
                        btnText: 'Устгах',
                    })
                :
                    handlePop()

            )
        } else {
            datas.remove()
            getDateRange(blankEvent, false)
        }
    }

    function handleSelected(selectedInfo) {
        // select хийх хэсэг
        let calendarApi = selectedInfo.view.calendar
        calendarApi.unselect()
        calendarApi.addEvent({
            start: selectedInfo.startStr,
            end: selectedInfo.endStr,
            block: true,
        })

        setCalendar(calendarApi)
        getDateRange(selectedInfo, true)
    }

    const calendarOptions = {
        events: eventDatas || [],
        eventTextColor: 'white',

        plugins: [timeGridPlugin, interactionPlugin],
        headerToolbar: {
            left: 'timeGridWeek',
            center: '',
            right: 'addButton' // Баруун зүүн товч нэмэхийг хүсвэл (,prev,next) бичнэ
        },
        initialView: 'timeGridWeek',
        firstDay: new Date().getDay(),
        dragScroll: true,
        dayMaxEvents: 1,
        allDaySlot: false,
        slotMinTime: "08:00",
        slotMaxTime: "21:00",
        slotDuration: '01:00:00',
        slotLabelFormat: function (data)
        {
            var hours = moment(data.date)
            return hours.format("HH:mm") + " ~ " + hours.add(60, 'minutes').format("HH:mm");
        },
        navLinks: true,
        buttonText: {
            today: t('Өнөөдөр'), // Цагаар
            month: t('Сар'),
            week: t('7 хоног'),
            day: t('Өдөр'),
        },
        dayHeaderContent: (args) => {
            const month = args.date.getMonth()
            const date = args.date.getDate()
            if (width < 1000) {
                return month + '/' + date
            }
            return t(moment(args.date).format('MM сарын DD'))
        },
        ref: calendarRef,
        direction: isRtl ? 'rtl' : 'ltr',
        eventClick: function(info, event) {
            // event дээр дарах үед
            handleClickEvent(info.event)
        },
        eventContent: function (args, createElement) {
            const order_flag = args.event._def.extendedProps.order_flag
            if (width > 700) {
                return renderEventContent(order_flag, args?.timeText)
            }
            else if(order_flag !== 1) {
                return (
                    <div className='text-center mt-50'>
                        <Eye size="15"/>
                    </div>
                )
            }
        },
        height: '100%',
        selectable: room_id ? true : false,
        selectMirror: true,
        unselectAuto: true,
        select: (info) => handleSelected(info),
        selectOverlap: false, // нэг баганад цагийг давхцуулах эсэх
        dateClick(info) {
            if(!room_id) {
                addToast(
                    {
                        type: 'warning',
                        text: 'Та заал сонгосноор цаг оруулах боломжтой'
                    }
                )
            }
        },
        customButtons: {
            // Товч нэмэх
            addButton: {
                text: 'Бүртгэх',
                click: function() {
                    handleAddEventSidebar()
                },
            },
        },
    }

    function renderEventContent(order_flag, timeText) {
        return (
            order_flag === 2
            ?
                <p className='text-center mt-50'>Захиалсан</p>
            :
                order_flag === 3
            ?
                <p className='text-center mt-50'>Баталгаажсан</p>
            :
                timeText
        )
    }

    return (
        <Fragment>
            <div className='app-calendar overflow-hidden border'>
                <Col className='position-relative'>
                    <Card className='shadow-none border-0 mb-0 rounded-0'>
                        <CardBody className='pb-0'>
                            {
                                isLoading &&
                                <div className='suspense-loader'>
                                    <Spinner size='bg'/>
                                    <span className='ms-50'>{t('Түр хүлээнэ үү...')}</span>
                                </div>
                            }
                            <FullCalendar {...calendarOptions} />{' '}
                        </CardBody>
                        <Modal isOpen={popoverOpen} toggle={handlePop} className="modal-dialog-centered modal-sm">
                            <ModalHeader toggle={handlePop}>{t('Захиалгын дэлгэрэнгүй')}</ModalHeader>
                            <ModalBody>
                                {
                                    datas && Object.keys(datas).length > 0
                                    ?
                                        <>
                                            <Row tag='dl' className='mb-0'>
                                                <Col tag='dt' xs='4' className='fw-bolder mb-1'>
                                                    Захиалагч:
                                                </Col>
                                                <Col tag='dd' xs='8' className='mb-1'>
                                                    {datas?.student?.full_name || 'Хоосон байна'}
                                                </Col>
                                            </Row>
                                            <Row tag='dl' className='mb-0'>
                                                <Col tag='dt' xs='4' className='fw-bolder mb-1'>
                                                    Өдөр:
                                                </Col>
                                                <Col tag='dd' xs='8' className='mb-1'>
                                                    {datas?.day || 'Хоосон байна'}
                                                </Col>
                                            </Row>
                                            <Row tag='dl' className='mb-0'>
                                                <Col tag='dt' xs='4' className='fw-bolder mb-1'>
                                                    Хугацаа:
                                                </Col>
                                                <Col tag='dd' xs='8' className='mb-1'>
                                                    {datas?.starttime + ' аас ' + datas?.endtime || 'Хоосон байна'}
                                                </Col>
                                            </Row>
                                            <Row tag='dl' className='mb-0'>
                                                <Col tag='dt' xs='4' className='fw-bolder mb-1'>
                                                    Захиалга хийсэн огноо:
                                                </Col>
                                                <Col tag='dd' xs='8' className='mb-1'>
                                                    {(datas?.order_date) || 'Хоосон байна'}
                                                </Col>
                                            </Row>
                                            <Row tag='dl' className='mb-0'>
                                                <Col tag='dt' xs='4' className='fw-bolder mb-1'>
                                                    Төлбөрийн мэдээлэл:
                                                </Col>
                                                <Col tag='dd' xs='8' className='mb-1'>
                                                    {(datas?.payment) || 'Хоосон байна'}
                                                </Col>
                                            </Row>
                                        </>
                                    :
                                        <p className='text-center'>Мэдээлэл олдсонгүй</p>
                                }
                            </ModalBody>
                        </Modal>
                    </Card>
                </Col>
            </div>
        </Fragment>
    )
}

export default Calendar
