import React, { Fragment, useState, useEffect, useContext } from 'react'

import { ChevronDown, Plus, Search } from 'react-feather'

import { Card, CardHeader, CardTitle, Button, Row, Col, Input, Label, Spinner } from 'reactstrap'

import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader'
import ActiveYearContext from "@context/ActiveYearContext"

import DataTable from 'react-data-table-component'

import { useTranslation } from 'react-i18next'

import classnames from 'classnames';

import Select from 'react-select'

import { getPagination, generateLessonYear, ReactSelectStyles } from '@utils'

import { getColumns } from './helpers'

import Addmodal from './Add'

import EditModal from './Edit'

const PaymentConfig = () => {

    const { t } = useTranslation()
    const { cyear_name } = useContext(ActiveYearContext)

    const default_page = [10, 15, 50, 75, 100]

    const [searchValue, setSearchValue] = useState("")

    const [datas, setDatas] = useState([])

    const [currentPage, setCurrentPage] = useState(1)

    const [rowsPerPage, setRowsPerPage] = useState(10)
    const [sortField, setSortField] = useState('')
    const [edit_id, setEditId] = useState('')
    const [roomtype_id, setRoomTypeId] = useState('')
    const [lesson_year, setLessonYear] = useState('')
    const [roomTypeOption, setRoomTypeOption] = useState([])
    const [year_option, setYearOption] = useState(generateLessonYear(5))

    // Modal
	const [modal, setModal] = useState(false);
    const [edit_modal, setEditModal] = useState(false)

    // Loader
    const { isLoading, fetchData } = useLoader({})
    const { isLoading: isTableLoading, fetchData: allFetch } = useLoader({isFullScreen: true})

    // Нийт датаны тоо
    const [total_count, setTotalCount] = useState(1)

    // Api
    const roomTypeApi = useApi().dormitory.type
    const paymentApi = useApi().dormitory.payment

    useEffect(() => {
		if (searchValue.length == 0) {
			getDatas();
		} else {
			const timeoutId = setTimeout(() => {
				getDatas();
			}, 600);

			return () => clearTimeout(timeoutId);
		}
	}, [searchValue,rowsPerPage, currentPage, sortField, roomtype_id, lesson_year])


    async function getDatas() {
        const { success, data } = await allFetch(paymentApi.get(rowsPerPage, currentPage, sortField, searchValue, roomtype_id, lesson_year))
        if(success) {
            setDatas(data?.results)
            setTotalCount(data?.count)
        }
    }

    useEffect(() => {
        getRoomType()
        const check_active_year = year_option.find(year => year.name === cyear_name)
        if(check_active_year) setLessonYear(check_active_year.name)
    },[])

    async function getRoomType() {
        const { success, data } = await fetchData(roomTypeApi.getList())
        if(success) {
            setRoomTypeOption(data)
        }
    }

    // Хуудас солих үед ажиллах хэсэг
	const handlePagination = (page) => {
		setCurrentPage(page.selected + 1);
	};

    // Хайлт хийх үед ажиллах хэсэг
    const handleFilter = e => {
        const value = e.target.value.trimStart();
		setSearchValue(value)
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

    function handleSearch() {
        getDatas()
    }

    function handleSort(column, sort) {
        if(sort === 'asc') {
            setSortField(column.sortField)
        } else {
            setSortField('-' + column.sortField)
        }
    }

    function handlePerPage(e) {
        setRowsPerPage(parseInt(e.target.value))
    }
    // Устгах функц
    const handleDelete = async (delete_id) => {
        const { success } = await fetchData(paymentApi.delete(delete_id))
        if(success) {
            getDatas()
        }
    }

    return (
        <Fragment>
            <Card>
                <CardHeader className="flex-md-row flex-column align-md-items-center align-items-start border-bottom">
                    <CardTitle tag="h4">{t('Оюутны байрны төлбөрийн тохиргоо')}</CardTitle>
                    <div className='d-flex flex-wrap mt-md-0 mt-1'>
                        <Button color='primary' onClick={() => handleModal()}>
                            <Plus size={15} />
                            <span className='align-middle ms-50'>{t('Нэмэх')}</span>
                        </Button>
                    </div>
                </CardHeader>
                <Row className='px-1 my-50'>
                    <Col md={4}>
                        <Label>Хичээлийн жил</Label>
                        <Select
                            name="lesson_year"
                            id="lesson_year"
                            classNamePrefix='select'
                            isClearable
                            className={classnames('react-select')}
                            isLoading={isLoading}
                            placeholder={t('-- Сонгоно уу --')}
                            options={year_option || []}
                            value={year_option.find((c) => c.id === lesson_year)}
                            noOptionsMessage={() => t('Хоосон байна')}
                            onChange={(val) => {
                                setLessonYear(val?.id || '')
                            }}
                            styles={ReactSelectStyles}
                            getOptionValue={(option) => option.id}
                            getOptionLabel={(option) => option.name}
                        />
                    </Col>
                    <Col md={4}>
                        <Label>Өрөөний төрөл</Label>
                        <Select
                            name="room_type"
                            id="room_type"
                            classNamePrefix='select'
                            isClearable
                            className={classnames('react-select')}
                            isLoading={isLoading}
                            placeholder={t('-- Сонгоно уу --')}
                            options={roomTypeOption || []}
                            value={roomTypeOption.find((c) => c.id === roomtype_id)}
                            noOptionsMessage={() => t('Хоосон байна')}
                            onChange={(val) => {
                                setRoomTypeId(val?.id || '')
                            }}
                            styles={ReactSelectStyles}
                            getOptionValue={(option) => option.id}
                            getOptionLabel={(option) => option.name}
                        />
                    </Col>
                </Row>
                <Row className="justify-content-between mx-0 mb-1" sm={12}>
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
                        columns={getColumns(currentPage, rowsPerPage, total_count, handleEditModal, handleDelete)}
                        onSort={handleSort}
                        sortIcon={<ChevronDown size={10} />}
                        paginationPerPage={rowsPerPage}
                        paginationDefaultPage={currentPage}
                        data={datas}
                        paginationComponent={getPagination(handlePagination, currentPage, rowsPerPage, total_count)}
                        fixedHeader
                        fixedHeaderScrollHeight='62vh'
                    />
                </div>
                {modal && <Addmodal open={modal} handleModal={handleModal} refreshDatas={getDatas} />}
                {edit_modal && <EditModal open={edit_modal} handleEdit={handleEditModal} editId={edit_id} refreshDatas={getDatas} />}
            </Card>
        </Fragment>

    )
}

export default PaymentConfig
