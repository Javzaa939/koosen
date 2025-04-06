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

	const [onlineInfos, setOnlineInfos] = useState(getValues(`${parentName}.quezChoices`)?.length || 0);

	function addOnlineInfos() {
		setOnlineInfos((current) => current + 1)
	}

	return (
		<Row>
			<Col md={12} style={{ overflow: 'auto' }}>
				<Accordion open={open} toggle={toggle}>{/*console.log(onlineInfos)*/}
					{
						new Array(onlineInfos).fill(null).map((onlineInfos_item, onlineInfos_ind) => {
						const inputNameElement = `${parentName}.quezChoices.${onlineInfos_ind}`
						const inputName = `${inputNameElement}.choices`

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
								choices
							</AccordionBody>
						</AccordionItem>
					})}
				</Accordion>
			</Col>
			<Col md={12}>
				<Button color="primary" size='sm' onClick={addOnlineInfos}>
					{t('Хариулт нэмэх')}
				</Button>
			</Col>
		</Row>
	)
}