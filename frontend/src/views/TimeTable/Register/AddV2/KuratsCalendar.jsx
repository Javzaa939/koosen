import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";

import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

import { Card, CardBody, UncontrolledTooltip } from "reactstrap";

import useWindowDimensions from "@lms_components/useWindowDimensions";

const KuratsCalendar = (props) => {
  // ** Refs
  const calendarRef = useRef(null);

  const { t } = useTranslation();

  // Дэлгэцний өргөн, өндөр авах
  const { width } = useWindowDimensions();

  // ** Props
  const {
    isRtl,
    eventDatas,
    setEditDatas,
    handleEventClick,
    setRangeDate,
    range_date,
  } = props;

  const calendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    timeZone: "UTC",
    initialView: "dayGridMonth",
    editable: true,
    selectable: true,
    events: eventDatas,
    contentHeight: 610,
    height: 650,
    dragScroll: true,
    dayMaxEventRows: true,
    allDayText: t("Өдрийн турш"),
    moreLinkText: "Илүү",
    navLinks: true,
    buttonText: {
      today: t("Өнөөдөр"),
      month: t("Сар"),
      week: t("7 хоног"),
      day: t("Өдөр"),
    },

    views: {
      dayGridMonth: {
        // name of view
        dayMaxEventRows: 6,
        titleFormat: ({ date }) => {
          const months = [
            t("1 сар"),
            t("2 сар"),
            t("3 сар"),
            t("4 сар"),
            t("5 сар"),
            t("6 сар"),
            t("7 сар"),
            t("8 сар"),
            t("9 сар"),
            t("10 сар"),
            t("11 сар"),
            t("12 сар"),
          ];

          var now_month = date.month;
          var now_year = date.year;
          var full_title = months[now_month] + " " + now_year;

          return full_title;
        },
      },
    },

    dayHeaderFormat: { weekday: "long" },
    slotLabelFormat: {
      hour: "2-digit",
      minute: "2-digit",
      meridiem: false,
      hour12: false,
    },

    nowIndicator: true,
    dayHeaderContent: ({ date }) => {
      const fd = date.getDay();
      const days = [
        t("Ня"),
        t("Да"),
        t("Мя"),
        t("Лх"),
        t("Пү"),
        t("Ба"),
        t("Бя"),
      ];
      if (width < 1000) {
        return days[fd];
      }
      const weekdays = [
        t("Ням"),
        t("Даваа"),
        t("Мягмар"),
        t("Лхагва"),
        t("Пүрэв"),
        t("Баасан"),
        t("Бямба"),
      ];
      return weekdays[fd];
    },
    datesSet: (info) => {
      var start_time = info.start.toISOString().substring(0, 10);
      var end_time = info.end.toISOString().substring(0, 10);
      range_date.start = start_time;
      range_date.end = end_time;
      setRangeDate(range_date);
    },

    eventDurationEditable: false,
    editable: false,

    dayMaxEventRows: true,
    ref: calendarRef,
    direction: isRtl ? "rtl" : "ltr",
    height: "100%",

    eventClick: function (info) {
      var edit_datas = info.event._def.extendedProps;
      setEditDatas(edit_datas);
      handleEventClick();
    },
  };

  return (
    <Card className="shadow-none border-0 mb-0 rounded-0">
      <CardBody className="pb-0">
        <FullCalendar {...calendarOptions} />{" "}
      </CardBody>
    </Card>
  );
};

export default KuratsCalendar;
