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


export default function ModalPages({
	t,
	control,
	errors,
	isLoading,
	lesson_option,
	teacher_option,
	onChangeFile,
	handleModalPage,
	modalPage,
	getValues,
}) {
	return (
		modalPage === 1
			?
			<Elearn
				t={t}
				control={control}
				errors={errors}
				isLoading={isLoading}
				lesson_option={lesson_option}
				teacher_option={teacher_option}
				onChangeFile={onChangeFile}
				handleModalPage={handleModalPage}
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
					teacher_option={teacher_option}
					onChangeFile={onChangeFile}
					handleModalPage={handleModalPage}
					getValues={getValues}
				/>
				:
				<></>
	)
}