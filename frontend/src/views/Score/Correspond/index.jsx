// ** React Imports
import { Fragment, useState, useEffect, useContext } from 'react'

import {
    Row,
    Col,
    Card,
    Input,
    Label,
    Button,
    CardTitle,
    CardHeader,
    Spinner,
} from 'reactstrap'

import { useTranslation } from 'react-i18next'
import { ChevronDown, Search, Plus } from 'react-feather'

import DataTable from 'react-data-table-component'
import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';
import useUpdateEffect from '@hooks/useUpdateEffect'
import AuthContext from '@context/AuthContext'
import SchoolContext from '@context/SchoolContext'
import { getPagination } from '@utils'
import { getColumns } from './helpers'

import EditModal from './Edit'
import Addmodal from './Add'

const Correspond = () => {

    const { t } = useTranslation()
    const { user } = useContext(AuthContext)
    const { school_id } = useContext(SchoolContext)
    const [edit_modal, setEditModal] = useState(false)
    const [modal, setModal] = useState(false)

    const { Loader, isLoading, fetchData } = useLoader({isFullScreen: false})
    const { isLoading: isTableLoading, fetchData: allFetch } = useLoader({isFullScreen: false})

    const default_page = [10, 15, 50, 75, 100]

    // Хуудаслалтын анхны утга
    const [currentPage, setCurrentPage] = useState(1)

    // Нэг хуудсанд харуулах нийт датаны тоо
    const [rowsPerPage, setRowsPerPage] = useState(10)

    // Хайлт хийхэд ажиллах хувьсагч
    const [searchValue, setSearchValue] = useState('')

    // Нийт датаны тоо
    const [total_count, setTotalCount] = useState(1)

    // Эрэмбэлэлт
    const [sortField, setSort] = useState('')

    const [datas, setDatas] = useState([])
    const [score_id, setScoreId] = useState('')

    // API
    const correspondApi = useApi().score.correspond

    // Дүйцүүлсэн дүн жагсаалт
    async function getDatas() {
        const { success, data } = await allFetch(correspondApi.get(rowsPerPage, currentPage, sortField, searchValue))
        if(success) {
            setDatas(data?.results)
            setTotalCount(data?.count)

        }
    }

    useEffect(() => {
        getDatas()
    },[sortField, currentPage, rowsPerPage, school_id])

    // Хайлт хийх үед ажиллах хэсэг
    const handleFilter = e => {
        const value = e.target.value.trimStart();
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
        getDatas()
    }

    // Хайлтийн хэсэг хоосон болох үед анхны датаг дуудна
	useUpdateEffect(() => {
		if (searchValue.length == 0) {
			getDatas();
		} else {
			const timeoutId = setTimeout(() => {
				getDatas();
			}, 600);

			return () => clearTimeout(timeoutId);
		}
	}, [searchValue]);


    /* Устгах функц */
    const handleDelete = async(id) => {
        const { success, data } = await fetchData(correspondApi.delete(id))
        if(success)
        {
            getDatas()
        }
    };

    // ** Function to handle Modal toggle
    const handleModal = () => {
        setModal(!modal)
    }

    const handleEdit = () => {
        setEditModal(!edit_modal)
    }

    async function handleEditModal(score_id) {
        handleEdit()
        setScoreId(score_id)
    }

    return (
        <Fragment>
            <Card>
                {isLoading && Loader}
                <CardHeader className='flex-md-row flex-column align-md-items-center align-items-start border-bottom'>
                <CardTitle tag='h4'>{t('Дүйцүүлсэн дүнгийн бүртгэл')}</CardTitle>
                <div className='d-flex flex-wrap mt-md-0 mt-1'>
                     <Button
                        color='primary'
                        disabled={Object.keys(user).length > 0 && (user.permissions.includes('lms-score-correspond-create') && school_id)  ? false : true}
                        onClick={() => handleModal()}
                    >
                        <Plus size={15} />
                        <span className='align-middle ms-50'>{t('Нэмэх')}</span>
                    </Button>
                </div>
                </CardHeader>
                <Row className='justify-content-between mx-0 mt-1'>
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
                            <Label for='sort-select'>{t('Хуудсанд харуулах тоо')}</Label>
                        </Col>
                    </Col>
                    <Col className='d-flex align-items-center mobile-datatable-search mt-1' md={6} sm={12}>
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
                        columns={getColumns(currentPage, rowsPerPage, total_count, handleDelete, handleEditModal, user)}
                        paginationPerPage={rowsPerPage}
                        paginationDefaultPage={currentPage}
                        paginationComponent={getPagination(handlePagination, currentPage, rowsPerPage, total_count, user)}
                        data={datas}
                        fixedHeader
                        fixedHeaderScrollHeight='62vh'
                    />
                </div>
            </Card>
            {modal && <Addmodal open={modal} handleModal={handleModal} refreshDatas={getDatas} />}
            {edit_modal && <EditModal open={edit_modal} handleEdit={handleEdit} refreshDatas={getDatas} scoreId={score_id} />}
        </Fragment>
    )
};

export default Correspond;
