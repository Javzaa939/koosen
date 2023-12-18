import { t } from "i18next"
import React, { Fragment, useState, useEffect } from 'react'

import { useForm, Controller } from "react-hook-form";

import { validate } from "@utils"
import {
    Row,
    Col,
	Form,
    Input,
	Label,
    Button,
    FormFeedback
} from "reactstrap";

import { ChevronLeft, ChevronRight, X } from "react-feather"

import Flatpickr from 'react-flatpickr'

// flatpickr style
import '@styles/react/libs/flatpickr/flatpickr.scss'

import * as Yup from 'yup'

import "../style.css"

const validateSchema = Yup.object().shape({
	title: Yup.string()
        .trim()
        .required('Хоосон байна.'),
    description: Yup.string()
        .trim()
        .required('Хоосон байна.'),
})

const MainInfo = ({ stepper, setSubmitDatas, data, editData }) => {

    const { control, handleSubmit, setError, clearErrors, setValue, formState: { errors } } = useForm(validate(validateSchema));

    const [endPicker, setEndPicker] = useState(null)
	const [startPicker, setStartPicker] = useState(null)

    function handlePreButton(){
        stepper.previous()
    }

	const onSubmit = (cdatas) => {

		cdatas['start_date'] = new Date(startPicker).toISOString()
        cdatas['end_date'] = new Date(endPicker).toISOString()
		setSubmitDatas({ ...data, ...cdatas})
        stepper.next()
	}

    const handleEndDate = (date) => {
		var end_date = new Date(date)

		if (!startPicker) {
			setError('start_date', {type: 'custom ', message:'Хоосон байна'})
		} else {
			if (end_date < startPicker) {
				setError('end_date', {type: 'custom ', message:'Эхлэх хугацаанаас өмнө байх боломжгүй'})
			} else {
				setEndPicker(end_date)
				clearErrors('start_date')
				clearErrors('end_date')
			}
		}
	}

    useEffect(
        () =>
        {
            if ( Object.keys(editData).length > 0) {

				for(let key in editData) {


					if(key === 'start_date') setStartPicker(new Date(editData[key]))
					if(key === 'end_date') setEndPicker(new Date(editData[key]))

					if(editData[key] !== null )
						setValue(key, editData[key])
					else setValue(key, '')
				}
            }
        },
        [editData]
    )

   return (
        <Fragment>
            <Row tag={Form} onSubmit={handleSubmit(onSubmit)}>
                <Row>
                    <Col md={6}>
                        <Label className="form-label" for="title">
                            {t('Судалгааны нэр')}
                        </Label>
                        <Controller
                            defaultValue={''}
                            control={control}
                            id="title"
                            name="title"
                            render={({ field }) => (
                                <Input
                                    type='text'
                                    name='title'
                                    id='title'
                                    bsSize='sm'
                                    {...field}
                                    placeholder={t('Нэр')}
                                    invalid={errors.title && true}
                                />
                            )}
                        />
                        {errors.title && <FormFeedback className='d-block'>{t(errors.title.message)}</FormFeedback>}
                    </Col>
                    <Col md={6}>
                        <Label className="form-label" for="description">
                            {t('Тайлбар')}
                        </Label>
                        <Controller
                            defaultValue={''}
                            control={control}
                            id="description"
                            name="description"
                            render={({ field }) => (
                                <Input
                                    type='textarea'
                                    name='description'
                                    id='description'
                                    bsSize='sm'
                                    {...field}
                                    rows="4"
                                    placeholder={t('Тайлбар')}
                                    invalid={errors.description && true}
                                />
                            )}
                        />
                        {errors.description && <FormFeedback className='d-block'>{t(errors.description.message)}</FormFeedback>}
                    </Col>
                    <Col md={6}>
                        <Label className="form-label" for="start_date">
                            {t('Эхлэх хугацаа')}
                        </Label>
                        <Flatpickr
                            required
                            id='start_date'
                            name='start_date'
                            className={'form-control'}
                            onChange={date => {setStartPicker(date[0]), clearErrors('start_date')}}
                            value={startPicker}
                            style={{height: "30px"}}
                            options={{
                                enableTime: true,
                                dateFormat: 'Y-m-d H:i',
                            }}
                        />
                        {errors.start_date && <FormFeedback className='d-block'>{t(errors.start_date.message)}</FormFeedback>}
                    </Col>
                    <Col md={6}>
                        <Label className="form-label" for="end_date">
                            {t('Дуусах хугацаа')}
                        </Label>
                        <Flatpickr
                            required
                            id='end_date'
                            name='end_date'
                            className='form-control'
                            onChange={date => handleEndDate(date[0])}
                            value={endPicker}
                            style={{height: "30px"}}
                            options={{
                                enableTime: true,
                                dateFormat: 'Y-m-d H:i',
                            }}
                        />
                        {errors.end_date && <FormFeedback className='d-block'>{t(errors.end_date.message)}</FormFeedback>}
                    </Col>
                    <Col md={6} sm={12} className='mt-1'>
                        <div>
                            <Controller
                                control={control}
                                id="is_required"
                                name="is_required"
                                defaultValue={false}
                                render={({ field }) => (
                                    <Input
                                        id="is_required"
                                        checked={field.value}
                                        type="checkbox"
                                        className='me-50'
                                        {...field}
                                    />
                                )}
                            />
                            <Label className="form-label" for="is_required">
                                {t('Заавал бөглөх эсэх')}
                            </Label>
                        </div>
                        <div>
                            <Controller
                                control={control}
                                id="is_hide_employees"
                                name="is_hide_employees"
                                defaultValue={false}
                                render={({ field }) => (
                                    <Input
                                        id="is_hide_employees"
                                        type="checkbox"
                                        checked={field.value}
                                        className='me-50'
                                        {...field}
                                     />
                                )}
                            />
                            <Label className="form-label" htmlFor="is_hide_employees">
                                {t('Нэр нуух эсэх')}
                            </Label>
                        </div>
                    </Col>
                </Row>
                <Col md={12} className="text-center mt-2">
                    <div className='d-flex justify-content-between mt-3'>
                        <Button color='secondary' className='btn-prev' outline onClick={handlePreButton}>
                            <ChevronLeft size={14} className='align-middle me-sm-25 me-0'></ChevronLeft>
                            <span className='align-middle d-sm-inline-block d-none'>Өмнөх</span>
                        </Button>
                        <Button color='primary' className='btn-next' type="submit">
                            <span className='align-middle d-sm-inline-block d-none'>Дараах</span>
                            <ChevronRight size={14} className='align-middle ms-sm-25 ms-0'></ChevronRight>
                        </Button>
                    </div>
                </Col>
            </Row>
        </Fragment>
    )
                                    }
export default MainInfo;


