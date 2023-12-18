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
import ActiveYearContext from "@context/ActiveYearContext"
import { convertDefaultValue,validate, ReactSelectStyles, permission_type_option } from "@utils"
import { validateSchema } from '../Add/validateSchema';

import Flatpickr from 'react-flatpickr'
// flatpickr style
import '@styles/react/libs/flatpickr/flatpickr.scss'
// import { Mongolian } from "flatpickr/dist/l10n/mn.js"

import moment from 'moment'

const UpdateModal = ({ open, handleModal, editId, refreshDatas }) => {

    const { fetchData , isLoading} = useLoader({})

    const { control, handleSubmit, reset, setValue, setError, formState: { errors } } = useForm(validate(validateSchema));
    const [per_busad_option, setPerBusadOption] = useState(permission_type_option())

    const { user } = useContext(AuthContext)
    const { cseason_id, cyear_name } = useContext(ActiveYearContext)
    const [endPicker, setEndPicker] = useState()
	const [startPicker, setStartPicker] = useState()

    // Api
    const permissionBusadApi = useApi().role.other

    async function getDatas() {
        if(editId) {
            const { success, data } = await fetchData(permissionBusadApi.getOne(editId))
            if(success) {
                // засах үед дата байх юм бол setValue-р дамжуулан утгыг харуулна
                if(data === null) return
                for(let key in data) {
                    if(data[key] !== null)
                        setValue(key, data[key])
                    else setValue(key, '')

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

    useEffect(() => {
        getDatas()
    },[open])

    async function onSubmit(cdata) {
            cdata['created_user'] = user.id
            cdata['updated_user'] = user.id
            cdata['lesson_season']= cseason_id
            cdata['lesson_year']= cyear_name
            cdata['start_date']= moment(startPicker).format('YYYY-MM-DD HH:mm:ss')
            cdata['finish_date']= moment(endPicker).format('YYYY-MM-DD HH:mm:ss')
            cdata = convertDefaultValue(cdata)
            const { success, error } = await fetchData(permissionBusadApi.put(cdata, editId))
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
                        <h4>{t('Бусад хандах эрх засах')}</h4>
                    </div>
                        <Row tag={Form} className="gy-1" onSubmit={handleSubmit(onSubmit)}>
                        <Col xl={12}>
                            <Label className='form-label' for='permission_type'>
                                {t('Хандах эрх')}
                            </Label>
                            <Controller
                                control={control}
                                defaultValue=''
                                name='permission_type'
                                render={({ field: {value,  onChange } }) => {
                                    return (
                                        <Select
                                            name="permission_type"
                                            id="permission_type"
                                            classNamePrefix='select'
                                            isClearable
                                            className={classnames('react-select', {'is-invalid': errors.permission_type })}
                                            isLoading={isLoading}
                                            placeholder={t('-- Сонгоно уу --')}
                                            options={per_busad_option || []}
                                            value={per_busad_option && per_busad_option.length > 0 && per_busad_option.find((c) => c.id === value)}
                                            noOptionsMessage={() => t('Хоосон байна')}
                                            onChange={(val) => {
                                                onChange(val?.id || '')
                                            }}
                                            isDisabled={true}
                                            readOnly={true}
                                            styles={ReactSelectStyles}
                                            getOptionValue={(option) => option.id}
                                            getOptionLabel={(option) => option.name}
                                        />
                                    )
                                }}
                            />
                            {errors.permission_type && <FormFeedback className='d-block'>{t(errors.permission_type.message)}</FormFeedback>}
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
