
import React, { Fragment, useContext, useEffect, useState } from "react"

import { Row, Col, Card, Label, Button, CardTitle, CardHeader, FormFeedback, Form } from 'reactstrap'
import { useTranslation } from 'react-i18next'
import { useForm, Controller } from "react-hook-form";
import Select from 'react-select'
import { BookOpen } from 'react-feather'
import { useNavigate } from 'react-router-dom'

import classnames from "classnames";

import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';
import  useUpdateEffect  from '@hooks/useUpdateEffect'

import { ReactSelectStyles, validate } from '@utils'

import { validateSchema } from './validateSchema';

import { generateLessonYear } from "@src/utility/Utils";
import ActiveYearContext from "@src/utility/context/ActiveYearContext";

export default function Confrontation()
{
    const { cyear_name } = useContext(ActiveYearContext)
    var values = {
        year: cyear_name,
        season: '',
        profession: '',
        department: '',
        group: '',
        student: ''
    }

    // Translate
    const { t } = useTranslation()

    const navigate = useNavigate();

    // Hook
    const { control, setValue, handleSubmit, formState: { errors } } = useForm(validate(validateSchema));

    // Хичээлийн жил
    const [year, setYear] = useState(cyear_name)

    // UseState
    const [ datas, setDatas ] = useState({})
    const [season_id, setSeasonId] = useState('')

    // Options
    const [yearOption] = useState(generateLessonYear(5))
    const [seasonOption, setSeasonOption] = useState([])
    const [ profOption, setProfession] = useState([])
    const [ depOption, setDepartment] = useState([])
    const [groupOption, setGroupOption] = useState([])
    const [studentOption, setStudentOption] = useState([])

    const [ select_value, setSelectValue ] = useState(values)

    // Loader
	const { isLoading, Loader, fetchData } = useLoader({});

    // API
    const depApi = useApi().hrms.department
    const professionApi = useApi().study.professionDefinition
    const planApi = useApi().study.plan
    const seasonApi = useApi().settings.season
    const groupApi = useApi().student.group
    const studentApi = useApi().student

    // Улиралын жагсаалт авах
    async function getSeasons() {
		const { success, data } = await fetchData(seasonApi.get())
		if(success) {
			setSeasonOption(data)
		}
	}

    // Салбарын жагсаалт авах
    async function getDepartment()
    {
        const { success, data } = await fetchData(depApi.get())
        if (success)
        {
            setDepartment(data)
        }
	}

    //Хөтөлбөрийн жагсаалт авах
    async function getProfession()
    {

        var salbar = select_value?.department

        const { success, data } = await fetchData(professionApi.getList('', salbar))
        if (success)
        {
            setProfession(data)
        }
	}

    // Ангийн жагсаалт авах
    async function getGroups() {
        var department = select_value?.department
        var profession = select_value?.profession

        const { success, data } = await fetchData(groupApi.getList(department, '', profession))
        if(success) {
            setGroupOption(data)
        }
    }

    // Оюутануудын жагсаалт авах
    async function getStudents() {
        var department = select_value?.department
        var profession = select_value?.profession
        var group = select_value?.group

        const { success, data } = await fetchData(studentApi.getStudent(department, '', profession, group, ''))
        if(success) {
            setStudentOption(data)
        }
    }

    useEffect(
        () =>
        {
            getDepartment()
            getSeasons()
        },
        []
    )

    useUpdateEffect(
        () =>
        {
            getProfession()
        },
        [select_value.department]
    )
    useUpdateEffect(
        () =>
        {
            getGroups()
        },
        [select_value.profession]
    )

    useUpdateEffect(
        () =>
        {
            getStudents()
        },
        [select_value.group]
    )


    async function onSubmit(cdatas)
    {
        let department = cdatas.department
        let profession = cdatas.profession
        let group = cdatas.group
        let student = cdatas.student
        let year = select_value.year;
        let season = select_value.season;

        const { success, data } = await fetchData(planApi.printGetPlan(department, profession, group, student))
        if (success)
        {
            setDatas(data)
        }
    }

    useEffect(
        () =>
        {
            if (Object.keys(datas).length != 0)
            {
                navigate('/credit/confrontation/print', { state: datas });
            }
        },
        [datas]
    )

    return (
        <Fragment>
            <Card tag={Form} onSubmit={handleSubmit(onSubmit)} >
				<CardHeader className="flex-md-row flex-column align-md-items-center align-items-start border-bottom">
					<CardTitle tag="h4">{t('Хичээл тулгалт')}</CardTitle>
                    <div className='d-flex flex-wrap mt-md-0 mt-1'>
                        <Button color='primary' type="submit" >
                            <BookOpen size={15} />
                            <span className='align-middle ms-50'>{t('Тулгалт хийх')}</span>
                        </Button>
                    </div>
                </CardHeader>
                <Row className="justify-content-between mx-0 mt-1 mb-1">
                    <Col md={4}>
                        <Label className="form-label" for="lesson_year">
                            {t('Хичээлийн жил')}
                        </Label>
                        <Select
                            name="lesson_year"
                            id="lesson_year"
                            classNamePrefix='select'
                            isClearable
                            className={classnames('react-select')}
                            isLoading={isLoading}
                            placeholder={t('-- Сонгоно уу --')}
                            options={yearOption || []}
                            value={yearOption.find((c) => c.id === year)}
                            noOptionsMessage={() => t('Хоосон байна.')}
                            onChange={(val) => {
                                setYear(val?.id || '')
                                setSelectValue((prev) => ({
                                    ...prev,
                                    year: val?.id || ''
                                }));
                            }}
                            styles={ReactSelectStyles}
                            getOptionValue={(option) => option.id}
                            getOptionLabel={(option) => option.name}
                        />
                    </Col>
                    <Col md={4}>
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
                            options={seasonOption || []}
                            value={seasonOption.find((c) => c.id === select_value.season)}
                            noOptionsMessage={() => t('Хоосон байна.')}
                            onChange={(val) => {
                                setSeasonId(val?.id || '');
                                setSelectValue((prev) => ({
                                    ...prev,
                                    season: val?.id || ''
                                }));
                            }}
                            styles={ReactSelectStyles}
                            getOptionValue={(option) => option.id}
                            getOptionLabel={(option) => option.season_name}
                        />
                    </Col>
                    <Col md={4}>
                        <Label className="form-label" for="department">
                            {t('Тэнхим')}
                        </Label>
                        <Controller
                            defaultValue=''
                            control={control}
                            name='department'
                            render={({field: { value, onChange }}) => {
                                return (
                                    <Select
                                        name='department'
                                        id='department'
                                        classNamePrefix='select'
                                        isClearable
                                        className={classnames('react-select', { 'is-invalid': errors.department })}
                                        isLoading={isLoading}
                                        placeholder={t('--Сонгоно уу--')}
                                        options={depOption || []}
                                        value={depOption.find((c) => c.id === value)}
                                        noOptionsMessage={() => t('Хоосон байна')}
                                        onChange={(val) => {
                                            onChange(val?.id || '')
                                            setSelectValue(
                                            {
                                                department: val?.id || '',
                                                profession: '',
                                            }),
                                            setValue('profession','')
                                        }}
                                        styles={ReactSelectStyles}
                                        getOptionValue={(option) => option.id}
                                        getOptionLabel={(option) => option.name}
                                    />
                                )
                            }}
                        ></Controller>
                        {errors.department && <FormFeedback className='d-block'>{t(errors.department.message)}</FormFeedback>}
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
                                        className={classnames('react-select')}
                                        isLoading={isLoading}
                                        placeholder={t('-- Сонгоно уу --')}
                                        options={profOption || []}
                                        value={value && profOption.find((c) => c.id === value)}
                                        noOptionsMessage={() => t('Хоосон байна.')}
                                        onChange={(val) => {
                                            onChange(val?.id || '')
                                            setSelectValue({
                                                profession: val?.id || '',
                                                department: select_value.department,
                                            })
                                        }}
                                        styles={ReactSelectStyles}
                                        getOptionValue={(option) => option.id}
                                        getOptionLabel={(option) => option.full_name}
                                    />
                                )
                            }}
                        />
                        {errors.profession && <FormFeedback className='d-block'>{t(errors.profession.message)}</FormFeedback>}
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
                                        className={classnames('react-select')}
                                        isLoading={isLoading}
                                        placeholder={t('-- Сонгоно уу --')}
                                        options={groupOption || []}
                                        value={value && groupOption.find((c) => c.id === value)}
                                        noOptionsMessage={() => t('Хоосон байна.')}
                                        onChange={(val) => {
                                            onChange(val?.id || '')
                                            setSelectValue({
                                                group: val?.id || '',
                                                profession: select_value.profession,
                                                department: select_value.department,
                                            })
                                        }}
                                        styles={ReactSelectStyles}
                                        getOptionValue={(option) => option.id}
                                        getOptionLabel={(option) => option.name}
                                    />
                                )
                            }}
                        />
                        {errors.group && <FormFeedback className='d-block'>{t(errors.group.message)}</FormFeedback>}
                    </Col>
                    <Col md={4}>
                        <Label className="form-label" for="student">
                            {t('Оюутан')}
                        </Label>
                        <Controller
                            control={control}
                            defaultValue=''
                            name="student"
                            render={({ field: { value, onChange} }) => {
                                return (
                                    <Select
                                        name="student"
                                        id="student"
                                        classNamePrefix='select'
                                        isClearable
                                        className={classnames('react-select')}
                                        isLoading={isLoading}
                                        placeholder={t('-- Сонгоно уу --')}
                                        options={studentOption || []}
                                        value={value && studentOption.find((c) => c.id === value)}
                                        noOptionsMessage={() => t('Хоосон байна.')}
                                        onChange={(val) => {
                                            onChange(val?.id || '')
                                            setSelectValue({
                                                student: val?.id || '',
                                                group: select_value.group,
                                                profession: select_value.profession,
                                                department: select_value.department,
                                            })
                                        }}
                                        styles={ReactSelectStyles}
                                        getOptionValue={(option) => option.id}
                                        getOptionLabel={(option) => `${option.code} ${option.last_name} ${option.first_name} ${option.register_num}`}
                                    />
                                )
                            }}
                        />
                        {errors.student && <FormFeedback className='d-block'>{t(errors.student.message)}</FormFeedback>}
                    </Col>
                </Row>
            </Card>
        </Fragment>
    )
}
