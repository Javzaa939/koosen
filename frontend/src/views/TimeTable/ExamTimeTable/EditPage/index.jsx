import { Button, Card, Col, Input, Label, Row, Spinner, UncontrolledTooltip } from 'reactstrap'
import './style.scss'
import React, { useContext, useEffect, useState } from "react";
import { useParams, useLocation } from 'react-router-dom';
import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';
import { Badge, Form, FormFeedback } from "reactstrap";
import { AlertTriangle, ChevronsLeft, Minus, MinusCircle, Plus, X } from "react-feather";
import DataTable from 'react-data-table-component';
import { getColumns } from "./helpers";
import { getPagination } from "@utils";
import { validate, ReactSelectStyles, convertDefaultValue } from "@utils"
import { useTranslation } from 'react-i18next';
import ActiveYearContext from "@context/ActiveYearContext"

import classnames from "classnames";

import { useForm, Controller } from "react-hook-form";
import { validateSchema } from './validateSchema';
import Select from 'react-select'
import SchoolContext from "@context/SchoolContext"
import { useNavigate } from "react-router-dom"

const ACTIVE_STUDENT = 1
const INACTIVE_STUDENT = 2

function EditPage() {
	const navigate = useNavigate()

    const { id } = useParams()
    const { Loader, isLoading, fetchData } = useLoader({relativeSmSpinner: true})
    const {
        isLoading: postLoading,
        fetchData: postFetch } = useLoader({})

    const [localLoader, setLocalloader] = useState(true)

    const { control, handleSubmit, setValue, setError, reset, formState: { errors } } = useForm(validate(validateSchema));

    const { t } = useTranslation()

	const [currentPage, setCurrentPage] = useState(1);
	const [rowsPerPage, setRowsPerPage] = useState(10);
	const [total_count, setTotalCount] = useState(1);

    // Хуудас солих үед ажиллах хэсэг
	const handlePagination = (page) => {
        setCurrentPage(page.selected + 1);
	};

    // general info state
    const { cseason_id, cyear_name } = useContext(ActiveYearContext)

    const [online_checked, setOnlineChecked] = useState(false)
    const [teacher_option, setTeacherOption] = useState([])
    const [room_option, setRoomOption] = useState([])

    function IsOnline(checked) {
        setOnlineChecked(checked)
        if(checked) {
            setValue('room', '')
        }
    }

    const [datas, setDatas] = useState(
        {
            student_list: []
        }
    );
    const [active_students, setActiveStudents] = useState([]);
    const [inactive_students, setInactiveStudents] = useState([]);

    // Api
    const teacherApi = useApi().hrms.teacher
    const roomApi = useApi().timetable.room
    const examApi = useApi().timetable.exam

    // async function getResults() {
    //     const { success, data } = await fetchData(examApi.getOne(id));
    //     if (success) {
    //         setDatas(data);
    //         updateStudentLists(data.student_list);
    //         setTotalCount(data.student_list.filter(student => student.status === ACTIVE_STUDENT).length);
    //         setLocalloader(false)
    //     }
    // }

    async function getResults() {
        const { success, data } = await fetchData(examApi.getOne(id))
        if(success) {
            setDatas(data);
            setLocalloader(false);
            updateStudentLists(data.student_list);
            setTotalCount(data.student_list.filter(student => student.status === ACTIVE_STUDENT).length);

            // засах үед дата байх юм бол setValue-р дамжуулан утгыг харуулна
            if(data === null) return
            for(let key in data) {
                if(data[key] !== null) {
                    if (key === 'teacher') setValue(key, data[key]?.id)
                    else setValue(key, data[key])
                    // if(key === 'lesson') {
                    //     setSelectValue({
                    //         lesson: data[key]?.id || '',
                    //         teacher: select_value.teacher,
                    //         class: select_value.class,
                    //     })
                    //     setValue(key, data[key]?.id)
                    // }
                }
                else setValue(key, '')
                if(key === 'is_online') setOnlineChecked(data[key])
                if(key === 'room') {
                    setValue(key, data[key]?.id)
                    // setRoomCapacity(data[key]?.id)
                }
            }
        }
    }

       // Шалгалт авах өрөөний жагсаалт
    async function getRoom() {
        const { success, data } = await fetchData(roomApi.getList(''))
        if(success) {
            setRoomOption(data)
        }
    }

    // Багшийн жагсаалт
    async function getTeachers() {
        const { success, data } = await fetchData(teacherApi.getTeacher(''))
        if(success) {
            setTeacherOption(data)
        }
    }

    useEffect(() => {
        getResults();
        getRoom();
        getTeachers();
    }, []);


    function updateStudentLists(studentList) {
        setActiveStudents(studentList.filter((student) => student.status === ACTIVE_STUDENT));
        setInactiveStudents(studentList.filter((student) => student.status === INACTIVE_STUDENT));
    }


    function activeHandler(id) {

        const updatedStudentList = datas.student_list.map((student) =>
            student.id === id ? { ...student, status: student.status === ACTIVE_STUDENT ? INACTIVE_STUDENT : ACTIVE_STUDENT } : student
        );

        setDatas({ ...datas, student_list: updatedStudentList });
        updateStudentLists(updatedStudentList);

    }


	async function onSubmit(cdata) {
        cdata['lesson_year'] = cyear_name
        cdata['lesson_season'] = cseason_id
        cdata['is_online'] = online_checked
        cdata['student'] = datas?.student_list

        cdata = convertDefaultValue(cdata)

        if(id) {
            const { success, error } = await postFetch(examApi.put(cdata, id))
            if(success) {
                reset()
                getResults()
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

    return (
        <div>
            <Row className=''>
                <Col>
                    <div className='mb-1 p-1 rounded-3 light-glow d-flex justify-content-start'>
                        <div className='d-flex align-items-center'>
                            <Badge color='light-secondary' pill role='button' className='badge-glow' onClick={() => navigate(`/timetable/exam-register/`)}>
                                <ChevronsLeft/> Буцах
                            </Badge>
                        </div>
                        <h3 className='mx-2'>Шалгалтын мэдээлэл засах</h3>
                        <div></div>
                    </div>
                </Col>
            </Row>
            <Row className='pb-2'>
                <Col md={6} sm={12} className='mt-1'>
                    <div className='rounded-3 light-glow' style={{ minHeight: 399, maxHeight: 700 }}>
                        <div className='p-1 hasah-oyutnuud'>
                            Ерөнхий мэдээлэл
                        </div>
                        <div className='d-flex p-2'>
                            <Row tag={Form} className="gy-1" onSubmit={handleSubmit(onSubmit)}>
                                <Col md={12}>
                                    <Label className="form-label" for="lesson">
                                        {t('Хичээл')}
                                    </Label>
                                    <Controller
                                        defaultValue=''
                                        control={control}
                                        id="lesson"
                                        name="lesson"
                                        render={({ value, field }) => (
                                            <Input
                                                {...field}
                                                id="lesson"
                                                value={datas?.lesson?.name}
                                                disabled
                                                bsSize="sm"
                                                placeholder={t('Хичээлийн нэр')}
                                            />
                                        )}
                                    />
                                    {/* <Input value={datas?.lesson?.name} disabled className='ps-1' style={{ minHeight: 20, fontWeight: 600 }}>
                                    </Input> */}
                                </Col>
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
                                                    styles={ReactSelectStyles}
                                                    getOptionValue={(option) => option.id}
                                                    getOptionLabel={(option) => option.full_name}
                                                />
                                            )
                                        }}
                                    ></Controller>
                                    {errors.teacher && <FormFeedback className='d-block'>{t(errors.teacher.message)}</FormFeedback>}
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
                                            />
                                        )}
                                    />
                                    <Label className="form-label" for="is_online">
                                        {t('Онлайн шалгалт эсэх')}
                                    </Label>
                                </Col>
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
                                                    isDisabled={online_checked}
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
                                    ></Controller>
                                    {errors.room && <FormFeedback className='d-block'>{t(errors.room.message)}</FormFeedback>}
                                    <div className='d-flex justify-content-end m-1'>
                                        <Button color='primary' disabled={postLoading} type="submit">{postLoading ? <Spinner size='sm' style={{ marginLeft: 26, marginRight: 27 }}/> : 'Хадгалах' }</Button>
                                    </div>
                                </Col>
                            </Row>
                        </div>
                    </div>
                </Col>
                <Col md={6} sm={12} className='mt-1'>
                    <div className='rounded-3 light-glow' style={{ minHeight: 529, maxHeight: 530 }}>
                        <div className='p-1 hasah-oyutnuud'>
                            Хасах оюутнууд
                        </div>
                        <div>
                            <div className='p-2 overflow-auto'>
                                {
                                    inactive_students.map((dis, didx) => {
                                        const firstName = dis?.first_name.toLowerCase();
                                        const convertedFirstName = firstName.charAt(0).toUpperCase() + firstName.slice(1);

                                        const lastName = dis?.last_name.toLowerCase();
                                        const convertedLastName = lastName.charAt(0).toUpperCase()
                                        return(
                                            <div className='d-flex justify-content-between p-75 hoverglass rounded-3' key={`inactive${didx}`} style={{ userSelect: 'none'}}>
                                                <div className='d-flex'>
                                                    <div style={{ minWidth: 20 }}>
                                                        {didx + 1}.
                                                    </div>
                                                    <div className='me-75'>
                                                        {dis?.code}
                                                    </div>
                                                    <div>
                                                        {convertedLastName + '. ' + convertedFirstName}
                                                    </div>
                                                </div>
                                                <div>
                                                    <Badge pill color='light-success' onClick={() => activeHandler(dis?.id) }>
                                                        <Plus/>
                                                    </Badge>
                                                </div>
                                            </div>
                                        )
                                    })
                                }
                            </div>
                        </div>
                    </div>
                </Col>
            </Row>
            <Row className='pb-2'>
                <Col>
                    <div className='rounded-3 light-glow'>
                        <div className='p-1 hasah-oyutnuud'>
                            Оюутны жагсаалт
                        </div>
                        <div className='overflow-auto p-2 ' style={{ minHeight: '300px'}}>
                            {
                                (isLoading || localLoader) ?
                                    <div className='p-5 position-relative'>{Loader}</div>
                                    :
                                        datas.student_list && datas.student_list.length > 0 ?
                                        // active_students && datas.active_students.length > 0 ?

                                            <div>
                                                <DataTable
                                                    noHeader
                                                    pagination
                                                    className="react-dataTable"
                                                    columns={getColumns(
                                                        currentPage,
                                                        rowsPerPage,
                                                        total_count,
                                                        activeHandler
                                                    )}
                                                    paginationPerPage={rowsPerPage}
                                                    paginationDefaultPage={currentPage}
                                                    data={active_students}
                                                    paginationComponent={getPagination(
                                                        handlePagination,
                                                        currentPage,
                                                        rowsPerPage,
                                                        total_count
                                                    )}
                                                    fixedHeader
                                                    fixedHeaderScrollHeight="62vh"
                                                />
                                            </div>
                                        :
                                            <div className="d-flex justify-content-center align-items-center" style={{ height: '300px'}}>
                                                <Badge className="d-flex align-items-center p-50 text-wrap" id='tooltip-studentlist' style={{ fontSize: 14, userSelect:'none' }} pill color="light-warning">
                                                    <AlertTriangle className='me-50' style={{ height: 20, width: 20}}/> Уучлаарай өгөгдөл олдсонгүй
                                                </Badge>

                                                <UncontrolledTooltip
                                                    target="tooltip-studentlist"
                                                    style={{ userSelect:'none' }}
                                                >
                                                    Тухайн хичээлийн хуваарьд оюутан шивэгдээгүй байж болзошгүй
                                                </UncontrolledTooltip>
                                            </div>
                                }
                        </div>
                    </div>
                </Col>
            </Row>
            <div>

            </div>
        </div>
    )
}

export default EditPage