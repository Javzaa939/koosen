// ** React Imports
import { Fragment, useState, useEffect, useContext } from 'react'

import { Row, Col, Card, Input, Label, Button, CardTitle, CardHeader, Spinner } from 'reactstrap'

import { useTranslation } from 'react-i18next'

import { ChevronDown, Plus } from 'react-feather'

import DataTable from 'react-data-table-component'

import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';
import AuthContext from "@context/AuthContext"

import { getPagination } from '@utils'

import { getColumns } from './helpers'

import Addmodal from './Add'
import UpdateModal from './Update'

const ProfessionalDegree = () => {

	const { t } = useTranslation()
	const { user } = useContext(AuthContext)

    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10)

	const [searchValue, setSearchValue] = useState("");

	const [filteredData, setFilteredData] = useState([]);
	const [datas, setDatas] = useState([]);
    const [update_modal, setUpdateModal] = useState(false)
    const [edit_id, setEditId] = useState('')

    // Нийт датаны тоо
    const [total_count, setTotalCount] = useState(1)

	// Loader
	const { isLoading, fetchData } = useLoader({});

	// Api
    const professionaldegreeApi = useApi().settings.professionaldegree

	// Modal
	const [modal, setModal] = useState(false);


	/* Модал setState функц */
	const handleModal = () => {
		setModal(!modal)
	}

	// Засах функц
    function handleUpdateModal(id) {
        setEditId(id)
        setUpdateModal(!update_modal)
    }

	/* Жагсаалтын дата авах функц */
	async function getDatas() {
		const { success, data } = await fetchData(professionaldegreeApi.get())
		if(success) {
			setDatas(data)
		}
	}
	//  Жагсаалт устгах
	async function handleDelete(id){
		if(id){
			const{ success} = await fetchData(professionaldegreeApi.delete(id))
			if (success){
				getDatas()
			}
		}
	}

	useEffect(() => {
        getDatas()
    }, [])


	// Хайлт хийх үед ажиллах хэсэг
	const handleFilter = (e) => {
		var updatedData = [];
		const value = e.target.value.trimStart();

		setSearchValue(value);

		if (value.length) {
			updatedData = datas.filter((item) => {
				const startsWith =
					item.degree_code.toString().toLowerCase().startsWith(value.toString().toLowerCase()) ||
					item.degree_name.toString().toLowerCase().startsWith(value.toString().toLowerCase()) ||
					item?.degree_eng_name?.toString().toLowerCase().startsWith(value.toString().toLowerCase())

				const includes =
					item.degree_code.toString().toLowerCase().includes(value.toString().toLowerCase()) ||
					item.degree_name.toString().toLowerCase().includes(value.toString().toLowerCase()) ||
					item?.degree_eng_name?.toString().toLowerCase().includes(value.toString().toLowerCase())

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
		} else {
			setCurrentPage(1)
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
					<CardTitle tag="h4">{t('Боловсролын зэрэг')}</CardTitle>
                    <div className='d-flex flex-wrap mt-md-0 mt-1'>
                        <Button
							color='primary'
							onClick={() => handleModal()}
							disabled={Object.keys(user).length > 0 && user.permissions.includes('lms-settings-degree-create') ? false : true}
						>
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
                            columns={getColumns(currentPage, rowsPerPage, searchValue.length ? filteredData : datas,handleUpdateModal, user, handleDelete)}
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
				{modal && <Addmodal open={modal} handleModal={handleModal} refreshDatas={getDatas} />}
				{ update_modal && <UpdateModal editId={edit_id} open={update_modal} handleEdit={handleUpdateModal} refreshDatas={getDatas} /> }

			</Card>
        </Fragment>
    )
}

export default ProfessionalDegree;
