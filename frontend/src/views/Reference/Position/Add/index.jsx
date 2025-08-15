// ** React imports
import React, { Fragment, useState, useEffect, useContext } from 'react'
import { X } from "react-feather";
import useApi from "@hooks/useApi";
import useLoader from "@hooks/useLoader";
import { useForm, Controller } from "react-hook-form";

import {
    Row,
    Col,
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

import { validate, convertDefaultValue } from "@utils"
import { t } from 'i18next';

import SchoolContext from "@context/SchoolContext"

import { validateSchema } from './validateSchema';

const AddModal = ({ open, handleModal, refreshDatas, editData}) => {

    const CloseBtn = (
        <X className="cursor-pointer" size={15} onClick={handleModal} />
    )
    const { school_id } = useContext(SchoolContext)

    // ** Hook
    const { control, handleSubmit, reset, setError, formState: { errors }, setValue } = useForm(validate(validateSchema));

    const [is_loading, setLoader] = useState(false)
    const { isLoading: postLoading, fetchData: postFetch } = useLoader({});

    const [checked1, setOnlyCheck1] = useState(false)
    const [checked2, setOnlyCheck2] = useState(false)
    const [checked3, setOnlyCheck3] = useState(false)

    // Api
    const orgPositionApi = useApi().hrms.position

    async function onSubmit(cdata) {
        cdata = convertDefaultValue(cdata)
        const { success, error } = await postFetch(orgPositionApi.post(cdata))
        if(success) {
            reset()
            handleModal()
            refreshDatas()
        } else {
            setLoader(false)
            /** Алдааны мессэжийг input дээр харуулна */
            for (let key in error) {
                setError(error[key].field, { type: 'custom', message:  error[key].msg});
            }
        }

	}

    useEffect(
        () => {
            if(editData === null) return
            for(let key in editData) {
                if(editData[key] !== null)
                    setValue(key, editData[key])
                else setValue(key,'')
                if (key === 'org') {
                    setValue(key, editData[key]?.id)
                }
            }
        }, [editData]
    )

    return (
        <Fragment>
            <Modal
                isOpen={open}
                toggle={handleModal}
                className="sidebar-md"
                modalClassName='modal-slide-in'
                contentClassName='pt-0'
                backdrop='static'
            >
                {
                    is_loading &&
                        <div className='suspense-loader'>
                            <Spinner size='bg'/>
                            <span className='ms-50'>Түр хүлээнэ үү...</span>
                        </div>
                }

                <ModalHeader
                    className="mb-1"
                    toggle={handleModal}
                    close={CloseBtn}
                    tag="div"
                >
                    <h5 className="modal-title">{t('Багшийн мэдээлэл нэмэх')}</h5>

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
                                        id ="name"
                                        bsSize="sm"
                                        placeholder={t("Нэр")}
                                        {...field}
                                        type="text"
                                        invalid={errors.name && true}
                                    />
                                )}
                            />
                            {errors.name && <FormFeedback className='d-block'>{errors.name.message}</FormFeedback>}
                        </Col>
                        <Col md={12} className='d-flex align-items-center mt-50'>
                            <Input
                                id="is_hr"
                                className="dataTable-check mb-50 me-1"
                                type="checkbox"
                                bsSize="sm-5"
                                onChange={(e) => setOnlyCheck1(e.target.checked)}
                                checked={checked1}
                            />
                            <Label className="checkbox-wrapper" for="is_hr">
                                {t('Хүний нөөцийн ажилтан эсэх')}
                            </Label>
                        </Col>
                        <Col md={12} className='d-flex align-items-center mt-50'>
                            <Input
                                id="is_director"
                                className="dataTable-check mb-50 me-1"
                                type="checkbox"
                                bsSize="sm-5"
                                onChange={(e) => setOnlyCheck2(e.target.checked)}
                                checked={checked2}
                            />
                            <Label className="checkbox-wrapper" for="is_director">
                                {t('Удирдах албан тушаалтан эсэх')}
                            </Label>
                        </Col>
                        <Col md={12} className='d-flex align-items-center mt-50'>
                            <Input
                                id="is_teacher"
                                className="dataTable-check mb-50 me-1"
                                type="checkbox"
                                bsSize="sm-5"
                                onChange={(e) => setOnlyCheck3(e.target.checked)}
                                checked={checked3}
                            />
                            <Label className="checkbox-wrapper" for="is_teacher">
                                {t('Багш эсэх')}
                            </Label>
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
                                        id ="description"
                                        bsSize="sm"
                                        placeholder={t("Тайлбар")}
                                        {...field}
                                        type="textarea"
                                        invalid={errors.description && true}
                                    />
                                )}
                            />
                            {errors.description && <FormFeedback className='d-block'>{errors.description.message}</FormFeedback>}
                        </Col>
                        <Col md={12} className='text-center'>
                            <Button className="me-2" color="primary" type="submit" disabled={postLoading}>
                                {postLoading &&<Spinner size='sm' className='me-1'/>}
                                {t('Хадгалах')}
                            </Button>
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
export default AddModal;
