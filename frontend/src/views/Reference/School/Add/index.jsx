// ** React imports
import { Fragment, useState } from 'react';

import { X } from "react-feather";

import useApi from "@hooks/useApi";
import useLoader from "@hooks/useLoader";

import { Controller, useForm } from "react-hook-form";

import {
    Button,
    Col,
    Form,
    FormFeedback,
    Input,
    Label,
    Modal,
    ModalBody,
    ModalHeader,
    Row,
    Spinner,
} from "reactstrap";

import { validate } from "@utils";

import { t } from 'i18next';

import { validateSchema } from './validateSchema';
import useToast from '@src/utility/hooks/useToast';

const AddModal = ({ open, handleModal, refreshDatas }) => {
    const CloseBtn = <X className="cursor-pointer" size={15} onClick={handleModal} />

    // ** Hook
    const { control, handleSubmit, setError, formState: { errors } } = useForm(validate(validateSchema));
    const { isLoading: postLoading, fetchData: postFetch } = useLoader({});
    const addToast = useToast()

    const necessaryFields = [
        'name',
        'name_eng',
        'address',
        'web',
        'social',
        'logo',
        'email',
        'phone_number',
    ]

    // Api
    const schoolsApi = useApi().hrms.school

    async function onSubmit(cdata) {
        cdata['logo'] = image
        const formData = new FormData()
        Object.keys(cdata).forEach(key => formData.append(key, cdata[key]))
        const { success, errors } = await postFetch(schoolsApi.post(formData))

        if (success) {
            refreshDatas()
            handleModal()
        } else {
            /** Алдааны мессэжийг input дээр харуулна */
            for (let key in errors) setError(key, { type: 'custom', message: errors[key] })

            const notFormKeys = Object.keys(errors).filter(field => !necessaryFields.includes(field))
            const notFormErrors = {}
            notFormKeys.forEach(key => notFormErrors[key] = errors[key])

            if (notFormKeys.length) {
                console.warn(notFormErrors);
                addToast({ type: 'warning', text: 'Та түр хүлээгээд дахин оролдоно уу' })
            }
        }
	}

    // #region Зураг авах функц
    const [image, setImage] = useState('')

	const onChange = (e) => {
		const reader = new FileReader()
        const files = e.target.files

        if (files.length > 0) {
            setImage(files[0])
            reader.readAsDataURL(files[0])
        }
	}
    // #endregion

    return (
        <Fragment>
            <Modal
                isOpen={open}
                toggle={handleModal}
                className="sidebar-md"
                modalClassName='modal-slide-in'
                contentClassName='pt-0'
            >
                {
                    postLoading &&
                        <div className='suspense-loader'>
                            <Spinner size='bg'/>
                            <span className='ms-50'>{t('Түр хүлээнэ үү')}...</span>
                        </div>
                }

                <ModalHeader
                    className="mb-1"
                    toggle={handleModal}
                    close={CloseBtn}
                    tag="div"
                >
                    <h5 className="modal-title">{t('Сургуулийн мэдээлэл нэмэх')}</h5>

                </ModalHeader>
                <ModalBody className="flex-grow-1">
                    <Row tag={Form} className="gy-1" onSubmit={handleSubmit(onSubmit)}>
                        <Col md={12}>
                            <Label className="form-label" for="name">
                                {t('Сургуулийн нэр')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id="name"
                                name="name"
                                render={({ field }) => (
                                    <Input
                                        id ="name"
                                        bsSize="sm"
                                        placeholder={t('Сургуулийн нэр')}
                                        {...field}
                                        type="text"
                                        invalid={errors.name && true}
                                    />
                                )}
                            />
                            {errors.name && <FormFeedback className='d-block'>{t(errors.name.message)}</FormFeedback>}
                        </Col>
                        <Col md={12}>
                            <Label className="form-label" for="name_eng">
                                {t('Сургуулийн англи нэр')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id="name_eng"
                                name="name_eng"
                                render={({ field }) => (
                                    <Input
                                        id ="name_eng"
                                        bsSize="sm"
                                        placeholder={t('сургуулийн англи нэр')}
                                        {...field}
                                        type="text"
                                    />
                                )}
                            />
                        </Col>
                        <Col md={12}>
                            <Label className="form-label" for="address">
                                {t('Сургуулийн хаяг')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id="address"
                                name="address"
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        id="address"
                                        bsSize="sm"
                                        placeholder={t('Сургуулийн хаяг')}
                                        type="textarea"
                                    />
                                )}
                            />
                            {errors.address && <FormFeedback className='d-block'>{t(errors.address.message)}</FormFeedback>}
                        </Col>
                        <Col md={12}>
                            <Label className="form-label" for="web">
                                {t('Сургуулийн веб')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id="web"
                                name="web"
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        id="web"
                                        bsSize="sm"
                                        placeholder={t('Сургуулийн веб')}
                                        type="textarea"
                                    />
                                )}
                            />
                            {errors.web && <FormFeedback className='d-block'>{t(errors.web.message)}</FormFeedback>}
                        </Col>
                        <Col md={12}>
                            <Label className="form-label" for="social">
                                {t('Сошиал холбоос')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id="social"
                                name="social"
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        id="social"
                                        bsSize="sm"
                                        placeholder={t('Сошиал холбоос')}
                                        type="textarea"
                                    />
                                )}
                            />
                            {errors.social && <FormFeedback className='d-block'>{t(errors.social.message)}</FormFeedback>}
                        </Col>
                        <Col lg={12} xs={12}>
                            <Label className="form-label" for="logo">
                                {t('Лого')}
                            </Label>
                            <Controller
                                control={control}
                                id="logo"
                                name="logo"
                                render={({ field }) => {
                                    return (
                                        <Input
                                            {...field}
                                            type='file'
                                            id='logo'
                                            name='logo'
                                            onChange={(e) => onChange(e)}
                                            accept='image/*'
                                        />
                                        )
                                    }}
                            />
                        </Col>
                        <Col lg={12} xs={12}>
                            <Label className="form-label" for="email">
                                {t('И-мэйл')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id="email"
                                name="email"
                                render={({ field }) => (
                                    <Input
                                        id ="email"
                                        bsSize="sm"
                                        placeholder={t("И-мэйл")}
                                        {...field}
                                        type="email"
                                        invalid={errors.email && true}
                                    />
                                )}
                            />
                            {errors.email && <FormFeedback className='d-block'>{errors.email.message}</FormFeedback>}
                        </Col>
                        <Col lg={12} xs={12}>
                            <Label className="form-label" for="phone_number">
                                {t('Утасны дугаар')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id="phone_number"
                                name="phone_number"
                                render={({ field }) => (
                                    <Input
                                        id ="phone_number"
                                        bsSize="sm"
                                        placeholder={t("Утасны дугаар")}
                                        {...field}
                                        type="number"
                                        invalid={errors.phone_number && true}
                                    />
                                )}
                            />
                            {errors.phone_number && <FormFeedback className='d-block'>{errors.phone_number.message}</FormFeedback>}
                        </Col>
                        <Col className='text-center mt-2' md={12}>
                            <Button className="me-2" size='sm' color="primary" type="submit" disabled={postLoading}>
                                {postLoading &&<Spinner size='sm' className='me-1'/>}
                                {t('Хадгалах')}
                            </Button>
                            <Button size='sm' color="secondary" type="reset" outline onClick={handleModal}>
                                {t('Буцах')}
                            </Button>
                        </Col>
                    </Row>
                </ModalBody>
            </Modal>
        </Fragment>
	);
};
export default AddModal;
