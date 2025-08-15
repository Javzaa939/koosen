// #region 3rd party
import { Fragment, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardBody, CardHeader, Col, Row, Button, Modal, UncontrolledTooltip, Label, Input, Spinner } from "reactstrap";
import { ChevronDown, ChevronsRight, Grid, List, X } from 'react-feather'
import DataTable from "react-data-table-component";
import { t } from "i18next";
import Select from 'react-select'
import classnames from 'classnames'
import { Controller, useForm } from "react-hook-form";
import Flatpickr from 'react-flatpickr'

// css files
import '@styles/react/libs/flatpickr/flatpickr.scss'
// #endregion

// #region custom global
import useModal from '@hooks/useModal';
import useApi from "@src/utility/hooks/useApi";
import useLoader from '@hooks/useLoader'
import { getPagination, ReactSelectStyles } from "@src/utility/Utils";
// #endregion

// #region custom local
import AddLessonForm from "./AddLessonForm";
import { getColumns } from './helpers'

// css files
import './style.css'
import moment from "moment";
import { DotIcon } from "lucide-react";
// #endregion

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
    const [dep_option, setDepOption] = useState([])
    const [teacher_option, setTeacherOption] = useState([])

    // grid view switcher
    const [view, setView] = useState('grid');

    const [skipFirstRenders, setSkipFirstRenders] = useState(true)
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

    const CustomPagination = getPagination(handlePagination, current_page, rows_per_page, total_count)
    const { control, watch } = useForm()
    const allFields = watch();
    const defaultDateRef = useRef(moment(new Date()).format('YYYY-MM-DD'));
    // #endregion

    // #region API calls
    const getLessons = async () => {
        const { success, data } = await fetchDataPage(onlineLessonApi.get_lessons(rows_per_page, current_page, '', search_value, '', allFields.department?.id, allFields.teacher?.id, allFields.start_date, allFields.end_date));

        if (success) {
            setLessons(data?.results)
            setTotalCount(data?.count)
        }
    };

    async function deleteLesson(id) {
        const { success } = await fetchDataPage(onlineLessonApi.delete_lesson(id))

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
        const { success, data } = await fetchDataTeacher(teacherApi.get(allFields.department?.id))

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
    // #endregion

    // #regions useEffects
    // department filter initialization
    useEffect(() => {
        getDepartment()
        if (skipFirstRenders) setSkipFirstRenders(false)
    }, [])

    // departments filter updates teachers filter
    useEffect(() => {
        if (skipFirstRenders) return

        if (allFields.department?.id) getTeachers(allFields.department.id)
        else getTeachers()
    }, [allFields.department])

    useEffect(() => {
        if (skipFirstRenders) return
        getLessons();
    }, [current_page, allFields.department, allFields.teacher, allFields.start_date, allFields.end_date])

    useEffect(() => {
        if (skipFirstRenders) return

        const timeoutId = setTimeout(() => {
            if (search_value.length === 1) return
            getLessons();
        }, 1000);

        return () => {
            clearTimeout(timeoutId)
        }
    }, [search_value])
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
                            <Controller
                                defaultValue=''
                                name='department'
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        {...field}
                                        id={field.name}
                                        classNamePrefix='select'
                                        isClearable
                                        className={classnames('react-select')}
                                        isLoading={isLoadingDep}
                                        placeholder={t('-- Сонгоно уу --')}
                                        options={dep_option || []}
                                        noOptionsMessage={() => t('Хоосон байна.')}
                                        styles={ReactSelectStyles}
                                        getOptionValue={(option) => option.id}
                                        getOptionLabel={(option) => option.name}
                                    />
                                )}
                            />
                        </Col>
                        <Col md={3} className='mb-1'>
                            <Label className="form-label" for="teacher">
                                {t('Заах багш')}
                            </Label>
                            <Controller
                                defaultValue=''
                                name='teacher'
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        {...field}
                                        id={field.name}
                                        classNamePrefix='select'
                                        isClearable
                                        className={classnames('react-select')}
                                        isLoading={isLoadingTeacher}
                                        placeholder={t('-- Сонгоно уу --')}
                                        options={teacher_option || []}
                                        noOptionsMessage={() => t('Хоосон байна.')}
                                        styles={ReactSelectStyles}
                                        getOptionValue={(option) => option.id}
                                        getOptionLabel={(option) => `${option?.last_name[0]}.${option?.first_name}`}
                                    />
                                )}
                            />
                        </Col>
                        <Col className="datatable-search-text d-flex justify-content-end mt-1" md={6}>
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
                    <Row>
                        <Col md={3} className='mb-1'>
                            <Label className="form-label" for="start_date">
                                {t('Эхлэх хугацаа')}
                            </Label>
                            <Controller
                                defaultValue={defaultDateRef.current}
                                name='start_date'
                                control={control}
                                render={({ field: { onChange, ...rest } }) => (
                                    <Flatpickr
                                        {...rest}
                                        id={rest.name}
                                        className='form-control'
                                        style={{ height: "30px" }}
                                        placeholder='Огноо'
                                        options={{
                                            onChange: (selectedDates, dateStr) => {
                                                onChange(dateStr);
                                            }
                                        }}
                                    />
                                )}
                            />
                        </Col>
                        <Col md={3} className='mb-1'>
                            <Label className="form-label" for="end_date">
                                {t('Дуусах хугацаа')}
                            </Label>
                            <Controller
                                defaultValue={defaultDateRef.current}
                                name='end_date'
                                control={control}
                                render={({ field: { onChange, ...rest } }) => (
                                    <Flatpickr
                                        {...rest}
                                        id={rest.name}
                                        className='form-control'
                                        style={{ height: "30px" }}
                                        placeholder='Огноо'
                                        options={{
                                            onChange: (selectedDates, dateStr) => {
                                                onChange(dateStr);
                                            }
                                        }}
                                    />
                                )}
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
                                                                            <DotIcon style={{ color: "#14B8A6", fontSize: "2rem" }} />
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
