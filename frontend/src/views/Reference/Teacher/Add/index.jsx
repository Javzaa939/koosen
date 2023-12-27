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
    const departmentApi = useApi().hrms.department
    const subSchoolApi = useApi().hrms.subschool
    const orgPositionApi = useApi().hrms.position

    const [selected_values, setSelectValue] = useState(values);

    /* Тэнхим жагсаалт авах функц */
	async function getDepartmentOption() {
		var school = school_id
		const { success, data } = await fetchData(departmentApi.getSelectSchool(school))
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
        getPositionOption()
    },[open, school_id])

    async function onSubmit(cdata) {

        cdata['user']=user.id
        cdata['org']=1
        cdata['sub_org']=school_id
        cdata = convertDefaultValue(cdata)

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
                                            className={classnames('react-select opacity-100', { 'is-invalid': errors.salbar})}
                                            placeholder={t('-- Сонгоно уу --')}
                                            options={department || []}
                                            value={value && department.find((c) => c.id === value)}
                                            noOptionsMessage={() => t('Хоосон байна.')}
                                            onChange={(val) => {
                                                onChange(val?.id || '')
                                                setSelectValue({
                                                    subschool_id: school_id,
                                                })
                                            }}
                                            styles={ReactSelectStyles}
                                            getOptionValue={(option) => option.id}
                                            getOptionLabel={(option) => option.name}
                                        />
                                    )
                                }}
                            ></Controller>
                            {errors.salbar && <FormFeedback className='d-block'>{errors.salbar.message}</FormFeedback>}
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
                                            className={classnames('react-select opacity-100', { 'is-invalid': errors.org_position})}
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
                            {errors.org_position && <FormFeedback className='d-block'>{errors.org_position.message}</FormFeedback>}
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
                                <Label className="form-label" for="register_code">
                                    {t('Ажилтны код')}
                                </Label>
                                <Controller
                                    defaultValue=''
                                    control={control}
                                    id="register_code"
                                    name="register_code"
                                    render={({ field }) => (
                                        <Input
                                            id ="register_code"
                                            bsSize="sm"
                                            placeholder={t('Ажилтны код')}
                                            {...field}
                                            type="text"
                                            invalid={errors.register && true}
                                        />
                                    )}
                                />
                                {errors.register_code && <FormFeedback className='d-block'>{t(errors.register_code.message)}</FormFeedback>}
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
