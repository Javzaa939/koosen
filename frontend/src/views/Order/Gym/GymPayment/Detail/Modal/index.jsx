
import React, { Fragment, useState } from 'react'

import { Row, Col, Card, CardBody } from "reactstrap";

import { useTranslation } from 'react-i18next';

import { get_day } from '@utils'

export default function DetailModal(props)
{
    const { t } = useTranslation()

    const { datas  } = props

    const [weekend_option, setWeekends] = useState(get_day())

    // Гарагуудын нэрийг олох функц
    function getWeekendName(days) {
        const week_names = []
        const weekends = JSON.parse(days);
        weekends.map((week) => {
            var selected = weekend_option.find((e) => e.id === week)
            if(selected) {
                week_names.push(selected.name)
            }
        })
        return week_names.join(', ')
    }

    return (
        <Fragment>
            <Card className='invoice-preview-card'>
                <CardBody className='invoice-padding pb-0'>
                    <div className='d-flex justify-content-between flex-md-row flex-column invoice-spacing mt-0'>
                        <div>
                            <div className='logo-wrapper'>
                                <h3 className='text-primary invoice-logo'>Фитнесийн дэлгэрэнгүй</h3>
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

                <Row className='invoice-spacing'>
                    <Col className='p-1'>
                        {/* <h6 className='mb-2'>Фитнессийн дэлгэрэнгүй мэдээлэл:</h6> */}
                        <table className='w-100'>
                            <tbody>
                                <tr className='border-bottom'>
                                    <td className='pe-1' style={{ width: '33%' }}>Нэр:</td>
                                    <td>
                                        <span className='fw-bold'>{datas?.name}</span>
                                    </td>
                                </tr>
                                <tr className='border-bottom'>
                                    <td className='pe-1'>Хичээллэх сар:</td>
                                    <td>{datas?.mount_count}</td>
                                </tr>
                                <tr className='border-bottom'>
                                    <td className='pe-1'>Хичээллэх гарагууд:</td>
                                    <td>{getWeekendName(datas?.week_day)}</td>
                                </tr>
                                <tr className='border-bottom'>
                                    <td className='pe-1'>Долоо хоногт хичээллэх тоо:</td>
                                    <td>{datas?.accepted_count}</td>
                                </tr>
                                <tr className='border-bottom'>
                                    <td className='pe-1'>Төлбөр:</td>
                                    <td>{datas?.payment}</td>
                                </tr>
                                <tr className='border-bottom'>
                                    <td className='pe-1'>Тайлбар:</td>
                                    <td>{datas?.description}</td>
                                </tr>
                            </tbody>
                        </table>
                    </Col>
                </Row>
            </Card>
        </Fragment>
    )
}
