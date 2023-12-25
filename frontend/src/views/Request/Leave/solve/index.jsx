
import React, { Fragment, useState } from 'react'

import { Row, Col, Form, Modal, Input, Label, Button, ModalBody, ModalHeader, FormFeedback } from "reactstrap";
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from "react-hook-form";

import useApi from "@hooks/useApi";
import useLoader from "@hooks/useLoader";

export default function Solve({ isOpen, handleModal, datas, getDatas, unit })
{
    const { t } = useTranslation()

    const menu_id = 'complaint4'

    const [ acceptRadio, setAcceptRadio ] = useState(true)
    const [ declineRadio, setDeclineRadio ] = useState(false)

    // ** Hook
    const { control, handleSubmit, formState: { errors }, reset } = useForm({});

    // Loader
	const { Loader, isLoading, fetchData } = useLoader({ isFullScreen: false });

    // Api
    const studentComplaintLeaveApi = useApi().request.leave

    async function onSubmit(cdata)
    {
        cdata.is_confirm = acceptRadio ? true : declineRadio ? false : false
        cdata.request = datas.id
        cdata.unit = unit

        const { success, error } = await fetchData(studentComplaintLeaveApi.post(cdata, menu_id))
        if (success)
        {
            reset()
            handleModal()
            getDatas()
        }
	}

    return (
        <Fragment>
            <Modal
                isOpen={isOpen}
                toggle={handleModal}
                className="modal-dialog-centered modal-lg"
                contentClassName="pt-0"
            >
                <ModalHeader className='bg-transparent pb-0' toggle={handleModal}></ModalHeader>

                <ModalBody className="px-sm-3 pt-50 pb-3">
                    <div className='text-center mb-2'>
                        <h4>{t('Чөлөөний төрөл шийдвэрлэх')}</h4>
                    </div>

                    <Row tag={Form} className="gy-1" onSubmit={handleSubmit(onSubmit)}>
                        <Col md={6}>
                            <Label className="form-label" for="accept">
                                <Input
                                    id="accept"
                                    name='is_confirm'
                                    bsSize="md"
                                    type="radio"
                                    defaultChecked={acceptRadio}
                                    onClick={() => { setAcceptRadio(true); setDeclineRadio(false) }}
                                />
                                <span className='ms-1'>{t('Зөвшөөрөх')}</span>
                            </Label>
                        </Col>
                        <Col md={6}>
                            <Label className="form-label" for="decline">
                                <Input
                                    id="decline"
                                    name='is_confirm'
                                    bsSize="md"
                                    type="radio"
                                    defaultChecked={declineRadio}
                                    onClick={() => { setAcceptRadio(false); setDeclineRadio(true) }}
                                />
                                    <span className='ms-1'>{t('Татгалзах')}</span>
                            </Label>
                        </Col>
                        <Col md={12}>
                            <Label className="form-label" for="message">
                                {t('Шийдвэрийн тайлбар')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id="message"
                                name="message"
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        id="message"
                                        bsSize="sm"
                                        placeholder={t('Шийдвэрийн тайлбар')}
                                        type="textarea"
                                        invalid={errors.message && true}
                                        rows={'6'}
                                    />
                                )}
                            />
                            {errors.message && <FormFeedback className='d-block'>{t(errors.message.message)}</FormFeedback>}
                        </Col>
                        <Col md={12} className="text-center mt-2">
                            <Button className="me-2" size='sm' color="primary" type="submit">
                                {t('Хадгалах')}
                            </Button>
                            <Button color="secondary" size='sm' type="reset" outline  onClick={handleModal}>
                                {t('Буцах')}
                            </Button>
                        </Col>
                    </Row>

                </ModalBody>
            </Modal>
        </Fragment>
    )
}
