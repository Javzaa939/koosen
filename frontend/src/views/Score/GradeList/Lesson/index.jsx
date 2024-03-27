import React, { Fragment, useState, useEffect, useContext} from "react";

import Select from 'react-select'

import useLoader from "@hooks/useLoader";

import { ReactSelectStyles } from "@utils"

import classnames from "classnames";

import {ChevronDown ,Search} from "react-feather"

import {
    Row,
    Col,
    Card,
    Input,
	Label,
    Button,
    Spinner,
} from "reactstrap";

import DataTable from 'react-data-table-component'

import useApi from '@hooks/useApi';

import { useTranslation } from 'react-i18next'

import { getPagination, generateLessonYear} from '@utils'
import SchoolContext from "@context/SchoolContext"
import { getColumns } from './helpers'

const Lesson = () => {

    var values = {
        lesson: '',
        lesson_year: '',
        season: '',
        group: '',
        teacher: ''
    }

    // ** Hook
    const [rowsPerPage, setRowsPerPage] = useState(10)

    const [searchValue, setSearchValue] = useState("");
    const [sortField, setSort] = useState('')

    const [yearOption, setYear] = useState([])
    const [lessonOption, setLesson] = useState([])
    const [groupOption, setGroup] = useState([])
    const [season_option, setSeasonOption] = useState([])
    const [teacherOption, setTeacher] = useState([])
    const [select_value, setSelectValue] = useState(values)

    const { school_id } = useContext(SchoolContext)

    const [datas, setDatas] = useState([]);

    // Хуудаслалтын анхны утга
    const [currentPage, setCurrentPage] = useState(1)
    const [total_count, setTotalCount] = useState(1)


    // Api
    const lessonApi = useApi().study.lessonStandart
    const groupApi = useApi().student.group
    const seasonApi = useApi().settings.season
    const lessonListApi = useApi().print.score
    const teacherApi = useApi().hrms.teacher

    // Translate
    const { t } = useTranslation()

    // Нийт датаны тоо
    const default_page = [10, 20, 50, 75, 100]

    // Loader
    const { Loader, isLoading, fetchData } = useLoader({})
    const { isLoading: isTableLoading, fetchData: allFetch } = useLoader({})

    /*Жагсаалт дата авах функц */
    async function getDatas() {
        const lesson = select_value?.lesson
        const lesson_year = select_value?.lesson_year
        const lesson_season = select_value?.season
        const group = select_value?.group

        const { success, data } = await allFetch(lessonListApi.getLessonList(rowsPerPage, currentPage, sortField, searchValue,lesson,lesson_year, lesson_season, group, select_value.teacher))
        if (success) {
            setDatas(data?.results)
            setTotalCount(data?.count)
        }
    }

    // Багшийн жагсаалт
    async function getTeacher() {
        const { success, data } = await fetchData(teacherApi.getTeacher(select_value.lesson))
        if(success) {
            setTeacher(data)
        }
    }

	const handleFilter = e => {
        const value = e.target.value.trimStart();
        setSearchValue(value)
    }

    useEffect(
        () =>
        {
            if (searchValue.length == 0) {
                getDatas();
            } else {
                const timeoutId = setTimeout(() => {
                    getDatas();
                }, 600);
                return () => clearTimeout(timeoutId);
            }
        },
        [rowsPerPage, currentPage, sortField, searchValue, select_value, school_id]
    )
    useEffect(
        () =>
        {
            getLesson()
            setYear(generateLessonYear(5))
            getGroup()
            getSeasonOption()
        },
        [school_id]
    )

    useEffect(
        () =>
        {
            if (select_value.lesson) {
                getTeacher()
            }
        },
        [select_value?.lesson]
    )

    // Хичээлийн жагсаалт
    async function getLesson() {
        const { success, data } = await fetchData(lessonApi.getList())
        if(success) {
            setLesson(data)
        }
    }
    // Ангийн жагсаалт
    async function getGroup() {
        const { success, data } = await fetchData(groupApi.getList())
        if(success) {
            setGroup(data)
        }
    }

     // Улиралын хайлт
     async function getSeasonOption() {
        const { success, data } = await fetchData(seasonApi.get())
        if(success) {
            setSeasonOption(data)
        }
    }

    function handleSort(column, sort) {
        if(sort === 'asc') {
            setSort(column.header)
        } else {
            setSort('-' + column.header)
        }
    }

    // ** Function to handle per page
    function handlePerPage(e) {
        setRowsPerPage(parseInt(e.target.value))
    }

	function handlePagination(page) {
		setCurrentPage(page.selected + 1);
	};

     // Хайх товч дарсан үед ажиллах функц
    async function handleSearch() {
        getDatas()
    }

	return (
        <Fragment>
            <Card>
            {isLoading && Loader}
                <Row className="justify-content-between mx-0 mt-1 mb-1" sm={12}>
                    <Col sm={6} md={3} xs={12}>
                        <Label className="form-label" for="lesson">
                            {t('Хичээл')}
                        </Label>
                        <Select
                            name="lesson"
                            id="lesson"
                            classNamePrefix='select'
                            isClearable
                            className={classnames('react-select')}
                            isLoading={isLoading}
                            placeholder={`-- Сонгоно уу --`}
                            options={lessonOption || []}
                            value={lessonOption.find((c) => c.id === select_value.lesson)}
                            noOptionsMessage={() => t('Хоосон байна.')}
                            onChange={(val) => {
                                if (val?.id) {
                                    setSelectValue(current => {
                                        return {
                                            ...current,
                                            lesson: val?.id
                                        }
                                    })
                                } else {
                                    setSelectValue(current => {
                                        return {
                                            ...current,
                                            lesson: ''
                                        }
                                    })
                                }
                            }}
                            styles={ReactSelectStyles}
                            getOptionValue={(option) => option.id}
                            getOptionLabel={(option) => option.full_name}
                        />
                    </Col>
                    <Col sm={6} md={3} xs={12}>
                        <Label className="form-label" for="lesson">
                            {t('Багш')}
                        </Label>
                        <Select
                            name="lesson"
                            id="lesson"
                            classNamePrefix='select'
                            isClearable
                            className={classnames('react-select')}
                            isLoading={isLoading}
                            placeholder={`-- Сонгоно уу --`}
                            options={teacherOption || []}
                            value={teacherOption.find((c) => c.id === select_value.te)}
                            noOptionsMessage={() => t('Хоосон байна.')}
                            onChange={(val) => {
                                if (val?.id) {
                                    setSelectValue(current => {
                                        return {
                                            ...current,
                                            teacher: val?.id
                                        }
                                    })
                                } else {
                                    setSelectValue(current => {
                                        return {
                                            ...current,
                                            teacher: ''
                                        }
                                    })
                                }
                            }}
                            styles={ReactSelectStyles}
                            getOptionValue={(option) => option.id}
                            getOptionLabel={(option) => option.last_name + ' ' + option.first_name}
                        />
                    </Col>
                    <Col sm={6} md={2} xs={12}>
						<Label className="form-label me-1" for="lesson_year">
							{t('Хичээлийн жил')}
						</Label>
                        <Select
                            name="lesson_year"
                            id="lesson_year"
                            classNamePrefix='select'
                            isClearable
                            className={classnames('react-select')}
                            isLoading={isLoading}
                            options = {yearOption || []}
                            placeholder={t('-- Сонгоно уу --')}
                            noOptionsMessage={() => t('Хоосон байна')}
                            styles={ReactSelectStyles}
                            value={yearOption.find((e) => e.id === select_value.lesson_year)}
                            onChange={(val) => {
                                if (val?.id) {
                                    setSelectValue(current => {
                                        return {
                                            ...current,
                                            lesson_year: val?.id
                                        }
                                    })
                                } else {
                                    setSelectValue(current => {
                                        return {
                                            ...current,
                                            lesson_year: ''
                                        }
                                    })
                                }
                            }}
                            getOptionValue={(option) => option.id}
                            getOptionLabel={(option) => option.name}
                    />
                    </Col>
                    <Col sm={6} md={2} xs={12}>
                        <Label className="form-label" for="season">
                            {t('Улирал')}
                        </Label>
                        <Select
                            name="season"
                            id="season"
                            classNamePrefix='select'
                            isClearable
                            className={classnames('react-select')}
                            isLoading={isLoading}
                            placeholder={t('-- Сонгоно уу --')}
                            options={season_option || []}
                            value={season_option.find((c) => c.id === select_value.season)}
                            noOptionsMessage={() => 'Хоосон байна'}
                            onChange={(val) => {
                                if (val?.id) {
                                    setSelectValue(current => {
                                        return {
                                            ...current,
                                            season: val?.id
                                        }
                                    })
                                } else {
                                    setSelectValue(current => {
                                        return {
                                            ...current,
                                            season: ''
                                        }
                                    })
                                }
                            }}
                            styles={ReactSelectStyles}
                            getOptionValue={(option) => option.id}
                            getOptionLabel={(option) => option.season_name}
                        />
                    </Col>
                    <Col sm={6} md={2} xs={12}>
                        <Label className="form-label" for="group">
                            {t("Анги")}
                        </Label>
                        <Select
                            name="group"
                            id="group"
                            classNamePrefix='select'
                            isClearable
                            className={classnames('react-select')}
                            isLoading={isLoading}
                            placeholder={t('-- Сонгоно уу --')}
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
                    <Row className='mt-1 d-flex justify-content-between mx-0'>
                    <Col className='d-flex align-items-center justify-content-start ' >
                        <Col md={2} sm={3} className='pe-1'>
                            <Input
                                className='dataTable-select me-1 mb-50'
                                type='select'
                                bsSize='sm'
                                style={{ height: "30px",}}
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
                    <Col className='d-flex align-items-center mobile-datatable-search'>
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
                <div className="react-dataTable react-dataTable-selectable-rows"  id="datatableLeftTwoRightOne">
                    <DataTable
                        noHeader
                        paginationServer
                        pagination
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
        </Card>
    </Fragment>
    )
}

export default Lesson;
