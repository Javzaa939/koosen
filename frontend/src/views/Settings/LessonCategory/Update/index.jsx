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
import Select from 'react-select'
import classnames from 'classnames';
import useApi from '@hooks/useApi';
import { X } from "react-feather";
import useLoader from '@hooks/useLoader';
import { convertDefaultValue, validate} from "@utils"
import { validateSchema } from './validateSchema.jsx';

const UpdateModal = ({ open, handleEdit, editId, refreshDatas }) => {

    const CloseBtn = (
        <X className="cursor-pointer" size={15} onClick={handleEdit} />
    )

    const { isLoading, fetchData } = useLoader({})

    const { control, handleSubmit,reset, setValue, setError, formState: { errors } } = useForm(validate(validateSchema));

    // Api
    const lessonCategoryApi = useApi().settings.lessonCategory

    async function getDatas() {
        if(editId) {
            const { success, data } = await fetchData(lessonCategoryApi.getOne(editId))
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
            const { success, errors } = await fetchData(lessonCategoryApi.put(cdata, editId))
            if(success) {
                refreshDatas()
                handleEdit()
            }
            else {
                /** Алдааны мессэжийг input дээр харуулна */
                setError(errors.field, { type: 'custom', message:  errors.msg});
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

                <h5 className="modal-title">{t('Хичээлийн ангилал засах')}</h5>
                </ModalHeader>
                <ModalBody className="flex-grow-1">
                        <Row tag={Form} className="gy-1" onSubmit={handleSubmit(onSubmit)}>
                            <Col md={12}>
                            <Label className="form-label" for="category_code">
                                {t('Код')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id="category_code"
                                name="category_code"
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        id="category_code"
                                        bsSize="sm"
                                        type="text"
                                        placeholder={t('Код')}
                                        invalid={errors.category_code && true}
                                    />
                                )}
                            />
                            {errors.category_code && <FormFeedback className='d-block'>{t(errors.category_code.message)}</FormFeedback>}
                        </Col>
                        <Col md={12}>
                            <Label className="form-label" for="category_name">
                                {t('Хичээлийн ангиллын нэр')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id="category_name"
                                name="category_name"
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        id="category_name"
                                        bsSize="sm"
                                        placeholder={t('Хичээлийн ангиллын нэр')}
                                        type="text"
                                        invalid={errors.category_name && true}
                                    />
                                )}
                            />
                            {errors.category_name && <FormFeedback className='d-block'>{t(errors.category_name.message)}</FormFeedback>}
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
