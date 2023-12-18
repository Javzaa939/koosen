import React, { Fragment, useState, useEffect, useContext } from "react";

import { X } from "react-feather";

import Select from 'react-select'

import useApi from "@hooks/useApi";
import useLoader from "@hooks/useLoader";
import SchoolContext from '@context/SchoolContext'
import ActiveYearContext from '@context/ActiveYearContext'

import { useTranslation } from 'react-i18next';

import { useForm, Controller } from "react-hook-form";

import { Row, Col, Form, Modal, Label, Button, ModalBody, ModalHeader, FormFeedback, Spinner } from "reactstrap";

import { validate,  convertDefaultValue, ReactSelectStyles, get_EXAM_STATUS } from "@utils"

import classnames from "classnames";

import { validateSchema } from '../validateSchema';
import LessonScoreModal from "../LessonScore";

const Addmodal = ({ open, handleModal, refreshDatas }) => {

    const { t } = useTranslation()

    const CloseBtn = (
        <X className="cursor-pointer" size={15} onClick={handleModal} />
    )

    // Context
    const { school_id } = useContext(SchoolContext)
    const { cyear_name, cseason_id } = useContext(ActiveYearContext)

    const [studentOption, setStudentOption] = useState([])
    const [lessonOption, setLessonOption] = useState([])
    const [statusOption, setStatusOption] = useState(get_EXAM_STATUS())
    const [student_id, setStudentId] = useState('')
    const [lesson_id, setLessonId] = useState('')
    const [is_pop, setIsPop] = useState(false)
    const [is_score, setScore] = useState(false)
    const [studentScoreList, setLessonScore] = useState([])

    // ** Hook
    const { control, handleSubmit, formState: { errors }, reset, setError } = useForm(validate(validateSchema));

    // Loader
    const { Loader, isLoading, fetchData } = useLoader({});
	const { isLoading: postLoading, fetchData: postFetch } = useLoader({});

    // Api
    const studentApi = useApi().student
    const lessonApi = useApi().study.lessonStandart
    const reExamApi = useApi().timetable.re_exam

    const getStudent = async() => {
        const { success, data } = await fetchData(studentApi.getList('', '', ''))
        if(success) {
            setStudentOption(data)
        }
    }

    async function getLessonList() {
        const { success, data } = await fetchData(lessonApi.getList())
        if(success) {
            setLessonOption(data)
        }
    }

    const handleScoreModal = () => {
        setScore(!is_score)
    }

    // Дүн шалгах товч дарах үед ашиглах функц
    function checkScoreButton() {
        setIsPop(!is_pop)
        getLessonScore()
    }

    // Хичээл болон оюутан сонгосон үед тухайн оюутаны хичээлийн дүнг харуулна
    async function getLessonScore() {
        if(student_id && lesson_id) {
            const { success, data } = await fetchData(reExamApi.getStudentLessonScore(student_id, lesson_id))
            if(success) {
                setScore(true)
                setLessonScore(data)
            } else {
                setScore(false)
            }
        }

    }

    useEffect(() => {
        getStudent()
        getLessonList()
    },[])

    async function onSubmit(cdata) {
        setIsPop(false)
        cdata['lesson_year'] = cyear_name
        cdata['lesson_season'] = cseason_id
        cdata['school'] = school_id
        cdata = convertDefaultValue(cdata)
        const { success, error } = await postFetch(reExamApi.post(cdata))
        if(success) {
            reset()
            handleModal()
            refreshDatas()
        } else {
            /** Алдааны мессэжийг input дээр харуулна */
            for (let key in error) {
                setError(error[key].field, { type: 'custom', message:  error[key].msg});
            }
        }
    }

    return (
        <Fragment>
            <Modal
                isOpen={open}
                toggle={handleModal}
                className="sidebar-lg hr-register"
                modalClassName="modal-slide-in "
                contentClassName="pt-0"
            >
                <ModalHeader
                    className="mb-1"
                    toggle={handleModal}
                    close={CloseBtn}
                    tag="div"
                >
                    <h5 className="modal-title">{t('Дахин шалгалт бүртгэх')}</h5>
                </ModalHeader>
                <ModalBody className="flex-grow-1">
                    <Row tag={Form} className="gy-1" onSubmit={handleSubmit(onSubmit)}>
                        <Col md={12}>
                            <Label className="form-label" for="student">
                                {t('Оюутан')}
                            </Label>
                            <Controller
                                control={control}
                                defaultValue=''
                                name="student"
                                render={({ field: { value, onChange} }) => {
                                    return (
                                        <Select
                                            name="student"
                                            id="student"
                                            isClearable
                                            classNamePrefix='select'
                                            isLoading={isLoading}
                                            className={classnames('react-select', { 'is-invalid': errors.student })}
                                            placeholder={t(`-- Сонгоно уу --`)}
                                            options={studentOption || []}
                                            value={studentOption.find((c) => c.id === value)}
                                            noOptionsMessage={() => t('Хоосон байна')}
                                            onChange={(val) => {
                                                onChange(val?.id || '')
                                                setStudentId(val?.id || '')
                                                setIsPop(false)
                                            }}
                                            styles={ReactSelectStyles}
                                            getOptionValue={(option) => option.id}
                                            getOptionLabel={(option) => option.full_name}
                                        />
                                    )
                                }}
                            />
                            {errors.student && <FormFeedback className='d-block'>{t(errors.student.message)}</FormFeedback>}
                        </Col>
                        <Col md={12}>
                            <Label className="form-label" for="lesson">
                                {t('Хичээл')}
                            </Label>
                            <Controller
                                control={control}
                                defaultValue=''
                                name="lesson"
                                render={({ field: { value, onChange} }) => {
                                    return (
                                        <Select
                                            name="lesson"
                                            id="lesson"
                                            isClearable
                                            classNamePrefix='select'
                                            isLoading={isLoading}
                                            className={classnames('react-select', { 'is-invalid': errors.lesson })}
                                            placeholder={t(`-- Сонгоно уу --`)}
                                            options={lessonOption || []}
                                            value={lessonOption.find((c) => c.id === value)}
                                            noOptionsMessage={() => t('Хоосон байна')}
                                            onChange={(val) => {
                                                onChange(val?.id || '')
                                                setLessonId(val?.id || '')
                                                setIsPop(false)
                                            }}
                                            styles={ReactSelectStyles}
                                            getOptionValue={(option) => option.id}
                                            getOptionLabel={(option) => option.full_name}
                                        />
                                    )
                                }}
                            />
                            {errors.lesson && <FormFeedback className=''>{t(errors.lesson.message)}</FormFeedback>}
                        </Col>
                        {
                            <Col md={12}>
                                <Button id="Popover1" type="button" color='primary' size='sm' onClick={() => checkScoreButton()} disabled={!student_id || !lesson_id}>
                                    Дүн шалгах
                                </Button>
                                <LessonScoreModal open={is_score && is_pop} handleScoreModal={handleScoreModal} datas={studentScoreList} />
                            </Col>
                        }
                        <Col md={12}>
                            <Label className="form-label" for="status">
                                {t('Шалгалтын төлөв')}
                            </Label>
                            <Controller
                                control={control}
                                defaultValue=''
                                name="status"
                                render={({ field: { value, onChange} }) => {
                                    return (
                                        <Select
                                            name="status"
                                            id="status"
                                            isClearable
                                            classNamePrefix='select'
                                            isLoading={isLoading}
                                            className={classnames('react-select', { 'is-invalid': errors.status})}
                                            placeholder={t(`-- Сонгоно уу --`)}
                                            options={statusOption || []}
                                            value={statusOption.find((c) => c.id === value)}
                                            noOptionsMessage={() => t('Хоосон байна')}
                                            onChange={(val) => {
                                                onChange(val?.id || '')
                                                setIsPop(false)
                                            }}
                                            styles={ReactSelectStyles}
                                            getOptionValue={(option) => option.id}
                                            getOptionLabel={(option) => option.name}
                                        />
                                    )
                                }}
                            />
                            {errors.status && <FormFeedback className=''>{t(errors.status.message)}</FormFeedback>}
                        </Col>
                        <Col md={12} className="mt-2">
                            <Button className="me-2" color="primary" type="submit" disabled={postLoading}>
                                {postLoading &&<Spinner size='sm' className='me-1'/>}
                                {t('Хадгалах')}
                            </Button>
                            <Button color="secondary" type="reset" outline  onClick={handleModal}>
                                {t('Буцах')}
                            </Button>
                        </Col>
                    </Row>
                </ModalBody>
            </Modal>
        </Fragment>
    );
};

export default Addmodal;
