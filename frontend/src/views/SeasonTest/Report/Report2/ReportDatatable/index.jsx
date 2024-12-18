// ** React Imports
import { useState } from 'react'
import { Search } from 'react-feather'
import { useTranslation } from 'react-i18next'
import { Button, Col, Input, Label, Row } from 'reactstrap'

import useApi from '@hooks/useApi'
import { calculatePercentage } from '@src/utility/Utils'

import ExamFilter from '../../helpers/ExamFilter'
import GenericDataTable from '../../helpers/GenericDataTable'
import GroupFilter from '../../helpers/GroupFilter'
import './style.scss'

/*
    TODO:
    - why 6312 group name student count 11 but assesments total count 12 (D=3 F=9)?
    - group filtering
    - Хөтөлбөрөөр tab
    - in database assesments D F are duplicated, so need to add their min max ranges to counting
*/
export default function ReportDatatable({ report }) {
    // other hooks
    const { t } = useTranslation()
    const challengeApi = useApi().challenge

    // #region states
    const [selected_exam, setSelectedExam] = useState('')
    const [selected_group, setSelectedGroup] = useState('')

    const [rows_per_page, setRowsPerPage] = useState(10)
    const [search_value, setSearchValue] = useState('')
    const [render_to_search, setRenderToSearch] = useState(false)
    // #endregion

    // #region primitives
    const columns = getColumns()
    const default_page = [10, 15, 50, 75, 100]
    // #endregion

    function getColumns() {
        switch (report) {
            case 'students':
                return [
                    {
                        name: `${t('Оюутны код')}`,
                        selector: (row) => (<span>{row?.student_code}</span>),
                        center: true
                    },
                    {
                        name: `${t('Оюутны нэр')}`,
                        selector: (row) => (<span>{row?.student_name}</span>),
                        center: true
                    },
                    {
                        name: `${t('Авах оноо')}`,
                        selector: (row) => (<span>{row?.take_score}</span>),
                        center: true
                    },
                    {
                        name: `${t('Авсан оноо')}`,
                        selector: (row) => (<span>{row?.score}</span>),
                        center: true
                    },
                    {
                        name: `${t('Хувиар')}`,
                        selector: (row) => (<span>{Math.round(calculatePercentage(row?.score, row?.take_score))}%</span>),
                        center: true
                    },
                ]
            case 'groups':
                return [
                    {
                        name: `${t('Ангийн нэр')}`,
                        selector: (row) => (<span>{row?.group_name}</span>),
                        center: true,
                        minWidth: '110px'
                    },
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
            default:
                return []
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
        if (search_value.length > 0 && selected_exam) setRenderToSearch(!render_to_search)
    }

    return (
        <div className='px-1'>
            <Row>
                <Col className='d-flex'>
                    <div style={{ width: '219.5px' }} className='me-1'>
                        <ExamFilter setSelected={setSelectedExam} />
                    </div>
                    {
                        report === 'students' &&
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
                    }
                    {
                        report === 'groups' &&
                        <div style={{ width: '219.5px' }} className='me-1'>
                            <GroupFilter setSelected={setSelectedGroup} />
                        </div>
                    }
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
                    <GenericDataTable apiGetFunc={challengeApi.getReport} isApiGetFuncArgsDefault={true} apiGetFuncArgs={[report, selected_exam, selected_group]} columns={columns} rows_per_page={rows_per_page} search_value={search_value} render_to_search={render_to_search} />
                </Col>
            </Row>
        </div>
    )
}
