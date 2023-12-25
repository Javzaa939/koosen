// ** React imports
import React, { Fragment, useState, useEffect, useContext } from 'react'

import { useTranslation } from 'react-i18next';

import Select from 'react-select'

import useApi from "@hooks/useApi";

import useLoader from "@hooks/useLoader";

import AuthContext from "@context/AuthContext"

import SchoolContext from "@context/SchoolContext"

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
    Table,
    Input
} from "reactstrap";

import { validate, ReactSelectStyles, get_EXAM_STATUS, convertDefaultValue } from "@utils"

import { validateSchema } from '../validateSchema';

const EditModal = ({ editId, open, handleEdit, refreshDatas, datas, lesson_id, student_id }) => {

    const { control, handleSubmit, reset, setValue, setError, formState: { errors } } = useForm(validate(validateSchema));

    const { t } = useTranslation()
    const { user } = useContext(AuthContext)
    const { school_id } = useContext(SchoolContext)

    const [studentOption, setStudentOption] = useState([])
    const [lessonOption, setLessonOption] = useState([])
    const [statusOption, setStatusOption] = useState(get_EXAM_STATUS())
    const [is_score, setScore] = useState(false)
    const [is_pop, setIsPop] = useState(false)
    const [is_disabled, setDisabled] = useState(false)
    const [data, setDatas] = useState([])
    const [score_id, setScoreID] = useState('')
    const [examScore, setExamScore] = useState('')

    // Loader
    const { Loader, isLoading, fetchData } = useLoader({isFullScreen: false})

    // Api
    const studentApi = useApi().student
    const lessonApi = useApi().study.lessonStandart
    const reScoreApi = useApi().score.rescore

    useEffect(() => {
        if(Object.keys(user).length > 0 && user.permissions.includes('lms-score-restudy-update')) {
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

    useEffect(() => {
        getStudent()
        getLessonList()
    },[])

    async function getDatas() {
        if(editId) {
            const { success, data } = await fetchData(reScoreApi.getOne(editId))
            if(success) {
                setDatas(data)
                // засах үед дата байх юм бол setValue-р дамжуулан утгыг харуулна
                if(data === null) return

                for(let key in data)
                {
                    if(data[key] !== null)
                        setValue(key, data[key])
                    else setValue(key, '')
                    if(key === 'student' || key === 'lesson') {
                        setValue(key, data[key]?.id)
                    }
                    if(key==='score'){

                        if(data[key] !== null) {
                            setScoreID(data.score.id)
                            if(data.score.status === 5){
                                setExamScore(data.score.exam_score)
                                setValue('exam_score', data.score.exam_score)
                            }
                            else{
                                setExamScore(Math.round(data.score.exam_score / 3.33))
                                setValue('exam_score', Math.round(data.score.exam_score / 3.33))
                            }
                        }
                    }
                    if(key==='before_score'){
                        if(data[key] !== null) {
                            setValue('teach_score', data.before_score.teach_score)
                            setValue('befor_exam_score', data.before_score.exam_score)
                        }
                    }
                }
            }
        }
    }

    useEffect(() => {
        getDatas()
    },[])

    async function onSubmit(cdata) {
        if(score_id)
        {
            const updata = cdata['score']
            const before_score = cdata['before_score']
            updata['status'] = cdata['status'] + 4 //4 зөрөөтэй тогтмол
            if(cdata['status'] === 1 || cdata['status'] === 5)
            {
                if(before_score)
                {
                    updata['teach_score'] = before_score['teach_score']
                }
                else
                {
                    updata['teach_score'] = null
                }
                updata['exam_score'] = cdata['exam_score']
            }
            else
            {
                updata['exam_score'] = Math.round(cdata['exam_score'] * 3.33, 2)
                // updata['teach_score'] = null
            }
            updata['student'] = updata['student_id']
            const { success, error } = await fetchData(reScoreApi.put(updata, score_id))
            if(success) {
                reset()
                handleEdit()
                refreshDatas()
            } else {
                /** Алдааны мессэжийг input дээр харуулна */
                for (let key in error) {
                    setError(error[key].field, { type: 'custom', message:  error[key].msg});
                }
            }
        }
        else
        {
            const crdata = cdata
            const before_score = cdata['before_score']
            crdata['status'] = cdata['status'] + 4 //4 зөрөөтэй тогтмол
            if(cdata['status'] === 1 || cdata['status'] === 5)
            {
                if(before_score)
                {
                    crdata['teach_score'] = before_score['teach_score']
                }
                else
                {
                    crdata['teach_score'] = null
                }
                crdata['exam_score'] = cdata['exam_score']
            }
            else
            {
                crdata['exam_score'] = Math.round(cdata['exam_score'] * 3.33, 2)
                crdata['teach_score'] = null
            }

            const { success, error } = await fetchData(reScoreApi.post(crdata))
            if(success) {
                reset()
                handleEdit()
                refreshDatas()
            } else {
                /** Алдааны мессэжийг input дээр харуулна */
                for (let key in error) {
                    setError(error[key].field, { type: 'custom', message:  error[key].msg});
                }
            }
	    }
    }

    return (
        <Fragment>
            <Modal isOpen={open} toggle={handleEdit} className="modal-dialog-centered modal-sm" onClosed={handleEdit}>
                {isLoading && Loader}
                <ModalHeader className='bg-transparent pb-0' toggle={handleEdit}></ModalHeader>
                <ModalBody className="px-sm-3 pt-50 pb-3">
                    <div className='text-center'>
                        <h4>{t('Дахин шалгалтын дүн засах')}</h4>
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
                                                isDisabled={true}
                                                value={studentOption.find((c) => c.id === value)}
                                                noOptionsMessage={() => t('Хоосон байна')}
                                                onChange={(val) => {
                                                    onChange(val?.id || '')
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
                                            isDisabled={true}
                                            value={lessonOption.find((c) => c.id === value)}
                                            noOptionsMessage={() => t('Хоосон байна')}
                                            onChange={(val) => {
                                                onChange(val?.id || '')
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
                                            isDisabled={true}
                                            noOptionsMessage={() => t('Хоосон байна')}
                                            onChange={(val) => {
                                                onChange(val?.id || '')
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
                        {
                            data.before_score &&
                            <Col md={12}>
                                <Label className="form-label" for="teach_score">
                                    {t("Өмнөх дүн") +'-'+ t('Багшийн оноо')}
                                </Label>
                                <Controller
                                    defaultValue=''
                                    control={control}
                                    id="teach_score"
                                    name="teach_score"
                                    render={({ field }) => (
                                        <Input
                                            id ="teach_score"
                                            bsSize="sm"
                                            {...field}
                                            type="number"
                                            disabled={true}
                                        />
                                    )}
                                />
                            </Col>
                        }
                        {
                            data?.before_score?.exam_score &&
                            <Col md={12}>
                            <Label className="form-label" for="befor_exam_score">
                                {t("Өмнөх дүн") +'-'+ t('Шалгалтын оноо')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id="befor_exam_score"
                                name="befor_exam_score"
                                render={({ field }) => (
                                    <Input
                                        id ="befor_exam_score"
                                        bsSize="sm"
                                        {...field}
                                        type="number"
                                        disabled={true}
                                    />
                                )}
                            />
                        </Col>
                        }
                        <Col md={12}>
                            <Label className="form-label" for="exam_score">
                                {t("Дахин шалгалтын оноо")}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id="exam_score"
                                name="exam_score"
                                render={({ field }) => (
                                    <Input
                                        id ="exam_score"
                                        bsSize="sm"
                                        placeholder={t('Дахин шалгалтын оноо')}
                                        {...field}
                                        type="number"
                                        value={examScore}
                                        onKeyDown={(e) =>["e", "E", "+", "-"].includes(e.key) && e.preventDefault()}
                                        onChange={(e)=>{
                                                setExamScore(e.target.value ),
                                                setValue('exam_score', e.target.value)
                                            }
                                        }
                                        invalid={errors.exam_score && true}
                                    />
                                )}
                            />
                            {errors.exam_score && <FormFeedback className='d-block'>{t(errors.exam_score.message)}</FormFeedback>}
                            {
                                (data?.status&& data?.status !== 1) && // нөхөн шалгалтаас бусад үед
                                <Label className="form-label" for="total_score">
                                    {t("Нийт оноо: ")} {examScore * 3.33}
                                </Label>
                            }
                        </Col>

                        <Col md={12} className='text-center pt-1'>
                            <Button className="me-2" size='sm' color="primary" type="submit" disabled={is_disabled}>
                                {t('Хадгалах')}
                            </Button>
                            <Button color="secondary" size='sm' type="reset" outline  onClick={handleEdit}>
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
