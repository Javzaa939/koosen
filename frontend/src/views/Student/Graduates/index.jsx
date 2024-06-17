// ** React Imports
import { Fragment, useState, useEffect } from 'react'

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

import { ChevronDown, Search, FileText, Grid, Download } from 'react-feather'


import Select from 'react-select'
import classnames from "classnames";

import DataTable from 'react-data-table-component'

import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';

import { useForm, Controller } from "react-hook-form";

import { getPagination, ReactSelectStyles } from '@utils'

import { getColumns } from './helpers'
import excelDownload from '@src/utility/excelDownload'

import { useTranslation } from 'react-i18next'
import { downloadCSV, downloadExcel } from '@utils'

const Graduates = () => {


    const { t } = useTranslation()

    const excelColumns = {
        'full_name': 'Овог, Нэр',
        'department_name': 'Салбар нэр',
        'school_name': "Сургуулийн нэр",
        'dep_name':'Мэргэжлийн чиглэл',
        'profession_code':'Мэргэжлийн чиглэлийн индекс',
        'learning_status':'Сургалтын хэлбэр',
        'degree_name':'Боловсролын зэрэг',
        'deplom_num':'Дипломын дугаар',
        'registration_num':'Бүртгэлийн дугаар',
        'total_gpa':'Голч дүн',
        'total_kr':'Цуглуулсан нийт багц цаг',
        'join_year':'Элссэн хичээлийн жил',
        'profession_name': 'Сургалтын хөтөлбөр',
        'give_date':'Олгосон огноо',
        'graduate_year':'Төгссөн огноо',
        'graduation_number':'Тушаалын дугаар',

    }

    // ** Hook
    const { control, formState: { errors } } = useForm({});

    var values = {
        profession: '',
        join_year: '',
        group: '',
        department: '',
        degree: ''
    }
    const [select_value, setSelectValue] = useState(values)
    const default_page = [10, 15, 50, 75, 100]

    const [datas, setDatas] = useState([])
    const [department_option, setDepartmentOption] = useState([])
    const [degree_option, setDegree] = useState([])
    const [profession_option, setProfessionOption] = useState([])
    const [groupOption, setGroup] = useState([])

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

    const { Loader, isLoading, fetchData } = useLoader({isFullScreen: false})
    const { isLoading: isTableLoading, fetchData: allFetch } = useLoader({isFullScreen: false})

    const studentApi = useApi().student
    const groupApi = useApi().student.group
    const departmentApi = useApi().hrms.department
    const degreeApi = useApi().settings.professionaldegree
    const professionApi = useApi().study.professionDefinition

    // API
    useEffect(() => {
        getDatas()
    }, [sortField, currentPage, rowsPerPage, select_value])

    useEffect(
        () =>
        {
            getDegreeOption()
            getProfession()
            getGroup()
            getDepartmentOption()
        },
        [select_value]
    )

    // Тэнхимын жагсаалт
    async function getDepartmentOption() {
        const { success, data } = await fetchData(departmentApi.get())
        if(success) {
            setDepartmentOption(data)
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

        const {success: success1, data: data1} = await allFetch(studentApi.getGraduate1(rowsPerPage, currentPage, sortField, searchValue, department, degree, profession, group))
        if(success1)
        {
            setTotalCount(data1?.count)
            setDatas(data1?.results)
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
		}
	}, [searchValue]);

    function excelHandler(cdatas) {
        console.log(cdatas)
        const rowInfo = {
            headers: [
                '№',
                'Овог, Нэр',
                'Салбар нэр',
                'Сургуулийн нэр',
                'Мэргэжлийн чиглэл',
                'Мэргэжлийн чиглэлийн индекс',
                'Сургалтын хэлбэр',
                'Боловсролын зэрэг',
                'Дипломын дугаар',
                'Бүртгэлийн дугаар',
                'Голч дүн',
                'Цуглуулсан нийт багц цаг',
                'Элссэн хичээлийн жил',
                'Сургалтын хөтөлбөр',
                'Олгосон огноо',
                'Төгссөн огноо',
                'Тушаалын дугаар',
            ],

            datas: [
                'index',
                'full_name',
                'department_name',
                'school_name',
                'dep_name',
                'profession_code',
                'learning_status',
                'degree_name',
                'deplom_num',
                'registration_num',
                'total_gpa',
                'total_kr',
                'join_year',
                'profession_name',
                'give_date',
                'graduate_year',
                'graduation_number',
            ],
        }
        excelDownload(cdatas, rowInfo, `tugsult`)
    }

    /** excel file аар татуулах датаг backend-ээс авах */
    async function excelAllDownload(type) {
        var keys = Object.keys(excelColumns)

        const { success, data } = await fetchData(studentApi.download(searchValue, select_value.department, select_value.degree, select_value.profession, select_value.group, select_value.join_year, select_value?.status))
        if (success) {
            data.forEach((cdata) => {
                for(let key in cdata) {
                    if (!keys.includes(key)) {
                        delete cdata[key]
                    }
                }
            })
            if (type === 'excel') {
                excelHandler(data)
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
            {isLoading && Loader}
                <CardHeader className='flex-md-row flex-column align-md-items-center align-items-start border-bottom'>
                    <CardTitle tag='h4'>{t('Төгссөн оюутны мэдээлэл')}</CardTitle>
                    <div className='d-flex flex-wrap mt-md-0'>
                        <UncontrolledButtonDropdown>
                            <DropdownToggle color='secondary' className='m-50' caret outline>
                                <Download size={15} />
                                <span className='align-middle ms-50'>Export</span>
                            </DropdownToggle>
                            <DropdownMenu>
                                <DropdownItem className='w-100' onClick={() => excelAllDownload('csv')}>
                                    <FileText size={15} />
                                    <span className='align-middle ms-50'>CSV</span>
                                </DropdownItem>
                                <DropdownItem className='w-100' onClick={() => excelAllDownload('excel')}>
                                    <Grid size={15} />
                                    <span className='align-middle ms-50' >Excel</span>
                                </DropdownItem>
                            </DropdownMenu>
                        </UncontrolledButtonDropdown>
                    </div>
                </CardHeader>
                <Row className="justify-content-start mx-0 my-50" sm={12}>
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

export default Graduates;
