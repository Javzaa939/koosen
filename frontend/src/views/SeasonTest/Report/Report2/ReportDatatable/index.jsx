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
import ProfessionFilter from '../../helpers/ProfessionFilter'

export default function ReportDatatable({ report }) {
    // other hooks
    const { t } = useTranslation()
    const challengeApi = useApi().challenge

    // #region states
    const [selected_exam, setSelectedExam] = useState('')
    const [selected_group, setSelectedGroup] = useState('')
    const [selected_profession, setSelectedProfession] = useState('')

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
                        name: `${t('Оюутны овог')}`,
                        selector: (row) => (<span>{row?.student_last_name}</span>),
                        center: true
                    },
                    {
                        name: `${t('Оюутны нэр')}`,
                        selector: (row) => (<span>{row?.student_first_name}</span>),
                        center: true
                    },
                    {
                        name: `${t('Оюутны код')}`,
                        selector: (row) => (<span>{row?.student_code}</span>),
                        center: true
                    },
                    {
                        name: `${t('Хичээлийн тоо')}`,
                        selector: (row) => (<span>{row?.scored_lesson_count}</span>),
                        center: true
                    },
                    {
                        name: `${t('Хичээлд амжилттай давсан тоо')}`,
                        selector: (row) => (<span>{row?.success_scored_lesson_count}</span>),
                        center: true,
                        minWidth: '240px'
                    },
                    {
                        name: `${t('Хичээлд унасан тоо')}`,
                        selector: (row) => (<span>{row?.failed_scored_lesson_count}</span>),
                        center: true,
                        minWidth: '200px'
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
                    {
                        report !== 'students' &&
                        <div style={{ width: '219.5px' }} className='me-1'>
                            <ExamFilter setSelected={setSelectedExam} />
                        </div>
                    }
                    {
                        ['professions', 'students'].includes(report) &&
                        <div style={{ width: '219.5px' }} className='me-1'>
                            <ProfessionFilter setSelected={setSelectedProfession} />
                        </div>
                    }
                    {
                        ['groups', 'students'].includes(report) &&
                        <div style={{ width: '219.5px' }} className='me-1'>
                            <GroupFilter setSelected={setSelectedGroup} exam_id={selected_exam} isShowAll={report === 'students' ? 'true' : 'false'} />
                        </div>
                    }
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
                    <GenericDataTable apiGetFunc={challengeApi.getReport} isApiGetFuncArgsDefault={true} apiGetFuncArgs={{report_type: report, exam: selected_exam, group: selected_group, profession: selected_profession}} columns={columns} rows_per_page={rows_per_page} search_value={search_value} render_to_search={render_to_search} />
                </Col>
            </Row>
        </div>
    )
}
