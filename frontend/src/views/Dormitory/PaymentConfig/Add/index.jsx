import React, { Fragment, useState, useEffect } from 'react'

import { X } from 'react-feather'

import { Controller, useForm } from 'react-hook-form'

import Select from 'react-select'

import { convertDefaultValue, validate, ReactSelectStyles } from '@utils'

import { Modal, Row, Col, Label, ModalHeader, ModalBody, Form, Input, Button, FormFeedback, Spinner} from 'reactstrap'

import { useTranslation } from 'react-i18next'

import classnames from 'classnames'

import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';
import ActiveYearContext from "@context/ActiveYearContext"

import { validateSchema } from '../validateSchema'
import { useContext } from 'react'

const Addmodal = ({ open, handleModal, refreshDatas }) => {

    const { t } = useTranslation()

    const closeBtn = (
        <X className='cursor-pointer' size={15} onClick={handleModal} />
    )

    const { cyear_name } = useContext(ActiveYearContext)

    const { isLoading, Loader, fetchData } = useLoader({})
	const { isLoading: postLoading, fetchData: postFetch } = useLoader({});

    // ** Hook
    const { control, handleSubmit, formState: { errors }, reset, resetField, setError } = useForm(validate(validateSchema));

    const [roomTypeOption, setRoomType] = useState([])
    const [rentType, setRentType] = useState('')

    // Api
    const roomTypeApi = useApi().dormitory.type
    const paymentApi = useApi().dormitory.payment

    async function getRoomType() {
        const { success, data } = await fetchData(roomTypeApi.getList())
        if(success) {
            setRoomType(data)
        }
    }

    useEffect(() => {
        getRoomType()
    },[])

    async function onSubmit(cdata) {
        cdata['lesson_year'] = cyear_name
        cdata = convertDefaultValue(cdata)
        const { success, error } = await postFetch(paymentApi.post(cdata))
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
                <ModalHeader
                    className="mb-1"
                    toggle={handleModal}
                    close={closeBtn}
                    tag="div"
                >
                    <h5 className="modal-title">{t('Төлбөрийн тохиргоо бүртгэх')}</h5>
                </ModalHeader>
                <ModalBody className='flex-grow-1'>
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
                                                setRentType(val?.rent_type || '')
                                                if(val?.rent_type !== rentType) resetField('payment')
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
                                {t(`${rentType && rentType === 1 ? 'Жилийн төлбөр' : 'Сарын төлбөр'}`)}
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
                                        placeholder={t(`${rentType && rentType === 1 ? 'Жилийн төлбөр' : 'Сарын төлбөр'}`)}
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
                                {t(`${rentType && rentType === 1 ? 'Өөрийн сургуулийн оюутан эсэх' : 'Өөрийн сургуулийн багш эсэх'}`)}
                            </Label>
                        </Col>
                        <Col md={12} className="mt-2">
                            <Button className="me-2" color="primary" type="submit" disabled={postLoading}>
                            {postLoading &&<Spinner size='sm' className='me-1'/>}
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

