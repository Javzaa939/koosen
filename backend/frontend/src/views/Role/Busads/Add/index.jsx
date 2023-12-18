import React, { Fragment, useState, useContext, useEffect } from 'react'
import {
    Col,
    Row,
    Form,
    Modal,
    Label,
    Input,
    Button,
    Spinner,
    ModalBody,
    ModalHeader,
    FormFeedback,
} from 'reactstrap'
import Select from 'react-select'
import { X } from 'react-feather'
import useApi from '@hooks/useApi';
import classnames from 'classnames'
import useLoader from '@hooks/useLoader';
import { useTranslation } from 'react-i18next'
import AuthContext from "@context/AuthContext"
import SchoolContext from "@context/SchoolContext"
import { Controller, useForm } from 'react-hook-form'
import { validateSchema } from '../Add/validateSchema'
import ActiveYearContext from "@context/ActiveYearContext"
import { validate, ReactSelectStyles, convertDefaultValue, permission_type_option } from '@utils'

import Flatpickr from 'react-flatpickr'
// flatpickr style
import '@styles/react/libs/flatpickr/flatpickr.scss'
// import { Mongolian } from "flatpickr/dist/l10n/mn.js"

import moment from 'moment';

const AddModal = ({ isOpen, handleAddModal, refreshDatas }) => {

    const { t } = useTranslation()

    const closeBtn = (
        <X className='cursor-pointer' size={15} onClick={handleAddModal} />
    )

	const { user } = useContext(AuthContext)
    const { school_id } = useContext(SchoolContext)
    const { cseason_id, cyear_name } = useContext(ActiveYearContext)

    // ** Hook
    const { control, handleSubmit, formState: { errors }, clearErrors, reset, setError } = useForm(validate(validateSchema));

    const { isLoading, Loader, fetchData } = useLoader({ })
    const { isLoading: postLoading, fetchData: postFetch } = useLoader({});

    const [other_type_option, setOtherTypeOption] = useState(permission_type_option())
    const [busad_id , setOtherId] = useState('')
    const [startPicker, setStartPicker] = useState(new Date)
    const [endPicker, setEndPicker] = useState(new Date(startPicker.getTime() + (24 * 60 * 60 * 1000)))

    // Api
    const permissionsOtherApi = useApi().role.other


    async function onSubmit(cdata) {

        cdata['created_user'] = user.id
        cdata['updated_user'] = user.id
        cdata['lesson_season']= cseason_id
        cdata['lesson_year']= cyear_name
        cdata['start_date']= moment(startPicker).format('YYYY-MM-DD HH:mm:ss')
        cdata['finish_date']= moment(endPicker).format('YYYY-MM-DD HH:mm:ss')
        cdata = convertDefaultValue(cdata)
        const { success, error } = await postFetch(permissionsOtherApi.post(cdata))
        if(success) {
            reset()
            refreshDatas()
            handleAddModal()
        }
        else {
            /** Алдааны мессеж */
            for (let key in error) {
                setError(error[key].field, { type: 'custom', message: error[key].msg});
            }
        }
    }

    const handleEndDate = (date) => {
        var end_date = new Date(date);

            if (!startPicker) {
                if (end_date > startPicker) {
                    setError('end_date', { type: 'custom', message: 'Эхлэх хугацаанаас өмнө байх боломжгүй !' });
                } else {
                    setEndPicker(end_date);
                    clearErrors('start_date');
                    clearErrors('end_date');
                }
            } else {
                var start = new Date;
                if (end_date < start ) {
                    setError('start_date', { type: 'custom', message: 'Эхлэх хугацаанаас өмнө байх боломжгүй' });
                    setError('end_date', { type: 'custom', message: 'Дуусах хугацаа нь эхлэх хугацаанаас өмнө байх боломжгүй' });

                } else {
                    setEndPicker(end_date);
                    clearErrors('start_date');
                    clearErrors('end_date');
                }
            }
        }



    const handleStartPicker = (dates) => {
        const start_date = new Date(dates);
        const end_date = new Date(endPicker);

            if (start_date > end_date) {
                setError('start_date', { type: 'custom', message: 'Дуусах хугацаанаас хойш байх боломжгүй' });
            } else {
                setStartPicker(dates)
                clearErrors('start_date')
            }
    };

    return (
        <Fragment>
            {isLoading && Loader}
            <Modal
                isOpen={isOpen}
                toggle={handleAddModal}
                className="sidebar-md hr-register"
                modalClassName="modal-slide-in "
                contentClassName="pt-0"
            >
                <ModalHeader
                    className="mb-1"
                    toggle={handleAddModal}
                    close={closeBtn}
                    tag="div"
                >
                    <h5 className="modal-title">{t('Бусад хандах эрх нэмэх')}</h5>
                </ModalHeader>
                <ModalBody className='flex-grow-1'>
                    <Row tag={Form} className='gy-1' onSubmit={handleSubmit(onSubmit)}>
                        <Col xl={12}>
                            <Label className='form-label' for='permission_type'>
                                {t('Хандах эрх')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
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
                                            options={other_type_option || []}
                                            noOptionsMessage={() => t('Хоосон байна')}
                                            onChange={(val) => {
                                                onChange(val?.id || '')
                                                setOtherId(val?.id || '')

                                            }}
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
                            <Controller
                                defaultValue={new Date()}
                                control={control}
                                name='start_date'
                                className="form-control"
                                render={({}) => {
                                    return (
                                        <Flatpickr
                                            id='start_date'
                                            className='form-control'
                                            onChange={dates => {
                                               handleStartPicker(dates[0]);
                                                }}
                                            value={startPicker}
                                            style={{height: "30px"}}
                                            options={{
                                                enableTime: true,
                                                dateFormat: 'Y-m-d H:i',
                                                utc: true,
                                                time_24hr: true,
                                                // locale: Mongolian
                                            }}
                                        />
                                    )
                                }}
                            />
                                {errors.start_date && <FormFeedback className='d-block'>{t(errors.start_date.message)}</FormFeedback>}
                        </Col>

                        <Col>
                            <Label className='form-label' for='end'>
                                Дуусах хугацаа
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                value={endPicker}
                                className={classnames({ 'is-invalid': errors.end_date })}

                                name='end_date'
                                render={() => (
                                <Flatpickr
                                    id='end_date'
                                    name='end_date'
                                    className={`form-control`}
                                    onChange={date => handleEndDate(date[0])}
                                    value={endPicker}
                                    style={{ height: "30px" }}
                                    options={{
                                        enableTime: true,
                                        dateFormat: 'Y-m-d H:i',
                                        // minDate: new Date(startPicker),
                                        time_24hr: true,
                                        // locale: Mongolian
                                    }}
                                />
                                )}
                                />
                                {errors.end_date && <FormFeedback className='d-block'>{t(errors.end_date.message)}</FormFeedback>}
                        </Col>
                        <Col md={12} className="mt-2">
                            <Button className="me-2" color="primary" type="submit" disabled={postLoading}>
                            {postLoading &&<Spinner size='sm' className='me-1'/>}
                                {t('Хадгалах')}
                            </Button>
                            <Button color="secondary" outline type="reset" onClick={handleAddModal}>
                                {t('Буцах')}
                            </Button>
                        </Col>
                    </Row>
                </ModalBody>
            </Modal>
        </Fragment>
    )
}
export default AddModal

