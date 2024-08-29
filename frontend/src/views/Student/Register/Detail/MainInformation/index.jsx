// ** React imports
import React, { useState, useEffect, useContext } from 'react'

import { Edit, Save } from "react-feather";

import Select from 'react-select'

import useApi from "@hooks/useApi";
import useLoader from "@hooks/useLoader";

import AuthContext from "@context/AuthContext"
import SchoolContext from "@context/SchoolContext"

import { ReactSelectStyles, check_image_ext, mental_type, pay_type } from "@utils"

import { useParams, useNavigate } from 'react-router-dom';

import classnames from "classnames";

import { useForm, Controller } from "react-hook-form";

import {
    Row,
    Col,
	Form,
	Input,
	Label,
	Button,
    Spinner,
	FormFeedback,
    CardHeader,
    Card,
    CardTitle,
    CardBody
} from "reactstrap";

import { validate, convertDefaultValue, get_ys_undes, get_admission_before, get_gender_list } from "@utils"

import { validateSchema } from '../../validateSchema';
import { useTranslation } from 'react-i18next';


const MainInformation = () => {

    const { t } = useTranslation()
    const navigation = useNavigate()
    const [is_mental_checked, setMentalChecked] = useState(false)

    const { user } = useContext(AuthContext)
    const { school_id } = useContext(SchoolContext)
    const { studentId } = useParams()
    const [departId, setDepart] = useState('')
    const [gender_option, setGenderOption] = useState(get_gender_list())

    const [is_disabled, set_Disabled] = useState(true)
    const [is_edit, setEdit] = useState(true)
    const [changeImage, setChangeFile] = useState(false)
    const [status_option, setStatusOption] = useState([])
    const [group_option, setGroupOption] = useState([])
    const [department_option, setDepartmentOption] = useState([])
    const [country_option, setCountryOption] = useState([])
    const [unit1_option, setUnit1Option] = useState([]);
    const [unit2_option, setUnit2Option] = useState([]);
    const [selectedImage, setSelectedImage] = useState('');
    const [featureImage, setFeaturedImg] = useState('')
    const [errorImage, setErrorImage] = useState('')
    const [st_school, setStudentSchool] = useState('')
    const [mental_type_option, setMentalTypeOption] = useState(mental_type())
    const [pay_type_option, setPayTypeOption] = useState(pay_type())

    const [yas_undes, setYasUndes] = useState([])
    const [admission_before_op, setAdmission_before_op] = useState([])
    const [avatar, setAvatar] = useState(require('@src/assets/images/avatars/avatar-blank.png').default)

    // ** Hook
    const { control, handleSubmit, reset, setValue, setError, formState: { errors } } = useForm(validate(validateSchema));

	// Loader
	const { Loader, isLoading, fetchData } = useLoader({});

    // Api
    const studentApi = useApi().student
    const groupApi = useApi().student.group
    const departmentApi = useApi().hrms.department
    const studentRegisterStatusApi = useApi().settings.studentRegisterType
    const aimagApi = useApi().hrms.unit1
    const sumApi = useApi().hrms.unit2
    const countryApi = useApi().hrms.country

    /** Id-гаар хайж олоод tag дээр утга оноох */
    function changeTextById(id, text)
    {
        let tag = document.getElementById(id)
        if (tag)
        {
            tag.innerHTML = text
        }
    }

    const getDatas = async() => {
        const { success, data } = await fetchData(studentApi.getOne(studentId, 'main'))
        if(success)
        {
            if(data === null) return
            for(let key in data)
            {
                /** Уйгаржин бичиглэл ялгахын тулд */
                if (key === 'last_name_uig' || key === 'first_name_uig')
                {
                    changeTextById(`${key}_span`, data[key])
                }

                if(data[key] !== null)
                    setValue(key, data[key])
                else setValue(key,'')

                if(key === 'image') {
                    setFeaturedImg(data[key])
                }
                if(key === 'group' || key === 'department' || key === 'citizenship' || key === 'unit1' || key === 'unit2' || key === 'status') {
                    setValue(key, data[key]?.id)
                }
                if (key === 'unit1') {
                    if (data[key]?.id) getSum(data[key]?.id)
                }
                if (key === 'gender') setValue(key, data[key])
                if (key === 'school') setStudentSchool(data[key])
                if (key === 'is_mental') setMentalChecked(data[key])

            }
        }
    }

    // Ангийн жагсаалт авах
    async function getGroup() {
        const { success, data } = await fetchData(groupApi.getList(departId, '', '', '', school_id))
        if(success) {
            setGroupOption(data)
        }
    }

    // Салбар, тэнхимийн жагсаалт
    async function getDepartment() {
        const { success, data } = await fetchData(departmentApi.get(school_id))
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

    // Аймаг хот жагсаалт авах
    const getAimag = async() => {
        const { success, data } = await fetchData(aimagApi.get())
        if(success)
        {
            setUnit1Option(data)
        }
    }

    // Сум дүүрэг жагсаалт авах
    const getSum = async(aimag_id) => {
        const { success, data } = await fetchData(sumApi.get(aimag_id))
        if(success)
        {
            setUnit2Option(data)
        }
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
        if(Object.keys(user).length > 0 && user.permissions.includes('lms-student-register-update')) {
            set_Disabled(false)
        }
    },[user])


    useEffect(() => {
        if(st_school !== school_id && school_id && st_school)
        {
            navigation('/student/register/')
        }
    },[school_id, st_school])

	async function onSubmit(cdata) {
        cdata['school'] = school_id
        cdata["created_user"] = user.id
        cdata["updated_user"] = user.id
        cdata["change_image"] = changeImage
        cdata['is_mental'] = is_mental_checked
        cdata = convertDefaultValue(cdata)
        const formData = new FormData()

        for (let key in cdata) {
            formData.append(key, cdata[key])
        }

        if (selectedImage) {
            formData.append('image', selectedImage)
        }

        if (!errorImage) {
            const { success, error } = await fetchData(studentApi.put(formData, studentId,'main'))
            if(success)
            {
                getDatas()
                handleEdit()

            } else {
                /** Алдааны мессэжийг input дээр харуулна */
                for (let key in error) {
                    setError(error[key].field, { type: 'custom', message:  error[key].msg});
                }
            }
        }
	}

    // Зураг авах функц
	// const onChange = (e) => {
    //     const files = e.target.files[0]
    //     const reader = new FileReader()
    //     if (files) {
    //         var check = check_image_ext(files)

    //         if (check) {
    //             setSelectedImage(files)
    //             setErrorImage('')
    //             setChangeFile(true)

    //             reader.onload = function () {
    //                 setFeaturedImg(reader.result)
    //             }
    //             reader.readAsDataURL(files);
    //         } else {
    //             setErrorImage('Зөвхөн зураг оруулна уу.')
    //             setFeaturedImg('')
    //         }
    //     }
	// }

    function getYasUndes() {
        setYasUndes(get_ys_undes)
    }

    function getAdmission_before_op() {
        setAdmission_before_op(get_admission_before)
    }

    useEffect(() => {
        getGroup()
        getYasUndes()
        getAdmission_before_op()
        getDepartment()
        getStudentStatus()
        getAimag(),
        getCountry()
    },[])

    useEffect(
        () =>
        {
            getDatas()
        },
        [is_edit]
    )

    useEffect(
        () =>
        {
            getGroup()
        },
        [departId]
    )

    function handleEdit() {
        reset()
        setEdit(!is_edit)
    }

	return (
        <Card>
            {
                isLoading &&
                    <div className='suspense-loader'>
                        <Spinner size='bg'/>
                        <span className='ms-50'>{t('Түр хүлээнэ үү...')}</span>
                    </div>
            }
            <CardHeader className='py-0'>
                <CardTitle tag='h4'>{t('Оюутны мэдээлэл')}</CardTitle>
                {
                    !is_disabled && is_edit
                    ?
                        <Edit role="button"  size={20}  onClick={() => handleEdit() }/>
                    :
                        !is_disabled &&
                        <Save role="button" size={20} onClick={() => handleEdit()}/>
                }
            </CardHeader>
            <hr />
            <CardBody className='pt-0 d-sm-flex'>
                <div className='d-flex flex-column flex-md-row'>
                    <div className='me-1'>
                        {
                            <img className='rounded me-50' src={featureImage ? featureImage.split('/id/') : avatar} alt={''} height='100' width='100' />
                        }
                        {errorImage && <FormFeedback className='d-block'>{errorImage}</FormFeedback>}
                    </div>
                </div>
                <Row tag={Form} className="gy-1" onSubmit={handleSubmit(onSubmit)}>
                    <Col md={12} sm={12}>
                        <Row className='gy-50'>
                            <Col lg={4} sm={6} xs={12}>
                                <Label className="form-label" for="department">
                                    {t("Хөтөлбөрийн баг")}
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
                                                className={classnames('react-select opacity-100', { 'is-invalid': errors.department })}
                                                isLoading={isLoading}
                                                placeholder={t(`-- Сонгоно уу --`)}
                                                options={department_option || []}
                                                value={department_option.find((c) => c.id === value)}
                                                noOptionsMessage={() => 'Хоосон байна'}
                                                onChange={(val) => {
                                                    onChange(val?.id || '')
                                                    if (val?.id) setDepart(val?.id)
                                                    // parent soligdohod child хоослохгүй байна засах
                                                    setValue('group', '')
                                                }}
                                                isDisabled={is_edit}
                                                styles={ReactSelectStyles}
                                                getOptionValue={(option) => option.id}
                                                getOptionLabel={(option) => option.name}
                                            />
                                        )
                                    }}
                                ></Controller>
                                {errors.department && <FormFeedback className='d-block'>{errors.department.message}</FormFeedback>}
                            </Col>
                            <Col lg={4} sm={6} xs={12}>
                                <Label className="form-label" for="group">
                                    {t('Дамжаа')}
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
                                                className={classnames('react-select opacity-100', { 'is-invalid': errors.group })}
                                                isLoading={isLoading}
                                                placeholder={t(`-- Сонгоно уу --`)}
                                                options={group_option || []}
                                                value={group_option.find((c) => c.id === value)}
                                                noOptionsMessage={() => 'Хоосон байна'}
                                                onChange={(val) => {
                                                    onChange(val?.id || '')
                                                }}
                                                isDisabled={is_edit}
                                                styles={ReactSelectStyles}
                                                getOptionValue={(option) => option.id}
                                                getOptionLabel={(option) => option.name}
                                            />
                                        )
                                    }}
                                ></Controller>
                                {errors.group && <FormFeedback className='d-block'>{errors.group.message}</FormFeedback>}
                            </Col>
                            <Col lg={4} sm={6} xs={12}>
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
                                            placeholder={t('Оюутны код')}
                                            {...field}
                                            type="text"
                                            invalid={errors.code && true}
                                            readOnly={is_edit}
                                            disabled={is_edit}
                                            className="opacity-100"
                                        />
                                    )}
                                />
                                {errors.code && <FormFeedback className='d-block'>{errors.code.message}</FormFeedback>}
                            </Col>
                            <Col lg={4} sm={6} xs={12}>
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
                                            readOnly={is_edit}
                                            disabled={is_edit}
                                            className="opacity-100"
                                            invalid={errors.family_name && true}
                                        />
                                    )}
                                />
                                {errors.family_name && <FormFeedback className='d-block'>{errors.family_name.message}</FormFeedback>}
                            </Col>
                            <Col lg={4} sm={6} xs={12}>
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
                                            placeholder={t('Эцэг/эхийн нэр')}
                                            {...field}
                                            type="text"
                                            readOnly={is_edit}
                                            disabled={is_edit}
                                            className="opacity-100"
                                            invalid={errors.last_name && true}
                                        />
                                    )}
                                />
                                {errors.last_name && <FormFeedback className='d-block'>{errors.last_name.message}</FormFeedback>}
                            </Col>
                            <Col lg={4} sm={6} xs={12}>
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
                                            placeholder={t('Эцэг/эхийн нэр англи')}
                                            {...field}
                                            type="text"
                                            readOnly={is_edit}
                                            disabled={is_edit}
                                            className="opacity-100"
                                            invalid={errors.last_name_eng && true}
                                        />
                                    )}
                                />
                                {errors.last_name_eng && <FormFeedback className='d-block'>{errors.last_name_eng.message}</FormFeedback>}
                            </Col>
                            <Col lg={4} sm={6} xs={12}>
                                <Label className="form-label" for="last_name_uig">
                                    {t('Эцэг/эхийн нэр уйгаржин')}
                                </Label>
                                <Controller
                                    defaultValue=''
                                    control={control}
                                    id="last_name_uig"
                                    name="last_name_uig"
                                    render={({ field }) => (
                                        <Input
                                            id ="last_name_uig"
                                            bsSize="sm"
                                            {...field}
                                            type="text"
                                            readOnly={is_edit}
                                            disabled={is_edit}
                                            className="opacity-100"
                                            style={{ fontFamily: 'CMs Urga', fontSize: '40px'}}
                                            invalid={errors.last_name_uig && true}
                                            onChange={(e) =>
                                            {
                                                field.onChange(e.target.value)
                                                changeTextById(`last_name_uig_span`, e.target.value)
                                            }}
                                        />
                                    )}
                                />
                                {errors.last_name_uig && <FormFeedback className='d-block'>{errors.last_name_uig.message}</FormFeedback>}
                                <code><small>Англи утга: <span id='last_name_uig_span'></span></small></code>
                            </Col>
                            <Col lg={4} sm={6} xs={12}>
                                <Label className="form-label" for="first_name">
                                    {t('Өөрийн нэр')}
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
                                            placeholder={t('Өөрийн нэр')}
                                            {...field}
                                            type="text"
                                            readOnly={is_edit}
                                            disabled={is_edit}
                                            className="opacity-100"
                                            invalid={errors.first_name && true}
                                        />
                                    )}
                                />
                                {errors.first_name && <FormFeedback className='d-block'>{errors.first_name.message}</FormFeedback>}
                            </Col>
                            <Col lg={4} sm={6} xs={12}>
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
                                            placeholder={t('Өөрийн нэр англи')}
                                            {...field}
                                            type="text"
                                            readOnly={is_edit}
                                            disabled={is_edit}
                                            className="opacity-100"
                                            invalid={errors.first_name_eng && true}
                                        />
                                    )}
                                />
                                {errors.first_name_eng && <FormFeedback className='d-block'>{errors.first_name_eng.message}</FormFeedback>}
                            </Col>
                            <Col lg={4} sm={6} xs={12}>
                                <Label className="form-label" for="first_name_uig">
                                    {t('Өөрийн нэр уйгаржин')}
                                </Label>
                                <Controller
                                    defaultValue=''
                                    control={control}
                                    id="first_name_uig"
                                    name="first_name_uig"
                                    render={({ field }) => (
                                        <Input
                                            id ="first_name_uig"
                                            bsSize="sm"
                                            {...field}
                                            type="text"
                                            style={{ fontFamily: 'CMs Urga', fontSize: '40px'}}
                                            readOnly={is_edit}
                                            disabled={is_edit}
                                            className="opacity-100"
                                            invalid={errors.first_name_uig && true}
                                            onChange={(e) =>
                                            {
                                                field.onChange(e.target.value)
                                                changeTextById(`first_name_uig_span`, e.target.value)
                                            }}
                                        />
                                    )}
                                />
                                {errors.first_name_uig && <FormFeedback className='d-block'>{errors.first_name_uig.message}</FormFeedback>}
                                <code><small>Англи утга: <span id='first_name_uig_span'></span></small></code>
                            </Col>
                            <Col lg={4} sm={6} xs={12}>
                                <Label className="form-label" for="register_num">
                                    {t('Регистрийн дугаар')}
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
                                            placeholder={t('Регистрийн дугаар')}
                                            {...field}
                                            type="text"
                                            readOnly={is_edit}
                                            disabled={is_edit}
                                            className="opacity-100"
                                            invalid={errors.register_num && true}
                                        />
                                    )}
                                />
                                {errors.register_num && <FormFeedback className='d-block'>{errors.register_num.message}</FormFeedback>}
                            </Col>
                            <Col lg={4} sm={6} xs={12}>
                                <Label className="form-label" for="birth_date">
                                    {t('Төрсөн он сар өдөр')}
                                </Label>
                                <Controller
                                    defaultValue=''
                                    control={control}
                                    id="birth_date"
                                    name="birth_date"
                                    render={({ field }) => (
                                        <Input
                                            id ="birth_date"
                                            bsSize="sm"
                                            placeholder={t('Төрсөн он сар өдөр')}
                                            {...field}
                                            type="date"
                                            readOnly={is_edit}
                                            disabled={is_edit}
                                            className="opacity-100"
                                            invalid={errors.birth_date && true}
                                        />
                                    )}
                                />
                                {errors.birth_date && <FormFeedback className='d-block'>{errors.birth_date.message}</FormFeedback>}
                            </Col>
                            <Col lg={4} sm={6} xs={12}>
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
                                                className={classnames('react-select opacity-100', { 'is-invalid': errors.gender })}
                                                isLoading={isLoading}
                                                placeholder={t(`-- Сонгоно уу --`)}
                                                options={gender_option || []}
                                                value={gender_option.find((c) => c.id === value)}
                                                noOptionsMessage={() => t('Хоосон байна.')}
                                                onChange={(val) => {
                                                    onChange(val?.id || '')
                                                }}
                                                isDisabled={is_edit}
                                                styles={ReactSelectStyles}
                                                getOptionValue={(option) => option.id}
                                                getOptionLabel={(option) => option.name}
                                            />
                                        )
                                    }}
                                />
                                {errors.gender && <FormFeedback className='d-block'>{errors.gender.message}</FormFeedback>}
                            </Col>
                            <Col lg={4} sm={6} xs={12}>
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
                                            readOnly={is_edit}
                                            disabled={is_edit}
                                            invalid={errors.phone && true}
                                        />
                                    )}
                                />
                                {errors.phone && <FormFeedback className='d-block'>{errors.phone.message}</FormFeedback>}
                            </Col>
                            <Col lg={4} sm={6} xs={12}>
                                <Label className="form-label" for="email">
                                    {t('Цахим шуудан')}
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
                                            placeholder={t('Цахим шуудан')}
                                            {...field}
                                            type="text"
                                            readOnly={is_edit}
                                            disabled={is_edit}
                                            invalid={errors.email && true}
                                            className='opacity-100'
                                        />
                                    )}
                                />
                                {errors.email && <FormFeedback className='d-block'>{errors.email.message}</FormFeedback>}
                            </Col>
                            <Col lg={4} sm={6} xs={12}>
                                <Label className="form-label" for="yas_undes">
                                    {t("Яс үндэс")}
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
                                                className={classnames('react-select opacity-100', { 'is-invalid': errors.yas_undes })}
                                                isLoading={isLoading}
                                                placeholder={t(`-- Сонгоно уу --`)}
                                                options={yas_undes || []}
                                                value={yas_undes.find((c) => c.name === value)}
                                                noOptionsMessage={() => t('Хоосон байна.')}
                                                onChange={(val) => {
                                                    onChange(val?.name || '')
                                                }}
                                                isDisabled={is_edit}
                                                styles={ReactSelectStyles}
                                                getOptionValue={(option) => option.id}
                                                getOptionLabel={(option) => option.name}
                                            />
                                        )
                                    }}
                                />
                                {errors.yas_undes && <FormFeedback className='d-block'>{errors.yas_undes.message}</FormFeedback>}
                            </Col>
                            <Col lg={4} sm={6} xs={12}>
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
                                                className={classnames('react-select opacity-100', { 'is-invalid': errors.status })}
                                                isLoading={isLoading}
                                                placeholder={t(`-- Сонгоно уу --`)}
                                                options={status_option || []}
                                                value={status_option.find((c) => c.id === value)}
                                                noOptionsMessage={() => t('Хоосон байна.')}
                                                onChange={(val) => {
                                                    onChange(val?.id || '')
                                                }}
                                                isDisabled={is_edit}
                                                styles={ReactSelectStyles}
                                                getOptionValue={(option) => option.id}
                                                getOptionLabel={(option) => option.name}
                                            />
                                        )
                                    }}
                                ></Controller>
                                {errors.status && <FormFeedback className='d-block'>{errors.status.message}</FormFeedback>}
                            </Col>
                            <Col lg={4} sm={6} xs={12}>
                                <Label className="form-label" for="admission_date">
                                    {t('Элсэлтийн тушаалын огноо')}
                                </Label>
                                <Controller
                                    defaultValue=''
                                    control={control}
                                    id="admission_date"
                                    name="admission_date"
                                    render={({ field }) => (
                                        <Input
                                            id ="admission_date"
                                            bsSize="sm"
                                            {...field}
                                            type="date"
                                            readOnly={is_edit}
                                            disabled={is_edit}
                                            invalid={errors.admission_date && true}
                                            className='opacity-100'
                                        />
                                    )}
                                />
                                {errors.admission_date && <FormFeedback className='d-block'>{errors.admission_date.message}</FormFeedback>}
                            </Col>
                            <Col lg={4} sm={6} xs={12}>
                                <Label className="form-label" for="admission_before">
                                    {t("Элсэлтийн өмнөх байдал")}
                                </Label>
                                <Controller
                                    defaultValue=''
                                    control={control}
                                    id="admission_before"
                                    name="admission_before"
                                    render={({ field: { value, onChange} }) => {
                                        return (
                                            <Select
                                                name="admission_before"
                                                id="admission_before"
                                                classNamePrefix='select'
                                                isClearable
                                                className={classnames('react-select opacity-100', { 'is-invalid': errors.admission_before })}
                                                isLoading={isLoading}
                                                placeholder={t(`-- Сонгоно уу --`)}
                                                options={admission_before_op || []}
                                                value={admission_before_op.find((c) => c.name === value)}
                                                noOptionsMessage={() => t('Хоосон байна.')}
                                                onChange={(val) => {
                                                    onChange(val?.name || '')
                                                }}
                                                isDisabled={is_edit}
                                                styles={ReactSelectStyles}
                                                getOptionValue={(option) => option.id}
                                                getOptionLabel={(option) => option.name}
                                            />
                                        )
                                    }}
                                />
                                {errors.admission_before && <FormFeedback className='d-block'>{errors.admission_before.message}</FormFeedback>}
                            </Col>
                            <Col lg={4} sm={6} xs={12}>
                                <Label className="form-label" for="citizenship">
                                    {t("Харьяалал")}
                                </Label>
                                <Controller
                                    defaultValue=''
                                    control={control}
                                    id="citizenship"
                                    name="citizenship"
                                    render={({ field: { value, onChange} }) => {
                                        return (
                                            <Select
                                                name="citizenship"
                                                id="citizenship"
                                                classNamePrefix='select'
                                                isClearable
                                                className={classnames('react-select opacity-100', { 'is-invalid': errors.citizenship })}
                                                isLoading={isLoading}
                                                placeholder={t(`-- Сонгоно уу --`)}
                                                options={country_option || []}
                                                value={country_option.find((c) => c.id === value)}
                                                noOptionsMessage={() => t('Хоосон байна.')}
                                                onChange={(val) => {
                                                    onChange(val?.id || '')
                                                }}
                                                isDisabled={is_edit}
                                                styles={ReactSelectStyles}
                                                getOptionValue={(option) => option.id}
                                                getOptionLabel={(option) => option.name}
                                            />
                                        )
                                    }}
                                />
                                {errors.citizenship && <FormFeedback className='d-block'>{errors.citizenship.message}</FormFeedback>}
                            </Col>
                            <Col lg={4} sm={6} xs={12}>
                                <Label className="form-label" for="admission_number">
                                    {t('Элсэлтийн тушаалын дугаар')}
                                </Label>
                                <Controller
                                    defaultValue=''
                                    control={control}
                                    id="admission_number"
                                    name="admission_number"
                                    render={({ field }) => (
                                        <Input
                                            id ="admission_number"
                                            bsSize="sm"
                                            {...field}
                                            placeholder={t('Элсэлтийн тушаалын дугаар')}
                                            type="text"
                                            readOnly={is_edit}
                                            disabled={is_edit}
                                            invalid={errors.admission_number && true}
                                            className='opacity-100'
                                        />
                                    )}
                                />
                                {errors.admission_number && <FormFeedback className='d-block'>{errors.admission_number.message}</FormFeedback>}
                            </Col>
                            <Col lg={4} sm={6} xs={12}>
                                <Label className="form-label" for="unit1">
                                    {t('Аймаг/Хот')}
                                </Label>
                                <Controller
                                    defaultValue=''
                                    control={control}
                                    id="unit1"
                                    name="unit1"
                                    render={({ field: { value, onChange} }) => {
                                        return (
                                            <Select
                                                name="unit1"
                                                id="unit1"
                                                classNamePrefix='select'
                                                isClearable
                                                className={classnames('react-select opacity-100', { 'is-invalid': errors.unit1 })}
                                                isLoading={isLoading}
                                                placeholder={t(`-- Сонгоно уу --`)}
                                                options={unit1_option || []}
                                                value={unit1_option.find((c) => c.id === value)}
                                                noOptionsMessage={() => t('Хоосон байна.')}
                                                onChange={(val) => {
                                                    onChange(val?.id || '')
                                                    if (val?.id) getSum(val?.id)
                                                    else setUnit2Option([])
                                                    setValue('unit2', '')
                                                }}
                                                isDisabled={is_edit}
                                                styles={ReactSelectStyles}
                                                getOptionValue={(option) => option.id}
                                                getOptionLabel={(option) => option.name}
                                            />
                                        )
                                    }}
                                />
                                {errors.unit1 && <FormFeedback className='d-block'>{errors.unit1.message}</FormFeedback>}
                            </Col>
                            <Col lg={4} sm={6} xs={12}>
                                <Label className="form-label" for="unit2">
                                    {t('Сум/Дүүрэг')}
                                </Label>
                                <Controller
                                    defaultValue=''
                                    control={control}
                                    id="unit2"
                                    name="unit2"
                                    render={({ field: { value, onChange} }) => {
                                        return (
                                            <Select
                                                name="unit2"
                                                id="unit2"
                                                classNamePrefix='select'
                                                isClearable
                                                className={classnames('react-select opacity-100', { 'is-invalid': errors.unit2 })}
                                                isLoading={isLoading}
                                                placeholder={t(`-- Сонгоно уу --`)}
                                                options={unit2_option || []}
                                                value={unit2_option.find((c) => c.id === value)}
                                                noOptionsMessage={() => t('Хоосон байна.')}
                                                onChange={(val) => {
                                                    onChange(val?.id || '')
                                                }}
                                                isDisabled={is_edit}
                                                styles={ReactSelectStyles}
                                                getOptionValue={(option) => option.id}
                                                getOptionLabel={(option) => option.name}
                                            />
                                        )
                                    }}
                                />
                                {errors.unit2 && <FormFeedback className='d-block'>{errors.unit2.message}</FormFeedback>}
                            </Col>
                            {/* <Col lg={4} sm={6} xs={12}>
                                <Label className='form-label' for="private_score">
                                    {t('Хувийн оноо')}
                                </Label>
                                <Controller
                                    defaultValue=''
                                    control={control}
                                    id = 'private_score'
                                    name = 'private_score'
                                    render= {({ field }) => {
                                        return (
                                            <Input
                                                name="private_score"
                                                id= "private_score"
                                                bsSize="sm"
                                                placeholder={t('Оюутны хувийн оноо')}
                                                {...field}
                                                type= "number"
                                                readOnly={is_edit}
                                                disabled={is_edit}
                                                invalid={errors.private_score && true}
                                                className='opacity-100'
                                            />
                                        )
                                    }}
                                />
                                {errors.private_score && <FormFeedback className='d-block'>{errors.private_score.message}</FormFeedback>}
                            </Col> */}
                            <Col lg={4} sm={6} xs={12}>
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
                                                className={classnames('react-select opacity-100', { 'is-invalid': errors.pay_type })}
                                                isLoading={isLoading}
                                                placeholder={t(`-- Сонгоно уу --`)}
                                                options={pay_type_option || []}
                                                isDisabled={is_edit}
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
                            <Col lg={4} ms={12} className='pt-2'>
                                <Controller
                                    control={control}
                                    id="is_mental"
                                    name="is_mental"
                                    defaultValue={false}
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                            id="is_mental"
                                            type="checkbox"
                                            className='me-50'
                                            onChange={(e) =>
                                                setMentalChecked(e.target.checked)
                                            }
                                            disabled={is_disabled}
                                            readOnly={is_disabled}
                                            checked={is_mental_checked}
                                        />
                                    )}
                                />
                                <Label className="form-label" for="is_mental">
                                    {t('Хөгжлийн бэрхшээлтэй эсэх')}
                                </Label>
                            </Col>
                            {
                                is_mental_checked &&
                                <Col lg={4} sm={6} xs={12}>
                                    <Label className="form-label" for="mental_type">
                                        {t('Хөгжлийн бэрхшээлийн төрөл')}
                                    </Label>
                                    <Controller
                                        control={control}
                                        defaultValue=''
                                        name="mental_type"
                                        render={({ field: { value, onChange} }) => {
                                            return (
                                                <Select
                                                    name="mental_type"
                                                    id="mental_type"
                                                    classNamePrefix='select'
                                                    isClearable
                                                    className={classnames('react-select', { 'is-invalid': errors.mental_type })}
                                                    isLoading={isLoading}
                                                    placeholder={t(`-- Сонгоно уу --`)}
                                                    options={mental_type_option || []}
                                                    value={mental_type_option.find((c) => c.id === value)}
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
                                    {errors.mental_type && <FormFeedback className='d-block'>{errors.mental_type.message}</FormFeedback>}
                                </Col>
                            }
                            {
                                !is_edit &&
                                <Col md={12} className='text-end'>
                                    <Button className="me-2" color="primary" type="submit">
                                        {t('Хадгалах')}
                                    </Button>
                                    <Button color="secondary" type="reset" outline onClick={() => handleEdit()}>
                                        {t('Буцах')}
                                    </Button>
                                </Col>
                            }
                        </Row>
                    </Col>
                </Row>
            </CardBody>
        </Card>
	);
};
export default MainInformation;
