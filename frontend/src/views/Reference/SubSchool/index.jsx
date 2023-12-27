// ** React Imports
import { Fragment, useState, useEffect, useContext} from 'react'

import { Row, Col, Card, Input, CardTitle, CardHeader, Spinner, Button} from 'reactstrap'

import { ChevronDown, Plus } from 'react-feather'
import DataTable from 'react-data-table-component'

import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';

import { getPagination } from '@utils';
import AuthContext from '@context/AuthContext'
import SchoolContext from '@context/SchoolContext'

import { getColumns } from './helpers';
import UpdateModal from "./Edit"
import AddModal from "./Add"


import { useTranslation } from "react-i18next";

const SubSchool = () => {

	const { user } = useContext(AuthContext)
	const { school_id } = useContext(SchoolContext)

    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10)

	const [searchValue, setSearchValue] = useState("");

	const [filteredData, setFilteredData] = useState([]);
	const [datas, setDatas] = useState([]);
	const { t } = useTranslation();
	console.log("seasrch", searchValue);

    // Нийт датаны тоо
    const [total_count, setTotalCount] = useState(1)

	// Loader
	const { Loader, isLoading, fetchData } = useLoader({});
	const { isLoading: isTableLoading, fetchData: allFetch } = useLoader({})

	// Modal
	const [edit_id, setEditId] = useState('')
	const [detailModalData, setDetailModalData ] = useState({})
	const [update_modal, setUpdateModal] = useState(false)
	const [add_modal, setAddModal]= useState(false)

	// Api
	const schoolApi = useApi().hrms.subschool

	/* Модал setState функц */
	const handleModal = () => {
		setAddModal(!add_modal)
	}


	/* Жагсаалтын дата авах функц */
	async function getDatas() {
		const { success, data } = await allFetch(schoolApi.get(searchValue))
		if(success) {
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

	async function firstLoad() {
		const { success, data } = await fetchData(schoolApi.get(searchValue))
		if(success) {
			setDatas(data)
			setTotalCount(data.length)
		}
	}

	// Хуудас анх ачааллах үед Fullscreen loader гаргаж ирэх функц, ганц л уншина

	useEffect(() => {
		firstLoad()
	}, [])

	// Засах функц
    function handleUpdateModal(id, data) {
        setEditId(id)
        setUpdateModal(!update_modal)
        setDetailModalData(data)
    }

	/* Устгах функц */
	async function handleDelete(id) {
		if (id){
			const { success } = await fetchData(schoolApi.delete(id))
			if(success)
			{
				getDatas()
			}
		}
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

	return (
		<Fragment>
			<Card>
			{isLoading && Loader}
				<CardHeader className="flex-md-row flex-column align-md-items-center align-items-start border-bottom">
					<CardTitle tag='h4'>{t('Бүрэлдэхүүн сургууль')}</CardTitle>
                    <div className='d-flex flex-wrap mt-md-0 mt-1'>
						<Button
                            color='primary'
                            disabled={Object.keys(user).length > 0  ? false : true}

                            onClick={() => handleModal()}>
                            <Plus size={15} />
                            <span className='align-middle ms-50'>{t('Нэмэх')}</span>
                        </Button>
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
					<div className="react-dataTable react-dataTable-selectable-rows" id="datatableLeftTwoRightOne">
						<DataTable
                            noHeader
                            pagination
                            className='react-dataTable'
							progressPending={isTableLoading}
							progressComponent={
								<div className='my-2 d-flex align-items-center justify-content-center'>
									<Spinner className='me-1' size='sm'/><h5>Түр хүлээнэ үү...</h5>
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
			</Card>
			{ update_modal && <UpdateModal editId={edit_id} open={update_modal} handleEdit={handleUpdateModal} refreshDatas={getDatas} datas={detailModalData}/> }
			{ add_modal && <AddModal open={add_modal} handleModal={handleModal} refreshDatas={getDatas}/>}
        </Fragment>
    )
}

export default SubSchool;
