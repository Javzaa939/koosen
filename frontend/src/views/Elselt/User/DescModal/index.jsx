// ** React imports
import React, { Fragment, useState, useEffect } from 'react'

import { useForm, Controller } from "react-hook-form";

import { Row, Col, Form, Modal, Label, Button, ModalBody, ModalHeader, FormFeedback, Spinner, Input, Alert } from "reactstrap";

import { useTranslation } from 'react-i18next';

import useApi from "@hooks/useApi";
import useLoader from "@hooks/useLoader";

import { validate, convertDefaultValue } from "@utils"

const DescModal = ({ open, handleModal, refreshDatas, rowData }) => {

    const { control, handleSubmit,  formState: { errors }, setError, reset, setValue } = useForm()

    const { t } = useTranslation()

	// Loader
	const { isLoading: postLoading, fetchData: postFetch } = useLoader({});

    const elseltApi = useApi().elselt.admissionuserdata

    async function onSubmit(cdatas) {
		cdatas = convertDefaultValue(cdatas)

        if(rowData?.id) {
            const { success, error, errors } = await postFetch(elseltApi.putDesc(cdatas, rowData?.id))
            if(success) {
                reset()
                handleModal()
                refreshDatas()
            } else {
                /** Алдааны мессэжийг input дээр харуулна */
                for (let key in errors) {
                    setError(key, { type: 'custom', message: errors[key][0] });
                }
            }
        }
    }

    useEffect(
        () =>
        {
            for(let key in rowData) {
                if (key === 'userinfo') {
                    setValue('info_description', rowData[key]?.info_description)
                }
            }
        },
        [rowData]
    )

    return (
        <Fragment>
            <Modal
                isOpen={open}
                toggle={handleModal}
                className="modal-dialog-centered modal-lg"
                contentClassName="pt-0"
            >
                <ModalHeader tag="h4" className='bg-transparent pb-0' toggle={handleModal}>
                    Тайлбар оруулах
                </ModalHeader>
                <hr />
                <ModalBody className="px-sm-3 pt-30 pb-3">
                    <Row tag={Form} className="gy-1" onSubmit={handleSubmit(onSubmit)}>
                        <Col md={12} sm={12} className='mt-1'>
                            <Label for="info_description">{t('Тайлбар')}</Label>
                            <Controller
                                control={control}
                                defaultValue=''
                                name="info_description"
                                render={({ field }) => {
                                    return (
                                        <Input
                                            {...field}
                                            id="info_description"
                                            type="textarea"
                                            invalid={errors.info_description && true}
                                        />
                                    )
                                }}
                            />
                            {errors.info_description && <FormFeedback className='d-block'>{errors.info_description.message}</FormFeedback>}
                        </Col>
                        <Col md={12} className="mt-2 text-center">
                            <Button className="me-2" color="primary" type="submit" disabled={postLoading}>
                                {postLoading && <Spinner size='sm' className='me-1'/>}
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
    )
};

export default DescModal;
