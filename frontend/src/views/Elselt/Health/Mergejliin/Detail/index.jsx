import React, { useState} from 'react'
import { Col, Modal, ModalBody, ModalHeader, Row, Label, Button, Form, FormFeedback } from 'reactstrap'
import { Controller, useForm } from 'react-hook-form'

import Select from 'react-select'
import classnames from 'classnames'
import { ReactSelectStyles, validate } from '@utils'
import useLoader from '@hooks/useLoader';
import useApi from '@hooks/useApi';
import { validateSchema } from './validateSchema'

function Detail({ detail, detailHandler, detailData, getDatas }) {

    const datas = detailData?.health_up_user_data
	const { isLoading, fetchData } = useLoader({ isFullScreen: true, bg: 3 });

    const { control, handleSubmit, formState: { errors }, reset, resetField, setValue, setError } = useForm(validate(validateSchema));

    const STATE_LIST = [
        {
            name: 'Хүлээгдэж буй',
            id: 1
        },
        {
            name: 'Тэнцсэн',
            id: 2
            },
        {
            name: 'Тэнцээгүй',
            id: 3
            },
        ]
    const[ stateId, setStateId] = useState('')

    const elseltApi = useApi().elselt.health.professional
    async function onSubmit(cdata) {
        cdata['user'] = datas?.user
        cdata['state'] = stateId

        if(datas) {
            const { success, error } = await fetchData(elseltApi.put(datas?.id, cdata))
            if(success) {
                reset()
                getDatas()
                detailHandler()
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
        <Modal
            isOpen={detail}
            toggle={detailHandler}
            centered
            size='lg'
        >
            <ModalHeader toggle={detailHandler}>
                <h4 title='modal-title'>
                    Элсэгчийн нарийн мэргэжлийн шатны эрүүл мэндийн үзлэгийн мэдээлэл
                </h4>
            </ModalHeader>
            <ModalBody>
                {
                datas
                &&
                    <Form tag={Form} onSubmit={handleSubmit(onSubmit)}>
                        <div className='border p-1 m-1 rounded-3' style={{ minHeight: 50 }}>
                            <Label className='form-label' for='state'>
                                Төлөв
                            </Label>
                            <Controller
                                defaultValue={datas?.state}
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
                                            setStateId(val?.id || '')
                                            onChange(val?.id || '')
                                        }}
                                        styles={ReactSelectStyles}
                                        getOptionValue={(option) => option.id}
                                        getOptionLabel={(option) => option.name}
                                    />
                                )}
                                />
                                {errors.state && <FormFeedback className='d-block'>{errors.state.message}</FormFeedback>}
                                {
                                    datas && stateId ?
                                    <div className='m-50 text-center'>
                                        <Button type='submit' color='primary' disabled={isLoading}>
                                            Хадгалах
                                        </Button>
                                    </div>
                                    : ''

                                }
                        </div>
                    </Form>
                }
                <Row>
                    <Col md={6}>
                        <div>
                            <div className='border p-1 m-1 rounded-3' style={{ minHeight: 50 }}>
                                <div className='fw-bolder text-uppercase'>
                                    Дотор
                                </div>
                                <div>
                                    {datas?.belly || ''}
                                </div>
                            </div>
                            <div className='border p-1 m-1 rounded-3' style={{ minHeight: 50 }}>
                                <div className='fw-bolder text-uppercase'>
                                    Мэдрэл
                                </div>
                                <div>
                                    {datas?.nerve || ''}
                                </div>
                            </div>
                            <div className='border p-1 m-1 rounded-3' style={{ minHeight: 50 }}>
                                <div className='fw-bolder text-uppercase'>
                                    Мэс засал
                                </div>
                                <div>
                                    {datas?.surgery || ''}
                                </div>
                            </div>
                            <div className='border p-1 m-1 rounded-3' style={{ minHeight: 50 }}>
                                <div className='fw-bolder text-uppercase'>
                                    Эмэгтэйчүүд
                                </div>
                                <div>
                                    {datas?.femini || ''}
                                </div>
                            </div>
                            <div className='border p-1 m-1 rounded-3' style={{ minHeight: 50 }}>
                                <div className='fw-bolder text-uppercase'>
                                    Халдварт өвчин
                                </div>
                                <div>
                                    {datas?.contagious || ''}
                                </div>
                            </div>
                            <div className='border p-1 m-1 rounded-3' style={{ minHeight: 50 }}>
                                <div className='fw-bolder text-uppercase'>
                                    Сэтгэц мэдрэл
                                </div>
                                <div>
                                    {datas?.neuro_phychic || ''}
                                </div>
                            </div>
                            <div className='border p-1 m-1 rounded-3' style={{ minHeight: 50 }}>
                                <div className='fw-bolder text-uppercase'>
                                    Гэмтэл
                                </div>
                                <div>
                                    {datas?.injury || ''}
                                </div>
                            </div>
                        </div>
                    </Col>
                    <Col md={6} sm={6}>
                        <div>
                            <div className='border p-1 m-1 rounded-3' style={{ minHeight: 50 }}>
                                <div className='fw-bolder text-uppercase'>
                                    Чих хамар хоолой
                                </div>
                                <div>
                                    {datas?.ear_nose || ''}
                                </div>
                            </div>
                            <div className='border p-1 m-1 rounded-3' style={{ minHeight: 50 }}>
                                <div className='fw-bolder text-uppercase'>
                                    Нүд
                                </div>
                                <div>
                                    {datas?.eye || ''}
                                </div>
                            </div>
                            <div className='border p-1 m-1 rounded-3' style={{ minHeight: 50 }}>
                                <div className='fw-bolder text-uppercase'>
                                    Шүд
                                </div>
                                <div>
                                    {datas?.teeth || ''}
                                </div>
                            </div>
                            <div className='border p-1 m-1 rounded-3' style={{ minHeight: 50 }}>
                                <div className='fw-bolder text-uppercase'>
                                    Зүрх судас
                                </div>
                                <div>
                                    {datas?.heart || ''}
                                </div>
                            </div>
                            <div className='border p-1 m-1 rounded-3' style={{ minHeight: 50 }}>
                                <div className='fw-bolder text-uppercase'>
                                    Сүрьеэ
                                </div>
                                <div>
                                    {datas?.ear_nose || ''}
                                </div>
                            </div>
                            <div className='border p-1 m-1 rounded-3' style={{ minHeight: 50 }}>
                                <div className='fw-bolder text-uppercase'>
                                    Арьс харшил
                                </div>
                                <div>
                                    {datas?.allergies || ''}
                                </div>
                            </div>
                            <div className='border p-1 m-1 rounded-3' style={{ minHeight: 50 }}>
                                <div className='fw-bolder text-uppercase'>
                                    БЗДХ
                                </div>
                                <div>
                                    {datas?.bzdx || ''}
                                </div>
                            </div>
                        </div>
                    </Col>
                </Row>
                <div className='border p-1 m-1 rounded-3' style={{ minHeight: 50 }}>
                    <div className='fw-bolder text-uppercase'>
                        Дүгнэлт
                    </div>
                    <div>
                        {datas?.description || ''}
                    </div>
                </div>
            </ModalBody>
        </Modal>
    )
}

export default Detail
