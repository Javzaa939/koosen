// ** React Imports
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { Button, Col, Input, Label, Row } from 'reactstrap'
import DataTable from 'react-data-table-component'
import { ChevronDown, Search } from 'react-feather'

import useApi from '@hooks/useApi'
import useLoader from '@hooks/useLoader'
import { getPagination } from '@src/utility/Utils'

import ExamFilter from '../helpers/ExamFilter'
import './style.scss'
import { getColumns } from './helpers'
import GroupFilter from '../helpers/GroupFilter'

export default function ReportPieChart() {
    // states
    const [selected_exam, setSelectedExam] = useState('')
    const [selected_group, setSelectedGroup] = useState('')
    const [datas, setDatas] = useState([])
    const [dataTableDatas, setDataTableDatas] = useState([])

    // #region datatable
    const default_page = [10, 15, 50, 75, 100]
    const [currentPage, setCurrentPage] = useState(1)
    const [rowsPerPage, setRowsPerPage] = useState(default_page[0])
    const [searchValue, setSearchValue] = useState('')
    const [total_count, setTotalCount] = useState(1)
    const [sortField, setSort] = useState('')
    // #endregion

    const { t } = useTranslation()
    const { isLoading, Loader, fetchData } = useLoader({ isFullScreen: true })
    const challengeApi = useApi().challenge

    async function getDatas() {
        const { success, data } = await fetchData(challengeApi.getReport({
            report_type: 'reliability',
            exam: selected_exam,
            group: selected_group
        }))

        if (success) {
            setDatas(data?.filter(item => item.questions_count_percent > 0))
        }
    }

    async function getDataTableDatas() {
        const { success, data } = await fetchData(challengeApi.getReport({
            page: currentPage,
            limit: rowsPerPage,
            sort: sortField,
            search: searchValue,
            report_type: 'dt_reliability',
            exam: selected_exam,
            group: selected_group
        }))

        if (success) {
            setDataTableDatas(data?.results)
            setTotalCount(data?.count)
        }
    }

    useEffect(() => {
        if (selected_exam) {
            getDatas()
            getDataTableDatas()
        }
    }, [selected_exam, selected_group])

    // #region datatable
    function handlePagination(page) {
        setCurrentPage(page.selected + 1);
    };

    function handleSort(column, sort) {
        if (column) {
            if (sort === 'asc') {
                setSort(column.header)
            } else {
                setSort('-' + column.header)
            }
        }
    }

    function handlePerPage(e) {
        setRowsPerPage(parseInt(e.target.value))
    }

    const handleFilter = e => {
        const value = e.target.value
        setSearchValue(value)
    }

    async function handleSearch() {
        if (searchValue.length > 0) getDataTableDatas()
    }

    useEffect(() => {
        if (!searchValue) {
            getDataTableDatas()
        }
    }, [searchValue])

    useEffect(() => {
        getDataTableDatas()
    }, [sortField, currentPage, rowsPerPage])

    // #endregion

    const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, value, index }) => {
        const RADIAN = Math.PI / 180;
        const radius = innerRadius + (outerRadius - innerRadius) / 2;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        return (
            <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontWeight="bold">
                {`${value.toFixed(0)}%`}
            </text>
        );
    };

    const groupMemo = useMemo(() => {
        return (
            <GroupFilter setSelected={setSelectedGroup} exam_id={selected_exam}/>
        )
    }, [selected_exam])

    return (
        <div className='px-1'>
            <div className='d-flex justify-content-center' style={{ fontWeight: 900, fontSize: 16 }}>
                {t('Найдвартай байдал')}
            </div>
            {isLoading && Loader}
            <Row>
                <Col md={3} sm={10}>
                    <ExamFilter setSelected={setSelectedExam} />
                </Col>
                <Col md={3} sm={10}>
                    {groupMemo}
                </Col>
            </Row>
            <Row align='center'>
                <Col>
                    <div className='recharts-wrapper pie-chart' style={{ width: '300px', height: '400px' }}>
                        <ResponsiveContainer>
                            <PieChart width={300}>
                                <Pie
                                    data={datas?.length ? datas : []}
                                    dataKey='questions_count_percent'
                                    nameKey='questions_reliability_name'
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={150}
                                    fill="#8884d8"
                                    labelLine={false}
                                    label={renderCustomizedLabel}
                                >
                                    <Cell fill='#4287f5' />
                                    <Cell fill='#dc8ee6' />
                                    <Cell fill='#b76a29' />
                                    <Cell fill='#73b53d' />
                                    <Cell fill='#d14949' />
                                </Pie>
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </Col>
                <Col className='mt-1' md={6}>
                    <Row className='justify-content-between mx-0'>
                        <Col className='d-flex align-items-center justify-content-start'>
                            <Col sm={3} md={6} lg={4} className='pe-1'>
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
                            <Col align='left'>
                                <Label for='sort-select'>{t('Хуудсанд харуулах тоо')}</Label>
                            </Col>
                        </Col>
                        <Col className='d-flex align-items-center mobile-datatable-search mt-1' md={6} sm={12}>
                            <Input
                                className='dataTable-filter mb-50'
                                type='text'
                                bsSize='sm'
                                id='search-input'
                                placeholder="Хайх"
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
                    <Row>
                        <Col>
                            <div className='react-dataTable react-dataTable-selectable-rows'>
                                <DataTable
                                    noHeader
                                    pagination
                                    paginationServer
                                    className='react-dataTable'
                                    progressPending={isLoading}
                                    progressComponent={<h5>{t('Түр хүлээнэ үү')}...</h5>}
                                    noDataComponent={(
                                        <div className="my-2">
                                            <h5>{t('Өгөгдөл байхгүй байна')}.</h5>
                                        </div>
                                    )}
                                    onSort={handleSort}
                                    sortIcon={<ChevronDown size={10} />}
                                    columns={getColumns(currentPage, rowsPerPage)}
                                    paginationPerPage={rowsPerPage}
                                    paginationDefaultPage={currentPage}
                                    paginationComponent={getPagination(handlePagination, currentPage, rowsPerPage, total_count)}
                                    data={dataTableDatas}
                                    fixedHeader
                                    fixedHeaderScrollHeight='62vh'
                                />
                            </div>
                        </Col>
                    </Row>
                </Col>
            </Row>
        </div>
    )
}
