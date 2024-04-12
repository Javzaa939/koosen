import React from 'react'
import { Col, Modal, ModalBody, ModalHeader, Row } from 'reactstrap'

function Detail({ detail, detailHandler, detailData }) {

    const datas = detailData?.health_up_user_data

    return (
        <Modal
            isOpen={detail}
            toggle={detailHandler}
            centered
            size='lg'
        >
            <ModalHeader toggle={detailHandler}>
                Элсэгчийн нарийн мэргэжлийн шатны эрүүл мэндийн үзлэгийн мэдээлэл
            </ModalHeader>
            <ModalBody>
                <Row>
                    <Col md={6} sm={12}>
                        <div>
                            <div className='border p-1 m-1 rounded-4' style={{ minHeight: 80 }}>
                                <div className='fw-bolder text-uppercase'>
                                    Дотор
                                </div>
                                <div>
                                    {datas?.belly || ''}
                                </div>
                            </div>
                            <div className='border p-1 m-1 rounded-4' style={{ minHeight: 80 }}>
                                <div className='fw-bolder text-uppercase'>
                                    Мэдрэл
                                </div>
                                <div>
                                    {datas?.nerve || ''}
                                </div>
                            </div>
                            <div className='border p-1 m-1 rounded-4' style={{ minHeight: 80 }}>
                                <div className='fw-bolder text-uppercase'>
                                    Мэс засал
                                </div>
                                <div>
                                    {datas?.surgery || ''}
                                </div>
                            </div>
                            <div className='border p-1 m-1 rounded-4' style={{ minHeight: 80 }}>
                                <div className='fw-bolder text-uppercase'>
                                    Эмэгтэйчүүд
                                </div>
                                <div>
                                    {datas?.femini || ''}
                                </div>
                            </div>
                            <div className='border p-1 m-1 rounded-4' style={{ minHeight: 80 }}>
                                <div className='fw-bolder text-uppercase'>
                                    Халдварт өвчин
                                </div>
                                <div>
                                    {datas?.contagious || ''}
                                </div>
                            </div>
                            <div className='border p-1 m-1 rounded-4' style={{ minHeight: 80 }}>
                                <div className='fw-bolder text-uppercase'>
                                    Сэтгэц мэдрэл
                                </div>
                                <div>
                                    {datas?.neuro_phychic || ''}
                                </div>
                            </div>
                            <div className='border p-1 m-1 rounded-4' style={{ minHeight: 80 }}>
                                <div className='fw-bolder text-uppercase'>
                                    Гэмтэл
                                </div>
                                <div>
                                    {datas?.injury || ''}
                                </div>
                            </div>
                        </div>
                    </Col>
                    <Col md={6} sm={12}>
                        <div>
                            <div className='border p-1 m-1 rounded-4' style={{ minHeight: 80 }}>
                                <div className='fw-bolder text-uppercase'>
                                    Чих хамар хоолой
                                </div>
                                <div>
                                    {datas?.ear_nose || ''}
                                </div>
                            </div>
                            <div className='border p-1 m-1 rounded-4' style={{ minHeight: 80 }}>
                                <div className='fw-bolder text-uppercase'>
                                    Нүд
                                </div>
                                <div>
                                    {datas?.eye || ''}
                                </div>
                            </div>
                            <div className='border p-1 m-1 rounded-4' style={{ minHeight: 80 }}>
                                <div className='fw-bolder text-uppercase'>
                                    Шүд
                                </div>
                                <div>
                                    {datas?.teeth || ''}
                                </div>
                            </div>
                            <div className='border p-1 m-1 rounded-4' style={{ minHeight: 80 }}>
                                <div className='fw-bolder text-uppercase'>
                                    Зүрх судас
                                </div>
                                <div>
                                    {datas?.heart || ''}
                                </div>
                            </div>
                            <div className='border p-1 m-1 rounded-4' style={{ minHeight: 80 }}>
                                <div className='fw-bolder text-uppercase'>
                                    Сүрьеэ
                                </div>
                                <div>
                                    {datas?.ear_nose || ''}
                                </div>
                            </div>
                            <div className='border p-1 m-1 rounded-4' style={{ minHeight: 80 }}>
                                <div className='fw-bolder text-uppercase'>
                                    Арьс харшил
                                </div>
                                <div>
                                    {datas?.allergies || ''}
                                </div>
                            </div>
                            <div className='border p-1 m-1 rounded-4' style={{ minHeight: 80 }}>
                                <div className='fw-bolder text-uppercase'>
                                    БЗДХ
                                </div>
                                <div>
                                    {datas?.bzdx || ''}
                                </div>
                            </div>
                        </div>
                    </Col>
                </Row>
                <div className='border p-1 m-1 rounded-4' style={{ minHeight: 80 }}>
                    <div className='fw-bolder text-uppercase'>
                        Дүгнэлт
                    </div>
                    <div>
                        {datas?.description || ''}
                    </div>
                </div>
            </ModalBody>
        </Modal>
    )
}

export default Detail
