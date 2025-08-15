import {
    Row,
    Col,
    Modal,
	Form,
	Input,
	Label,
	Button,
    ModalBody,
	ModalHeader,
    Spinner,
} from "reactstrap";
import { t } from 'i18next';
import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';
import { useForm, Controller } from "react-hook-form";
import React, { Fragment, useEffect, useState} from 'react'
import { X } from "react-feather";

const UpdateModal = ({ open, handleEdit, refreshDatas, datas }) => {
    const editId = datas?.id

    const CloseBtn = (
        <X className="cursor-pointer" size={15} onClick={handleEdit} />
    )

    // Loader
    const {isLoading, fetchData } = useLoader({})

    const { control, handleSubmit, setValue, setError, formState: { errors } } = useForm();

    // Api
    const getSchoolApi = useApi().hrms.school

    async function getDatas() {
        if(editId) {
            const { success, data } = await fetchData(getSchoolApi.getOne(editId))

            if(success) {
                // засах үед дата байх юм бол setValue-р дамжуулан утгыг харуулна
                if(data === null) return

                for (const key in data) {
                    if (key === 'logo') continue
                    if(data[key] !== null) setValue(key, data[key])
                    else setValue(key, '')
                }
            }
        }
    }

    useEffect(() => {
        getDatas()
    },[open])

    async function onSubmit(cdata) {
        if(editId) {
            cdata['logo'] = image
            const formData = new FormData()
            Object.keys(cdata).forEach(key => formData.append(key, cdata[key]))
            const { success, errors } = await fetchData(getSchoolApi.put(formData, editId))

            if(success) {
                refreshDatas()
                handleEdit()
            } else {
                /** Алдааны мессэжийг input дээр харуулна */
                for (let key in errors) {
                    setError(errors[key], { type: 'custom', message:  errors[key]});
                }
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
                toggle={handleEdit}
                className="sidebar-md"
                modalClassName='modal-slide-in'
                contentClassName='pt-0'
            >
                {
                    isLoading &&
                        <div className='suspense-loader'>
                            <Spinner size='bg'/>
                            <span className='ms-50'>{t('Түр хүлээнэ үү')}...</span>
                        </div>
                }

                <ModalHeader
                    className="mb-1"
                    toggle={handleEdit}
                    close={CloseBtn}
                    tag="div"
                >
                    <h5 className="modal-title">{t('Сургуулийн мэдээлэл засах')}</h5>
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
                            <Button className="me-2" size='sm' color="primary" type="submit">
                                {t('Хадгалах')}
                            </Button>
                        </Col>
                    </Row>
                </ModalBody>
            </Modal>
        </Fragment>
	);
};
export default UpdateModal;
