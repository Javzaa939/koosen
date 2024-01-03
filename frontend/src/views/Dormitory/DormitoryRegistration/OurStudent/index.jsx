import React, {useState, useEffect, Fragment } from 'react'

import {Col, Row, Card, CardHeader, CardTitle, Input, Label, Button, Spinner} from 'reactstrap'

import { Search, ChevronDown } from 'react-feather';

import { Controller, useForm } from 'react-hook-form'

import useApi from '@hooks/useApi';

import useLoader from '@hooks/useLoader';

import Select from 'react-select'

import { useTranslation } from 'react-i18next';

import DataTable from 'react-data-table-component'

import { getPagination, ReactSelectStyles, get_solved_type } from '@utils'

import classnames from "classnames";

import { getColumns } from './helpers';

import SolveModal from './Modal';

import Detail from './Detail';
import AddModal from './Add';

const OurStudent = () => {

    // var values = {
	// 	subschool_id: '',
	// 	class_id: ''
	// }

    const { t } = useTranslation()

    const { Loader, isLoading, fetchData } = useLoader({isFullScreen: false})
    const { isLoading: isTableLoading, fetchData: allFetch } = useLoader({isFullScreen: false})

    const [currentPage, setCurrentPage] = useState(1)

    const default_page = [10, 15, 50, 75, 100]

    const [rowsPerPage, setRowsPerPage] = useState(10)

    const [searchValue, setSearchValue] = useState('');

    const [datas, setDatas] = useState([])

    const [sortField, setSort] = useState('')

    const [modal_open, setModalOpen] = useState(false)

    const [req_id, setReqId] = useState('')

    const [is_view, setView] = useState(false)

    const [total_count, setTotalCount] = useState(1)

    const [subschool, setSubSchoolData] = useState([]);

    const [group_option, setGroup] = useState([])

    const [school_id, setSchoolId] = useState('')

    const [class_id, setClassId] = useState('')

    const [ detailModalOpen, setDetailModalOpen ] = useState(false)
    const [ detailModalData, setDetailModalData ] = useState({})
    const [roomOption, setRoomOption] = useState([])
    const [roomTypeOption, setRoomTypeOption] = useState([])
    const [room_id, setRoomId] = useState('')
    const [roomtype_id, setRoomTypeId] = useState('')
    const solved_type = get_solved_type(true)
    const [solvedId, setSolvedId] = useState('')
    const [amodal, setAmodal] = useState(false);

    // ** Hook
    const { control, setValue, formState: { errors } } = useForm({});

    // Api
    const dormitoryReqApi = useApi().dormitory.request
    const subSchoolApi = useApi().hrms.subschool
    const groupApi = useApi().student.group
    const roomApi = useApi().dormitory.room
    const roomTypeApi = useApi().dormitory.type

    async function getRoom() {
        const { success, data } = await fetchData(roomApi.getList(roomtype_id))
        if(success) {
            setRoomOption(data)
        }
    }

    async function getRoomType() {
        const { success, data } = await fetchData(roomTypeApi.getList())
        if(success) {
            setRoomTypeOption(data)
        }
    }

	/* Сургуулийн жагсаалт */
	async function getSubSchoolOption() {
		const { success, data } = await fetchData(subSchoolApi.get())
		if (success) {
			setSubSchoolData(data)
		}
	}

    // Ангийн жагсаалт
    async function getGroup() {
        const { success, data } = await fetchData(groupApi.getList())
        if(success) {
            setGroup(data)
        }
    }

    async function getDatas() {
        const { success, data } = await allFetch(dormitoryReqApi.get(rowsPerPage, currentPage, sortField, searchValue, school_id, class_id, roomtype_id, room_id, solvedId))
        if(success) {
            setDatas(data?.results)
            setTotalCount(data?.count)
        }
    }

    useEffect(() => {
        getRoom()
    },[roomtype_id])

    useEffect(() => {
        getRoomType()
        getSubSchoolOption()
        getGroup()
    },[])

    useEffect(() => {
        getDatas()
    },[rowsPerPage, currentPage, sortField, school_id, class_id, roomtype_id, room_id, solvedId])

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

    // Хүсэлт шийдвэрлэх
    async function handleRequestSolved(id) {
        setModalOpen(!modal_open)
        setReqId(id)
        setView(false)
    }

    // Хүсэлт харах
    async function handleViewModal(id, data) {
        setReqId(id)
        setView(true)
        setDetailModalOpen(!detailModalOpen)
		setDetailModalData(data)
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
    function handleAddModal(){
        setAmodal(!amodal);
    }

    return (
        <Fragment>
            <Card>
            {Loader && isLoading}
                <CardHeader className='flex-md-row flex-column align-md-items-center align-items-start border-bottom pt-0'>
                    <CardTitle className='d-flex justify-content-between w-100 flex-wrap' tag="h4" >
                                {t('Дотуур байранд амьдрах хүсэлт')}
                            <div className='d-flex justify-content-end'>
                                <Button color='primary' onClick={handleAddModal}>
                                    Бүртгэх
                                </Button>
                            </div>
                    </CardTitle>
                </CardHeader>
                    <Row className="mx-0 mt-50" sm={12}>
                        <Col md={3}>
                            <Label className="form-label" for="subschool">
                                {t('Сургууль')}
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
                                            options={subschool || []}
                                            value={subschool.find((c) => c.id === value)}
                                            noOptionsMessage={() => t('Хоосон байна.')}
                                            onChange={(val) => {
                                                onChange(val?.id || '')
                                                setSchoolId(val?.id || '')
                                            }}
                                            styles={ReactSelectStyles}
                                            getOptionValue={(option) => option.id}
                                            getOptionLabel={(option) => option.name}
                                        />
                                    )
                                }}
                            ></Controller>
                        </Col>
                        <Col md={3}>
                            <Label className="form-label" for="group">
                                {t('Анги')}
                            </Label>
                            <Controller
                                control={control}
                                defaultValue=''
                                name="group"
                                render={({ field: { value, onChange} }) => {
                                    return (
                                        <Select
                                            name="group"
                                            id="group"
                                            classNamePrefix='select'
                                            isClearable
                                            className={classnames('react-select', { 'is-invalid': errors.class })}
                                            isLoading={isLoading}
                                            placeholder={t('-- Сонгоно уу --')}
                                            options={group_option || []}
                                            value={value && group_option.find((c) => c.confirm_year === value)}
                                            noOptionsMessage={() => t('Хоосон байна.')}
                                            onChange={(val) => {
                                                onChange(val?.id || '')
											    setClassId(val?.id || '')
                                            }}
                                            styles={ReactSelectStyles}
                                            getOptionValue={(option) => option.id}
                                            getOptionLabel={(option) => option.name}
                                        />
                                    )
                                }}
                            ></Controller>
                        </Col>
                        <Col md={3}>
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
                        <Col md={3}>
                            <Label>Өрөө</Label>
                            <Select
                                name="room_type"
                                id="room_type"
                                classNamePrefix='select'
                                isClearable
                                className={classnames('react-select')}
                                isLoading={isLoading}
                                placeholder={t('-- Сонгоно уу --')}
                                options={roomOption || []}
                                value={roomOption.find((c) => c.id === room_id)}
                                noOptionsMessage={() => t('Хоосон байна')}
                                onChange={(val) => {
                                    setRoomId(val?.id || '')
                                }}
                                styles={ReactSelectStyles}
                                getOptionValue={(option) => option.id}
                                getOptionLabel={(option) => option.room_number}
                            />
                        </Col>
                        <Col md={4} className='mt-1'>
                            <Label>Шийдвэрийн төрөл</Label>
                            <Select
                                name="solved_flag"
                                id="solved_flag"
                                classNamePrefix='select'
                                isClearable
                                className={classnames('react-select', { 'is-invalid': errors.solved_flag })}
                                isLoading={isLoading}
                                placeholder={t(`-- Сонгоно уу --`)}
                                options={solved_type || []}
                                value={solved_type.find((c) => c.id === solvedId)}
                                noOptionsMessage={() => t('Хоосон байна')}
                                onChange={(val) => {
                                    setSolvedId(val?.id || '')
                                }}
                                styles={ReactSelectStyles}
                                getOptionValue={(option) => option.id}
                                getOptionLabel={(option) => option.name}
                            />
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
                                className='dataTable-filter mb-50 mt-1'
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
                    <div className='react-dataTable react-dataTable-selectable-rows' id='datatableLeftTwoRightOne'>
                        <DataTable
                            noHeader
                            pagination
                            paginationServer
                            className='react-dataTable'
							progressPending={isTableLoading}
							progressComponent={
								<div className='my-2 d-flex align-items-center justify-content-center'>
									<Spinner className='me-1' color={window.localStorage.skin === '"dark"' ? 'white' : 'dark'} size='sm'/><h5>Түр хүлээнэ үү...</h5>
								</div>
							}
							noDataComponent={(
								<div className="my-2">
									<h5>{t('Өгөгдөл байхгүй байна')}</h5>
								</div>
							)}
                            onSort={handleSort}
                            sortIcon={<ChevronDown size={10} />}
                            columns={getColumns(currentPage, rowsPerPage, total_count, handleRequestSolved, handleViewModal)}
                            paginationPerPage={rowsPerPage}
                            paginationDefaultPage={currentPage}
                            paginationComponent={getPagination(handlePagination, currentPage, rowsPerPage, total_count)}
                            data={datas}
                            fixedHeader
                            fixedHeaderScrollHeight='62vh'
                            />
                    </div>
                { modal_open && <SolveModal request_id={req_id} isOpen={modal_open} handleModal={handleRequestSolved} refreshDatas={getDatas} is_view={is_view} /> }
                { detailModalOpen && <Detail isOpen={detailModalOpen} handleModal={handleViewModal} datas={detailModalData} /> }
                { <AddModal isOpen={amodal} refreshDatas={getDatas} handleModal={handleAddModal} />}
            </Card>
        </Fragment>
    )
}

export default OurStudent;
