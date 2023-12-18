// ** React imports
import React, { Fragment, useState, useEffect } from 'react'

import useApi from "@hooks/useApi";
import useLoader from "@hooks/useLoader";

import Select from 'react-select'

import { useTranslation } from 'react-i18next';

import { useForm, Controller } from "react-hook-form";

import classnames from 'classnames'

import { Row, Col, Form, Modal, Input, Label, Button, ModalBody, ModalHeader, FormFeedback, Card, CardBody } from "reactstrap";

import { validate, ReactSelectStyles, convertDefaultValue, SOLVED_TYPES } from "@utils"

import { validateSchema } from './validateSchema';

const SolveModal = ({ request_id, isOpen, handleModal, refreshDatas, is_view }) => {

    const { t } = useTranslation()

    const [datas, setDatas] = useState([])

    // ** Hook
    const { control, handleSubmit, formState: { errors }, reset, setError, setValue } = useForm(validate(validateSchema));

	// Loader
	const { Loader, isLoading, fetchData } = useLoader({ isSmall: true });

    const [solved_type, setSolvedType] = useState(SOLVED_TYPES(2))

    // Api
    const clubApi = useApi().request.club

    async function getDatas() {
        if(request_id) {
            const { success, data } = await fetchData(clubApi.getOneRegisterStudent(request_id))
            if(success) {
                setDatas(data)
                // засах үед дата байх юм бол setValue-р дамжуулан утгыг харуулна
                if(data === null) return
                for(let key in data) {
                    if(data[key] !== null)
                        setValue(key, data[key])
                    else setValue(key, '')

                    if(key === 'student') {
                        setValue('code', data[key]?.code)
                        setValue('student', data[key]?.id)
                        setValue('student1', data[key]?.full_name)
                    }
                    if(key === 'club') {
                        setValue('club_name', data[key]?.name)
                    }
                    // if(!is_view) {
                    //     if(key === 'request_flag') setValue(key, '')
                    // }
                }
            }
        }
    }

    useEffect(() => {
        getDatas()
    },[request_id, isOpen])

	async function onSubmit(cdata) {
        cdata = convertDefaultValue(cdata)
        const { success, error } = await fetchData(clubApi.putRegisterStudent(request_id, cdata))
        if(success) {
            reset()
            refreshDatas()
            handleModal()
        } else {
            /** Алдааны мессэжийг input дээр харуулна */
            for (let key in error) {
                setError(error[key].field, { type: 'custom', message:  error[key].msg});
            }
        }
	}

	return (
        <Fragment>
            <Modal
                isOpen={isOpen}
                toggle={handleModal}
                className="modal-dialog-centered modal-lg"
                contentClassName="pt-0"
                onClosed={handleModal}
                scrollable={true}
            >
                <ModalHeader className='bg-transparent pb-0' toggle={handleModal}></ModalHeader>
                <ModalBody className="px-sm-3 pt-50 pb-3">
                    <Card className='invoice-preview-card'>
                        <CardBody className='invoice-padding pb-0'>
                            <div className='d-flex justify-content-between flex-md-row flex-column invoice-spacing mt-0'>
                                <div>
                                    <div>
                                        {
                                            is_view
                                            ?
                                                <h4>{t('Хүсэлтийн дэлгэрэнгүй')}</h4>
                                            :
                                                <h4>{t('Хүсэлтийг шийдвэрлэх')}</h4>
                                        }
                                    </div>
                                </div>
                            </div>
                        </CardBody>

                        <hr className='invoice-spacing' />

                        <CardBody className='invoice-padding pt-0'>
                            <Row className='invoice-spacing'>
                                <Col className='p-1'>
                                    <h6 className='mb-2'>Оюутны бөглөсөн мэдээлэл:</h6>
                                    <table className='w-100'>
                                        <tbody>
                                            <tr className='border-bottom'>
                                                <td className='pe-1' style={{ width: '33%' }}>Оюутны нэр:</td>
                                                <td>
                                                    <span className='fw-bold'>{datas?.student?.full_name}</span>
                                                </td>
                                            </tr>
                                            <tr className='border-bottom'>
                                                <td className='pe-1'>Оюутны код:</td>
                                                <td>{datas?.student?.code}</td>
                                            </tr>
                                            <tr className='border-bottom'>
                                                <td className='pe-1'>Клубын нэр:</td>
                                                <td>{datas?.club?.name}</td>
                                            </tr>
                                            <tr className='border-bottom'>
                                                <td className='pe-1'>Дэлгэрэнгүй хүсэлт:</td>
                                                <td>{datas?.description}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </Col>
                            </Row>
                            <h6 className='mt-1 mb-2'>Хүсэлтийн хариу:</h6>
                                {
                                    (is_view && (datas?.request_flag == 1 || datas?.request_flag == 2)) &&
                                        <div className="my-2">
                                            <h5>{t('Өгөгдөл байхгүй байна')}</h5>
                                        </div>
                                }
                                {
                                (!is_view || (datas.request_flag !== 1 && datas.request_flag !==2)) &&
                                <Row className="invoice-spacing" tag={Form} onSubmit={handleSubmit(onSubmit)}>
                                    <Col md={12} className="mb-1">
                                        <Label className="form-label" for="request_flag">
                                            {t('Шийдвэрийн төлөв')}
                                        </Label>
                                        <Controller
                                            defaultValue=''
                                            control={control}
                                            id="request_flag"
                                            name="request_flag"
                                            render={({ field: { value, onChange} }) => (
                                                <Select
                                                    name="request_flag"
                                                    id="request_flag"
                                                    classNamePrefix='select'
                                                    isClearable
                                                    className={classnames('react-select', { 'is-invalid': errors.request_flag })}
                                                    isLoading={isLoading}
                                                    placeholder={t(`-- Сонгоно уу --`)}
                                                    options={solved_type || []}
                                                    value={solved_type.find((c) => c.id === value)}
                                                    noOptionsMessage={() => t('Хоосон байна')}
                                                    onChange={(val) => {
                                                        onChange(val?.id || '')
                                                    }}
                                                    isDisabled={is_view}
                                                    styles={ReactSelectStyles}
                                                    getOptionValue={(option) => option.id}
                                                    getOptionLabel={(option) => option.name}
                                                />
                                            )}
                                        />
                                        {errors.request_flag && <FormFeedback className='d-block'>{t(errors.request_flag.message)}</FormFeedback>}
                                    </Col>
                                    <Col md={12}>
                                        <Label className="form-label" for="answer">
                                            {t('Хариулт')}
                                        </Label>
                                        <Controller
                                            defaultValue=''
                                            control={control}
                                            id="answer"
                                            name="answer"
                                            render={({ field }) => (
                                                <Input
                                                    {...field}
                                                    id="answer"
                                                    bsSize="sm"
                                                    placeholder={t('Хариулт')}
                                                    type="textarea"
                                                    rows="4"
                                                    disabled={is_view}
                                                    readOnly={is_view}
                                                    invalid={errors.answer && true}
                                                />
                                            )}
                                        />
                                        {errors.answer && <FormFeedback className='d-block'>{t(errors.answer.message)}</FormFeedback>}
                                    </Col>
                                    {
                                        !is_view &&
                                        <Col md={12} className="text-center mt-2">
                                            <Button className="me-2" size='sm' color="primary" type="submit" disabled={isLoading}>
                                                {isLoading && Loader}
                                                {t('Хадгалах')}
                                            </Button>
                                            <Button color="secondary" size='sm' type="reset" outline  onClick={handleModal}>
                                                {t('Буцах')}
                                            </Button>
                                        </Col>
                                    }
                                </Row>
                                }
                        </CardBody>
                    </Card>
                </ModalBody>
            </Modal>
        </Fragment>
	);
};
export default SolveModal;
