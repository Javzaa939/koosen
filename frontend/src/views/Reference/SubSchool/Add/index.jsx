// ** React imports
import React, { Fragment, useState, useEffect, useContext } from 'react'

import { X } from "react-feather";

import Select from 'react-select'

import useApi from "@hooks/useApi";
import useLoader from "@hooks/useLoader";

import { ReactSelectStyles } from "@utils"

import classnames from "classnames";

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

import AuthContext from '@context/AuthContext'
import SchoolContext from "@context/SchoolContext"

import { validateSchema } from './validateSchema';

const AddModal = ({ open, handleModal, refreshDatas}) =>{
    const CloseBtn = (
        <X className="cursor-pointer" size={15} onClick={handleModal} />
    )

    const { user } = useContext(AuthContext)
    const { school_id } = useContext(SchoolContext)

    // ** Hook
    const { control, handleSubmit, reset, setError, formState: { errors } } = useForm();
    // const { control, handleSubmit, reset, setError, formState: { errors } } = useForm(validate(validateSchema));


    // states
    const [is_loading, setLoader] = useState(false)
    const { isLoading: postLoading, fetchData: postFetch } = useLoader({});

    // Loader
	const { Loader, isLoading, fetchData } = useLoader({});

    // Api
    const lessonStandartApi = useApi().study.lessonStandart
    const lessonCategoryApi = useApi().settings.lessonCategory
    const departmentApi = useApi().hrms.department
    const subSchoolsApi = useApi().hrms.subschool

    async function onSubmit(cdata) {
        cdata['created_user'] = user.id
        cdata['updated_user'] = user.id
        // console.log("school", school_id);
        // cdata['org'] = school_id
        cdata = convertDefaultValue(cdata)
        console.log("cdata", cdata);

        const { success, error } = await postFetch(subSchoolsApi.post(cdata))
        if(success) {
            setLoader(false)
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

    return (
        <Fragment>
            <Modal
                isOpen={open}
                toggle={handleModal}
                className="sidebar-md"
                modalClassName='modal-slide-in'
                contentClassName='pt-0'
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
                    <h5 className="modal-title">{t('Сургуулийн мэдээлэл нэмэх')}</h5>

                </ModalHeader>
                <ModalBody className="flex-grow-1">
                    <Row tag={Form} className="gy-1" onSubmit={handleSubmit(onSubmit)}>
                        <Col md={12}>
                            <Label className="form-label" for="name">
                                {t('Сургуулийн нэр')}
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
                                        placeholder={t('Сургуулийн нэр')}
                                        {...field}
                                        type="text"
                                        invalid={errors.name && true}
                                    />
                                )}
                            />
                            {errors.name && <FormFeedback className='d-block'>{t(errors.name.message)}</FormFeedback>}
                        </Col>
                        <Col md={12}>
                            <Label className="form-label" for="name_eng">
                                {t('Сургуулийн англи нэр')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id="name_eng"
                                name="name_eng"
                                render={({ field }) => (
                                    <Input
                                        id ="name_eng"
                                        bsSize="sm"
                                        placeholder={t('сургуулийн англи нэр')}
                                        {...field}
                                        type="text"
                                        invalid={errors.name_eng && true}
                                    />
                                )}
                            />
                            {errors.name_eng && <FormFeedback className='d-block'>{t(errors.name_eng.message)}</FormFeedback>}
                        </Col>
                        <Col md={12}>
                            <Label className="form-label" for="name_uig">
                                {t('Сургуулийн уйгаржин нэр')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id="name_uig"
                                name="name_uig"
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        id ="name_uig"
                                        bsSize="sm"
                                        placeholder={t('сургуулийн уйгаржин нэр')}
                                        type="text"
                                        style={{ fontFamily: 'CMs Urga', fontSize: '15px'}}
                                        invalid={errors.name_uig && true}
                                    />
                                )}
                            />
                            {errors.name_uig && <FormFeedback className='d-block'>{t(errors.name_uig.message)}</FormFeedback>}
                        </Col>
                        <Col md={12}>
                                <Label className="form-label" for="zahiral_name">
                                    {t('Захиралын нэр')}
                                </Label>
                                <Controller
                                    defaultValue=''
                                    control={control}
                                    id="zahiral_name"
                                    name="zahiral_name"
                                    render={({ field }) => (
                                        <Input
                                            id ="zahiral_name"
                                            bsSize="sm"
                                            placeholder={t('захиралын нэр')}
                                            {...field}
                                            type="text"
                                            invalid={errors.zahiral_name && true}
                                        />
                                    )}
                                />
                            </Col>
                            <Col md={12}>
                                <Label className="form-label" for="zahiral_name_eng">
                                    {t('Захиралын англи нэр')}
                                </Label>
                                <Controller
                                    defaultValue=''
                                    control={control}
                                    id="zahiral_name_eng"
                                    name="zahiral_name_eng"
                                    render={({ field }) => (
                                        <Input
                                            id ="zahiral_name_eng"
                                            bsSize="sm"
                                            placeholder={t('захиралын англи нэр')}
                                            {...field}
                                            type="text"
                                            invalid={errors.zahiral_name_eng && true}
                                        />
                                    )}
                                />
                            </Col>
                            <Col md={12}>
                            <Label className="form-label" for="zahiral_name_uig">
                                {t('Захиралын уйгаржин нэр')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id="zahiral_name_uig"
                                name="zahiral_name_uig"
                                render={({ field }) => (
                                    <Input
                                        id ="zahiral_name_uig"
                                        bsSize="sm"
                                        placeholder={t('захиралын уйгаржин нэр')}
                                        {...field}
                                        type="text"
                                        style={{ fontFamily: 'CMs Urga', fontSize: '15px'}}
                                        invalid={errors.zahiral_name_uig && true}
                                    />
                                )}
                            />
                            {errors.zahiral_name_uig && <FormFeedback className='d-block'>{t(errors.zahiral_name_uig.message)}</FormFeedback>}
                        </Col>
                        <Col md={12}>
                                <Label className="form-label" for="tsol_name">
                                    {t('Цол')}
                                </Label>
                                <Controller
                                    defaultValue=''
                                    control={control}
                                    id="tsol_name"
                                    name="tsol_name"
                                    render={({ field }) => (
                                        <Input
                                            id ="tsol_name"
                                            bsSize="sm"
                                            placeholder={t('цол')}
                                            {...field}
                                            type="text"
                                            invalid={errors.tsol_name && true}
                                        />
                                    )}
                                />
                            </Col>
                            <Col md={12}>
                                <Label className="form-label" for="tsol_name_eng">
                                    {t('Цол англи нэр')}
                                </Label>
                                <Controller
                                    defaultValue=''
                                    control={control}
                                    id="tsol_name_eng"
                                    name="tsol_name_eng"
                                    render={({ field }) => (
                                        <Input
                                            id ="tsol_name_eng"
                                            bsSize="sm"
                                            placeholder={t('цол англи нэр')}
                                            {...field}
                                            type="text"
                                            invalid={errors.tsol_name_eng && true}
                                        />
                                    )}
                                />
                            </Col>
                            <Col md={12}>
                            <Label className="form-label" for="tsol_name_uig">
                                {t('Цол уйгаржин нэр')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id="tsol_name_uig"
                                name="tsol_name_uig"
                                render={({ field }) => (
                                    <Input
                                        id ="tsol_name_uig"
                                        bsSize="sm"
                                        placeholder={t('цол уйгаржин нэр')}
                                        {...field}
                                        type="text"
                                        style={{ fontFamily: 'CMs Urga', fontSize: '15px'}}
                                        invalid={errors.tsol_name_uig && true}
                                    />
                                )}
                            />
                            {errors.tsol_name_uig && <FormFeedback className='d-block'>{t(errors.tsol_name_uig.message)}</FormFeedback>}
                        </Col>
                        <Col md={12}>
                            <Button className="me-2" color="primary" type="submit" disabled={postLoading}>
                                {/* {postLoading &&<Spinner size='sm' className='me-1'/>} */}
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
