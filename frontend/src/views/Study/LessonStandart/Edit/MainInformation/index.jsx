// ** React imports
import React, { Fragment, useState, useEffect, useContext } from 'react'

import Select from 'react-select'

import useApi from "@hooks/useApi";
import useLoader from "@hooks/useLoader";

import { ReactSelectStyles } from "@utils"

import classnames from "classnames";

import { useForm, Controller } from "react-hook-form";
import { useParams } from 'react-router-dom';

import {
    Row,
    Col,
	Form,
	Card,
	Input,
	Label,
	Button,
	CardBody,
	CardHeader,
	FormFeedback,
} from "reactstrap";

import { t } from 'i18next';

import {Spinner} from 'reactstrap';
import AuthContext from '@context/AuthContext'
import SchoolContext from "@context/SchoolContext"

import { validate, convertDefaultValue } from "@utils"
import { validateSchema } from '../../validateSchema';

const MainInformation = ({ getNavigateData }) => {

    // ** Hook
    const { control, handleSubmit, reset, setError, setValue, formState: { errors } } = useForm(validate(validateSchema));

    const [category_option, setCategoryOption] = useState([])
    const [school_option, setSchoolOption] = useState([])
    const [department_option, setDepartmentOption] = useState([])
    const [teacher_option, setTeacherOption] = useState([])
    const [selectedTeachers, setSelectedTeachers] = useState([])
    const [select_school, setSelectSchool] = useState('')
    const [select_department, setSelectDepartment] = useState('')
    const [datas, setDatas ] = useState([])

    const { user } = useContext(AuthContext)
    const { school_id } = useContext(SchoolContext)
    const { standart_Id } = useParams()

    const [is_valid, setValid] = useState(true)

	// Loader
	const { isLoading, fetchData } = useLoader({});
	const { isLoading: teacherLoading, fetchData: teacherFetchData } = useLoader({});

    // Api
    const lessonStandartApi = useApi().study.lessonStandart
    const lessonCategoryApi = useApi().settings.lessonCategory
    const schoolApi = useApi().hrms.subschool
    const departmentApi = useApi().hrms.department
    const teacherApi = useApi().hrms.teacher

    // Бүрэлдэхүүн сургуулийн жагсаалт
    async function getSchoolOption() {
        const { success, data } = await fetchData(schoolApi.get())
        if(success) {
            setSchoolOption(data)
        }
    }

    // Тэнхимын жагсаалт
    async function getDepartmentOption() {
        const { success, data } = await fetchData(departmentApi.getSelectSchool(select_school))
        if(success) {
            setDepartmentOption(data)
        }
    }

    // Хичээлийн ангилал авах
    async function getLessonCategory() {
        const { success, data } = await fetchData(lessonCategoryApi.get())
        if(success) {
            setCategoryOption(data)
        }
    }

    // Хичээл заах багшийн жагсаалт авах
    async function getTeacher() {
        const { success, data } = await teacherFetchData(teacherApi.getSelectSchool(select_school)) //сонгосон сургуулиас хамаарч багшийн мэдээлэл гаргадаг болгосон
        if(success) {
            setTeacherOption(data)
        }
    }

    useEffect(() => {
        if(Object.keys(user).length > 0 && user.permissions.includes('lms-study-lessonstandart-update')) {
            setValid(false)
        }
    },[user])

    function teacherSelect(data) {
        setSelectedTeachers(data);
    }

    async function getDatas() {
        if(standart_Id) {
            const { success, data } = await fetchData(lessonStandartApi.getOne(standart_Id))
            if(success) {
                setDatas(data)
                // засах үед дата байх юм бол setValue-р дамжуулан утгыг харуулна
                if(data === null) return
                for(let key in data) {
                    if(data[key] !== null)
                        setValue(key, data[key])
                    else setValue(key,'')

                    if(key === 'category' || key === 'department') {
                        setValue(key, data[key]?.id)
                    }
                    if (key === 'teachers') {
                        var teacher_ids = []
                        data[key]?.teachers?.map((teacher, idx) => {
                            var selected = teacher_option.find((e) => e.id === teacher?.id)
                            if (selected != undefined) {
                                teacher_ids.push(selected)
                            }
                            setSelectedTeachers(teacher_ids)
                        })
                    }
                }
            }
        }
    }

    useEffect(() => {
        getLessonCategory()
        getSchoolOption()
        getDatas()
    },[])

    useEffect(() => {
        getDepartmentOption()
        getTeacher()
    },[select_school])


    useEffect(() => {
        if (Object.keys(datas).length > 0) {
            var teacher_ids = []
            datas['teachers']?.teachers?.map((teacher, idx) => {
                var selected = teacher_option.find((e) => e.id === teacher?.id)
                if (selected != undefined) {
                    teacher_ids.push(selected)
                }
                setSelectedTeachers(teacher_ids)
            })
        }
    },[teacher_option,datas])


	async function onSubmit(cdata) {
        cdata['updated_user'] = user.id
        cdata['teachers'] = selectedTeachers
        cdata = convertDefaultValue(cdata)
        const { success, errors } = await fetchData(lessonStandartApi.put(cdata, standart_Id))
        if(success) {
            getDatas();
            getNavigateData();
        } else {
            /** Алдааны мессэжийг input дээр харуулна */
            for (let key in errors) {
                setError(key, { type: 'custom', message:  errors[key][0]});
            }
        }
	}

	return (
        <Fragment>
            <Card className="modal-dialog-centered modal-lg" >
            {isLoading && <div className='suspense-loader'><Spinner size='xl'/></div>}
                <CardHeader className='bg-transparent pb-0'></CardHeader>
                <CardBody className="px-sm-3 pt-50 pb-3">
                    <div className='text-center'>
                        <h4>{t('Хичээлийн стандарт засах')}</h4>
                    </div>
                    <Row tag={Form} className="gy-1" onSubmit={handleSubmit(onSubmit)}>
                        {
                            !school_id&&
                            <Col lg={6} xs={12}>
                                <Label className="form-label" for="school">
                                    {t('Бүрэлдэхүүн сургууль')}
                                </Label>
                                <Controller
                                    control={control}
                                    defaultValue=''
                                    name="school"
                                    render={({ field: { value, onChange} }) => {
                                        return (
                                            <Select
                                                name="school"
                                                id="school"
                                                classNamePrefix='select'
                                                isClearable
                                                className={classnames('react-select', { 'is-invalid': errors.school })}
                                                isLoading={isLoading}
                                                placeholder={t(`-- Сонгоно уу --`)}
                                                options={school_option || []}
                                                value={school_option.find((c) => c.id === value)}
                                                noOptionsMessage={() => t('Хоосон байна')}
                                                onChange={(val) => {
                                                    onChange(val?.id || '')
                                                    setSelectSchool(val?.id || '')
                                                }}
                                                styles={ReactSelectStyles}
                                                getOptionValue={(option) => option.id}
                                                getOptionLabel={(option) => option.name}
                                                />
                                                )
                                            }}
                                            ></Controller>
                                {errors.school && <FormFeedback className='d-block'>{t(errors.school.message)}</FormFeedback>}
                            </Col>
                        }
                        <Col lg={6} xs={12}>
                            <Label className="form-label" for="department">
                                {t('Тэнхим')}
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
                                            options={department_option || []}
                                            value={department_option.find((c) => c.id === value)}
                                            noOptionsMessage={() => t('Хоосон байна')}
                                            onChange={(val) => {
                                                onChange(val?.id || '')
                                                setSelectDepartment(val?.id || '')
                                            }}
                                            styles={ReactSelectStyles}
                                            getOptionValue={(option) => option.id}
                                            getOptionLabel={(option) => option.name}
                                        />
                                    )
                                }}
                            ></Controller>
                            {errors.department && <FormFeedback className='d-block'>{t(errors.department.message)}</FormFeedback>}
                        </Col>
                        <Col lg={6} xs={12}>
                            <Label className="form-label" for="code">
                                {t('Хичээлийн код')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id="code"
                                name="code"
                                render={({ field }) => (
                                    <Input
                                        id ="code"
                                        bsSize="sm"
                                        placeholder={t('Хичээлийн код')}
                                        {...field}
                                        type="text"
                                        invalid={errors.code && true}
                                    />
                                )}
                            />
                            {errors.code && <FormFeedback className='d-block'>{t(errors.code.message)}</FormFeedback>}
                        </Col>
                        <Col lg={6} xs={12}>
                            <Label className="form-label" for="name">
                                {t('Хичээлийн нэр')}
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
                                        placeholder={t('Хичээлийн нэр')}
                                        {...field}
                                        type="text"
                                        invalid={errors.name && true}
                                    />
                                )}
                            />
                            {errors.name && <FormFeedback className='d-block'>{t(errors.name.message)}</FormFeedback>}
                        </Col>
                        <Col lg={6} xs={12}>
                            <Label className="form-label" for="name_eng">
                                {t('Хичээлийн нэр англи')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id="name_eng"
                                name="name_eng"
                                render={({ field }) => (
                                    <Input
                                        id ="name_eng"
                                        bsSize="sm"
                                        placeholder={t('Хичээлийн нэр англи')}
                                        {...field}
                                        type="text"
                                        invalid={errors.name_eng && true}
                                    />
                                )}
                            />
                            {errors.name_eng && <FormFeedback className='d-block'>{t(errors.name_eng.message)}</FormFeedback>}
                        </Col>
                        <Col lg={6} xs={12}>
                            <Label className="form-label" for="name_uig">
                                {t('Хичээлийн нэр уйгаржин')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id="name_uig"
                                name="name_uig"
                                render={({ field }) => (
                                    <Input
                                        id ="name_uig"
                                        bsSize="sm"
                                        placeholder={t('Хичээлийн нэр уйгаржин')}
                                        {...field}
                                        type="text"
                                        style={{ fontFamily: 'cmdashitseden', fontSize: '15px'}}
                                        invalid={errors.name_uig && true}
                                    />
                                )}
                            />
                            {errors.name_uig && <FormFeedback className='d-block'>{t(errors.name_uig.message)}</FormFeedback>}
                        </Col>
                        <Col lg={6} xs={12}>
                            <Label className="form-label" for="kredit">
                                {t('Багц цаг')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id="kredit"
                                name="kredit"
                                render={({ field }) => (
                                    <Input
                                        id ="kredit"
                                        bsSize="sm"
                                        placeholder={t('Багц цаг')}
                                        {...field}
                                        type='number'
                                        onKeyDown={(e) =>["e", "E", "+", "-", "."].includes(e.key) && e.preventDefault()}
                                        invalid={errors.kredit && true}
                                    />
                                )}
                            />
                            {errors.kredit && <FormFeedback className='d-block'>{t(errors.kredit.message)}</FormFeedback>}
                        </Col>
                        <Col lg='12'>
                            <Label className="form-label me-1" for="">
                                {t('Багц цагийн задаргаа')}
                            </Label>
                            <Row className='border rounded mx-0 p-1'>
                                <Col md={2}>
                                    <Label className="form-label  me-1" for="lecture_kr">
                                        {t('Лекц')}
                                    </Label>
                                    <Controller
                                        control={control}
                                        id="lecture_kr"
                                        name="lecture_kr"
                                        defaultValue=''
                                        render={({ field }) => (
                                            <Input
                                                {...field}
                                                id="lecture_kr"
                                                type="number"
                                                bsSize="sm"
                                                placeholder={t('0')}
                                                invalid={errors.lecture_kr && true}
                                            />
                                        )}
                                    />
                                    {errors.lecture_kr && <FormFeedback className='d-block'>{t(errors.lecture_kr.message)}</FormFeedback>}
                                </Col>
                                <Col md={2}>
                                    <Label className="form-label  me-1" for="seminar_kr">
                                        {t('Семинар')}
                                    </Label>
                                    <Controller
                                        control={control}
                                        id="seminar_kr"
                                        name="seminar_kr"
                                        defaultValue=''
                                        render={({ field }) => (
                                            <Input
                                                {...field}
                                                id="seminar_kr"
                                                type="number"
                                                bsSize="sm"
                                                placeholder={t('0')}
                                                invalid={errors.seminar_kr && true}
                                            />
                                        )}
                                    />
                                    {errors.seminar_kr && <FormFeedback className='d-block'>{t(errors.seminar_kr.message)}</FormFeedback>}
                                </Col>
                                <Col lg={2} xs={10}>
                                    <Label className="form-label  me-1" for="laborator_kr">
                                        {t('Лаборатор')}
                                    </Label>
                                    <Controller
                                        control={control}
                                        id="laborator_kr"
                                        name="laborator_kr"
                                        defaultValue=''
                                        render={({ field }) => (
                                            <Input
                                                {...field}
                                                id="laborator_kr"
                                                type="number"
                                                bsSize="sm"
                                                placeholder={t('0')}
                                                invalid={errors.laborator_kr && true}
                                            />
                                        )}
                                    />
                                    {errors.laborator_kr && <FormFeedback className='d-block'>{t(errors.laborator_kr.message)}</FormFeedback>}
                                </Col>
                                <Col lg={2} xs={12}>
                                    <Label className="form-label  me-1" for="practic_kr">
                                        {t('Практик')}
                                    </Label>
                                    <Controller
                                        control={control}
                                        id="practic_kr"
                                        name="practic_kr"
                                        defaultValue=''
                                        render={({ field }) => (
                                            <Input
                                                {...field}
                                                id="practic_kr"
                                                type="number"
                                                bsSize="sm"
                                                placeholder={t('0')}
                                                invalid={errors.practic_kr && true}
                                            />
                                        )}
                                    />
                                    {errors.practic_kr && <FormFeedback className='d-block'>{t(errors.practic_kr.message)}</FormFeedback>}
                                </Col>
                                <Col lg={2} xs={12}>
                                    <Label className="form-label  me-1" for="biedaalt_kr">
                                        {t('Бие даалт')}
                                    </Label>
                                    <Controller
                                        control={control}
                                        id="biedaalt_kr"
                                        name="biedaalt_kr"
                                        defaultValue=''
                                        render={({ field }) => (
                                            <Input
                                                {...field}
                                                id="biedaalt_kr"
                                                type="number"
                                                bsSize="sm"
                                                placeholder={t('0')}
                                                invalid={errors.biedaalt_kr && true}
                                            />
                                        )}
                                    />
                                    {errors.biedaalt_kr && <FormFeedback className='d-block'>{t(errors.biedaalt_kr.message)}</FormFeedback>}
                                </Col>
                            </Row>
                        </Col>
                        <Col lg={6} xs={12}>
                            <Label className="form-label" for="category">
                                {t('Хичээлийн ангилал')}
                            </Label>
                            <Controller
                                control={control}
                                defaultValue=''
                                name="category"
                                render={({ field: { value, onChange} }) => {
                                    return (
                                        <Select
                                            name="category"
                                            id="category"
                                            classNamePrefix='select'
                                            isClearable
                                            className={classnames('react-select', { 'is-invalid': errors.category })}
                                            isLoading={isLoading}
                                            placeholder={t(`-- Сонгоно уу --`)}
                                            options={category_option || []}
                                            value={category_option.find((c) => c.id === value)}
                                            noOptionsMessage={() => t('Хоосон байна')}
                                            onChange={(val) => {
                                                onChange(val?.id || '')
                                            }}
                                            styles={ReactSelectStyles}
                                            getOptionValue={(option) => option.id}
                                            getOptionLabel={(option) => option.category_name}
                                        />
                                    )
                                }}
                            ></Controller>
                            {errors.category && <FormFeedback className='d-block'>{t(errors.category.message)}</FormFeedback>}
                        </Col>
                        <Col lg={6} xs={12}>
                            <Label className="form-label" for="teacher">
                                {t('Хичээл заах багш')}
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
                                            isLoading={teacherLoading}
                                            placeholder={t('-- Сонгоно уу --')}
                                            options={teacher_option || []}
                                            value={selectedTeachers}
                                            noOptionsMessage={() => t('Хоосон байна.')}
                                            onChange={(val) => {
                                                onChange(val?.id || '')
                                                teacherSelect(val)
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
                            {errors.teacher && <FormFeedback className='d-block'>{t(errors.teacher.message)}</FormFeedback>}
                        </Col>
                        <Col lg={6} xs={12}>
                            <Label className="form-label  me-1" for="definition">
                                {t('Хичээлийн тодорхойлолт')}
                            </Label>
                            <Controller
                                control={control}
                                id="definition"
                                name="definition"
                                defaultValue=''
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        id="definition"
                                        type="textarea"
                                        bsSize="sm"
                                        placeholder={t('Хичээлийн тодорхойлолт')}
                                        invalid={errors.definition && true}
                                    />
                                )}
                            />
                            {errors.definition && <FormFeedback className='d-block'>{t(errors.definition.message)}</FormFeedback>}
                        </Col>
                        <Col lg={6} xs={12}>
                            <Label className="form-label  me-1" for="purpose">
                                {t('Хичээлийн зорилго')}
                            </Label>
                            <Controller
                                control={control}
                                id="purpose"
                                name="purpose"
                                defaultValue=''
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        id="purpose"
                                        type="textarea"
                                        bsSize="sm"
                                        placeholder={t('Хичээлийн зорилго')}
                                        invalid={errors.purpose && true}
                                    />
                                )}
                            />
                            {errors.purpose && <FormFeedback className='d-block'>{t(errors.purpose.message)}</FormFeedback>}
                        </Col>
                        <Col lg={6} xs={12}>
                            <Label className="form-label  me-1" for="knowledge">
                                {t('Олгох мэдлэг')}
                            </Label>
                            <Controller
                                control={control}
                                id="knowledge"
                                name="knowledge"
                                defaultValue=''
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        id="knowledge"
                                        type="textarea"
                                        bsSize="sm"
                                        placeholder={t('Олгох мэдлэг')}
                                        invalid={errors.knowledge && true}
                                    />
                                )}
                            />
                            {errors.knowledge && <FormFeedback className='d-block'>{t(errors.knowledge.message)}</FormFeedback>}
                        </Col>
                        <Col lg={6} xs={12}>
                            <Label className="form-label  me-1" for="skill">
                                {t('Олгох чадвар')}
                            </Label>
                            <Controller
                                control={control}
                                id="skill"
                                name="skill"
                                defaultValue=''
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        id="skill"
                                        type="textarea"
                                        bsSize="sm"
                                        placeholder={t('Олгох чадвар')}
                                        invalid={errors.skill && true}
                                    />
                                )}
                            />
                            {errors.skill && <FormFeedback className='d-block'>{t(errors.skill.message)}</FormFeedback>}
                        </Col>
                        <Col lg={6} xs={12}>
                            <Label className="form-label  me-1" for="attitude">
                                {t('Дадал хандлага')}
                            </Label>
                            <Controller
                                control={control}
                                id="attitude"
                                name="attitude"
                                defaultValue=''
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        id="attitude"
                                        type="textarea"
                                        bsSize="sm"
                                        placeholder={t('Дадал хандлага')}
                                        invalid={errors.attitude && true}
                                    />
                                )}
                            />
                            {errors.attitude && <FormFeedback className='d-block'>{t(errors.attitude.message)}</FormFeedback>}
                        </Col>
                        <Col className='text-center mt-2' md={12}>
                            <Button className="me-2" disabled={is_valid} size='sm' color="primary" type="submit">
                                {t('Хадгалах')}
                            </Button>
                        </Col>
                    </Row>
                </CardBody>
            </Card>
        </Fragment>
	);
};
export default MainInformation;
