// ** React imports
import React, { Fragment, useEffect } from 'react'

import { X } from "react-feather";

import { t } from 'i18next';

import useApi from "@hooks/useApi";
import useLoader from "@hooks/useLoader";

import { useForm, Controller } from "react-hook-form";

import { Row, Col, Form, Modal, Input, Label, Button, ModalBody, ModalHeader, FormFeedback, Spinner } from "reactstrap";

import { validate, convertDefaultValue } from "@utils"

import { validateSchema } from './validateSchema';

const Addmodal = ({ open, handleModal, refreshDatas, editId }) => {

    const CloseBtn = (
        <X className="cursor-pointer" size={15} onClick={handleModal} />
    )

    // ** Hook
    const { control, handleSubmit, formState: { errors }, reset, setError, setValue} = useForm(validate(validateSchema));

	// Loader
	const { Loader, isLoading, fetchData } = useLoader({});
	const { isLoading: postLoading, fetchData: postFetch } = useLoader({});

    // Api
    const professionaldegreeApi = useApi().settings.professionaldegree

	async function onSubmit(cdata) {
        if (editId){
            cdata = convertDefaultValue(cdata)
            const { success, errors } = await fetchData(professionaldegreeApi.put(cdata, editId))
            if(success) {
                refreshDatas()
                handleModal()
            }
            else {
                /** Алдааны мессэжийг input дээр харуулна */
                setError(errors.field, { type: 'custom', message:  errors.msg});
            }
        }
        else{
            cdata = convertDefaultValue(cdata, ['degree_name_eng'])
            const { success, errors } = await postFetch(professionaldegreeApi.post(cdata))
            if(success) {
                reset()
                handleModal()
                refreshDatas()
            }
            else {
                /** Алдааны мессэжийг input дээр харуулна */
                    setError(errors.field, { type: 'custom', message:  errors.msg});
            }
        }
	}

     async function getDatas() {
        if(editId) {
            const { success, data } = await fetchData(professionaldegreeApi.getOne(editId))
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
                    <h5 className="modal-title">{ editId ?  t('Боловсролын зэрэг засах'): t('Боловсролын зэрэг нэмэх')}</h5>
                </ModalHeader>
                <ModalBody className="flex-grow-1">
                    <Row tag={Form} className="gy-1" onSubmit={handleSubmit(onSubmit)}>
                        <Col md={12}>
                            <Label className="form-label" for="degree_code">
                                {t('Код')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id="degree_code"
                                name="degree_code"
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        id="degree_code"
                                        bsSize="sm"
                                        type="text"
                                        placeholder={t('Код')}
                                        invalid={errors.degree_code && true}
                                    />
                                )}
                            />
                            {errors.degree_code && <FormFeedback className='d-block'>{t(errors.degree_code.message)}</FormFeedback>}
                        </Col>
                        <Col md={12}>
                            <Label className="form-label" for="degree_name">
                                {t('Зэргийн нэр')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id="degree_name"
                                name="degree_name"
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        id="degree_name"
                                        bsSize="sm"
                                        placeholder={t('Зэргийн нэр')}
                                        type="text"
                                        invalid={errors.degree_name && true}
                                    />
                                )}
                            />
                            {errors.degree_name && <FormFeedback className='d-block'>{t(errors.degree_name.message)}</FormFeedback>}
                        </Col>
                        <Col md={12}>
                            <Label className="form-label" for="degree_eng_name">
                                {t('Зэргийн нэр англи')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id="degree_eng_name"
                                name="degree_eng_name"
                                render={({ field }) => {
                                    return(
                                        <Input
                                            id="degree_eng_name"
                                            bsSize="sm"
                                            placeholder={t('Зэргийн нэр англи')}
                                            {...field}
                                            type="text"
                                            invalid={errors.degree_eng_name && true}
                                        />
                                    )
                                }}
                            />
                            {errors.degree_eng_name && <FormFeedback className='d-block'>{t(errors.degree_eng_name.message)}</FormFeedback>}
                        </Col>
                        <Col md={12} className=" text-center mt-2">
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
