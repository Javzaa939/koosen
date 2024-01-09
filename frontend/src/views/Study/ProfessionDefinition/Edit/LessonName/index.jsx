// ** React imports
import React, { Fragment, useState, useEffect, useContext } from 'react'

import Select from 'react-select'

import { useTranslation } from 'react-i18next';

import useApi from "@hooks/useApi";
import useLoader from "@hooks/useLoader";

import { ReactSelectStyles } from "@utils"

import classnames from "classnames";

import { useForm, Controller } from "react-hook-form";

import { useParams } from 'react-router-dom';

import {
    Row,
    Col,
	Form,
	Input,
	Label,
	Button,
	Card,
    CardHeader,
    CardBody,
	FormFeedback,
    Spinner
} from "reactstrap";

import AuthContext from "@context/AuthContext"
import SchoolContext from "@context/SchoolContext"

import { validate, convertDefaultValue } from "@utils"
import { validateSchema } from './validateSchema';

const MainInformation = ({ }) => {

    const { definition_Id } = useParams()

    const { user } = useContext(AuthContext)

    const { school_id } = useContext(SchoolContext)

    const { t } = useTranslation()

    // UseState
    const [is_valid, setValid] = useState(true)
    const [lesson_option, setLessonOption] = useState([])
    const [admission_lessons, setAdmissionLesson] = useState([])
    const [datas, setDatas] = useState([])

    // ** Hook
    const { control, handleSubmit, reset, setValue, setError, formState: { errors } } = useForm(validate(validateSchema));
	// Loader
	const { Loader, isLoading, fetchData } = useLoader({});

    // Api
    const definationApi = useApi().study.professionDefinition
    const AdmissionlessonApi = useApi().settings.admissionlesson

    // ЭЕШ хичээлийн жагсаалт
    async function getLessonOption() {
        const { success, data } = await fetchData(AdmissionlessonApi.get())
        if (success) {
            setLessonOption(data)
        }
    }

    useEffect(() => {
        if(Object.keys(user).length > 0 && user.permissions.includes('lms-study-profession-update') &&school_id) {
            setValid(false)
        }
    },[user])

    async function getDatas() {
        if(definition_Id) {

            const { success, data } = await fetchData(definationApi.getOne(definition_Id))
            // const { success, data } = await fetchData(definationApi.getAddScoreOne(definition_Id))
            if(success) {

                setDatas(data)
                setValue('profession', data?.name)
                setValue('bottom_score', data?.admission_lesson[0]?.bottom_score)
                var admission_lesson_id = []
                data?.admission_lesson?.map((lesson, idx) => {
                    var admission_ids = lesson_option.find((e) => e.id === parseInt(lesson?.admission_lesson_id))
                    if (admission_ids != undefined){
                        admission_lesson_id.push(admission_ids)
                    }
                })
                setAdmissionLesson(admission_lesson_id)
            }
        }
    }

    useEffect(() => {
        getDatas()
        getLessonOption()
    },[])


    useEffect(() => {
        if (Object.keys(datas).length > 0) {
            var admission_ids = []
            datas['admission_lesson'].map((lesson, idx) => {
                var selected = lesson_option.find((e) => e.id === lesson?.admission_lesson_id)
                if (selected != undefined) {
                    admission_ids.push(selected)
                }
                setAdmissionLesson(admission_ids)
            })
        }
    },[lesson_option,datas])

	async function onSubmit(cdata) {
        cdata = convertDefaultValue(cdata)
        cdata['profession'] = definition_Id
        cdata['admission_lesson'] = admission_lessons

        const { success, error } = await fetchData(definationApi.putScore(cdata, definition_Id))
        if(success) {
            reset()
            getDatas()
        } else {
            /** Алдааны мессэжийг input дээр харуулна */
            for (let key in error) {
                setError(error[key].field, { type: 'custom', message:  error[key].msg});
            }
        }
	}

	return (
        <Fragment>
            <Card className="modal-dialog-left modal-lg">
            {isLoading && <div className='suspense-loader'><Spinner size='xl'/></div>}
                <CardHeader className='bg-transparent pb-0'></CardHeader>
                <CardBody className="px-sm-3 pt-50 pb-3">
                    <div className='text-center'>
                        <h4>{t('ЭЕШ-ийн хичээл, босго оноо')}</h4>
                    </div>
                    <Row tag={Form} className="gy-1" onSubmit={handleSubmit(onSubmit)}>
                        <Col lg={6} xs={12}>
                            <Label className="form-label" for="profession">
                                {t('Хөтөлбөр')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                name="profession"
                                render={({ field }) => {
                                    return (
                                        <Input
                                            {...field}
                                            id ="profession"
                                            name = "profession"
                                            bsSize="sm"
                                            placeholder={t('Хөтөлбөрийн нэр')}
                                            type="text"
                                            readOnly={true}
                                            disabled={true}
                                            invalid={errors.profession && true}
                                        />
                                    )
                                }}
                            />
                            {errors.profession && <FormFeedback className='d-block'>{t(errors.profession.message)}</FormFeedback>}
                        </Col>
                        <Col lg={6} xs={12}>
                            <Label className="form-label" for="admission_lesson">
                                {t('ЭЕШ өгөх хичээл')}
                            </Label>
                            <Controller
                                control={control}
                                defaultValue=''
                                name="admission_lesson"
                                render={({ field: { value, onChange} }) => {
                                    return (
                                        <Select
                                            name="admission_lesson"
                                            id="admission_lesson"
                                            classNamePrefix='select'
                                            isClearable
                                            className={classnames('react-select', { 'is-invalid': errors.admission_lesson })}
                                            isLoading={isLoading}
                                            placeholder={t('-- Сонгоно уу --')}
                                            options={lesson_option || []}
                                            value={admission_lessons}
                                            noOptionsMessage={() => {t('Хоосон байна.')}}
                                            onChange={(val) => {
                                                onChange(val?.id || '')
                                                setAdmissionLesson(val)
                                            }}
                                            isMulti
                                            styles={ReactSelectStyles}
                                            getOptionValue={(option) => option.id}
                                            getOptionLabel={(option) => option.lesson_name}
                                        />
                                    )
                                }}
                            ></Controller>
                            {errors.admission_lesson && <FormFeedback className='d-block'>{t(errors.admission_lesson.message)}</FormFeedback>}
                        </Col>
                        <Col lg={6} xs={12}>
                            <Label className="form-label" for="bottom_score">
                                {t('Босго оноо')}
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
                        <Col className='text-center mt-2' md={12}>
                            <Button className="me-2" disabled={is_valid} size='sm' color="primary" type="submit">
                                {t('Хадгалах')}
                            </Button>
                        </Col>
                    </Row>
                </CardBody>
            </Card>
        </Fragment>
	);
};
export default MainInformation;


