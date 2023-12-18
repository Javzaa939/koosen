import React, { Fragment, useState, useContext, useEffect } from 'react'
import {
    Col,
    Row,
    Form,
    Modal,
    Label,
    Input,
    Button,
    Spinner,
    ModalBody,
    ModalHeader,
    FormFeedback,
} from 'reactstrap'
import Select from 'react-select'
import { X } from 'react-feather'
import useApi from '@hooks/useApi';
import classnames from 'classnames'
import useLoader from '@hooks/useLoader';
import { useTranslation } from 'react-i18next'
import AuthContext from "@context/AuthContext"
import SchoolContext from "@context/SchoolContext"
import { Controller, useForm } from 'react-hook-form'
import { validateSchema } from '../Add/validateSchema'
import ActiveYearContext from "@context/ActiveYearContext"
import { validate, ReactSelectStyles, convertDefaultValue } from '@utils'
import Flatpickr from 'react-flatpickr'
// flatpickr style
import '@styles/react/libs/flatpickr/flatpickr.scss'
import moment from 'moment';


const AddModal = ({ isOpen, handleAddModal, refreshDatas }) => {

    const { t } = useTranslation()

    const closeBtn = (
        <X className='cursor-pointer' size={15} onClick={handleAddModal} />
    )

	const { user } = useContext(AuthContext)
    const { school_id } = useContext(SchoolContext)
    const { cseason_id, cyear_name } = useContext(ActiveYearContext)

    // ** Hook
    const { control, handleSubmit, formState: { errors },clearErrors, reset, setError } = useForm(validate(validateSchema));

    const { isLoading, Loader, fetchData } = useLoader({ })
    const { isLoading: postLoading, fetchData: postFetch } = useLoader({});

    const [select_teacher, setTeacherOption] = useState([])
    const [select_lesson, setLessonOption] = useState([])
    const [score_type_option, setScoreTypeOption] = useState([])
    const [teacher_id , setTeacherId] = useState('')
    const [lesson_id , setLessonId] = useState('')

    const [startPicker, setStartPicker] = useState(new Date());


    const hourDelay = (date) => {
        if (!date) {
            return null;
        }

        const newDate = new Date(date.getTime() + (24 * 60 * 60 * 1000));
        return newDate;
    };

    const [endPicker, setEndPicker] = useState(hourDelay(startPicker));

    // Api
    const permissionsTeacherApi = useApi().role.teacherscore

    // Багшийн жагсаалт
    async function getTeacherOption() {
        const { success, data } = await fetchData(permissionsTeacherApi.getTeacher())
        if(success) {
            setTeacherOption(data)
        }
    }

    // Багшаас хамаарч хичээлүүдийн жагсаалт
    async function getLessonOption() {
        if(teacher_id)
        {
            const { success, data } = await fetchData(permissionsTeacherApi.getLesson(teacher_id))
            if(success) {
                setLessonOption(data)
            }
        }
    }
    // Дүгнэх хэлбэрүүд
    async function getTypeOption() {
        if (teacher_id && lesson_id){
            const { success, data } = await fetchData(permissionsTeacherApi.getType(teacher_id, lesson_id))
            if(success) {
                setScoreTypeOption(data)
            }
        }
        else {

            setScoreTypeOption([])
        }
    }

    async function onSubmit(cdata) {

        cdata['created_user'] = user.id
        cdata['updated_user'] = user.id
        cdata['lesson_season']= cseason_id
        cdata['lesson_year']= cyear_name
        cdata['start_date']= moment(startPicker).format('YYYY-MM-DD HH:mm:ss')
        cdata['finish_date']= moment(endPicker).format('YYYY-MM-DD HH:mm:ss')
        cdata = convertDefaultValue(cdata)
        const { success, error } = await postFetch(permissionsTeacherApi.post(cdata))
        if(success) {
            reset()
            refreshDatas()
            handleAddModal()
        }
        else {
            /** Алдааны мессеж */
            for (let key in error) {
                setError(error[key].field, { type: 'custom', message: error[key].msg});
            }
        }
    }


    const handleEndDate = (date) => {
        var end_date = new Date(date);

            if (!startPicker) {
                if (end_date > startPicker) {
                    setError('end_date', { type: 'custom', message: 'Эхлэх хугацаанаас өмнө байх боломжгүй !' });
                } else {
                    setEndPicker(end_date);
                    clearErrors('start_date');
                    clearErrors('end_date');
                }
            } else {
                var start = new Date;
                if (end_date < start ) {
                    setError('start_date', { type: 'custom', message: 'Эхлэх хугацаанаас өмнө байх боломжгүй' });
                    setError('end_date', { type: 'custom', message: 'Дуусах хугацаа нь эхлэх хугацаанаас өмнө байх боломжгүй' });

                } else {
                    setEndPicker(end_date);
                    clearErrors('start_date');
                    clearErrors('end_date');
                }
            }
        }



    const handleStartPicker = (dates) => {
        const start_date = new Date(dates);
        const end_date = new Date(endPicker);

            if (start_date > end_date) {
                setError('start_date', { type: 'custom', message: 'Дуусах хугацаанаас хойш байх боломжгүй' });
            } else {
                setStartPicker(dates)
                clearErrors('start_date')
            }
    };


    useEffect(() =>{
        getTeacherOption()
    }, [])

    useEffect(() =>{
        getLessonOption()
    }, [teacher_id])

    useEffect(() => {
        getTypeOption()
    }, [ teacher_id,lesson_id])


    return (
        <Fragment>
            {isLoading && Loader}
            <Modal
                isOpen={isOpen}
                toggle={handleAddModal}
                className="sidebar-md hr-register"
                modalClassName="modal-slide-in "
                contentClassName="pt-0"
            >
                <ModalHeader
                    className="mb-1"
                    toggle={handleAddModal}
                    close={closeBtn}
                    tag="div"
                >
                    <h5 className="modal-title">{t('Багшийн дүн оруулах эрх нэмэх')}</h5>
                </ModalHeader>
                <ModalBody className='flex-grow-1'>
                    <Row tag={Form} className='gy-1' onSubmit={handleSubmit(onSubmit)}>
                        <Col sm={12}>
                            <Label className='form-label' for='teacher'>
                                {t('Багш')}
                            </Label>
                            <Controller
                                control={control}
                                defaultValue=''
                                name="teacher"
                                render={({ field: { onChange } }) => {
                                    return (
                                        <Select
                                            name="teacher"
                                            id="teacher"
                                            classNamePrefix='select'
                                            isClearable
                                            className={classnames('react-select', {'is-invalid': errors.teacher})}
                                            isLoading={isLoading}
                                            placeholder={t('-- Сонгоно уу --')}
                                            options={select_teacher || []}
                                            noOptionsMessage={() => t('Хоосон байна')}
                                            onChange={(val) => {
                                                onChange(val?.id || '')
                                                setTeacherId(val?.id || '')
                                            }}
                                            styles={ReactSelectStyles}
                                            getOptionValue={(option) => option.id}
                                            getOptionLabel={(option) => option.code}
                                        />
                                    )
                                }}
                            />
                            {errors.teacher && <FormFeedback className='d-block'>{t(errors.teacher.message)}</FormFeedback>}
                        </Col>
                        <Col xl={12}>
                            <Label className='form-label' for='lesson'>
                                {t('Хичээл')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                name='lesson'
                                render={({ field: { onChange } }) => {
                                    return (
                                        <Select
                                            name="lesson"
                                            id="lesson"
                                            classNamePrefix='select'
                                            isClearable
                                            className={classnames('react-select', {'is-invalid': errors.lesson})}
                                            isLoading={isLoading}
                                            placeholder={t('-- Сонгоно уу --')}
                                            options={select_lesson || []}
                                            noOptionsMessage={() => t('Хоосон байна')}
                                            onChange={(val) => {
                                                onChange(val?.id || '')
                                                setLessonId(val?.id || '')
                                            }}
                                            styles={ReactSelectStyles}
                                            getOptionValue={(option) => option.id}
                                            getOptionLabel={(option) => option.code_name}
                                        />
                                    )
                                }}
                            />
                            {errors.lesson_teacher && <FormFeedback className='d-block'>{t(errors.lesson_teacher.message)}</FormFeedback>}
                        </Col>
                        <Col xl={12}>
                            <Label className='form-label' for='teacher_scoretype'>
                                {t('Дүгнэх хэлбэр')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                name='teacher_scoretype'
                                render={({ field: {value,  onChange } }) => {
                                    return (
                                        <Select
                                            name="teacher_scoretype"
                                            id="teacher_scoretype"
                                            classNamePrefix='select'
                                            isClearable
                                            className={classnames('react-select', {'is-invalid': errors.teacher_scoretype })}
                                            isLoading={isLoading}
                                            placeholder={t('-- Сонгоно уу --')}
                                            options={score_type_option || []}
                                            noOptionsMessage={() => t('Хоосон байна')}
                                            onChange={(val) => {
                                                onChange(val?.id || '')
                                            }}
                                            styles={ReactSelectStyles}
                                            getOptionValue={(option) => option.id}
                                            getOptionLabel={(option) => option.score_type_name}
                                        />
                                    )
                                }}
                            />
                            {errors.teacher_scoretype && <FormFeedback className='d-block'>{t(errors.teacher_scoretype.message)}</FormFeedback>}
                        </Col>
                        <Col xl={12}>
                            <Label className='form-label' for='description'>
                                {t('Тайлбар')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                name='description'
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        type='textarea'
                                        name='description'
                                        id='description'
                                        bsSize='sm'
                                        invalid={errors.description && true}
                                    />
                                )}
                            />
                            {errors.description && <FormFeedback className='d-block'>{t(errors.description.message)}</FormFeedback>}
                        </Col>
                        <Col xl={12}>
                            <Label className='form-label' for='start_date'>
                                {t('Эхлэх хугацаа')}
                            </Label>
                            <Controller
                                defaultValue={new Date()}
                                control={control}
                                name='start_date'
                                className="form-control"
                                render={({}) => {
                                    return (
                                        <Flatpickr
                                            id='start_date'
                                            className='form-control'
                                            onChange={dates => {
                                               handleStartPicker(dates[0]);
                                                }}
                                            value={startPicker}
                                            style={{height: "30px"}}
                                            options={{
                                                enableTime: true,
                                                dateFormat: 'Y-m-d H:i',
                                                utc: true,
                                                time_24hr: true,
                                                // locale: Mongolian
                                            }}
                                        />
                                    )
                                }}
                            />
                                {errors.start_date && <FormFeedback className='d-block'>{t(errors.start_date.message)}</FormFeedback>}
                        </Col>

                        <Col>
                            <Label className='form-label' for='end'>
                                Дуусах хугацаа
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                value={endPicker}
                                className={classnames({ 'is-invalid': errors.end_date })}

                                name='end_date'
                                render={() => (
                                <Flatpickr
                                    id='end_date'
                                    name='end_date'
                                    className={`form-control`}
                                    onChange={date => handleEndDate(date[0])}
                                    value={endPicker}
                                    style={{ height: "30px" }}
                                    options={{
                                        enableTime: true,
                                        dateFormat: 'Y-m-d H:i',
                                        // minDate: new Date(startPicker),
                                        time_24hr: true,
                                        // locale: Mongolian
                                    }}
                                />
                                )}
                                />
                                {errors.end_date && <FormFeedback className='d-block'>{t(errors.end_date.message)}</FormFeedback>}
                        </Col>
                        <Col md={12} className="mt-2">
                            <Button className="me-2" color="primary" type="submit" disabled={postLoading}>
                            {postLoading &&<Spinner size='sm' className='me-1'/>}
                                {t('Хадгалах')}
                            </Button>
                            <Button color="secondary" outline type="reset" onClick={handleAddModal}>
                                {t('Буцах')}
                            </Button>
                        </Col>
                    </Row>
                </ModalBody>
            </Modal>
        </Fragment>
    )
}
export default AddModal

