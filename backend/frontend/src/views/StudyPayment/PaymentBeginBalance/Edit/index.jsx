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

const Editmodal = ({ editId, open, handleModal, refreshDatas, selected_value }) => {

    const { t } = useTranslation()

    const { user } = useContext(AuthContext)
    const { school_id } = useContext(SchoolContext)
    const { cseason_id, cyear_name } = useContext(ActiveYearContext)

    const [is_disabled, setDisabled] = useState(true)

    // ** Hook
    const { control, handleSubmit, setValue, setError, formState: { errors } } = useForm(validate(validateSchema));

    const [ student_option, setStudentOption] = useState([])
    const [ studentInfo, setStudentInfo ] = useState({})

	// Loader
	const { Loader, isLoading, fetchData } = useLoader({});

    // Api
    const studentApi = useApi().student
    const paymentApi = useApi().payment.beginbalance

    useEffect(() => {
        if(user && Object.keys(user).length && user.permissions.includes('lms-payment-beginbalance-update')) {
            setDisabled(false)
        }
    },[])

    async function getDatas(editId) {
        const { success, data } = await fetchData(paymentApi.getOne(editId))
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

    async function getStudentOption() {
        const department = selected_value?.department
        const degree = selected_value?.degree
        const profession = selected_value?.profession
        const group = selected_value?.group
        const join_year = selected_value?.join_year
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
        const { success, error } = await fetchData(paymentApi.put(cdata, editId))
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
        getStudentOption()
    },[selected_value])

	return (
        <Fragment>
            <Modal isOpen={open} toggle={handleModal} className="modal-dialog-centered modal-sm" onClosed={handleModal}>
            {isLoading && <div className='suspense-loader'><Spinner size='xl'/></div>}
                <ModalHeader className='bg-transparent pb-0' toggle={handleModal}></ModalHeader>
                <ModalBody className="px-sm-3 pt-50 pb-3">
                    <div className='text-center'>
                        <h4>{t('Сургалтын төлбөрийн эхний үлдэгдэл засах')}</h4>
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
                            <Label className="form-label" for="first_balance">
                               {t('Эхний үлдэгдэл')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id="first_balance"
                                name="first_balance"
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        id="first_balance"
                                        bsSize="sm"
                                        type="number"
                                        disabled={is_disabled}
                                        readOnly={is_disabled}
                                        placeholder={t('Эхний үлдэгдэл')}
                                        invalid={errors.first_balance && true}
                                        onKeyDown={(e) =>["e", "E", "+"].includes(e.key) && e.preventDefault()}
                                    />
                                )}
                            />
                            {errors.first_balance && <FormFeedback className='d-block'>{t(errors.first_balance.message)}</FormFeedback>}
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
