import moment from 'moment';
import { useRef, useContext, useState, Fragment } from 'react';
import { useTranslation } from 'react-i18next';

import FullCalendar from '@fullcalendar/react';
import resourceTimelinePlugin from '@fullcalendar/resource-timeline';
import interactionPlugin from '@fullcalendar/interaction';

import { Card, CardBody } from 'reactstrap';

import useWindowDimensions from '@lms_components/useWindowDimensions';

import { Popover } from 'bootstrap';
import { get_par_from_strTime } from '@utils';

import SchoolContext from '@context/SchoolContext';
import './style.css';

const Calendar1 = (props) => {
    // ** Refs
    const calendarRef = useRef(null);

    const { t } = useTranslation();
    const { school_id } = useContext(SchoolContext);

    // Дэлгэцний өргөн, өндөр авах
    const { width } = useWindowDimensions();

    // ** Props
    const {
        isRtl,
        handleAddEventSidebar,
        eventDatas,
        getDates,
        // isCalendar,
        getUpdateEvent,
        resources,
        height,
        setLoader,
        blankEvent,
        eventValues,
        setEditDatas,
        setEventChange,
        handleEventClick,
        resourceGroupField,
        is_volume,
    } = props;

    const calendarOptions = {
        events: eventDatas,
        plugins: [interactionPlugin, resourceTimelinePlugin],
        initialView: 'resourceTimelineWeek',
        headerToolbar: false,
        firstDay: is_volume ? 0 : 1,
        aspectRatio: 1.5,
        resourceAreaWidth: '15%',
        timeZone: 'UTC',
        eventMaxStack: 2,
        navLinks: true,
        eventOrder: 'title',
        eventOrderStrict: true,

        dayMaxEvents: true,

        eventResizableFromStart: true,
        scrollTime: '08:00:00',
        expandRows: true,

        resources: resources,
        resourceGroupField: resourceGroupField,
        selectable: false,

        contentHeight: 'auto',
        slotMinTime: '08:00',
        slotMaxTime: '20:00',
        slotDuration: '01:30:00',
        selectMirror: true,
        stickyHeaderDates: true,

        slotLabelFormat: [
            function (data) {
                var date = data.date;
                const fd = moment(date).toDate().getDay();
                if (is_volume) {
                    var days = [t('Ц/a'), t('Да'), t('Мя'), t('Лх'), t('Пү'), t('Ба'), t('Бя')];
                    var weekdays = [
                        t('Цагийн ачаалал'),
                        t('Даваа'),
                        t('Мягмар'),
                        t('Лхагва'),
                        t('Пүрэв'),
                        t('Баасан'),
                        t('Бямба'),
                    ];
                } else {
                    days = [t('Ня'), t('Да'), t('Мя'), t('Лх'), t('Пү'), t('Ба'), t('Бя')];
                    weekdays = [
                        t('Ням'),
                        t('Даваа'),
                        t('Мягмар'),
                        t('Лхагва'),
                        t('Пүрэв'),
                        t('Баасан'),
                        t('Бямба'),
                    ];
                }
                if (width < 1000) {
                    return days[fd];
                }

                return weekdays[fd];
            },

            function (data) {
                var hours = moment(data.date);
                const fd = moment(hours).toDate().getDay();
                if (fd == 0) {
                    return;
                }

                const times = [t('1'), t('2'), t('3'), t('4'), t('5'), t('6'), t('7'), t('8')];

                if (hours.format('HH:mm') == '08:00') {
                    var index = 0;
                }
                if (hours.format('HH:mm') == '09:30') {
                    index = 1;
                }
                if (hours.format('HH:mm') == '11:00') {
                    index = 2;
                }
                if (hours.format('HH:mm') == '12:30') {
                    index = 3;
                }
                if (hours.format('HH:mm') == '14:00') {
                    index = 4;
                }
                if (hours.format('HH:mm') == '15:30') {
                    index = 5;
                }
                if (hours.format('HH:mm') == '17:00') {
                    index = 6;
                }
                if (hours.format('HH:mm') == '18:30') {
                    index = 7;
                }
                return times[index];
            },
        ],

        buttonText: {
            today: t('Өнөөдөр'),
            month: t('Сар'),
            week: t('7 хоног'),
            day: t('Өдөр'),
        },

        views: {
            resourceTimelinePlugin: {
                type: 'resourceTimelineWeek',
                eventMaxStack: 2,
            },
            week: {
                titleFormat: ({ date }) => {
                    const months = [
                        t('1 сар'),
                        t('2 сар'),
                        t('3 сар'),
                        t('4 сар'),
                        t('5 сар'),
                        t('6 сар'),
                        t('7 сар'),
                        t('8 сар'),
                        t('9 сар'),
                        t('10 сар'),
                        t('11 сар'),
                        t('12 сар'),
                    ];

                    var now_month = date.month;
                    var now_year = date.year;
                    var full_title = months[now_month] + ' ' + now_year;

                    return full_title;
                },
            },
        },

        dateClick(info) {
            if (resourceGroupField === 'lesson') {
                const ev = blankEvent;
                ev.start = info.dateStr;
                ev.resource = info.resource._resource.id;

                getDates(ev);
                handleAddEventSidebar();
            } else {
                return false;
            }
        },

        eventClick: function (info) {
            var edit_datas = info.event._def.extendedProps;

            if (edit_datas.is_default == true) {
                return false;
            } else {
                setEditDatas(edit_datas);
                handleEventClick();
            }
        },

        eventAllow: function (dropInfo, draggedEvent) {
            var self_resource = draggedEvent._def.resourceIds;
            // Яг тухайн сургуулийн хэрэглэгч ашиглаж эхлэх үед өөрийнхөө сургуулийн хуваарийг л зөөнө
            var school = draggedEvent._def.extendedProps.school_id;
            var is_general = draggedEvent._def.extendedProps.is_general;

            var is_score = draggedEvent._def.extendedProps.is_score;
            var drop_resource = dropInfo.resource._resource.id;

            if (is_score) {
                return false;
            } else if (self_resource && self_resource.includes(drop_resource)) {
                return true;
            }
            // if  ((school === school_id) || is_general)
            // {
            //     var is_score = draggedEvent._def.extendedProps.is_score
            //     var drop_resource = dropInfo.resource._resource.id

            //     if (is_score) {
            //         return false;
            //     }
            //     else if (self_resource && self_resource.includes(drop_resource) ) {
            //         return true;
            //     }

            // }
            // else {
            //   return false;
            // }
        },

        eventChange: async function (changeInfo) {
            // setLoader(true)

            var event_range = changeInfo.event._instance.range;
            var event_data = changeInfo.event._def.extendedProps;

            var start_time = event_range.start.toISOString();

            var splitted_array = start_time.split('T');

            var date = new Date(`${splitted_array[0]}`);
            var day = date.getDay();

            var time_split = splitted_array[1].split('.');
            var time_str = time_split[0];
            var time = get_par_from_strTime(time_str);

            var body = {
                day: day,
                time: time,
                odd_even: event_data?.odd_even || 3,
                school: school_id,
            };

            if (event_data?.is_default) {
                getUpdateEvent(body, event_data?.event_id);
            } else {
                setEventChange(body, event_data?.event_id);
            }

            const boxes = document.querySelectorAll('.popoverStyle');

            boxes.forEach((box) => {
                box.remove();
            });
        },

        eventMouseEnter: function (info) {
            if (info.event.extendedProps.event_id) {
                var tooltipInstance = new Popover(info.el, {
                    title: `<small>${info.event.extendedProps.lesson_name}</small><br>`,
                    html: true,
                    placement: 'right',
                    trigger: 'hover',
                    customClass: 'popoverStyle',
                    content: `
                        <small className='mb-0'>Төрөл: ${
                            info.event.extendedProps.type_name
                        }</small><br/>
                        <small className='mb-0'>Багш: ${
                            info.event.extendedProps.teacher_name
                        }</small><br/>
                        <small className='mb-0'>Ангиуд: ${
                            info.event.extendedProps.group
                        }</small><br/>
                        <small className='mb-0'>Өрөө: ${
                            info.event.extendedProps.room ? info.event.extendedProps.room_name : ''
                        }</small>
                    `,
                });
            }
        },

        eventMouseLeave: function (info) {
            const boxes = document.querySelectorAll('.popoverStyle');

            boxes.forEach((box) => {
                box.remove();
            });
        },
        eventDurationEditable: false,

        ref: calendarRef,
        direction: isRtl ? 'rtl' : 'ltr',
        editable: resourceGroupField === 'lesson' ? true : false,
        eventShortHeight: 15,
        eventResourceEditable: false,
        eventOverlap: true,
        slotEventOverlap: true,
        eventMinHeight: 30,
    };

    return (
        <Card
            className="shadow-none border-0 mb-0 rounded-0"
            style={{ height: height, overflow: 'auto' }}
        >
            <CardBody className="pb-0">
                <StyleWrapper>
                    <FullCalendar {...calendarOptions} />{' '}
                </StyleWrapper>
            </CardBody>
        </Card>
    );
};

export default Calendar1;
