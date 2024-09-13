// import { PieChart } from "@mui/x-charts/PieChart";
import { Fragment, useEffect, useRef, useState } from "react";
import { GoDotFill } from "react-icons/go";
import ReactPaginate from "react-paginate";
import { Link } from "react-router-dom";

import { Card, CardBody, CardHeader, Col, Row, Button, Modal, UncontrolledTooltip, Label, Input } from "reactstrap";
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

function AllLessons({ lessons, getLessons }) {
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(12);

    const [modal, setModal] = useState(false);
  	const toggle = () => setModal(!modal);

    const { showWarning } = useModal();

    //API
    const deleteLessonAPI = useApi().online_lesson

    const { isLoading, fetchData } = useLoader({isFullScreen: false})

    const totalPages = Math.ceil(lessons?.length / rowsPerPage);

    function handlePagination({ selected }) {
        setCurrentPage(selected + 1);
    }

	const [filteredData, setFilteredData] = useState([]);

    // filters current states
	const [searchValue, setSearchValue] = useState("");
    const [dep_id, setDepId] = useState('')
    const [teacherId, setTeacherId] = useState('')

    const displayedLessons = dep_id || teacherId || searchValue
        ?
            filteredData?.slice(
                (currentPage - 1) * rowsPerPage,
                currentPage * rowsPerPage
            )
        :
            lessons?.slice(
                (currentPage - 1) * rowsPerPage,
                currentPage * rowsPerPage
            );

    async function deleteLesson(id){
        const {success, error} = await fetchData(deleteLessonAPI.delete_lesson(id))
        if (success) {
            getLessons()
        }
    }

    // grid view switcher
    const [view, setView] = useState('grid');

    // departments filter
    const departmentApi = useApi().hrms.department
    const [dep_option, setDepOption] = useState([])

    // teachers filter
    const teacherApi = useApi().hrms.teacher
    const [ teacherOption, setTeacherOption ] = useState([])

	// filters handler
	const handleFilter = (e) => {
		var updatedData = [];
        let value = [];

        if (e) {
		    value = e.target.value.trimStart();
		    setSearchValue(value);
        }

        updatedData = lessons.filter((item) => {
            let textFilter = null;
            if (e || searchValue) {
                if (!e) value = searchValue
                if (value !== '') {
                    const startsWith =
                        item.lesson_name.toString().toLowerCase().startsWith(value.toString().toLowerCase()) ||
                        item.lesson_code.toString().toLowerCase().startsWith(value.toString().toLowerCase())

                    const includes =
                        item.lesson_name.toString().toLowerCase().includes(value.toString().toLowerCase()) ||
                        item.lesson_code.toString().toLowerCase().includes(value.toString().toLowerCase())

                    if (startsWith) {
                        textFilter = startsWith;
                    }
                    else if (!startsWith && includes) {
                        textFilter = includes;
                    }
                    else {
                        textFilter = false;
                    }
                }
            }

            let depFilter = null;
            if (dep_id) depFilter = item.teacher.salbar === dep_id;

            let teachersFilter = null;
            if (teacherId) {
                teachersFilter = item.teacher.id === teacherId;
            }
            const result = (textFilter === null ? true : textFilter)
            && (depFilter === null ? true : depFilter)
            && (teachersFilter === null ? true : teachersFilter);

            return result
        });
        setFilteredData(updatedData);

        if (e)
            setSearchValue(value);
	};

    function chooseDep(){
        if (!dep_id) { return(<div>Тэнхим сонгоно уу.</div>) }
        else { return(<div>Хоосон байна</div>)}
    }

    /**Тэнхимын жагсаалт */
    async function getDepartment() {
        const { success, data } = await fetchData(departmentApi.get())
        if(success) {
            setDepOption(data)
        }
    }

    /**Багшийн жагсаалт */
    async function getTeachers(dep_id)
    {
        const { success, data } = await fetchData(teacherApi.get(dep_id))
        if(success)
        {
            setTeacherOption(data)
        }
    }

    // department filter initialization
    useEffect(() => {
        getDepartment()
    },[])

    // departments filter updates teachers filter
    const skipFirstRender = useRef(false)
    useEffect(() => {
        if (dep_id) {
            getTeachers(dep_id)
        } else {
            getTeachers(0)
        }

        if (skipFirstRender.current) {
            handleFilter()
        } else {
            skipFirstRender.current = true
        }
    },[dep_id])

    // teachers filter
    const skipFirstRenderTeachersFilter = useRef(false)
    useEffect(() => {
        if (skipFirstRenderTeachersFilter.current) {
            handleFilter()
        } else {
            skipFirstRenderTeachersFilter.current = true
        }
    },[teacherId])

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
                                    style={{paddingTop: 5, paddingBottom: 5}}
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
                                        <AddLessonForm toggle={toggle} open={modal} getLessons={getLessons}/>
                                </Modal>
                            </div>
                        </Col>
                    </Row>
                </CardHeader>
                <CardBody className="">
                    <div className="fw-bolder mb-50">{`Нийт хичээлийн тоо: ${dep_id || teacherId || searchValue ? filteredData?.length : lessons?.length}`}</div>
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
                                isLoading={isLoading}
                                placeholder={t('-- Сонгоно уу --')}
                                options={dep_option || []}
                                value={dep_option.find((c) => c.id === dep_id)}
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
                                isLoading={isLoading}
                                placeholder={t('-- Сонгоно уу --')}
                                options={teacherOption || []}
                                value={teacherOption.find((c) => c.id === teacherId)}
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
                                value={searchValue}
                                onChange={handleFilter}
                                placeholder={t('Хайх үг....')}
                            />
                        </Col>
                    </Row>
                {view === 'grid' ?
                    <>
                        <Row>
                            {displayedLessons.map((lesson, index) => (
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
                                                    дэлгэрэнгүй <ChevronsRight size={15}/>
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
                                <ReactPaginate
                                    previousLabel={"←"}
                                    nextLabel={"→"}
                                    pageCount={totalPages}
                                    onPageChange={handlePagination}
                                    containerClassName={"pagination"}
                                    activeClassName={"active"}
                                    pageClassName={"page-item"}
                                    pageLinkClassName={"page-link"}
                                    previousClassName={"page-item"}
                                    previousLinkClassName={"page-link"}
                                    nextClassName={"page-item"}
                                    nextLinkClassName={"page-link"}
                                    breakClassName={"page-item"}
                                    breakLinkClassName={"page-link"}
                                    marginPagesDisplayed={2}
                                    pageRangeDisplayed={5}
                                />
                            </Col>
                        </Row>
                    </>
                :
                    <Row>
                        <Col>
                            <DataTable
                                pagination
                                className='react-dataTable'
                                progressComponent={(
                                    <div className='my-2'>
                                        <h5>{t('Түр хүлээнэ үү')}...</h5>
                                    </div>
                                )}
                                noDataComponent={(
                                    <div className="my-2">
                                        <h5>{t('Өгөгдөл байхгүй байна')}</h5>
                                    </div>
                                )}
                                columns={getColumns(currentPage, rowsPerPage, dep_id || teacherId || searchValue ? filteredData : lessons)}
                                sortIcon={<ChevronDown size={10} />}
                                paginationPerPage={rowsPerPage}
                                paginationDefaultPage={currentPage}
                                data={dep_id || teacherId || searchValue ? filteredData : lessons}
                                paginationComponent={getPagination(handlePagination, currentPage, rowsPerPage, dep_id || teacherId || searchValue ? filteredData.length : lessons?.length, searchValue ? searchValue : dep_id || teacherId || searchValue ? [true] : false, filteredData)}
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

export default AllLessons;
