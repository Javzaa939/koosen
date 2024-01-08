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
    Progress,
} from 'reactstrap'

import { useTranslation } from 'react-i18next'

import Select from 'react-select'

import { ChevronDown, Plus, Search } from 'react-feather'

import { useForm, Controller } from "react-hook-form";

import DataTable from 'react-data-table-component'

import classnames from "classnames";

import useApi from '@hooks/useApi';
import useModal from '@hooks/useModal'
import useLoader from '@hooks/useLoader';
import AuthContext from '@context/AuthContext'
import SchoolContext from '@context/SchoolContext'

import { getPagination, ReactSelectStyles, lesson_level, lesson_type } from '@utils'

import { getColumns } from './helpers'

import Addmodal from './Add'
import EditModal from './Edit'

const StudyPlan = () => {

    const { t } = useTranslation()
    const { user } = useContext(AuthContext)
    const { school_id } = useContext(SchoolContext)

    var values = {
        profession: '',
        lesson_level: '',
        lesson_type: '',
        department: '',
        confirm_year: '',
        degree: '',
    }

    // ** Hook
    const { control, setValue, formState: { errors } } = useForm({});

    const { Loader, isLoading, fetchData } = useLoader({})

    const default_page = [10, 15, 50, 75, 100]

    const { showWarning } = useModal()

    // Хуудаслалтын анхны утга
    const [currentPage, setCurrentPage] = useState(1)

    // Нэг хуудсанд харуулах нийт датаны тоо
    const [rowsPerPage, setRowsPerPage] = useState(10)

    // Хайлт хийхэд ажиллах хувьсагч
    const [searchValue, setSearchValue] = useState('')

    // Нийт датаны тоо
    const [total_count, setTotalCount] = useState(1)

    // Эрэмбэлэлт
    const [sortField, setSort] = useState('')

    const [edit_modal, setEditModal] = useState(false)
    const [plan_id, setPlanId] = useState('')
    const [modal, setModal] = useState(false)
    const [datas, setDatas] = useState([])

    const [department_option, setDepartmentOption] = useState([])
    const [lessonlevel, setLessonLevel] = useState(lesson_level)
    const [lessontype, setLessonType] = useState(lesson_type)
    const [profession_option, setProfessionOption] = useState([])
    const [year_option, setConfirmYear] = useState([])
    const [degree_option, setDegree] = useState([])

    const [default_check, setDefaultChecked] = useState([])
    const [check_select, setCheckSelect] = useState(false)

    const [select_value, setSelectValue] = useState(values)
    const [progress_value, setProgressValue] = useState(0)

    // Api
    const planApi = useApi().study.plan
    const professionApi = useApi().study.professionDefinition
    const departmentApi = useApi().hrms.department
    const confirmyearApi = useApi().study.confirmyear
    const degreeApi = useApi().settings.professionaldegree

    useEffect(() => {
        getDatas()
    }, [sortField, currentPage, rowsPerPage, select_value])

    async function getDatas() {
        const page_count = Math.ceil(total_count / rowsPerPage)

        if (page_count < currentPage && page_count != 0) {
            setCurrentPage(page_count)
        }

        var profession = select_value?.profession
        var lesson_level = select_value?.lesson_level
        var lesson_type = select_value?.lesson_type
        var department = select_value?.department

        // Сонгосон утгуудын дагуу датаг авна
        if(profession && lesson_level && lesson_type && department) {
            const { success, data } = await fetchData(planApi.search(department, lesson_level, lesson_type, profession, rowsPerPage, currentPage, sortField, searchValue))
            if (success) {
                setTotalCount(data?.count)
                setDatas(data?.results)
            }
        }
    }

    // Тэнхимын жагсаалт
    async function getDepartmentOption() {
        const { success, data } = await fetchData(departmentApi.get())
        if(success) {
            setDepartmentOption(data)
        }
    }

    // // Боловсролын зэргийн жагсаалт
    // async function getDegreeOption() {
    //     const { success, data } = await fetchData(degreeApi.get())
    //     if(success) {
    //         setDegree(data)
    //     }
    // }

    // // Хөтөлбөр батлагдсан оны жагсаалт
    // async function getConfirmYear() {
    //     const { success, data } = await fetchData(confirmyearApi.get())
    //     if(success) {
    //         setConfirmYear(data)
    //     }
    // }

    // Хөтөлбөрийн жагсаалтын getList функц боловсролын зэргээс хамаарч жагсаалтаа авна. Шаардлагагүй үед хоосон string явуулна.
    async function getProfession() {
        const { success, data } = await fetchData(professionApi.getList(select_value.degree, select_value.department, select_value.confirm_year))
        if(success) {
            setProfessionOption(data)
        }
    }


    // useEffect(() => {
    //     getConfirmYear()
    //     getDegreeOption()
    // },[])

    useEffect(() => {
        if(school_id){
            getDepartmentOption()
            getProfession()
        }
    },[school_id, select_value])

    // ** Function to handle Modal toggle
    const handleModal = () => {
        setModal(!modal)
    }

    const editModal = (id) => {
        /** NOTE Засах гэж буй хичээлийн стандартын id-г авна */
        setPlanId(id)
        setEditModal(!edit_modal)
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

    // Хайлтийн хэсэг хоосон болох үед анхны датаг дуудна
    useEffect(() => {
        if (!searchValue) {
            getDatas()
        }
    },[searchValue])

    function getSelectValues(name, value) {
        var checked = default_check

        if(value) {
            if(!checked.includes(name)) {
                checked.push(name)
            }
        }
        else {
            if(checked.includes(name)) {
                var index = checked.indexOf(name)
                checked.splice(index, 1)
            }
        }

        if(checked.length === 4) {
            setCheckSelect(true)
        } else setCheckSelect(false)

        var value = 0
        if(checked.length === 1) {
            value = 25
        } else if(checked.length === 2) {
            value = 50
        } else if(checked.length === 3) {
            value = 75
        }
        else if(checked.length === 4) {
            value = 100
        }

        setProgressValue(value)
    }

    // Устгах функц
    async function handleDelete(id) {
        const { success } = await fetchData(planApi.delete(id))
        if(success) {
            getDatas()
        }
    }

    return (
        <Fragment>
            <Card>
                <CardHeader className='flex-md-row flex-column align-md-items-center align-items-start border-bottom'>
                    <CardTitle tag='h4'>{t('Сургалтын төлөвлөгөө')}</CardTitle>
                    {
                        check_select &&
                        <div className='d-flex flex-wrap mt-md-0 mt-1'>
                            <Button
                                color='primary'
                                onClick={() => handleModal()}
                                disabled={Object.keys(user).length > 0 && user.permissions.includes('lms-study-learningplan-create')  && school_id ? false : true}
                            >
                                <Plus size={15} />
                                <span className='align-middle ms-50'>{t('Нэмэх')}</span>
                            </Button>
                        </div>
                    }
                </CardHeader>
                <Row className="mx-50 gy-1 my-1" sm={12}>
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
                                        options={department_option || []}
                                        value={department_option.find((c) => c.id === value)}
                                        noOptionsMessage={() => t('Хоосон байна.')}
                                        onChange={(val) => {
                                            onChange(val?.id || '')
                                            getSelectValues('department', val?.id)
                                            if (val?.id) {
                                                setSelectValue(current => {
                                                    return {
                                                        ...current,
                                                        department: val?.id
                                                    }
                                                })
                                            } else {
                                                setSelectValue(current => {
                                                    return {
                                                        ...current,
                                                        department: ''
                                                    }
                                                })
                                            }
                                            setValue('profession', '')
                                        }}
                                        styles={ReactSelectStyles}
                                        getOptionValue={(option) => option.id}
                                        getOptionLabel={(option) => option.name}
                                    />
                                )
                            }}
                        ></Controller>
                    </Col>
                    {/* <Col sm={6} lg={3}>
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
                                        options={degree_option || []}
                                        value={degree_option.find((c) => c.id === value)}
                                        noOptionsMessage={() => t('Хоосон байна.')}
                                        onChange={(val) => {
                                            onChange(val?.id || '')
                                            if (val?.id) {
                                                setSelectValue(current => {
                                                    return {
                                                        ...current,
                                                        degree: val?.id
                                                    }
                                                })
                                            } else {
                                                setValue()
                                                setSelectValue(current => {
                                                    return {
                                                        ...current,
                                                        degree: ''
                                                    }
                                                })
                                            }
                                            setValue('profession', '')
                                        }}
                                        styles={ReactSelectStyles}
                                        getOptionValue={(option) => option.id}
                                        getOptionLabel={(option) => option.degree_name_code}
                                    />
                                )
                            }}
                        ></Controller>
                    </Col>
                    <Col sm={6} lg={3}>
                        <Label className="form-label" for="confirm_year">
                            {t('Хөтөлбөр батлагдсан он')}
                        </Label>
                        <Controller
                            control={control}
                            defaultValue=''
                            name="confirm_year"
                            render={({ field: { value, onChange} }) => {
                                return (
                                    <Select
                                        name="confirm_year"
                                        id="confirm_year"
                                        classNamePrefix='select'
                                        isClearable
                                        className={classnames('react-select', { 'is-invalid': errors.confirm_year })}
                                        isLoading={isLoading}
                                        placeholder={t('-- Сонгоно уу --')}
                                        options={year_option || []}
                                        value={year_option.find((c) => c.confirm_year === value)}
                                        noOptionsMessage={() => t('Хоосон байна.')}
                                        onChange={(val) => {
                                            onChange(val?.confirm_year || '')
                                            if (val?.confirm_year) {
                                                setSelectValue(current => {
                                                    return {
                                                        ...current,
                                                        confirm_year: val?.confirm_year
                                                    }
                                                })
                                            } else {
                                                setSelectValue(current => {
                                                    return {
                                                        ...current,
                                                        confirm_year: ''
                                                    }
                                                })
                                            }
                                        }}
                                        styles={ReactSelectStyles}
                                        getOptionValue={(option) => option.confirm_year}
                                        getOptionLabel={(option) => option.confirm_year}
                                    />
                                )
                            }}
                        ></Controller>
                    </Col> */}
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
                                        options={profession_option || []}
                                        value={value && profession_option.find((c) => c.id === value)}
                                        noOptionsMessage={() => t('Хоосон байна.')}
                                        onChange={(val) => {
                                            onChange(val?.id || '')
                                            getSelectValues('profession', val?.id)
                                            if (val?.id) {
                                                setSelectValue(current => {
                                                    return {
                                                        ...current,
                                                        profession: val?.id
                                                    }
                                                })
                                            } else {
                                                setSelectValue(current => {
                                                    return {
                                                        ...current,
                                                        profession: ''
                                                    }
                                                })
                                            }
                                        }}
                                        styles={ReactSelectStyles}
                                        getOptionValue={(option) => option.id}
                                        getOptionLabel={(option) => option.full_name}
                                    />
                                )
                            }}
                        ></Controller>
                    </Col>
                    <Col sm={6} lg={3}>
                        <Label className="form-label" for="lesson_level">
                            {t('Хичээлийн түвшин')}
                        </Label>
                        <Controller
                            control={control}
                            defaultValue=''
                            name="lesson_level"
                            render={({ field: { value, onChange} }) => {
                                return (
                                    <Select
                                        name="lesson_level"
                                        id="lesson_level"
                                        classNamePrefix='select'
                                        isClearable
                                        className={classnames('react-select', { 'is-invalid': errors.lesson_level })}
                                        isLoading={isLoading}
                                        placeholder={t('-- Сонгоно уу --')}
                                        options={lessonlevel || []}
                                        value={lessonlevel.find((c) => c.id === value)}
                                        noOptionsMessage={() => t('Хоосон байна.')}
                                        onChange={(val) => {
                                            onChange(val?.id || '')
                                            getSelectValues('lesson_level', val?.id)
                                            if (val?.id) {
                                                setSelectValue(current => {
                                                    return {
                                                        ...current,
                                                        lesson_level: val?.id
                                                    }
                                                })
                                            } else {
                                                setSelectValue(current => {
                                                    return {
                                                        ...current,
                                                        lesson_level: ''
                                                    }
                                                })
                                            }
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
                        <Label className="form-label" for="lesson_type">
                            {t('Хичээлийн төрөл')}
                        </Label>
                        <Controller
                            control={control}
                            defaultValue=''
                            name="lesson_type"
                            render={({ field: { value, onChange} }) => {
                                return (
                                    <Select
                                        name="lesson_type"
                                        id="lesson_type"
                                        classNamePrefix='select'
                                        isClearable
                                        className={classnames('react-select', { 'is-invalid': errors.lesson_type })}
                                        isLoading={isLoading}
                                        placeholder={t('-- Сонгоно уу --')}
                                        options={lessontype || []}
                                        value={lessontype.find((c) => c.id === value)}
                                        noOptionsMessage={() => t('Хоосон байна.')}
                                        onChange={(val) => {
                                            onChange(val?.id || '')
                                            getSelectValues('lesson_type', val?.id)
                                            if (val?.id) {
                                                setSelectValue(current => {
                                                    return {
                                                        ...current,
                                                        lesson_type: val?.id
                                                    }
                                                })
                                            } else {
                                                setSelectValue(current => {
                                                    return {
                                                        ...current,
                                                        lesson_type: ''
                                                    }
                                                })
                                            }
                                        }}
                                        styles={ReactSelectStyles}
                                        getOptionValue={(option) => option.id}
                                        getOptionLabel={(option) => option.name}
                                    />
                                )
                            }}
                        ></Controller>
                    </Col>
                    {
                        !check_select &&
                        <div className='demo-vertical-spacing'>
                            <span className='mb-50'>{progress_value === 0 && `${t('Дээрх утгуудыг сонгоно уу…')}`}</span>
                            <Progress value={progress_value}>{progress_value}</Progress>
                        </div>
                    }
                </Row>
                {
                    check_select &&
                    <>
                        <Row className='justify-content-between mx-0'>
                            <Col className='d-flex align-items-center justify-content-start' md={6} sm={12}>
                                <Col md={2} sm={3} className='pe-1'>
                                    <Input
                                        className='dataTable-select me-1 mb-50'
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
                            <Col className='d-flex align-items-center mobile-datatable-search' md={6} sm={12}>
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
                                progressComponent={<h5>{t('Түр хүлээнэ үү')}...</h5>}
                                noDataComponent={(
                                    <div className="my-2">
                                        <h5>{t('Өгөгдөл байхгүй байна')}</h5>
                                    </div>
                                )}
                                onSort={handleSort}
                                sortIcon={<ChevronDown size={10} />}
                                columns={getColumns(currentPage, rowsPerPage, total_count, editModal, handleDelete, user, showWarning)}
                                paginationPerPage={rowsPerPage}
                                paginationDefaultPage={currentPage}
                                paginationComponent={getPagination(handlePagination, currentPage, rowsPerPage, total_count)}
                                data={datas}
                                fixedHeader
                                fixedHeaderScrollHeight='62vh'
                            />
                        </div>
                    </>
                }
            </Card>
            {modal && <Addmodal open={modal} handleModal={handleModal} refreshDatas={getDatas} field_select_value={select_value} />}
            {edit_modal && <EditModal open={edit_modal} handleModal={editModal} plan_id={plan_id} refreshDatas={getDatas} field_select_value={select_value} />}
        </Fragment>
    )
}

export default StudyPlan;
