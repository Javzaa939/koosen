import { Fragment, useState, useEffect, useContext } from 'react'

import { Controller, useForm } from 'react-hook-form'

import { Row, Col, Card, Input, Label, CardTitle, CardHeader, Spinner, Button } from 'reactstrap'

import { ChevronDown , Printer, Search} from 'react-feather'

import { useTranslation } from 'react-i18next'

import Select from 'react-select'

import DataTable from 'react-data-table-component'

import useApi from '@hooks/useApi';

import useLoader from '@hooks/useLoader';

import { getColumns } from './helpers';

import { getPagination, ReactSelectStyles } from '@utils';

const Graduation = () => {

    var values = {
		department: '',
        degree: '',
        profession: '',
		learning: '',
        group: '',
	}

    const { t } = useTranslation()

    const [rowsPerPage, setRowsPerPage] = useState(10)
    const [searchValue, setSearchValue] = useState("");
    const [currentPage, setCurrentPage] = useState(1)
    const [total_count, setTotalCount] = useState(1)
    const [datas, setDatas] = useState([])

    const { control, setValue, formState: { errors } } = useForm({});
	const default_page = [10, 15, 50, 75, 100]
    const { Loader, isLoading, fetchData } = useLoader({})
    const [select_value, setSelectValue] = useState(values);

    const [departmentOption, setDepartmentOption] = useState([])
    const [degreeOption, setDegreeOption] = useState([])
    const [professionOption, setProfessionOption] = useState([])
    const [learningOption, setLearningOption] = useState([])
    const [groupOption, setGroupOption] = useState([])
    const [sort, setSort] = useState('')

    const departmentApi = useApi().hrms.department
    const degreeApi = useApi().settings.professionaldegree
    const professionApi = useApi().study.professionDefinition
    const learningApi = useApi().settings.learning
	const groupApi = useApi().student.group
    const graduationApi = useApi().print.graduationwork

    const handleFilter = e => {
		const value = e.target.value.trimStart();
		setSearchValue(value)
	}

    async function getDatas() {
        const { success, data } = await fetchData(graduationApi.get(rowsPerPage, currentPage, sort, searchValue, select_value.degree, select_value.department, select_value.group, select_value.profession, select_value.learning))
        if(success){
            setDatas(data?.results)
        }
    }

    useEffect(() => {
        getDatas()
    }, [rowsPerPage, currentPage, sort, searchValue, select_value])

    async function handleSearch() {
        // if (searchValue.length > 0) getDatas()
    }

    function handleSort(column, sort) {
        if(sort === 'asc') {
            setSort(column.header)
        } else {
            setSort('-' + column.header)
        }
    }

    const handlePagination = (page) => {
		setCurrentPage(page.selected + 1);
	};


    function handlePerPage(e) {
        setRowsPerPage(parseInt(e.target.value))
    }

    async function getDepartmentOption() {
        const { success, data } = await fetchData(departmentApi.get())
        if(success) {
            setDepartmentOption(data)
        }
    }
    async function getDegreeOption() {
        const { success, data } = await fetchData(degreeApi.get())
        if(success) {
            setDegreeOption(data)
        }
    }
    async function getProfessionOption() {
        const degreeId = select_value.degree
        const department = select_value.department
        const { success, data } = await fetchData(professionApi.getList(degreeId,department))
        if(success) {
            setProfessionOption(data)
        }
    }
    async function getLearningOption() {
        const { success, data } = await fetchData(learningApi.get())
        if(success) {
            setLearningOption(data)
        }
    }
    async function getGroupOption() {
        const degreeId = select_value.degree
        const department = select_value.department
        const profession = select_value.profession
        const { success, data } = await fetchData(groupApi.getList(department,degreeId,profession))
        if(success) {
            setGroupOption(data)
        }
    }
    useEffect(() => {
        getDepartmentOption()
        getDegreeOption()
        getProfessionOption()
        getLearningOption()
        getGroupOption()
    },[])

    useEffect(() => {
        getProfessionOption()
        getGroupOption()
    },[select_value])

    return(
        <Fragment>
            <Card>
            {isLoading && Loader}
                <CardHeader className="flex-md-row flex-column align-md-items-center align-items-start border-bottom pt-0'">
					<CardTitle tag="h4">{t('Төгсөлтийн тушаал')}</CardTitle>
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
                                        options={departmentOption || []}
                                        value={departmentOption.find((c) => c.id === value)}
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
                        ></Controller>
                    </Col>
                    <Col md={4}>
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
                                        className='react-select'
                                        placeholder={t('-- Сонгоно уу --')}
                                        options={degreeOption || []}
                                        value={degreeOption.find((c) => c.id === value)}
                                        noOptionsMessage={() => t('Хоосон байна.')}
                                        onChange={(val) => {
                                            onChange(val?.id || '')
                                            setSelectValue(current => {
                                                return {
                                                    ...current,
                                                    degree: val?.id || '',
                                                }
                                            })
                                        }}
                                        styles={ReactSelectStyles}
                                        getOptionValue={(option) => option.id}
                                        getOptionLabel={(option) => option.degree_name}
                                    />
                                )
                            }}
                        ></Controller>
                    </Col>
                    <Col md={4}>
                        <Label className="form-label" for="profession">
                            {t('Мэргэжил')}
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
                                        className='react-select'
                                        placeholder={t('-- Сонгоно уу --')}
                                        options={professionOption || []}
                                        value={professionOption.find((c) => c.id === value)}
                                        noOptionsMessage={() => t('Хоосон байна.')}
                                        onChange={(val) => {
                                            onChange(val?.id || '')
                                            setSelectValue(current => {
                                                return {
                                                    ...current,
                                                    profession: val?.id || '',
                                                }
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
                </Row>
                <Row className="mx-0 mb-1">
                <Col md={4}>
                        <Label className="form-label" for="learning">
                            {t('Суралцах хэлбэр')}
                        </Label>
                        <Controller
                            control={control}
                            defaultValue=''
                            name="learning"
                            render={({ field: { value, onChange} }) => {
                                return (
                                    <Select
                                        name="learning"
                                        id="learning"
                                        classNamePrefix='select'
                                        isClearable
                                        className='react-select'
                                        placeholder={t('-- Сонгоно уу --')}
                                        options={learningOption || []}
                                        value={learningOption.find((c) => c.id === value)}
                                        noOptionsMessage={() => t('Хоосон байна.')}
                                        onChange={(val) => {
                                            onChange(val?.id || '')
                                            setSelectValue(current => {
                                                return {
                                                    ...current,
                                                    learning: val?.id || '',
                                                }
                                            })
                                        }}
                                        styles={ReactSelectStyles}
                                        getOptionValue={(option) => option.id}
                                        getOptionLabel={(option) => option.learn_name}
                                    />
                                )
                            }}
                        ></Controller>
                    </Col>
                    <Col md={4}>
                        <Label className="form-label" for="group">
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
                                        placeholder={t('-- Сонгоно уу --')}
                                        options={groupOption || []}
                                        value={groupOption.find((c) => c.id === value)}
                                        noOptionsMessage={() => t('Хоосон байна.')}
                                        onChange={(val) => {
                                            onChange(val?.id || '')
                                            setSelectValue(current => {
                                                return {
                                                    ...current,
                                                    group: val?.id || '',
                                                }
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

export default Graduation;
