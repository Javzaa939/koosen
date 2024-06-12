// ** React imports
import React, { Fragment, useState } from 'react'

import { X, UploadCloud } from "react-feather";

import Select from 'react-select'
import classnames from "classnames";
import moment from 'moment';

import useApi from "@hooks/useApi";
import useLoader from "@hooks/useLoader";
import Flatpickr from 'react-flatpickr'

import { useForm, Controller } from "react-hook-form";

import { Row, Col, Form, Modal,  Label, Button, ModalBody, ModalHeader, FormFeedback, Spinner, Input } from "reactstrap";

import { generateLessonYear, validate, formatDate, ReactSelectStyles, convertDefaultValue } from "@utils"
import '@styles/react/libs/flatpickr/flatpickr.scss'

import { useEffect } from 'react';
import { t } from 'i18next';

import * as Yup from 'yup';

export const validateSchema = Yup.object().shape({
	name: Yup.string()
		.trim()
		.required('Хоосон байна'),
	lesson_year: Yup.string()
		.trim()
		.required('Хоосон байна'),
	begin_date: Yup.string()
		.trim()
		.required('Хоосон байна'),
	end_date: Yup.string()
        .trim()
        .required('Хоосон байна'),
});


const Addmodal = ({ open, handleModal, refreshDatas, editData }) => {

    const CloseBtn = (
        <X className="cursor-pointer" size={15} onClick={handleModal} />
    )

    // ** Hook
    const { control, handleSubmit, reset, setValue, setError, getValues, formState: { errors } } = useForm(validate(validateSchema));

    const [ yearOption, setYear] = useState([])
    const [degreeOption, setDegree] = useState([])
    const [selectedDegrees, setSelectedDegrees] = useState([])
    const [admissionJuram, setAdmissionJuram] = useState('')
    const [endPicker, setEndPicker] = useState(new Date())
    const [startPicker, setStartPicker] = useState(new Date())

	// Loader
	const { Loader, isLoading, fetchData } = useLoader({});
	const { isLoading: postLoading, fetchData: postFetch } = useLoader({});

    const elseltApi = useApi().elselt
    const degreeApi = useApi().settings.professionaldegree

    // хичээлийн жилийн жагсаалт авах
    async function getYear () {
        setYear(generateLessonYear(10))
	}

    async function getDegree () {

        const { success, data } = await fetchData(degreeApi.get())
        if (success) {
            setDegree(data)
        }
	}

    // Хадгалах
	async function onSubmit(cdata) {
        var degree_ids = selectedDegrees.map((c) => c.id)

        cdata['degrees'] = JSON.stringify(degree_ids)
        if(!admissionJuram) {
            delete cdata['admission_juram']
        } else {
            cdata['admission_juram'] = admissionJuram
        }

        cdata['begin_date'] = moment(startPicker).format('YYYY-MM-DD HH:mm:ss')
        cdata['end_date'] =  moment(endPicker).format('YYYY-MM-DD HH:mm:ss')

        cdata = convertDefaultValue(cdata)

        const formData = new FormData()

        for (let key in cdata) {
            formData.append(key, cdata[key])
        }

        if (editData?.id) {
            const { success, errors } = await postFetch(elseltApi.put(formData, editData?.id))
            if(success) {
                reset()
                refreshDatas()
                handleModal()
            } else {
                /** Алдааны мессэжийг input дээр харуулна */
                for (let key in errors) {
                    setError(key, { type: 'custom', message:  errors[key][0]});
                }
            }
        } else {
            const { success, errors } = await postFetch(elseltApi.post(formData))
            if(success) {
                reset()
                refreshDatas()
                handleModal()
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
            getYear()
            getDegree()

        },
        []
    )

    useEffect(
        () =>
        {
            if (Object.keys(editData).length > 0) {
                for(let key in editData) {
                    if(editData[key] !== null)
                        setValue(key, editData[key])
                    else setValue(key,'')

                    if (key === 'degrees') {
                        var degrees = degreeOption.filter((c) => editData[key]?.includes(c.id))
                        setSelectedDegrees(degrees)
                    }

                    if(key === 'begin_date') {
                        setStartPicker(editData[key])
                    }
                    if(key === 'end_date') {
                        setEndPicker(editData[key])
                    }
                }
            }

        },
        [editData, degreeOption]
    )

    function ftext(val) {

        var text = val.split(`/`)[val.split('/').length - 1]

        var vdata = `${text?.substring(0, 27)}...${text?.substring(text?.length - 4)}`
        return vdata

    }

	return (
        <Fragment>
            <Modal
                isOpen={open}
                toggle={handleModal}
                className="modal-dialog-centered modal-lg"
                contentClassName="pt-0"
                backdrop='static'
            >
                <ModalHeader
                    toggle={handleModal}
                    close={CloseBtn}
                    tag="div"
                >
                    <h5 className="modal-title">{t('Элсэлтийн бүртгэл')}</h5>
                </ModalHeader>
                <ModalBody className="flex-grow-1">
                    <Row tag={Form} className="gy-1" onSubmit={handleSubmit(onSubmit)}>
                        <Col md={6}>
                            <Label className="form-label" for="name">
                               {t('Элсэлтийн нэр')}
                            </Label>
                            <Controller
                                control={control}
                                defaultValue=''
                                name="name"
                                render={({ field }) => (
                                    <Input
                                        id='name'
                                        placeholder='Элсэлтийн нэр'
                                        invalid={errors.name && true}
                                        {...field}
                                        bsSize="sm"
                                    />
                                )}
                            ></Controller>
                            {errors.name && <FormFeedback className='d-block'>{errors.name.message}</FormFeedback>}
                        </Col>
                        <Col md={6}>
                            <Label className="form-label" for="lesson_year">
                                {t('Хичээлийн жил')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id="lesson_year"
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
                                            value={value && yearOption.find((c) => c.id === value)}
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
                            {errors.lesson_year && <FormFeedback className='d-block'>{errors.lesson_year.message}</FormFeedback>}
                        </Col>
                        <Col md={6}>
                            <Label className="form-label" for="begin_date">
                                {t('Эхлэх хугацаа')}
                            </Label>
                            <Controller
                                defaultValue={formatDate(new Date())}
                                control={control}
                                name='begin_date'
                                className="form-control"
                                render={({ field: { value, onChange} }) => {
                                    return (
                                        <Flatpickr
                                            id='begin_date'
                                            className='form-control'
                                            onChange={dates => {
                                                onChange(formatDate(dates[0], 'YYYY-MM-DD H:M:S'));
                                                setStartPicker(dates[0])
                                            }}
                                            value={startPicker}
                                            style={{height: "30px"}}
                                            options={{
                                                dateFormat: 'Y-m-d H:i',
                                                enableTime: true,
                                                time_24hr: true,
                                                utc: true,
                                            }}
                                        />
                                    )
                                }}
                            />
                            {errors.begin_date && <FormFeedback className='d-block'>{t(errors.begin_date.message)}</FormFeedback>}
                        </Col>
                        <Col md={6}>
                            <Label className="form-label" for="end_date">
                                {t('Дуусах хугацаа')}
                            </Label>
                            <Controller
                                defaultValue={formatDate(new Date())}
                                control={control}
                                name='end_date'
                                className="form-control"
                                render={({ field: { value, onChange} }) => {
                                    return (
                                        <Flatpickr
                                            id='end_date'
                                            className='form-control'
                                            onChange={dates => {
                                                onChange(formatDate(dates[0], 'YYYY-MM-DD HH:MM:SS'));
                                                setEndPicker(dates[0])
                                            }}
                                            value={endPicker}
                                            style={{height: "30px"}}
                                            options={{
                                                dateFormat: 'Y-m-d H:i',
                                                utc: true,
                                                time_24hr: true,
                                                enableTime: true,
                                                minDate: getValues("begin_date"),
                                            }}
                                        />
                                    )
                                }}
                            />
                            {errors.start_date && <FormFeedback className='d-block'>{t(errors.start_date.message)}</FormFeedback>}
                        </Col>
                        <Col md={6}>
                            <Label className="form-label" for="degrees">
                                {t('Боловсролын зэрэг')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id="degrees"
                                name="degrees"
                                render={({ field }) => {
                                    return (
                                        <Select
                                            name="degrees"
                                            id="degrees"
                                            classNamePrefix='select'
                                            isClearable
                                            className={classnames('react-select', { 'is-invalid': errors.degrees })}
                                            isLoading={isLoading}
                                            isMulti
                                            placeholder={t(`-- Сонгоно уу --`)}
                                            options={degreeOption || []}
                                            value={selectedDegrees}
                                            noOptionsMessage={() => t('Хоосон байна')}
                                            onChange={(val) => {
                                                setSelectedDegrees(val)
                                            }}
                                            styles={ReactSelectStyles}
                                            getOptionValue={(option) => option.id}
                                            getOptionLabel={(option) => option.degree_name}
                                        />
                                    )
                                }}
                            />
                            {errors.degrees && <FormFeedback className='d-block'>{errors.degrees.message}</FormFeedback>}
                        </Col>
                        <Col md={6}>
                            <Controller
                                defaultValue={false}
                                control={control}
                                id='is_active'
                                name='is_active'
                                render={({ field }) => {
                                    return (
                                        <Input
                                            {...field}
                                            checked={field.value}
                                            className='me-50'
                                            type='checkbox'
                                            name='is_active'
                                            id='is_active'
                                        />
                                    )
                                }}
                            />
                            <Label className='form-label' for='is_active'>
                                {t('Идэвхтэй эсэх')}
                            </Label>
                        </Col>
                        <Col md={6}>
                            <Label className="form-label" for="home_description">
                               {t('Нүүр хуудасны харуулах тайлбар')}
                            </Label>
                            <Controller
                                control={control}
                                defaultValue=''
                                name="home_description"
                                render={({ field }) => (
                                    <Input
                                        id='home_description'
                                        placeholder='Нүүр хуудасны харуулах тайлбар'
                                        invalid={errors.home_description && true}
                                        {...field}
                                        bsSize="sm"
                                        type='textarea'
                                    />
                                )}
                            ></Controller>
                            {errors.home_description && <FormFeedback className='d-block'>{errors.home_description.message}</FormFeedback>}
                        </Col>
                        <Col md={6}>
                            <Label className="form-label" for="alert_description">
                               {t('Тухайн элсэлтэд зориулаад санамж')}
                            </Label>
                            <Controller
                                control={control}
                                defaultValue=''
                                name="alert_description"
                                render={({ field }) => (
                                    <Input
                                        id='alert_description'
                                        placeholder='Тухайн элсэлтэд зориулаад санамж'
                                        {...field}
                                        bsSize="sm"
                                        type='textarea'
                                    />
                                )}
                            ></Controller>
                        </Col>
                        <Col md={12} sm={12}>
                            <Label className="" for='admission_juram'>
                                Элсэлтийн журам
                            </Label>
                            <Controller
                                id='admission_juram'
                                name='admission_juram'
                                control={control}
                                defaultValue=''
                                render={({ field: {onChange, value}  }) => {
                                    return (
                                        <div className="dropzone-container">
                                            <input
                                                id='admission_juram'
                                                name='admission_juram'
                                                multiple={false}
                                                type='file'
                                                className='d-none'
                                                accept="application/pdf"
                                                placeholder='test'
                                                onChange={(e) => {
                                                    onChange(e.target.files?.[0] ?? null)
                                                    setAdmissionJuram(e.target.files?.[0] ?? null)
                                                }}
                                                onError={() => {'Алдаа'}}

                                            />
                                            <Label className={`${value ? 'border-success' : 'border'} rounded-3 ${classnames({ 'is-invalid': errors.admission_juram })}`} htmlFor='admission_juram'>
                                                <div>
                                                    <div className='mt-2 mb-1 d-flex flex-column align-items-center justify-content-center'>
                                                        <UploadCloud color={`${errors.admission_juram ? '#c72e2e' : 'gray'}`} size={60}/>
                                                        <span className={`mx-1 px-1 ${errors.admission_juram ? 'text-danger' : ''}`} style={{ fontSize: 12 }}>
                                                            Файл оруулна уу. Зөвхөн .pdf файл хүлээж авна
                                                        </span>
                                                    </div>
                                                </div>
                                                <div>
                                                    {
                                                        value ?
                                                            <div className='p-50 d-flex justify-content-between file_style'>
                                                                <div className='text-truncate fw-bold'>
                                                                    {typeof value == 'string' ? ftext(value) :
                                                                        value?.name?.length > 30 ?
                                                                        `${value?.name?.substring(0, 27)}...${value?.name?.substring(value?.name?.length - 4)}` :
                                                                        value?.name
                                                                    }
                                                                </div>
                                                                <div>
                                                                    <X onClick={(e) => {e.preventDefault(), onChange(null)}} size={16} role='button'/>
                                                                </div>
                                                            </div>
                                                        :
                                                            <div>
                                                        </div>
                                                    }
                                                </div>
                                            </Label>
                                        </div>
                                    )
                                }}
                            />
                        </Col>
                        <Col md={12} className="mt-2">
                            <Button className="me-2" color="primary" type="submit" disabled={postLoading}>
                                {postLoading &&<Spinner size='sm' className='me-1'/>}
                                {t('Хадгалах')}
                            </Button>
                            <Button color="secondary">
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
