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
import ModalPages from './components/ModalPages';
import { getPagination } from '@src/utility/Utils';

const Add = ({ isOpen, handleModal, refreshDatas }) => {

    const { t } = useTranslation()

    const closeBtn = (
        <X className='cursor-pointer' size={15} onClick={handleModal} />
    )

    // ** Hook
    const { control, handleSubmit, formState: { errors }, reset, setError, watch, getValues } = useForm(validate(validateSchema));

    const { isLoading, fetchData } = useLoader({})

    const [is_loading, setIsLoading] = useState(false)
    const [lesson_option, setLessonOption] = useState([])
    const [teacher_option, setTeacherOption] = useState([])

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
        // console.log(cdata, 'submit')
        cdata = convertDefaultValue(cdata)

        const formData = new FormData()

        for (let key in cdata) {
            if (key === 'onlineInfo') {
                const cdataOnlineInfo = cdata[key]

                for (let i = 0; i < cdataOnlineInfo.length; i++) {
                    const cdataOnlineInfoItem = cdataOnlineInfo[i]

                    for (let keyOnlineInfoItem in cdataOnlineInfoItem) {
                        if (keyOnlineInfoItem === 'onlineSubInfo') {
                            const cdataSubOnlineInfo = cdataOnlineInfoItem[keyOnlineInfoItem]

                            for (let i2 = 0; i2 < cdataSubOnlineInfo.length; i2++) {
                                const cdataSubOnlineInfoItem = cdataSubOnlineInfo[i2]

                                for (let keySubOnlineInfoItem in cdataSubOnlineInfoItem) {
                                    if (keySubOnlineInfoItem === 'quezQuestions') {
                                        const cdataQuezQuestions = cdataSubOnlineInfoItem[keySubOnlineInfoItem]

                                        for (let i3 = 0; i3 < cdataQuezQuestions.length; i3++) {
                                            const cdataQuezQuestionsItem = cdataQuezQuestions[i3]

                                            for (let keyQuezQuestionsItem in cdataQuezQuestionsItem) {
                                                if (keyQuezQuestionsItem === 'quezChoices') {
                                                    const cdataQuezChoices = cdataQuezQuestionsItem[keyQuezQuestionsItem]

                                                    for (let i4 = 0; i4 < cdataQuezChoices.length; i4++) {
                                                        const cdataQuezChoicesItem = cdataQuezChoices[i4]

                                                        for (let keyQuezChoicesItem in cdataQuezChoicesItem) {
                                                            if (keyQuezChoicesItem === 'image' && cdataQuezChoicesItem[keyQuezChoicesItem]) {
                                                                formData.append(`quez_choices_${keyQuezChoicesItem}`, cdataQuezChoicesItem[keyQuezChoicesItem][0])
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }

                formData.append(key, JSON.stringify(cdata[key]))
            } else if (key === 'students') {
                if (cdata[key]) {
                    const cdataNew = cdata[key].map(item => item.id)
                    formData.append(key, JSON.stringify(cdataNew))
                }
            } else if (key === 'image' && cdata[key]) formData.append(key, cdata[key][0])
            else formData.append(key, JSON.stringify(cdata[key]))
        }

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

    const onChangeFile = (e, setImageOld) => {
        const reader = new FileReader()
        const files = e.target.files
        if (files.length > 0) {
            reader.onload = function () {
                setImageOld(reader.result)
            }
            reader.readAsDataURL(files[0])
        }
    }

    // #region modal page
    const [modalPage, setModalPage] = useState(1)

    function handleModalPage(pageFromReactPagination, simplePage) {
        let newPage = simplePage ? simplePage : pageFromReactPagination.selected + 1
        setModalPage(newPage)
    }
    // #endregion

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
                            <div className='modal-pages-pagination'>
                                {getPagination(handleModalPage, modalPage, 1, 2)()}
                            </div>
                            <ModalPages
                                t={t}
                                control={control}
                                errors={errors}
                                isLoading={isLoading}
                                lesson_option={lesson_option}
                                teacher_option={teacher_option}
                                onChangeFile={onChangeFile}
                                handleModalPage={handleModalPage}
                                modalPage={modalPage}
                                getValues={getValues}
                            />
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

