// ** React Imports
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, Col, Input, Label, Row } from 'reactstrap'

import useApi from '@hooks/useApi'

import { Search } from 'react-feather'
import ExamFilter from '../helpers/ExamFilter'
import GenericDataTable from '../helpers/GenericDataTable'
import './style.scss'

export default function ReportDatatable(report) {
    // other hooks
    const { t } = useTranslation()
    const challengeApi = useApi().challenge

    // states
    const [selected_exam, setSelectedExam] = useState('')
    const [rows_per_page, setRowsPerPage] = useState(10)
    const [search_value, setSearchValue] = useState('')
    const [render_to_search, setRenderToSearch] = useState(false)

    // #region primitives
    const columns = [
        {
            name: `${t('Оюутнык код')}`,
            selector: (row) => (<span>{row?.student_code}</span>),
            center: true
        },
        {
            name: `${t('Оюутны нэр')}`,
            selector: (row) => (<span>{row?.student_name}</span>),
            center: true
        },
        {
            name: `${t('Оюутны авсан оноо')}`,
            selector: (row) => (<span>{row?.score}</span>),
            center: true
        },
    ]

    const default_page = [10, 15, 50, 75, 100]
    // #endregion

    // ** Function to handle per page
    function handlePerPage(e) {
        setRowsPerPage(parseInt(e.target.value))
    }

    // ** Function to handle filter
    const handleFilter = e => {
        const value = e.target.value.trimStart();
        setSearchValue(value)
    }

	async function handleSearch() {
        if (search_value.length > 0) setRenderToSearch(!render_to_search)
    }

    return (
        <div className='px-1'>
            <div className='d-flex justify-content-center' style={{ fontWeight: 900, fontSize: 16 }}>
                {t('by students')}
            </div>
            <Row>
                <Col className='d-flex'>
                    <div style={{ width: '219.5px' }} className='me-1'>
                        <ExamFilter setSelected={setSelectedExam} />
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
                                onKeyPress={e => e.key === 'Enter' && selected_exam && handleSearch()}
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
                    <GenericDataTable apiGetFunc={challengeApi.getReport} isApiGetFuncArgsDefault={true} apiGetFuncArgs={[2, selected_exam]} columns={columns} rows_per_page={rows_per_page} search_value={search_value} render_to_search={render_to_search} />
                </Col>
            </Row>
        </div>
    )
}
