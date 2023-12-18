import React, { Fragment, useState, useEffect, useContext } from 'react'
import { useTranslation } from "react-i18next";
import { useForm, Controller } from "react-hook-form";

import { ReactSelectStyles } from "@utils"
import Select from 'react-select'

import { validateSchema } from '../validateSchema';
import { validate, generateLessonYear, convertDefaultValue } from "@utils"

import classnames from "classnames";

import useLoader from "@hooks/useLoader";
import useApi from '@hooks/useApi';

import AuthContext from '@context/AuthContext'
import SchoolContext from '@context/SchoolContext'

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

import Flatpickr from 'react-flatpickr'
// flatpickr style
import '@styles/react/libs/flatpickr/flatpickr.scss'
// import { Mongolian } from "flatpickr/dist/l10n/mn.js"

import moment from 'moment';

const EditModal = ({ open, handleModal, edit_id, refreshDatas }) => {

    const { t } = useTranslation()

    const { control, handleSubmit, reset, setValue, setError, formState: { errors } } = useForm(validate(validateSchema));

    const { isLoading, fetchData } = useLoader({});
    const { user } = useContext(AuthContext)
    const { school_id } = useContext(SchoolContext)

    const leaveApi = useApi().student.leave
    const seasonApi = useApi().settings.season
    const studentApi = useApi().student
    const studentRegisterTypeApi = useApi().settings.studentRegisterType

    const [ studentOption, setStudentOption] = useState([])
    const [ lesson_seasonOption, setLesson_seasonOption ] = useState([])
    const [ register_statusOption, setRegister_statusOption ] = useState([])
    const [ yearOption, setyearOption ] = useState([])
    const [ is_permission, setIsPermission ] = useState(true);
    const [ sdate, setDate ]= useState();
    const [ studentInfo, setStudentInfo] = useState({})

    useEffect(() => {
        if(Object.keys(user).length > 0 && user.permissions.includes('lms-student-leave-update')&& school_id) {
            setIsPermission(false)
        }
    },[user])

    async function getStudentOption() {
        const { success, data } = await fetchData(studentApi.getList())
        if(success) {
            setStudentOption(data)
        }
    }

    const getLesson = async() => {
        const { success, data } = await fetchData(seasonApi.get())
        if(success)
        {
            setLesson_seasonOption(data)
        }
    }

    const getRegisterType = async() => {
        const { success, data } = await fetchData(studentRegisterTypeApi.get())
        if(success)
        {
            setRegister_statusOption(data)
        }
    }

    async function getDatas() {
        if(edit_id) {
            const { success, data } = await fetchData(leaveApi.getOne(edit_id))
            if(success) {
                setStudentInfo(data?.student)
                // засах үед дата байх юм бол setValue-р дамжуулан утгыг харуулна
                if(data === null) return
                for(let key in data) {
                    if(data[key] !== null)
                        setValue(key, data[key])
                    else setValue(key, '')

                    if(key === 'student' || key === 'lesson_season' || key === 'register_status' ) {
                        setValue(key, data[key]?.id)
                    }
                    if(key === 'statement_date') {
                        setDate(new Date(data.statement_date))
                    }
                }
            }
        }
    }

    useEffect(()=>{
        getStudentOption()
        getLesson()
        setyearOption(generateLessonYear(5))
        getRegisterType()
        getDatas()
    },[])

    async function onSubmit(cdata) {
        cdata['statement_date'] = moment(sdate).format('YYYY-MM-DD')
        cdata = convertDefaultValue(cdata)
        const { success, error } = await fetchData(leaveApi.put(cdata, edit_id))
        if(success)
        {
            reset()
            handleModal()
            refreshDatas()
        } else {
            for (let key in error) {
                setError(error[key].field, { type: 'custom', message:  error[key].msg});
            }
        }
	}

    return (
        <Fragment>
            <Modal
                isOpen={open}
                toggle={handleModal}
                className="modal-dialog-centered modal-lg"
                onClosed={handleModal}
            >
            {isLoading && <div className='suspense-loader'><Spinner size='xl'/></div>}
                <ModalHeader
                    className='bg-transparent pb-0'
                    toggle={handleModal}
                ></ModalHeader>
                <ModalBody className="px-sm-3 pt-50 pb-3">
                    <div className='text-center'>
                        <h4>{t('Чөлөөний бүртгэл засах')}</h4>
                    </div>
                    <Row tag={Form} className="gy-1" onSubmit={handleSubmit(onSubmit)}>
                        <Col lg={6} md={12} className=''>
                            <Label className="form-label" for="student">
                                {t('Оюутан')}
                            </Label>
                            <Input
                                id ="student"
                                bsSize="sm"
                                placeholder={t('Хичээллэсэн 7 хоног')}
                                type="text"
                                defaultValue={studentInfo?.full_name}
                                readOnly={is_permission}
                                disabled={true}
                            />
                        </Col>
                        <Col lg={6} xs={12}>
                            <Label className="form-label" for="lesson_year">
                                {t('Хичээлийн жил')}
                            </Label>
                            <Controller
                                control={control}
                                defaultValue=''
                                name="lesson_year"
                                render={({ field: { value, onChange} }) => {
                                    return (
                                        <Select
                                            name="lesson_year"
                                            id="lesson_year"
                                            classNamePrefix='select'
                                            isClearable
                                            className={classnames('react-select', { 'is-invalid': errors.lesson_year })}
                                            isLoading={isLoading}
                                            placeholder={t(`-- Сонгоно уу --`)}
                                            options={yearOption || []}
                                            value={yearOption.find((c) => c.id === value)}
                                            noOptionsMessage={() => t('Хоосон байна')}
                                            onChange={(val) => {
                                                onChange(val?.id || '')
                                            }}
                                            isDisabled={is_permission}
                                            styles={ReactSelectStyles}
                                            getOptionValue={(option) => option.id}
                                            getOptionLabel={(option) => option.name}
                                        />
                                    )
                                }}
                            ></Controller>
                            {errors.lesson_year && <FormFeedback className='d-block'>{t(errors.lesson_year.message)}</FormFeedback>}
                        </Col>
                        <Col lg={6} xs={12}>
                            <Label className="form-label" for="lesson_season">
                                {t('Улирал')}
                            </Label>
                            <Controller
                                control={control}
                                defaultValue=''
                                name="lesson_season"
                                render={({ field: { value, onChange} }) => {
                                    return (
                                        <Select
                                            name="lesson_season"
                                            id="lesson_season"
                                            classNamePrefix='select'
                                            isClearable
                                            className={classnames('react-select', { 'is-invalid': errors.lesson_season })}
                                            isLoading={isLoading}
                                            placeholder={t(`-- Сонгоно уу --`)}
                                            options={lesson_seasonOption || []}
                                            value={lesson_seasonOption.find((c) => c.id === value)}
                                            noOptionsMessage={() => t('Хоосон байна')}
                                            onChange={(val) => {
                                                onChange(val?.id || '')
                                            }}
                                            isDisabled={is_permission}
                                            styles={ReactSelectStyles}
                                            getOptionValue={(option) => option.id}
                                            getOptionLabel={(option) => option.season_name}
                                        />
                                    )
                                }}
                            ></Controller>
                            {errors.lesson_season && <FormFeedback className='d-block'>{t(errors.lesson_season.message)}</FormFeedback>}
                        </Col>
                        <Col lg={6} xs={12}>
                            <Label className="form-label" for="register_status">
                                {t('Бүртгэлийн хэлбэр')}
                            </Label>
                            <Controller
                                control={control}
                                defaultValue=''
                                name="register_status"
                                render={({ field: { value, onChange} }) => {
                                    return (
                                        <Select
                                            name="register_status"
                                            id="register_status"
                                            classNamePrefix='select'
                                            isClearable
                                            className={classnames('react-select', { 'is-invalid': errors.register_status })}
                                            isLoading={isLoading}
                                            placeholder={t(`-- Сонгоно уу --`)}
                                            options={register_statusOption || []}
                                            value={register_statusOption.find((c) => c.id === value)}
                                            noOptionsMessage={() => t('Хоосон байна')}
                                            onChange={(val) => {
                                                onChange(val?.id || '')
                                            }}
                                            isDisabled={is_permission}
                                            styles={ReactSelectStyles}
                                            getOptionValue={(option) => option.id}
                                            getOptionLabel={(option) => option.name}
                                        />
                                    )
                                }}
                            ></Controller>
                            {errors.register_status && <FormFeedback className='d-block'>{t(errors.register_status.message)}</FormFeedback>}
                        </Col>
                        <Col lg={6} xs={12}>
                            <Label className="form-label" for="learn_week">
                                {t('Хичээллэсэн 7 хоног')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id="learn_week"
                                name="learn_week"
                                render={({ field }) => (
                                    <Input
                                        id ="lesson_week"
                                        bsSize="sm"
                                        placeholder={t('Хичээллэсэн 7 хоног')}
                                        {...field}
                                        type="number"
                                        readOnly={is_permission}
                                        disabled={is_permission}
                                        invalid={errors.learn_week && true}
                                    />
                                )}
                            />
                            {errors.learn_week && <FormFeedback className='d-block'>{t(errors.learn_week.message)}</FormFeedback>}
                        </Col>
                        <Col lg={6} xs={12}>
                            <Label className="form-label" for="description">
                                {t('Тайлбар')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id="description"
                                name="description"
                                render={({ field }) => (
                                    <Input
                                        id ="description"
                                        bsSize="sm"
                                        placeholder={t('Тайлбар')}
                                        {...field}
                                        type="text"
                                        readOnly={is_permission}
                                        disabled={is_permission}
                                    />
                                )}
                            />
                        </Col>
                        <Col lg={6} xs={12}>
                            <Label className="form-label" for="statement">
                                {t('Тушаалын дугаар')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id="statement"
                                name="statement"
                                render={({ field }) => (
                                    <Input
                                        id ="statement"
                                        bsSize="sm"
                                        placeholder={t('Тушаал')}
                                        {...field}
                                        type="text"
                                        readOnly={is_permission}
                                        disabled={is_permission}
                                    />
                                )}
                            />
                        </Col>

                        <Col lg={6} xs={12}>
                            <Label className='form-label' for='statement_date'>
                                {t('Тушаалын огноо')}
                            </Label>

                                <Flatpickr
                                    id='statement_date'
                                    name='statement_date'
                                    className='form-control'
                                    onChange={dates => {
                                        setDate(dates[0]);
                                        }}
                                    value={sdate}
                                    style={{height: "30px"}}
                                    options={{
                                        dateFormat: 'Y-m-d',
                                        utc: true,
                                        time_24hr: true,
                                        // locale: Mongolian
                                    }}
                                />

                                {errors.statement_date && <FormFeedback className='d-block'>{t(errors.statement_date.message)}</FormFeedback>}
                        </Col>
                        <Col md={12} className="text-center mt-2">
                            <Button className="me-2" color="primary" type="submit" disabled={is_permission} size="sm">
                                {t('Хадгалах')}
                            </Button>
                            <Button color="secondary" type="reset" outline  onClick={handleModal} size="sm">
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
