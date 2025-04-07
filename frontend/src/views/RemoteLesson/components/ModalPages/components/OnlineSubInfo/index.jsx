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
import QuezQuestions from '../QuezQuestions';


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
	handleModalPage,
	parentName,
	getValues
}) {
	// #region accordion
	const [open, setOpen] = useState('1');
	const toggle = (id) => open === id ? setOpen() : setOpen(id)
	// #endregion

	// #region items
	const [onlineInfos, setOnlineInfos] = useState(getValues(`${parentName}.onlineSubInfo`)?.length || 0);

	function addOnlineInfos() {
		setOnlineInfos((current) => current + 1)
	}
	// #endregion

	const fileTypeOptions = [
		{ id: 1, name: "PDF" },
		{ id: 2, name: "Video хичээл" },
		{ id: 3, name: "TEXT" },
		{ id: 5, name: "Шалгалт" },
	]

	return (
		<Row>
			<Col md={12} style={{ overflow: 'auto' }}>
				<Accordion open={open} toggle={toggle}>{/*console.log(onlineInfos)*/}
					{
						new Array(onlineInfos).fill(null).map((onlineInfos_item, onlineInfos_ind) => {
							const inputNameElement = `${parentName}.onlineSubInfo.${onlineInfos_ind}`
							const inputName = `${inputNameElement}.title`
							const inputNameFileType = `${inputNameElement}.file_type`

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
												placeholder={t('Хичээлийн нэр гарчиг')}
												invalid={errors[field.name] && true}
											/>
										)}
									/>
									{errors[inputName] && <FormFeedback className='d-block'>{t(errors[inputName].message)}</FormFeedback>}
								</AccordionHeader>
								<AccordionBody accordionId={`accordionId_${onlineInfos_ind}`}>
									<Row>
										<Col md={6}>
											<Label className="form-label" for={inputNameFileType}>
												{t('Материалын төрөл')}
											</Label>
											<Controller
												control={control}
												defaultValue=''
												name={inputNameFileType}
												render={({ field }) => {
													return (
														<Select
															name={field.name}
															id={field.name}
															classNamePrefix='select'
															isClearable
															className={classnames('react-select', { 'is-invalid': errors[field.name] })}
															isLoading={isLoading}
															placeholder={t('-- Сонгоно уу --')}
															options={fileTypeOptions || []}
															value={field.value && fileTypeOptions.find((c) => c.id === field.value)}
															noOptionsMessage={() => t('Хоосон байна.')}
															onChange={(val) => {
																field.onChange(val?.id || '')
															}}
															styles={ReactSelectStyles}
															getOptionValue={(option) => option.id}
															getOptionLabel={(option) => option.name}
														/>
													)
												}}
											></Controller>
											{errors[inputNameFileType] && <FormFeedback className='d-block'>{t(errors[inputNameFileType].message)}</FormFeedback>}
										</Col>
									</Row>
									<QuezQuestions
										t={t}
										control={control}
										errors={errors}
										isLoading={isLoading}
										lesson_option={lesson_option}
										setSelectValue={setSelectValue}
										teacher_option={teacher_option}
										selectedTeachers={selectedTeachers}
										handleDeleteImage={handleDeleteImage}
										image_old={image_old}
										clickLogoImage={clickLogoImage}
										onChange={onChange}
										handleModalPage={handleModalPage}
										parentName={inputNameElement}
										getValues={getValues}
									/>
								</AccordionBody>
							</AccordionItem>
						})}
				</Accordion>
			</Col>
			<Col md={12}>
				<Button color="primary" size='sm' className="mt-2" onClick={addOnlineInfos}>
					{t('Хэсэг нэмэх')}
				</Button>
			</Col>
		</Row>
	)
}