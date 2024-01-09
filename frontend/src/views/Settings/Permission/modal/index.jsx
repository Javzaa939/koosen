import React, { Fragment } from 'react'

import { X } from "react-feather";

import useApi from "@hooks/useApi";
import useLoader from "@hooks/useLoader";
import  useUpdateEffect  from '@hooks/useUpdateEffect'

import { useTranslation } from 'react-i18next';

import { useForm, Controller } from "react-hook-form";

import { Row, Col, Form, Modal, Input, Label, Button, ModalBody, ModalHeader, FormFeedback, Spinner } from "reactstrap";

import { validate } from "@utils"

import { validateSchema } from './validateSchema';


export default function PermissionModal({ open, handleModal, refreshDatas, editValue })
{
    const { t } = useTranslation()

    const CloseBtn = (
        <X className="cursor-pointer" size={15} onClick={handleModal} />
    )

    // ** Hook
    const { control, handleSubmit, formState: { errors }, reset, setError, setValue } = useForm(validate(validateSchema));

	// Loader
	const { isLoading, fetchData } = useLoader({});

    // Api
    const permissionApi = useApi().settings.permission

	async function onSubmit(cdata)
    {
        const { success, errors } = await fetchData(editValue ? permissionApi.put(editValue.id, cdata) : permissionApi.post(cdata))
        if(success)
        {
            reset()
            refreshDatas()
            handleModal()
        }
        else
        {
            /** Алдааны мессэжийг input дээр харуулна */
            for (let error of errors)
            {
                setError(error.field, { type: 'custom', message:  error.msg});
            }
        }
	}

    useUpdateEffect(
        () =>
        {
            reset()

            /** Update дарах үеийн мэдээллийг input-д оноох */
            if (editValue != null)
            {
                for(let key in editValue)
                {
                    setValue(key, editValue[key])
                }
            }
        },
        [open]
    )

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
                    <h5 className="modal-title">{t(`Эрх ${editValue ? 'засах' : 'бүртгэх'} `)}</h5>
                </ModalHeader>
                <ModalBody className="flex-grow-1">
                    <Row tag={Form} className="gy-1" onSubmit={handleSubmit(onSubmit)}>
                        <Col md={12}>
                            <Label className="form-label" for="name">
                                {t('Нэр')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id="name"
                                name="name"
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        id="name"
                                        bsSize="sm"
                                        type="text"
                                        placeholder={t('Нэр')}
                                        invalid={errors.name && true}
                                        // onKeyDown={(e) =>["e", "E", "+", "-", "."].includes(e.key) && e.preventDefault()}
                                    />
                                )}
                            />
                            {errors.name && <FormFeedback className='d-block'>{t(errors.name.message)}</FormFeedback>}
                        </Col>
                        <Col md={12}>
                            <Label className="form-label" for="description">
                                {t('Тайлбар')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id="description"
                                name="description"
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        id="description"
                                        bsSize="sm"
                                        placeholder={t('Тайлбар')}
                                        type="textarea"
                                        invalid={errors.description && true}
                                        rows={'6'}
                                    />
                                )}
                            />
                            {errors.description && <FormFeedback className='d-block'>{t(errors.description.message)}</FormFeedback>}
                        </Col>
                        <Col md={12} className="mt-2">
                            {isLoading ?
                                <Button className="me-2" color="primary" type="submit" disabled>
                                    <Spinner size='sm'/>
                                </Button>
                            :
                                <Button className="me-2" color="primary" type="submit">
                                    {t('Хадгалах')}
                                </Button>
                            }
                            <Button color="secondary" type="reset" outline  onClick={handleModal}>
                                {t('Буцах')}
                            </Button>
                        </Col>
                    </Row>
                </ModalBody>
            </Modal>
        </Fragment>
    )
}
