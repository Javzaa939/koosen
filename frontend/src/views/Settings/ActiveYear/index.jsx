// ** React Imports
import { Fragment, useState, useEffect, useContext } from 'react'

import { Row, Col, Card, Input, Label, Button, CardTitle, CardHeader, Spinner, FormFeedback } from 'reactstrap'

import { ChevronDown, Plus } from 'react-feather'

import { useTranslation } from 'react-i18next'

import DataTable from 'react-data-table-component'

import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';
import AuthContext from "@context/AuthContext"

import { getPagination } from '@utils'

import { getColumns } from './helpers'

import Addmodal from './Add'

const Score = () => {

	const { t } = useTranslation()
	const { user } = useContext(AuthContext)

    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10)

	const [searchValue, setSearchValue] = useState("");

	const [filteredData, setFilteredData] = useState([]);
	const [datas, setDatas] = useState([]);
    const [edit_id, setEditId] = useState('')

    // Нийт датаны тоо
    const [total_count, setTotalCount] = useState(datas.length || 1)

	// Loader
	const { isLoading, fetchData } = useLoader({});

	// Modal
	const [modal, setModal] = useState(false);

	/* Модал setState функц */
	const handleModal = () => {
		setModal(!modal)
		if(modal){
			setEditId()
		}
	}

	// Засах функц
    function handleUpdateModal(id) {
        setEditId(id)
		handleModal()
    }

	const activeyearApi = useApi().settings.activeyear

	/* Жагсаалтын дата авах функц */
	async function getDatas() {
		const {success, data} = await fetchData(activeyearApi.get())
		if(success) {
			setDatas(data)
		}
	}

	// Хайлт хийх үед ажиллах хэсэг
	const handleFilter = (e) => {
		var updatedData = [];
		const value = e.target.value.trimStart();

		setSearchValue(value);

		if (value.length) {
			updatedData = datas.filter((item) => {
				const startsWith =
					item?.active_lesson_year?.toString().toLowerCase().startsWith(value.toString().toLowerCase()) ||
					item?.active_lesson_name?.toLowerCase().startsWith(value.toLowerCase()) ||
					item?.start_date?.toString().toLowerCase().startsWith(value.toString().toLowerCase()) ||
					item?.finish_date?.toString().toLowerCase().startsWith(value.toString().toLowerCase())||
					item?.prev_lesson_year?.toString().toLowerCase().startsWith(value.toString().toLowerCase()) ||
					item?.prev_lesson_name?.toLowerCase().startsWith(value.toLowerCase()) ||
					item?.active_season_name?.toLowerCase().startsWith(value.toLowerCase()) ||
					item?.prev_season_name?.toLowerCase().startsWith(value.toLowerCase())

				const includes =
					item?.active_lesson_year?.toString().toLowerCase().includes(value.toString().toLowerCase()) ||
					item?.active_lesson_name?.toLowerCase().includes(value.toLowerCase()) ||
                    item?.start_date?.toString().toLowerCase().includes(value.toString().toLowerCase()) ||
					item?.finish_date?.toString().toLowerCase().includes(value.toString().toLowerCase())||
					item?.prev_lesson_year?.toString().toLowerCase().includes(value.toString().toLowerCase()) ||
					item?.prev_lesson_name?.toLowerCase().includes(value.toLowerCase()) ||
					item?.active_season_name?.toLowerCase().includes(value.toLowerCase()) ||
					item?.prev_season_name?.toLowerCase().includes(value.toLowerCase())

				if (startsWith) {
					return startsWith;
				}
				else if (!startsWith && includes) {
					return includes;
				}
				else {
					return null;
				}
			});

			setFilteredData(updatedData);
			setSearchValue(value);
		}
	};

	// Хуудас солих үед ажиллах хэсэг
	const handlePagination = (page) => {
		setCurrentPage(page.selected + 1);
	};

	useEffect(()=>{
		getDatas()
	},[])

	async function handleUpdate(update_id, value) {
		let cdatas = {
			'season_type': value,
		}
		const { success, error } = await fetchData(activeyearApi.put(cdatas, update_id))
		if(success) {
			getDatas()
		}
	}

	async function handleDelete(id) {
		const { success } = await fetchData(activeyearApi.delete(id))
		if(success) {
			getDatas()
		}
	}

	return (
		<Fragment>
			<Card>
				<CardHeader className="flex-md-row flex-column align-md-items-center align-items-start border-bottom">
					<CardTitle tag="h4">{t('Ажиллах жилийн тохиргоо')}</CardTitle>
                    <div className='d-flex flex-wrap mt-md-0 mt-1'>
                        <Button disabled={Object.keys(user).length > 0 && user.permissions.includes('lms-settings-аctiveyear-create') ? false : true} color='primary' onClick={() => handleModal()}>
                            <Plus size={15} />
                            <span className='align-middle ms-50'>{t('Нэмэх')}</span>
                        </Button>
                    </div>
                </CardHeader>
                <Row className="justify-content-between mx-0">
					<Col className="datatable-search-text d-flex justify-content-start mt-1" md={6} sm={6}>
						<Label className="me-1 search-filter-title pt-50" for="search-input">
							{t('Хайлт')}
						</Label>
						<Input
							className="dataTable-filter mb-50"
							type="text"
							bsSize="sm"
							id="search-input"
							value={searchValue}
							onChange={handleFilter}
							placeholder={t('Хайх үг....')}
						/>
					</Col>
				</Row>
				{isLoading ?
					<div className="my-2 text-center" sm={12}>
						<Spinner size='sm' />
						<span className='ms-50'>{t('Түр хүлээнэ үү')}...</span>
					</div>
				:
					<div className="react-dataTable react-dataTable-selectable-rows" id='datatableLeftTwoRightOne'>
						<DataTable
                            noHeader
                            pagination
                            className='react-dataTable'
                            noDataComponent={(
                                <div className="my-2">
                                    <h5>{t('Өгөгдөл байхгүй байна')}</h5>
                                </div>
                            )}
                            columns={getColumns(currentPage, rowsPerPage, searchValue.length ? filteredData : datas, handleUpdateModal, user, handleDelete, handleUpdate)}
                            sortIcon={<ChevronDown size={10} />}
                            paginationPerPage={rowsPerPage}
                            paginationDefaultPage={currentPage}
                            data={searchValue.length ? filteredData : datas}
                            paginationComponent={getPagination(handlePagination, currentPage, rowsPerPage, total_count, searchValue, filteredData)}
                            fixedHeader
                            fixedHeaderScrollHeight='62vh'
                        />
					</div>
				}
				{modal && <Addmodal open={modal} handleModal={handleModal} refreshDatas={getDatas} editId={edit_id}/>}
			</Card>
        </Fragment>
    )
}

export default Score;
