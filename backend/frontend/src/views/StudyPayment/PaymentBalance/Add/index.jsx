// ** React imports
import React, { Fragment, useState, useContext, useEffect } from 'react'

import { useTranslation } from 'react-i18next';

import { X } from "react-feather";

import Select from 'react-select'

import classnames from "classnames";

import { useForm, Controller } from "react-hook-form";

import { Row, Col, Form, Modal, Input, Label, Button, ModalBody, ModalHeader, FormFeedback, Spinner } from "reactstrap";

import useApi from "@hooks/useApi";
import useLoader from "@hooks/useLoader";
import SchoolContext from "@context/SchoolContext"
import ActiveYearContext from "@context/ActiveYearContext"

import { validate, ReactSelectStyles, convertDefaultValue } from "@utils"

import { validateSchema } from '../validateSchema';

const Addmodal = ({ open, handleModal, refreshDatas, selected_value }) => {
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

    const CloseBtn = (
        <X className="cursor-pointer" size={15} onClick={handleModal} />
    )

    const { t } = useTranslation()
    const { school_id } = useContext(SchoolContext)
    const { cseason_id, cyear_name } = useContext(ActiveYearContext)

    // ** Hook
    const { control, handleSubmit, setError, formState: { errors } } = useForm(validate(validateSchema));

    const [ student_option, setStudentOption] = useState([])

	// Loader
	const { isLoading, fetchData } = useLoader({});
	const { isLoading: postLoading, fetchData: postFetch } = useLoader({});

    // Api
    const studentApi = useApi().student
    const paymentbalanceApi = useApi().payment.paymentbalance

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
        const { success, error } = await postFetch(paymentbalanceApi.post(cdata))
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
            <Modal
                isOpen={open}
                toggle={handleModal}
                className="sidebar-lg hr-register"
                modalClassName="modal-slide-in "
                contentClassName="pt-0"
            >
                <ModalHeader
                    className="mb-1"
                    toggle={handleModal}
                    close={CloseBtn}
                    tag="div"
                >
                    <h5 className="modal-title">{t('Сургалтын төлбөрийн гүйлгээ нэмэх')}</h5>
                </ModalHeader>
                <ModalBody className="flex-grow-1">
                    <Row tag={Form} className="gy-1" onSubmit={handleSubmit(onSubmit)}>
                        <Col md={12}>
                            <Label className="form-label" for="student">
                               {t('Оюутан')}
                            </Label>
                            <Controller
                                control={control}
                                defaultValue=''
                                name="student"
                                render={({ field: { value, onChange} }) => {
                                    return (
                                        <Select
                                            name="student"
                                            id="student"
                                            classNamePrefix='select'
                                            isClearable
                                            className={classnames('react-select', { 'is-invalid': errors.student })}
                                            isLoading={isLoading}
                                            placeholder={t(`-- Сонгоно уу --`)}
                                            options={student_option || []}
                                            value={student_option.find((c) => c.id === value)}
                                            noOptionsMessage={() => t('Хоосон байна')}
                                            onChange={(val) => {
                                                onChange(val?.id || '')
                                            }}
                                            styles={ReactSelectStyles}
                                            getOptionValue={(option) => option.id}
                                            getOptionLabel={(option) => option.code}
                                        />
                                    )
                                }}
                            ></Controller>
                            {errors.student && <FormFeedback className='d-block'>{t(errors.student.message)}</FormFeedback>}
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
                        <Col md={12} className="mt-2">
                            <Button className="me-2" color="primary" type="submit" disabled={postLoading}>
                                {postLoading &&<Spinner size='sm' className='me-1'/>}
                                {t('Хадгалах')}
                            </Button>
                            <Button color="secondary" type="reset" outline  onClick={handleModal}>
                                {t('Буцах')}
                            </Button>
                        </Col>
                    </Row>
                </ModalBody>
            </Modal>
        </Fragment>
	);
};
export default Addmodal;
