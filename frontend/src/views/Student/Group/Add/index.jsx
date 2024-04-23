// ** React imports
import React, { Fragment, useState, useContext } from 'react'

import { X } from "react-feather";

import Select from 'react-select'
import classnames from "classnames";
import { ReactSelectStyles } from "@utils"

import useApi from "@hooks/useApi";
import useLoader from "@hooks/useLoader";
import SchoolContext from "@context/SchoolContext"

import { useForm, Controller } from "react-hook-form";

import { Row, Col, Form, Modal, Input, Label, Button, ModalBody, ModalHeader, FormFeedback, Spinner } from "reactstrap";

import { validate, generateLessonYear, level_option } from "@utils"

import { validateSchema } from '../validateSchema';
import { useEffect } from 'react';
import { t } from 'i18next';

const Addmodal = ({ open, handleModal, refreshDatas }) => {

    const CloseBtn = (
        <X className="cursor-pointer" size={15} onClick={handleModal} />
    )

    const { school_id } = useContext(SchoolContext)

    // Боловсролын зэргийн id
    const [ degree_id, setDegreeId] = useState('')

    // Хөтөлбөрийн багын id
    const [ dep_id, setDepId] = useState('')

    // ** Hook
    const { control, handleSubmit, reset, setValue, setError, watch, formState: { errors } } = useForm(validate(validateSchema));

    const [ profOption, setProfession] = useState([])
    const [ degreeOption, setDegree] = useState([])
    const [ statusOption, setStatus] = useState([])
    const [ teacherOption, setTeacher] = useState([])
    const [ depOption, setDepartment] = useState([])
    const [ yearOption, setYear] = useState([])

	// Loader
	const { Loader, isLoading, fetchData } = useLoader({});
	const { isLoading: postLoading, fetchData: postFetch } = useLoader({});

    const groupApi = useApi().student.group
    const professionApi = useApi().study.professionDefinition
    const degreeApi = useApi().settings.professionaldegree
    const statusApi = useApi().settings.learning

    const depApi = useApi().hrms.department

    const teacherApi = useApi().hrms.teacher

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

    // Cуралцах хэлбэрийн жагсаалт авах
    async function getStatus () {

        const { success, data } = await fetchData(statusApi.get())
        if (success) {
            setStatus(data)
        }
	}

    // Салбарын жагсаалт авах
    async function getDepartment () {

        const { success, data } = await fetchData(depApi.get(school_id))
        if (success) {
            setDepartment(data)
        }
	}

    // багшийн жагсаалт авахдаа салбар сургууль, тэнхимээр хайж авах боломжтой
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

    // Хадгалах
	async function onSubmit(cdata) {
        cdata['school'] = school_id
        const { success, error } = await postFetch(groupApi.post(cdata))
        if(success) {
            reset()
            refreshDatas()
            handleModal()
        } else {
            /** Алдааны мессэжийг input дээр харуулна */
            for (let key in error) {
                setError(error[key].field, { type: 'custom', message:  error[key].msg});
            }
        }
	}

    useEffect(()=>{
        getDepartment()
        getYear()
        getDegree()
        getProfession()
        getStatus()
        getTeacher()
    },[])

    useEffect(
        () =>
        {
            getProfession()
            getTeacher()
        },
        [degree_id, dep_id]
    )

	return (
        <Fragment>
            <Modal
                isOpen={open}
                toggle={handleModal}
                className="sidebar-lg hr-register"
                modalClassName="modal-slide-in "
                contentClassName="pt-0"
                style={{ maxWidth: '500px', width: '100%' }}
            >
                <ModalHeader
                    className="mb-1 justify-content-between"
                    toggle={handleModal}
                    close={CloseBtn}
                    tag="div"
                >
                    <h5 className="modal-title">{t('Анги бүлгийн бүртгэл')}</h5>
                </ModalHeader>
                <ModalBody className="flex-grow-1">
                    <Row tag={Form} className="gy-1" onSubmit={handleSubmit(onSubmit)}>
                        <Col md={12}>
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
                                            noOptionsMessage={() => t('Хоосон байна')}
                                            onChange={(val) => {
                                                onChange(val?.id || '')
                                                if (val?.id) setDepId(val?.id)
                                                else setDepId('')
                                                setValue('teacher', '')
                                                setValue('profession', '')
                                            }}
                                            styles={ReactSelectStyles}
                                            getOptionValue={(option) => option.id}
                                            getOptionLabel={(option) => option.name}
                                        />
                                    )
                                }}
                            ></Controller>
                            {errors.department && <FormFeedback className='d-block'>{errors.department.message}</FormFeedback>}
                        </Col>
                        <Col md={12}>
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
                                            defaultValue={value || '' }
                                            onChange={(val) => {
                                                onChange(val?.id || '')
                                                if (val?.id) setDegreeId(val?.id)
                                                else setDegreeId('')
                                                setValue('profession', '')
                                            }}
                                            styles={ReactSelectStyles}
                                            getOptionValue={(option) => option.id}
                                            getOptionLabel={(option) => option.degree_name_code}
                                        />
                                    )
                                }}
                            ></Controller>
                            {errors.degree && <FormFeedback className='d-block'>{errors.degree.message}</FormFeedback>}
                        </Col>
                        <Col md={12}>
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
                            ></Controller>
                            {errors.profession && <FormFeedback className='d-block'>{errors.profession.message}</FormFeedback>}
                        </Col>
                        <Col md={12}>
                            <Label className="form-label" for="join_year">
                                {t('Элссэн хичээлийн жил')}
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
                                        placeholder={t("Код")}
                                        invalid={errors.join_year && true}
                                    >
                                          <option value=""> {t('-- Сонгоно уу --')}</option>
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
                        <Col md={12}>
                            <Label className="form-label" for="name">
                                {t('Ангийн нэр')}
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
                                        placeholder={t("Ангийн нэр")}
                                        {...field}
                                        type="text"
                                        invalid={errors.name && true}
                                    />
                                )}
                            />
                            {errors.name && <FormFeedback className='d-block'>{errors.name.message}</FormFeedback>}
                        </Col>
                        <Col md={12}>
                            <Label className="form-label" for="level">
                                {t('Курс')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id="level"
                                name="level"
                                render={({ field: {value, onChange} }) => (
                                    // <Input
                                    //     id ="level"
                                    //     bsSize="sm"
                                    //     placeholder={t("Курс")}
                                    //     {...field}
                                    //     type='number'
                                    //     onKeyDown={(e) =>["e", "E", "+", "-", "."].includes(e.key) && e.preventDefault()}
                                    //     invalid={errors.level && true}
                                    // />
                                    <Select
                                        name="level"
                                        id="level"
                                        classNamePrefix='select'
                                        isClearable
                                        className={classnames('react-select')}
                                        isLoading={isLoading}
                                        placeholder={`-- Сонгоно уу --`}
                                        options={level_option() || []}
                                        value={level_option().find((c) => c.id === value)}
                                        noOptionsMessage={() => 'Хоосон байна'}
                                        onChange={(val) => {
                                            if (val?.id) {
                                                onChange(val?.id)
                                            } else {
                                                onChange('')
                                            }
                                        }}
                                        styles={ReactSelectStyles}
                                        getOptionValue={(option) => option.id}
                                        getOptionLabel={(option) => option.name}
                                    />
                                )}
                            />
                            {errors.level && <FormFeedback className='d-block'>{errors.level.message}</FormFeedback>}
                        </Col>
                        <Col md={12}>
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
                                            noOptionsMessage={() => t('Хоосон байна.')}
                                            onChange={(val) => {
                                                onChange(val?.id || '')
                                            }}
                                            styles={ReactSelectStyles}
                                            getOptionValue={(option) => option.id}
                                            getOptionLabel={(option) => option.learn_name}
                                        />
                                    )
                                }}
                            ></Controller>
                            {errors.learning_status && <FormFeedback className='d-block'>{errors.learning_status.message}</FormFeedback>}
                        </Col>
                        <Col md={12}>
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
                                            styles={ReactSelectStyles}
                                            getOptionValue={(option) => option.id}
                                            getOptionLabel={(option) => option.full_name}
                                        />
                                    )
                                }}
                            ></Controller>
                            {errors.teacher && <FormFeedback className='d-block'>{errors.teacher.message}</FormFeedback>}
                        </Col>
                        {/* <Col xs={12}>
                            <Label className="form-label pe-1" for="is_finish">
								{t('Төгссөн эсэх')}
                            </Label>
                            <Controller
                                control={control}
                                id="is_finish"
                                name="is_finish"
                                render={({ field }) => (
                                    <Input
                                        id="is_finish"
                                        type="checkbox"
                                        defaultChecked={field.value}
                                        {...field}
                                    />
                                )}
                            />
                        </Col> */}
                        <Col md={12} className="mt-2">
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
export default Addmodal;
