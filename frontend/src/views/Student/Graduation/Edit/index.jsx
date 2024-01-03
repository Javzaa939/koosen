// ** React imports
import React, { Fragment, useState, useEffect, useContext } from 'react'

import Select from 'react-select'

import useApi from "@hooks/useApi";

import useLoader from "@hooks/useLoader";

import AuthContext from "@context/AuthContext"

import SchoolContext from '@context/SchoolContext'
import ActiveYearContext from "@context/ActiveYearContext"

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

import { validate, convertDefaultValue } from "@utils"
import { validateSchema } from '../validateSchema';

const EditModal = ({ open, handleModal, graduate_id, refreshDatas }) => {

    const { control, handleSubmit, setValue, reset, setError, formState: { errors } } = useForm(validate(validateSchema));

    const { user } = useContext(AuthContext)

    // const [is_disabled, setDisabled] = useState(true)
    const [is_disabled, setDisabled] = useState(false)
    const { school_id } = useContext(SchoolContext)
    const { cyear_name, cseason_id } =useContext(ActiveYearContext)

    // Хөтөлбөрийн багын id
    const [studentOption, setStudentOption] = useState([])
    const [lesson_option, setLessonOption] = useState ([])
    const [student_id, setStudent] = useState('')

    const [ radio, setRadio ] = useState('')
    const [ selectLessonIds, setSelectLessonIds ] = useState([])
    const [ studentInfo, setStudentInfo] = useState({})

    // Loader
	const { Loader, isLoading, fetchData } = useLoader({});

    // Api
    const studentApi = useApi().student
    const lessonApi = useApi().study.lessonStandart
    const graduateApi = useApi().student.graduate

    useEffect(() => {
        if(Object.keys(user).length > 0 && user.permissions.includes('lms-student-graduate-update') && school_id ) {
            setDisabled(false)
        }
    },[user])

    // Дипломын хичээл жагсаалт
    async function getLessonOption() {
        const { success, data } = await fetchData(lessonApi.getStudentLesson(student_id))
        if(success) {
            setLessonOption(data)
        }
    }

    // Сургуулийн жагсаалт
    async function getStudentOption() {
        const { success, data } = await fetchData(studentApi.getList())
        if(success) {
            setStudentOption(data)
        }
    }

    useEffect(()=>{
        getStudentOption()
        getDatas()
    },[])

    useEffect(
        () =>
        {
            if (student_id) getLessonOption()
        },
        [student_id]
    )

    async function getDatas()
    {
        if (graduate_id)
        {
            const { success, data } = await fetchData(graduateApi.getOne(graduate_id))
            if(success)
            {
                setStudentInfo(data?.student)
                // засах үед дата байх юм бол setValue-р дамжуулан утгыг харуулна
                if(data === null) return
                for(let key in data)
                {
                    if(data[key] !== null)
                        setValue(key, data[key])
                    else setValue(key, '')

                    if (key === 'student' || key === 'lesson') {
                        setValue(key, data[key]?.id)
                    }

                    if (key === 'lesson_type')
                    {
                        if (data[key] === 1)
                        {
                            setRadio('diploma', true)
                            if (data['lesson'].length > 0)
                            {
                                setValue('lesson', data['lesson'][0].id)
                            }
                        }
                        else
                        {
                            setRadio('shalgalt', true)
                            setSelectLessonIds(data['lesson'])
                        }
                    }

                    if (key === 'student') setStudent(data[key]?.id)
                }
            }
        }
    }

	async function onSubmit(cdata)
    {
        cdata = convertDefaultValue(cdata)
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

        const { success, errors } = await fetchData(graduateApi.put(cdata, graduate_id))
        if(success) {
            reset()
            handleModal()
            refreshDatas()
        } else {
            /** Алдааны мессэжийг input дээр харуулна */
            for (let key in errors) {
                setError(key, { type: 'custom', message:  errors[key][0]});
            }
        }
	}

    // Radio
    const handleRadioChange = (e) => {
        setRadio(e.target.value)
        setSelectLessonIds([])
        setValue('lesson', '')
    }


	return (
        <Fragment>
            <Modal isOpen={open} toggle={handleModal} className="modal-dialog-centered modal-lg" onClosed={handleModal}>
            {isLoading && <div className='suspense-loader'><Spinner size='xl'/></div>}
                <ModalHeader className='bg-transparent pb-0' toggle={handleModal}></ModalHeader>
                <ModalBody className="px-sm-3 pt-50 pb-3">
                    <div className='text-center'>
                        <h4>{t('Төгсөлтийн ажил засах')}</h4>
                    </div>
                    <Row tag={Form} className="gy-1" onSubmit={handleSubmit(onSubmit)}>
                        <Col lg={6} md={12} className=''>
                            <Label className="form-label me-1 mb-1" for="student">
                                {t('Оюутан')}
                            </Label>
                            <div className='d-flex d-inline-block overflow-auto flex-wrap border p-1 m-1 rounded-3 ' >
                                <b className='me-1'>{studentInfo?.code}</b>
                                <div className='d-flex '>
                                    {studentInfo?.last_name} {studentInfo?.first_name}
                                </div>
                            </div>
                        </Col>
                        <br />
                        <Col lg={6} md={12}>
                            <Label className="form-label" for="lesson">
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
                        <Col lg={6} md={12}>
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
                                            className={classnames('react-select', { 'is-invalid': errors.lesson })}
                                            isLoading={isLoading}
                                            placeholder={t(`-- Сонгоно уу --`)}
                                            options={lesson_option || []}
                                            // value={value && lesson_option.find((c) => c.id === value)}
                                            // value={selectLessonIds}
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
                            {errors.lesson && <FormFeedback className='d-block'>{t(errors.lesson.message)}</FormFeedback>}
                        </Col>
                        <Col lg={6} md={12}>
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
                                            disabled={is_disabled}
                                            readOnly={is_disabled}
                                            invalid={errors.diplom_topic && true}
                                        />
                                    )}
                                />
                            {errors.diplom_topic && <FormFeedback className='d-block'>{t(errors.diplom_topic.message)}</FormFeedback>}
                        </Col>
                        <Col lg={6} md={12}>
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
                                            disabled={is_disabled}
                                            readOnly={is_disabled}
                                            invalid={errors.leader && true}
                                        />
                                    )}
                                />
                            {errors.leader && <FormFeedback className='d-block'>{t(errors.leader.message)}</FormFeedback>}
                        </Col>
                        <Col lg={6} md={12}>
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
                                            disabled={is_disabled}
                                            readOnly={is_disabled}
                                            invalid={errors.diplom_num && true}
                                        />
                                    )}
                                />
                            {errors.diplom_num && <FormFeedback className='d-block'>{t(errors.diplom_num.message)}</FormFeedback>}
                        </Col>
                        <Col lg={6} md={12}>
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
                        <Col  lg={6} md={12}>
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
                        <Col lg={6} md={12}>
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
                        <Col lg={6} md={12}>
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
                                        id ="registration_num"
                                        bsSize="sm"
                                        placeholder={t('Бүртгэлийн дугаар')}
                                        {...field}
                                        type="text"
                                    />
                                )}
                            />
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
                </ModalBody>
            </Modal>
        </Fragment>
	);
};
export default EditModal;
