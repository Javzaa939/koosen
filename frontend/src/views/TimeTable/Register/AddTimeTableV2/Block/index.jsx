// ** React imports
import React, { Fragment, useState, useEffect, useContext } from 'react'

import Select from 'react-select'

import useApi from "@hooks/useApi";
import useLoader from "@hooks/useLoader";
import SchoolContext from "@context/SchoolContext"
import ActiveYearContext from '@context/ActiveYearContext'

import classnames from "classnames";

import { useForm, Controller } from "react-hook-form";

import {
    Row,
    Col,
	Form,
	Label,
    Input,
	Button,
    Spinner,
	FormFeedback,
    Card,
    CardHeader,
    CardBody,
} from "reactstrap";

import { get_day, get_time, ReactSelectStyles, get_lesson_type, get_potok, get_week,get_oddeven_type, convertDefaultValue, validate } from "@utils"

import { useTranslation } from 'react-i18next';

import CTable from '../../Table';
import { validateSchema } from './validateSchema'
import { student_course_level } from '@utils'


const Block = ({  handleRoomModal, editValues, handleModal, roomModal, is_loading, setLoader, refreshDatas }) => {
    var values = {
        lesson: '',
        teacher: '',
        potok: '',
    }

    const { school_id } = useContext(SchoolContext)
    const { cyear_name, cseason_id } = useContext(ActiveYearContext)
    const { t } = useTranslation()

    // ** Hook
    const { control, handleSubmit, resetField, setError, clearErrors, setValue, formState: { errors } } = useForm(validate(validateSchema));

	// Loader
	const { Loader, isLoading, fetchData } = useLoader({});
	const { Loader: groupLoader, isLoading: groupLoading, fetchData: groupFetchData } = useLoader({});

    const defaultOddEven = 3

    const [select_value, setSelectValue] = useState(values);
    const [tdata, setTimeData] = useState([])
    const [lesson_name, setLesson] = useState('')

    const [studyType, setStudyType] = useState(1)
    const [colorName, setColorName] = useState('#eeeeee')
    const [beginWeekOption, setBeginWeek] = useState([])
    const [endWeekOption, setEndWeek] = useState([])
    const [teacherOption, setTeacher] = useState([])
    const [lessonOption, setLessonOption] = useState([])
    const [potokOption, setPotokOption] = useState([])
    const [timeOption, setTime] = useState([])
    const [dayOption, setDay] = useState([])
    const [groupOption, setGroup] = useState([])
    const [typeOption, setType] =useState([])
    // const [studentOption, setStudent] =useState([])
    // const [excludeStudentsOption, setExcludeStudent] = useState([])
    const [selectedTimes , setSelectedTimes] = useState([])
    const [onlineOption, setOnlineOption] = useState([])
    const [kurs, setKurs] = useState([])
    const [departOption, setDepartOption] = useState([])

    const [selectedGroups, setSelectedGroups] = useState([])
    const [selectedAddGroups, setSelectedAddGroups] = useState([])
    const [selectedGroupStudent, setSelectedGroupStudent] = useState([])
    const [removeStudents, setRemoveStudent] = useState([])
    const [roomOption, setRoom] = useState([])
    const [oddEvenOption, setOddEvenOption] =useState([])
    const [selectDepart, setSelectDepart] = useState([])
    const [levelOptions, setLevelOptions] = useState(student_course_level())
    const [selectedDay, setSelectedDay] = useState([])
    const [selectedRooms , setSelectedRooms] = useState([])

    const [checked, setOnlyCheck] = useState(false)

    const [lessonCurrentPage, setLessonCurrentPage] = useState(1);
    const [lessonRowsPerPage] = useState(15);
	const [lessonPageCount, setLessonPageCount] = useState(1);
	const [lessonSearchValue, setLessonSearchValue] = useState([]);
    const [isFirstRender, setIsFirstRender] = useState(true)

    // Api
    const teacherApi = useApi().hrms.teacher
    const lessonApi = useApi().study.lessonStandart
    const groupApi = useApi().student.group
    const timetableApi = useApi().timetable.register
    // const studentApi = useApi().student
    const roomApi = useApi().timetable.room
    const departApi = useApi().hrms.department

    // Өрөөний жагсаалт
    async function getRoom() {
        const { success, data } = await fetchData(roomApi.getList())
        if(success) {
            setRoom(data)
        }
    }

    useEffect(
        () =>
        {
            getRoom()
        },
        [roomModal]
    )


    // Багшийн жагсаалт
    async function getTeacher() {
        const { success, data } = await fetchData(teacherApi.getTeacher(''))
        if(success) {
            setTeacher(data)
        }
    }

    // Ангийн жагсаалт
    async function getGroup() {
        const { success, data } = await fetchData(groupApi.getTimetableList(select_value.lesson, kurs))
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

    // Check
    const handleCheck = (e) => {
        setOnlyCheck(e.target.checked)
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

    function getAll(page=1) {
        Promise.all(
            [
                fetchData(lessonApi.getTimeList(lessonRowsPerPage, page, lessonSearchValue))
            ]
        ).then((values) => {
            const data = values[0]?.data
            const results = data?.results
            if (page === 1) setLessonOption(results)
            else setLessonOption((prev) => [...prev, ...results])
            setLessonPageCount(Math.ceil(data?.count / lessonRowsPerPage))
        })
    }

    // Тэнхимийн жагсаалт
    async function getDepartment() {
        const { success, data } = await fetchData(departApi.getSelectSchool(school_id))
        if(success) {
            setDepartOption(data)
        }
    }

    useEffect(() => {
        getAll()
        getDepartment()
        setOnlineOption(get_lesson_type())
        setBeginWeek(get_week())
        setEndWeek(get_week())
        setOddEvenOption(get_oddeven_type())
        setPotokOption(get_potok())
        setTime(get_time())
        setDay(get_day())
    },[])

    useEffect(() => {
        setValue('day', editValues?.day),
        setValue('lesson', editValues?.lesson),
        setValue('time', editValues?.time),
        // setValue('group', editValues?.group)
        setValue('teacher', editValues?.teacher)
        setSelectValue(current => {
            return {
                ...current,
                lesson: editValues?.lesson,
            }
        })
    }, [editValues])

    // useEffect(() => {
    //     if (groupOption.length > 0) {
    //         if (editValues?.group) {
    //             setSelectedGroups([groupOption.find((c) => c.id === editValues?.group)])
    //         }
    //     }
    // }, [groupOption])

    // Ангийн онлайнаар хичээл үзэх анги
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
            if(data.length == 0) {
                setError('type', { type: 'custom', message: 'Багц цагийн тохиргоогоо оруулна уу'})
            } else {
                setType(data)
                clearErrors('type')

            }
        }
    }

    // function getStudents() {

    //     var group_ids = []
    //     if (selectedGroups) {
    //         selectedGroups.forEach(element => {
    //             if (element) group_ids.push(element?.id)
    //         })
    //     }

    //     Promise.all(
    //         [
    //             groupFetchData(studentApi.getGroup(group_ids, true)),
    //             groupFetchData(studentApi.getRemoveGroup(group_ids, false))
    //         ]
    //     ).then((values) => {
    //         setStudent(values[0]?.data)
    //         setExcludeStudent(values[1]?.data)
    //     })
    // }

    // useEffect(
    //     () =>
    //     {
    //         if (selectedGroups.length > 0) {
    //             const timeoutId = setTimeout(() => {
    //                 getStudents();
    //             }, 1000);

    //             return () => clearTimeout(timeoutId);
    //         }
    //     },
    //     [selectedGroups]
    // )

    useEffect(
        () =>
        {
            if (select_value.potok) {
                getTimeTableData()
            }
            if (select_value?.lesson) {
                getLessonType()
            }
        },
        [select_value.potok, select_value.lesson]
    )

    useEffect(
        () =>
        {
            getTeacher()
        },
        [select_value?.lesson]
    )

    useEffect(
        () =>
        {
            if (select_value?.lesson) {
                getGroup()
            }
        },
        [select_value.lesson, kurs]
    )

    useEffect(() => {
        if (isFirstRender) {
            setIsFirstRender(false)

            return
        }

        getAll(lessonCurrentPage)
    }, [lessonCurrentPage])

	useEffect(() => {
		const timeoutId = setTimeout(() => {
			if (lessonSearchValue.length !== 1) getAll();
		}, 1000);

		return () => {
			clearTimeout(timeoutId)
		}
	}, [lessonSearchValue])

	async function onSubmit(cdata) {
        cdata['is_block'] = true

        var odd_even_list = []

        if (!checked && selectedGroups.length == 0) {
            setError('group', { type: 'custom', message: 'Хоосон байна'})
        } else {
            setLoader(true)

            var student_ids = []
            var remove_students = []

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

            cdata['group'] = !checked ? selectedGroups : []
            cdata['addgroup'] = !checked ? selectedAddGroups : []

            cdata['is_block'] = true
            cdata['is_simple'] = false
            cdata['school'] = school_id
            cdata['lesson_year'] = cyear_name
            cdata['lesson_season'] = cseason_id

            cdata['students'] = student_ids
            cdata['remove_students'] = remove_students
            cdata['is_optional'] = checked
            cdata['color'] = colorName
            cdata['day'] = selectedDay
            cdata['time'] = selectedTimes
            cdata['room'] = selectedRooms
            cdata['choosing_deps'] = selectDepart?.map((c) => c.id)
            cdata['choosing_levels'] = kurs?.map((e) => e.id)
            cdata['department'] = selectDepart?.map((c) => c.id)?.length > 0  ? selectDepart?.map((c) => c.id)[0] : ''

            odd_even_list.push(defaultOddEven)

            if (cdata.odd_even) {
                odd_even_list.push(cdata.odd_even)
            } else {
                cdata['odd_even'] = defaultOddEven
            }

            cdata['odd_even_list'] = odd_even_list

            cdata = convertDefaultValue(cdata)
            const { success, error } = await fetchData(timetableApi.postSimple(cdata, 'is_simple'))
            if(success) {
                resetField('begin_week')
                resetField('end_week')
                resetField('day')
                resetField('time')
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


    // Өнгө onchange
    const handleColorChange = (e) => {
        setColorName(e.target.value)
    }

    // Анги бүтнээр check хийх
    const handleAllCheck = (e) => {
        if (e.target.checked) {
            setSelectedGroups([...groupOption])
        } else {
            setSelectedGroups([])
        }
    }

    // Анги нэг нэгээр check хийх
    const handleOneSelect = (e, val) => {
        if (e.target.checked) {
            setSelectedGroups((prev) => [...prev, val]);
        } else {
            setSelectedGroups((prev) => prev.filter(item => !(item.id === val?.id)));
        }
    }

    // Хичээлийн өдөрүүд
    function daySelect(data) {
        setSelectedDay(data)
    }

    // 1 өдөрт олон хуваарь
    function timeSelect(data, day, is_add) {
        var cdata = {
            day: day,
            times: data,
        };

        if (is_add) {
            const existingEntry = selectedTimes.find(item => item.day === day)

            if (existingEntry) {
                setSelectedTimes((prev) =>
                    prev.map(item =>
                        item.day === day
                            ? { ...item, times: data }
                            : item
                    )
                );
            } else {
                setSelectedTimes((prev) => [...prev, cdata]);
            }
        } else {
            setSelectedTimes((prev) => prev.filter(item => !(item.day === day)));
        }
    }

    function roomSelect(data, day, is_add) {
        var cdata = {
            day: day,
            room: data,
        };

        if (is_add) {
            const existingEntry = selectedRooms.find(item => item.day === day);

            if (existingEntry) {
                setSelectedRooms((prev) =>
                    prev.map(item =>
                        item.day === day
                            ? { ...item, room: data }
                            : item
                    )
                );
            } else {
                setSelectedRooms((prev) => [...prev, cdata]);
            }
        } else {
            setSelectedRooms((prev) => prev.filter(item => !(item.day === day)));
        }
    }

	return (
        <Fragment>
            <Row tag={Form} className="gy-1" onSubmit={handleSubmit(onSubmit)}>
                <div className='mt-1'>
                    <Row className='mb-1'>
                        <Col md={4} sm={12}>
                            <Label className="form-label" for="lesson">
                                {t('Хичээл')}
                            </Label>
                            <Controller
                                control={control}
                                defaultValue={editValues?.lesson || '' }
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
                                            value={lessonOption.find((c) => c.id == (value || editValues.lesson))}
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
                                            onMenuScrollToBottom={() => {
                                                if (lessonCurrentPage < lessonPageCount) {
                                                    setLessonCurrentPage(lessonCurrentPage + 1)
                                                }
                                            }}
                                            onInputChange={(value) => {
                                                setLessonSearchValue(value);
                                            }}
                                        />
                                )}}
                            />
                            {errors.lesson && <FormFeedback className='d-block'>{t(errors.lesson.message)}</FormFeedback>}
                        </Col>
                        <Col md={4} sm={12}>
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
                            <Label className="form-label" for="department">
                                {t("Тэнхим")}
                            </Label>
                            <Controller
                                control={control}
                                defaultValue=''
                                name="department"
                                render={({ field: { value, onChange} }) => {
                                    return (
                                        <Select
                                            name="department"
                                            id="department"
                                            classNamePrefix='select'
                                            isClearable
                                            isMulti
                                            className={classnames('react-select', { 'is-invalid': errors.department })}
                                            isLoading={isLoading}
                                            placeholder={t(`-- Сонгоно уу --`)}
                                            options={departOption || []}
                                            value={selectDepart}
                                            noOptionsMessage={() => t('Хоосон байна.')}
                                            onChange={(val) => {
                                                setSelectDepart(val)
                                            }}
                                            styles={ReactSelectStyles}
                                            getOptionValue={(option) => option.id}
                                            getOptionLabel={(option) => option.name}
                                        />
                                    )
                                }}
                            />
                            {errors.teacher && <FormFeedback className='d-block'>{t(errors.teacher.message)}</FormFeedback>}
                        </Col>
                        <Col md={4} sm={12}>
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
                                            className={classnames('react-select', { 'is-invalid': errors.teacher })}
                                            isLoading={isLoading}
                                            placeholder={t(`-- Сонгоно уу --`)}
                                            options={teacherOption || []}
                                            value={teacherOption.find((c) => c.id === (value || editValues?.teacher))}
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
                            value={colorName}
                            onChange={handleColorChange}
                        />
                        <Input
                            id='color'
                            type='text'
                            bsSize='sm'
                            className='ms-1'
                            value={colorName}
                            onChange={handleColorChange}
                        />
                    </div>
                </Col>
                <Row className='mt-1'>
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
                </Row>
                <Col md={4} sm={12}>
                    <Label className="form-label" for="odd_even">
                        {t('Хичээллэх 7 хоногийн төрөл')}
                    </Label>
                    <Controller
                        control={control}
                        defaultValue={defaultOddEven}
                        name="odd_even"
                        render={({ field: { value, onChange} }) => {
                            return (
                                <Select
                                    name="odd_even"
                                    id="odd_even"
                                    classNamePrefix='select'
                                    isClearable
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
                <Col md={4} sm={12} >
                    <Label for="study_type">
                        {t('Хичээл орох хэлбэр')}
                    </Label>
                    <Controller
                        control={control}
                        defaultValue={studyType}
                        name="study_type"
                        render={({ field: { value, onChange} }) => {
                            return (
                                <Select
                                    name="study_type"
                                    id="study_type"
                                    classNamePrefix='select'
                                    isClearable
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
                <Row>
                    <Col md={3}  sm={12} className='mt-1'>
                        <Label className="form-label" for="day">
                            {t('Өдөр')}
                        </Label>
                        <Controller
                            control={control}
                            defaultValue={editValues?.day || '' }
                            name="day"
                            render={({ field: { value, onChange} }) => {
                                return (
                                    <Select
                                        name="day"
                                        id="day"
                                        classNamePrefix='select'
                                        isClearable
                                        className={classnames('react-select', { 'is-invalid': errors.day })}
                                        isLoading={isLoading}
                                        placeholder={t(`-- Сонгоно уу --`)}
                                        options={dayOption || []}
                                        value={selectedDay}
                                        noOptionsMessage={() => t('Хоосон байна.')}
                                        onChange={(val) => {
                                            onChange(val?.id || '')
                                            daySelect(val);
                                        }}
                                        isMulti
                                        styles={ReactSelectStyles}
                                        getOptionValue={(option) => option.id}
                                        getOptionLabel={(option) => option.name}
                                    />
                                )
                            }}
                        />
                        {errors.day && <FormFeedback className='d-block'>{t(errors.day.message)}</FormFeedback>}
                    </Col>
                </Row>
                {
                    selectedDay?.map((day) =>
                        <Row className='mt-50'>
                            <Col md={3}>
                                <Label>Хичээл орох өдөр</Label>
                                <Input
                                    type='text'
                                    defaultValue={day?.name}
                                    disabled={true}
                                    bsSize={'sm'}
                                />
                            </Col>
                            <Col md={3} sm={12}>
                                <Label className="form-label" for="time">
                                    {t('Цаг')}
                                </Label>
                                <Controller
                                    control={control}
                                    defaultValue={editValues?.time || '' }
                                    name="time"
                                    render={({ field: { value, onChange} }) => {
                                        return (
                                            <Select
                                                name="time"
                                                id="time"
                                                classNamePrefix='select'
                                                isClearable
                                                className={classnames('react-select', { 'is-invalid': errors.time })}
                                                isLoading={isLoading}
                                                placeholder={t(`-- Сонгоно уу --`)}
                                                options={timeOption || []}
                                                value={selectedTimes?.find((data) => data.day === day?.id)?.times || []}
                                                noOptionsMessage={() => t('Хоосон байна.')}
                                                onChange={(val) => {
                                                    if (val?.length > 0) {
                                                        timeSelect(val, day?.id, true)
                                                    } else {
                                                        timeSelect(val, day?.id, false)
                                                    }
                                                }}
                                                isMulti
                                                styles={ReactSelectStyles}
                                                getOptionValue={(option) => option.id}
                                                getOptionLabel={(option) => option.name}
                                            />
                                        )
                                    }}
                                ></Controller>
                                {errors.time && <FormFeedback className='d-block'>{t(errors.time.message)}</FormFeedback>}
                            </Col>
                            <Col md={3} sm={12}>
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
                                                    classNamePrefix='select'
                                                    isClearable
                                                    className={classnames('react-select', { 'is-invalid': errors.room })}
                                                    isLoading={isLoading}
                                                    placeholder={t(`-- Сонгоно уу --`)}
                                                    options={roomOption || []}
                                                    value={roomOption?.find((c) => c.id === selectedRooms.find((c) => c.day === day?.id)?.room) || '' }
                                                    noOptionsMessage={() => {
                                                        return (
                                                            <a role='button' className="link-primary" onClick={handleRoomModal}>
                                                                {t('Өрөө шинээр үүсгэх')}
                                                            </a>
                                                        )
                                                    }}
                                                    onChange={(val) => {
                                                        if (val) {
                                                            roomSelect(val?.id, day?.id, true)
                                                        } else {
                                                            roomSelect(val?.id, day?.id, false)
                                                        }
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
                            <Col md={3} sm={12}></Col>
                        </Row>
                    )
                }
                <Row className='d-flex align-items-center justify-content-start  mt-1' md={6} sm={12} >
                    <Col>
                        <Input
                            id="is_optional"
                            className="dataTable-check mb-50 me-1"
                            type="checkbox"
                            bsSize="sm-5"
                            onChange={(e) => handleCheck(e)}
                            checked={checked}
                        />
                        <Label className="checkbox-wrapper" for="is_optional">
                            {t('Сонгон хичээл')}
                        </Label>
                    </Col>
                </Row>
                <Col md={6} sm={12}>
                    <Label className="form-label" for="kurs">
                        { checked ? t("Сонгон хичээл сонгох курс") : t("Курс")}
                    </Label>
                    <Select
                        name="kurs"
                        id="kurs"
                        classNamePrefix='select'
                        isClearable
                        className={classnames('react-select')}
                        isLoading={groupLoading}
                        placeholder={t(`-- Сонгоно уу --`)}
                        options={levelOptions || []}
                        value={levelOptions.find((c) => c.id === kurs)}
                        noOptionsMessage={() => t('Хоосон байна.')}
                        onChange={(val) => {
                            setKurs(val)
                        }}
                        isMulti
                        isSearchable={true}
                        styles={ReactSelectStyles}
                        getOptionValue={(option) => option.id}
                        getOptionLabel={(option) => option.name}
                    />
                </Col>
                {
                    !checked &&
                    <>
                        <Col sm={12}>
                            <Label className="form-label" for="group">
                                {t("Анги хэсэг")}
                            </Label>
                            <div className='border p-1'>
                                <div className="d-flex justify-content-start">
                                    <div>
                                        <Input
                                            type='checkbox'
                                            id='all'
                                            className=' me-1'
                                            bsSize="md"
                                            checked={selectedGroups?.length === groupOption?.length ? true : false}
                                            onChange={(e) => handleAllCheck(e)}
                                        />
                                    </div>
                                    <Label for='all'>{'Бүгд'}</Label>
                                </div>
                                {
                                    groupOption?.map((group, idx) =>
                                        <div className=" d-flex justify-content-start" key={idx}>
                                            <div>
                                                <Input
                                                    type='checkbox'
                                                    id='checked'
                                                    className=' me-1'
                                                    bsSize="md"
                                                    checked={selectedGroups?.find((c) => c.id == group?.id)}
                                                    onChange={(e) => handleOneSelect(e, group?.id)}
                                                />
                                            </div>
                                            <Label>{group?.name}</Label>
                                        </div>
                                    )
                                }
                            </div>
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
                                                    value={groupOption.find((c) => c.id === value)}
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
                        {/* <Col sm={12} className='mt-1'>
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
                                            className={classnames('react-select', { 'is-invalid': errors.students })}
                                            isLoading={groupLoading}
                                            placeholder={t(`-- Сонгоно уу --`)}
                                            options={studentOption || []}
                                            value={studentOption.find((c) => c.id === value)}
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
                                            className={classnames('react-select', { 'is-invalid': errors.exclude_student })}
                                            isLoading={groupLoading}
                                            placeholder={t(`-- Сонгоно уу --`)}
                                            options={excludeStudentsOption || []}
                                            value={excludeStudentsOption.find((c) => c.id === value)}
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
                        </Col> */}
                    </>
                }
                <Col md={12} sm={12} className="mt-2 d-flex justify-content-start mb-0">
                    <Button color="primary" type="submit" disabled={is_loading}>
                        {is_loading && <i className={`fas fa-spinner-third fa-spin me-2`}></i>}
                        {t('Хадгалаад нэмэх')}
                    </Button>
                    <Button className='ms-1' color="secondary" type="reset" outline  onClick={handleModal}>
                        {t("Буцах")}
                    </Button>
                </Col>
            </Row>
        </Fragment>
	);
};
export default Block;
