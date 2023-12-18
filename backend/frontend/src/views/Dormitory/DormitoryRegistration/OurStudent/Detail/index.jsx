
import React, { Fragment } from 'react'

import { Row, Col, Modal, ModalBody, ModalHeader, Card, CardBody } from "reactstrap";

import { useTranslation } from 'react-i18next';
import './style.scss'

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
                                        <h3 className='invoice-logo'>Дотуур байрны хүсэлтийн дэлгэрэнгүй</h3>
                                    </div>
                                </div>
                            </div>
                        </CardBody>

                        <hr className='invoice-spacing' />

                        <CardBody className='invoice-padding pt-0 fontdark'>
                            <Row className='invoice-spacing'>
                                <Col className='p-1'>
                                    <h6 className='mb-2'>Оюутны илгээсэн мэдээлэл:</h6>
                                    <table className='w-100'>
                                        <tbody>
                                            <tr className='border-bottom'>
                                                <td className='pe-1' style={{ width: '33%' }}>Оюутны нэр:</td>
                                                <td>
                                                    <span className='fw-bold'>{datas?.student?.code + ' '+ datas?.full_name}</span>
                                                </td>
                                            </tr>
                                            <tr className='border-bottom'>
                                                <td className='pe-1'>Суух хүсэлт:</td>
                                                <td>{datas?.request}</td>
                                            </tr>
                                            <tr className='border-bottom'>
                                                <td className='pe-1'>Өрөөний төрөл:</td>
                                                <td>{datas?.room_type_name}</td>
                                            </tr>
                                            <tr className='border-bottom'>
                                                <td className='pe-1'>Өрөөний дугаар:</td>
                                                <td>{datas?.room_name}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </Col>
                            </Row>
                            <Row className='invoice-spacing'>
                                <Col className='p-1'>
                                    <h6 className='mb-2'>Төлбөрийн мэдээлэл:</h6>
                                    <table className='w-100'>
                                        <tbody>
                                            <tr className='border-bottom'>
                                                <td className='pe-1' style={{ width: '33%' }}>Төлбөрийн хэмжээ:</td>
                                                <td>
                                                    <span className='fw-bold'>{datas?.payment}</span>
                                                </td>
                                            </tr>
                                            <tr className='border-bottom'>
                                                <td className='pe-1'>Барьцаа төлбөр:</td>
                                                <td>{datas?.ransom}</td>
                                            </tr>
                                            <tr className='border-bottom'>
                                                <td className='pe-1'>Төлсөн төлбөр:</td>
                                                <td>{datas?.in_balance}</td>
                                            </tr>
                                            <tr className='border-bottom'>
                                                <td className='pe-1'>Буцаасан төлбөр:</td>
                                                <td>{datas?.out_balance}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </Col>
                            </Row>

                        <Row className='invoice-spacing'>
                                <Col className='p-1'>
                                    <h6 className='mb-2'>Шийдвэрийн мэдээлэл:</h6>
                                    <table className='w-100'>
                                        <tbody>
                                            <tr className='border-bottom'>
                                                <td className='pe-1' style={{ width: '33%' }}>Шийдвэрийн төрөл:</td>
                                                <td>{datas?.solved_flag_name}</td>
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
