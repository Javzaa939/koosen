
import React from "react"

import { UncontrolledCollapse, Card, Table } from 'reactstrap';

export default function LessonSchedule({ datas })
{
    return (
        <Card className='mt-1 m-0'>
            {datas && datas.length > 0 &&
            <div className='added-cards border'>
                <div className='cardMaster rounded p-1 fw-bolder underline text-decoration-underline' role="button" id="toggler">
                    Хичээлийн хуваарь
                </div>
                <UncontrolledCollapse toggler="#toggler" className="m-2">
                    <Table bordered responsive className='table'>
                        <thead>
                            <tr>
                                <th>Гараг</th>
                                <th>Цаг</th>
                                <th>Хичээлийн код</th>
                                <th>Хичээлийн нэр</th>
                                <th>Хичээллэх хэлбэр</th>
                                <th>Хичээллэх төрөл</th>
                                <th>Хичээллэх ангийн нэр</th>
                                <th>Хичээллэх ангийн тоот</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                datas && datas.length > 0 &&
                                datas.map((data, idx) => {
                                    return (
                                        <tr key={idx}>
                                            <td>{data?.day_name}</td>
                                            <td>{data?.time}</td>
                                            <td>{data?.lesson?.code}</td>
                                            <td>{data?.lesson?.name}</td>
                                            <td>{data?.study_type_name}</td>
                                            <td>{data?.type_name}</td>
                                            <td>{data?.room?.name}</td>
                                            <td>{data?.room?.code}</td>
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
            }

        </Card>
    )
}
