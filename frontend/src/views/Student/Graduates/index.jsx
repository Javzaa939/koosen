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
    DropdownMenu,
    DropdownItem,
    DropdownToggle,
    UncontrolledButtonDropdown
} from 'reactstrap'

import { ChevronDown, Plus, Search, FileText, Grid, Download } from 'react-feather'

import { useNavigate } from 'react-router-dom'

import Select from 'react-select'
import classnames from "classnames";

import DataTable from 'react-data-table-component'

import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';

import { useForm, Controller } from "react-hook-form";

import AuthContext from '@context/AuthContext'
import SchoolContext from '@context/SchoolContext'

import { getPagination, ReactSelectStyles, generateLessonYear, level_option } from '@utils'

import { getColumns } from './helpers'

import Addmodal from '../Register/Add'

import { useTranslation } from 'react-i18next'
import { downloadCSV, downloadExcel } from '@utils'

const Graduates = () => {

    const { user } = useContext(AuthContext)
    const { school_id } = useContext(SchoolContext)
    const navigate = useNavigate()

    const { t } = useTranslation()

    const excelColumns = {
        'code': 'Оюутны код',
        'last_name': 'Овог',
        'first_name': 'Нэр',
        'register_num': 'Регистрийн дугаар',
        'profession_name': 'Хөтөлбөр',
        'group_name': 'Анги',
        'group_level': 'Курс',
    }

    // ** Hook
    const { control, formState: { errors } } = useForm({});

    var values = {
        profession: '',
        join_year: '',
        group: '',
        department: '',
        degree: '',
        status: ''
    }
    const [select_value, setSelectValue] = useState(values)
    const default_page = [10, 15, 50, 75, 100]
    const [modal, setModal] = useState(false)

    const [datas, setDatas] = useState([])
    const [department_option, setDepartmentOption] = useState([])
    const [status_option, setStatusOption] = useState([])
    const [degree_option, setDegree] = useState([])
    const [profession_option, setProfessionOption] = useState([])
    const [groupOption, setGroup] = useState([])
    const [yearOption, setYear] = useState(generateLessonYear(10))
    const [level, setLevel] = useState('')

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

    //const[department, setDepartment] = useState('')

    const { Loader, isLoading, fetchData } = useLoader({isFullScreen: false})
    const { isLoading: isTableLoading, fetchData: allFetch } = useLoader({isFullScreen: false})

    const studentApi = useApi().student
    const groupApi = useApi().student.group
    const departmentApi = useApi().hrms.department
    const degreeApi = useApi().settings.professionaldegree
    const professionApi = useApi().study.professionDefinition
    const settingsApi = useApi().settings.studentRegisterType

    // API
    useEffect(() => {
        getDatas()
    }, [sortField, currentPage, rowsPerPage, level, select_value])

    useEffect(
        () =>
        {
            getDegreeOption()
            getProfession()
            getGroup()
            getDepartmentOption()
        },
        [select_value, school_id]
    )

    useEffect(
        () =>
        {
            getStatus()
        },
        []
    )

    // Тэнхимын жагсаалт
    async function getDepartmentOption() {
        const { success, data } = await fetchData(departmentApi.get())
        if(success) {
            setDepartmentOption(data)
        }
    }

    // Суралцаж буй хэлбэрийн жагсаалт
    async function getStatus() {
        const { success, data } = await fetchData(settingsApi.get())
        if(success) {
            setStatusOption(data)
        }
    }

    // Боловсролын зэргийн жагсаалт
    async function getDegreeOption() {
        const { success, data } = await fetchData(degreeApi.get())
        if(success) {
            setDegree(data)
        }

    }

    // Хөтөлбөрийн жагсаалтын getList функц боловсролын зэргээс хамаарч жагсаалтаа авна. Шаардлагагүй үед хоосон string явуулна.
    async function getProfession() {
        const { success, data } = await fetchData(professionApi.getList(select_value?.degree, select_value.department,''))
        if(success) {
            setProfessionOption(data)
        }
    }

    // Ангийн жагсаалт
    async function getGroup() {
        const { success, data } = await fetchData(groupApi.getList(select_value.department, select_value.degree, select_value.profession, select_value.join_year))
        if(success) {
            setGroup(data)
        }
    }

    async function getDatas() {

        var department = select_value?.department
        var profession = select_value?.profession
        var degree = select_value?.degree
        var group = select_value?.group
        var join_year = select_value?.join_year

        const page_count = Math.ceil(total_count / rowsPerPage)

        if (page_count < currentPage && page_count != 0) {
            setCurrentPage(page_count)
        }

        //АРИУНААГИЙН НЭМСЭН ФУНКЦ
        const {success: success1, data: data1} = await allFetch(studentApi.getGraduate1(rowsPerPage, currentPage, sortField, searchValue, department, degree, profession, group))
        if(success1)
        {
            setTotalCount(data1?.count)
            setDatas(data1?.results)
            // var cpage_count = Math.ceil(data?.count / rowsPerPage)
            // setPageCount(cpage_count)
        }
    }

   
    /* Устгах функц */
	const handleDelete = async(id) => {
        const { success, data } = await fetchData(studentApi.delete(id))
        if(success)
        {
            getDatas()
        }
	};

    // ** Function to handle Modal toggle
    const handleModal = () => {
        setModal(!modal)
    }

    const editModal = (student_id) => {
        navigate(`/student/register/${student_id}/detail/`)
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
		if (searchValue.length == 0) {
			getDatas();
		} else {
			// const timeoutId = setTimeout(() => {
			// 	getDatas();
			// }, 600);

			// return () => clearTimeout(timeoutId);
		}
	}, [searchValue]);

     /** excel file аар татуулах датаг backend-ээс авах */
     async function excelDownload(type) {
        var keys = Object.keys(excelColumns)

        const { success, data } = await fetchData(studentApi.download(searchValue, select_value.department, select_value.degree, select_value.profession, select_value.group, select_value.join_year, select_value?.status, level))
        if (success) {
            data.forEach((cdata) => {
                for(let key in cdata) {
                    if (!keys.includes(key)) {
                        delete cdata[key]
                    }
                }
            })
            if (type === 'excel') {
                downloadExcel(data, excelColumns, 'Оюутны жагсаалт')
            } else if (type === 'csv') {
                downloadCSV(data, excelColumns, 'Оюутны жагсаалт')
            }
        } else {
            addToast({
                text: "Файл татахад алдаа гарлаа",
                type: "warning"
            })
        }
    }

    return (    
        <Fragment>
      
        <Card>
        <CardHeader className='flex-md-row flex-column align-md-items-center align-items-start border-bottom'>
                    <CardTitle tag='h4'>{t('Оюутны бүртгэл')}</CardTitle>
                    <div className='d-flex flex-wrap mt-md-0 mt-1'>
                    <UncontrolledButtonDropdown disabled={Object.keys(user).length > 0 && user.permissions.includes('lms-student-register-read')?false : true}>
                    {/* <UncontrolledButtonDropdown disabled={Object.keys(user).length > 0 && user.permissions.includes('lms-student-register-read')  && school_id? false : true}> */}
                        <DropdownToggle color='secondary' className='m-50' caret outline>
                            <Download size={15} />
                            <span className='align-middle ms-50'>Export</span>
                        </DropdownToggle>
                        <DropdownMenu>
                            <DropdownItem className='w-100' onClick={() => excelDownload('csv')}>
                                <FileText size={15} />
                                <span className='align-middle ms-50'>CSV</span>
                            </DropdownItem>
                            <DropdownItem className='w-100' onClick={() => excelDownload('excel')}>
                                <Grid size={15} />
                                <span className='align-middle ms-50' >Excel</span>
                            </DropdownItem>
                        </DropdownMenu>
                    </UncontrolledButtonDropdown>
                    <Button
                        color='primary'
                        onClick={() => handleModal()}
                        className="m-50"
                        disabled={Object.keys(user).length > 0 && user.permissions.includes('lms-student-register-create') ? false : true}
                    >
                        <Plus size={15} />
                        <span className='align-middle ms-50'>{t('Нэмэх')}</span>
                    </Button>
                    </div>
                </CardHeader>
        {isLoading && Loader}

           
            <Row className="justify-content-start mx-0 mt-1 mb-1" sm={12}>
                <Col sm={6} lg={3} >
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
                                    placeholder={`-- Сонгоно уу --`}
                                    options={department_option || []}
                                    value={department_option.find((c) => c.id === value)}
                                    noOptionsMessage={() => 'Хоосон байна'}
                                    onChange={(val) => {
                                        onChange(val?.id || '')
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
                        {t("Боловсролын зэрэг")}
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
                                    placeholder={`-- Сонгоно уу --`}
                                    options={degree_option || []}
                                    value={degree_option.find((c) => c.id === value)}
                                    noOptionsMessage={() => 'Хоосон байна'}
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
                                            setSelectValue(current => {
                                                return {
                                                    ...current,
                                                    degree: ''
                                                }
                                            })
                                        }
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
                    <Label className="form-label" for="profession">
                        {t('Хөтөлбөр')}
                    </Label>
                    <Select
                        name="profession"
                        id="profession"
                        classNamePrefix='select'
                        isClearable
                        className={classnames('react-select', { 'is-invalid': errors.profession })}
                        isLoading={isLoading}
                        placeholder={`-- Сонгоно уу --`}
                        options={profession_option || []}
                        value={profession_option.find((c) => c.id === select_value.profession)}
                        noOptionsMessage={() => 'Хоосон байна'}
                        onChange={(val) => {
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
                </Col>
                <Col sm={6} lg={3} >
                    <Label className="form-label" for="group">
                        {t("Анги")}
                    </Label>
                    <Select
                        name="group"
                        id="group"
                        classNamePrefix='select'
                        isClearable
                        className={classnames('react-select', { 'is-invalid': errors.group })}
                        isLoading={isLoading}
                        placeholder={`-- Сонгоно уу --`}
                        options={groupOption || []}
                        value={groupOption.find((c) => c.id === select_value.group)}
                        noOptionsMessage={() => 'Хоосон байна'}
                        onChange={(val) => {
                            if (val?.id) {
                                setSelectValue(current => {
                                    return {
                                        ...current,
                                        group: val?.id
                                    }
                                })
                            } else {
                                setSelectValue(current => {
                                    return {
                                        ...current,
                                        group: ''
                                    }
                                })
                            }
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
            <div className='react-dataTable react-dataTable-selectable-rows' id='datatableLeftTwoRightOne' >
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

export default Graduates;
