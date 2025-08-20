import { useRef, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

import { Card, CardBody } from 'reactstrap';

import useWindowDimensions from '@lms_components/useWindowDimensions';
import styled from "@emotion/styled";

export const StyleWrapper = styled.div`
    .fc-popover-body  {
        overflow-y: auto;
        max-height: 550px;
    }
    .fc-popover {
        top: 10px !important;
    }
`;

const KuratsCalendar = (props) => {
    // ** Refs
    const calendarRef = useRef(null);

    const { t } = useTranslation();

    // Screen dimensions
    const { width } = useWindowDimensions();

    // ** Props
    const {
        isRtl,
        eventDatas,
        setEditDatas,
        handleEventClick,
        setRangeDate,
        range_date,
        setMonth
    } = props;

    const getEventsBasedOnView = (viewType) => {
        if (viewType === 'dayGridMonth') {
            return eventDatas;
        }
        return eventDatas.flatMap((event) => event.day_by_day_events || []);
    };

    const [currentEvents, setCurrentEvents] = useState(() =>
        getEventsBasedOnView('timeGridWeek')
    );

    const updateEventsForCurrentView = () => {
        if (calendarRef.current) {
            const calendarApi = calendarRef.current.getApi();
            const currentView = calendarApi.view.type;
            const events = getEventsBasedOnView(currentView);
            setCurrentEvents(events);
        }
    };

    // Update events whenever eventDatas or the current view changes
    useEffect(() => {
        updateEventsForCurrentView();
    }, [eventDatas]);

    useEffect(() => {
        if (calendarRef.current) {
            const calendarApi = calendarRef.current.getApi();
            calendarApi.on('datesSet', updateEventsForCurrentView);
            return () => {
                calendarApi.off('datesSet', updateEventsForCurrentView);
            };
        }
    }, []);

    // ** Calendar Options
    const calendarOptions = {
        plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
        timeZone: 'UTC',
        slotMinTime: '08:00:00',
        slotMaxTime: '22:00:00',
        initialView: 'timeGridWeek',
        editable: true,
        selectable: true,
        events: currentEvents,
        contentHeight: 610,
        height: 750,
        dragScroll: true,
        dayMaxEventRows: true,
        allDayText: t('Өдрийн турш'),
        moreLinkText: 'Илүү',
        navLinks: true,
        buttonText: {
            month: t('Сар'),
            week: t('7 хоног'),
            day: t('Өдөр'),
        },
        headerToolbar: {
            left: 'prev,next',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay',
        },
        views: {
            timeGridDay: {
                titleFormat: { year: 'numeric', month: 'numeric', day: 'numeric' },
            },
        },
        dayHeaderFormat: { weekday: 'long' },
        slotLabelFormat: {
            hour: '2-digit',
            minute: '2-digit',
            meridiem: false,
            hour12: false,
        },
        eventTimeFormat: { hour: '2-digit', minute: '2-digit', meridiem: false, hour12: false },
        nowIndicator: true,
        dayHeaderContent: ({ date }) => {
            const fd = date.getDay();
            const days = [t('Ня'), t('Да'), t('Мя'), t('Лх'), t('Пү'), t('Ба'), t('Бя')];
            if (width < 1000) {
                return days[fd];
            }
            const weekdays = [
                t('Ням'),
                t('Даваа'),
                t('Мягмар'),
                t('Лхагва'),
                t('Пүрэв'),
                t('Баасан'),
                t('Бямба'),
            ];
            return weekdays[fd];
        },
        datesSet: (info) => {
            const start_time = info.start.toISOString().substring(0, 10);
            const end_time = info.end.toISOString().substring(0, 10);
            setRangeDate({ start: start_time, end: end_time });
        },
        eventDurationEditable: false,
        editable: false,
        direction: isRtl ? 'rtl' : 'ltr',
        eventClick: (info) => {
            const edit_datas = info.event._def.extendedProps;
            setEditDatas(edit_datas);
            handleEventClick();
        },
        viewDidMount: (info) => {
            if (info.view.type === 'dayGridMonth') {
                setMonth(true);
            } else {
                setMonth(false);
            }
        },
    };

    return (
        <Card className="shadow-none border-0 mb-0 rounded-0">
            <CardBody className="pb-0">
                <StyleWrapper>
                    <FullCalendar {...calendarOptions} ref={calendarRef} />
                </StyleWrapper>
            </CardBody>
        </Card>
    );
};

export default KuratsCalendar;
