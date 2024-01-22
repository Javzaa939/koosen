// ** React imports
import React, { Fragment, useEffect } from 'react'

import { X } from "react-feather";

import useApi from "@hooks/useApi";
import useLoader from "@hooks/useLoader";

import { useForm, Controller } from "react-hook-form";

import { Row, Col, Form, Modal, Input, Label, Button, ModalBody, ModalHeader, FormFeedback } from "reactstrap";

import { convertDefaultValue, validate } from "@utils"

import { validateSchema } from './validateSchema';
import { t } from 'i18next';

const Addmodal = ({ open, handleModal, refreshDatas, editId }) => {

    const CloseBtn = (
        <X className="cursor-pointer" size={15} onClick={handleModal} />
    )

    // ** Hook
    const { control, handleSubmit, formState: { errors }, reset, setError, setValue } = useForm(validate(validateSchema));

	// Loader
	const { Loader, isLoading, fetchData } = useLoader({});

    // Api
    const countryApi = useApi().settings.country

	async function onSubmit(cdata) {
        cdata = convertDefaultValue(cdata)
        if(editId) {
            const { success, errors } = await fetchData(countryApi.put(cdata, editId))
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
            const { success, errors } = await fetchData(countryApi.post(cdata))
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
                    <h5 className="modal-title">{editId ? t('Улс засах') : t('Улс нэмэх')}</h5>
                </ModalHeader>
                <ModalBody className="flex-grow-1">
                    <Row tag={Form} className="gy-1" onSubmit={handleSubmit(onSubmit)}>
                        <Col md={12}>
                            <Label className="form-label" for="code">
                                {t('Улсын код')}
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
                                        type="number"
                                        placeholder={t('улсын код')}
                                        invalid={errors.code && true}
                                        onKeyDown={(e) =>["e", "E", "+", "-", "."].includes(e.key) && e.preventDefault()}
                                    />
                                )}
                            />
                            {errors.code && <FormFeedback className='d-block'>{t(errors.code.message)}</FormFeedback>}
                        </Col>
                        <Col md={12}>
                            <Label className="form-label" for="name">
                                {t('Улсын нэр')}
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
                                        placeholder={t('улсын нэр')}
                                        type="text"
                                        invalid={errors.name && true}
                                    />
                                )}
                            />
                            {errors.name && <FormFeedback className='d-block'>{t(errors.name.message)}</FormFeedback>}
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
                                        placeholder={t('англи нэр')}
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
                                        placeholder={t('уйгаржин нэр')}
                                        type="text"
                                        style={{fontFamily: 'cmdashitseden', fontSize:'15px'}}
                                        invalid={errors.name_uig && true}
                                    />
                                )}
                            />
                            {errors.name_uig && <FormFeedback className='d-block'>{t(errors.name_uig.message)}</FormFeedback>}
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
