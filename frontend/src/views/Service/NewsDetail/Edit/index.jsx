import React, { Fragment, useState, useEffect, useContext } from "react";

import { Controller, useForm } from 'react-hook-form'

import { Row, ModalBody, ModalHeader, Col, FormFeedback, Input, Form, Modal, Label, Button} from 'reactstrap'

import { useQuill } from 'react-quilljs';

import Select from 'react-select'

import 'quill/dist/quill.snow.css'

import '../style.css'

import useLoader from '@hooks/useLoader';

import useApi from "@hooks/useApi"

import AuthContext from '@context/AuthContext'

import SchoolContext from "@context/SchoolContext"

import { validate, convertDefaultValue, ReactSelectStyles, get_news_people_type, student_course_level  } from "@utils"

import classnames from "classnames";

import { validateSchema } from "../validateSchema";

import { t } from 'i18next';

const EditModal = ({ open, handleEdit, refreshDatas, edit_id }) => {

    const { Loader, isLoading, fetchData } = useLoader({isFullScreen: false})

    const { user } = useContext(AuthContext)
    const { school_id } = useContext(SchoolContext)

    // State
    const [is_disabled, setDisabled] = useState(true)
    const [isStudent, setStudent] = useState('')
    const [value, defaultValue] = useState('');
    const [is_valid, setValid] = useState(true)
    const [student_levelOptions, setStudent_levelOptions] = useState(student_course_level())
    const [scopeOptions, setScopeOptions] = useState(get_news_people_type())
    const [departmentOptions, setDepartmentOption] = useState([])

    // ** Hook
    const { control, handleSubmit, formState: { errors }, reset, setValue, setError } = useForm(validate(validateSchema))

    const { quill, quillRef } = useQuill({
        modules: {
            toolbar: [
                    ['bold', 'italic', 'underline', 'strike'],
                    [{ align: [] }],

                    [{ list: 'ordered'}, { list: 'bullet' }],
                    [{ indent: '-1'}, { indent: '+1' }],

                    [{ size: ['small', false, 'large', 'huge'] }],
                    ['link'],

                    [{ color: [] }, { background: [] }],

                    ['clean'],
            ],
        },
        value: value,
        theme: 'snow',
        formats: [
            'header','bold', 'italic', 'underline', 'strike',
            'align', 'list', 'indent',
            'size',
            'link',
            'color', 'background',
            'clean',
        ],
        readOnly: false,
    });

    // API
    const newsApi = useApi().service.news
    const departmentApi = useApi().hrms.department

    // Тэнхимийн жагсаалт
    async function getDepartmentOption() {
        const { success, data } = await fetchData(departmentApi.get(school_id))
        if(success) {
            setDepartmentOption(data)
        }
    }

    useEffect(() => {
        if(Object.keys(user).length > 0 && user.permissions.includes('lms-service-news-update')) {
            setDisabled(false)
        }
    },[user])

    async function getDatas() {
        if (edit_id) {

            const { success, data } = await fetchData(newsApi.getOneAd(edit_id))
            if (success) {
                // засах үед дата байх юм бол setValue-р дамжуулан утгыг харуулна
                if (data === null) return
                for (let key in data) {
                    if (data[key] !== null)
                        setValue(key, data[key])
                    else setValue(key, '')

                    if (key === 'body' && quill) {
                        quill.pasteHTML(data[key]);
                    }
                    if (key === 'scope'){
                        setStudent(data[key])
                    }
                }
            }
        }
    }

    useEffect(() => {
        getDatas()
        getDepartmentOption()
    }, [open, quill])

    async function onSubmit(cdata) {
        cdata['body'] = quill.root.innerHTML
        cdata = convertDefaultValue(cdata)

        if(edit_id) {

            const formData = new FormData()

            for (let key in cdata) {
                formData.append(key, cdata[key])
            }
            const { success, error, errors } = await fetchData(newsApi.put(cdata, edit_id))
            if(edit_id) {
                if(success) {
                    reset()
                    refreshDatas()
                    handleEdit()
                }
                else {
                    console.log(error)
                    console.log(errors)
                    /** Алдааны мессеж */
                    for (let key in error) {
                        setError(error[key].field, { type: 'custom', message: error[key].msg});
                    }
                }
            }
        }
    }

    return (
        <Fragment>
            <Modal isOpen={open} toggle={handleEdit} className="modal-dialog-centered modal-lg" onClosed={handleEdit}>
            { isLoading && Loader}
                <ModalHeader className="bg-transparent pb-0" toggle={handleEdit}></ModalHeader>
                <ModalBody className="px-sm-12 pt-50 pb-3">
                    <div className="text-center">
                        <h5>{t('Зар мэдээ засах')}</h5>
                    </div>
                    <Row tag={Form} className='gy-1' onSubmit={handleSubmit(onSubmit)}>
                        <Col md={12}>
                            <Label className='form-label' for="title">
                                {t('Гарчиг')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id='title'
                                name='title'
                                render={({field}) => (
                                    <Input
                                        {...field}
                                        type='text'
                                        name='title'
                                        id='title'
                                        placeholder={t('Гарчиг')}
                                        bsSize='sm'
                                        invalid={errors.title && true}
                                        // readOnly={is_valid}
                                        // is_disabled={is_valid}
                                    />
                                )}
                                />
                            {errors.title && <FormFeedback className='d-block'>{t(errors.title.message)}</FormFeedback>}
                        </Col>
                        <Col md={12}>
                            <Label className='form-label' for='body'>
                                {t('Мэдээний хэсэг')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id='body'
                                name='body'
                                render={({field}) => (
                                    <div style={{ width: 'auto',}}>
                                        <div
                                            {...field}
                                            name='body'
                                            id='body'
                                            ref={quillRef}
                                            // is_disabled={is_valid}
                                            readOnly={is_valid}
                                        />
                                    </div>
                                )}
                            />
                            {errors.body && <FormFeedback className='d-block'>{t(errors.body.message)}</FormFeedback>}
                        </Col>
                        <Col md={12} className="text-center mt-2">
                            <Button className='me-2' color="primary" type="submit">
                                {t('Хадгалах')}
                            </Button>
                            <Button color="secondary" outline type="reset" onClick={handleEdit}>
                                {t('Буцах')}
                            </Button>
                        </Col>
                    </Row>
                </ModalBody>
            </Modal>
        </Fragment>
    )
}


export default EditModal
