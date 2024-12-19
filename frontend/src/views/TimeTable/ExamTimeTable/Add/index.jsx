// ** React imports
import React, { Fragment, useContext, useState, useEffect } from 'react'

import { X } from "react-feather";

import useApi from "@hooks/useApi";
import useLoader from "@hooks/useLoader";
import useToast from "@hooks/useToast"
import SchoolContext from "@context/SchoolContext"
import ActiveYearContext from "@context/ActiveYearContext"

import Select from 'react-select'

import { useTranslation } from 'react-i18next';

import { useForm, Controller } from "react-hook-form";

import { Eye } from 'react-feather';

import { Row, Col, Form, Modal, Input, Label, Button, ModalBody, ModalHeader, FormFeedback, Spinner } from "reactstrap";

import { validate, ReactSelectStyles, convertDefaultValue, examType } from "@utils"

import { validateSchema } from '../validateSchema';

import StudentList from "../StudentList";

import classnames from 'classnames';

const Addmodal = ({ open, handleModal, refreshDatas }) => {

    var values = {
        lesson: '',
        teacher: '',
        class: '',
    }

    const CloseBtn = (
        <X className="cursor-pointer" size={15} onClick={handleModal} />
    )
    const addToast = useToast()

    const { t } = useTranslation()

    const { school_id } = useContext(SchoolContext)
    const { cseason_id, cyear_name } = useContext(ActiveYearContext)

    const [lesson_option, setLessonOption] = useState([])
    const [teacher_option, setTeacherOption] = useState([])
    const [room_option, setRoomOption] = useState([])
    const [select_value, setSelectValue] = useState(values)
    const [online_checked, setOnlineChecked] = useState(false)
    const [room_capacity, setRoomCapacity] = useState('')

    const [student_list_view, setStudentListView] = useState(false)
    const [ studentData, setStudentDatas ] = useState([]);

    // ** Hook
    const { control, handleSubmit, formState: { errors }, setError, setValue } = useForm(validate(validateSchema));

    // Loader
    const { Loader, isLoading, fetchData } = useLoader({ isSmall:true });
	const { isLoading: postLoading, fetchData: postFetch } = useLoader({});

    // Api
    const teacherApi = useApi().hrms.teacher
    const lessonApi = useApi().study.lessonStandart
    const roomApi = useApi().timetable.room
    const examApi = useApi().timetable.exam

    // Хичээлийн жагсаалт
    async function getLessonOption() {
        const { success, data } = await fetchData(lessonApi.getList(school_id))
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

    // Өрөөний жагсаалт
    async function getRoom() {
        const { success, data } = await fetchData(roomApi.getList(''))
        if (success) {
            setRoomOption(data)
        }
    }

    // Оюутны жагсаалт
    const getStudentList = async() => {
        if(select_value.lesson) {
            const lessonId = select_value.lesson || ''

            const { success, data } = await fetchData(examApi.getExamStudent(lessonId, room_capacity))
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

    function IsOnline(checked) {
        setOnlineChecked(checked)
        if(checked) {
            setValue('room', '')
        }
    }


    async function onSubmit(cdata) {
        cdata['lesson_year'] = cyear_name
        cdata['lesson_season'] = cseason_id
        cdata['school'] = school_id
        cdata['is_online'] = online_checked

        if (online_checked) {
            cdata['room'] = null
        }
        cdata = convertDefaultValue(cdata)
        const { success, error } = await postFetch(examApi.post(cdata))
        if (success) {
            handleModal()
            refreshDatas()
        } else {
            /** Алдааны мессэжийг input дээр харуулна */
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

    useEffect(() => {
        getRoom()
        getTeachers()
        getLessonOption()
    }, [])

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

    return (
        <Fragment>
            <Modal
                isOpen={open}
                toggle={handleModal}
                className="sidebar-xl"
                modalClassName="modal-slide-in "
                contentClassName="pt-0"
            >
                <ModalHeader
                    className="mb-1"
                    toggle={handleModal}
                    close={CloseBtn}
                    tag="div"
                >
                    <h5 className="modal-title">{t('Шалгалтын хуваарь бүртгэх')}</h5>
                </ModalHeader>
                <ModalBody className="flex-grow-1">
                    <Row tag={Form} className="gy-1" onSubmit={handleSubmit(onSubmit)}>
                        <Col md={6}>
                            <Label className="form-label" for="lesson">
                                {t('Хичээл')}
                            </Label>
                            <Controller
                                control={control}
                                defaultValue=''
                                name="lesson"
                                render={({ field: { value, onChange } }) => {
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
                                            styles={ReactSelectStyles}
                                            getOptionValue={(option) => option.id}
                                            getOptionLabel={(option) => option.code + ' ' + option.name}
                                        />
                                    )
                                }}
                            ></Controller>
                            {errors.lesson && <FormFeedback className='d-block'>{t(errors.lesson.message)}</FormFeedback>}
                        </Col>
                        <Col md={6}>
                            <Label className="form-label" for="stype">
                                {t('Шалгалт авах төрөл')}
                            </Label>
                            <Controller
                                control={control}
                                defaultValue=''
                                name="stype"
                                render={({ field: { value, onChange } }) => {
                                    return (
                                        <Select
                                            name="stype"
                                            id="stype"
                                            classNamePrefix='select'
                                            isClearable
                                            className={classnames('react-select', { 'is-invalid': errors.stype })}
                                            isLoading={isLoading}
                                            placeholder={t('-- Сонгоно уу --')}
                                            options={examType() || []}
                                            value={value && examType().find((c) => c.id === value)}
                                            noOptionsMessage={() => t('Хоосон байна.')}
                                            onChange={(val) => {
                                                onChange(val?.id || '')
                                            }}
                                            styles={ReactSelectStyles}
                                            getOptionValue={(option) => option.id}
                                            getOptionLabel={(option) => option.name}
                                        />
                                    )
                                }}
                            >
                            </Controller>
                            {errors.stype && <FormFeedback className='d-block'>{t(errors.stype.message)}</FormFeedback>}
                        </Col>
                        <Row>
                            <Col md={6} className="pt-2">
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
                                        />
                                    )}
                                />
                                <Label className="form-label" for="is_online">
                                    {t('Онлайн шалгалт эсэх')}
                                </Label>
                            </Col>
                        </Row>
                        <Col md={6}>
                            <Label className="form-label" for="room">
                                {t('Шалгалт авах өрөө')}
                            </Label>
                            <Controller
                                control={control}
                                defaultValue=''
                                name="room"
                                render={({ field: { value, onChange } }) => {
                                    return (
                                        <Select
                                            name="room"
                                            id="room"
                                            classNamePrefix='select'
                                            isDisabled={online_checked}
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
                                            styles={ReactSelectStyles}
                                            getOptionValue={(option) => option.id}
                                            getOptionLabel={(option) => option.full_name}
                                        />
                                    )
                                }}
                            >
                            </Controller>
                            {errors.room && <FormFeedback className='d-block'>{t(errors.room.message)}</FormFeedback>}
                        </Col>
                        <Col md={6}>
                            <Label className="form-label" for="room_name">
                                {t('Шалгалт авах анги танхимийн нэр')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                name="room_name"
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        id={field.name}
                                        disabled={online_checked}
                                        bsSize="sm"
                                        placeholder={t('Анги танхимийн нэр')}
                                        type="text"
                                        invalid={errors[field.name] && true}
                                    />
                                )}
                            />
                            {errors.room_name && <FormFeedback className='d-block'>{t(errors.room_name.message)}</FormFeedback>}
                        </Col>
                        <Col md={6}>
                            <Label className="form-label" for="begin_date">
                                {t('Эхлэх хугацаа')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                name="begin_date"
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
                            {errors.begin_date && <FormFeedback className='d-block'>{t(errors.begin_date.message)}</FormFeedback>}
                        </Col>
                        <Col md={6}>
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
                        <Col md={6}>
                            <Label className="form-label" for="teacher">
                                {t('Хянах багш')}
                            </Label>
                            <Controller
                                control={control}
                                defaultValue=''
                                name="teacher"
                                render={({ field: { value, onChange } }) => {
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
                                            styles={ReactSelectStyles}
                                            getOptionValue={(option) => option.id}
                                            getOptionLabel={(option) => option.full_name}
                                        />
                                    )
                                }}
                            ></Controller>
                            {errors.teacher && <FormFeedback className='d-block'>{t(errors.teacher.message)}</FormFeedback>}
                        </Col>
                        {/* <Col xs={12}>
                            <Label className="form-label" for="student">
                                {t("Нэмэлтээр шалгалт өгч буй оюутан")}
                            </Label>
                            <Controller
                                control={control}
                                defaultValue=''
                                name="student"
                                render={({ field: { value, onChange } }) => {
                                    return (
                                        <Select
                                            name="student"
                                            id="student"
                                            classNamePrefix='select'
                                            isClearable
                                            className={classnames('basic-multi-select', { 'is-invalid': errors.group })}
                                            isLoading={isLoading}
                                            placeholder={t(`-- Сонгоно уу --`)}
                                            options={studentOption || []}
                                            value={studentOption.filter((c) => c.id === value)}
                                            noOptionsMessage={() => t('Хоосон байна.')}
                                            onChange={(val) => {
                                                onChange(val?.id || '')
                                                setSelectedStudents(val)
                                            }}
                                            isMulti
                                            isSearchable={true}
                                            styles={ReactSelectStyles}
                                            isDisabled
                                            getOptionValue={(option) => option.id}
                                            getOptionLabel={(option) => option.full_name}
                                        />
                                    )
                                }}
                            ></Controller>
                            {errors.student && <FormFeedback className='d-block'>{errors.student.message}</FormFeedback>}
                        </Col> */}
                        <Col md={12} className="mt-2">
                            <Button className="me-2" color="primary" type="submit" disabled={postLoading}>
                                {postLoading &&<Spinner size='sm' className='me-1'/>}
                                {t('Хадгалах')}
                            </Button>
                            <Button color="secondary" type="reset" outline onClick={handleModal}>
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
                            isLoading={isLoading}
                            Loader={Loader}
                        />
                    }
                </ModalBody>
            </Modal>
        </Fragment>
    );
};
export default Addmodal;
