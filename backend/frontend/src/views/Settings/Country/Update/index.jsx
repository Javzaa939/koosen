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
} from "reactstrap";

import { t } from 'i18next';

import useApi from '@hooks/useApi';

import useLoader from '@hooks/useLoader';

import { convertDefaultValue, validate } from "@utils"

import { validateSchema } from '../Add/validateSchema'

const UpdateModal = ({ open, handleEdit, editId, refreshDatas }) => {

    const { fetchData } = useLoader({})

    const { control, handleSubmit,reset, setValue, setError, formState: { errors } } = useForm(validate(validateSchema));

    // Api
    const countryApi = useApi().settings.country

    async function getDatas() {
        if(editId) {
            const { success, data } = await fetchData(countryApi.getOne(editId))
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
            const { success, error } = await fetchData(countryApi.put(cdata, editId))
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
            <Modal isOpen={open} toggle={handleEdit} className="modal-dialog-centered modal-sm" onClosed={handleEdit}>
                <ModalHeader className='bg-transparent pb-0' toggle={handleEdit} ></ModalHeader>
                <ModalBody className="px-sm-3 pt-30 pb-3">
                    <div className='text-center'>
                        <h4>{t('Улсын мэдээлэл засах')}</h4>
                    </div>
                        <Row tag={Form} className="gy-1" onSubmit={handleSubmit(onSubmit)}>
                            <Col md={12}>
                                <Label className="form-label" for="code">
                                    {t('Код')}
                                </Label>
                                    <Controller
                                        defaultValue=''
                                        control={control}
                                        id="code"
                                        name="code"
                                        render={({ field }) => (
                                            <Input
                                                {...field}
                                                type='number'
                                                name='code'
                                                id='code'
                                                placeholder={t('кодоо оруулна уу')}
                                                bsSize='sm'
                                                invalid={errors.code && true}
                                            />
                                        )}
                                    />
                            {errors.code && <FormFeedback className='d-block'>{t(errors.code.message)}</FormFeedback>}
                            </Col>
                            <Col md={12}>
                                <Label className="form-label" for="name">
                                    {t('Нэр')}
                                </Label>
                                    <Controller
                                        defaultValue=''
                                        control={control}
                                        id="name"
                                        name="name"
                                        render={({ field }) => (
                                            <Input
                                                {...field}
                                                type='text'
                                                name='name'
                                                id='name'
                                                placeholder={t('нэрээ оруулна уу')}
                                                bsSize='sm'
                                                invalid={errors.name  && true}
                                            />
                                        )}
                                    />
                            {errors.name  && <FormFeedback className='d-block'>{t(errors.name .message)}</FormFeedback>}
                            </Col>
                            <Col md={12}>
                            <Label className="form-label" for="name_eng">
                                {t('англи нэр')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id="name_eng"
                                name="name_eng"
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        id="name_eng"
                                        bsSize="sm"
                                        placeholder={t('англи нэрээ оруулна уу')}
                                        type="text"
                                        invalid={errors.name_eng && true}
                                    />
                                )}
                            />
                            {errors.name_eng && <FormFeedback className='d-block'>{t(errors.name_eng.message)}</FormFeedback>}
                        </Col>
                        <Col md={12}>
                            <Label className="form-label" for="name_uig">
                                {t('уйгаржин нэр')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id="name_uig"
                                name="name_uig"
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        id="name_uig"
                                        bsSize="sm"
                                        placeholder={t('уйгаржин нэрээ оруулна уу')}
                                        type="text"
                                        style={{fontFamily: 'CMs Urga', fontSize:'15px'}}
                                        invalid={errors.name_uig && true}
                                    />
                                )}
                            />
                            {errors.name_uig && <FormFeedback className='d-block'>{t(errors.name_uig.message)}</FormFeedback>}
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
