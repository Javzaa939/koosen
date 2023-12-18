import React, { Fragment, useEffect } from 'react'
import {
    Modal,
    ModalHeader,
    ModalBody,
    Form,
    Row,
    Col,
    Label,
    Input,
    Button,
    FormFeedback
} from 'reactstrap'

import { X } from 'react-feather';
import { t } from 'i18next';

import useApi from "@hooks/useApi";
import useLoader from "@hooks/useLoader";

import { validate, convertDefaultValue } from "@utils"

import { Controller, useForm } from "react-hook-form"

import * as Yup from 'yup'

export const validateSchema = Yup.object().shape(
{
    name: Yup.string()
        .trim()
        .required('Хоосон байна.'),
    command: Yup.string()
        .trim()
        .required('Хоосон байна.'),
});

export default function CrontabAdd({ isOpen, handleModal, refreshDatas, editData }) {

    const closeBtn = (
        <X className="cursor-pointer" size={15} onClick={handleModal} />
    );

    // ** Hook
	const { control, handleSubmit,  setValue, formState: { errors } } = useForm(validate(validateSchema))

    // API
    const crontabApi = useApi().role.crontab

    const { isLoading, fetchData, Loader } = useLoader({})

    async function onSubmit(cdatas) {
        cdatas = convertDefaultValue(cdatas)
        const { success } = await fetchData(crontabApi.post(cdatas))
        if (success) {
            refreshDatas()
            handleModal()
        }
    }

    useEffect(
        () =>
        {
            if (editData && Object.keys(editData).length > 0) {
                for(let key in editData) {
                    if(editData[key] !== null)
                        setValue(key, editData[key])
                    else setValue(key,'')

                    if(key ==='ctiming') {
                        var ctiming = editData[key]
                        for (let ckey in ctiming){
                            setValue(ckey, ctiming[ckey])
                        }
                    }
                }
            }
        },
        []
    )

    return (
        <Fragment>
            <Modal
                isOpen={isOpen}
                toggle={handleModal}
                className='sidebar-xl custom-80'
                modalClassName='modal-slide-in'
                contentClassName='pt-0'
            >
                <ModalHeader
                    className="mb-1"
                    toggle={handleModal}
                    close={closeBtn}
                    tag="div"
                >
                    <h5 className="modal-title">{"Crontab нэмэх"}</h5>
                </ModalHeader>
                <ModalBody className="flex-grow-1">
                    <h5>Тухайн команд болон ажиллуулах хугацааг заана</h5>
                    <ul>
                        <li><b>Өгөгдсөн</b> хугацаанд таны команд ажиллах болно.</li>
                        <li><b>Тоон</b> утгууд оруулна. Үүнд:</li>
                        <ul>
                            <li><b>Минут</b>&nbsp; нь 0-ээс 59 хооронд </li>
                            <li><b>Цаг</b>&nbsp;  нь 0-ээс 23 хооронд</li>
                            <li><b>Өдөр</b>&nbsp; нь 1-ээс 31 хооронд</li>
                            <li><b>Сар</b>&nbsp; нь 1-ээс 12 хооронд</li>
                            <li><b>Гараг</b>&nbsp; нь 0-ээс 6 хооронд</li>
                            <li><b>Command</b>&nbsp; нь ажиллуулах функцын замыг зааж өгнө. *app_name:function_name*. Жишээ: (settings:send-manage-attendance)</li>
                        </ul>
                    </ul>
                    <ul>
                        <li><b>(*)</b> Хоосон байж болох талбарууд</li>
                    </ul>
                    <hr/>
                    <Row tag={Form} className="gy-1" onSubmit={handleSubmit(onSubmit)}>
                        <Col md={6} sm={12}>
                            <Label className="form-label" for="name">
                                {t('Crontab нэр ')}
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
                                        placeholder='Нэрээ оруулна уу'
                                        invalid={errors.name && true}
                                    />
                                )}
                            />
                            {errors.name && <FormFeedback className='d-block'>{errors.name.message}</FormFeedback>}
                        </Col>
                        <Col md={6} sm={12}>
                            <Label className="form-label" for="command">
                                {t('Комманд')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id="command"
                                name="command"
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        id="command"
                                        bsSize="sm"
                                        type="text"
                                        placeholder='Комманд оруулна уу'
                                        invalid={errors.command && true}
                                    />
                                )}
                            />
                            {errors.command && <FormFeedback className='d-block'>{errors.command.message}</FormFeedback>}
                        </Col>
                        <Col md={2} sm={6} xs={12}>
                            <Label className="form-label" for="month">
                                {t('Сар*')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id="month"
                                name="month"
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        id="month"
                                        bsSize="sm"
                                        type="number"
                                        placeholder='*'
                                    />
                                )}
                            />
                        </Col>
                        <Col md={2} sm={6} xs={12}>
                            <Label className="form-label" for="week">
                                {t('Гариг*')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id="week"
                                name="week"
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        id="week"
                                        bsSize="sm"
                                        type="number"
                                        placeholder='*'
                                    />
                                )}
                            />
                        </Col>
                        <Col md={2} sm={6} xs={12}>
                            <Label className="form-label" for="day">
                                {t('Өдөр*')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id="day"
                                name="day"
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        id="day"
                                        bsSize="sm"
                                        type="number"
                                        placeholder='*'
                                    />
                                )}
                            />
                        </Col>
                        <Col md={2} sm={6} xs={12}>
                            <Label className="form-label" for="hour">
                                {t('Цаг')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id="hour"
                                name="hour"
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        id="hour"
                                        bsSize="sm"
                                        type="number"
                                    />
                                )}
                            />
                        </Col>
                        <Col md={2} sm={6} xs={12}>
                            <Label className="form-label" for="minute">
                                {t('Минут')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id="minute"
                                name="minute"
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        id="minute"
                                        bsSize="sm"
                                        type="number"
                                    />
                                )}
                            />
                        </Col>
                        <Col md={6} sm={12}>
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
                                        type="textarea"
                                    />
                                )}
                            />
                        </Col>
                        <Col md={6} sm={12} className='d-flex align-items-center mt-1'>
                            <Controller
                                control={control}
                                id="is_active"
                                name="is_active"
                                render={({ field }) => (
                                    <div className='form-switch'>
                                        <Input
                                            id="is_active"
                                            type="switch"
                                            defaultChecked={field.value}
                                            {...field}
                                        />
                                        <Label className='form-check-label' for='is_active'>
                                        </Label>
                                    </div>
                                )}
                            />
                            <Label className="form-label" for="is_active">
                                {t('Идэвхжүүлэх')}
                            </Label>
                        </Col>
                        <Col
                            className="d-flex justify-content-start mx-0 mt-1"
                            xs={12}
                        >
                            <Button className="mt-1 me-1" color="primary" type="submit">
                                {t('Хадгалах')}
                            </Button>
                            <Button
                                className="mt-1"
                                color="secondary"
                                outline
                                onClick={handleModal}
                            >
                                {t('Болих')}
                            </Button>
                        </Col>
                    </Row>
                </ModalBody>
            </Modal>
        </Fragment>
    )
}
