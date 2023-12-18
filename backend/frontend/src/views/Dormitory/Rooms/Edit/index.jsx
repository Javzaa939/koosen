import React, { Fragment, useEffect, useState } from "react";

import { Controller, useForm } from 'react-hook-form'

import { Row, ModalBody, ModalHeader, Col, FormFeedback, Input, Form, Modal, Label, Button, Spinner } from 'reactstrap'

import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';

import Select from 'react-select'

import { validate, convertDefaultValue, ReactSelectStyles, get_gender_list } from "@utils"

import classnames from "classnames";

import { validateSchema } from "../validateSchema";

import { t } from 'i18next';

const EditModal = ({ open, handleEdit, editId, refreshDatas }) => {

    // ** Hook
    const { control, handleSubmit, formState: { errors }, reset, setValue, setError } = useForm(validate(validateSchema))

    const { isLoading, Loader, fetchData } = useLoader({})

    const [roomTypeOption, setRoomTypeOption] = useState([])
    const [gender_option, setGenderOption] = useState(get_gender_list())

    // Api
    const roomApi = useApi().dormitory.room
    const roomTypeApi = useApi().dormitory.type

    async function getDatas() {
        if(editId) {
            const { success, data } = await fetchData(roomApi.getOne(editId))
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
            const { success, error } = await fetchData(roomApi.put(cdata, editId))
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
            {
                isLoading &&
                <div className='suspense-loader'>
                    <Spinner size='bg'/>
                    <span className='ms-50'>{t('Түр хүлээнэ үү...')}</span>
                </div>
            }
                <ModalHeader
                    className="bg-transparent pb-0"
                    toggle={handleEdit}
                >
                </ModalHeader>
                <ModalBody className="px-sm-3 pt-50 pb-3">
                    <div className="text-center">
                        <h5>{t('Өрөө засах')}</h5>
                    </div>
                    <Row tag={Form} className='gy-1' onSubmit={handleSubmit(onSubmit)}>
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
                                            getOptionLabel={(option) => option.name}
                                        />
                                    )
                                }}
                            />
                            {errors.room_type && <FormFeedback className='d-block'>{t(errors.room_type.message)}</FormFeedback>}
                        </Col>
                        <Col md={12}>
                            <Label className='form-label' for="room_number">
                                {t('Өрөөний дугаар')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id='room_number'
                                name='room_number'
                                render={({field}) => (
                                    <Input
                                        {...field}
                                        type='text'
                                        name='room_number'
                                        id='room_number'
                                        placeholder={t('Өрөөний дугаар')}
                                        bsSize='sm'
                                        invalid={errors.room_number && true}
                                    />
                                )}
                                />
                            {errors.room_number && <FormFeedback className='d-block'>{t(errors.room_number.message)}</FormFeedback>}
                        </Col>
                        <Col md={12}>
                            <Label className='form-label' for='gender'>
                                {t('Хүйс')}
                            </Label>
                            <Controller
                                control={control}
                                defaultValue=''
                                id="gender"
                                name="gender"
                                render={({ field: { value, onChange } }) => {
                                    return (
                                        <Select
                                            name="gender"
                                            id="gender"
                                            classNamePrefix='select'
                                            isClearable
                                            className={classnames('react-select', {'is-invalid': errors.gender})}
                                            isLoading={isLoading}
                                            placeholder={t('-- Сонгоно уу --')}
                                            options={gender_option || []}
                                            value={gender_option.find((c) => c.id === value)}
                                            noOptionsMessage={() => t('Хоосон байна')}
                                            onChange={(val) => {
                                                onChange(val?.id || '')
                                            }}
                                            styles={ReactSelectStyles}
                                            getOptionValue={(option) => option.id}
                                            getOptionLabel={(option) => option.name}
                                        />
                                    )
                                }}
                            />
                            {errors.gender && <FormFeedback className='d-block'>{t(errors.gender.message)}</FormFeedback>}
                        </Col>
                        <Col md={12}>
                            <Label className='form-label' for='gateway'>
                                {t('Орц')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id='gateway'
                                name='gateway'
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        type='text'
                                        name='gateway'
                                        id='gateway'
                                        bsSize='sm'
                                        placeholder={t('Орц')}
                                        invalid={errors.gateway && true}
                                    />
                                )}
                            />
                            {errors.gateway && <FormFeedback className='d-block'>{t(errors.gateway.message)}</FormFeedback>}
                        </Col>
                        <Col md={12}>
                            <Label className='form-label' for='floor'>
                                {t('Давхар')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id='floor'
                                name='floor'
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        type='number'
                                        name='floor'
                                        id='floor'
                                        bsSize='sm'
                                        placeholder={t('Давхар')}
                                        invalid={errors.floor && true}
                                    />
                                )}
                            />
                            {errors.floor && <FormFeedback className='d-block'>{t(errors.floor.message)}</FormFeedback>}
                        </Col>
                        <Col md={12}>
                            <Label className='form-label' for='door_number' >
                                {t('Гадна хаалганы дугаар')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id='door_number'
                                name='door_number'
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        type='text'
                                        name='door_number'
                                        id='door_number'
                                        bsSize='sm'
                                        placeholder={t('Гадна хаалганы дугаар')}
                                        invalid={errors.door_number && true}
                                    >
                                    </Input>
                                )}
                            />
                            {errors.door_number && <FormFeedback className='d-block'>{t('errors.door_number.message')}</FormFeedback>}
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
