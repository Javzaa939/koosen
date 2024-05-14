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

import { getPagination, ReactSelectStyles, generateLessonYear, level_option } from '@utils';

const GPAProfession = () => {

    var values = {
        department: '',
        degree: '',
        profession: '',
        status: false,
        level: '',
    }

    const [sortField, setSort] = useState('')

    const { Loader, isLoading, fetchData } = useLoader({isFullScreen: true})

    const [currentPage, setCurrentPage] = useState(1)

    const { t } = useTranslation()
    const [rowsPerPage, setRowsPerPage] = useState(10)
    const [searchValue, setSearchValue] = useState("");
    const [select_value, setSelectValue] = useState(values);
    const [datas, setDatas] = useState([])

    const [total_count, setTotalCount] = useState(1)
    const default_page = [10, 15, 50, 75, 100]

    // Api
    const gpaApi = useApi().print.gpa

    const handleFilter = e => {
        const value = e.target.value.trimStart();
		setSearchValue(value)
	}

    async function getDatas() {
        const department = select_value.department
        const degree = select_value.degree
        const profession = select_value.profession
        const status = select_value.status
        const { success, data } = await fetchData(gpaApi.getProp(rowsPerPage, currentPage, sortField, searchValue, degree, department, profession, status, select_value.level))
        if(success) {
            setDatas(data?.results)
            setTotalCount(data?.count)
        }
    }

    useEffect(() => {
        getProfessionOption()
    },[select_value])

    useEffect(() => {
        if (select_value) {
            getDatas()
        }
    },[select_value, currentPage, rowsPerPage])

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

    const [degreeOption, setDegreeOption] = useState([])
    const [departmentOption, setDepartmentOption] = useState([])
    const [professionOption, setProfessionOption] = useState([])

    const degreeApi = useApi().settings.professionaldegree
    const departmentApi = useApi().hrms.department
    const professionApi = useApi().study.professionDefinition

    async function getDegreeOption() {
        const { success, data } = await fetchData(degreeApi.get())
        if(success) {
            setDegreeOption(data)
        }
    }

    async function getDepartmentOption() {
        const { success, data } = await fetchData(departmentApi.get())
        if(success) {
            setDepartmentOption(data)
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

    // Мэргэжлээр нь голч бодох
    async function handleEstimate() {
        const { success } = await fetchData(gpaApi.post( select_value.profession, select_value.status, select_value.level))
        if(success) {
            getDatas()
        }
    }

    useEffect(() => {
        getDegreeOption()
        getDepartmentOption()
        getProfessionOption()
    },[])

    // ** Function to handle per page
    function handlePerPage(e) {
        setRowsPerPage(parseInt(e.target.value))
    }

    return(
        <Fragment>
            <Card>
            {isLoading && Loader}
                <div className="d-flex mx-1 justify-content-end">
                    <div className='me-1'>
                        <Button
                            color='primary'
                            disabled={(!select_value.profession) ? true : false}
                            onClick={() => handleEstimate()}
                        >
                            <span className='align-middle ms-50'>{t('Тооцох')}</span>
                        </Button>
                    </div>
                    <div>
                        <Button
                            color='primary'
                        >
                        <Printer size={15} />
                            <span className='align-middle ms-50'>{t('Хэвлэх')}</span>
                        </Button>
                    </div>
                </div>
                <Row className="justify-content-start mx-0 mb-1 mt-1">
                    <Col md={4}>
                        <Label className="form-label" for="department">
                            {t('Хөтөлбөрийн баг')}
                        </Label>
                        <Select
                            name="department"
                            id="department"
                            classNamePrefix='select'
                            isClearable
                            className='react-select'
                            placeholder={t('-- Сонгоно уу --')}
                            options={departmentOption || []}
                            value={departmentOption.find((c) => c.id === select_value.department)}
                            noOptionsMessage={() => t('Хоосон байна.')}
                            onChange={(val) => {
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
                    </Col>
                    <Col md={4}>
                        <Label className="form-label" for="degree">
                            {t('Боловсролын зэрэг')}
                        </Label>
                        <Select
                            name="degree"
                            id="degree"
                            classNamePrefix='select'
                            isClearable
                            className='react-select'
                            placeholder={t('-- Сонгоно уу --')}
                            options={degreeOption || []}
                            value={degreeOption.find((c) => c.id === select_value.degree)}
                            noOptionsMessage={() => t('Хоосон байна.')}
                            onChange={(val) => {
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
                    </Col>
                    <Col md={4}>
                        <Label className="form-label" for="profession">
                            {t('Мэргэжил')}
                        </Label>
                        <Select
                            name="profession"
                            id="profession"
                            classNamePrefix='select'
                            isClearable
                            className='react-select'
                            placeholder={t('-- Сонгоно уу --')}
                            options={professionOption || []}
                            value={professionOption.find((c) => c.id === select_value.profession)}
                            noOptionsMessage={() => t('Хоосон байна.')}
                            onChange={(val) => {
                                setSelectValue(current => {
                                    return {
                                        ...current,
                                        profession: val?.id || '',
                                    }
                                })
                            }}
                            styles={ReactSelectStyles}
                            getOptionValue={(option) => option.id}
                            getOptionLabel={(option) => option.code + ' ' + option.name}
                        />
                    </Col>
                    <Col md={4} className='mt-1'>
                        <Label className="form-label" for="level">
                            {t("Түвшин")}
                        </Label>
                        <Select
                            name="level"
                            id="level"
                            classNamePrefix='select'
                            isClearable
                            isLoading={isLoading}
                            placeholder={`-- Сонгоно уу --`}
                            options={level_option() || []}
                            value={level_option().find((c) => c.id === select_value.level)}
                            noOptionsMessage={() => 'Хоосон байна'}
                            onChange={(val) => {
                                setSelectValue(current => {
                                    return {
                                        ...current,
                                        level: val?.id || '',
                                    }
                                })
                            }}
                            styles={ReactSelectStyles}
                            getOptionValue={(option) => option.id}
                            getOptionLabel={(option) => option.name}
                        />
                    </Col>
                    <Col sm={4} md={4} className='d-flex align-items-center mt-1'>
                        <Label className="form-label" for="status">
                            {t("Төгсөж буй хөтөлбөрийн голч эсэх")}
                        </Label>
                        <Input
                            className='ms-1'
                            type='checkbox'
                            defaultChecked={select_value.status}
                            onChange={(e) => setSelectValue(current => {
                                return {
                                    ...current,
                                    status: e.target.checked,
                                }
                            })}
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
export default GPAProfession;
