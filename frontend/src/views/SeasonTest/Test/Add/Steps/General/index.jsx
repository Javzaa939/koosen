import { useState, Fragment, useEffect } from 'react';
import { useForm, Controller } from "react-hook-form";
import { convertDefaultValue, ReactSelectStyles, validate } from "@utils";
import { validateSchema } from "./validationSchema";
import { useTranslation } from 'react-i18next'
import { ChevronLeft, ChevronRight, X } from 'react-feather'
import {
	Card,
    Row,
    Form,
    Col,
    Label,
    Input,
    Button,
    FormFeedback,
} from "reactstrap";

import Select from 'react-select';
import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';
import Flatpickr from 'react-flatpickr';
import '@styles/react/libs/flatpickr/flatpickr.scss';

const General = ({ stepper, setSubmitDatas, setSelectedLesson, editData, setEditRowData, isEdit, errorRows, setSelectExam }) => {
    const { t } = useTranslation()

    const { control, handleSubmit, setError, setValue, getValues, formState: { errors } } = useForm(validate(validateSchema))
	const { fetchData } = useLoader({ isFullScreen: true });
    const [lessonOption, setLessonOption] = useState([])
    const [timeTableOption, setTimeTableOption] = useState([])
    const [isRepeat, setIsRepeat] = useState(false)
	const [startPicker, setStartPicker] = useState(new Date())

    const teacherLessonApi = useApi().study.lesson
    const examTimeTableApi = useApi().timetable.exam
    const reApi = useApi().timetable.re_exam

    async function onSubmit(cdata) {
        delete cdata['exam_timetable']
        cdata = convertDefaultValue(cdata)

        setSubmitDatas(cdata)
        stepper.next()
	}

    useEffect(() => {
        // Алдаа буцаасан байвал ерөнхий мэдээлэл хуудас руу буцна
        if(errorRows && Object.keys(errorRows)?.length > 0) {
            /** Алдааны мессэжийг input дээр харуулна */
            for (let key in errorRows) {
                setError(key, { type: 'custom', message: errorRows[key][0]});
            }
            stepper.previous()
        }
    }, [errorRows])

    async function getLesson()
    {
        const { success, data } = await fetchData(teacherLessonApi.getOne(''))
        if(success) {
            setLessonOption(data)
        }
    }

    async function getExamTimeTableDatas() {
        if (isRepeat) {
            const { success, data } = await fetchData(reApi.getList())
            if(success) {
                console.log(data)
                setTimeTableOption(data)
            }
        } else {
            const { success, data } = await fetchData(examTimeTableApi.getList(true))
            if(success) {
                setTimeTableOption(data)
            }
        }
    }

    useEffect(
        () =>
        {
            getLesson()
        },
        []
    )

    useEffect(
        () =>
        {
            getExamTimeTableDatas()
        },
        [isRepeat]
    )

    return (
        <Fragment>
            <Card className="flex-grow-50 mb-3 t-0">
                <Row tag={Form} className="gy-1" onSubmit={handleSubmit(onSubmit)}>
                    <Col md={6}>
                        <Label className="form-label" for="title">
                            {t('Гарчиг')}
                        </Label>
                        <Controller
                            defaultValue=''
                            control={control}
                            id="title"
                            name="title"
                            render={({ field }) => (
                                <Input
                                    {...field}
                                    id="title"
                                    bsSize="sm"
                                    placeholder={'Гарчиг'}
                                    type="text"
                                    invalid={errors.title && true}
                                />
                            )}
                        />
                        {errors.title && <FormFeedback className='d-block'>{t(errors.title.message)}</FormFeedback>}
                    </Col>
                    <Col md={6} className='mt-3'>
                        <Controller
                            control={control}
                            name="is_repeat"
                            defaultValue={false}
                            render={({ field }) => (
                                <Input
                                    {...field}
                                    id={field.name}
                                    type="checkbox"
                                    onChange={(e) => setIsRepeat(e.target.checked)}
                                    checked={field.value || isRepeat}
                                    className='me-50'
                                />
                            )}
                        />
                        <Label className="form-label" for="is_repeat">
                            {t('Давтан шалгалт эсэх')}
                        </Label>
                        {errors.is_repeat && <FormFeedback className='d-block'>{t(errors.is_repeat.message)}</FormFeedback>}
                    </Col>
                    <Col md={6}>
                        <Label className="form-label" for="exam_timetable">
                            {t('Шалгалтын хуваарь')}
                        </Label>
                        <Controller
                            control={control}
                            defaultValue=''
                            name="exam_timetable"
                            render={({ field: { value, onChange} }) => {
                                return (
                                    <Select
                                        id="exam_timetable"
                                        name="exam_timetable"
                                        isClearable
                                        classNamePrefix='select'
                                        className='react-select'
                                        placeholder={t(`-- Сонгоно уу --`)}
                                        value={timeTableOption.find((c) => c.id === value)}
                                        options={timeTableOption || []}
                                        noOptionsMessage={() => 'Хоосон байна'}
                                        onChange={(val) => {
                                            onChange(val?.id || '')
                                            setSelectedLesson(val?.lesson || '')
                                            setSelectExam(val?.id || '')

                                            setValue("lesson", val?.lesson)
                                            setValue("start_date", val?.begin_date)
                                            setValue("end_date", val?.end_date)
                                        }}
                                        styles={ReactSelectStyles}
                                        getOptionValue={(option) => option.id}
                                        getOptionLabel={(option) => option.lesson_code + ' ' + option.lesson_name}
                                    />
                                )
                            }}
                        ></Controller>
                        {errors.exam_timetable && <FormFeedback className='d-block'>{t(errors.exam_timetable.message)}</FormFeedback>}
                    </Col>
                    <Col md={12}>
                        <Label className="form-label" for="description">
                            {t('Тайлбар')}
                        </Label>
                        <Controller
                            defaultValue={''}
                            control={control}
                            id="description"
                            name="description"
                            render={({ field }) => (
                                <Input
                                    {...field}
                                    id="description"
                                    bsSize="sm"
                                    placeholder={'Тайлбар'}
                                    type="textarea"
                                    invalid={errors.description && true}
                                    rows={'3'}
                                />
                            )}
                        />
                        {errors.description && <FormFeedback className='d-block'>{t(errors.description.message)}</FormFeedback>}
                    </Col>
                    <Col md={6} className='mt-50'>
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
                                        id="lesson"
                                        name="lesson"
                                        isClearable
                                        classNamePrefix='select'
                                        className='react-select'
                                        placeholder={t(`-- Сонгоно уу --`)}
                                        value={lessonOption.find((c) => c.id === value)}
                                        options={lessonOption || []}
                                        noOptionsMessage={() => 'Хоосон байна'}
                                        onChange={(val) => {
                                            onChange(val?.id || '')
                                            setSelectedLesson(val?.id || '')
                                        }}
                                        styles={ReactSelectStyles}
                                        getOptionValue={(option) => option.id}
                                        getOptionLabel={(option) => option.code + ' ' + option.name}
                                    />
                                )
                            }}
                        ></Controller>
                        {errors.lesson && <FormFeedback className='d-block'>{t(errors.lesson.message)}</FormFeedback>}
                    </Col>
                    <Col md={6} className='mt-50'>
                        <Label className="form-label" for="duration">
                            {t('Үргэлжлэх хугацаа (минутаар)')}
                        </Label>
                        <Controller
                            defaultValue=''
                            control={control}
                            id="duration"
                            name="duration"
                            render={({ field }) => (
                                <Input
                                    {...field}
                                    id ="duration"
                                    bsSize="sm"
                                    placeholder={'Үргэлжлэх хугацаа (минутаар)'}
                                    type="number"
                                    invalid={errors.duration && true}
                                />
                            )}
                        />
                        {errors.duration && <FormFeedback className='d-block'>{t(errors.duration.message)}</FormFeedback>}
                    </Col>
                    <Col md={6} className='mt-50'>
                        <Label className="form-label" for="start_date">
                            {t('Эхлэх хугацаа')}
                        </Label>
                        <Controller
                            defaultValue=''
                            control={control}
                            name="start_date"
                            render={({ field }) => (
                                <Input
                                    {...field}
                                    id={field.name}
                                    bsSize="sm"
                                    placeholder={t('Эхлэх хугацаа')}
                                    type="datetime-local"
                                    invalid={errors[field.name] && true}
                                />
                            )}
                        />
                        {errors.start_date && <FormFeedback className='d-block'>{t(errors.start_date.message)}</FormFeedback>}
                    </Col>
                    <Col md={6} className='mt-50'>
                        <Label className="form-label" for="end_date">
                            {t('Дуусах хугацаа')}
                        </Label>
                        <Controller
                            defaultValue=''
                            control={control}
                            name="end_date"
                            render={({ field }) => (
                                <Input
                                    {...field}
                                    id={field.name}
                                    bsSize="sm"
                                    placeholder={t('Дуусах хугацаа')}
                                    type="datetime-local"
                                    invalid={errors[field.name] && true}
                                />
                            )}
                        />
                        {errors.end_date && <FormFeedback className='d-block'>{t(errors.end_date.message)}</FormFeedback>}
                    </Col>
                    <Col md={6} className='mt-50'>
                        <Label className="form-label" for="question_count">
                            {t('Асуултын тоо')}
                        </Label>
                        <Controller
                            defaultValue=''
                            control={control}
                            id="question_count"
                            name="question_count"
                            render={({ field }) => (
                                <Input
                                    {...field}
                                    id ="question_count"
                                    bsSize="sm"
                                    placeholder={'Асуултын тоо'}
                                    type="number"
                                    invalid={errors.question_count && true}
                                />
                            )}
                        />
                        {errors.question_count && <FormFeedback className='d-block'>{t(errors.question_count.message)}</FormFeedback>}
                    </Col>
                    <Col md={6} className='mt-50'>
                        <Label className="form-label" for="try_number">
                            {t('Оролдлогын тоо')}
                        </Label>
                        <Controller
                            defaultValue=''
                            control={control}
                            name="try_number"
                            render={({ field }) => (
                                <Input
                                    {...field}
                                    id={field.name}
                                    bsSize="sm"
                                    placeholder={'Оролдлогын тоо'}
                                    type="number"
                                    invalid={errors[field.name] && true}
                                />
                            )}
                        />
                        {errors.try_number && <FormFeedback className='d-block'>{t(errors.try_number.message)}</FormFeedback>}
                    </Col>
                    <Col md={12} className='mt-50'>
                        <Controller
                            control={control}
                            name="is_open"
                            defaultValue={false}
                            render={({ field }) => (
                                <Input
                                    {...field}
                                    id={field.name}
                                    type="checkbox"
                                    checked={field.value}
                                    className='me-50'
                                />
                            )}
                        />
                        <Label className="form-label" for="is_open">
                            {t('Нээлттэй эсэх')}
                        </Label>
                        {errors.is_open && <FormFeedback className='d-block'>{t(errors.is_open.message)}</FormFeedback>}
                    </Col>
                    <Col md={12} className='mt-50'>
                        <Controller
                            control={control}
                            name="has_shuffle"
                            defaultValue={false}
                            render={({ field }) => (
                                <Input
                                    {...field}
                                    id={field.name}
                                    type="checkbox"
                                    checked={field.value}
                                    className='me-50'
                                />
                            )}
                        />
                        <Label className="form-label" for="has_shuffle">
                            {t('Шалгалтын асуултыг оюутан бүрээр холих эсэх')}
                        </Label>
                        {errors.has_shuffle && <FormFeedback className='d-block'>{t(errors.has_shuffle.message)}</FormFeedback>}
                    </Col>
                    <Col md={12} className='d-flex justify-content-between mt-3 mb-1'>
                        <Button color='secondary' className='btn-prev' outline onClick={() => stepper.previous()}>
                            <ChevronLeft size={14} className='align-middle me-sm-25 me-0'></ChevronLeft>
                            <span className='align-middle d-sm-inline-block d-none'>Өмнөх</span>
                        </Button>
                        <Button color='primary' className='btn-next' type="submit">
                            <span className='align-middle d-sm-inline-block d-none'>Дараах</span>
                            <ChevronRight size={14} className='align-middle ms-sm-25 ms-0'></ChevronRight>
                        </Button>
                    </Col>
                </Row>
            </Card>
        </Fragment>
    )
}
export default General