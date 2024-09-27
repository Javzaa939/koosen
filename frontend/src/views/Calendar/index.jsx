// ** React Imports
import { Fragment, useState, useEffect } from "react";
import { Book, User } from "react-feather";
import {
    Card,
    CardBody,
    CardTitle,
    Row,
    Col,
    Spinner,
} from "reactstrap";
import classnames from "classnames";

import useApi from "@hooks/useApi";
import useLoader from "@hooks/useLoader";
import { useRTL } from "@hooks/useRTL";

// ** Calendar App Component Imports
import Calendar from "./Calendar";
import SidebarLeft from "./SidebarLeft";
import AddEventSidebar from "./Add";
import SwiperFade from "./SwiperFade";

import "@styles/react/apps/app-calendar.scss";

import { VOLUNTEER_ACTION_TYPE } from "@utility/consts";

import StatsHorizontal from "@components/widgets/stats/StatsHorizontal";
import "./style.scss";
import AccessHistory from "./AccessHistory";
import DataTable from "react-data-table-component";

// Announcements
import { getColumns } from './helpers'
import { getPagination } from "@src/utility/Utils";
import { t } from "i18next";

const CalendarComponent = () => {
    const blankEvent = {
        title: "",
        start: "",
        end: "",
    };

    // announcements count
    const rowsPerPage = 5

    // announcements - Хуудаслалтын анхны утга
    const [currentPage, setCurrentPage] = useState(1)

    // announcements - Нийт датаны тоо
    const [total_count, setTotalCount] = useState(1)

    // announcements data
    const [announcements, setAnnouncements] = useState([])

    const { fetchData } = useLoader({});

    // announcements - loader
    const { isLoading: isAnnouncementsLoading, fetchData: fetchAnnouncements } = useLoader({isFullScreen: false})

    // ** states
    const [addSidebarOpen, setAddSidebarOpen] = useState(false);
    const [leftSidebarOpen, setLeftSidebarOpen] = useState(false);
    const [datas, setDatas] = useState([]);
    const [edit_id, setEditId] = useState("");
    const [is_new, setNew] = useState(false);
    const [searchChecked, setSearchChecked] = useState([]);
    const [dates, setDates] = useState(blankEvent);
    const [active_week, setActiveWeek] = useState(1);
    const [info, setInfo] = useState({
        salbar_data: [],
    });
    const [datas1, setDatas1] = useState([]);

    // ** Hooks
    const [isRtl] = useRTL();

    // Api
    const calendarListApi = useApi().calendar;
    const parentschoolApi = useApi().calendarCard;
    const calendarNewsApi = useApi().calendarNews;
    const announcementsApi = useApi().service.news;

    // ** AddEventSidebar Toggle Function
    const handleAddEventSidebar = () => {
        setAddSidebarOpen(!addSidebarOpen);
        if (addSidebarOpen) {
            setEditId("");
        }
    };

    // ** LeftSidebar Toggle Function
    const toggleSidebar = (val) => setLeftSidebarOpen(val);

    async function getDatas() {
        const { success, data } = await fetchData(
            calendarListApi.get(searchChecked)
        );
        if (success) {
            setActiveWeek(data?.active_week);

            if (data.datas) {
                var calendarDatas = data.datas;

                calendarDatas.forEach((data) => {
                    if (data.action_type == VOLUNTEER_ACTION_TYPE) {
                        data["title"] = "ОНА" + " " + data?.title;
                        data["color"] = "#e9ff70";
                    } else {
                        data["textColor"] = "white";
                    }
                });

                setDatas(calendarDatas);
            }
        }
    }

    // announcements
    async function getAnnouncements()
    {
        const { success, data } = await fetchAnnouncements(announcementsApi.getAd(rowsPerPage,currentPage,'created_at',''))
        if (success)
        {
            setAnnouncements(data?.results)
            setTotalCount(data?.count)
        }
    }

    useEffect(() => {
        getDatas();
    }, [searchChecked]);

    // Хуанли дах card-уудын мэдээлэл
    async function getDatas1() {
        const { success, data } = await fetchData(parentschoolApi.get());
        if (success) {
            setInfo(data);
        }
    }

    useEffect(() => {
        getDatas1();
    }, []);

    // announcements initial loading and page switching
    useEffect(() => {
        getAnnouncements()
    },[currentPage])

    // Хуанли дах мэдээлэллийн хэсэг
    async function getDatas2() {
        const { success, data } = await fetchData(calendarNewsApi.get());
        if (success) {
            setDatas1(data);
        }
    }

    useEffect(() => {
        getDatas2();
    }, []);

     // announcements page changing handler
     const handlePagination = (page) => {
		setCurrentPage(page.selected + 1);
	};

    return (
        <Fragment>
            <div className=" pt-0">
                <Row>
                    <Col lg="3" sm="6">
                        <StatsHorizontal
                            color="warning"
                            statTitle="Нийт хөтөлбөрийн тоо"
                            icon={<Book size={20} />}
                            renderStats={
                                <h3 className="fw-bolder mb-75">
                                    {info?.total_profession}
                                </h3>
                            }
                        />
                    </Col>
                    <Col lg="3" sm="6">
                        <StatsHorizontal
                            color="warning"
                            statTitle="Нийт хичээлийн тоо"
                            icon={<Book size={20} />}
                            renderStats={
                                <h3 className="fw-bolder mb-75">
                                    {info?.total_studies}
                                </h3>
                            }
                        />
                    </Col>
                    <Col lg="3" sm="6">
                        <StatsHorizontal
                            color="primary"
                            statTitle="Нийт багшийн тоо"
                            icon={<User size={20} />}
                            renderStats={
                                <h3 className="fw-bolder mb-75">
                                    {info?.total_workers}
                                </h3>
                            }
                        />
                    </Col>
                    <Col lg="3" sm="6">
                        <StatsHorizontal
                            color="danger"
                            statTitle="Идэвхтэй суралцагчдын тоо"
                            icon={<User size={20} />}
                            renderStats={
                                <h3 className="fw-bolder mb-75">
                                    {info?.total_students}
                                </h3>
                            }
                        />
                    </Col>
                </Row>
            </div>

            <div className="app-calendar overflow-hidden border">
                <Row className="g-0">
                    <Col>
                        <Row>
                            <div className='mb-2'>
                                <h4 className='p-1 m-0' style={{ fontWeight: 700, background: 'linear-gradient(118deg, #144e97, rgba(20, 78, 151, 0.7))', color: '#fff' }}>
                                    {t('Зарлал')}
                                </h4>
                                    <DataTable
                                        noTableHead
                                        pagination
                                        className='AnnouncementBlock'
                                        progressPending={isAnnouncementsLoading}
                                        progressComponent={
                                            <div className='my-2 d-flex align-items-center justify-content-center'>
                                                <Spinner className='me-1' color="" size='sm'/><h5>Түр хүлээнэ үү...</h5>
                                            </div>
                                        }
                                        noDataComponent={(
                                            <div className="my-2">
                                                <h5>Өгөгдөл байхгүй байна</h5>
                                            </div>
                                        )}
                                        columns={getColumns(currentPage, rowsPerPage, total_count)}
                                        paginationPerPage={rowsPerPage}
                                        paginationDefaultPage={currentPage}
                                        data={announcements}
                                        paginationComponent={getPagination(handlePagination, currentPage, rowsPerPage, total_count)}
                                    />
                            </div>
                        </Row>
                        <Row>
                            <Col
                                id="app-calendar-sidebar"
                                className={classnames(
                                    "col app-calendar-sidebar flex-grow-0 overflow-hidden d-flex flex-column",
                                    {
                                        show: leftSidebarOpen,
                                    }
                                )}
                            >
                                <SidebarLeft
                                    toggleSidebar={toggleSidebar}
                                    handleAddEventSidebar={handleAddEventSidebar}
                                    searchValue={setSearchChecked}
                                    setNew={setNew}
                                    active_week={active_week}
                                />
                            </Col>
                            <Col className="position-relative">
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
                        </Row>
                    </Col>

                    <Col lg="3" sm="9" className="m-2">
                        <Card className="text-center">
                            <CardBody>
                                <CardTitle tag="h3">
                                    Сүүлд нэмэгдсэн мэдээ, мэдээлэл
                                </CardTitle>
                                {datas1.length > 0 ? (
                                    <SwiperFade datas={datas1} />
                                ) : (
                                    <h5>Мэдээлэл байхгүй байна!</h5>
                                )}
                            </CardBody>
                        </Card>
                        <AccessHistory />
                    </Col>

                    <div
                        className={classnames("body-content-overlay", {
                            show: leftSidebarOpen === true,
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
    );
};

export default CalendarComponent;
