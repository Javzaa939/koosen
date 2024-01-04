import React, {useState, useEffect, Fragment } from 'react'

import {Col, Row, Card, Input, Label, Button, Spinner, CardTitle, CardHeader} from 'reactstrap'

import { Search, ChevronDown } from 'react-feather';

import useApi from '@hooks/useApi';

import useLoader from '@hooks/useLoader';

import { useTranslation } from 'react-i18next';

import DataTable from 'react-data-table-component'

import { getPagination } from '@utils'

import { getColumns } from './helpers';

import CModal from './Modal';

import Detail from './Detail'

import AddModal from './Add';

const RentStudent = ({ is_teacher }) => {

    const { t } = useTranslation()
    const {Loader, isLoading: isTableLoading, fetchData: allFetch } = useLoader({isFullScreen: false})

    const default_page = [10, 15, 50, 75, 100]

    const [currentPage, setCurrentPage] = useState(1)
    const [rowsPerPage, setRowsPerPage] = useState(10)
    const [searchValue, setSearchValue] = useState('');
    const [datas, setDatas] = useState([])
    const [sortField, setSort] = useState('')
    const [modal_open, setModalOpen] = useState(false)
    const [req_id, setReqId] = useState('')
    const [is_view, setView] = useState(false)
    const [total_count, setTotalCount] = useState(1)

    const [ detailModalOpen, setDetailModalOpen ] = useState(false)
    const [ detailModalData, setDetailModalData ] = useState({})

    // Api
    const dormitoryReqApi = useApi().dormitory.request.rent

    async function getDatas() {
        const { success, data } = await allFetch(dormitoryReqApi.get(rowsPerPage, currentPage, sortField, searchValue, is_teacher))
        if(success) {
            setDatas(data?.results)
            setTotalCount(data?.count)
        }
    }

    useEffect(() => {
        getDatas()
    },[rowsPerPage, currentPage, sortField, is_teacher])

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
        }, 100)
    }
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

    useEffect(() => {
        if(searchValue.length < 1) handleSearch()
    },[searchValue])

    const [amodal, setAmodal] = useState(false);
    const toggle = () => setAmodal(!amodal);

    return (
        <Fragment>
            <Card>
                {isTableLoading && Loader}
                <CardHeader className='flex-md-row flex-column align-md-items-center align-items-start border-bottom pt-0'>
                    <CardTitle tag="h4" className='d-flex justify-content-between w-100'>{t('Дотуур байранд амьдрах хүсэлт')}
                        <div className='d-flex justify-content-end'>
                            <Button color='primary' onClick={toggle}>
                                Бүртгэх
                            </Button>
                        </div>
                        <AddModal toggle={toggle} modal={amodal} is_teacher={is_teacher} refreshDatas={getDatas}/>
                    </CardTitle>
                </CardHeader>
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
                <div className='react-dataTable react-dataTable-selectable-rows' id='datatableLeftTwoRightOne'>
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
                        columns={getColumns(currentPage, rowsPerPage, total_count, handleRequestSolved, handleViewModal)}
                        paginationPerPage={rowsPerPage}
                        paginationDefaultPage={currentPage}
                        paginationComponent={getPagination(handlePagination, currentPage, rowsPerPage, total_count)}
                        data={datas}
                        fixedHeader
                        fixedHeaderScrollHeight='62vh'
                    />
                </div>
                { modal_open && <CModal request_id={req_id} isOpen={modal_open} handleModal={handleRequestSolved} refreshDatas={getDatas} is_view={is_view} /> }
                { detailModalOpen && <Detail isOpen={detailModalOpen} handleModal={handleViewModal} datas={detailModalData} /> }
            </Card>
        </Fragment>
    )
}

export default RentStudent;
