import React, { Fragment, useEffect} from 'react'

import { useForm, Controller } from "react-hook-form";

import {
    Row,
    Col,
	Form,
	Modal,
	Input,
	Label,
	Button,
	ModalBody,
	ModalHeader,
    FormFeedback,
    Spinner
} from "reactstrap";

import { t } from 'i18next';
import { X } from "react-feather";
import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';
import { convertDefaultValue, validate } from "@utils"
import { validateSchema } from '../Add/validateSchema'

const UpdateModal = ({ open, handleEdit, editId, refreshDatas }) => {
    const CloseBtn = (
        <X className="cursor-pointer" size={15} onClick={handleEdit} />
    )

    const { isLoading, fetchData } = useLoader({})

    const { control, handleSubmit,reset, setValue, setError, formState: { errors } } = useForm(validate(validateSchema));

    // Api
    const AdmissionlessonApi = useApi().settings.admissionlesson

    async function getDatas() {
        if(editId) {
            const { success, data } = await fetchData(AdmissionlessonApi.getOne(editId))
            if(success) {
                // засах үед дата байх юм бол setValue-р дамжуулан утгыг харуулна
                if(data === null) return
                for(let key in data) {
                    if(data[key] !== null)
                        setValue(key, data[key])
                    else setValue(key, '')
                }
            }
        }
    }

    useEffect(() => {
        getDatas()
    },[open])

    async function onSubmit(cdata) {
        cdata = convertDefaultValue(cdata)
        if(editId) {
            const { success, error } = await fetchData(AdmissionlessonApi.put(cdata, editId))
            if(success) {
                reset()
                refreshDatas()
                handleEdit()
            }
            else {
                /** Алдааны мессеж */
                for (let key in error) {
                    setError(error[key].field, { type: 'custom', message: error[key].msg});
                }
            }
        }
    }

	return (
        <Fragment>
            <Modal
                isOpen={open}
                toggle={handleEdit}
                className="sidebar-lg hr-register"
                modalClassName="modal-slide-in "
                contentClassName="pt-0"
                onClosed={handleEdit}
            >
            {isLoading && <div className='suspense-loader'><Spinner size='xl'/></div>}
            <ModalHeader
                className='className="mb-1'
                toggle={handleEdit}
                close={CloseBtn}
                tag="div"
            >
                <h5 className="modal-title">{t('Суралцах хэлбэр засах')}</h5>
            </ModalHeader>
                <ModalBody className="flex-grow-1">
                    <Row tag={Form} className="gy-1" onSubmit={handleSubmit(onSubmit)}>
                        <Col md={12}>
                            <Label className="form-label" for="lesson_code">
                                {t('ЭЕШ-ын хичээлийн код')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id="lesson_code"
                                name="lesson_code"
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        id="lesson_code"
                                        bsSize="sm"
                                        type="number"
                                        placeholder={t('ЭЕШ-ын хичээлийн код')}
                                        invalid={errors.lesson_code && true}
                                        onKeyDown={(e) =>["e", "E", "+", "-", "."].includes(e.key) && e.preventDefault()}
                                    />
                                )}
                            />
                            {errors.lesson_code && <FormFeedback className='d-block'>{t(errors.lesson_code.message)}</FormFeedback>}
                        </Col>
                        <Col md={12}>
                            <Label className="form-label" for="lesson_name">
                                {t('ЭЕШ-ын хичээлийн нэр')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id="lesson_name"
                                name="lesson_name"
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        id="lesson_name"
                                        bsSize="sm"
                                        placeholder={t('ЭЕШ-ын хичээлийн нэр')}
                                        type="text"
                                        invalid={errors.lesson_name && true}
                                    />
                                )}
                            />
                            {errors.lesson_name && <FormFeedback className='d-block'>{t(errors.lesson_name.message)}</FormFeedback>}
                        </Col>
                            <Col md={12} className="text-center mt-2">
                                <Button className="me-2" color="primary" type="submit">
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
	);
};
export default UpdateModal;
