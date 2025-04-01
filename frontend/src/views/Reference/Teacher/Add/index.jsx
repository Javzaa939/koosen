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

const AddModal = ({ open, handleModal, refreshDatas, editData}) => {

    const rank_type_option = [
        {
            'id': 1,
            'name': 'Дадлагажигч багш',
        },
        {
            'id': 2,
            'name': 'Багш',
        },
        {
            'id': 3,
            'name': 'Ахлах багш',
        },
        {
            'id': 4,
            'name': 'Дэд профессор',
        },
        {
            'id': 5,
            'name': 'Профессор',
        }
    ]

    const CloseBtn = (
        <X className="cursor-pointer" size={15} onClick={handleModal} />
    )
    const { user } = useContext(AuthContext)
    const { school_id } = useContext(SchoolContext)

    // ** Hook
    const { control, handleSubmit, reset, setError, formState: { errors }, setValue } = useForm(validate(validateSchema));

    const [is_loading, setLoader] = useState(false)
    const { isLoading: postLoading, fetchData: postFetch } = useLoader({});

    const [department, setDepartmentData] = useState([]);
	const [position, setOrgPositionData] = useState([]);

    // Loader
	const { Loader, isLoading, fetchData } = useLoader({});

    // Api
	const teacherApi = useApi().hrms.teacher
    const departmentApi = useApi().hrms.department
    const orgPositionApi = useApi().hrms.position

    /* Тэнхим жагсаалт авах функц */
	async function getDepartmentOption() {
		const { success, data } = await fetchData(departmentApi.getSelectSchool())
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
    },[])

    async function onSubmit(cdata) {
        cdata['sub_org']=school_id
        cdata = convertDefaultValue(cdata)

        if (editData && editData?.id) {
            const { success, error } = await postFetch(teacherApi.putRegister(cdata, editData?.id))
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
        } else {
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

	}

    useEffect(
        () => {
            if(editData === null) return
            for(let key in editData) {
                if(editData[key] !== null)
                    setValue(key, editData[key])
                else setValue(key,'')
                if (key === 'salbar') {
                    setValue(key, editData[key]?.id)
                }
            }
        }, [editData,]
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
                            <Label className="form-label" for="teacher_rank_type">
                                {t('Албан тушаалын зэрэглэл')}
                            </Label>
                            <Controller
                                control={control}
                                defaultValue=''
                                name="teacher_rank_type"
                                render={({ field: { value, onChange} }) => {
                                    return (
                                        <Select
                                            name="teacher_rank_type"
                                            id="teacher_rank_type"
                                            classNamePrefix='select'
                                            isClearable
                                            className={classnames('react-select opacity-100', { 'is-invalid': errors.teacher_rank_type})}
                                            placeholder={t('-- Сонгоно уу --')}
                                            options={rank_type_option || []}
                                            value={value && rank_type_option.find((c) => c.id === value)}
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
                            {errors.teacher_rank_type && <FormFeedback className='d-block'>{errors.teacher_rank_type.message}</FormFeedback>}
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
                        <Col lg={12} xs={12}>
                            <Label className="form-label" for="last_name">
                                {t('Эцэг/эхийн нэр')}
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
                                        placeholder={t("Эцэг/эхийн нэр")}
                                        {...field}
                                        type="text"
                                        invalid={errors.last_name && true}
                                    />
                                )}
                            />
                            {errors.last_name && <FormFeedback className='d-block'>{errors.last_name.message}</FormFeedback>}
                        </Col>
                        <Col lg={12} xs={12}>
                            <Label className="form-label" for="first_name">
                                {t('Нэр')}
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
                                        placeholder={t("Нэр")}
                                        {...field}
                                        type="text"
                                        invalid={errors.first_name && true}
                                    />
                                )}
                            />
                            {errors.first_name && <FormFeedback className='d-block'>{errors.first_name.message}</FormFeedback>}
                        </Col>
                        <Col lg={12} xs={12}>
                            <Label className="form-label" for="register">
                                {t('Регистрийн дугаар')}
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
                                        placeholder={t("Регистрийн дугаар")}
                                        {...field}
                                        type="text"
                                        invalid={errors.register && true}
                                    />
                                )}
                            />
                            {errors.register && <FormFeedback className='d-block'>{errors.register.message}</FormFeedback>}
                        </Col>
                        <Col lg={12} xs={12}>
                            <Label className="form-label" for="email">
                                {t('И-мэйл')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id="email"
                                name="email"
                                render={({ field }) => (
                                    <Input
                                        id ="email"
                                        bsSize="sm"
                                        placeholder={t("И-мэйл")}
                                        {...field}
                                        type="email"
                                        invalid={errors.email && true}
                                    />
                                )}
                            />
                            {errors.email && <FormFeedback className='d-block'>{errors.email.message}</FormFeedback>}
                        </Col>
                        <Col lg={12} xs={12}>
                            <Label className="form-label" for="phone_number">
                                {t('Утасны дугаар')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id="phone_number"
                                name="phone_number"
                                render={({ field }) => (
                                    <Input
                                        id ="phone_number"
                                        bsSize="sm"
                                        placeholder={t("Утасны дугаар")}
                                        {...field}
                                        type="number"
                                        invalid={errors.phone_number && true}
                                    />
                                )}
                            />
                            {errors.phone_number && <FormFeedback className='d-block'>{errors.phone_number.message}</FormFeedback>}
                        </Col>
                        <Col md={12}>
                            <Label className="form-label" for="state">
                                {t('Төлөв')}
                            </Label>
                            <Controller
                                control={control}
                                defaultValue=''
                                name="state"
                                render={({ field: { value, onChange} }) => {
                                    return (
                                        <Select
                                            name="state"
                                            id="state"
                                            classNamePrefix='select'
                                            isClearable
                                            className={classnames('react-select opacity-100', { 'is-invalid': errors.state})}
                                            placeholder={t('-- Сонгоно уу --')}
                                            options={get_emp_state() || []}
                                            value={value && get_emp_state().find((c) => c.id === value)}
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
                            {errors.state && <FormFeedback className='d-block'>{errors.state.message}</FormFeedback>}
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
