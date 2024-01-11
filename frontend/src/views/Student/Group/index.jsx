// ** React Imports
import { Fragment, useState, useEffect, useContext } from 'react'

import { Row, Col, Card, Input, Label, Button, CardTitle, CardHeader, Spinner } from 'reactstrap'

import { ChevronDown, Plus, Search } from 'react-feather'

import { useForm, Controller } from "react-hook-form";

import DataTable from 'react-data-table-component'

import classnames from "classnames";

import { useTranslation } from 'react-i18next'

import Select from 'react-select'

import useApi from '@hooks/useApi';

import useLoader from '@hooks/useLoader';

import AuthContext from "@context/AuthContext"

import SchoolContext from "@context/SchoolContext"

import { getPagination, ReactSelectStyles, generateLessonYear } from '@utils'

import { getColumns } from './helpers'

import Addmodal from './Add'

import EditModal from './Edit'

const Score = () => {

	const { user } = useContext(AuthContext)
	const { school_id } = useContext(SchoolContext)

    var values = {
        profession: '',
        department: '',
        join_year: '',
        degree: '',
    }

    // ** Hook
    const { control, setValue, formState: { errors } } = useForm({});

    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10)

    // Эрэмбэлэлт
    const [sortField, setSort] = useState('')

    // Translate
    const { t } = useTranslation()

    const default_page = [10, 15, 50, 75, 100]

	const [searchValue, setSearchValue] = useState("");
    const [checkOnlyStudy, setOnlyStudy] = useState('');
    const [select_value, setSelectValue] = useState(values)

	const [datas, setDatas] = useState([]);
    const [ profOption, setProfession] = useState([])
    const [ degreeOption, setDegree] = useState([])
    const [ depOption, setDepartment] = useState([])
    const [ yearOption, setYear] = useState([])
    const [status_option, setStatusOption] = useState([
        {
            'id': 1,
            'name': 'Суралцаж байгаа'
        },
        {
            'id': 2,
            'name': 'Төгссөн'
        },
    ])

    // Нийт датаны тоо
    const [total_count, setTotalCount] = useState(datas.length || 1)

    // Нийт хуудасны тоо
    const [pageCount, setPageCount] = useState(1)

	// Loader
	const { Loader, isLoading, fetchData } = useLoader({isFullScreen: false});
    const { isLoading: isTableLoading, fetchData: allFetch } = useLoader({isFullScreen: false})


	// Modal
	const [modal, setModal] = useState(false);
    const [edit_modal, setEditModal] = useState(false)
    const [group_id, setGroupId] = useState('')

    // Api
    const professionApi = useApi().study.professionDefinition
    const degreeApi = useApi().settings.professionaldegree

    const depApi = useApi().hrms.department
	const groupApi = useApi().student.group

    //Хөтөлбөрийн жагсаалт авах
    async function getProfession () {

        var degree_id=select_value?.degree
        var salbar=select_value?.department

        const { success, data } = await fetchData(professionApi.getList(degree_id, salbar))
        if (success) {
            setProfession(data)
        }
	}

    //Боловсролын зэргийн жагсаалт авах
    async function getDegree () {

        const { success, data } = await fetchData(degreeApi.get())
        if (success) {
            setDegree(data)
        }
	}

    // Салбарын жагсаалт авах
    async function getDepartment () {
        const { success, data } = await fetchData(depApi.get())
        if (success) {
            setDepartment(data)
        }
	}

	/* Модал setState функц */
	const handleModal = () => {
		setModal(!modal)
	}

	/* Устгах функц */
	const handleDelete = async(id) => {
        const {success} = await fetchData(groupApi.delete(id))
		if(success) {
            getDatas()
		}
	};

	/* Жагсаалтын дата авах функц */
	async function getDatas() {
        var department = select_value.department
        var degree = select_value.degree
        var profession = select_value.profession
        var join_year = select_value.join_year

        const {success, data} = await allFetch(groupApi.get(rowsPerPage, currentPage, sortField, searchValue, checkOnlyStudy, department, degree, profession, join_year))
        if(success) {
            setTotalCount(data?.count)
            setDatas(data?.results)

            // Нийт хуудасны тоо
            var cpage_count = Math.ceil(data?.count / rowsPerPage)
            setPageCount(cpage_count)
        }
	}

	const editModal = (id) => {
        /** NOTE Засах гэж буй хичээлийн стандартын id-г авна */
        setGroupId(id)
        setEditModal(!edit_modal)
    }

    const handleCheck = id => {
        if (id) {
            id == 1 ? setOnlyStudy(true) : setOnlyStudy(false)
        } else {
            setOnlyStudy('')
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

    function handleSearch() {
        getDatas()
    }

    // Хуудас солих үед ажиллах хэсэг
	function handlePagination(page) {
		setCurrentPage(page.selected + 1);
	};

	// Хайлтийн хэсэг хоосон болох үед анхны датаг дуудна

	useEffect(() => {
        if (searchValue.length == 0) {
			getDatas();
		} else {
			const timeoutId = setTimeout(() => {
				getDatas();
			}, 600);

			return () => clearTimeout(timeoutId);
		}
    }, [sortField, currentPage, rowsPerPage, searchValue, checkOnlyStudy, select_value])

    useEffect(() => {
        getProfession()
    }, [select_value.degree, select_value.department])

    useEffect(() => {
        getDepartment()
        getDegree()
        setYear(generateLessonYear(10))
    }, [])

    // ** Function to handle per page
    function handlePerPage(e) {
        setRowsPerPage(parseInt(e.target.value))
    }

	return (
		<Fragment>
            {isLoading && Loader}
			<Card>
				<CardHeader className="flex-md-row flex-column align-md-items-center align-items-start border-bottom">
					<CardTitle tag="h4">{t('Анги бүлгийн бүртгэл')}</CardTitle>
                    <div className='d-flex flex-wrap mt-md-0 mt-1'>
                        <Button color='primary' disabled={Object.keys(user).length > 0 && (user.permissions.includes('lms-student-group-create'))? false : true} onClick={() => handleModal()}>
                        {/* <Button color='primary' disabled={Object.keys(user).length > 0 && (user.permissions.includes('lms-student-group-create')  && school_id )? false : true} onClick={() => handleModal()}> */}
                            <Plus size={15} />
                            <span className='align-middle ms-50'>{t('Нэмэх')}</span>
                        </Button>
                    </div>
                </CardHeader>
                <Row className="justify-content-between mx-0 mt-1 mb-1">
                    <Col sm={6} lg={3}>
                        <Label className="form-label" for="department">
                            {t('Тэнхим')}
                        </Label>
                        <Controller
                            control={control}
                            defaultValue=''
                            name="department"
                            render={({ field: { value, onChange} }) => {
                                return (
                                    <Select
                                        name="department"
                                        id="department"
                                        classNamePrefix='select'
                                        isClearable
                                        className={classnames('react-select', { 'is-invalid': errors.department })}
                                        isLoading={isLoading}
                                        placeholder={t('-- Сонгоно уу --')}
                                        options={depOption || []}
                                        value={depOption.find((c) => c.id === value)}
                                        noOptionsMessage={() => t('Хоосон байна.')}
                                        onChange={(val) => {
                                            onChange(val?.id || '')
                                                setSelectValue({
                                                degree: select_value.degree,
                                                join_year: select_value.join_year,
                                                department: val?.id || '',
                                                profession: '',
                                            }),
                                            setValue('profession','')
                                        }}
                                        styles={ReactSelectStyles}
                                        getOptionValue={(option) => option.id}
                                        getOptionLabel={(option) => option.name}
                                    />
                                )
                            }}
                        ></Controller>
                    </Col>
                    <Col sm={6} lg={3}>
                        <Label className="form-label" for="degree">
                            {t('Боловсролын зэрэг')}
                        </Label>
                        <Controller
                            control={control}
                            defaultValue=''
                            name="degree"
                            render={({ field: { value, onChange} }) => {
                                return (
                                    <Select
                                        name="degree"
                                        id="degree"
                                        classNamePrefix='select'
                                        isClearable
                                        className={classnames('react-select', { 'is-invalid': errors.degree })}
                                        isLoading={isLoading}
                                        placeholder={t('-- Сонгоно уу --')}
                                        options={degreeOption || []}
                                        value={degreeOption.find((c) => c.id === value)}
                                        noOptionsMessage={() => t('Хоосон байна.')}
                                        onChange={(val) => {
                                            onChange(val?.id || '')
                                                setSelectValue({
                                                    join_year: select_value.join_year,
                                                    degree: val?.id || '',
                                                    department: select_value.department,
                                                    profession: '',
                                                }),
                                                setValue('profession','')
                                        }}
                                        styles={ReactSelectStyles}
                                        getOptionValue={(option) => option.id}
                                        getOptionLabel={(option) => option.degree_name}
                                    />
                                )
                            }}
                        />
                        </Col>
                        <Col sm={6} lg={3}>
                            <Label className="form-label" for="profession">
                                {t('Хөтөлбөр')}
                            </Label>
                            <Controller
                                control={control}
                                defaultValue=''
                                name="profession"
                                render={({ field: { value, onChange} }) => {
                                    return (
                                        <Select
                                            name="profession"
                                            id="profession"
                                            classNamePrefix='select'
                                            isClearable
                                            className={classnames('react-select', { 'is-invalid': errors.profession })}
                                            isLoading={isLoading}
                                            placeholder={t('-- Сонгоно уу --')}
                                            options={profOption || []}
                                            value={value && profOption.find((c) => c.id === value)}
                                            noOptionsMessage={() => t('Хоосон байна.')}
                                            onChange={(val) => {
                                                onChange(val?.id || '')
                                                setSelectValue({
                                                    degree: select_value.degree,
                                                    join_year: select_value.join_year,
                                                    profession: val?.id || '',
                                                    department: select_value.department,
                                                })
                                            }}
                                            styles={ReactSelectStyles}
                                            getOptionValue={(option) => option.id}
                                            getOptionLabel={(option) => option.full_name}
                                        />
                                    )
                                }}
                        />
                        </Col>
                        <Col sm={6} lg={3} >
                            <Label className="form-label" for="join_year">
                                {t('Элссэн хичээлийн жил')}
                            </Label>
                            <Controller
                                control={control}
                                defaultValue=''
                                name="join_year"
                                render={({ field: { value, onChange} }) => {
                                    return (
                                        <Select
                                            name="join_year"
                                            id="join_year"
                                            classNamePrefix='select'
                                            isClearable
                                            className={classnames('react-select', { 'is-invalid': errors.join_year })}
                                            isLoading={isLoading}
                                            placeholder={t('-- Сонгоно уу --')}
                                            options={yearOption || []}
                                            value={value && yearOption.find((c) => c.id === value)}
                                            noOptionsMessage={() => t('Хоосон байна.')}
                                            onChange={(val) => {
                                                onChange(val?.id || '')
                                                setSelectValue({
                                                    degree: select_value.degree,
                                                    join_year: val?.id || '',
                                                    profession: select_value.profession,
                                                    department: select_value.department,
                                                })
                                            }}
                                            styles={ReactSelectStyles}
                                            getOptionValue={(option) => option.id}
                                            getOptionLabel={(option) => option.name}
                                        />
                                    )
                                }}
                            />
                    </Col>
                    <Col sm={6} md={3} className='mt-1'>
                        <Label className="form-label" for="status">
                            {t("Төлөв")}
                        </Label>
                        <Select
                            name="status"
                            id="status"
                            classNamePrefix='select'
                            isClearable
                            className={classnames('react-select')}
                            isLoading={isLoading}
                            placeholder={`-- Сонгоно уу --`}
                            options={status_option || []}
                            value={status_option.find((c) => c.id === select_value.status)}
                            noOptionsMessage={() => 'Хоосон байна'}
                            onChange={(val) => {
                                handleCheck(val?.id)
                            }}
                            styles={ReactSelectStyles}
                            getOptionValue={(option) => option.id}
                            getOptionLabel={(option) => option.name}
                        />
                    </Col>
                </Row>
                <Row className="justify-content-between mx-0">
                    <Col className='d-flex align-items-center justify-content-start' md={4}>
                        <Col md={3} sm={2} className='pe-1'>
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
                        <Col md={9} sm={3}>
                            <Label for='sort-select'>{t('Хуудсанд харуулах тоо')}</Label>
                        </Col>
                    </Col>
                    <Col className='d-flex align-items-center mobile-datatable-search mt-1' md={4} sm={12}>
                        <Input
                            className='dataTable-filter mb-50'
                            type='text'
                            bsSize='sm'
                            id='search-input'
                            placeholder={t("Хайх үг....")}
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
					<div className="react-dataTable react-dataTable-selectable-rows">
						<DataTable
                            noHeader
							paginationServer
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
                            columns={getColumns(currentPage, rowsPerPage, pageCount, editModal, handleDelete, user)}
                            sortIcon={<ChevronDown size={10} />}
                            paginationPerPage={rowsPerPage}
                            paginationDefaultPage={currentPage}
                            data={datas}
                            paginationComponent={getPagination(handlePagination, currentPage, rowsPerPage, total_count)}
                            fixedHeader
                            fixedHeaderScrollHeight='62vh'
                        />
					</div>
				{modal && <Addmodal open={modal} handleModal={handleModal} refreshDatas={getDatas} />}
			    {edit_modal && <EditModal open={edit_modal} handleModal={editModal} group_id={group_id} refreshDatas={getDatas} />}
        	</Card>
        </Fragment>
    )
}

export default Score;
