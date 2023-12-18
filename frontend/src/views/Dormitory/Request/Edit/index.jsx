// ** React imports
import React, { Fragment, useState, useEffect, useCallback } from 'react'

import { X } from "react-feather";

import { useForm, Controller } from "react-hook-form";

import { Row, Col, Form, Modal, Label, Button, ModalBody, ModalHeader, FormFeedback, Spinner, Input } from "reactstrap";

import { useTranslation } from 'react-i18next';

import Select from 'react-select'
import classnames from 'classnames'
import useLoader from "@hooks/useLoader";
import { ReactSelectStyles, validate, get_state } from "@utils"
import {validateSchema} from  "../validateSchema";
import useApi from "@hooks/useApi";
import empty from "@src/assets/images/empty-image.jpg"
import '../style.css'


const EditModal = ({ open, handleEdit, editId, refreshDatas }) => {

    const { control, handleSubmit,  setValue, formState: { errors }, setError } = useForm(validate(validateSchema))

    const CloseBtn = <X className="cursor-pointer" size={15} onClick={handleEdit} />

    const [isDisabled, setDisabled] = useState(true)

    const { t } = useTranslation()

    // ** Hook

	// Loader
	const { Loader, isLoading, fetchData } = useLoader({isFullScreen: true});
	const { isLoading: editLoading, fetchData: editFetch } = useLoader({});

    // State
    const [inventory_option, setInventoryOption] = useState([])

    // зураг оруулах үед ашиглагдана
    const [file, setFile] = useState('')

    // зургууд харуулах үед ашиглагдана
    const [update_image, setImage]=useState([])
    const [image_new, setNewImage] = useState('')
    const [image_old, setOldImage] = useState('')

    // Api
	const InvRequestApi = useApi().dormitory.inv_request

      useEffect(
        () =>
        {
            getOneData()
        },
        []
    )

    // Шинэ зураг дээр дарахад
    const clickNewImage = () => {
        var logoInput = document.getElementById(`logoInput1`)
        logoInput.click()
    }

    async function getOneData() {
        if (editId){
            const { success, data } = await fetchData(InvRequestApi.getOne(editId))
            if(success) {
                setOldImage(data?.image_old)
                setNewImage(data?.image_new)

                // засах үед дата байх юм бол setValue-р дамжуулан утгыг харуулна
                if(data === null) return
                for(let key in data) {

                    if(data[key] !== null)
                        setValue(key, data[key])

                    else setValue(key, '')

                    if(key === 'employee'){
                        setValue(key, data[key]?.id)
                    }
                    // if(key === 'inventory'){
                    //     setValue(key, data[key]?.id)
                    // }
                }
            }
        }
    }

    const handleDeleteNewImage = () => {
        setFile('')
        setImage([])
    }

    const onChange = (e) => {
		const reader = new FileReader()
        const files = e.target.files
        if (files && files.length > 0) {
            setFile(files[0])
            reader.onload = function () {
                setImage(reader.result)

            }
            reader.readAsDataURL(files[0])
        }
        setNewImage('')
	}

    async function onSubmit(cdatas) {
        if(editId){
            const formData = new FormData()
            for (let key in cdatas) {
                formData.append(key, cdatas[key])
            }

            if (file) {
                formData.append('update_new', file)
            }

            const { success, error } = await editFetch(InvRequestApi.put(formData, editId))
            if(success) {
                handleEdit()
                refreshDatas()
            } else {
                /** Алдааны мессэжийг input дээр харуулна */
                for (let key in error) {
                    setError(error[key].field, { type: 'custom', message:  error[key].msg});
                }
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
                toggle={handleEdit}
                className="modal-dialog-centered modal-lg"
                contentClassName="pt-0"
                onClosed={handleEdit}
            >
                <ModalHeader
                    className="bg-transparent pb-0"
                    toggle={handleEdit}
                    close={CloseBtn}
                    tag="div"
                >
                </ModalHeader>
                <ModalBody className="px-sm-3 pt-30 pb-3">
                    <div className='text-center'>
                        <h4>{t('Бараа материалын хүсэлт засах')}</h4>
                    </div>
                    <Row tag={Form} className="gy-1" onSubmit={handleSubmit(onSubmit)}>
                        <Col md={6} sm={6} >
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
                                            placeholder="Барааны нэр"
                                            invalid={errors.name && true}
                                            isDisabled={true}
                                            readOnly={true}
                                        />
                                    )
                                }}
                            />
                            {errors.name && <FormFeedback className='d-block'>{errors.name.message}</FormFeedback>}
                        </Col>
                        <Col md={6} sm={6} >
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
                                            placeholder="Тоо хэмжээ"
                                            invalid={errors.amount && true}
                                            isDisabled={true}
                                            readOnly={true}
                                        />
                                    )
                                }}
                            />
                            {errors.amount && <FormFeedback className='d-block'>{errors.amount.message}</FormFeedback>}
                        </Col>
                        <Col md={6} sm={6} >
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
                                            placeholder="Тайлбар"
                                            invalid={errors.description && true}
                                        />
                                    )
                                }}
                            />
                            {errors.description && <FormFeedback className='d-block'>{errors.description.message}</FormFeedback>}
                        </Col>
                        <Col md={6} sm={6} >
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
                                            isDisabled={true}
                                            readOnly={true}
                                        />
                                    )
                                }}
                            />
                            {errors.deadline && <FormFeedback className='d-block'>{t(errors.deadline.message)}</FormFeedback>}
                        </Col>
                        <Col md={6} sm={6}>
                            <Label for='image_old'>
                               Гэмтсэн бараа
                            </Label>
                            <div className="d-flex custom-flex">
                                <div className="orgLogoDiv mt-1">
                                    <img id={`logoImg${image_old}`} src = { image_old ? image_old  : empty }/>
                                    <input
                                        accept="image/*"
                                        type="file"
                                        id={`logoInput${image_old}`}
                                        name="image_old"
                                        className="form-control d-none"
                                        disabled={true}
                                    />
                                </div>
                            </div>
                        </Col>
                        <Col md={6} sm={6}>
                            <Label for='image_new'>
                               Шинэ бараа
                            </Label>
                                <div className="d-flex custom-flex">
                                    <div className="me-2">
                                        <div className='d-flex justify-content-end' onClick={() => {handleDeleteNewImage(image_new)}}>
                                            <X size={15} color='red' className=''></X>
                                        </div>
                                        <div className="orgLogoDiv image-responsive">
                                            <img id={`logoImg${image_new}`} className="image-responsive" src = { image_new ? image_new : file ? update_image : empty } onClick={() => {clickNewImage()}}/>
                                            <input
                                                accept="image/*"
                                                type="file"
                                                id={`logoInput1`}
                                                name="image_new"
                                                className="form-control d-none image-responsive"
                                                onChange={(e) => onChange(e)}
                                            />
                                        </div>
                                    </div>
                                </div>
                        </Col>
                        <Col md={12} className="text-center mt-2">
                            <Button className="me-2" color="primary" type="submit" disabled={editLoading}>
                                {editLoading &&<Spinner size='sm' className='me-1'/>}
                                {t('Хадгалах')}
                            </Button>
                            <Button color="secondary" type="reset" outline onClick={handleEdit}>
                                {t('Буцах')}
                            </Button>
                        </Col>
                    </Row>
                </ModalBody>
            </Modal>
        </Fragment>
    )
};

export default EditModal;
