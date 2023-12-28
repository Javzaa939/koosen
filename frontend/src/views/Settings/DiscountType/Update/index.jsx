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
import { X } from "react-feather";
import useApi from '@hooks/useApi';
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
    const discountTypeApi = useApi().settings.discountType

    async function getDatas() {
        if(editId) {
            const { success, data } = await fetchData(discountTypeApi.getOne(editId))
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
            const { success, error } = await fetchData(discountTypeApi.put(cdata, editId))
            if(success) {
                refreshDatas()
                handleEdit()
            }
            else {
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
             <h5 className="modal-title">{t('Хөнгөлөлтийн төрөл засах')}</h5>
            </ModalHeader>
                <ModalBody className="flex-grow-1">
                    <Row tag={Form} className="gy-1" onSubmit={handleSubmit(onSubmit)}>
                        <Col md={12}>
                        <Label className="form-label" for="code">
                            {t('Тэтгэлэгийн төрлийн код')}
                        </Label>
                        <Controller
                            defaultValue=''
                            control={control}
                            id="code"
                            name="code"
                            render={({ field }) => (
                                <Input
                                    {...field}
                                    id="code"
                                    bsSize="sm"
                                    type="text"
                                    placeholder={t('Тэтгэлэгийн төрлийн код')}
                                    invalid={errors.code && true}
                                />
                            )}
                        />
                            {errors.code && <FormFeedback className='d-block'>{t(errors.code.message)}</FormFeedback>}
                        </Col>
                        <Col md={12}>
                            <Label className="form-label" for="name">
                                {t('Тэтгэлэгийн төрлийн нэр')}
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
                                        placeholder={t('Тэтгэлэгийн төрлийн нэр')}
                                        type="text"
                                        invalid={errors.name && true}
                                    />
                                )}
                            />
                            {errors.name && <FormFeedback className='d-block'>{t(errors.name.message)}</FormFeedback>}
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
