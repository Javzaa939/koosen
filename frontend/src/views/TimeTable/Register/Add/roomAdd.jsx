import React, { Fragment, useState, useEffect } from 'react'
import {
    Col,
    Row,
    Label,
    Input,
    FormFeedback,
    Form,
    Button
} from 'reactstrap'

import { useForm, Controller } from "react-hook-form";

import { validate, get_room_type, convertDefaultValue } from "@utils"

import { validateSchema } from '../../Room/validateSchema';

import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';

import { useTranslation } from 'react-i18next';


export const RoomAdd = ( {refreshDatas, handleModal} ) => {
    const { t } = useTranslation()

        // ** Hook
    const { control, handleSubmit, formState: { errors }, reset, setError } = useForm(validate(validateSchema));

    // Loader
    const { Loader, isLoading, fetchData } = useLoader({});

    const [buildingOption, setBuilding] =useState([])
    const [schoolOption, setSchoolOption] =useState([])
    const [typeOption, setType] =useState([])

    // API
    const buildingApi = useApi().timetable.building
    const roomApi = useApi().timetable.room
    const schoolApi = useApi().hrms.subschool

    function getAll() {
        Promise.all(
            [
                fetchData(buildingApi.get()),
                fetchData(schoolApi.get()),
            ]
        ).then((values) => {
            setBuilding(values[0].data)
            setSchoolOption(values[1].data)
        })
    }

    async function onSubmit(cdata) {
        cdata = convertDefaultValue(cdata)
        const { success, error } = await fetchData(roomApi.post(cdata))
        if(success) {
            reset()
            refreshDatas()
            handleModal()
        } else {
            /** Алдааны мессэжийг input дээр харуулна */
            for (let key in error) {
                setError(error[key].field, { type: 'custom', message:  error[key].msg});
            }
        }
	}

    useEffect(()=>{
        getAll()
        setType(get_room_type())
    },[])

    return (
        <Row tag={Form} className="gy-1" onSubmit={handleSubmit(onSubmit)}>
            <Col md={6}>
                <Label className="form-label" for="school">
                    {t('Сургууль')}
                </Label>
                <Controller
                    defaultValue=''
                    control={control}
                    id='school'
                    name='school'
                    render={({ field }) => (
                        <Input
                            {...field}
                            type='select'
                            name='school'
                            bsSize='sm'
                            id='school'
                            invalid={errors.school && true}
                        >
                            <option value="">{t('-- Сонгоно уу --')}</option>
                            {
                                schoolOption.map((school, idx) => (
                                    <option key={idx} value={school.id}>
                                        {school.name}
                                    </option>
                                ))
                            }
                        </Input>
                    )}
                />
                {errors.school && <FormFeedback className='d-block'>{t(errors.school.message)}</FormFeedback>}
            </Col>
            <Col md={6}>
                <Label className="form-label" for="building">
                    {t('Хичээлийн байр')}
                </Label>
                <Controller
                    defaultValue=''
                    control={control}
                    id='building'
                    name='building'
                    render={({ field }) => (
                        <Input
                            {...field}
                            type='select'
                            name='building'
                            bsSize='sm'
                            id='building'
                            invalid={errors.building && true}
                        >
                            <option value="">{t('-- Сонгоно уу --')}</option>
                            {
                                buildingOption.map((build, idx) => (
                                    <option key={idx} value={build.id}>{build.name}</option>
                                ))
                            }
                        </Input>
                    )}
                />
                {errors.building && <FormFeedback className='d-block'>{t(errors.building.message)}</FormFeedback>}
            </Col>
            <Col md={6}>
                <Label className="form-label" for="code">
                    {t('Өрөөний дугаар')}
                </Label>
                <Controller
                    defaultValue=''
                    control={control}
                    id="code"
                    name="code"
                    render={({ field }) => (
                        <Input
                            {...field}
                            id="code"
                            bsSize="sm"
                            type="text"
                            placeholder={t('Өрөөний дугаар')}
                            invalid={errors.code && true}
                        />
                    )}
                />
                {errors.code && <FormFeedback className='d-block'>{t(errors.code.message)}</FormFeedback>}
            </Col>
            <Col md={6}>
                <Label className="form-label" for="name">
                    {t('Өрөөний нэр')}
                </Label>
                <Controller
                    defaultValue=''
                    control={control}
                    id="name"
                    name="name"
                    render={({ field }) => (
                        <Input
                            {...field}
                            id="name"
                            bsSize="sm"
                            placeholder={t('Өрөөний нэр')}
                            type="text"
                            invalid={errors.name && true}
                        />
                    )}
                />
                {errors.name && <FormFeedback className='d-block'>{t(errors.name.message)}</FormFeedback>}
            </Col>
            <Col md={6}>
                <Label className="form-label" for="type">
                    {t('Өрөөний төрөл')}
                </Label>
                <Controller
                    defaultValue=''
                    control={control}
                    id='type'
                    name='type'
                    render={({ field }) => (
                        <Input
                            {...field}
                            type='select'
                            name='type'
                            bsSize='sm'
                            id='type'
                            invalid={errors.type && true}
                        >
                            <option value="">{t('-- Сонгоно уу --')}</option>
                            {
                                typeOption.map((type, idx) => (
                                    <option key={idx} value={type.id}>{type.name}</option>
                                ))
                            }
                        </Input>
                    )}
                />
                {errors.type && <FormFeedback className='d-block'>{t(errors.type.message)}</FormFeedback>}
            </Col>
            <Col md={12} className="mt-2 ">
                <Button className="me-2" color="primary" type="submit">
                    {t('Хадгалах')}
                </Button>
                <Button color="secondary" type="reset" outline  onClick={handleModal}>
                    {t('Буцах')}
                </Button>
            </Col>
        </Row>
    )
}
