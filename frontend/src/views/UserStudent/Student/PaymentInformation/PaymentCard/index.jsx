import React, { useContext } from 'react';
import { Button, CardImgOverlay, CardTitle, CardText, Row, Col, CardBody } from 'reactstrap'

import { moneyFormat } from '@utils'

import '../style.scss'

import ActiveYearContext from '@context/ActiveYearContext'

import { Plus } from 'react-feather';

const PaymentCard = ({ datas, handlePaymentModal }) => {
    const { cyear_name, cseason_name } = useContext(ActiveYearContext)

    const lesson_year = datas?.lesson_year || cyear_name
    const lesson_season_name = datas?.season_name || cseason_name

    var balance_dutuu = datas?.last_balance < 0 ? datas?.last_balance : 0

    return (
        <div className='mb-3' style={{ position: "relative" }}>
            <div className='card-congratulations payment-card-img rounded shadow payment-card'>
                <CardImgOverlay>
                    <CardTitle className='mt-1 ms-1'>
                        <h5 className='text-white fw-bolder'>{`${lesson_year} оны ${lesson_season_name}-н хичээлийн жилийн сургалтын төлбөр`}</h5>
                        <span className='mb-0 text-white fw-bolder payment-card-money'>{moneyFormat((datas?.payment || 0) - (datas?.reduce_payment || 0))}₮</span>
                    </CardTitle>
                    <CardBody className='p-0'>
                        <Row className='text-start mx-0'>
                            <Col xs='3' className='border-end py-1'>
                                <CardText className='fw-bolder mb-0'>Эхний үлдэгдэл</CardText>
                                <span className='payment-card-money fw-bolder text-white mb-0'>{moneyFormat(datas?.first_balance)}₮</span>
                            </Col>
                            <Col xs='3' className='border-end py-1'>
                                <CardText className='fw-bolder mb-0'>Хөнгөлөлт</CardText>
                                <span className='payment-card-money fw-bolder text-white mb-0'>{moneyFormat(datas?.discount)}₮</span>
                            </Col>
                            <Col xs='3' className='border-end py-1'>
                                <CardText className='fw-bolder mb-0'>Төлсөн</CardText>
                                <span className='payment-card-money fw-bolder text-white mb-0'>{moneyFormat(datas?.in_balance)}₮</span>
                            </Col>
                            <Col xs='3' className='py-1'>
                                <CardText className='fw-bolder mb-0'>Дутуу төлбөр</CardText>
                                <span className='payment-card-money fw-bolder text-white mb-0'>{moneyFormat(Math.abs(balance_dutuu))}₮</span>
                            </Col>
                        </Row>
                    </CardBody>
                </CardImgOverlay>
            </div>
            {
                Math.abs(balance_dutuu)
                ?
                    <Button style={{ position: "absolute", bottom: -20, right: 15 }} color='success' active size='md' className='rounded-pill' onClick={() => handlePaymentModal()}>
                        <Plus className='me-50' size={15} />
                        Төлбөр төлөх
                    </Button>
                :
                    null
            }
        </div>
    );
};

export default PaymentCard;