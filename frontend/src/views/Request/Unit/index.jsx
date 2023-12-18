// ** React imports
import React, { Fragment, useState, useEffect, useContext } from 'react'

import { Card, CardHeader, CardTitle, Row, Col, Label, Input, Button,Spinner } from 'reactstrap';

import useApi from "@hooks/useApi"
import useLoader from '@hooks/useLoader';

import Select from 'react-select'

import DataTable from 'react-data-table-component';

import { ChevronDown, Search } from 'react-feather'

import { getPagination, get_unit_list, ReactSelectStyles } from '@utils'

import classnames from 'classnames'

import AuthContext from '@context/AuthContext'
import RequestContext from "@context/RequestContext"

import { useTranslation } from 'react-i18next'

import { getColumns } from './helpers';

import AddModal from './Add';
import EditModal from './Edit';

const Request = () => {

	const { t } = useTranslation()

	const { user } = useContext(AuthContext)
	const { setMenuId } = useContext(RequestContext)

	// Нийт датаны тоо
	const default_page = [10, 15, 50, 75, 100]

	// Loader
	const{ isLoading, fetchData } = useLoader({ })
	const { isLoading: isTableLoading, fetchData: allFetch } = useLoader({isFullScreen: true})

	// Usestate
	const [currentPage, setCurrentPage] = useState(1)
	const [total_count, setTotalCount] = useState(1)
	const [unit, setUnit] = useState('')
	const [rowsPerPage, setRowsPerPage] = useState(10)
	const [searchValue, setSearchValue] = useState('')
	const [datas, setDatas] = useState([])
	const [edit_id, setEditId] = useState('')
	const [add_modal, setAddModal] = useState(false)
	const [edit_modal, setEditModal] = useState(false)
    const [unit_option, setUnitOption] = useState(get_unit_list())

	// Эрэмбэлэлт
    const [sortField, setSort] = useState('')

	// Api
	const requestUnitApi = useApi().request.unit

    async function getDatas() {
        const { success, data } = await allFetch(requestUnitApi.get(rowsPerPage, currentPage, sortField, searchValue, unit))
        if (success) {
            setDatas(data?.results)
			setTotalCount(data?.count)
        }
    }

	//
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

	// Хайх товч дарсан үед ажиллах функц
	async function handleSearch() {
		getDatas()
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


	// Function to handle per page
	function handlePerPage(e) {
		setRowsPerPage(parseInt(e.target.value))
	}

	// Хуудас солих үед ажиллах хэсэг
	const handlePagination = (page) => {
		setCurrentPage(page.selected + 1);
	};

	/** Засах модал */
    function handleEditModal(id) {
        setEditId(id)
        setEditModal(!edit_modal)
    }

	function handleAddModal() {
		setAddModal(!add_modal)
	}

	useEffect(() => {
		getDatas()
		setMenuId('')
	}, [rowsPerPage, currentPage, sortField, unit])

	return (
        <Fragment>
			<Card>
				<CardHeader className="flex-md-row flex-column align-md-items-center align-items-start border-bottom pb-50">
					<CardTitle tag="h4">{t('Хүсэлт шийдвэрлэх нэгж')}</CardTitle>
					<Button color='primary' disabled={Object.keys(user).length > 0 && user.permissions.includes('lms-decide-unit-create') ? false : true} onClick={() => handleAddModal()}>
						{t('Нэмэх')}
					</Button>
				</CardHeader>
				<Row className=" d-flex justify-content-between mx-0 mt-1">
					<Col md={4} className='mb-1'>
						<Label className= "form-label me-1" for="solved_flag">
							{t('Хүсэлтийн нэгж')}
						</Label>
						<Select
							name="solved_flag"
							id="solved_flag"
							classNamePrefix='select'
							isClearable
							className={classnames('react-select')}
							isLoading={isLoading}
							placeholder={t(`-- Сонгоно уу --`)}
							options={unit_option || []}
							value={unit_option.find((c) => c.id === unit)}
							noOptionsMessage={() => t('Хоосон байна')}
							styles={ReactSelectStyles}
							onChange={(val) => {
								setUnit(val?.id || '')
							}}
							getOptionValue={(option) => option.id}
							getOptionLabel={(option) => option.name}
						/>
					</Col>
				</Row>
				<Row className='mt-1 d-flex justify-content-between mx-0'>
					<Col className='d-flex align-items-center justify-content-start '>
						<Col md={2} sm={3} className='pe-1'>
							<Input
								className='dataTable-select me-1 mb-50'
								type='select'
								bsSize='sm'
								style={{ height: "30px",}}
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
					<Col className='d-flex align-items-center mobile-datatable-search'>
                        <Input
                            className='dataTable-filter mb-50'
                            type='text'
                            bsSize='sm'
                            id='search-input'
                            placeholder={t('Хайх')}
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
				{
					isLoading
                    ?
                        <div className="my-2 text-center" sm={12}>
                            <Spinner size='sm' />
                            <span className='ms-50'>{t('Түр хүлээнэ үү')}...</span>
                        </div>
                    :
					<div className='react-dataTable react-dataTable-selectable-rows'>
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
							onSort={handleSort}
							sortIcon={<ChevronDown size={10} />}
							columns={getColumns(currentPage, rowsPerPage, total_count, handleEditModal)}
							paginationPerPage={rowsPerPage}
							paginationDefaultPage={currentPage}
							data={datas}
							paginationComponent={getPagination(handlePagination, currentPage, rowsPerPage, total_count)}
							fixedHeader
							fixedHeaderScrollHeight='62vh'
						/>
					</div>
				}
				{ add_modal && <AddModal isOpen={add_modal} handleModal={handleAddModal} refreshDatas={getDatas} /> }
				{ edit_modal && <EditModal isOpen={edit_modal} editId={edit_id} handleModal={handleEditModal} refreshDatas={getDatas} /> }
			</Card>
		</Fragment>
	);
};

export default Request;
