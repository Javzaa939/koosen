
import React, { useState } from "react"

import { UncontrolledCollapse, Card, Table } from 'reactstrap';

import { get_day } from '@utils';

export default function LessonSchedule({ datas })
{
    const [days, setDays] = useState(get_day())

    function getDayName(day)
    {
        const day_names = days.find(value => value.id === day)
        return day_names.name
    }

    return (
        <Card className='mt-1 m-0'>

            <div className='added-cards border'>

                <div className='cardMaster rounded p-1 fw-bolder underline text-decoration-underline' role="button" id="toggler">
                    Хичээлийн хуваарь
                </div>

                <UncontrolledCollapse toggler="#toggler" className="m-2">
                    <hr />
                    <div className='added-cards'>
                        <div className='cardMaster rounded pb-1 pt-2' >
                            <h5 className='text-center pb-50'>Хичээлийн хуваарь</h5>
                        </div>
                    </div>

                    <Table bordered responsive className='table'>
                        <thead>
                            <tr>
                                <th>Гараг</th>
                                <th>Цаг</th>
                                <th>Хичээл</th>
                                <th>Хичээллэх төрөл</th>
                                <th>Хичээллэх анги</th>
                                <th>Хичээлийн код</th>
                                <th>Багш</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                datas && datas.length > 0 &&
                                datas.map((data, idx) => {
                                    return (
                                        <tr key={idx}>
                                            <td>{getDayName(data?.day)}</td>
                                            <td>{data?.time}</td>
                                            <td>{data?.lesson?.name}</td>
                                            <td>{data?.type}</td>
                                            <td>{data?.room?.code}</td>
                                            <td>{data?.lesson?.code}</td>
                                            <td>{data?.teacher?.full_name}</td>
                                        </tr>
                                    )
                                })
                            }
                        </tbody>
                    </Table>

                    <div className="text-end" >
                        <button className="btn btn-primary me-2 mt-1" onClick={() => { document.getElementById('toggler').click() }} >
                            Хаах
                        </button>
                    </div>

                </UncontrolledCollapse>

            </div>
        </Card>
    )
}
