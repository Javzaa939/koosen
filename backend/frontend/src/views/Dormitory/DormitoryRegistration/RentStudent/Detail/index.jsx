
import React, { Fragment } from 'react'

import { Row, Col, Modal, ModalBody, ModalHeader, Card, CardBody } from "reactstrap";

import { useTranslation } from 'react-i18next';

import { solved_type_color } from '@utils'

export default function Detail({ isOpen, handleModal, datas })
{
    const { t } = useTranslation()

    return (
        <Fragment>
            <Modal
                isOpen={isOpen}
                toggle={handleModal}
                className="modal-dialog-centered modal-lg"
                contentClassName="pt-0"
                scrollable={true}
            >
                <ModalHeader className='bg-transparent pb-0' toggle={handleModal}></ModalHeader>
                <ModalBody className="">
                    <Card className='invoice-preview-card'>
                        <CardBody className='invoice-padding pb-0'>
                            <div className='d-flex justify-content-between flex-md-row flex-column invoice-spacing mt-0'>
                                <div>
                                    <div className='logo-wrapper'>
                                        <h3 className='text-primary invoice-logo'>Дотуур байрны хүсэлтийн дэлгэрэнгүй</h3>
                                    </div>
                                </div>
                            </div>
                        </CardBody>

                        <hr className='invoice-spacing' />

                        <CardBody className='invoice-padding pt-0'>
                            <Row className='invoice-spacing'>
                                <Col className='p-1'>
                                    <h6 className='mb-2'>Түрээслэгчийн мэдээлэл:</h6>
                                    <table className='w-100'>
                                        <tbody>
                                            <tr className='border-bottom'>
                                                <td className='pe-1' style={{ width: '33%' }}>Түрээслэгч:</td>
                                                <td>
                                                    <span className='fw-bold'>{datas?.teacher?.full_name}</span>
                                                </td>
                                            </tr>
                                            <tr className='border-bottom'>
                                                <td className='pe-1'>Өрөөний төрөл:</td>
                                                <td>{datas?.room_type_name}</td>
                                            </tr>
                                            <tr className='border-bottom'>
                                                <td className='pe-1'>Өрөөний дугаар:</td>
                                                <td>{datas?.room_name}</td>
                                            </tr>
                                            <tr className='border-bottom'>
                                                <td className='pe-1'>Эхлэх хугацаа:</td>
                                                <td>{datas?.start_date}</td>
                                            </tr>
                                            <tr className='border-bottom'>
                                                <td className='pe-1'>Дуусах хугацаа:</td>
                                                <td>{datas?.end_date}</td>
                                            </tr>
                                            <tr className='border-bottom'>
                                                <td className='pe-1'>Бүртгүүлсэн огноо:</td>
                                                <td>{datas?.request_date}</td>
                                            </tr>
                                            <tr className='border-bottom'>
                                                <td className='pe-1'>Түрээслэх хүсэлт:</td>
                                                <td>{datas?.request}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </Col>
                            </Row>

                        <hr className='invoice-spacing' />

                        <Row className='invoice-spacing'>
                                <Col className='p-1'>
                                    <h6 className='mb-2'>Хүсэлтийн хариу:</h6>
                                    <table className='w-100'>
                                        <tbody>
                                            <tr className='border-bottom'>
                                                <td className='pe-1' style={{ width: '33%' }}>Шийдвэрийн төрөл:</td>
                                                <td>
                                                    <span className='fw-bold'>{solved_type_color(datas?.solved_flag)}</span>
                                                </td>
                                            </tr>
                                            <tr className='border-bottom'>
                                                <td className='pe-1'>Гэрээ эхлэх хугацаа:</td>
                                                <td>{datas?.solved_start_date}</td>
                                            </tr>
                                            <tr className='border-bottom'>
                                                <td className='pe-1'>Гэрээ дуусах хугацаа:</td>
                                                <td>{datas?.solved_finish_date}</td>
                                            </tr>
                                            <tr className='border-bottom'>
                                                <td className='pe-1'>Эхний үлдэгдэл:</td>
                                                <td>{datas?.first_uldegdel}</td>
                                            </tr>
                                            <tr className='border-bottom'>
                                                <td className='pe-1'>Шийдвэрийн тайлбар:</td>
                                                <td>{datas?.solved_message}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </Col>
                            </Row>
                        </CardBody>
                    </Card>
                </ModalBody>
            </Modal>
        </Fragment>
    )
}
