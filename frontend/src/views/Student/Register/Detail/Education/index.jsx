// ** React imports
import React, { useState, useEffect, useContext } from 'react'

import { useParams } from 'react-router-dom';
import { useForm, Controller } from "react-hook-form";

import Select from 'react-select'

import {
    Row,
    Col,
	Form,
	Input,
	Label,
	FormFeedback,
    CardHeader,
    Card,
    Button,
    CardTitle,
    Modal,
    ModalBody,
    ModalHeader,
} from "reactstrap";

import useApi from "@hooks/useApi";
import useLoader from "@hooks/useLoader";
import AuthContext from '@context/AuthContext'

import classnames from 'classnames';

import { validate, convertDefaultValue, get_education_list, ReactSelectStyles } from "@utils"

import Tables from './Tables';

import { validateSchema } from './validationSchema';
import { useTranslation } from 'react-i18next';

import SchoolContext from "@context/SchoolContext"

const Education = () => {

    const { school_id } = useContext(SchoolContext)

    // ** Hook
    const { control, handleSubmit, reset, setError, setValue, formState: { errors } } = useForm(validate(validateSchema));

    // Loader
	const { Loader, isLoading, fetchData } = useLoader({isSmall: true});

    const { user } = useContext(AuthContext)
    const { studentId } = useParams()

    const [disabled, setDisabled] = useState(true)
    const [is_edit, setEdit] = useState(false)
    const [show, setShow] = useState(false)
    const [edu_option, setEduOption] = useState(get_education_list)
    const [country_option, setCountryOption] = useState([])
    const [datas, setDatas] = useState([])

    const { t } = useTranslation()

    // Api
    const educationApi = useApi().student.education
    const countryApi = useApi().hrms.country

    // Устггах функц
    async function handleDelete(id) {

        const { success, data } = await fetchData(educationApi.delete(studentId, id))
        if(success)
        {
            getDatas()
        }
    }

    // Модал хаах
    const onModalClosed = () => {
        reset()
        setShow(false)
    }

    useEffect(() => {
        /** Эрх шалгана */
        if(Object.keys(user).length > 0 && user.permissions.includes('lms-student-register-update')&& school_id) {
            setDisabled(false)
        }
    },[user, show])

    const getCountry = async() => {
        const { success, data } = await fetchData(countryApi.get())
        if(success)
        {
            setCountryOption(data)
        }
    }

    const getDatas = async() => {
        const { success, data } = await fetchData(educationApi.get(studentId))
        if(success)
        {
            setDatas(data)
            if(data === null) return
            for(let key in data) {
                if (data[key] === null) setValue(key, '')
                else setValue(key, data[key])
                if (key === 'country') setValue(key, data[key]?.id)
            }
        }
    }

    async function handleEdit(data) {
        setEdit(true)
        setShow(true)
        /** Оюутны id болон засах гэж байгаа мэдээллийн id-р хүсэлт явуулж back-с датаг авч онооно */
        // датаг setValue-р дамжуулан харуулна
        if(data === null) return
        for(let key in data) {
            if (data[key] === null) setValue(key, '')
            else setValue(key, data[key])
            if (key === 'country') setValue(key, data[key]?.id)
        }
    }

    async function onSubmit(cdata) {
        cdata['student'] = studentId

        cdata = convertDefaultValue(cdata)

        if(is_edit) {
            /** Засах */
            var id = cdata['id']
            const { success, errors } = await fetchData(educationApi.put(cdata, id, studentId))
            if(success)
            {
                onModalClosed()
                getDatas()
            } else {
                /** Алдааны мессэжийг input дээр харуулна */
                for (let key in errors) {
                    setError(key, { type: 'custom', message:  errors[key][0]});
                }
            }
        } else {
            const { success, errors } = await fetchData(educationApi.post(cdata))
            if(success)
            {
                onModalClosed()
                getDatas()
            } else {
                /** Алдааны мессэжийг input дээр харуулна */
                for (let key in errors) {
                    setError(key, { type: 'custom', message:  errors[key][0]});
                }
            }
        }
	}

    useEffect(
        () =>
        {
            getDatas()
            getCountry()
        },
        []
    )

	return (
        <Card>
            <CardHeader className="d-flex justify-content-between py-0 px-0">
                <CardTitle tag='h4'>{t('Боловсролын мэдээлэл')}</CardTitle>
                <Button disabled={disabled} color='primary' size="sm" onClick={() => {setShow(true), setEdit(false)}}>
                    {t('Нэмэх')}
                </Button>
            </CardHeader>
            <hr />
            <Tables datas={datas} handleDelete={handleDelete} handleEdit={handleEdit} is_role={disabled} edu_option={edu_option}/>
            <Modal isOpen={show} toggle={() => setShow(!show)} className='modal-dialog-centered' onClosed={onModalClosed}>
                <ModalHeader className='bg-transparent pb-0' toggle={() => setShow(!show)}></ModalHeader>
                    <h5 className='text-center'>{t('Боловсролын мэдээлэл')}</h5>
                    <ModalBody className='px-sm-3 pb-2'>
                        <Row tag={Form} className="gy-1 pb-2" onSubmit={handleSubmit(onSubmit)}>
                            <Col lg={12}>
                                <Label className="form-label" for="country">
                                    {t('Улс')}
                                </Label>
                                <Controller
                                    defaultValue=''
                                    control={control}
                                    id="country"
                                    name="country"
                                    render={({ field: { value, onChange} }) => {
                                        return (
                                            <Select
                                                name="country"
                                                id="country"
                                                classNamePrefix='select'
                                                isClearable
                                                className={classnames('react-select', { 'is-invalid': errors.country })}
                                                isLoading={isLoading}
                                                placeholder={t(`-- Сонгоно уу --`)}
                                                options={country_option || []}
                                                value={country_option.find((c) => c.id === value)}
                                                noOptionsMessage={() => t('Хоосон байна')}
                                                onChange={(val) => {
                                                    onChange(val?.id || '')
                                                }}
                                                isDisabled={disabled}
                                                styles={ReactSelectStyles}
                                                getOptionValue={(option) => option.id}
                                                getOptionLabel={(option) => option.name}
                                            />
                                        )
                                    }}
                                />
                                {errors.country && <FormFeedback className='d-block'>{errors.country.message}</FormFeedback>}
                            </Col>
                            <Col lg={12}>
                                <Label className="form-label" for="school_name">
                                    {t('Сургуулийн нэр')}
                                </Label>
                                <Controller
                                    defaultValue=''
                                    control={control}
                                    id="school_name"
                                    name="school_name"
                                    render={({ field }) => (
                                        <Input
                                            id ="school_name"
                                            bsSize="sm"
                                            {...field}
                                            placeholder={t('Сургуулийн нэр')}
                                            type="text"
                                            readOnly={disabled}
                                            disabled={disabled}
                                            invalid={errors.school_name && true}
                                        />
                                    )}
                                />
                                {errors.school_name && <FormFeedback className='d-block'>{errors.school_name.message}</FormFeedback>}
                            </Col>
                            <Col lg={12}>
                                <Label className="form-label" for="edu_level">
                                    {t('Боловсролын түвшин')}
                                </Label>
                                <Controller
                                    defaultValue=''
                                    control={control}
                                    id="edu_level"
                                    name="edu_level"
                                    render={({ field: { value, onChange} }) => {
                                        return (
                                            <Select
                                                name="edu_level"
                                                id="edu_level"
                                                classNamePrefix='select'
                                                isClearable
                                                className={classnames('react-select', { 'is-invalid': errors.edu_level })}
                                                isLoading={isLoading}
                                                placeholder={t(`-- Сонгоно уу --`)}
                                                options={edu_option || []}
                                                value={edu_option.find((c) => c.id === value)}
                                                noOptionsMessage={() => t('Хоосон байна.')}
                                                onChange={(val) => {
                                                    onChange(val?.id || '')
                                                }}
                                                isDisabled={disabled}
                                                styles={ReactSelectStyles}
                                                getOptionValue={(option) => option.id}
                                                getOptionLabel={(option) => option.name}
                                            />
                                        )
                                    }}
                                />
                                {errors.edu_level && <FormFeedback className='d-block'>{errors.edu_level.message}</FormFeedback>}
                            </Col>
                            <Col lg={12}>
                                <Label className="form-label" for="join_year">
                                    {t('Элссэн он')}
                                </Label>
                                <Controller
                                    defaultValue=''
                                    control={control}
                                    id="join_year"
                                    name="join_year"
                                    render={({ field }) => (
                                        <Input
                                            id ="join_year"
                                            bsSize="sm"
                                            {...field}
                                            placeholder={t('Элссэн он')}
                                            type="number"
                                            readOnly={disabled}
                                            disabled={disabled}
                                            invalid={errors.join_year && true}
                                            onKeyDown={(e) =>["e", "E", "+", "-", "."].includes(e.key) && e.preventDefault()}
                                        />
                                    )}
                                />
                                {errors.join_year && <FormFeedback className='d-block'>{errors.join_year.message}</FormFeedback>}
                            </Col>
                            <Col lg={12}>
                                <Label className="form-label" for="graduate_year">
                                    {t('Төгссөн он')}
                                </Label>
                                <Controller
                                    defaultValue=''
                                    control={control}
                                    id="graduate_year"
                                    name="graduate_year"
                                    render={({ field }) => (
                                        <Input
                                            id ="graduate_year"
                                            bsSize="sm"
                                            {...field}
                                            placeholder={t('Төгссөн он')}
                                            type="number"
                                            readOnly={disabled}
                                            disabled={disabled}
                                            invalid={errors.graduate_year && true}
                                            onKeyDown={(e) =>["e", "E", "+", "-", "."].includes(e.key) && e.preventDefault()}
                                        />
                                    )}
                                />
                                {errors.graduate_year && <FormFeedback className='d-block'>{errors.graduate_year.message}</FormFeedback>}
                            </Col>
                            <Col lg={12}>
                                <Label className="form-label" for="profession">
                                    {t('Эзэмшсэн Хөтөлбөр')}
                                </Label>
                                <Controller
                                    defaultValue=''
                                    control={control}
                                    id="profession"
                                    name="profession"
                                    render={({ field }) => (
                                        <Input
                                            id ="profession"
                                            bsSize="sm"
                                            {...field}
                                            placeholder={t('Эзэмшсэн Хөтөлбөр')}
                                            type="text"
                                            readOnly={disabled}
                                            disabled={disabled}
                                            invalid={errors.profession && true}
                                        />
                                    )}
                                />
                                {errors.profession && <FormFeedback className='d-block'>{errors.profession.message}</FormFeedback>}
                            </Col>
                            <Col lg={12}>
                                <Label className="form-label" for="certificate_num">
                                    {t('Диплом/Сертификатын дугаар')}
                                </Label>
                                <Controller
                                    defaultValue=''
                                    control={control}
                                    id="certificate_num"
                                    name="certificate_num"
                                    render={({ field }) => (
                                        <Input
                                            id ="certificate_num"
                                            bsSize="sm"
                                            {...field}
                                            placeholder={t('Диплом/Сертификатын дугаар')}
                                            type="text"
                                            readOnly={disabled}
                                            disabled={disabled}
                                            invalid={errors.certificate_num && true}
                                        />
                                    )}
                                />
                                {errors.certificate_num && <FormFeedback className='d-block'>{errors.certificate_num.message}</FormFeedback>}
                            </Col>
                            {
                                <Col className='text-center' md={12}>
                                    <Button disabled={disabled} size='sm' className="me-2" color="primary" type="submit">
                                        {isLoading && Loader}
                                        {is_edit ? t('Засах') : t('Хадгалах')}
                                    </Button>
                                    <Button color="secondary" size='sm' type="reset" outline onClick={onModalClosed}>
                                        {t('Буцах')}
                                    </Button>
                                </Col>
                            }
                        </Row>
                    </ModalBody>
            </Modal>
        </Card>
	);
};
export default Education;
