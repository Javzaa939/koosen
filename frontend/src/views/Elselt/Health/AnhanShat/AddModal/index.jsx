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

function AddModal({ addModal, addModalHandler, addModalData }) {

    const { control, handleSubmit, formState: { errors }, reset, resetField, setError } = useForm(validate(validateSchema));

    const STATE_LIST = [
        {
            id: 1,
            name: 'Зөвшөөрөв'
        },
        {
            id: 2,
            name: 'Татгалзав'
        },
        {
            id: 3,
            name: 'Түдгэлзүүлэв'
        }
    ]

	const { Loader, isLoading, fetchData } = useLoader({ isFullScreen: false });
	const elseltApi = useApi().elselt.health.anhan

    async function onSubmit(cdata) {
        cdata['user'] = addModalData?.user
        console.log(cdata)

        if(addModalData?.health_user_data) {
            console.log('put')
        } else {
            const { success, error } = await fetchData(elseltApi.post(cdata))
            if(success) {
                reset()
                console.log('boloo2')
                // refreshDatas()
                // handleModal()
            }
            else {
                console.log('errooooor')
                /** Алдааны мессеж */
                for (let key in error) {
                    setError(error[key].field, { type: 'custom', message: error[key].msg});
                }
            }
        }

    }

    console.log(addModalData)

    return (
        <Modal
            isOpen={addModal}
            toggle={addModalHandler}
            centered
        >
            <ModalHeader toggle={addModalHandler}>
                Үзлэгийн хариу
            </ModalHeader>
            <ModalBody>
                <div style={{ minHeight: 550 }}>
                    {
                        addModalData ?
                            <Form className='d-flex flex-column' style={{ minHeight: 550 }} onSubmit={handleSubmit(onSubmit)}>
                                <div style={{ flex: 1 }}>
                                    <div className='m-50'>
                                        <Label>
                                            Оюутан
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
                                        <Label className='form-label' for='height'>
                                            Өндөр / см
                                        </Label>
                                        <Controller
                                            defaultValue=''
                                            control={control}
                                            id='height'
                                            name='height'
                                            render={({ field }) => (
                                                <Input
                                                    {...field}
                                                    type='number'
                                                    name='height'
                                                    id='height'
                                                    placeholder='Өндөр'
                                                    bsSize='sm'
                                                    invalid={errors.name && true}
                                                >
                                                </Input>
                                            )}
                                            />
                                        {errors.height && <FormFeedback className='d-block'>{errors.height.message}</FormFeedback>}
                                    </div>
                                    <div className='m-50'>
                                        <Label className='form-label' for='weight'>
                                            Жин / кг
                                        </Label>
                                        <Controller
                                            defaultValue=''
                                            control={control}
                                            id='weight'
                                            name='weight'
                                            render={({ field }) => (
                                                <Input
                                                    {...field}
                                                    type='number'
                                                    name='weight'
                                                    id='weight'
                                                    placeholder='Жин'
                                                    bsSize='sm'
                                                    invalid={errors.name && true}
                                                >
                                                </Input>
                                            )}
                                            />
                                        {errors.weight && <FormFeedback className='d-block'>{errors.weight.message}</FormFeedback>}
                                    </div>
                                    <div className='m-50'>
                                        <Controller
                                            defaultValue=''
                                            control={control}
                                            id='is_chalk'
                                            name='is_chalk'
                                            render={({field}) => (
                                                <Input
                                                    {...field}
                                                    name='is_chalk'
                                                    id='is_chalk'
                                                    type='checkbox'
                                                    className='me-50'
                                                    checked={field.value}
                                                    invalid={errors.name && true}
                                                >
                                                </Input>
                                            )}
                                        />
                                        <Label className='form-label' for='is_chalk'>
                                            Шарх сорвитой эсэх
                                        </Label>
                                        {errors.is_chalk && <FormFeedback className='d-block'>{errors.is_chalk.message}</FormFeedback>}
                                    </div>
                                    <div className='m-50'>
                                        <Controller
                                            defaultValue=''
                                            control={control}
                                            id='is_tattoo'
                                            name='is_tattoo'
                                            render={({field}) => (
                                                <Input
                                                    {...field}
                                                    name='is_tattoo'
                                                    id='is_tattoo'
                                                    type='checkbox'
                                                    className='me-50'
                                                    checked={field.value}
                                                    invalid={errors.name && true}
                                                >
                                                </Input>
                                            )}
                                        />
                                        <Label className='form-label' for='is_tattoo'>
                                            Шивээстэй эсэх
                                        </Label>
                                        {errors.is_tattoo && <FormFeedback className='d-block'>{errors.is_tattoo.message}</FormFeedback>}
                                    </div>
                                    <div className='m-50 d-flex'>
                                        <Controller
                                            defaultValue=''
                                            control={control}
                                            id='is_drug'
                                            name='is_drug'
                                            render={({field}) => (
                                                <Input
                                                    {...field}
                                                    name='is_drug'
                                                    id='is_drug'
                                                    type='checkbox'
                                                    className='me-50'
                                                    checked={field.value}
                                                    invalid={errors.name && true}
                                                >
                                                </Input>
                                            )}
                                        />
                                        <Label className='form-label' for='is_drug'>
                                            Мансууруулах эм, сэтгэцэд нөлөөт бодисын хамаарлын шинжилгээ
                                        </Label>
                                        {errors.is_drug && <FormFeedback className='d-block'>{errors.is_drug.message}</FormFeedback>}
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
                                                    invalid={errors.name && true}
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
                                    <Button type='submit' color='primary'>
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
