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
import { validateSchema } from '../validateSchema'

const UpdateModal = ({ open, handleEdit, editId, refreshDatas }) => {

    const CloseBtn = (
        <X className="cursor-pointer" size={15} onClick={handleEdit} />
    )

    const { isLoading, fetchData } = useLoader({})

    const { control, handleSubmit,reset, setValue, setError, formState: { errors } } = useForm(validate(validateSchema));

    // Api
    const seasonApi = useApi().settings.season

    async function getDatas() {
        if(editId) {
            const { success, data } = await fetchData(seasonApi.getOne(editId))
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
            const { success, error } = await fetchData(seasonApi.put(cdata, editId))
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
                onClosed={handleEdit}>

                {
                    isLoading && <div className='suspense-loader'><Spinner size='xl'/></div>
                }

                <ModalHeader
                    className="mb-1"
                    toggle={handleEdit}
                    close={CloseBtn}
                    tag="div"
                >
                    <h5 className="modal-title">{t('Хичээлийн улирал засах')}</h5>
                </ModalHeader>
                <ModalBody className="flex-grow-1">
                        <Row tag={Form} className="gy-1" onSubmit={handleSubmit(onSubmit)}>
                            <Col md={12}>
                                <Label className="form-label" for="season_code">
                                    {t('Улиралын код')}
                                </Label>
                                    <Controller
                                        defaultValue=''
                                        control={control}
                                        id="season_code"
                                        name="season_code"
                                        render={({ field }) => (
                                            <Input
                                                {...field}
                                                type='number'
                                                name='season_code'
                                                id='season_code'
                                                placeholder={t('Кодоо оруулна уу')}
                                                bsSize='sm'
                                                invalid={errors.season_code && true}
                                            />
                                        )}
                                    />
                            {errors.season_code && <FormFeedback className='d-block'>{t(errors.season_code.message)}</FormFeedback>}
                            </Col>
                            <Col md={12}>
                                <Label className="form-label" for="season_name">
                                    {t('Улиралын нэр')}
                                </Label>
                                    <Controller
                                        defaultValue=''
                                        control={control}
                                        id="season_name"
                                        name="season_name"
                                        render={({ field }) => (
                                            <Input
                                                {...field}
                                                type='text'
                                                name='season_name'
                                                id='season_name'
                                                placeholder={t('Нэрээ оруулна уу')}
                                                bsSize='sm'
                                                invalid={errors.season_name  && true}
                                            />
                                        )}
                                    />
                            {errors.season_name  && <FormFeedback className='d-block'>{t(errors.season_name .message)}</FormFeedback>}
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
