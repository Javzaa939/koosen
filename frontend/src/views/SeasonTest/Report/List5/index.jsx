// ** React Imports
import { memo, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
// import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import Select from 'react-select'

import useApi from '@hooks/useApi'
import useLoader from '@hooks/useLoader'

import { Col, Label, Row, Button } from 'reactstrap'
import { ReactSelectStyles, generateLessonYear } from '@src/utility/Utils'
import classnames from "classnames";
import Graphic from './Graphic'
const List5 = () => {

    var values = {
        department: '',
        lesson: '',
        season: '',
        lesson_year: '',
        teacher: '',
    }

    const { t } = useTranslation()
    const [chartDatas, setDatas] = useState([])
    const { isLoading, Loader, fetchData: fetchData } = useLoader({ isFullScreen: true })
    const { isLoading: graLoading, fetchData: graFetchData } = useLoader({})

    const challengeApi = useApi().challenge
    const seasonApi = useApi().settings.season
    const departmentApi = useApi().hrms.department
    const teacherApi = useApi().hrms.teacher
    const lessonApi = useApi().study.lessonStandart

    const [departmentOption, setDepartmentOption] = useState([])
    const [teacherOption, setTeacherOption] = useState([])
    const [lessonOption, setLessonOption] = useState([])
    const [season_option, setSeasonOption] = useState([])
    const [yearOption, setYear] = useState([])
    const [select_value, setSelectValue] = useState(values);

    // async function getDepartmentOption() {
    //     const { success, data } = await fetchData(departmentApi.get())
    //     if (success) {
    //         setDepartmentOption(data)
    //     }
    // }

    async function getSeasonOption() {
        const { success, data } = await fetchData(seasonApi.get())
        if (success) {
            setSeasonOption(data)
        }
    }

    async function getTeachers(lesson_id) {
        const { success, data } = await fetchData(teacherApi.getLessonToTeacher(lesson_id))
        if (success) {
            setTeacherOption(data)
        }
    }

    async function getLesson() {
        const { success, data } = await fetchData(lessonApi.getExam())
        if (success) {
            setLessonOption(data)
        }
    }

    async function getChartData() {
        const { success, data } = await graFetchData(challengeApi.chart1(select_value.department, select_value.lesson_year, select_value.season, select_value.teacher, select_value.lesson))
        if (success) {
            setDatas(data)
        }
    }

    useEffect(() => {
        // getDepartmentOption()
        getSeasonOption()
    }, [])

    useEffect(
        () => {
            if (select_value.lesson) {
                getTeachers(select_value.lesson)
            }
            else {
                getTeachers(0)
            }
        },
        [select_value.lesson]
    )

    useEffect(
        () => {
            getLesson()
        },
        []
    )

    useEffect(
        () => {
            setYear(generateLessonYear(5))
        },
        []
    )


    return (
        <div className='px-1'>
            {isLoading && Loader}
            <Row>
                {/* <Col md={3}>
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
                </Col> */}
                <Col md={3} className='mb-1 ms-1'>
                    <Label className="form-label me-1" for="building">
                        {t('Хичээлийн жил')}
                    </Label>
                    <Select
                        name="lesson_year"
                        id="lesson_year"
                        classNamePrefix='select'
                        isClearable
                        className={'react-select'}
                        isLoading={isLoading}
                        options={yearOption || []}
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
                        noOptionsMessage={() => t('Хоосон байна')}
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
                <Col md={3} className='mb-1'>
                    <Label className="form-label" for="teacher">
                        {t('Хичээл')}
                    </Label>
                    <Select
                        name="lesson"
                        id="lesson"
                        classNamePrefix='select'
                        isClearable
                        className={classnames('react-select')}
                        isLoading={isLoading}
                        placeholder={t('-- Сонгоно уу --')}
                        options={lessonOption || []}
                        value={lessonOption.find((c) => c.id === select_value.lesson)}
                        noOptionsMessage={() => t('Хоосон байна')}
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
                        getOptionLabel={(option) => option.code + ' ' + option?.name}
                    />
                </Col>
                <Col md={3} className='mb-1'>
                    <Label className="form-label" for="teacher">
                        {t('Заах багш')}
                    </Label>
                    <Select
                        name="teacher"
                        id="teacher"
                        classNamePrefix='select'
                        isClearable
                        className={classnames('react-select')}
                        isLoading={isLoading}
                        placeholder={t('-- Сонгоно уу --')}
                        options={teacherOption || []}
                        value={teacherOption.find((c) => c.id === select_value.teacher)}
                        noOptionsMessage={() => t('Хоосон байна')}
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
                        getOptionLabel={(option) => `${option?.last_name[0]}.${option?.first_name}`}
                    />
                </Col>
                <Col md={2} className='mt-1'>
                    <Button
                        disabled={!(select_value.lesson && select_value.teacher)}
                        onClick={() => getChartData()}
                        fullWidth
                        variant='contained'
                        color='primary'
                    >
                        Хайх
                    </Button>
                </Col>
            </Row>
            <div className='mt-3'>
                <Graphic
                    data={chartDatas}
                    loading={graLoading}
                    extra={
                        {
                            "teacher": teacherOption?.find(e => e.id === select_value.teacher)?.first_name,
                            "lesson": lessonOption?.find(e => e.id === select_value.lesson)?.name,
                            "year": select_value?.lesson_year,
                            "season": season_option?.find(e => e.id === select_value.season)?.season_name,
                        }
                    }
                />
            </div>
        </div>
    )
}

export default memo(List5);
