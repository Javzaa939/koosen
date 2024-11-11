import { Fragment, useEffect, useRef, useState } from "react";
import { GoDotFill } from "react-icons/go";
import { Link } from "react-router-dom";
import { Card, CardBody, CardHeader, Col, Row, Button, Modal, UncontrolledTooltip, Label, Input, Spinner } from "reactstrap";
import useModal from '@hooks/useModal';
import useApi from "@src/utility/hooks/useApi";
import useLoader from '@hooks/useLoader'
import AddLessonForm from "./AddLessonForm";
import { ChevronDown, ChevronsRight, Grid, List, X } from 'react-feather'
import DataTable from "react-data-table-component";
import { getPagination, ReactSelectStyles } from "@src/utility/Utils";
import { getColumns } from './helpers'
import { t } from "i18next";
import Select from 'react-select'
import classnames from 'classnames'
import './style.css'

export default function AllLessons() {
    // #region States
    const [lessons, setLessons] = useState([]);

    // Pagination
    const [current_page, setCurrentPage] = useState(1)
    const [total_count, setTotalCount] = useState(1)
    const [rows_per_page] = useState(12)

    // Modal
    const [modal, setModal] = useState(false);

    // filters states
    const [search_value, setSearchValue] = useState('')
    const [dep_id, setDepId] = useState('')
    const [dep_option, setDepOption] = useState([])
    const [teacher_id, setTeacherId] = useState('')
    const [teacher_option, setTeacherOption] = useState([])

    // grid view switcher
    const [view, setView] = useState('grid');
    // #endregion

    // #region Other singleline
    // API
    const onlineLessonApi = useApi().online_lesson
    const departmentApi = useApi().hrms.department
    const teacherApi = useApi().hrms.teacher

    // Modal
    const toggle = () => setModal(!modal);
    const { showWarning } = useModal();

    const { fetchData: fetchDataPage, isLoading: isLoadingPage, Loader: LoaderPage } = useLoader({})
    const { fetchData: fetchDataDep, isLoading: isLoadingDep } = useLoader({})
    const { fetchData: fetchDataTeacher, isLoading: isLoadingTeacher } = useLoader({})
    const skipFirstRender = useRef(false)

	const CustomPagination = getPagination(handlePagination, current_page, rows_per_page, total_count)
    // #endregion

    // #region API calls
    const getLessons = async () => {
        const { success, data } = await fetchDataPage(onlineLessonApi.get_lessons(rows_per_page, current_page, '', search_value, '', dep_id, teacher_id));

        if (success) {
            setLessons(data?.results)
            setTotalCount(data?.count)
        }
    };

    async function deleteLesson(id) {
        const { success, error } = await fetchDataPage(onlineLessonApi.delete_lesson(id))

        if (success) {
            getLessons()
        }
    }

    /**Тэнхимын жагсаалт */
    async function getDepartment() {
        const { success, data } = await fetchDataDep(departmentApi.get())

        if (success) {
            setDepOption(data)
        }
    }

    /**Багшийн жагсаалт */
    async function getTeachers() {
        const { success, data } = await fetchDataTeacher(teacherApi.get(dep_id))

        if (success) {
            setTeacherOption(data)
        }
    }
    // #endregion

    // #region Other multiline
    function handlePagination(e) {
        if (current_page !== e.selected + 1) setCurrentPage(e.selected + 1);
    }

    // filters handler
    const handleFilter = (e) => {
        setSearchValue(e.target.value.trimStart());
    };

    function chooseDep() {
        if (!dep_id) { return (<div>Тэнхим сонгоно уу.</div>) }
        else { return (<div>Хоосон байна</div>) }
    }
    // #endregion

    // #regions useEffects
    // department filter initialization
    useEffect(() => {
        getDepartment()
        getTeachers()
    }, [])

    // departments filter updates teachers filter
    useEffect(() => {
        if (skipFirstRender.current) {
            if (dep_id) {
                getTeachers(dep_id)
            } else {
                getTeachers()
            }
        } else {
            skipFirstRender.current = true
        }
    }, [dep_id])

    useEffect(() => {
        if (skipFirstRender.current) {
            getLessons();
        }
    }, [current_page, search_value, dep_id, teacher_id])
    // #endregion

    return (
        <Fragment>
            <Card>
                <CardHeader>
                    <h3>Цахим хичээлүүд</h3>
                    <Row>
                        <Col
                            className="d-flex align-items-center mobile-datatable-search mt-1"
                            md={12}
                            sm={12}
                        >
                            <div>
                                <Button
                                    className="px-1 me-1"
                                    style={{ paddingTop: 5, paddingBottom: 5 }}
                                    onClick={() => setView(view === 'grid' ? 'table' : 'grid')}
                                >
                                    {view === 'grid' ? <List size={20} /> : <Grid size={20} />}
                                </Button>
                                <Button color="primary" onClick={toggle}>
                                    Хичээл үүсгэх
                                </Button>
                                <Modal
                                    className="modal-dialog-centered modal-xl"
                                    contentClassName="pt-0"
                                    backdrop="static"
                                    isOpen={modal}
                                    toggle={toggle}
                                >
                                    <AddLessonForm toggle={toggle} open={modal} getLessons={getLessons} />
                                </Modal>
                            </div>
                        </Col>
                    </Row>
                </CardHeader>
                <CardBody className="">
                    <div className="fw-bolder mb-50">{`Нийт хичээлийн тоо: ${total_count}`}</div>
                    <Row>
                        <Col md={3} className='mb-1'>
                            <Label className="form-label" for="department">
                                {t('Тэнхим')}
                            </Label>
                            <Select
                                name="department"
                                id="department"
                                classNamePrefix='select'
                                isClearable
                                className={classnames('react-select')}
                                isLoading={isLoadingDep}
                                placeholder={t('-- Сонгоно уу --')}
                                options={dep_option || []}
                                noOptionsMessage={() => t('Хоосон байна.')}
                                onChange={(val) => {
                                    setDepId(val?.id || '')
                                }}
                                styles={ReactSelectStyles}
                                getOptionValue={(option) => option.id}
                                getOptionLabel={(option) => option.name}
                            />
                        </Col>
                        <Col md={3} className='mb-1'>
                            <Label className="form-label" for="teacher">
                                {t('Заах багш')}
                            </Label>
                            <Select
                                name="teacher"
                                id="teacher"
                                classNamePrefix='select'
                                isClearable
                                className={classnames('react-select')}
                                isLoading={isLoadingTeacher}
                                placeholder={t('-- Сонгоно уу --')}
                                options={teacher_option || []}
                                noOptionsMessage={chooseDep}
                                onChange={(val) => {
                                    setTeacherId(val?.id || '')
                                }}
                                styles={ReactSelectStyles}
                                getOptionValue={(option) => option.id}
                                getOptionLabel={(option) => `${option?.last_name[0]}.${option?.first_name}`}
                            />
                        </Col>
                        <Col className="datatable-search-text d-flex justify-content-end mt-1" md={6} sm={6}>
                            <Label className="me-1 search-filter-title pt-50" for="search-input">
                                {t('Хайлт')}
                            </Label>
                            <Input
                                className="dataTable-filter mb-50"
                                type="text"
                                bsSize="sm"
                                id="search-input"
                                onChange={handleFilter}
                                placeholder={t('Хайх үг....')}
                            />
                        </Col>
                    </Row>
                    {view === 'grid' ?
                        isLoadingPage ? <div className="lessonPageLoader">{LoaderPage}</div> :
                            <>
                                <Row>
                                    {lessons?.map((lesson, index) => (
                                        <Col key={index} xl={3} md={6} className="mb-1">
                                            <div className="border rounded-lg shadow">
                                                <CardBody>
                                                    <div className="d-flex justify-content-between mb-1">
                                                        <h6 className="">{lesson?.lesson_name}</h6>
                                                        <div>
                                                            <X
                                                                color='red'
                                                                size={15}
                                                                id={`delete${index}`}
                                                                onClick={() => showWarning({
                                                                    header: {
                                                                        title: 'Устгах үйлдэл',
                                                                    },
                                                                    question: 'Та энэхүү хичээлийг устгахдаа итгэлтэй байна уу?',
                                                                    onClick: () => deleteLesson(lesson.id),
                                                                    btnText: 'Устгах',
                                                                })}
                                                            />
                                                            <UncontrolledTooltip placement='top' target={`delete${index}`} >{'Устгах'}</UncontrolledTooltip>
                                                        </div>
                                                    </div>
                                                    <h6 className="mb-1">{'Багш:'}<span className="ms-1">{lesson?.teacher?.full_name}</span></h6>
                                                    <h6 className="mb-1">{'Оюутны тоо:'}<span className="ms-1">{lesson?.student_count}</span></h6>
                                                    <h6 className="mb-1">{'Ангийн нэр:'}<span className="ms-1">
                                                        {
                                                            lesson?.student_data?.map(item => item.group_name)
                                                                .filter((value, index, self) => self.indexOf(value) === index).join(', ')
                                                        }
                                                    </span></h6>
                                                    <div>
                                                        <div className="flex flex-md-row flex-column">
                                                            <div>
                                                                <div className="d-flex flex-column flex-md-row">
                                                                    <Row className="w-100">
                                                                        <Col xs={9}>
                                                                            {" "}
                                                                            <GoDotFill style={{ color: "#14B8A6", fontSize: "2rem" }} />
                                                                            Хичээл
                                                                        </Col>
                                                                        <Col xs={3}>{lesson?.total_homeworks_and_exams.week_count}</Col>
                                                                    </Row>
                                                                </div>
                                                                <div className="d-flex flex-column flex-md-row">
                                                                    <Row className="w-100">
                                                                        <Col xs={9}>
                                                                            {" "}
                                                                            <GoDotFill style={{ color: "#3B82F6", fontSize: "2rem" }} />
                                                                            Даалгавар
                                                                        </Col>
                                                                        <Col xs={3}>{lesson?.total_homeworks_and_exams.homework_count}</Col>
                                                                    </Row>
                                                                </div>
                                                                <div className="d-flex flex-column flex-md-row">
                                                                    <Row className="w-100">
                                                                        <Col xs={9}>
                                                                            {" "}
                                                                            <GoDotFill style={{ color: "#6366F1", fontSize: "2rem" }} />
                                                                            Шалгалт
                                                                        </Col>
                                                                        <Col xs={3}>{lesson?.total_homeworks_and_exams.challenge_count}</Col>
                                                                    </Row>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="text-end mt-25">
                                                        <Link to={`/online_lesson/${lesson.id}`}>
                                                            дэлгэрэнгүй <ChevronsRight size={15} />
                                                        </Link>
                                                    </div>
                                                </CardBody>
                                            </div>
                                        </Col>
                                    ))}
                                </Row>
                                <Row className="d-flex justify-content-end mx-0 my-0" sm={12}>
                                    <Col
                                        className="d-flex align-items-center justify-content-end"
                                        md={6}
                                        sm={12}
                                    >
                                        <CustomPagination
                                            handlePagination={handlePagination}
                                            pageNo={current_page}
                                            rowsPerPage={rows_per_page}
                                            total_count={total_count} />
                                    </Col>
                                </Row>
                            </>
                        :
                        <Row>
                            <Col>
                                <DataTable
                                    pagination
                                    className='react-dataTable'
                                    progressPending={isLoadingPage}
                                    progressComponent={(
                                        <div className='my-2 d-flex align-items-center justify-content-center'>
                                            <Spinner className='me-1' color="" size='sm' /><h5>Түр хүлээнэ үү...</h5>
                                        </div>
                                    )}
                                    noDataComponent={(
                                        <div className="my-2">
                                            <h5>{t('Өгөгдөл байхгүй байна')}</h5>
                                        </div>
                                    )}
                                    columns={getColumns(current_page, rows_per_page, total_count)}
                                    sortIcon={<ChevronDown size={10} />}
                                    paginationPerPage={rows_per_page}
                                    paginationDefaultPage={current_page}
                                    data={lessons}
                                    paginationComponent={CustomPagination}
                                    fixedHeader
                                    fixedHeaderScrollHeight='62vh'
                                />
                            </Col>
                        </Row>
                    }
                </CardBody>
            </Card>

            {/* <Card className={'mt-2'}>
                <CardHeader><div className="d-flex "><HelpCircle size={20}/><h5 className="ms-25 fw-bolder">Тусламж хэсэг</h5></div></CardHeader>
                <CardBody>
                    <Alert color='primary' className={'p-1 тме1'}>
                        Цахим хичээлийн заавар мэдээлэл хүргэж байна.
                    </Alert>
                    <iframe src="assets/Цахим хичээд.pdf" width="100%" height="640" allowfullscreen frameborder="0"></iframe>
                </CardBody>
            </Card> */}
        </Fragment>
    );
}
