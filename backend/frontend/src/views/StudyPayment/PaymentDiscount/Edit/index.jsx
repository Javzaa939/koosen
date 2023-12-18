// ** React imports
import React, { Fragment, useState,useContext,useEffect } from 'react'

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
    const { control, handleSubmit,reset, setValue, setError, formState: { errors } } = useForm(validate(validateSchema));
    const [ student_option, setStudentOption] = useState([])
    const [ discount_type, setDiscountOption] = useState([])
    const [ studentInfo, setStudentInfo ] = useState({})

	// Loader
	const { isLoading, fetchData} = useLoader({});

    // Api
    const discountTypeApi = useApi().settings.discountType
	const paydiscountApi = useApi().payment.discount
    const studentApi = useApi().student

    useEffect(() => {
        if(user && Object.keys(user).length && user.permissions.includes('lms-payment-discount-update')) {
            setDisabled(false)
        }
    },[])

    async function getStudentOption() {
        const { success, data } = await fetchData(studentApi.getList())
        if(success) {
        setStudentOption(data)
        }

    }
    async function getDiscountOption() {
        const { success, data } = await fetchData(discountTypeApi.get())
        if(success) {
        setDiscountOption(data)
        }

    }

    // Хадгалах
	async function getDatas(editId) {
        const { success, data } = await fetchData(paydiscountApi.getOne(editId))
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
                if(key === 'stipent_type') {
                    setValue(key, data[key]?.id)
                }
            }
        }
	}
    useEffect(() => {
        getStudentOption()
        getDiscountOption()
    },[])

    useEffect(() => {
        if(editId) getDatas(editId)
    },[editId])

    // Хадгалах
	async function onSubmit(cdata) {
        cdata['lesson_year'] = cyear_name
        cdata['lesson_season'] = cseason_id
        cdata['school'] = school_id
        const { success, error } = await fetchData(paydiscountApi.put(cdata, editId))
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

	return (
        <Fragment>
           <Modal isOpen={open} toggle={handleModal} className="modal-dialog-centered modal-sm" onClosed={handleModal}>
           {isLoading && <div className='suspense-loader'><Spinner size='xl'/></div>}
                <ModalHeader className='bg-transparent pb-0' toggle={handleModal}></ModalHeader>
                <ModalBody className="px-sm-3 pt-50 pb-3">
                    <div className='text-center'>
                        <h4>{t('Төлбөрийн хөнгөлөлт засах')}</h4>
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
                            <Label className="form-label" for="stipent_type">
                                {t('Хөнгөлөлтийн төрөл')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id="stipent_type"
                                name="stipent_type"
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        id="stipent_type"
                                        bsSize="sm"
                                        type="select"
                                        placeholder={t('Хөнгөлөлтийн төрөл')}
                                        invalid={errors.stipent_type && true}
                                        style={{height: '30px'}}
                                    >
                                        <option value="">{t('-- Сонгоно уу --')}</option>
                                        {
                                            discount_type.map((values, idx) => (
                                                <option key={idx} value={values.id}>{values.name}</option>
                                            ))
                                        }
                                    </Input>
                                )}
                            />
                            {errors.stipent_type && <FormFeedback className='d-block'>{t(errors.stipent_type.message)}</FormFeedback>}
                        </Col>
                        <Col md={12}>
                            <Label className="form-label" for="discount">
                               {t('Хөнгөлөлтийн хувь')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id="discount"
                                name="discount"
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        id="discount"
                                        bsSize="sm"
                                        type="number"
                                        placeholder={t('Хөнгөлөлтийн хувь')}
                                        invalid={errors.discount && true}
                                        onKeyDown={(e) =>["e", "E", "+"].includes(e.key) && e.preventDefault()}
                                    />
                                )}
                            />
                            {errors.discount && <FormFeedback className='d-block'>{t(errors.discount.message)}</FormFeedback>}
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
