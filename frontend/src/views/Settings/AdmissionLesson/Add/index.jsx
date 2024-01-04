// ** React Import
import React, { useState, Fragment, useEffect } from 'react'

import { X } from "react-feather";

import { useTranslation } from 'react-i18next';

import useApi from "@hooks/useApi";
import useLoader from "@hooks/useLoader";

import { useForm, Controller } from "react-hook-form";

import { Row, Col, Form, Modal, Input, Label, Button, ModalBody, ModalHeader, FormFeedback, Spinner } from "reactstrap";

import {convertDefaultValue, validate } from "@utils"

import { validateSchema } from './validateSchema';

const Addmodal = ({ open, handleModal, refreshDatas, editId, handleEdit}) => {
    const CloseBtn = (
        < X className="cursor-pointer" size={15} onClick={handleModal}/>
    )
    // ** Hook
    const { control, handleSubmit, formState: { errors }, reset, setError, setValue} = useForm(validate(validateSchema));

    const { t } = useTranslation()

	// Loader
	const { isLoading: postLoading, fetchData: postFetch } = useLoader({});
    const { Loader, isLoading, fetchData } = useLoader({});

    // Api
    const AdmissionlessonApi = useApi().settings.admissionlesson

	async function onSubmit(cdata) {
        cdata = convertDefaultValue(cdata)
        if(editId) {
            const { success, errors } = await fetchData(AdmissionlessonApi.put(cdata, editId))
            if(success) {
                reset()
                refreshDatas()
                handleModal()
            }
            else {
                /** Алдааны мессеж */
                setError(errors.field, { type: 'custom', message: errors.msg});
            }
        }
        else{
            const { success, errors } = await postFetch(AdmissionlessonApi.post(cdata))
            if(success) {
                reset()
                refreshDatas()
                handleModal()
            } else {
                /** Алдааны мессэжийг input дээр харуулна */
                setError(errors.field, { type: 'custom', message:  errors.msg});
            }
        }
	}

    async function getDatas() {
        if(editId) {
            const { success, data } = await fetchData(AdmissionlessonApi.getOne(editId))
            if(success) {
                // засах үед дата байх юм бол setValue-р дамжуулан утгыг харуулна
                if(data === null) return
                for(let key in data) {
                    if(data[key] !== null)
                        setValue(key, data[key])
                    else setValue(key, '')
                }
            }
        }
    }

    useEffect(() => {
        getDatas()
    },[ editId])

	return (
        <Fragment>
                <Modal
                    toggle={ handleModal }
                    isOpen={ open }
                    className="sidebar-lg hr-register"
                    modalClassName="modal-slide-in "
                    contentClassName="pt-0"
                >

                <ModalHeader
                    className="mb-1"
                    toggle={ handleModal}
                    close={CloseBtn}
                    tag="div"
                >
                    <h5 className="modal-title">{ editId ?  t('ЭЕШ-ын хичээл засах'): t('ЭЕШ-ын хичээл нэмэх')}</h5>
                </ModalHeader>
                <ModalBody className="flex-grow-1">
                    <Row tag={Form} className="gy-1" onSubmit={handleSubmit(onSubmit)}>
                        <Col md={12}>
                            <Label className="form-label" for="lesson_code">
                                {t('ЭЕШ-ын хичээлийн код')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id="lesson_code"
                                name="lesson_code"
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        id="lesson_code"
                                        bsSize="sm"
                                        type="number"
                                        placeholder={t('ЭЕШ-ын хичээлийн код')}
                                        invalid={errors.lesson_code && true}
                                        onKeyDown={(e) =>["e", "E", "+", "-", "."].includes(e.key) && e.preventDefault()}
                                    />
                                )}
                            />
                            {errors.lesson_code && <FormFeedback className='d-block'>{t(errors.lesson_code.message)}</FormFeedback>}
                        </Col>
                        <Col md={12}>
                            <Label className="form-label" for="lesson_name">
                                {t('ЭЕШ-ын хичээлийн нэр')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id="lesson_name"
                                name="lesson_name"
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        id="lesson_name"
                                        bsSize="sm"
                                        placeholder={t('ЭЕШ-ын хичээлийн нэр')}
                                        type="text"
                                        invalid={errors.lesson_name && true}
                                    />
                                )}
                            />
                            {errors.lesson_name && <FormFeedback className='d-block'>{t(errors.lesson_name.message)}</FormFeedback>}
                        </Col>
                        <Col md={12} className="mt-2">
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
    );
};
export default Addmodal;
