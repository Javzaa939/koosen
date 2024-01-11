// ** React imports
import React, { Fragment , useEffect} from 'react'

import { X } from "react-feather";

import useApi from "@hooks/useApi";
import useLoader from "@hooks/useLoader";

import { useForm, Controller } from "react-hook-form";

import { Row, Col, Form, Modal, Input, Label, Button, ModalBody, ModalHeader, FormFeedback, Spinner } from "reactstrap";

import { convertDefaultValue, validate } from "@utils"

import { validateSchema } from './validateSchema';
import { t } from 'i18next';

const Addmodal = ({ open, handleModal, refreshDatas, editId,  handleEdit }) => {

    const CloseBtn = (
        <X className="cursor-pointer" size={15} onClick={handleModal} />
    )

    // ** Hook
    const { control, handleSubmit, formState: { errors }, reset, setError, setValue} = useForm(validate(validateSchema));

	// Loader
	const { Loader, isLoading, fetchData } = useLoader({});
	const { isLoading: postLoading, fetchData: postFetch } = useLoader({});

    // Api
    const learningApi = useApi().settings.learning

	async function onSubmit(cdata) {
        cdata = convertDefaultValue(cdata)
        if(editId) {
            const { success, errors } = await fetchData(learningApi.put(cdata, editId))
            if(success) {
                reset()
                refreshDatas()
                handleEdit()
            }
            else {
                /** Алдааны мессеж */
                setError(errors.field, { type: 'custom', message: errors.msg});
            }
        }
        else{

            const { success, errors } = await postFetch(learningApi.post(cdata))
            if(success) {
                reset()
                refreshDatas()
                handleModal()
            } else {
                /** Алдааны мессэжийг input дээр харуулна */
                setError(errors.field, { type: 'custom', message:  errors.msg});
            }
        }
	}

    // засах үйлдэл
    async function getDatas() {
        if(editId) {
            const { success, data } = await fetchData(learningApi.getOne(editId))
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
    },[editId])


	return (
        <Fragment>
            <Modal
                isOpen={ open}
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
                    <h5 className="modal-title">{ editId ?  t('Суралцах хэлбэр засах'): t('Суралцах хэлбэр нэмэх')}</h5>
                </ModalHeader>
                <ModalBody className="flex-grow-1">
                    <Row tag={Form} className="gy-1" onSubmit={ handleSubmit(onSubmit) }>
                        <Col md={12}>
                            <Label className="form-label" for="learn_code">
                                {t('Код')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id="learn_code"
                                name="learn_code"
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        id="learn_code"
                                        bsSize="sm"
                                        type="number"
                                        placeholder={t('Код')}
                                        invalid={errors.learn_code && true}
                                        onKeyDown={(e) =>["e", "E", "+", "-", "."].includes(e.key) && e.preventDefault()}
                                    />
                                )}
                            />
                            {errors.learn_code && <FormFeedback className='d-block'>{t(errors.learn_code.message)}</FormFeedback>}
                        </Col>
                        <Col md={12}>
                            <Label className="form-label" for="learn_name">
                                {t('Суралцах хэлбэрийн нэр')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id="learn_name"
                                name="learn_name"
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        id="learn_name"
                                        bsSize="sm"
                                        placeholder={t('Суралцах хэлбэрийн нэр')}
                                        type="text"
                                        invalid={errors.learn_name && true}
                                    />
                                )}
                            />
                            {errors.learn_name && <FormFeedback className='d-block'>{t(errors.learn_name.message)}</FormFeedback>}
                        </Col>
                        <Col md={12} className=" text-center mt-2">
                            <Button className="me-2" color="primary" type="submit" disabled={postLoading}>
                            {postLoading &&<Spinner size='sm' className='me-1'/>}
                                {t('Хадгалах')}
                            </Button>
                            {
                                editId ?
                                    null
                                :
                                <Button color="secondary" type="reset" outline  onClick={handleModal}>
                                    {t('Буцах')}
                                </Button>
                            }
                        </Col>
                    </Row>
                </ModalBody>
            </Modal>
        </Fragment>
	);
};
export default Addmodal;
