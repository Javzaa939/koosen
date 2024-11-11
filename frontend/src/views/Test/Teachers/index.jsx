// ** React Imports
import { Fragment, useState, useEffect, useContext } from 'react'

import { Controller, useForm } from 'react-hook-form'

import { Row, Col, Card, Input, Label, CardTitle, CardHeader, Spinner, Button, Modal, ModalHeader, ModalBody } from 'reactstrap'

import { ChevronDown, Plus } from 'react-feather'
import { useTranslation } from 'react-i18next'

import Select from 'react-select'

import DataTable from 'react-data-table-component'

import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';

import { getPagination, ReactSelectStyles } from '@utils';
import AuthContext from '@context/AuthContext'
import SchoolContext from '@context/SchoolContext'

import { getColumns } from './helpers';
import { getColumnsLesson } from './helpers2';
import EQuestions from '../EQuestions'

const Teacher = () => {

	var values = {
		position_id: '',
		department_id: ''
	}

	const { t } = useTranslation()

	// ** Hook
	const { control, setValue, formState: { errors } } = useForm({});

	const [step, setStep] = useState(1);
	const [currentPage, setCurrentPage] = useState(1);
	const [rowsPerPage, setRowsPerPage] = useState(10)

	// Эрэмбэлэлт
	const [sortField, setSort] = useState('')
	const [searchValue, setSearchValue] = useState("");

	const { school_id } = useContext(SchoolContext)

	const [datas, setDatas] = useState([]);
	const [department, setDepartmentData] = useState([]);
	const [lesson_data, setLessonDatas] = useState([])
	const [position_option, setOrgPositions] = useState([]);
	const [selected_values, setSelectValue] = useState(values);

	const [teacher, setTeacher] = useState('')
	const [teacher_name, setTeacherName] = useState('')
	const [title_id, setTitleId] = useState('')

	// Нийт датаны тоо
	const [total_count, setTotalCount] = useState(1)
	const [total_count2, setTotalCount2] = useState(2)

	// Loader
	const { Loader, isLoading, fetchData } = useLoader({});
	const { isLoading: isTableLoading, fetchData: allFetch } = useLoader({});

	// Api
	const teacherApi = useApi().challenge
	const departmentApi = useApi().hrms.department
	const positionApi = useApi().hrms.position


	/* Жагсаалтын дата сургууль, тэнхим авах функц */
	async function getDatas() {
		const page_count = Math.ceil(total_count / rowsPerPage)

		if (page_count < currentPage && page_count != 0) {
			setCurrentPage(page_count)
		}
		const { success, data } = await allFetch(teacherApi.getTeacherList(rowsPerPage, currentPage, sortField, searchValue, school_id, selected_values.department_id, selected_values.position_id))
		if (success) {
			setTotalCount(data?.count)
			setDatas(data?.results)
		}
	}

	async function getDatas2(teacher) {
		const page_count = Math.ceil(total_count / rowsPerPage)

		if (page_count < currentPage && page_count != 0) {
			setCurrentPage(page_count)
		}
		const { success, data } = await allFetch(teacherApi.getTeacherLessonList(rowsPerPage, currentPage, sortField, searchValue, teacher))
		if (success) {
			setTotalCount2(data?.count)
			setTeacherName(data?.name)
			setLessonDatas(data?.data)
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

	// stepper
	const handleNext = (row) => {
		setTeacher(row?.id)
		setStep(prev => prev + 1)
	}
	const handleDetail = (id) => {
		setTitleId(id)
		if (title_id) {
			setStep(prev => prev + 1)

		}
	}

	const handlePrevious = () => {
		setStep(prev => prev - 1)
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
	}, [sortField, searchValue, currentPage, school_id])
	useEffect(() => {
		if (teacher) {
			getDatas2(teacher);
		}
	}, [teacher])

	useEffect(() => {
		if (selected_values.department_id || selected_values.position_id) {
			getDatas();
		}
	}, [selected_values])

	useEffect(() => {
		getPositionData()
		getDepartmentOption()
	}, [])

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
		if (sort === 'asc') {
			setSort(column.header)
		} else {
			setSort('-' + column.header)
		}
	}

	return (
		<Fragment>
			{step === 1 && <Card>
				{isLoading && Loader}
				<CardHeader className="flex-md-row flex-column align-md-items-center align-items-start border-bottom">
					<CardTitle tag="h4">{t('Асуулт үүсгэсэн багшийн жагсаалт')}</CardTitle>
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
							render={({ field: { value, onChange } }) => {
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
											setSelectValue({
												subschool_id: selected_values.subschool_id,
												department_id: val?.id || ''
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
								setSelectValue({
									department_id: selected_values.department_id,
									position_id: val?.id || ''
								})
							}}
							styles={ReactSelectStyles}
							getOptionValue={(option) => option.id}
							getOptionLabel={(option) => option.name}
						/>
					</Col>
					<Col md={3}></Col>
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
							columns={getColumns(currentPage, rowsPerPage, total_count, handleNext)}
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
			</Card>}
			{
				step === 2 &&
				<Card>
					{isLoading && Loader}
					<CardHeader className="flex-md-row flex-column align-md-items-center align-items-start border-bottom">
						<CardTitle tag="h4">{t('Шалгалтын асуултын сэдвийн мэдээлэл')}</CardTitle>
						<CardTitle tag="h5">{teacher_name}</CardTitle>
					</CardHeader>
					<Row className="justify-content-between mx-0 mb-1 mt-1">
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
								columns={getColumnsLesson(currentPage, rowsPerPage, total_count2, handleDetail)}
								onSort={handleSort}
								sortIcon={<ChevronDown size={10} />}
								paginationPerPage={rowsPerPage}
								paginationDefaultPage={currentPage}
								data={lesson_data}
								paginationComponent={getPagination(handlePagination, currentPage, rowsPerPage, total_count2)}
								fixedHeader
								fixedHeaderScrollHeight='62vh'
							/>
						</div>
					}
				</Card>
			}
			{
				step === 3 &&
				<EQuestions teacher_id={teacher} title_id={title_id} />
			}

		</Fragment>
	)
}
export default Teacher;
