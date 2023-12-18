import React, { Fragment, useState } from 'react'

import { X } from 'react-feather'

import { Controller, useForm } from 'react-hook-form'

import { convertDefaultValue, validate,get_rent_type, ReactSelectStyles } from '@utils'

import { Modal, Row, Col, Label, ModalHeader, ModalBody, Form, Input, Button, FormFeedback, Spinner} from 'reactstrap'

import { useTranslation } from 'react-i18next'

import Select from 'react-select'
import classnames from "classnames";

import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';

import { validateSchema} from '../validateSchema'

const Addmodal = ({ open, handleModal, refreshDatas }) => {

    const { t } = useTranslation()

    const closeBtn = (
        <X className='cursor-pointer' size={15} onClick={handleModal} />
    )

    // ** Hook
    const { control, handleSubmit, formState: { errors }, reset } = useForm(validate(validateSchema));

    const { isLoading, Loader, fetchData } = useLoader({})
    const { isLoading: postLoading, fetchData: postFetch } = useLoader({});

    const [rentTypeOption, setRentType] = useState(get_rent_type())

    // Api
    const roomTypeApi = useApi().dormitory.type

    async function onSubmit(cdata) {
        cdata = convertDefaultValue(cdata)
        const { success, error } = await postFetch(roomTypeApi.post(cdata))
        if(success) {
            reset()
            handleModal()
            refreshDatas()
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
                    <h5 className="modal-title">{t('Өрөөний төрөл бүртгэх')}</h5>
                </ModalHeader>
                <ModalBody className='flex-grow-1'>
                    <Row tag={Form} className='gy-1' onSubmit={handleSubmit(onSubmit)}>
                        <Col md={12}>
                            <Label className='form-label' for="name">
                                {t('Өрөөний төрлийн нэр')}
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
                                        placeholder={t('Өрөөний төрлийн нэр')}
                                        bsSize='sm'
                                        invalid={errors.name && true}
                                        >
                                    </Input>
                                )}
                            />
                            {errors.name && <FormFeedback className='d-block'>{t(errors.name.message)}</FormFeedback>}
                        </Col>
                        <Col md={12}>
                            <Label className='form-label' for='rent_type'>
                                {t('Түрээсийн төрөл')}
                            </Label>
                            <Controller
                                control={control}
                                defaultValue=''
                                name="rent_type"
                                render={({ field: { value, onChange } }) => {
                                    return (
                                        <Select
                                            name="rent_type"
                                            id="rent_type"
                                            classNamePrefix='select'
                                            isClearable
                                            className={classnames('react-select', {'is-invalid': errors.rent_type})}
                                            isLoading={isLoading}
                                            placeholder={t('-- Сонгоно уу --')}
                                            options={rentTypeOption || []}
                                            value={rentTypeOption.find((c) => c.id === value)}
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
                            {errors.rent_type && <FormFeedback className='d-block'>{t(errors.rent_type.message)}</FormFeedback>}
                        </Col>
                        <Col md={12}>
                            <Label className='form-label' for='volume'>
                                {t('Өрөөний багтаамж')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id='volume'
                                name='volume'
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        type='number'
                                        name='volume'
                                        id='volume'
                                        bsSize='sm'
                                        placeholder={t('Өрөөний багтаамж')}
                                        invalid={errors.volume && true}
                                        >
                                     </Input>
                                )}
                            />
                            {errors.volume && <FormFeedback className='d-block'>{t(errors.volume.message)}</FormFeedback>}
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

