// ** React Imports
import { Fragment, useState, useEffect, useContext } from 'react'

import { Controller, useForm } from 'react-hook-form'

import { Row, Col, Card, Input, Label, CardTitle, CardHeader, Spinner, Button } from 'reactstrap'

import { ChevronDown, Plus } from 'react-feather'
import { useTranslation } from 'react-i18next'

import Select from 'react-select'

import DataTable from 'react-data-table-component'

import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';
import useUpdateEffect from '@hooks/useUpdateEffect'

import { getPagination, ReactSelectStyles, get_emp_state } from '@utils';
import AuthContext from '@context/AuthContext'
import SchoolContext from '@context/SchoolContext'

import { getColumns } from './helpers';
import AddModal from './Add'

const Teacher = () => {

	var values = {
		state: '',
		position_id: '',
		department_id: ''
	}

	const { t } = useTranslation()

	// ** Hook
    const { control, setValue, formState: { errors } } = useForm({});

    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10)

	// Эрэмбэлэлт
	const [sortField, setSort] = useState('')
	const [searchValue, setSearchValue] = useState("");

	const { user } = useContext(AuthContext)
	const { school_id } = useContext(SchoolContext)

	const [datas, setDatas] = useState([]);
	const [department, setDepartmentData] = useState([]);
	const [position_option, setOrgPositions] = useState([]);
	const [selected_values, setSelectValue] = useState(values);
	const [add_modal, setAddModal] = useState(false)
	const [editData, setEditData] = useState({})

    // Нийт датаны тоо
    const [total_count, setTotalCount] = useState(1)

	// Loader
	const { Loader, isLoading, fetchData } = useLoader({});
	const { isLoading: isTableLoading, fetchData: allFetch } = useLoader({});

	// Api
	const teacherApi = useApi().hrms.teacher
	const departmentApi = useApi().hrms.department
	const positionApi = useApi().hrms.position

	/* Жагсаалтын дата сургууль, тэнхим авах функц */
	async function getDatas() {
		const page_count = Math.ceil(total_count / rowsPerPage)

        if (page_count < currentPage && page_count != 0) {
            setCurrentPage(page_count)
        }
		const { success, data } = await allFetch(teacherApi.getList(rowsPerPage, currentPage, sortField, searchValue, school_id, selected_values.department_id, selected_values.position_id, selected_values.state))
		if(success) {
			setTotalCount(data?.count)
            setDatas(data?.results)
		}
	}

	/* Тэнхим дата авах функц */
	async function getDepartmentOption() {
		const { success, data } = await fetchData(departmentApi.getSelectSchool())
		if (success) {
			setDepartmentData(data)
		}
	}

	/* Албан тушаал дата авах функц */
	async function getPositionData() {
		const { success, data } = await fetchData(positionApi.get())
		if (success) {
			setOrgPositions(data)
		}
	}

	// addModal
	const handleModal =() =>{
		setAddModal(!add_modal)
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
	},[sortField, searchValue, currentPage, school_id])

	useUpdateEffect(() => {
		getDatas();
	},[selected_values])

	useEffect(() => {
		getPositionData()
		getDepartmentOption()
	},[])

	function handleEdit(data) {
        setAddModal(!add_modal)
        setEditData(data)
    }

	// ** Function to handle filter
	const handleFilter = e => {
        const value = e.target.value.trimStart();
        setSearchValue(value)
    }

	// Хуудас солих үед ажиллах хэсэг
	const handlePagination = (page) => {
		setCurrentPage(page.selected + 1);
	};

	function handleSort(column, sort) {
        if(sort === 'asc') {
            setSort(column.header)
        } else {
            setSort('-' + column.header)
        }
    }

	async function handleDelete(pk) {
		const { success } = await fetchData(teacherApi.delete(pk))
		if (success) {
			getDatas()
		}
	}

	/* Password сэргээх функц */
    const changePassModal = async(id) => {
		await fetchData(teacherApi.resetPassword(id))
    }

	return (
		<Fragment>
			<Card>
				{isLoading && Loader}
				<CardHeader className="flex-md-row flex-column align-md-items-center align-items-start border-bottom">
					<CardTitle tag="h4">{t('Багшийн мэдээлэл')}</CardTitle>
					<div className='d-flex flex-wrap mt-md-0 mt-1'>
						<Button
                            color='primary'
                            disabled={Object.keys(user).length > 0 && school_id ? false : true}
                            onClick={() => handleModal()}>
                            <Plus size={15} />
                            <span className='align-middle ms-50'>{t('Нэмэх')}</span>
                        </Button>
                    </div>
                </CardHeader>
                <Row className="justify-content-between mx-0 mb-1 mt-1">
					<Col md={3}>
						<Label className="form-label" for="salbar">
							{t('Тэнхим')}
						</Label>
						<Controller
							control={control}
							defaultValue=''
							name="salbar"
							render={({ field: { value, onChange} }) => {
								return (
									<Select
										name="salbar"
										id="salbar"
										classNamePrefix='select'
										isClearable
										className='react-select'
										placeholder={t('-- Сонгоно уу --')}
										options={department || []}
										value={value && department.find((c) => c.id === value)}
										noOptionsMessage={() => t('Хоосон байна.')}
										onChange={(val) => {
											onChange(val?.id || '')
											setSelectValue(current => {
												return {
													...current,
													department_id: val?.id || ''
												}
											})
										}}
										styles={ReactSelectStyles}
										getOptionValue={(option) => option.id}
										getOptionLabel={(option) => option.name}
									/>
								)
							}}
						></Controller>
					</Col>
					<Col md={3}>
						<Label className="form-label" for="position">
							{t('Албан тушаал')}
						</Label>
							<Select
								name="position"
								id="position"
								classNamePrefix='select'
								isClearable
								className='react-select'
								placeholder={t('-- Сонгоно уу --')}
								options={position_option || []}
								value={position_option.find((c) => c.id === selected_values.position_id)}
								noOptionsMessage={() => t('Хоосон байна.')}
								onChange={(val) => {
									setSelectValue(current => {
										return {
											...current,
											position_id: val?.id || ''
										}
									})
								}}
								styles={ReactSelectStyles}
								getOptionValue={(option) => option.id}
								getOptionLabel={(option) => option.name}
							/>
					</Col>
					<Col md={3}>
						<Label className="form-label" for="state">
							{t('Ажилтны төлөв')}
						</Label>
							<Select
								name="state"
								id="state"
								classNamePrefix='select'
								isClearable
								className='react-select'
								placeholder={t('-- Сонгоно уу --')}
								options={get_emp_state() || []}
								value={get_emp_state().find((c) => c.id === selected_values.state)}
								noOptionsMessage={() => t('Хоосон байна.')}
								onChange={(val) => {
									setSelectValue(current => {
										return {
											...current,
											state: val?.id || ''
										}
									})
								}}
								styles={ReactSelectStyles}
								getOptionValue={(option) => option.id}
								getOptionLabel={(option) => option.name}
							/>
					</Col>
					<Col md={3}>
						<Label className="form-label" for="salbar">
							{t('Хайлт')}
						</Label>
						<Input
							type="text"
							bsSize="sm"
							id="search-input"
							value={searchValue}
							onChange={handleFilter}
							placeholder={t("Хайх үг....")}
						/>
					</Col>
				</Row>
				{isTableLoading ?
					<div className="my-2 text-center" sm={12}>
						<Spinner size='sm' />
						<span className='ms-50'>{t("Түр хүлээнэ үү...")}</span>
					</div>
				:
					<div className="react-dataTable react-dataTable-selectable-rows mx-1">
						<DataTable
                            noHeader
                            pagination
                            className='react-dataTable'
                            noDataComponent={(
                                <div className="my-2">
                                    <h5>Өгөгдөл байхгүй байна.</h5>
                                </div>
                            )}
                            columns={getColumns(currentPage, rowsPerPage, total_count, handleEdit, handleDelete, user, changePassModal)}
							onSort={handleSort}
                            sortIcon={<ChevronDown size={10} />}
                            paginationPerPage={rowsPerPage}
                            paginationDefaultPage={currentPage}
                            data={datas}
                            paginationComponent={getPagination(handlePagination, currentPage, rowsPerPage, total_count)}
                            fixedHeader
                            fixedHeaderScrollHeight='62vh'
                        />
					</div>
				}
			</Card>
			{ add_modal && <AddModal open={add_modal} handleModal={handleModal} refreshDatas={getDatas} editData={editData}/> }
        </Fragment>
    )
}
export default Teacher;
