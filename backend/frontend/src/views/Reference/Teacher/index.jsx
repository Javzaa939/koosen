// ** React Imports
import { Fragment, useState, useEffect, useContext } from 'react'

import { Controller, useForm } from 'react-hook-form'

import { Row, Col, Card, Input, Label, CardTitle, CardHeader, Spinner } from 'reactstrap'

import { ChevronDown } from 'react-feather'
import { useTranslation } from 'react-i18next'

import Select from 'react-select'

import DataTable from 'react-data-table-component'

import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';

import { getPagination, ReactSelectStyles } from '@utils';

import { getColumns } from './helpers';

const Teacher = () => {

	var values = {
		subschool_id: '',
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

	const [datas, setDatas] = useState([]);
	const [department, setDepartmentData] = useState([]);
	const [subschool, setSubSchoolData] = useState([]);
	const [selected_values, setSelectValue] = useState(values);

    // Нийт датаны тоо
    const [total_count, setTotalCount] = useState(1)

	// Loader
	const { Loader, isLoading, fetchData } = useLoader({isFullScreen: true});
	const { isLoading: isTableLoading, fetchData: allFetch } = useLoader({isFullScreen: true});

	// Api
	const teacherApi = useApi().hrms.teacher
	const departmentApi = useApi().hrms.department
	const subSchoolApi = useApi().hrms.subschool

	/* Жагсаалтын дата сургууль, тэнхим авах функц */
	async function getDatas() {
		const page_count = Math.ceil(total_count / rowsPerPage)

        if (page_count < currentPage && page_count != 0) {
            setCurrentPage(page_count)
        }

		var department = selected_values.department_id
		var subschool_id = selected_values.subschool_id
		const { success, data } = await allFetch(teacherApi.getList(rowsPerPage, currentPage, sortField, searchValue, subschool_id, department))
		if(success) {
			setTotalCount(data?.count)
            setDatas(data?.results)
		}
	}

	/* Хөтөлбөрийн баг дата авах функц */
	async function getDepartmentOption() {
		var school_id = selected_values.subschool_id
		const { success, data } = await fetchData(departmentApi.getSelectSchool(school_id))
		if (success) {
			setDepartmentData(data)
		}
	}

	/* Сургууль дата авах функц */
	async function getSubSchoolOption() {
		const { success, data } = await fetchData(subSchoolApi.get())
		if (success) {
			setSubSchoolData(data)
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
	},[ selected_values, rowsPerPage, sortField, searchValue, currentPage ])

	useEffect(() => {
		getSubSchoolOption()
		getDepartmentOption()
	},[selected_values])

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

	return (
		<Fragment>
			<Card>
				{isLoading && Loader}
				<CardHeader className="flex-md-row flex-column align-md-items-center align-items-start border-bottom">
					<CardTitle tag="h4">{t('Багшийн мэдээлэл')}</CardTitle>
                </CardHeader>
                <Row className="justify-content-between mx-0 mb-1 mt-1">
					<Col md={4}>
						<Label className="form-label" for="subschool">
							{t('Сургууль')}
						</Label>
						<Controller
							control={control}
							defaultValue=''
							name="school"
							render={({ field: { value, onChange} }) => {
								return (
									<Select
										name="school"
										id="school"
										classNamePrefix='select'
										isClearable
										className='react-select'
										placeholder={t('-- Сонгоно уу --')}
										options={subschool || []}
										value={subschool.find((c) => c.id === value)}
										noOptionsMessage={() => t('Хоосон байна.')}
										onChange={(val) => {
											onChange(val?.id || '')
											setSelectValue({
												subschool_id: val?.id || '',
												department_id: ''
											})
											setValue('salbar', '')
										}}
										styles={ReactSelectStyles}
										getOptionValue={(option) => option.id}
										getOptionLabel={(option) => option.name}
									/>
								)
							}}
						></Controller>
					</Col>
					<Col md={4}>
						<Label className="form-label" for="salbar">
							{t('Хөтөлбөрийн баг')}
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
					<Col md={4}>
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
					<div className="react-dataTable react-dataTable-selectable-rows">
						<DataTable
                            noHeader
                            pagination
                            className='react-dataTable'
                            noDataComponent={(
                                <div className="my-2">
                                    <h5>Өгөгдөл байхгүй байна.</h5>
                                </div>
                            )}
                            columns={getColumns(currentPage, rowsPerPage, datas)}
							onSort={handleSort}
                            sortIcon={<ChevronDown size={10} />}
                            paginationPerPage={rowsPerPage}
                            paginationDefaultPage={currentPage}
                            data={datas}
                            paginationComponent={getPagination(handlePagination, currentPage, rowsPerPage, total_count, searchValue, datas)}
                            fixedHeader
                            fixedHeaderScrollHeight='62vh'
                        />
					</div>
				}
			</Card>
        </Fragment>
    )
}
export default Teacher;
