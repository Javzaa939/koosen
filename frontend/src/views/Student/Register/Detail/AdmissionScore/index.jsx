// ** React imports
import React, { useState, useEffect, useContext } from 'react'

import { useParams } from 'react-router-dom';
import { useForm, Controller } from "react-hook-form";

import Select from 'react-select'

import {
    Row,
    Col,
	Form,
	Input,
	Label,
	FormFeedback,
    CardHeader,
    Card,
    Button,
    CardTitle,
    Modal,
    ModalBody,
    ModalHeader,
} from "reactstrap";

import useApi from "@hooks/useApi";
import useLoader from "@hooks/useLoader";
import AuthContext from '@context/AuthContext'

import classnames from 'classnames'

import { validate, convertDefaultValue, ReactSelectStyles } from "@utils"

import Tables from './Tables';

import { validateSchema } from './validationSchema';
import { useTranslation } from 'react-i18next'

import SchoolContext from "@context/SchoolContext"


const AdmissionScore = () => {

    const { school_id } = useContext(SchoolContext)

    // ** Hook
    const { control, handleSubmit, reset, setError, setValue, formState: { errors } } = useForm(validate(validateSchema));

    // Loader
	const { Loader, isLoading, fetchData } = useLoader({});

    const { user } = useContext(AuthContext)
    const { studentId } = useParams()

    const { t } = useTranslation()

    const [disabled, setDisabled] = useState(true)
    const [is_edit, setEdit] = useState(false)
    const [show, setShow] = useState(false)
    const [datas, setDatas] = useState([])
    const [lesson_option, setLessonOption] = useState([])

    const admissionApi = useApi().student.admissionScore
    const admissionLessionApi = useApi().settings.admissionlesson

    // Устггах функц
    async function handleDelete(id) {
        const { success, data } = await fetchData(admissionApi.delete(studentId, id))
        if(success)
        {
            getDatas()
        }
    }

    const getDatas = async() => {
        const { success, data } = await fetchData(admissionApi.get(studentId))
        if(success)
        {
            setDatas(data)
            if(data === null) return
            for(let key in data) {
                if (data[key] === null) setValue(key, '')
                else setValue(key, data[key])
                if (key === 'admission_lesson') setValue(key, data[key]?.id)
            }
        }
    }

    const getAdmissionLesson = async() => {
        const { success, data } = await fetchData(admissionLessionApi.get())
        if(success)
        {
            setLessonOption(data)
        }
    }

    // Модал хаах
    const onModalClosed = () => {
        reset()
        setShow(false)
    }

    useEffect(() => {
        /** Эрх шалгана */
        if(Object.keys(user).length > 0 && user.permissions.includes('lms-student-register-update')&& school_id) {
            setDisabled(false)
        }
    },[user, show])

    /** Засах товч дарсан үед ажиллах функц */
    async function handleEdit(data) {
        setEdit(true)
        setShow(true)

        // датаг setValue-р дамжуулан харуулна
        if(data === null) return
        for(let key in data) {
            if (data[key] === null) setValue(key, '')
            else setValue(key, data[key])
            if (key === 'admission_lesson') setValue(key, data[key]?.id);
        }

    }

    async function onSubmit(cdata) {
        cdata['student'] = studentId

        cdata = convertDefaultValue(cdata)
        if(is_edit) {
            /** Засах */
            var id = cdata['id']
            const { success, error } = await fetchData(admissionApi.put(cdata, id, studentId))
            if(success)
            {
                onModalClosed()
                getDatas()
            } else {
                /** Алдааны мессэжийг input дээр харуулна */
                for (let key in error) {
                    setError(error[key].field, { type: 'custom', message:  error[key].msg});
                }
            }
        } else {
            /** Нэмэх */
            const { success, error } = await fetchData(admissionApi.post(cdata))
            if(success)
            {
                onModalClosed()
                getDatas()
            } else {
                /** Алдааны мессэжийг input дээр харуулна */
                for (let key in error) {
                    setError(error[key].field, { type: 'custom', message:  error[key].msg});
                }
            }
        }
	}

    useEffect(
        () =>
        {
            getDatas()
            getAdmissionLesson()
        },
        []
    )

	return (
        <Card>
            <CardHeader className="d-flex justify-content-between py-0 px-0">
                <CardTitle tag='h4'>{t('ЭЕШ оноо')}</CardTitle>
                <Button disabled={disabled} color='primary' size="sm" onClick={() => {setShow(true), setEdit(false)}}>
                    {t('Нэмэх')}
                </Button>
            </CardHeader>
            <hr />
            <Tables datas={datas} handleDelete={handleDelete} handleEdit={handleEdit} is_role={disabled} />
            <Modal isOpen={show} toggle={() => setShow(!show)} className='modal-dialog-centered' onClosed={onModalClosed}>
                <ModalHeader className='bg-transparent pb-0' toggle={() => setShow(!show)}></ModalHeader>
                    <h5 className='text-center'>{t('ЭЕШ оноо')}</h5>
                    <ModalBody className='px-sm-3 pb-2'>
                        <Row tag={Form} className="gy-1 pb-2" onSubmit={handleSubmit(onSubmit)}>
                            <Col lg={12}>
                                <Label className="form-label" for="confirmation_num">
                                    {t('Батламжийн дугаар')}
                                </Label>
                                <Controller
                                    defaultValue=''
                                    control={control}
                                    id="confirmation_num"
                                    name="confirmation_num"
                                    render={({ field }) => (
                                        <Input
                                            id ="confirmation_num"
                                            bsSize="sm"
                                            placeholder={t('Батламжийн дугаар')}
                                            {...field}
                                            type="text"
                                            readOnly={disabled}
                                            disabled={disabled}
                                            invalid={errors.confirmation_num && true}
                                        />
                                    )}
                                />
                                {errors.confirmation_num && <FormFeedback className='d-block'>{errors.confirmation_num.message}</FormFeedback>}
                            </Col>
                            <Col lg={12}>
                                <Label className="form-label" for="admission_lesson">
                                    {t('Элсэлтийн шалгалтын хичээл')}
                                </Label>
                                <Controller
                                    defaultValue=''
                                    control={control}
                                    id="admission_lesson"
                                    name="admission_lesson"
                                    render={({ field: { value, onChange} }) => {
                                        return (
                                            <Select
                                                name="admission_lesson"
                                                id="admission_lesson"
                                                classNamePrefix='select'
                                                isClearable
                                                className={classnames('react-select', { 'is-invalid': errors.admission_lesson })}
                                                isLoading={isLoading}
                                                placeholder={t(`-- Сонгоно уу --`)}
                                                options={lesson_option || []}
                                                value={lesson_option.find((c) => c.id === value)}
                                                noOptionsMessage={() => t('Хоосон байна')}
                                                onChange={(val) => {
                                                    onChange(val?.id || '')
                                                }}
                                                isDisabled={disabled}
                                                styles={ReactSelectStyles}
                                                getOptionValue={(option) => option.id}
                                                getOptionLabel={(option) => option.lesson_name}
                                            />
                                        )
                                    }}
                                />
                                {errors.admission_lesson && <FormFeedback className='d-block'>{errors.admission_lesson.message}</FormFeedback>}
                            </Col>
                            <Col lg={12}>
                                <Label className="form-label" for="score">
                                    {t('Оноо')}
                                </Label>
                                <Controller
                                    defaultValue=''
                                    control={control}
                                    id="score"
                                    name="score"
                                    render={({ field }) => (
                                        <Input
                                            id ="score"
                                            bsSize="sm"
                                            {...field}
                                            placeholder={t('Оноо')}
                                            type="number"
                                            readOnly={disabled}
                                            disabled={disabled}
                                            invalid={errors.score && true}
                                            onKeyDown={(e) =>["e", "E", "+", "-"].includes(e.key) && e.preventDefault()}
                                        />
                                    )}
                                />
                                {errors.score && <FormFeedback className='d-block'>{errors.score.message}</FormFeedback>}
                            </Col>
                            <Col lg={12}>
                                <Label className="form-label" for="perform">
                                    {t('Гүйцэтгэлийн хувь')}
                                </Label>
                                <Controller
                                    defaultValue=''
                                    control={control}
                                    id="perform"
                                    name="perform"
                                    render={({ field }) => (
                                        <Input
                                            id ="perform"
                                            bsSize="sm"
                                            {...field}
                                            placeholder={t('Гүйцэтгэлийн хувь')}
                                            type="number"
                                            readOnly={disabled}
                                            disabled={disabled}
                                            onKeyDown={(e) =>["e", "E", "+", "-"].includes(e.key) && e.preventDefault()}
                                            invalid={errors.perform && true}
                                        />
                                    )}
                                />
                                {errors.perform && <FormFeedback className='d-block'>{errors.perform.message}</FormFeedback>}
                            </Col>
                            <Col lg={12}>
                                <Label className="form-label" for="exam_year">
                                    {t('Шалгалт өгсөн он')}
                                </Label>
                                <Controller
                                    defaultValue=''
                                    control={control}
                                    id="exam_year"
                                    name="exam_year"
                                    render={({ field }) => (
                                        <Input
                                            id ="exam_year"
                                            bsSize="sm"
                                            {...field}
                                            placeholder={t('Шалгалт өгсөн он')}
                                            type="number"
                                            readOnly={disabled}
                                            disabled={disabled}
                                            invalid={errors.exam_year && true}
                                            onKeyDown={(e) =>["e", "E", "+", "-", "."].includes(e.key) && e.preventDefault()}
                                        />
                                    )}
                                />
                                {errors.exam_year && <FormFeedback className='d-block'>{errors.exam_year.message}</FormFeedback>}
                            </Col>
                            <Col lg={12}>
                                <Label className="form-label" for="exam_location">
                                    {t('Шалгалт өгсөн газар')}
                                </Label>
                                <Controller
                                    defaultValue=''
                                    control={control}
                                    id="exam_location"
                                    name="exam_location"
                                    render={({ field }) => (
                                        <Input
                                            id ="exam_location"
                                            bsSize="sm"
                                            {...field}
                                            placeholder={t('Шалгалт өгсөн газар')}
                                            type="text"
                                            readOnly={disabled}
                                            disabled={disabled}
                                            invalid={errors.exam_location && true}
                                        />
                                    )}
                                />
                                {errors.exam_location && <FormFeedback className='d-block'>{errors.exam_location.message}</FormFeedback>}
                            </Col>
                            {
                                <Col className='text-center' md={12}>
                                    <Button disabled={disabled} size='sm' className="me-2" color="primary" type="submit">
                                        {is_edit ? t('Засах') : t('Хадгалах')}
                                    </Button>
                                    <Button color="secondary" size='sm' type="reset" outline onClick={onModalClosed}>
                                        {t('Буцах')}
                                    </Button>
                                </Col>
                            }
                        </Row>
                    </ModalBody>
            </Modal>
        </Card>
	);
};
export default AdmissionScore;
