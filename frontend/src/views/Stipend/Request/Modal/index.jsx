// ** React imports
// ** React imports
import React, { Fragment, useState, useEffect, useContext } from 'react'

import useApi from "@hooks/useApi";
import useLoader from "@hooks/useLoader";

import Select from 'react-select'

import { useTranslation } from 'react-i18next';

import { useForm, Controller } from "react-hook-form";

import classnames from 'classnames'

import AuthContext from '@context/AuthContext'

import { Row, Col, Form, Modal, Input, Label, Button, ModalBody, ModalHeader, Card, CardBody, FormFeedback } from "reactstrap";

import { SOLVED_TYPES, ReactSelectStyles, convertDefaultValue, solved_type_color } from "@utils"

const SolveModal = ({ request_id, isOpen, is_view, handleModal, refreshDatas }) => {

    const { t } = useTranslation()

    const [is_disabled, setDisabled] = useState(true)

    const { user } = useContext(AuthContext)

    // ** Hook
    const { control, handleSubmit, formState: { errors }, reset, setError, setValue } = useForm({});

	// Loader
	const { Loader, isLoading, fetchData } = useLoader({});

    const [solved_type, setSolvedType] = useState(SOLVED_TYPES(1))

    const [datas, setDatas] = useState([])

    // Api
    const stipendApi = useApi().stipend.request

	async function onSubmit(cdata) {
        cdata = convertDefaultValue(cdata)
        const { success, error } = await fetchData(stipendApi.put(cdata, request_id))
        if (success) {
            reset()
            handleModal()
            refreshDatas()
        } else {
            /** Алдааны мессэжийг input дээр харуулна */
            for (let key in error) {
                setError(error[key].field, { type: 'custom', message: error[key].msg });
            }
        }
	}

    useEffect(() => {
        if (Object.keys(user).length > 0 && user.permissions.includes('lms-stipend-request-update')) {
            setDisabled(false)
        }
    }, [user])

    async function getDatas() {
        if (request_id) {
            const { success, data } = await fetchData(stipendApi.getOne(request_id))
            if (success) {
                setDatas(data)
                // засах үед дата байх юм бол setValue-р дамжуулан утгыг харуулна
                if (data === null) return
                for (let key in data) {
                    if (data[key] !== null)
                        setValue(key, data[key])
                    else setValue(key, '')
                    if (key === 'student') {
                        setValue(key, data[key]?.id)
                        setValue('student_name', data[key]?.full_name)
                    }

                    if(key === 'stipent') setValue(key, data[key]?.id)

                }
            }
        }
    }

    useEffect(() => {
        getDatas()
    },[])

	return (
        <Fragment>
            <Modal
                isOpen={isOpen}
                toggle={handleModal}
                className="modal-dialog-centered modal-lg"
                onClosed={handleModal}
                contentClassName="pt-0"
                scrollable={true}
            >
            <ModalHeader className='bg-transparent pb-0' toggle={handleModal} ></ModalHeader>
                <ModalBody className="">
                    <Card className='invoice-preview-card'>
                        <CardBody className='invoice-padding pb-0'>
                            <div className='d-flex justify-content-between flex-md-row flex-column invoice-spacing mt-0'>
                                <div>
                                    <div className='logo-wrapper'>
                                        {
                                        is_view
                                        ?
                                            <h4>{t('Тэтгэлгийн хүсэлтийн дэлгэрэнгүй')}</h4>
                                        :
                                            <h4>{t('Хүсэлт шийдвэрлэх')}</h4>
                                        }
                                    </div>
                                </div>
                            </div>
                        </CardBody>

                        <hr className='invoice-spacing' />

                        <CardBody className='invoice-padding pt-0'>
                            <Row className='invoice-spacing'>
                                <Col className='p-1'>
                                <h6 className='mb-2'>Оюутны илгээсэн мэдээлэл:</h6>
                                    <table className='w-100'>
                                        <tbody>
                                            <tr className='border-bottom'>
                                                <td className='pe-1' style={{ width: '33%' }}>Оюутан:</td>
                                                <td>
                                                    <span className='fw-bold'>{datas?.student?.full_name}</span>
                                                </td>
                                            </tr>
                                            <tr className='border-bottom'>
                                                <td className='pe-1' style={{ width: '33%' }}>Тэтгэлэгт хамрагдах хүсэлт:</td>
                                                <td>
                                                    <span className='fw-bold'>{datas?.request}</span>
                                                </td>
                                            </tr>
                                            <tr className='border-bottom'>
                                                <td className='pe-1'>Файл:</td>
                                                    {
                                                        datas.files && datas.files.length > 0 &&

                                                            <td className='border-top-0'>
                                                                {
                                                                    datas.files.map((file, idx) => {
                                                                        return (
                                                                            // <tr key={idx}>
                                                                                <div key={idx}>
                                                                                    <a
                                                                                        href={file?.file}
                                                                                        className="me-2 text-primary text-decoration-underline"
                                                                                        target={"_blank"}
                                                                                    >
                                                                                        {file?.file.toString().split("/").pop()}
                                                                                    </a>
                                                                                </div>
                                                                            // </tr>
                                                                        )
                                                                    })
                                                                }
                                                            </td>
                                                    }
                                            </tr>
                                            <tr className='border-bottom'>
                                                <td className='pe-1'>Файлын тайлбар:</td>
                                                {
                                                        datas.files && datas.files.length > 0 &&

                                                            <td className='border-top-0'>
                                                                {
                                                                    datas.files.map((file, idx) => {
                                                                        return (
                                                                            <div key={idx}>
                                                                                <div>{file?.description || t('Хоосон байна')}</div>
                                                                            </div>
                                                                        )
                                                                    })
                                                                }
                                                            </td>
                                                    }
                                            </tr>
                                        </tbody>
                                    </table>
                                </Col>
                            </Row>
                        <h6 className='mt-1 mb-2'>Тэтгэлгийн хүсэлтийн хариу:</h6>
                            {/* {   (datas?.solved_flag == 1 || !datas?.check_stipend ) &&
                                <div className="my-2">
                                    <h5>{t('Хугацаа дууссан байна')}</h5>
                                </div>
                            } */}
                            {   is_view && (datas?.solved_flag == 1 ) &&
                                <div className="my-2">
                                    <h5>{t('Өгөгдөл байхгүй байна')}</h5>
                                </div>
                            }
                            {
                                (!is_view || ( datas?.solved_flag !== 1 )) &&
                                <Row className="invoice-spacing" tag={Form} onSubmit={handleSubmit(onSubmit)}>
                                    <Col md={12}>
                                        <Label className="form-label" for="solved_flag">
                                            {t('Шийдвэрийн төрөл')}
                                        </Label>
                                        <Controller
                                            defaultValue=''
                                            control={control}
                                            id="solved_flag"
                                            name="solved_flag"
                                            render={({ field: { value, onChange} }) => (
                                                <Select
                                                    name="solved_flag"
                                                    id="solved_flag"
                                                    classNamePrefix='select'
                                                    isClearable
                                                    className={classnames('react-select', { 'is-invalid': errors.solved_flag })}
                                                    isLoading={isLoading}
                                                    placeholder={t(`-- Сонгоно уу --`)}
                                                    options={solved_type || []}
                                                    value={solved_type.find((c) => c.id === value)}
                                                    noOptionsMessage={() => t('Хоосон байна')}
                                                    onChange={(val) => {
                                                        onChange(val?.id || '')
                                                    }}
                                                    isSearchable={true}
                                                    styles={ReactSelectStyles}
                                                    isDisabled={is_view}
                                                    getOptionValue={(option) => option.id}
                                                    getOptionLabel={(option) => option.name}
                                                />
                                            )}
                                        />
                                        {errors.solved_flag && <FormFeedback className='d-block'>{t(errors.solved_flag.message)}</FormFeedback>}
                                    </Col>
                                    <Col md={12}>
                                        <Label className="form-label" for="solved_message">
                                            {t('Шийдвэрийн тайлбар')}
                                        </Label>
                                        <Controller
                                            defaultValue=''
                                            control={control}
                                            id="solved_message"
                                            name="solved_message"
                                            render={({ field }) => (
                                                <Input
                                                    {...field}
                                                    id="solved_message"
                                                    bsSize="sm"
                                                    disabled={is_view}
                                                    readOnly={is_view}
                                                    placeholder={t('Тайлбараа оруулна уу')}
                                                    type="textarea"
                                                    invalid={errors.solved_message && true}
                                                />
                                            )}
                                        />
                                        {errors.solved_message && <FormFeedback className='d-block'>{t(errors.solved_message.message)}</FormFeedback>}
                                    </Col>
                                    {
                                        !is_view &&
                                        <Col md={12} className="text-center mt-2">
                                            <Button className="me-2" size='sm' color="primary" type="submit">
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

export default SolveModal
