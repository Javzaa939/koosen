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
} from 'reactstrap'

import { useTranslation } from 'react-i18next'

import Select from 'react-select'

import { ChevronDown, Download, Search } from 'react-feather'

import { useForm, Controller } from "react-hook-form";

import DataTable from 'react-data-table-component'

import classnames from "classnames";

import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';

import { getPagination, ReactSelectStyles } from '@utils'

import { getColumns } from './helpers'

const ScoreRegister = () => {

    var values = {
        lesson: '',
        teacher: '',
        class: '',
    }

    const { t } = useTranslation()

    // ** Hook
    const { control, setValue, formState: { errors } } = useForm({});

    const { Loader, isLoading, fetchData } = useLoader({isFullScreen: false})

    const default_page = [10, 15, 50, 75, 100]

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

    const [datas, setDatas] = useState([])
    const [lesson_option, setLessonOption] = useState([])
    const [teacher_option, setTeacherOption] = useState([])
    const [group_option, setGroupOption] = useState([])
    const [teach_score, setHaveTeachScore] = useState(false)

    const [select_value, setSelectValue] = useState(values)

    const [valid_date, setValidDate] = useState(false)

    // API
    const groupApi = useApi().student.group
    const teacherApi = useApi().hrms.teacher
    const lessonApi = useApi().study.lessonStandart
    const scoreApi = useApi().score.register
    const permissionApi = useApi().role.check

    // Хичээлийн жагсаалт
    async function getLessonOption() {
        const { success, data } = await fetchData(lessonApi.getList())
        if(success) {
            setLessonOption(data)
        }
    }

    // Багшийн жагсаалт
    async function getTeacher() {
        const lesson_id = select_value.lesson
        const { success, data } = await fetchData(teacherApi.getTeacher(lesson_id))
        if(success) {
            setTeacherOption(data)
        }
    }

    // Анги бүлгийн жагсаалт
    async function getGroup() {
        const teacher = select_value.teacher
        const { success, data } = await fetchData(groupApi.getGroup(teacher))
        if(success) {
            setGroupOption(data)
        }
    }

    // Хугацаа шалгах
    async function getTime() {
        const { success, data } = await fetchData(permissionApi.get(7))
        if(success) {
            setValidDate(data)
        }
    }

    // Дүнгийн жагсаалт
    async function getDatas() {
        const lesson = select_value.lesson
        const teacher = select_value.teacher
        const class_id = select_value.class

        if(lesson && teacher)
        {
            const { success, data } = await fetchData(scoreApi.get(rowsPerPage, currentPage, sortField, searchValue, class_id, lesson, teacher))
            if(success) {
                setDatas(data?.datas?.results)
                setHaveTeachScore(data?.have_teach_score)
                setTotalCount(data?.datas?.count)
            }
        } else {
            setDatas([])
            setGroupOption([])
        }
    }


    useEffect(() => {
        getDatas()
    },[select_value, rowsPerPage, currentPage, sortField])

    useEffect(
        () =>
        {
            getLessonOption()
            getTime()
        },
        []
    )

    useEffect(
        () =>
        {
            if (select_value?.lesson) {
                getTeacher()
            }
        },
        [select_value?.lesson]
    )

    useEffect(
        () =>
        {
            if (select_value?.teacher) {
                getGroup()
            }
        },
        [select_value?.teacher]
    )

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

    async function handleTeacherDownload() {
        if (select_value.lesson && select_value.teacher) {
            const { success, data } = await fetchData(scoreApi.download(select_value.lesson, select_value.teacher, select_value.class))
            if(success)
            {
                setDatas(data)
            }
        }
    }

    return (
        <Fragment>
            <Card>
                {/* {isLoading && Loader} */}
                <CardHeader className='flex-md-row flex-column align-md-items-center align-items-start border-bottom'>
                    <CardTitle tag='h4'>{t('Дүнгийн бүртгэл')}</CardTitle>
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
                            render={({ field: { value, onChange} }) => {
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
                                                lesson: val?.id || '',
                                                teacher: '',
                                                class: '',
                                            })
                                            setValue('teacher', '')
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
                            render={({ field: { value, onChange} }) => {
                                return (
                                    <Select
                                        name="teacher"
                                        id="teacher"
                                        classNamePrefix='select'
                                        isClearable
                                        className={classnames('react-select', { 'is-invalid': errors.teacher })}
                                        isLoading={isLoading}
                                        placeholder={t('-- Сонгоно уу --')}
                                        options={teacher_option || []}
                                        value={value && teacher_option.find((c) => c.id === value)}
                                        noOptionsMessage={() => t('Хоосон байна.')}
                                        onChange={(val) => {
                                            onChange(val?.id || '')
                                            setSelectValue({
                                                lesson: select_value.lesson,
                                                teacher: val?.id || '',
                                                class: '',
                                            })
                                            setValue('class', '')
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
                            render={({ field: { value, onChange} }) => {
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
                                                lesson: select_value.lesson,
                                                teacher: select_value.teacher,
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
                    <Col md={3} sm={12} className='d-flex justify-content-start align-items-center'>
                        <Button size='sm' color='primary' className='mt-2' onClick={handleTeacherDownload} disabled={!valid_date}><Download size={15} className='me-1'/>Багшийн дүн татах</Button>
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
                        noHeader
                        pagination
                        paginationServer
                        className='react-dataTable'
                        progressPending={isLoading}
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
                        columns={getColumns(currentPage, rowsPerPage, total_count, select_value)}
                        sortIcon={<ChevronDown size={10} />}
                        paginationPerPage={rowsPerPage}
                        paginationDefaultPage={currentPage}
                        data={datas}
                        paginationComponent={getPagination(handlePagination, currentPage, rowsPerPage, total_count)}
                        fixedHeader
                        fixedHeaderScrollHeight='62vh'
                    />
                </div>
            </Card>
        </Fragment>
    )
};

export default ScoreRegister;
