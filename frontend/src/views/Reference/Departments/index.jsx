// ** React Imports
import { Fragment, useState, useEffect, useContext} from 'react'

import { Row, Col, Card, Input, CardTitle, CardHeader, Spinner, Button, Label } from 'reactstrap'

import { ChevronDown, Plus} from 'react-feather'

import DataTable from 'react-data-table-component'

import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';
import AuthContext from '@context/AuthContext'
import SchoolContext from '@context/SchoolContext'
import { getPagination } from '@utils';

import { getColumns } from './helpers';
import UpdateModal from "./Edit"
import AddModal from "./Add"


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

	const { user } = useContext(AuthContext)
	const { school_id } = useContext(SchoolContext)

	// Modal
    const [update_modal, setUpdateModal] = useState(false)
    const [add_modal, setAddModal] = useState(false)

	// Loader
	const { Loader, isLoading, fetchData } = useLoader({})
	const { isLoading: isTableLoading, fetchData: allFetch } = useLoader({})

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
	}, [searchValue, school_id]);

	// Засах функц
    function handleUpdateModal(id, data) {
        setEditId(id)
        setUpdateModal(!update_modal)
        setDetailModalData(data)
    }
	// Нэмэх функц
	const handleModal = () =>
	{
        setAddModal(!add_modal)
    }

	/* Устгах функц */
	async function handleDelete (id) {
		if (id){
			const { success } = await fetchData(departmentsApi.delete(id))
			if(success)
			{
				getDatas()
			}
		}
	};

	// Хайлт хийх үед ажиллах хэсэг
	const handleFilter = e => {
        const value = e.target.value.trimStart();
        setSearchValue(value)
    }

	// Хуудас солих үед ажиллах хэсэг
	const handlePagination = (page) => {
		setCurrentPage(page.selected + 1);
	};

	return (
		<Fragment>
			{isLoading && Loader}
			<Card>
				<CardHeader className="flex-md-row flex-column align-md-items-center align-items-start border-bottom">
					<CardTitle tag="h4">{t('Тэнхим')}</CardTitle>
					<div className='d-flex flex-wrap mt-md-0 mt-1'>
						<Button
                            color='primary'
                            disabled={Object.keys(user).length > 0 && school_id ?  false : true}
                            onClick={() => handleModal()}>
                            <Plus size={15} />
                            <span className='align-middle ms-50'>{t('Нэмэх')}</span>
                        </Button>
					</div>
				</CardHeader>
				<Col className="mx-1 mt-1" md={3} sm={6}>
					<Label>Хайлт</Label>
					<Input
						className=" mb-50"
						type="text"
						bsSize="sm"
						id="search-input"
						value={searchValue}
						onChange={handleFilter}
						placeholder={t('Хайх...')}
					/>
				</Col>
				{isLoading ?
					<div className="my-2 text-center" sm={12}>
						<Spinner size='sm' />
						<span className='ms-50'>{t('Түр хүлээнэ үү...')}</span>
					</div>
					:
					<div className="react-dataTable react-dataTable-selectable-rows mx-1" id="datatableLeftTwoRightOne">
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
							columns={getColumns(currentPage, rowsPerPage, searchValue.length ? filteredData : datas, handleUpdateModal, handleDelete)}
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
			{ add_modal && <AddModal open={add_modal} handleModal={handleModal} refreshDatas={getDatas} /> }

		</Fragment>
	)
}

export default Departments;
