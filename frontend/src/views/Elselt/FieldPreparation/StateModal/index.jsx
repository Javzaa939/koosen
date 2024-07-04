import React, { Fragment, useState, useEffect, useContext } from 'react'

import { Controller, useForm } from 'react-hook-form'

import Select from 'react-select'

import { convertDefaultValue, validate, ReactSelectStyles } from '@utils'

import { Modal, Row, Col, Label, ModalHeader, ModalBody, Form, Input, Button, FormFeedback, Spinner} from 'reactstrap'

import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';
import classnames from 'classnames'
import * as Yup from 'yup'

export const validateSchema = Yup.object().shape({
    state: Yup.string()
        .trim()
        .required('Хоосон байна'),
});


function AddModal({ addModal, addModalHandler, addModalData, getDatas, stateop }) {

    const { control, handleSubmit, formState: { errors }, reset, resetField, setValue, setError } = useForm(validate(validateSchema));

	const { Loader, isLoading, fetchData } = useLoader({ isFullScreen: true, bg: 3 });
	const elseltApi = useApi().elselt.preparation
    async function onSubmit(cdata) {
        cdata['user'] = addModalData?.user?.id

        if(addModalData?.army_data) {
            const { success, error } = await fetchData(elseltApi.put(addModalData?.army_data?.id, cdata))
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
            var data = convertDefaultValue(cdata)
            const { success, error } = await fetchData(elseltApi.post(data))
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
        var editz = addModalData?.army_data
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
                Үзлэгийн төлөв
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
                                                addModalData?.user?.last_name + `   ` + addModalData?.user?.first_name + `   `
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
                                                    options={stateop || []}
                                                    value={stateop.find((c) => c.id === value)}
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
