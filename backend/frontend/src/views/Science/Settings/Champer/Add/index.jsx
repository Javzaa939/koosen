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
    Button
} from 'reactstrap'

import { useForm, Controller } from "react-hook-form";

import { validate, convertDefaultValue  } from "@utils"

import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';

import { useTranslation } from 'react-i18next';

import * as Yup from 'yup'

const validateSchema = Yup.object().shape(
    {
        name: Yup.string()
            .trim()
            .required('Хоосон байна'),

        point: Yup.string()
            .trim()
            .required('Хоосон байна'),
    });


export const Addmodal = ( { open, refreshDatas, handleModal, editData, type } ) => {
    const { t } = useTranslation()

    // ** Hook
    const { control, handleSubmit, setValue, formState: { errors }, reset, setError } = useForm(validate(validateSchema));

    // Loader
    const { Loader, isLoading, fetchData } = useLoader({isSmall: true});

    // API
    const settingsApi = useApi().science.settings


    async function onSubmit(cdata) {
        cdata = convertDefaultValue(cdata)

        if (cdata?.id) {
            const { success, error } = await fetchData(settingsApi.put(type, cdata))
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
        } else {
            const { success, error } = await fetchData(settingsApi.post(type, cdata))
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
	}

    useEffect(
        () => {
            if (Object.keys(editData).length > 0) {
                for (let key in editData) {
                    setValue(key, editData[key])
                }
            }
        }
    )

    return (
        <Modal isOpen={open} toggle={handleModal} className="modal-dialog-centered modal-sm">
            <ModalHeader toggle={handleModal}>{t('Тохиргоо')}</ModalHeader>
            <ModalBody>
                <Row tag={Form} className="gy-1" onSubmit={handleSubmit(onSubmit)}>
                    <Col md={12}>
                        <Label className="form-label" for="name">
                            {'Нэр'}
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
                                    type="text"
                                    placeholder={'Нэр'}
                                    invalid={errors.name && true}
                                />
                            )}
                        />
                        {errors.name && <FormFeedback className='d-block'>{t(errors.name.message)}</FormFeedback>}
                    </Col>
                    <Col md={12}>
                        <Label className="form-label" for="point">
                            {'Оноо'}
                        </Label>
                        <Controller
                            defaultValue=''
                            control={control}
                            id="point"
                            name="point"
                            render={({ field }) => (
                                <Input
                                    {...field}
                                    id="point"
                                    bsSize="sm"
                                    type="number"
                                    placeholder={'Оноо'}
                                    invalid={errors.point && true}
                                />
                            )}
                        />
                        {errors.point && <FormFeedback className='d-block'>{t(errors.point.message)}</FormFeedback>}
                    </Col>
                    <Col md={12} className="mt-2 ">
                        <Button className="me-2" color="primary" type="submit">
                            {isLoading && Loader}
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
