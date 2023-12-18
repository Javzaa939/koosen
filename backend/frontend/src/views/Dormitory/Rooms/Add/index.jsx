import React, { Fragment, useState, useEffect } from 'react'

import { X } from 'react-feather'

import { Controller, useForm } from 'react-hook-form'

import { convertDefaultValue, validate, ReactSelectStyles, get_gender_list } from '@utils'

import { Modal, Row, Col, Label, ModalHeader, ModalBody, Form, Input, Button, FormFeedback, Spinner } from 'reactstrap'

import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';

import Select from 'react-select'

import { useTranslation } from 'react-i18next'
import classnames from 'classnames'

import { validateSchema } from '../validateSchema'

const Addmodal = ({open, handleModal, refreshDatas }) => {

    const { t } = useTranslation()

    const closeBtn = (
        <X className='cursor-pointer' size={15} onClick={handleModal} />
    )

    // ** Hook
    const { control, handleSubmit, formState: { errors }, reset, setError } = useForm(validate(validateSchema));

    const { isLoading, Loader, fetchData } = useLoader({})

    const [roomTypeOption, setRoomTypeOption] = useState([])
    const [gender_option, setGenderOption] = useState(get_gender_list())

    // Api
    const roomApi = useApi().dormitory.room
    const roomTypeApi = useApi().dormitory.type

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
        const { success, error } = await fetchData(roomApi.post(cdata))
        if(success) {
            reset()
            refreshDatas()
            handleModal()
        }
        else {
            /** Алдааны мессеж */
            for (let key in error) {
                setError(error[key].field, { type: 'custom', message: error[key].msg});
            }
        }
    }
    return (
        <Fragment>
            <Modal
                isOpen={open}
                toggle={handleModal}
                className="sidebar-lg hr-register"
                modalClassName="modal-slide-in "
                contentClassName="pt-0"
            >
            {
                isLoading &&
                <div className='suspense-loader'>
                    <Spinner size='bg'/>
                    <span className='ms-50'>{t('Түр хүлээнэ үү...')}</span>
                </div>
            }
                <ModalHeader
                    className="mb-1"
                    toggle={handleModal}
                    close={closeBtn}
                    tag="div"
                >
                    <h5 className="modal-title">{t('Өрөө нэмэх')}</h5>
                </ModalHeader>
                <ModalBody className='flex-grow-1'>
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
                        <Col md={12} className="mt-2">
                            <Button className='me-2' color="primary" type="submit">
                                {t('Хадгалах')}
                            </Button>
                            <Button color="secondary" outline type="reset" onClick={handleModal}>
                                {t('Буцах')}
                            </Button>
                        </Col>
                    </Row>
                </ModalBody>
            </Modal>
        </Fragment>
    )
}



export default Addmodal

