// ** React imports
import React, { Fragment, useState, useEffect, useContext } from 'react'

import { X } from "react-feather";

import Select from 'react-select'

import useApi from "@hooks/useApi";
import useLoader from "@hooks/useLoader";

import { ReactSelectStyles } from "@utils"

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
    Spinner,
	ModalBody,
	ModalHeader,
	FormFeedback,
} from "reactstrap";

import { validate, convertDefaultValue } from "@utils"

import { t } from 'i18next';
import useUpdateEffect from '@hooks/useUpdateEffect'

import AuthContext from '@context/AuthContext'
import SchoolContext from "@context/SchoolContext"

import { validateSchema } from '../validateSchema';


const Addmodal = ({ open, handleModal, refreshDatas, year, dep_id, season, lesson_id, teacher_id}) => {

    const CloseBtn = (
        <X className="cursor-pointer" size={15} onClick={handleModal} />
    )

    var values = {
        lesson: '',
        teacher: '',
        type: '',
    }

    const { user } = useContext(AuthContext)
    const { school_id } = useContext(SchoolContext)

    const [lesson_option, setLesson] = useState([])
    const [lesson_type_option, setType] = useState([])
    const [teacher_option, setTeacher] = useState([])
    const [group_option, setGroup] = useState([])
    const [selectedGroups, setSelectedGroups] = useState([])
    const [seasonOption, setSeason] = useState([])

    const [select_value, setSelectValue] = useState(values);

    // ** Hook
    const { control, handleSubmit, setValue, reset, setError, formState: { errors } } = useForm(validate(validateSchema));

    // states
    const [is_loading, setLoader] = useState(false)

	// Loader
	const { Loader, isLoading, fetchData } = useLoader({});

    // Api
    const lessonStandartApi = useApi().study.lessonStandart
    const teacherApi = useApi().hrms.teacher
    const groupApi = useApi().student.group
    const creditVolumeApi = useApi().credit.volume
    const seasonApi = useApi().settings.season

    useEffect(() => {
        setValue('lesson', lesson_id)
        setValue('lesson_season', season)
        setSelectValue(current => {
            return {
                ...current,
                lesson: lesson_id || '',
            }
        })
    },[lesson_id])

    useUpdateEffect(() => {
        setValue('teacher', teacher_id)
        setSelectValue(current => {
            return {
                ...current,
                teacher: teacher_id || '',
            }
        })
    },[teacher_option, teacher_id])

    //улирлын жагсаалт авах
    async function getSeason () {
        const { success, data } = await fetchData(seasonApi.get())
        if (success) {
            setSeason(data)
        }
	}

    // Тухайн хичээлийн багц цагийн задаргаанаас хичээлийн төрөл авах хэсэг
    async function getLessonType() {
        const { success, data } = await fetchData(lessonStandartApi.getType(select_value.lesson))
        if(success)
        {
            setType(data)
        }
    }
    // Багшийн жагсаалт авах
    async function getTeacher() {
        const { success, data } = await fetchData(teacherApi.getLessonToTeacher(select_value.lesson))
        if(success) {
            setTeacher(data)
        }
    }
    // Хичээлийн жагсаалт
    async function getLesson() {
        const { success, data } = await fetchData(lessonStandartApi.getList(school_id, dep_id ? dep_id : ''))
        if(success) {
            setLesson(data)
        }
    }

    // Ангийн жагсаалт
    async function getGroup() {
        const { success, data } = await fetchData(groupApi.getTimetableList(select_value.lesson))
        if(success) {
            setGroup(data)
        }
    }

    function groupSelect(data) {
        setSelectedGroups(data);
    }

	async function onSubmit(cdata) {
        setLoader(true)
        cdata['created_user'] = user.id
        cdata['updated_user'] = user.id
        cdata['school'] = school_id
        cdata['department'] = dep_id
        cdata['lesson_year'] = year

        cdata['group'] = selectedGroups

        cdata = convertDefaultValue(cdata)
        const { success, error } = await fetchData(creditVolumeApi.post(cdata))
        if(success) {
            setLoader(false)
            reset()
            handleModal()
            refreshDatas()
        } else {
            setLoader(false)
            /** Алдааны мессэжийг input дээр харуулна */
            for (let key in error) {
                setError(error[key].field, { type: 'custom', message:  error[key].msg});
            }
        }
	}

    useEffect(() => {
        getSeason()
    },[])

    useEffect(() => {
        getLesson()
    },[dep_id])

    useUpdateEffect(
        () =>
        {
            if (select_value?.lesson) {
                getLessonType()
                getTeacher()
                getGroup()
            }
        },
        [select_value?.lesson]
    )

	return (
        <Fragment>
            {
                is_loading &&
                    <div className='suspense-loader'>
                        <Spinner size='bg'/>
                        <span className='ms-50'>Түр хүлээнэ үү...</span>
                    </div>
            }
            <Modal
                isOpen={open}
                toggle={handleModal}
                className='sidebar-lg hr-register'
                modalClassName='modal-slide-in'
                contentClassName='pt-0'
            >
                <ModalHeader
                    className="mb-1"
                    toggle={handleModal}
                    close={CloseBtn}
                    tag="div"
                >
                    <h5 className="modal-title">{t('Цагийн ачаалал нэмэх')}</h5>
                </ModalHeader>
                <ModalBody className="flex-grow-1">
                    <Row tag={Form} className="gy-1" onSubmit={handleSubmit(onSubmit)}>
                        <Col lg={12}>
                            <Label className="form-label" for="lesson">
                                {t('Хичээл')}
                            </Label>
                            <Controller
                                control={control}
                                defaultValue={lesson_id || ''}
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
                                            value={lesson_option.find((c) => c.id === value)}
                                            noOptionsMessage={() => 'Хоосон байна'}
                                            onChange={(val) => {
                                                onChange(val?.id || '')
                                                setSelectValue(current => {
                                                    return {
                                                        ...current,
                                                        lesson: val?.id || '',
                                                    }
                                                })
                                            }}
                                            styles={ReactSelectStyles}
                                            getOptionValue={(option) => option.id}
                                            getOptionLabel={(option) => option.full_name}
                                        />
                                    )
                                }}
                            ></Controller>
                            {errors.lesson && <FormFeedback className='d-block'>{t(errors.lesson.message)}</FormFeedback>}
                        </Col>
                        <Col md={12}>
                            <Label className="form-label" for="lesson_season">
                                {t('Улирал')}
                            </Label>
                            <Controller
                                control={control}
                                defaultValue={season}
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
                                            options={seasonOption || []}
                                            value={seasonOption.find((c) => c.id === value)}
                                            noOptionsMessage={() => 'Хоосон байна'}
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
                            {errors.lesson_season && <FormFeedback className='d-block'>{t(errors.lesson_season.message)}</FormFeedback>}
                        </Col>
                        <Col lg={12}>
                            <Label className="form-label" for="type">
                                {t('Хичээллэх хэлбэр')}
                            </Label>
                            <Controller
                                control={control}
                                defaultValue=''
                                name="type"
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
                                            options={lesson_type_option || []}
                                            value={lesson_type_option.find((c) => c.id === value)}
                                            noOptionsMessage={() => 'Хоосон байна'}
                                            onChange={(val) => {
                                                onChange(val?.id || '')
                                                setSelectValue(current => {
                                                    return {
                                                        ...current,
                                                        type: val?.id,
                                                    }
                                                })
                                            }}
                                            styles={ReactSelectStyles}
                                            getOptionValue={(option) => option.id}
                                            getOptionLabel={(option) => option.name}
                                        />
                                    )
                                }}
                            ></Controller>
                            {errors.type && <FormFeedback className='d-block'>{t(errors.type.message)}</FormFeedback>}
                        </Col>
                        <Col lg={12}>
                            <Label className="form-label" for="teacher">
                                {t('Багш')}
                            </Label>
                            <Controller
                                control={control}
                                defaultValue={teacher_id}
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
                                            options={teacher_option || []}
                                            value={teacher_option.find((c) => c.id === value)}
                                            noOptionsMessage={() => 'Хоосон байна'}
                                            onChange={(val) => {
                                                onChange(val?.id)
                                                setSelectValue(current => {
                                                    return {
                                                        ...current,
                                                        teacher: val?.id,
                                                    }
                                                })
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
                        <Col lg={12}>
                            <Label className="form-label" for="group">
                                {t('Анги')}
                            </Label>
                            <Controller
                                    control={control}
                                    defaultValue={''}
                                    name="group"
                                    render={({ field: { value, onChange} }) => {
                                        return (
                                            <Select
                                                name="group"
                                                id="group"
                                                classNamePrefix='select'
                                                isClearable
                                                className={classnames('react-select', { 'is-invalid': errors.group })}
                                                isLoading={isLoading}
                                                placeholder={t(`-- Сонгоно уу --`)}
                                                options={group_option || []}
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
                        <Col md={12}>
                            <Button className="me-2" color="primary" type="submit">
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
export default Addmodal;
