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
    Modal,
    ModalBody,
    ModalHeader,
} from "reactstrap";

import useApi from "@hooks/useApi";
import useLoader from "@hooks/useLoader";
import AuthContext from '@context/AuthContext'

import { validate, convertDefaultValue } from "@utils"

import Tables from './Tables';

import { validateSchema } from './validationSchema';
import { useTranslation } from 'react-i18next';

import SchoolContext from "@context/SchoolContext"

const Family = () => {

    const { school_id } = useContext(SchoolContext)

    // ** Hook
    const { control, handleSubmit, reset, setError, setValue, formState: { errors } } = useForm(validate(validateSchema));

    // Loader
	const { Loader, isLoading, fetchData } = useLoader({isSmall: true});

    const { user } = useContext(AuthContext)
    const { studentId } = useParams()

    const [disabled, setDisabled] = useState(true)
    const [is_edit, setEdit] = useState(false)
    const [show, setShow] = useState(false)
    const [datas, setDatas] = useState([])

    const { t } = useTranslation()

    // API
    const studentFamilyApi = useApi().student.family

    // Устггах функц
    async function handleDelete(id) {
        const { success, data } = await fetchData(studentFamilyApi.delete(studentId, id))
        if(success)
        {
            getDatas()
        }
    }

    // Модал хаах
    const onModalClosed = () => {
        reset()
        setShow(false)
    }

    const getDatas = async() => {
        const { success, data } = await fetchData(studentFamilyApi.get(studentId))
        if(success)
        {
            setDatas(data)
        }
    }

    useEffect(() => {
        /** Эрх шалгана */
        if(Object.keys(user).length > 0 && user.permissions.includes('lms-student-register-update')&& school_id) {
            setDisabled(false)
        }
        getDatas()
    },[user, show])

    async function handleEdit(cdata) {
        setEdit(true)
        setShow(true)

        // датаг setValue-р дамжуулан харуулна
        if(cdata === null) return
        for(let key in cdata) {
            if (cdata[key] === null) setValue(key, '')
            else setValue(key, cdata[key])
        }
    }

    async function onSubmit(cdata) {
        cdata['student'] = studentId

        cdata = convertDefaultValue(cdata)

        /** Засах */
        if(is_edit) {
            var id = cdata['id']
            const { success, errors } = await fetchData(studentFamilyApi.put(cdata, id, studentId))
            if(success)
            {
                getDatas()
                onModalClosed()
            } else {
                /** Алдааны мессэжийг input дээр харуулна */
                for (let key in errors) {
                    setError(key, { type: 'custom', message:  errors[key][0]});
                }
            }
        } else {
            /** Нэмэх */
            const { success, errors } = await fetchData(studentFamilyApi.post(cdata))
            if(success)
            {
                getDatas()
                onModalClosed()
            } else {
                /** Алдааны мессэжийг input дээр харуулна */
                for (let key in errors) {
                    setError(key, { type: 'custom', message:  errors[key][0]});
                }
            }
        }
	}

	return (
        <Card>
            <CardHeader className="d-flex justify-content-between py-0 px-0">
                <CardTitle tag='h4'>{t('Гэр бүлийн байдал')}</CardTitle>
                <Button disabled={disabled} color='primary' size="sm" onClick={() => { setShow(true), setEdit(false)}}>
                    {t('Нэмэх')}
                </Button>
            </CardHeader>
            <hr />
            <Tables datas={datas} handleDelete={handleDelete} handleEdit={handleEdit} is_role={disabled} />
            <Modal isOpen={show} toggle={() => setShow(!show)} className='modal-dialog-centered' onClosed={onModalClosed}>
                <ModalHeader className='bg-transparent pb-0' toggle={() => setShow(!show)}></ModalHeader>
                    <h5 className='text-center'>{t('Гэр бүлийн байдал')}</h5>
                    <ModalBody className='px-sm-3 pb-2'>
                        <Row tag={Form} className="gy-1 pb-2" onSubmit={handleSubmit(onSubmit)}>
                            <Col lg={12}>
                                <Label className="form-label" for="member">
                                    {t('Оюутны юу болох')}
                                </Label>
                                <Controller
                                    defaultValue=''
                                    control={control}
                                    id="member"
                                    name="member"
                                    render={({ field }) => (
                                        <Input
                                            id ="member"
                                            bsSize="sm"
                                            placeholder={t('Оюутны юу болох')}
                                            {...field}
                                            type="text"
                                            readOnly={disabled}
                                            disabled={disabled}
                                            invalid={errors.member && true}
                                        />
                                    )}
                                />
                                {errors.member && <FormFeedback className='d-block'>{errors.member.message}</FormFeedback>}
                            </Col>
                            <Col lg={12}>
                                <Label className="form-label" for="last_name">
                                    {t('Эцэг/Эхийн нэр')}
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
                                            {...field}
                                            placeholder={t('Эцэг/Эхийн нэр')}
                                            type="text"
                                            readOnly={disabled}
                                            disabled={disabled}
                                            invalid={errors.last_name && true}
                                        />
                                    )}
                                />
                                {errors.last_name && <FormFeedback className='d-block'>{errors.last_name.message}</FormFeedback>}
                            </Col>
                            <Col lg={12}>
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
                                            {...field}
                                            placeholder={t('Өөрийн нэр')}
                                            type="text"
                                            readOnly={disabled}
                                            disabled={disabled}
                                            invalid={errors.first_name && true}
                                        />
                                    )}
                                />
                                {errors.first_name && <FormFeedback className='d-block'>{errors.first_name.message}</FormFeedback>}
                            </Col>
                            <Col lg={12}>
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
                                            {...field}
                                            placeholder={t('Регистрийн дугаар')}
                                            type="text"
                                            readOnly={disabled}
                                            disabled={disabled}
                                            invalid={errors.register_num && true}
                                        />
                                    )}
                                />
                                {errors.register_num && <FormFeedback className='d-block'>{errors.register_num.message}</FormFeedback>}
                            </Col>
                            <Col lg={12}>
                                <Label className="form-label" for="employment">
                                    {t('Ажил эрхлэлт')}
                                </Label>
                                <Controller
                                    defaultValue=''
                                    control={control}
                                    id="employment"
                                    name="employment"
                                    render={({ field }) => (
                                        <Input
                                            id ="employment"
                                            bsSize="sm"
                                            {...field}
                                            placeholder={t('Ажил эрхлэлт')}
                                            type="text"
                                            readOnly={disabled}
                                            disabled={disabled}
                                            invalid={errors.employment && true}
                                        />
                                    )}
                                />
                                {errors.employment && <FormFeedback className='d-block'>{errors.employment.message}</FormFeedback>}
                            </Col>
                            <Col lg={12}>
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
                                            {...field}
                                            placeholder={t('Утасны дугаар')}
                                            type="number"
                                            readOnly={disabled}
                                            disabled={disabled}
                                            invalid={errors.phone && true}
                                        />
                                    )}
                                />
                                {errors.phone && <FormFeedback className='d-block'>{errors.phone.message}</FormFeedback>}
                            </Col>
                            {
                                <Col className='text-center' md={12}>
                                    <Button disabled={disabled} size='sm' className="me-2" color="primary" type="submit">
                                        {isLoading && Loader}
                                        {is_edit ? t('Засах') : t('Хадгалах')}
                                    </Button>
                                    <Button color="secondary" size='sm' type="reset" outline onClick={onModalClosed}>
                                        {t('Буцах')}
                                    </Button>
                                </Col>
                            }
                        </Row>
                    </ModalBody>
            </Modal>
        </Card>
	);
};
export default Family;
