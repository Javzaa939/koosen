import React, { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import Select from 'react-select'

import { ReactSelectStyles } from '@utils'
import { Modal, Label, ModalHeader, ModalBody, Form, Input, Button, FormFeedback } from 'reactstrap'

import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';
import classnames from 'classnames'

function StateOneModal({ addModal, addModalHandler, addModalData, getDatas,  closeStateModal}) {

    var stateop = [
        {
            'id': 1,
            'name': 'БҮРТГҮҮЛСЭН'
        },
        {
            'id': 2,
            'name': 'ТЭНЦСЭН'
        },
        {
            'id': 3,
            'name': 'ТЭНЦЭЭГҮЙ'
        }
    ]
    const { control, handleSubmit, formState: { errors }, reset, setValue, setError } = useForm();

    const { Loader, isLoading, fetchData } = useLoader({ isFullScreen: true, bg: 3 });
    const elseltApi = useApi().elselt

    async function onSubmit(cdata) {
        cdata['user'] = addModalData?.user?.id

        if (addModalData?.user) {
            const { success, error } = await fetchData(elseltApi.putFirst(addModalData?.user?.id, cdata))
            if (success) {
                reset()
                getDatas()
                closeStateModal()
            }
            else {
                for (let key in error) {
                    setError(error[key].field, { type: 'custom', message: error[key].msg });
                }
            }
        }
    }

    useEffect(() => {
        for(let key in addModalData) {
            if (key === 'first_state') {
                setValue('first_state', addModalData[key])
            }
            if (key === 'first_description') {
                setValue('first_description', addModalData[key])
            }
        }
    }, [addModalData])

    return (
        <Modal
            isOpen={addModal}
            toggle={closeStateModal}
            centered
            backdrop='static'
        >
            <ModalHeader toggle={closeStateModal}>
                Анхан мэдээллийн төлөв солих
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
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div className='m-50'>
                                        <Label className='form-label' for='first_state'>
                                            Төлөв
                                        </Label>
                                        <Controller
                                            defaultValue=''
                                            control={control}
                                            id='first_state'
                                            name='first_state'
                                            render={({ field: { value, onChange } }) => (
                                                <Select
                                                    name="first_state"
                                                    id="first_state"
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
                                        {errors.first_state && <FormFeedback className='d-block'>{errors.first_state.message}</FormFeedback>}
                                    </div>
                                    <div className='m-50'>
                                        <Label className='form-label' for='first_description'>
                                            Тайлбар
                                        </Label>
                                        <Controller
                                            defaultValue=''
                                            control={control}
                                            id='first_description'
                                            name='first_description'
                                            render={({ field }) => (
                                                <Input
                                                    {...field}
                                                    type='textarea'
                                                    name='first_description'
                                                    id='first_description'
                                                    placeholder='Тайлбар'
                                                    style={{ minHeight: 100 }}
                                                    bsSize='sm'
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

export default StateOneModal
