// ** React imports
import React, { Fragment } from 'react'

import { X } from "react-feather";

import useApi from "@hooks/useApi";
import useLoader from "@hooks/useLoader";

import { useTranslation } from 'react-i18next';

import { useForm, Controller } from "react-hook-form";

import { Row, Col, Form, Modal, Input, Label, Button, ModalBody, ModalHeader, FormFeedback, Spinner } from "reactstrap";

import { validate } from "@utils"

import { validateSchema } from '../validateSchema';
import EditModal from '../../../Dormitory/Rooms/Edit';

const Addmodal = ({ open, handleModal, refreshDatas, editId }) => {

    const { t } = useTranslation()

    const CloseBtn = (
        <X className="cursor-pointer" size={15} onClick={handleModal} />
    )

    // ** Hook
    const { control, handleSubmit, formState: { errors }, reset, setError } = useForm(validate(validateSchema));

	// Loader
	const { Loader, isLoading, fetchData } = useLoader({});

    // Api
    const buildingApi = useApi().timetable.building

	async function onSubmit(cdata) {
        if(editId){
            const { success, error } = await fetchData(buildingApi.put(cdata, editId))
            if(success) {
                reset()
                refreshDatas()
                handleModal()
            } else {
                /** Алдааны мессэжийг input дээр харуулна */
                for (let key in error['error']) {
                    setError(key, { type: 'custom', message:  error['msg']});
                }
            }
        }
        else{
            const { success, error } = await fetchData(buildingApi.post(cdata))
            if(success) {
                reset()
                refreshDatas()
                handleModal()
            } else {
                /** Алдааны мессэжийг input дээр харуулна */
                for (let key in error['error']) {
                    setError(key, { type: 'custom', message:  error['msg']});
                }
            }
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
                    {editId? <h5 className="modal-title">{t('Хичээлийн байр засах')}</h5> :<h5 className="modal-title">{t('Хичээлийн байр бүртгэх')}</h5>}
                </ModalHeader>
                <ModalBody className="flex-grow-1">
                    <Row tag={Form} className="gy-1" onSubmit={handleSubmit(onSubmit)}>
                        <Col md={12}>
                            <Label className="form-label" for="code">
                                {t('Код')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id="code"
                                name="code"
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        id="code"
                                        bsSize="sm"
                                        type="number"
                                        placeholder={t('Код')}
                                        invalid={errors.code && true}
                                        onKeyDown={(e) =>["e", "E", "+", "-", "."].includes(e.key) && e.preventDefault()}
                                    />
                                )}
                            />
                            {errors.code && <FormFeedback className='d-block'>{t(errors.code.message)}</FormFeedback>}
                        </Col>
                        <Col md={12}>
                            <Label className="form-label" for="name">
                                {t('Хичээлийн байрны нэр')}
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
                                        placeholder={t('Хичээлийн байрны нэр')}
                                        type="text"
                                        invalid={errors.name && true}
                                    />
                                )}
                            />
                            {errors.name && <FormFeedback className='d-block'>{t(errors.name.message)}</FormFeedback>}
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
	);
};
export default Addmodal;
