// ** React imports
import React, { Fragment, useState, useEffect } from 'react'

import useApi from "@hooks/useApi";
import useLoader from "@hooks/useLoader";

import Select from 'react-select'

import { useTranslation } from 'react-i18next';

import { useForm, Controller } from "react-hook-form";

import classnames from 'classnames'

import { Row, Col, Form, Modal, Input, Label, Button, ModalBody, ModalHeader, FormFeedback } from "reactstrap";

import { validate, get_solved_type, ReactSelectStyles, convertDefaultValue } from "@utils"

import { validateSchema } from '../validateSchema';

const SolveModal = ({ request_id, isOpen, handleModal, refreshDatas, is_view }) => {

    const { t } = useTranslation()

    // ** Hook
    const { control, handleSubmit, formState: { errors }, reset, setError, setValue } = useForm(validate(validateSchema));

	// Loader
	const { Loader, isLoading, fetchData } = useLoader({});

    const [solved_type, setSolvedType] = useState(get_solved_type())

    // Api
    const requestApi = useApi().dormitory.request.another

    async function getDatas() {
        if(request_id) {
            const { success, data } = await fetchData(requestApi.getOne(request_id))
            if(success) {
                // засах үед дата байх юм бол setValue-р дамжуулан утгыг харуулна
                if(data === null) return
                for(let key in data) {
                    if(data[key] !== null)
                        setValue(key, data[key])
                    else setValue(key, '')

                    if(key === 'student') {
                        setValue('student', data[key]?.id)
                        setValue('student1', data[key]?.full_name)
                    }
                    if(key === 'room_type_name') setValue('room_type1', data[key])
                    if(key === 'room_name') setValue('room_name', data[key])
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
        const { success, error } = await fetchData(requestApi.put(cdata, request_id))
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
                <ModalHeader className='bg-transparent pb-0' toggle={handleModal}></ModalHeader>
                <ModalBody className="px-sm-3 pt-50 pb-3">
                    <div className='text-center'>
                        <h4>{t('Дотуур байранд амьдрах хүсэлт шийдвэрлэх')}</h4>
                    </div>
                    <Row tag={Form} className="gy-1" onSubmit={handleSubmit(onSubmit)}>
                        <Col md={12}>
                            <Label className="form-label" for="student1">
                                {t('Оюутан')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id="student1"
                                name="student1"
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        id="student1"
                                        bsSize="sm"
                                        type="text"
                                        disabled={true}
                                        readOnly={true}
                                        placeholder={t('Оюутан')}
                                        invalid={errors.student1 && true}
                                    />
                                )}
                            />
                            {errors.student && <FormFeedback className='d-block'>{t(errors.student.message)}</FormFeedback>}
                        </Col>
                        <Col md={12}>
                            <Label className="form-label" for="request">
                                {t('Суух хүсэлт')}
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
                                        placeholder={t('Суух хүсэлт')}
                                        type="textarea"
                                        disabled={true}
                                        readOnly={true}
                                        invalid={errors.request && true}
                                    />
                                )}
                            />
                            {errors.request && <FormFeedback className='d-block'>{t(errors.request.message)}</FormFeedback>}
                        </Col>
                        <Col md={6}>
                            <Label className="form-label" for="room_type1">
                                {t('Өрөөний төрөл')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id="room_type1"
                                name="room_type1"
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        id="room_type1"
                                        bsSize="sm"
                                        placeholder={t('Өрөөний төрөл')}
                                        type="text"
                                        disabled={true}
                                        readOnly={true}
                                        invalid={errors.room_type1 && true}
                                    />
                                )}
                            />
                            {errors.room_type && <FormFeedback className='d-block'>{t(errors.room_type.message)}</FormFeedback>}
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
                        <Col md={12}>
                            <div className='added-cards'>
                                <div className={classnames('cardMaster rounded border p-1')}>
                                    <p className='m-0 p-0' style={{fontSize: '12px'}}>{t('Төлбөрийн мэдээлэл')}</p>
                                    <hr />
                                    <Row className="gy-1">
                                        <Col md={6}>
                                            <Label className="form-label" for="payment">
                                                {t('Төлбөрийн хэмжээ')}
                                            </Label>
                                            <Controller
                                                defaultValue=''
                                                control={control}
                                                id="payment"
                                                name="payment"
                                                render={({ field }) => (
                                                    <Input
                                                        {...field}
                                                        id="payment"
                                                        bsSize="sm"
                                                        placeholder={t('Төлбөрийн хэмжээ')}
                                                        type="number"
                                                        disabled={true}
                                                        readOnly={true}
                                                        invalid={errors.payment && true}
                                                    />
                                                )}
                                            />
                                            {errors.payment && <FormFeedback className='d-block'>{t(errors.payment.message)}</FormFeedback>}
                                        </Col>
                                        <Col md={6}>
                                            <Label className="form-label" for="ransom">
                                                {t('Барьцаа төлбөр')}
                                            </Label>
                                            <Controller
                                                defaultValue=''
                                                control={control}
                                                id="ransom"
                                                name="ransom"
                                                render={({ field }) => (
                                                    <Input
                                                        {...field}
                                                        id="ransom"
                                                        bsSize="sm"
                                                        placeholder={t('Барьцаа төлбөр')}
                                                        type="number"
                                                        disabled={true}
                                                        readOnly={true}
                                                        invalid={errors.ransom && true}
                                                    />
                                                )}
                                            />
                                            {errors.ransom && <FormFeedback className='d-block'>{t(errors.ransom.message)}</FormFeedback>}
                                        </Col>
                                        <Col md={6}>
                                            <Label className="form-label" for="in_balance">
                                                {t('Төлсөн төлбөр')}
                                            </Label>
                                            <Controller
                                                defaultValue={0}
                                                control={control}
                                                id="in_balance"
                                                name="in_balance"
                                                render={({ field }) => (
                                                    <Input
                                                        {...field}
                                                        id="in_balance"
                                                        bsSize="sm"
                                                        placeholder={t('Төлсөн төлбөр')}
                                                        type="number"
                                                        disabled={true}
                                                        readOnly={true}
                                                        invalid={errors.in_balance && true}
                                                    />
                                                )}
                                            />
                                            {errors.in_balance && <FormFeedback className='d-block'>{t(errors.in_balance.message)}</FormFeedback>}
                                        </Col>
                                        <Col md={6}>
                                            <Label className="form-label" for="out_balance">
                                                {t('Буцаасан төлбөр')}
                                            </Label>
                                            <Controller
                                                defaultValue={0}
                                                control={control}
                                                id="out_balance"
                                                name="out_balance"
                                                render={({ field }) => (
                                                    <Input
                                                        {...field}
                                                        id="out_balance"
                                                        bsSize="sm"
                                                        placeholder={t('Буцаасан төлбөр')}
                                                        type="number"
                                                        disabled={true}
                                                        readOnly={true}
                                                        invalid={errors.out_balance && true}
                                                    />
                                                )}
                                            />
                                            {errors.out_balance && <FormFeedback className='d-block'>{t(errors.out_balance.message)}</FormFeedback>}
                                        </Col>
                                    </Row>
                                </div>
                            </div>
                        </Col>
                        <Col md={12}>
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
                                        invalid={errors.solved_message && true}
                                    />
                                )}
                            />
                            {errors.solved_message && <FormFeedback className='d-block'>{t(errors.solved_message.message)}</FormFeedback>}
                        </Col>
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
export default SolveModal;
