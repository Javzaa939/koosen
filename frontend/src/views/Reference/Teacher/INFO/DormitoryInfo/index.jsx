
import React from "react"

import { Card, UncontrolledCollapse, Table, Badge } from "reactstrap"
import { useTranslation } from 'react-i18next'

export default function BoardingHouse({ datas })
{
    const { t } = useTranslation()
    return (
        <Card className='mt-1 m-0'>
            {datas && datas.length > 0 &&
            <div className='added-cards border'>
                <div className='cardMaster rounded p-1 fw-bolder underline text-decoration-underline' role="button" id="scoreBoardingHouse">
                    Дотуур байрны мэдээлэл
                </div>
                <UncontrolledCollapse toggler="#scoreBoardingHouse" className="m-2">
                    <Table bordered responsive className='table'>
                        <thead>
                            <tr>
                                <th>Өрөөний дугаар</th>
                                <th>Өрөөний төрөл</th>
                                <th>Эхлэх хугацаа</th>
                                <th>Дуусах хугацаа</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                datas && datas.length > 0 &&
                                datas.map((data, idx) => {
                                    return (
                                        <tr key={idx}>
                                            <td>{data?.room?.room_number}</td>
                                            <td>{data?.room_type?.name}</td>
                                            <td>{data?.solved_start_date}</td>
                                            <td>{data?.solved_finish_date}</td>
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
            }
        </Card>
    )
}
