import React, { Fragment, useState, useEffect } from 'react'

import { X } from 'react-feather'

import { Controller, useForm } from 'react-hook-form'

import { Modal, Row, Col, Label, ModalHeader, ModalBody, Form, Input, Button, FormFeedback, Spinner } from 'reactstrap'

import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';

import Select from 'react-select'

import { useTranslation } from 'react-i18next'
import classnames from 'classnames'

import { convertDefaultValue, validate, ReactSelectStyles, get_day } from '@utils'

import { validateSchema } from '../../../../validateSchema';
import empty from "@src/assets/images/empty-image.jpg"


export default function OnlineSubInfo({
	t,
	control,
	errors,
	isLoading,
	lesson_option,
	setSelectValue,
	teacher_option,
	selectedTeachers,
	handleDeleteImage,
	image_old,
	clickLogoImage,
	onChange,
	handleNextModalPage
}) {
	return (
		<Row>
			<Col md={6}>
				<Label className="form-label" for="lesson">
					{t('Хичээл')}
				</Label>
				<Controller
					control={control}
					defaultValue=''
					name="lesson"
					render={({ field: { value, onChange } }) => {
						return (
							<Select
								name="lesson"
								id="lesson"
								classNamePrefix='select'
								isClearable
								className={classnames('react-select', { 'is-invalid': errors.lesson })}
								isLoading={isLoading}
								placeholder={t('-- Сонгоно уу --')}
								options={lesson_option || []}
								value={value && lesson_option.find((c) => c.id === value)}
								noOptionsMessage={() => t('Хоосон байна.')}
								onChange={(val) => {
									onChange(val?.id || '')
									setSelectValue({
										lesson: val?.id || '',
									})
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
			<Col md={6}>
				<Label className="form-label" for="teacher">
					{t('Хянах багш')}
				</Label>
				<Controller
					control={control}
					defaultValue=''
					name="teacher"
					render={({ field: { value, onChange } }) => {
						return (
							<Select
								name="teacher"
								id="teacher"
								classNamePrefix='select'
								isClearable
								// isMulti
								className={classnames('react-select', { 'is-invalid': errors.teacher })}
								isLoading={isLoading}
								placeholder={t('-- Сонгоно уу --')}
								options={teacher_option || []}
								value={selectedTeachers}
								noOptionsMessage={() => t('Хоосон байна.')}
								onChange={(val) => {
									onChange(val?.id || '')
								}}
								styles={ReactSelectStyles}
								getOptionValue={(option) => option.id}
								getOptionLabel={(option) => option.last_name + '.' + option?.first_name}
							/>
						)
					}}
				></Controller>
				{errors.teacher && <FormFeedback className='d-block'>{t(errors.teacher.message)}</FormFeedback>}
			</Col>
			<Col md={12}>
				<Label className='form-label' for='title'>
					{t('Сургалтын нэр')}
				</Label>
				<Controller
					defaultValue=''
					control={control}
					id='title'
					name='title'
					render={({ field }) => (
						<Input
							{...field}
							type='text'
							name='title'
							id='title'
							bsSize='sm'
							placeholder={t('Сургалтын нэр')}
							invalid={errors.name && true}
						/>
					)}
				/>
				{errors.title && <FormFeedback className='d-block'>{t(errors.title.message)}</FormFeedback>}
			</Col>
			<Col md={12}>
				<Controller
					defaultValue={false}
					control={control}
					id='is_end_exam'
					name='is_end_exam'
					render={({ field }) => {
						return (
							<Input
								{...field}
								checked={field.value}
								className='me-50'
								type='checkbox'
								name='is_end_exam'
								id='is_end_exam'
							/>
						)
					}}
				/>
				<Label className='form-label' for='is_end_exam'>
					{t('Төгсөлтийн шалгалттай эсэх')}
				</Label>
			</Col>
			<Col md={12}>
				<Controller
					defaultValue={false}
					control={control}
					id='is_certificate'
					name='is_certificate'
					render={({ field }) => {
						return (
							<Input
								{...field}
								checked={field.value}
								className='me-50'
								type='checkbox'
								name='is_certificate'
								id='is_certificate'
							/>
						)
					}}
				/>
				<Label className='form-label' for='is_certificate'>
					{t('Сертификат олгох эсэх')}
				</Label>
			</Col>
			<Col md={6}>
				<Label className="form-label" for="start_date">
					{t('Хичээл эхлэх хугацаа')}
				</Label>
				<Controller
					defaultValue=''
					control={control}
					id="start_date"
					name="start_date"
					render={({ field }) => (
						<Input
							{...field}
							id="start_date"
							bsSize="sm"
							placeholder={t('Хичээл эхлэх хугацаа')}
							type="date"
							invalid={errors.start_date && true}
						/>
					)}
				/>
				{errors.start_date && <FormFeedback className='d-block'>{t(errors.start_date.message)}</FormFeedback>}
			</Col>
			<Col md={6}>
				<Label className="form-label" for="end_date">
					{t('Хичээл дуусах хугацаа')}
				</Label>
				<Controller
					defaultValue=''
					control={control}
					id="end_date"
					name="end_date"
					render={({ field }) => (
						<Input
							{...field}
							id="end_date"
							bsSize="sm"
							placeholder={t('Хичээл дуусах хугацаа')}
							type="date"
							invalid={errors.end_date && true}
						/>
					)}
				/>
				{errors.end_date && <FormFeedback className='d-block'>{t(errors.end_date.message)}</FormFeedback>}
			</Col>
			<Col md={12} className="mt-50">
				<div className='row mt-1'>
					<Label for='image'>Зураг</Label>
					<div className="d-flex custom-flex">
						<div className="me-2">
							<div className='d-flex justify-content-end'>
								<X size={15} color='red' onClick={() => { handleDeleteImage(image_old) }}></X>
							</div>
							<div className="orgLogoDiv image-responsive">
								<img id={`logoImg${image_old}`} className="image-responsive w-100" src={image_old ? image_old : empty} onClick={() => { clickLogoImage() }} />
								<input
									accept="image/*"
									type="file"
									// disabled={is_valid}
									id={`image`}
									name="image"
									className="form-control d-none image-responsive"
									onChange={(e) => onChange(e)}
								/>
							</div>
						</div>
					</div>
				</div>
			</Col>
			{/* <Col md={12}>
				<Label className='form-label' for="description">
					{t('Тайлбар')}
				</Label>
				<Controller
					defaultValue=''
					control={control}
					id='description'
					name='description'
					render={({ field }) => (
						<Input
							{...field}
							type='textarea'
							name='description'
							id='description'
							placeholder={t('Тайлбар')}
							bsSize='sm'
							rows='4'
							invalid={errors.description && true}
						/>
					)}
				/>
				{errors.description && <FormFeedback className='d-block'>{t(errors.description.message)}</FormFeedback>}
			</Col> */}
			<Col md={12} className="mt-50">
				<Button color="primary" size='sm' className="mt-2" onClick={() => handleNextModalPage(null)}>
					{t('Бүлэг нэмэх')}
				</Button>
			</Col>
		</Row>
	)
}