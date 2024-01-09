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

import { validate, convertDefaultValue, ReactSelectStyles } from "@utils"

import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';

import Select from 'react-select'
import classNames from "classnames"

import { useTranslation } from 'react-i18next';

import * as Yup from 'yup'

const TEACHER_DEGREE_KREDIT = 2

const validateSchema = Yup.object().shape(
{
    ratio: Yup.string()
        .trim()
        .required('Хоосон байна'),
});

export const Addmodal = ( { open, refreshDatas, handleModal, type, editData } ) => {
    const { t } = useTranslation()
    const [positionOption, setPositionOption] = useState([])

    // ** Hook
    const { control, handleSubmit, setValue, formState: { errors }, reset, setError } = useForm(validate(validateSchema));

    // Loader
    const { Loader, isLoading, fetchData } = useLoader({isSmall: true});
	const { isLoading: postLoading, fetchData: postFetch } = useLoader({});

    // API
    const settingsApi = useApi().credit.settings
    const positionApi = useApi().hrms.position

    // Хөтөлбөрийн жагсаалт
    async function getPosition() {
        const { success, data } = await fetchData(positionApi.get())
        if (success) {
            setPositionOption(data)
        }
    }

    async function onSubmit(cdata) {
        cdata = convertDefaultValue(cdata)
        cdata['type'] = type

        if (cdata?.id) {
            const { success, errors } = await postFetch(settingsApi.put(cdata, cdata?.id))
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
            const { success, errors } = await postFetch(settingsApi.post(cdata))
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
            if (type === TEACHER_DEGREE_KREDIT) {
                getPosition()
            }
        }, [type]
    )

    useEffect(
        () => {
            if (Object.keys(editData).length > 0) {
                for (let key in editData) {
                    setValue(key, editData[key])
                }
            }
        }, [editData]
    )

    return (
        <Modal isOpen={open} toggle={handleModal} className="modal-dialog-centered modal-sm">
            {isLoading && <div className='suspense-loader'><Spinner size='xl'/></div>}
            <ModalHeader toggle={handleModal}> { editData?.id ?  t('Тохиргоо засах'): t('Тохиргоо бүртгэх')}
            </ModalHeader>
            <ModalBody>
                <Row tag={Form} className="gy-1" onSubmit={handleSubmit(onSubmit)}>
                    {
                        type === TEACHER_DEGREE_KREDIT
                        ?
                        <Col md={12}>
                            <Label className="form-label" for="position">
                                {t('Албан тушаал')}
                            </Label>
                            <Controller
                                control={control}
                                defaultValue=''
                                name="position"
                                render={({ field: { value, onChange } }) => {
                                    return (
                                        <Select
                                            name="position"
                                            id="position"
                                            classNamePrefix='select'
                                            isClearable
                                            className={classNames('react-select', {'is-invalid': errors.position})}
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
                            {errors.position && <FormFeedback className='d-block'>{t(errors.position.message)}</FormFeedback>}
                        </Col>
                        :
                            <Col md={12}>
                                <Label className="form-label" for="name">
                                    {t('Нэр')}
                                </Label>
                                <Controller
                                    defaultValue=''
                                    control={control}
                                    id='name'
                                    name='name'
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                            type='text'
                                            name='name'
                                            bsSize='sm'
                                            id='name'
                                            placeholder='Нэр'
                                            invalid={errors.name && true}
                                        />
                                    )}
                                />
                                {errors.name && <FormFeedback className='d-block'>{t(errors.name.message)}</FormFeedback>}
                            </Col>
                    }
                    <Col md={12}>
                        <Label className="form-label" for="ratio">
                            { type === TEACHER_DEGREE_KREDIT ? t('Кредитийн норм') : 'Коэффициент'}
                        </Label>
                        <Controller
                            defaultValue=''
                            control={control}
                            id="ratio"
                            name="ratio"
                            render={({ field }) => (
                                <Input
                                    {...field}
                                    id="ratio"
                                    bsSize="sm"
                                    type="number"
                                    placeholder={ type === TEACHER_DEGREE_KREDIT ? t('Кредит') : 'Коэффициент'}
                                    invalid={errors.ratio && true}
                                />
                            )}
                        />
                        {errors.ratio && <FormFeedback className='d-block'>{t(errors.ratio.message)}</FormFeedback>}
                    </Col>
                    <Col md={12} className="text-center mt-2 ">
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
