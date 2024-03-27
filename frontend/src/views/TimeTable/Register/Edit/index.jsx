// ** React imports
import React, { Fragment, useState, useEffect, useContext } from 'react'

import { X } from "react-feather";

import Select from 'react-select'

import useApi from "@hooks/useApi";
import useLoader from "@hooks/useLoader";
import SchoolContext from "@context/SchoolContext"
import AuthContext from "@context/AuthContext"

import classnames from "classnames";

import { useForm, Controller } from "react-hook-form";

import {
    Row,
    Col,
	Form,
	Modal,
	Label,
    Input,
	Button,
    Spinner,
	ModalBody,
	ModalHeader,
	FormFeedback,
    Card,
    CardHeader,
    CardBody,
} from "reactstrap";

import {  get_day, get_time, ReactSelectStyles, get_lesson_type, get_potok, get_week, get_oddeven_type, convertDefaultValue} from "@utils"

import { useTranslation } from 'react-i18next';

import useModal from "@hooks/useModal";

import { RoomAdd } from '../Add/roomAdd';
import useUpdateEffect from '@src/utility/hooks/useUpdateEffect';

const EditModal = ({ open, handleModal, editDatas, refreshDatas }) => {
    const { school_id } = useContext(SchoolContext)
    const { user } = useContext(AuthContext)

    useEffect(() => {
        if(Object.keys(user).length > 0 && user.permissions.includes('lms-timetable-register-update') && !editDatas?.is_score) {
            setDisabled(false)
        }
    },[])

    var values = {
        lesson: '',
        teacher: '',
        potok: '',
    }

    const CloseBtn = (
        <X className="cursor-pointer" size={15} onClick={handleModal} />
    )

    const { showWarning } = useModal()

    const { t } = useTranslation()

    // ** Hook
    const { control, handleSubmit, reset, setError, clearErrors, setValue, formState: { errors } } = useForm();

	// Loader
	const { Loader, isLoading, fetchData } = useLoader({});

    const defaultOddEven = 3

    const [roomModal, setRoomModal] = useState(false)
    const [time_id, setTimeId] = useState('')
    const [is_disabled, setDisabled] = useState(true)
    const [datas, setDatas] = useState({})

    const [select_value, setSelectValue] = useState(values);
    const [tdata, setTimeData] = useState([])
    const [lesson_name, setLesson] = useState('')
    const [radioName, setRadio] = useState('simple')

    const [studyType, setStudyType] = useState(1)
    const [colorName, setColorName] = useState('#eeeeee')
    const [is_loading, setLoader] = useState(false)
    const [beginWeekOption, setBeginWeek] = useState([])
    const [oddEvenOption, setOddEvenOption] =useState([])
    const [endWeekOption, setEndWeek] = useState([])
    const [teacherOption, setTeacher] = useState([])
    const [lessonOption, setLessonOption] = useState([])
    const [potokOption, setPotokOption] = useState([])
    const [timeOption, setTime] = useState([])
    const [dayOption, setDay] = useState([])
    const [groupOption, setGroup] = useState([])
    const [roomOption, setRoom] = useState([])
    const [typeOption, setType] =useState([])
    const [studentOption, setStudent] =useState([])
    const [excludeStudentsOption, setExcludeStudent] = useState([])
    const [onlineOption, setOnlineOption] = useState([])

    const [selectedGroups, setSelectedGroups] = useState([])
    const [selectedAddGroups, setSelectedAddGroups] = useState([])
    const [selectedGroupStudent, setSelectedGroupStudent] = useState([])
    const [removeStudents, setRemoveStudent] = useState([])
    const [selectedTimes, setSelectedTimes] = useState([])

    const [checked, setOnlyCheck] = useState(false)

    // Api
    const teacherApi = useApi().hrms.teacher
    const lessonApi = useApi().study.lessonStandart
    const groupApi = useApi().student.group
    const timetableApi = useApi().timetable.register
    const roomApi = useApi().timetable.room
    const studentApi = useApi().student

    // Багшийн жагсаалт
    async function getTeacher() {
        const { success, data } = await fetchData(teacherApi.getTeacher(select_value?.lesson))
        if(success) {
            setTeacher(data)
        }
    }

    // Хичээлийн жагсаалт
    async function getLesson() {
        const { success, data } = await fetchData(lessonApi.getListAll())
        if(success) {
            setLessonOption(data)
        }
    }

    // Ангийн жагсаалт
    async function getGroup() {
        const { success, data } = await fetchData(groupApi.getTimetableList(select_value.lesson))
        if(success) {
            setGroup(data)
        }
    }

    // Шивэгдсэн хичээлийн хуваарь
    async function getTimeTableData() {
        const { success, data } = await fetchData(timetableApi.getPotok(select_value.lesson, select_value.potok))
        if (success) {
            setTimeData(data)
        }
    }

    async function getOneData() {
        const { success, data } = await fetchData(timetableApi.getOne(editDatas?.event_id))
        if (success) {
            setDatas(data)
        }
    }

    // Check
    const handleCheck = (e) => {
        setOnlyCheck(e.target.checked)
    }

    // Курац хуваарийн хичээллэх цагууд
    function timeSelect(data) {
        setSelectedTimes(data);
    }

    // Өрөөний жагсаалт
    async function getRoom() {
        const { success, data } = await fetchData(roomApi.getList())
        if(success) {
            setRoom(data)
        }
    }

    // Нэмэлтээр сонгох оюутны жагсаалт
    const getStudent = async() => {
        var group_ids = []
        if (selectedGroups) {
            selectedGroups.forEach(element => {
                if (element) group_ids.push(element?.id)
            }
            )
        }

        const { success, data } = await fetchData(studentApi.getGroup(group_ids, true))
        if(success)
        {
            setStudent(data)
        }
    }

    // Хасах оюутны жагсаалт
    const getExcludeStudent = async() => {
        var group_ids = []
        if (selectedGroups) {
            selectedGroups.forEach(element => {
                if (element) group_ids.push(element?.id)
            })
        }

        const { success, data } = await fetchData(studentApi.getRemoveGroup(group_ids, false))
        if(success)
        {
            setExcludeStudent(data)
        }

    }

    function selectChange(value, stype) {
        if (stype === 'lesson') {
            setSelectValue(current => {
                return {
                    ...current,
                    lesson: value,
                }
            })
        } else if (stype === 'teacher') {
            setSelectValue(current => {
                return {
                    ...current,
                    teacher: value,
                }
            })
        } else {
            setSelectValue(current => {
                return {
                    ...current,
                    potok: value,
                }
            })
        }
    }

    useEffect(() => {
        getRoom()
        getLesson()
        setBeginWeek(get_week())
        setEndWeek(get_week())
        setOddEvenOption(get_oddeven_type())
        setPotokOption(get_potok())
        setTime(get_time())
        setDay(get_day())
        setOnlineOption(get_lesson_type())
    },[])

    // Хичээл үзэх анги
    function groupSelect(data) {
        setSelectedGroups(data);
    }

    // Хосолсон ангийн онлайнаар хичээл үзэх анги
    function groupAddSelect(data) {
        setSelectedAddGroups(data);
    }

    // Нэмэлтээр үзэх гэж байгаа оюутнууд
    function studentSelect(data) {
        setSelectedGroupStudent(data);
    }

    // Хасалт хийлгэж байгаа оюутнууд
    function excludeSelect(data) {
        setRemoveStudent(data);
    }

    // Тухайн хичээлийн багц цагийн задаргаанаас хичээлийн төрөл авах хэсэг
    async function getLessonType() {
        const { success, data } = await fetchData(lessonApi.getType(select_value.lesson))
        if(success)
        {
            setType(data)
        }
    }

    useEffect(
        () =>
        {
            getOneData()
        },
        []
    )

    useUpdateEffect(
        () =>
        {
            if (selectedGroups.length > 0) {
                getStudent()
                getExcludeStudent()
            }
        },
        [selectedGroups]
    )

    useUpdateEffect(
        () =>
        {
            if (select_value.potok) {
                getTimeTableData()
            }
            if (select_value?.lesson) {
                getLessonType()
                getGroup()
            }
            getTeacher()
        },
        [select_value]
    )

    function checkDefaultValue(cdata) {
        if (!cdata.day) {
            setError('day', { type: 'custom', message: 'Хоосон байна'})
        }
        if (!cdata.time) {
            setError('time', { type: 'custom', message: 'Хоосон байна'})
        }
        if (!cdata.room && studyType !== 2) {
            setError('room', { type: 'custom', message: 'Хоосон байна'})
        }
        if (!cdata.lesson) {
            setError('lesson', { type: 'custom', message: 'Хоосон байна'})
        }
        if (!cdata.teacher) {
            setError('teacher', { type: 'custom', message: 'Хоосон байна'})
        }
        if (!cdata.potok) {
            setError('potok', { type: 'custom', message: 'Хоосон байна'})
        }
        if (!cdata.type) {
            setError('type', { type: 'custom', message: 'Хоосон байна'})
        }
        if (!cdata.st_count) {
            setError('st_count', { type: 'custom', message: 'Хоосон байна'})
        }
    }


	async function onSubmit(cdata) {
        cdata['is_block'] = false
        cdata['is_kurats'] = false
        cdata['is_simple'] = false

        var odd_even_list = []

        if (radioName === 'block') {
            cdata['is_block'] = true
            if (!cdata.begin_week) {
                setError('begin_week', { type: 'custom', message: 'Хоосон байна'})
            }
            if (!cdata.end_week) {
                setError('end_week', { type: 'custom', message: 'Хоосон байна'})
            }
            checkDefaultValue(cdata)
        }

        if (radioName == 'kurats') {
            cdata['is_kurats'] = true

            cdata['day'] = 1
            cdata['time'] =1

            if (selectedTimes.length == 0) {
                setError('kurats_time', { type: 'custom', message: 'Хоосон байна'})
            }

            if (!cdata.begin_date) {
                setError('begin_date', { type: 'custom', message: 'Хоосон байна'})
            }

            if (!cdata.end_date) {
                setError('end_date', { type: 'custom', message: 'Хоосон байна'})
            }

            if (!cdata.room && !cdata.kurats_room ) {
                setError('kurats_room', { type: 'custom', message: 'Хоосон байна'})
                setError('room', { type: 'custom', message: 'Хоосон байна'})
            }

            if (selectedGroups.length == 0) {
                setError('group', { type: 'custom', message: 'Хоосон байна'})
            }
        }

        if (radioName === 'simple') {
            cdata['is_simple'] = true
            checkDefaultValue(cdata)
        }

        if (!checked && selectedGroups.length == 0) {
            setError('group', { type: 'custom', message: 'Хоосон байна'})
        }

        if(Object.keys(errors).length === 0) {
            setLoader(true)

            var student_ids = []
            var remove_students = []
            var kurats_times = []

            if (selectedGroupStudent && !checked) {
                selectedGroupStudent.forEach(element => {
                    if (element) student_ids.push(element.id)
                })
            }
            if (removeStudents && !checked) {
                removeStudents.forEach(element => {
                    if (element) remove_students.push(element.id)
                })
            }
            if (radioName === 'kurats' && selectedTimes) {
                selectedTimes.forEach(element => {
                    if (element) kurats_times.push(element.id)
                })
            }

            cdata['group'] = !checked ? selectedGroups : []
            cdata['addgroup'] = !checked ? selectedAddGroups : []

            cdata['school'] = school_id

            cdata['students'] = student_ids
            cdata['remove_students'] = remove_students
            cdata['is_optional'] = checked
            cdata['kurats_time'] = kurats_times
            cdata['color'] = colorName

            odd_even_list.push(defaultOddEven)

            if (cdata.odd_even) {
                odd_even_list.push(cdata.odd_even)
            } else {
                cdata['odd_even'] = defaultOddEven
            }

            cdata['odd_even_list'] = odd_even_list

            cdata = convertDefaultValue(cdata)
            const { success, error } = await fetchData(timetableApi.put(cdata, time_id))
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
            setLoader(false)
        }
	}


    useEffect(
        () =>
        {
            if (Object.keys(datas).length > 0 && groupOption.length > 0) {
                for(let key in datas) {
                    if (key === 'group_list') {
                        var groups = []
                        datas[key].map((group, idx) => {
                            var selected = groupOption.find((e) => e.id === group?.id)
                            if (selected != undefined) {
                                groups.push(selected)
                            }
                            setSelectedGroups(groups)
                        })
                    }
                    if (key === 'student_rm_list') {
                        var student_ids = []
                        datas[key].map((student, idx) => {
                            var selected = excludeStudentsOption.find((e) => e.id === student?.id)
                            student_ids.push(selected)
                            setRemoveStudent(student_ids)
                        })
                    }
                    if (key === 'student_add_list') {
                        var student_ids = []
                        datas[key].map((student, idx) => {
                            var selected = studentOption.find((e) => e.id === student?.id)
                            student_ids.push(selected)

                            setSelectedGroupStudent(student_ids)
                        })
                    }

                    if (key === 'times') {
                        var t_ids = []
                        datas[key].map((time, idx) => {
                            var selected = timeOption.find((e) => e.id === time)
                            t_ids.push(selected)
                            setSelectedTimes(t_ids)
                        })
                    }

                    if (key === 'online_group_list') {
                        var groups = []
                        datas[key].map((group, idx) => {
                            var selected = groupOption.find((e) => e.id === group?.id)
                            if (selected != undefined) {
                                groups.push(selected)
                            }
                            setSelectedAddGroups(groups)
                        })
                    }
                }
                setLoader(false)
                refreshDatas()
            }
        },
        [groupOption]
    )

    useEffect(
        () =>
        {
            if (Object.keys(datas).length > 0) {
                for(let key in datas) {
                    if(datas[key] !== null) {
                        if (key === 'is_optional') setOnlyCheck(datas[key])

                        if (key === 'is_kurats' && datas[key]) setRadio('kurats')
                        if (key === 'is_block' && datas[key]) setRadio('block')

                        if (key === 'room' || key === 'teacher' || key === 'lesson') setValue(key, datas[key]?.id)
                        else setValue(key, datas[key])

                    } else setValue(key,'')

                    if (key === 'support_teachers') {
                        setValue('support_teacher', datas[key])
                    }

                    if (key === 'event_id') {
                        setTimeId(datas[key])
                    }

                    if (key === 'lesson') {
                        setSelectValue(current => {
                            return {
                                ...current,
                                lesson: datas[key]?.id,
                            }
                        })
                    }

                    if (key === 'color') {
                        setColorName(datas[key])
                    }

                    if (key === 'study_type') {
                        setStudyType(datas[key])
                    }
                }
            }
        },
        [datas]
    )

    const setKuratsValue = () => {
        setOnlyCheck(false)
        setValue('begin_week', '')
        setValue('end_week', '')
        setValue('day', '')
        setValue('time', '')
        setValue('room', '')
    }

    const setBlockValue = () => {
        setValue('begin_date', '')
        setValue('end_date', '')
        setValue('kurats_room', '')
        setSelectedTimes([])
    }

    const handleRadio = (e) => {
        setRadio(e.target.value)
        if (e.target.value == 'kurats') {
            setKuratsValue()
        } else if (e.target.value == 'block') {
            setBlockValue()
        }
        clearErrors(undefined)
    }

    const handleRoomModal = () => {
        setRoomModal(!roomModal)
    }

    // Өнгө onchange
    const handleColorChange = (e) => {
        setColorName(e.target.value)
    }

    async function handleDeleteEvent() {
        const { success, error } = await fetchData(timetableApi.delete(time_id))
        if (success) {
            refreshDatas()
            handleModal()
        }
    }

	return (
        <Fragment>
            <Modal
                isOpen={open}
                toggle={handleModal}
                className='sidebar-xl'
                modalClassName='modal-slide-in'
                contentClassName='pt-0'
                fullscreen='xl'
            >
                <ModalHeader
                    className="mb-1"
                    close={CloseBtn}
                    tag="div"
                >
                    <h5 className="modal-title">{t("Хичээлийн хуваарь засах")}</h5>
                </ModalHeader>
                <ModalBody className="flex-grow-1">
                    {
                        is_loading &&
                            <div className='suspense-loader'>
                                <Spinner size='bg'/>
                                <span className='ms-50'>{t("Түр хүлээнэ үү...")}</span>
                            </div>
                    }
                    <Row tag={Form} className="gy-1" onSubmit={handleSubmit(onSubmit)}>
                    <div className='mt-1'>
                        <Row className='mb-1'>
                            <Col md={3} sm={12}>
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
                                                placeholder={t(`-- Сонгоно уу --`)}
                                                options={lessonOption || []}
                                                isDisabled={true}
                                                value={lessonOption.find((c) => c.id == value)}
                                                noOptionsMessage={() => t('Хоосон байна.')}
                                                onChange={(val) => {
                                                    onChange(val?.id || '')
                                                    selectChange(val?.id || '', 'lesson')
                                                    if(val?.id) {
                                                        setLesson(val?.full_name)
                                                    }
                                                }}
                                                styles={ReactSelectStyles}
                                                getOptionValue={(option) => option.id}
                                                getOptionLabel={(option) => option.full_name}
                                            />
                                    )}}
                                />
                                {errors.lesson && <FormFeedback className='d-block'>{t(errors.lesson.message)}</FormFeedback>}
                            </Col>
                            <Col md={3} sm={12}>
                                <Label className="form-label" for="potok">
                                    {t('Потокийн дугаар')}
                                </Label>
                                <Controller
                                    control={control}
                                    defaultValue=''
                                    name="potok"
                                    render={({ field: { value, onChange} }) => {
                                        return (
                                            <Select
                                                name="potok"
                                                id="potok"
                                                classNamePrefix='select'
                                                isClearable
                                                className={classnames('react-select', { 'is-invalid': errors.potok })}
                                                isLoading={isLoading}
                                                placeholder={t(`-- Сонгоно уу --`)}
                                                options={potokOption || []}
                                                isDisabled={true}
                                                value={potokOption.find((c) => c.id === value)}
                                                noOptionsMessage={() => t('Хоосон байна.')}
                                                onChange={(val) => {
                                                    onChange(val?.id || '')
                                                    selectChange(val?.id || '', 'potok')
                                                }}
                                                styles={ReactSelectStyles}
                                                getOptionValue={(option) => option.id}
                                                getOptionLabel={(option) => option.name}
                                            />
                                        )
                                    }}
                                />
                                {errors.potok && <FormFeedback className='d-block'>{t(errors.potok.message)}</FormFeedback>}
                            </Col>
                            <Col md={3} sm={12}>
                                <Label className="form-label" for="teacher">
                                    {t("Багш")}
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
                                                isDisabled={is_disabled}
                                                className={classnames('react-select', { 'is-invalid': errors.teacher })}
                                                isLoading={isLoading}
                                                placeholder={t(`-- Сонгоно уу --`)}
                                                options={teacherOption || []}
                                                value={teacherOption.find((c) => c.id === value)}
                                                noOptionsMessage={() => t('Хоосон байна.')}
                                                onChange={(val) => {
                                                    onChange(val?.id || '')
                                                    selectChange(val?.id || '', 'teacher')
                                                }}
                                                styles={ReactSelectStyles}
                                                getOptionValue={(option) => option.id}
                                                getOptionLabel={(option) => option.full_name}
                                            />
                                        )
                                    }}
                                />
                                {errors.teacher && <FormFeedback className='d-block'>{t(errors.teacher.message)}</FormFeedback>}
                            </Col>
                            <Col md={3} sm={12}>
                            <Label className="form-label" for="support_teacher">
                                {t("Туслах багш")}
                            </Label>
                            <Controller
                                control={control}
                                defaultValue=''
                                name="support_teacher"
                                render={({ field: { value, onChange} }) => {
                                    return (
                                        <Select
                                            name="support_teacher"
                                            id="support_teacher"
                                            classNamePrefix='select'
                                            isClearable
                                            className={classnames('react-select', { 'is-invalid': errors.support_teacher })}
                                            isLoading={isLoading}
                                            placeholder={t(`-- Сонгоно уу --`)}
                                            options={teacherOption || []}
                                            value={teacherOption.find((c) => c.id === value)}
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
                            />
                        </Col>
                        </Row>
                    </div>
                    {
                    (select_value.potok && tdata.length > 0 && select_value.lesson)
                        &&
                            <div>
                                <hr/>
                                <Card className='mb-0'>
                                    <CardHeader>
                                        <h5>{`${lesson_name} хичээлийн Поток ${select_value.potok}-д шивэгдсэн хуваарь `}</h5>
                                    </CardHeader>
                                    <CardBody>
                                        <CTable datas={tdata}/>
                                    </CardBody>
                                </Card>
                                <hr className='mt-0'/>
                            </div>
                    }
                    <Col md={4} sm={12}>
                        <Label className="form-label" for="type">
                            {t('Хичээлийн төрөл')}
                        </Label>
                        <Controller
                            defaultValue=''
                            control={control}
                            id='type'
                            name='type'
                            render={({ field: { value, onChange} }) => {
                                return (
                                    <Select
                                        name="type"
                                        id="type"
                                        classNamePrefix='select'
                                        isClearable
                                        isDisabled={is_disabled}
                                        className={classnames('react-select', { 'is-invalid': errors.type })}
                                        isLoading={isLoading}
                                        placeholder={t(`-- Сонгоно уу --`)}
                                        options={typeOption || []}
                                        value={typeOption.find((c) => c.id === value )}
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
                        />
                        {errors.type && <FormFeedback className='d-block'>{t(errors.type.message)}</FormFeedback>}
                    </Col>
                    <Col md={4} xs={12} sm={12}>
                        <Label className="form-label" for="st_count">
                            {t('Суралцагчийн тоо')}
                        </Label>
                        <Controller
                            control={control}
                            defaultValue=''
                            name="st_count"
                            render={({ field }) => {
                            return (
                                <Input
                                    {...field}
                                    name='st_count'
                                    disabled={is_disabled}
                                    id='st_count'
                                    type='number'
                                    bsSize='sm'
                                    invalid={errors.st_count ? true : false}
                                    placeholder='Суралцагчийн тоо'
                                />
                            )
                        }}
                        />
                        {errors.st_count && <FormFeedback className='d-block'>{t(errors.st_count.message)}</FormFeedback>}
                    </Col>
                    <Col md={4} sm={12}>
                        <Label for="color" onClick={() => setIsColor(!isColor)}>
                            {t('Өнгө')}
                        </Label>
                        <div className='d-flex justify-content-between'>
                            <Input
                                id='color'
                                type='color'
                                bsSize='sm'
                                disabled={is_disabled}
                                value={colorName}
                                onChange={handleColorChange}
                            />
                            <Input
                                id='color'
                                type='text'
                                disabled={is_disabled}
                                bsSize='sm'
                                className='ms-1'
                                value={colorName}
                                onChange={handleColorChange}
                            />
                        </div>
                    </Col>
                    <Row className='mt-1'>
                        <Col md={4} sm={12}>
                            <Input
                                className='me-1'
                                type='radio'
                                value='simple'
                                name='simple'
                                id='simple'
                                disabled={true}
                                checked={radioName === 'simple'}
                                onChange={(e) => { handleRadio(e)}}
                            />
                            <Label className='form-label' for='simple'>
                                {t('Энгийн')}
                            </Label>
                        </Col>
                        <Col md={4} sm={12}>
                            <Input
                                className='me-1'
                                type='radio'
                                name='block'
                                value='block'
                                disabled={true}
                                id='block'
                                checked={radioName === 'block'}
                                onChange={(e) => { handleRadio(e)}}
                            />
                            <Label className='form-label' for='block'>
                                {t('Блок')}
                            </Label>
                        </Col>
                        <Col md={4} sm={12}>
                            <Input
                                name='kurats'
                                className='me-1'
                                value='kurats'
                                disabled={true}
                                id='kurats'
                                type='radio'
                                checked={radioName === 'kurats'}
                                onChange={(e) => { handleRadio(e)}}
                            />
                            <Label className='form-label' for='kurats'>
                                {t('Кураци')}
                            </Label>
                        </Col>
                    </Row>
                    <Row className='mt-1'>
                        {
                            radioName == 'simple' &&
                            <Col md={6} sm={12}>
                                <Label className="form-label" for="odd_even">
                                    {t('Хичээллэх 7 хоногийн төрөл')}
                                </Label>
                                <Controller
                                    control={control}
                                    defaultValue=''
                                    name="odd_even"
                                    render={({ field: { value, onChange} }) => {
                                        return (
                                            <Select
                                                name="odd_even"
                                                id="odd_even"
                                                classNamePrefix='select'
                                                isClearable
                                                isDisabled={is_disabled}
                                                className={classnames('react-select', { 'is-invalid': errors.odd_even })}
                                                isLoading={isLoading}
                                                placeholder={t(`-- Сонгоно уу --`)}
                                                options={oddEvenOption || []}
                                                value={oddEvenOption.find((c) => c.id === (value || defaultOddEven))}
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
                                />
                                {errors.odd_even && <FormFeedback className='d-block'>{t(errors.odd_even.message)}</FormFeedback>}
                            </Col>
                        }
                        {
                            radioName == 'block' &&
                                <>
                                    <Col md={4} sm={12}>
                                        <Label className="form-label" for="begin_week">
                                            {t('Эхлэх 7 хоног')}
                                        </Label>
                                        <Controller
                                            control={control}
                                            defaultValue=''
                                            name="begin_week"
                                            render={({ field: { value, onChange} }) => {
                                                return (
                                                    <Select
                                                        name="begin_week"
                                                        id="begin_week"
                                                        classNamePrefix='select'
                                                        isClearable
                                                        isDisabled={is_disabled}
                                                        className={classnames('react-select', { 'is-invalid': errors.begin_week })}
                                                        isLoading={isLoading}
                                                        placeholder={t(`-- Сонгоно уу --`)}
                                                        options={beginWeekOption || []}
                                                        value={beginWeekOption.find((c) => c.id === value)}
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
                                        ></Controller>
                                        {errors.begin_week && <FormFeedback className='d-block'>{t(errors.begin_week.message)}</FormFeedback>}
                                    </Col>
                                    <Col md={4} sm={12}>
                                        <Label className="form-label" for="end_week">
                                            {t('Дуусах 7 хоног')}
                                        </Label>
                                        <Controller
                                            control={control}
                                            defaultValue=''
                                            name="end_week"
                                            render={({ field: { value, onChange} }) => {
                                                return (
                                                    <Select
                                                        name="end_week"
                                                        id="end_week"
                                                        classNamePrefix='select'
                                                        isClearable
                                                        isDisabled={is_disabled}
                                                        className={classnames('react-select', { 'is-invalid': errors.end_week })}
                                                        isLoading={isLoading}
                                                        placeholder={t(`-- Сонгоно уу --`)}
                                                        options={endWeekOption || []}
                                                        value={endWeekOption.find((c) => c.id === value)}
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
                                        ></Controller>
                                        {errors.end_week && <FormFeedback className='d-block'>{t(errors.end_week.message)}</FormFeedback>}
                                    </Col>
                                </>
                        }
                        {
                            radioName == 'kurats'
                            &&
                            <>
                                <Col md={4} sm={12}>
                                    <Label className="form-label" for="begin_date">
                                        {t('Эхлэх өдөр')}
                                    </Label>
                                    <Controller
                                        control={control}
                                        defaultValue=''
                                        name="begin_date"
                                        render={({ field }) => {
                                            return (
                                                <Input
                                                    {...field}
                                                    type='date'
                                                    bsSize='sm'
                                                    isDisabled={is_disabled}
                                                    invalid={errors.begin_date ? true : false}
                                                />
                                            )
                                        }}
                                    ></Controller>
                                    {errors.begin_date && <FormFeedback className='d-block'>{t(errors.begin_date.message)}</FormFeedback>}
                                </Col>
                                <Col md={4} sm={12}>
                                    <Label className="form-label" for="end_date">
                                        {t('Дуусах өдөр')}
                                    </Label>
                                    <Controller
                                        control={control}
                                        defaultValue=''
                                        name="end_date"
                                        render={({ field }) => {
                                            return (
                                                <Input
                                                    {...field}
                                                    type='date'
                                                    bsSize='sm'
                                                    invalid={errors.end_date ? true : false}
                                                />
                                            )
                                        }}
                                    ></Controller>
                                    {errors.end_date && <FormFeedback className='d-block'>{t(errors.end_date.message)}</FormFeedback>}
                                </Col>
                                <Col md={4} xs={12} sm={12}>
                                    <Label className="form-label" for="kurats_room">
                                        {t('Курацийн хичээл орох байрлал')}
                                    </Label>
                                    <Controller
                                        control={control}
                                        defaultValue=''
                                        name="kurats_room"
                                        render={({ field }) => {
                                        return (
                                            <Input
                                                {...field}
                                                name='kurats_room'
                                                id='kurats_room'
                                                type='text'
                                                disabled={is_disabled}
                                                bsSize='sm'
                                                invalid={errors.kurats_room ? true : false}
                                                placeholder='Хичээл орох байрлал'
                                            />
                                        )
                                    }}
                                    />
                                    {errors.kurats_room && <FormFeedback className='d-block'>{t(errors.kurats_room.message)}</FormFeedback>}
                                </Col>
                            </>
                        }
                    </Row>
                    <Col md={6} sm={12} >
                        <Label for="study_type">
                            {t('Хичээл орох хэлбэр')}
                        </Label>
                        <Controller
                            control={control}
                            defaultValue=''
                            name="study_type"
                            render={({ field: { value, onChange} }) => {
                                return (
                                    <Select
                                        name="study_type"
                                        id="study_type"
                                        classNamePrefix='select'
                                        isClearable
                                        isDisabled={is_disabled}
                                        className={classnames('react-select', { 'is-invalid': errors.study_type })}
                                        isLoading={isLoading}
                                        placeholder={t(`-- Сонгоно уу --`)}
                                        options={onlineOption || []}
                                        value={onlineOption.find((c) => c.id === (value || studyType))}
                                        noOptionsMessage={() => t('Хоосон байна.')}
                                        onChange={(val) => {
                                            onChange(val?.id || '')
                                            if (val) setStudyType(val?.id)
                                        }}
                                        styles={ReactSelectStyles}
                                        getOptionValue={(option) => option.id}
                                        getOptionLabel={(option) => option.name}
                                    />
                                )
                            }}
                        />
                    </Col>
                    <Col md={6}  sm={12}>
                        <Label className="form-label" for="room">
                            {t('Өрөө')}
                        </Label>
                        <Controller
                            control={control}
                            defaultValue=''
                            name="room"
                            render={({ field: { value, onChange} }) => {
                                return (
                                    <>
                                        <Select
                                            name="room"
                                            id="room"
                                            isDisabled={is_disabled}
                                            classNamePrefix='select'
                                            isClearable
                                            className={classnames('react-select', { 'is-invalid': errors.room })}
                                            isLoading={isLoading}
                                            placeholder={t(`-- Сонгоно уу --`)}
                                            options={roomOption || []}
                                            value={roomOption.find((c) => c.id === value)}
                                            noOptionsMessage={() => {
                                                return (
                                                    <a role='button' className="link-primary" onClick={handleRoomModal}>
                                                        {t('Өрөө шинээр үүсгэх')}
                                                    </a>
                                                )
                                            }}
                                            onChange={(val) => {
                                                onChange(val?.id || '')
                                            }}
                                            styles={ReactSelectStyles}
                                            getOptionValue={(option) => option.id}
                                            getOptionLabel={(option) => option.full_name}
                                        />
                                    </>
                                )
                            }}
                        />
                        {errors.room && <FormFeedback className='d-block'>{t(errors.room.message)}</FormFeedback>}
                    </Col>
                    {
                        radioName == 'kurats' &&
                            <Col md={12} sm={12}>
                                <Label className="form-label" for="kurats_time">
                                    {t('Хичээллэх цагууд')}
                                </Label>
                                <Controller
                                    control={control}
                                    defaultValue=''
                                    name="kurats_time"
                                    render={({ field: { value, onChange} }) => {
                                        return (
                                            <Select
                                                name="kurats_time"
                                                id="kurats_time"
                                                classNamePrefix='select'
                                                isClearable
                                                disabled={is_disabled}
                                                isMulti
                                                className={classnames('react-select', { 'is-invalid': errors.kurats_time })}
                                                isLoading={isLoading}
                                                placeholder={t(`-- Сонгоно уу --`)}
                                                options={timeOption || []}
                                                value={selectedTimes}
                                                noOptionsMessage={() => t('Хоосон байна.')}
                                                onChange={(val) => {
                                                    onChange(val?.id || '')
                                                    timeSelect(val)
                                                }}
                                                styles={ReactSelectStyles}
                                                getOptionValue={(option) => option.id}
                                                getOptionLabel={(option) => option.name}
                                            />
                                        )
                                    }}
                                ></Controller>
                                {errors.kurats_time && <FormFeedback className='d-block'>{t(errors.kurats_time.message)}</FormFeedback>}
                            </Col>
                    }
                    {radioName !== 'kurats'
                        &&
                        <Row className='mt-1'>
                            <Col md={4}  sm={12}>
                                <Label className="form-label" for="day">
                                    {t('Өдөр')}
                                </Label>
                                <Controller
                                    control={control}
                                    defaultValue=''
                                    name="day"
                                    render={({ field: { value, onChange} }) => {
                                        return (
                                            <Select
                                                name="day"
                                                id="day"
                                                classNamePrefix='select'
                                                isClearable
                                                isDisabled={is_disabled}
                                                className={classnames('react-select', { 'is-invalid': errors.day })}
                                                isLoading={isLoading}
                                                placeholder={t(`-- Сонгоно уу --`)}
                                                options={dayOption || []}
                                                value={dayOption.find((c) => c.id === value)}
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
                                />
                                {errors.day && <FormFeedback className='d-block'>{t(errors.day.message)}</FormFeedback>}
                            </Col>
                            <Col md={4} sm={12}>
                                <Label className="form-label" for="time">
                                    {t('Цаг')}
                                </Label>
                                <Controller
                                    control={control}
                                    defaultValue=''
                                    name="time"
                                    render={({ field: { value, onChange} }) => {
                                        return (
                                            <Select
                                                name="time"
                                                id="time"
                                                classNamePrefix='select'
                                                isClearable
                                                isDisabled={is_disabled}
                                                className={classnames('react-select', { 'is-invalid': errors.time })}
                                                isLoading={isLoading}
                                                placeholder={t(`-- Сонгоно уу --`)}
                                                options={timeOption || []}
                                                value={timeOption.find((c) => c.id === value)}
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
                                ></Controller>
                                {errors.time && <FormFeedback className='d-block'>{t(errors.time.message)}</FormFeedback>}
                            </Col>
                            <Col className='d-flex align-items-center justify-content-start ms-0 mt-1' md={6} sm={12} >
                                <Input
                                    id="is_optional"
                                    className="dataTable-check mb-50 me-1"
                                    type="checkbox"
                                    bsSize="sm-5"
                                    disabled={is_disabled}
                                    onChange={(e) => handleCheck(e)}
                                    checked={checked}
                                />
                                <Label className="checkbox-wrapper" for="is_optional">
                                    {t('Сонгон хичээл')}
                                </Label>
                            </Col>
                        </Row>
                    }
                    {
                        !checked &&
                        <>
                            <Col sm={12}>
                                <Label className="form-label" for="group">
                                    {t("Анги")}
                                </Label>
                                <Controller
                                    control={control}
                                    defaultValue=''
                                    name="group"
                                    render={({ field: { value, onChange} }) => {
                                        return (
                                            <Select
                                                name="group"
                                                id="group"
                                                classNamePrefix='select'
                                                isClearable
                                                isDisabled={is_disabled}
                                                className={classnames('react-select', { 'is-invalid': errors.group })}
                                                isLoading={isLoading}
                                                placeholder={t(`-- Сонгоно уу --`)}
                                                options={groupOption || []}
                                                value={selectedGroups}
                                                noOptionsMessage={() => t('Хоосон байна.')}
                                                onChange={(val) => {
                                                    onChange(val?.id || '')
                                                    groupSelect(val)
                                                }}
                                                isMulti
                                                isSearchable={true}
                                                styles={ReactSelectStyles}
                                                getOptionValue={(option) => option.id}
                                                getOptionLabel={(option) => option.name}
                                            />
                                        )
                                    }}
                                ></Controller>
                                {errors.group && <FormFeedback className='d-block'>{t(errors.group.message)}</FormFeedback>}
                            </Col>
                            {
                                studyType === 3
                                &&
                                    <Col sm={12}>
                                        <Label className="form-label" for="addgroup">
                                            {t("Онлайн хичээллэх анги")}
                                        </Label>
                                        <Controller
                                            control={control}
                                            defaultValue=''
                                            name="addgroup"
                                            render={({ field: { value, onChange} }) => {
                                                return (
                                                    <Select
                                                        name="addgroup"
                                                        id="addgroup"
                                                        classNamePrefix='select'
                                                        isClearable
                                                        className={classnames('react-select', { 'is-invalid': errors.addgroup })}
                                                        isLoading={isLoading}
                                                        placeholder={t(`-- Сонгоно уу --`)}
                                                        options={groupOption || []}
                                                        value={selectedAddGroups}
                                                        noOptionsMessage={() => t('Хоосон байна.')}
                                                        onChange={(val) => {
                                                            onChange(val?.id || '')
                                                            groupAddSelect(val)
                                                        }}
                                                        isMulti
                                                        isSearchable={true}
                                                        styles={ReactSelectStyles}
                                                        getOptionValue={(option) => option.id}
                                                        getOptionLabel={(option) => option.name}
                                                    />
                                                )
                                            }}
                                        ></Controller>
                                        {errors.addgroup && <FormFeedback className='d-block'>{t(errors.addgroup.message)}</FormFeedback>}
                                    </Col>
                            }
                            <Col sm={12} className='mt-1'>
                                <Label className="form-label" for="students">
                                    {t("Нэмэлтээр судалж буй оюутан")}
                                </Label>
                                <Controller
                                    control={control}
                                    defaultValue=''
                                    name="students"
                                    render={({ field: { value, onChange} }) => {
                                        return (
                                            <Select
                                                name="students"
                                                id="students"
                                                classNamePrefix='select'
                                                isClearable
                                                isDisabled={is_disabled}
                                                className={classnames('react-select', { 'is-invalid': errors.students })}
                                                isLoading={isLoading}
                                                placeholder={t(`-- Сонгоно уу --`)}
                                                options={studentOption || []}
                                                value={selectedGroupStudent}
                                                noOptionsMessage={() => t('Хоосон байна.')}
                                                onChange={(val) => {
                                                    onChange(val?.id || '')
                                                    studentSelect(val)
                                                }}
                                                isMulti
                                                isSearchable={true}
                                                styles={ReactSelectStyles}
                                                getOptionValue={(option) => option.id}
                                                getOptionLabel={(option) => option.full_name}
                                            />
                                        )
                                    }}
                                ></Controller>
                                {errors.students && <FormFeedback className='d-block'>{t(errors.students.message)}</FormFeedback>}
                            </Col>
                            <Col sm={12} className='mt-1'>
                                <Label className="form-label" for="exclude_student">
                                    {t("Хасалт хийгдэж буй оюутан")}
                                </Label>
                                <Controller
                                    control={control}
                                    defaultValue=''
                                    name="exclude_student"
                                    render={({ field: { value, onChange} }) => {
                                        return (
                                            <Select
                                                name="exclude_student"
                                                id="student"
                                                classNamePrefix='select'
                                                isClearable
                                                isDisabled={is_disabled}
                                                className={classnames('react-select', { 'is-invalid': errors.exclude_student })}
                                                isLoading={isLoading}
                                                placeholder={t(`-- Сонгоно уу --`)}
                                                options={excludeStudentsOption || []}
                                                value={removeStudents}
                                                noOptionsMessage={() => t('Хоосон байна.')}
                                                onChange={(val) => {
                                                    onChange(val?.id || '')
                                                    excludeSelect(val)
                                                }}
                                                isMulti
                                                isSearchable={true}
                                                styles={ReactSelectStyles}
                                                getOptionValue={(option) => option.id}
                                                getOptionLabel={(option) => option.full_name}
                                            />
                                        )
                                    }}
                                ></Controller>
                                {errors.exclude_student && <FormFeedback className='d-block'>{errors.exclude_student.message}</FormFeedback>}
                            </Col>
                        </>
                    }
                    <Col md={12} sm={12} className="mt-2 d-flex justify-content-start mb-0">
                        <Button color="primary" type="submit" disabled={is_disabled}>
                            {is_loading && <i className={`fas fa-spinner-third fa-spin me-2`}></i>}
                            {t('Хадгалах')}
                        </Button>
                        <Button
                            className='ms-1'
                            color="danger"
                            type="reset"
                            disabled={is_disabled}
                            onClick={() =>
                                showWarning({
                                    header: {
                                        title: `${t('Хичээлийн хуваарь устгах')}`,
                                    },
                                    question: `Та энэхүү хичээлийн хуваарь устгахдаа итгэлтэй байна уу?`,
                                    onClick: () => handleDeleteEvent(),
                                    btnText: 'Устгах',
                                })}
                        >
                            {t("Устгах")}
                        </Button>
                    </Col>
                </Row>
                </ModalBody>
            </Modal>
            {roomModal &&
                <Modal isOpen={roomModal} toggle={handleRoomModal} className="modal-dialog-centered modal-md">
                    <ModalHeader toggle={handleRoomModal}>{t('Өрөө бүртгэх')}</ModalHeader>
                    <ModalBody>
                        <RoomAdd refreshDatas={getRoom} handleModal={handleRoomModal}/>
                    </ModalBody>
                </Modal>
            }
        </Fragment>
	);
};
export default EditModal;
