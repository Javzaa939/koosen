import React, { Fragment, useState, useEffect } from 'react'

import { ChevronDown, Plus, Search } from 'react-feather'

import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader'

import {
    Row,
    CardHeader,
    Card,
    CardTitle,
    Button,
    Col,
    Input,
    Label,
    Spinner
} from 'reactstrap'

import DataTable from 'react-data-table-component'

import { useTranslation } from 'react-i18next'

import classnames from 'classnames';

import Select from 'react-select'

import { getPagination, ReactSelectStyles, get_gender_list } from '@utils'

import { getColumns } from './helpers'

import Addmodal from './Add'

import EditModal from './Edit'

const Rooms = () => {

    const { t } = useTranslation()

    const default_page = [10, 15, 50, 75, 100]

    const [datas, setDatas] = useState([])

    const [currentPage, setCurrentPage] = useState(1)
    const [rowsPerPage, setRowsPerPage] = useState(10)
    const [searchValue, setSearchValue] = useState("")
    const [sortField, setSortField] = useState('')
    const [edit_id, setEditId] = useState('')
    const [roomtype_id, setRoomTypeId] = useState('')
    const [gender_id, setGenderId] = useState('')
    const [roomTypeOption, setRoomTypeOption] = useState([])
    const [gender_option, setGenderOption] = useState(get_gender_list())

    // Нийт датаны тоо
    const [total_count, setTotalCount] = useState(1)

    // Loader
    const { isLoading, fetchData } = useLoader({})
    const { isLoading: isTableLoading, fetchData: allFetch } = useLoader({isFullScreen: false})

    // Modal
	const [modal, setModal] = useState(false);
    const [edit_modal, setEditModal] = useState(false)

    // Api
    const roomApi = useApi().dormitory.room
    const roomTypeApi = useApi().dormitory.type

    // Нэмэх функц
    const handleModal = () => {
        setModal(!modal)
    }

    // Засах функц
    const handleEditModal = (id) => {
        setEditId(id)
        setEditModal(!edit_modal)
    }

    async function getRoomType() {
        const { success, data } = await fetchData(roomTypeApi.getList())
        if(success) {
            setRoomTypeOption(data)
        }
    }

    useEffect(() => {
        getRoomType()
    },[])

    async function getDatas() {
        const { success, data } = await allFetch(roomApi.get(rowsPerPage, currentPage, sortField, searchValue, roomtype_id, gender_id))
        if(success) {
            setDatas(data?.results)
            setTotalCount(data?.count)
        }
    }

    // Устгах функц
    const handleDelete = async (delete_id) => {
        const { success } = await fetchData(roomApi.delete(delete_id))
        if(success) {
            getDatas()
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

    function handleSearch() {getDatas()}

    useEffect(() => {
		if (searchValue.length == 0) {
			getDatas();
		} else {
			const timeoutId = setTimeout(() => {
				getDatas();
			}, 600);

			return () => clearTimeout(timeoutId);
		}
	}, [currentPage, rowsPerPage, sortField, roomtype_id, gender_id, searchValue])

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

    return (
        <Fragment>
            <Card>
                <CardHeader className="flex-md-row flex-column align-md-items-center align-items-start border-bottom">
                    <CardTitle tag="h4">{t('Өрөөний бүртгэл')}</CardTitle>
                    <div className='d-flex flex-wrap mt-md-0 mt-1'>
                        <Button color='primary' onClick={() => handleModal()}>
                            <Plus size={15}/>
                            <span className='align-middle ms-50'>{t('Нэмэх')}</span>
                        </Button>
                    </div>
                </CardHeader>
                <Row className='px-1 my-50'>
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
                    <Col md={4}>
                        <Label>Хүйс</Label>
                        <Select
                            name="room_type"
                            id="room_type"
                            classNamePrefix='select'
                            isClearable
                            className={classnames('react-select')}
                            isLoading={isLoading}
                            placeholder={t('-- Сонгоно уу --')}
                            options={gender_option || []}
                            value={gender_option.find((c) => c.id === gender_id)}
                            noOptionsMessage={() => t('Хоосон байна')}
                            onChange={(val) => {
                                setGenderId(val?.id || '')
                            }}
                            styles={ReactSelectStyles}
                            getOptionValue={(option) => option.id}
                            getOptionLabel={(option) => option.name}
                        />
                    </Col>
                </Row>
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
                        columns={getColumns(currentPage, rowsPerPage, total_count, handleEditModal, handleDelete)}
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
                {modal && <Addmodal open={modal} handleModal={handleModal} refreshDatas={getDatas} />}
                {edit_modal && <EditModal open={edit_modal} handleEdit={handleEditModal} editId={edit_id} refreshDatas={getDatas} />}
            </Card>
        </Fragment>
    )
}

export default Rooms
