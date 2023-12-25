import React, { Fragment, useState, useEffect, useContext, useRef, useMemo} from "react";

import Select from 'react-select'

import useLoader from "@hooks/useLoader";

import { ReactSelectStyles, generateLessonYear } from "@utils"

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


import useApi from '@hooks/useApi';

import { useForm, Controller } from "react-hook-form";

import SchoolContext from "@context/SchoolContext"
import { t } from "i18next";

import CTable from './CTable'
import AuthContext from "@context/AuthContext"

function UpdateInput(props) {

    const {
        rowIdx,
        colIdx,
        row,
        column,
        datas,
    } = props

    const [ value, setChangeValue ] = useState('')
    const [ error_message, setErrorMessage ] = useState('')

    const focusData = useRef(undefined)
    const [ index_name, setIndName ] = useState('')

    const scoreApi = useApi().score.register

    const { fetchData } = useLoader({})

    const handleChange = (e) => {
        setChangeValue(e.target.value)
    }

    const handleSetTeachResult = async(event) => {
        if (["e", "E", "+", "-"].includes(event.key))
        {
            event.preventDefault()
        }
        if (event.key === 'Enter')
        {
            const rowsInput = [...datas];
            var item_datas = rowsInput[rowIdx]
            if (value > 100) {
                setErrorMessage(`100-иас их утга авах боломжгүй`)
            } else {
                setErrorMessage('')

                rowsInput[rowIdx][column?.key] = value;

                const { success, data } = await fetchData(scoreApi.putScore(row?.id, item_datas))
                if(success)
                {
                    focusData.current = undefined
                    var nextElementId = 'score' + '-' + (colIdx) + (rowIdx + 1)
                    var element = document.getElementById(`${nextElementId}`)

                    if (element) element.focus()
                    else event.preventDefault()

                    setChangeValue('')
                }
            }
        }
    };

    /** Input-ээс идэвхгүй болох үеийн event */
    const focusOut = (event) => {
        if (focusData.current || focusData.current == '')
        {
            event.target.value = focusData.current
        }
    }

    return(
        <div className='mt-1'>
            <Input
                style={{ maxWidth: '220px'}}
                name={`score-${colIdx}`}
                id={`score-${colIdx}${rowIdx}`}
                key={`score-${colIdx}${rowIdx}`}
                invalid={(`score-${colIdx}${rowIdx}` === index_name) && error_message ? true : false}
                bsSize='sm'
                disabled={Object.keys(props?.user).length > 0 && (props.user?.permissions.includes('lms-score-update')) ? false : true}
                type='number'
                placeholder={`Нийт дүн`}
                defaultValue={row[column.key] || value}
                onBlur={focusOut}
                onChange={(e) => handleChange(e)}
                onFocus={(e) => { focusData.current = e.target.value}}
                onKeyPress={(e) => { handleSetTeachResult(e), setIndName(`score-${colIdx}${rowIdx}`) }}
            />
            {(`score-${colIdx}${rowIdx}` == index_name) && error_message && <FormFeedback className='d-block'>{error_message}</FormFeedback>}
        </div>
    )
}

const headers = [
    {
        key: 'student.code',
        name: `${t('Оюутны код')}`,
        sortable: true,
        minWidth: "70px",
        editable: false,
        center: true
    },
    {
        key: 'student.first_name',
        name: `${t('Оюутны нэр')}`,
        sortable: true,
        minWidth: "100px",
        editable: false,
        center: true
    },
    {
        key: 'teach_score',
        name: `${t('Багшийн оноо')}`,
        sortable: true,
        center: true,
        editable: false,
        minWidth: "80px",
    },
    {
        key: 'exam_score',
        name: `${t('Шалгалтын оноо')}`,
        sortable: true,
        center: true,
        editable: false,
        minWidth: "180px",
    },
    {
        key: 'score_total',
        name: 'Нийт оноо',
        editable: true,
        center: true,
        component: (props) => UpdateInput(props)
    },
    {
        key: 'assessment',
        name: `${t('Үсгэн үнэлгээ')}`,
        sortable: true,
        minWidth: "50px",
        center: true
    },
    {
        key: 'lesson_year',
        name: `${t('Хичээлийн жил')}`,
        sortable: true,
        minWidth: "50px",
        center: true
    },
    {
        key: 'lesson_season.season_name',
        name: `${t('Улирал')}`,
        sortable: true,
        minWidth: "50px",
        center: true
    },
]


const LessonV2 = () => {

    var values = {
        lesson: '',
        lesson_year: '',
        season: '',
        group: '',
    }

    // ** Hook
    const { control, formState: { errors } } = useForm({});
    const [rowsPerPage, setRowsPerPage] = useState(10)

    const [searchValue, setSearchValue] = useState("");
    const [sortField, setSort] = useState('')

    const [yearOption, setYear] = useState([])
    const [lessonOption, setLesson] = useState([])
    const [groupOption, setGroup] = useState([])
    const [season_option, setSeasonOption] = useState([])
    const [select_value, setSelectValue] = useState(values)

    const { school_id } = useContext(SchoolContext)
    const { user } = useContext(AuthContext)

    const [datas, setDatas] = useState([]);

    // Хуудаслалтын анхны утга
    const [currentPage, setCurrentPage] = useState(1)

    const [total_count, setTotalCount] = useState(1)

    // Эрэмбэлэлт

    // Api
    const lessonApi = useApi().study.lessonStandart
    const groupApi = useApi().student.group
    const seasonApi = useApi().settings.season
    const lessonListApi = useApi().print.score

    // Нийт датаны тоо
    const default_page = [10, 15, 50, 75, 100]

    // Loader
    const { Loader, isLoading, fetchData } = useLoader({isFullScreen: false})
    const { isLoading: isTableLoading, fetchData: allFetch } = useLoader({isFullScreen: false})

    /*Жагсаалт дата авах функц */
    async function getDatas() {
        const lesson = select_value?.lesson
        const lesson_year = select_value?.lesson_year
        const lesson_season = select_value?.season
        const group = select_value?.group

        const { success, data } = await allFetch(lessonListApi.getLessonList(rowsPerPage, currentPage, sortField, searchValue,lesson,lesson_year, lesson_season, group))
        if (success) {
            setDatas(data?.results)
            setTotalCount(data?.count)
        }
    }

	const handleFilter = e => {
        const value = e.target.value.trimStart();
        setSearchValue(value)
    }

    useEffect(
        () =>
        {
            if (select_value.lesson) {
                if (searchValue.length == 0 && select_value.lesson) {
                    getDatas();
                } else {
                        const timeoutId = setTimeout(() => {
                            getDatas();
                        }, 600);
                        return () => clearTimeout(timeoutId);
                    }
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
    // ** Function to handle per page
    function handlePerPage(e) {
        setRowsPerPage(parseInt(e.target.value))
    }

    // Хайх товч дарсан үед ажиллах функц
    async function handleSearch() {
        getDatas()
    }

    const tableMemo = useMemo(
        () =>
        {
            return (
                <CTable
                    headers={headers}
                    cdatas={datas}
                    rowsPerPage={rowsPerPage}
                    setCurrentPage={setCurrentPage}
                    currentPage={currentPage}
                    total_count={total_count}
                    pagination={true}
                    user={user}
                />
            )
        }, [ currentPage, rowsPerPage, datas]
    )

	return (
        <Fragment>
            <Card>
            {isLoading && Loader}
                <Row className="justify-content-between mx-0 mt-1 mb-1" sm={12}>
                <Col sm={6} lg={3}>
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
                                        placeholder={`-- Сонгоно уу --`}
                                        options={lessonOption || []}
                                        value={lessonOption.find((c) => c.id === value)}
                                        noOptionsMessage={() => t('Хоосон байна.')}
                                        onChange={(val) => {
                                            onChange(val?.id || '')
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
                                )
                            }}
                        ></Controller>
                    </Col>
                    <Col sm={6} lg={3}>
						<Label className="form-label me-1" for="lesson_year">
							{t('Хичээлийн жил')}
						</Label>
                        <Controller
                            control={control}
                            defaultValue=''
                            name="lesson_year"
                            render={({ field: { value, onChange} }) => {
                                return (
                                    <Select
                                        name="lesson_year"
                                        id="lesson_year"
                                        classNamePrefix='select'
                                        isClearable
                                        className={classnames('react-select', { 'is-invalid': errors.lesson_year })}
                                        isLoading={isLoading}
                                        options = {yearOption || []}
                                        placeholder={t('-- Сонгоно уу --')}
                                        noOptionsMessage={() => t('Хоосон байна')}
                                        styles={ReactSelectStyles}
                                        value={value && yearOption.find((e) => e.id === value)}
                                        onChange={(val) => {
                                            onChange(val?.id || '')
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
                                )
                            }}
                        ></Controller>
                    </Col>
                    <Col sm={6} lg={3} >
                        <Label className="form-label" for="season">
                            {t('Улирал')}
                        </Label>
                        <Controller
                            control={control}
                            defaultValue=''
                            name="season"
                            render={({ field: { value, onChange} }) => {
                                return (
                                    <Select
                                        name="season"
                                        id="season"
                                        classNamePrefix='select'
                                        isClearable
                                        className={classnames('react-select', { 'is-invalid': errors.season })}
                                        isLoading={isLoading}
                                        placeholder={t('-- Сонгоно уу --')}
                                        options={season_option || []}
                                        value={value && season_option.find((c) => c.id === value)}
                                        noOptionsMessage={() => 'Хоосон байна'}
                                        onChange={(val) => {
                                            onChange(val?.id || '')
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
                                )
                            }}
                        ></Controller>
                    </Col>
                    <Col sm={6} lg={3}>
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
                <div className="react-dataTable react-dataTable-selectable-rows">
                    {tableMemo}
                </div>
        </Card>
    </Fragment>
    )
}

export default LessonV2;
