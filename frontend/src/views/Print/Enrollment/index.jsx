import { Fragment, useState, useEffect, useContext } from 'react'

import { Controller, useForm } from 'react-hook-form'

import { Row, Col, Card, Input, Label, CardTitle, CardHeader, Spinner, Button } from 'reactstrap'

import { ChevronDown , Printer, Search} from 'react-feather'

import { useTranslation } from 'react-i18next'

import Select from 'react-select'

import DataTable from 'react-data-table-component'

import useApi from '@hooks/useApi';

import useLoader from '@hooks/useLoader';
import useUpdateEffect from '@hooks/useUpdateEffect'

import SchoolContext from '@context/SchoolContext'

import { getColumns } from './helpers';

import { getPagination, ReactSelectStyles } from '@utils';

const Enrollment = () => {

    var values = {
        department: '',
        degree: '',
        profession: '',
        learning: '',
        group: '',
    }

    const [sortField, setSort] = useState('')

    const { Loader, isLoading, fetchData } = useLoader({ isSmall: true })
    const { isLoading: isTableLoading, fetchData: allFetch } = useLoader({})

    const [datas, setDatas] = useState([])

    const [currentPage, setCurrentPage] = useState(1)

    const { school_id } = useContext(SchoolContext)

    const { t } = useTranslation()

    const { control, formState: { errors } } = useForm({});
    const [rowsPerPage, setRowsPerPage] = useState(10)
    const [searchValue, setSearchValue] = useState("");
    const [select_value, setSelectValue] = useState(values);

    const [total_count, setTotalCount] = useState(1)

    const default_page = [10, 15, 50, 75, 100]

    // Const Option
    const [degreeOption, setDegreeOption] = useState([])
    const [groupOption, setGroupOption] = useState([])
    const [departmentOption, setDepartmentOption] = useState([])
    const [professionOption, setProfessionOption] = useState([])
    const [learningOption, setLearningOption] = useState([])

    // API
    const degreeApi = useApi().settings.professionaldegree
    const groupApi = useApi().student.group
    const departmentApi = useApi().hrms.department
    const learningApi = useApi().settings.learning
    const professionApi = useApi().study.professionDefinition
    const admissionApi = useApi().print.admission

    // Боловсролын зэрэг
    async function getDegreeOption() {
        const { success, data } = await fetchData(degreeApi.get())
        if(success) {
            setDegreeOption(data)
        }
    }

    // Анги
    async function getGroupOption() {
        const department = select_value.department
        const degree = select_value.degree
        const profession = select_value.profession
        const { success, data } = await fetchData(groupApi.getList(department,degree,profession))
        if(success) {
            setGroupOption(data)
        }
    }

    // Тэнхим
    async function getDepartmentOption() {
        const { success, data } = await fetchData(departmentApi.get())
        if(success) {
            setDepartmentOption(data)
        }
    }

    // Суралцах хэлбэр
    async function getLearningOption() {
        const { success, data } = await fetchData(learningApi.get())
        if(success) {
            setLearningOption(data)
        }
    }

    // Хөтөлбөр
    async function getProfessionOption() {
        const degreeId = select_value.degree
        const { success, data } = await fetchData(professionApi.getList(degreeId))
        if(success) {
            setProfessionOption(data)
        }
    }

    // data avah heseg
    async function getDatas() {

        var department = select_value?.department
        var profession = select_value?.profession
        var degree = select_value?.degree
        var group = select_value?.group
        var learning = select_value?.learning

        const page_count = Math.ceil(total_count / rowsPerPage)

        if (page_count < currentPage && page_count != 0) {
            setCurrentPage(page_count)
        }

        const { success, data } = await allFetch(admissionApi.get(rowsPerPage, currentPage, sortField, searchValue, degree, department, group, profession, learning))
        if(success)
        {
            setTotalCount(data?.count)
            setDatas(data?.results)
        }
    }

    const handleFilter = e => {
        const value = e.target.value.trimStart();
		setSearchValue(value)
	}

    function handlePerPage(e) {
        setRowsPerPage(parseInt(e.target.value))
    }

    async function handleSearch() {
        getDatas()
    }

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

    useEffect(() => {
        getDegreeOption()
        getGroupOption()
        getDepartmentOption()
        getLearningOption()
        getProfessionOption()
    },[])

    useEffect(() => {
        getProfessionOption()
        getGroupOption()
    },[select_value])

    useEffect(() => {
        getDatas()
    },[select_value, rowsPerPage, currentPage, sortField, school_id])

    useUpdateEffect(() => {
		if (searchValue.length == 0) {
			getDatas();
		} else {
			const timeoutId = setTimeout(() => {
				getDatas();
			}, 600);

			return () => clearTimeout(timeoutId);
		}
	}, [searchValue]);

    return(
        <Fragment>
            <Card>
                <CardHeader className="flex-md-row flex-column align-md-items-center align-items-start border-bottom pt-0'">
					<CardTitle tag="h4">{t('Элсэлтийн тушаал')}</CardTitle>
					    <div className='d-flex flex-wrap mt-md-0 mt-1'>
                            <Button
                                color='primary'
                            >
                            <Printer size={15} />
                                <span className='align-middle ms-50'>{t('Хэвлэх')}</span>
                            </Button>
                        </div>
                </CardHeader>
                <Row className="justify-content-between mx-0 mt-1">
                    <Col md={4}>
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
                        />
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
                        />
                    </Col>
                    <Col md={4}>
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
                                        getOptionLabel={(option) => option.name}
                                    />
                                )
                            }}
                        />
                    </Col>
                </Row>
                <Row className="mx-0 mb-1 mt-1">
                    <Col md={4}>
                        <Label className="form-label" for="learn_name">
                            {t('Суралцах хэлбэр')}
                        </Label>
                        <Controller
                            control={control}
                            defaultValue=''
                            name="learn_name"
                            render={({ field: { value, onChange} }) => {
                                return (
                                    <Select
                                        name="learn_name"
                                        id="learn_name"
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
                                                    learn_name: val?.id || '',
                                                }
                                            })
                                        }}
                                        styles={ReactSelectStyles}
                                        getOptionValue={(option) => option.id}
                                        getOptionLabel={(option) => option.learn_name}
                                    />
                                )
                            }}
                        />
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
                        />
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
                {
                    isTableLoading ?

                        <div className="position-relative d-flex justify-content-center align-items-center" style={{ minHeight: 140 }}>
                            {Loader}
                        </div>
                    :

                        <div className='react-dataTable react-dataTable-selectable-rows' id="datatableLeftTwoRightOne">
                            <DataTable
                                noHeader
                                pagination
                                paginationServer
                                className='react-dataTable'
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
                }
                </Card>
        </Fragment>
    )
}
export default Enrollment;
