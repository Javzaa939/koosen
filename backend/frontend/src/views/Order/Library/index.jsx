import { Fragment, useEffect, useState } from 'react';

import { Col, Row, Card, CardHeader, CardTitle, Input, Label, Button, Spinner } from 'reactstrap'

import { Search, ChevronDown } from 'react-feather';

import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';

import { useTranslation } from 'react-i18next';

import DataTable from 'react-data-table-component'

import Select from 'react-select'
import classnames from 'classnames'

import { getPagination, ReactSelectStyles, order_flag_datas } from '@utils'

import { getColumns } from './helpers';

import Detail from './Detail';

const Library = () => {
    const { t } = useTranslation()

    const { isLoading, fetchData } = useLoader({isFullScreen: true})
    const { isLoading: isTableLoading, fetchData: allFetch } = useLoader({isFullScreen: true})

    const default_page = [10, 15, 50, 75, 100]

    const [currentPage, setCurrentPage] = useState(1)
    const [rowsPerPage, setRowsPerPage] = useState(10)
    const [searchValue, setSearchValue] = useState('');
    const [datas, setDatas] = useState([])
    const [sortField, setSort] = useState('')
    const [total_count, setTotalCount] = useState(1)
    const [room_option, setRoomOption] = useState([])
    const [room_id, setRoomId] = useState('')
    const [is_today, setToday] = useState(false)
    const [flag_id, setFlagId] = useState('')

    const [ detailModalOpen, setDetailModalOpen ] = useState(false)
    const [ detailModalData, setDetailModalData ] = useState({})

    // Api
    const libraryApi = useApi().order.library
    const roomApi = useApi().timetable.room

    async function getRooms() {
		// Төрлөөс хамаарч өрөөний жагсаалтын авна (room_type = 5-Номын сан)
		const room_type = 5
        const { success, data } = await fetchData(roomApi.getList(room_type))
        if(success) {
            setRoomOption(data)
        }
    }

    useEffect(() => {
        getRooms()
    },[])

    const handleFilter = e => {
        const value = e.target.value.trimStart();
		setSearchValue(value)
	}

    function handlePerPage(e) {
        setRowsPerPage(parseInt(e.target.value))
    }

    async function getDatas() {
        const { success, data } = await allFetch(libraryApi.get(rowsPerPage, currentPage, sortField, searchValue, room_id, is_today, flag_id))
        if(success) {
            setDatas(data?.results)
            setTotalCount(data?.count)
        }
    }

    useEffect(() => {
        getDatas()
    },[rowsPerPage, currentPage, sortField, room_id, is_today, flag_id])

    // Дэлгэрэнгүй харах хэсэг
	async function handleRequestDetail(id, data)
    {
		setDetailModalOpen(!detailModalOpen)
		setDetailModalData(data)
	}

    function handleSearch() {
            getDatas()
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
                <CardHeader className='flex-md-row flex-column align-md-items-center align-items-start border-bottom'>
                    <CardTitle tag='h5'>{t('Захиалгын түүх')}</CardTitle>
                </CardHeader>
                <Row className='mt-1 mx-0'>
                    <Col md={4}>
                        <Label className='form-label' for='room'>
                            Номын сан
                        </Label>
                        <Select
                            name="room"
                            id="room"
                            classNamePrefix='select'
                            isClearable
                            className={classnames('react-select')}
                            placeholder={t(`-- Сонгоно уу --`)}
                            options={room_option || []}
                            value={room_option.find((c) => c.id === room_id)}
                            noOptionsMessage={() => t('Хоосон байна.')}
                            onChange={(val) => {
                                setRoomId(val?.id || '')
                            }}
                            isSearchable={true}
                            styles={ReactSelectStyles}
                            getOptionValue={(option) => option.id}
                            getOptionLabel={(option) => option.full_name}
                        />
                    </Col>
                    <Col md={4}>
                        <Label>Төлөв</Label>
                        <Select
                            name="lesson_year"
                            id="lesson_year"
                            classNamePrefix='select'
                            isClearable
                            className={classnames('react-select')}
                            isLoading={isLoading}
                            placeholder={t('-- Сонгоно уу --')}
                            options={order_flag_datas || []}
                            value={order_flag_datas.find((c) => c.id === flag_id)}
                            noOptionsMessage={() => t('Хоосон байна')}
                            onChange={(val) => {
                                setFlagId(val?.id || '')
                            }}
                            styles={ReactSelectStyles}
                            getOptionValue={(option) => option.id}
                            getOptionLabel={(option) => option.name}
                        />
                    </Col>
                    <Col md={4} className="datatable-search-text d-flex justify-content-start mt-2">
                        <Input type="checkbox" onClick={(e) => setToday(e.target.checked)} />
                        <Label className="ms-50 mt-15 checkbox-wrapper " for="is_today">
                            {t('Өнөөдрөөр харах')}
                        </Label>
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
                <div className='react-dataTable react-dataTable-selectable-rows'>
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
                        columns={getColumns(currentPage, rowsPerPage, total_count, handleRequestDetail)}
                        paginationPerPage={rowsPerPage}
                        paginationDefaultPage={currentPage}
                        paginationComponent={getPagination(handlePagination, currentPage, rowsPerPage, total_count)}
                        data={datas}
                        fixedHeader
                        fixedHeaderScrollHeight='62vh'
                    />
                </div>
            </Card>
            { detailModalOpen && <Detail isOpen={detailModalOpen} handleModal={handleRequestDetail} datas={detailModalData} /> }
        </Fragment>
    )
};

export default Library;
