
import React from "react"

import { Table } from 'reactstrap'

export function CTable({ data, title })
{
    return (
        <Table size='sm' bordered>
            <thead>
                <tr>
                    <th colSpan={15}>{title}</th>
                </tr>
            </thead>
            <thead>
                <tr style={{textAlign: "center"}} >
                    <th>№</th>
                    <th>Хичээлийн код</th>
                    <th>Хичээлийн нэр</th>
                    <th>Кредит</th>
                    <th>Оноо</th>
                    <th>Үнэлгээ</th>
                    <th>Багшийн код</th>
                    <th>Багшийн нэр</th>
                </tr>
            </thead>
            <tbody >
                {
                    data.season_info.map((value, index) => {
                        return (
                            <tr key={index} style={{textAlign: "center"}} >
                                <th scope="row">{index+1}</th>
                                <td>{value?.lesson_code}</td>
                                <td>{value?.lesson_name}</td>
                                <td>{value?.lesson_krt}</td>
                                <td>{value?.score}</td>
                                <td>{value?.assessment}</td>
                                <td>{value?.teacher_code}</td>
                                <td>{value?.teacher_full_name}</td>
                            </tr>

                        )
                    })
                }
                <tr style={{textAlign: "center"}} ><td></td>
                    <th colSpan={2}>Нийт</th>
                    <th colSpan={1}>{data.total.kredit}</th>
                    <th colSpan={1}>{data.total.onoo}</th>
                    <th style={{textAlign: "right"}} colSpan={3}>Улирлын голч дүн: {data.total.gpa}</th>
                </tr>
            </tbody>
        </Table>
    )
}
