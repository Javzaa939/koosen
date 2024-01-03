
import React, { useEffect, useState } from "react"

import { Row } from 'reactstrap'
import { useLocation } from 'react-router-dom';

import useApi from "@hooks/useApi"
import useLoader from '@hooks/useLoader';

// ** Styles
import './style.scss'

export default function AmountDetails()
{
    const AMOUNT_DETAILS_TYPE = 'def3'

    const location = useLocation()
    const studentId = location?.state?.studentId
    const mdata = location.state?.data
    const seasons = location.state?.data?.scoreregister

    const total_data = mdata?.all_total[0]?.all_total

    // State
    const datas = location.state?.def
    // const [ datas, setDatas ] = useState([])
    const [ listArr, setListArr ] = useState([])

    // Loader
    const { Loader, isLoading, fetchData } = useLoader({isFullScreen: false})

    // Api
    // const signatureApi = useApi().signature
    // const studentApi = useApi().student

    // function getAllData()
    // {
    //     if (studentId)
    //     {
    //         Promise.all([
    //             fetchData(signatureApi.get(1)),
    //             fetchData(studentApi.getDefinitionStudent(AMOUNT_DETAILS_TYPE, studentId)),
    //         ]).then((values) => {
    //             setListArr(values[0]?.data),
    //             setDatas(values[1]?.data)
    //         })
    //     }
    // }

    // энэ бол бат ажиллана
    function imageLoaded()
    {
        Object.keys(datas).length > 0 && setTimeout(() => window.print(), 1000)
    }

    useEffect(
        () =>
        {
            // getAllData();

            window.onafterprint = function()
            {
                window.history.go(-1);
            }
        },
        []
    )


    /** 1 => 01 болгох Format */
    const zeroFill = n => {
        return ('0' + n).slice(-2);
    }

    return (
        <div className='fontchange ps-1' >
            {
                studentId
                ?
                <>
                    {isLoading && Loader}
                    <div className='d-flex flex-column justify-content-evenly align-items-center w-100 mt-2' style={{ fontSize: '12px' }} >
                        <img className="fallback-logo" width={100} height={100} src={`${process.env.REACT_APP_MUIS_HR_MEDIA_URL}${datas?.school?.logo_url}`} alt="logo" onLoad={imageLoaded} />
                        {/* <img className="fallback-logo" width={100} height={100} src={`http://hr.mnun.edu.mn/media/orgs/logo/MNU-Logo_1.png`} alt="logo" onLoad={() => {imageLoaded()}} /> */}
                        <div className="d-flex flex-column text-center fw-bolder">
                            <span className='mt-1'>
                                {datas?.school?.name.toUpperCase()}
                            </span>
                            <span style={{ marginTop: '6px' }}>{datas?.school?.name_eng.toUpperCase()}</span>
                        </div>
                    </div>
                    <Row className="pb-2 ps-3 pe-2 pt-1" style={{ fontSize: '12px' }} >
                    <div style={{ borderBottom: '1px solid gray' }} />
                        {/* <p>Огноо: {new Date().getFullYear()}-{zeroFill(new Date().getMonth() + 1)}-{new Date().getDate()}</p> */}

                        <div className="text-center mt-1">
                            {datas?.school?.address} {datas?.school?.phone_number && `Утас: ${datas?.school?.phone_number}`} {datas?.school?.home_phone && `Факс: ${datas?.school?.home_phone}`}
                            <div>{datas?.school?.email && `E-mail: ${datas?.school?.email}`}</div>
                        </div>
                        <div className="text-center fst-italic">
                            _______________________________№_______________________________
                        </div>

                        <div className="text-center mt-2 fw-bolder fs-3">
                            Дүнгийн дэлгэрэнгүй тодорхойлолт
                        </div>

                        <div className="w-100 fw-bolder mt-1">
                            <div className="w-50 d-inline-block">
                                Овог: <span className="fw-normal">{datas?.student?.last_name}</span>
                            </div>
                            <div className="w-50 d-inline-block">
                                Оюутны код: <span className="fw-normal">{datas?.student?.code}</span>
                            </div>
                        </div>
                        <div className="w-100 fw-bolder mt-1" >
                            <div className="w-50 d-inline-block">
                                Нэр: <span className="fw-normal">{datas?.student?.first_name}</span>
                            </div>
                            <div className="w-50 d-inline-block">
                                Мэргэжил: <span className="fw-normal">{datas?.student?.group.profession.name}</span>
                            </div>
                        </div>
                        <div className="w-100 fw-bolder mt-1" style={{ marginBottom: '-50px' }} >
                            <div className="w-50 d-inline-block">
                                Элссэн огноо: <span className="fw-normal">{mdata?.all_total[0]?.student_info?.join_year}</span>
                            </div>
                            <div className="w-50 d-inline-block">
                                Боловсролын зэрэг: <span className="fw-normal">{mdata?.all_total[0]?.student_info?.degree_name}</span>
                            </div>
                        </div>
                        {/* Header */}
                        <table className={`fw-bolder mt-2 text-center border-0`} style={{ width: '98%', fontSize: '12px' }} >
                            <thead className="w-100">
                                <div className="border-0" style={{ height: '50px' }} ></div>
                                <tr>
                                    <td rowSpan={2} className="text-center border  border-dark" style={{ width: '3%' }}>№</td>
                                    <td colSpan={3} className="text-center border-end border-bottom border-dark" style={{ width: '65%' }}>Хичээлийн</td>
                                    <td rowSpan={2} className="text-center border-end border-dark" style={{ width: '8%' }}>70 оноо</td>
                                    <td rowSpan={2} className="text-center border-end border-dark" style={{ width: '8%' }}>30 оноо</td>
                                    <td rowSpan={2} className="text-center border-end border-dark" style={{ width: '8%' }}>Нийт оноо</td>
                                    <td rowSpan={2} className="text-center border border-dark" style={{ width: '8%' }}>Үнэлгээ</td>
                                </tr>
                                <tr>
                                    <td className="border-end border-dark" style={{ width: '12%' }} >Код</td>
                                    <td className="border-end border-dark" style={{ width: '48%' }} >Нэр</td>
                                    <td className="border-end border-dark" style={{ width: '5%' }} >Кр</td>
                                </tr>
                            </thead>
                            <tbody className="w-100">
                                {seasons.map((season, sidx) =>
                                    (
                                        <>
                                            <tr>
                                                <td className="border-dark" colSpan={8}>{season?.year_season}</td>
                                            </tr>
                                            {season.lesson_info.map((lesson, lidx) => (
                                                <>
                                                    <tr>
                                                        <td className="border-dark">{lidx + 1}</td>
                                                        <td className="border-dark">
                                                            {lesson?.lesson_code}
                                                        </td>
                                                        <td className="border-dark text-start ps-1">
                                                            {lesson?.lesson_name}
                                                        </td>
                                                        <td className="border-dark">
                                                            {lesson?.lesson_kr}
                                                        </td>
                                                        <td className="border-dark">
                                                            {lesson.status_num === 8 ? '' : lesson?.teach_score}
                                                        </td>
                                                        <td className="border-dark">
                                                            {lesson.status_num === 8 ? '' : lesson?.exam_score}
                                                        </td>
                                                        <td className="border-dark">
                                                            {lesson?.total_scores}
                                                        </td>
                                                        <td className="border-dark">
                                                            {lesson?.assessment}
                                                        </td>
                                                    </tr>
                                                </>
                                            ))}
                                            <tr>
                                                <td className="border-dark" colSpan={3}>Нийт хичээл: {mdata.lesson_count[sidx].less_count}</td>
                                                <td className="border-dark">{season?.total?.kr}</td>
                                                <td className="border-dark" colSpan={2}></td>
                                                <td className="border-dark">{season?.total?.onoo}</td>
                                                <td className="border-dark">{season?.total?.gpa}</td>
                                            </tr>
                                        </>
                                    )
                                )}
                                <tr>
                                    <td className='text-center border-dark' colSpan={4} style={{ fontStyle: 'italic' }}>
                                        Нийт кредит: {total_data?.total_kr} Дундаж дүн: {total_data?.total_onoo} Голч: {total_data?.total_gpa}
                                    </td>
                                    <td className='text-center border-dark' colSpan={4} style={{ fontStyle: 'italic' }}>
                                        {`[${mdata.asses_count.map((ass,aidx) => (ass?.assessment__assesment + ": " + ass?.asses_count))}]`}
                                    </td>
                                </tr>

                            </tbody>

                            {/* <tbody className="w-100 border">
                                {
                                    datas?.score_register?.map((val, idx) =>
                                    {
                                        return (
                                            <tr key={idx}>
                                                <td className="text-center border-end border-top border-dark" style={{ width: '3%' }} >{idx + 1}</td>
                                                <td className="border-end border-top border-dark" style={{ width: '12%' }}>{val?.lesson?.code}</td>
                                                <td className="border-end border-top border-dark" style={{ width: '48%' }}>{val?.lesson?.name}</td>
                                                <td className="text-center border-end border-top border-dark" style={{ width: '5%' }}>{val?.lesson?.kredit}</td>
                                                <td className="text-center border-end border-top border-dark" style={{ width: '8%' }}>{val?.teach_score || 0}</td>
                                                <td className="text-center border-end border-top border-dark" style={{ width: '8%' }}>{val?.exam_score || 0}</td>
                                                <td className="text-center border-end border-top border-dark" style={{ width: '8%' }}>{(val?.exam_score || 0) + (val?.teach_score || 0)}</td>
                                                <td className="text-center border-top border-dark" style={{ width: '8%' }}>{val?.assessment}</td>
                                            </tr>
                                        )
                                    })
                                }
                            </tbody> */}
                            <tfoot>
                                <div style={{ height: '50px' }}></div>
                            </tfoot>
                        </table>

                        <div className="text-center mt-3 text-uppercase">
                            {
                                listArr?.map((val, idx) =>
                                {
                                    return (
                                        <p key={idx} >
                                            {val?.position_name}: ........................................... /{val?.last_name}&#160;{val?.first_name}/
                                        </p>
                                    )
                                })
                            }
                        </div>
                    </Row>
                </>
                :
                <p>Уучлаарай мэдээлэл олдсонгүй</p>
            }
        </div>
    )
}
