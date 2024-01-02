import React, { useState, useEffect } from 'react'
import {
    Modal,
    ModalBody,
    ModalHeader,
    Col,
    Row,
    Label,
    Input,
    FormFeedback,
    Form,
    Button,
    Spinner
} from 'reactstrap'

import { useForm, Controller } from "react-hook-form";

import { validate, convertDefaultValue, ReactSelectStyles,  lesson_level} from "@utils"

import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';

import Select from 'react-select'
import classNames from "classnames"

import { useTranslation } from 'react-i18next';

import * as Yup from 'yup'

const validateSchema = Yup.object().shape(
{
    amount: Yup.string()
        .trim()
        .required('Хоосон байна'),

    school: Yup.string()
        .trim()
        .required('Хоосон байна'),
});


export const AddPerformancemodal = ( { open, refreshDatas, handleModal, editData } ) => {
    const { t } = useTranslation()
    const [positionOption, setPositionOption] = useState([])

    // ** Hook
    const { control, handleSubmit, setValue, formState: { errors }, reset, setError } = useForm(validate(validateSchema));

    // Loader
    const { Loader, isLoading, fetchData } = useLoader({isSmall: true});
	const { isLoading: postLoading, fetchData: postFetch } = useLoader({});

    // API
    const performanceApi = useApi().credit.performance
    const schoolApi = useApi().hrms.subschool

    // Мэргэжлийн жагсаалт
    async function getSchools() {
        const { success, data } = await fetchData(schoolApi.get())
        if (success) {
            setPositionOption(data)
        }
    }

    async function onSubmit(cdata) {
        cdata = convertDefaultValue(cdata)

        if (cdata?.id) {
            const { success, errors } = await postFetch(performanceApi.put(cdata, cdata?.id))
            if(success) {
                reset()
                refreshDatas()
                handleModal()
            } else {
                /** Алдааны мессэжийг input дээр харуулна */
                for (let key in errors) {
                    setError(key, { type: 'custom', message: errors[key][0]});
                }
            }
        } else {
            const { success, errors } = await postFetch(performanceApi.post(cdata))
            if(success) {
                reset()
                refreshDatas()
                handleModal()
            } else {
                /** Алдааны мессэжийг input дээр харуулна */
                for (let key in errors) {
                    setError(key, { type: 'custom', message: errors[key][0]});
                }
            }
        }
	}

    useEffect(
        () => {
            getSchools()
        }, []
    )

    useEffect(
        () => {
            if (Object.keys(editData).length > 0) {
                for (let key in editData) {

                    if (key === 'school') {
                        setValue(key, editData[key]?.id)
                    } else {
                        setValue(key, editData[key])
                    }
                }
            }
        }
    )

    return (
        <Modal isOpen={open} toggle={handleModal} className="modal-dialog-centered modal-sm">
            {isLoading && <div className='suspense-loader'><Spinner size='xl'/></div>}
            <ModalHeader toggle={handleModal}>{t('Тохиргоо бүртгэх')}</ModalHeader>
            <ModalBody>
                <Row tag={Form} className="gy-1" onSubmit={handleSubmit(onSubmit)}>
                    <Col md={12}>
                        <Label className="form-label" for="school">
                            {t('Сургууль')}
                        </Label>
                        <Controller
                            control={control}
                            defaultValue=''
                            name="school"
                            render={({ field: { value, onChange } }) => {
                                return (
                                    <Select
                                        name="school"
                                        id="school"
                                        classNamePrefix='select'
                                        isClearable
                                        className={classNames('react-select', {'is-invalid': errors.school})}
                                        isLoading={isLoading}
                                        placeholder={t('-- Сонгоно уу --')}
                                        options={positionOption || []}
                                        value={positionOption.find((c) => c.id === value)}
                                        noOptionsMessage={() => t('Хоосон байна')}
                                        onChange={(val) => {
                                            onChange(val?.id || '')
                                        }}
                                        styles={ReactSelectStyles}
                                        getOptionValue={(option) => option.id}
                                        getOptionLabel={(option) => option.name}
                                    />
                                )
                            }}
                        />
                        {errors.school && <FormFeedback className='d-block'>{t(errors.school.message)}</FormFeedback>}
                    </Col>
                    <Col md={12}>
                        <Label className="form-label" for="lesson_level">
                            {t('Хичээлийн түвшин')}
                        </Label>
                        <Controller
                            control={control}
                            defaultValue=''
                            name="lesson_level"
                            render={({ field: { value, onChange } }) => {
                                return (
                                    <Select
                                        name="lesson_level"
                                        id="lesson_level"
                                        classNamePrefix='select'
                                        isClearable
                                        className={classNames('react-select', {'is-invalid': errors.lesson_level})}
                                        isLoading={isLoading}
                                        placeholder={t('-- Сонгоно уу --')}
                                        options={lesson_level() || []}
                                        value={lesson_level().find((c) => c.id === value)}
                                        noOptionsMessage={() => t('Хоосон байна')}
                                        onChange={(val) => {
                                            onChange(val?.id || '')
                                        }}
                                        styles={ReactSelectStyles}
                                        getOptionValue={(option) => option.id}
                                        getOptionLabel={(option) => option.name}
                                    />
                                )
                            }}
                        />
                        {errors.lesson_level && <FormFeedback className='d-block'>{t(errors.lesson_level.message)}</FormFeedback>}
                    </Col>
                    <Col md={12}>
                        <Label className="form-label" for="amount">
                            {'Коэффициент'}
                        </Label>
                        <Controller
                            defaultValue=''
                            control={control}
                            id="amount"
                            name="amount"
                            render={({ field }) => (
                                <Input
                                    {...field}
                                    id="amount"
                                    bsSize="sm"
                                    type="number"
                                    placeholder={'Коэффициент'}
                                    invalid={errors.amount && true}
                                />
                            )}
                        />
                        {errors.amount && <FormFeedback className='d-block'>{t(errors.amount.message)}</FormFeedback>}
                    </Col>
                    <Col md={12} className="mt-2 ">
                        <Button className="me-2" color="primary" type="submit" disabled={postLoading}>
                        {postLoading &&<Spinner size='sm' className='me-1'/>}
                            {t('Хадгалах')}
                        </Button>
                        <Button color="secondary" type="reset" outline  onClick={handleModal}>
                            {t('Буцах')}
                        </Button>
                    </Col>
                </Row>
            </ModalBody>
        </Modal>
    )
}
