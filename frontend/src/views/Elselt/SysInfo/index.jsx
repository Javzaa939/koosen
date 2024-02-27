import React, { useEffect, useState } from 'react'
import { Edit3, Mail, MapPin, Phone, PhoneCall, Smartphone, UploadCloud, X } from 'react-feather'
import { Controller, useForm } from 'react-hook-form'
import { Button, Card, CardBody, CardTitle, Col, Form, FormFeedback, Input, InputGroup, InputGroupText, Label, Row } from 'reactstrap'
import classnames from "classnames";

import {useDropzone} from 'react-dropzone'
import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';
import { validateSchema } from './validateSchema';
import { validate, convertDefaultValue } from '@utils'

import './style.scss'

function SysInfo() {

    const { control, handleSubmit, watch, setError, reset, setValue, formState: { errors } } = useForm(validate(validateSchema))

    const sysinfoApi = useApi().elselt.sysinfo

    const { Loader, isLoading, fetchData } = useLoader({ isFullScreen: true, bg:3 })
    const [datas, setDatas] = useState()
    const [admissionJuram, setAdmissionJuram] = useState('')
    const [admissionAdvice, setAdmissionAdvice] = useState('')

    async function getDatas() {
        const { success, data } = await fetchData(sysinfoApi.get())
        if(success) {

            setDatas(data)

            if(data.length == 0) return
            for(let key in data[0]) {
                if(data[0][key] !== null)
                    setValue(key, data[0][key])
                else setValue(key,'')
            }
        }
    }

    useEffect(() => {
        getDatas()
    }, [])

    async function onSubmit(data) {

        data = convertDefaultValue(data)

        if(!admissionJuram) {
            delete data['admission_juram']
        } else {
            data['admission_juram'] = admissionJuram
        }

        if(!admissionAdvice) {
            delete data['admission_advice']
        } else {
            data['admission_advice'] = admissionAdvice
        }

        const formData = new FormData()

        for (let key in data) {
            formData.append(key, data[key])
        }

        const id = 1

        const { success, errors } = await fetchData(sysinfoApi.put(datas, id, formData))
        if (success) {
            getDatas()
        }
    }

    return (
        <Card>
            {isLoading && Loader}
            <CardTitle className='p-1 pb-0'>
                <h4>
                    Элсэлтийн системийн мэдээлэл
                </h4>
            </CardTitle>
            <CardBody className='p-0 px-2 pb-1'>
                <Form onSubmit={handleSubmit(onSubmit)}>
                    <Row>
                        <Col className='py-1' sm={12} md={6}>
                            <h6>
                                Холбоо барих хэсэг
                            </h6>
                            <div className='form_elements_over'>
                                <Label className="mb-50">
                                    Байгууллагын и-мэйл
                                </Label>
                                <Controller
                                    id='email'
                                    name='email'
                                    control={control}
                                    defaultValue=''
                                    render={({ field: {onChange, value}  }) => (
                                        <InputGroup className={`input-group-merge  ${classnames({ 'is-invalid': errors.email })}`} >
                                            <InputGroupText>
                                                <Mail size={15} color={`${errors?.email ? 'red' : 'gray'}`}/>
                                            </InputGroupText>
                                            <Input
                                                name='email'
                                                value={value}
                                                id='email'
                                                type='email'
                                                invalid={errors.email && true}
                                                className={classnames({ 'is-invalid': errors.email })}
                                                onChange={(e) => {onChange(e.target.value|| '')}}
                                            />
                                        </InputGroup>
                                    )}
                                />
                                {errors.email && <FormFeedback className='d-block'>{errors.email.message}</FormFeedback>}
                            </div>
                            <div className='form_elements_over'>
                                <Label className="mb-50">
                                    Байгууллагын хаяг
                                </Label>
                                <Controller
                                    id='address'
                                    name='address'
                                    control={control}
                                    defaultValue=''
                                    render={({ field: {onChange, value}  }) => (
                                        <InputGroup className={`input-group-merge ${classnames({ 'is-invalid': errors.address })}`}>
                                            <InputGroupText>
                                                <MapPin size={15} color={`${errors?.address ? 'red' : 'gray'}`}/>
                                            </InputGroupText>
                                            <Input
                                                name='address'
                                                value={value}
                                                id='address'
                                                type='address'
                                                invalid={errors.address && true}
                                                className={classnames({ 'is-invalid': errors.address })}
                                                onChange={(e) => {onChange(e.target.value|| '')}}
                                            />
                                        </InputGroup>
                                    )}
                                />
                                {errors.address && <FormFeedback className='d-block'>{errors.address.message}</FormFeedback>}
                            </div>
                            <div className='form_elements_over'>
                                <Label className="mb-50">
                                    Жижүүрийн дугаар
                                </Label>
                                <Controller
                                    id='jijvvr_mobile'
                                    name='jijvvr_mobile'
                                    control={control}
                                    defaultValue=''
                                    render={({ field: {onChange, value}  }) => (
                                        <InputGroup className={`input-group-merge ${classnames({ 'is-invalid': errors.jijvvr_mobile })}`}>
                                            <InputGroupText>
                                                <PhoneCall size={15} color={`${errors?.jijvvr_mobile ? 'red' : 'gray'}`}/>
                                            </InputGroupText>
                                            <Input
                                                name='jijvvr_mobile'
                                                value={value}
                                                id='jijvvr_mobile'
                                                type='number'
                                                onChange={(e) => {onChange(e.target.value|| '')}}
                                                invalid={errors.jijvvr_mobile && true}
                                                className={classnames({ 'is-invalid': errors.jijvvr_mobile })}
                                            />
                                        </InputGroup>
                                    )}
                                />
                                {errors.jijvvr_mobile && <FormFeedback className='d-block'>{errors.jijvvr_mobile.message}</FormFeedback>}
                            </div>
                            <div className='form_elements_over'>
                                <Label className="mb-50">
                                    Байгууллагын дугаар
                                </Label>
                                <Controller
                                    id='mobile'
                                    name='mobile'
                                    control={control}
                                    defaultValue=''
                                    render={({ field: {onChange, value}  }) => (
                                        <InputGroup className={`input-group-merge ${classnames({ 'is-invalid': errors.mobile })}`}>
                                            <InputGroupText>
                                                <PhoneCall size={15} color={`${errors?.mobile ? 'red' : 'gray'}`}/>
                                            </InputGroupText>
                                            <Input
                                                name='mobile'
                                                value={value}
                                                id='mobile'
                                                type='number'
                                                onChange={(e) => {onChange(e.target.value|| '')}}
                                                invalid={errors.mobile && true}
                                                className={classnames({ 'is-invalid': errors.mobile })}
                                            />
                                        </InputGroup>
                                    )}
                                />
                                {errors.mobile && <FormFeedback className='d-block'>{errors.mobile.message}</FormFeedback>}
                            </div>
                            <div className='form_elements_over'>
                                <Label className="mb-50">
                                    Олон нийттэй харилцах хэсгийн дугаар
                                </Label>
                                <Controller
                                    id='contact_mobile'
                                    name='contact_mobile'
                                    control={control}
                                    defaultValue=''
                                    render={({ field: {onChange, value}  }) => (
                                        <InputGroup className={`input-group-merge ${classnames({ 'is-invalid': errors.contact_mobile })}`}>
                                            <InputGroupText>
                                                <Smartphone size={15} color={`${errors?.contact_mobile ? 'red' : 'gray'}`}/>
                                            </InputGroupText>
                                            <Input
                                                name='contact_mobile'
                                                value={value}
                                                id='contact_mobile'
                                                type='number'
                                                onChange={(e) => {onChange(e.target.value|| '')}}
                                                invalid={errors.contact_mobile && true}
                                                className={classnames({ 'is-invalid': errors.contact_mobile })}
                                            />
                                        </InputGroup>
                                    )}
                                />
                                {errors.contact_mobile && <FormFeedback className='d-block'>{errors.contact_mobile.message}</FormFeedback>}
                            </div>
                        </Col>
                        <Col className='py-1' sm={12} md={6}>
                            <h6>
                                Ерөнхий мэдээлэл
                            </h6>
                            <div className='form_elements_over'>
                                <Label className="mb-50">
                                    Элсэлтийн журам
                                </Label>
                                <Controller
                                    id='admission_juram'
                                    name='admission_juram'
                                    control={control}
                                    defaultValue=''
                                    render={({ field: {onChange, value}  }) => {
                                        return (
                                            <div className="dropzone-container">
                                                <input
                                                    id='admission_juram'
                                                    name='admission_juram'
                                                    multiple={false}
                                                    type='file'
                                                    // value={value}
                                                    className='d-none'
                                                    accept="application/pdf"
                                                    placeholder='test'
                                                    onChange={(e) => {
                                                        onChange(e.target.files?.[0] ?? null)
                                                        setAdmissionJuram(e.target.files?.[0] ?? null)
                                                        console.log(e.target.files?.[0] ?? null,'llll')
                                                    }}
                                                    onError={() => {'aldaa'}}

                                                />
                                                <Label className={`${value ? 'border-success' : 'border'} rounded-3 ${classnames({ 'is-invalid': errors.admission_juram })}`} htmlFor='admission_juram'>
                                                    <div>
                                                        <div className='mt-2 mb-1 d-flex flex-column align-items-center justify-content-center'>
                                                            <UploadCloud color={`${errors.admission_juram ? '#c72e2e' : 'gray'}`} size={60}/>
                                                            <span className={`mx-1 px-1 ${errors.admission_juram ? 'text-danger' : ''}`} style={{ fontSize: 12 }}>
                                                                Файл оруулна уу. Зөвхөн .pdf файл хүлээж авна
                                                            </span>
                                                        </div>
                                                        {/* <div className='p-1'>
                                                            Файл
                                                        </div> */}
                                                    </div>
                                                    <div>
                                                        {
                                                            value ?
                                                            <div className='p-50 d-flex justify-content-between file_style'>
                                                                <div className='text-truncate'>
                                                                {/* <div className='text-truncate' style={{ maxWidth: '400px', minWidth: '250px' }}> */}
                                                                    {typeof value == 'string' ? value.split(`/`)[value.split('/').length - 1] : value?.name
                                                                        // value.length > 30 ?
                                                                        // `${value.substring(0, 27)}...${value.substring(value.length - 4)}` :
                                                                        // value
                                                                    }
                                                                    {/* {value.length > 30 ?
                                                                        `${value.substring(0, 27)}...${value.substring(value.length - 4)}` :
                                                                        value
                                                                    } */}
                                                                </div>
                                                                <div>
                                                                    <X onClick={(e) => {e.preventDefault(), onChange(null)}} size={16} role='button'/>
                                                                </div>
                                                            </div>
                                                        :
                                                            <div>
                                                            </div>
                                                        }
                                                    </div>
                                                </Label>
                                            </div>
                                        )
                                    }}
                                />
                            </div>
                            <div className='form_elements_over'>
                                <Label className="mb-50">
                                    Элсэгчдэд зориулсан зөвлөмж
                                </Label>
                                <Controller
                                    id='admission_advice'
                                    name='admission_advice'
                                    control={control}
                                    defaultValue=''
                                    render={({ field: {onChange, value}  }) => (
                                        <div className="dropzone-container">
                                            <input
                                                id='admission_advice'
                                                name='admission_advice'
                                                multiple={false}
                                                // type='file'
                                                // {...getInputProps()}
                                                type='file'
                                                // value={value}
                                                className='d-none'
                                                accept="application/pdf"
                                                placeholder='test'
                                                onChange={(e) => {
                                                    setAdmissionAdvice(e.target.files?.[0] ?? null)
                                                    onChange(e.target.files?.[0] ?? null)
                                                }
                                                }
                                                onError={() => {'aldaa'}}

                                            />
                                            <Label className={`${value ? 'border-success' : 'border'} rounded-3 ${classnames({ 'is-invalid': errors.admission_advice })}`} htmlFor='admission_advice'>
                                                <div>
                                                    <div className='mt-2 mb-1 d-flex flex-column align-items-center justify-content-center'>
                                                        <UploadCloud color={`${errors.admission_advice ? '#c72e2e' : 'gray'}`} size={60}/>
                                                        <span className={`mx-1 px-1 ${errors.admission_advice ? 'text-danger' : ''}`} style={{ fontSize: 12 }}>
                                                            Файл оруулна уу. Зөвхөн .pdf файл хүлээж авна
                                                        </span>
                                                    </div>
                                                    {/* <div className='p-1'>
                                                        Файл
                                                    </div> */}
                                                </div>
                                                <div>
                                                    {
                                                        value ?
                                                        <div className='p-50 d-flex justify-content-between file_style'>
                                                            <div className='text-truncate'>
                                                            {/* <div className='text-truncate' style={{ maxWidth: '400px', minWidth: '250px' }}> */}
                                                                {/* {value} */}
                                                                    {typeof value == 'string' ? value.split(`/`)[value.split('/').length - 1] : value?.name}
                                                                {/* {value.length > 30 ?
                                                                    `${value.substring(0, 27)}...${value.substring(value.length - 4)}` :
                                                                    value
                                                                } */}
                                                            </div>
                                                            <div>
                                                                <X onClick={(e) => {e.preventDefault(), onChange(null)}} size={16} role='button'/>
                                                            </div>
                                                        </div>
                                                    :
                                                        <div>
                                                        </div>
                                                    }
                                                </div>
                                            </Label>
                                        </div>
                                    )}
                                />
                            </div>
                            <div className='form_elements_over'>
                                <Label className="mb-50">
                                    Нүүр хуудасны харуулах тайлбар
                                </Label>
                                <Controller
                                    id='home_description'
                                    name='home_description'
                                    control={control}
                                    defaultValue=''
                                    render={({ field: {onChange, value}  }) => (
                                        <InputGroup className={`input-group-merge ${classnames({ 'is-invalid': errors.home_description })}`}>
                                            <InputGroupText>
                                                <Edit3 size={15} color={`${errors?.email ? 'red' : 'gray'}`}/>
                                            </InputGroupText>
                                            <Input
                                                name='home_description'
                                                value={value}
                                                id='home_description'
                                                style={{ minHeight: '100px' }}
                                                type='text'
                                                onChange={(e) => {onChange(e.target.value|| '')}}
                                                invalid={errors.home_description && true}
                                                className={classnames({ 'is-invalid': errors.home_description })}
                                            />
                                        </InputGroup>
                                    )}
                                />
                                {errors.home_description && <FormFeedback className='d-block'>{errors.home_description.message}</FormFeedback>}
                            </div>
                        </Col>
                    </Row>
                    <div className='d-flex justify-content-center mt-3'>
                        <Button color='primary' type='submit' disabled={isLoading}>
                            Хадгалах
                        </Button>
                    </div>
                </Form>
            </CardBody>
        </Card>
    )
}

export default SysInfo
