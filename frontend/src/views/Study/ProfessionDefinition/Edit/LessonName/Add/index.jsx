// ** React imports
import React, { Fragment, useState, useEffect, useContext } from 'react'

import Select from 'react-select'
import useApi from "@hooks/useApi";
import useLoader from "@hooks/useLoader";
import AuthContext from "@context/AuthContext";
import classnames from "classnames";

import { ReactSelectStyles, score_type } from "@utils"
import { useTranslation } from "react-i18next";
import { useForm, Controller } from "react-hook-form";
import { validate, convertDefaultValue } from "@utils";
import { validateSchema } from '../validateSchema';
import { useParams } from 'react-router-dom';

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


const Addmodal = ({ open, handleModal, refreshDatas, admission_lessons }) => {

    const { control, handleSubmit, reset, setValue, setError, formState: { errors } } = useForm(validate(validateSchema));
    const { definition_Id } = useParams()
    const { t } = useTranslation()
    const { user } = useContext(AuthContext)
    const [lesson_option, setLessonOption] = useState([])
    const [is_disabled, setDisabled] = useState(true)
	const { isLoading, fetchData } = useLoader({});
    const [change_lesson, setChangeLesson] = useState([])
    const [score_type_option, setScoreType] = useState(score_type())

    const AdmissionlessonApi = useApi().settings.admissionlesson
    const definationApi = useApi().study.professionDefinition

    useEffect(() => {
        if(Object.keys(user).length > 0 && user.permissions.includes('lms-score-correspond-update')) {
            setDisabled(false)
        }
    },[user])

    // Хичээлийн жагсаалт
    async function getLessonOption() {
        const { success, data } = await fetchData(AdmissionlessonApi.get())
        if (success) {
            setLessonOption(data)
        }
    }

    useEffect(()=>{
        getLessonOption()
    },[])

    async function onSubmit(cdata) {
        cdata['profession'] = definition_Id
        cdata['lesson'] = change_lesson
        cdata = convertDefaultValue(cdata)

        const { success, error } = await fetchData(definationApi.putScore(cdata, definition_Id))
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

    return (
        <Fragment>
            <Modal isOpen={open} toggle={handleModal} className="modal-dialog-centered modal-sm" onClosed={handleModal}>
            {isLoading && <div className='suspense-loader'><Spinner size='xl'/></div>}
                <ModalHeader className='bg-transparent pb-0' toggle={handleModal}></ModalHeader>
                <ModalBody className="px-sm-3 pt-50 pb-3">
                    <div className='text-center'>
                        <h4>{t('ЭЕШ-ийн хичээл нэмэх')}</h4>
                    </div>
                    <Row tag={Form} className="gy-1" onSubmit={handleSubmit(onSubmit)}>
                    <Col md={12}>
                            <Label className="form-label" for="student">
                                {t("ЭЕШ-ийн хичээл")}
                            </Label>
                            <Controller
                                control={control}
                                defaultValue=''
                                name="admission_lesson"
                                render={({ field: { value, onChange} }) => {
                                    return (
                                        <Select
                                            name="lesson"
                                            id="lesson"
                                            classNamePrefix='select'
                                            isClearable
                                            className={classnames('react-select', { 'is-invalid': errors.admission_lesson })}
                                            isLoading={isLoading}
                                            placeholder={t('-- Сонгоно уу --')}
                                            options={lesson_option || []}
                                            value={lesson_option.find((c) => c.id === value)}
                                            noOptionsMessage={() => {t('Хоосон байна.')}}
                                            onChange={(val) => {
                                                onChange(val?.id || '')
                                                setChangeLesson(val?.id || '')
                                            }}
                                            styles={ReactSelectStyles}
                                            getOptionValue={(option) => option.id}
                                            getOptionLabel={(option) => option.lesson_name}
                                        />
                                    )
                                }}
                            ></Controller>
                            {errors.admission_lesson && <FormFeedback className='d-block'>{t(errors.admission_lesson.message)}</FormFeedback>}
                        </Col>
                        <Col lg={12}>
                                <Label className="form-label" for="score_type">
                                    {t('Элсэлтийн шалгалтын төрөл')}
                                </Label>
                                <Controller
                                    defaultValue=''
                                    control={control}
                                    id="score_type"
                                    name="score_type"
                                    render={({ field: { value, onChange} }) => {
                                        return (
                                            <Select
                                                name="score_type"
                                                id="score_type"
                                                classNamePrefix='select'
                                                isClearable
                                                className={classnames('react-select', { 'is-invalid': errors.score_type })}
                                                isLoading={isLoading}
                                                placeholder={t(`-- Сонгоно уу --`)}
                                                options={score_type_option || []}
                                                value={ score_type_option.find((c) => c.id === value)}
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
                                />
                                {errors.score_type && <FormFeedback className='d-block'>{errors.score_type.message}</FormFeedback>}
                            </Col>
                        <Col md={12}>
                            <Label className="form-label" for="exam_score">
                                {t("Босго оноо")}
                            </Label>
                            <Controller
                                control={control}
                                defaultValue=''
                                name="bottom_score"
                                render={({ field }) => {
                                    return (
                                        <Input
                                        {...field}
                                        id ="bottom_score"
                                        bsSize="sm"
                                        placeholder={t('Босго оноо')}
                                        type="number"
                                        invalid={errors.bottom_score && true}
                                        />
                                    )
                                }}
                            ></Controller>
                            {errors.bottom_score && <FormFeedback className='d-block'>{t(errors.bottom_score.message)}</FormFeedback>}
                        </Col>
                        <Col md={12} className="text-center pt-1">
                            <Button className="me-2" size='sm' color="primary" type="submit" disabled={is_disabled}>
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
    )
};
export default Addmodal;
