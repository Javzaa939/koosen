// ** React Imports
import { useEffect, useRef, useState, useMemo } from 'react'
import { Printer, Search, DownloadCloud } from 'react-feather'
import { useTranslation } from 'react-i18next'
import { Button, Col, Input, Label, Row } from 'reactstrap'

import useApi from '@hooks/useApi'
import { getPagination } from '@src/utility/Utils'
import useLoader from '@src/utility/hooks/useLoader'

import StudentsQuestionsTable from './StudentsQuestionsTable'
import GroupFilter from '../helpers/GroupFilter'
import ExamFilter from '../helpers/ExamFilter'
import { stableStylesPrintElement } from '../helpers'
import excelDownload from '@src/utility/excelDownload'


export default function Report4() {
    // other hooks
    const { t } = useTranslation()
    const challengeApi = useApi().challenge
    const { Loader, isLoading, fetchData } = useLoader({})
    const isSkipRender = useRef(false)

    // #region primitives
    // #region table controlling
    const default_page = ['Бүгд', 25, 50, 75, 100]
    // #endregion table controlling
    // #endregion

    // #region states
    const [selected_exam, setSelectedExam] = useState('')
    const [selected_group, setSelectedGroup] = useState('')
    const [selected_year, setSelectedYear] = useState('')
    const [selected_season, setSelectedSeason] = useState('')

    // #region table controlling
    const [rows_per_page, setRowsPerPage] = useState(default_page[0])
    const [search_value, setSearchValue] = useState('')
    const [current_page, setCurrentPage] = useState(1)
    const [total_count, setTotalCount] = useState(1)
    const [sortField, setSort] = useState('')
    // #endregion table controlling

    const [studentsQuestionsTableData, setStudentsQuestionsTableData] = useState(null)
    const [studentsQuestionsTableAggregatedData, setStudentsQuestionsTableAggregatedData] = useState(null)
    // #endregion

    async function getStudentsQuestionsTableData() {
        const { success, data } = await fetchData(challengeApi.getReport({
            page: current_page,
            limit: rows_per_page,
            sort: sortField,
            search: search_value,
            report_type: 'report4',
            exam: selected_exam,
            group: selected_group,
            lesson_year: selected_year,
            lesson_season: selected_season
        }))


        if (success) {
            setStudentsQuestionsTableData(data?.results)
            setTotalCount(data?.count)
        }
    }

    async function getStudentsQuestionsTableAggregatedData() {
        const { success, data } = await fetchData(challengeApi.getReport({
            report_type: 'report4-1',
            exam: selected_exam,
            group: selected_group,
            lesson_year: selected_year,
            lesson_season: selected_season
        }))

        if (success) {
            setStudentsQuestionsTableAggregatedData(data)
        }
    }

    useEffect(() => {
        refreshData()
    }, [])

    function refreshData() {
        if (selected_season && selected_year) {
            getStudentsQuestionsTableData()
            getStudentsQuestionsTableAggregatedData()
        }
    }

    // #region table controlling
    function handleSort(column, sort) {
        if (column) {
            if (sort === 'asc') {
                setSort(column.header)
            } else {
                setSort('-' + column.header)
            }
        }
    }

    // ** Function to handle per page
    function handlePerPage(e) {
        setRowsPerPage(e.target.value === "Бүгд" ? total_count : parseInt(e.target.value))
    }

    // ** Function to handle filter
    const handleFilter = e => {
        if (selected_exam) {
            const value = e.target.value.trimStart();
            setSearchValue(value)
        }
    }

    async function handleSearch() {
        if (search_value.length > 0 && selected_exam) refreshData()
    }

    const handlePagination = (page) => {
        setCurrentPage(page.selected + 1);
    };

    useEffect(() => {
        if (isSkipRender.current) refreshData()
        else isSkipRender.current = true
    }, [search_value, current_page, sortField, selected_exam, selected_group, rows_per_page])
    // #endregion

    const examMemo = useMemo(() => {
        return (
            <ExamFilter setSelected={setSelectedExam} setSelectedYear={setSelectedYear} setSelectedSeason={setSelectedSeason} selected_year={selected_year} selected_season={selected_season}/>
        )
    }, [selected_year, selected_season])

    function excelHandler() {
        let individualData = {};

        if (Array.isArray(studentsQuestionsTableData)){
            let answersObj = {}

            individualData = studentsQuestionsTableData.map((item, index) => {
                var totalScore = item?.answers.reduce((acc, answer) => {
                    return answer.is_answered_right ? acc + 1 : acc;
                }, 0)
                item.answers.forEach((ans, i) => {
                    const isCorrect = ans.is_answered_right ? '1' : '0';
                    answersObj['q' + (i + 1).toString()] = isCorrect;
                });

                return {
                    'index': index + 1,
                    'full_name': item.full_name,
                    ...answersObj,
                    'total': totalScore,
                }
            })
        }
        const rowInfo = {
            headers: [
                '№',
                'Оюутан',
                '1',
                '2',
                '3',
                '4',
                '5',
                '6',
                '7',
                '8',
                '9',
                '10',
                '11',
                '12',
                '13',
                '14',
                '15',
                '16',
                '17',
                '18',
                '19',
                '20',
                '21',
                '22',
                '23',
                '24',
                '25',
                '26',
                '27',
                '28',
                '29',
                '30',
                'Оноо',
            ],
            datas: [
                'index',
                'full_name',
                'q1',
                'q2',
                'q3',
                'q4',
                'q5',
                'q6',
                'q7',
                'q8',
                'q9',
                'q10',
                'q11',
                'q12',
                'q13',
                'q14',
                'q15',
                'q16',
                'q17',
                'q18',
                'q19',
                'q20',
                'q21',
                'q22',
                'q23',
                'q24',
                'q25',
                'q26',
                'q27',
                'q28',
                'q29',
                'q30',
                'total',
            ],
            width: [
               4.5,
            ]
        }
        excelDownload(individualData, rowInfo, `Тайлан 4`)
    }

    return (
        <div className='px-1'>
            {isLoading && Loader}
            <Row>
                {examMemo}
                <Col className='d-flex'>
                    <div style={{ width: '219.5px' }} className='me-1'>
                        <GroupFilter setSelected={setSelectedGroup} exam_id={selected_exam} />
                    </div>
                </Col>
                <Col className='text-start'>
                    <Button
                        className='ms-50 mt-50'
                        color='primary'
                        size='sm'
                        onClick={() => excelHandler()}
                    >
                        <DownloadCloud size={15} />
                        <span className='align-middle ms-50'>{t('Excel татах')}</span>
                    </Button>
                </Col>
                <Col className='text-end mt-50'>
                    <Button
                        className='ms-1'
                        color='primary'
                        size='sm'
                        onClick={() => stableStylesPrintElement('element_to_print')}
                    >
                        <Printer size={15} />
                        <span className='align-middle ms-50'>{t('Хэвлэх')}</span>
                    </Button>
                </Col>
            </Row>
            <Row className='mt-1'>
                <Col>
                    <Row>
                        <Col>
                            <Input
                                type='select'
                                bsSize='sm'
                                style={{ height: "30px", width: "75px" }}
                                value={rows_per_page === total_count ? 'Бүгд' : rows_per_page}
                                onChange={e => handlePerPage(e)}
                                className='mb-50'
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
                        <Col>
                            <div className='d-flex align-items-center justify-content-end'>
                                <Input
                                    className='dataTable-filter ms-50'
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
                                    disabled={!selected_exam}
                                >
                                    <Search size={15} />
                                </Button>
                            </div>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <StudentsQuestionsTable data={studentsQuestionsTableData} aggregatedData={studentsQuestionsTableAggregatedData} handleSort={handleSort} />
                            {getPagination(handlePagination, current_page, rows_per_page, total_count)()}
                        </Col>
                    </Row>
                </Col>
            </Row>
        </div>
    )
}
