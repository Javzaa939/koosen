
import React, { useState } from "react"

import { UncontrolledCollapse, Card, Table } from 'reactstrap';

export default function Tutor({ datas })
{
    return (
        <Card className='mt-1 m-0'>

            {datas && datas.length > 0 &&

            <div className='added-cards border'>
                <div className='cardMaster rounded p-1 fw-bolder underline text-decoration-underline' role="button" id="tutor">
                    Багшийн туслах оюутан
                </div>
                <UncontrolledCollapse toggler="#tutor" className="m-2">
                    <Table bordered responsive className='table'>
                        <thead>
                            <tr>
                                <th>Хичээлийн код</th>
                                <th>Хичээлийн нэр</th>
                                <th>Оюутны код</th>
                                <th>Оюутны нэр</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                datas && datas.length > 0 &&
                                datas.map((data, idx) => {
                                    return (
                                        <tr key={idx}>
                                            <td>{data?.lesson?.code}</td>
                                            <td>{data?.lesson?.name}</td>
                                            <td>{data?.student?.code}</td>
                                            <td>{data?.student?.full_name}</td>
                                        </tr>
                                    )
                                })
                            }
                        </tbody>
                    </Table>
                    <div className="text-end" >
                        <button className="btn btn-primary me-2 mt-1" onClick={() => { document.getElementById('tutor').click() }} >
                            Хаах
                        </button>
                    </div>
                </UncontrolledCollapse>
            </div>
            }
        </Card>
    )
}
