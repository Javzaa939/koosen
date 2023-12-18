import React, { Fragment, useState, useEffect } from 'react'

import { X } from 'react-feather'

import { Controller, useForm } from 'react-hook-form'

import { Modal, Row, Col, Label, ModalHeader, ModalBody, Form, Input, Button, FormFeedback, Spinner } from 'reactstrap'

import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';

import Select from 'react-select'

import { useTranslation } from 'react-i18next'
import classnames from 'classnames'

import { convertDefaultValue, validate, ReactSelectStyles, get_day } from '@utils'

import { validateSchema } from '../validateSchema'

const Addmodal = ({ isOpen, handleModal, refreshDatas }) => {

    const { t } = useTranslation()

    const closeBtn = (
        <X className='cursor-pointer' size={15} onClick={handleModal} />
    )

    // ** Hook
    const { control, handleSubmit, formState: { errors }, reset, setError, watch } = useForm(validate(validateSchema));

    const { isLoading, fetchData } = useLoader({})

    const [weekend_option, setWeekendOption] = useState(get_day())
    const [selectWeekendIds, setWeekIds] = useState([])
    const [is_loading, setIsLoading] = useState(false)
    const [room_option, setRoomOption] = useState([])

    // Api
    const gymPaymentApi = useApi().order.gym
    const roomApi = useApi().timetable.room

    async function getRooms() {
		const room_type = 6
        const { success, data } = await fetchData(roomApi.getList(room_type))
        if(success) {
            setRoomOption(data)
        }
    }

    useEffect(() => {
        getRooms()
    },[])

    async function onSubmit(cdata) {
        const weekend_ids = []
        cdata = convertDefaultValue(cdata)
        selectWeekendIds.map((week) => {
            if(!weekend_ids.includes(week.id)) {
                weekend_ids.push(week.id)
            }
        })
        cdata['week_day'] = JSON.stringify(weekend_ids)
        setIsLoading(true)
        const { success, error } = await fetchData(gymPaymentApi.post(cdata))
        if(success) {
            reset()
            refreshDatas()
            handleModal()
            setIsLoading(false)
        }
        else {
            setIsLoading(false)
            /** Алдааны мессеж */
            for (let key in error) {
                setError(error[key].field, { type: 'custom', message: error[key].msg});
            }
        }
    }

    return (
        <Fragment>
            {
                isLoading && is_loading &&
                <div className='suspense-loader'>
                    <Spinner size='bg'/>
                    <span className='ms-50'>{t('Түр хүлээнэ үү...')}</span>
                </div>
            }
            <Modal
                isOpen={isOpen}
                toggle={handleModal}
                className="sidebar-xl hr-register"
                modalClassName="modal-slide-in "
                contentClassName="pt-0"
            >
                <ModalHeader
                    className="mb-1"
                    toggle={handleModal}
                    close={closeBtn}
                    tag="div"
                >
                    <h5 className="modal-title">{t('Сургалтын төрөл нэмэх')}</h5>
                </ModalHeader>
                <ModalBody className='flex-grow-1'>
                    <Row tag={Form} className='gy-1' onSubmit={handleSubmit(onSubmit)}>
                        <Col md={6}>
                            <Label className='form-label' for='name'>
                                {t('Сургалтын нэр')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id='name'
                                name='name'
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        type='text'
                                        name='name'
                                        id='name'
                                        bsSize='sm'
                                        placeholder={t('Сургалтын нэр')}
                                        invalid={errors.name && true}
                                    />
                                )}
                            />
                            {errors.name && <FormFeedback className='d-block'>{t(errors.name.message)}</FormFeedback>}
                        </Col>
                        <Col md={6}>
                            <Label className='form-label' for="mount_count">
                                {t('Хичээллэх сар')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id='mount_count'
                                name='mount_count'
                                render={({field}) => (
                                    <Input
                                        {...field}
                                        type='number'
                                        name='mount_count'
                                        id='mount_count'
                                        placeholder={t('Хичээллэх сар')}
                                        bsSize='sm'
                                        invalid={errors.mount_count && true}
                                        onKeyDown={(e) =>["e", "E", "+", "-", "."].includes(e.key) && e.preventDefault()}
                                    />
                                )}
                                />
                            {errors.mount_count && <FormFeedback className='d-block'>{t(errors.mount_count.message)}</FormFeedback>}
                        </Col>
                        <Col md={12}>
                            <Label className='form-label' for='week_day'>
                                {t('Хичээллэх гарагууд')}
                            </Label>
                            <Controller
                                control={control}
                                defaultValue=''
                                name="week_day"
                                render={({ field: { value, onChange } }) => {
                                    return (
                                        <Select
                                            name="week_day"
                                            id="week_day"
                                            classNamePrefix='select'
                                            isClearable
                                            className={classnames('react-select', {'is-invalid': selectWeekendIds.length < 1})}
                                            isLoading={isLoading}
                                            placeholder={t('-- Сонгоно уу --')}
                                            options={weekend_option || []}
                                            value={weekend_option.find((c) => c.id === value)}
                                            noOptionsMessage={() => t('Хоосон байна')}
                                            onChange={(val) => {
                                                onChange(val?.id || '')
                                                setWeekIds(val)
                                            }}
                                            isMulti
                                            closeMenuOnSelect={false}
                                            styles={ReactSelectStyles}
                                            getOptionValue={(option) => option.id}
                                            getOptionLabel={(option) => option.name}
                                        />
                                    )
                                }}
                            />
                            {selectWeekendIds.length < 1 && <FormFeedback className='d-block'>{t('Хоосон байна')}</FormFeedback>}
                        </Col>
                        <Col md={12}>
                            <Label className='form-label' for='room'>
                                {t('Өрөө')}
                            </Label>
                            <Controller
                                control={control}
                                defaultValue=''
                                name="room"
                                render={({ field: { value, onChange } }) => {
                                    return (
                                        <Select
                                            name="room"
                                            id="room"
                                            classNamePrefix='select'
                                            isClearable
                                            className={classnames('react-select', {'is-invalid':  errors.room})}
                                            isLoading={isLoading}
                                            placeholder={t('-- Сонгоно уу --')}
                                            options={room_option || []}
                                            value={room_option.find((c) => c.id === value)}
                                            noOptionsMessage={() => t('Хоосон байна')}
                                            onChange={(val) => {
                                                onChange(val?.id || '')
                                            }}
                                            styles={ReactSelectStyles}
                                            getOptionValue={(option) => option.id}
                                            getOptionLabel={(option) => option.full_name}
                                        />
                                    )
                                }}
                            />
                            {errors.room && <FormFeedback className='d-block'>{t(errors.room.message)}</FormFeedback>}
                        </Col>
                        <Col md={6}>
                            <Label className='form-label' for='accepted_count'>
                                {t('Долоо хоногт хичээллэх тоо')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id='accepted_count'
                                name='accepted_count'
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        type='number'
                                        name='accepted_count'
                                        id='accepted_count'
                                        bsSize='sm'
                                        placeholder={t('Долоо хоногт хичээллэх тоо')}
                                        invalid={errors.accepted_count && true}
                                        onKeyDown={(e) =>["e", "E", "+", "-", "."].includes(e.key) && e.preventDefault()}
                                    />
                                )}
                            />
                            {errors.accepted_count && <FormFeedback className='d-block'>{t(errors.accepted_count.message)}</FormFeedback>}
                        </Col>
                        <Col md={6}>
                            <Label className='form-label' for='payment'>
                                {t('Төлбөрийн дүн')}
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
                                        placeholder={t('Төлбөрийн дүн')}
                                        invalid={errors.payment && true}
                                    />
                                )}
                            />
                            {errors.payment && <FormFeedback className='d-block'>{t(errors.payment.message)}</FormFeedback>}
                        </Col>
                        <Col md={12}>
                            <Controller
                                defaultValue={false}
                                control={control}
                                id='is_freetime'
                                name='is_freetime'
                                render={({ field }) => {
                                    return (
                                        <Input
                                            {...field}
                                            checked={field.value}
                                            className='me-50'
                                            type='checkbox'
                                            name='is_freetime'
                                            id='is_freetime'
                                        />
                                    )
                                }}
                            />
                            <Label className='form-label' for='is_freetime'>
                                {t('Чөлөөт цагийн хуваарьтай эсэх')}
                            </Label>
                        </Col>
                        {
                            !watch('is_freetime') &&
                            <>
                                <Col md={6}>
                                    <Label className="form-label" for="start_time">
                                        {t('Хичээл эхлэх цаг')}
                                    </Label>
                                    <Controller
                                        defaultValue=''
                                        control={control}
                                        id="start_time"
                                        name="start_time"
                                        render={({ field }) => (
                                            <Input
                                                {...field}
                                                id="start_time"
                                                bsSize="sm"
                                                placeholder={t('Хичээл эхлэх цаг')}
                                                type="time"
                                                invalid={errors.start_time && true}
                                            />
                                        )}
                                    />
                                    {errors.start_time && <FormFeedback className='d-block'>{t(errors.start_time.message)}</FormFeedback>}
                                </Col>
                                <Col md={6}>
                                    <Label className="form-label" for="finish_time">
                                        {t('Хичээл дуусах цаг')}
                                    </Label>
                                    <Controller
                                        defaultValue=''
                                        control={control}
                                        id="finish_time"
                                        name="finish_time"
                                        render={({ field }) => (
                                            <Input
                                                {...field}
                                                id="finish_time"
                                                bsSize="sm"
                                                placeholder={t('Хичээл дуусах цаг')}
                                                type="time"
                                                invalid={errors.finish_time && true}
                                            />
                                        )}
                                    />
                                    {errors.finish_time && <FormFeedback className='d-block'>{t(errors.finish_time.message)}</FormFeedback>}
                                </Col>
                            </>
                        }
                        <Col md={12}>
                            <Label className='form-label' for="description">
                                {t('Тайлбар')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id='description'
                                name='description'
                                render={({field}) => (
                                    <Input
                                        {...field}
                                        type='textarea'
                                        name='description'
                                        id='description'
                                        placeholder={t('Тайлбар')}
                                        bsSize='sm'
                                        rows='4'
                                        invalid={errors.description && true}
                                    />
                                )}
                            />
                            {errors.description && <FormFeedback className='d-block'>{t(errors.description.message)}</FormFeedback>}
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

