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

import empty from "@src/assets/images/empty-image.jpg"
import Elearn from './components/Elearn';
import OnlineInfo from './components/OnlineInfo';
import OnlineSubInfo from './components/OnlineSubInfo';
import QuezQuestions from './components/QuezQuestions';


export default function ModalPages({
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
	handleNextModalPage,
	modalPage
}) {
	return (
		<>
			{
			modalPage === 1
				?
				<Elearn
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
					handleNextModalPage={handleNextModalPage}
				/>
				:
				modalPage === 2
				?
				<OnlineInfo
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
					handleNextModalPage={handleNextModalPage}
				/>
				:
				modalPage === 3
				?
				<OnlineSubInfo
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
					handleNextModalPage={handleNextModalPage}
				/>
				:
				modalPage === 4
				?
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
					handleNextModalPage={handleNextModalPage}
				/>
				:
				<></>
			}
		</>
	)
}