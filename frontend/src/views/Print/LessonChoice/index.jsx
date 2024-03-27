// ** React Imports
import { Fragment, useState, useEffect, useContext } from 'react'

import { Controller, useForm } from 'react-hook-form'

import { Row, Col, Card, Input, Label, CardTitle, CardHeader, Spinner, Button } from 'reactstrap'

import { ChevronDown , Printer, Search} from 'react-feather'

import { useTranslation } from 'react-i18next'

import Select from 'react-select'

import DataTable from 'react-data-table-component'

import useApi from '@hooks/useApi';

import useLoader from '@hooks/useLoader';

import SchoolContext from '@context/SchoolContext'
import ActiveYearContext from '@context/ActiveYearContext'

import { getPagination, ReactSelectStyles } from '@utils';

import { getColumns } from './helpers';

const LessonName = () => {

	var values = {
		teacher: '',
		lesson: '',
        group: '',
	}

	const { t } = useTranslation()
	const { school_id } = useContext(SchoolContext)

	// ** Hook
    const { control, setValue, formState: { errors } } = useForm({});
	const default_page = [10, 15, 50, 75, 100]

	// Loader
    const { Loader, isLoading, fetchData } = useLoader({isFullScreen: true})

	// Эрэмбэлэлт
	const [sortField, setSort] = useState('')
	const [searchValue, setSearchValue] = useState("")
	const [isClass, setClass] = useState(false)
	const [lessonOption, setLessonOption] = useState([])
    const [teacherOption, setTeacherOption] = useState([])
    const [groupOption, setGroupOption] = useState([])
	const [select_value, setSelectValue] = useState(values)
	const [datas, setDatas] = useState([])

	// Хуудаслалтын анхны утга
	const [currentPage, setCurrentPage] = useState(1)

	// Нэг хуудсанд харуулах нийт датаны тоо
	const [rowsPerPage, setRowsPerPage] = useState(10)

    // Нийт датаны тоо
    const [total_count, setTotalCount] = useState(1)

	// Api
	const groupApi = useApi().student.group
    const teacherApi = useApi().hrms.teacher
    const lessonApi = useApi().study.lessonStandart
	const choiceApi = useApi().print.choice

    // Хайх товч дарсан үед ажиллах функц
    async function handleSearch() {
    if (searchValue.length > 0) getDatas()
    }

	useEffect(() => {
        getDatas()
    }, [sortField, currentPage, rowsPerPage])

	// Хайлтийн хэсэг хоосон болох үед анхны датаг дуудна
	useEffect(() => {
        if (!searchValue) {
            getDatas()
        }
    },[searchValue])

    // Хичээлийн жагсаалт
    async function getLessonOption() {
        const { success, data } = await fetchData(lessonApi.getList())
        if(success) {
            setLessonOption(data)
        }
    }

    // Багшийн жагсаалт
    async function getTeacher() {
        const lesson_id = select_value.lesson
        const { success, data } = await fetchData(teacherApi.getTeacher(lesson_id))
        if(success) {
            setTeacherOption(data)
        }
    }

    // Анги бүлгийн жагсаалт
    async function getGroups() {
        const teacher_id = select_value.teacher
        const { success, data } = await fetchData(groupApi.getList('','','','',school_id))
        if(success) {
            setGroupOption(data)
        }
    }

	useEffect(() => {
        getDatas()
		getTeacher()
		getLessonOption()
        if (school_id){
            getGroups()
        }

    },[select_value, school_id])

	/*Жагсаалт дата авах функц */
	async function getDatas(){
		if(school_id && select_value.lesson && (select_value.teacher || select_value.group))
		{
			const { success, data } = await fetchData(choiceApi.get(rowsPerPage, currentPage, sortField, searchValue,select_value.lesson,select_value.teacher,select_value.group))
			if (success){
				setDatas(data)
			}
		}
		else
		{
			setDatas([])
		}
    }
	// ** Function to handle filter
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

	// Хуудас солих үед ажиллах хэсэг
	const handlePagination = (page) => {
		setCurrentPage(page.selected + 1);
	};

	// ** Function to handle per page
    function handlePerPage(e) {
        setRowsPerPage(parseInt(e.target.value))
    }

	return (
		<Fragment>
			<Card>
			{isLoading && Loader}
                <CardHeader className="flex-md-row flex-column align-md-items-center align-items-start border-bottom pt-0'">
					<CardTitle tag="h4">{t('Хичээл сонголтын нэрс')}</CardTitle>
					<div className='d-flex flex-wrap mt-md-0 mt-1'>
                        <Button
                            color='primary'
                        >
                            <Printer size={15} />
                            <span className='align-middle ms-50'>{t('Хэвлэх')}</span>
                        </Button>
                    </div>
                </CardHeader>
                <Row className="justify-content-between mx-0 mb-1 mt-1">
					<Col md={4}>
						<Label className="form-label" for="lesson">
							{t('Хичээл')}
						</Label>
						<Controller
							control={control}
							defaultValue=''
							name="lesson"
							render={({ field: { value, onChange} }) => {
								return (
									<Select
										name="lesson"
										id="lesson"
										classNamePrefix='select'
										isClearable
										className='react-select'
										placeholder={t('-- Сонгоно уу --')}
										options={lessonOption || []}
										value={lessonOption.find((c) => c.id === value)}
										noOptionsMessage={() => t('Хоосон байна.')}
										onChange={(val) => {
											onChange(val?.id || '')
											setSelectValue({
												lesson: val?.id || '',
												teacher: select_value.teacher,
												group: select_value.group
											})
										}}
										styles={ReactSelectStyles}
										getOptionValue={(option) => option.id}
										getOptionLabel={(option) => option.full_name}
									/>
								)
							}}
						></Controller>
					</Col>
					<Col md={4}>
						<Input className="form-input" style={{marginRight: "5px"}} type="radio" name="flexRadioDefault" checked={isClass}
							onChange={(e) => {
								setClass(e.target.checked)
								if(e.target.checked) setValue('teacher','')
								else setValue('group','')
							}}
						/>
						<Label className="checkbox-wrapper" for="flexRadioDefault1">
							{t('Анги')}
						</Label>
						<Controller
							control={control}
							defaultValue=''
							name="group"
							render={({ field: { value, onChange} }) => {
								return (
									<Select
										name="group"
										id="group"
										classNamePrefix='select'
										isClearable
										className='react-select'
										isDisabled={!isClass}
										placeholder={t('-- Сонгоно уу --')}
										options={groupOption || []}
										value={value && groupOption.find((c) => c.id === value)}
										noOptionsMessage={() => t('Хоосон байна.')}
										onChange={(val) => {
											onChange(val?.id || '')
											setSelectValue({
												lesson:select_value.lesson,
												group: val?.id || '',
												teacher: '',
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
						<Input className="form-input" style={{marginRight: "5px"}} type="radio" name="flexRadioDefault" id="flexRadioDefault2" checked={!isClass}
							onChange={(e) => {
								setClass(!e.target.checked)
								if(e.target.checked) setValue('group','')
								else setValue('teacher','')
							}}
						/>
						<Label className="form-label" for="flexRadioDefault2">
							{t('Багш')}
						</Label>
						<Controller
							control={control}
							defaultValue=''
							name="teacher"
							render={({ field: { value, onChange} }) => {
								return (
									<Select
										name="teacher"
										id="teacher"
										classNamePrefix='select'
										isClearable
										className='react-select'
										placeholder={t('-- Сонгоно уу --')}
										options={teacherOption || []}
										value={value && teacherOption.find((c) => c.id === value)}
										noOptionsMessage={() => t('Хоосон байна.')}
										onChange={(val) => {
											onChange(val?.id || '')
											setSelectValue({
												lesson: select_value.lesson,
												group:'',
												teacher: val?.id || '',
											})
										}}
										isDisabled={isClass}
										styles={ReactSelectStyles}
										getOptionValue={(option) => option.id}
										getOptionLabel={(option) => option.full_name}
									/>
								)
							}}
						></Controller>
					</Col>
				</Row>
				<Row className='justify-content-between mx-0 mb-1'>
                    <Col className='d-flex align-items-center justify-content-start' md={6} sm={12}>
                        <Col md={2} sm={3} className='pe-1'>
                            <Input
                                type='select'
                                bsSize='sm'
                                style={{ height: "30px" }}
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
					<Col className='d-flex align-items-center mobile-datatable-search mt-1' md={4} sm={12}>
                        <Input
                            className='dataTable-filter mb-50'
                            type='text'
                            bsSize='sm'
                            id='search-input'
                            placeholder={t('Хайх')}
                            value={searchValue}
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
                <div className='react-dataTable react-dataTable-selectable-rows'>
                    <DataTable
                        noHeader
                        pagination
                        paginationServer
                        className='react-dataTable'
                        progressPending={isLoading}
                        progressComponent={<h5>{t('Түр хүлээнэ үү...')}</h5>}
                        noDataComponent={(
                            <div className="my-2">
                                <h5>{t('Өгөгдөл байхгүй байна')}</h5>
                            </div>
                        )}
                        onSort={handleSort}
                        sortIcon={<ChevronDown size={10} />}
                        columns={getColumns(currentPage, rowsPerPage, total_count)}
                        paginationPerPage={rowsPerPage}
                        paginationDefaultPage={currentPage}
                        paginationComponent={getPagination(handlePagination, currentPage, rowsPerPage, total_count)}
                        data={datas}
                        fixedHeader
                        fixedHeaderScrollHeight='62vh'
                    />
                </div>
            </Card>
        </Fragment>
    )
}
export default LessonName;
