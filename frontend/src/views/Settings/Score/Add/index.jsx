// ** React imports
import React, { Fragment } from 'react'

import { X } from "react-feather";

import { useTranslation } from 'react-i18next';

import useApi from "@hooks/useApi";
import useLoader from "@hooks/useLoader";

import { useForm, Controller } from "react-hook-form";

import { Row, Col, Form, Modal, Input, Label, Button, ModalBody, ModalHeader, FormFeedback, Spinner } from "reactstrap";

import { validate } from "@utils"

import { validateSchema } from './validateSchema';

const Addmodal = ({ open, handleModal, refreshDatas }) => {

    const CloseBtn = (
        <X className="cursor-pointer" size={15} onClick={handleModal} />
    )

    // ** Hook
    const { control, handleSubmit, reset, setError, formState: { errors } } = useForm(validate(validateSchema));

	// Loader
	const { Loader, isLoading, fetchData } = useLoader({});
	const { isLoading: postLoading, fetchData: postFetch } = useLoader({});

    const { t } = useTranslation()

	// Api
	const scoreApi = useApi().settings.score

	async function onSubmit(cdata) {
        const { success, errors } = await postFetch(scoreApi.post(cdata))
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
                    <h5 className="modal-title">{t('Үнэлгээний бүртгэл нэмэх')}</h5>
                </ModalHeader>
                <ModalBody className="flex-grow-1">
                    <Row tag={Form} className="gy-1" onSubmit={handleSubmit(onSubmit)}>
                        <Col md={12}>
                            <Label className="form-label" for="score_code">
                                {t('Код')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id="score_code"
                                name="score_code"
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        id="score_code"
                                        bsSize="sm"
                                        type="number"
                                        placeholder={t('Код')}
                                        invalid={errors.score_code && true}
                                        onKeyDown={(e) =>["e", "E", "+", "-", "."].includes(e.key) && e.preventDefault()}
                                    />
                                )}
                            />
                            {errors.score_code && <FormFeedback className='d-block'>{t(errors.score_code.message)}</FormFeedback>}
                        </Col>
                        <Col md={12}>
                            <Label className="form-label" for="score_min">
                                {t('Дүнгийн доод оноо')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id="score_min"
                                name="score_min"
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        id="score_min"
                                        bsSize="sm"
                                        type="text"
                                        placeholder={t('Дүнгийн доод оноо')}
                                        invalid={errors.score_min && true}
                                        onKeyDown={(e) =>["e", "E", "+", "-"].includes(e.key) && e.preventDefault()}
                                    />
                                )}
                            />
                            {errors.score_min && <FormFeedback className='d-block'>{t(errors.score_min.message)}</FormFeedback>}
                        </Col>
                        <Col md={12}>
                            <Label className="form-label" for="score_max">
                                {t('Дүнгийн дээд оноо')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id="score_max"
                                name="score_max"
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        id="score_max"
                                        bsSize="sm"
                                        type="text"
                                        placeholder={t('Дүнгийн дээд оноо')}
                                        invalid={errors.score_max && true}
                                        onKeyDown={(e) =>["e", "E", "+", "-"].includes(e.key) && e.preventDefault()}
                                    />
                                )}
                            />
                            {errors.score_max && <FormFeedback className='d-block'>{t(errors.score_max.message)}</FormFeedback>}
                        </Col>
                        <Col md={12}>
                            <Label className="form-label" for="gpa">
                                {t('Голч дүн')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id="gpa"
                                name="gpa"
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        id="gpa"
                                        bsSize="sm"
                                        type="text"
                                        placeholder={t('Голч дүн')}
                                        invalid={errors.gpa && true}
                                        onKeyDown={(e) =>["e", "E", "+", "-"].includes(e.key) && e.preventDefault()}
                                    />
                                )}
                            />
                            {errors.gpa && <FormFeedback className='d-block'>{t(errors.gpa.message)}</FormFeedback>}
                        </Col>
                        <Col md={12}>
                            <Label className="form-label" for="assesment">
                                {t('Үсгэн үнэлгээ')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id="assesment"
                                name="assesment"
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        id="assesment"
                                        bsSize="sm"
                                        placeholder={t('Үсгэн үнэлгээ')}
                                        type="text"
                                        maxLength={1}
                                        invalid={errors.assesment && true}
                                    />
                                )}
                            />
                            {errors.assesment && <FormFeedback className='d-block'>{t(errors.assesment.message)}</FormFeedback>}
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
