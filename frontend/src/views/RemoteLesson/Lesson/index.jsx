import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import useApi from '@hooks/useApi'
import useLoader from '@hooks/useLoader'
import { Badge, Card, CardBody, Col, Row } from 'reactstrap'
import { ChevronsLeft } from 'react-feather'
import { CiUser } from 'react-icons/ci'
import { PiCertificate, PiExam } from 'react-icons/pi'

function Lesson() {

    const { id } = useParams()

    const [datas, setDatas] = useState()

    console.log(datas,'datas')

    const { isLoading, fetchData, Loader } = useLoader({isSmall: true});
    const remoteApi = useApi().remote
    async function getDatas() {
        const { success, data } = await fetchData(remoteApi.getOne(id));
        if (success) {
            setDatas(data)
        }
    }

    useEffect(() => {
        getDatas();
    }, []);

    return (
        <div>
            <a href='/remote_lesson' className='d-flex align-items-center mb-1 fw-bold text-decoration-underline'><ChevronsLeft size={18} strokeWidth={2.5}/> Буцах</a>
            <Row className=''>
                <Col>
                    <Card className='bg-white w-100'>
                        <CardBody>
                            <div>
                                <h5 className='fw-bold'>Сургалтын мэдээлэл</h5>
                                <h2 className=''>{datas?.title}</h2>
                            </div>
                            <div>
                                <div className='d-flex justify-content-between'>
                                    <div>
                                        <div>
                                            <span>Эхлэх хугацаа: {datas?.start_date && new Date(datas?.start_date)?.toISOString()?.split('T')[0]}</span>
                                        </div>
                                        <div>
                                            <span>Дуусах хугацаа: {datas?.end_date && new Date(datas?.end_date)?.toISOString()?.split('T')[0]}</span>
                                        </div>
                                    </div>
                                    <div className='d-flex gap-25'>
                                        <Badge color='primary' pill title='Оюутны тоо' className='d-flex align-items-center gap-25'>
                                            <CiUser style={{ width: "12px", height: "12px" }}/> {datas?.students?.length || 0}
                                        </Badge>
                                        <Badge color={datas?.is_end_exam ? `light-success` : 'light-secondary'} pill title={datas?.is_end_exam ? 'Төгсөлтийн шалгалттай' : 'Төгсөлтийн шалгалтгүй'} className='d-flex align-items-center gap-25'>
                                            <PiExam style={{ width: "24px", height: "24px" }}/>
                                        </Badge>
                                        <Badge color={datas?.is_certificate ? `light-danger` : 'light-secondary'} pill title={datas?.is_certificate ? 'Сертификаттай' : 'Сертификатгүй'} className='d-flex align-items-center gap-25'>
                                            <PiCertificate style={{ width: "24px", height: "24px" }}/>
                                        </Badge>
                                    </div>
                                </div>
                                <img
                                    src={datas?.image}
                                    alt='image'
                                    className='mt-1'
                                    style={{ height: '300px', width: '100%', objectFit: 'cover', borderRadius: 5 }}
                                />
                            </div>
                        </CardBody>
                    </Card>
                </Col>
                <Col>
                    <Card className='bg-white w-100'>
                        <CardBody>
                            <div>
                                <h5 className='fw-bold'>Багшийн мэдээлэл</h5>
                            </div>
                        </CardBody>
                    </Card>
                </Col>
            </Row>
            <div>
                students
            </div>
        </div>
    )
}

export default Lesson
