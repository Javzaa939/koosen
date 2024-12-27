// ** React Imports
import { useEffect, useRef, useState } from 'react'
import { Search } from 'react-feather'
import { useTranslation } from 'react-i18next'
import { Button, Col, Input, Label, Row } from 'reactstrap'

import useApi from '@hooks/useApi'
import { getPagination } from '@src/utility/Utils'
import useLoader from '@src/utility/hooks/useLoader'

import StudentsQuestionsTable from './StudentsQuestionsTable'
import GroupFilter from '../helpers/GroupFilter'
import ExamFilter from '../helpers/ExamFilter'

export default function Report4() {
    // other hooks
    const { t } = useTranslation()
    const challengeApi = useApi().challenge
    const { Loader, isLoading, fetchData } = useLoader({})
    const isSkipRender = useRef(false)

    // #region primitives
    // #region table controlling
    const default_page = [10, 15, 50, 75, 100]
    // #endregion
    // #endregion

    // #region states
    const [selected_exam, setSelectedExam] = useState('')
    const [selected_group, setSelectedGroup] = useState('')

    // #region table controlling
    const [rows_per_page, setRowsPerPage] = useState(default_page[0])
    const [search_value, setSearchValue] = useState('')
	const [current_page, setCurrentPage] = useState(1)
	const [total_count, setTotalCount] = useState(1)
    const [sortField, setSort] = useState('')
    // #endregion

    const [studentsQuestionsTableData, setStudentsQuestionsTableData] = useState(null)
    // #endregion

    async function getStudentsQuestionsTableData() {
        const { success, data } = await fetchData(challengeApi.getReport(current_page, rows_per_page, sortField, search_value, 'report4', selected_exam, selected_group))
        console.log(data)
        if (success) {
            setStudentsQuestionsTableData(data?.results)
            setTotalCount(data?.count)
        }
    }

    useEffect(() => {
        getStudentsQuestionsTableData()
    }, [])

    // #region table controlling
    function handleSort(column, sort) {
        if (column) {
            if(sort === 'asc') {
                setSort(column.header)
            } else {
                setSort('-' + column.header)
            }
        }
    }

    // ** Function to handle per page
    function handlePerPage(e) {
        setRowsPerPage(parseInt(e.target.value))
    }

    // ** Function to handle filter
    const handleFilter = e => {
        if (selected_exam) {
            const value = e.target.value.trimStart();
            setSearchValue(value)
        }
    }

    async function handleSearch() {
        if (search_value.length > 0 && selected_exam) getStudentsQuestionsTableData()
    }

	const handlePagination = (page) => {
		setCurrentPage(page.selected + 1);
	};

    useEffect(() => {
        if (isSkipRender.current) getStudentsQuestionsTableData()
        else isSkipRender.current = true
    }, [search_value, current_page, sortField, selected_exam, selected_group])
    // #endregion

    return (
        <div className='px-1'>
            {isLoading && Loader}
            <Row>
                <Col className='d-flex'>
                    <div style={{ width: '219.5px' }} className='me-1'>
                        <ExamFilter setSelected={setSelectedExam} />
                    </div>
                    <div style={{ width: '219.5px' }} className='me-1'>
                        <GroupFilter setSelected={setSelectedGroup} />
                    </div>
                    <div className='d-flex'>
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
                                    disabled={!selected_exam}
                                >
                                    <Search size={15} />
                                </Button>
                            </div>
                        </div>
                    </div>
                </Col>
            </Row>
            <Row className='mt-1'>
                <Col>
                    <Input
                        type='select'
                        bsSize='sm'
                        style={{ height: "30px", width: "62px" }}
                        value={rows_per_page}
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
                    <StudentsQuestionsTable data={studentsQuestionsTableData} handleSort={handleSort} />
                    {getPagination(handlePagination, current_page, rows_per_page, total_count)()}
                </Col>
            </Row>
        </div>
    )
}
