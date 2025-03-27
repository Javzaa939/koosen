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

import { validateSchema } from './validateSchema';
import empty from "@src/assets/images/empty-image.jpg"

const Add = ({ isOpen, handleModal, refreshDatas }) => {

    var values = {
        lesson: '',
        teacher: '',
    }
    const { t } = useTranslation()

    const closeBtn = (
        <X className='cursor-pointer' size={15} onClick={handleModal} />
    )

    // ** Hook
    const { control, handleSubmit, formState: { errors }, reset, setError, watch } = useForm(validate(validateSchema));

    const { isLoading, fetchData } = useLoader({})

    const [selectWeekendIds, setWeekIds] = useState([])
    const [is_loading, setIsLoading] = useState(false)
    const [lesson_option, setLessonOption] = useState([])
    const [select_value, setSelectValue] = useState(values)
    const [selectedTeachers, setSelectedTeachers] = useState([])
    const [teacher_option, setTeacherOption] = useState([])
    const [featurefile, setFeaturedImg] = useState('')
    const [image_old, setImageOld] = useState('')

    const [is_valid, setValid] = useState(true)

    const handleDeleteImage = () => {
        setFeaturedImg('')
        setImageOld('')
    }

    const clickLogoImage = () => {
        console.log('click')
        var logoInput = document.getElementById(`image`)
        console.log('input,', logoInput)
        logoInput.click()
    }

    // Api
    const gymPaymentApi = useApi().order.gym

    const teacherApi = useApi().hrms.teacher
    const lessonApi = useApi().study.lessonStandart
    const remoteApi = useApi().remote

    // Хичээлийн жагсаалт
    async function getLessonOption() {
        const { success, data } = await fetchData(lessonApi.getExam())
        if (success) {
            setLessonOption(data)
        }
    }

    // Багшийн жагсаалт
    async function getTeachers() {
        const { success, data } = await fetchData(teacherApi.getTeacher(''))
        if (success) {
            setTeacherOption(data)
        }
    }

    useEffect(() => {
        getLessonOption();
        getTeachers()
    },[])

    async function onSubmit(cdata) {
        cdata = convertDefaultValue(cdata)

        const formData = new FormData()

        cdata['teacher'] = selectedTeachers.map((c) => c.id)
        for (let key in cdata) {
            formData.append(key, cdata[key])
        }
        formData.append('image', featurefile)

        setIsLoading(true)
        const { success, error } = await fetchData(remoteApi.post(formData))
        if(success) {
            // reset()
            // refreshDatas()
            // handleModal()
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

    const onChange = (e) => {
		const reader = new FileReader()
        const files = e.target.files
        if (files.length > 0) {
            setFeaturedImg(files[0])
            reader.onload = function () {
                setImageOld(reader.result)
            }
            reader.readAsDataURL(files[0])
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
                    <h5 className="modal-title">{t('Зайн сургалт үүсгэх')}</h5>
                </ModalHeader>
                <ModalBody className='flex-grow-1'>
                    <Row tag={Form} className='gy-1' onSubmit={handleSubmit(onSubmit)}>
                        <Col md={6}>
                            <Label className="form-label" for="lesson">
                                {t('Хичээл')}
                            </Label>
                            <Controller
                                control={control}
                                defaultValue=''
                                name="lesson"
                                render={({ field: { value, onChange } }) => {
                                    return (
                                        <Select
                                            name="lesson"
                                            id="lesson"
                                            classNamePrefix='select'
                                            isClearable
                                            className={classnames('react-select', { 'is-invalid': errors.lesson })}
                                            isLoading={isLoading}
                                            placeholder={t('-- Сонгоно уу --')}
                                            options={lesson_option || []}
                                            value={value && lesson_option.find((c) => c.id === value)}
                                            noOptionsMessage={() => t('Хоосон байна.')}
                                            onChange={(val) => {
                                                onChange(val?.id || '')
                                                setSelectValue({
                                                    lesson: val?.id || '',
                                                })
                                            }}
                                            styles={ReactSelectStyles}
                                            getOptionValue={(option) => option.id}
                                            getOptionLabel={(option) => option.name}
                                        />
                                    )
                                }}
                            ></Controller>
                            {errors.lesson && <FormFeedback className='d-block'>{t(errors.lesson.message)}</FormFeedback>}
                        </Col>
                        <Col md={6}>
                            <Label className="form-label" for="teacher">
                                {t('Хянах багш')}
                            </Label>
                            <Controller
                                control={control}
                                defaultValue=''
                                name="teacher"
                                render={({ field: { value, onChange } }) => {
                                    return (
                                        <Select
                                            name="teacher"
                                            id="teacher"
                                            classNamePrefix='select'
                                            isClearable
                                            isMulti
                                            className={classnames('react-select', { 'is-invalid': errors.teacher })}
                                            isLoading={isLoading}
                                            placeholder={t('-- Сонгоно уу --')}
                                            options={teacher_option || []}
                                            value={selectedTeachers}
                                            noOptionsMessage={() => t('Хоосон байна.')}
                                            onChange={(val) => {
                                                setSelectedTeachers(val)
                                            }}
                                            styles={ReactSelectStyles}
                                            getOptionValue={(option) => option.id}
                                            getOptionLabel={(option) => option.last_name + '.' + option?.first_name}
                                        />
                                    )
                                }}
                            ></Controller>
                            {errors.teacher && <FormFeedback className='d-block'>{t(errors.teacher.message)}</FormFeedback>}
                        </Col>
                        <Col md={12}>
                            <Label className='form-label' for='title'>
                                {t('Сургалтын нэр')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id='title'
                                name='title'
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        type='text'
                                        name='title'
                                        id='title'
                                        bsSize='sm'
                                        placeholder={t('Сургалтын нэр')}
                                        invalid={errors.name && true}
                                    />
                                )}
                            />
                            {errors.title && <FormFeedback className='d-block'>{t(errors.title.message)}</FormFeedback>}
                        </Col>
                        <Col md={12}>
                            <Controller
                                defaultValue={false}
                                control={control}
                                id='is_end_exam'
                                name='is_end_exam'
                                render={({ field }) => {
                                    return (
                                        <Input
                                            {...field}
                                            checked={field.value}
                                            className='me-50'
                                            type='checkbox'
                                            name='is_end_exam'
                                            id='is_end_exam'
                                        />
                                    )
                                }}
                            />
                            <Label className='form-label' for='is_end_exam'>
                                {t('Төгсөлтийн шалгалттай эсэх')}
                            </Label>
                        </Col>
                        <Col md={12}>
                            <Controller
                                defaultValue={false}
                                control={control}
                                id='is_certificate'
                                name='is_certificate'
                                render={({ field }) => {
                                    return (
                                        <Input
                                            {...field}
                                            checked={field.value}
                                            className='me-50'
                                            type='checkbox'
                                            name='is_certificate'
                                            id='is_certificate'
                                        />
                                    )
                                }}
                            />
                            <Label className='form-label' for='is_certificate'>
                                {t('Сертификат олгох эсэх')}
                            </Label>
                        </Col>
                        <Col md={6}>
                            <Label className="form-label" for="start_date">
                                {t('Хичээл эхлэх хугацаа')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id="start_date"
                                name="start_date"
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        id="start_date"
                                        bsSize="sm"
                                        placeholder={t('Хичээл эхлэх хугацаа')}
                                        type="date"
                                        invalid={errors.start_date && true}
                                    />
                                )}
                            />
                            {errors.start_date && <FormFeedback className='d-block'>{t(errors.start_date.message)}</FormFeedback>}
                        </Col>
                        <Col md={6}>
                            <Label className="form-label" for="end_date">
                                {t('Хичээл дуусах хугацаа')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id="end_date"
                                name="end_date"
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        id="end_date"
                                        bsSize="sm"
                                        placeholder={t('Хичээл дуусах хугацаа')}
                                        type="date"
                                        invalid={errors.end_date && true}
                                    />
                                )}
                            />
                            {errors.end_date && <FormFeedback className='d-block'>{t(errors.end_date.message)}</FormFeedback>}
                        </Col>
                        <Col md={12} className="mt-50">
                            <div className='row mt-1'>
                                <Label for='image'>Зураг</Label>
                                <div className="d-flex custom-flex">
                                    <div className="me-2">
                                        <div className='d-flex justify-content-end'>
                                            <X size={15} color='red' onClick={() => {handleDeleteImage(image_old)}}></X>
                                        </div>
                                        <div className="orgLogoDiv image-responsive">
                                            <img id={`logoImg${image_old}`} className="image-responsive w-100" src = { image_old ? image_old : empty  } onClick={() => {clickLogoImage()}}/>
                                            <input
                                                accept="image/*"
                                                type="file"
                                                // disabled={is_valid}
                                                id={`image`}
                                                name="image"
                                                className="form-control d-none image-responsive"
                                                onChange={(e) => onChange(e)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Col>
                        {/* <Col md={12}>
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
                        </Col> */}
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

export default Add

