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

import { validate, convertDefaultValue, get_emp_state } from "@utils"

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
    const { control, handleSubmit, reset, setError, formState: { errors }, setValue } = useForm();
    // const { control, handleSubmit, reset, setError, formState: { errors } } = useForm(validate(validateSchema));

    var values = {
		subschool_id: '',
		department_id: ''
	}

    // states
    const [is_loading, setLoader] = useState(false)
    const { isLoading: postLoading, fetchData: postFetch } = useLoader({});
    const [department, setDepartmentData] = useState([]);
	const [sub_org, setSubOrgOption] = useState([]);
	const [position, setOrgPositionData] = useState([]);
    const [state_option, setStateOption] = useState(get_emp_state())

    // Loader
	const { Loader, isLoading, fetchData } = useLoader({});

    // Api
	const teacherApi = useApi().hrms.teacher
    // const getLeaderApi = useApi().hrms.department
    const departmentApi = useApi().hrms.department
    const subSchoolApi = useApi().hrms.subschool
    const orgPositionApi = useApi().hrms.position

    const [selected_values, setSelectValue] = useState(values);

    /* бүрэлдэхүүн сургуулуудын жагсаалт авах функц */
    async function getSubOrgList() {
        const { success, data } = await fetchData(subSchoolApi.get())
        if (success) {
            setSubOrgOption(data)
        }
    }
    /* Тэнхим жагсаалт авах функц */
	async function getDepartmentOption() {
		var school_id = selected_values.subschool_id
        console.log("salbars",school );
		const { success, data } = await fetchData(departmentApi.getSelectSchool(school_id))
		if (success) {
			setDepartmentData(data)
		}
	}

    /* Албан тушаалын жагсаалт авах функц */
	async function getPositionOption() {
		const { success, data } = await fetchData(orgPositionApi.get())
		if (success) {
			setOrgPositionData(data)
		}
	}

    useEffect(() => {
        getDepartmentOption()
        getSubOrgList()
        getPositionOption()
    },[selected_values])

    async function onSubmit(cdata) {

        cdata['user']=user.id
        cdata['org']=school_id
        cdata = convertDefaultValue(cdata)
        console.log("datas", cdata)

        const { success, error } = await postFetch(teacherApi.postRegister(cdata))
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
                    <h5 className="modal-title">{t('Багшийн мэдээлэл нэмэх')}</h5>

                </ModalHeader>
                <ModalBody className="flex-grow-1">
                    <Row tag={Form} className="gy-1" onSubmit={handleSubmit(onSubmit)}>
                        <Col md={12}>
                            <Label className="form-label" for="sub_org">
                                {t('Бүрэлдэхүүн сургууль')}
                            </Label>
                            <Controller
                                control={control}
                                defaultValue=''
                                name="sub_org"
                                render={({ field: { value, onChange} }) => {
                                    return (
                                        <Select
                                            name="sub_org"
                                            id="sub_org"
                                            classNamePrefix='select'
                                            isClearable
                                            className='react-select'
                                            placeholder={t('-- Сонгоно уу --')}
                                            options={sub_org || []}
                                            value={sub_org.find((c) => c.id === value)}
                                            noOptionsMessage={() => t('Хоосон байна.')}
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
                        </Col>
                        <Col md={12}>
                            <Label className="form-label" for="salbar">
                                {t('Тэнхим')}
                            </Label>
                            <Controller
                                control={control}
                                defaultValue=''
                                name="salbar"
                                render={({ field: { value, onChange} }) => {
                                    return (
                                        <Select
                                            name="salbar"
                                            id="salbar"
                                            classNamePrefix='select'
                                            isClearable
                                            className='react-select'
                                            placeholder={t('-- Сонгоно уу --')}
                                            options={department || []}
                                            value={value && department.find((c) => c.id === value)}
                                            noOptionsMessage={() => t('Хоосон байна.')}
                                            onChange={(val) => {
                                                onChange(val?.id || '')
                                                setSelectValue({
                                                    subschool_id: selected_values.subschool_id,
                                                })
                                            }}
                                            styles={ReactSelectStyles}
                                            getOptionValue={(option) => option.id}
                                            getOptionLabel={(option) => option.name}
                                        />
                                    )
                                }}
                            ></Controller>
                        </Col>
                         <Col md={12}>
                            <Label className="form-label" for="org_position">
                                {t('Албан тушаал')}
                            </Label>
                            <Controller
                                control={control}
                                defaultValue=''
                                name="org_position"
                                render={({ field: { value, onChange} }) => {
                                    return (
                                        <Select
                                            name="org_position"
                                            id="org_position"
                                            classNamePrefix='select'
                                            isClearable
                                            className='react-select'
                                            placeholder={t('-- Сонгоно уу --')}
                                            options={position || []}
                                            value={value && position.find((c) => c.id === value)}
                                            noOptionsMessage={() => t('Хоосон байна.')}
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
                        </Col>
                        <Col md={12}>
                                <Label className="form-label" for="state">
                                    {t('Төлөв')}
                                </Label>
                                <Controller
                                    defaultValue=''
                                    control={control}
                                    id="state"
                                    name="state"
                                    render={({ field: { value, onChange} }) => {
                                        return (
                                            <Select
                                                name="state"
                                                id="state"
                                                classNamePrefix='select'
                                                isClearable
                                                className={classnames('react-select opacity-100', { 'is-invalid': errors.state })}
                                                isLoading={isLoading}
                                                placeholder={t(`-- Сонгоно уу --`)}
                                                options={state_option || []}
                                                value={state_option.find((c) => c.id === value)}
                                                noOptionsMessage={() => t('Хоосон байна.')}
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
                                {errors.state && <FormFeedback className='d-block'>{errors.state.message}</FormFeedback>}
                            </Col>
                            <Col  md={12}>
                                <Label className="form-label" for="register">
                                    {t('Ажилтны код')}
                                </Label>
                                <Controller
                                    defaultValue=''
                                    control={control}
                                    id="register"
                                    name="register"
                                    render={({ field }) => (
                                        <Input
                                            id ="register"
                                            bsSize="sm"
                                            placeholder={t('Ажилтны код')}
                                            {...field}
                                            type="text"
                                            invalid={errors.register && true}
                                        />
                                    )}
                                />
                                {errors.register && <FormFeedback className='d-block'>{t(errors.register.message)}</FormFeedback>}
                            </Col>
                            <Col  md={12}>
                            <Label className="form-label" for="last_name">
                                {t('Овог нэр')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id="last_name"
                                name="last_name"
                                render={({ field }) => (
                                    <Input
                                        id ="last_name"
                                        bsSize="sm"
                                        placeholder={t(' Овог нэр')}
                                        {...field}
                                        type="text"
                                        invalid={errors.last_name && true}
                                    />
                                )}
                            />
                            {errors.last_name && <FormFeedback className='d-block'>{t(errors.last_name.message)}</FormFeedback>}
                        </Col>
                        <Col  md={12}>
                            <Label className="form-label" for="first_name">
                                {t('нэр')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id="first_name"
                                name="first_name"
                                render={({ field }) => (
                                    <Input
                                        id ="first_name"
                                        bsSize="sm"
                                        placeholder={t('нэр')}
                                        {...field}
                                        type="text"
                                        invalid={errors.first_name && true}
                                    />
                                )}
                            />
                            {errors.first_name && <FormFeedback className='d-block'>{t(errors.first_name.message)}</FormFeedback>}
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
export default AddModal;
