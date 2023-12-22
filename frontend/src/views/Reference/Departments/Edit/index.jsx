import React, { Fragment, useEffect, useState} from 'react'
import {
    Row,
    Col,
    Modal,
	Form,
	Input,
	Label,
	Button,
    ModalBody,
    ModalHeader
} from "reactstrap";

import { t } from 'i18next';
import Select from 'react-select'
import classnames from 'classnames'

import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';

import { validateSchema } from './validateSchema'

import { useForm, Controller } from "react-hook-form";
import { convertDefaultValue , validate, ReactSelectStyles } from "@utils"

const UpdateModal = ({ open, editId, refreshDatas, handleEdit}) => {
    // Loader
    const {isLoading, fetchData, Loader} = useLoader({isSmall: true})

    const [leader_option, setLeaderOption] = useState([])

    const { control, handleSubmit, setValue,  setError, formState: { errors } } = useForm(validate(validateSchema));

    // Api
    const getDepartmentApi = useApi().hrms.department

    async function getDatas() {
        if(editId) {
            const { success, data } = await fetchData(getDepartmentApi.getRegisterOne(editId))
            if(success) {
                // засах үед дата байх юм бол setValue-р дамжуулан утгыг харуулна
                if(data === null) return
                for(let key in data) {
                    if(data[key] !== null)
                        setValue(key, data[key])
                    else setValue(key, '')
                }
            }
        }
    }

    /* Хөтөлбөрийн багийн ахлагч жагсаалт авах функц */
    async function getLeaderList() {
        const { success, data } = await fetchData(getDepartmentApi.leaderList())
        if (success) {
            setLeaderOption(data)
        }
    }

    useEffect(() => {
        getDatas()
        getLeaderList()
    },[open])

    async function onSubmit(cdata) {
        if(editId) {
            cdata = convertDefaultValue(cdata)
            const { success, error } = await fetchData(getDepartmentApi.putRegister(cdata, editId))
            if(success) {
                refreshDatas()
                handleEdit()
            }
            else {
                /** Алдааны мессэжийг input дээр харуулна */
                for (let key in error) {
                    setError(error[key].field, { type: 'custom', message:  error[key].msg});
                }
            }
        }
	}

	return (
        <Fragment>
            <Modal isOpen={open} toggle={handleEdit} className="modal-dialog-centered modal-lg" onClosed={handleEdit}>
                <ModalHeader className='bg-transparent pb-0' toggle={handleEdit} ></ModalHeader>
                <ModalBody className="px-sm-3 pt-30 pb-3">
                    <div className='text-center'>
                        <h4>{t('Хөтөлбөрийн мэдээлэл засах')}</h4>
                    </div>
                    <Row tag={Form} className="gy-1" onSubmit={handleSubmit(onSubmit)}>
                        <Col  lg={6} xs={12}>
                            <Label className="form-label" for="lead">
                                {t('Тэнхимийн ахлагч')}
                            </Label>
                            <Controller
                                control={control}
                                defaultValue=''
                                name="lead"
                                render={({ field: { value, onChange} }) => {
                                    return (
                                        <Select
                                            name="lead"
                                            id="lead"
                                            classNamePrefix='select'
                                            isClearable
                                            className={classnames('react-select', { 'is-invalid': errors.lead })}
                                            isLoading={isLoading}
                                            placeholder={t('-- Сонгоно уу --')}
                                            options={leader_option || []}
                                            value={leader_option.find((c) => c.id === value)}
                                            noOptionsMessage={() => {t('Хоосон байна.')}}
                                            onChange={(val) => {
                                                onChange(val?.id || '')
                                            }}
                                            styles={ReactSelectStyles}
                                            getOptionValue={(option) => option.id}
                                            getOptionLabel={(option) => option.full_name}

                                        />
                                    )
                                }}
                            />
                            {errors.lead && <FormFeedback className='d-block'>{t(errors.lead.message)}</FormFeedback>}
                        </Col>
                        <Col lg={6} xs={12}>
                            <Label className="form-label" for="name">
                                {t('Хөтөлбөрийн нэр')}
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
                                        disabled={true}
                                        placeholder={t('Хөтөлбөрийн нэр')}
                                        {...field}
                                        type="text"
                                        invalid={errors.name && true}
                                    />
                                )}
                            />
                            {errors.name && <FormFeedback className='d-block'>{t(errors.name.message)}</FormFeedback>}
                        </Col>
                        <Col lg={6} xs={12}>
                            <Label className="form-label" for="social">
                                {t('Нийтийн сүлжээ')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id="social"
                                name="social"
                                render={({ field }) => (
                                    <Input
                                        id ="social"
                                        bsSize="sm"
                                        placeholder={t('Нийтийн сүлжээ')}
                                        {...field}
                                        type="textarea"
                                        invalid={errors.social && true}
                                    />
                                )}
                            />
                            {errors.social && <FormFeedback className='d-block'>{t(errors.social.message)}</FormFeedback>}
                        </Col>
                        <Col lg={6} xs={12}>
                            <Label className="form-label" for="web">
                                {t('Веб')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id="web"
                                name="web"
                                render={({ field }) => (
                                    <Input
                                        id ="web"
                                        bsSize="sm"
                                        placeholder={t('Веб')}
                                        {...field}
                                        type="textarea"
                                        invalid={errors.web && true}
                                    />
                                )}
                            />
                            {errors.web && <FormFeedback className='d-block'>{t(errors.web.message)}</FormFeedback>}
                        </Col>
                        <Col lg={6} xs={12}>
                            <Label className="form-label" for="address">
                                {t('Хаяг')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id="address"
                                name="address"
                                render={({ field }) => (
                                    <Input
                                        id ="address"
                                        bsSize="sm"
                                        placeholder={t('Хаяг')}
                                        {...field}
                                        type="textarea"
                                        invalid={errors.address && true}
                                    />
                                )}
                            />
                            {errors.address && <FormFeedback className='d-block'>{t(errors.address.message)}</FormFeedback>}
                        </Col>
                        <Col className='text-center mt-2' md={12}>
                            <Button className="me-2" size='sm' color="primary" type="submit">
                                {isLoading && Loader}
                                {t('Хадгалах')}
                            </Button>
                            <Button size='sm' color="secondary" type="reset" onClick={handleEdit}>
                                {t('Буцах')}
                            </Button>
                        </Col>
                    </Row>
                </ModalBody>
            </Modal>
        </Fragment>
	);
};
export default UpdateModal;
