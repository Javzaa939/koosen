// ** React imports
import React, { Fragment, useState, useEffect, useContext } from 'react'

import { useTranslation } from 'react-i18next';
import Select from 'react-select'

import useApi from "@hooks/useApi";
import useLoader from "@hooks/useLoader";

import AuthContext from "@context/AuthContext"
import SchoolContext from "@context/SchoolContext"
import ActiveYearContext from "@context/ActiveYearContext"

import classnames from "classnames";

import { useForm, Controller } from "react-hook-form";

import {
    Row,
    Col,
	Form,
	Modal,
	Label,
	Button,
	ModalBody,
	ModalHeader,
	FormFeedback,
    Spinner
} from "reactstrap";

import { validate, ReactSelectStyles, get_EXAM_STATUS, convertDefaultValue } from "@utils"

import { validateSchema } from '../validateSchema';
import LessonScoreModal from '../LessonScore';

const EditModal = ({ editId, open, handleModal, refreshDatas }) => {

    const { control, handleSubmit, reset, setValue, setError, formState: { errors } } = useForm(validate(validateSchema));

    const { t } = useTranslation()
    const { user } = useContext(AuthContext)
    const { school_id } = useContext(SchoolContext)
    const { cyear_name, cseason_id } = useContext(ActiveYearContext)

    const [studentOption, setStudentOption] = useState([])
    const [lessonOption, setLessonOption] = useState([])
    const [statusOption, setStatusOption] = useState(get_EXAM_STATUS())
    const [student_id, setStudentId] = useState('')
    const [lesson_id, setLessonId] = useState('')
    const [is_score, setScore] = useState(false)
    const [is_pop, setIsPop] = useState(false)
    const [studentScoreList, setLessonScore] = useState([])

    const [is_disabled, setDisabled] = useState(true)

	const { isLoading, fetchData } = useLoader({});

    // Api
    const studentApi = useApi().student
    const lessonApi = useApi().study.lessonStandart
    const reExamApi = useApi().timetable.re_exam

    useEffect(() => {
        if(Object.keys(user).length > 0 && user.permissions.includes('lms-score-correspond-update')) {
            setDisabled(false)
        }
    },[user])

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

    async function getDatas() {
        if(editId) {
            const { success, data } = await fetchData(reExamApi.getOne(editId))
            if(success) {
                // засах үед дата байх юм бол setValue-р дамжуулан утгыг харуулна
                if(data === null) return
                for(let key in data) {
                    if(data[key] !== null)
                        setValue(key, data[key])
                    else setValue(key, '')

                    if(key === 'student' || key === 'lesson') {
                        setStudentId(data['student']?.id)
                        setLessonId(data['lesson']?.id)
                        handleScoreModal(true)
                        setValue(key, data[key]?.id)
                    }
                }
            }
        }
    }

    useEffect(() => {
        getDatas()
    },[editId, open])

    async function onSubmit(cdata) {
        setIsPop(false)
        cdata['school'] = school_id
        cdata['lesson_year'] = cyear_name
        cdata['lesson_season'] = cseason_id
        cdata = convertDefaultValue(cdata)
        const { success, error } = await fetchData(reExamApi.put(cdata, editId))
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
            <Modal isOpen={open} toggle={handleModal} className="modal-dialog-centered modal-sm" onClosed={handleModal}>
            {isLoading && <div className='suspense-loader'><Spinner size='xl'/></div>}
                <ModalHeader className='bg-transparent pb-0' toggle={handleModal}></ModalHeader>
                <ModalBody className="px-sm-3 pt-50 pb-3">
                    <div className='text-center'>
                        <h4>{t('Дахин шалгалт бүртгэх')}</h4>
                    </div>
                    <Row tag={Form} className="gy-1" onSubmit={handleSubmit(onSubmit)}>
                        <Col md={12}>
                            <Label className="form-label" for="student">
                                {t("Оюутан")}
                            </Label>
                            <Controller
                                control={control}
                                defaultValue=''
                                name="student"
                                render={({ field: { value, onChange} }) => {
                                    return (
                                        <>
                                            <Select
                                                name="student"
                                                id="student"
                                                classNamePrefix='select'
                                                isClearable
                                                className={classnames('react-select', { 'is-invalid': errors.student })}
                                                isLoading={isLoading}
                                                placeholder={t(`Сонгоно уу`)}
                                                options={studentOption|| []}
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
                                        </>
                                    )
                                }}
                            ></Controller>
                            {errors.student && <FormFeedback className='d-block'>{t(errors.student.message)}</FormFeedback>}
                        </Col>
                        <Col md={12}>
                            <Label className="form-label" for="lesson">
                                {t("Хичээл")}
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
                                            classNamePrefix='select'
                                            isClearable
                                            className={classnames('react-select', { 'is-invalid': errors.lesson})}
                                            isLoading={isLoading}
                                            placeholder={t(`--Сонгоно уу--`)}
                                            options={lessonOption|| []}
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
                            {errors.lesson && <FormFeedback className='d-block'>{t(errors.lesson.message)}</FormFeedback>}
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
                                {t("Шалгалтын төлөв")}
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
                                            classNamePrefix='select'
                                            isClearable
                                            className={classnames('react-select', { 'is-invalid': errors.status })}
                                            isLoading={isLoading}
                                            placeholder={t(`--Сонгоно уу--`)}
                                            options={statusOption|| []}
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
                            {errors.status && <FormFeedback className='d-block'>{t(errors.status.message)}</FormFeedback>}
                        </Col>
                        <Col md={12} className='text-center pt-1'>
                            <Button className="me-2" size='sm' color="primary" type="submit" disabled={is_disabled}>
                                {t('Хадгалах')}
                            </Button>
                            <Button color="secondary" size='sm' type="reset" outline  onClick={handleModal}>
                                {t('Буцах')}
                            </Button>
                        </Col>
                    </Row>
                </ModalBody>
            </Modal>
        </Fragment>
    )
};

export default EditModal;
