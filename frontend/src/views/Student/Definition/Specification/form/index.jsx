
import React, { Fragment, useContext, useEffect, useState } from 'react'

import { useForm, Controller } from "react-hook-form";

import { t } from 'i18next';
import { X } from "react-feather";
import { Row, Col, Form, Modal, Input, Label, Button, ModalBody, ModalHeader, FormFeedback, InputGroup, InputGroupText, Spinner } from "reactstrap";

import useApi from "@hooks/useApi";
import useLoader from "@hooks/useLoader";

import { validate } from "@utils"

import { validateSchema } from './validateSchema';

export default function FormModal({ open, handleModal, refreshDatas, defaultDatas })
{
    const CloseBtn = (
        <X className="cursor-pointer" size={15} onClick={handleModal} />
    )

    // Hook
    const { control, handleSubmit, reset, setError, formState: { errors } } = useForm(validate(validateSchema));

    // Loader
	const { Loader, isLoading, fetchData } = useLoader({});
	const { isLoading: postLoading, fetchData: postFetch } = useLoader({});

    // Api
    const signatureApi = useApi().signature

    /** Хадгалах дарах */
    async function onSubmit(cdata)
    {
        cdata['dedication_type'] = 1


        const { success, data, error } = await postFetch(Object.keys(defaultDatas).length != 0 ? signatureApi.put(cdata, defaultDatas?.id) : signatureApi.post(cdata))
        if (success) {
            reset()
            handleModal()
            refreshDatas()
        }
        else if (error)
        {
            /** Алдааны мессэжийг input дээр харуулна */
            for (let key in error) {
                setError(error[key].field, { type: 'custom', message:  error[key].msg});
            }
        }
    }

    return (
        <Fragment>
            <Modal
                isOpen={open}
                toggle={handleModal}
                className="sidebar-lg hr-register"
                modalClassName="modal-slide-in "
                contentClassName="pt-0"
            >
                <ModalHeader
                    className="mb-1"
                    toggle={handleModal}
                    close={CloseBtn}
                    tag="div"
                >
                    <h5 className="modal-title">{t('Гарын үсэг зурах хүмүүс бүртгэл')}</h5>
                </ModalHeader>
                <ModalBody className="flex-grow-1">
                    <Row tag={Form} onSubmit={handleSubmit(onSubmit)} >
                        <Col sm={12} className='mt-1'>
                            <Label className="form-label" for="last_name">
                                {t('Овог')}
                            </Label>
                            <Controller
                                defaultValue={defaultDatas?.last_name || ''}
                                control={control}
                                id="last_name"
                                name="last_name"
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        id="last_name"
                                        bsSize="sm"
                                        type="text"
                                        placeholder={t('овог оруулна уу')}
                                        invalid={errors.last_name && true}
                                    />
                                )}
                            />
                            {errors.last_name && <FormFeedback className='d-block'>{t(errors.last_name.message)}</FormFeedback>}
                        </Col>
                        <Col sm={12} className='mt-1'>
                            <Label className="form-label" for="first_name">
                                {t('Нэр')}
                            </Label>
                            <Controller
                                defaultValue={defaultDatas?.first_name || ''}
                                control={control}
                                id="first_name"
                                name="first_name"
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        id="first_name"
                                        bsSize="sm"
                                        type="text"
                                        placeholder={t('нэр оруулна уу')}
                                        invalid={errors.first_name && true}
                                    />
                                )}
                            />
                            {errors.first_name && <FormFeedback className='d-block'>{t(errors.first_name.message)}</FormFeedback>}
                        </Col>
                        <Col sm={12} className='mt-1'>
                            <Label className="form-label" for="position_name">
                                {t('Албан тушаалын нэр (эрдмийн зэрэг цол)')}
                            </Label>
                            <Controller
                                defaultValue={defaultDatas?.position_name || ''}
                                control={control}
                                id="position_name"
                                name="position_name"
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        id="position_name"
                                        bsSize="sm"
                                        type="text"
                                        placeholder={t('албан тушаал оруулна уу')}
                                        invalid={errors.position_name && true}
                                    />
                                )}
                            />
                            {errors.position_name && <FormFeedback className='d-block'>{t(errors.position_name.message)}</FormFeedback>}
                        </Col>
                        <Col md={12} className="text-center mt-2">
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
        </Fragment>
    )
}
