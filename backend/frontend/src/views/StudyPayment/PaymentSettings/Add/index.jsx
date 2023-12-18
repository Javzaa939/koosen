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
import AuthContext from '@context/AuthContext'
import SchoolContext from "@context/SchoolContext"
import ActiveYearContext from "@context/ActiveYearContext"
import useToast from "@hooks/useToast";

import { validate, ReactSelectStyles, convertDefaultValue } from "@utils"

import { validateSchema } from '../validateSchema';

const Addmodal = ({ open, handleModal, refreshDatas }) => {

    const CloseBtn = (
        <X className="cursor-pointer" size={15} onClick={handleModal} />
    )

    const addToast = useToast()
    const { t } = useTranslation()
    const { user } = useContext(AuthContext)
    const { school_id } = useContext(SchoolContext)
    const { cseason_id, cyear_name } = useContext(ActiveYearContext)

    // ** Hook
    const { control, handleSubmit, reset, setValue, setError, formState: { errors } } = useForm(validate(validateSchema));

    const [ class_option, setClassOption] = useState([])

	// Loader
	const { Loader, isLoading, fetchData } = useLoader({});
	const { isLoading: postLoading, fetchData: postFetch } = useLoader({});

    // Api
    const groupApi = useApi().student.group
    const paymentApi = useApi().payment.paymentsetting

    async function getGroup() {
        const { success, data } = await fetchData(groupApi.getList('', '', '', '', school_id))
        if(success) {
            setClassOption(data)
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
        getGroup()
    }, [])

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
                    <h5 className="modal-title">{t('Төлбөрийн тохиргоо нэмэх')}</h5>
                </ModalHeader>
                <ModalBody className="flex-grow-1">
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
                                {t('Улирлын төлбөр')}
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
                                        placeholder={t('Улирлын төлбөр')}
                                        invalid={errors.payment && true}
                                    />
                                )}
                            />
                            {errors.payment && <FormFeedback className='d-block'>{t(errors.payment.message)}</FormFeedback>}
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
