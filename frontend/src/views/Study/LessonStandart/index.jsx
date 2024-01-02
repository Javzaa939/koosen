// ** React Imports
import { Fragment, useState, useEffect, useContext } from 'react'

import {
    Row,
    Col,
    Card,
    Input,
    Label,
    Button,
    CardTitle,
    CardHeader,
    Spinner,
} from 'reactstrap'

import { ChevronDown, Plus, Search } from 'react-feather'

import { useTranslation } from 'react-i18next'

import DataTable from 'react-data-table-component'

import { useForm, Controller } from "react-hook-form";

import { useNavigate } from 'react-router-dom'

import Select from 'react-select'

import classnames from 'classnames'

import useApi from '@hooks/useApi';

import useLoader from '@hooks/useLoader';

import AuthContext from '@context/AuthContext'

import SchoolContext from '@context/SchoolContext'

import { getPagination, ReactSelectStyles } from '@utils'

import { getColumns } from './helpers'

import Addmodal from './Add'

const LessonStandart = () => {

    // ** Hook
    const { control, formState: { errors } } = useForm({});

    const queryParameters = new URLSearchParams(window.location.search)
    const params_search = queryParameters.get("searchValue")

    const { user } = useContext(AuthContext)
    const { school_id } = useContext(SchoolContext)
    const { t } = useTranslation()
    const navigate = useNavigate()

    const default_page = [10, 15, 50, 75, 100]
    const [modal, setModal] = useState(false)
    const [datas, setDatas] = useState([])

    // Хуудаслалтын анхны утга
    const [currentPage, setCurrentPage] = useState(1)

    // Нэг хуудсанд харуулах нийт датаны тоо
    const [rowsPerPage, setRowsPerPage] = useState(10)

    // Хайлт хийхэд ажиллах хувьсагч
    const [searchValue, setSearchValue] = useState(params_search ? params_search : '')

    // Нийт датаны тоо
    const [total_count, setTotalCount] = useState(1)

    // Эрэмбэлэлт
    const [sortField, setSort] = useState('')

    const { Loader, isLoading, fetchData } = useLoader({isFullScreen: false})
    const { isLoading: isTableLoading, fetchData: allFetch } = useLoader({isFullScreen: false})

    const [dep_option, setDepOption] = useState([])
    const [lessonCategory_option, setLessonCategory_option] = useState ([])
    const [dep_id, setDepId] = useState('')
    const [category_id, setCategoryId] = useState('')

    // Apib
    const lessonStandartApi = useApi().study.lessonStandart
    const departmentApi = useApi().hrms.department
    const lessonCategoryApi = useApi().settings.lessonCategory

    useEffect(() => {
        if (searchValue.length == 0) {
			getDatas();
		} else {
			const timeoutId = setTimeout(() => {
				getDatas();
			}, 600);

			return () => clearTimeout(timeoutId);
		}
    }, [sortField, currentPage, rowsPerPage, searchValue, dep_id, category_id, params_search])

    async function getDatas() {

        const page_count = Math.ceil(total_count / rowsPerPage)

        if (page_count < currentPage && page_count != 0) {
            setCurrentPage(page_count)
        }

        const { success, data } = await allFetch(lessonStandartApi.get(rowsPerPage, currentPage, sortField, searchValue, dep_id, category_id))
        if (success) {
            setTotalCount(data?.count)
            setDatas(data?.results)
        }
    }

    /* Устгах функц */
	const handleDelete = async(id) => {
		const { success } = await fetchData(lessonStandartApi.delete(id))
		if(success) {
			getDatas()
		}
	};

    /**Хөтөлбөрийн багын жагсаалт */
    async function getDepartment() {
        const { success, data } = await fetchData(departmentApi.get())
        if(success) {
            setDepOption(data)
        }
    }

      /**Ангилал жагсаалт */
      async function getLessonCategory() {
        const { success, data } = await fetchData(lessonCategoryApi.get())
        if(success) {
            setLessonCategory_option(data)
        }
    }

    useEffect(() => {
        getDepartment()
        getLessonCategory()
    },[])

    // ** Function to handle Modal toggle
    const handleModal = () => {
        setModal(!modal)
    }

    const editModal = (id) => {
        /** NOTE Засах гэж буй хичээлийн стандартын id-г авна */
        navigate(`/study/lessonStandart/${id}/?searchValue=${searchValue}`)
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
	function handlePagination(page) {
		setCurrentPage(page.selected + 1);
	};

    // ** Function to handle per page
    function handlePerPage(e) {
        setRowsPerPage(parseInt(e.target.value))
    }

    // Хайх товч дарсан үед ажиллах функц
    async function handleSearch() {
        if (searchValue.length > 0) getDatas()
    }

    useEffect(
        () =>
        {
            if (params_search) setSearchValue(params_search)
        },
        []
    )

    return (
        <Fragment>
            <Card>
            {isLoading && Loader}
                <CardHeader className='flex-md-row flex-column align-md-items-center align-items-start border-bottom'>
                    <CardTitle tag='h4'>{t('Хичээлийн стандарт')}</CardTitle>
                    <div className='d-flex flex-wrap mt-md-0 mt-1'>
                        <Button
                            color='primary'
                            disabled={Object.keys(user).length > 0 && (user.permissions.includes('lms-study-lessonstandart-create') && school_id) ? false : true}
                            onClick={() => handleModal()}>
                            <Plus size={15} />
                            <span className='align-middle ms-50'>{t('Нэмэх')}</span>
                        </Button>
                    </div>
                </CardHeader>
                <Row className='mx-0 mt-50'>
                    <Col sm={4} lg={4} md={4} className='mb-1'>
                        <Label className="form-label" for="department">
                            {t('Хөтөлбөрийн баг')}
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
                                        options={dep_option || []}
                                        value={dep_option.find((c) => c.id === value)}
                                        noOptionsMessage={() => t('Хоосон байна.')}
                                        onChange={(val) => {
                                            onChange(val?.id || '')
                                            setDepId(val?.id || '')
                                        }}
                                        styles={ReactSelectStyles}
                                        getOptionValue={(option) => option.id}
                                        getOptionLabel={(option) => option.name}
                                    />
                                )
                            }}
                        ></Controller>
                    </Col>
                    <Col sm={4} lg={4} md={4} className='mb-1'>
                        <Label className="form-label" for="lessonCategory">
                            {t('Хичээлийн Ангилал')}
                        </Label>
                        <Controller
                            control={control}
                            defaultValue=''
                            name="lessonCategory"
                            render={({ field: { value, onChange} }) => {
                                return (
                                    <Select
                                        name="lessonCategory"
                                        id="lessonCategory"
                                        classNamePrefix='select'
                                        isClearable
                                        className={classnames('react-select', { 'is-invalid': errors.lessonCategory })}
                                        isLoading={isLoading}
                                        placeholder={t('-- Сонгоно уу --')}
                                        options={lessonCategory_option || []}
                                        value={lessonCategory_option.find((c) => c.id === value)}
                                        noOptionsMessage={() => t('Хоосон байна.')}
                                        onChange={(val) => {
                                            onChange(val?.id || '')
                                            setCategoryId (val?.id || '')
                                        }}
                                        styles={ReactSelectStyles}
                                        getOptionValue={(option) => option.id}
                                        getOptionLabel={(option) => option.category_name}
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
                    <Col className='d-flex align-items-center mobile-datatable-search mt-1' md={6} sm={12}>
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
                <div className='react-dataTable react-dataTable-selectable-rows' id='datatableLeftTwoRightOne'>
                    <DataTable
                        noHeader
                        pagination
                        paginationServer
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
                        columns={getColumns(currentPage, rowsPerPage, total_count, editModal, handleDelete, user)}
                        paginationPerPage={rowsPerPage}
                        paginationDefaultPage={currentPage}
                        paginationComponent={getPagination(handlePagination, currentPage, rowsPerPage, total_count)}
                        data={datas}
                        fixedHeader
                        fixedHeaderScrollHeight='62vh'
                    />
                </div>
            </Card>
            {modal && <Addmodal open={modal} handleModal={handleModal} refreshDatas={getDatas} />}
        </Fragment>
    )
}

export default LessonStandart;
