/** Замын төлөвлөгөөний жагсаалт */

// ** React Imports
import { Fragment, useState, useEffect } from 'react'

// ** Reactstrap Imports
import {
    Row,
    Col,
    Card,
    Input,
    Label,
    Button,
    CardTitle,
    CardHeader,
    DropdownToggle,
    UncontrolledButtonDropdown
} from 'reactstrap'

import { useNavigate } from 'react-router-dom'

import { ChevronDown, Share, Plus, Search } from 'react-feather'

import DataTable from 'react-data-table-component'

import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';

import { getPagination } from '@utils'

import { getColumns } from './helpers'

import Addmodal from './Add'

const RoadPassport = () => {

    const usenavigate = useNavigate()

    const default_page = [10, 15, 50, 75, 100]
    const [modal, setModal] = useState(false)
    const [datas, setDatas] = useState([])

    // Хуудаслалтын анхны утга
    const [currentPage, setCurrentPage] = useState(1)

    // Нэг хуудсанд харуулах нийт датаны тоо
    const [rowsPerPage, setRowsPerPage] = useState(10)

    // Хайлт хийхэд ажиллах хувьсагч
    const [searchValue, setSearchValue] = useState('')

    // Нийт датаны тоо
    const [total_count, setTotalCount] = useState(1)

    // Сонгосон хуудасны дугаар
    const [pageSize, setPageSize] = useState(currentPage)

    // Эрэмбэлэлт
    const [sortField, setSort] = useState('')

    const { Loader, isLoading, fetchData } = useLoader({isFullScreen: true})

    //  API
	const userApi = useApi().user

    useEffect(() => {
        getDatas()
    }, [sortField, currentPage, rowsPerPage])

    async function getDatas() {
        var pageSize = currentPage
        const page_count = Math.ceil(total_count / rowsPerPage)

        // Хайлтын үр дүн байх үед хуудасны тоогоо өөрчлөх
        if (page_count > 0 && page_count < currentPage) {
            pageSize = page_count
        }

        setPageSize(pageSize)

        const { success, data, error } = await fetchData(userApi.get(rowsPerPage, pageSize, sortField, searchValue))
        if (success) {
            setTotalCount(data?.count)
            setDatas(data?.results)
        }
    }

    // ** Function to handle Modal toggle
    const handleModal = () => {
        setModal(!modal)
    }

    // ** Function to handle filter
    const handleFilter = e => {
        const value = e.target.value
        setSearchValue(value)
    }

    function handleSort(column, sort) {
        if(sort === 'asc') {
            setSort(column.header)
        } else {
            setSort('-' + column.header)
        }
    }

    // Хуудас солих үед ажиллах хэсэг
	function handlePagination(page) {
		setCurrentPage(page.selected + 1);
	};

    // ** Function to handle per page
    function handlePerPage(e) {
        setRowsPerPage(parseInt(e.target.value))
    }

    // Хайх товч дарсан үед ажиллах функц
    async function handleSearch() {
        if (searchValue.length > 0) getDatas()
    }

    // Хайлтийн хэсэг хоосон болох үед анхны датаг дуудна
    useEffect(
        () =>
        {
            if (!searchValue) {
                getDatas()
            }
        },
        [searchValue]
    )

    return (
        <Fragment>
            <Card>
                {isLoading && Loader}
                <CardHeader className='flex-md-row flex-column align-md-items-center align-items-start border-bottom'>
                <CardTitle tag='h4'>Хэрэглэгчийн бүртгэл</CardTitle>
                <div className='d-flex flex-wrap mt-md-0 mt-1'>
                    <UncontrolledButtonDropdown className='mobile-header-button me-1'>
                        <DropdownToggle color='secondary' caret outline>
                            <Share size={15} />
                            <span className='align-middle ms-50'>Excel</span>
                        </DropdownToggle>
                    </UncontrolledButtonDropdown>
                    <Button color='primary' onClick={() => handleModal(!Addmodal)}>
                        <Plus size={15} />
                        <span className='align-middle ms-50'>Нэмэх</span>
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
                            <Label for='sort-select'>Хуудсанд харуулах тоо</Label>
                        </Col>
                    </Col>
                    <Col className='d-flex align-items-center mobile-datatable-search mt-1' md={6} sm={12}>
                        <Input
                            className='dataTable-filter mb-50'
                            type='text'
                            bsSize='sm'
                            id='search-input'
                            placeholder="Хайх"
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
                        progressPending={isLoading}
                        progressComponent={<h5>Түр хүлээнэ үү...</h5>}
                        noDataComponent={(
                            <div className="my-2">
                                <h5>Өгөгдөл байхгүй байна.</h5>
                            </div>
                        )}
                        onSort={handleSort}
                        sortIcon={<ChevronDown size={10} />}
                        columns={getColumns(pageSize, rowsPerPage)}
                        paginationPerPage={rowsPerPage}
                        paginationDefaultPage={pageSize}
                        paginationComponent={getPagination(handlePagination, pageSize, rowsPerPage, total_count)}
                        data={datas}
                        fixedHeader
                        fixedHeaderScrollHeight='62vh'
                    />
                </div>
            </Card>
            {modal && <Addmodal open={modal} handleModal={handleModal} />}
        </Fragment>
    )
}

export default RoadPassport;
