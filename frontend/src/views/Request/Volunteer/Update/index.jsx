
import {
    Row,
    Col,
    Card,
	Form,
	Modal,
	Input,
	Label,
	Button,
    CardBody,
	ModalBody,
	ModalHeader,
    Spinner,
} from "reactstrap";
import { t } from 'i18next';
import Select from 'react-select'
import useApi from '@hooks/useApi';
import classnames from 'classnames'
import useLoader from '@hooks/useLoader';
import { validateSchema } from './validateSchema'
import { useForm, Controller } from "react-hook-form";
import React, { Fragment, useEffect, useState} from 'react'
import { convertDefaultValue , validate, request_flag_color, request_flag_option, ReactSelectStyles } from "@utils"


const UpdateModal = ({ open, handleModal, is_view, editId, refreshDatas , datas}) => {
    const { isLoading, fetchData } = useLoader({})
    const { isLoading: postLoading, fetchData: postFetch } = useLoader({});

    const [ flag_option, setrequest_flag] = useState(request_flag_option())
    const { control, handleSubmit, setValue, reset, setError, formState: { errors } } = useForm(validate(validateSchema));

    // Api
    const requestVolunteerApi = useApi().request.volunteer

    async function getDatas() {
        if(editId) {
            const { success, data } = await fetchData(requestVolunteerApi.getOne(editId))
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

    useEffect(() => {
        getDatas()
    },[open])

    async function onSubmit(cdata) {
        if(editId) {
            cdata = convertDefaultValue(cdata)
            const { success, error } = await postFetch(requestVolunteerApi.put(cdata, editId))
            if(success) {
                refreshDatas()
                handleModal()
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
            <Modal
                isOpen={open}
                toggle={handleModal}
                className="modal-dialog-centered modal-lg"
                onClosed={handleModal}
                contentClassName="pt-0"
                scrollable={true}
            >
                {isLoading && <div className='suspense-loader'><Spinner size='xl'/></div>}
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
                                            <h4>{t('Хүсэлтийн дэлгэрэнгүй')}</h4>
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
                                    <h6 className='mb-2'>Оюутны мэдээлэл:</h6>
                                    <table className='w-100'>
                                        <tbody>
                                            <tr className='border-bottom'>
                                                <td className='pe-1' style={{ width: '33%' }}>Үйл ажиллагааны нэр:</td>
                                                <td>
                                                    <span className='fw-bold'>{datas?.action?.title}</span>
                                                </td>
                                            </tr>
                                            <tr className='border-bottom'>
                                                <td className='pe-1' style={{ width: '33%' }}>Зохион байгуулагч:</td>
                                                <td>
                                                    <span className='fw-bold'>{datas?.action?.organiser}</span>
                                                </td>
                                            </tr>
                                            <tr className='border-bottom'>
                                                <td className='pe-1' style={{ width: '33%' }}>Эхлэх хугацаа:</td>
                                                <td>
                                                    <span className='fw-bold'>{datas?.action?.start}</span>
                                                </td>
                                            </tr>
                                            <tr className='border-bottom'>
                                                <td className='pe-1' style={{ width: '33%' }}>Дуусах хугацаа:</td>
                                                <td>
                                                    <span className='fw-bold'>{datas?.action?.end}</span>
                                                </td>
                                            </tr>
                                            <tr className='border-bottom'>
                                                <td className='pe-1' style={{ width: '33%' }}>Оюутны код:</td>
                                                <td>
                                                    <span className='fw-bold'>{datas?.student?.code}</span>
                                                </td>
                                            </tr>
                                            <tr className='border-bottom'>
                                                <td className='pe-1' style={{ width: '33%' }}>Оюутны нэр:</td>
                                                <td>
                                                    <span className='fw-bold'>{datas?.student?.full_name}</span>
                                                </td>
                                            </tr>
                                            <tr className='border-bottom'>
                                                <td className='pe-1' style={{ width: '33%' }}>Хүсэлтийн дэлгэрэнгүй:</td>
                                                <td>
                                                    <span className='fw-bold'>{datas?.description}</span>
                                                </td>
                                            </tr>
                                            <tr className='border-bottom'>
                                                <td className='pe-1' style={{ width: '33%' }}>Хүсэлтийн төлөв:</td>
                                                <td>
                                                    <span className='fw-bold'>{request_flag_color(datas?.request_flag)}</span>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </Col>

                            </Row>

                            <hr className='invoice-spacing' />
                            <h6 className='mb-2'>Хүсэлтийн хариулт:</h6>
                                {
                                    (is_view && (datas?.request_flag == 1 || datas?.request_flag == 2)) &&
                                        <div className="my-2">
                                            <h5>{t('Өгөгдөл байхгүй байна')}</h5>
                                        </div>
                                }
                                {
                                    (!is_view || (datas.request_flag !== 1 && datas.request_flag !==2)) &&
                                    <Row className="invoice-spacing" tag={Form} onSubmit={handleSubmit(onSubmit)}>
                                    <Col md={12}>
                                        <Label className="form-label" for="request_flag">
                                            {t('Шийдвэрийн төлөв')}
                                        </Label>
                                        <Controller
                                            control={control}
                                            defaultValue=''
                                            name="request_flag"
                                            render={({ field: { value, onChange} }) => {
                                                return (
                                                    <Select
                                                        name="request_flag"
                                                        id="request_flag"
                                                        classNamePrefix='select'
                                                        isClearable
                                                        className={classnames('react-select', { 'is-invalid': errors.request_flag })}
                                                        placeholder={t(`-- Сонгоно уу --`)}
                                                        options={flag_option|| []}
                                                        value={flag_option && flag_option.length > 0 && flag_option.find((c) => c.id === value)}
                                                        noOptionsMessage={() => t('Хоосон байна.')}
                                                        onChange={(val) => {
                                                            onChange(val?.id || '')
                                                        }}
                                                        isSearchable={true}
                                                        styles={ReactSelectStyles}
                                                        isDisabled={is_view}
                                                        getOptionValue={(option) => option.id}
                                                        getOptionLabel={(option) => option.name}
                                                    />
                                                )
                                            }}
                                        >
                                        </Controller>
                                    </Col>
                                    <Col md={12}>
                                        <Label className="form-label" for="answer">
                                            {t('тайлбар')}
                                        </Label>
                                        <Controller
                                            defaultValue=''
                                            control={control}
                                            id="answer"
                                            name="answer"
                                            render={({ field }) => (
                                                <Input
                                                    disabled={is_view}
                                                    readOnly={is_view}
                                                    id ="answer"
                                                    bsSize="sm"
                                                    {...field}
                                                    type="textarea"
                                                    placeholder={t('тайлбар оруулна уу')}
                                                    invalid={errors.answer && true}
                                                />
                                            )}
                                        />
                                    </Col>
                                    {
                                    !is_view &&
                                    <Col md={12} className="text-center mt-2">
                                        <Button className="me-2" color="primary" type="submit" disabled={postLoading}>
                                            {postLoading &&<Spinner size='sm' className='me-1'/>}
                                            {t('Хадгалах')}
                                        </Button>
                                        <Button color="secondary" type="reset" outline onClick={handleModal}>
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
export default UpdateModal;
