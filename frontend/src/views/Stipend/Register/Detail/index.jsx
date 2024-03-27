
import React, { Fragment } from 'react'

import { Row, Col, Modal, ModalBody, ModalHeader, Card, CardBody } from "reactstrap";

import { useTranslation } from 'react-i18next';

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
                                        <h3 className='text-primary invoice-logo'>{t('Тэтгэлгийн дэлгэрэнгүй')}</h3>
                                    </div>
                                </div>
                            </div>
                        </CardBody>

                        <hr className='invoice-spacing' />

                        <CardBody className='invoice-padding pt-0'>
                            <Row className='invoice-spacing'>
                                <Col className='p-1'>
                                    <table className='w-100'>
                                        <tbody>
                                            <tr className='border-bottom'>
                                                <td className='pe-1' style={{ width: '33%' }}>{t('Тэтгэлгийн төрөл')}:</td>
                                                <td>
                                                    <span className='fw-bold'>{datas?.is_own===1 ? "Сургуулийн дотоод тэтгэлэг" : "Гадны тэтгэлэг" }</span>
                                                </td>
                                            </tr>
                                            {
                                                datas?.is_own===2 &&

                                                <tr className='border-bottom'>
                                                    <td className='pe-1' style={{ width: '33%' }}>{t('Тэтгэлэгийн хэмжээ')}:</td>
                                                    <td>
                                                        <span className='fw-bold'>{datas?.stipend_amount}</span>
                                                    </td>
                                                </tr>
                                            }
                                            <tr className='border-bottom'>
                                                <td className='pe-1' style={{ width: '33%' }}>{t('Тэтгэлэгүүд')}:</td>
                                                <td>
                                                    <span className='fw-bold'>{datas?.stipend_type?.name}</span>
                                                </td>
                                            </tr>
                                            <tr className='border-bottom'>
                                                <td className='pe-1'>{t('Тайлбар')}:</td>
                                                <td><div id="body" dangerouslySetInnerHTML={{ __html: datas?.body }} >
                                                </div></td>
                                            </tr>
                                            <tr className='border-bottom'>
                                                <td className='pe-1'>{t('Эхлэх хугацаа')}:</td>
                                                <td>{datas?.start_date}</td>
                                            </tr>
                                            <tr className='border-bottom'>
                                                <td className='pe-1'>{t('Дуусах хугацаа')}:</td>
                                                <td>{datas?.finish_date}</td>
                                            </tr>

                                            <tr className='border-bottom'>
                                                <td className='pe-1'>{t('Нээлттэй эсэх')}:</td>
                                                <td>{datas?.is_open? "Тийм" : "Үгүй"}</td>
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
