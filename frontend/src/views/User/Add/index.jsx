// ** React imports
import React, { Fragment, useState } from 'react'
import { useNavigate } from "react-router-dom";

import { X } from "react-feather";

import useApi from "@hooks/useApi";
import useLoader from "@hooks/useLoader";

import { useForm, Controller } from "react-hook-form";

import {
	Form,
	Modal,
	Input,
	Label,
	Button,
    Spinner,
	ModalBody,
	ModalHeader,
	FormFeedback,
} from "reactstrap";

// ** Styles
import "@styles/react/libs/flatpickr/flatpickr.scss";

import { validate, convertDefaultValue } from "@utils"
import { validateSchema } from '../validationSchema';

const Addmodal = ({ open, handleModal }) => {
    const CloseBtn = (
        <X className="cursor-pointer" size={15} onClick={handleModal} />
    )

    const usenavigate = useNavigate()

    // ** Hook
    const {
        control,
        handleSubmit,
        formState: { errors },
        setError,
    } = useForm(validate(validateSchema));

    // states
    const [is_loading, setLoader] = useState(false)

	// Loader
	const { Loader, isLoading, fetchData } = useLoader({});

	//  API
	const userApi= useApi().user

	async function onSubmit(cdata) {
        setLoader(true)

		cdata = convertDefaultValue(cdata)

		const { success, data, error } = await fetchData(userApi.post(cdata))
        setLoader(false)

		if (success) {
            usenavigate(`/user/${data.id}/`)
		} else {
            for (let key in error) {
                setError(key, { type: 'custom', message:  error[key]});
            }
        }

	}

	return (
        <Fragment>
            {
                is_loading &&
                    <div className='suspense-loader'>
                        <Spinner size='bg'/>
                        <span className='ms-50'>Түр хүлээнэ үү...</span>
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
                    <h5 className="modal-title">Хэрэглэгч нэмэх</h5>
                </ModalHeader>
                <ModalBody className="flex-grow-1">
                    <Form onSubmit={handleSubmit(onSubmit)}>
                        <div className="mb-2">
                            <Label className="form-label" for="username">
                            Нэвтрэх нэр
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id="username"
                                name="username"
                                render={({ field }) => (
                                    <Input
                                        id ="username"
                                        bsSize="sm"
                                        placeholder="Нэвтрэх нэр"
                                        {...field}
                                        invalid={errors.username && true}
                                    />
                                )}
                            />
                            {errors.username && <FormFeedback className='d-block'>{errors.username.message}</FormFeedback>}
                        </div>
                        <div className="mb-2">
                            <Label className="form-label" for="first_name">
                            Хэрэглэгчийн нэр
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id="first_name"
                                name="first_name"
                                render={({ field }) => (
                                    <Input
                                        id ="first_name"
                                        bsSize="sm"
                                        placeholder="Хэрэглэгчийн нэр"
                                        {...field}
                                        invalid={errors.first_name && true}
                                    />
                                )}
                            />
                            {errors.first_name && <FormFeedback className='d-block'>{errors.first_name.message}</FormFeedback>}
                        </div>
                        <div className="mb-2">
                            <Label className="form-label" for="last_name">
                            Хэрэглэгчийн овог
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id="last_name"
                                name="last_name"
                                render={({ field }) => (
                                    <Input
                                        id ="last_name"
                                        bsSize="sm"
                                        placeholder="Хэрэглэгчийн овог"
                                        {...field}
                                        invalid={errors.last_name && true}
                                    />
                                )}
                            />
                            {errors.last_name && <FormFeedback className='d-block'>{errors.last_name.message}</FormFeedback>}
                        </div>
                        <div className="mb-2">
                            <Label className="form-label" for="register">
                            Регистрийн дугаар
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id="register"
                                name="register"
                                render={({ field }) => (
                                    <Input
                                        id ="register"
                                        bsSize="sm"
                                        placeholder="Регистрийн дугаар"
                                        {...field}
                                        invalid={errors.register && true}
                                    />
                                )}
                            />
                            {errors.register && <FormFeedback className='d-block'>{errors.register.message}</FormFeedback>}
                        </div>
                        <div className="mb-2">
                            <Label className="form-label" for="phone_number">
                                Утасны дугаар
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
                                        placeholder="Утасны дугаар"
                                        {...field}
                                        type='number'
                                        onKeyDown={(e) =>["e", "E", "+", "-"].includes(e.key) && e.preventDefault()}
                                        invalid={errors.phone_number && true}
                                    />
                                )}
                            />
                            {errors.phone_number && <FormFeedback className='d-block'>{errors.phone_number.message}</FormFeedback>}
                        </div>
                        <div className="mb-2">
                            <Label className="form-label" for="email">
                                И-мэйл
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
                                        placeholder="И-мэйл"
                                        {...field}
                                        invalid={errors.email && true}
                                    />
                                )}
                            />
                            {errors.email && <FormFeedback className='d-block'>{errors.email.message}</FormFeedback>}
                        </div>
                        <div  className="mb-2">
                            <Label className="form-label  me-1" for="is_superuser">
                                Админ эсэх
                            </Label>
                            <Controller
                                control={control}
                                id="is_superuser"
                                name="is_superuser"
                                defaultValue={false}
                                render={({ field }) => (
                                    <Input
                                        id="is_superuser"
                                        type="checkbox"
                                        defaultChecked={field.value}
                                        {...field}
                                    />
                                )}
                            />
                        </div>
                        <div  className="mb-2">
                            <Label className="form-label me-1" for="is_active">
                                Идэвхтэй эсэх
                            </Label>
                            <Controller
                                control={control}
                                id="is_active"
                                name="is_active"
                                defaultValue={false}
                                render={({ field }) => (
                                    <Input
                                        id="is_active"
                                        type="checkbox"
                                        defaultChecked={field.value}
                                        {...field}
                                    />
                                )}
                            />
                        </div>
                        <Button className="me-2" color="primary" type="submit">
                            Хадгалах
                        </Button>
                        <Button color="secondary" type="reset" outline  onClick={handleModal}>
                            Буцах
                        </Button>
                    </Form>
                </ModalBody>
            </Modal>
        </Fragment>
	);
};
export default Addmodal;
