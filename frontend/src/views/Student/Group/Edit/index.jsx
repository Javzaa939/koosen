// ** React imports
import React, { Fragment, useState, useEffect, useContext } from 'react'

import Select from 'react-select'

import useApi from "@hooks/useApi";
import useLoader from "@hooks/useLoader";
import AuthContext from "@context/AuthContext"
import SchoolContext from "@context/SchoolContext"

import { ReactSelectStyles } from "@utils"
import { t } from 'i18next'

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

import { validate, generateLessonYear } from "@utils"
import { validateSchema } from '../validateSchema';
import StudentList from './StudentModal';

const EditModal = ({ open, handleModal, group_id, refreshDatas }) => {

    const { control, handleSubmit, reset, setValue, setError, formState: { errors } } = useForm(validate(validateSchema));

    const { user } = useContext(AuthContext)

    const [is_disabled, setDisabled] = useState(true)

    // Боловсролын зэргийн id
    const [ degree_id, setDegreeId] = useState('')

    const { school_id } = useContext(SchoolContext)

    // Хөтөлбөрийн багын id
    const [ dep_id, setDepId] = useState('')

    const [ profOption, setProfession] = useState([])
    const [ degreeOption, setDegree] = useState([])
    const [ statusOption, setStatus] = useState([])
    const [ teacherOption, setTeacher] = useState([])
    const [ depOption, setDepartment] = useState([])
    const [ yearOption, setYear] = useState([])
    const [ endModal, setEndModal] = useState(false)
    const [students, setStudents] = useState([])
    const [add_students, setAddStudents] = useState([])
    const [ is_finish, setIsFinish] = useState(false)


	// Loader
	const { Loader, isLoading, fetchData } = useLoader({});

    const groupApi = useApi().student.group
    const professionApi = useApi().study.professionDefinition
    const degreeApi = useApi().settings.professionaldegree
    const statusApi = useApi().settings.learning

    const depApi = useApi().hrms.department

    const teacherApi = useApi().hrms.teacher

    useEffect(() => {
        if(Object.keys(user).length > 0 && user.permissions.includes('lms-student-group-update') && school_id) {
            setDisabled(false)
        }
    },[user])

    //Мэргэжлийн жагсаалт авах
    async function getProfession () {

        const { success, data } = await fetchData(professionApi.getList(degree_id, dep_id))
        if (success) {
            setProfession(data)
        }
	}

    //Боловсролын зэргийн жагсаалт авах
    async function getDegree () {
        const { success, data } = await fetchData(degreeApi.get())
        if (success) {
            setDegree(data)
        }
	}

    //Cуралцах хэлбэрийн жагсаалт авах
    async function getStatus () {
        const { success, data } = await fetchData(statusApi.get())
        if (success) {
            setStatus(data)
        }
	}

    //Салбарын жагсаалт авах
    async function getDepartment () {
        const { success, data } = await fetchData(depApi.get(school_id))
        if (success) {
            setDepartment(data)
        }
	}

    //багшийн жагсаалт авах
    async function getTeacher () {
        const { success, data } = await fetchData(teacherApi.get(dep_id))
        if (success) {
            setTeacher(data)
        }
	}

    //хичээлийн жилийн жагсаалт авах
    async function getYear () {
        setYear(generateLessonYear(10))
	}

    useEffect(()=>{
        getDepartment()
        getYear()
        getDegree()
        getProfession()
        getStatus()
        getTeacher()
        getDatas()
    },[])

    useEffect(
        () =>
        {
            getProfession()
            getTeacher()
        },
        [degree_id, dep_id]
    )

    async function getDatas() {
        if(group_id) {
            const { success, data } = await fetchData(groupApi.getOne(group_id))
            if(success) {
                // засах үед дата байх юм бол setValue-р дамжуулан утгыг харуулна
                if(data === null) return
                for(let key in data) {
                    if(data[key] !== null)
                        setValue(key, data[key])
                    else setValue(key, '')

                    if(key === 'profession' || key === 'degree' || key === 'learning_status' || key === 'teacher' || key === 'department') {
                        setValue(key, data[key]?.id)
                    }

                    if (key === 'is_finish') {
                        setIsFinish(data[key])
                    }
                }
                setStudents(data?.students)
            }
        }
    }

	async function onSubmit(cdata) {
        var selected_students = students.filter((item) => {
            item?.is_selected ?  (item?.is_selected == true  && item.id)  : item?.id
            if (item?.is_selected && item?.is_selected) {
                return item.id
            } else {
                item.id
            }
        })
        cdata['is_finish'] = is_finish
        cdata['finish_students'] = selected_students
        const { success, error } = await fetchData(groupApi.put(cdata, group_id))
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
	}

    function handleDepartmentChange(department_id) {
        if (department_id) {
            setDepId(department_id)
        } else {
            setDepId('')
        }
        setValue('teacher', '')
    }

    const handleEnd = (checked) => {
        setEndModal(checked)
    }

    // Шалгалт өгөх оюутнуудын id авах функц
    function handleSelectedModal(params) {
        setAddStudents([...params])
        if(students) {
            for (let i in students) {
                if(!params.includes(students[i].id)) {
                    students[i].selected = false
                }
                else {
                    students[i].selected = true
                }
            }
        }
        setValue('student', params)
    }

	return (
        <Fragment>
            <Modal isOpen={open} toggle={handleModal} className="modal-dialog-centered modal-lg" onClosed={handleModal}>
            {isLoading && <div className='suspense-loader'><Spinner size='xl'/></div>}
                <ModalHeader className='bg-transparent pb-0' toggle={handleModal}></ModalHeader>
                <ModalBody className="px-sm-3 pt-50 pb-3">
                    <div className='text-center'>
                        <h4>{t('Ангийн бүртгэл засах')}</h4>
                    </div>
                    <Row tag={Form} className="gy-1" onSubmit={handleSubmit(onSubmit)}>
                        <Col lg={6} xs={12}>
                            <Label className="form-label" for="department">
                               {t('Хөтөлбөрийн баг')}
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
                                            className={classnames('react-select', { 'is-invalid': errors.department })}
                                            isLoading={isLoading}
                                            placeholder={t(`-- Сонгоно уу --`)}
                                            options={depOption || []}
                                            value={depOption.find((c) => c.id === value)}
                                            noOptionsMessage={() => 'Хоосон байна'}
                                            onChange={(val) => {
                                                onChange(val?.id || '')
                                                handleDepartmentChange(val?.id)
                                                setValue('profession', '')
                                            }}
                                            isreadOnly={is_disabled}
                                            styles={ReactSelectStyles}
                                            getOptionValue={(option) => option.id}
                                            getOptionLabel={(option) => option.name}
                                        />
                                    )
                                }}
                            ></Controller>
                            {errors.department && <FormFeedback className='d-block'>{errors.department.message}</FormFeedback>}
                        </Col>
                        <Col lg={6} xs={12}>
                            <Label className="form-label" for="degree">
                               {t('Боловсролын зэрэг')}
                            </Label>
                            <Controller
                                control={control}
                                defaultValue=''
                                name="degree"
                                render={({ field: { value, onChange} }) => {
                                    return (
                                        <Select
                                            name="degree"
                                            id="degree"
                                            classNamePrefix='select'
                                            isClearable
                                            className={classnames('react-select', { 'is-invalid': errors.degree })}
                                            isLoading={isLoading}
                                            placeholder={t(`-- Сонгоно уу --`)}
                                            options={degreeOption || []}
                                            value={degreeOption.find((c) => c.id === value)}
                                            noOptionsMessage={() => t('Хоосон байна.')}
                                            onChange={(val) => {
                                                onChange(val?.id || '')
                                                if (val?.id) setDegreeId(val?.id)
                                                else setDegreeId('')
                                                setValue('profession', '')
                                            }}
                                            isreadOnly={is_disabled}
                                            styles={ReactSelectStyles}
                                            getOptionValue={(option) => option.id}
                                            getOptionLabel={(option) => option.degree_name_code}
                                        />
                                    )
                                }}
                            ></Controller>
                            {errors.degree && <FormFeedback className='d-block'>{errors.degree.message}</FormFeedback>}
                        </Col>
                        <Col lg={6} xs={12}>
                            <Label className="form-label" for="join_year">
                                {t("Элссэн хичээлийн жил")}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id="join_year"
                                name="join_year"
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        id="join_year"
                                        bsSize="sm"
                                        type="select"
                                        placeholder="Код"
                                        invalid={errors.join_year && true}
                                        readOnly={is_disabled}
                                    >
                                          <option value="">{t('-- Сонгоно уу --')}</option>
                                        {
                                            yearOption.map((season, idx) => (
                                                <option key={idx} value={season.id}>{season.name}</option>
                                            ))
                                        }
                                    </Input>
                                )}
                            />
                            {errors.join_year && <FormFeedback className='d-block'>{errors.join_year.message}</FormFeedback>}
                        </Col>
                        <Col lg={6} xs={12}>
                            <Label className="form-label" for="profession">
                               {t('Мэргэжил')}
                            </Label>
                            <Controller
                                control={control}
                                defaultValue=''
                                name="profession"
                                render={({ field: { value, onChange} }) => {
                                    return (
                                        <Select
                                            name="profession"
                                            id="profession"
                                            classNamePrefix='select'
                                            isClearable
                                            className={classnames('react-select', { 'is-invalid': errors.profession })}
                                            isLoading={isLoading}
                                            placeholder={t(`-- Сонгоно уу --`)}
                                            options={profOption || []}
                                            value={value && profOption.find((c) => c.id === value)}
                                            noOptionsMessage={() => t('Хоосон байна.')}
                                            onChange={(val) => {
                                                onChange(val?.id || '')
                                            }}
                                            isreadOnly={is_disabled}
                                            styles={ReactSelectStyles}
                                            getOptionValue={(option) => option.id}
                                            getOptionLabel={(option) => option.full_name}
                                        />
                                    )
                                }}
                            ></Controller>
                            {errors.profession && <FormFeedback className='d-block'>{errors.profession.message}</FormFeedback>}
                        </Col>
                        <Col lg={6} xs={12}>
                            <Label className="form-label" for="name">
                                {t("Ангийн нэр")}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id="name"
                                name="name"
                                render={({ field }) => (
                                    <Input
                                        id ="name"
                                        bsSize="sm"
                                        placeholder={t('Ангийн нэр')}
                                        {...field}
                                        type="text"
                                        readOnly={is_disabled}
                                        invalid={errors.name && true}
                                    />
                                )}
                            />
                            {errors.name && <FormFeedback className='d-block'>{errors.name.message}</FormFeedback>}
                        </Col>
                        <Col lg={6} xs={12}>
                            <Label className="form-label" for="level">
                                {t("Курс")}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id="level"
                                name="level"
                                render={({ field }) => (
                                    <Input
                                        id ="level"
                                        bsSize="sm"
                                        placeholder={t("Курс")}
                                        {...field}
                                        type='number'
                                        onKeyDown={(e) =>["e", "E", "+", "-", "."].includes(e.key) && e.preventDefault()}
                                        invalid={errors.level && true}
                                        readOnly={is_disabled}
                                    />
                                )}
                            />
                            {errors.level && <FormFeedback className='d-block'>{errors.level.message}</FormFeedback>}
                        </Col>
                        <Col lg={6} xs={12}>
                            <Label className="form-label" for="learning_status">
                               {t('Суралцах хэлбэр')}
                            </Label>
                            <Controller
                                control={control}
                                defaultValue=''
                                name="learning_status"
                                render={({ field: { value, onChange} }) => {
                                    return (
                                        <Select
                                            name="learning_status"
                                            id="learning_status"
                                            classNamePrefix='select'
                                            isClearable
                                            className={classnames('react-select', { 'is-invalid': errors.learning_status })}
                                            isLoading={isLoading}
                                            placeholder={t(`-- Сонгоно уу --`)}
                                            options={statusOption || []}
                                            value={statusOption.find((c) => c.id === value)}
                                            noOptionsMessage={() => t('Хоосон байна')}
                                            onChange={(val) => {
                                                onChange(val?.id || '')
                                            }}
                                            isreadOnly={is_disabled}
                                            styles={ReactSelectStyles}
                                            getOptionValue={(option) => option.id}
                                            getOptionLabel={(option) => option.learn_name}
                                        />
                                    )
                                }}
                            ></Controller>
                            {errors.learning_status && <FormFeedback className='d-block'>{errors.learning_status.message}</FormFeedback>}
                        </Col>
                        <Col lg={6} xs={12}>
                            <Label className="form-label" for="teacher">
                               {t('Ангийн багш')}
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
                                            value={value && teacherOption.find((c) => c.id === value)}
                                            noOptionsMessage={() => t('Хоосон байна')}
                                            onChange={(val) => {
                                                onChange(val?.id || '')
                                            }}
                                            isreadOnly={is_disabled}
                                            styles={ReactSelectStyles}
                                            getOptionValue={(option) => option.id}
                                            getOptionLabel={(option) => option.full_name}
                                        />
                                    )
                                }}
                            ></Controller>
                            {errors.teacher && <FormFeedback className='d-block'>{errors.teacher.message}</FormFeedback>}
                        </Col>
                        <Col xs={12}>
                            <Label className="form-label pe-1" for="is_finish">
								{t('Төгссөн эсэх')}
                            </Label>
                            {/* <Controller
                                control={control}
                                id="is_finish"
                                name="is_finish"
                                render={({ field }) => ( */}
                                <Input
                                    id="is_finish"
                                    type="checkbox"
                                    checked={is_finish}
                                    onChange={(e) => {handleEnd(e.target.checked), setIsFinish(e.target.checked)}}
                                    // {...field}
                                    // readOnly={is_disabled}
                                />
                                {/* )}
                            /> */}
                        </Col>
                        <Col md={12} className="text-center mt-2">
                            <Button className="me-2" color="primary" type="submit" disabled={is_disabled}>
                                {t('Хадгалах')}
                            </Button>
                            <Button color="secondary" type="reset" outline  onClick={handleModal}>
                                {t('Буцах')}
                            </Button>
                        </Col>
                    </Row>
                    {
                        endModal &&
                            <StudentList
                                open={endModal}
                                handleModal={handleEnd}
                                handleSelectedModal={handleSelectedModal}
                                datas={students}
                            />
                    }
                </ModalBody>
            </Modal>
        </Fragment>
	);
};
export default EditModal;
