import React, { Fragment, useState, useContext, useEffect } from "react";

import { Col, Row, Card, CardHeader, CardTitle, Button, Input, Label, Spinner } from 'reactstrap'

import { useTranslation } from 'react-i18next'

import { ChevronDown, Plus, Search } from 'react-feather'

import DataTable from "react-data-table-component";

import { getPagination, ReactSelectStyles } from '@utils'

import AuthContext from '@context/AuthContext'

import useLoader from '@hooks/useLoader'

import useApi from "@hooks/useApi"

import { getColumns } from "./helpers";

import Addmodal from "./Add";

import EditModal from "./Edit";
import { get } from "react-hook-form";

const News = () => {

    const { user } = useContext(AuthContext)

    const { t } = useTranslation()

    const default_page = [10, 15, 50, 75, 100]
    const [datas, setDatas] = useState([])
    const [edit_id, setEditId] = useState('')

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

    // Loader
    const { Loader, isLoading, fetchData } = useLoader({isFullScreen: false})
    const { isLoading: isTableLoading, fetchData: allFetch } = useLoader({isFullScreen: false})

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
    const newsApi = useApi().service.news

    async function getDatas() {
        const { success, data } = await allFetch(newsApi.get(rowsPerPage, currentPage, sortField, searchValue))
        if(success) {
            setDatas(data?.results)
            setTotalCount(data?.count)
        }
    }

    useEffect(() => {
        getDatas()
    },[sortField, currentPage, rowsPerPage])

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

    function handleSearch() {
        getDatas()
    }

    function handleSort(column, sort) {
        if(sort === 'asc') {
            setSortField(column.header)
        } else {
            setSortField('-' + column.header)
        }
    }

    function handlePerPage(e) {
        setRowsPerPage(parseInt(e.target.value))
    }

    // Нэмэх функц
    const handleModal = () => {
        setModal(!modal)
    }

    // Засах функц
    const handleEditModal = (id) => {
        setEditId(id)
        setEditModal(!edit_modal)
    }

    /* Устгах функц */
	const handleDelete = async(id) => {
		const { success } = await fetchData(newsApi.delete(id))
		if(success) {
			getDatas()
		}
	};

    function refreshDatas(){
        getDatas()
    }

    return (
        <Fragment>
            {Loader && isLoading}
            <Card>
                <CardHeader className="flex-md-row flex-column align-md-items-center align-items-start border-bottom">
                    <CardTitle tag="h4">{t('Мэдээ')}</CardTitle>
                <div className='d-flex flex-wrap mt-md-0 mt-1'>
                    <Button color='primary' disabled={Object.keys(user).length > 0 && user.permissions.includes('lms-service-news-create')? false : true} onClick={() => handleModal()}>
                        <Plus size={15}/>
                        <span className='align-middle ms-50'>{t('Нэмэх')}</span>
                    </Button>
                </div>
                </CardHeader>
                <Row className="justify-content-between mx-0 mb-1" sm={12}>
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
                <div className='react-dataTable react-dataTable-selectable-rows'>
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
                        columns={getColumns(currentPage, rowsPerPage, total_count, user, handleEditModal, handleDelete)}
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
                {modal && <Addmodal open={modal} handleModal={handleModal} refreshDatas={refreshDatas}/>}
                {edit_modal && <EditModal open={edit_modal} handleEdit={handleEditModal} refreshDatas={refreshDatas} edit_id={edit_id} />}
            </Card>
        </Fragment>
    )
}

export default News
