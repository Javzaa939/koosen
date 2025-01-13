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

import { useTranslation } from 'react-i18next'

import Select from 'react-select'

import { ChevronDown, Search } from 'react-feather'

import { useForm, Controller } from "react-hook-form";

import DataTable from 'react-data-table-component'

import classnames from "classnames";

import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';

import { getPagination, ReactSelectStyles } from '@utils'
import SchoolContext from '@src/utility/context/SchoolContext'

import { getColumns, getFooter } from './helpers'
import ExcelExportButton from './components/ExcelExportButton'

export default function ProgressScore() {

    var values = {
        lesson: '',
        is_fall: '',
        class: '',
        teacher: '',
    }

    const { t } = useTranslation()
    const { school_id } = useContext(SchoolContext)

    // ** Hook
    const { control, setValue, formState: { errors } } = useForm({});

    const { isLoading, fetchData } = useLoader({ isFullScreen: true })
    const { isLoading: totalDatasIsLoading, fetchData: totalDatasfetchData } = useLoader({ isFullScreen: true })

    const default_page = ['Бүгд', 10, 20, 50, 75, 100]

    // Хуудаслалтын анхны утга
    const [currentPage, setCurrentPage] = useState(1)

    // Нэг хуудсанд харуулах нийт датаны тоо
    const [rowsPerPage, setRowsPerPage] = useState(20)

    // Хайлт хийхэд ажиллах хувьсагч
    const [searchValue, setSearchValue] = useState('')

    // Нийт датаны тоо
    const [total_count, setTotalCount] = useState(1)

    // Эрэмбэлэлт
    const [sortField, setSort] = useState('')

    const [datas, setDatas] = useState([])
    const [totalDatas, setTotalDatas] = useState([])
    const [lesson_option, setLessonOption] = useState([])
    const [teach_option, setTeacherOption] = useState([])
    const [group_option, setGroupOption] = useState([])
    const [select_value, setSelectValue] = useState(values)

    // API
    const groupApi = useApi().student.group
    const lessonApi = useApi().study.lessonStandart
    const teacherScoreApi = useApi().score.teacherScore
    const coreApi = useApi().hrms.teacher

    // Хичээлийн жагсаалт
    async function getLessonOption() {
        const { success, data } = await fetchData(lessonApi.getList(school_id))
        if (success) {
            setLessonOption(data)
        }
    }

    async function getTeacherOption() {
        const { success, data } = await fetchData(coreApi.getLessonToTeacher(select_value?.lesson))
        if (success) {
            setTeacherOption(data)
        }
    }

    // Анги бүлгийн жагсаалт
    async function getGroup() {
        const lesson = select_value.lesson

        if (lesson) {
            const { success, data } = await fetchData(groupApi.getLessonFromExamToGroup({id: lesson}))

            if (success) {
                setGroupOption(data)
            }
        }
    }

    // Дүнгийн жагсаалт
    async function getDatas() {
        const lesson = select_value.lesson
        const is_fall = select_value.is_fall
        const class_id = select_value.class

        if (lesson) {
            const { success, data } = await fetchData(teacherScoreApi.get({
                limit: rowsPerPage,
                page: currentPage,
                sort: sortField,
                search: searchValue,
                lesson: lesson,
                group: class_id,
                is_fall: is_fall,
                teacher: select_value?.teacher
            }))

            if (success) {
                setDatas(data?.results)
                setTotalCount(data?.count)
            }
        } else {
            setDatas([])
        }
    }

    async function getTotalDatas() {
        const lesson = select_value.lesson
        const is_fall = select_value.is_fall
        const class_id = select_value.class

        if (lesson) {
            const { success, data } = await totalDatasfetchData(teacherScoreApi.get({
                lesson: lesson,
                group: class_id,
                is_fall: is_fall,
                teacher: select_value?.teacher
            }))

            if (success) {
                setTotalDatas(data?.results)
            }
        }
    }

    useEffect(() => {
        getDatas()
    }, [rowsPerPage, currentPage, sortField])

    useEffect(() => {
        getDatas()
        getTotalDatas()
    }, [select_value])

    useEffect(
        () => {
            getLessonOption()
            getGroup()
        },
        [school_id]
    )

    useEffect(() => {
        getTeacherOption()
        getGroup()
    }, [select_value?.lesson])

    // ** Function to handle filter
    const handleFilter = e => {
        const value = e.target.value.trimStart();
        setSearchValue(value)
    }

    function handleSort(column, sort) {
        if (sort === 'asc') {
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
        setRowsPerPage(
            e.target.value === "Бүгд" ? total_count : parseInt(e.target.value)
        );
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
    }, [searchValue])

    return (
        <Fragment>
            <Card>
                <CardHeader className='flex-md-row flex-column align-md-items-center align-items-start border-bottom'>
                    <CardTitle tag='h4'>{t('Явцын оноо')}</CardTitle>
                    <ExcelExportButton data={datas} />
                </CardHeader>
                <Row className="mx-50 gy-1 my-1" sm={12}>
                    <Col md={3} sm={12}>
                        <Label className="form-label" for="lesson">
                            {t('Хичээл')}
                        </Label>
                        <Controller
                            control={control}
                            defaultValue=''
                            name="lesson"
                            render={({ field: { value, onChange } }) => {
                                return (
                                    <Select
                                        name="lesson"
                                        id="lesson"
                                        classNamePrefix='select'
                                        isClearable
                                        className={classnames('react-select', { 'is-invalid': errors.lesson })}
                                        isLoading={isLoading}
                                        placeholder={t('-- Сонгоно уу --')}
                                        options={lesson_option || []}
                                        value={lesson_option.find((c) => c.id === value)}
                                        noOptionsMessage={() => t('Хоосон байна.')}
                                        onChange={(val) => {
                                            onChange(val?.id || '')
                                            setSelectValue({
                                                ...select_value,
                                                lesson: val?.id || '',
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
                    <Col md={3} sm={12}>
                        <Label className="form-label" for="teacher">
                            {t('Багш')}
                        </Label>
                        <Controller
                            control={control}
                            defaultValue=''
                            name="teacher"
                            render={({ field: { value, onChange } }) => {
                                return (
                                    <Select
                                        name="teacher"
                                        id="teacher"
                                        classNamePrefix='select'
                                        isClearable
                                        className={classnames('react-select', { 'is-invalid': errors.teacher })}
                                        isLoading={isLoading}
                                        placeholder={t('-- Сонгоно уу --')}
                                        options={teach_option || []}
                                        value={teach_option.find((c) => c.id === value)}
                                        noOptionsMessage={() => t('Хоосон байна.')}
                                        onChange={(val) => {
                                            onChange(val?.id || '')
                                            setSelectValue({
                                                ...select_value,
                                                teacher: val?.id || '',
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
                    <Col md={3} sm={12}>
                        <Label className="form-label" for="class">
                            {t('Анги')}
                        </Label>
                        <Controller
                            control={control}
                            defaultValue=''
                            name="class"
                            render={({ field: { value, onChange } }) => {
                                return (
                                    <Select
                                        name="class"
                                        id="class"
                                        classNamePrefix='select'
                                        isClearable
                                        className={classnames('react-select', { 'is-invalid': errors.class })}
                                        isLoading={isLoading}
                                        placeholder={t('-- Сонгоно уу --')}
                                        options={group_option || []}
                                        value={value && group_option.find((c) => c.confirm_year === value)}
                                        noOptionsMessage={() => t('Хоосон байна.')}
                                        onChange={(val) => {
                                            onChange(val?.id || '')
                                            setSelectValue({
                                                ...select_value,
                                                class: val?.id || '',
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
                    <Col md={3} sm={12}>
                        <Label className="form-label" for="is_fall">
                            {t('Хичээлд унасан эсэх')}
                        </Label>
                        <Controller
                            control={control}
                            defaultValue=''
                            name="is_fall"
                            render={({ field: { value, onChange, ...rest } }) => {
                                return (
                                    <Select
                                        {...rest}
                                        id={rest.name}
                                        classNamePrefix='select'
                                        isClearable
                                        className={classnames('react-select', { 'is-invalid': errors[rest.name] })}
                                        isLoading={isLoading}
                                        placeholder={t('-- Сонгоно уу --')}
                                        options={[
                                            { value: true, label: t('Тийм') },
                                            { value: false, label: t('Үгүй') }
                                        ]}
                                        noOptionsMessage={() => t('Хоосон байна.')}
                                        onChange={(val) => {
                                            onChange(val?.value || '')
                                            setSelectValue({
                                                ...select_value,
                                                is_fall: val?.value || '',
                                            })
                                        }}
                                        styles={ReactSelectStyles}
                                    />
                                )
                            }}
                        ></Controller>
                    </Col>
                </Row>
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
                        paginationServer
                        pagination
                        className='react-dataTable'
                        progressPending={isLoading || totalDatasIsLoading}
                        progressComponent={
                            <div className='my-2 d-flex align-items-center justify-content-center'>
                                <Spinner className='me-1' color="" size='sm' /><h5>{t('Түр хүлээнэ үү')}...</h5>
                            </div>
                        }
                        noDataComponent={(
                            <div className="my-2">
                                <h5>{t('Өгөгдөл байхгүй байна')}</h5>
                            </div>
                        )}
                        onSort={handleSort}
                        columns={getColumns(currentPage, rowsPerPage === 'Бүгд' ? total_count : rowsPerPage, total_count)}
                        sortIcon={<ChevronDown size={10} />}
                        paginationPerPage={rowsPerPage}
                        paginationDefaultPage={currentPage}
                        paginationTotalRows={total_count}
                        paginationRowsPerPageOptions={default_page}
                        data={datas}
                        paginationComponent={
                            (props) =>
                                <>
                                    {getFooter(totalDatas)}
                                    {/* props.rowsPerPage not updating so rowsPerPage is used directly */}
                                    {getPagination(handlePagination, props.currentPage, rowsPerPage === 'Бүгд' ? props.rowCount : rowsPerPage, props.rowCount)()}
                                </>
                        }
                        fixedHeader
                        fixedHeaderScrollHeight='62vh'
                    />
                </div>
            </Card>
        </Fragment>
    )
};
