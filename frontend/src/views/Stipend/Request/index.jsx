// ** React imports
import React, { Fragment, useState } from 'react'

import { Card, CardHeader, CardTitle, Row, Col, Label, FormFeedback, Input, Button, Spinner } from 'reactstrap';

import useApi from "@hooks/useApi"
import useLoader from '@hooks/useLoader';

import Select from 'react-select'

import DataTable from 'react-data-table-component';

import { ChevronDown, Search } from 'react-feather'

import { getPagination, SOLVED_TYPES, ReactSelectStyles } from '@utils'

import { useForm, Controller } from 'react-hook-form'

import classnames from 'classnames'

import { useTranslation } from 'react-i18next'

import { getColumns } from './helpers';

import SolveModal from './Modal'
import { useEffect } from 'react';

const Request = () => {

	const { t } = useTranslation()

	// Нийт датаны тоо
	const default_page = [10, 15, 50, 75, 100]

	// ** Hook
    const { control, formState: { errors } } = useForm({});

	// Loader
	const{ Loader, isLoading, fetchData } = useLoader({isFullScreen: true})

	// Usestate
	const [currentPage, setCurrentPage] = useState(1)
	const [total_count, setTotalCount] = useState(1)
	const [solved, setSolved] = useState('')
	const [rowsPerPage, setRowsPerPage] = useState(10)
	const [searchValue, setSearchValue] = useState('')
	const [datas, setDatas] = useState([])
	const [modal_open, setModalOpen] = useState(false)
	const [req_id, setReqId] = useState('')
	const [solved_type, setSolvedType] = useState(SOLVED_TYPES(0))
	const [stipend_option, setStipendOption] = useState([])
	const [stipend_id, setStipendId] = useState('')
	const [is_view, setIsView] = useState(false)
	const [ modalData, setModalData ] = useState({})

	// Эрэмбэлэлт
    const [sortField, setSort] = useState('')

	// Api
	const stipendApi = useApi().stipend.request
	const discountTypeApi = useApi().settings.discountType

    async function getDatas() {
        const { success, data } = await fetchData(stipendApi.get(rowsPerPage, currentPage, sortField, searchValue, solved, stipend_id))
        if (success) {
            setDatas(data?.results)
			setTotalCount(data?.count)
        }
    }

	async function getStipendType() {
		const { success, data } = await fetchData(discountTypeApi.get())
		if(success) {
			setStipendOption(data)
		}
	}

	useEffect(() => {
		getStipendType()
	},[])

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

	// Function to handle per page
	function handlePerPage(e) {
		setRowsPerPage(parseInt(e.target.value))
	}

	// Хуудас солих үед ажиллах хэсэг
	const handlePagination = (page) => {
		setCurrentPage(page.selected + 1);
	};

	// Хүсэлт шийдвэрлэх болон дэлгэрэнгүй харах
	async function handleRequestSolved(id, view,data ) {
		setIsView(view)
		setReqId(id)
		setModalOpen(!modal_open)
		setModalData(data)
	}

	useEffect(() => {
		getDatas()
	},[rowsPerPage, currentPage, sortField, solved, stipend_id])

	return (
        <Fragment>
			<Card>
				<CardHeader className="flex-md-row flex-column align-md-items-center align-items-start border-bottom">
					<CardTitle tag="h4">{t('Тэтгэлэг хүсч буй оюутны мэдээлэл')}</CardTitle>
				</CardHeader>
				<Row className="mx-0 mt-1">
					<Col md={4} className='mb-1'>
						<Label className= "form-label me-1" for="solved_flag">
							{t('Шийдвэрийн төрөл')}
						</Label>
						<Controller
							defaultValue=''
							control={control}
							name="solved_flag"
							render={({ field: { value, onChange} }) => (
								<Select
									name="solved_flag"
									id="solved_flag"
									classNamePrefix='select'
									isClearable
									className={classnames('react-select', { 'is-invalid': errors.solved_flag })}
									isLoading={isLoading}
									placeholder={t(`-- Сонгоно уу --`)}
									options={solved_type || []}
									value={solved_type.find((c) => c.id === value)}
									noOptionsMessage={() => t('Хоосон байна')}
									styles={ReactSelectStyles}
									onChange={(val) => {
										onChange(val?.id || '')
										setSolved(val?.id || '')
									}}
									getOptionValue={(option) => option.id}
									getOptionLabel={(option) => option.name}
								/>
							)}
						/>
						{errors.solved_flag && <FormFeedback className='d-block'>{t(errors.solved_flag.message)}</FormFeedback>}
					</Col>
					<Col md={4} className='mb-1'>
						<Label className= "form-label me-1" for="stipend">
							{t('Тэтгэлэг')}
						</Label>
						<Select
							name="stipend"
							id="stipend"
							classNamePrefix='select'
							isClearable
							className={classnames('react-select')}
							isLoading={isLoading}
							placeholder={t(`-- Сонгоно уу --`)}
							options={stipend_option || []}
							value={stipend_option.find((c) => c.id === stipend_id)}
							noOptionsMessage={() => t('Хоосон байна')}
							styles={ReactSelectStyles}
							onChange={(val) => setStipendId(val?.id || '')}
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
							onSort={handleSort}
							sortIcon={<ChevronDown size={10} />}
							columns={getColumns(currentPage, rowsPerPage, total_count, handleRequestSolved)}
							paginationPerPage={rowsPerPage}
							paginationDefaultPage={currentPage}
							data={datas}
							paginationComponent={getPagination(handlePagination, currentPage, rowsPerPage, total_count)}
							fixedHeader
							fixedHeaderScrollHeight='62vh'
						/>
					</div>
				}
				{ modal_open && <SolveModal request_id={req_id} isOpen={modal_open} handleModal={handleRequestSolved} refreshDatas={getDatas} datas={modalData} is_view={is_view} /> }
			</Card>
		</Fragment>
	);
};

export default Request;
