// ** React imports
import React, { Fragment, useEffect } from 'react'

import { X } from "react-feather";

import { useTranslation } from 'react-i18next';

import useApi from "@hooks/useApi";
import useLoader from "@hooks/useLoader";

import { useForm, Controller } from "react-hook-form";

import { Row, Col, Form, Modal, Input, Label, Button, ModalBody, ModalHeader, FormFeedback, Spinner } from "reactstrap";

import {convertDefaultValue, validate } from "@utils"

import { validateSchema } from './validateSchema';

const Addmodal = ({ open, handleModal, refreshDatas ,editId}) => {

    const { t } = useTranslation()

    // ** Hook
    const { control, handleSubmit, reset, setError, formState: { errors }, setValue } = useForm(validate(validateSchema));

	// Loader
	const { Loader, isLoading, fetchData } = useLoader({});
	const { isLoading: postLoading, fetchData: postFetch } = useLoader({});

	// Api
	const gradeletterApi = useApi().settings.gradeletter

	async function onSubmit(cdata) {
        cdata = convertDefaultValue(cdata)
        if(editId) {
            const { success, errors } = await fetchData(gradeletterApi.put(cdata, editId))
            if(success) {
                reset()
                refreshDatas()
                handleModal()
            }
            else {
                /** Алдааны мессеж */
                for (let key in errors) {
                    setError(errors[key].field, { type: 'custom', message: errors[key].msg});
                }
            }
        }
        else{
            const { success, error } = await postFetch(gradeletterApi.post(cdata))
            if(success) {
                reset()
                handleModal()
                refreshDatas()
            } else {
                /** Алдааны мессэжийг input дээр харуулна */
                for (let key in error['error']) {
                    setError(key, { type: 'custom', message:  error['msg']});
                }
            }
        }
	}
    async function getDatas() {
        if(editId) {
            const { success, data } = await fetchData(gradeletterApi.getOne(editId))
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
    },[editId])

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
                    tag="div"
                >
                    <h5 className="modal-title">{ editId ? t('Үсгэн үнэлгээ засах') : t('Үсгэн үнэлгээ нэмэх')}</h5>
                </ModalHeader>
                <ModalBody className="flex-grow-1">
                    <Row tag={Form} className="gy-1" onSubmit={handleSubmit(onSubmit)}>
                        <Col md={12}>
                            <Label className="form-label" for="letter">
                                {t('Үсгэн тэмдэглэгээ')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id="letter"
                                name="letter"
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        id="letter"
                                        bsSize="sm"
                                        type="text"
                                        placeholder={t('Үсгэн тэмдэглэгээ')}
                                        invalid={errors.letter && true}
                                    />
                                )}
                            />
                            {errors.letter && <FormFeedback className='d-block'>{t(errors.letter.message)}</FormFeedback>}
                        </Col>
                        <Col md={12}>
                            <Label className="form-label" for="description">
                                {t('Тайлбар')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id="description"
                                name="description"
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        id="description"
                                        bsSize="sm"
                                        placeholder={t('Тайлбар')}
                                        type="text"
                                        invalid={errors.description && true}
                                    />
                                )}
                            />
                            {errors.description && <FormFeedback className='d-block'>{t(errors.description.message)}</FormFeedback>}
                        </Col>
                        <Col md={12} className="text-center mt-2">
                            <Button className="me-2" color="primary" type="submit" disabled={postLoading}>
                                {postLoading &&<Spinner size='sm' className='me-1'/>}
                                {t('Хадгалах')}
                            </Button>
                            {
                                editId ?
                                    null
                                :
                                <Button color="secondary" type="reset" outline  onClick={handleModal}>
                                    {t('Буцах')}
                                </Button>
                            }
                        </Col>
                    </Row>
                </ModalBody>
            </Modal>
        </Fragment>
	);
};
export default Addmodal;
