
import { Fragment, useState, useEffect } from 'react'

import { Row, Col, Card, Input, Label, Button, CardTitle, CardHeader, Spinner } from 'reactstrap'

import { useTranslation } from 'react-i18next'

import { ChevronDown, Plus } from 'react-feather'

import DataTable from 'react-data-table-component'

import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';
import  useUpdateEffect  from '@hooks/useUpdateEffect'

import { getPagination } from '@utils'

import { getColumns } from './helpers'
import PermissionModal from './modal'


const default_page = [10, 15, 50, 75, 100]

export default function Permission()
{
    const { t } = useTranslation()

    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10)

	const [searchValue, setSearchValue] = useState("");

	const [datas, setDatas] = useState([]);
    const [editValue, setEditValue] = useState(null)

    // Нийт датаны тоо
    const [total_count, setTotalCount] = useState(0)

	// Loader
	const { isLoading, fetchData } = useLoader({});

    // Эрэмбэлэлт
    const [sortField, setSort] = useState('')

	// Api
    const permissionApi = useApi().settings.permission

	// Modal
	const [modal, setModal] = useState(false);

    useUpdateEffect(
        function()
        {
            getDatas()
        },
        [sortField, currentPage, rowsPerPage]
    )

    async function getDatas()
    {
        const { success, data } = await fetchData(permissionApi.get(rowsPerPage, currentPage, sortField, searchValue))
        if(success)
        {
            setTotalCount(data?.count)
            setDatas(data?.results)
        }
    }

    useEffect(
        function()
        {
            getDatas()
        },
        []
    )


	// Хайх
    const handleSearch = e => setSearchValue(e.target.value.trimStart());

    // Шүүлт
    const handleSort = (column, sort) => setSort(sort === 'asc' ? column.header : `-${column.header}`);

    // Хуудас солих үед ажиллах хэсэг
	const handlePagination = (page) => setCurrentPage(page.selected + 1);

    // Хуудсанд харагдах тоог солих
    const handlePerPage = (e) => setRowsPerPage(parseInt(e.target.value))


    const handleModal = () => setModal(!modal)

    /** Засах дарах үе */
    function handleUpdateModal(row)
    {
        setEditValue(row)
        handleModal()
    }

    /** Нэмэх дарах үе */
    function handleCreateModal()
    {
        setEditValue(null)
        handleModal()
    }

    /** Устгах дарах үе */
    async function handleDeleteModal(id)
    {
        const { success } = await fetchData(permissionApi.delete(id))
        if(success)
        {
            getDatas()
        }
    }


    // Хайлтийн хэсэг хоосон болох үед анхны датаг дуудна
	useUpdateEffect(
        function()
        {
            /** Хайж байгаад бүх утгаа устгавал хүлээлгүй шууд хүсэлт шиднэ */
            if (searchValue.length == 0)
            {
                getDatas();
            }
            /** 0.6 с дотор утга өөрчлөгдвөл хүсэлт шидэхгүй */
            else
            {
                const timeoutId = setTimeout(
                    function()
                    {
                        getDatas();
                    },
                    600
                );

                return () => clearTimeout(timeoutId);
            }
	    },
        [searchValue]
    );

    return (
        <Fragment>
            <Card>
                <CardHeader className="flex-md-row align-items-center flex-column align-md-items-center align-items-start border-bottom">
					<CardTitle tag="h4">{t('Эрхүүд -н жагсаалт')}</CardTitle>
                    <div className='d-flex flex-wrap mt-md-0 mt-1'>
                        <Button
							color='primary'
							onClick={() => handleCreateModal()}
						>
                            <Plus size={15} />
                            <span className='align-middle ms-50'>{t('Нэмэх')}</span>
                        </Button>
                    </div>
                </CardHeader>
                <Row className="d-flex align-items-center justify-content-between mx-0">
                    <Col className='d-flex align-items-center justify-content-start' md={6} sm={12}>
                        <Col md={2} sm={3} className='pe-1'>
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
                                    ))
                                }
                            </Input>
                        </Col>
                        <Col md={10} sm={3}>
                            <Label for='sort-select'>{t('Хуудсанд харуулах тоо')}</Label>
                        </Col>
                    </Col>
					<Col className="d-flex align-items-center mobile-datatable-search mt-25" md={6} sm={12}>
						<Label className="me-1 search-filter-title" for="search-input">
							{t('Хайлт')}
						</Label>
						<Input
							className="dataTable-filter mb-50"
							type="text"
							bsSize="sm"
							id="search-input"
							value={searchValue}
							onChange={handleSearch}
							placeholder={t('Хайх үг....')}
						/>
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
                    <div className="react-dataTable react-dataTable-selectable-rows">
                        <DataTable
                            noHeader
                            pagination
                            paginationServer
                            className='react-dataTable'
                            progressPending={isLoading}
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
                            columns={getColumns(currentPage, rowsPerPage, total_count, handleUpdateModal, handleDeleteModal)}
                            paginationPerPage={rowsPerPage}
                            paginationDefaultPage={currentPage}
                            paginationComponent={getPagination(handlePagination, currentPage, rowsPerPage, total_count)}
                            data={datas}
                            fixedHeader
                            fixedHeaderScrollHeight='62vh'
                        />
                    </div>
                }
            </Card>

            <PermissionModal handleModal={handleModal} open={modal} refreshDatas={getDatas} editValue={editValue} />
        </Fragment>
    )
}
