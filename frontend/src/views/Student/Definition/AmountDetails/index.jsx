
import React, { Fragment, useEffect, useState,useContext } from "react"

import { Row, Col } from 'reactstrap'
import { useLocation } from 'react-router-dom';

import useApi from "@hooks/useApi"
import useLoader from '@hooks/useLoader';
import SchoolContext from '@context/SchoolContext'

// ** Styles
import './style.scss'

export default function AmountDetails()
{
    const location = useLocation()
    const studentId = location?.state?.data?.studentId
    const mdata = location?.state?.data?.data
    const seasons = location.state?.data?.data?.scoreregister
    const  listArr = location.state?.signatureData
    const total_data = mdata?.all_total[0]?.all_total
    const { parentschoolName} = useContext(SchoolContext)

    var chanars = []

    // State
    const datas = location.state?.data?.dep

    // Loader
    const { Loader, isLoading, fetchData } = useLoader({isFullScreen: true})
    // Api
    // const studentApi = useApi().student

    // function getAllData()
    // {
    //     if (studentId)
    //     {
    //         Promise.all([
    //             fetchData(studentApi.getDefinitionStudent(AMOUNT_DETAILS_TYPE, studentId)),
    //         ]).then((values) => {
    //         })
    //     }
    // }


    useEffect(
        () =>
        {
            // if (datas, listArr.length != 0)
            // {
            //     setTimeout(() =>
            //         window.print(),
            //         document.title = `${datas?.student?.code + ' ' + datas?.student?.full_name}`,
            //         1000
            //     )
            // }
        },
        [datas, listArr]
    )

    useEffect(
        () =>
        {
            // getAllData();

            // window.onafterprint = function()
            // {
            //     window.history.go(-1);
            // }
        },
        []
    )


    /** 1 => 01 болгох Format */
    const zeroFill = n => {
        return ('0' + n).slice(-2);
    }

    /**
     * Чанар олж буй функц
     */
    function chanarHandler(kr, gpa) {    var chanars = []

        var chanar = kr * gpa;
        // Round to one decimal place
        var roundedChanar = Math.round(chanar * 10) / 10;
        return roundedChanar;
    }

    /**
     * Улиралын чанарийг нэгтгэж буй функц
     */
    function totalChanarHandler(chanars) {
        var total_chanar = chanars.reduce((accumulator, currentValue) => accumulator + currentValue, 0)
        // Round to one decimal place
        var roundedChanar = Math.round(total_chanar * 10) / 10;
        return roundedChanar;
    }

    /**
     * Бүх дүнгийн чанарийг нэгтгэж буй функц
     */
    function niit_chanar() {
        var chanar = seasons.flatMap((item) => [
            ...item.lesson_info.map((data) => (chanarHandler(data?.lesson_kr || 0, data?.gpa || 0)))
        ]).reduce((accumulator, currentValue) => accumulator + currentValue, 0)

        var roundedChanar = Math.round(chanar * 10) / 10;
        return roundedChanar;
    }

    const logo = require("@src/assets/images/logo/dxis_logo.png").default

    return (
        <div className='fontchange ps-1' >
            {
                studentId
                ?
                <>
                    {isLoading && Loader}
                    <Row className="pb-2 ps-3 pe-2 pt-1" style={{ fontSize: '12px' }} >
                    <div/>
                        <div className="mt-1 d-flex  align-items-center">
                            <div style={{width: '20%'}} className="d-inline-block">
                                <div className='d-flex flex-column justify-content-evenly align-items-center w-100' style={{ fontSize: '12px' }} >
                                    <img className="fallback-logo" style={{objectFit: 'cover'}} width={100} height={100} src={logo} alt="logo" />
                                </div>
                            </div>
                            <div style={{width: '80%'}} className="d-inline-block">
                                <div className="me-5">
                                    <div className="text-center me-5 fw-bolder fs-5 text-uppercase">
                                        {parentschoolName}
                                    </div>
                                </div>
                                <div className="me-5">
                                    <div className="text-center me-5 fw-bolder fs-5">
                                        ОЮУТНЫ ДҮНГИЙН ХУУДАС
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="fw-bolder ">
                            <div className="d-inline-block" style={{width: '70%'}}>
                                Мэргэжил: <span className="fw-normal">{datas?.student?.group.profession.name}</span>
                            </div>
                            <div className="d-inline-block" style={{width: '30%'}}>
                                Оюутны овог: <span className="fw-normal text-uppercase">{datas?.student?.last_name}</span>
                            </div>
                        </div>
                        <div className="fw-bolder mt-0">
                            <div className="d-inline-block" style={{width: '35%'}}>
                                Оюутны код: <span className="fw-normal text-uppercase">{datas?.student?.code}</span>
                            </div>
                            <div className="d-inline-block" style={{width: '35%'}}>
                                Оюутны регистр: <span className="fw-normal">{datas?.student?.register_num}</span>
                            </div>
                            <div className="d-inline-block" style={{width: '30%'}}>
                                Оюутны нэр: <span className="fw-normal text-uppercase">{datas?.student?.first_name}</span>
                            </div>
                        </div>
                        {/* Header */}
                        <table className={`fw-bolder text-center border-0 mt-50`} style={{ width: '98%', fontSize: '12px' }} >
                            <thead className="w-100">
                                <tr>
                                    <td rowSpan={2} className="text-center border  border-dark" style={{ width: '10%' }}>Хич/жил</td>
                                    <td rowSpan={2} className="text-center border  border-dark" style={{ width: '10%' }}>Улирал</td>
                                    <td rowSpan={2} className="text-center border  border-dark" style={{ width: '3%' }}>№</td>
                                    <td colSpan={3} className="text-center border-end border-bottom border-dark" style={{ width: '55%' }}>Хичээлийн</td>
                                    <td rowSpan={2} className="text-center border-end border-dark" style={{ width: '3%' }}>70 оноо</td>
                                    <td rowSpan={2} className="text-center border-end border-dark" style={{ width: '3%' }}>30 оноо</td>
                                    <td rowSpan={2} className="text-center border-end border-dark" style={{ width: '3%' }}>Нийт оноо</td>
                                    <td rowSpan={2} className="text-center border border-dark" style={{ width: '8%' }}>Үсгэн үнэлгээ</td>
                                    <td rowSpan={2} className="text-center border border-dark" style={{ width: '8%' }}>Чанарын оноо</td>
                                </tr>
                                <tr>
                                    <td className="border-end border-dark" style={{ width: '12%' }} >Код</td>
                                    <td className="border-end border-dark" style={{ width: '48%' }} >Нэр</td>
                                    <td className="border-end border-dark" style={{ width: '5%' }} >Кредит</td>
                                </tr>
                            </thead>
                            <tbody className="w-100">
                                {seasons.map((season, sidx) => {
                                    return(
                                        <Fragment key={sidx}>
                                            {season.lesson_info.map((lesson, lidx) => {
                                                chanars.push(chanarHandler(lesson?.lesson_kr, lesson?.gpa))
                                                return(
                                                <Fragment key={lidx}>
                                                    {
                                                        lidx === 0
                                                        ?
                                                            <tr>
                                                                <td rowSpan={season.lesson_info?.length} className="border-dark">{season?.year}</td>
                                                                <td rowSpan={season.lesson_info?.length} className="border-dark">{season?.season}</td>
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
                                                                    {lesson?.teach_score}
                                                                </td>
                                                                <td className="border-dark">
                                                                    {lesson?.exam_score}
                                                                </td>
                                                                {
                                                                    lesson?.grade_letter
                                                                    ?
                                                                    <td className="border-dark" colSpan={3}>
                                                                        {lesson?.grade_letter}
                                                                    </td>
                                                                    :
                                                                    <>
                                                                        <td className="border-dark">
                                                                            {lesson?.total_scores}
                                                                        </td>
                                                                        <td className="border-dark">
                                                                            {lesson?.assessment}
                                                                        </td>
                                                                        <td className="border-dark">
                                                                            {chanarHandler(lesson?.lesson_kr, lesson?.gpa)}
                                                                        </td>
                                                                    </>
                                                                }
                                                            </tr>
                                                        :
                                                            <tr key={lidx}>
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
                                                                    {lesson?.teach_score}
                                                                </td>
                                                                <td className="border-dark">
                                                                    {lesson?.exam_score}
                                                                </td>
                                                                <td className="border-dark">
                                                                    {lesson?.total_scores}
                                                                </td>
                                                                <td className="border-dark">
                                                                    {lesson?.assessment}
                                                                </td>
                                                                <td className="border-dark">
                                                                    {chanarHandler(lesson?.lesson_kr, lesson?.gpa)}
                                                                </td>
                                                            </tr>
                                                    }
                                                </Fragment>
                                            )}
                                            )}
                                        </Fragment>
                                    )}
                                )}
                            </tbody>
                        </table>
                        <div className="fw-bolder mt-1">
                            <div className="d-inline-block" style={{width: '38%'}}>
                                Чанарын онооны нийлбэр: <span className="fw-normal">{niit_chanar()}</span>
                            </div>
                            <div className="d-inline-block"  style={{width: '22%'}}>
                                Сонгосон кр: <span className="fw-normal">{total_data?.total_kr}</span>
                            </div>
                            <div className="d-inline-block"  style={{width: '23%'}}>
                                Цуглуулсан кр: <span className="fw-normal">{total_data?.total_kr}</span>
                            </div>
                            <div className="d-inline-block"  style={{width: '17%'}}>
                                Голч дүн: <span className="fw-normal">{total_data?.total_gpa}</span>
                            </div>
                        </div>

                        <div className="mt-2 d-flex justify-content-center">
                                {
                                    listArr.map((val, idx) =>
                                    {
                                        return (
                                            <div className="d-flex flex-column me-2 mt-50">
                                                <p key={idx} className="text-uppercase text-end">
                                                    <span style={{textWrap: 'wrap'}} className=" text-uppercase"></span>{val?.position_name}
                                                </p>
                                                <span className="text-end">.............................../{val?.last_name?.substring(0, 1)}.{val?.first_name}/</span>
                                            </div>
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
