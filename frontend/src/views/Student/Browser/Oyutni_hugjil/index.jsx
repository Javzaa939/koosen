import { t } from "i18next"
import { Fragment, useState, useContext, useEffect } from "react"
import DataTable from "react-data-table-component"
import { ChevronDown, Search, Plus } from "react-feather"
import { Card, CardHeader, CardTitle, Col, Modal, Row, Input, Label, Button, Spinner } from "reactstrap"
import { getPagination } from '@utils'
import AuthContext from '@context/AuthContext'
import SchoolContext from '@context/SchoolContext'
import useApi from "@hooks/useApi"
import useLoader from '@hooks/useLoader';

import Createmodal from './Add'
import { getColumns } from './helpers'
// import EditModal from './Edit'

// import Detail from './Detail'

const Oyutni_hugjil = () => {

     // Loader
    const { Loader, isLoading, fetchData } = useLoader({isFullScreen: true})
    const { isLoading: isTableLoading, fetchData: allFetch } = useLoader({isFullScreen: true})

    //Context
    const { user } = useContext(AuthContext)
    const { school_id } = useContext(SchoolContext)
    const [edit_modal, setEditModal] = useState(false)

    const [edit_id, setEditID] = useState('')

    //useState
    const [currentPage, setCurrentPage] = useState(1);
    const [total_count, setTotalCount] = useState(1)
    const [rowsPerPage, setRowsPerPage] = useState(10)
    const [datas, setDatas] = useState([])
    const [modal, setModal] = useState(false);
    const [searchValue, setSearchValue] = useState("");
    const [sortField, setSort] = useState('')
    const [ detailModalOpen, setDetailModalOpen ] = useState(false)
    const [ detailModalData, setDetailModalData ] = useState({})

    const stipendApi = useApi().stipend.register

    async function getDatas() {
        const page_count = Math.ceil(total_count / rowsPerPage)

        if (page_count < currentPage && page_count != 0) {
            setCurrentPage(page_count)
        }
        const { success, data } = await allFetch(stipendApi.get(rowsPerPage, currentPage, sortField, searchValue))
        if (success) {
            setTotalCount(data?.count)
            setDatas(data?.results)
        }
    }

    useEffect(() => {
        getDatas()
    }, [sortField, currentPage, rowsPerPage])

    /* Модал setState функц */
	const handleModal = () => {
		setModal(!modal)
	}

    // Дэлгэрэнгүй харах хэсэг
	async function handleRequestDetail(id, data)
    {
		setDetailModalOpen(!detailModalOpen)
		setDetailModalData(data)
	}

    /* Устгах функц */
	const handleDelete = async(id) => {
        const { success } = await fetchData(stipendApi.delete(id))
        if(success)
        {
            getDatas()
        }
	};

    const handleFilter = e => {
        const value = e.target.value.trimStart();
        setSearchValue(value)
    }

    async function handleEditModal(id) {
        setEditModal(!edit_modal)
        setEditID(id)
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

    // Хайх товч дарсан үед ажиллах функц
    async function handleSearch() {
        getDatas()
    }

    // Function to handle per page
    function handlePerPage(e) {
        setRowsPerPage(parseInt(e.target.value))
    }

    // Нийт датаны тоо
    const default_page = [10, 15, 50, 75, 100]

     // Хуудас солих үед ажиллах хэсэг
	function handlePagination(page) {
		setCurrentPage(page.selected + 1);
	};

    // ** Function to handle per page
    function handlePerPage(e) {
        setRowsPerPage(parseInt(e.target.value))
    }


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
                    <CardTitle tag="h4">{t('Оюутны хөгжил')}</CardTitle>
                    <div className='d-flex flex-wrap mt-md-0 mt-1'>
                        <Button
                            color='primary'
                            onClick={() => handleModal()}
                            // disabled={Object.keys(user).length > 0 && user.permissions.includes('lms-stipend-create') ? false : true}
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
                <div className="react-dataTable react-dataTable-selectable-rows">
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
                                <h5>{t('Өгөгдөл байхгүй байна')}</h5>
                            </div>
                        )}
                        onSort={handleSort}
                        columns={getColumns(currentPage, rowsPerPage, total_count, handleRequestDetail, handleEditModal, handleDelete, user)}
                        sortIcon={<ChevronDown size={10} />}
                        paginationPerPage={rowsPerPage}
                        paginationDefaultPage={currentPage}
                        data={datas}
                        paginationComponent={getPagination(handlePagination, currentPage, rowsPerPage, total_count)}
                        fixedHeader
                        fixedHeaderScrollHeight='62vh'
                    />
                </div>
            </Card>
            {modal && <Createmodal open={modal} handleModal={handleModal} refreshDatas={getDatas}/>}
            {/* { detailModalOpen && <Detail isOpen={detailModalOpen} handleModal={handleRequestDetail} datas={detailModalData} /> }
            {edit_modal && <EditModal open={edit_modal} handleEdit={handleEditModal} edit_id={edit_id} refreshDatas={getDatas}/>} */}
        </Fragment>
    )
}
export default Oyutni_hugjil