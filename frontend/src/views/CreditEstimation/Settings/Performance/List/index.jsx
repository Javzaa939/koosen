// ** React Imports
import { Fragment, useState, useEffect, useContext, memo } from 'react'

import {
    Col,
    Card,
    Input,
    Button,
    Spinner
} from 'reactstrap'

import { ChevronDown, Search, Plus } from 'react-feather'
import { useTranslation } from 'react-i18next'
import DataTable from 'react-data-table-component'

import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';

import AuthContext from '@context/AuthContext'

import { getPagination } from '@utils'

import { getColumns } from './helpers'

import { AddPerformancemodal } from '../Add'

const PerformanceList = ({ type }) => {

    const { user } = useContext(AuthContext)
    const { t } = useTranslation()

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

    // Эрэмбэлэлт
    const [sortField, setSort] = useState('')

    const { Loader, isLoading, fetchData } = useLoader({isFullScreen: false})
    const { isLoading: isTableLoading, fetchData: allFetch } = useLoader({isFullScreen: false})

    const [editData, setEditData] = useState({})

    // Api
    const performanceApi = useApi().credit.performance

    useEffect(() => {
        getDatas()
    }, [sortField, currentPage, type])

    async function getDatas() {

        const page_count = Math.ceil(total_count / rowsPerPage)

        if (page_count < currentPage && page_count != 0) {
            setCurrentPage(page_count)
        }

        const { success, data } = await allFetch(performanceApi.get(rowsPerPage, currentPage, searchValue))
        if (success) {
            setTotalCount(data?.count)
            setDatas(data?.results)
        }
    }

    /* Устгах функц */
	const handleDelete = async(id) => {
		const { success } = await fetchData(performanceApi.delete(id))
		if(success) {
			getDatas()
		}
	};

    const editModal = (data) => {
        setEditData(data)
        handleModal()
    }

    // ** Function to handle filter
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

    // Хайх товч дарсан үед ажиллах функц
    async function handleSearch() {
        if (searchValue.length > 0) getDatas()
    }

    // Хайлтийн хэсэг хоосон болох үед анхны датаг дуудна
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


    const handleModal = () => {
        setModal(!modal)
    }

    return (
        <Fragment>
            <Card>
                {isLoading && Loader}
                <div className='d-flex flex-wrap justify-content-end mt-md-0 mt-1'>
                    <Button
                        color='primary'
                        onClick={() => handleModal()}
                        disabled={Object.keys(user).length > 0 && user.permissions.includes('lms-stipend-create') ? false : true}
                    >
                        <Plus size={15} />
                        <span className='align-middle ms-50'>{t('Нэмэх')}</span>
                    </Button>
                </div>
                <Col className='d-flex align-items-center mt-1' md={6} sm={12}>
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
                        columns={getColumns(currentPage, rowsPerPage, total_count, editModal, handleDelete, user, type)}
                        paginationPerPage={rowsPerPage}
                        paginationDefaultPage={currentPage}
                        paginationComponent={getPagination(handlePagination, currentPage, rowsPerPage, total_count)}
                        data={datas}
                        fixedHeader
                        fixedHeaderScrollHeight='62vh'
                    />
                </div>
            </Card>
            {modal && <AddPerformancemodal open={modal} handleModal={handleModal} refreshDatas={getDatas} editData={editData}/>}
        </Fragment>
    )
}

export default memo(PerformanceList);

