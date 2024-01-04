import React, {useState, useEffect, Fragment, useContext } from 'react'

import {Col, Row, Card, CardHeader, CardTitle, Input, Label, Button, Spinner } from 'reactstrap'

import { Search, Plus } from 'react-feather';

import useApi from '@hooks/useApi';
import AuthContext from '@context/AuthContext'
import useLoader from '@hooks/useLoader';

import Select from 'react-select'

import classnames from 'classnames'

import { useTranslation } from 'react-i18next';

import { generateYear, generateMonths, ReactSelectStyles, first_balance } from '@utils'

import CTable from './helpers/Table';

const RentStudent = ({ is_teacher }) => {
    const default_footer = {
        payment: 0,
        first_uld: 0,
        in_balance: 0,
        out_balance: 0,
        out_payment: 0,
        lastuld: 0,
        ransom: 0,
    }

    const { t } = useTranslation()
    const { Loader, isLoading, fetchData } = useLoader({ isFullScreen: false })

    const default_page = [10, 15, 50, 75, 100]
    const { user } = useContext(AuthContext)
    const year_option = generateYear(5)
    const month_option = generateMonths()
    const payment_type_option = first_balance()

    const [currentPage, setCurrentPage] = useState(1)
    const [rowsPerPage, setRowsPerPage] = useState(10)
    const [searchValue, setSearchValue] = useState('');
    const [datas, setDatas] = useState([])
    const [sortField, setSort] = useState('')
    const [total_count, setTotalCount] = useState(1)
    const [footer, setTotalValue] = useState(default_footer)
    const [year, setYear] = useState('')
    const [month, setMonth] = useState('')
    const [payment_type, setPaymentType] = useState('')

    // Нийт хуудасны тоо
    const [pageCount, setPageCount] = useState(1)

    // Api
    const dormitoryEstimateFamilyApi = useApi().dormitory.estimate.family

    async function getDatas() {
        const { success, data } = await fetchData(dormitoryEstimateFamilyApi.get(rowsPerPage, currentPage, sortField, searchValue, year, month, payment_type, is_teacher))
        if(success) {
            setDatas(data?.return_datas?.results)
            setTotalCount(data?.return_datas?.count)

            // Нийт хуудасны тоо
            var page_count = Math.ceil(data?.return_datas?.count / rowsPerPage)
            setPageCount(page_count)

            const total_pay = data?.total_pay
            if(total_pay) {
                setTotalValue({
                    first_uld: total_pay?.sum_first_uld || 0,
                    in_balance: total_pay?.sum_in_balance || 0,
                    out_balance: total_pay?.sum_out_balance || 0,
                    payment: total_pay?.sum_payment || 0,
                    out_payment: total_pay?.sum_out_payment || 0,
                    lastuld: total_pay?.sum_lastuld || 0,
                    ransom: total_pay?.sum_ransom || 0,
                })
            }
        }
    }

    async function handleEstimate() {
        var datas = {}
        datas.is_teacher = is_teacher
        const { success } = await fetchData(dormitoryEstimateFamilyApi.post(datas))
        if(success) {
            getDatas()
        }
    }

    useEffect(() => {
        getDatas()
    },[rowsPerPage, currentPage, sortField, year, month, payment_type, is_teacher])

    useEffect(() => {
        if(searchValue.length < 1) getDatas()
    },[searchValue])

    const handleFilter = e => {
        const value = e.target.value.trimStart();
		setSearchValue(value)
	}

    function handlePerPage(e) {
        setRowsPerPage(parseInt(e.target.value))
    }

    function handleSearch() {
        setTimeout(() => {
            getDatas()
        }, 100)
    }

    const handlePagination = (page) => {
		setCurrentPage(page.selected + 1);
	};

    function handleSort(column, sort) {
        if(sort === 'asc') {
            setSort(column)
        } else {
            setSort('-' + column)
        }
    }

    return (
        <Fragment>
            <Card>
                {Loader && isLoading}
                <CardHeader className="flex-md-row flex-column align-md-items-center align-items-start border-bottom">
					<CardTitle tag="h4">{t('Төлбөрийн тооцоо')}</CardTitle>
                    <div className='d-flex flex-wrap mt-md-0 mt-1'>
                        <Button
                            color='primary'
                            onClick={() => handleEstimate()}
                            disabled={Object.keys(user).length > 0 && user.permissions.includes('lms-dormitory-estimate-update') ? false : true}
                        >
                            <Plus size={15} />
                            <span className='align-middle ms-50'>{t('Бодох')}</span>
                        </Button>
                    </div>
                </CardHeader>
                <Row className='mt-1 d-flex justify-content-between mx-0 mb-1'>
                    <Col md={4}>
						<Label className="form-label me-1" for="year">
							{t('Он')}
						</Label>
						<Select
							name="year"
							id="year"
							classNamePrefix='select'
							isClearable
							className={'react-select'}
							isLoading={isLoading}
							options = {year_option || []}
							placeholder={t('-- Сонгоно уу --')}
							noOptionsMessage={() => t('Хоосон байна')}
							styles={ReactSelectStyles}
							value={year_option.find((e) => e.id === year)}
							onChange={(val) => {
                                setYear(val?.id || '')
							}}
							getOptionValue={(option) => option.id}
							getOptionLabel={(option) => option.name}
						/>
                    </Col>
                    <Col md={4}>
						<Label className="form-label me-1" for="month">
							{t('Сар')}
						</Label>
						<Select
							name="month"
							id="month"
							classNamePrefix='select'
							isClearable
							className={'react-select'}
							isLoading={isLoading}
							options = {month_option || []}
							placeholder={t('-- Сонгоно уу --')}
							noOptionsMessage={() => t('Хоосон байна')}
							styles={ReactSelectStyles}
							value={month_option.find((e) => e.id === month)}
							onChange={(val) => {
                                setMonth(val?.id || '')
							}}
							getOptionValue={(option) => option.id}
							getOptionLabel={(option) => option.name}
						/>
                    </Col>
                    <Col md={4}>
						<Label className="form-label me-1" for="payment">
							{t('Төлбөрийн төрөл')}
						</Label>
						<Select
							name="payment"
							id="payment"
							classNamePrefix='select'
							isClearable
							className={'react-select'}
							isLoading={isLoading}
							options = {payment_type_option || []}
							placeholder={t('-- Сонгоно уу --')}
							noOptionsMessage={() => t('Хоосон байна')}
							styles={ReactSelectStyles}
							value={payment_type_option.find((e) => e.id === payment_type)}
							onChange={(val) => {
                                setPaymentType(val?.id || '')
							}}
							getOptionValue={(option) => option.id}
							getOptionLabel={(option) => option.name}
						/>
                    </Col>
                </Row>
                <Row className='d-flex justify-content-between mx-0 mb-1'>
                    <Col className='d-flex align-items-center justify-content-start' md={6} sm={12}>
                        <Col lg={2} md={3} sm={4} xs={5} className='pe-1'>
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
                            <Label for='sort-select'>{t('Хуудсанд харуулах тоо')}</Label>
                        </Col>
                    </Col>
                    <Col className='d-flex align-items-end mobile-datatable-search mt-50'>
                        <Input
                            className='dataTable-filter mb-50'
                            type='text'
                            bsSize='sm'
                            id='search-input'
                            placeholder={t("Хайх")}
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
                        datas && datas.length > 0
                        ?
                            <div className="react-dataTable react-dataTable-selectable-rows">
                                <CTable
                                    datas={datas}
                                    currentPage={currentPage}
                                    rowsPerPage={rowsPerPage}
                                    page_count={pageCount}
                                    handlePagination={handlePagination}
                                    CSum={footer}
                                    handleSort={handleSort}
                                    refreshDatas={getDatas}
                                    is_teacher={is_teacher}
                                />
                            </div>
                        :
                            <div className="sc-dmctIk gLxfFK react-dataTable text-center">
                                <div className="sc-fLcnxK dApqnJ">
                                    <div className="sc-bcXHqe kVrXuC rdt_Table" role="table">
                                        <div className="sc-iveFHk bzRnkJ">
                                            <div className="my-2">
                                                <h5>{t('Өгөгдөл байхгүй байна')}</h5>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                }
            </Card>
        </Fragment>
    )
}

export default RentStudent
