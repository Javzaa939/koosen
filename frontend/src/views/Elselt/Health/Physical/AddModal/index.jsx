import React, { Fragment, useState, useEffect, useContext } from 'react'

import { Controller, useForm } from 'react-hook-form'

import Select from 'react-select'

import { convertDefaultValue, validate, ReactSelectStyles } from '@utils'

import { Modal, Row, Col, Label, ModalHeader, ModalBody, Form, Input, Button, FormFeedback, Spinner} from 'reactstrap'

import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';
import classnames from 'classnames'
import ActiveYearContext from "@context/ActiveYearContext"

import { validateSchema } from './validateSchema'

function AddModal({ addModal, addModalHandler, addModalData, getDatas, STATE_LIST }) {

    const { control, handleSubmit, formState: { errors }, reset, resetField, setValue, setError } = useForm(validate(validateSchema));

	const { Loader, isLoading, fetchData } = useLoader({ isFullScreen: true, bg: 3 });
	const elseltApi = useApi().elselt.health.physical

    async function onSubmit(cdata) {
        cdata['user'] = addModalData?.user

        /**
         *
         */
        if(addModalData?.health_up_user_data) {
            const { success, error } = await fetchData(elseltApi.put(addModalData?.health_up_user_data?.id, cdata))
            if(success) {
                reset()
                getDatas()
                addModalHandler()
            }
            else {
                /** Алдааны мессеж */
                for (let key in error) {
                    setError(error[key].field, { type: 'custom', message: error[key].msg});
                }
            }
        } else {
            const { success, error } = await fetchData(elseltApi.post(cdata))
            if(success) {
                reset()
                getDatas()
                addModalHandler()
            }
            else {
                /** Алдааны мессеж */
                for (let key in error) {
                    setError(error[key].field, { type: 'custom', message: error[key].msg});
                }
            }
        }
    }

    useEffect(() => {

        /**
         * Edit Бүртгэх хоёр нь эндээсээ хийгдчихвэл амар байх дөө.
         */
        var editz = addModalData?.health_up_user_data
        var keyz = editz ? Object.keys(editz) : []

        if(editz && keyz.length > 0) {
            if(editz === null) return
            for(let key in editz) {
                if(editz[key] !== null)
                    setValue(key, editz[key])
                else setValue(key,'')
            }
        }
    }, [])

    return (
        <Modal
            isOpen={addModal}
            toggle={addModalHandler}
            centered
            backdrop='static'
        >
            <ModalHeader toggle={addModalHandler}>
                Үзлэгийн хариу
            </ModalHeader>
            <ModalBody>
                <div style={{ minHeight: 550 }}>
                    {
                        isLoading && Loader
                    }
                    {
                        addModalData ?
                            <Form className='d-flex flex-column' style={{ minHeight: 550 }} onSubmit={handleSubmit(onSubmit)}>
                                <div style={{ flex: 1 }}>
                                    <div className='m-50'>
                                        <Label>
                                            Элсэгч
                                        </Label>
                                        <div style={{ fontWeight: 700, fontSize: 18 }}>
                                            <span>
                                            {
                                                addModalData?.full_name + `   `
                                            }
                                            </span>
                                            <span>
                                            {
                                                addModalData?.user?.register
                                            }
                                            </span>
                                        </div>
                                    </div>
                                    <div className='m-50'>
                                        <Label className='form-label' for='turnik'>
                                            Савлуурт суниах
                                        </Label>
                                        <Controller
                                            defaultValue=''
                                            control={control}
                                            id='turnik'
                                            name='turnik'
                                            render={({ field }) => (
                                                <Input
                                                    {...field}
                                                    type='number'
                                                    name='turnik'
                                                    id='turnik'
                                                    placeholder='Савлуурт суниах'
                                                    bsSize='sm'
                                                    invalid={errors.turnik}
                                                >
                                                </Input>
                                            )}
                                            />
                                        {errors.turnik && <FormFeedback className='d-block'>{errors.turnik.message}</FormFeedback>}
                                    </div>
                                    <div className='m-50'>
                                        <Label className='form-label' for='belly_draught'>
                                            Гэдэсний таталт
                                        </Label>
                                        <Controller
                                            defaultValue=''
                                            control={control}
                                            id='belly_draught'
                                            name='belly_draught'
                                            render={({ field }) => (
                                                <Input
                                                    {...field}
                                                    type='number'
                                                    name='belly_draught'
                                                    id='belly_draught'
                                                    placeholder='Гэдэсний таталт'
                                                    bsSize='sm'
                                                    invalid={errors.belly_draught && true}
                                                >
                                                </Input>
                                            )}
                                            />
                                        {errors.belly_draught && <FormFeedback className='d-block'>{errors.belly_draught.message}</FormFeedback>}
                                    </div>
                                    <div className='m-50'>
                                        <Label className='form-label' for='patience_1000m'>
                                            Тэсвэр 1000м
                                        </Label>
                                        <Controller
                                            defaultValue=''
                                            control={control}
                                            id='patience_1000m'
                                            name='patience_1000m'
                                            render={({ field }) => (
                                                <Input
                                                    {...field}
                                                    type='number'
                                                    name='patience_1000m'
                                                    id='patience_1000m'
                                                    placeholder='Тэсвэр 1000м'
                                                    bsSize='sm'
                                                    invalid={errors.patience_1000m && true}
                                                >
                                                </Input>
                                            )}
                                            />
                                        {errors.patience_1000m && <FormFeedback className='d-block'>{errors.patience_1000m.message}</FormFeedback>}
                                    </div>
                                    <div className='m-50'>
                                        <Label className='form-label' for='speed_100m'>
                                            Хурд 100м
                                        </Label>
                                        <Controller
                                            defaultValue=''
                                            control={control}
                                            id='speed_100m'
                                            name='speed_100m'
                                            render={({ field }) => (
                                                <Input
                                                    {...field}
                                                    type='number'
                                                    name='speed_100m'
                                                    id='speed_100m'
                                                    placeholder='Хурд 100м'
                                                    bsSize='sm'
                                                    invalid={errors.speed_100m && true}
                                                >
                                                </Input>
                                            )}
                                            />
                                        {errors.speed_100m && <FormFeedback className='d-block'>{errors.speed_100m.message}</FormFeedback>}
                                    </div>
                                    <div className='m-50'>
                                        <Label className='form-label' for='quickness'>
                                            Авхаалж самбаа
                                        </Label>
                                        <Controller
                                            defaultValue=''
                                            control={control}
                                            id='quickness'
                                            name='quickness'
                                            render={({ field }) => (
                                                <Input
                                                    {...field}
                                                    type='number'
                                                    name='quickness'
                                                    id='quickness'
                                                    placeholder='Авхаалж самбаа'
                                                    bsSize='sm'
                                                    invalid={errors.quickness && true}
                                                >
                                                </Input>
                                            )}
                                            />
                                        {errors.quickness && <FormFeedback className='d-block'>{errors.quickness.message}</FormFeedback>}
                                    </div>
                                    <div className='m-50'>
                                        <Label className='form-label' for='flexible'>
                                            Уян хатан
                                        </Label>
                                        <Controller
                                            defaultValue=''
                                            control={control}
                                            id='flexible'
                                            name='flexible'
                                            render={({ field }) => (
                                                <Input
                                                    {...field}
                                                    type='number'
                                                    name='flexible'
                                                    id='flexible'
                                                    placeholder='Уян хатан'
                                                    bsSize='sm'
                                                    invalid={errors.flexible && true}
                                                >
                                                </Input>
                                            )}
                                            />
                                        {errors.flexible && <FormFeedback className='d-block'>{errors.flexible.message}</FormFeedback>}
                                    </div>
                                    <div className='m-50'>
                                        <Label className='form-label' for='total_score'>
                                            Нийт оноо
                                        </Label>
                                        <Controller
                                            defaultValue=''
                                            control={control}
                                            id='total_score'
                                            name='total_score'
                                            render={({ field }) => (
                                                <Input
                                                    {...field}
                                                    type='number'
                                                    name='total_score'
                                                    id='total_score'
                                                    placeholder='Нийт оноо'
                                                    bsSize='sm'
                                                    invalid={errors.total_score && true}
                                                >
                                                </Input>
                                            )}
                                            />
                                        {errors.total_score && <FormFeedback className='d-block'>{errors.total_score.message}</FormFeedback>}
                                    </div>
                                    <div className='m-50'>
                                        <Label className='form-label' for='description'>
                                            Тайлбар
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
                                                    placeholder='Тайлбар'
                                                    style={{ minHeight: 100 }}
                                                    bsSize='sm'
                                                    invalid={errors.description && true}
                                                >
                                                </Input>
                                            )}
                                            />
                                        {errors.description && <FormFeedback className='d-block'>{errors.description.message}</FormFeedback>}
                                    </div>
                                    <div className='m-50'>
                                        <Label className='form-label' for='state'>
                                            Төлөв
                                        </Label>
                                        <Controller
                                            defaultValue=''
                                            control={control}
                                            id='state'
                                            name='state'
                                            render={({ field: { value, onChange } }) => (
                                                <Select
                                                    name="state"
                                                    id="state"
                                                    classNamePrefix='select'
                                                    isClearable
                                                    className={classnames('react-select', {'is-invalid': errors.state})}
                                                    placeholder='-- Сонгоно уу --'
                                                    options={STATE_LIST || []}
                                                    value={STATE_LIST.find((c) => c.id === value)}
                                                    noOptionsMessage={() => 'Хоосон байна'}
                                                    onChange={(val) => {
                                                        onChange(val?.id || '')
                                                    }}
                                                    styles={ReactSelectStyles}
                                                    getOptionValue={(option) => option.id}
                                                    getOptionLabel={(option) => option.name}
                                                />
                                            )}
                                            />
                                        {errors.state && <FormFeedback className='d-block'>{errors.state.message}</FormFeedback>}
                                    </div>
                                </div>
                                <div className='m-50'>
                                    <Button type='submit' color='primary' disabled={isLoading}>
                                        Хадгалах
                                    </Button>
                                </div>
                            </Form>
                        :
                            <div></div>
                    }
                </div>
            </ModalBody>
        </Modal>
    )
}

export default AddModal
