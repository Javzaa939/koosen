import React, { Fragment, useState, useEffect, useContext } from 'react'
import { X } from "react-feather";
import { useForm, Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";

import Select from 'react-select'
import { ReactSelectStyles } from "@utils"

import useApi from '@hooks/useApi';
import useLoader from "@hooks/useLoader";

import { validate, generateLessonYear, convertDefaultValue } from "@utils"
import { validateSchema } from '../validateSchema';

import SchoolContext from '@context/SchoolContext'

import classnames from "classnames";

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
    Spinner,
} from "reactstrap";

import Flatpickr from 'react-flatpickr'
// flatpickr style
import '@styles/react/libs/flatpickr/flatpickr.scss'
// import { Mongolian } from "flatpickr/dist/l10n/mn.js"

import moment from 'moment';

const Addleavemodal = ({ open, handleModal, refreshDatas }) => {

    const [ studentOption, setStudentOption] = useState([])
    const [ lesson_seasonOption, setLesson_seasonOption ] = useState([])
    const [ register_statusOption, setRegister_statusOption ] = useState([])
    const [ yearOption, setyearOption ] = useState([])
    const [ sdate, setDate ]= useState(new Date());

    const { school_id } = useContext(SchoolContext)

    const { t } = useTranslation()

    const { control, handleSubmit, reset, formState: { errors }, setError } = useForm(validate(validateSchema));

    const { Loader, isLoading, fetchData } = useLoader({});
    const { isLoading: postLoading, fetchData: postFetch } = useLoader({});
    const { isLoading: studentLoading, fetchData: fetchStudent } = useLoader({});

    const CloseBtn = (
        <X className="cursor-pointer" size={15} onClick={handleModal} />
    )

    const lessonApi = useApi().settings.season
    const studentApi = useApi().student
    const studentRegisterTypeApi = useApi().settings.studentRegisterType
    const leaveApi = useApi().student.leave

    const [bottom_check, setBottomCheck] = useState(3)
    const [scroll_bottom_datas, setScrollBottomDatas] = useState([]);
    const [student_search_value, setStudentSearchValue] = useState([]);
    const SelectStudentApi = useApi().role.student

    //  Оюутны жагсаалт хайлтаар
    async function getStudentOption(searchValue) {
        const { success, data } = await fetchStudent(SelectStudentApi.getStudent(searchValue))
        if(success) {
            setStudentOption(data)
        }
    }

    //  Оюутны жагсаалт select ашигласан
    async function getSelectBottomDatas(state){
        const { success, data } = await fetchStudent(SelectStudentApi.getSelectStudents(state))
        if(success){
            setScrollBottomDatas((prev) => [...prev, ...data])
        }
    }

    const getLesson = async() => {
        const { success, data } = await fetchData(lessonApi.get())
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

    useEffect(()=>{
        getLesson()
        setyearOption(generateLessonYear(5))
        getRegisterType()
        getSelectBottomDatas(2)
    },[])

    function handleStudentSelect(value){
        getStudentOption(value)
    }

    async function onSubmit(cdata) {
        cdata['statement_date'] = moment(sdate).format('YYYY-MM-DD')
        cdata = convertDefaultValue(cdata)
        cdata['school'] = school_id

        const { success, error } = await postFetch(leaveApi.post(cdata))

        if(success)
        {
            refreshDatas()
            handleModal()
            reset()

        } else {

            /** Алдааны мессэжийг input дээр харуулна */
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
                className='sidebar-lg'
                modalClassName='modal-slide-in'
                contentClassName='pt-0'
                style={{ maxWidth: '400px', width: '100%' }}
            >
                <ModalHeader
                    className="mb-1"
                    toggle={handleModal}
                    close={CloseBtn}
                    tag="div"
                >
                <h4>{t('Чөлөөний бүртгэл')}</h4>
                </ModalHeader>
                <ModalBody className="flex-grow-1">
                    <Row tag={Form} className="gy-1" onSubmit={handleSubmit(onSubmit)}>
                        <Col md={12}>
                            <Label className="form-label" for="student">
                                {t('Оюутан')}
                            </Label>
                            <Controller
                                control={control}
                                defaultValue=''
                                name="student"
                                render={({ field: {value, onChange } }) => {
                                    return (
                                        <Select
                                            name="student"
                                            id="student"
                                            classNamePrefix='select'
                                            isClearable
                                            className={classnames('react-select', {'is-invalid': errors.student})}
                                            placeholder={`Хайх`}
                                            isLoading={studentLoading}
                                            loadingMessage={() => "Түр хүлээнэ үү..."}
                                            options={
                                                student_search_value.length === 0
                                                    ? scroll_bottom_datas || []
                                                    : studentOption || []
                                            }
                                            value={
                                                student_search_value.length === 0
                                                    ? scroll_bottom_datas.find((c) => c.id === value)
                                                    : studentOption.find((c) => c.id === value)
                                            }
                                            noOptionsMessage={() =>
												student_search_value.length > 1
													? t('Хоосон байна')
													: null
                                            }
                                            onMenuScrollToBottom={() => {
                                                if(student_search_value.length === 0){
                                                    setBottomCheck(bottom_check + 1)
                                                    getSelectBottomDatas(bottom_check)
                                                }
                                            }}
                                            onChange={(val) => {
                                                onChange(val?.id || '')
                                            }}
                                            onInputChange={(e) => {
                                                setStudentSearchValue(e);
                                                if(e.length > 1 && e !== student_search_value){
                                                    handleStudentSelect(e);
                                                } else if (e.length === 0){
                                                    setStudentOption([]);
                                                }
                                            }}
                                            styles={ReactSelectStyles}
                                            getOptionValue={(option) => option.id}
                                            getOptionLabel={(option) => option.full_name}
                                        />
                                    )
                                }}
                            ></Controller>
                            {errors.student && <FormFeedback className='d-block'>{t(errors.student.message)}</FormFeedback>}
                        </Col>
                        <Col md={12}>
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
                                            isClearable
                                            classNamePrefix='select'
                                            isLoading={isLoading}
                                            className={classnames('react-select', { 'is-invalid': errors.lesson_year })}
                                            placeholder={t(`-- Сонгоно уу --`)}
                                            options={yearOption || []}
                                            value={yearOption.find((c) => c.id === value)}
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
                                ></Controller>
                            {errors.lesson_year && <FormFeedback className='d-block'>{errors.lesson_year.message}</FormFeedback>}
                        </Col>
                        <Col md={12}>
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
                                            isClearable
                                            classNamePrefix='select'
                                            isLoading={isLoading}
                                            className={classnames('react-select', { 'is-invalid': errors.lesson_season })}
                                            placeholder={t(`-- Сонгоно уу --`)}
                                            options={lesson_seasonOption || []}
                                            value={lesson_seasonOption.find((c) => c.id === value)}
                                            noOptionsMessage={() => t('Хоосон байна')}
                                            onChange={(val) => {
                                                onChange(val?.id || '')
                                            }}
                                            styles={ReactSelectStyles}
                                            getOptionValue={(option) => option.id}
                                            getOptionLabel={(option) => option.season_name}
                                        />
                                    )
                                }}

                            ></Controller>
                             {errors.lesson_season && <FormFeedback className='d-block'>{errors.lesson_season.message}</FormFeedback>}
                        </Col>
                        <Col md={12}>
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
                                            isClearable
                                            classNamePrefix='select'
                                            isLoading={isLoading}
                                            className={classnames('react-select', { 'is-invalid': errors.register_status })}
                                            placeholder={t(`-- Сонгоно уу --`)}
                                            options={register_statusOption || []}
                                            value={register_statusOption.find((c) => c.id === value)}
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
                            ></Controller>
                             {errors.register_status && <FormFeedback className='d-block'>{errors.register_status.message}</FormFeedback>}
                        </Col>
                        <Col md={12}>
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
                                    type="number"
                                    id ="learn_week"
                                    bsSize="sm"
                                    placeholder={t('Хичээллэсэн 7 хоног')}
                                    {...field}
                                    invalid={errors.learn_week && true}
                                />
                            )}
                            />
                            {errors.learn_week && <FormFeedback className='d-block'>{errors.learn_week.message}</FormFeedback>}
                        </Col>
                        <Col md={12}>
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
                                    type="text"
                                    id ="description"
                                    bsSize="sm"
                                    placeholder={t('Тайлбар')}
                                    {...field}
                                    invalid={errors.description && true}
                                />
                            )}
                        />
                        </Col>
                        <Col md={12}>
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
                                    type="text"
                                    id ="statement"
                                    bsSize="sm"
                                    placeholder={t('Тушаалын дугаар')}
                                    {...field}
                                    invalid={errors.statement && true}
                                />
                            )}
                        />
                        </Col>
                        <Col xl={12}>
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
    )
};
export default Addleavemodal;
