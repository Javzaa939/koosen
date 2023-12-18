// ** React imports
import React, { Fragment, useState, useEffect } from 'react'

import useApi from "@hooks/useApi";
import useLoader from "@hooks/useLoader";

import Select from 'react-select'

import { useTranslation } from 'react-i18next';

import { useForm, Controller } from "react-hook-form";

import classnames from 'classnames'

import { Row, Col, Form, Modal, Input, Label, Button, ModalBody, ModalHeader, FormFeedback } from "reactstrap";

import { validate, ReactSelectStyles, convertDefaultValue } from "@utils"

import { validateSchema } from './validateSchema';

const cModal = ({ request_id, isOpen, handleModal, refreshDatas, is_view }) => {

    const solved_type = [
        { id: 3, name: 'БУЦААСАН' },
        { id: 4, name: 'ЗӨВШӨӨРСӨН' },
        { id: 5, name: 'ТАТГАЛЗСАН' },
    ]

    const { t } = useTranslation()

    // ** Hook
    const { control, handleSubmit, formState: { errors }, reset, setError, setValue } = useForm(validate(validateSchema));

	// Loader
	const { Loader, isLoading, fetchData } = useLoader({});

    // Api
    const dormitoryReqApi = useApi().dormitory.request.rent

    async function getDatas() {
        if(request_id) {
            const { success, data } = await fetchData(dormitoryReqApi.getOne(request_id))
                if(success) {
                // засах үед дата байх юм бол setValue-р дамжуулан утгыг харуулна
                    if(data === null) return
                    for(let key in data) {
                        if(data[key] !== null)
                            setValue(key, data[key])
                        else setValue(key, '')

                        if(key === 'teacher') {
                            setValue('user', data[key]?.full_name)
                            setValue(key, data[key]?.id)
                        }
                        if(!is_view) {
                            if(key === 'solved_flag') setValue(key, '')
                        }
                }
            }
        }
    }

    useEffect(() => {
        getDatas()
    },[request_id, isOpen])

	async function onSubmit(cdata) {
        cdata = convertDefaultValue(cdata)
        const { success, error } = await fetchData(dormitoryReqApi.put(cdata, request_id))
        if(success) {
            reset()
            refreshDatas()
            handleModal()
        } else {
            /** Алдааны мессэжийг input дээр харуулна */
            for (let key in error) {
                setError(error[key].field, { type: 'custom', message:  error[key].msg});
            }
        }
	}

	return (
        <Fragment>
            <Modal
                isOpen={isOpen}
                toggle={handleModal}
                className="modal-dialog-centered modal-lg"
                contentClassName="pt-0"
            >
                {isLoading && Loader}
                <ModalHeader className='bg-transparent pb-0' toggle={handleModal}></ModalHeader>
                <ModalBody className="px-sm-3 pt-50 pb-3">
                    <div className='text-center'>
                        {
                            is_view
                            ?
                                <h4>{t('Дэлгэрэнгүй мэдээлэл')}</h4>
                            :
                                <h4>{t('Хүсэлт шийдвэрлэх')}</h4>
                        }
                    </div>
                    <Row tag={Form} className="gy-1" onSubmit={handleSubmit(onSubmit)}>
                        <Col md={12}>
                            <div className='added-cards'>
                                <div className={classnames('cardMaster rounded border p-1')}>
                                    <Label className="form-label fs-6">
                                        {t('Түрээслэгчийн мэдээлэл')}
                                    </Label>

                                    <div>
                                        <hr />
                                    </div>
                                    <Row className="gy-1">
                                        <Col md={6}>
                                            <Label className="form-label" for="user">
                                                {t('Түрээслэгч')}
                                            </Label>
                                            <Controller
                                                defaultValue=''
                                                control={control}
                                                id="user"
                                                name="user"
                                                render={({ field }) => (
                                                    <Input
                                                        {...field}
                                                        id="user"
                                                        bsSize="sm"
                                                        type="text"
                                                        disabled={true}
                                                        readOnly={true}
                                                        placeholder={t('Түрээслэгч')}
                                                        invalid={errors.user && true}
                                                    />
                                                )}
                                            />
                                        </Col>
                                        <Col md={6}>
                                            <Label className="form-label" for="room_type_name">
                                                {t('Өрөөний төрөл')}
                                            </Label>
                                            <Controller
                                                defaultValue=''
                                                control={control}
                                                id="room_type_name"
                                                name="room_type_name"
                                                render={({ field }) => (
                                                    <Input
                                                        {...field}
                                                        id="room_type_name"
                                                        bsSize="sm"
                                                        placeholder={t('Өрөөний төрөл')}
                                                        type="text"
                                                        disabled={true}
                                                        readOnly={true}
                                                        invalid={errors.room_type_name && true}
                                                    />
                                                )}
                                            />
                                        </Col>
                                        <Col md={6}>
                                            <Label className="form-label" for="room_name">
                                                {t('Өрөөний дугаар')}
                                            </Label>
                                            <Controller
                                                defaultValue=''
                                                control={control}
                                                id="room_name"
                                                name="room_name"
                                                render={({ field }) => (
                                                    <Input
                                                        {...field}
                                                        id="room_name"
                                                        bsSize="sm"
                                                        placeholder={t('Өрөөний дугаар')}
                                                        type="text"
                                                        disabled={true}
                                                        readOnly={true}
                                                        invalid={errors.room_name && true}
                                                    />
                                                )}
                                            />
                                            {errors.room && <FormFeedback className='d-block'>{t(errors.room.message)}</FormFeedback>}
                                        </Col>
                                        <Col md={6}>
                                            <Label className="form-label" for="start_date">
                                                {t('Эхлэх хугацаа')}
                                            </Label>
                                            <Controller
                                                defaultValue=''
                                                name='start_date'
                                                control={control}
                                                render={({ field }) => (
                                                    <Input
                                                        {...field}
                                                        bsSize='sm'
                                                        id='start_date'
                                                        placeholder='Сонгох'
                                                        type="date"
                                                        disabled={true}
                                                        readOnly={true}
                                                        invalid={errors.start_date && true}
                                                    />
                                                )}
                                            />
                                            {errors.start_date && <FormFeedback className='d-block'>{t(errors.start_date.message)}</FormFeedback>}
                                        </Col>
                                        <Col md={6}>
                                            <Label className="form-label" for="end_date">
                                                {t('Дуусах хугацаа')}
                                            </Label>
                                            <Controller
                                                defaultValue=''
                                                name='end_date'
                                                control={control}
                                                render={({ field }) => (
                                                    <Input
                                                        {...field}
                                                        bsSize='sm'
                                                        id='end_date'
                                                        placeholder='Сонгох'
                                                        type="date"
                                                        disabled={true}
                                                        readOnly={true}
                                                        invalid={errors.end_date && true}
                                                    />
                                                )}
                                            />
                                            {errors.end_date && <FormFeedback className='d-block'>{t(errors.end_date.message)}</FormFeedback>}
                                        </Col>
                                        <Col md={6}>
                                            <Label className="form-label" for="request_date">
                                                {t('Бүртгүүлсэн огноо')}
                                            </Label>
                                            <Controller
                                                defaultValue=''
                                                name='request_date'
                                                control={control}
                                                render={({ field }) => (
                                                    <Input
                                                        {...field}
                                                        bsSize='sm'
                                                        id='request_date'
                                                        placeholder='Сонгох'
                                                        type="date"
                                                        disabled={true}
                                                        readOnly={true}
                                                        invalid={errors.request_date && true}
                                                    />
                                                )}
                                            />
                                            {errors.request_date && <FormFeedback className='d-block'>{t(errors.request_date.message)}</FormFeedback>}
                                        </Col>
                                        <Col md={12}>
                                            <Label className="form-label" for="request">
                                                {t('Түрээслэх хүсэлт')}
                                            </Label>
                                            <Controller
                                                defaultValue=''
                                                control={control}
                                                id="request"
                                                name="request"
                                                render={({ field }) => (
                                                    <Input
                                                        {...field}
                                                        id="request"
                                                        bsSize="sm"
                                                        placeholder={t('Түрээслэх хүсэлт')}
                                                        type="textarea"
                                                        disabled={true}
                                                        readOnly={true}
                                                        rows="4"
                                                        invalid={errors.request && true}
                                                    />
                                                )}
                                            />
                                            {errors.request && <FormFeedback className='d-block'>{t(errors.request.message)}</FormFeedback>}
                                        </Col>
                                    </Row>
                                </div>
                            </div>
                        </Col>
                        <div className='added-cards'>
                            <div className={classnames('cardMaster rounded border p-1')}>
                                <Label className="form-label fs-6">
                                    {
                                        is_view
                                        ?
                                            t('Хүсэлтийн хариу')
                                        :
                                            t('Хүсэлтийг шийдвэрлэх')
                                    }
                                </Label>

                                <div>
                                    <hr />
                                </div>
                                <Row className='gy-1'>
                                    <Col md={6}>
                                        <Label className="form-label" for="solved_flag">
                                            {t('Шийдвэрийн төрөл')}
                                        </Label>
                                        <Controller
                                            defaultValue=''
                                            control={control}
                                            id="solved_flag"
                                            name="solved_flag"
                                            render={({ field: { value, onChange} }) => (
                                                <Select
                                                    name="solved_flag"
                                                    id="solved_flag"
                                                    classNamePrefix='select'
                                                    isClearable
                                                    className={classnames('react-select', { 'is-invalid': errors.solved_flag })}
                                                    isLoading={isLoading}
                                                    placeholder={t(`-- Сонгоно уу --`)}
                                                    options={solved_type || []}
                                                    value={solved_type.find((c) => c.id === value)}
                                                    noOptionsMessage={() => t('Хоосон байна')}
                                                    onChange={(val) => {
                                                        onChange(val?.id || '')
                                                    }}
                                                    isDisabled={is_view}
                                                    styles={ReactSelectStyles}
                                                    getOptionValue={(option) => option.id}
                                                    getOptionLabel={(option) => option.name}
                                                />
                                            )}
                                        />
                                            {errors.solved_flag && <FormFeedback className='d-block'>{t(errors.solved_flag.message)}</FormFeedback>}
                                        </Col>
                                    <Col md={6}>
                                        <Label className="form-label" for="solved_start_date">
                                            {t('Гэрээ эхлэх хугацаа')}
                                        </Label>
                                        <Controller
                                            defaultValue=''
                                            name='solved_start_date'
                                            control={control}
                                            render={({ field }) => (
                                                <Input
                                                    {...field}
                                                    bsSize='sm'
                                                    id='solved_start_date'
                                                    placeholder='Сонгох'
                                                    type="date"
                                                    disabled={is_view}
                                                    readOnly={is_view}
                                                    invalid={errors.solved_start_date && true}
                                                />
                                            )}
                                        />
                                        {errors.solved_start_date && <FormFeedback className='d-block'>{t(errors.solved_start_date.message)}</FormFeedback>}
                                    </Col>
                                    <Col md={6}>
                                        <Label className="form-label" for="solved_finish_date">
                                            {t('Гэрээ дуусах хугацаа')}
                                        </Label>
                                        <Controller
                                            defaultValue=''
                                            name='solved_finish_date'
                                            control={control}
                                            render={({ field }) => (
                                                <Input
                                                    {...field}
                                                    bsSize='sm'
                                                    id='solved_finish_date'
                                                    placeholder='Сонгох'
                                                    type="date"
                                                    disabled={is_view}
                                                    readOnly={is_view}
                                                    invalid={errors.solved_finish_date && true}
                                                />
                                            )}
                                        />
                                        {errors.solved_finish_date && <FormFeedback className='d-block'>{t(errors.solved_finish_date.message)}</FormFeedback>}
                                    </Col>
                                    <Col md={6}>
                                        <Label className="form-label" for="first_uldegdel">
                                            {t('Эхний үлдэгдэл')}
                                        </Label>
                                        <Controller
                                            defaultValue=''
                                            control={control}
                                            id="first_uldegdel"
                                            name="first_uldegdel"
                                            render={({ field }) => (
                                                <Input
                                                    {...field}
                                                    id="first_uldegdel"
                                                    bsSize="sm"
                                                    placeholder={t('Эхний үлдэгдэл')}
                                                    type="number"
                                                    disabled={is_view}
                                                    readOnly={is_view}
                                                    invalid={errors.first_uldegdel && true}
                                                />
                                            )}
                                        />
                                        {errors.first_uldegdel && <FormFeedback className='d-block'>{t(errors.first_uldegdel.message)}</FormFeedback>}
                                    </Col>
                                    <Col md={12}>
                                        <Label className="form-label" for="solved_message">
                                            {t('Шийдвэрийн тайлбар')}
                                        </Label>
                                        <Controller
                                            defaultValue=''
                                            control={control}
                                            id="solved_message"
                                            name="solved_message"
                                            render={({ field }) => (
                                                <Input
                                                    {...field}
                                                    id="solved_message"
                                                    bsSize="sm"
                                                    placeholder={t('Шийдвэрийн тайлбар')}
                                                    type="textarea"
                                                    disabled={is_view}
                                                    readOnly={is_view}
                                                    rows="5"
                                                    invalid={errors.solved_message && true}
                                                />
                                            )}
                                        />
                                        {errors.solved_message && <FormFeedback className='d-block'>{t(errors.solved_message.message)}</FormFeedback>}
                                    </Col>
                                </Row>
                            </div>
                        </div>
                        {
                            !is_view &&
                            <Col md={12} className="text-center mt-2">
                                <Button className="me-2" size='sm' color="primary" type="submit">
                                    {t('Хадгалах')}
                                </Button>
                                <Button color="secondary" size='sm' type="reset" outline  onClick={handleModal}>
                                    {t('Буцах')}
                                </Button>
                            </Col>
                        }
                    </Row>
                </ModalBody>
            </Modal>
        </Fragment>
	);
};
export default cModal;
