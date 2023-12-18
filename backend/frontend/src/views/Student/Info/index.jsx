
import React, { useEffect, useState } from "react"

import { useParams } from 'react-router-dom';
import { Card, Row, Col, Form } from 'reactstrap';

import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';

import LessonSchedule from "./LessonSchedule";
import ScoreInformation from "./ScoreInformation";
import BoardingHouse from "./BoardingHouse";
import FamilyInformation from "./FamilyInformation";
import PaymentInformation from "./PaymentInformation";
import Scholarship from "./Scholarship";

export default function Info()
{
    const { studentId } = useParams()

    const studentApi = useApi().student

    const [ datas, setDatas ] = useState({})

    /** Loader */
    const { Loader, isLoading, fetchData } = useLoader({ isFullScreen: true });

    useEffect(
        () =>
        {
            getStudentDetail()
        },
        []
    )

    async function getStudentDetail()
    {
        const { success, data } = await fetchData(studentApi.getStudentOne(studentId))

        if (success, data)
        {
            setDatas(data)
        }
    }

    return (
        <>
            {
                isLoading
                ?
                Loader
                :
                    Object.keys(datas).length !== 0
                    ?
                    <Card className="p-2" >
                        <h4 className='text-center mb-1'>Ерөнхий мэдээлэл</h4>

                        <div className="border p-1 mb-2 mt-1 m-auto text-center" >
                            <img src={datas?.mainInfo?.image} alt="" width={100} height={100} />{" "}
                            <p className="p-0 mt-1 mb-0">{datas?.mainInfo?.last_name} {datas?.mainInfo?.first_name} <span className="fw-bolder">({datas?.mainInfo?.code})</span></p>
                        </div>
                        <hr />
                        <p>Мэдээлэл</p>
                        <Row tag={Form} md={12} className="gy-1">
                            <Col md={6}>
                                <Row tag="dl" className="mb-0">
                                    <Col tag="dt" sm="4" className="fw-bolder mb-1" >
                                        Хөтөлбөрийн баг:
                                    </Col>
                                    <Col tag="dd" sm="8" className="mb-1">{datas?.mainInfo?.department?.name || 'хоосон'}</Col>
                                    <Col tag="dt" sm="4" className="fw-bolder mb-1" >
                                        Анги:
                                    </Col>
                                    <Col tag="dd" sm="8" className="mb-1">{datas?.mainInfo?.group?.name || 'хоосон'}</Col>
                                    <Col tag="dt" sm="4" className="fw-bolder mb-1" >
                                        Хувийн оноо:
                                    </Col>
                                    <Col tag="dd" sm="8" className="mb-1" >{datas?.mainInfo?.private_score || 'хоосон'}</Col>
                                    <Col tag="dt" sm="4" className="fw-bolder mb-1" >
                                        Утасны дугаар:
                                    </Col>
                                    <Col tag="dd" sm="8" className="mb-1" >{datas?.mainInfo?.phone || 'хоосон'}</Col>
                                    <Col tag="dt" sm="4" className="fw-bolder mb-1" >
                                        Цахим шуудан:
                                    </Col>
                                    <Col tag="dd" sm="8" className="mb-1" >{datas?.mainInfo?.email || 'хоосон'}</Col>
                                </Row>
                            </Col>
                            <Col md={6}>
                                <Row tag="dl" className="mb-0">
                                    <Col tag="dt" sm="4" className="fw-bolder mb-1" >
                                        Регистрийн дугаар:
                                    </Col>
                                    <Col tag="dd" sm="8" className="mb-1" >{datas?.mainInfo?.register_num || 'хоосон'}</Col>
                                    <Col tag="dt" sm="4" className="fw-bolder mb-1" >
                                        Төрсөн он сар өдөр:
                                    </Col>
                                    <Col tag="dd" sm="8" className="mb-1" >{datas?.mainInfo?.birth_date || 'хоосон'}</Col>
                                    <Col tag="dt" sm="4" className="fw-bolder mb-1" >
                                        Хүйс:
                                    </Col>
                                    <Col tag="dd" sm="8" className="mb-1" >{datas?.mainInfo?.gender || 'хоосон'}</Col>
                                    <Col tag="dt" sm="4" className="fw-bolder mb-1" >
                                        Цуглуулсан кр:
                                    </Col>
                                    <Col tag="dd" sm="8" className="mb-1" >{datas?.student_score_mini_detail?.total_kr || 'хоосон'}</Col>
                                    <Col tag="dt" sm="4" className="fw-bolder mb-1" >
                                        Голч дүн:
                                    </Col>
                                    <Col tag="dd" sm="8" className="mb-1" >{datas?.student_score_mini_detail?.score_obj?.gpa || 'хоосон'}</Col>
                                </Row>
                            </Col>
                        </Row>
                        <hr />

                        <p>Оршин суугаа хаяг</p>
                        <Row tag={Form} md={12} className="gy-1">
                            <Col md={6}>
                                <Row tag="dl" className="mb-0">
                                    <Col tag="dt" sm="4" className="fw-bolder mb-1" >
                                        Аймаг/хот:
                                    </Col>
                                    <Col tag="dd" sm="8" className="mb-1">{datas?.studentAddressData?.lived_unit1?.name || 'хоосон'}</Col>
                                    <Col tag="dt" sm="4" className="fw-bolder mb-1" >
                                        Баг/хороо:
                                    </Col>
                                    <Col tag="dd" sm="8" className="mb-1">{datas?.studentAddressData?.lived_unit3?.name || 'хоосон'}</Col>
                                    <Col tag="dt" sm="4" className="fw-bolder mb-1" >
                                        Бусад:
                                    </Col>
                                    <Col tag="dd" sm="8" className="mb-1" >{datas?.studentAddressData?.lived_other || 'хоосон'}</Col>
                                </Row>
                            </Col>
                            <Col md={6}>
                                <Row tag="dl" className="mb-0">
                                    <Col tag="dt" sm="4" className="fw-bolder mb-1" >
                                        Сум/дүүрэг:
                                    </Col>
                                    <Col tag="dd" sm="8" className="mb-1" >{datas?.studentAddressData?.lived_unit2?.name || 'хоосон'}</Col>
                                    <Col tag="dt" sm="4" className="fw-bolder mb-1" >
                                        Тоот:
                                    </Col>
                                    <Col tag="dd" sm="8" className="mb-1" >{datas?.studentAddressData?.lived_toot || 'хоосон'}</Col>
                                </Row>
                            </Col>
                        </Row>
                        <hr />

                        <LessonSchedule datas={datas.timetableData}  />
                        <ScoreInformation datas={datas.scoreRegisterData} />
                        <PaymentInformation datas={datas?.paymentEstimateData} />
                        <Scholarship datas={datas?.stipentStudentData} />
                        <BoardingHouse datas={datas?.dormitoryData} />
                        <FamilyInformation datas={datas?.familyData} />

                    </Card>
                    :
                    <></>
            }
        </>
    )
}
