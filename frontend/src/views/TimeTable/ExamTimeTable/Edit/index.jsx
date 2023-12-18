// ** React imports
import React, { Fragment, useState, useContext, useEffect } from 'react'

import { useTranslation } from 'react-i18next';

import Select from 'react-select'

import classnames from "classnames";

import { useForm, Controller } from "react-hook-form";

import { Eye } from 'react-feather';

import { Row, Col, Form, Modal, Input, Label, Button, ModalBody, ModalHeader, FormFeedback } from "reactstrap";

import useApi from "@hooks/useApi";
import useToast from "@hooks/useToast"
import useLoader from "@hooks/useLoader";
import AuthContext from "@context/AuthContext"
import SchoolContext from "@context/SchoolContext"
import ActiveYearContext from "@context/ActiveYearContext"

import { validate, ReactSelectStyles, convertDefaultValue } from "@utils"

import StudentList from "../StudentList";

import { validateSchema } from '../validateSchema';

const Editmodal = ({ editId, open, handleModal, refreshDatas }) => {

    var values = {
        lesson: '',
        teacher: '',
        class: '',
    }

    const addToast = useToast()
    const { t } = useTranslation()

    const { user } = useContext(AuthContext)
    const { school_id } = useContext(SchoolContext)
    const { cseason_id, cyear_name } = useContext(ActiveYearContext)

    const [is_disabled, setDisabled] = useState(true)
    const [lesson_option, setLessonOption] = useState([])
    const [teacher_option, setTeacherOption] = useState([])
    const [room_option, setRoomOption] = useState([])
    const [select_value, setSelectValue] = useState(values)
    const [online_checked, setOnlineChecked] = useState(false)
    const [room_capacity, setRoomCapacity] = useState('')
    const [student_list_view, setStudentListView] = useState(false)

    const [ studentData, setStudentDatas ] = useState([]);

    // ** Hook
    const { control, handleSubmit, setValue, setError, reset, watch, formState: { errors } } = useForm(validate(validateSchema));

	// Loader
	const { Loader, isLoading, fetchData } = useLoader({});

    // Api
    const teacherApi = useApi().hrms.teacher
    const lessonApi = useApi().study.lessonStandart
    const roomApi = useApi().timetable.room
    const examApi = useApi().timetable.exam

    useEffect(() => {
        if(user && Object.keys(user).length && user.permissions.includes('lms-timetable-exam-update') && school_id) {
            setDisabled(false)
        }
    },[])

    // Хичээлийн жагсаалт
    async function getLessonOption() {
        const { success, data } = await fetchData(lessonApi.getList())
        if(success) {
            setLessonOption(data)
        }
    }

    // Багшийн жагсаалт
    async function getTeachers() {
        const { success, data } = await fetchData(teacherApi.getTeacher(''))
        if(success) {
            setTeacherOption(data)
        }
    }

    // Шалгалт авах өрөөний жагсаалт
    async function getRoom() {
        const { success, data } = await fetchData(roomApi.getList(''))
        if(success) {
            setRoomOption(data)
        }
    }

    async function getDatas() {
        const { success, data } = await fetchData(examApi.getOne(editId))
        if(success) {
            // засах үед дата байх юм бол setValue-р дамжуулан утгыг харуулна
            if(data === null) return
            for(let key in data) {
                if(data[key] !== null) {
                    if (key === 'teacher') setValue(key, data[key]?.id)
                    else setValue(key, data[key])
                    if(key === 'lesson') {
                        setSelectValue({
                            lesson: data[key]?.id || '',
                            teacher: select_value.teacher,
                            class: select_value.class,
                        })
                        setValue(key, data[key]?.id)
                    }
                }
                else setValue(key, '')
                if(key === 'is_online') setOnlineChecked(data[key])
                if(key === 'room') {
                    setValue(key, data[key]?.id)
                    setRoomCapacity(data[key]?.id)
                }
            }
        }
    }

    useEffect(() => {
        if(editId) getDatas()
    },[open])

    // Шалгалт өгөх оюутнуудын id авах функц
    function handleSelectedModal(params) {
        if(studentData) {
            for (let i in studentData) {
                if(!params.includes(studentData[i].id)) {
                    studentData[i].selected = false
                }
                else {
                    studentData[i].selected = true
                }
            }
        }
        setValue('student', params)
    }

    function handleStudentModal() {
        setStudentListView(false)
    }

    const getStudentList = async() => {
        if(select_value.lesson) {
            const lessonId = select_value.lesson || ''

            const { success, data } = await fetchData(examApi.getExamStudent(lessonId, room_capacity, editId))
            if(success) {
                const selected_rows = []
                setStudentDatas(data)
                if(data) {
                    for(let i in data) {
                        if(data[i].selected) {
                            if(!selected_rows.includes(data[i].id)) {
                                selected_rows.push(data[i].id)
                            }
                        }
                    }
                }
                setValue('student', selected_rows)
            }
        }
	}

    useEffect(() => {
        getStudentList()
    },[select_value.lesson, room_capacity])

	async function onSubmit(cdata) {
        cdata['lesson_year'] = cyear_name
        cdata['lesson_season'] = cseason_id
        cdata['school'] = school_id
        cdata['is_online'] = online_checked
        cdata = convertDefaultValue(cdata)

        if(editId) {
            const { success, error } = await fetchData(examApi.put(cdata, editId))
            if(success) {
                reset()
                handleModal()
                refreshDatas()
            } else {
                for (let key in error) {
                    if(error[key].field === 'student') {
                        addToast(
                            {
                                type: 'warning',
                                text: error[key].msg
                            }
                        )
                    } else {
                        setError(error[key].field, { type: 'custom', message: error[key].msg });
                    }
                }
            }
        }
	}

    useEffect(() => {
        getRoom()
        getTeachers()
        getLessonOption()
    },[])

    function IsOnline(checked) {
        setOnlineChecked(checked)
        if(checked) {
            setValue('room', '')
        }
    }

	return (
        <Fragment>
            <Modal isOpen={open} toggle={handleModal} className="modal-dialog-centered modal-md" onClosed={handleModal}>
                <ModalHeader className='bg-transparent pb-0' toggle={handleModal}></ModalHeader>
                <ModalBody className="px-sm-3 pt-50 pb-3">
                    <div className='text-center'>
                        <h4>{t('Шалгалтын хуваарь засах')}</h4>
                    </div>
                    <Row tag={Form} className="gy-1" onSubmit={handleSubmit(onSubmit)}>
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
                                            classNamePrefix='select'
                                            isClearable
                                            className={classnames('react-select', { 'is-invalid': errors.lesson })}
                                            isLoading={isLoading}
                                            placeholder={t('-- Сонгоно уу --')}
                                            options={lesson_option || []}
                                            value={value && lesson_option.find((c) => c.id === value)}
                                            noOptionsMessage={() => t('Хоосон байна.')}
                                            onChange={(val) => {
                                                onChange(val?.id || '')
                                                setSelectValue({
                                                    lesson: val?.id || '',
                                                    teacher: select_value.teacher,
                                                    class: select_value.class,
                                                })
                                            }}
                                            isDisabled={is_disabled}
                                            styles={ReactSelectStyles}
                                            getOptionValue={(option) => option.id}
                                            getOptionLabel={(option) => option.name}
                                        />
                                    )
                                }}
                            ></Controller>
                            {errors.lesson && <FormFeedback className='d-block'>{t(errors.lesson.message)}</FormFeedback>}
                        </Col>
                        <Col xs={12}>
                            <Controller
                                control={control}
                                id="is_online"
                                name="is_online"
                                defaultValue={false}
                                render={({ field }) => (
                                    <Input
                                        id="is_online"
                                        type="checkbox"
                                        className='me-50'
                                        {...field}
                                        onChange={(e) =>
                                            IsOnline(e.target.checked)
                                        }
                                        checked={online_checked}
                                        disabled={is_disabled}
                                        readOnly={is_disabled}
                                    />
                                )}
                            />
                            <Label className="form-label" for="is_online">
								{t('Онлайн шалгалт эсэх')}
                            </Label>
                        </Col>
                        {
                            !online_checked &&
                            <Col md={12}>
                                <Label className="form-label" for="room">
                                    {t('Шалгалт авах өрөө')}
                                </Label>
                                <Controller
                                    control={control}
                                    defaultValue=''
                                    name="room"
                                    render={({ field: { value, onChange} }) => {
                                        return (
                                            <Select
                                                name="room"
                                                id="room"
                                                classNamePrefix='select'
                                                isClearable
                                                className={classnames('react-select', { 'is-invalid': errors.room })}
                                                isLoading={isLoading}
                                                placeholder={t('-- Сонгоно уу --')}
                                                options={room_option || []}
                                                value={value && room_option.find((c) => c.id === value)}
                                                noOptionsMessage={() => t('Хоосон байна.')}
                                                onChange={(val) => {
                                                    onChange(val?.id || '')
                                                    setRoomCapacity(val?.volume || '')
                                                }}
                                                isDisabled={is_disabled}
                                                styles={ReactSelectStyles}
                                                getOptionValue={(option) => option.id}
                                                getOptionLabel={(option) => option.full_name}
                                            />
                                        )
                                    }}
                                ></Controller>
                                {errors.room && <FormFeedback className='d-block'>{t(errors.room.message)}</FormFeedback>}
                            </Col>
                        }
                        {
                            select_value && select_value?.lesson && (online_checked || room_capacity) &&
                            <Col md={12}>
                                <Button disabled={is_disabled} color='primary' onClick={() => setStudentListView(!student_list_view)}>
                                    <Eye size="15" className='me-50' />{t('Оюутны жагсаалт')}
                                </Button>
                            </Col>
                        }
                        <Col md={12}>
                            <Label className="form-label" for="exam_date">
                                {t('Шалгалт авах өдөр')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id="exam_date"
                                name="exam_date"
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        id="exam_date"
                                        bsSize="sm"
                                        placeholder={t('Шалгалт авах өдөр')}
                                        type="date"
                                        disabled={is_disabled}
                                        readOnly={is_disabled}
                                        invalid={errors.exam_date && true}
                                    />
                                )}
                            />
                            {errors.exam_date && <FormFeedback className='d-block'>{t(errors.exam_date.message)}</FormFeedback>}
                        </Col>
                        <Col md={12}>
                            <Label className="form-label" for="begin_time">
                                {t('Эхлэх цаг')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id="begin_time"
                                name="begin_time"
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        id="begin_time"
                                        bsSize="sm"
                                        placeholder={t('Эхлэх цаг')}
                                        type="time"
                                        disabled={is_disabled}
                                        readOnly={is_disabled}
                                        invalid={errors.begin_time && true}
                                    />
                                )}
                            />
                            {errors.begin_time && <FormFeedback className='d-block'>{t(errors.begin_time.message)}</FormFeedback>}
                        </Col>
                        <Col md={12}>
                            <Label className="form-label" for="end_time">
                                {t('Дуусах цаг')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id="end_time"
                                name="end_time"
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        id="end_time"
                                        bsSize="sm"
                                        placeholder={t('Дуусах цаг')}
                                        type="time"
                                        disabled={is_disabled}
                                        readOnly={is_disabled}
                                        invalid={errors.end_time && true}
                                    />
                                )}
                            />
                            {errors.end_time && <FormFeedback className='d-block'>{t(errors.end_time.message)}</FormFeedback>}
                        </Col>
                        <Col md={12}>
                            <Label className="form-label" for="teacher">
                                {t('Хянах багш')}
                            </Label>
                            <Controller
                                control={control}
                                defaultValue=''
                                name="teacher"
                                render={({ field: { value, onChange} }) => {
                                    return (
                                        <Select
                                            name="teacher"
                                            id="teacher"
                                            classNamePrefix='select'
                                            isClearable
                                            className={classnames('react-select', { 'is-invalid': errors.teacher })}
                                            isLoading={isLoading}
                                            placeholder={t('-- Сонгоно уу --')}
                                            options={teacher_option || []}
                                            value={value && teacher_option.find((c) => c.id === value)}
                                            noOptionsMessage={() => t('Хоосон байна.')}
                                            onChange={(val) => {
                                                onChange(val?.id || '')
                                            }}
                                            isDisabled={is_disabled}
                                            styles={ReactSelectStyles}
                                            getOptionValue={(option) => option.id}
                                            getOptionLabel={(option) => option.full_name}
                                        />
                                    )
                                }}
                            ></Controller>
                            {errors.teacher && <FormFeedback className='d-block'>{t(errors.teacher.message)}</FormFeedback>}
                        </Col>
                        <Col md={12} className="mt-2 text-center">
                            <Button disabled={is_disabled} className="me-2" size='sm' color="primary" type="submit">
                                {t('Хадгалах')}
                            </Button>
                            <Button color="secondary" size='sm' type="reset" outline  onClick={handleModal}>
                                {t('Буцах')}
                            </Button>
                        </Col>
                    </Row>
                    {
                        student_list_view &&
                        <StudentList
                            open={student_list_view}
                            handleModal={handleStudentModal}
                            handleSelectedModal={handleSelectedModal}
                            datas={studentData}
                        />
                    }
                </ModalBody>
            </Modal>
        </Fragment>
	);
};
export default Editmodal;
