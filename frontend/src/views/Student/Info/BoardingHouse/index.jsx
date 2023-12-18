
import React from "react"

import { Card, UncontrolledCollapse, Table, Badge } from "reactstrap"
import { useTranslation } from 'react-i18next'

export default function BoardingHouse({ datas })
{
    const { t } = useTranslation()

    return (
        <Card className='mt-1 m-0'>
            <div className='added-cards border'>
                <div className='cardMaster rounded p-1 fw-bolder underline text-decoration-underline' role="button" id="scoreBoardingHouse">
                    Дотуур байр
                </div>

                <UncontrolledCollapse toggler="#scoreBoardingHouse" className="m-2">
                <hr />

                    <div className='added-cards'>
                        <div className='cardMaster rounded pb-1 pt-2' >
                            <h5 className='text-center pb-50'>Дотуур байр</h5>
                        </div>
                    </div>

                    <Table bordered responsive className='table'>
                        <thead>
                            <tr>
                                <th>Өрөөний төрөл</th>
                                <th>Өрөөний дугаар</th>
                                <th>Нэмэлт тайлбар</th>
                                <th>Илгээсэн огноо</th>
                                <th>Төлбөр төлөгдсөн эсэх</th>
                                <th>Баталгаажсан огноо</th>
                                <th>Шийдвэрийн төрөл</th>
                                <th>Шийдвэрийн тайлбар</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                datas && datas.length > 0 &&
                                datas.map((data, idx) => {
                                    return (
                                        <tr key={idx}>
                                            <td>{data?.room_type?.name}</td>
                                            <td>{data?.room?.room_number}</td>
                                            <td>{data?.request}</td>
                                            <td>{data?.request_date}</td>
                                            <td>
                                                {
                                                    data?.is_payment
                                                    ?
                                                        <Badge color="light-success" pill>
                                                            {t('Төлсөн')}
                                                        </Badge>
                                                    :
                                                        <Badge color="light-danger" pill>
                                                            {t('Төлөөгүй')}
                                                        </Badge>
                                                }
                                            </td>
                                            <td>{data?.confirm_date}</td>
                                            <td>{data?.solved_flag}</td>
                                            <td>{data?.solved_message}</td>
                                        </tr>
                                    )
                                })
                            }
                        </tbody>
                    </Table>

                    <div className="text-end" >
                        <button className="btn btn-primary me-2 mt-1" onClick={() => { document.getElementById('scoreBoardingHouse').click() }} >
                            Хаах
                        </button>
                    </div>

                </UncontrolledCollapse>

            </div>
        </Card>
    )
}
