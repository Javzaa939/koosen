import {
    Row,
    Col,
    Modal,
	Form,
	Input,
	Label,
	Button,
    ModalBody,
	ModalHeader,
    Spinner,
} from "reactstrap";
import { t } from 'i18next';
import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';
import { validateSchema } from './validateSchema'
import { useForm, Controller } from "react-hook-form";
import React, { Fragment, useEffect, useState} from 'react'
import { convertDefaultValue , validate } from "@utils"
import { X } from "react-feather";

const UpdateModal = ({ open, handleEdit, editId, refreshDatas }) => {
    const CloseBtn = (
        <X className="cursor-pointer" size={15} onClick={handleEdit} />
    )
    // Loader
    const {isLoading, fetchData } = useLoader({})

    const { control, handleSubmit, setValue, reset, setError, formState: { errors } } = useForm();

    // Api
    const getSchoolApi = useApi().hrms.subschool

    async function getDatas() {
        if(editId) {
            const { success, data } = await fetchData(getSchoolApi.getOne(editId))
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
        if(editId) {
            cdata = convertDefaultValue(cdata)
            const { success, error } = await fetchData(getSchoolApi.put(cdata, editId))
            if(success) {
                refreshDatas()
                handleEdit()
            }
            else {
                /** Алдааны мессэжийг input дээр харуулна */
                for (let key in error) {
                    setError(error[key].field, { type: 'custom', message:  error[key].msg});
                }
            }
        }
	}
	return (
        <Fragment>
            <Modal
                isOpen={open}
                toggle={handleEdit}
                className="sidebar-md"
                modalClassName='modal-slide-in'
                contentClassName='pt-0'
            >
                {
                    isLoading &&
                        <div className='suspense-loader'>
                            <Spinner size='bg'/>
                            <span className='ms-50'>Түр хүлээнэ үү...</span>
                        </div>
                }

                <ModalHeader
                    className="mb-1"
                    toggle={handleEdit}
                    close={CloseBtn}
                    tag="div"
                >
                    <h5 className="modal-title">{t('Сургуулийн мэдээлэл засах')}</h5>
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
                                        disabled={true}
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
                            <Label className="form-label" for="org_code">
                                {t('Сургуулийн код')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id="org_code"
                                name="org_code"
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        id="org_code"
                                        bsSize="sm"
                                        placeholder={t('Сургуулийн код')}
                                        type="text"
                                        maxLength={2}
                                    />
                                )}
                            />
                            {errors.org_code && <FormFeedback className='d-block'>{t(errors.org_code.message)}</FormFeedback>}
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
                                        style={{ fontFamily: 'cmdashitseden', fontSize: '15px'}}
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
                                        style={{ fontFamily: 'cmdashitseden', fontSize: '15px'}}
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
                                        style={{ fontFamily: 'cmdashitseden', fontSize: '15px'}}
                                        invalid={errors.tsol_name_uig && true}
                                    />
                                )}
                            />
                            {errors.tsol_name_uig && <FormFeedback className='d-block'>{t(errors.tsol_name_uig.message)}</FormFeedback>}
                        </Col>
                         <Col md={12}>
                                <Label className="form-label" for="erdem_tsol_name">
                                    {t('Эрдмийн цол')}
                                </Label>
                                <Controller
                                    defaultValue=''
                                    control={control}
                                    id="erdem_tsol_name"
                                    name="erdem_tsol_name"
                                    render={({ field }) => (
                                        <Input
                                            id ="erdem_tsol_name"
                                            bsSize="sm"
                                            placeholder={t('цол')}
                                            {...field}
                                            type="text"
                                            invalid={errors.erdem_tsol_name && true}
                                        />
                                    )}
                                />
                                {errors.erdem_tsol_name && <FormFeedback className='d-block'>{t(errors.erdem_tsol_name.message)}</FormFeedback>}
                            </Col>
                            <Col md={12}>
                                <Label className="form-label" for="erdem_tsol_name_eng">
                                    {t('Эрдмийн цол англи нэр')}
                                </Label>
                                <Controller
                                    defaultValue=''
                                    control={control}
                                    id="erdem_tsol_name_eng"
                                    name="erdem_tsol_name_eng"
                                    render={({ field }) => (
                                        <Input
                                            id ="erdem_tsol_name_eng"
                                            bsSize="sm"
                                            placeholder={t('цол англи нэр')}
                                            {...field}
                                            type="text"
                                            invalid={errors.erdem_tsol_name_eng && true}
                                        />
                                    )}
                                />
                                {errors.erdem_tsol_name_eng && <FormFeedback className='d-block'>{t(errors.erdem_tsol_name_eng.message)}</FormFeedback>}
                            </Col>
                            <Col md={12}>
                            <Label className="form-label" for="erdem_tsol_name_uig">
                                {t('Эрдмийн цол уйгаржин нэр')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id="erdem_tsol_name_uig"
                                name="erdem_tsol_name_uig"
                                render={({ field }) => (
                                    <Input
                                        id ="erdem_tsol_name_uig"
                                        bsSize="sm"
                                        placeholder={t('цол уйгаржин нэр')}
                                        {...field}
                                        type="text"
                                        style={{ fontFamily: 'cmdashitseden', fontSize: '15px'}}
                                        invalid={errors.erdem_tsol_name_uig && true}
                                    />
                                )}
                            />
                            {errors.erdem_tsol_name_uig && <FormFeedback className='d-block'>{t(errors.erdem_tsol_name_uig.message)}</FormFeedback>}
                        </Col>
                        <Col className='text-center mt-2' md={12}>
                            <Button className="me-2" size='sm' color="primary" type="submit">
                                {t('Хадгалах')}
                            </Button>
                        </Col>
                    </Row>
                </ModalBody>
            </Modal>
        </Fragment>
	);
};
export default UpdateModal;
