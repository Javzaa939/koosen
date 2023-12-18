// ** React imports
import React, { Fragment, useState, useContext, useEffect } from 'react'

import { useTranslation } from 'react-i18next';

import Select from 'react-select'

import classnames from "classnames";

import { useForm, Controller } from "react-hook-form";

import { Row, Col, Form, Modal, Input, Label, Button, ModalBody, ModalHeader, FormFeedback, Spinner } from "reactstrap";

import useApi from "@hooks/useApi";
import useLoader from "@hooks/useLoader";
import AuthContext from "@context/AuthContext"
import SchoolContext from "@context/SchoolContext"
import ActiveYearContext from "@context/ActiveYearContext"

import { validate, ReactSelectStyles } from "@utils"

import { validateSchema } from '../validateSchema';

const Editmodal = ({ editId, open, handleModal, refreshDatas }) => {

    const { t } = useTranslation()

    const { user } = useContext(AuthContext)
    const { school_id } = useContext(SchoolContext)
    const { cseason_id, cyear_name } = useContext(ActiveYearContext)

    const [is_disabled, setDisabled] = useState(true)

    // ** Hook
    const { control, handleSubmit, reset, setValue, setError, formState: { errors } } = useForm(validate(validateSchema));

    const [ class_option, setClassOption] = useState([])

	// Loader
	const { Loader, isLoading, fetchData } = useLoader({});

    // Api
    const groupApi = useApi().student.group
    const paymentSettingsApi = useApi().payment.paymentsetting


    useEffect(() => {
        if(user && Object.keys(user).length && user.permissions.includes('lms-payment-settings-update')) {
            setDisabled(false)
        }
    },[])

    async function getGroup() {
        const { success, data } = await fetchData(groupApi.getList('','','','', school_id))
        if(success) {
            setClassOption(data)
        }
    }

    async function getDatas(editId) {
        const { success, data } = await fetchData(paymentSettingsApi.getOne(editId))
        if(success) {
            // засах үед дата байх юм бол setValue-р дамжуулан утгыг харуулна
            if(data === null) return
            for(let key in data) {
                if(data[key] !== null)
                    setValue(key, data[key])
                else setValue(key, '')

                if(key === 'group') {
                    setValue(key, data[key]?.id)
                }
            }
        }
    }

    useEffect(() => {
        if(editId) getDatas(editId)
    }, [editId])

    // Хадгалах
	async function onSubmit(cdata) {
        cdata['lesson_year'] = cyear_name
        cdata['lesson_season'] = cseason_id
        cdata['school'] = school_id
        const { success, error } = await fetchData(paymentSettingsApi.put(cdata, editId))
        if(success) {
            handleModal()
            refreshDatas()
        } else {
            /** Алдааны мессэжийг input дээр харуулна */
            for (let key in error) {
                setError(error[key].field, { type: 'custom', message:  error[key].msg});
            }
        }
	}

    useEffect(()=>{
        getGroup()
    },[])

    useEffect(() => {
        if(user && Object.keys(user).length && user.permissions.includes('lms-payment-settings-update')) {
            setDisabled(false)
        }
    },[])

	return (
        <Fragment>
            <Modal isOpen={open} toggle={handleModal} className="modal-dialog-centered modal-sm" onClosed={handleModal}>
            {isLoading && <div className='suspense-loader'><Spinner size='xl'/></div>}
                <ModalHeader className='bg-transparent pb-0' toggle={handleModal}></ModalHeader>
                <ModalBody className="px-sm-3 pt-50 pb-3">
                    <div className='text-center'>
                        <h4>{t('Төлбөрийн тохиргоо засах')}</h4>
                    </div>
                    <Row tag={Form} className="gy-1" onSubmit={handleSubmit(onSubmit)}>
                        <Col md={12}>
                            <Label className="form-label" for="group">
                                {t('Анги')}
                            </Label>
                            <Controller
                                control={control}
                                defaultValue=''
                                name="group"
                                render={({ field: { value, onChange} }) => {
                                    return (
                                        <Select
                                            name="group"
                                            id="group"
                                            classNamePrefix='select'
                                            isClearable
                                            className={classnames('react-select', { 'is-invalid': errors.group })}
                                            isLoading={isLoading}
                                            placeholder={t(`-- Сонгоно уу --`)}
                                            options={class_option || []}
                                            value={class_option.find((c) => c.id === value)}
                                            noOptionsMessage={() => t('Хоосон байна')}
                                            onChange={(val) => {
                                                onChange(val?.id || '')
                                            }}
                                            isDisabled={is_disabled}
                                            styles={ReactSelectStyles}
                                            getOptionValue={(option) => option.id}
                                            getOptionLabel={(option) => option.name}
                                        />
                                    )
                                }}
                            ></Controller>
                            {errors.group && <FormFeedback className='d-block'>{t(errors.group.message)}</FormFeedback>}
                        </Col>
                        <Col md={12}>
                            <Label className="form-label" for="payment">
                                {t('Багц цагийн төлбөр')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id="payment"
                                name="payment"
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        id="payment"
                                        bsSize="sm"
                                        type="number"
                                        readOnly={is_disabled}
                                        disabled={is_disabled}
                                        placeholder={t('Багц цагийн төлбөр')}
                                        invalid={errors.payment && true}
                                        onKeyDown={(e) =>["e", "E", "+", "-"].includes(e.key) && e.preventDefault()}
                                    />
                                )}
                            />
                            {errors.payment && <FormFeedback className='d-block'>{t(errors.payment.message)}</FormFeedback>}
                        </Col>
                        <Col md={12} className="text-center mt-2">
                            <Button className="me-2" disabled={is_disabled} size='sm' color="primary" type="submit">
                                {t('Хадгалах')}
                            </Button>
                            <Button color="secondary" size='sm' type="reset" outline  onClick={handleModal}>
                                {t('Буцах')}
                            </Button>
                        </Col>
                    </Row>
                </ModalBody>
            </Modal>
        </Fragment>
	);
};
export default Editmodal;
