// ** React imports
import React, { Fragment, useState, useEffect, useContext } from 'react'

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

import AuthContext from '@context/AuthContext'

import { validateSchema } from '../validateSchema';


const Editmodal = ({ open, handleEdit, editData, refreshDatas, season }) => {

    const { user } = useContext(AuthContext)

    const [lesson_option, setLesson] = useState([])
    const [lesson_type_option, setType] = useState([])
    const [teacher_option, setTeacher] = useState([])
    const [group_option, setGroup] = useState([])
    const [selectedGroups, setSelectedGroups] = useState([])
    const [ seasonOption, setSeason] = useState([])

    // ** Hook
    const { control, handleSubmit, reset,setValue, setError, formState: { errors } } = useForm(validate(validateSchema));

    // states
    const [is_loading, setLoader] = useState(false)

	// Loader
	const { Loader, isLoading, fetchData } = useLoader({isFullScreen: false});

    // Api
    const lessonStandartApi = useApi().study.lessonStandart
    const teacherApi = useApi().hrms.teacher
    const groupApi = useApi().student.group
    const creditVolumeApi = useApi().credit.volume
    const seasonApi = useApi().settings.season


    // улирлын жагсаалт авах
    async function getSeason () {
        const { success, data } = await fetchData(seasonApi.get())
        if (success) {
            setSeason(data)
        }
	}

    // Тухайн хичээлийн багц цагийн задаргаанаас хичээлийн төрөл авах хэсэг
    async function getLessonType() {
        const { success, data } = await fetchData(lessonStandartApi.getType(editData?.lesson?.id))
        if(success)
        {
            setType(data)
        }
    }
    // Багшийн жагсаалт авах
    async function getTeacher() {
        const { success, data } = await fetchData(teacherApi.getLessonToTeacher(editData?.lesson?.id))
        if(success) {
            setTeacher(data)
        }
    }

    // Хичээлийн жагсаалт
    async function getLesson() {
        const { success, data } = await fetchData(lessonStandartApi.getList())
        if(success) {
            setLesson(data)
        }
    }

    // Ангийн жагсаалт
    async function getGroup() {
        const { success, data } = await fetchData(groupApi.getTimetableList(editData?.lesson?.id))
        if(success) {
            setGroup(data)
        }
    }


	async function onSubmit(cdata) {
        setLoader(true)
        cdata['updated_user'] = user.id
        cdata['groups'] = selectedGroups

        if (!cdata.lesson_season) {
            cdata['lesson_season'] = season
        }
        cdata = convertDefaultValue(cdata)
        const { success, error } = await fetchData(creditVolumeApi.put(cdata, editData?.id))
        if(success) {
            setLoader(false)
            reset()
            handleEdit()
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
        if(Object.keys(editData).length > 0) {
            var group_ids = []
            editData?.groups.map((group, idx) => {
                var selected = group_option.find((e) => e.id === group?.id)
                if (selected != undefined) {
                    group_ids.push(selected)
                }
                setSelectedGroups(group_ids)
            })

            if(editData === null) return
            for(let key in editData) {
                if(editData[key] !== null)
                    setValue(key, editData[key])
                else setValue(key,'')

                if(key === 'teacher' || key === 'lesson_season' || key === 'lesson') {
                    setValue(key, editData[key]?.id)
                }

                if(key === 'lesson') {
                    setValue(key, editData[key]?.id)
                    console.log(editData[key]?.id)
                }
            }
        }
    },[group_option, editData, lesson_option])

    useEffect(
        () =>
        {
            if (Object.keys(editData).length > 0) {
                getLesson()
                getGroup()
                getLessonType()
                getTeacher()
            }
        },
        [editData]
    )

	return (
        <Fragment>
             <Modal isOpen={open} toggle={handleEdit} className="modal-dialog-centered modal-lg" onClosed={handleEdit}>
                <ModalHeader className="bg-transparent pb-0" toggle={handleEdit} tag="div">
                    <h5 className="modal-title"> {t('Цагийн ачаалал засах')} </h5>
                </ModalHeader>
                <ModalBody className="px-sm-12 pt-50 pb-3">
                    {
                        is_loading &&
                            <div className='suspense-loader'>
                                <Spinner size='bg'/>
                                <span className='ms-50'>Түр хүлээнэ үү...</span>
                            </div>
                    }
                    <Row tag={Form} className="gy-1" onSubmit={handleSubmit(onSubmit)}>
                        <Col lg={6} xs={6}>
                            <Label className="form-label" for="lesson">
                                {t('Хичээл')}
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
                                            value={lesson_option.find((c) => c.id === value)}
                                            noOptionsMessage={() => 'Хоосон байна'}
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
                            {errors.lesson && <FormFeedback className='d-block'>{t(errors.lesson.message)}</FormFeedback>}
                        </Col>
                        <Col lg={6} xs={6}>
                            <Label className="form-label" for="lesson_season">
                                {t('Улирал')}
                            </Label>
                            <Controller
                                defaultValue={season}
                                control={control}
                                id='lesson_season'
                                name='lesson_season'
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        type='select'
                                        name='lesson_season'
                                        bsSize='sm'
                                        id='lesson_season'
                                        invalid={errors.lesson_season && true}
                                    >
                                        <option value="">{t('-- Сонгоно уу --')}</option>
                                        {
                                            seasonOption.map((season, idx) => (
                                                <option key={idx} value={season.id || season}>{season.season_name}</option>
                                            ))
                                        }
                                    </Input>
                                )}
                            />
                            {errors.lesson_season && <FormFeedback className='d-block'>{t(errors.lesson_season.message)}</FormFeedback>}
                        </Col>
                        <Col lg={6} xs={6}>
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
                        {/* <Col lg={6} xs={6}>
                            <Label className="form-label" for="credit">
                                {t('Хичээлийн төрөлд хамаарах кредит цаг')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id="credit"
                                name="credit"
                                render={({ field }) => (
                                    <Input
                                        id ="credit"
                                        bsSize="sm"
                                        {...field}
                                        type="text"
                                        invalid={errors.credit && true}
                                    />
                                )}
                            />
                            {errors.credit && <FormFeedback className='d-block'>{t(errors.credit.message)}</FormFeedback>}
                        </Col> */}
                        <Col lg={6} xs={6}>
                            <Label className="form-label" for="teacher">
                                {t('Багш')}
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
                                            options={teacher_option || []}
                                            value={teacher_option.find((c) => c.id === value)}
                                            noOptionsMessage={() => 'Хоосон байна'}
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
                        <Col lg={6} xs={6}>
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
                                                    setSelectedGroups(val)
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
                            <Button color="secondary" type="reset" outline  onClick={handleEdit}>
                                {t('Буцах')}
                            </Button>
                        </Col>
                    </Row>
                </ModalBody>
            </Modal>
        </Fragment>
	);
};
export default Editmodal;
