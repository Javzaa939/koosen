
import React, { useEffect, useState } from "react"

import { Row, Col, Table } from 'reactstrap'
import { useLocation, useNavigate } from 'react-router-dom';

// ** Styles
import logo from "@src/assets/images/logo/dxis_logo.png"
import '@styles/base/pages/app-invoice-print.scss'

export default function Print()
{
    const location = useLocation();
    const navigate = useNavigate()
    const data = location.state

    const groupLength = data.group.length
    var count = 0
    var countLessonType = 0
    var countLessonTypeCount = 0

    for (let lesson of data.lesson)
    {
        countLessonTypeCount += lesson.count
    }

    useEffect(
        () =>
        {
            if (Object.keys(data).length != 0)
            {
                setTimeout(() => window.print(), 1000)
            }
        },
        [data]
    )

    useEffect(
        () =>
        {
            window.onafterprint = function()
            {
                navigate(-1)
            }
        },
        []
    )

    return (
        <>
            {
                data !== null
                &&
                <div className='invoice-print'>
                    <div className='d-flex justify-content-center align-items-center w-100'>
                        <img className="fallback-logo ms-1" width={50} height={50} src={logo} alt="logo" />
                        <div className="d-flex flex-column text-center ms-2">
                            <span className='text-primary ms-1 fw-bolder'>
                                Дотоод Хэргийн Их Сургууль
                            </span>
                            <span className="fw-bolder">СУРГАЛТЫН ТӨЛӨВЛӨГӨӨ</span>
                        </div>
                    </div>
                    <Row className='px-2 mt-1'>
                        <Col className="fw-bolder" style={{ fontSize: '8px' }} >
                            <span className="m-0 d-inline-block w-100">Мэргэжлийн ерөнхий чиглэл: Боловсрол</span>
                            <span className="m-0 d-inline-block w-100">Төрөлжсөн чиглэл: {data?.dep_name}</span>
                            <span className="m-0 d-inline-block w-100">Нарийвчилсан чиглэл: {data?.name}</span>
                            <span className="m-0 d-inline-block w-100">Хөтөлбөрийн нэр: {data?.name}</span>
                            <span className="m-0 d-inline-block w-100">Суралцах хэлбэр: Өдөр</span>
                            <span className="m-0 d-inline-block w-100">Суралцах хугацаа: 4 жил</span>
                        </Col>

                        <div className={`d-flex px-0 mt-1`} style={{ width: '100%', fontSize: '8px' }} >
                            <div className="text-center border border-end-0 position-relative" style={{ width: '2%' }} >
                                <p className={`${groupLength != 0 && 'position-absolute top-50 start-50 translate-middle'} w-100 fw-bolder`}>{"№"}</p>
                            </div>
                            <div className="text-center border border-end-0 position-relative" style={{ width: '8%' }} >
                                <p className={`${groupLength != 0 && 'position-absolute top-50 start-50 translate-middle'} w-100 fw-bolder`}>{"Индекс"}</p>
                            </div>
                            <div className="text-center border border-end-0 position-relative" style={{ width: '25%' }} >
                                <p className={`${groupLength != 0 && 'position-absolute top-50 start-50 translate-middle'} w-100 fw-bolder`}>{"Хичээлийн нэр"}</p>
                            </div>
                            <div className="text-center border border-end-0 position-relative" style={{ width: '6%' }} >
                                <p className={`${groupLength != 0 && 'position-absolute top-50 start-50 translate-middle'} w-100 fw-bolder`}>{"Багц цаг"}</p>
                            </div>
                            <div className="text-center border position-relative" style={{ width: '6%' }} >
                                <p className={`${groupLength != 0 && 'position-absolute top-50 start-50 translate-middle'} w-100 fw-bolder`}>{"Улирал"}</p>
                            </div>

                            {
                                data.group.map((val, idx) =>
                                {
                                    return (
                                        <div key={idx} className={`text-center border ${groupLength-1 != idx && 'border-end-0'} ${idx == 0 && 'border-start-0'} `} style={{ width: `${53 / groupLength}%`, padding: '0px 1px' }} >
                                            <span className="w-100 fw-bolder">{val?.name}</span>
                                        </div>
                                    )
                                })
                            }

                        </div>

                        {
                            data.lesson.map((val, idx) => {
                                return (
                                    <div key={idx} className="w-100 p-0">
                                        <div className={`d-flex px-0`} style={{ width: '100%', fontSize: '8px' }} >
                                            <div className="text-center border border-end-0 border-top-0" style={{ width: '35%' }} >
                                                <span className="w-100 fw-bolder m-0">{val.level}</span>
                                            </div>
                                            <div className="text-center border border-end-0 border-top-0" style={{ width: '6%' }} >
                                                <span className="w-100 fw-bolder m-0">{val?.count}</span>
                                            </div>
                                            <div className="text-center border border-top-0" style={{ width: '6%' }} >
                                                <span className="w-100 fw-bolder m-0">{''}</span>
                                            </div>
                                            {
                                                data.group.map((val, idx) =>
                                                {
                                                    return (
                                                        <div key={idx} className={`text-center border border-top-0 ${groupLength-1 != idx && 'border-end-0'} ${idx == 0 && 'border-start-0'}`} style={{ width: `${53 / groupLength}%`, padding: '0px 1px' }} >
                                                        </div>
                                                    )
                                                })
                                            }
                                        </div>
                                        {
                                            val.data.map((val, idx) =>
                                            {
                                                return (
                                                    <div key={idx} className="w-100 p-0">
                                                        <div  className={`d-flex px-0`} style={{ width: '100%', fontSize: '8px' }} >
                                                            <div className="text-center border border-end-0 border-top-0" style={{ width: '35%' }} >
                                                                <span className="w-100 fw-bolder m-0">{val.type}</span>
                                                            </div>
                                                            <div className="text-center border border-end-0 border-top-0" style={{ width: '6%' }} >
                                                                <span className="w-100 fw-bolder m-0">{val?.count}</span>
                                                            </div>
                                                            <div className="text-center border border-top-0" style={{ width: '6%' }} >
                                                                <span className="w-100 fw-bolder m-0">{''}</span>
                                                            </div>
                                                            {
                                                                data.group.map((val, idx) =>
                                                                {
                                                                    return (
                                                                        <div key={idx} className={`text-center border border-top-0 ${groupLength-1 != idx && 'border-end-0'} ${idx == 0 && 'border-start-0'}`} style={{ width: `${53 / groupLength}%`, padding: '0px 1px' }} >
                                                                        </div>
                                                                    )
                                                                })
                                                            }
                                                        </div>

                                                        {
                                                            val.lessons.map((val, idx) =>
                                                            {
                                                                count++
                                                                return (
                                                                    <div key={idx} className="w-100 p-0">
                                                                        <div key={idx} className={`d-flex px-0`} style={{ width: '100%', fontSize: '8px' }} >
                                                                            <div className="text-center border border-end-0 border-top-0 position-relative" style={{ width: '2%' }} >
                                                                                <span className="w-100">{count}</span>
                                                                            </div>
                                                                            <div className="text-left border border-end-0 border-top-0 position-relative" style={{ width: '8%', paddingLeft: '1px' }} >
                                                                                <span className="w-100">{val?.lesson?.code}</span>
                                                                            </div>
                                                                            <div className="text-left border border-end-0 border-top-0 position-relative" style={{ width: '25%', paddingLeft: '1px' }} >
                                                                                <span className="w-100">{val?.lesson?.name}</span>
                                                                            </div>
                                                                            <div className="text-center border border-end-0 border-top-0 position-relative" style={{ width: '6%' }} >
                                                                                <span className="w-100">{val?.lesson?.kredit}</span>
                                                                            </div>
                                                                            <div className="text-center border border-top-0 position-relative" style={{ width: '6%' }} >
                                                                                <span className="w-100">{val?.season}</span>
                                                                            </div>
                                                                            {
                                                                                val?.lesson?.student_study.map((val, idx) =>
                                                                                {
                                                                                    let value = ''
                                                                                    let backgroundColor = ''

                                                                                    switch (val?.value)
                                                                                    {
                                                                                        case 1:
                                                                                            value = ''
                                                                                            backgroundColor = ''
                                                                                            break;
                                                                                        case 2:
                                                                                            value = 'Үзсэн'
                                                                                            backgroundColor = 'bg-success'
                                                                                            break;
                                                                                        case 3:
                                                                                            value = 'Үзэж байгаа'
                                                                                            backgroundColor = 'bg-warning'
                                                                                            break;
                                                                                        default:
                                                                                            break;
                                                                                    }
                                                                                    return (
                                                                                        <div key={idx} className={`text-center border border-top-0 ${groupLength-1 != idx && 'border-end-0'} ${idx == 0 && 'border-start-0'} ${backgroundColor}`} style={{ width: `${53 / groupLength}%`, padding: '0px 1px' }} >
                                                                                            {value}
                                                                                        </div>
                                                                                    )
                                                                                })
                                                                            }
                                                                        </div>
                                                                    </div>
                                                                )
                                                            })
                                                        }

                                                    </div>
                                                )
                                            })
                                        }

                                    </div>
                                )
                            })
                        }

                        <div className={`d-flex px-0 mt-1`} style={{ width: '100%', fontSize: '8px' }} >
                            <div className="text-center border border-end-0" style={{ width: '10%' }} >
                                <span className="w-100 fw-bolder">{"№"}</span>
                            </div>
                            <div className="text-center border border-end-0" style={{ width: '25%' }} >
                                <span className="w-100 fw-bolder">{"Хичээлийн нэр"}</span>
                            </div>
                            <div className="text-center border border-end-0" style={{ width: '6%' }} >
                                <span className="w-100 fw-bolder">{"Багц цаг"}</span>
                            </div>
                            <div className="text-center border" style={{ width: '6%' }} >
                                <span className="w-100 fw-bolder">{"Улирал"}</span>
                            </div>
                        </div>

                        {
                            data?.lesson.map((val, idx) =>
                            {
                                countLessonType++
                                return (
                                    <div key={idx} className="w-100 p-0">
                                        <div className={`d-flex px-0`} style={{ width: '100%', fontSize: '8px' }} >
                                            <div className="text-center border border-end-0 border-top-0" style={{ width: '10%' }} >
                                                <span className="w-100">{countLessonType}</span>
                                            </div>
                                            <div className="text-center border border-end-0 border-top-0" style={{ width: '25%' }} >
                                                <span className="w-100">{val?.level}</span>
                                            </div>
                                            <div className="text-center border border-end-0 border-top-0" style={{ width: '6%' }} >
                                                <span className="w-100">{val?.count}</span>
                                            </div>
                                            <div className="text-center border border-top-0" style={{ width: '6%' }} >
                                                <span className="w-100">{`${parseInt((val?.count * 100) / countLessonTypeCount)}%`}</span>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })
                        }

                        <div className={`d-flex px-0`} style={{ width: '100%', fontSize: '8px' }} >
                            <div className="text-center border border-end-0 border-top-0" style={{ width: '10%' }} >
                                <span className="w-100 fw-bolder">{""}</span>
                            </div>
                            <div className="text-center border border-end-0 border-top-0" style={{ width: '25%' }} >
                                <span className="w-100 fw-bolder">{"Нийт кредит"}</span>
                            </div>
                            <div className="text-center border border-end-0 border-top-0" style={{ width: '6%' }} >
                                <span className="w-100 fw-bolder">{countLessonTypeCount}</span>
                            </div>
                            <div className="text-center border border-top-0" style={{ width: '6%' }} >
                                <span className="w-100 fw-bolder">{"100%"}</span>
                            </div>
                        </div>

                        <Col className="fw-bolder mt-1 mb-1" style={{ fontSize: '8px' }} >
                        <span className="m-0 d-inline-block w-100">Боловсруулсан: Тэнхимийн ахлагч ............................................................. </span>
                        <span className="m-0 d-inline-block w-100">Баталсан: Салбар сургуулийн захирал ............................................................. </span>
                        <span className="m-0 d-inline-block w-100">Хөтөлбөрийн хорооны нарийн бичгийн дарга .............................................................</span>
                        </Col>

                    </Row>
                </div>
            }
        </>
    )
}
