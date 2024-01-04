// ** React imports
import React, { Fragment } from 'react'

import { X } from "react-feather";

import useApi from "@hooks/useApi";
import useLoader from "@hooks/useLoader";

import { useForm, Controller } from "react-hook-form";

import { Row, Col, Form, Modal, Input, Label, Button, ModalBody, ModalHeader, FormFeedback, Spinner } from "reactstrap";

import { validate } from "@utils"

import { validateSchema } from './validateSchema';
import { t } from 'i18next';

const Addmodal = ({ open, handleModal, refreshDatas }) => {

    const CloseBtn = (
        <X className="cursor-pointer" size={15} onClick={handleModal} />
    )

    // ** Hook
    const { control, handleSubmit, reset, setError, formState: { errors } } = useForm(validate(validateSchema));

	// Loader
	const { Loader, isLoading, fetchData } = useLoader({});
	const { isLoading: postLoading, fetchData: postFetch } = useLoader({});

    // Api
	const lessonCategoryApi = useApi().settings.lessonCategory

	async function onSubmit(cdata) {
        const { success, errors } = await postFetch(lessonCategoryApi.post(cdata))
        if(success) {
            reset()
            handleModal()
            refreshDatas()
        } else {
            /** Алдааны мессэжийг input дээр харуулна */
            setError(errors.field, { type: 'custom', message:  errors.msg});
        }
	}

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
                    <h5 className="modal-title">{t('Хичээлийн ангилал нэмэх')}</h5>
                </ModalHeader>
                <ModalBody className="flex-grow-1">
                    <Row tag={Form} className="gy-1" onSubmit={handleSubmit(onSubmit)}>
                        <Col md={12}>
                            <Label className="form-label" for="category_code">
                                {t('Код')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id="category_code"
                                name="category_code"
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        id="category_code"
                                        bsSize="sm"
                                        type="number"
                                        placeholder={t('Код')}
                                        invalid={errors.category_code && true}
                                        onKeyDown={(e) =>["e", "E", "+", "-", "."].includes(e.key) && e.preventDefault()}
                                    />
                                )}
                            />
                            {errors.category_code && <FormFeedback className='d-block'>{t(errors.category_code.message)}</FormFeedback>}
                        </Col>
                        <Col md={12}>
                            <Label className="form-label" for="category_name">
                                {t('Нэр')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id="category_name"
                                name="category_name"
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        id="category_name"
                                        bsSize="sm"
                                        placeholder={t('Нэр')}
                                        type="text"
                                        invalid={errors.category_name && true}
                                    />
                                )}
                            />
                            {errors.category_name && <FormFeedback className='d-block'>{t(errors.category_name.message)}</FormFeedback>}
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
