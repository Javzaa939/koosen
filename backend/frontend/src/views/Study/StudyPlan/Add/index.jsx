// ** React imports
import React, { Fragment, useState, useEffect, useContext } from 'react'

import { X } from "react-feather";

import Select from 'react-select'

import useApi from "@hooks/useApi";
import useLoader from "@hooks/useLoader";
import SchoolContext from "@context/SchoolContext"

import { useTranslation } from 'react-i18next';

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
    Spinner,
	ModalBody,
	ModalHeader,
	FormFeedback,
} from "reactstrap";

import { validate, get_learningplan_season } from "@utils"

import { validateSchema } from '../validateSchema';

const Addmodal = ({ open, handleModal, refreshDatas, field_select_value }) => {

    const CloseBtn = (
        <X className="cursor-pointer" size={15} onClick={handleModal} />
    )

    const { t } = useTranslation()

    const { school_id } = useContext(SchoolContext)

    // ** Hook
    const { control, handleSubmit, reset, setValue, setError, formState: { errors } } = useForm(validate(validateSchema));

	// Loader
	const { Loader, isLoading, fetchData } = useLoader({});

    // states
    const [is_loading, setLoader] = useState(false)
    const [standart_option, setStandartOption] = useState([])
    const [lessongroup, setLessonGroup] = useState([])
    const [season_option, setSeasonOption] = useState(get_learningplan_season())

    // Api
    const planApi = useApi().study.plan
    const lessonStandartApi = useApi().study.lessonStandart
    const lessonGroupApi = useApi().settings.lessonGroup

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

    useEffect(() => {
        for(var key in field_select_value) {
            setValue(key, field_select_value[key])
        }
    },[])

	async function onSubmit(cdata) {
        setLoader(true)
        cdata['school'] = school_id
        const { success, error } = await fetchData(planApi.post(cdata))
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
        getLessonGroup()
        getLessonStandart()
    },[])

	return (
        <Fragment>
            {
                is_loading &&
                    <div className='suspense-loader'>
                        <Spinner size='bg'/>
                        <span className='ms-50'>{t('Түр хүлээнэ үү')}...</span>
                    </div>
            }
            <Modal
                isOpen={open}
                toggle={handleModal}
                className='sidebar-lg'
                modalClassName='modal-slide-in'
                contentClassName='pt-0'
            >
                <ModalHeader
                    className="mb-1"
                    toggle={handleModal}
                    close={CloseBtn}
                    tag="div"
                >
                    <h5 className="modal-title">{t('Сургалтын төлөвлөгөө нэмэх')}</h5>
                </ModalHeader>
                <ModalBody className="flex-grow-1">
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
                                            getOptionLabel={(option) =>option.full_name}
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
                                            noOptionsMessage={() => t('Хоосон байна.')}s
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
