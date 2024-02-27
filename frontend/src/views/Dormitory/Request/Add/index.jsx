// ** React imports
import React, { Fragment, useState, useEffect, useCallback, useContext } from 'react'

import { X } from "react-feather";

import { useForm, Controller } from "react-hook-form";

import { Row, Col, Form, Modal, Label, Button, ModalBody, ModalHeader, FormFeedback, Spinner } from "reactstrap";

import { useTranslation } from 'react-i18next';

import useApi from "@hooks/useApi";
import useLoader from "@hooks/useLoader";
import {Input}from "reactstrap";
import { validate, convertDefaultValue} from "@utils"

import {validateSchema} from  "../validateSchema";
import empty from "@src/assets/images/empty-image.jpg"
// style
import '../style.css'
import AuthContext from "@context/AuthContext"

const AddModal = ({ open, handleModal, refreshDatas }) => {

    const { control, handleSubmit,  setValue, formState: { errors }, setError, reset} = useForm(validate(validateSchema))

    const CloseBtn = <X className="cursor-pointer" size={15} onClick={handleModal} />

    const { t } = useTranslation()

	// Loader
	const { isLoading, fetchData } = useLoader({});
	const { isLoading: postLoading, fetchData: postFetch } = useLoader({});

    // State
    const [featurefile, setFeaturedImg] = useState('')
    const [image_old, setImageOld] = useState([])
    const { user } = useContext(AuthContext)
    // Api
	const dormitoryInvRequestApi = useApi().dormitory.inv_request

    // Зураг дээр дарахад
    const clickLogoImage = () =>
    {
        var logoInput = document.getElementById(`logoInput1`)
        logoInput.click()

    }

    const handleDeleteImage = () =>
        {
            setFeaturedImg('')
            setImageOld([])
        }


    const onChange = (e) => {
		const reader = new FileReader()
        const files = e.target.files
        if (files.length > 0) {
            setFeaturedImg(files[0])
            reader.onload = function () {
                setImageOld(reader.result)
            }
            reader.readAsDataURL(files[0])
        }
	}

    async function onSubmit(cdatas) {
        cdatas['employee'] = user.id

		cdatas = convertDefaultValue(cdatas)
        const formData = new FormData()

        for (let key in cdatas)
        {
            formData.append(key, cdatas[key])
        }
        formData.append("image_old", featurefile)

        const { success, error, errors } = await postFetch(dormitoryInvRequestApi.post(formData))
        if(success) {
            reset()
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
            {
                isLoading &&
                <div className='suspense-loader'>
                    <Spinner size='bg'/>
                    <span className='ms-50'>{t('Түр хүлээнэ үү...')}</span>
                </div>
            }
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
                    <h5 className="modal-title">{t('Шаардах хуудас илгээх')}</h5>
                </ModalHeader>
                <ModalBody className="flex-grow-1">
                    <Row tag={Form} className="gy-1" onSubmit={handleSubmit(onSubmit)}>
                        <Col md={12} sm={12} className='mt-1'>
                            <Label for="name">{t('Барааны нэр')}</Label>
                            <Controller
                                control={control}
                                defaultValue=''
                                name="name"
                                render={({ field }) => {
                                    return (
                                        <Input
                                            {...field}
                                            id="name"
                                            bsSize="sm"
                                            type="name"
                                            placeholder="барааны нэр"
                                            invalid={errors.name && true}
                                        />
                                    )
                                }}
                            />
                            {errors.name && <FormFeedback className='d-block'>{errors.name.message}</FormFeedback>}
                        </Col>
                        <Col md={12} sm={12} className='mt-1'>
                            <Label for="amount">{t('Тоо хэмжээ')}</Label>
                            <Controller
                                control={control}
                                defaultValue=''
                                name="amount"
                                render={({ field }) => {
                                    return (
                                        <Input
                                            {...field}
                                            id="amount"
                                            bsSize="sm"
                                            type="amount"
                                            placeholder="тоо хэмжээ"
                                            invalid={errors.amount && true}
                                        />
                                    )
                                }}
                            />
                            {errors.amount && <FormFeedback className='d-block'>{errors.amount.message}</FormFeedback>}
                        </Col>
                        <Col md={12} sm={12} className='mt-1'>
                            <Label for="description">{t('Тайлбар')}</Label>
                            <Controller
                                control={control}
                                defaultValue=''
                                name="description"
                                render={({ field }) => {
                                    return (
                                        <Input
                                            {...field}
                                            id="description"
                                            bsSize="sm"
                                            type="textarea"
                                            invalid={errors.description && true}
                                        />
                                    )
                                }}
                            />
                            {errors.description && <FormFeedback className='d-block'>{errors.description.message}</FormFeedback>}
                        </Col>
                         <Col md={12} >
                            <Label for='deadline'>
                                Бэлэн байх шаардлагатай огноо
                            </Label>
                            <Controller
                                name='deadline'
                                control={control}
                                defaultValue=''
                                render={({ field }) => {
                                    return (
                                        <Input
                                            {...field}
                                            invalid={errors.deadline && true}
                                            id='deadline'
                                            type="date"
                                            bsSize='sm'
                                        />
                                    )
                                }}
                            />
                            {errors.deadline && <FormFeedback className='d-block'>{t(errors.deadline.message)}</FormFeedback>}
                        </Col>
                        <Col md={12} className='mt-1'>
                            <Label for='image_old'>
                               Гэмтсэн бараа
                            </Label>
                                <div className="d-flex custom-flex">
                                    <div className="me-2">
                                        <div className='d-flex justify-content-end' onClick={() => {handleDeleteImage(image_old)}}>
                                            <X size={15} color='red' className=''></X>
                                        </div>
                                        <div className="orgLogoDiv image-responsive">
                                            <img id={`logoImg${image_old}`} className="image-responsive" src = { featurefile ? image_old : empty  } onClick={() => {clickLogoImage()}}/>
                                            <input
                                                accept="image/*"
                                                type="file"
                                                id={`logoInput1`}
                                                name="image_old"
                                                className="form-control d-none image-responsive"
                                                onChange={(e) => onChange(e)}
                                            />
                                        </div>
                                    </div>
                                </div>
                        </Col>
                        <Col md={12} className="mt-2">
                            <Button className="me-2" color="primary" type="submit" disabled={postLoading}>
                            {postLoading &&<Spinner size='sm' className='me-1'/>}
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

export default AddModal;
