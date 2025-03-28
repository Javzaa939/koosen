// ** React Imports
import { useEffect, useState, useMemo } from 'react'
import { Search } from 'react-feather'
import { useTranslation } from 'react-i18next'
import { Button, Col, Input, Label, Row } from 'reactstrap'

import useApi from '@hooks/useApi'

import ExamFilter from '../../helpers/ExamFilter'
import GenericDataTable from '../../helpers/GenericDataTable'
import GroupFilter from '../../helpers/GroupFilter'
import './style.scss'
import ProfessionFilter from '../../helpers/ProfessionFilter'
import LessonsModal from '../../helpers/LessonsModal'
import TeacherScoreGroupFilter from '../../helpers/TeacherScoreGroupFilter'

export default function ReportDatatable({ report }) {
    // other hooks
    const { t } = useTranslation()
    const challengeApi = useApi().challenge

    // #region states
    const [selected_exam, setSelectedExam] = useState('')
    const [selected_group, setSelectedGroup] = useState('')
    const [selected_profession, setSelectedProfession] = useState('')
    const [selected_year, setSelectedYear] = useState('')
    const [selected_season, setSelectedSeason] = useState('')

    const [rows_per_page, setRowsPerPage] = useState(50)
    const [search_value, setSearchValue] = useState('')
    const [render_to_search, setRenderToSearch] = useState(false)

    const [isShowLessonsDetail, setIsShowLessonsDetail] = useState(false)
    const [studentId, setStudentId] = useState(null)
    const [apiGetFuncArgs, setApiGetFuncArgs] = useState(null)
    const [rowData, setRowData] = useState({})
    // #endregion

    // #region primitives
    const columns = getColumns()
    const default_page = ['Бүгд', 10, 20, 50, 75, 100]
    // #endregion

    function getColumns() {
        switch (report) {
            case 'students':
                return [
                    {
                        name: `${t('Ангийн нэр')}`,
                        selector: (row) => (<span>{row?.group_name}</span>),
                        center: true,
                        header: 'group_name',
                        sortable: true
                    },
                    {
                        name: `${t('Оюутны нэр')}`,
                        selector: (row) => (<span>{row?.student_first_name}</span>),
                        center: true,
                        header: 'student_first_name',
                        sortable: true
                    },
                    {
                        name: `${t('Оюутны овог')}`,
                        selector: (row) => (<span>{row?.student_last_name}</span>),
                        center: true,
                        header: 'student_last_name',
                        sortable: true
                    },
                    {
                        name: `${t('Оюутны код')}`,
                        selector: (row) => (<span>{row?.student_code}</span>),
                        center: true,
                        header: 'student_code',
                        sortable: true
                    },
                    {
                        name: `${t('Хичээлийн тоо')}`,
                        selector: (row) => (<span>{row?.scored_lesson_count} {/*({row?.scored_lesson_count})*/}</span>),
                        center: true,
                        header: 'scored_lesson_count',
                        sortable: true
                    },
                    {
                        name: `${t('Хичээлд амжилттай давсан тоо')}`,
                        selector: (row) => (<span>{row?.success_scored_lesson_count}</span>),
                        center: true,
                        minWidth: '240px',
                        header: 'success_scored_lesson_count',
                        sortable: true
                    },
                    {
                        name: `${t('Хичээлд унасан тоо')}`,
                        center: true,
                        header: 'failed_scored_lesson_count',
                        sortable: true,
                        minWidth: '200px',
                        cell: row => (
                            row?.failed_scored_lesson_count >= 3
                                ?
                                <div style={{ color: '#ff0000' }}>
                                    {row?.failed_scored_lesson_count}
                                </div>
                                :
                                <span>{row?.failed_scored_lesson_count}</span>
                        ),
                    },
                    {
                        name: t("Дэлгэрэнгүй"),
                        selector: (row) => (
                            <Button size='sm' onClick={() => handleLessonsDetail(row?.student_idnum, row)} color='primary'>{t("Дэлгэрэнгүй")}</Button>
                        ),
                        minWidth: "180px",
                        center: true
                    },
                ]
            // this is "OR" condition because after first case there is no return or break. To decrease code duplication
            case 'groups':
            case 'professions':
                const genericColumns = [
                    {
                        name: `${t('Оюутны тоо')}`,
                        selector: (row) => (<span>{row?.student_count}</span>),
                        center: true,
                        minWidth: '110px'
                    },
                    {
                        name: `${t('+A')}`,
                        selector: (row) => (<span>{row?.A2_count}</span>),
                        center: true
                    },
                    {
                        name: `${t('A')}`,
                        selector: (row) => (<span>{row?.A_count}</span>),
                        center: true
                    },
                    {
                        name: `${t('+B')}`,
                        selector: (row) => (<span>{row?.B2_count}</span>),
                        center: true
                    },
                    {
                        name: `${t('B')}`,
                        selector: (row) => (<span>{row?.B_count}</span>),
                        center: true
                    },
                    {
                        name: `${t('+C')}`,
                        selector: (row) => (<span>{row?.C2_count}</span>),
                        center: true
                    },
                    {
                        name: `${t('C')}`,
                        selector: (row) => (<span>{row?.C_count}</span>),
                        center: true
                    },
                    {
                        name: `${t('D')}`,
                        selector: (row) => (<span>{row?.D_count}</span>),
                        center: true
                    },
                    {
                        name: `${t('F')}`,
                        selector: (row) => (<span>{row?.F_count}</span>),
                        center: true
                    },
                ]

                if (report === 'groups') genericColumns.unshift({
                    name: `${t('Ангийн нэр')}`,
                    selector: (row) => (<span>{row?.group_name}</span>),
                    center: true,
                    minWidth: '200px'
                })
                else if (report === 'professions') genericColumns.unshift({
                    name: `${t('Хөтөлбөрийн нэр')}`,
                    selector: (row) => (<span>{row?.profession_name}</span>),
                    center: true,
                    minWidth: '200px'
                })

                return genericColumns
            default:
                return []
        }
    }

    // ** Function to handle per page
    function handlePerPage(e) {
        setRowsPerPage(e.target.value === 'Бүгд' ? 10000000 : parseInt(e.target.value))
    }

    // ** Function to handle filter
    const handleFilter = e => {
        const value = e.target.value.trimStart();
        setSearchValue(value)
    }

    async function handleSearch() {
        if (search_value.length > 0) setRenderToSearch(!render_to_search)
    }

    const handleLessonsDetail = (student_id, row) => {
        setIsShowLessonsDetail(!isShowLessonsDetail)
        setStudentId(student_id)
        setRowData(row)
    }

    // to not rerender generic datatable if data not changed
    useEffect(()=>{
        setApiGetFuncArgs({ report_type: report, exam: selected_exam, group: selected_group, profession: selected_profession, lesson_year: selected_year, lesson_season: selected_season })
    },[report, selected_exam, selected_group, selected_profession, selected_season, selected_year])

    const examMemo = useMemo(() => {
        return (
            <ExamFilter setSelected={setSelectedExam} setSelectedYear={setSelectedYear} setSelectedSeason={setSelectedSeason} selected_year={selected_year} selected_season={selected_season}/>
        )
    }, [selected_year, selected_season])

    return (
        <>
            <div className='px-1'>
                <Row>
                    {
                        examMemo
                    }
                    <Col md={3}>
                        {
                            ['professions', 'students'].includes(report) &&
                            <div  className='me-1'>
                                <ProfessionFilter setSelected={setSelectedProfession} />
                            </div>
                        }
                    </Col>
                    <Col md={3}>
                        {
                            ['students'].includes(report) &&
                            <div  className='me-1'>
                                <TeacherScoreGroupFilter setSelected={setSelectedGroup} profession={selected_profession} />
                            </div>
                        }
                    </Col>
                    <Col md={3}>
                        {
                            ['groups'].includes(report) &&
                            <div  className='me-1'>
                                <GroupFilter setSelected={setSelectedGroup} exam_id={selected_exam} profession={selected_profession} isShowAll={report === 'students' ? 'true' : 'false'} />
                            </div>
                        }
                    </Col>
                </Row>
                <Row className='mt-1 d-flex'>
                    <Col>
                        <Input
                            type='select'
                            bsSize='sm'
                            style={{ height: "30px", width: "62px" }}
                            value={rows_per_page === 10000000 ? 'Бүгд' : rows_per_page}
                            onChange={e => handlePerPage(e)}
                            className='mb-50 mt-2'
                        >
                            {
                                default_page.map((page, idx) => (
                                    <option
                                        key={idx}
                                        value={page}
                                    >
                                        {page}
                                    </option>
                                ))
                            }
                        </Input>
                    </Col>
                    <Col className='d-flex justify-content-end'>
                        {
                            report === 'students' &&
                                <div className='d-flex mb-1'>
                                    <div>
                                        <Label className="form-label" for='search-input'>
                                            {t('Хайх')}
                                        </Label>
                                        <div className='d-flex'>
                                            <Input
                                                className='dataTable-filter'
                                                type='text'
                                                bsSize='sm'
                                                id='search-input'
                                                placeholder={t('Хайх')}
                                                value={search_value}
                                                onChange={handleFilter}
                                                onKeyPress={e => e.key === 'Enter' && handleSearch()}
                                                style={{ height: '30px' }}
                                            />
                                            <Button
                                                size='sm'
                                                className='ms-50'
                                                color='primary'
                                                onClick={handleSearch}
                                                style={{ height: '30px' }}
                                            >
                                                <Search size={15} />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                        }
                    </Col>
                </Row>
                <GenericDataTable apiGetFunc={challengeApi.getReport} isApiGetFuncArgsDefault={true} apiGetFuncArgs={apiGetFuncArgs} columns={columns} rows_per_page={rows_per_page} search_value={search_value} render_to_search={render_to_search} />
            </div>
            {
                isShowLessonsDetail &&
                <LessonsModal open={isShowLessonsDetail} handleModal={handleLessonsDetail} student={studentId} group={selected_group} profession={selected_profession} rowData={rowData}/>
            }
        </>
    )
}
