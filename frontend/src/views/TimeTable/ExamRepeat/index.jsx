import React, { Fragment, useState, useEffect, useContext, useRef } from 'react'

import { Col, Button, Input, Card, CardHeader, CardTitle, Row, Spinner, Label } from 'reactstrap'

import { useTranslation } from "react-i18next"

import { ChevronDown, Plus, Search } from "react-feather"

import Select from 'react-select'

import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';
import AuthContext from "@context/AuthContext"
import SchoolContext from "@context/SchoolContext"
import DataTable from 'react-data-table-component'

import { getPagination, get_EXAM_STATUS, ReactSelectStyles } from '@utils'

import { getColumns } from "./helpers"
import ElementToPrint, { printElement } from "./helpers/ElementToPrint"
import moment from 'moment'
import AddModal from './Add'
import classNames from "classnames"
import ReactDOM from 'react-dom';
import Editmodal from "./Edit"
import DownloadScore from './DownloadScore'

export default function ExamRepeat() {

    const { t } = useTranslation()
    const { user } = useContext(AuthContext)
    const { school_id } = useContext(SchoolContext)

    // Эрэмбэлэлт
    const [sortField, setSort] = useState('')

    const default_page = [10, 15, 50, 75, 100]

    const [rowsPerPage, setRowsPerPage] = useState(10)

    const [currentPage, setCurrentPage] = useState(1);

    const [editId, setEditId] = useState('')
    const [edit_data, setEditData] = useState('')

    const [datas, setDatas] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [status_id, setStatusId] = useState('')
    const [selectedTeacher, setSelectedTeacher] = useState('')
    const [studentData, setStudentDatas] = useState('')

    const [searchValue, setSearchValue] = useState("");
    const { isLoading: teacherLoading, fetchData: teacherFetch } = useLoader({})
    const { Loader: dataToPrintLoader, isLoading: dataToPrintIsLoading, fetchData: fetchDataToPrint } = useLoader({})

    const { isLoading, fetchData } = useLoader({});
    const [statusOption, setStatusOption] = useState(get_EXAM_STATUS())
    const isPrintButtonPressed = useRef(false)
    const [element_to_print, setElementToPrint] = useState(null);
    const [data_to_print, setDataToPrint] = useState(null);
    const [selected_group_names, setSelectedGroupNames] = useState('')
    const [united_score_ranges, setUnitedScoreRanges] = useState(null)

    // нийт датаны тоо
    const [total_count, setTotalCount] = useState(1)

    // Modal
    const [modal, setModal] = useState(false);
    const [edit_modal, setEditModal] = useState(false);
    const [downloadModal, setDownloadModal] = useState(false);


    // Api
    const scoreListApi = useApi().settings.score
    const scoreApi = useApi().score.print
    const teacherListApi = useApi().hrms.teacher
    const reExamApi = useApi().timetable.re_exam

    // Хуудас солих үед ажиллах хэсэг
    const handlePagination = (page) => {
        setCurrentPage(page.selected + 1);
    };

    /* Нэмэх модал setState функц */
    const handleModal = () => {
        setModal(!modal)
    }

    /** Засах модал */
    function handleEditModal(data) {
        setEditId(null)
        setEditData([])
        if(data){
            setEditId(data?.id)
            setEditData(data)
        }
        handleModal()
    }

    async function handleDelete(id) {
        const { success } = await fetchData(reExamApi.delete(id))
        if (success) {
            getDatas()
        }
    }

    // ** Function to handle per page
    function handlePerPage(e) {
        setRowsPerPage(parseInt(e.target.value))
    }

    /* Жагсаалт сорт хийж байгаа функц */
    function handleSort(column, sort) {
        if (sort === 'asc') {
            setSort(column.header)
        } else {
            setSort('-' + column.header)
        }
    }

    /* subschool id явуулж Багшийн жагсаалт авах */
    async function getTeachers() {
        // getLessons();
        const { success, data } = await teacherFetch(teacherListApi.getSchoolFilter(school_id))
        if (success) {
            setTeachers(data)
        }
    }

    // API Холбож дата авчирна
    async function getDatas() {
        const { success, data } = await fetchData(reExamApi.get(rowsPerPage, currentPage, sortField, searchValue, status_id, selectedTeacher))
        if (success) {
            setDatas(data?.results)
            setTotalCount(data?.count)
        }
    }

    useEffect(() => {
        getTeachers();
        getUnitedScoreRanges()
    }, [])

    useEffect(() => {
        getDatas()
    }, [rowsPerPage, currentPage, sortField, searchValue, status_id,selectedTeacher])


    function handleSearch() {
        getDatas()
    }

    const handleFilter = (e) => {
        const value = e.target.value.trimStart();
        setSearchValue(value);
    };

    useEffect(() => {
        if (isPrintButtonPressed?.current && data_to_print) {
            setElementToPrint(<ElementToPrint data_to_print={data_to_print} setElementToPrint={setElementToPrint} />)
            isPrintButtonPressed.current = false
        }
    }, [data_to_print])


    // #region print score info
    useEffect(() => {
        if (element_to_print) {
            const group_names_array = Object.values(selected_group_names)
            let group_names = ''

            if (group_names_array) {
                if (group_names_array.length > 0) {
                    group_names = group_names_array[0]
                }

                if (group_names_array.length > 1) {
                    group_names = group_names + ' and more'
                }
            }

            printElement('element_to_print', group_names)
        }
    }, [element_to_print])

    async function getUnitedScoreRanges() {
        const ranges = {}
        const { success, data } = await fetchDataToPrint(scoreListApi.get())

        if (success) {
            for (let i = 0; i < data.length; i++) {
                const item = data[i]
                const assessment = item.assesment.replace('+', '')
                if (!ranges.hasOwnProperty(assessment)) ranges[assessment] = {}

                if (ranges[assessment].score_min) {
                    if (ranges[assessment].score_min > item.score_min) {
                        ranges[assessment].score_min = item.score_min
                    }
                } else ranges[assessment]['score_min'] = item.score_min

                if (ranges[assessment].score_max) {
                    if (ranges[assessment].score_max < item.score_max) {
                        ranges[assessment].score_max = item.score_max
                    }
                } else ranges[assessment]['score_max'] = item.score_max
            }
        }

        setUnitedScoreRanges(ranges)
    }

    async function getDataToPrint(lesson_id, selectedStudent) {
        if (lesson_id) {
            const { success, data } = await fetchDataToPrint(scoreApi.getByReExam(lesson_id, selectedStudent))

            if (success) {
                if (data?.length) {
                    const dataToPrint = {}
                    dataToPrint['teacher_org_position'] = data[0].teacher_org_position || '',
                        dataToPrint['teacher_name'] = data[0].teacher_name || '',
                        dataToPrint['teacher_score_updated_at'] = moment(data[0].teacher_score_updated_at).format('YYYY-MM-DD HH:mm:ss') || '',
                        dataToPrint['exam_committee'] = data[0].exam_committee || [],
                        dataToPrint['lesson_year'] = data[0].lesson_year || '',
                        dataToPrint['lesson_season'] = data[0].lesson_season || '',
                        dataToPrint['lesson_name'] = data[0].lesson_name || '',
                        dataToPrint['lesson_credit'] = data[0].lesson_kredit || '',

                        dataToPrint['lesson_students'] = data.map(item => {
                            return {
                                full_name: item.full_name || '',
                                teacher_score: item.teacher_score || '',
                                exam_score: item.exam_score || '',
                                letter: item.grade_letter || '',
                                total: item.total || '',
                            }
                        })

                    // #region Irts table calculation
                    dataToPrint['total_students_count'] = data.length
                    dataToPrint['scored_students_count'] = data.filter(item => item.score).length
                    const score_ranges = united_score_ranges
                    dataToPrint['a_students_count'] = data.filter(item => score_ranges.A.score_min <= item.total && item.total <= score_ranges.A.score_max).length
                    dataToPrint['b_students_count'] = data.filter(item => score_ranges.B.score_min <= item.total && item.total <= score_ranges.B.score_max).length
                    dataToPrint['c_students_count'] = data.filter(item => score_ranges.C.score_min <= item.total && item.total <= score_ranges.C.score_max).length
                    dataToPrint['d_students_count'] = data.filter(item => score_ranges.D.score_min <= item.total && item.total <= score_ranges.D.score_max).length
                    dataToPrint['f_students_count'] = data.filter(item => score_ranges.F.score_min <= item.total && item.total <= score_ranges.F.score_max).length

                    if (dataToPrint['total_students_count'] > 0) {
                        dataToPrint['success'] = (((dataToPrint['a_students_count'] + dataToPrint['b_students_count'] + dataToPrint['c_students_count']) * 100) / dataToPrint['total_students_count']).toFixed(0) + '%'
                        dataToPrint['quality'] = (((dataToPrint['a_students_count'] + dataToPrint['b_students_count']) * 100) / dataToPrint['total_students_count']).toFixed(0) + '%'
                    } else {
                        dataToPrint['success'] = ''
                        dataToPrint['quality'] = ''
                    }
                    // #endregion
                    setDataToPrint(dataToPrint)
                    setSelectedGroupNames(selectedStudent)
                }
            }
        }
    }

    function handlePrint(id, selectedStudent) {
        getDataToPrint(id, selectedStudent)
        isPrintButtonPressed.current = true
    }

    // Оюутны жагсаалт
    const getStudentList = async (rowDatas) => {
        if (rowDatas?.id) {
            const lessonId = rowDatas.lesson || ''

            const { success, data } = await fetchData(reExamApi.getStudentExamScore(rowDatas?.id, lessonId))
            if (success) {
                setStudentDatas(data)
            }
        }
    }

    function handleDownloadScore(row) {
        setDownloadModal(!downloadModal)
        getStudentList(row)
    }

    return (
        <Fragment>
            <Card>
                <CardHeader className="flex-md-row flex-column align-md-items-center align-items-start border-bottom">
                    <CardTitle tag="h4">{t('Давтан шалгалтын хуваарь')}</CardTitle>
                    <div className='d-flex flex-wrap mt-md-0 mt-1'>
                        <Button color='primary' disabled={Object.keys(user).length > 0 && user.permissions.includes('lms-timetable-examrepeat-create') ? false : true} onClick={() => handleModal()}>
                            <Plus size={15} />
                            <span className='align-middle ms-50'>{t('Нэмэх')}</span>
                        </Button>
                    </div>
                </CardHeader>
                <Row className=" d-flex mx-0 mt-1">
                    <Col md={4} className='mb-1'>
                        <Label className="form-label me-1" for="status">
                            {t('Шалгалтын төлөв')}
                        </Label>
                        <Select
                            name="status"
                            id="status"
                            classNamePrefix='select'
                            isClearable
                            className={'react-select'}
                            isLoading={isLoading}
                            options={statusOption || []}
                            placeholder={t('-- Сонгоно уу --')}
                            noOptionsMessage={() => t('Хоосон байна')}
                            styles={ReactSelectStyles}
                            value={status_id && statusOption.find((c) => c.id === status_id)}
                            onChange={(val) => {
                                setStatusId(val?.id || '')
                            }}
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
                <Row className='justify-content-between mx-0 mb-1'>
                    <Col className='d-flex align-items-center justify-content-start' md={6} sm={12}>
                        <Col md={2} sm={3} className='pe-1'>
                            <Input
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
                        <Col md={10} sm={3}>
                            <Label for='sort-select'>{t('Хуудсанд харуулахs тоо')}</Label>
                        </Col>
                    </Col>
                    <Col className='d-flex align-items-center mobile-datatable-search mt-1' md={4} sm={12}>
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
                </Row>
                {
                    isLoading
                        ?
                        <div className="my-2 text-center" sm={12}>
                            <Spinner size='sm' />
                            <span className='ms-50'>{t('Түр хүлээнэ үү')}...</span>
                        </div>
                        :
                        <div className='react-dataTable react-dataTable-selectable-rows'>
                            <DataTable
                                noHeader
                                pagination
                                className='react-dataTable'
                                progressPending={isLoading}
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
                                onSort={handleSort}
                                columns={getColumns(currentPage, rowsPerPage, datas, handleEditModal, handleDelete, user, handlePrint, handleDownloadScore)}
                                sortIcon={<ChevronDown size={10} />}
                                paginationPerPage={rowsPerPage}
                                paginationDefaultPage={currentPage}
                                data={datas}
                                paginationComponent={getPagination(handlePagination, currentPage, rowsPerPage, total_count)}
                                fixedHeader
                                fixedHeaderScrollHeight='62vh'
                            />
                        </div>
                }
                {downloadModal && <DownloadScore open={downloadModal} handleModal={() => setDownloadModal(!downloadModal)} studentDatas={studentData} />}
                {modal && <AddModal open={modal} handleModal={handleModal} refreshDatas={getDatas} handleEdit={handleEditModal} editId={editId} editData={edit_data} />}
            </Card>
            {ReactDOM.createPortal(element_to_print, document.body)}
        </Fragment>
    )
};

