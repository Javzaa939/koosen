import { Fragment, useState, useEffect, useContext } from "react"

import { Row, Col, Card, Input, Label, Button, CardTitle, CardHeader, Spinner, Badge } from "reactstrap"

import { useTranslation } from "react-i18next"

import { AlertCircle, ChevronDown, Plus, Search } from "react-feather"

import { useNavigate } from "react-router-dom"
import DataTable from "react-data-table-component"

import useApi from '@hooks/useApi';
import useModal from "@hooks/useModal";
import useLoader from '@hooks/useLoader';
import AuthContext from '@context/AuthContext'
import SchoolContext from '@context/SchoolContext'
import Select from 'react-select'
import { ReactSelectStyles, examType } from '@utils'

import { getPagination } from '@utils'

import { getColumns } from "./helpers"

import Addmodal from './Add'
// import Editmodal from "./Edit"
import classNames from "classnames"

const ExamTimeTable = () => {
	const navigate = useNavigate()

    const { t } = useTranslation()
    const { user } = useContext(AuthContext)
    const { school_id } = useContext(SchoolContext)
    const { showWarning } = useModal()

    // Эрэмбэлэлт
    const [sortField, setSort] = useState('')

    const default_page = [10, 15, 50, 75, 100]

    // select input-ийн Сонголтууд
    const [teachers, setTeachers] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [lessons, setLessons] = useState([]);
    const [groups, setGroups] = useState([]);

    // songoson utguud

    const [selectedTeacher, setSelectedTeacher] = useState('')
    const [selectedType, setSelectedType] = useState('')
    // const [selectedLesson, setSelectedLesson] = useState('')


    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10)

    const [searchValue, setSearchValue] = useState("");

    const [editId, setEditId] = useState('')
    const [edit_data, setEditData] = useState('')

    const [datas, setDatas] = useState([]);

    // нийт датаны тоо
    const [total_count, setTotalCount] = useState(datas.length || 1)

    // loader
    const { Loader, isLoading, fetchData } = useLoader({})
    const { isLoading: isTableLoading, fetchData: allFetch } = useLoader({})
    const { isLoading: teacherLoading, fetchData: teacherFetch } = useLoader({})
    const { isLoading: groupLoading, fetchData: groupFetch } = useLoader({})

    // Api
    const examApi = useApi().timetable.exam
    const teacherListApi = useApi().hrms.teacher
    const lessonApi = useApi().study.lessonStandart
    const roomApi = useApi().timetable.room
    const groupApi = useApi().print.score

    // Modal
    const [modal, setModal] = useState(false);
    const [edit_modal, setEditModal] = useState(false);
    console.log("edit_modal", edit_modal);

    /* Нэмэх модал setState функц */
    const handleModal = () =>{
        setModal(!modal)
    }

    /* Жагсаалт дата авах функц */
    async function getDatas() {
        const { success, data } = await allFetch(examApi.get(rowsPerPage, currentPage, sortField, searchValue, selectedType, selectedTeacher))
        if(success) {
            setDatas(data?.results)
            setTotalCount(data?.count)
        }
    }

    useEffect(() => {
        getTeachers();
        // getRoom();
        // getGroups()
        // getLessonOption()
    },[])

    /* subschool id явуулж Багшийн жагсаалт авах */
    async function getTeachers()
    {
        // getLessons();
        const { success, data } = await teacherFetch(teacherListApi.getSchoolFilter(school_id))
        if(success) {
            setTeachers(data)
        }
    }

    // өрөөний жагсаалт
    async function getRoom() {
        const { success, data } = await fetchData(roomApi.getList(''))
        if(success) {
            setRooms(data)
        }
    }

    async function getGroups() {
        const { success, data } = await groupFetch(groupApi.getGroupList(school_id))
        if(success) {
            setGroups(data)
        }
    }

    // Хичээлийн жагсаалт
    // async function getLessonOption() {
    //     const { success, data } = await fetchData(lessonApi.getList())
    //     if(success) {
    //         setLessons(data)
    //     }
    // }

    useEffect(() => {
		if (searchValue.length == 0) {
			getDatas();
		} else {
			const timeoutId = setTimeout(() => {
				getDatas();
			}, 600);

			return () => clearTimeout(timeoutId);
		}
	}, [rowsPerPage, currentPage, sortField, searchValue, selectedType, selectedTeacher])


    function handleSort(column, sort) {
        if(sort === 'asc') {
            setSort(column.header)
        } else {
            setSort('-' + column.header)
        }
    }

    async function handleDelete(id) {
		const { success, data } = await fetchData(examApi.delete(id));
		if (success) {
			getDatas();
		}
	}

    // Хайлт хийх үед ажиллах хэсэг
    const handleFilter = (e) => {
        const value = e.target.value.trimStart();
        setSearchValue(value);
    };

    // Хуудас солих үед ажиллах хэсэг
    const handlePagination = (page) => {
        setCurrentPage(page.selected + 1);
    };

    /** Засах модал */
    function handleEditModal(data) {
        setEditId(data?.id)
        setEditData(data)
        handleModal()
    }

    // ** Function to handle per page
    function handlePerPage(e) {
        setRowsPerPage(parseInt(e.target.value))
    }

    // Хайх товч дарсан үед ажиллах функц
    async function handleSearch() {
        getDatas()
    }

    // Шалгалт үүсгэх
    async function createExam() {
        const { success } = await allFetch(examApi.create())
        if (success) {
            getDatas()
        }
    }

    return (
        <Fragment>
            <Card>
                {isLoading && Loader}
                <CardHeader className="flex-md-row flex-column align-md-items-center align-items-start border-bottom">
					<CardTitle tag="h4">{t('Шалгалтын хуваарь')}</CardTitle>
                    <div className='d-flex flex-wrap mt-md-0 mt-1 '>
                        <Button color='primary' disabled={user && Object.keys(user).length && user.permissions.includes('lms-timetable-exam-create')&& school_id ? false : true} onClick={() => handleModal()}>
                            <Plus size={15} />
                            <span className='align-middle ms-50'>{t('Нэмэх')}</span>
                        </Button>
                    </div>
                </CardHeader>
                <Row className='p-1'>
                    <Col md={4}>
                        <Label>Шалгалтын төрөл</Label>
                        <Select
                            classNamePrefix='select'
                            isClearable
                            className={classNames('react-select')}
                            isLoading={groupLoading}
                            placeholder={t('-- Сонгоно уу --')}
                            options={examType() || []}
                            value={examType().find((c) => c.id === selectedType)}
                            noOptionsMessage={() => t('Хоосон байна')}
                            onChange={(val) => {
                                setSelectedType(val ? val?.id : '')
                            }}
                            styles={ReactSelectStyles}
                            getOptionValue={(option) => option.id}
                            getOptionLabel={(option) => option.name}
                        />
                    </Col>
                    <Col md={4}>
                        <Label>Хянах багш</Label>
                        <Select
                            classNamePrefix='select'
                            isClearable
                            className={classNames('react-select')}
                            isLoading={teacherLoading}
                            placeholder={t('-- Сонгоно уу --')}
                            options={teachers || []}
                            value={teachers.find((c) => c.id === selectedTeacher)}
                            noOptionsMessage={() => t('Хоосон байна')}
                            onChange={(val) => {
                                setSelectedTeacher(val ? val.id : '')
                            }}
                            styles={ReactSelectStyles}
                            getOptionValue={(option) => option.id}
                            getOptionLabel={(option) => option.rank_name + ' ' + option?.full_name}
                        />
                    </Col>
                </Row>
                <Row className="justify-content-between mx-0">
                        <Col className='d-flex align-items-center justify-content-start mt-1' md={4} sm={12}>
                            <Col md={3} sm={3} className='pe-1'>
                                <Input
                                    className='dataTable-select me-1 mb-50'
                                    type='select'
                                    bsSize='sm'
                                    style={{ height: "30px" }}
                                    value={rowsPerPage}
                                    onChange={e => handlePerPage(e)}
                                >
                                    {
                                        default_page.map((page, idx) => (
                                        <option
                                            key={idx}
                                            value={page}
                                        >
                                            {page}
                                        </option>
                                    ))}
                                </Input>
                            </Col>
                            <Col md={6} sm={3}>
                                <Label for='sort-select'>{t('Хуудсанд харуулах тоо')}</Label>
                            </Col>
                        </Col>
                        <Col className='d-flex align-items-center mobile-datatable-search mt-1' md={3} sm={12}>
                            <Input
                                className='dataTable-filter mb-50'
                                type='text'
                                bsSize='sm'
                                id='search-input'
                                placeholder={t('Хайх')}
                                value={searchValue}
                                onChange={handleFilter}
                                onKeyPress={e => e.key === 'Enter' && handleSearch()}
                            />
                            <Button
                                size='sm'
                                className='ms-50 mb-50'
                                color='primary'
                                onClick={handleSearch}
                            >
                                <Search size={15} />
                                <span className='align-middle ms-50'></span>
                            </Button>
                        </Col>
                        {/* <Col className="mt-1 " md={4}>
                            <Label>Хичээл</Label>
                            <Select
                            name="room_type"
                            id="room_type"
                            classNamePrefix='select'
                            isClearable
                            className={classNames('react-select')}
                            isLoading={isLoading}
                            placeholder={t('-- Сонгоно уу --')}
                                options={lessons || []}
                                // value={angi.find((c) => c.id === room_id)}
                                noOptionsMessage={() => t('Хоосон байна')}
                                onChange={(val) => {
                                }}
                                styles={ReactSelectStyles}
                                getOptionValue={(option) => option.name}
                                getOptionLabel={(option) => option.name}
                            />
                        </Col> */}
                    </Row>
                {
                    isTableLoading
                        ?
                            <div className="my-2 text-center" sm={12}>
                                <Spinner size='sm' />
                                <span className='ms-50'>{t('Түр хүлээнэ үү')}...</span>
                            </div>
                        :
                                datas.length > 0 ?

                                        <div className="react-dataTable react-dataTable-selectable-rows" id="datatableLeftTwoRightOne">
                                            <DataTable
                                                noHeader
                                                pagination
                                                className='react-dataTable'
                                                // progressPending={isTableLoading}
                                                onSort={handleSort}
                                                columns={getColumns(currentPage, rowsPerPage, datas, handleEditModal, handleDelete, navigate)}
                                                sortIcon={<ChevronDown size={10} />}
                                                paginationPerPage={rowsPerPage}
                                                paginationDefaultPage={currentPage}
                                                data={datas}
                                                paginationComponent={getPagination(handlePagination, currentPage, rowsPerPage, total_count)}
                                                fixedHeader
                                                fixedHeaderScrollHeight='62vh'
                                            />
                                        </div>
                                    :
                                        <div className="d-flex justify-content-center p-5">
                                            <Badge color='light-warning' className="p-1"> <AlertCircle/> Уучлаарай илэрц олдсонгүй </Badge>
                                        </div>
                            }
                {modal && <Addmodal open={modal} handleModal={handleModal} refreshDatas={getDatas} handleEdit={handleEditModal} editId={editId} editData={edit_data}/>}
                {/* {edit_modal && <Editmodal editId={edit_pay_id} open={edit_modal} handleModal={handleEditModal} refreshDatas={getDatas}/>} */}
            </Card>
        </Fragment>
    )
}

export default ExamTimeTable;
