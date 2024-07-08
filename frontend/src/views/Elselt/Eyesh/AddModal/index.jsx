import React, { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import Select from 'react-select'

import { convertDefaultValue, validate, ReactSelectStyles } from '@utils'
import { Modal, Label, ModalHeader, ModalBody, Form, Input, Button, FormFeedback } from 'reactstrap'

import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';
import classnames from 'classnames'

import { validateSchema } from './validateSchema'

function AddModal({ addModal, addModalHandler, addModalData, getDatas, stateop }) {
    const { control, handleSubmit, formState: { errors }, reset, resetField, setValue, setError } = useForm(validate(validateSchema));

    const { Loader, isLoading, fetchData } = useLoader({ isFullScreen: true, bg: 3 });
    const elseltApi = useApi().elselt.eyesh_order

    async function onSubmit(cdata) {
        cdata['user'] = addModalData?.user

        if (addModalData?.user) {
            const { success, error } = await fetchData(elseltApi.put(addModalData?.user?.id, cdata))
            if (success) {
                reset()
                getDatas()
                addModalHandler()
            }
            else {
                for (let key in error) {
                    setError(error[key].field, { type: 'custom', message: error[key].msg });
                }
            }
        }
    }

    useEffect(() => {
        var editz = addModalData?.user
        var keyz = editz ? Object.keys(editz) : []

        if (editz && keyz.length > 0) {
            if (editz === null) return
            for (let key in editz) {
                if (editz[key] !== null)
                    setValue(key, editz[key])
                else setValue(key, '')
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
                <div style={{ minHeight: 300 }}>
                    {
                        isLoading && Loader
                    }
                    {
                        addModalData ?
                            <Form className='d-flex flex-column' style={{ minHeight: 300 }} onSubmit={handleSubmit(onSubmit)}>
                                <div style={{ flex: 1 }}>
                                    <div className='m-50'>
                                        <Label className='form-label' for='yesh_state'>
                                            Төлөв
                                        </Label>
                                        <Controller
                                            defaultValue=''
                                            control={control}
                                            id='yesh_state'
                                            name='yesh_state'
                                            render={({ field: { value, onChange } }) => (
                                                <Select
                                                    name="yesh_state"
                                                    id="yesh_state"
                                                    classNamePrefix='select'
                                                    isClearable
                                                    className={classnames('react-select')}
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
                                        {errors.yesh_state && <FormFeedback className='d-block'>{errors.yesh_state.message}</FormFeedback>}
                                    </div>
                                    <div className='m-50'>
                                        <Label className='form-label' for='yesh_description'>
                                            Тайлбар
                                        </Label>
                                        <Controller
                                            defaultValue=''
                                            control={control}
                                            id='yesh_description'
                                            name='yesh_description'
                                            render={({ field }) => (
                                                <Input
                                                    {...field}
                                                    type='textarea'
                                                    name='yesh_description'
                                                    id='yesh_description'
                                                    placeholder='Тайлбар'
                                                    style={{ minHeight: 100 }}
                                                    bsSize='sm'
                                                    // invalid={errors.yesh_description && true}
                                                >
                                                </Input>
                                            )}
                                        />
                                        {errors.description && <FormFeedback className='d-block'>{errors.description.message}</FormFeedback>}   
                                    </div>
                                </div>
                                <div className='m-50'>
                                    <Button type='submit' color='primary' disabled={isLoading} onClick={onSubmit}>
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
