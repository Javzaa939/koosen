import React, {useState, useEffect, Fragment } from 'react'

import {Col, Row, Card, Input, Label, Button, Spinner} from 'reactstrap'

import { Search } from 'react-feather';

import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';

import Select from 'react-select'

import classnames from 'classnames';

import { useTranslation } from 'react-i18next';

import { ReactSelectStyles } from '@utils'

import CTable from './helpers/Table';

const OurStudent = () => {

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

    const [currentPage, setCurrentPage] = useState(1)
    const [rowsPerPage, setRowsPerPage] = useState(10)
    const [searchValue, setSearchValue] = useState('');
    const [datas, setDatas] = useState([])
    const [sortField, setSort] = useState('')
    const [total_count, setTotalCount] = useState(1)
    const [subschool, setSubSchoolData] = useState([]);
    const [school_id, setSchoolId] = useState('')
    const [roomtype_id, setRoomTypeId] = useState('')
    const [room_id, setRoomId] = useState('')
    const [roomOption, setRoomOption] = useState([])
    const [roomTypeOption, setRoomTypeOption] = useState([])
    const [footer, setTotalValue] = useState(default_footer)

    // Нийт хуудасны тоо
    const [pageCount, setPageCount] = useState(1)

    // Api
    const dormitoryEstimateOurApi = useApi().dormitory.estimate.our
    const subSchoolApi = useApi().hrms.subschool
    const roomApi = useApi().dormitory.room
    const roomTypeApi = useApi().dormitory.type

    async function getRoomType() {
        const { success, data } = await fetchData(roomTypeApi.getList())
        if(success) {
            setRoomTypeOption(data)
        }
    }

    async function getRoom() {
        const { success, data } = await fetchData(roomApi.getList(roomtype_id))
        if(success) {
            setRoomOption(data)
        }
    }

	/* Сургуулийн жагсаалт */
	async function getSubSchoolOption() {
		const { success, data } = await fetchData(subSchoolApi.get())
		if (success) {
			setSubSchoolData(data)
		}
	}

    async function getDatas() {
        const { success, data } = await fetchData(dormitoryEstimateOurApi.get(rowsPerPage, currentPage, sortField, searchValue, school_id, roomtype_id, room_id))
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

    useEffect(() => {
        getDatas()
    },[rowsPerPage, currentPage, sortField, school_id, roomtype_id, room_id])

    useEffect(() => {
        getRoomType()
        getSubSchoolOption()
    },[])

    useEffect(() => {
        getRoom()
    },[roomtype_id])

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
                <hr />
                <Row className="mx-0 mt-50" sm={12}>
                    <Col md={4}>
                        <Label className="form-label" for="subschool">
                            {t('Сургууль')}
                        </Label>
                        <Select
                            name="school"
                            id="school"
                            classNamePrefix='select'
                            isClearable
                            className='react-select'
                            placeholder={t('-- Сонгоно уу --')}
                            options={subschool || []}
                            value={subschool.find((c) => c.id === school_id)}
                            noOptionsMessage={() => t('Хоосон байна.')}
                            onChange={(val) => {
                                setSchoolId(val?.id || '')
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
                    <Col md={4}>
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

export default OurStudent;
