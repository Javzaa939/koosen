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
	const { Loader, isLoading, fetchData } = useLoader({});
	const { isLoading: postLoading, fetchData: postFetch } = useLoader({});

    // Api
    const studentApi = useApi().student
    const paymentApi = useApi().payment.beginbalance

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
        cdata = convertDefaultValue(cdata)
        const { success, error } = await postFetch(paymentApi.post(cdata))
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
                    <h5 className="modal-title">{t('Сургалтын төлбөрийн эхний үлдэгдэл')}</h5>
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
                                            getOptionLabel={(option) => option.full_name}
                                        />
                                    )
                                }}
                            ></Controller>
                            {errors.student && <FormFeedback className='d-block'>{t(errors.student.message)}</FormFeedback>}
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
                                        placeholder={t('Эхний үлдэгдэл')}
                                        invalid={errors.first_balance && true}
                                        onKeyDown={(e) =>["e", "E", "+"].includes(e.key) && e.preventDefault()}
                                    />
                                )}
                            />
                            {errors.first_balance && <FormFeedback className='d-block'>{t(errors.first_balance.message)}</FormFeedback>}
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
