
import React, { useEffect, useState } from "react"

import { useParams } from 'react-router-dom';
import { Card, Row, Col, Form } from 'reactstrap';
import { ChevronsLeft } from 'react-feather'

import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';
import { useTranslation } from "react-i18next";
import { useNavigate } from 'react-router-dom'

import LessonSchedule from "./LessonSchedule";
import BoardingHouse from "./DormitoryInfo"
import Institute from "./Institute"
import Tutor from './TutorInfo'
import SelfGroup from './SelfGroup'
import TeachLesson from './TeachLesson'

export default function Info()
{
    const { t } = useTranslation()

    const navigation = useNavigate()

    const { teacher_id } = useParams()

    const teacherApi = useApi().hrms.teacher

    const [ datas, setDatas ] = useState({})

    /** Loader */
    const { Loader, isLoading, fetchData } = useLoader({ isFullScreen: false });

    async function getTeacherDetail()
    {
        const { success, data } = await fetchData(teacherApi.getTeacherOne(teacher_id))

        if (success, data)
        {
            setDatas(data)

        }
    }

    useEffect(
        () =>
        {
            getTeacherDetail()
        },
        []
    )
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
                    <div role="button" style={{fontSize: "15px"}} onClick={() => navigation('/reference/teachers/')}>
                        <ChevronsLeft/>{t('Буцах')}
                    </div>
                        <h4 className='text-center mb-1'>Ерөнхий мэдээлэл</h4>

                        <div className="border p-1 mb-2 mt-1 m-auto text-center" >
                            <img src={datas?.mainInfo?.image} alt="" width={100} height={100} />{" "}
                            <p className="p-0 mt-1 mb-0">{datas?.mainInfo?.last_name} {datas?.mainInfo?.first_name} <span className="fw-bolder">({datas?.mainInfo?.code})</span></p>
                        </div>
                        <hr />
                        <Row tag={Form} md={12} className="gy-1">
                            <Col md={6}>
                                <Row tag="dl" className="mb-0">
                                    <Col tag="dt" sm="4" className="fw-bolder mb-1" >
                                        Салбар сургууль:
                                        </Col>
                                    <Col tag="dd" sm="8" className="mb-1">{datas?.mainInfo?.sub_org?.name || 'хоосон'}</Col>
                                    <Col tag="dt" sm="4" className="fw-bolder mb-1" >
                                        Тэнхим:
                                    </Col>
                                    <Col tag="dd" sm="8" className="mb-1">{datas?.mainInfo?.salbar?.name || 'хоосон'}</Col>
                                    <Col tag="dt" sm="4" className="fw-bolder mb-1" >
                                        Албан тушаал:
                                    </Col>
                                    <Col tag="dd" sm="8" className="mb-1" >{datas?.mainInfo?.org_position || 'хоосон'}</Col>
                                    <Col tag="dt" sm="4" className="fw-bolder mb-1" >
                                        Утасны дугаар:
                                    </Col>
                                    <Col tag="dd" sm="8" className="mb-1" >{datas?.mainInfo?.phone_number || 'хоосон'}</Col>
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
                                    <Col tag="dd" sm="8" className="mb-1" >{datas?.mainInfo?.register || 'хоосон'}</Col>
                                    <Col tag="dt" sm="4" className="fw-bolder mb-1" >
                                        Төрсөн он сар өдөр:
                                    </Col>
                                    <Col tag="dd" sm="8" className="mb-1" >{datas?.mainInfo?.birthday || 'хоосон'}</Col>
                                    <Col tag="dt" sm="4" className="fw-bolder mb-1" >
                                        Хүйс:
                                    </Col>
                                    <Col tag="dd" sm="8" className="mb-1" >{datas?.mainInfo?.gender || 'хоосон'}</Col>
                                    <Col tag="dt" sm="4" className="fw-bolder mb-1" >
                                        Хаягийн мэдээлэл:
                                    </Col>
                                    <Col tag="dd" sm="8" className="mb-1">{datas?.mainInfo?.address || 'хоосон'}</Col>
                                </Row>
                            </Col>
                        </Row>
                        {/* <hr /> */}

                        <Institute  datas={datas} />
                        <LessonSchedule datas={datas?.timetableData}  />
                        <TeachLesson datas={datas?.lessonTeachData} />
                        <SelfGroup datas={datas?.groupData}/>
                        <BoardingHouse datas={datas?.dormitoryData} />
                        <Tutor datas={datas?.requestTutorData}/>
                    </Card>
                    :
                    <></>
            }
        </>
    )
}
