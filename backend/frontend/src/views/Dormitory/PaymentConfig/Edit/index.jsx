import React, { Fragment, useState, useEffect } from "react";

import { Controller, useForm } from 'react-hook-form'

import { Row, ModalBody, ModalHeader, Col, FormFeedback, Input, Form, Modal, Label, Button, Spinner } from 'reactstrap'

import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';

import Select from 'react-select'

import classnames from "classnames";

import { validate, convertDefaultValue, ReactSelectStyles } from "@utils"

import { validateSchema } from "../validateSchema";

import { t } from 'i18next';

const EditModal = ({ open, handleEdit, refreshDatas, editId }) => {

    // ** Hook
    const { control, handleSubmit, formState: { errors }, reset, setValue, setError } = useForm(validate(validateSchema))

    const { isLoading, Loader, fetchData } = useLoader({})

    const [roomTypeOption, setRoomTypeOption] = useState([])

    // Api
    const paymentApi = useApi().dormitory.payment
    const roomTypeApi = useApi().dormitory.type

    async function getDatas() {
        if(editId) {
            const { success, data } = await fetchData(paymentApi.getOne(editId))
            if(success) {
                // засах үед дата байх юм бол setValue-р дамжуулан утгыг харуулна
                if(data === null) return
                for(let key in data) {
                    if(data[key] !== null)
                        setValue(key, data[key])
                    else setValue(key, '')
                    if(key === 'room_type') setValue(key, data[key]?.id)
                }
            }
        }
    }

    useEffect(() => {
        getDatas()
    },[open])

    async function getRoomType() {
        const { success, data } = await fetchData(roomTypeApi.getList())
        if(success) {
            setRoomTypeOption(data)
        }
    }

    useEffect(() => {
        getRoomType()
    },[])

    async function onSubmit(cdata) {
        cdata = convertDefaultValue(cdata)
        if(editId) {
            const { success, error } = await fetchData(paymentApi.put(cdata, editId))
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
                className="modal-dialog-centered modal-sm"
                onClosed={handleEdit}
            >
                {isLoading && <div className='suspense-loader'><Spinner size='xl'/></div>}
                <ModalHeader
                    className="bg-transparent pb-0"
                    toggle={handleEdit}
                    >
                </ModalHeader>
                <ModalBody className="px-sm-3 pt-50 pb-3">
                    <div className="text-center">
                        <h5>{t('Төлбөрийн тохиргоо засах')}</h5>
                    </div>
                    <Row tag={Form} className='gy-1' onSubmit={handleSubmit(onSubmit)}>
                    <Col md={12}>
                            <Label className='form-label' for="name">
                                {t('Тохиргооны нэр')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id='name'
                                name='name'
                                render={({field}) => (
                                    <Input
                                        {...field}
                                        type='text'
                                        name='name'
                                        id='name'
                                        placeholder={t('Тохиргооны нэр')}
                                        bsSize='sm'
                                        invalid={errors.name && true}
                                        >
                                    </Input>
                                )}
                                />
                            {errors.name && <FormFeedback className='d-block'>{t(errors.name.message)}</FormFeedback>}
                        </Col>
                        <Col md={12}>
                            <Label className='form-label' for='room_type'>
                                {t('Өрөөний төрөл')}
                            </Label>
                            <Controller
                                control={control}
                                defaultValue=''
                                name="room_type"
                                render={({ field: { value, onChange } }) => {
                                    return (
                                        <Select
                                            name="room_type"
                                            id="room_type"
                                            classNamePrefix='select'
                                            isClearable
                                            className={classnames('react-select', {'is-invalid': errors.room_type})}
                                            isLoading={isLoading}
                                            placeholder={t('-- Сонгоно уу --')}
                                            options={roomTypeOption || []}
                                            value={roomTypeOption.find((c) => c.id === value)}
                                            noOptionsMessage={() => t('Хоосон байна')}
                                            onChange={(val) => {
                                                onChange(val?.id || '')
                                            }}
                                            styles={ReactSelectStyles}
                                            getOptionValue={(option) => option.id}
                                            getOptionLabel={(option) => option.name + " "+ "(" + option.rent_type_name+")"}
                                        />
                                    )
                                }}
                            />
                            {errors.room_type && <FormFeedback className='d-block'>{t(errors.room_type.message)}</FormFeedback>}
                        </Col>
                        <Col md={12}>
                            <Label className='form-label' for='payment'>
                                {t('Жилийн төлбөр')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id='payment'
                                name='payment'
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        type='number'
                                        name='payment'
                                        id='payment'
                                        bsSize='sm'
                                        placeholder={t('Жилийн төлбөр')}
                                        invalid={errors.payment && true}
                                    >
                                    </Input>
                                )}
                            />
                            {errors.payment && <FormFeedback className='d-block'>{t(errors.payment.message)}</FormFeedback>}
                        </Col>
                        <Col md={12}>
                            <Label className='form-label' for='ransom'>
                                {t('Барьцаа төлбөр')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id='ransom'
                                name='ransom'
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        type='number'
                                        name='ransom'
                                        id='ransom'
                                        bsSize='sm'
                                        placeholder={t('Барьцаа төлбөр')}
                                        invalid={errors.ransom && true}
                                    >
                                    </Input>
                                )}
                            />
                            {errors.ransom && <FormFeedback className='d-block'>{t(errors.ransom.message)}</FormFeedback>}
                        </Col>
                        <Col md={12}>
                            <Controller
                                defaultValue={true}
                                control={control}
                                id='is_ourstudent'
                                name='is_ourstudent'
                                render={({ field }) => {
                                    return (
                                        <Input
                                            {...field}
                                            checked={field.value}
                                            className='me-50'
                                            type='checkbox'
                                            name='is_ourstudent'
                                            id='is_ourstudent'
                                        />
                                    )
                                }}
                            />
                            <Label className='form-label' for='is_ourstudent'>
                                {t('Өөрийн сургуулийн оюутан')}
                            </Label>
                        </Col>
                        <Col md={12} className="text-center mt-2">
                            <Button className='me-2' color="primary" type="submit">
                                {t('Хадгалах')}
                            </Button>
                            <Button color="secondary" outline type="reset" onClick={handleEdit}>
                                {t('Буцах')}
                            </Button>
                        </Col>
                    </Row>
                </ModalBody>
            </Modal>
        </Fragment>
    )
}


export default EditModal
