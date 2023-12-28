import React, { Fragment, useState, useEffect} from 'react'

import { useForm, Controller } from "react-hook-form";

import {
    Row,
    Col,
	Form,
	Modal,
	Input,
	Label,
	Button,
	ModalBody,
	ModalHeader,
    FormFeedback,
    Spinner
} from "reactstrap";

import { t } from 'i18next';

import useApi from '@hooks/useApi';

import useLoader from '@hooks/useLoader';
import { X } from "react-feather";

import { convertDefaultValue, validate } from "@utils"

import { validateSchema } from '../validateSchema'

const UpdateModal = ({ open, handleEdit, editId, refreshDatas }) => {
    const CloseBtn = (
        <X className="cursor-pointer" size={15} onClick={handleEdit} />
    )

    const { isLoading, fetchData } = useLoader({})

    const { control, handleSubmit,reset, setValue, setError, formState: { errors } } = useForm(validate(validateSchema));

    // Api
    const learningApi = useApi().settings.learning

    async function getDatas() {
        if(editId) {
            const { success, data } = await fetchData(learningApi.getOne(editId))
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
    },[open])

    async function onSubmit(cdata) {
        cdata = convertDefaultValue(cdata)
        if(editId) {
            const { success, error } = await fetchData(learningApi.put(cdata, editId))
            if(success) {
                reset()
                refreshDatas()
                handleEdit()
            }
            else {
                /** Алдааны мессеж */
                for (let key in error) {
                    setError(error[key].field, { type: 'custom', message: error[key].msg});
                }
            }
        }
    }

	return (
        <Fragment>
            <Modal
                isOpen={open}
                toggle={handleEdit}
                className="sidebar-lg hr-register"
                modalClassName="modal-slide-in "
                contentClassName="pt-0"
                onClosed={handleEdit}
            >
            {isLoading && <div className='suspense-loader'><Spinner size='xl'/></div>}
                <ModalHeader
                    className="mb-1"
                    toggle={handleEdit}
                    close={CloseBtn}
                    tag="div"
                >

                    <h5 className="modal-title" >{t('Суралцах хэлбэр засах')}</h5>
                </ModalHeader>
                <ModalBody className="flex-grow-1">
                        <Row tag={Form} className="gy-1" onSubmit={handleSubmit(onSubmit)}>
                            <Col md={12}>
                                <Label className="form-label" for="learn_code">
                                    {t('Код')}
                                </Label>
                                    <Controller
                                        defaultValue=''
                                        control={control}
                                        id="learn_code"
                                        name="learn_code"
                                        render={({ field }) => (
                                            <Input
                                                {...field}
                                                type='number'
                                                name='learn_code'
                                                id='learn_code'
                                                placeholder={t('Кодоо оруулна уу')}
                                                bsSize='sm'
                                                invalid={errors.learn_code && true}
                                            />
                                        )}
                                    />
                            {errors.learn_code && <FormFeedback className='d-block'>{t(errors.learn_code.message)}</FormFeedback>}
                            </Col>
                            <Col md={12}>
                                <Label className="form-label" for="learn_name">
                                    {t('Нэр')}
                                </Label>
                                    <Controller
                                        defaultValue=''
                                        control={control}
                                        id="learn_name"
                                        name="learn_name"
                                        render={({ field }) => (
                                            <Input
                                                {...field}
                                                type='text'
                                                name='learn_name'
                                                id='learn_name'
                                                placeholder={t('Нэрээ оруулна уу')}
                                                bsSize='sm'
                                                invalid={errors.learn_name  && true}
                                            />
                                        )}
                                    />
                            {errors.learn_name  && <FormFeedback className='d-block'>{t(errors.learn_name .message)}</FormFeedback>}
                            </Col>
                            <Col md={12} className="text-center mt-2">
                                <Button className="me-2" color="primary" type="submit">
                                    {t('Хадгалах')}
                                </Button>
                                <Button color="secondary" type="reset" outline onClick={handleEdit}>
                                    {t('Буцах')}
                                </Button>
                            </Col>
                        </Row>
                </ModalBody>
            </Modal>
        </Fragment>
	);
};
export default UpdateModal;
