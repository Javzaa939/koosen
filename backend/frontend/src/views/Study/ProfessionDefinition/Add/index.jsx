// ** React imports
import React, { Fragment, useState, useEffect, useContext } from 'react'

import { t } from 'i18next';

import { X } from "react-feather";

import Select from 'react-select'

import useApi from "@hooks/useApi";
import useLoader from "@hooks/useLoader";
import SchoolContext from "@context/SchoolContext"

import { ReactSelectStyles, prof_general_direct } from "@utils"

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
import { validateSchema } from '../validateSchema';

const Addmodal = ({ open, handleModal, refreshDatas }) => {

    const CloseBtn = (
        <X className="cursor-pointer" size={15} onClick={handleModal} />
    )

    const { school_id } = useContext(SchoolContext)
    // ** Hook
    const { control, handleSubmit, reset, setError, formState: { errors } } = useForm(validate(validateSchema));

    // Loader
	const { Loader, isLoading, fetchData } = useLoader({});
    const { isLoading: postLoading, fetchData: postFetch } = useLoader({});
    // states
    const [is_loading, setLoader] = useState(false)
    const [degree_option, setDegreeOption] = useState([])
    const [department_option, setDepartmentOption] = useState([])
    const [prof_general_option, setProfGeneralOption] = useState(prof_general_direct())


    // Api
    const professionalDegreeApi = useApi().settings.professionaldegree
    const definationApi = useApi().study.professionDefinition
    const departmentApi = useApi().hrms.department

    // Хөтөлбөрийн багын жагсаалт
    async function getDepartmentOption() {
        const { success, data } = await fetchData(departmentApi.get(school_id))
        if(success) {
            setDepartmentOption(data)
        }
    }

    async function getProfessionDegree() {
        const { success, data } = await fetchData(professionalDegreeApi.get())
        if(success) {
            setDegreeOption(data)
        }
    }

	async function onSubmit(cdata) {
        cdata['school'] = school_id
        cdata = convertDefaultValue(cdata)//, ['confirm_year', 'knowledge_skill', 'requirement', 'dedication' ])
        const { success, error } = await postFetch(definationApi.post(cdata))
        if(success) {
            reset()
            handleModal()
            refreshDatas()
        } else {
            /** Алдааны мессэжийг input дээр харуулна */
            for (let key in error) {
                setError(error[key].field, { type: 'custom', message:  error[key].msg});
            }
        }
	}

    useEffect(() => {
        getDepartmentOption()
        getProfessionDegree()
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
                is_loading && isLoading &&
                    <div className='suspense-loader'>
                        <Spinner size='bg'/>
                        <span className='ms-50'>{t('Түр хүлээнэ үү')}...</span>
                    </div>
            }
                <ModalHeader
                    className="mb-1"
                    toggle={handleModal}
                    close={CloseBtn}
                    tag="div"
                >
                    <h5 className="modal-title">{t('Мэргэжлийн тодорхойлолт нэмэх')}</h5>
                </ModalHeader>
                <ModalBody className="flex-grow-1">
                    <Row tag={Form} className="gy-1" onSubmit={handleSubmit(onSubmit)}>
                        <Col  lg={6} xs={12}>
                            <Label className="form-label" for="department">
                                {t('Хөтөлбөрийн баг')}
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
                                            placeholder={t('-- Сонгоно уу --')}
                                            options={department_option || []}
                                            value={department_option.find((c) => c.id === value)}
                                            noOptionsMessage={() => {t('Хоосон байна.')}}
                                            onChange={(val) => {
                                                onChange(val?.id || '')
                                            }}
                                            styles={ReactSelectStyles}
                                            getOptionValue={(option) => option.id}
                                            getOptionLabel={(option) => option.name}
                                        />
                                    )
                                }}
                            />
                            {errors.department && <FormFeedback className='d-block'>{t(errors.department.message)}</FormFeedback>}
                        </Col>
                        <Col lg={6} xs={12}>
                            <Label className="form-label" for="code">
                                {t('Мэргэжлийн код')}
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
                                        placeholder={t('Мэргэжлийн код')}
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
                                {t('Мэргэжлийн нэр')}
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
                                        placeholder={t('Мэргэжлийн нэр')}
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
                                {t('Мэргэжлийн нэр англи')}
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
                                        placeholder={t('Мэргэжлийн нэр англи')}
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
                                {t('Мэргэжлийн нэр уйгаржин')}
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
                                        placeholder={t('Мэргэжлийн нэр уйгаржин')}
                                        {...field}
                                        type="text"
                                        style={{ fontFamily: 'CMs Urga', fontSize: '15px'}}
                                        invalid={errors.name_uig && true}
                                    />
                                )}
                            />
                            {errors.name_uig && <FormFeedback className='d-block'>{t(errors.name_uig.message)}</FormFeedback>}
                        </Col>
                        <Col lg={6} xs={12}>
                            <Label className="form-label" for="degree">
                                {t('Боловсролын зэрэг')}
                            </Label>
                            <Controller
                                control={control}
                                defaultValue=''
                                name="degree"
                                render={({ field: { value, onChange} }) => {
                                    return (
                                        <Select
                                            name="degree"
                                            id="degree"
                                            classNamePrefix='select'
                                            isClearable
                                            className={classnames('react-select', { 'is-invalid': errors.degree })}
                                            isLoading={isLoading}
                                            placeholder={t('-- Сонгоно уу --')}
                                            options={degree_option || []}
                                            value={degree_option.find((c) => c.id === value)}
                                            noOptionsMessage={() => {t('Хоосон байна.')}}
                                            onChange={(val) => {
                                                onChange(val?.id || '')
                                            }}
                                            styles={ReactSelectStyles}
                                            getOptionValue={(option) => option.id}
                                            getOptionLabel={(option) => option.degree_name_code}
                                        />
                                    )
                                }}
                            ></Controller>
                            {errors.degree && <FormFeedback className='d-block'>{t(errors.degree.message)}</FormFeedback>}
                        </Col>
                        <Col lg={6} xs={12}>
                            <Label className="form-label" for="gen_direct_type">
                                {t('Мэргэжлийн ерөнхий чиглэл')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                name="gen_direct_type"
                                render={({ field: { value, onChange} }) => {
                                    return (
                                        <Select
                                            name="gen_direct_type"
                                            id="gen_direct_type"
                                            classNamePrefix='select'
                                            isClearable
                                            className={classnames('react-select', { 'is-invalid': errors.gen_direct_type })}
                                            isLoading={isLoading}
                                            placeholder={t('-- Сонгоно уу --')}
                                            options={prof_general_option || []}
                                            value={prof_general_option.find((c) => c.id === value)}
                                            noOptionsMessage={() => {t('Хоосон байна.')}}
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
                            {errors.gen_direct_type && <FormFeedback className='d-block'>{t(errors.gen_direct_type.message)}</FormFeedback>}
                        </Col>
                        <Col lg={6} xs={12}>
                            <Label className="form-label" for="dep_name">
                                {t('Мэргэжлийн төрөлжсөн чиглэл')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id="dep_name"
                                name="dep_name"
                                render={({ field }) => (
                                    <Input
                                        id ="dep_name"
                                        bsSize="sm"
                                        placeholder={t('Мэргэжлийн төрөлжсөн чиглэл')}
                                        {...field}
                                        type="text"
                                        invalid={errors.dep_name && true}
                                    />
                                )}
                            />
                            {errors.dep_name && <FormFeedback className='d-block'>{t(errors.dep_name.message)}</FormFeedback>}
                        </Col>
                        <Col lg={6} xs={12}>
                            <Label className="form-label" for="dep_name_eng">
                                {t('Мэргэжлийн төрөлжсөн чиглэл англи')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id="dep_name_eng"
                                name="dep_name_eng"
                                render={({ field }) => (
                                    <Input
                                        id ="dep_name_eng"
                                        bsSize="sm"
                                        placeholder={t('Мэргэжлийн төрөлжсөн чиглэл англи')}
                                        {...field}
                                        type="text"
                                        invalid={errors.dep_name_eng && true}
                                    />
                                )}
                            />
                            {errors.dep_name_eng && <FormFeedback className='d-block'>{t(errors.dep_name_eng.message)}</FormFeedback>}
                        </Col>
                        <Col lg={6} xs={12}>
                            <Label className="form-label" for="dep_name_uig">
                                {t('Мэргэжлийн төрөлжсөн чиглэл уйгаржин')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id="dep_name_uig"
                                name="dep_name_uig"
                                render={({ field }) => (
                                    <Input
                                        id ="dep_name_uig"
                                        bsSize="sm"
                                        placeholder={t('Мэргэжлийн төрөлжсөн чиглэл уйгаржин')}
                                        {...field}
                                        type="text"
                                        style={{ fontFamily: 'CMs Urga', fontSize: '15px'}}
                                        invalid={errors.dep_name_uig && true}
                                    />
                                )}
                            />
                            {errors.dep_name_uig && <FormFeedback className='d-block'>{t(errors.dep_name_uig.message)}</FormFeedback>}
                        </Col>
                        <Col lg={6} xs={12}>
                            <Label className="form-label  me-1" for="dedication">
                                {t('Мэргэжлийн тодорхойлолт')}
                            </Label>
                            <Controller
                                control={control}
                                id="dedication"
                                name="dedication"
                                defaultValue=''
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        id="dedication"
                                        type="textarea"
                                        bsSize="sm"
                                        placeholder={t('Мэргэжлийн тодорхойлолт')}
                                        invalid={errors.dedication && true}
                                    />
                                )}
                            />
                            {errors.dedication && <FormFeedback className='d-block'>{t(errors.dedication.message)}</FormFeedback>}
                        </Col>
                        <Col lg={6} xs={12}>
                            <Label className="form-label  me-1" for="requirement">
                                {t('Мэргэжлийн зорилго')}
                            </Label>
                            <Controller
                                control={control}
                                id="requirement"
                                name="requirement"
                                defaultValue=''
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        id="requirement"
                                        type="textarea"
                                        bsSize="sm"
                                        placeholder={t('Мэргэжлийн зорилго')}
                                        invalid={errors.requirement && true}
                                    />
                                )}
                            />
                            {errors.requirement && <FormFeedback className='d-block'>{t(errors.requirement.message)}</FormFeedback>}
                        </Col>
                        <Col lg={6} xs={12}>
                            <Label className="form-label  me-1" for="knowledge_skill">
                                {t('Олгох мэдлэг чадвар')}
                            </Label>
                            <Controller
                                control={control}
                                id="knowledge_skill"
                                name="knowledge_skill"
                                defaultValue=''
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        id="knowledge_skill"
                                        type="textarea"
                                        bsSize="sm"
                                        placeholder={t('Олгох мэдлэг чадвар')}
                                        invalid={errors.knowledge_skill && true}
                                    />
                                )}
                            />
                            {errors.knowledge_skill && <FormFeedback className='d-block'>{t(errors.knowledge_skill.message)}</FormFeedback>}
                        </Col>
                        <Col lg={6} xs={12}>
                            <Label className="form-label  me-1" for="confirm_year">
                                {t('Хөтөлбөр батлагдсан он')}
                            </Label>
                            <Controller
                                control={control}
                                id="confirm_year"
                                name="confirm_year"
                                defaultValue=''
                                render={({ field }) => {
                                    return (
                                        <Input
                                            {...field}
                                            id="confirm_year"
                                            type="number"
                                            bsSize="sm"
                                            placeholder={t('Хөтөлбөр батлагдсан он')}
                                            invalid={errors.confirm_year && true}
                                            onKeyDown={(e) =>["e", "E", "+", "-", "."].includes(e.key) && e.preventDefault()}
                                        />
                                    )
                                }}
                            />
                            {errors.confirm_year && <FormFeedback className='d-block'>{t(errors.confirm_year.message)}</FormFeedback>}
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
