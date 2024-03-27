// ** React imports
import React, { Fragment, useState, useEffect, useContext } from 'react'

import { useTranslation } from 'react-i18next';
import Select from 'react-select'

import useApi from "@hooks/useApi";
import useLoader from "@hooks/useLoader";

import AuthContext from "@context/AuthContext"
import SchoolContext from "@context/SchoolContext"
import ActiveYearContext from "@context/ActiveYearContext"

import { validate, ReactSelectStyles } from "@utils"

import classnames from "classnames";

import { useForm, Controller } from "react-hook-form";

import {
    Row,
    Col,
	Form,
	Modal,
	Input,
	Label,
	Button,
	ModalBody,
	ModalHeader,
	FormFeedback,
    Spinner
} from "reactstrap";

import { validateSchema } from '../validateSchema';

const EditModal = ({ open, handleEdit, scoreId, refreshDatas }) => {

    const { control, handleSubmit, reset, setValue, setError, formState: { errors } } = useForm(validate(validateSchema));

    const { t } = useTranslation()
    const { user } = useContext(AuthContext)
    const { school_id } = useContext(SchoolContext)
    const { cyear_name, cseason_id } = useContext(ActiveYearContext)
    const [lesson_option, setLessonOption] = useState([])
    const [ student_option, setStudentOption ] = useState([])
    const [is_disabled, setDisabled] = useState(true)
	const { isLoading, fetchData } = useLoader({});

    // api
    const lessonApi = useApi().study.lessonStandart
    const studentApi = useApi().student
    const correspondApi = useApi().score.correspond

    useEffect(() => {
        if(Object.keys(user).length > 0 && user.permissions.includes('lms-score-correspond-update')) {
            setDisabled(false)
        }
    },[user])

    // Хичээлийн жагсаалт
    async function getLessonOption() {
        const { success, data } = await fetchData(lessonApi.getList())
        if(success) {
            setLessonOption(data)
        }
    }

    // Оюутны жагсаалт
    async function getStudentOption() {
        const { success, data } = await fetchData(studentApi.getList())
        if(success) {
            setStudentOption(data)
        }
    }

    useEffect(()=>{
        getStudentOption()
        getDatas()
        getLessonOption()
    },[])

    async function getDatas() {
        if(scoreId) {
            const { success, data } = await fetchData(correspondApi.getOne(scoreId))
            if(success) {
                // засах үед дата байх юм бол setValue-р дамжуулан утгыг харуулна
                if(data === null) return
                for(let key in data) {
                    if(data[key] !== null)
                        setValue(key, data[key])
                    else setValue(key,'')

                    if(key === 'student' || key === 'lesson') {
                        setValue(key, data[key]?.id)
                    }
                }
            }
        }
    }

    async function onSubmit(cdata) {
        // cdata = convertDefaultValue(cdata)
        cdata['school'] = school_id
        cdata['lesson_year'] = cyear_name
        cdata['lesson_season'] = cseason_id
        const { success, error } = await fetchData(correspondApi.put(cdata, scoreId))
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

    return (
        <Fragment>
            <Modal isOpen={open} toggle={handleEdit} className="modal-dialog-centered modal-sm" onClosed={handleEdit}>
            {isLoading && <div className='suspense-loader'><Spinner size='xl'/></div>}
                <ModalHeader className='bg-transparent pb-0' toggle={handleEdit}></ModalHeader>
                <ModalBody className="px-sm-3 pt-50 pb-3">
                    <div className='text-center'>
                        <h4>{t('Дүйцүүлсэн дүнгийн бүртгэл засах')}</h4>
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
                                        <Select
                                            name="student"
                                            id="student"
                                            classNamePrefix='select'
                                            isClearable
                                            className={classnames('react-select', { 'is-invalid': errors.lesson })}
                                            isLoading={isLoading}
                                            placeholder={t(`Сонгоно уу`)}
                                            options={student_option|| []}
                                            value={student_option.find((c) => c.id === value)}
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
                            ></Controller>
                            {errors.student && <FormFeedback className='d-block'>{t(errors.student.message)}</FormFeedback>}
                        </Col>
                    <Col md={12}>
                            <Label className="form-label" for="lesson">
                                {t("Дүйцүүлэх хичээл")}
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
                                            className={classnames('react-select', { 'is-invalid': errors.lesson })}
                                            isLoading={isLoading}
                                            placeholder={t(`Хичээлээ сонгоно уу`)}
                                            options={lesson_option|| []}
                                            value={lesson_option.find((c) => c.id === value)}
                                            noOptionsMessage={() => t('Хоосон байна')}
                                            onChange={(val) => {
                                                onChange(val?.id || '')
                                            }}
                                            styles={ReactSelectStyles}
                                            getOptionValue={(option) => option.id}
                                            getOptionLabel={(option) => option.full_name }
                                        />
                                    )
                                }}
                            ></Controller>
                            {errors.lesson && <FormFeedback className='d-block'>{t(errors.lesson.message)}</FormFeedback>}
                        </Col>
                        <Col md={12}>
                            <Label className="form-label" for="teach_score">
                                {t("Багшийн оноо")}
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
                                        placeholder={t('Багшийн оноо')}
                                        {...field}
                                        type="number"
                                        onKeyDown={(e) =>["e", "E", "+", "-"].includes(e.key) && e.preventDefault()}
                                        readOnly={is_disabled}
                                        disabled={is_disabled}
                                        invalid={errors.teach_score && true}
                                    />
                                )}
                            />
                            {errors.teach_score && <FormFeedback className='d-block'>{t(errors.teach_score.message)}</FormFeedback>}
                        </Col>
                        <Col md={12}>
                            <Label className="form-label" for="exam_score">
                                {t("Шалгалтын оноо")}
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
                                        placeholder={t('Шалгалтын оноо')}
                                        {...field}
                                        type="number"
                                        onKeyDown={(e) =>["e", "E", "+", "-"].includes(e.key) && e.preventDefault()}
                                        readOnly={is_disabled}
                                        disabled={is_disabled}
                                        invalid={errors.exam_score && true}
                                    />
                                )}
                            />
                            {errors.exam_score && <FormFeedback className='d-block'>{t(errors.exam_score.message)}</FormFeedback>}
                        </Col>
                        <Col md={12} className="text-center pt-1">
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
