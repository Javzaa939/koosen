// ** React imports
import React, { Fragment, useState, useEffect, useContext } from 'react'

import Select from 'react-select'

import { useTranslation } from 'react-i18next';

import useApi from "@hooks/useApi";
import useLoader from "@hooks/useLoader";

import { ReactSelectStyles } from "@utils"

import classnames from "classnames";

import { useForm, Controller } from "react-hook-form";

import { useParams } from 'react-router-dom';

import {
    Row,
    Col,
	Form,
	Input,
	Label,
	Button,
	Card,
    CardHeader,
    CardBody,
	FormFeedback,
    Spinner
} from "reactstrap";

import AuthContext from "@context/AuthContext"
import SchoolContext from "@context/SchoolContext"

import { validate, convertDefaultValue, prof_general_direct } from "@utils"
import { validateSchema } from '../../validateSchema';

const MainInformation = ({ }) => {

    const { definition_Id } = useParams()

    const { user } = useContext(AuthContext)

    const { school_id } = useContext(SchoolContext)

    const { t } = useTranslation()

    // UseState
    const [degree_option, setDegreeOption] = useState([])
    const [department_option, setDepartmentOption] = useState([])
    const [is_valid, setValid] = useState(true)
    const [prof_general_option, setProfGeneralOption] = useState(prof_general_direct())
    const [profgenId, setProfGenId] = useState('')


    // ** Hook
    const { control, handleSubmit, reset, setValue, setError, formState: { errors } } = useForm(validate(validateSchema));

	// Loader
	const { Loader, isLoading, fetchData } = useLoader({});

    const [value, setValues] = useState('');

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

    useEffect(() => {
        if(Object.keys(user).length > 0 && user.permissions.includes('lms-study-profession-update') &&school_id) {
            setValid(false)
        }
    },[user])

    async function getDatas() {
        if(definition_Id) {
            const { success, data } = await fetchData(definationApi.getOne(definition_Id))
            if(success) {
                // засах үед дата байх юм бол setValue-р дамжуулан утгыг харуулна
                if(data === null) return
                for(let key in data) {
                    if(data[key] == null)
                        setValue(key,'')
                    else {
                        setValue(key, data[key])
                    }

                    if(key === 'degree' || key === 'department' || key === 'general_direct') {
                        setValue(key, data[key]?.id)

                    }
                }
            }
        }
    }

    useEffect(() => {
        getDatas()
        getProfessionDegree()
        getDepartmentOption()
    },[])

	async function onSubmit(cdata) {
        cdata = convertDefaultValue(cdata)
        const { success, errors } = await fetchData(definationApi.put(cdata, definition_Id))
        if(success) {
            reset()
            getDatas()
        } else {
            /** Алдааны мессэжийг input дээр харуулна */
            for (let key in errors) {
                setError(key, { type: 'custom', message:  errors[key][0]});
            }
        }
	}

	return (
        <Fragment>
            <Card className="modal-dialog-centered modal-lg">
            {isLoading && <div className='suspense-loader'><Spinner size='xl'/></div>}
                <CardHeader className='bg-transparent pb-0'></CardHeader>
                <CardBody className="px-sm-3 pt-50 pb-3">
                    <div className='text-center'>
                        <h4>{t('Мэргэжлийн тодорхойлолт засах')}</h4>
                    </div>
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
                                            isDisabled={is_valid}
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
                                {t('Мэргэжлийн индекс')}
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
                                        readOnly={is_valid}
                                        disabled={is_valid}
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
                                        readOnly={is_valid}
                                        disabled={is_valid}
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
                                        readOnly={is_valid}
                                        disabled={is_valid}
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
                                        readOnly={is_valid}
                                        disabled={is_valid}
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
                                                // onChange(val?.id || '')
                                            }}
                                            isDisabled={is_valid}
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
                                            isSearchable={true}
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
                                        readOnly={is_valid}
                                        disabled={is_valid}
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
                                        readOnly={is_valid}
                                        disabled={is_valid}
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
                                        readOnly={is_valid}
                                        disabled={is_valid}
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
                                        readOnly={is_valid}
                                        disabled={is_valid}
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
                                        readOnly={is_valid}
                                        disabled={is_valid}
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
                                        readOnly={is_valid}
                                        disabled={is_valid}
                                        placeholder={t('Олгох мэдлэг чадвар')}
                                        invalid={errors.knowledge_skill && true}
                                    />
                                )}
                            />
                            {errors.knowledge_skill && <FormFeedback className='d-block'>{t(errors.knowledge_skill.message)}</FormFeedback>}
                        </Col>
                        <Col lg={4} xs={12}>
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
                                            readOnly={is_valid}
                                            disabled={is_valid}
                                            placeholder={t('Хөтөлбөр батлагдсан он')}
                                            invalid={errors.confirm_year && true}
                                            onKeyDown={(e) =>["e", "E", "+", "-", "."].includes(e.key) && e.preventDefault()}
                                        />
                                    )
                                }}
                            />
                                {errors.confirm_year && <FormFeedback className='d-block'>{t(errors.confirm_year.message)}</FormFeedback>}
                            </Col>
                            <Col lg={4} xs={12}>
                            <Label className="form-label  me-1" for="duration">
                                {t('Суралцах хугацаа /жил/')}
                            </Label>
                            <Controller
                                control={control}
                                id="duration"
                                name="duration"
                                defaultValue=''
                                render={({ field }) => {
                                    return (
                                        <Input
                                            {...field}
                                            id="duration"
                                            type="number"
                                            bsSize="sm"
                                            readOnly={is_valid}
                                            disabled={is_valid}
                                            placeholder={t('Суралцах хугацаа /жил/')}
                                            invalid={errors.duration && true}
                                        />
                                    )
                                }}
                            />
                                {errors.duration && <FormFeedback className='d-block'>{t(errors.duration.message)}</FormFeedback>}
                            </Col>
                            <Col lg={4} xs={12}>
                            <Label className="form-label  me-1" for="volume_kr">
                                {t('Нийт багц цаг')}
                            </Label>
                            <Controller
                                control={control}
                                id="volume_kr"
                                name="volume_kr"
                                defaultValue=''
                                render={({ field }) => {
                                    return (
                                        <Input
                                            {...field}
                                            id="volume_kr"
                                            type="number"
                                            bsSize="sm"
                                            readOnly={is_valid}
                                            disabled={is_valid}
                                            placeholder={t('Нийт багц цаг')}
                                            invalid={errors.volume_kr && true}
                                        />
                                    )
                                }}
                            />
                                {errors.volume_kr && <FormFeedback className='d-block'>{t(errors.volume_kr.message)}</FormFeedback>}
                            </Col>
                            <Col lg={12}>
                                <Row className="border rounded-2 mx-0" >
                                    <Label className="form-label m-1 ms-0 mb-0">
                                        {t('Сонгон судлах багц цаг')}
                                        <hr />
                                    </Label>
                                    <Col md={4}>
                                        <Label className="form-label" for="general_base">
                                            {t('Ерөнхий суурь хичээл')}
                                        </Label>
                                        <Controller
                                            control={control}
                                            id="general_base"
                                            name="general_base"
                                            defaultValue=''
                                            render={({ field }) => {
                                                return (
                                                    <Input
                                                        className='mb-1'
                                                        {...field}
                                                        type="number"
                                                        bsSize='sm'
                                                        readOnly={is_valid}
                                                        disabled={is_valid}
                                                        placeholder={t('Ерөнхий суурь хичээл')}
                                                    />
                                                )
                                            }}
                                        />
                                    </Col>
                                    <Col md={4}>
                                        <Label className="form-label" for="professional_base">
                                            {t('Мэргэжлийн суурь хичээл')}
                                        </Label>
                                        <Controller
                                            control={control}
                                            id="professional_base"
                                            name="professional_base"
                                            defaultValue=''
                                            render={({ field }) => {
                                                return (
                                                    <Input
                                                        className='mb-1'
                                                        {...field}
                                                        type="number"
                                                        bsSize='sm'
                                                        readOnly={is_valid}
                                                        disabled={is_valid}
                                                        placeholder={t('Мэргэжлийн суурь хичээл')}
                                                    />
                                                )
                                            }}
                                        />
                                    </Col>
                                    <Col md={4}>
                                        <Label className="form-label" for="professional_lesson">
                                            {t('Мэргэжлийн хичээл')}
                                        </Label>
                                        <Controller
                                            control={control}
                                            id="professional_lesson"
                                            name="professional_lesson"
                                            defaultValue=''
                                            render={({ field }) => {
                                                return (
                                                    <Input
                                                        className='mb-1'
                                                        {...field}
                                                        type="number"
                                                        bsSize='sm'
                                                        readOnly={is_valid}
                                                        disabled={is_valid}
                                                        placeholder={t('Мэргэжлийн хичээл')}
                                                    />
                                                )
                                            }}
                                        />
                                    </Col>

                                </Row>
                            </Col>
                        <Col className='text-center mt-2' md={12}>
                            <Button className="me-2" disabled={is_valid} size='sm' color="primary" type="submit">
                                {t('Хадгалах')}
                            </Button>
                        </Col>
                    </Row>
                </CardBody>
            </Card>
        </Fragment>
	);
};
export default MainInformation;


