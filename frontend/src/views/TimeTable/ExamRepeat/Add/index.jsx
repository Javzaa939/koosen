// ** React imports
import React, { Fragment, useContext, useState, useEffect } from 'react'

import { MinusCircle, PlusCircle, X } from "react-feather";

import useApi from "@hooks/useApi";
import useLoader from "@hooks/useLoader";
import SchoolContext from "@context/SchoolContext"
import ActiveYearContext from "@context/ActiveYearContext"

import Select from 'react-select'

import { useTranslation } from 'react-i18next';

import { useForm, Controller, useWatch } from "react-hook-form";

// import { Eye } from 'react-feather';

import { Row, Col, Form, Modal, Input, Label, Button, ModalBody, ModalHeader, FormFeedback, Spinner, Card, CardTitle, CardBody, ListGroup, ListGroupItem, Table, CardHeader, Badge } from "reactstrap";

import { validate, ReactSelectStyles, convertDefaultValue, examType, get_EXAM_STATUS } from "@utils"

import { validateSchema } from '../validateSchema';

// import StudentList from "../StudentList";

import classnames from 'classnames';

const AddModal = ({ open, handleModal, refreshDatas, handleEdit, editData, editId }) => {
    var values = {
        lesson: '',
        teacher: '',
        class: '',
    }

    const CloseBtn = (
        <X className="cursor-pointer" size={15} onClick={handleModal} />
    )

    const { t } = useTranslation()

    const { school_id } = useContext(SchoolContext)
    const { cseason_id, cyear_name } = useContext(ActiveYearContext)

    const [lesson_option, setLessonOption] = useState([])
    const [teacher_option, setTeacherOption] = useState([])
    const [students, setStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState([]);
    const [student_search_value, setStudentSearchValue] = useState([]);
    const [exam_option, setExamOption] = useState([])
    const [room_option, setRoomOption] = useState([])
    const [selectedTeachers, setSelectedTeachers] = useState([])
    const [selectedGroups, setSelectedGroups] = useState([])
    const [selectedTest, setSelectedTest] = useState('')
    const [select_value, setSelectValue] = useState(values)
    const [online_checked, setOnlineChecked] = useState(false)
    const [room_capacity, setRoomCapacity] = useState('')
    const [statusOption, setStatusOption] = useState(get_EXAM_STATUS())

    // const [student_list_view, setStudentListView] = useState(false)
    const [studentData, setStudentDatas] = useState([]);
    const [groupOption, setGroupOption] = useState([]);

    // ** Hook
    const { control, handleSubmit, formState: { errors }, setError, setValue } = useForm(validate(validateSchema));

    const stypeValue = useWatch({
        control,
        name: "stype",
    });

    const beginDate = useWatch({ control, name: 'begin_date' });

    // Loader
    const { Loader, isLoading, fetchData } = useLoader({ isSmall: true });
    const { isLoading: postLoading, fetchData: postFetch } = useLoader({});

    // Api
    const teacherApi = useApi().hrms.teacher
    const lessonApi = useApi().study.lessonStandart
    const roomApi = useApi().timetable.room
    const examApi = useApi().timetable.re_exam
    const challengeAPI = useApi().challenge;
    const groupApi = useApi().student.group

    // Хичээлийн жагсаалт
    async function getLessonOption() {
        const { success, data } = await fetchData(lessonApi.getExam())
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

    // Test жагсаалт
    async function getExams() {
        if (select_value.lesson) {
            const { success, data } = await fetchData(examApi.getExamsList(select_value.lesson))
            if (success) {
                setExamOption(data)
            }
        }
    }

    // Test жагсаалт
    async function getStudents() {
        if (selectedTest && selectedTest.length > 0) {
            const { success, data } = await fetchData(examApi.getExamStudent(selectedTest, select_value.lesson))
            if (success) {
                setStudentDatas(data)
            }
        }
        else{
            setStudentDatas([])
        }
    }

    // Test жагсаалт
    async function getStudentsList() {
        if (editId) {
            const { success, data } = await fetchData(examApi.getExamStudentList(editId))
            if (success) {
                setStudentDatas(data)
            }
        }
    }

    // Анги бүлгийн жагсаалт
    async function getGroups() {
        const { success, data } = await fetchData(groupApi.getList())
        if (success) {
            setGroupOption(data)
        }
    }

    // Өрөөний жагсаалт
    async function getRoom() {
        const { success, data } = await fetchData(roomApi.getList(''))
        if (success) {
            setRoomOption(data)
        }
    }

    async function getStudentsFilter() {
        const { success, data } = await fetchData(challengeAPI.getStudents(student_search_value));
        if (success) {
            setStudents(data)
        }
    }

    function handleStudentSelect() {
        getStudentsFilter()
    }

    async function onSubmitStudent() {
        if (editData?.id) {
            const { success, error } = await postFetch(examApi.postOneStudent(editData?.id, selectedStudent))
            if (success) {
                getStudentsList()
                setSelectedStudent([])
            }
        }
    }

    useEffect(
        () => {
            if (Object.keys(editData).length > 0) {
                for (let key in editData) {
                    setValue(key, editData[key])

                    if (key === 'teacher') {
                        var values = teacher_option?.filter((e) => editData[key]?.includes(e?.id))
                        setSelectedTeachers(values)
                    }
                    if (key === 'is_online') {
                        setOnlineChecked(editData[key])
                    }
                    if (key === 'group') {
                        var values_group = groupOption?.filter((e) => editData[key]?.includes(e?.id))
                        setSelectedGroups(values_group)
                    }
                }
            }
        }, [editData, teacher_option, groupOption]
    )

    function IsOnline(checked) {
        setOnlineChecked(checked)
        if (checked) {
            setValue('room', '')
        }
    }

    async function onSubmit(cdata) {
        cdata['lesson_year'] = cyear_name
        cdata['lesson_season'] = cseason_id
        cdata['is_online'] = online_checked
        cdata['teacher'] = selectedTeachers?.map((c) => c.id)

        if (online_checked) {
            cdata['room'] = null
        }
        cdata = convertDefaultValue(cdata)
        if (editData?.id) {
            const { success, error } = await postFetch(examApi.put(cdata, editData?.id))
            if (success) {
                handleEdit()
                refreshDatas()
            }
            else {
                /** Алдааны мессэжийг input дээр харуулна */
                for (let key in error) {
                    setError(error[key].field, { type: 'custom', message: error[key].msg });
                }
            }
        } else {
            cdata['students'] = studentData?.included_students.map((c) => c.student_id)
            cdata['school'] = school_id

            const { success, error } = await postFetch(examApi.post(cdata))
            if (success) {
                handleModal()
                refreshDatas()
            } else {
                /** Алдааны мессэжийг input дээр харуулна */
                for (let key in error) {
                    setError(error[key].field, { type: 'custom', message: error[key].msg });
                }
            }
        }
    }

    useEffect(() => {
        if (stypeValue == 2) {
            if (beginDate) {
                const beginDateObj = new Date(beginDate);
                beginDateObj.setHours(8, 0, 0, 0);
                const formattedBeginDate = beginDateObj.toLocaleString('sv-SE').slice(0, 16);

                setValue('begin_date', formattedBeginDate);
            }

            if (stypeValue === 2 && beginDate) {
                const beginDateObj = new Date(beginDate);

                beginDateObj.setHours(13, 0, 0, 0);
                const formattedEndDate = beginDateObj.toLocaleString('sv-SE').slice(0, 16);

                setValue('end_date', formattedEndDate);
            }
        }
    }, [beginDate, stypeValue, setValue]);

    useEffect(() => {
        getRoom()
        getGroups()
        getTeachers()
        getLessonOption()
        if (editId) {
            getStudentsList()
        }
    }, [])

    useEffect(() => {
        getExams()
    }, [select_value.lesson])

    useEffect(() => {
        getStudents()
    }, [selectedTest, editId])

    const handleAdd = (data, is_add) => {
        // Clone arrays to avoid mutating the original state
        const added_students = [...studentData?.included_students];
        const excluded_students = [...studentData?.excluded_students];

        if (is_add) {
            // Add student to included_students
            const updated_included = [...added_students, data];

            // Remove student from excluded_students
            const find_index = excluded_students.findIndex(e => e?.student__code === data?.student__code);
            if (find_index > -1) {
                excluded_students.splice(find_index, 1);
            }

            // Update state
            setStudentDatas({
                ...studentData,
                excluded_students,
                included_students: updated_included,
            });
        } else {
            // Add student to excluded_students
            const updated_excluded = [...excluded_students, data];

            // Remove student from included_students
            const find_index = added_students.findIndex(e => e?.student__code === data?.student__code);
            if (find_index > -1) {
                added_students.splice(find_index, 1);
            }

            // Update state
            setStudentDatas({
                ...studentData,
                excluded_students: updated_excluded,
                included_students: added_students,
            });
        }
    };

    return (
        <Fragment>
            <Modal
                isOpen={open}
                toggle={() => {
                    if (editData?.id) {
                        handleEdit();
                    } else {
                        handleModal();
                    }
                }}
                className="modal-dialog-centered modal-xl"
                contentClassName="pt-0"
                backdrop='static'
            >
                <ModalHeader
                    className="mb-1"
                    toggle={() => {
                        if (editData?.id) {
                            handleEdit();
                        } else {
                            handleModal();
                        }
                    }}
                    close={CloseBtn}
                    tag="div"
                >
                    {
                        Object?.keys(editData)?.length > 0 ?
                            <h5 className="modal-title">{t('Шалгалтын хуваарь засах')}</h5>
                            :
                            <h5 className="modal-title">{t('Шалгалтын хуваарь бүртгэх')}</h5>
                    }
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
                        {
                            !editId && (
                                <Col md={6}>
                                    <Label className="form-label" for="exam">
                                        {t('Шалгалт')}
                                    </Label>
                                    <Controller
                                        control={control}
                                        defaultValue={[]}
                                        name="exam"
                                        render={({ field: { value, onChange } }) => {
                                            return (
                                                <Select
                                                    name="exam"
                                                    id="exam"
                                                    classNamePrefix='select'
                                                    isClearable
                                                    className={classnames('react-select', { 'is-invalid': errors.exam })}
                                                    isLoading={isLoading}
                                                    isMulti
                                                    placeholder={t('-- Сонгоно уу --')}
                                                    options={exam_option || []}
                                                    value={exam_option.filter((c) => value?.includes(c.id))}
                                                    noOptionsMessage={() => t('Хоосон байна.')}
                                                    onChange={(selected) => {
                                                        const selectedIds = selected ? selected.map((option) => option.id) : [];
                                                        onChange(selectedIds);
                                                        setSelectedTest(selectedIds);
                                                    }}
                                                    styles={ReactSelectStyles}
                                                    getOptionValue={(option) => option.id}
                                                    getOptionLabel={(option) => {
                                                        return `${option?.lesson?.code + ' ' + option?.lesson?.name} (${option.begin_date} - ${option.end_date})`;
                                                    }}
                                                />
                                            )
                                        }}
                                    >
                                    </Controller>
                                    {errors.exam && <FormFeedback className='d-block'>{t(errors.exam.message)}</FormFeedback>}
                                </Col>
                            )
                        }
                        <Col md={6}>
                            <Label className="form-label" for="status">
                                {t('Шалгалтын төлөв')}
                            </Label>
                            <Controller
                                control={control}
                                defaultValue=''
                                name="status"
                                render={({ field: { value, onChange } }) => {
                                    return (
                                        <Select
                                            name="status"
                                            id="status"
                                            isClearable
                                            classNamePrefix='select'
                                            isLoading={isLoading}
                                            className={classnames('react-select', { 'is-invalid': errors.status })}
                                            placeholder={t(`-- Сонгоно уу --`)}
                                            options={statusOption || []}
                                            value={statusOption.find((c) => c.id === value)}
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
                            {errors.status && <FormFeedback className=''>{t(errors.status.message)}</FormFeedback>}
                        </Col>
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
                                            isMulti
                                            className={classnames('react-select', { 'is-invalid': errors.teacher })}
                                            isLoading={isLoading}
                                            placeholder={t('-- Сонгоно уу --')}
                                            options={teacher_option || []}
                                            value={selectedTeachers}
                                            noOptionsMessage={() => t('Хоосон байна.')}
                                            onChange={(val) => {
                                                setSelectedTeachers(val)
                                            }}
                                            styles={ReactSelectStyles}
                                            getOptionValue={(option) => option.id}
                                            getOptionLabel={(option) => option?.rank_name + ' ' + option.last_name + '.' + option?.first_name}
                                        />
                                    )
                                }}
                            ></Controller>
                            {errors.teacher && <FormFeedback className='d-block'>{t(errors.teacher.message)}</FormFeedback>}
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
                                        readOnly={stypeValue === 2}
                                        invalid={errors[field.name] && true}
                                    />
                                )}
                            />
                            {errors.end_date && <FormFeedback className='d-block'>{t(errors.end_date.message)}</FormFeedback>}
                        </Col>
                        {
                            editId && (
                                <Col md={6} className='d-flex gap-5'>
                                    <Col md={9}>
                                        <Label className="form-label" for="student">
                                            {t('Оюутан нэмэх')}
                                        </Label>
                                        <Controller
                                            defaultValue=''
                                            control={control}
                                            name="student"
                                            render={({ field: { value, onChange } }) => {
                                                return (
                                                    <Select
                                                        id="student"
                                                        name="student"
                                                        classNamePrefix='select'
                                                        className='react-select'
                                                        placeholder={`Хайх`}
                                                        options={students || []}
                                                        value={students.find((c) => c.id === value)}
                                                        noOptionsMessage={() => 'Хоосон байна'}
                                                        onChange={(val) => {
                                                            setSelectedStudent(val?.id)
                                                        }}
                                                        onInputChange={(e) => {
                                                            setStudentSearchValue(e);
                                                            if (student_search_value.length > 1) {
                                                                handleStudentSelect();
                                                            } else if (student_search_value.length === 0) {
                                                                setStudents([]);
                                                            }
                                                        }}
                                                        styles={ReactSelectStyles}
                                                        getOptionValue={(option) => option.id}
                                                        getOptionLabel={(option) => `${option.code} ${option.full_name}`}
                                                    />
                                                );
                                            }}
                                        />
                                    </Col>
                                    <Col md={3}>
                                        <Button
                                            className="mt-2"
                                            color="primary"
                                            size='sm'
                                            onClick={onSubmitStudent}
                                        >
                                            {t("Нэмэх")}
                                        </Button>
                                    </Col>
                                </Col>
                            )
                        }

                        <Card style={{ maxHeight: '300px', overflowY: 'auto' }}>
                            <CardBody tag={Row}>
                                <CardTitle tag="h5">Дахин шалгалт өгөх суралцагчид</CardTitle>
                                {
                                    !editId
                                    ?
                                        <Row>
                                            <Col md={6}>
                                                <CardHeader className='py-0'><strong>Шалгалтанд оролцох суралцагчид</strong>({studentData?.included_students?.length})</CardHeader>
                                                <CardBody>
                                                    <Table bordered size='sm'>
                                                        <thead>
                                                            <tr>
                                                                <th>№</th>
                                                                <th>Хөтөлбөр анги</th>
                                                                <th>Оюутан</th>
                                                                <th>Оноо</th>
                                                                <th>Хасах</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {
                                                                studentData?.included_students?.map((student, originalIndex) => (
                                                                    <tr>
                                                                        <td>{originalIndex + 1}</td>
                                                                        <td>{student?.student__group__profession__name} - {student?.student__group__name}</td>
                                                                        <td>{student?.student__code} - {student?.student__last_name[0]}.{student?.student__first_name}</td>
                                                                        <td>{student?.score?.toFixed(1)}</td>
                                                                        <td>
                                                                            <Badge color='light-primary' tag={'a'} onClick={(e) => handleAdd(student, false)}>
                                                                                <MinusCircle size={15}/>
                                                                            </Badge>
                                                                        </td>
                                                                    </tr>
                                                                ))
                                                            }
                                                        </tbody>
                                                    </Table>
                                                </CardBody>
                                            </Col>
                                            <Col md={6}>
                                                <CardHeader className='py-0'><strong>Шалгалтанд оролцох боломжгүй суралцагчид (3-аас дээш хичээлд унасан суралцагчид)</strong>({studentData?.excluded_students?.length})</CardHeader>
                                                <CardBody>
                                                    <Table bordered size='sm'>
                                                        <thead>
                                                            <tr>
                                                                <th>№</th>
                                                                <th>Хөтөлбөр анги</th>
                                                                <th>Оюутан</th>
                                                                <th>Оноо</th>
                                                                <th>Нэмэх</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {
                                                                studentData?.excluded_students?.map((student, originalIndex) => (
                                                                    <tr>
                                                                        <td>{originalIndex + 1}</td>
                                                                        <td>{student?.student__group__profession__name} - {student?.student__group__name}</td>
                                                                        <td>{student?.student__code} - {student?.student__last_name[0]}.{student?.student__first_name}</td>
                                                                        <td>{student?.score?.toFixed(1)}</td>
                                                                        <td>
                                                                            <Badge color='light-primary' tag={'a'} onClick={(e) => handleAdd(student, true)}>
                                                                                <PlusCircle size={15}/>
                                                                            </Badge>
                                                                        </td>
                                                                    </tr>
                                                                ))
                                                            }
                                                        </tbody>
                                                    </Table>
                                                </CardBody>
                                            </Col>
                                        </Row>
                                    :
                                    <Row>
                                        <Col md={12}>
                                            <CardHeader className='py-0'><strong>Шалгалтанд оролцох суралцагчид</strong>({studentData?.length})</CardHeader>
                                            <CardBody>
                                                <Table bordered size='sm'>
                                                    <thead>
                                                        <tr>
                                                            <th>№</th>
                                                            <th>Хөтөлбөр анги</th>
                                                            <th>Оюутан</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {
                                                            studentData?.map((student, originalIndex) => (
                                                                <tr>
                                                                    <td>{originalIndex + 1}</td>
                                                                    <td>{student.group_name}</td>
                                                                    <td>{student.student_name}</td>
                                                                </tr>
                                                            ))
                                                        }
                                                    </tbody>
                                                </Table>
                                            </CardBody>
                                        </Col>
                                    </Row>

                                }
                            </CardBody>
                        </Card>
                        <Col md={12} className="mt-2 text-center">
                            <Button className="me-2" color="primary" type="submit" disabled={postLoading}>
                                {postLoading && <Spinner size='sm' className='me-1' />}
                                {t('Хадгалах')}
                            </Button>
                            <Button color="secondary" type="reset" outline onClick={() => {
                                if (editData?.id) {
                                    handleEdit();
                                } else {
                                    handleModal();
                                }
                            }}>
                                {t('Буцах')}
                            </Button>
                        </Col>
                    </Row>

                </ModalBody>
            </Modal>
        </Fragment >
    );
};
export default AddModal;
