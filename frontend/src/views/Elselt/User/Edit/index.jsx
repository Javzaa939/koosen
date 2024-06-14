// ** React imports
import React, { Fragment, useState, useEffect } from 'react'

import { useForm, Controller } from "react-hook-form";

import { Row, Col, Form, Modal, Label, Button, ModalBody, ModalHeader, FormFeedback, Spinner, Input, Alert } from "reactstrap";

import Select from 'react-select'

import moment from 'moment'
import classnames from "classnames";

import { useTranslation } from 'react-i18next';

import useApi from "@hooks/useApi";
import useLoader from "@hooks/useLoader";

import { validate, convertDefaultValue, ReactSelectStyles } from "@utils"

import * as Yup from 'yup'

const validateSchema = Yup.object().shape(
{
    profession: Yup.string()
        .trim()
        .required('Хоосон байна'),

    description: Yup.string()
        .trim()
        .required('Хоосон байна'),
});

const EditModal = ({ open, handleModal, refreshDatas, rowData }) => {

    const { control, handleSubmit,  formState: { errors }, setError, reset, watch } = useForm(validate(validateSchema))

    const { t } = useTranslation()

	// Loader
	const { isLoading, fetchData } = useLoader({});
	const { isLoading: optionLoading, fetchData: optionFetchData } = useLoader({});
	const { isLoading: postLoading, fetchData: postFetch } = useLoader({});

    // State
    const [profOption, setProfession] = useState([])         // хөтөлбөр авах нь
    const [elseltOption, setElseltOption] = useState([])     // элсэлт авах нь
    const [elseltId, setElseltId] = useState('')             // идэвхтэй элсэлт id авах нь


    // Api
    const professionApi = useApi().elselt.profession
    const elseltApi = useApi().elselt.admissionuserdata
    const admissionYearApi = useApi().elselt

    // Идэвхитэй элсэлтийн жагсаалт авах
    async function getAdmissionYear() {
        const { success, data } = await optionFetchData(admissionYearApi.getActiveAll())
        if (success) {
            setElseltOption(data)
        }
	}
    useEffect(() => {
        getAdmissionYear()
    },[])

    // Хөтөлбөрийн жагсаалт авах
    async function getProfession() {
        const { success, data } = await optionFetchData(professionApi.getList(elseltId))
        if (success) {
            setProfession(data)
        }
	}

    useEffect(() => {
        getProfession()
    }, [elseltId])

    async function onSubmit(cdatas) {
        cdatas['user']= rowData?.user?.id
		cdatas = convertDefaultValue(cdatas)

        if(rowData?.id) {
            const { success, error, errors } = await postFetch(elseltApi.put(cdatas, rowData?.id))
            if(success) {
                reset()
                handleModal()
                refreshDatas()
            } else {
                /** Алдааны мессэжийг input дээр харуулна */
                for (let key in errors) {
                    setError(key, { type: 'custom', message: errors[key][0] });
                }
            }
        }
    }
    return (
        <Fragment>
            {
                isLoading &&
                <div className='suspense-loader'>
                    <Spinner size='bg'/>
                    <span className='ms-50'>{t('Түр хүлээнэ үү...')}</span>
                </div>
            }
            <Modal
                isOpen={open}
                toggle={handleModal}
                className="modal-dialog-centered modal-lg"
                contentClassName="pt-0"
            >
                <ModalHeader tag="h4" className='bg-transparent pb-0' toggle={handleModal}>
                    Хөтөлбөр солих
                </ModalHeader>
                <hr />
                <ModalBody className="px-sm-3 pt-30 pb-3">
                    <Row tag={Form} className="gy-1" onSubmit={handleSubmit(onSubmit)}>
                        <Col md={12}>
                            <div className='d-flex'>
                                <span className={`w-50 me-25`} style={{ fontSize: '13px', fontWeight: '500', color: '#4f4f4f' }}>Овог нэр:</span>
                                <b className={`w-50 ms-25`} style={{ color: 'black', fontSize: '13px' }}>{rowData?.full_name}</b>
                            </div>
                            <div className='d-flex'>
                                <span className={`w-50 me-25`} style={{ fontSize: '13px', fontWeight: '500', color: '#4f4f4f' }}>Бүртгүүлсэн хөтөлбөр:</span>
                                <b className={`w-50 ms-25`} style={{ color: 'black', fontSize: '13px' }}>{rowData?.profession}</b>
                            </div>
                            <div className='d-flex'>
                                <span className={`w-50 me-25`} style={{ fontSize: '13px', fontWeight: '500', color: '#4f4f4f' }}>Бүртгүүлсэн огноо:</span>
                                <b className={`w-50 ms-25`} style={{ color: 'black', fontSize: '13px' }}>{rowData?.created_at? moment(rowData?.created_at).format("YYYY-MM-DD h:mm") : ''}</b>
                            </div>
                        </Col>
                        {
                            rowData?.description &&
                            <Col md={12} className='gy-1 border p-50'>
                                <b className='text-dark ms-25'>Хөтөлбөр сольсон түүх</b>
                                <span className='d-flex ms-25 mt-25' style={{ fontSize: '13px' }}>
                                    <b>{rowData?.description}</b>
                                </span>
                            </Col>
                        }
                        <Col md={12} className="mt-2">
                            <Row className='gy-1 border'>
                                <Col md={12} sm={12}>
                                   <b className='text-dark'>Шинэ хөтөлбөр сонгох</b>
                                   <Alert color="primary" className="p-50" style={{ fontSize: '13px' }}>
                                        Элсэгчийн хөтөлбөрийг солихдоо зарлагдсан элсэлт, хөтөлбөр сонгоод, тайлбар бичээд хадгалах дарж солино уу
                                    </Alert>
                                </Col>
                                <Col md={12} sm={12} className='mt-0'>
                                    <Label for="admission">{t('Элсэлт')}</Label>
                                    <Select
                                        name="admission"
                                        id="admission"
                                        classNamePrefix='select'
                                        isClearable
                                        className={classnames('react-select', { 'is-invalid': errors.admission })}
                                        isLoading={optionLoading}
                                        placeholder={t('-- Сонгоно уу --')}
                                        options={elseltOption || []}
                                        value={elseltOption.find((c) => c?.id === elseltId)}
                                        noOptionsMessage={() => t('Хоосон байна.')}
                                        onChange={(val) => {
                                            setElseltId(val?.id || '')
                                        }}
                                        styles={ReactSelectStyles}
                                        getOptionValue={(option) => option?.id}
                                        getOptionLabel={(option) => option.lesson_year + ' ' +option.name}
                                    />
                                </Col>
                                <Col md={12} sm={12} className='mt-0'>
                                    <Label for="profession">{t('Хөтөлбөр')}</Label>
                                    <Controller
                                        control={control}
                                        defaultValue=''
                                        name="profession"
                                        render={({ field: { value, onChange }}) => {
                                            return (
                                                <Select
                                                    name="profession"
                                                    id="profession"
                                                    classNamePrefix='select'
                                                    isClearable
                                                    className={classnames('react-select', { 'is-invalid': errors.profession })}
                                                    isLoading={optionLoading}
                                                    placeholder={t('-- Сонгоно уу --')}
                                                    options={profOption || []}
                                                    value={profOption.find((c) => c?.id === value)}
                                                    noOptionsMessage={() => t('Хоосон байна.')}
                                                    onChange={(val) => {
                                                        onChange(val?.id || '')
                                                    }}
                                                    styles={ReactSelectStyles}
                                                    getOptionValue={(option) => option?.id}
                                                    getOptionLabel={(option) => option.name}
                                                />
                                            )
                                        }}
                                    />
                                    {errors.profession && <FormFeedback className='d-block'>{errors.profession.message}</FormFeedback>}
                                </Col>
                                <Col md={12} sm={12} className='mt-1'>
                                    <Label for="description">{t('Тайлбар')}</Label>
                                    <Controller
                                        control={control}
                                        defaultValue=''
                                        name="description"
                                        render={({ field }) => {
                                            return (
                                                <Input
                                                    {...field}
                                                    id="description"
                                                    type="textarea"
                                                    invalid={errors.description && true}
                                                />
                                            )
                                        }}
                                    />
                                    {errors.description && <FormFeedback className='d-block'>{errors.description.message}</FormFeedback>}
                                </Col>
                            </Row>
                        </Col>
                        <Col md={12} className="mt-2 text-center">
                            <Button className="me-2" color="primary" type="submit" disabled={postLoading}>
                                {postLoading && <Spinner size='sm' className='me-1'/>}
                                {t('Хадгалах')}
                            </Button>
                            <Button color="secondary" type="reset" outline onClick={handleModal}>
                                {t('Буцах')}
                            </Button>
                        </Col>
                    </Row>
                </ModalBody>
            </Modal>
        </Fragment>
    )
};

export default EditModal;
