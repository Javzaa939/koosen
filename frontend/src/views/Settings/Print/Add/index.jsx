// ** React imports
import React, { Fragment, useEffect, useState } from 'react'

import { X } from "react-feather";

import useApi from "@hooks/useApi";
import useLoader from "@hooks/useLoader";

import { useForm, Controller } from "react-hook-form";
import Select from 'react-select'
import classnames from "classnames";

import { Row, Col, Form, Modal, Input, Label, Button, ModalBody, ModalHeader, FormFeedback } from "reactstrap";

import { convertDefaultValue, validate, get_print_type, ReactSelectStyles} from "@utils"

import { t } from 'i18next';

const Addmodal = ({ open, handleModal, refreshDatas, editId }) => {

    const CloseBtn = (
        <X className="cursor-pointer" size={15} onClick={handleModal} />
    )
    const [print_type, setType]= useState(get_print_type)
    // ** Hook
    const { control, handleSubmit, formState: { errors }, reset, setError, setValue } = useForm();

	// Loader
	const { Loader, isLoading, fetchData } = useLoader({});

    // Api
    const printApi = useApi().settings.print

	async function onSubmit(cdata) {
        cdata = convertDefaultValue(cdata)
        if(editId) {
            const { success, errors } = await fetchData(printApi.put(cdata, editId))
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
            const { success, errors } = await fetchData(printApi.post(cdata))
            if(success) {
                reset()
                refreshDatas()
                handleModal()
            }
            else {
                /** Алдааны мессэжийг input дээр харуулна */
                setError(errors.field, { type: 'custom', message: errors.msg});
            }
        }
	}
    async function getDatas() {
        if(editId) {
            const { success, data } = await fetchData(printApi.getOne(editId))
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
                    toggle={handleModal}
                    close={CloseBtn}
                    tag="div"
                >
                    <h5 className="modal-title">{editId ? t('Хэвлэх хэмжээс засах') : t('Хэвлэх хэмжээс нэмэх')}</h5>
                </ModalHeader>
                <ModalBody className="flex-grow-1">
                    <Row tag={Form} className="gy-1" onSubmit={handleSubmit(onSubmit)}>
                        <Col md={12}>
                            <Label className="form-label" htmlFor="types">
                                {'Хэмжээсийн төрөл'}
                            </Label>
                            <Controller
                                control={control}
                                defaultValue=''
                                name="types"
                                render={({ field: { value, onChange} }) => {
                                return (
                                    <Select
                                        name="types"
                                        id="types"
                                        classNamePrefix='select'
                                        isClearable
                                        className={classnames('react-select')}
                                        options={print_type}
                                        value={print_type.find((c) => c.id === value ) }
                                        placeholder={'-- Сонгоно уу --'}
                                        noOptionsMessage={() => 'Хоосон байна.'}
                                        onChange={(val) => {
                                            onChange(val?.id)
                                        }}
                                    styles={ReactSelectStyles}
                                    getOptionValue={(option) => option.id}
                                    getOptionLabel={(option) => option.name}
                            />
                                )
                            }}
                        ></Controller>
                        </Col>
                        <Col md={12}>
                            <Label className="form-label" for="deed">
                                {t('Дээд талаас')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id="deed"
                                name="deed"
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        id="deed"
                                        bsSize="sm"
                                        type="number"
                                        placeholder={t('хэмжээc оруулна уу')}
                                        invalid={errors.deed && true}
                                    />
                                )}
                            />
                            {errors.deed && <FormFeedback className='d-block'>{t(errors.deed.message)}</FormFeedback>}
                        </Col>
                        <Col md={12}>
                            <Label className="form-label" for="dood">
                                {t('Доод талаас')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id="dood"
                                name="dood"
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        id="dood"
                                        bsSize="sm"
                                        placeholder={t('хэмжээс оруулна уу')}
                                        type="number"
                                        invalid={errors.dood && true}
                                    />
                                )}
                            />
                            {errors.dood && <FormFeedback className='d-block'>{t(errors.dood.message)}</FormFeedback>}
                        </Col>
                        <Col md={12}>
                            <Label className="form-label" for="right">
                                {t('Баруун талаас')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id="right"
                                name="right"
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        id="right"
                                        bsSize="sm"
                                        placeholder={t('хэмжээc оруулна уу')}
                                        type="number"
                                        invalid={errors.right && true}
                                    />
                                )}
                            />
                            {errors.right && <FormFeedback className='d-block'>{t(errors.right.message)}</FormFeedback>}
                        </Col>
                        <Col md={12}>
                            <Label className="form-label" for="left">
                                {t('Зүүн талаас')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id="left"
                                name="left"
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        id="left"
                                        bsSize="sm"
                                        placeholder={t('хэмжээс оруулна уу')}
                                        type="number"
                                        invalid={errors.left && true}
                                    />
                                )}
                            />
                            {errors.left && <FormFeedback className='d-block'>{t(errors.left.message)}</FormFeedback>}
                        </Col>
                        <Col md={12} className=" text-center mt-2">
                            <Button className="me-2" color="primary" type="submit">
                                {t('Хадгалах')}
                            </Button>
                            {
                                editId
                                ?
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
