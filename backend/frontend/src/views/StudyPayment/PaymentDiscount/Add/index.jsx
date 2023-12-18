// ** React imports
import React, { Fragment, useState,useContext, useEffect } from 'react'

import { useTranslation } from 'react-i18next';
var values = {
        student: '',
        stipent_type: '',
    }

import { X } from "react-feather";

import Select from 'react-select'

import classnames from "classnames";

import { useForm, Controller } from "react-hook-form";

import { Row, Col, Form, Modal, Input, Label, Button, ModalBody, ModalHeader, FormFeedback, Spinner } from "reactstrap";
import useApi from "@hooks/useApi";
import useLoader from "@hooks/useLoader";

import { validate, ReactSelectStyles } from "@utils"

import { validateSchema } from '../validateSchema';
import SchoolContext from "@context/SchoolContext"
import ActiveYearContext from "@context/ActiveYearContext"
// import { validate, ReactSelectStyles, convertDefaultValue } from "@utils"

const Addmodal = ({ open, handleModal, refreshDatas }) => {

    const CloseBtn = (
        <X className="cursor-pointer" size={15} onClick={handleModal} />
    )

    const { t } = useTranslation()
    const { school_id } = useContext(SchoolContext)
    const { cseason_id, cyear_name } = useContext(ActiveYearContext)

    // ** Hook
    const { control, handleSubmit, setError, reset, setValue, formState: { errors } } = useForm(validate(validateSchema));
    const [ student_option, setStudentOption] = useState([])
    const [ stipent_type, settypeOption] = useState([])


	// Loader
	const { Loader, isLoading, fetchData } = useLoader({});
    const { isLoading: postLoading, fetchData: postFetch } = useLoader({});

    const [select_value, setSelectValue] = useState(values)

    // Api
    const discountTypeApi = useApi().settings.discountType
    const studentApi = useApi().student
	const paydiscountApi = useApi().payment.discount


    async function getStipTypeOption() {
        const { success, data } = await fetchData(discountTypeApi.get())
        if(success) {
        settypeOption(data)
        }

    }

    async function getStudentOption() {
        const { success, data } = await fetchData(studentApi.getList())
        if(success) {
        setStudentOption(data)
        }

    }

    // Хадгалах
	async function onSubmit(cdata) {
        cdata['lesson_season'] = cseason_id
        cdata['lesson_year'] = cyear_name
        cdata['school'] = school_id
        const { success, error } = await postFetch(paydiscountApi.post(cdata))
        if(success) {
            reset()
            refreshDatas()
            handleModal()
        } else {
            /** Алдааны мессэжийг input дээр харуулна */
            for (let key in error) {
                setError(error[key].field, { type: 'custom', message:  error[key].msg});
            }
        }

	}

    useEffect(() => {
        getStipTypeOption()
        getStudentOption()
    },[])

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
                    <h5 className="modal-title">{t('Төлбөрийн хөнгөлөлт')}</h5>
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
                                            stipent_type.map((values, idx) => (
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
