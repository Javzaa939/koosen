import { Fragment, useState, useEffect } from "react"

import {
    Col,
    Row,
    Card,
    Input,
    Label,
    Button,
    CardTitle,
    CardHeader,
    Spinner
} from 'reactstrap'

import Select from 'react-select'
import DataTable from 'react-data-table-component'

import { useTranslation } from 'react-i18next'
import { Controller, useForm } from "react-hook-form";
import { ChevronDown ,Search } from "react-feather"
import { getPagination, generateYear, ReactSelectStyles } from '@utils'

import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';

import { useSkin } from "@hooks/useSkin"

import { getColumns, getExpandColumns } from './helpers'

export function ExpandedComponent({ data }) {
    const { skin } = useSkin()
    const tableCustomStyles = {
        headCells: {
          style: {
            backgroundColor: skin == 'dark' ? '#343d5500' : "#9CD9F3"
          },
        },
    }

    return (
        <Card className='mb-0 rounded-0 border-bottom px-2'>
            <div className='react-dataTable react-dataTable-selectable-rows mt-1'>
                <DataTable
                    noHeader
                    className='react-dataTable'
                    noDataComponent={(
                        <div className="my-2">
                            <h5>{'Өгөгдөл байхгүй байна'}</h5>
                        </div>
                    )}
                    data={data?.datas}
                    columns={getExpandColumns()}
                    customStyles={tableCustomStyles}
                    fixedHeader
                    fixedHeaderScrollHeight='62vh'
                />
            </div>
        </Card>
    )
}

const ScienceProject = () => {

    var values = {
        department: '',
        start_date:'',
        teacher: '',
        category: '',
        sub_category: '',
    }

    const { control} = useForm();

    const { Loader, isLoading, fetchData } = useLoader({isFullScreen: false})
    const { isLoading: isTableLoading, fetchData: allFetch } = useLoader({isFullScreen: false})

    const { t } = useTranslation()

    const [select_value, setSelectValue] = useState(values);

    // useState
    const [sortField, setSortField] = useState('')
    const [datas, setDatas] = useState([])
    const [searchValue, setSearchValue] = useState('');
    const [start_dateOption, setStart_dateption] = useState(generateYear(1))
    const [teacher_Option, setTeacher] = useState([])
    const [category_Option, setCategory] = useState([])
    const [department_Option, setDepartment] = useState([])

    const default_page = [10, 15, 50, 75, 100]

    // Нийт датаны тоо
    const [total_count, setTotalCount] = useState(1)
    const [currentPage, setCurrentPage] = useState(1)
    const [rowsPerPage, setRowsPerPage] = useState(10)

    // Api
    const scienceApi = useApi().science
    const teacherApi = useApi().hrms.teacher
    const departmentApi = useApi().hrms.department

    /* Багшийн жагсаалт */
    async function getTeacherOption() {
        const { success, data } = await fetchData(teacherApi.get())
        if(success) {
            setTeacher(data)
        }
    }

    /* Тэнхимийн жагсаалт */
    async function getDepartmentOption() {
        const { success, data } = await fetchData(departmentApi.get())
        if(success) {
            setDepartment(data)
        }
    }
    /* Төслийн англал */
    async function getCategoryOption() {
        const { success, data } = await fetchData(scienceApi.project.category.getList())
        if(success) {
            setCategory(data)
        }
    }

    async function getDatas() {
        var department_id = select_value.department
        var start_date = select_value.start_date
        var teacher = select_value.teacher
        var category_id = select_value.category

        const { success, data } = await allFetch(scienceApi.project.get(rowsPerPage, currentPage, sortField, searchValue, department_id, teacher, start_date, category_id))
        if(success) {
            setDatas(data?.results)
            setTotalCount(data?.count)
        }
    }

    const handleFilter = e => {
        const value = e.target.value.trimStart();
        setSearchValue(value)
    }

    function handlePerPage(e) {
        setRowsPerPage(parseInt(e.target.value))
    }

    function handleSearch() {
        setTimeout(() => {
            getDatas()
        }, 100)
    }

    // Хайлтийн хэсэг хоосон болох үед анхны датаг дуудна
    useEffect(
        () =>
        {
            if (!searchValue) {
                getDatas()
            }
        },
        [searchValue]
    )

    useEffect(() => {
        getDatas()
    }, [sortField, currentPage, rowsPerPage, searchValue, select_value])

    useEffect(() => {
        getDepartmentOption()
        getTeacherOption()
        getCategoryOption()
    }, [])

    // Хуудас солих үед ажиллах хэсэг
	function handlePagination(page) {
		setCurrentPage(page.selected + 1);
	};

    function handleSort(column, sorting) {
        if(sorting === 'asc') {
            setSortField(column.sortField)
        } else {
            setSortField('-' + column.sortField)
        }
    }

    return(
        <Fragment>
            <Card>
                {isLoading && Loader}
                <CardHeader className='flex-md-row flex-column align-md-items-center align-items-start border-bottom'>
                    <CardTitle tag='h4'>{t('Эрдэм шинжилгээ төсөл хөтөлбөр жагсаалт')}</CardTitle>
                </CardHeader>
				<Row className="mx-0 mt-1">
                    <Col md={3}>
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
                                        className='react-select'
                                        placeholder={t('-- Сонгоно уу --')}
                                        options={department_Option || []}
                                        value={department_Option.find((item) => item.id === select_value.department)}
                                        noOptionsMessage={() => t('Хоосон байна.')}
                                        onChange={(val) => {
                                            onChange(val?.id || '')
                                            setSelectValue(current => {
                                                return {
                                                    ...current,
                                                    department: val?.id || '',
                                                }
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
                    <Col md={3}>
                        <Label className="form-label" for="teacher">
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
                                        options={teacher_Option || []}
                                        value={teacher_Option.find((item) => item.id === select_value.teacher)}
                                        noOptionsMessage={() => t('Хоосон байна.')}
                                        onChange={(val) => {
                                            onChange(val?.id || '')
                                            setSelectValue(current => {
                                                return {
                                                    ...current,
                                                    teacher: val?.id || '',
                                                }
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
                    <Col sm={3}>
                        <Label className="form-label me-1" for="start_date">
                            {t('Төсөл эхлэх он')}
                        </Label>
                        <Controller
                            control={control}
                            defaultValue=''
                            name="start_date"
                            render={({ field: { value, onChange} }) => {
                                return (
                                    <Select
                                        name="start_date"
                                        id="start_date"
                                        classNamePrefix='select'
                                        isClearable
                                        className='react-select'
                                        placeholder={t('-- Сонгоно уу --')}
                                        options={start_dateOption || []}
                                        value={start_dateOption.find((item) => item.id === select_value.start_date)}
                                        noOptionsMessage={() => t('Хоосон байна.')}
                                        onChange={(val) => {
                                            onChange(val?.id || '')
                                            setSelectValue(current => {
                                                return {
                                                    ...current,
                                                    start_date: val?.id || '',
                                                }
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
                    <Col md={3}>
                        <Label className="form-label" for="category">
                            {t('Төслийн ангилал')}
                        </Label>
                        <Controller
                            control={control}
                            defaultValue=''
                            name="category"
                            render={({ field: { value, onChange} }) => {
                                return (
                                    <Select
                                        name="category"
                                        id="category"
                                        classNamePrefix='select'
                                        isClearable
                                        className='react-select'
                                        placeholder={t('-- Сонгоно уу --')}
                                        options={category_Option || []}
                                        value={category_Option.find((item) => item.id === select_value.category)}
                                        noOptionsMessage={() => t('Хоосон байна.')}
                                        onChange={(val) => {
                                            onChange(val?.id || '')
                                            setSelectValue(current => {
                                                return {
                                                    ...current,
                                                    category: val?.id || '',
                                                }
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
				</Row>
                <Row className="mt-1 d-flex justify-content-between mx-0 mb-1">
                    <Col className='d-flex align-items-center justify-content-start' md={6} sm={12}>
                        <Col lg={2} md={3} sm={4} xs={5} className='pe-1'>
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
                    <Col className='d-flex align-items-end mobile-datatable-search mt-1'>
                        <Input
                            className='dataTable-filter mb-50'
                            type='text'
                            bsSize='sm'
                            id='search-input'
                            placeholder={t("Хайх")}
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
                <div className='react-dataTable react-dataTable-selectTable-rows mx-1'>
                    <DataTable
                        noHeader
                        pagination
                        paginationServer
                        className='react-table'
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
                        sortIcon={<ChevronDown size={10} />}
                        columns={getColumns(currentPage, rowsPerPage, total_count)}
                        paginationPerPage={rowsPerPage}
                        paginationDefaultPage={currentPage}
                        paginationComponent={getPagination(handlePagination, currentPage, rowsPerPage, total_count)}
                        data={datas}
                        onSort={handleSort}
                        fixedHeader
                        fixedHeaderScrollHeight='62vh'
                        expandableRows
                        expandableRowsComponent={ExpandedComponent}
                    />
                </div>
            </Card>
        </Fragment>
    )
}
export default ScienceProject

