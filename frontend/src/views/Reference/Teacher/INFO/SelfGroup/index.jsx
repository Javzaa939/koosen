
import React from "react"

import { UncontrolledCollapse, Card, Table } from 'reactstrap';

export default function SelfGroup({ datas })
{

    return (
        <Card className='mt-1 m-0'>
            {datas && datas.length > 0 &&

            <div className='added-cards border'>
                <div className='cardMaster rounded p-1 fw-bolder underline text-decoration-underline' role="button" id="groups">
                Дамжааны мэдээлэл
                </div>
                <UncontrolledCollapse toggler="#groups" className="m-2">
                    <Table bordered responsive className='table'>
                        <thead>
                            <tr>
                                <th>Дамжааны нэр</th>
                                <th>Мэргэжлийн код</th>
                                <th>Мэргэжлийн нэр</th>
                                <th>Суралцах хэлбэр</th>
                                <th>Курс</th>
                                <th>Боловсролын зэрэг</th>

                            </tr>
                        </thead>
                        <tbody>
                            {
                                datas && datas.length > 0 &&
                                datas.map((data, idx) => {
                                    return (
                                        <tr key={idx}>
                                            <td>{data?.name}</td>
                                            <td>{data?.profession?.code}</td>
                                            <td>{data?.profession?.name}</td>
                                            <td>{data?.learning_status?.learn_name}</td>
                                            <td>{data?.level}</td>
                                            <td>{data?.degree?.degree_name}</td>

                                        </tr>
                                    )
                                })
                            }
                        </tbody>
                    </Table>
                    <div className="text-end" >
                        <button className="btn btn-primary me-2 mt-1" onClick={() => { document.getElementById('groups').click() }} >
                            Хаах
                        </button>
                    </div>
                </UncontrolledCollapse>
            </div>
            }
        </Card>
    )
}
