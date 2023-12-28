// ** React imports
import React, { Fragment, useState, useEffect, useContext } from 'react'

import Select from 'react-select'

import useApi from "@hooks/useApi";

import useLoader from "@hooks/useLoader";

import SchoolContext from "@context/SchoolContext";

import ActiveYearContext from "@context/ActiveYearContext";

import { ReactSelectStyles } from "@utils"

import classnames from "classnames";

import { useTranslation } from "react-i18next";

import { X } from "react-feather";

import { useForm, Controller } from "react-hook-form";

import {
    Row,
    Col,
	Form,
	Modal,
	Input,
	Label,
	Button,
    Spinner,
	ModalBody,
	ModalHeader,
	FormFeedback,
} from "reactstrap";

import { validate, convertDefaultValue } from "@utils"

import { validateSchema } from '../validateSchema';


const Createmodal = ({ open, handleModal, refreshDatas, select_value }) => {
    const CloseBtn = (
        <X className="cursor-pointer" size={15} onClick={handleModal} />
    )

    const { control, handleSubmit, setError, reset, setValue, formState: { errors } } = useForm(validate(validateSchema));

    //Context
    const { school_id } = useContext(SchoolContext)
    const { cyear_name, cseason_id } = useContext(ActiveYearContext)

    // Translate
    const { t } = useTranslation()

    //useState
    const [studentOption, setStudentOption] = useState([])
    const [lesson_option, setLessonOption] = useState ([])
    const [teacher_option, setTeacherOption] = useState ([])
    const [selected_student, setSelectStudent] = useState('')
    const [radio, setRadio] = useState('')
    const [selectLessonIds, setSelectLessonIds] = useState([])

	// Loader
	const { Loader, isLoading: getAllLoading, fetchData: allFetchData } = useLoader({ isFullScreen: false });
	const { isLoading: postLoading, fetchData: postFetch } = useLoader({});

    // Api
    const studentApi = useApi().student
    const lessonApi = useApi().study.lessonStandart
    const graduateApi = useApi().student.graduate
    const teacherApi = useApi().hrms.teacher

    // Дипломын хичээл жагсаалт
    async function getLessonOption()
    {
        const { success, data } = await allFetchData(lessonApi.getStudentDiplomaLessons(selected_student))
        if (success)
        {
            setLessonOption(data)
        }
    }

    useEffect(
        () =>
        {
            if (selected_student)
            {
                getLessonOption()
            }
        },
        [selected_student]
    )

    /** Бүх датаг нэгэн зэрэг авах */
    async function getAll()
    {
        var depId = select_value.department || ''
        var degree = select_value.degree || ''
        var group = select_value.group || ''

        const [studentRsp, teahcerRsp]= await allFetchData(
            Promise.all([
                studentApi.getGraduate(depId, degree, group),
                teacherApi.get()
            ])
        )
        if (studentRsp?.success)
        {
            setStudentOption(studentRsp?.data)
        }
        if (teahcerRsp?.success)
        {
            setTeacherOption(teahcerRsp?.data)
        }
    }

    useEffect(
        () =>
        {
            getAll()
        },
        []
    )

    // Radio
    const handleRadioChange = (e) => {
        setRadio(e.target.value)
        setSelectLessonIds([])
        setValue('lesson', '')
    }

	async function onSubmit(cdata)
    {
        cdata['school'] = school_id
        cdata['lesson_year'] = cyear_name
        cdata['lesson_season'] = cseason_id
        cdata['lesson_type'] = radio === 'diploma' ? 1 : 2

        let selectLesson_ids = radio === 'diploma' ? selectLessonIds ? [selectLessonIds] : [] : selectLessonIds
        let allSelectLessonIds = []

        for (let selectLessonId of selectLesson_ids)
        {
            allSelectLessonIds.push(selectLessonId.id)
        }

        cdata['lesson'] = allSelectLessonIds
        cdata = convertDefaultValue(cdata)

        const { success, errors } = await postFetch(graduateApi.post(cdata))
        if(success)
        {
            reset()
            handleModal()
            refreshDatas()
        }
        else
        {
            /** Алдааны мессэжийг input дээр харуулна */
            for (let key in errors) {
                setError(key, { type: 'custom', message:  errors[key][0]});
            }
        }
	}

	return (
        <Fragment>
            <Modal
                isOpen={open}
                toggle={handleModal}
                className='sidebar-lg'
                modalClassName='modal-slide-in'
                contentClassName='pt-0'
                style={{ maxWidth: '425px', width: '100%' }}
            >
                {/* {isLoading && <div className='suspense-loader'><Spinner size='xl'/></div>} */}
                <ModalHeader
                    className="mb-1"
                    toggle={handleModal}
                    close={CloseBtn}
                    tag="div"
                    >
                <h4>{t('Төгсөлтийн ажил')}</h4>
                </ModalHeader>
                <ModalBody className="flex-grow-1">
                    {(postLoading || getAllLoading) && Loader}
                    <Row tag={Form} className="gy-1" onSubmit={handleSubmit(onSubmit)}>
                        <Col md={12}>
                            <Label className="form-label" for="student">
                                {t('Оюутан')}
                            </Label>
                            <Controller
                                control={control}
                                defaultValue=''
                                name="student"
                                render={({ field: { value, onChange} }) => {
                                    return (
                                        <Select
                                            name="student"
                                            id="student"
                                            classNamePrefix='select'
                                            isClearable
                                            className={classnames('react-select', { 'is-invalid': errors.student })}
                                            isLoading={getAllLoading}
                                            placeholder={t(`-- Сонгоно уу --`)}
                                            options={studentOption || []}
                                            value={studentOption.find((c) => c.id === value)}
                                            noOptionsMessage={() => t('Хоосон байна')}
                                            onChange={(val) => {
                                                onChange(val?.id || '')
                                                if(val?.id) setSelectStudent(val?.id)
                                                setValue('lesson', '')
                                            }}
                                            styles={ReactSelectStyles}
                                            getOptionValue={(option) => option.id}
                                            getOptionLabel={(option) => option.code + ' ' + option.last_name + ' ' +  option.first_name}
                                        />
                                    )
                                }}
                            ></Controller>
                            {errors.student && <FormFeedback className='d-block'>{errors.student.message}</FormFeedback>}
                        </Col>
                        <Col sx={12} >
                            <Label className="form-label" for="radio">
                                {t('Дипломын төрөл')}
                            </Label>
                            <div>

                                <Input
                                    style={{ marginRight: "8px", marginLeft: "14px" }}
                                    type="radio"
                                    value="diploma"
                                    name='diploma'
                                    id='diploma'
                                    onChange={handleRadioChange}
                                    checked={radio === 'diploma'}
                                />
                                <Label className="form label me-1" for="diploma">
                                    {t('Диплом')}
                                </Label>

                                <Input
                                    style={{marginRight: "8px"}}
                                    type="radio"
                                    value="shalgalt"
                                    name='shalgalt'
                                    id='shalgalt'
                                    onChange={handleRadioChange}
                                    checked={radio === 'shalgalt'}
                                />
                                <Label className="form-label me-1" for="shalgalt">
                                    {t('Шалгалт')}
                                </Label>

                            </div>
                        </Col>
                        <Col xs={12}>
                            <Label className="form-label" for="lesson">
                                {t('Дипломын хичээл')}
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
                                            className={classnames('react-select')}
                                            isLoading={getAllLoading}
                                            placeholder={t(`-- Сонгоно уу --`)}
                                            options={lesson_option || []}
                                            value={radio === 'diploma' ? value && lesson_option.find((c) => c.id === value) : selectLessonIds}
                                            noOptionsMessage={() => t('Хоосон байна')}
                                            onChange={(val) => {
                                                onChange(val?.id || '')
                                                setSelectLessonIds(val)
                                            }}
                                            isMulti={radio === 'diploma' ? false : true}
                                            closeMenuOnSelect={radio === 'diploma' ? true : false}
                                            styles={ReactSelectStyles}
                                            getOptionValue={(option) => option.id}
                                            getOptionLabel={(option) => option.name}
                                        />
                                    )
                                }}
                            ></Controller>
                            {errors.lesson && <FormFeedback className='d-block'>{errors.lesson.message}</FormFeedback>}
                        </Col>
                        <Col md={12}>
                            <Label className="form-label" for="diplom_topic">
                                {t('Төгсөлтийн ажлын сэдэв')}
                            </Label>
                                <Controller
                                    defaultValue=''
                                    control={control}
                                    id="diplom_topic"
                                    name="diplom_topic"
                                    render={({ field }) => (
                                        <Input
                                            id ="diplom_topic"
                                            bsSize="sm"
                                            placeholder={t('Төгсөлтийн ажлын сэдэв оруулах')}
                                            {...field}
                                            type="text"
                                            invalid={errors.diplom_topic && true}
                                        />
                                    )}
                                />
                            {errors.diplom_topic && <FormFeedback className='d-block'>{t(errors.diplom_topic.message)}</FormFeedback>}
                        </Col>
                        <Col md={12}>
                            <Label className="form-label" for="leader">
                                {t('Удирдагчийн овог нэр цол')}
                            </Label>
                                <Controller
                                    defaultValue=''
                                    control={control}
                                    id="leader"
                                    name="leader"
                                    render={({ field }) => (
                                        <Input
                                            id ="leader"
                                            bsSize="sm"
                                            placeholder={t('Удирдагчийн овог нэр цол оруулах')}
                                            {...field}
                                            type="text"
                                        />
                                    )}
                                />
                        </Col>
                        {
                            radio === 'diploma' &&
                                <Col md={12}>
                                    <Label className="form-label" for="teacher">
                                        {t('Удирдагч багш')}
                                    </Label>
                                        <Controller
                                            defaultValue=''
                                            control={control}
                                            id="teacher"
                                            name="teacher"
                                            render={({ field: { value, onChange} }) => {
                                                return (
                                                    <Select
                                                        name="teacher"
                                                        id="teacher"
                                                        classNamePrefix='select'
                                                        isClearable
                                                        className={classnames('react-select')}
                                                        isLoading={getAllLoading}
                                                        placeholder={t(`-- Сонгоно уу --`)}
                                                        options={teacher_option || []}
                                                        value={teacher_option.find((c) => c.id === value) }
                                                        noOptionsMessage={() => t('Хоосон байна')}
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
                        }
                        <Col md={12}>
                            <Label className="form-label" for="diplom_num">
                                {t('Дипломын дугаар')}
                            </Label>
                                <Controller
                                    defaultValue=''
                                    control={control}
                                    id="diplom_num"
                                    name="diplom_num"
                                    render={({ field }) => (
                                        <Input
                                            id ="diplom_num"
                                            bsSize="sm"
                                            placeholder={t('Дипломын дугаар оруулах')}
                                            {...field}
                                            type="text"
                                            invalid={errors.diplom_num && true}
                                        />
                                    )}
                                />
                            {errors.diplom_num && <FormFeedback className='d-block'>{t(errors.diplom_num.message)}</FormFeedback>}
                        </Col>
                        <Col md={12}>
                            <Label className="form-label" for="decision_date">
                                {t('Шийдвэрийн огноо')}
                            </Label>
                                <Controller
                                    defaultValue=''
                                    control={control}
                                    id="decision_date"
                                    name="decision_date"
                                    render={({ field }) => (
                                        <Input
                                            id ="decision_date"
                                            bsSize="sm"
                                            placeholder={t('Шийдвэрийн огноо')}
                                            {...field}
                                            type="date"
                                        />
                                    )}
                                />
                        </Col>
                        <Col md={12}>
                            <Label className="form-label" for="graduation_date">
                                {t('Тушаалын огноо')}
                            </Label>
                                <Controller
                                    defaultValue=''
                                    control={control}
                                    id="graduation_date"
                                    name="graduation_date"
                                    render={({ field }) => (
                                        <Input
                                            id ="graduation_date"
                                            bsSize="sm"
                                            placeholder={t('Тушаалын огноо')}
                                            {...field}
                                            type="date"
                                        />
                                    )}
                                />
                        </Col>
                        <Col md={12}>
                            <Label className="form-label" for="graduation_number">
                                {t('Тушаалын дугаар')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id="graduation_number"
                                name="graduation_number"
                                render={({ field }) => (
                                    <Input
                                        id ="graduation_number"
                                        bsSize="sm"
                                        placeholder={t('Тушаалын дугаар')}
                                        {...field}
                                        type="text"
                                    />
                                )}
                            />
                        </Col>
                        <Col md={12}>
                            <Label className="form-label" for="registration_num">
                                {t('Бүртгэлийн дугаар')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id="registration_num"
                                name="registration_num"
                                render={({ field }) => (
                                    <Input
                                        className={classnames({ 'is-invalid': errors.registration_num })}
                                        id ="registration_num"
                                        bsSize="sm"
                                        placeholder={t('Бүртгэлийн дугаар')}
                                        {...field}
                                        type="text"
                                    />
                                )}
                            />
                            {errors.registration_num && <FormFeedback className='d-block'>{t(errors.registration_num.message)}</FormFeedback>}
                        </Col>
                        <Col md={12} className="text-center mt-2">
                            <Button className="me-2" color="primary" type="submit" disabled={postLoading}>
                                {postLoading &&<Spinner size='sm' className='me-1'/>}
                                {t('Хадгалах')}
                            </Button>
                            <Button color="secondary" type="reset" outline  onClick={handleModal}>
                                {t('Буцах')}
                            </Button>
                        </Col>
                    </Row>
                </ModalBody>
            </Modal>
        </Fragment>
	);
};
export default Createmodal;

