import React, { Fragment, useState, useContext, useEffect } from "react";

import { Col, Row, Card, CardHeader, CardTitle, Button, Input, Label, Spinner } from 'reactstrap'

import { useTranslation } from 'react-i18next'

import { ChevronDown, Plus, Search } from 'react-feather'

import { getColumns } from "../helpers";

import { getPagination, ReactSelectStyles } from '@utils'

import Select from 'react-select'
import classnames from "classnames";
import DataTable from "react-data-table-component";

import AuthContext from '@context/AuthContext'

import useLoader from '@hooks/useLoader'

import useApi from "@hooks/useApi"



const Profession = () => {

    const { user } = useContext(AuthContext)

    const { t } = useTranslation()

    const default_page = [10, 15, 50, 75, 100]
    const [datas, setDatas] = useState([])
    const [edit_id, setEditId] = useState('')

    const [state, setState] = useState('')

    // Modal
    const [modal, setModal] = useState(false);
    const [edit_modal, setEditModal] = useState(false)

    // Хуудаслалтын анхны утга
    const [currentPage, setCurrentPage] = useState(1)

    // Нэг хуудсанд харуулах нийт датаны тоо
    const [rowsPerPage, setRowsPerPage] = useState(10)

    // Хайлт хийхэд ажиллах хувьсагч
    const [searchValue, setSearchValue] = useState('')

    // Нийт датаны тоо
    const [total_count, setTotalCount] = useState(1)

    // Эрэмбэлэлт
    const [sortField, setSortField] = useState('')

    const [profOption, setProfession] = useState([])

    // Хөтөлбөрөөр хайлт хийх
    const [profession_id, setProfession_id] = useState('')

    const [adm, setAdm] = useState('')
    const [admop, setAdmop] = useState([])

    // Loader
    const { Loader, isLoading, fetchData } = useLoader({ isFullScreen: false })
    const { isLoading: isTableLoading, fetchData: allFetch } = useLoader({ isFullScreen: false })

    // Хуудас солих үед ажиллах хэсэг
    const handlePagination = (page) => {
        setCurrentPage(page.selected + 1);
    };

    // Хайлт хийх үед ажиллах хэсэг
    const handleFilter = e => {
        const value = e.target.value.trimStart();
        setSearchValue(value)
    }

    // API
    const newsApi = useApi().elselt.log
    const professionApi = useApi().elselt.profession
    const admissionYearApi = useApi().elselt

    async function getDatas() {
        const { success, data } = await allFetch(newsApi.get(rowsPerPage, currentPage, sortField, searchValue, state, adm, profession_id))
        if (success) {
            setDatas(data?.results)
            setTotalCount(data?.count)

            console.log(data)
        }
    }

    async function getProfession() {
        const { success, data } = await allFetch(professionApi.getList(adm))
        if (success) {
            setProfession(data)
        }
    }

    async function getAdmissionYear() {
        const { success, data } = await fetchData(admissionYearApi.getAll())
        if (success) {
            setAdmop(data)
        }
    }


    useEffect(() => {
        getDatas(),
            getProfession(),
            getAdmissionYear()
    }, [])

    useEffect(() => {
        if (searchValue.length == 0) {
            getDatas();
        } else {
            const timeoutId = setTimeout(() => {
                getDatas();
            }, 600);

            return () => clearTimeout(timeoutId);
        }
    }, [searchValue, profession_id, adm]);

    function handleSearch() {
        getDatas()
    }

    function handleSort(column, sort) {
        if (sort === 'asc') {
            setSortField(column.header)
        } else {
            setSortField('-' + column.header)
        }
    }

    function handlePerPage(e) {
        setRowsPerPage(parseInt(e.target.value))
    }

    function refreshDatas() {
        getDatas()
    }

    return (
        <Fragment>
            {Loader && isLoading}
            <Card>
                <Row>
                    <Col sm={6} lg={3} >
                        <Label className="form-label" for="lesson_year">
                            {t('Элсэлт')}
                        </Label>
                        <Select
                            name="lesson_year"
                            id="lesson_year"
                            classNamePrefix='select'
                            isClearable
                            className={classnames('react-select')}
                            isLoading={isLoading}
                            placeholder={t('-- Сонгоно уу --')}
                            options={admop || []}
                            value={admop.find((c) => c.id === adm)}
                            noOptionsMessage={() => t('Хоосон байна.')}
                            onChange={(val) => {
                                setAdm(val?.id || '')
                            }}
                            styles={ReactSelectStyles}
                            getOptionValue={(option) => option.id}
                            getOptionLabel={(option) => option.lesson_year + ' ' + option.name}
                        />
                    </Col>
                    <Col sm={6} lg={3} >
                        <Label className="form-label" for="profession">
                            {t('Хөтөлбөр')}
                        </Label>
                        <Select
                            name="profession"
                            id="profession"
                            classNamePrefix='select'
                            isClearable
                            className={classnames('react-select')}
                            isLoading={isLoading}
                            placeholder={t('-- Сонгоно уу --')}
                            options={profOption || []}
                            value={profOption.find((c) => c?.prof_id === profession_id)}
                            noOptionsMessage={() => t('Хоосон байна.')}
                            onChange={(val) => {
                                setProfession_id(val?.prof_id || '')
                            }}
                            styles={ReactSelectStyles}
                            getOptionValue={(option) => option?.prof_id}
                            getOptionLabel={(option) => option.name}
                        />
                    </Col>
                </Row>
                <Row className="justify-content-between mx-0 my-1" sm={12}>
                    <Col className='d-flex align-items-center justify-content-start' md={6} sm={12}>
                        <Col md={3} sm={4} xs={5} className='pe-1'>
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
                <div className='react-dataTable react-dataTable-selectable-rows mt-0'>
                    <DataTable
                        noHeader
                        pagination
                        className='react-dataTable'
                        progressPending={isTableLoading}
                        progressComponent={
                            <div className='my-1 d-flex align-items-center justify-content-center'>
                                <Spinner className='me-1' color="" size='sm' /><h5>Түр хүлээнэ үү...</h5>
                            </div>
                        }
                        noDataComponent={(
                            <div className="my-2">
                                <h5>{t('Өгөгдөл байхгүй байна')}</h5>
                            </div>
                        )}
                        columns={getColumns(currentPage, rowsPerPage, total_count, user)}
                        sortIcon={<ChevronDown size={10} />}
                        paginationPerPage={rowsPerPage}
                        paginationDefaultPage={currentPage}
                        data={datas}
                        onSort={handleSort}
                        paginationComponent={getPagination(handlePagination, currentPage, rowsPerPage, total_count)}
                        fixedHeader
                        fixedHeaderScrollHeight='62vh'
                    />
                </div>
            </Card>
        </Fragment>
    )
}

export default Profession
