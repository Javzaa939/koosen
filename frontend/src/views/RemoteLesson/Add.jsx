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

    const [is_loading, setIsLoading] = useState(false)
    const [lesson_option, setLessonOption] = useState([])
    const [select_value, setSelectValue] = useState(values)
    const [selectedTeachers, setSelectedTeachers] = useState([])
    const [teacher_option, setTeacherOption] = useState([])
    const [featurefile, setFeaturedImg] = useState('')
    const [image_old, setImageOld] = useState('')

    const handleDeleteImage = () => {
        setFeaturedImg('')
        setImageOld('')
    }

    const clickLogoImage = () => {
        var logoInput = document.getElementById(`image`)
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
    }, [])

    async function onSubmit(cdata) {
        cdata = convertDefaultValue(cdata)

        const formData = new FormData()

        // cdata['teacher'] = selectedTeachers?.id
        for (let key in cdata) {
            formData.append(key, cdata[key])
        }
        formData.append('image', featurefile)

        setIsLoading(true)
        const { success, errors } = await fetchData(remoteApi.post(formData))
        if (success) {
            // reset()
            refreshDatas()
            // handleModal()
            setIsLoading(false)
        }
        else {
            setIsLoading(false)
            /** Алдааны мессеж */
            for (let key in errors) {
                setError(key, { type: 'custom', message: errors[key][0] });
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
                    <Spinner size='bg' />
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
                        <Col md={12}>
                            <ModalPages />
                        </Col>
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

