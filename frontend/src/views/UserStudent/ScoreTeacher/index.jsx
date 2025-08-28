import React, { useEffect, useState } from 'react'
import { Card, CardBody, CardHeader, Row, Col } from 'reactstrap'
import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader'
import CTable from './Table';

export default function ScoreTeacher() {

    const { fetchData } = useLoader({})
    const scoreApi = useApi().userStudent.student.score
    const [datas, setDatas] = useState([])

    async function getDatas() {
        const { success, data } = await fetchData(scoreApi.getTeacher())
        if (success) {
            setDatas(data)
        }
    }

    useEffect(
        () =>
        {
            getDatas()
        },
        []
    )

    return (
        <Card>
            <CardHeader tag={'h4'}>Явцын дүнгийн мэдээлэл</CardHeader>
            <CardBody>
                {
                    datas?.length > 0
                    &&
                    <Row>
                        <Col className="mb-2" md={6}>
                            {datas.map((data, idx) => (
                                <div className='mb-3' key={idx}>
                                    <CTable
                                        data={data}
                                        title={data?.lesson_code + ' ' + data?.lesson_name}
                                    />
                                </div>
                            ))}
                        </Col>
                    </Row>
                }
            </CardBody>
        </Card>
    )
}
