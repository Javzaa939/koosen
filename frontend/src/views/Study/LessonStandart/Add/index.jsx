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

const Addmodal = ({ open, handleModal, refreshDatas }) => {

    const CloseBtn = (
        <X className="cursor-pointer" size={15} onClick={handleModal} />
    )

    const { user } = useContext(AuthContext)
    const { school_id } = useContext(SchoolContext)

    const [category_option, setCategoryOption] = useState([])
    const [department_option, setDepartmentOption] = useState([])

    // ** Hook
    const { control, handleSubmit, reset, setError, formState: { errors } } = useForm(validate(validateSchema));

    // states
    const [is_loading, setLoader] = useState(false)
    const { isLoading: postLoading, fetchData: postFetch } = useLoader({});
	// Loader
	const { Loader, isLoading, fetchData } = useLoader({});

    // Api
    const lessonStandartApi = useApi().study.lessonStandart
    const lessonCategoryApi = useApi().settings.lessonCategory
    const departmentApi = useApi().hrms.department

    // Тэнхимын жагсаалт
    async function getDepartmentOption() {
        const { success, data } = await fetchData(departmentApi.get(school_id))
        if(success) {
            setDepartmentOption(data)
        }
    }
    // Хичээлийн ангилал авах
    async function getLessonCategory() {
        const { success, data } = await fetchData(lessonCategoryApi.get())
        if(success) {
            setCategoryOption(data)
        }
    }

	async function onSubmit(cdata) {
        cdata['created_user'] = user.id
        cdata['updated_user'] = user.id
        cdata['school'] = school_id
        cdata = convertDefaultValue(cdata)
        const { success, errors } = await postFetch(lessonStandartApi.post(cdata))
        if(success) {
            reset()
            setLoader(false)
            handleModal()
            refreshDatas()
        } else {
            setLoader(false)
            /** Алдааны мессэжийг input дээр харуулна */
            for (let key in errors) {
                setError(key, { type: 'custom', message:  errors[key][0]});
            }
        }

	}

    useEffect(() => {
        getDepartmentOption()
        getLessonCategory()
    },[])

	return (
        <Fragment>

            <Modal
                isOpen={open}
                toggle={handleModal}
                className='sidebar-xl'
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
                    <h5 className="modal-title">{t('Хичээлийн стандарт нэмэх')}</h5>
                </ModalHeader>
                <ModalBody className="flex-grow-1">
                    <Row tag={Form} className="gy-1" onSubmit={handleSubmit(onSubmit)}>
                        <Col lg={6} xs={12}>
                            <Label className="form-label" for="department">
                                {t('Тэнхим')}
                            </Label>
                            <Controller
                                control={control}
                                defaultValue=''
                                name="department"
                                render={({ field: { value, onChange} }) => {
                                    return (
                                        <Select
                                            name="department"
                                            id="department"
                                            classNamePrefix='select'
                                            isClearable
                                            className={classnames('react-select', { 'is-invalid': errors.department })}
                                            isLoading={isLoading}
                                            placeholder={t(`-- Сонгоно уу --`)}
                                            options={department_option || []}
                                            value={department_option.find((c) => c.id === value)}
                                            noOptionsMessage={() => 'Хоосон байна'}
                                            onChange={(val) => {
                                                onChange(val?.id || '')
                                            }}
                                            styles={ReactSelectStyles}
                                            getOptionValue={(option) => option.id}
                                            getOptionLabel={(option) => option.name}
                                        />
                                    )
                                }}
                            ></Controller>
                            {errors.department && <FormFeedback className='d-block'>{t(errors.department.message)}</FormFeedback>}
                        </Col>
                        <Col lg={6} xs={12}>
                            <Label className="form-label" for="code">
                                {t('Хичээлийн код')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id="code"
                                name="code"
                                render={({ field }) => (
                                    <Input
                                        id ="code"
                                        bsSize="sm"
                                        placeholder={t('Хичээлийн код')}
                                        {...field}
                                        type="text"
                                        invalid={errors.code && true}
                                    />
                                )}
                            />
                            {errors.code && <FormFeedback className='d-block'>{t(errors.code.message)}</FormFeedback>}
                        </Col>
                        <Col lg={6} xs={12}>
                            <Label className="form-label" for="name">
                                {t('Хичээлийн нэр')}
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
                                        placeholder={t('Хичээлийн нэр')}
                                        {...field}
                                        type="text"
                                        invalid={errors.name && true}
                                    />
                                )}
                            />
                            {errors.name && <FormFeedback className='d-block'>{t(errors.name.message)}</FormFeedback>}
                        </Col>
                        <Col lg={6} xs={12}>
                            <Label className="form-label" for="name_eng">
                                {t('Хичээлийн нэр англи')}
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
                                        placeholder={t('Хичээлийн нэр англи')}
                                        {...field}
                                        type="text"
                                        invalid={errors.name_eng && true}
                                    />
                                )}
                            />
                            {errors.name_eng && <FormFeedback className='d-block'>{t(errors.name_eng.message)}</FormFeedback>}
                        </Col>
                        <Col lg={6} xs={12}>
                            <Label className="form-label" for="name_uig">
                                {t('Хичээлийн нэр уйгаржин')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id="name_uig"
                                name="name_uig"
                                render={({ field }) => (
                                    <Input
                                        id ="name_uig"
                                        bsSize="sm"
                                        placeholder={t('Хичээлийн нэр уйгаржин')}
                                        style={{ fontFamily: 'cmdashitseden', fontSize: '15px'}}
                                        {...field}
                                        type="text"
                                        invalid={errors.name_uig && true}
                                    />
                                )}
                            />
                            {errors.name_uig && <FormFeedback className='d-block'>{t(errors.name_uig.message)}</FormFeedback>}
                        </Col>
                        <Col lg={6} xs={12}>
                            <Label className="form-label" for="kredit">
                                {t('Багц цаг')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id="kredit"
                                name="kredit"
                                render={({ field }) => (
                                    <Input
                                        id ="kredit"
                                        bsSize="sm"
                                        placeholder={t('Багц цаг')}
                                        {...field}
                                        type='number'
                                        onKeyDown={(e) =>["e", "E", "+", "-", "."].includes(e.key) && e.preventDefault()}
                                        invalid={errors.kredit && true}
                                    />
                                )}
                            />
                            {errors.kredit && <FormFeedback className='d-block'>{t(errors.kredit.message)}</FormFeedback>}
                        </Col>
                        <Col lg={6} xs={12}>
                            <Label className="form-label" for="category">
                                {t('Хичээлийн ангилал')}
                            </Label>
                            <Controller
                                control={control}
                                defaultValue=''
                                name="category"
                                render={({ field: { value, onChange} }) => {
                                    return (
                                        <Select
                                            name="category"
                                            id="category"
                                            classNamePrefix='select'
                                            isClearable
                                            className={classnames('react-select', { 'is-invalid': errors.category })}
                                            isLoading={isLoading}
                                            placeholder={t(`-- Сонгоно уу --`)}
                                            options={category_option || []}
                                            value={category_option.find((c) => c.id === value)}
                                            noOptionsMessage={() => t('Хоосон байна')}
                                            onChange={(val) => {
                                                onChange(val?.id || '')
                                            }}
                                            styles={ReactSelectStyles}
                                            getOptionValue={(option) => option.id}
                                            getOptionLabel={(option) => option.category_name}
                                        />
                                    )
                                }}
                            ></Controller>
                            {errors.category && <FormFeedback className='d-block'>{t(errors.category.message)}</FormFeedback>}
                        </Col>
                        <Col lg={6} xs={12}>
                            <Label className="form-label  me-1" for="definition">
                                {t('Хичээлийн тодорхойлолт')}
                            </Label>
                            <Controller
                                control={control}
                                id="definition"
                                name="definition"
                                defaultValue=''
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        id="definition"
                                        type="textarea"
                                        bsSize="sm"
                                        placeholder={t('Хичээлийн тодорхойлолт')}
                                        invalid={errors.definition && true}
                                    />
                                )}
                            />
                            {errors.definition && <FormFeedback className='d-block'>{t(errors.definition.message)}</FormFeedback>}
                        </Col>
                        <Col lg={6} xs={12}>
                            <Label className="form-label  me-1" for="purpose">
                                {t('Хичээлийн зорилго')}
                            </Label>
                            <Controller
                                control={control}
                                id="purpose"
                                name="purpose"
                                defaultValue=''
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        id="purpose"
                                        type="textarea"
                                        bsSize="sm"
                                        placeholder={t('Хичээлийн зорилго')}
                                        invalid={errors.purpose && true}
                                    />
                                )}
                            />
                            {errors.purpose && <FormFeedback className='d-block'>{t(errors.purpose.message)}</FormFeedback>}
                        </Col>
                        <Col lg={6} xs={12}>
                            <Label className="form-label  me-1" for="knowledge">
                                {t('Эзэмших мэдлэг')}
                            </Label>
                            <Controller
                                control={control}
                                id="knowledge"
                                name="knowledge"
                                defaultValue=''
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        id="knowledge"
                                        type="textarea"
                                        bsSize="sm"
                                        placeholder={t('Эзэмших мэдлэг')}
                                        invalid={errors.knowledge && true}
                                    />
                                )}
                            />
                            {errors.knowledge && <FormFeedback className='d-block'>{t(errors.knowledge.message)}</FormFeedback>}
                        </Col>
                        <Col lg={6} xs={12}>
                            <Label className="form-label  me-1" for="skill">
                                {t('Эзэмших ур чадвар')}
                            </Label>
                            <Controller
                                control={control}
                                id="skill"
                                name="skill"
                                defaultValue=''
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        id="skill"
                                        type="textarea"
                                        bsSize="sm"
                                        placeholder={t('Эзэмших ур чадвар')}
                                        invalid={errors.skill && true}
                                    />
                                )}
                            />
                            {errors.skill && <FormFeedback className='d-block'>{t(errors.skill.message)}</FormFeedback>}
                        </Col>
                        <Col lg={6} xs={12}>
                            <Label className="form-label  me-1" for="attitude">
                                {t('Хандлага төлөвшил')}
                            </Label>
                            <Controller
                                control={control}
                                id="attitude"
                                name="attitude"
                                defaultValue=''
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        id="attitude"
                                        type="textarea"
                                        bsSize="sm"
                                        placeholder={t('Хандлага төлөвшил')}
                                        invalid={errors.attitude && true}
                                    />
                                )}
                            />
                            {errors.attitude && <FormFeedback className='d-block'>{t(errors.attitude.message)}</FormFeedback>}
                        </Col>
                        <Col md={12}>
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
export default Addmodal;
