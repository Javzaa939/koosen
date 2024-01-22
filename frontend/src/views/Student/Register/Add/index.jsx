// ** React imports
import React, { Fragment, useState, useEffect, useContext } from 'react'

import { X } from "react-feather";

import Select from 'react-select'

import useApi from "@hooks/useApi";
import useLoader from "@hooks/useLoader";
import SchoolContext from "@context/SchoolContext"
import ActiveYearContext from "@context/ActiveYearContext"

import { ReactSelectStyles , pay_type } from "@utils"

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

import { validate, convertDefaultValue, get_ys_undes } from "@utils"

import { validateSchema } from '../validateSchema';
import { useTranslation } from 'react-i18next'


const gender_option = [
    {
        id: '1',
        name: 'эрэгтэй'
    },
    {
        id: '2',
        name: 'эмэгтэй'
    },
]

const Addmodal = ({ open, handleModal, refreshDatas }) => {

    const CloseBtn = (
        <X className="cursor-pointer" size={15} onClick={handleModal} />
    )

    const { school_id } = useContext(SchoolContext)
    // const { school_id } = useContext(Act)
    const [departId, setDepart] = useState('')

	const { cyear_name } = useContext(ActiveYearContext)

    const [status_option, setStatusOption] = useState([])
    const [group_option, setGroupOption] = useState([])
    const [department_option, setDepartmentOption] = useState([])
    const [country_option, setCountryOption] = useState([])
    const [citizen_name, setCitizen] = useState('Монгол')
    const [groupChecked, setGroupChecked] = useState(false)
    const [citizen_id, setCitizenId] = useState(country_option.find((c) => c.name === citizen_name)?.id || '')

    const [yas_undes, setYasUndes] = useState([])
    const { t } = useTranslation()

    // ** Hook
    const { control, handleSubmit, reset, setError, setValue, formState: { errors } } = useForm(validate(validateSchema));

    // states
    const [pay_type_option, setPayTypeOption] = useState(pay_type())
    const [is_khur, setKhur] = useState(false)

	// Loader
	const { Loader, isLoading, fetchData } = useLoader({});
	const { isLoading: postLoading, fetchData: postFetch } = useLoader({});

    // Api
    const studentApi = useApi().student
    const groupApi = useApi().student.group
    const departmentApi = useApi().hrms.department
    const studentRegisterStatusApi = useApi().settings.studentRegisterType
    const countryApi = useApi().hrms.country

    function check_year(group_year) {
        var checked = false
        var start_active_year = cyear_name.split('-')[0]
        if(group_year) {
            var group_active_year = group_year.split('-')[0]
            if (parseInt(group_active_year) < parseInt(start_active_year)) {
                checked = true
            }
        }


        setGroupChecked(checked)
    }

    // Ангийн жагсаалт авах
    async function getGroup() {
        const { success, data } = await fetchData(groupApi.getList(departId))
        if(success) {
            setGroupOption(data)
        }
    }

    // Салбар, тэнхимийн жагсаалт
    async function getDepartment() {
        const { success, data } = await fetchData(departmentApi.get())
        if(success) {
            setDepartmentOption(data)
        }
    }

    // Оюутны бүртгэлийн жагсаалт авах
    async function getStudentStatus() {
        const { success, data } = await fetchData(studentRegisterStatusApi.get())
        if(success) {
            setStatusOption(data)
        }
    }

	async function onSubmit(cdata) {
        cdata['school'] = school_id
        cdata['is_khur'] = is_khur
        // cdata['citizen_name'] = citizen_name
        // cdata['citizenship'] = citizen_id
        cdata = convertDefaultValue(cdata)

        const { success, errors } = await postFetch(studentApi.post(cdata))
        if(success)
        {
            handleModal()
            refreshDatas()
            reset()
        } else {
            /** Алдааны мессэжийг input дээр харуулна */
            for (let key in errors) {
                setError(key, { type: 'custom', message:  errors[key][0]});
            }
        }
	}

    function getYasUndes() {
        setYasUndes(get_ys_undes)
    }

    // Харьяалал жагсаалт авах
    const getCountry = async() => {
        const { success, data } = await fetchData(countryApi.get())
        if(success)
        {
            setCountryOption(data)
        }
    }

    useEffect(() => {
        getStudentStatus()
        getYasUndes()
        getDepartment()
        getCountry()
    },[])

    useEffect(
        () =>
        {
            getGroup()
            if (departId == undefined) setValue('group', '')
        },
        [departId, school_id]
    )

	return (
        <Fragment>
            {
                postLoading &&
                    <div className='suspense-loader'>
                        <Spinner size='bg'/>
                        <span className='ms-50'>{t('Түр хүлээнэ үү...')}</span>
                    </div>
            }
            <Modal
                isOpen={open}
                toggle={handleModal}
                className='sidebar-xl'
                modalClassName='modal-slide-in'
                contentClassName='pt-0'
                style={{ maxWidth: '700px', width: '100%' }}
            >
                <ModalHeader
                    className="mb-1"
                    toggle={handleModal}
                    close={CloseBtn}
                    tag="div"
                >
                    <h5 className="modal-title">{t('Оюутан нэмэх')}</h5>
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
                                            noOptionsMessage={() => t('Хоосон байна')}
                                            onChange={(val) => {
                                                onChange(val?.id || ''),
                                                setDepart(val?.id)
                                            }}
                                            styles={ReactSelectStyles}
                                            getOptionValue={(option) => option.id}
                                            getOptionLabel={(option) => option.name}
                                        />
                                    )
                                }}
                            ></Controller>
                            {errors.department && <FormFeedback className='d-block'>{errors.department.message}</FormFeedback>}
                        </Col>
                        <Col lg={6} xs={12}>
                            <Label className="form-label" for="group">
                                {t('Анги')}
                            </Label>
                            <Controller
                                control={control}
                                defaultValue=''
                                name="group"
                                render={({ field: { value, onChange} }) => {
                                    return (
                                        <Select
                                            name="group"
                                            id="group"
                                            classNamePrefix='select'
                                            isClearable
                                            className={classnames('react-select', { 'is-invalid': errors.group })}
                                            isLoading={isLoading}
                                            placeholder={t(`-- Сонгоно уу --`)}
                                            options={group_option || []}
                                            value={group_option.find((c) => c.id === value)}
                                            noOptionsMessage={() => t('Хоосон байна')}
                                            onChange={(val) => {
                                                onChange(val?.id || '')
                                                check_year(val?.join_year || '')
                                            }}
                                            styles={ReactSelectStyles}
                                            getOptionValue={(option) => option.id}
                                            getOptionLabel={(option) => option.name}
                                        />
                                    )
                                }}
                            ></Controller>
                            {errors.group && <FormFeedback className='d-block'>{errors.group.message}</FormFeedback>}
                        </Col>
                        <Col lg={6} xs={12}>
                            <Label className="form-label" for="citizenship">
                                {t('Харьяалал')}
                            </Label>
                            <Controller
                                control={control}
                                defaultValue={citizen_id}
                                name="citizenship"
                                render={({ field: { value, onChange} }) => {
                                    return (
                                        <Select
                                            name="citizenship"
                                            id="citizenship"
                                            classNamePrefix='select'
                                            isClearable
                                            className={classnames('react-select', { 'is-invalid': errors.citizenship })}
                                            isLoading={isLoading}
                                            placeholder={t(`-- Сонгоно уу --`)}
                                            options={country_option || []}
                                            value={country_option.find((c) => c.id === value)}
                                            noOptionsMessage={() => t('Хоосон байна')}
                                            onChange={(val) => {
                                                setCitizenId(val?.id || '')
                                                setCitizen(val?.name)
                                                onChange(val?.id || '')
                                            }}
                                            styles={ReactSelectStyles}
                                            getOptionValue={(option) => option.id}
                                            getOptionLabel={(option) => option.name}
                                        />
                                    )
                                }}
                            ></Controller>
                            {errors.citizenship && <FormFeedback className='d-block'>{errors.citizenship.message}</FormFeedback>}
                        </Col>
                        <Col lg={6} xs={12}>
                            <Label className="form-label" for="register_num">
                                {citizen_name?.includes('Монгол') ? t('Регистрийн дугаар') : t('Гадаад пасспорт дугаар')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id="register_num"
                                name="register_num"
                                render={({ field }) => (
                                    <Input
                                        id ="register_num"
                                        bsSize="sm"
                                        placeholder={citizen_name?.includes('Монгол') ? t('Регистрийн дугаар') : t('Гадаад пасспорт дугаар')}
                                        {...field}
                                        type="text"
                                        invalid={errors.register_num && true}
                                    />
                                )}
                            />
                            {errors.register_num && <FormFeedback className='d-block'>{errors.register_num.message}</FormFeedback>}
                        </Col>
                        {/* {
                            citizen_name.includes('Монгол')
                            &&
                                <Col lg={6} xs={12} className="pt-2">
                                    <div className='mb-1 d-flex '>
                                        <Label className='form-label pe-1' for='is_khur'>
                                            ХУР-аас мэдээлэл татах:
                                        </Label>
                                        <Input
                                            id='is_khur'
                                            checked={is_khur}
                                            onChange={(e) => setKhur(e.target.checked)}
                                            type="checkbox"
                                        />
                                    </div>
                                    {is_khur && <FormFeedback className='d-block'>{'ХУР мэдээллийн сангаас иргэний мэдээлэл авах үед үндсэн мэдээлэл бөглөх шаардлагагүй.'}</FormFeedback>}
                                </Col>
                        } */}
                        {/* {
                            groupChecked
                            && */}
                        <Col lg={6} xs={12}>
                            <Label className="form-label" for="code">
                                {t('Оюутны код')}
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
                                        placeholder={t("Оюутны код")}
                                        {...field}
                                        type="text"
                                    />
                                )}
                            />
                        </Col>
                        {/* } */}
                        <Col lg={6} xs={12}>
                            <Label className="form-label" for="family_name">
                                {t('Ургийн овог')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id="family_name"
                                name="family_name"
                                render={({ field }) => (
                                    <Input
                                        id ="family_name"
                                        bsSize="sm"
                                        placeholder={t('Ургийн овог')}
                                        {...field}
                                        type="text"
                                        invalid={errors.family_name && true}
                                    />
                                )}
                            />
                            {errors.family_name && <FormFeedback className='d-block'>{errors.family_name.message}</FormFeedback>}
                        </Col>
                        <Col lg={6} xs={12}>
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
                        <Col lg={6} xs={12}>
                            <Label className="form-label" for="last_name_eng">
                                {t('Эцэг/эхийн нэр англи')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id="last_name_eng"
                                name="last_name_eng"
                                render={({ field }) => (
                                    <Input
                                        id ="last_name_eng"
                                        bsSize="sm"
                                        placeholder={t("Эцэг/эхийн нэр англи")}
                                        {...field}
                                        type="text"
                                        invalid={errors.last_name_eng && true}
                                    />
                                )}
                            />
                            {errors.last_name_eng && <FormFeedback className='d-block'>{errors.last_name_eng.message}</FormFeedback>}
                        </Col>
                        <Col lg={6} xs={12}>
                            <Label className="form-label" for="first_name">
                                {t("Өөрийн нэр")}
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
                                        placeholder={t("Өөрийн нэр")}
                                        {...field}
                                        type="text"
                                        invalid={errors.first_name && true}
                                    />
                                )}
                            />
                            {errors.first_name && <FormFeedback className='d-block'>{errors.first_name.message}</FormFeedback>}
                        </Col>
                        <Col lg={6} xs={12}>
                            <Label className="form-label" for="first_name_eng">
                                {t('Өөрийн нэр англи')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id="first_name_eng"
                                name="first_name_eng"
                                render={({ field }) => (
                                    <Input
                                        id ="first_name_eng"
                                        bsSize="sm"
                                        placeholder={t("Өөрийн нэр англи")}
                                        {...field}
                                        type="text"
                                        invalid={errors.first_name_eng && true}
                                    />
                                )}
                            />
                            {errors.first_name_eng && <FormFeedback className='d-block'>{errors.first_name_eng.message}</FormFeedback>}
                        </Col>
                        <Col lg={6} xs={12}>
                            <Label className="form-label" for="phone">
                                {t('Утасны дугаар')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id="phone"
                                name="phone"
                                render={({ field }) => (
                                    <Input
                                        id ="phone"
                                        bsSize="sm"
                                        placeholder={t('Утасны дугаар')}
                                        {...field}
                                        type="number"
                                        invalid={errors.phone && true}
                                    />
                                )}
                            />
                            {errors.phone && <FormFeedback className='d-block'>{errors.phone.message}</FormFeedback>}
                        </Col>
                        <Col lg={6} xs={12}>
                            <Label className="form-label" for="gender">
                                {t('Хүйс')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id="gender"
                                name="gender"
                                render={({ field: { value, onChange} }) => {
                                    return (
                                        <Select
                                            name="gender"
                                            id="gender"
                                            classNamePrefix='select'
                                            isClearable
                                            className={classnames('react-select', { 'is-invalid': errors.gender })}
                                            isLoading={isLoading}
                                            placeholder={t(`-- Сонгоно уу --`)}
                                            options={gender_option || []}
                                            value={gender_option.find((c) => c.id === value)}
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
                            {errors.gender && <FormFeedback className='d-block'>{errors.gender.message}</FormFeedback>}
                        </Col>
                        <Col lg={6} xs={12}>
                            <Label className="form-label" for="yas_undes">
                                {t('Яс үндэс')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id="yas_undes"
                                name="yas_undes"
                                render={({ field: { value, onChange} }) => {
                                    return (
                                        <Select
                                            name="yas_undes"
                                            id="yas_undes"
                                            classNamePrefix='select'
                                            isClearable
                                            className={classnames('react-select', { 'is-invalid': errors.yas_undes })}
                                            isLoading={isLoading}
                                            placeholder={t(`-- Сонгоно уу --`)}
                                            options={yas_undes || []}
                                            value={yas_undes.find((c) => c.name === value)}
                                            noOptionsMessage={() => t('Хоосон байна.')}
                                            onChange={(val) => {
                                                onChange(val?.name || '')
                                            }}
                                            styles={ReactSelectStyles}
                                            getOptionValue={(option) => option.id}
                                            getOptionLabel={(option) => option.name}
                                        />
                                    )
                                }}
                            />
                            {errors.yas_undes && <FormFeedback className='d-block'>{errors.yas_undes.message}</FormFeedback>}
                        </Col>
                        <Col lg={6} xs={12}>
                            <Label className="form-label" for="status">
                                {t('Бүртгэлийн байдал')}
                            </Label>
                            <Controller
                                control={control}
                                defaultValue=''
                                name="status"
                                render={({ field: { value, onChange} }) => {
                                    return (
                                        <Select
                                            name="status"
                                            id="status"
                                            classNamePrefix='select'
                                            isClearable
                                            className={classnames('react-select', { 'is-invalid': errors.status })}
                                            isLoading={isLoading}
                                            placeholder={t(`-- Сонгоно уу --`)}
                                            options={status_option || []}
                                            value={status_option.find((c) => c.id === value)}
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
                            {errors.status && <FormFeedback className='d-block'>{errors.status.message}</FormFeedback>}
                        </Col>
                        <Col lg={6} xs={12}>
                            <Label className="form-label" for="pay_type">
                                {t('Төлбөр төлөлт')}
                            </Label>
                            <Controller
                                control={control}
                                defaultValue=''
                                name="pay_type"
                                render={({ field: { value, onChange} }) => {
                                    return (
                                        <Select
                                            name="pay_type"
                                            id="pay_type"
                                            classNamePrefix='select'
                                            isClearable
                                            className={classnames('react-select', { 'is-invalid': errors.pay_type })}
                                            isLoading={isLoading}
                                            placeholder={t(`-- Сонгоно уу --`)}
                                            options={pay_type_option || []}
                                            value={pay_type_option.find((c) => c.id === value)}
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
                            {errors.pay_type && <FormFeedback className='d-block'>{errors.pay_type.message}</FormFeedback>}
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
