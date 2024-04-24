import React, { Fragment, useEffect, useState } from 'react'

import { useForm, Controller } from "react-hook-form";

import { t } from 'i18next';
import { X } from "react-feather";
import { Row, Col, Form, Modal, Input, Label, Button, ModalBody, ModalHeader, FormFeedback } from "reactstrap";

import useApi from "@hooks/useApi";
import useLoader from "@hooks/useLoader";

import { validate } from "@utils"

import { validateSchema } from './validateSchema';

import Select from 'react-select'
import classnames from "classnames";
import { ReactSelectStyles } from '@src/utility/Utils';


export default function SignatureModal({ open, handleModal, refreshDatas, defaultDatas })
{
    const CloseBtn = (
        <X className="cursor-pointer" size={15} onClick={handleModal} />
    )

    // Hook
    const { control, handleSubmit, reset, setError, formState: { errors }} = useForm(validate(validateSchema));
    const [ schools, setSchools ] = useState([]);

    // Loader
	const { Loader, isLoading, fetchData } = useLoader({ isFullScreen: false });

    // Api
    const signatureApi = useApi().signature
    const schoolApi = useApi().hrms.subschool

    /** Хадгалах дарах */
    async function onSubmit(cdata)
    {
        cdata['dedication_type'] = 2

        const { success, errors } = await fetchData(Object.keys(defaultDatas).length != 0 ? signatureApi.put(cdata, defaultDatas?.id) : signatureApi.post(cdata))
        if (success) {
            reset()
            handleModal()
            refreshDatas()
        }
        else if (errors && Object.keys(errors)?.length > 0)
        {
            /** Алдааны мессэжийг input дээр харуулна */
            for (let key in errors) {
                setError(key, { type: 'custom', message:  errors[key][0]});
            }
        }
    }

    /* Үндсэн сургуулуудийн жагсаалт авах */
    async function getDatas() {
        const {success, data} = await fetchData(schoolApi.get())
        if(success) {
            setSchools(data)
        }
    }

    useEffect(
        () =>
        {
            getDatas()
        },
        []
    )

    return (
        <Fragment>
            { isLoading && Loader }
            <Modal
                isOpen={open}
                toggle={handleModal}
                className="sidebar-lg hr-register"
                modalClassName="modal-slide-in "
                contentClassName="pt-0"
                style={{ maxWidth: '420px', width: '100%' }}
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
                                {t('Овог (монгол)')}
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
                                {t('Нэр (монгол)')}
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
                            <Label className="form-label" for="schools">
                                {t('Салбар сургууль')}
                            </Label>
                            <Controller
                                control={control}
                                defaultValue={defaultDatas?.school_id || ''}
                                name="school_id"
                                render={({ field: { value, onChange } }) => {
                                    return (
                                        <Select
                                            name="school_id"
                                            id="school_id"
                                            classNamePrefix='select'
                                            isClearable
                                            className={classnames('react-select', { 'is-invalid': errors.school_id })}
                                            isLoading={isLoading}
                                            placeholder={t('-- Сонгоно уу --')}
                                            options={schools || []}
                                            value={schools.find((c) => c.id === value)}
                                            noOptionsMessage={() => t('Хоосон байна.')}
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
                            {errors.school_id && <FormFeedback className='d-block'>{t(errors.school_id.message)}</FormFeedback>}
                        </Col>
                        <Col sm={12} className='mt-1'>
                            <Label className="form-label" for="position_name">
                                {t('Албан тушаалын нэр "эрдмийн зэрэг цол" (монгол)')}
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

                        <Col sm={12} className='mt-1'>
                            <Label className="form-label" for="last_name_eng">
                                {t('Овог (англи)')}
                            </Label>
                            <Controller
                                defaultValue={defaultDatas?.last_name_eng || ''}
                                control={control}
                                id="last_name_eng"
                                name="last_name_eng"
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        id="last_name_eng"
                                        bsSize="sm"
                                        type="text"
                                        placeholder={t('овог оруулна уу')}
                                        invalid={errors.last_name_eng && true}
                                    />
                                )}
                            />
                            {errors.last_name_eng && <FormFeedback className='d-block'>{t(errors.last_name_eng.message)}</FormFeedback>}
                        </Col>
                        <Col sm={12} className='mt-1'>
                            <Label className="form-label" for="first_name_eng">
                                {t('Нэр (англи)')}
                            </Label>
                            <Controller
                                defaultValue={defaultDatas?.first_name_eng || ''}
                                control={control}
                                id="first_name_eng"
                                name="first_name_eng"
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        id="first_name_eng"
                                        bsSize="sm"
                                        type="text"
                                        placeholder={t('нэр оруулна уу')}
                                        invalid={errors.first_name_eng && true}
                                    />
                                )}
                            />
                            {errors.first_name_eng && <FormFeedback className='d-block'>{t(errors.first_name_eng.message)}</FormFeedback>}
                        </Col>
                        <Col sm={12} className='mt-1'>
                            <Label className="form-label" for="position_name_eng">
                                {t('Албан тушаалын нэр "эрдмийн зэрэг цол" (англи)')}
                            </Label>
                            <Controller
                                defaultValue={defaultDatas?.position_name_eng || ''}
                                control={control}
                                id="position_name_eng"
                                name="position_name_eng"
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        id="position_name_eng"
                                        bsSize="sm"
                                        type="text"
                                        placeholder={t('албан тушаал оруулна уу')}
                                        invalid={errors.position_name_eng && true}
                                    />
                                )}
                            />
                            {errors.position_name_eng && <FormFeedback className='d-block'>{t(errors.position_name_eng.message)}</FormFeedback>}
                        </Col>

                        <Col sm={12} className='mt-1'>
                            <Label className="form-label" for="last_name_uig">
                                {t('Овог (уйгаржин)')}
                            </Label>
                            <Controller
                                defaultValue={defaultDatas?.last_name_uig || ''}
                                control={control}
                                id="last_name_uig"
                                name="last_name_uig"
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        id="last_name_uig"
                                        bsSize="sm"
                                        type="text"
                                        placeholder={t('овог оруулна уу')}
                                        style={{ fontFamily: 'CMSHRDP' }}
                                        invalid={errors.last_name_uig && true}
                                    />
                                )}
                            />
                            {errors.last_name_uig && <FormFeedback className='d-block'>{t(errors.last_name_uig.message)}</FormFeedback>}
                        </Col>
                        <Col sm={12} className='mt-1'>
                            <Label className="form-label" for="first_name_uig">
                                {t('Нэр (уйгаржин)')}
                            </Label>
                            <Controller
                                defaultValue={defaultDatas?.first_name_uig || ''}
                                control={control}
                                id="first_name_uig"
                                name="first_name_uig"
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        id="first_name_uig"
                                        bsSize="sm"
                                        type="text"
                                        placeholder={t('нэр оруулна уу')}
                                        style={{ fontFamily: 'CMSHRDP' }}
                                        invalid={errors.first_name_uig && true}
                                    />
                                )}
                            />
                            {errors.first_name_uig && <FormFeedback className='d-block'>{t(errors.first_name_uig.message)}</FormFeedback>}
                        </Col>
                        <Col sm={12} className='mt-1'>
                            <Label className="form-label" for="position_name_uig">
                                {t('Албан тушаалын нэр "эрдмийн зэрэг цол" (уйгаржин)')}
                            </Label>
                            <Controller
                                defaultValue={defaultDatas?.position_name_uig || ''}
                                control={control}
                                id="position_name_uig"
                                name="position_name_uig"
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        id="position_name_uig"
                                        bsSize="sm"
                                        type="text"
                                        placeholder={t('албан тушаал оруулна уу')}
                                        style={{ fontFamily: 'CMSHRDP' }}
                                        invalid={errors.position_name_uig && true}
                                    />
                                )}
                            />
                            {errors.position_name_uig && <FormFeedback className='d-block'>{t(errors.position_name_uig.message)}</FormFeedback>}
                        </Col>

                        <Col md={12} className="text-center mt-2">
                            <Button className="me-2" color="primary" type="submit">
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
