
import React, { Fragment, useEffect, useState } from "react"

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

export default function Confrontation()
{
    var values = {
        profession: '',
        department: '',
    }

    // Translate
    const { t } = useTranslation()

    const navigate = useNavigate();

    // Hook
    const { control, setValue, handleSubmit, formState: { errors } } = useForm(validate(validateSchema));

    // UseState
    const [ datas, setDatas ] = useState({})
    const [ profOption, setProfession] = useState([])
    const [ depOption, setDepartment] = useState([])
    const [ select_value, setSelectValue ] = useState(values)

    // Loader
	const { isLoading, Loader, fetchData } = useLoader({});

    // API
    const depApi = useApi().hrms.department
    const professionApi = useApi().study.professionDefinition
    const planApi = useApi().study.plan

    // Салбарын жагсаалт авах
    async function getDepartment()
    {
        const { success, data } = await fetchData(depApi.get())
        if (success)
        {
            setDepartment(data)
        }
	}

    //Мэргэжлийн жагсаалт авах
    async function getProfession()
    {

        var salbar = select_value?.department

        const { success, data } = await fetchData(professionApi.getList('', salbar))
        if (success)
        {
            setProfession(data)
        }
	}

    useEffect(
        () =>
        {
            getDepartment()
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

    async function onSubmit(cdatas)
    {
        let department = cdatas.department
        let profession = cdatas.profession

        const { success, data } = await fetchData(planApi.printGetPlan(department, profession))
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
                    <Col md={6}>
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
                    <Col md={6}>
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
                </Row>
            </Card>
        </Fragment>
    )
}
