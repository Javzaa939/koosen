
import React, { useState } from "react"

import { Card, Row, Col, UncontrolledCollapse, Table, Popover, PopoverBody, Button, PopoverHeader } from "reactstrap"
import { useTranslation } from 'react-i18next'

import BalancePopover from "./BalancePopover"

export default function PaymentInformation({ datas })
{
    const { t } = useTranslation()

    return (
       <Card className='mt-1 m-0'>
            <div className='added-cards border'>
                <div className='cardMaster rounded p-1 fw-bolder underline text-decoration-underline' role="button" id="scorePaymentInfo">
                    Төлбөрийн мэдээлэл
                </div>

                <UncontrolledCollapse toggler="#scorePaymentInfo" className="m-2">
                <hr />

                    <Row className="m-1">
                        <Col md={12} >
                            <div>
                                <Table size="sm" bordered striped responsive>
                                    <thead className="leftHeader">
                                        <tr>
                                            <th className="leftHeader ps-50" colSpan={9}><i className="fas fa-clipboard-list me-50"></i>{t('Төлбөрийн түүх')}</th>
                                        </tr>
                                    </thead>
                                    <thead>
                                        <tr>
                                            <th className="ps-50">Хичээлийн жил</th>
                                            <th>Улирал</th>
                                            <th>Төлөх төлбөр</th>
                                            <th>Эхний үлдэгдэл</th>
                                            <th>Хөнгөлөлт</th>
                                            <th>Төлсөн</th>
                                            <th>Буцаасан</th>
                                            <th>Эцсийн үлдэгдэл</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                            datas && datas.length > 0 &&
                                            datas.map((data, idx) => {
                                                return (
                                                    <tr key={idx}>
                                                        <td>{data?.lesson_year}</td>
                                                        <td>{data?.season_name}</td>
                                                        <td>{data?.payment}</td>
                                                        <td>{data?.first_balance}</td>
                                                        <td>{data?.discount}</td>
                                                        <td>
                                                            <BalancePopover text={data?.in_balance} balance={data?.balance_detail} id={idx} />
                                                        </td>
                                                        <td>{data?.out_balance}</td>
                                                        <td>{data?.last_balance}</td>
                                                    </tr>
                                                )
                                            })
                                        }
                                    </tbody>
                                </Table>
                            </div>
                        </Col>
                    </Row>

                    <div className="text-end" >
                        <button className="btn btn-primary me-2" onClick={() => { document.getElementById('scorePaymentInfo').click() }} >
                            Хаах
                        </button>
                    </div>

                </UncontrolledCollapse>

            </div>
        </Card>
    )
}
