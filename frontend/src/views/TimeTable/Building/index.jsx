// ** React Imports
import { Fragment, useState, useEffect, useContext } from 'react'

import { Row, Col, Card, Input, Label, Button, CardTitle, CardHeader, Spinner } from 'reactstrap'

import { ChevronDown, Plus } from 'react-feather'

import DataTable from 'react-data-table-component'

import { useTranslation } from 'react-i18next'

import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';
import AuthContext from "@context/AuthContext"

import { getPagination } from '@utils'

import { getColumns } from './helpers'

import Addmodal from './Add/index.jsx'

const Learning = () => {

	const { t } = useTranslation()
	const { user } = useContext(AuthContext)

    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10)

	const [searchValue, setSearchValue] = useState("");

	const [filteredData, setFilteredData] = useState([]);
	const [datas, setDatas] = useState([]);
	const [editId, setEditId] = useState(null);

    // Нийт датаны тоо
    const [total_count, setTotalCount] = useState(datas.length || 1)

	// Loader
	const { isLoading, fetchData } = useLoader({});

	// Api
	const buildingApi = useApi().timetable.building

	// Modal
	const [modal, setModal] = useState(false);

	/* Модал setState функц */
	const handleModal = (id) => {
		if(id){
			setEditId(id);
		}
		setModal(!modal)
	}

	/* Устгах функц */
	const handleDelete = async(id) => {
		const { success } = await fetchData(buildingApi.delete(id))
		if(success) {
			getDatas()
		}
	};

	/* Жагсаалтын дата авах функц */
	async function getDatas() {
		const { success, data } = await fetchData(buildingApi.get())
		if(success) {
			setDatas(data)
			setTotalCount(data.length)
		}
	}

	useEffect(() => {
		getDatas()
	},[])

	// Хайлт хийх үед ажиллах хэсэг
	const handleFilter = (e) => {
		var updatedData = [];
		const value = e.target.value.trimStart();

		setSearchValue(value);

		if (value.length) {
			updatedData = datas.filter((item) => {
				const startsWith =
					item.code.toString().toLowerCase().startsWith(value.toString().toLowerCase()) ||
					item.name.toString().toLowerCase().startsWith(value.toString().toLowerCase())

				const includes =
					item.code.toString().toLowerCase().includes(value.toString().toLowerCase()) ||
					item.name.toString().toLowerCase().includes(value.toString().toLowerCase())

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


	return (
		<Fragment>
			<Card>
				<CardHeader className="flex-md-row flex-column align-md-items-center align-items-start border-bottom">
					<CardTitle tag="h4">{t('Хичээлийн байр')}</CardTitle>
                    <div className='d-flex flex-wrap mt-md-0 mt-1'>
                        <Button color='primary' disabled={Object.keys(user).length > 0 && user.permissions.includes('lms-timetable-building-create')? false : true} onClick={() => {setEditId(null), handleModal()}}>
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
					<div className="react-dataTable react-dataTable-selectable-rows">
						<DataTable
                            noHeader
                            pagination
                            className='react-dataTable'
                            progressPending={isLoading}
                            progressComponent={(
                                <div className='my-2'>
                                    <h5>{t('Түр хүлээнэ үү')}...</h5>
                                </div>
                            )}
                            noDataComponent={(
                                <div className="my-2">
                                    <h5>{t('Өгөгдөл байхгүй байна')}</h5>
                                </div>
                            )}
                            columns={getColumns(currentPage, rowsPerPage, searchValue.length ? filteredData : datas, handleDelete, user, handleModal)}
                            sortIcon={<ChevronDown size={10} />}
                            paginationPerPage={rowsPerPage}
                            paginationDefaultPage={currentPage}
                            data={searchValue.length ? filteredData : datas}
                            paginationComponent={getPagination(handlePagination, currentPage, rowsPerPage, total_count, searchValue, filteredData)}
                            fixedHeader
                            fixedHeaderScrollHeight='62vh'
                        />
					</div>
				{modal && <Addmodal open={modal} handleModal={handleModal} refreshDatas={getDatas} editId={editId}/>}
			</Card>
        </Fragment>
    )
}

export default Learning;
