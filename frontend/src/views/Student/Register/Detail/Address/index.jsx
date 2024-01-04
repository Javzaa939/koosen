// ** React imports
import React, { useState, useEffect, useContext } from 'react'

import { useParams } from 'react-router-dom';
import { useForm, Controller } from "react-hook-form";

import {
    Row,
    Col,
	Form,
	Input,
	Label,
	FormFeedback,
    CardHeader,
    Card,
    Button,
    CardTitle,
    CardBody, TabContent, TabPane, Nav, NavItem, NavLink,
} from "reactstrap";

import { Edit, Save } from 'react-feather';

import Select from 'react-select'

import classnames from "classnames";

import useApi from "@hooks/useApi";
import useLoader from "@hooks/useLoader";
import AuthContext from '@context/AuthContext'
import { useTranslation } from 'react-i18next'

import { validate, convertDefaultValue, ReactSelectStyles } from "@utils"

import SchoolContext from "@context/SchoolContext"

const Address = () => {

    const { school_id } = useContext(SchoolContext)

    // ** Hook
    const { control, handleSubmit, reset, setError, setValue, formState: { errors } } = useForm({ });

    // Loader
	const { Loader, isLoading, fetchData } = useLoader({});

    const { user } = useContext(AuthContext)
    const { studentId } = useParams()

    const { t } = useTranslation()

    const tab_items = [
        {
            active_id: '1',
            name: t('Иргэний үнэмлэхний хаяг'),
        },
        {
            active_id: '2',
            name: t('Оршин суугаа хаяг'),
        }
    ]

    const [disabled, setDisabled] = useState(true)
    const [is_edit, setEdit] = useState(true)
    const [datas, setDatas] = useState([])
    const [active, setActive] = useState('1')

    const [unit1_option, setUnit1Option] = useState([])
    const [unit2_option, setUnit2Option] = useState([])
    const [unit3_option, setUnit3Option] = useState([])

    // API
    const addressApi = useApi().student.address
    const aimagApi = useApi().hrms.unit1
    const sumApi = useApi().hrms.unit2
    const bagApi = useApi().hrms.unit3

    const toggle = tab => {
        if (active !== tab) {
            setActive(tab)
            reset()
        }
    }

    // Модал хаах
    const onModalClosed = () => {
        reset()
        setUnit1Option([])
        setUnit2Option([])
        setUnit3Option([])
    }

    useEffect(() => {
        /** Эрх шалгана */
        if(Object.keys(user).length > 0 && user.permissions.includes('lms-student-register-update')&& school_id) {
            setDisabled(false)
        }
    },[user])

    async function handleEdit() {
        setEdit(!is_edit)
    }

    async function onSubmit(cdata) {
        cdata['student'] = studentId

        cdata = convertDefaultValue(cdata)

        const { success, errors } = await fetchData(addressApi.post(cdata, studentId))
        if(success)
        {
            setEdit(!is_edit)
            getDatas()
            reset()
        } else {
            /** Алдааны мессэжийг input дээр харуулна */
            for (let key in errors) {
                setError(key, { type: 'custom', message:  errors[key][0]});
            }
        }
	}

    const getDatas = async() => {
        const { success, data } = await fetchData(addressApi.get(studentId))
        if(success)
        {
            setDatas(data)
            var cdata = data[0]
            if(data === null) return
            for(let key in cdata) {
                if (active === '1') {
                    if (key === 'passport_unit1' && cdata[key]?.id) {
                        getSum(cdata[key]?.id)
                    } else if(key == 'passport_unit2' && cdata[key]?.id) {
                        getBag(cdata[key]?.id)
                    }
                }
                if (active === '2') {
                    if (key === 'lived_unit1' && cdata[key]?.id) {
                        getSum(cdata[key]?.id)
                    } else if(key == 'lived_unit2' && cdata[key]?.id) {
                        getBag(cdata[key]?.id )
                    }
                }

                if (cdata[key] === null) setValue(key, '')
                else if (key == 'passport_unit2' || key == 'lived_unit2' || key == 'passport_unit1' || key == 'lived_unit1' || key == 'passport_unit3' || key == 'lived_unit3') {
                    setValue(key, cdata[key]?.id)
                }
                else setValue(key, cdata[key])
            }
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

    // Баг хороо жагсаалт авах
    const getBag = async(sum_id) => {
        const { success, data } = await fetchData(bagApi.get(sum_id))
        if(success)
        {
            setUnit3Option(data)
        }
    }

    useEffect(
        () =>
        {
            onModalClosed()
            getDatas()
            getAimag()
        },
        [active]
    )

	return (
        <Card>
            <CardHeader className='py-0'>
                <CardTitle tag='h4'>{t('Хаягийн мэдээлэл')}</CardTitle>
                {
                    !disabled && !is_edit
                    ?
                        <Edit role="button" size={20} onClick={() => handleEdit()}/>
                    :
                        !disabled &&
                        <Save role="button" size={20} onClick={() => handleEdit()}/>
                }
            </CardHeader>
            <hr />
            <CardBody className='p-0 nav-vertical'>
                <Nav tabs className='nav-left'>
                    {
                        tab_items.map((tab, idx) => {
                            return (
                                <NavItem key={idx}>
                                    <NavLink
                                        active={active == tab.active_id}
                                        onClick={() => {
                                            toggle(tab.active_id)
                                            setEdit(true)
                                        }}
                                    >
                                        {tab.name}
                                    </NavLink>
                                </NavItem>
                            )
                        })
                    }
                </Nav>
                <TabContent activeTab={active}>
                    <TabPane tabId={active} style={{overflowY: 'inherit'}}>
                        <Row tag={Form} className="gy-1" onSubmit={handleSubmit(onSubmit)}>
                            {
                                active == 1
                                ?
                                    <>
                                        <Col lg={6} sm={12}>
                                            <Label className="form-label" for="passport_unit1">
                                                {t('Аймаг/Хот')}
                                            </Label>
                                            <Controller
                                                defaultValue=''
                                                control={control}
                                                id="passport_unit1"
                                                name="passport_unit1"
                                                render={({ field: { value, onChange} }) => {
                                                    return (
                                                        <Select
                                                            name="passport_unit1"
                                                            id="passport_unit1"
                                                            classNamePrefix='select'
                                                            isClearable
                                                            className={classnames('react-select', { 'is-invalid': errors.passport_unit1 })}
                                                            isLoading={isLoading}
                                                            placeholder={t(`-- Сонгоно уу --`)}
                                                            options={unit1_option || []}
                                                            value={value && unit1_option.find((c) => c.id === value)}
                                                            noOptionsMessage={() => t('Хоосон байна.')}
                                                            onChange={(val) => {
                                                                onChange(val?.id || '')
                                                                if (val?.id) { getSum(val?.id) }
                                                                else { setUnit2Option([]), setUnit3Option([])}
                                                                setValue('unit2', '')
                                                                setValue('unit3', '')
                                                            }}
                                                            isDisabled={disabled || is_edit}
                                                            styles={ReactSelectStyles}
                                                            getOptionValue={(option) => option.id}
                                                            getOptionLabel={(option) => option.name}
                                                        />
                                                    )
                                                }}
                                            />
                                            {errors.passport_unit1 && <FormFeedback className='d-block'>{errors.passport_unit1.message}</FormFeedback>}
                                        </Col>
                                        <Col lg={6} sm={12}>
                                            <Label className="form-label" for="passport_unit2">
                                                {t('Сум/Дүүрэг')}
                                            </Label>
                                            <Controller
                                                defaultValue=''
                                                control={control}
                                                id="passport_unit2"
                                                name="passport_unit2"
                                                render={({ field: { value, onChange} }) => {
                                                    return (
                                                        <Select
                                                            name="passport_unit2"
                                                            id="passport_unit2"
                                                            classNamePrefix='select'
                                                            isClearable
                                                            className={classnames('react-select', { 'is-invalid': errors.passport_unit2 })}
                                                            isLoading={isLoading}
                                                            placeholder={t(`-- Сонгоно уу --`)}
                                                            options={unit2_option || []}
                                                            value={value && unit2_option.find((c) => c.id === value)}
                                                            noOptionsMessage={() => t('Хоосон байна.')}
                                                            onChange={(val) => {
                                                                onChange(val?.id || '')
                                                                if (val?.id) getBag(val?.id)
                                                                else setUnit3Option([])
                                                                setValue('unit3', '')
                                                            }}
                                                            isDisabled={disabled || is_edit}
                                                            styles={ReactSelectStyles}
                                                            getOptionValue={(option) => option.id}
                                                            getOptionLabel={(option) => option.name}
                                                        />
                                                    )
                                                }}
                                            />
                                            {errors.passport_unit2 && <FormFeedback className='d-block'>{errors.passport_unit2.message}</FormFeedback>}
                                        </Col>
                                        <Col lg={6} sm={12}>
                                            <Label className="form-label" for="passport_unit3">
                                                {t('Баг/Хороо')}
                                            </Label>
                                            <Controller
                                                defaultValue=''
                                                control={control}
                                                id="passport_unit3"
                                                name="passport_unit3"
                                                render={({ field: { value, onChange} }) => {
                                                    return (
                                                        <Select
                                                            name="passport_unit3"
                                                            id="passport_unit3"
                                                            classNamePrefix='select'
                                                            isClearable
                                                            className={classnames('react-select', { 'is-invalid': errors.passport_unit3 })}
                                                            isLoading={isLoading}
                                                            placeholder={t(`-- Сонгоно уу --`)}
                                                            options={unit3_option || []}
                                                            value={value && unit3_option.find((c) => c.id === value)}
                                                            noOptionsMessage={() => t('Хоосон байна.')}
                                                            onChange={(val) => {
                                                                onChange(val?.id || '')
                                                            }}
                                                            isDisabled={disabled || is_edit}
                                                            styles={ReactSelectStyles}
                                                            getOptionValue={(option) => option.id}
                                                            getOptionLabel={(option) => option.name}
                                                        />
                                                    )
                                                }}
                                            />
                                            {errors.passport_unit3 && <FormFeedback className='d-block'>{errors.passport_unit3.message}</FormFeedback>}
                                        </Col>
                                        <Col lg={6} sm={12}>
                                            <Label className="form-label" for="passport_toot">
                                                {t('Тоот')}
                                            </Label>
                                            <Controller
                                                defaultValue=''
                                                control={control}
                                                id="passport_toot"
                                                name="passport_toot"
                                                render={({ field }) => {
                                                    field.value = field.value ? field.value : ''
                                                    return (
                                                        <Input
                                                            id="passport_toot"
                                                            bsSize="sm"
                                                            {...field}
                                                            placeholder={t('Тоот')}
                                                            type="text"
                                                            readOnly={disabled || is_edit}
                                                            disabled={disabled || is_edit}
                                                            invalid={errors.passport_toot && true}
                                                        />
                                                    )}
                                                }
                                            />
                                            {errors.passport_toot && <FormFeedback className='d-block'>{errors.passport_toot.message}</FormFeedback>}
                                        </Col>
                                        <Col lg={6} sm={12}>
                                            <Label className="form-label" for="passport_other">
                                                {t("Бусад")}
                                            </Label>
                                            <Controller
                                                defaultValue=''
                                                control={control}
                                                id="passport_other"
                                                name="passport_other"
                                                render={({ field }) => {
                                                    field.value = field.value ? field.value : ''
                                                    return (
                                                        <Input
                                                            id="passport_other"
                                                            bsSize="sm"
                                                            {...field}
                                                            placeholder={t("Бусад")}
                                                            type="test"
                                                            readOnly={disabled || is_edit}
                                                            disabled={disabled || is_edit}
                                                            invalid={errors.passport_other && true}
                                                        />
                                                    )
                                                }}
                                            />
                                            {errors.passport_other && <FormFeedback className='d-block'>{errors.passport_other.message}</FormFeedback>}
                                        </Col>
                                    </>
                                :
                                    <>
                                        <Col lg={6} sm={12}>
                                            <Label className="form-label" for="lived_unit1">
                                                {t('Аймаг/Хот')}
                                            </Label>
                                            <Controller
                                                defaultValue=''
                                                control={control}
                                                id="lived_unit1"
                                                name="lived_unit1"
                                                render={({ field: { value, onChange} }) => {
                                                    return (
                                                        <Select
                                                            name="lived_unit1"
                                                            id="lived_unit1"
                                                            classNamePrefix='select'
                                                            isClearable
                                                            className={classnames('react-select', { 'is-invalid': errors.lived_unit1 })}
                                                            isLoading={isLoading}
                                                            placeholder={t(`-- Сонгоно уу --`)}
                                                            options={unit1_option || []}
                                                            value={value && unit1_option.find((c) => c.id === value)}
                                                            noOptionsMessage={() => t('Хоосон байна.')}
                                                            onChange={(val) => {
                                                                onChange(val?.id || '')
                                                                if (val?.id) getSum(val?.id)
                                                                else { setUnit2Option([]), setUnit3Option([])}
                                                                setValue('unit2', '')
                                                                setValue('unit3', '')
                                                            }}
                                                            isDisabled={disabled || is_edit}
                                                            styles={ReactSelectStyles}
                                                            getOptionValue={(option) => option.id}
                                                            getOptionLabel={(option) => option.name}
                                                        />
                                                    )
                                                }}
                                            />
                                            {errors.lived_unit1 && <FormFeedback className='d-block'>{errors.lived_unit1.message}</FormFeedback>}
                                        </Col>
                                        <Col lg={6} sm={12}>
                                            <Label className="form-label" for="lived_unit2">
                                                {t('Сум/Дүүрэг')}
                                            </Label>
                                            <Controller
                                                defaultValue=''
                                                control={control}
                                                id="lived_unit2"
                                                name="lived_unit2"
                                                render={({ field: { value, onChange} }) => {
                                                    return (
                                                        <Select
                                                            name="lived_unit2"
                                                            id="lived_unit2"
                                                            classNamePrefix='select'
                                                            isClearable
                                                            className={classnames('react-select', { 'is-invalid': errors.lived_unit2 })}
                                                            isLoading={isLoading}
                                                            placeholder={t(`-- Сонгоно уу --`)}
                                                            options={unit2_option || []}
                                                            value={value && unit2_option.find((c) => c.id === value)}
                                                            noOptionsMessage={() => t('Хоосон байна.')}
                                                            onChange={(val) => {
                                                                onChange(val?.id || '')
                                                                if (val?.id) getBag(val?.id)
                                                                else setUnit3Option([])
                                                                setValue('unit3', '')
                                                            }}
                                                            isDisabled={disabled || is_edit}
                                                            styles={ReactSelectStyles}
                                                            getOptionValue={(option) => option.id}
                                                            getOptionLabel={(option) => option.name}
                                                        />
                                                    )
                                                }}
                                            />
                                            {errors.lived_unit2 && <FormFeedback className='d-block'>{errors.lived_unit2.message}</FormFeedback>}
                                        </Col>
                                        <Col lg={6} sm={12}>
                                            <Label className="form-label" for="lived_unit3">
                                                {t('Баг/Хороо')}
                                            </Label>
                                            <Controller
                                                defaultValue=''
                                                control={control}
                                                id="lived_unit3"
                                                name="lived_unit3"
                                                render={({ field: { value, onChange} }) => {
                                                    return (
                                                        <Select
                                                            name="lived_unit3"
                                                            id="lived_unit3"
                                                            classNamePrefix='select'
                                                            isClearable
                                                            className={classnames('react-select', { 'is-invalid': errors.lived_unit3 })}
                                                            isLoading={isLoading}
                                                            placeholder={t(`-- Сонгоно уу --`)}
                                                            options={unit3_option || []}
                                                            value={value && unit3_option.find((c) => c.id === value)}
                                                            noOptionsMessage={() => t('Хоосон байна.')}
                                                            onChange={(val) => {
                                                                onChange(val?.id || '')
                                                            }}
                                                            isDisabled={disabled || is_edit}
                                                            styles={ReactSelectStyles}
                                                            getOptionValue={(option) => option.id}
                                                            getOptionLabel={(option) => option.name}
                                                        />
                                                    )
                                                }}
                                            />
                                            {errors.lived_unit3 && <FormFeedback className='d-block'>{errors.lived_unit3.message}</FormFeedback>}
                                        </Col>
                                        <Col lg={6} sm={12}>
                                            <Label className="form-label" for="lived_toot">
                                                {t('Тоот')}
                                            </Label>
                                            <Controller
                                                defaultValue=''
                                                control={control}
                                                id="lived_toot"
                                                name="lived_toot"
                                                render={({ field }) => {
                                                    field.value = field.value ? field.value : ''
                                                    return (
                                                        <Input
                                                            id ="lived_toot"
                                                            bsSize="sm"
                                                            {...field}
                                                            placeholder={t('Тоот')}
                                                            type="text"
                                                            readOnly={disabled || is_edit}
                                                            disabled={disabled || is_edit}
                                                            invalid={errors.lived_toot && true}
                                                        />
                                                    )}
                                                }
                                            />
                                            {errors.lived_toot && <FormFeedback className='d-block'>{errors.lived_toot.message}</FormFeedback>}
                                        </Col>
                                        <Col lg={6} sm={12}>
                                            <Label className="form-label" for="lived_other">
                                                {t("Бусад")}
                                            </Label>
                                            <Controller
                                                defaultValue=''
                                                control={control}
                                                id="lived_other"
                                                name="lived_other"
                                                render={({ field }) => {
                                                    field.value = field.value ? field.value : ''
                                                    return (
                                                        <Input
                                                            id ="lived_other"
                                                            bsSize="sm"
                                                            {...field}
                                                            placeholder={t("Бусад")}
                                                            type="text"
                                                            readOnly={disabled || is_edit}
                                                            disabled={disabled || is_edit}
                                                            invalid={errors.lived_other && true}
                                                        />
                                                    )}
                                                }
                                            />
                                            {errors.lived_other && <FormFeedback className='d-block'>{errors.lived_other.message}</FormFeedback>}
                                        </Col>
                                    </>
                            }
                            {
                                !is_edit &&
                                <Col className='text-center' md={12}>
                                    <Button disabled={disabled} size='sm' className="me-2" color="primary" type="submit">
                                        {is_edit ? 'Засах' : 'Хадгалах'}
                                    </Button>
                                    <Button color="secondary" size='sm' type="reset" outline onClick={onModalClosed}>
                                        Буцах
                                    </Button>
                                </Col>
                            }
                        </Row>
                    </TabPane>
                </TabContent>
            </CardBody>
        </Card>
	);
};

export default Address;
