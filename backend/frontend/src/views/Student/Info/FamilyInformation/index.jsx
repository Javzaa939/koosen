
import React from "react"

import { Card, UncontrolledCollapse, Table } from "reactstrap"
import { useTranslation } from 'react-i18next'

export default function FamilyInformation({ datas })
{
    const { t } = useTranslation()

    return (
       <Card className='mt-1 m-0'>
            <div className='added-cards border'>
                <div className='cardMaster rounded p-1 fw-bolder underline text-decoration-underline' role="button" id="scoreFamilyInfo">
                    Гэр бүлийн мэдээлэл
                </div>

                <UncontrolledCollapse toggler="#scoreFamilyInfo" className="m-2">
                <hr />

                    <div className='added-cards'>
                        <div className='cardMaster rounded pb-1 pt-2' >
                            <h5 className='text-center pb-50'>Гэр бүлийн мэдээлэл</h5>
                        </div>
                    </div>

                    <Table bordered responsive className='table'>
                        <thead>
                            <tr>
                                <th>Оюутын юу болох</th>
                                <th>Эцэг/эхийн нэр</th>
                                <th>Өөрийн нэр</th>
                                <th>Утасны дугаар</th>
                                <th>Регистрийн дугаар</th>
                                <th>Ажил эрхлэлт</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                datas && datas.length > 0 &&
                                datas.map((data, idx) => {
                                    return (
                                        <tr key={idx}>
                                            <td>{data?.member}</td>
                                            <td>{data?.last_name}</td>
                                            <td>{data?.first_name}</td>
                                            <td>{data?.phone}</td>
                                            <td>{data?.register_num}</td>
                                            <td>{data?.employment}</td>
                                        </tr>
                                    )
                                })
                            }
                        </tbody>
                    </Table>

                    <div className="text-end" >
                        <button className="btn btn-primary me-2 mt-1" onClick={() => { document.getElementById('scoreFamilyInfo').click() }} >
                            Хаах
                        </button>
                    </div>

                </UncontrolledCollapse>

            </div>
        </Card>
    )
}
