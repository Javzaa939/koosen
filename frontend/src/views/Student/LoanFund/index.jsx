// ** React Import
import { Fragment, useState, useEffect, useContext } from "react"

import { Row, Col, Card, Input, Label, Button, CardTitle, CardHeader, Spinner } from "reactstrap"

import { useTranslation } from "react-i18next"

import { ChevronDown, Search } from "react-feather"

import Select from 'react-select'
import classnames from "classnames";

import DataTable from "react-data-table-component"

import { useForm, Controller } from "react-hook-form";

import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';
import useUpdateEffect from '@hooks/useUpdateEffect'
import SchoolContext from '@context/SchoolContext'
import ActiveYearContext from "@context/ActiveYearContext"

import { getPagination, ReactSelectStyles } from '@utils'

import { getColumns } from "./helpers"

const LoanFund= () => {

    // ** Hook
    const { cyear_name, cseason_id } = useContext(ActiveYearContext)
    const { control, setValue, formState: { errors } } = useForm({});
    const { t } = useTranslation()
    const { school_id } = useContext(SchoolContext) // Permission шалгахад ашиглагдах байх

    var values = {
        profession: '',
        join_year: '',
        group: '',
        department: '',
        degree: '',
    }

    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10)

    const [searchValue, setSearchValue] = useState("");

    const [datas, setDatas] = useState([]);

    const [select_value, setSelectValue] = useState(values)
    const [degree_option, setDegree] = useState([])
    const [groupOption, setGroup] = useState([])

    // нийт датаны тоо
    const [total_count, setTotalCount] = useState(1)

    const default_page = [10, 15, 50, 75, 100]

    // Эрэмбэлэлт
    const [sortField, setSort] = useState('')

    // loader
    const { isLoading, fetchData} = useLoader({});

    // Api
    const groupApi = useApi().student.group
    const degreeApi = useApi().settings.professionaldegree
    const eduloanfundApi = useApi().student.eduloanfund

    /* Боловсролын зээлийн сан жагсаалт авах функц */
    async function getDatas() {
        const group = select_value?.group
        const degree = select_value?.degree
        if(school_id)
        {
            const { success, data} = await fetchData(eduloanfundApi.get(rowsPerPage, currentPage, sortField, searchValue, degree, group))
            if(success) {
                setDatas(data.results)
                setTotalCount(data?.count)
            }
        }
        else {
            setDatas([])
        }
    }

    useEffect(() => {
        getDatas()
    }, [rowsPerPage, currentPage, sortField, select_value, school_id])

    // Боловсролын зэргийн жагсаалт
    async function getDegreeOption() {
        const { success, data } = await fetchData(degreeApi.get())
        if(success) {
            setDegree(data)
        }
    }

    // Ангийн жагсаалт
    async function getGroup() {
        const { success, data } = await fetchData(groupApi.getList('', select_value.degree))
        if(success) {
            setGroup(data)
        }
    }

    // Хайлтийн хэсэг хоосон болох үед анхны датаг дуудна
    useUpdateEffect(
        () =>
        {
            if (!searchValue) {
                getDatas()
            }
        },
        [searchValue]
    )

    useEffect(() => {
        getGroup()
    },[select_value.degree, school_id])

    useEffect(() => {
        getDegreeOption()
    },[school_id])

    function handleSort(column, sort) {
        if(sort === 'asc') {
            setSort(column.header)
        } else {
            setSort('-' + column.header)
        }
    }

    // Хайлт хийх үед ажиллах хэсэг
    const handleFilter = (e) => {
        const value = e.target.value.trimStart();
        setSearchValue(value);
    };

    // Хайх товч дарсан үед ажиллах функц
    async function handleSearch() {
        if (searchValue.length > 0) getDatas()
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
                <CardHeader className='flex-md-row flex-column align-md-items-center align-items-start border-bottom'>
                    <CardTitle tag='h4'>{t('Боловсролын зээлийн сан')}</CardTitle>
                </CardHeader>
                <Row className='mt-1'>
                    <Col sm={6} md={4} className="ms-1">
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
                                        placeholder={t('-- Сонгоно уу --')}
                                        options={degree_option || []}
                                        value={value && degree_option.find((c) => c.id === value)}
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
                                                        degree: '',
                                                        group: ''
                                                    }
                                                })
                                            }
                                            setValue('group', '')
                                        }}
                                        styles={ReactSelectStyles}
                                        getOptionValue={(option) => option.id}
                                        getOptionLabel={(option) => option.degree_name_code}
                                    />
                                )
                            }}
                        ></Controller>
                    </Col>
                    <Col sm={6} md={4} >
                        <Label className="form-label" for="group">
                            {t("Анги")}
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
                                        className={classnames('react-select', { 'is-invalid': errors.group })}
                                        isLoading={isLoading}
                                        placeholder={t('-- Сонгоно уу --')}
                                        options={groupOption || []}
                                        value={value && groupOption.find((c) => c.id === value)}
                                        noOptionsMessage={() => 'Хоосон байна'}
                                        onChange={(val) => {
                                            onChange(val?.id || '')
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
                                )
                            }}
                        ></Controller>
                    </Col>
                </Row>
                <Row className='justify-content-between mx-0'>
                    <Col className='d-flex align-items-center justify-content-start mt-1' md={6} sm={12}>
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
                {
                    isLoading
                    ?
                        <div className="my-2 text-center" sm={12}>
                            <Spinner size='sm' />
                            <span className='ms-50'>{t('Түр хүлээнэ үү')}...</span>
                        </div>
                    :
                        <div className="react-dataTable react-dataTable-selectable-rows">
                            <DataTable
                                noHeader
                                pagination
                                className='react-dataTable'
                                progressPending={isLoading}
                                progressComponent={(
                                    <div className='my-2'>
                                        <h5>{t('Түр хүлээнэ үү')}...</h5>
                                    </div>
                                )}
                                noDataComponent={(
                                    <div className="my-2">
                                        <h5>{t('Өгөгдөл байхгүй байна')}</h5>
                                    </div>
                                )}
                                onSort={handleSort}
                                columns={getColumns(currentPage, rowsPerPage, total_count)}
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
        </Fragment>
    )
}

export default LoanFund;
