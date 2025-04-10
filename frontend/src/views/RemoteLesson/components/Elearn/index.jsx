import { useState } from 'react';
import { X } from 'react-feather';
import { Controller } from 'react-hook-form';
import { Col, FormFeedback, Input, Label, Row } from 'reactstrap';

import empty from "@src/assets/images/empty-image.jpg";
import { onChangeFile } from '@src/views/RemoteLesson/utils';


export default function Elearn({
	t,
	control,
	errors,
}) {
	// #region to save file
	const [image_old, setImageOld] = useState('')

	const handleDeleteImage = () => {
		setImageOld('')
	}

	const clickLogoImage = () => {
		var logoInput = document.getElementById(`image`)
		logoInput.click()
	}
	// #endregion

	return (
		<Row>
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
			<Col md={6} className="mt-50">
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
			<Col md={6} className="mt-50">
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
			<Col md={6} className="mt-50">
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
			<Col md={6} className="mt-50">
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
				<Label for='image' className='d-block text-center'><span>{t('Зураг')}</span></Label>
				<Row>
					<Col className='d-flex justify-content-center'>
						<div>
							<div className='d-flex justify-content-end'>
								<X size={15} color='red' onClick={() => { handleDeleteImage(image_old) }}></X>
							</div>
							<div className="orgLogoDiv image-responsive">
								<img className="image-responsive w-100" src={image_old ? image_old : empty} onClick={() => { clickLogoImage() }} />
								<Controller
									defaultValue=''
									control={control}
									name={`image`}
									render={({ field }) => (
										<input
											accept="image/*"
											type="file"
											id={field.name}
											name={field.name}
											className="form-control d-none image-responsive"
											onChange={(e) => {
												field.onChange(e.target.files)
												onChangeFile(e, setImageOld)
											}
											}
										/>
									)}
								/>
							</div>
						</div>
					</Col>
				</Row>
			</Col>
		</Row>
	)
}