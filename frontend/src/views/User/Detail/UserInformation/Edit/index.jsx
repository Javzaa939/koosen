import React, { useState, useEffect, useContext } from "react";

import {useForm, Controller } from "react-hook-form"

import {
    Row,
    Col,
    Modal,
    ModalHeader,
    ModalBody,
    Button,
    Spinner,
    Form,
    FormFeedback,
    Label,
    Input
} from "reactstrap";

import { Check, X } from 'react-feather'

import useApi from "@hooks/useApi";
import useLoader from "@hooks/useLoader";

import { validateSchema } from "../../../validationSchema"
import { validate, convertDefaultValue} from "@utils"

import AuthContext from '@context/AuthContext'


const EditModal = ({ show, handleModal, userData, isAdmin }) => {

    const [featuredImg, setFeaturedImg] = useState(userData?.avatar)
    const [image, setImage] = useState('')
    const { setUser } = useContext(AuthContext)

    // ** Hooks
	const { control, setValue, handleSubmit, formState: { errors }, setError } = useForm(validate(validateSchema))

	// Loader
    const { fetchData, isLoading } = useLoader({})

    const [is_loading, setLoader] = useState(false)

	// API
	const userApi = useApi().user

    // Зураг авах функц
	const onChange = (e) => {
		const reader = new FileReader()
        const files = e.target.files

        if (files.length > 0) {
            setImage(files)
            reader.onload = function () {
                setFeaturedImg(reader.result)
            }
            reader.readAsDataURL(files[0])
        }
	}

    // TODO: зураг устгахад ашиглах
    const handleImgReset = () => {
        setFeaturedImg(detault_img)
    }

	async function onSubmit(cdata) {
		cdata = convertDefaultValue(cdata)

        const formData = new FormData()

        Object.keys(cdata).map(key => {
            if (key !== "avatar") formData.append(key, cdata[key])
        })

        if (image && image.length > 0) {
            formData.append('avatar', image[0])
        }

        const { success, data, error } = await fetchData(userApi.put(formData, cdata.id))
        if (success) {
			handleModal()
            setUser(data)
        } else {
            for (let key in error) {
                setError(key, { type: 'custom', message:  error[key]});
            }
        }
    }

    useEffect(()=>{
        handleEdit()
    }, [])

    const handleEdit = () => {
        // засах үед дата байх юм бол setValue-р дамжуулан утгыг харуулна
        if (userData === null) return

        for (let key in userData) {
            if (userData[key]!== null)
                setValue(key, userData[key])
            else
                setValue(key,'')
        }
    }

    return (
        <>
        {
            isLoading && !is_loading &&
            <div className='suspense-loader'>
                <Spinner size='bg'/>
                <span className='ms-50'>Түр хүлээнэ үү...</span>
            </div>
        }
		<Modal isOpen={show} toggle={handleModal} className="modal-dialog-centered modal-lg" onClosed={handleModal}>
            <ModalHeader className='bg-transparent' toggle={handleModal}></ModalHeader>
                <ModalBody className='px-sm-5 pt-50 pb-5'>
                    <div className='text-center mb-2'>
                        <h1 className='mb-1'>Хэрэглэгчийн мэдээлэл засах</h1>
                    </div>
                    <Row tag={Form} onSubmit={handleSubmit(onSubmit)}>
                        <Col xs={12} md={6}>
                            <Label className="form-label" for="username">
                            Нэвтрэх нэр
                            </Label>
                            <Controller
                                name="username"
                                id="username"
                                control={control}
                                defaultValue=""
                                render={({ field }) => {
                                    return (
                                        <Input
                                            {...field}
                                            invalid={errors.username && true}
                                            type="text"
                                            name="username"
                                            bsSize="sm"
                                            id="username"
                                        />
                                    );
                                }}
                            />
                            {errors.username && <FormFeedback className="d-block">{errors.username.message}</FormFeedback>}
                        </Col>
                        <Col xs={12} md={6}>
                            <Label className="form-label" for="last_name">
                            Хэрэглэгчийн овог
                            </Label>
                            <Controller
                                name="last_name"
                                id="last_name"
                                control={control}
                                defaultValue=""
                                render={({ field }) => {
                                    return (
                                        <Input
                                            {...field}
                                            invalid={errors.last_name && true}
                                            type="text"
                                            name="last_name"
                                            bsSize="sm"
                                            id="last_name"
                                        />
                                    );
                                }}
                            />
                            {errors.last_name && <FormFeedback className="d-block">{errors.last_name.message}</FormFeedback>}
                        </Col>
                        <Col xs={12} md={6}>
                            <Label className="form-label" for="first_name">
                            Хэрэrлэгчийн нэр
                            </Label>
                            <Controller
                                name="first_name"
                                id="first_name"
                                control={control}
                                defaultValue=""
                                render={({ field }) => {
                                    return (
                                        <Input
                                            {...field}
                                            invalid={errors.first_name && true}
                                            type="text"
                                            name="first_name"
                                            bsSize="sm"
                                            id="first_name"
                                        />
                                    );
                                }}
                            />
                            {errors.first_name && <FormFeedback className="d-block">{errors.first_name.message}</FormFeedback>}
                        </Col>
                        <Col xs={12} md={6}>
                            <Label className="form-label" for="register">
                            Регистрийн дугаар
                            </Label>
                            <Controller
                                name="register"
                                id="register"
                                control={control}
                                defaultValue=""
                                render={({ field }) => {
                                    return (
                                        <Input
                                            {...field}
                                            invalid={errors.register && true}
                                            type="text"
                                            name="register"
                                            bsSize="sm"
                                            id="register"
                                        />
                                    );
                                }}
                            />
                            {errors.register && <FormFeedback className="d-block">{errors.register.message}</FormFeedback>}
                        </Col>
                        <Col xs={12} md={6}>
                            <Label className="form-label" for="email">
                            И-мэйл
                            </Label>
                            <Controller
                                name="email"
                                id="email"
                                control={control}
                                defaultValue=""
                                render={({ field }) => {
                                    return (
                                        <Input
                                            {...field}
                                            invalid={errors.email && true}
                                            type="text"
                                            name="email"
                                            bsSize="sm"
                                            id="email"
                                        />
                                    );
                                }}
                            />
                            {errors.email && <FormFeedback className="d-block">{errors.email.message}</FormFeedback>}
                        </Col>
                        <Col xs={12} md={6}>
                            <Label className="form-label" for="phone_number">
                            Утасны дугаар
                            </Label>
                            <Controller
                                name="phone_number"
                                id="phone_number"
                                control={control}
                                defaultValue=""
                                render={({ field }) => {
                                    return (
                                        <Input
                                            {...field}
                                            invalid={errors.phone_number && true}
                                            type="text"
                                            name="phone_number"
                                            bsSize="sm"
                                            id="phone_number"
                                        />
                                    );
                                }}
                            />
                            {errors.phone_number && <FormFeedback className="d-block">{errors.phone_number.message}</FormFeedback>}
                        </Col>
                        {
                            isAdmin && // Админ эсэх-ийг зөвхөн админ хэрэглэгч чээклэх боломжтой
                            <Col className='d-flex align-items-center mt-1' xs={12} md={6}>
                                <Controller
                                    control={control}
                                    id="is_superuser"
                                    name="is_superuser"
                                    render={({ field }) => (
                                        <div className='form-switch'>
                                            <Input
                                                id="is_superuser"
                                                type="switch"
                                                defaultChecked={field.value}
                                                {...field}
                                            />
                                            <Label className='form-check-label' for='is_superuser'>
                                                <span className='switch-icon-left'>
                                                    <Check size={14} />
                                                </span>
                                                <span className='switch-icon-right'>
                                                    <X size={14} />
                                                </span>
                                            </Label>
                                        </div>
                                    )}
                                />
                                <Label className="form-label" for="is_superuser">
                                    Админ эсэх
                                </Label>
                            </Col>
                        }
                        <Col className="d-flex align-items-center mt-1" xs={12} md={6}>
                            <Controller
                                control={control}
                                id="is_active"
                                name="is_active"
                                render={({ field }) => (
                                    <div className='form-switch'>
                                        <Input
                                            id="is_active"
                                            type="checkbox"
                                            defaultChecked={field.value}
                                            {...field}
                                        />
                                        <Label className='form-check-label' for='is_active'>
                                            <span className='switch-icon-left'>
                                                <Check size={14} />
                                            </span>
                                            <span className='switch-icon-right'>
                                                <X size={14} />
                                            </span>
                                        </Label>
                                    </div>
                                )}
                            />
                            <Label className="form-label pe-1" for="is_active">
                                Идэвхтэй эсэх
                            </Label>
                        </Col>
                        <Col className='mt-2' sm='12'>
                            <Label className="form-label pe-1" for="avatar">
                                Профайл зураг
                            </Label>
                            <div className='border rounded p-2'>
                                <div className='d-flex flex-column flex-md-row'>
                                {
                                    featuredImg &&
                                        <img
                                            className='rounded me-2 mb-1 mb-md-0'
                                            style={{objectFit: 'cover'}}
                                            src={featuredImg}
                                            alt='featured img'
                                            width='110'
                                            height='110'
                                        />

                                }
                                <div>
                                    <small className='text-muted me-1'>Зургийн хэмжээ 10mb-аас хэтрэхгүй байна.</small>
                                    <div className='d-inline-block'>
                                        <Controller
                                            control={control}
                                            id="image"
                                            name="image"
                                            render={({ field }) => {
                                                return (
                                                    <Input
                                                        {...field}
                                                        type='file'
                                                        id='image'
                                                        name='image'
                                                        onChange={(e) => onChange(e)}
                                                        accept='image/*'
                                                    />
                                                    )
                                                }}
                                        />
                                    </div>
                                </div>
                                </div>
                            </div>
                        </Col>
                        <Col
                            className="d-flex justify-content-center mx-0 mt-1"
                            xs={12}
                        >
                            <Button className="mt-1 me-1" color="primary" type="submit">
                                Хадгалах
                            </Button>
                            <Button
                                className="mt-1"
                                color="secondary"
                                outline
                                onClick={handleModal}
                            >
                                Болих
                            </Button>
                        </Col>
                    </Row>
                </ModalBody>
            </Modal>
        </>
    )
}

export default EditModal;
