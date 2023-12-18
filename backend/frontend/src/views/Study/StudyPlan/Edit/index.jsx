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
	Label,
	Button,
	ModalBody,
	ModalHeader,
	FormFeedback,
} from "reactstrap";

import AuthContext from "@context/AuthContext"
import SchoolContext from "@context/SchoolContext"

import { validate, get_learningplan_season } from "@utils"
import { validateSchema } from '../validateSchema';
import { t } from 'i18next';

const EditModal = ({ open, handleModal, plan_id, refreshDatas, field_select_value }) => {

    // ** Hook
    const { control, handleSubmit, reset, setError, setValue, formState: { errors } } = useForm(validate(validateSchema));

    const { user } = useContext(AuthContext)
    const { school_id } = useContext(SchoolContext)

    const [standart_option, setStandartOption] = useState([])
    const [lessongroup, setLessonGroup] = useState([])
    const [season_option, setSeasonOption] = useState(get_learningplan_season())

    const [is_disabled, setDisabled] = useState(true)

	// Loader
	const { isLoading, fetchData } = useLoader({});

    // Api
    const planApi = useApi().study.plan
    const lessonStandartApi = useApi().study.lessonStandart
    const lessonGroupApi = useApi().settings.lessonGroup

    useEffect(() => {
        if(Object.keys(user).length > 0 && user.permissions.includes('lms-study-learningplan-update')) {
            setDisabled(false)
        }
    },[user])

    // Хичээлийн жагсаалт
    async function getLessonStandart() {
        const { success, data } = await fetchData(lessonStandartApi.getList())
        if(success) {
            setStandartOption(data)
        }
    }

    // Хичээлийн бүлэг
    async function getLessonGroup() {
        const { success, data } = await fetchData(lessonGroupApi.get())
        if(success) {
            setLessonGroup(data)
        }
    }


    async function getDatas() {
        if(plan_id) {
            const { success, data } = await fetchData(planApi.getOne(plan_id))
            if(success) {
                // засах үед дата байх юм бол setValue-р дамжуулан утгыг харуулна
                if(data === null) return
                for(let key in data) {
                    if(data[key] !== null)
                        setValue(key, data[key]?.id)
                    else setValue(key,'')
                }
            }
        }
    }

    useEffect(() => {
        getDatas()
        getLessonGroup()
        getLessonStandart()

        for(var key in field_select_value) {
            setValue(key, field_select_value[key])
        }
    },[])

	async function onSubmit(cdata) {
        cdata['school'] = school_id
        const { success, error } = await fetchData(planApi.put(cdata, plan_id))
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

	return (
        <Fragment>
            <Modal isOpen={open} toggle={handleModal} className="modal-dialog-centered" onClosed={handleModal}>
                <ModalHeader className='bg-transparent pb-0' toggle={handleModal}></ModalHeader>
                <ModalBody className="px-sm-3 pt-50 pb-3">
                    <div className='text-center'>
                        <h4>{t('Сургалтын төлөвлөгөө засах')}</h4>
                    </div>
                    <Row tag={Form} className="gy-1" onSubmit={handleSubmit(onSubmit)}>
                        <Col lg={12}>
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
                                            placeholder={t('-- Сонгоно уу --')}
                                            options={standart_option || []}
                                            value={standart_option.find((c) => c.id === value)}
                                            noOptionsMessage={() => t('Хоосон байна.')}
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
                        <Col lg={12}>
                            <Label className="form-label" for="previous_lesson">
                                {t('Өмнөх холбоо хичээл')}
                            </Label>
                            <Controller
                                control={control}
                                defaultValue=''
                                name="previous_lesson"
                                render={({ field: { value, onChange} }) => {
                                    return (
                                        <Select
                                            name="previous_lesson"
                                            id="previous_lesson"
                                            classNamePrefix='select'
                                            isClearable
                                            className={classnames('react-select', { 'is-invalid': errors.previous_lesson })}
                                            isLoading={isLoading}
                                            placeholder={t('-- Сонгоно уу --')}
                                            options={standart_option || []}
                                            value={standart_option.find((c) => c.id === value)}
                                            noOptionsMessage={() => t('Хоосон байна.')}
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
                            {errors.previous_lesson && <FormFeedback className='d-block'>{t(errors.previous_lesson.message)}</FormFeedback>}
                        </Col>
                        <Col lg={12}>
                            <Label className="form-label" for="lesson_group">
                                {t('Хичээлийн бүлэг')}
                            </Label>
                            <Controller
                                control={control}
                                defaultValue=''
                                name="lesson_group"
                                render={({ field: { value, onChange} }) => {
                                    return (
                                        <Select
                                            name="lesson_group"
                                            id="lesson_group"
                                            classNamePrefix='select'
                                            isClearable
                                            className={classnames('react-select', { 'is-invalid': errors.lesson_group })}
                                            isLoading={isLoading}
                                            placeholder={t('-- Сонгоно уу --')}
                                            options={lessongroup || []}
                                            value={lessongroup.find((c) => c.id === value)}
                                            noOptionsMessage={() => t('Хоосон байна.')}
                                            onChange={(val) => {
                                                onChange(val?.id || '')
                                            }}
                                            styles={ReactSelectStyles}
                                            getOptionValue={(option) => option.id}
                                            getOptionLabel={(option) => option.group_name}
                                        />
                                    )
                                }}
                            ></Controller>
                            {errors.lesson_group && <FormFeedback className='d-block'>{t(errors.lesson_group.message)}</FormFeedback>}
                        </Col>
                        <Col lg={12}>
                            <Label className="form-label" for="season">
                                {t('Хичээл үзэх улирал')}
                            </Label>
                            <Controller
                                control={control}
                                defaultValue=''
                                name="season"
                                render={({ field: { value, onChange} }) => {
                                    return (
                                        <Select
                                            name="season"
                                            id="season"
                                            classNamePrefix='select'
                                            isClearable
                                            className={classnames('react-select', { 'is-invalid': errors.season })}
                                            isLoading={isLoading}
                                            placeholder={t('-- Сонгоно уу --')}
                                            options={season_option || []}
                                            value={season_option.find((c) => c.id === value)}
                                            noOptionsMessage={() => t('Хоосон байна.')}
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
                            {errors.season && <FormFeedback className='d-block'>{t(errors.season.message)}</FormFeedback>}
                        </Col>
                        <Col className='text-center mt-2' md={12}>
                            <Button
                                className="me-2"
                                size='sm'
                                color="primary"
                                type="submit"
                                disabled={is_disabled}
                            >
                                {t('Хадгалах')}
                            </Button>
                            <Button color="secondary" size='sm' type="reset" outline  onClick={handleModal}>
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
