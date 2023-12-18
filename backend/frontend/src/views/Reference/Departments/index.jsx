// ** React Imports
import { Fragment, useState, useEffect} from 'react'

import { Row, Col, Card, Input, CardTitle, CardHeader, Spinner, Button } from 'reactstrap'

import { ChevronDown, Search } from 'react-feather'

import DataTable from 'react-data-table-component'

import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';

import { getPagination } from '@utils';

import { getColumns } from './helpers';
import UpdateModal from "./Edit"

import { useTranslation } from "react-i18next";

const Departments = () => {

	const [currentPage, setCurrentPage] = useState(1);
	const [rowsPerPage, setRowsPerPage] = useState(10)

	const [searchValue, setSearchValue] = useState("");

	const [filteredData, setFilteredData] = useState([]);
	const [datas, setDatas] = useState([]);
	const { t } = useTranslation()

	// Нийт датаны тоо
	const [total_count, setTotalCount] = useState(1)
	const [edit_id, setEditId] = useState('')
    const [detailModalData, setDetailModalData ] = useState({})

	// Modal
    const [update_modal, setUpdateModal] = useState(false)
	// Loader
	const { Loader, isLoading, fetchData } = useLoader({isFullScreen: true, bg: 2})
	const { isLoading: isTableLoading, fetchData: allFetch } = useLoader({isFullScreen: true})

	// Api
	const departmentsApi = useApi().hrms.department

	/* Жагсаалтын дата авах функц */
	async function getDatas() {
		const { success, data } = await allFetch(departmentsApi.getRegister(searchValue))
		if (success) {
			setDatas(data)
			setTotalCount(data.length)
		}
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

	// Засах функц
    function handleUpdateModal(id, data) {
        setEditId(id)
        setUpdateModal(!update_modal)
        setDetailModalData(data)
    }


	// Хайлт хийх үед ажиллах хэсэг
	const handleFilter = e => {
        const value = e.target.value.trimStart();
        setSearchValue(value)
    }

	// Хуудас солих үед ажиллах хэсэг
	const handlePagination = (page) => {
		setCurrentPage(page.selected + 1);
	};

	// Хуудас анх ачааллах үед Fullscreen loader гаргаж ирэх функц, ганц л уншина
	async function firstLoad() {
		const { success, data } = await fetchData(departmentsApi.getRegister(searchValue))
		if(success) {
			setDatas(data)
			setTotalCount(data.length)
		}
	}

	useEffect(() => {
		firstLoad();
	}, [])

	return (
		<Fragment>
			{isLoading && Loader}
			<Card>
				<CardHeader className="flex-md-row flex-column align-md-items-center align-items-start border-bottom">
					<CardTitle tag="h4">{t('Хөтөлбөрийн баг')}</CardTitle>
					<div className='d-flex flex-wrap mt-md-0 mt-1'>
					</div>
				</CardHeader>
				<Row className="justify-content-between mx-0">
					<Col className="datatable-search-text d-flex justify-content-start mt-1" md={6} sm={6}>
						<Input
							className="dataTable-filter mb-50"
							type="text"
							bsSize="sm"
							id="search-input"
							value={searchValue}
							onChange={handleFilter}
							placeholder={t('Хайх')}
						/>
					</Col>
				</Row>
				{isLoading ?
					<div className="my-2 text-center" sm={12}>
						<Spinner size='sm' />
						<span className='ms-50'>{t('Түр хүлээнэ үү...')}</span>
					</div>
					:
					<div className="react-dataTable react-dataTable-selectable-rows" id="datatableLeftTwoRightOne">
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
							columns={getColumns(currentPage, rowsPerPage, searchValue.length ? filteredData : datas, handleUpdateModal)}
							sortIcon={<ChevronDown size={10} />}
							paginationPerPage={rowsPerPage}
							paginationDefaultPage={currentPage}
							data={datas}
							paginationComponent={getPagination(handlePagination, currentPage, rowsPerPage, total_count, searchValue, filteredData)}
							fixedHeader
							fixedHeaderScrollHeight='62vh'
						/>
					</div>
				}
			</Card>
			{ update_modal && <UpdateModal editId={edit_id} open={update_modal} handleEdit={handleUpdateModal} refreshDatas={getDatas} datas={detailModalData}/> }
		</Fragment>
	)
}

export default Departments;
