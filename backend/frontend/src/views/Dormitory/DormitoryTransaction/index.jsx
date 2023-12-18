import React, {useState, useEffect, Fragment } from 'react'

import {Col, Row, Card, CardHeader, CardTitle, Input, Label, Button, Spinner, CardBody} from 'reactstrap'

import { Search, ChevronDown } from 'react-feather';

import { Controller, useForm } from 'react-hook-form'

import useApi from '@hooks/useApi';

import useLoader from '@hooks/useLoader';

import Select from 'react-select'

import { useTranslation } from 'react-i18next';

import DataTable from 'react-data-table-component'

import { getPagination, ReactSelectStyles } from '@utils'

import { getColumns } from './helpers';

const TransactionList = () => {

    // ** Hook
    const { control } = useForm({});

    const { t } = useTranslation()

    const { Loader, isLoading, fetchData } = useLoader({isFullScreen: true})
    const { isLoading: isTableLoading, fetchData: allFetch } = useLoader({isFullScreen: true})

    const [currentPage, setCurrentPage] = useState(1)

    const default_page = [10, 15, 50, 75, 100]

    const payment_type = [
        {
            id: 1, name: 'QPay'
        },
        {
            id: 2, name: 'Банкны хуулгаар'
        }
    ]

    const [rowsPerPage, setRowsPerPage] = useState(10)
    const [searchValue, setSearchValue] = useState('');
    const [datas, setDatas] = useState([])
    const [sortField, setSort] = useState('')
    const [total_count, setTotalCount] = useState(1)
    const [paymentTypeId, setPaymentTypeId] = useState('')

    // Api
    const dormitoryTransactionApi = useApi().dormitory.transaction

    async function getDatas() {
        const { success, data } = await allFetch(dormitoryTransactionApi.get(rowsPerPage, currentPage, sortField, searchValue, paymentTypeId))
        if(success) {
            setDatas(data?.results)
            setTotalCount(data?.count)
        }
    }

    useEffect(() => {
        getDatas()
    },[rowsPerPage, currentPage, sortField, paymentTypeId])

    useEffect(() => {
		if (searchValue.length == 0) {
			getDatas();
		} else {
			const timeoutId = setTimeout(() => {
				getDatas();
			}, 600);

			return () => clearTimeout(timeoutId);
		}
	}, [searchValue]);

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
        }, 1000)
    }

    const handlePagination = (page) => {
		setCurrentPage(page.selected + 1);
	};

    function handleSort(column, sort) {
        if(sort === 'asc') {
            setSort(column.header)
        } else {
            setSort('-' + column.header)
        }
    }

    return (
        <Fragment>
            <Card>
                {Loader && isLoading}
                <CardBody>
                    <CardHeader className='flex-md-row flex-column align-md-items-center align-items-start border-bottom pt-0 ps-50'>
                        <CardTitle tag="h4">{t('Дотуур байрны төлбөрийн гүйлгээ')}</CardTitle>
                    </CardHeader>
                    <Row className="mx-0 mt-50" sm={12}>
                        <Col md={3}>
                            <Label className="form-label" for="subschool">
                                {t('Төлбөрийн төрөл')}
                            </Label>
                            <Controller
                                control={control}
                                defaultValue=''
                                name="school"
                                render={({ field: { value, onChange} }) => {
                                    return (
                                        <Select
                                            name="school"
                                            id="school"
                                            classNamePrefix='select'
                                            isClearable
                                            className='react-select'
                                            placeholder={t('-- Сонгоно уу --')}
                                            options={payment_type || []}
                                            value={payment_type.find((c) => c.id === paymentTypeId)}
                                            noOptionsMessage={() => t('Хоосон байна.')}
                                            onChange={(val) => {
                                                onChange(val?.id || '')
                                                setPaymentTypeId(val?.id || '')
                                            }}
                                            styles={ReactSelectStyles}
                                            getOptionValue={(option) => option.id}
                                            getOptionLabel={(option) => option.name}
                                        />
                                    )
                                }}
                            ></Controller>
                        </Col>
                    </Row>
                    <Row className='mt-1 d-flex justify-content-between mx-0 mb-1'>
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
                        <Col className='d-flex align-items-end mobile-datatable-search'>
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
                    <div className='react-dataTable react-dataTable-selectable-rows' id=''>
                        <DataTable
                            noHeader
                            pagination
                            paginationServer
                            className='react-dataTable'
                            progressPending={isTableLoading}
                            progressComponent={
                                <div className='my-2 d-flex align-items-center justify-content-center'>
                                    <Spinner className='me-1' color="" size='sm'/><h5>Түр хүлээнэ үү...</h5>
                                </div>
                            }
                            noDataComponent={(
                                <div className="my-2">
                                    <h5>{t('Өгөгдөл байхгүй байна')}</h5>
                                </div>
                            )}
                            onSort={handleSort}
                            sortIcon={<ChevronDown size={10} />}
                            columns={getColumns(currentPage, rowsPerPage, total_count)}
                            paginationPerPage={rowsPerPage}
                            paginationDefaultPage={currentPage}
                            paginationComponent={getPagination(handlePagination, currentPage, rowsPerPage, total_count)}
                            data={datas}
                            fixedHeader
                            fixedHeaderScrollHeight='62vh'
                            />
                    </div>
                </CardBody>
            </Card>
        </Fragment>
    )
}

export default TransactionList;
