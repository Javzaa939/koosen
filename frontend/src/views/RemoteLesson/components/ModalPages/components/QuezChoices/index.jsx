import React, { Fragment, useState, useEffect } from 'react'

import { X } from 'react-feather'

import { Controller, useForm } from 'react-hook-form'

import { Modal, Row, Col, Label, ModalHeader, ModalBody, Form, Input, Button, FormFeedback, Spinner, Accordion, AccordionItem, AccordionHeader, AccordionBody } from 'reactstrap'

import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';

import Select from 'react-select'

import { useTranslation } from 'react-i18next'
import classnames from 'classnames'

import { convertDefaultValue, validate, ReactSelectStyles, get_day } from '@utils'

import { validateSchema } from '../../../../validateSchema';
import empty from "@src/assets/images/empty-image.jpg"


export default function QuezChoices({
	t,
	control,
	errors,
	isLoading,
	lesson_option,
	setSelectValue,
	teacher_option,
	selectedTeachers,
	onChangeFile,
	handleModalPage,
	parentName,
	getValues,
}) {
	const inputNameElementPrefix = `${parentName}.quezChoices
`
	// #region accordion
	const [open, setOpen] = useState('1');
	const toggle = (id) => open === id ? setOpen() : setOpen(id)
	// #endregion

	// #region items
	const [onlineInfos, setOnlineInfos] = useState(getValues(`${parentName}.quezChoices`)?.length || 0);

	function addOnlineInfos() {
		setOnlineInfos((current) => current + 1)
	}
	// #endregion

	// #region to save file
	const [image_old, setImageOld] = useState({})
	const image_prefix = 'file_'

	const clickLogoImage = (index) => {
		const inputNameImage = `${inputNameElementPrefix}.${index}.image`
		var logoInput = document.getElementById(inputNameImage)
		logoInput.click()
	}

	function handleImageOld(base64File, index) {
		setImageOld((current) => {
			const newState = { ...current }
			newState[`${image_prefix}${index}`] = base64File
			return newState
		})
	}
	// #endregion

	return (
		<Row>
			<Col md={12} style={{ overflow: 'auto' }}>
				<Accordion open={open} toggle={toggle}>{/*console.log(onlineInfos)*/}
					{
						new Array(onlineInfos).fill(null).map((onlineInfos_item, onlineInfos_ind) => {
							const inputNameElement = `${inputNameElementPrefix}.${onlineInfos_ind}`
							const inputName = `${inputNameElement}.choices`
							const inputNameImage = `${inputNameElement}.image`
							const selectedImage = image_old[`${image_prefix}${onlineInfos_ind}`]

							return <AccordionItem key={onlineInfos_ind}>
								<AccordionHeader targetId={`accordionId_${onlineInfos_ind}`}>
									<Controller
										defaultValue=''
										control={control}
										name={inputName}
										render={({ field }) => (
											<Input
												{...field}
												type='text'
												id={field.name}
												bsSize='sm'
												placeholder={t('Сонголт')}
												invalid={errors[field.name] && true}
											/>
										)}
									/>
									{errors[inputName] && <FormFeedback className='d-block'>{t(errors[inputName].message)}</FormFeedback>}
								</AccordionHeader>
								<AccordionBody accordionId={`accordionId_${onlineInfos_ind}`}>
									<div className='row mt-1'>
										<Label for={inputNameImage}>{t('Зураг')}</Label>
										<div className="d-flex custom-flex">
											<div className="me-2">
												<div className='d-flex justify-content-end'>
													<X size={15} color='red' onClick={() => { handleImageOld('', onlineInfos_ind) }}></X>
												</div>
												<div className="orgLogoDiv image-responsive">
													<img className="image-responsive w-100" src={selectedImage ? selectedImage : empty} onClick={() => { clickLogoImage(onlineInfos_ind) }} />
													<Controller
														defaultValue=''
														control={control}
														name={inputNameImage}
														render={({ field }) => (
															<input
																accept="image/*"
																type="file"
																id={field.name}
																name={field.name}
																className="form-control d-none image-responsive"
																onChange={(e) => {
																	field.onChange(e.target.files)
																	onChangeFile(e, (base64File) => handleImageOld(base64File, onlineInfos_ind))
																}}
															/>
														)}
													/>
												</div>
											</div>
										</div>
									</div>
								</AccordionBody>
							</AccordionItem>
						})}
				</Accordion>
			</Col>
			<Col md={12}>
				<Button color="primary" size='sm' className="mt-2" onClick={addOnlineInfos}>
					{t('Хариулт нэмэх')}
				</Button>
			</Col>
		</Row>
	)
}