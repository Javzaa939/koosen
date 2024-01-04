import { Fragment, useState, useContext, useEffect } from "react"

import { t } from "i18next"

import DataTable from "react-data-table-component"

import { ChevronDown, Search, Plus, AlertCircle } from "react-feather"

import { Card, CardHeader, CardTitle, Col, Row, Input, Label, Button, Spinner, Badge } from "reactstrap"

import { getPagination } from '@utils'
import { getColumns } from './helpers'

import AuthContext from '@context/AuthContext'

import useApi from "@hooks/useApi"
import useLoader from '@hooks/useLoader';

import AddQuestion from "./Add"

const Question = () => {

    // Loader
    const { Loader, isLoading, fetchData } = useLoader({isFullScreen: false})
    const { isLoading: isTableLoading, fetchData: allFetch } = useLoader({isFullScreen: false})

    //Context
    const { user } = useContext(AuthContext)
    // const { school_id } = useContext(SchoolContext)

    const [editData, setEditData] = useState({})

    const [datas, setDatas] = useState([])

    //useState
    const [currentPage, setCurrentPage] = useState(1);
    const [total_count, setTotalCount] = useState(1)
    const [rowsPerPage, setRowsPerPage] = useState(10)

    const [modal, setModal] = useState(false);

    const [searchValue, setSearchValue] = useState("");

    const [sortField, setSort] = useState('')

    const evaluationApi = useApi().evaluation.register

    async function getDatas() {
        const page_count = Math.ceil(total_count / rowsPerPage)

        if (page_count < currentPage && page_count != 0) {
            setCurrentPage(page_count)
        }

        const { success, data } = await allFetch(evaluationApi.get(rowsPerPage, currentPage, sortField, searchValue))
        if (success) {
            setDatas(data?.results)
            setTotalCount(data?.count)
        }
    }

    useEffect(
        () =>
        {
            getDatas()
        },
        [sortField, currentPage, rowsPerPage]
    )

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

    /* Модал setState функц */
	const handleModal = () => {
        setEditData({})
		setModal(!modal)
	}

    /* Устгах функц */
	const handleDelete = async(id) => {
        const { success } = await fetchData(evaluationApi.delete(id))
        if(success)
        {
            getDatas()
        }
	};

    const handleFilter = e => {
        const value = e.target.value.trimStart();
        setSearchValue(value)
    }

    async function handleEditModal(data) {
        setModal(!modal)
        setEditData(data)
    }

    // Хайх товч дарсан үед ажиллах функц
    async function handleSearch() {
        if (searchValue.length > 0) getDatas()
    }

    // Function to handle per page
    function handlePerPage(e) {
        setRowsPerPage(parseInt(e.target.value))
    }

    // Нийт датаны тоо
    const default_page = [10, 15, 50, 75, 100]

    function handlePagination(page) {
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
            {isLoading && Loader}
                <CardHeader className="flex-md-row flex-column align-md-items-center align-items-start border-bottom">
                    <CardTitle tag="h4">{t('Багшийн үнэлгээний асуулт')}</CardTitle>
                    <div className='d-flex flex-wrap mt-md-0 mt-1'>
                        <Button
                            color='primary'
                            onClick={() => handleModal()}
                            disabled={Object.keys(user).length > 0 && user.permissions.includes('lms-survey-question-create') ? false : true}
                        >
                            <Plus size={15} />
                            <span className='align-middle ms-50'>{t('Нэмэх')}</span>
                        </Button>
                    </div>
                </CardHeader>
                <Row className='mt-1 d-flex justify-content-between mx-0'>
                    <Col className='d-flex align-items-center justify-content-start '>
                        <Col md={2} sm={3} className='pe-1'>
                            <Input
                                className='dataTable-select me-1 mb-50'
                                type='select'
                                bsSize='sm'
                                style={{ height: "30px",}}
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
                    <Col className='d-flex align-items-center mobile-datatable-search'>
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
                <div className="react-dataTable react-dataTable-selectable-rows mx-1">
                    <DataTable
                        noHeader
                        paginationServer
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
                            {/* <Badge color="light-danger" className="p-1 rounded-5 text-wrap">
                                    <AlertCircle className="mx-1"/> Өгөгдөл байхгүй байна
                                </Badge> */}
                                <div className="my-2">
                                    <h5>{t('Өгөгдөл байхгүй байна')}</h5>
                                </div>
                            </div>
                        )}
                        onSort={handleSort}
                        columns={getColumns(currentPage, rowsPerPage, total_count, handleEditModal, handleDelete, user)}
                        sortIcon={<ChevronDown size={10} />}
                        data={datas}

                        paginationPerPage={rowsPerPage}
                        paginationDefaultPage={currentPage}
                        paginationComponent={getPagination(handlePagination, currentPage, rowsPerPage, total_count)}

                        fixedHeader
                        fixedHeaderScrollHeight='62vh'
                    />
                </div>
            </Card>
            {modal && <AddQuestion open={modal} handleModal={handleModal} refreshDatas={getDatas} editData={editData}/>}
        </Fragment>
    )
}
export default Question
