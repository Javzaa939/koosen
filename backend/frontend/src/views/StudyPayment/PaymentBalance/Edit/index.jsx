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

import { validate, ReactSelectStyles, convertDefaultValue } from "@utils"

import { validateSchema } from '../validateSchema';

const Editmodal = ({ editId, open, handleModal, refreshDatas, selected_value }) => {

    const payment_type = [
        {
            id: 1,
            name: 'Төлсөн төлбөр'
        },
        {
            id: 2,
            name: 'Буцаасан төлбөр'
        },
    ]

    const { t } = useTranslation()

    const { user } = useContext(AuthContext)
    const { school_id } = useContext(SchoolContext)
    const { cseason_id, cyear_name } = useContext(ActiveYearContext)

    const [is_disabled, setDisabled] = useState(true)
    const [studentInfo, setStudentInfo] = useState([])

    // ** Hook
    const { control, handleSubmit, setValue, setError, formState: { errors } } = useForm(validate(validateSchema));

    const [ student_option, setStudentOption] = useState([])

	// Loader
	const { isLoading, fetchData } = useLoader({});

    // Api
    const studentApi = useApi().student
    const paymentbalanceApi = useApi().payment.paymentbalance

    useEffect(() => {
        if(user && Object.keys(user).length && user.permissions.includes('lms-payment-balance-update')) {
            setDisabled(false)
        }
    },[])

    async function getDatas(editId) {
        const { success, data } = await fetchData(paymentbalanceApi.getOne(editId))
        if(success) {
            setStudentInfo(data?.student)
            // засах үед дата байх юм бол setValue-р дамжуулан утгыг харуулна
            if(data === null) return
            for(let key in data) {
                if(data[key] !== null)
                    setValue(key, data[key])
                else setValue(key, '')

                if(key === 'student') {
                    setValue(key, data[key]?.id)
                }
            }
        }
    }

    useEffect(() => {
        if(editId) {
            getDatas(editId)
        }
    },[open])

    async function getStudent() {
        const degree = selected_value.degree
        const department = selected_value.department
        const group = selected_value.group
        const join_year = selected_value.join_year
        const profession = selected_value.profession
        const { success, data } = await fetchData(studentApi.getStudent(department, degree, profession, group, join_year))
        if(success) {
            setStudentOption(data)
        }
    }

    // Хадгалах
	async function onSubmit(cdata) {
        cdata['lesson_year'] = cyear_name
        cdata['lesson_season'] = cseason_id
        cdata['school'] = school_id
        cdata = convertDefaultValue(cdata)
        const { success, error } = await fetchData(paymentbalanceApi.put(cdata, editId))
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

    useEffect(() => {
        getStudent()
    },[selected_value])

	return (
        <Fragment>
            <Modal isOpen={open} toggle={handleModal} className="modal-dialog-centered modal-sm" onClosed={handleModal}>
            {isLoading && <div className='suspense-loader'><Spinner size='xl'/></div>}
                <ModalHeader className='bg-transparent pb-0' toggle={handleModal}></ModalHeader>
                <ModalBody className="px-sm-3 pt-50 pb-3">
                    <div className='text-center'>
                        <h4>{t('Сургалтын төлбөрийн гүйлгээ засах')}</h4>
                    </div>
                    <Row tag={Form} className="gy-1" onSubmit={handleSubmit(onSubmit)}>
                        <Col className=''>
                            <Label className="form-label me-1" for="student">
                                {t('Оюутан')}
                            </Label>
                            <div className='d-flex d-inline-block overflow-auto flex-wrap border p-1 rounded-3 ' >
                                <b className='me-1'>{studentInfo?.code}</b>
                                <div className='d-flex '>
                                    {studentInfo?.last_name} {studentInfo?.first_name}
                                </div>
                            </div>
                        </Col>
                        <Col md={12}>
                            <Label className="form-label" for="balance_date">
                               {t('Гүйлгээний огноо')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id="balance_date"
                                name="balance_date"
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        id="balance_date"
                                        bsSize="sm"
                                        type="date"
                                        disabled={is_disabled}
                                        readOnly={is_disabled}
                                        invalid={errors.balance_date && true}
                                    />
                                )}
                            />
                            {errors.balance_date && <FormFeedback className='d-block'>{t(errors.balance_date.message)}</FormFeedback>}
                        </Col>
                        <Col md={12}>
                            <Label className="form-label" for="balance_amount">
                               {t('Гүйлгээний дүн')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id="balance_amount"
                                name="balance_amount"
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        id="balance_amount"
                                        bsSize="sm"
                                        type="number"
                                        disabled={is_disabled}
                                        readOnly={is_disabled}
                                        placeholder={t('Гүйлгээний дүн')}
                                        invalid={errors.balance_amount && true}
                                        onKeyDown={(e) =>["e", "E", "+", "-"].includes(e.key) && e.preventDefault()}
                                    />
                                )}
                            />
                            {errors.balance_amount && <FormFeedback className='d-block'>{t(errors.balance_amount.message)}</FormFeedback>}
                        </Col>
                        <Col md={12}>
                            <Label className="form-label" for="balance_desc">
                                {t('Гүйлгээний утга')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id="balance_desc"
                                name="balance_desc"
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        id="balance_desc"
                                        bsSize="sm"
                                        type="text"
                                        disabled={is_disabled}
                                        readOnly={is_disabled}
                                        placeholder={t('Гүйлгээний утга')}
                                        invalid={errors.balance_desc && true}
                                    />
                                )}
                            />
                            {errors.balance_desc && <FormFeedback className='d-block'>{t(errors.balance_desc.message)}</FormFeedback>}
                        </Col>
                        <Col md={12}>
                            <Label className="form-label" for="flag">
                                {t('Төлбөрийн төрөл')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id="flag"
                                name="flag"
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        id="flag"
                                        bsSize="sm"
                                        type="select"
                                        disabled={is_disabled}
                                        readOnly={is_disabled}
                                        placeholder={t('Төлбөрийн төрөл')}
                                        invalid={errors.flag && true}
                                        style={{height: '30px'}}
                                    >
                                        <option value="">{t('-- Сонгоно уу --')}</option>
                                        {
                                            payment_type.map((values, idx) => (
                                                <option key={idx} value={values.id}>{values.name}</option>
                                            ))
                                        }
                                    </Input>
                                )}
                            />
                            {errors.flag && <FormFeedback className='d-block'>{t(errors.flag.message)}</FormFeedback>}
                        </Col>
                        <Col md={12} className="text-center mt-2">
                            <Button className="me-2 mt-1" disabled={is_disabled} size='sm' color="primary" type="submit">
                                {t('Хадгалах')}
                            </Button>
                            <Button color="secondary" className='mt-1' size='sm' type="reset" outline  onClick={handleModal}>
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
