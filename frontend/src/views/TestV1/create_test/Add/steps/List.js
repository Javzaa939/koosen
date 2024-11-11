// ** React Imports
import { Fragment, useEffect, useState } from 'react'

import { ChevronLeft, ChevronRight, X } from 'react-feather'

import { Label, Input, Row, Col, Button, FormFeedback, Form  } from 'reactstrap'

import { useTranslation } from 'react-i18next'

import { Controller, useForm } from "react-hook-form"

import Select from 'react-select'

import classnames from "classnames"

import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';

import Flatpickr from 'react-flatpickr'

import * as Yup from 'yup'

// flatpickr style
import '@styles/react/libs/flatpickr/flatpickr.scss'

import { validate, ReactSelectStyles, assess_type, get_week, challenge_types } from "@utils"

const KIND_GROUP = 2
const KIND_STUDENT = 3

const validateSchema = Yup.object().shape({
    lesson: Yup.string().required("Хоосон байна"),
	title: Yup.string().required("Хоосон байна"),
	duration: Yup.string().required("Хоосон байна"),
	assess: Yup.string().required("Хоосон байна"),
})

const Lists = ({ stepper, setSubmitDatas, setSelectedLesson, selectedLesson, editData, setSelectedQuestionDatas, setEditRowData, isEdit }) => {

    const { t } = useTranslation()
	const [scope, setScope] = useState('')
	const [challenge, setChallenge] = useState('')
	const [scopeName, setScopeName] = useState('')

	const [selectOption, setSelectOption] = useState([])
	const [selectedGroups, setSelectedGroups] = useState([])
	const [lessonOption, setLessonOption] = useState([])
	const [challengeOption, setChallengeDatas] = useState([]);

	// ** Hook
	const { control, handleSubmit, setValue, setError, clearErrors, formState: { errors } } = useForm(validate(validateSchema))

	const [endPicker, setEndPicker] = useState(null)
	const [startPicker, setStartPicker] = useState(null)

    // Loader
    const { Loader, isLoading, fetchData } = useLoader(false)

	// API
	const selectAPI = useApi().challenge
	const teacherLessonApi = useApi().study.lesson

	const handleScope = (e, name) => {
        var id = e.target.id
        setScope(id)

		setScopeName(name)
    }

	// Дараах товч дарахад
	const onSubmit = (cdatas) => {

		var selected_ids = []

		cdatas['start_date'] = new Date(startPicker).toISOString()
        cdatas['end_date'] = new Date(endPicker).toISOString()
        cdatas['scope'] = scope
		cdatas['scopeName'] = scopeName
		cdatas['lesson'] = selectedLesson

		if (selectedGroups) {
			selectedGroups.forEach(element => {
				if (element) selected_ids.push(element.id)
			})
		}

		cdatas['selected'] = selected_ids

		setSubmitDatas(cdatas)

		stepper.next()
	}

	async function getSelects() {
		const { success, data } = await fetchData(selectAPI.getSelect(scope, selectedLesson))
		if(success)
		{
			setSelectOption(data)
		}
	}

	// Multi select
	function groupSelect(data) {
        setSelectedGroups(data);
    }

	// Сонгогдсон утгаас устгах
	const handleDelete = (id) => {
		var cdatas = [...selectedGroups]
		var index = selectedGroups.findIndex(v => v.id === id)

		cdatas.splice(index, 1);

		setSelectedGroups(cdatas)
	}

	async function getLesson()
    {
        const { success, data } = await fetchData(teacherLessonApi.get('all'))
        if(success) {
            setLessonOption(data)
        }
    }

	async function getDatas() {
		const { success, data } = await fetchData(selectAPI.getAll());

		if (success) {
			setChallengeDatas(data);
		}
	}

	async function getOneDatas() {
		const { success, data } = await fetchData(selectAPI.getAll(challenge));

		if (success) {
			setEditRowData(data);
		}
	}


	useEffect(
		() =>
		{
			if (scope != 'all' && scope && selectedLesson) {
				getSelects()
			} else{
				setSelectedGroups([])
			}

		},
		[scope, selectedLesson]
	)

	useEffect(
        () =>
        {
            getLesson()
			getDatas()
        },
        []
    )

	useEffect(
        () =>
        {
            if ( Object.keys(editData).length > 0) {

				for(let key in editData) {
					if (key === 'kind') {
						if (editData[key] === KIND_STUDENT) {
							setSelectedGroups(editData['student'])
							setScope('student')
						}
						 else if (editData[key] === KIND_GROUP) {
							setSelectedGroups(editData['group'])
							setScope('group')
						} else {
							setScope('all')
						}
					}

					if (key === 'kind_name') {
						setScopeName(editData[key])
					}

					if(key === 'startAt') setStartPicker(new Date(editData[key]))
					if(key === 'endAt') setEndPicker(new Date(editData[key]))

					if(key === 'questions' && editData[key].length > 0) {
						setSelectedQuestionDatas([...editData[key]])
					}

					if(editData[key] !== null )
						setValue(key, editData[key])
					else setValue(key, '')

					if(key === 'lesson') {
						setSelectedLesson(editData[key].id)

						setValue('lesson', editData[key].id)
					}

				}
            }
        },
        [editData]
    )

	useEffect(
		() =>
		{
			if (challenge) {
				getOneDatas()
			}
		},
		[challenge]
	)

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

    return (
		<Fragment>
			<Row tag={Form} onSubmit={handleSubmit(onSubmit)}>
				<Row className=' mb-1'>
					<Col md={4} sm={12} className="">
						<Label className="form-label" for="before_challenge">
							{t('Шалгалтууд')}
						</Label>
						<Select
							id="before_challenge"
							name="before_challenge"
							isClearable
							classNamePrefix='select'
							isDisabled={isEdit ? true : false}
							className='react-select'
							placeholder={`-- Сонгоно уу --`}
							options={challengeOption || []}
							value={challengeOption.find((c) => c.id == challenge)}
							noOptionsMessage={() => 'Хоосон байна'}
							onChange={(val) => {
								setChallenge(val?.id || '')
							}}
							styles={ReactSelectStyles}
							getOptionValue={(option) => option.id}
							getOptionLabel={(option) => option.title}
						/>
					</Col>
					<Col md={4} sm={12} >
						<Label className="form-label" for="lesson">
							{('Хичээл')}
						</Label>
						<Controller
							control={control}
							defaultValue={''}
							name="lesson"
							render={({ field: { value, onChange} }) => {
							return (
								<Select
									id="lesson"
									name="lesson"
									isClearable
									placeholder={`-- Сонгоно уу --`}
									classNamePrefix='select'
									className={classnames('react-select', { 'is-invalid': errors.lesson })}
									options={lessonOption || []}
									value={lessonOption.find((c) => c.id === selectedLesson)}
									noOptionsMessage={() => 'Хоосон байна'}
									onChange={(val) => {
										onChange(val?.id || '')
										setSelectedLesson(val?.id || '')
									}}
									styles={ReactSelectStyles}
									getOptionValue={(option) => option.id}
									getOptionLabel={(option) => option.name}
								/>
								)
							}}
						/>
						{errors.lesson && <FormFeedback className='d-block'>{t(errors.lesson.message)}</FormFeedback>}
					</Col>
					<Col md={4} sm={12} >
						<Label className="form-label" for="challenge_type">
							{('Шалгалтын төрөл')}
						</Label>
						<Controller
							control={control}
							defaultValue={''}
							name="challenge_type"
							render={({ field: { value, onChange} }) => {
							return (
								<Select
									id="challenge_type"
									name="challenge_type"
									isClearable
									placeholder={`-- Сонгоно уу --`}
									classNamePrefix='select'
									className={classnames('react-select', { 'is-invalid': errors.challenge_type })}
									options={challenge_types() || []}
									value={challenge_types().find((c) => c.id === value)}
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
						/>
						{errors.challenge_type && <FormFeedback className='d-block'>{t(errors.challenge_type.message)}</FormFeedback>}
					</Col>
				</Row>
				<div className='added-cards mt-1'>
					<div className={classnames('cardMaster rounded border p-1')}>
						<div className='content-header'>
							<h5 className='content-header'>Хамрах хүрээгээ сонгоно уу</h5>
						</div>
						<Row className='custom-options-checkable gx-1'>
							<Col md={3}>
								<Input type='radio' id='all' name='plans' className='custom-option-item-check' onChange={(e) => handleScope(e, 'Хичээлийн хүрээнд')} checked={scope == 'all'}/>
								<Label for='all' className='custom-option-item text-center p-1'>
									<span className='fw-bolder'>Хичээлийн хүрээнд</span>
								</Label>
							</Col>
							<Col md={3}>
								<Input type='radio' id='group' name='plans' className='custom-option-item-check ' onChange={(e) => handleScope(e, 'Ангийн хүрээнд')} checked={scope == 'group'}/>
								<Label for='group' className='custom-option-item text-center p-1'>
									<span className='fw-bolder'>Ангийн хүрээнд</span>
								</Label>
							</Col>
							<Col md={3}>
								<Input type='radio' id='student' name='plans' className='custom-option-item-check' onChange={(e) => handleScope(e, 'Оюутны хүрээнд')} checked={scope == 'student'}/>
								<Label for='student' className='custom-option-item text-center p-1'>
									<span className='fw-bolder'>Оюутны хүрээнд</span>
								</Label>
							</Col>
						</Row>
						{
							scope !== 'all' &&
								<Row className='mt-1'>
									<Col md={6}>
										<Label className="form-label" for="select">
											{scope == 'group' ? 'Анги сонгох' : 'Оюутан сонгох'}
										</Label>
										<Controller
											control={control}
											defaultValue=''
											name="select"
											render={({ field }) => {
											return (
												<Select
													name="select"
													id="select"
													classNamePrefix='select'
													isClearable
													isDisabled={!scope}
													isMulti
													className={classnames('react-select', { 'is-invalid': errors.select })}
													isLoading={isLoading}
													options={selectOption}
													placeholder={t('-- Сонгоно уу --')}
													noOptionsMessage={() => t('Хоосон байна.')}
													value={selectedGroups}
													onChange={(val) => {
														groupSelect(val)
														// onChange(val?.id || '')
													}}
													styles={ReactSelectStyles}
													getOptionValue={(option) => option.id}
													getOptionLabel={(option) => option.full_name}
												/>
											)
											}}
										/>
										{errors.select && <FormFeedback className='d-block'>{t(errors.select.message)}</FormFeedback>}
									</Col>
									<Col md={6}>
										<Label className="form-label" for="datas">
											{t('Сонгогдсон утгууд')}
										</Label>
										<div className='added-cards'>
											<div className={classnames('cardMaster rounded border p-1')}>
											{selectedGroups &&
												selectedGroups.map((data, idx) =>
													<div className="d-flex justify-content-between align-items-center" key={idx}>
														<div className="d-flex align-items-center">
															<div className='d-flex justify-content-between'>
																<p className="fw-bold">{data.full_name}</p>
																<X size={15} color='red' className='ms-1' onClick={() => handleDelete(data?.id)}/>
															</div>
														</div>
													</div>
												)
											}
											</div>
										</div>
									</Col>
								</Row>
						}
					</div>
				</div>
				<div className='added-cards mt-1'>
					<div className={classnames('cardMaster rounded border p-1')}>
						<div className='content-header mt-1'>
							<h5 className='content-header mb-2'>Шалгалтын ерөнхий мэдээлэл</h5>
						</div>
						<Row>
							<Col md={6}>
								<Label className="form-label" for="title">
									{t('Шалгалтын нэр')}
								</Label>
								<Controller
									defaultValue={''}
									control={control}
									id="title"
									name="title"
									render={({ field }) => (
										<Input
											id ="title"
											bsSize="sm"
											{...field}
											placeholder="Шалгалтын нэр"
											type="text"
											invalid={errors.title && true}
										/>
									)}
								/>
								{errors.title && <FormFeedback className='d-block'>{t(errors.title.message)}</FormFeedback>}
							</Col>
							<Col md={6}>
								<Label className="form-label" for="duration">
									{t('Үргэлжлэх хугацаа (минутаар)')}
								</Label>
								<Controller
									defaultValue=''
									control={control}
									id="duration"
									name="duration"
									render={({ field }) => (
										<Input
											id ="duration"
											bsSize="sm"
											placeholder='Үргэлжлэх хугацаа'
											{...field}
											type="number"
											invalid={errors.duration && true}
										/>
									)}
								/>
								{errors.duration && <FormFeedback className='d-block'>{t(errors.duration.message)}</FormFeedback>}
							</Col>
						</Row>
						<Row className='mt-1'>
							<Col md={6}>
								<Label className="form-label" for="start_date">
									{t('Эхлэх хугацаа')}
								</Label>
								<Flatpickr
									required
									id='start_date'
									name='start_date'
									className='form-control'
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
						</Row>
						<Row>
							<Col md={6} sm={12}>
								<Label className="form-label mt-1" for="week">
									{'Долоо хоног'}
								</Label>
								<Controller
									defaultValue=''
									control={control}
									id="week"
									name="week"
									render={({ field: { value, onChange} }) => {
										return (
											<Select
												name="week"
												id="week"
												classNamePrefix='select'
												isClearable
												className={classnames('react-select', { 'is-invalid': errors.week })}
												isLoading={isLoading}
												options={get_week()}
												placeholder={t('-- Сонгоно уу --')}
												noOptionsMessage={() => t('Хоосон байна.')}
												value={get_week().find((c) => c.id == value)}
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
								{errors.week && <FormFeedback className='d-block'>{t(errors.week.message)}</FormFeedback>}
							</Col>
							<Col md={6} sm={12}>
								<Label className="form-label mt-1" for="assess">
									{'Үнэлэх арга'}
								</Label>
								<Controller
									defaultValue=''
									control={control}
									id="assess"
									name="assess"
									render={({ field: { value, onChange} }) => {
										return (
											<Select
												name="assess"
												id="assess"
												classNamePrefix='select'
												isClearable
												className={classnames('react-select', { 'is-invalid': errors.assess })}
												isLoading={isLoading}
												options={assess_type()}
												placeholder={t('-- Сонгоно уу --')}
												noOptionsMessage={() => t('Хоосон байна.')}
												value={assess_type().find((c) => c.id == value)}
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
								{errors.assess && <FormFeedback className='d-block'>{t(errors.assess.message)}</FormFeedback>}
							</Col>
						</Row>
						<Row className="d-flex justify-content-between mt-1">
							<Col md={6}>
								<Label className="form-label mt-1" for="description">
									{t('Тайлбар')}
								</Label>
								<Controller
									defaultValue=''
									control={control}
									id="description"
									name="description"
									render={({ field }) => (
										<Input
											id ="description"
											bsSize="sm"
											placeholder='Тайлбар'
											{...field}
											type="textarea"
											invalid={errors.description && true}
											/>
										)}
									/>
								{errors.description && <FormFeedback className='d-block'>{t(errors.description.message)}</FormFeedback>}
							</Col>
							<Col md={6} sm={12}>
								<Label className="form-label mt-1" for="try_number">
									{'Оролдлогын тоо'}
								</Label>
								<Controller
									defaultValue={1}
									control={control}
									id="try_number"
									name="try_number"
									render={({ field }) => (
										<Input
											{...field}
											id ="try_number"
											bsSize="sm"
											placeholder='Оролдлогын тоо'
											type="number"
											invalid={errors.try_number && true}
											/>
										)}
									/>
								{errors.try_number && <FormFeedback className='d-block'>{t(errors.try_number.message)}</FormFeedback>}
							</Col>
						</Row>
						<Col md={6} className='my-1'>
							<div className='d-flex align-items-end '>
								<Controller
									control={control}
									defaultValue={true}
									id="has_shuffle"
									name="has_shuffle"
									render={({ field }) => (
										<>
											<div className='form-switch'>
												<Input
													{...field}
													id="has_shuffle"
													type="switch"
													defaultChecked={field.value || true}
												/>
											</div>
											<Label className='form-check-label fw-bolder' for='has_shuffle'>
												Асуултуудыг холих эсэх
											</Label>
										</>
									)}
								/>
							</div>
						</Col>
						<Col md={6}>
							<div className='d-flex align-items-end '>
								<Controller
									control={control}
									defaultValue={true}
									id="has_choice_shuffle"
									name="has_choice_shuffle"
									render={({ field }) => (
										<>
											<div className='form-switch'>
												<Input
													id="has_choice_shuffle"
													type="switch"
													defaultChecked={field.value || true}
													{...field}
												/>
											</div>
											<Label className='form-check-label fw-bolder' for='has_choice_shuffle'>
												Сонголтуудыг холих эсэх
											</Label>
										</>
									)}
								/>
							</div>
						</Col>
					</div>
				</div>
				<div className='d-flex justify-content-between mt-3'>
					<Button color='secondary' className='btn-prev' outline onClick={() => stepper.previous()}>
						<ChevronLeft size={14} className='align-middle me-sm-25 me-0'></ChevronLeft>
						<span className='align-middle d-sm-inline-block d-none'>Өмнөх</span>
					</Button>
					<Button color='primary' className='btn-next' type="submit">
						<span className='align-middle d-sm-inline-block d-none'>Дараах</span>
						<ChevronRight size={14} className='align-middle ms-sm-25 ms-0'></ChevronRight>
					</Button>
				</div>
			</Row>
		</Fragment>
    )
}

export default Lists
