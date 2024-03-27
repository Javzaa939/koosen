import React from 'react'
import { Fragment, useState, useEffect, useContext } from "react"

import { Row, Col, Card, Input, Label, Button, CardTitle, CardHeader, Spinner } from "reactstrap"

import { useTranslation } from "react-i18next"

import { ChevronDown, Plus, Search } from "react-feather"

import DataTable from "react-data-table-component"

import useApi from '@hooks/useApi';
import { useSkin } from "@hooks/useSkin"

import useLoader from '@hooks/useLoader';
import AuthContext from '@context/AuthContext'
import SchoolContext from '@context/SchoolContext'

import { getPagination } from '@utils'

import { getColumns,getExpandColumns} from "./helpers"

export function ExpandedComponent({ data }) {
    const { skin } = useSkin()
    const tableCustomStyles = {
        headCells: {
          style: {
            backgroundColor: skin == 'dark' ? '#343d5500' : "#9CD9F3"
          },
        },
    }

    return (
        <Card className='mb-0 rounded-0 border-bottom px-2'>
            <div className='react-dataTable react-dataTable-selectable-rows mt-1'>
                <DataTable
                    noHeader
                    className='react-dataTable'
                    noDataComponent={(
                        <div className="my-2">
                            <h5>{'Өгөгдөл байхгүй байна'}</h5>
                        </div>
                    )}
                    data={data?.datas}
                    columns={getExpandColumns()}
                    customStyles={tableCustomStyles}
                    fixedHeader
                    fixedHeaderScrollHeight='62vh'
                />
            </div>
        </Card>
    )
}


const Student = () => {

    const { t } = useTranslation()
    const { user } = useContext(AuthContext)
    const { school_id } = useContext(SchoolContext)

    // Эрэмбэлэлт
    const [sortField, setSort] = useState('')

    const default_page = [10, 15, 50, 75, 100]

    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10)

    const [searchValue, setSearchValue] = useState("");

    const [datas, setDatas] = useState([]);

    // нийт датаны тоо
    const [total_count, setTotalCount] = useState(datas.length || 1)

    // loader
    const { Loader, isLoading, fetchData } = useLoader({isFullScreen: true})
    const { isLoading: isTableLoading, fetchData: allFetch } = useLoader({isFullScreen: true})

    // Api
    const scienceApi = useApi().science

    // Modal
    const [modal, setModal] = useState(false);

    /* Нэмэх модал setState функц */
    const handleModal = () =>{
        setModal(!modal)
    }

    /* Жагсаалт дата авах функц */
    async function getDatas() {
        const { success, data } = await allFetch(scienceApi.student.get(rowsPerPage, currentPage, sortField, searchValue))
        if(success) {
            setDatas(data?.results)
            setTotalCount(data?.count)
        }
    }

    useEffect(() => {
        getDatas()
    }, [rowsPerPage, currentPage, sortField])

    function handleSort(column, sort) {
        if(sort === 'asc') {
            setSort(column.header)
        } else {
            setSort('-' + column.header)
        }
    }

    // Хайлт хийх үед ажиллах хэсэг
    const handleFilter = (e) => {
        const value = e.target.value.trimStart();
        setSearchValue(value);
    };

    // Хуудас солих үед ажиллах хэсэг
    const handlePagination = (page) => {
        setCurrentPage(page.selected + 1);
    };

    // ** Function to handle per page
    function handlePerPage(e) {
        setRowsPerPage(parseInt(e.target.value))
    }

    // Хайх товч дарсан үед ажиллах функц
    async function handleSearch() {
        if (searchValue.length > 2) getDatas()
    }

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

    return (
        <Fragment>
            <Card>
                {isLoading && Loader}
                <CardHeader className="flex-md-row flex-column align-md-items-center align-items-start border-bottom">
					<CardTitle tag="h4">{t('Оюутан удирдсан байдал жагсаалт')}</CardTitle>
                    <div className='d-flex flex-wrap mt-md-0 mt-1'>
                        <Button color='primary' disabled={user && Object.keys(user).length && user.permissions.includes('lms-timetable-exam-create')&& school_id ? false : true} onClick={() => handleModal()}>
                            <Plus size={15} />
                            <span className='align-middle ms-50'>{t('Нэмэх')}</span>
                        </Button>
                    </div>
                </CardHeader>
                <Row className='justify-content-between mx-0'>
                    <Col className='d-flex align-items-center justify-content-start mt-1' md={6} sm={12}>
                        <Col md={2} sm={3} className='pe-1'>
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
                        <Col md={10} sm={3}>
                            <Label for='sort-select'>{t('Хуудсанд харуулах тоо')}</Label>
                        </Col>
                    </Col>
                    <Col className='d-flex align-items-center mobile-datatable-search mt-1' md={6} sm={12}>
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
                    <div className="react-dataTable react-dataTable-selectable-rows">
                            <DataTable
                                noHeader
                                pagination
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
                                columns={getColumns(currentPage, rowsPerPage, total_count)}
                                sortIcon={<ChevronDown size={10} />}
                                paginationPerPage={rowsPerPage}
                                paginationDefaultPage={currentPage}
                                data={datas}
                                paginationComponent={getPagination(handlePagination, currentPage, rowsPerPage, total_count)}
                                fixedHeader
                                fixedHeaderScrollHeight='62vh'
                                expandableRows
                                expandableRowsComponent={ExpandedComponent}
                            />
                        </div>
            </Card>
        </Fragment>
    )
}
export default Student;

