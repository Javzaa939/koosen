// ** React Imports
import { Fragment, useState, useEffect, useContext } from 'react'

import { Row, Col, Card, Input, Label,Button, CardTitle, CardHeader, Spinner } from 'reactstrap'

import { useTranslation } from 'react-i18next'

import { ChevronDown, Plus, Search} from 'react-feather'

import DataTable from 'react-data-table-component'

import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';
import AuthContext from "@context/AuthContext"
import SchoolContext from "@context/SchoolContext"
import ActiveYearContext from "@context/ActiveYearContext"
import { getPagination } from '@utils'

import { getColumns } from './helpers'
import EditModal from "./Edit"

import Addmodal from './Add'

const PaymentDiscount= () => {

	const { t } = useTranslation()
	var values = {
		student: '',
        discounttype: '',
    }
	const default_page = [10, 15, 50, 75, 100]

	const { user } = useContext(AuthContext)
    const { school_id } = useContext(SchoolContext)
    const { cyear_name,cseason_id } = useContext(ActiveYearContext)

    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10)

	const [searchValue, setSearchValue] = useState("");
	const [filteredData, setFilteredData] = useState([]);

    // Нийт датаны тоо
    const [total_count, setTotalCount] = useState(1)

	// Loader
    const { Loader, isLoading, fetchData } = useLoader({isFullScreen: false})
	const { isLoading: isTableLoading, fetchData: allFetch } = useLoader({isFullScreen: false})

	// Modal
    const [modal, setModal] = useState(false);

	const [edit_modal, setEditModal] = useState(false);
	const [datas, setDatas] = useState([]);
	const [sortField, setSort] = useState('')
	const [edit_pay_id, setEditId] = useState('')
	const [isClosedValue, setIsClosed] = useState('')

	// Api
	const paydiscountApi = useApi().payment.discount
	const closedApi = useApi().payment.seasonclosed

	/* Устгах функц */
	const handleDelete = async(id) => {
		const { success } = await fetchData(paydiscountApi.delete(id))
		if(success) {
			getDatas()
		}
	};

	// Сургалтын төлбөрийн улирлын хаалт хийгдсэн эсэх
	async function isClosed() {
		const { success, data } = await fetchData(closedApi.getIsClosed())
		if ( success ){
			setIsClosed(data)
		}
	}

	/* Жагсаалтын дата авах функц */
	async function getDatas() {
		const { success, data } = await allFetch(paydiscountApi.get(rowsPerPage, currentPage, sortField, searchValue))
		if(success) {
			setDatas(data?.results)
			setTotalCount(data?.count)
		}
	}

	async function handleEditModal(edit_id) {
		setEditId(edit_id)
        setEditModal(!edit_modal)
    }

	useEffect(() => {
		getDatas()
	},[rowsPerPage, currentPage, cyear_name,cseason_id, school_id])

	useEffect(() => {
		isClosed()
	},[])

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

	// Хайлт хийх үед ажиллах хэсэг
	const handleFilter = (e) => {
        const value = e.target.value.trimStart();
        setSearchValue(value);
    };

	// Хуудас солих үед ажиллах хэсэг
	const handlePagination = (page) => {
		setCurrentPage(page.selected + 1);
	};

	/* Нэмэх модал setState функц */
    const handleModal = () =>{
        setModal(!modal)
    }
	function handleEditModal(edit_id) {
        setEditId(edit_id)
        setEditModal(!edit_modal)
    }
	function handleSort(column, sort) {
        if(sort === 'asc') {
            setSort(column)
        } else {
            setSort('-' + column)
        }
    }


    // Хайх товч дарсан үед ажиллах функц
    async function handleSearch() {
        getDatas()
    }

	return (
		<Fragment>
			{
				isLoading &&
				<div className='suspense-loader'>
					<Spinner size='bg'/>
					<span className='ms-50'>{t('Түр хүлээнэ үү')}...</span>
				</div>
			}
			<Card>
			{isLoading && Loader}
                <CardHeader className="flex-md-row flex-column align-md-items-center align-items-start border-bottom">
					<CardTitle tag="h4">{t('Төлбөрийн хөнгөлөлт')}</CardTitle>
					<div className='d-flex flex-wrap mt-md-0 mt-1'>
                            <Button disabled={Object.keys(user).length > 0 && !isClosedValue &&school_id && user.permissions.includes('lms-payment-discount-create') ? false : true} color='primary' onClick={() => handleModal()}>
                                <Plus size={15} />
                                <span className='align-middle ms-50'>{t('Нэмэх')}</span>
                            </Button>
                        </div>
                </CardHeader>
                <Row className="justify-content-between mx-0">
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
				{isLoading ?
					<div className="my-2 text-center" sm={12}>
						<Spinner size='sm' />
						<span className='ms-50'>{t('Түр хүлээнэ үү')}...</span>
					</div>
				:
					<div className="react-dataTable react-dataTable-selectable-rows">
						<DataTable
                            noHeader
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
                            columns={getColumns(currentPage, rowsPerPage, searchValue.length ? filteredData : datas, handleEditModal,handleDelete, user, isClosedValue)}
                            sortIcon={<ChevronDown size={10} />}
							onSort={handleSort}
                            paginationPerPage={rowsPerPage}
                            paginationDefaultPage={currentPage}
                            data={searchValue.length ? filteredData : datas}
                            paginationComponent={getPagination(handlePagination, currentPage, rowsPerPage, total_count, searchValue)}
                            fixedHeader
                            fixedHeaderScrollHeight='62vh'
                        />
					</div>
				}
				{edit_modal && <EditModal editId={edit_pay_id} open={edit_modal} handleModal={handleEditModal} refreshDatas={getDatas} />}
				{modal && <Addmodal open={modal} handleModal={handleModal} refreshDatas={getDatas}  />}
			</Card>
        </Fragment>
    )
}

export default PaymentDiscount;

