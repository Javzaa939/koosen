// ** React Import
import { useRef, useContext } from 'react'

// ** Full Calendar & it's Plugins
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'

import AuthContext from "@context/AuthContext"

import { useTranslation } from 'react-i18next'

import { Menu } from 'react-feather'
import { Card, CardBody } from 'reactstrap'

import useWindowDimensions from '@lms_components/useWindowDimensions'

const Calendar = props => {
    // ** Refs
    const calendarRef = useRef(null)

    const { t } = useTranslation()
    const { user } = useContext(AuthContext)

    // Дэлгэцний өргөн, өндөр авах
    const { width } = useWindowDimensions()

    // ** Props
    const {
        isRtl,
        setNew,
        handleAddEventSidebar,
        toggleSidebar,
        eventDatas,
        setEditId,
        getDates,
        blankEvent,
    } = props

    const calendarOptions = {
        events: eventDatas && eventDatas.length > 0 ? eventDatas : [],
        plugins: [interactionPlugin, dayGridPlugin, timeGridPlugin],
        initialView: 'dayGridMonth',
        headerToolbar:{
            left: 'sidebarToggle,prev,next',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },

        eventResizableFromStart: true,
        dragScroll: true,
        dayMaxEvents: 5,
        allDayText: t("Өдрийн турш"),
        moreLinkText: "Илүү",
        navLinks: true,
        buttonText: {
            today: t('Өнөөдөр'),
            month: t('Сар'),
            week: t('7 хоног'),
            day: t('Өдөр'),
        },
        views: {
            dayGridMonth: { // name of view
                titleFormat: ({date}) => {
                    const months = [t('1 сар'), t('2 сар'), t('3 сар'), t('4 сар'), t('5 сар'), t('6 сар'), t('7 сар'), t('8 сар'), t('9 сар'), t('10 сар'), t('11 сар'), t('12 сар')]

                    var now_month = date.month
                    var now_year = date.year
                    var full_title = months[now_month] + ' ' + now_year

                    return full_title
                },
            }
        },

        dayHeaderFormat: {weekday: 'long'},

        slotLabelFormat: {
            hour: '2-digit',
            minute: '2-digit',
            meridiem: false,
            hour12: false,
        },

        nowIndicator: true,

        dayHeaderContent: ({date}) => {
            const fd = date.getDay()
            const days = [t('Ня'), t('Да'), t('Мя'), t('Лх'), t('Пү'), t('Ба'), t('Бя')]
            if (width < 1000) {
                return days[fd]
            }
            const weekdays = [t('Ням'), t('Даваа'), t('Мягмар'), t('Лхагва'), t('Пүрэв'), t('Баасан'), t('Бямба')]
            return weekdays[fd]
        },

        dayMaxEventRows: 5,

        eventClick: function(info) {
            const calendar_id = info.event.extendedProps.cal_id
            setEditId(calendar_id)
            setNew(false)
            handleAddEventSidebar()
        },

        customButtons: {
            sidebarToggle: {
                text: <Menu className='d-xl-none d-block' />,
                click() {
                    toggleSidebar(true)
                }
            }
        },
        dateClick(info) {

            if(Object.keys(user).length > 0 && user.permissions.includes('lms-calendar-create')) {
                const ev = blankEvent
                ev.start = info.date
                ev.end = info.date
                getDates(ev)
                handleAddEventSidebar()
            }
        },

        eventDrop({ event }) {
            const calendar_id = event.extendedProps.cal_id
            setEditId(calendar_id)
            handleAddEventSidebar()
        },

        ref: calendarRef,
        direction: isRtl ? 'rtl' : 'ltr',
        height: '100%',

        displayEventTime: false,
    }

    return (
        <Card className='shadow-none border-0 mb-0 rounded-0'>
            <CardBody className='pb-0'>
                <FullCalendar {...calendarOptions} />{' '}
            </CardBody>
        </Card>
    )
}

export default Calendar
