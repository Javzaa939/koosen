import React, { Fragment, useState, useEffect, useContext} from 'react'

import { useForm, Controller } from "react-hook-form";

import {
    Row,
    Col,
	Form,
	Modal,
	Input,
	Label,
	Button,
	ModalBody,
	ModalHeader,
    FormFeedback,
    Spinner
} from "reactstrap";

import { t } from 'i18next';
import Select from 'react-select'
import classnames from 'classnames';
import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';
import AuthContext from "@context/AuthContext"
import SchoolContext from "@context/SchoolContext"
import ActiveYearContext from "@context/ActiveYearContext"
import { X } from 'react-feather'

import { validateSchema } from './validateSchema';
import { convertDefaultValue, validate, ReactSelectStyles } from "@utils"

import Flatpickr from 'react-flatpickr'
// flatpickr style
import '@styles/react/libs/flatpickr/flatpickr.scss'
// import { Mongolian } from "flatpickr/dist/l10n/mn.js"

import moment from 'moment'

const UpdateModal = ({ open, handleModal, editId, refreshDatas }) => {

    const { fetchData , isLoading} = useLoader({})

    const { control, handleSubmit, reset, setValue, clearErrors, setError, formState: { errors } } = useForm(validate(validateSchema));
    const [select_student, setStudentOption] = useState([])
    const [endPicker, setEndPicker] = useState()
	const [startPicker, setStartPicker] = useState()

    const [student_id , setStudentId] = useState('')

    const { user } = useContext(AuthContext)
    const { cseason_id, cyear_name } = useContext(ActiveYearContext)

    // Api
    const permissionsStudentApi = useApi().role.student

    async function getDatas() {
        if(editId) {
            const { success, data } = await fetchData(permissionsStudentApi.getOne(editId))
            if(success) {
                // засах үед дата байх юм бол setValue-р дамжуулан утгыг харуулна
                if(data === null) return
                for(let key in data) {
                    if(data[key] !== null)
                        setValue(key, data[key])
                    else setValue(key, '')

                    if (key === "student"){
                        setValue(key, data[key]?.id)

                    }
                    if(key === 'start_date'){
                        setStartPicker(data[key])
                    }

                    if(key === 'finish_date') {
                        setEndPicker(data[key])
                    }

                }
            }
        }
    }

    // Багшийн жагсаалт
    async function getStudentOption() {
        const { success, data } = await fetchData(permissionsStudentApi.getStudent(student_id))
        if(success) {
            setStudentOption(data)
        }
    }


    useEffect(() => {
        getDatas()
    },[open])

    useEffect(() => {
        getStudentOption()
    },[student_id])

    async function onSubmit(cdata) {
            cdata['created_user'] = user.id
            cdata['updated_user'] = user.id
            cdata['lesson_season']= cseason_id
            cdata['lesson_year']= cyear_name
            cdata['start_date']= moment(startPicker).format('YYYY-MM-DD HH:mm:ss')
            cdata['finish_date']= moment(endPicker).format('YYYY-MM-DD HH:mm:ss')

            cdata = convertDefaultValue(cdata)


            const { success, error } = await fetchData(permissionsStudentApi.put(cdata, editId))
            if(success) {
                reset()
                refreshDatas()
                handleModal()
            }
            else {
                /** Алдааны мессэжийг input дээр харуулна */
                for (let key in error) {
                    setError(error[key].field, { type: 'custom', message:  error[key].msg});
                }
            }
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
	return (
        <Fragment>
            <Modal isOpen={open} toggle={handleModal} className="modal-dialog-centered modal-sm" onClosed={handleModal}>
                {isLoading && <div className='suspense-loader'><Spinner size='xl'/></div>}
                <ModalHeader
                className='bg-transparent pb-0'
                >
                </ModalHeader>
                <ModalBody className="px-sm-3 pt-30 pb-3">
                    <div className='text-center'>
                        <h4>{t('Оюутны хичээл сонголтыг төлбөрөөс хамааралгүйгээр хийх эрх')}</h4>
                    </div>
                        <Row tag={Form} className="gy-1" onSubmit={handleSubmit(onSubmit)}>
                         <Col sm={12}>
                            <Label className='form-label' for='student'>
                                {t('Оюутан')}
                            </Label>
                            <Controller
                                control={control}
                                defaultValue=''
                                name="student"
                                render={({ field: { value, onChange } }) => {
                                    return (
                                        <Select
                                            name="student"
                                            id="student"
                                            classNamePrefix='select'
                                            isClearable
                                            className={classnames('react-select', {'is-invalid': errors.student})}
                                            isLoading={isLoading}
                                            placeholder={t('-- Сонгоно уу --')}
                                            options={select_student || []}
                                            value={select_student && select_student.length > 0 && select_student.find((c) => c.id === value)}
                                            isDisabled={true}
                                            readOnly={true}
                                            noOptionsMessage={() => t('Хоосон байна')}
                                            onChange={(val) => {
                                                onChange(val?.id || '')
                                                setStudentId(val?.id || '')
                                            }}
                                            styles={ReactSelectStyles}
                                            getOptionValue={(option) => option.id}
                                            getOptionLabel={(option) => option.full_name}
                                        />
                                    )
                                }}
                            />
                            {errors.student && <FormFeedback className='d-block'>{t(errors.student.message)}</FormFeedback>}
                        </Col>
                        <Col xl={12}>
                            <Label className='form-label' for='description'>
                                {t('Тайлбар')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                name='description'
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        type='textarea'
                                        name='description'
                                        id='description'
                                        bsSize='sm'
                                        invalid={errors.description && true}
                                    />
                                )}
                            />
                            {errors.description && <FormFeedback className='d-block'>{t(errors.description.message)}</FormFeedback>}
                        </Col>
                        <Col xl={12}>
                            <Label className='form-label' for='start_date'>
                                {t('Эхлэх хугацаа')}
                            </Label>
                                <Flatpickr
                                    id='start_date'
                                    className={`form-control`}
                                    formTarget='start_date'
                                    onChange={date => {
                                        setStartPicker(date[0]);
                                    }}
                                    value={startPicker}
                                    style={{ height: "30px" }}
                                    options={{
                                        enableTime: true,
                                        dateFormat: 'Y-m-d H:i',
                                        time_24hr: true,
                                        defaultDate: "2023-8-10 14:30",
                                        allowInput: true,
                                        // locale: Mongolian
                                    }}
                                />
                            {errors.start_date && <FormFeedback className='d-block'>{t(errors.start_date.message)}</FormFeedback>}
                        </Col>
                        <Col xl={12}>
                            <Label className='form-label' for='finish_date'>
                                {t('Дуусах хугацаа')}
                            </Label>
                                    <Flatpickr
                                        id='finish_date'
                                        className={`form-control`}
                                        formTarget='finish_date'
                                        onChange={date => {
                                            handleEndDate(date[0]);
                                        }}
                                        value={endPicker}
                                        style={{ height: "30px" }}
                                        options={{
                                            enableTime: true,
                                            dateFormat: 'Y-m-d H:i',
                                            minDate: startPicker,
                                            time_24hr: true,
                                            defaultDate: "2023-8-10 15:30",
                                            allowInput: true,
                                            // locale: Mongolian
                                        }}
                                    />
                            {errors.finish_date && <FormFeedback className='d-block'>{t(errors.finish_date.message)}</FormFeedback>}
                        </Col>
                            <Col md={12} className="text-center mt-2">
                                <Button className="me-2" color="primary" type="submit">
                                    {t('Хадгалах')}
                                </Button>
                                <Button color="secondary" type="reset" outline onClick={handleModal}>
                                    {t('Буцах')}
                                </Button>
                            </Col>
                        </Row>
                </ModalBody>
            </Modal>
        </Fragment>
	);
};

export default UpdateModal;
