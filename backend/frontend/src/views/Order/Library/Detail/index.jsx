
import React, { Fragment } from 'react'

import { Row, Col, Modal, ModalBody, ModalHeader, Card, CardBody } from "reactstrap";

import { useTranslation } from 'react-i18next';

import { request_flag_color } from "@utils"

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
                                        <h3 className='text-primary invoice-logo'>Захиалгын дэлгэрэнгүй</h3>
                                    </div>
                                </div>
                                {/* <div className='mt-md-0 mt-2'>
                                    <h4 className='invoice-title'>
                                        <span className='invoice-number'>{datas?.created_at.substring(0, 10)}</span>
                                    </h4>
                                </div> */}
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
                                                <td className='pe-1' style={{ width: '33%' }}>Нэр:</td>
                                                <td>
                                                    <span className='fw-bold'>{datas?.student?.full_name}</span>
                                                </td>
                                            </tr>
                                            <tr className='border-bottom'>
                                                <td className='pe-1'>Код:</td>
                                                <td>{datas?.student?.code}</td>
                                            </tr>
                                            <tr className='border-bottom'>
                                                <td className='pe-1'>Захиалгын мэдээлэл:</td>
                                                <td>{datas?.description}</td>
                                            </tr>
                                            {/* <tr className='border-bottom'>
                                                <td className='pe-1'>Хүсэлтийн төлөв:</td>
                                                <td>
                                                    <span className='fw-bold'>{request_flag_color(datas?.order_flag)}</span>
                                                </td>
                                            </tr> */}
                                        </tbody>
                                    </table>
                                </Col>
                            </Row>
                            <Row className='invoice-spacing'>
                                <Col className='p-1'>
                                    <h6 className='mb-2'>Номын сангийн мэдээлэл:</h6>
                                    <table className='w-100'>
                                        <tbody>
                                            <tr className='border-bottom'>
                                                <td className='pe-1' style={{ width: '33%' }}>Өрөө:</td>
                                                <td>
                                                    <span className='fw-bold'>{datas?.room_name}</span>
                                                </td>
                                            </tr>
                                            <tr className='border-bottom'>
                                                <td className='pe-1'>Суудал:</td>
                                                <td>{datas?.chair_num}</td>
                                            </tr>
                                            <tr className='border-bottom'>
                                                <td className='pe-1'>Өдөр:</td>
                                                <td>{datas?.day}</td>
                                            </tr>
                                            <tr className='border-bottom'>
                                                <td className='pe-1'>Цаг:</td>
                                                <td>{datas?.starttime + '~' + datas?.endtime}</td>
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
