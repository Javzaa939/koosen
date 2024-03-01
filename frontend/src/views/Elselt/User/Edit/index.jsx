// ** React imports
import React, { Fragment, useState } from 'react'

import { X } from "react-feather";

import Select from 'react-select'
import classnames from "classnames";

import useApi from "@hooks/useApi";
import useLoader from "@hooks/useLoader";
import Flatpickr from 'react-flatpickr'

import { useForm, Controller } from "react-hook-form";

import { Row, Col, Form, Modal,  Label, Button, ModalBody, ModalHeader, FormFeedback, Spinner, Input } from "reactstrap";

import { generateLessonYear, validate, formatDate, ReactSelectStyles } from "@utils"
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


const EditModal = ({ open, handleModal, refreshDatas, editData }) => {

    const CloseBtn = (
        <X className="cursor-pointer" size={15} onClick={handleModal} />
    )

    // ** Hook
    const { control, handleSubmit, reset, setValue, setError, getValues, formState: { errors } } = useForm(validate(validateSchema));

    const [ yearOption, setYear] = useState([])
    const [degreeOption, setDegree] = useState([])

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
        if (editData?.id) {
            const { success, errors } = await postFetch(elseltApi.put(cdata, editData?.id))
            if(success) {
                reset()
                refreshDatas()
                handleModal()
            } else {
                /** Алдааны мессэжийг input дээр харуулна */
                for (let key in errors) {
                    console.log(errors)
                    setError(key, { type: 'custom', message:  errors[key][0]});
                }
            }
        } else {
            const { success, errors } = await postFetch(elseltApi.post(cdata))
            if(success) {
                reset()
                refreshDatas()
                handleModal()
            } else {
                /** Алдааны мессэжийг input дээр харуулна */
                for (let key in errors) {
                    console.log(errors)
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
                }
            }

        },
        [editData]
    )

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
                            <Label className="form-label" for="degree">
                                {t('Боловсролын зэрэг')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id="degree"
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
                                            value={value && degreeOption.find((c) => c.id === value)}
                                            noOptionsMessage={() => t('Хоосон байна')}
                                            onChange={(val) => {
                                                onChange(val?.id || '')
                                            }}
                                            styles={ReactSelectStyles}
                                            getOptionValue={(option) => option.id}
                                            getOptionLabel={(option) => option.degree_name}
                                        />
                                    )
                                }}
                            />
                            {errors.degree && <FormFeedback className='d-block'>{errors.degree.message}</FormFeedback>}
                        </Col>
                        <Col md={6}>
                            <Label className="form-label" for="begin_date">
                                {t('Эхлэх хугацаа')}
                            </Label>
                            <Controller
                                defaultValue={new Date()}
                                control={control}
                                name='begin_date'
                                className="form-control"
                                render={({ field: { value, onChange} }) => {
                                    return (
                                        <Flatpickr
                                            id='begin_date'
                                            className='form-control'
                                            onChange={dates => {
                                                onChange(formatDate(dates[0]));
                                            }}
                                            value={formatDate(value)}
                                            style={{height: "30px"}}
                                            options={{
                                                dateFormat: 'Y-m-d',
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
                                defaultValue={new Date()}
                                control={control}
                                name='end_date'
                                className="form-control"
                                render={({ field: { value, onChange} }) => {
                                    return (
                                        <Flatpickr
                                            id='end_date'
                                            className='form-control'
                                            onChange={dates => {
                                                onChange(formatDate(dates[0]));
                                            }}
                                            value={formatDate(value)}
                                            style={{height: "30px"}}
                                            options={{
                                                dateFormat: 'Y-m-d',
                                                utc: true,
                                                minDate: getValues("begin_date"),
                                            }}
                                        />
                                    )
                                }}
                            />
                            {errors.start_date && <FormFeedback className='d-block'>{t(errors.start_date.message)}</FormFeedback>}
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
export default EditModal;