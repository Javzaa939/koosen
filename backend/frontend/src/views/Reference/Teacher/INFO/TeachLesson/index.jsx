
import React from "react"

import { UncontrolledCollapse, Card, Table } from 'reactstrap';

export default function TeachLesson({ datas })
{

    return (
        <Card className='mt-1 m-0'>
            {datas && datas.length > 0 &&
            <div className='added-cards border'>
                <div className='cardMaster rounded p-1 fw-bolder underline text-decoration-underline' role="button" id="teachlesson">
                    Хичээлийн дэлгэрэнгүй
                </div>
                <UncontrolledCollapse toggler="#teachlesson" className="m-2">
                    <Table bordered responsive className='table'>
                        <thead>
                            <tr>
                                <th>Хичээлийн нэр</th>
                                <th>Хичээлийн код</th>
                                <th>Хичээлийн кредит</th>
                                <th>Хичээлийн ангилал</th>
                                <th>Хичээлийн тодорхойлолт</th>
                                <th>Хичээллэх Хичээлийн зорилго</th>
                                <th>Олгох мэдлэг</th>
                                <th>Олгох чадвар</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                datas && datas.length > 0 &&
                                datas.map((data, idx) => {
                                    return (
                                        <tr key={idx}>
                                            <td>{data?.lesson?.name}</td>
                                            <td>{data?.lesson?.code}</td>
                                            <td>{data?.lesson?.kredit}</td>
                                            <td>{data?.lesson?.category?.category_name}</td>
                                            <td>{data?.lesson?.definition}</td>
                                            <td>{data?.lesson?.purpose}</td>
                                            <td>{data?.lesson?.knowledge}</td>
                                            <td>{data?.lesson?.skill}</td>


                                        </tr>
                                    )
                                })
                            }
                        </tbody>
                    </Table>
                    <div className="text-end" >
                        <button className="btn btn-primary me-2 mt-1" onClick={() => { document.getElementById('teachlesson').click() }} >
                            Хаах
                        </button>
                    </div>
                </UncontrolledCollapse>
            </div>
            }
        </Card>
    )
}
