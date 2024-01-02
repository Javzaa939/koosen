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
import { X } from "react-feather";
import useApi from '@hooks/useApi';

import useLoader from '@hooks/useLoader';

import { convertDefaultValue, validate } from "@utils"

import { validateSchema } from '../Add/validateSchema'

const UpdateModal = ({ open, handleEdit, editId, refreshDatas }) => {

    const CloseBtn = (
        <X className="cursor-pointer" size={15} onClick={handleEdit} />
    )

    const { isLoading, fetchData } = useLoader({})

    const { control, handleSubmit,reset, setValue, setError, formState: { errors } } = useForm(validate(validateSchema));

    // Api
    const lessonGroupApi = useApi().settings.lessonGroup

    async function getDatas() {
        if(editId) {
            const { success, data } = await fetchData(lessonGroupApi.getOne(editId))
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
            const { success, errors } = await fetchData(lessonGroupApi.put(cdata, editId))
            if(success) {
                reset()
                refreshDatas()
                handleEdit()
            }
            else {
                /** Алдааны мессеж */
                    setError(errors.field, { type: 'custom', message: errors.msg});
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
                onClosed={handleEdit}>
                {isLoading && <div className='suspense-loader'><Spinner size='xl'/></div>}
                <ModalHeader
                    className="mb-1"с
                    toggle={handleEdit}
                    close={CloseBtn}
                    tag="div"
                >
                <h5 className="modal-title">{t('Хичээлийн бүлэг засах')}</h5>
                </ModalHeader>
                <ModalBody className="flex-grow-1">
                    <Row tag={Form} className="gy-1" onSubmit={handleSubmit(onSubmit)}>
                        <Col md={12}>
                            <Label className="form-label" for="group_code">
                                {t('Код')}
                            </Label>
                                <Controller
                                    defaultValue=''
                                    control={control}
                                    id="group_code"
                                    name="group_code"
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                            type='number'
                                            name='group_code'
                                            id='group_code'
                                            placeholder={t('Кодоо оруулна уу')}
                                            bsSize='sm'
                                            invalid={errors.group_code && true}
                                        />
                                    )}
                                />
                            {errors.group_code && <FormFeedback className='d-block'>{t(errors.group_code.message)}</FormFeedback>}
                        </Col>
                        <Col md={12}>
                            <Label className="form-label" for="group_name">
                                {t('Нэр')}
                            </Label>
                                <Controller
                                    defaultValue=''
                                    control={control}
                                    id="group_name"
                                    name="group_name"
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                            type='text'
                                            name='group_name'
                                            id='group_name'
                                            placeholder={t('Нэрээ оруулна уу')}
                                            bsSize='sm'
                                            invalid={errors.group_name  && true}
                                        />
                                    )}
                                />
                        {errors.group_name  && <FormFeedback className='d-block'>{t(errors.group_name .message)}</FormFeedback>}
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
