import {
    Col,
    Row,
    Card,
    Input,
    Label,
    Button,
    CardTitle,
    CardHeader,
    Spinner
} from 'reactstrap'

import useApi from '@hooks/useApi';
import { getPagination } from '@utils'
import useLoader from '@hooks/useLoader';
import { useTranslation } from 'react-i18next'
import { ChevronDown ,Search} from "react-feather"
import { Fragment, useState, useEffect } from "react"
import DataTable from 'react-data-table-component'

import UpdateModal from "./Update"
import { getColumns } from './helpers'

const RequestRegister = () => {
    const { t } = useTranslation()

    // Modal
    const [update_modal, setUpdateModal] = useState(false)

    //useState
    const [edit_id, setEditId] = useState('')
    const [ detailModalData, setDetailModalData ] = useState({})
    const [sortField, setSortField] = useState('')
    const [datas, setDatas] = useState([])
    const [searchValue, setSearchValue] = useState('');

    const default_page = [10, 15, 50, 75, 100]
    const [is_view, setIsView] = useState(false)

    // Нийт датаны тоо
    const [total_count, setTotalCount] = useState(1)
    const [currentPage, setCurrentPage] = useState(1)
    const [rowsPerPage, setRowsPerPage] = useState(10)

    const { Loader, isLoading, fetchData } = useLoader({})
    const { isLoading: isTableLoading, fetchData: allFetch } = useLoader({isFullScreen: false})

    // Api
    const RequestVolunteerApi = useApi().request.volunteer

    async function getDatas() {
        const { success, data } = await allFetch(RequestVolunteerApi.get(rowsPerPage, currentPage, sortField, searchValue))
        if(success) {
            setDatas(data?.results)
            setTotalCount(data?.count)
        }
    }

    useEffect(
        () =>
        {
        getDatas()
        },
     [rowsPerPage, currentPage, sortField])

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
    function handleSearch() {
        setTimeout(() => {
            getDatas()
        }, 100)
    }
    // Засах функц
    function handleUpdateModal(id, view, data) {
        setEditId(id)
        setIsView(view)
        setUpdateModal(!update_modal)
        setDetailModalData(data)
    }

    function handlePerPage(e) {
        setRowsPerPage(parseInt(e.target.value))
    }
    // Хуудас солих үед ажиллах хэсэг
	function handlePagination(page) {
		setCurrentPage(page.selected + 1);
	};

    function handleSort(column, sorting) {
        if(sorting === 'asc') {
            setSortField(column.sortField)
        } else {
            setSortField('-' + column.sortField)
        }
    }

    return(
        <Fragment>
            <Card>
                {isLoading && Loader}
                <CardHeader className='flex-md-row flex-column align-md-items-center align-items-start border-bottom'>
                    <CardTitle tag='h4'>{t('Олон нийтийн ажилд оролцох хүсэлтийн шийдвэрлэх мэдээлэл')}</CardTitle>
                </CardHeader>
                <Row className="mt-1 d-flex justify-content-between mx-0 mb-1">
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
                    <Col className='d-flex align-items-end mobile-datatable-search mt-1'>
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
                <div className='react-dataTable react-dataTable-selectTable-rows' id="datatableLeftTwoRightOne">
                    <DataTable
                        noHeader
                        pagination
                        paginationServer
                        className='react-table'
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
                        sortIcon={<ChevronDown size={10} />}
                        columns={getColumns(currentPage, rowsPerPage, total_count, handleUpdateModal)}
                        paginationPerPage={rowsPerPage}
                        paginationDefaultPage={currentPage}
                        paginationComponent={getPagination(handlePagination, currentPage, rowsPerPage, total_count)}
                        data={datas}
                        onSort={handleSort}
                        fixedHeader
                        fixedHeaderScrollHeight='62vh'
                    />
                </div>
            </Card>
            { update_modal && <UpdateModal editId={edit_id} open={update_modal}  handleModal={handleUpdateModal} refreshDatas={getDatas} datas={detailModalData} is_view={is_view}/> }
        </Fragment>
    )

}
export default RequestRegister
