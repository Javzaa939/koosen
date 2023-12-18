
import React, { useEffect, useState } from "react"

import { Row } from 'reactstrap'
import { useParams } from 'react-router-dom';

import useApi from "@hooks/useApi"
import useLoader from '@hooks/useLoader';

// ** Styles
import logo from "@src/assets/images/logo/logo-muis.png"
import '@styles/base/pages/app-invoice-print.scss'

export default function Print()
{
    var count = 0

    const { correspondId } = useParams()

    /** useState */
    const [ datas, setDatas ] = useState({})

    // Loader
	const{ Loader, isLoading, fetchData } = useLoader({isFullScreen: true})

    const correspondApi = useApi().request.correspond

    useEffect(
        () =>
        {
            if (correspondId)
            {
                getDatas(correspondId)
            }
        },
        [correspondId]
    )

    /** Datatable-ийн утгаа авах */
    async function getDatas(correspondId)
    {
        try
        {
            const { success, data } = await fetchData(correspondApi.getPrintOne(correspondId))
            if (success)
            {
                setDatas(data)
            }
        } catch (e)
        {
            window.close()
        }
    }

    useEffect(
        () =>
        {
            window.onafterprint = function()
            {
                window.close()
            }
        },
        []
    )

    return (
        <div className='invoice-print'>
            <div className='d-flex justify-content-center align-items-center w-100'>
                <img className="fallback-logo ms-1" width={50} height={50} src={logo} alt="logo" />
                <div className="d-flex flex-column text-center ms-2">
                    <span className='text-primary fw-bold ms-1 fw-bolder'>
                        МОНГОЛЫН ҮНДЭСНИЙ ИХ СУРГУУЛЬ
                    </span>
                    <span>{datas?.lesson_year} оын хичээлийн жлийн оюутны кредит дүйцүүлэлт</span>
                </div>
            </div>

            <Row className='pb-2 ps-3 pt-1'>
                <div className="p-0" style={{ width: '98%' }} >
                    <div className="d-inline-block" style={{ width: '50%' }} >
                        <small><span className="fw-bolder">Овог/нэр: </span>{datas?.full_name}</small>
                    </div>
                    <div className="d-inline-block" style={{ width: '50%' }} >
                        <small><span className="fw-bolder">Сурч байсан анги: </span>{datas?.group_name}</small>
                    </div>
                </div>
                <div className="p-0" style={{ width: '98%' }} >
                    <div className="d-inline-block" style={{ width: '50%' }} >
                        <small><span className="fw-bolder">Регистр: </span>{datas?.register_num}</small>
                    </div>
                    <div className="d-inline-block" style={{ width: '50%' }} >
                        <small><span className="fw-bolder">Суралцах анги: </span>{datas?.student_now_group}</small>
                    </div>
                </div>

                <div className={`d-flex px-0 border mt-1`} style={{ width: '98%' }} >
                    <div className="text-center border-end position-relative" style={{ width: '3%' }} >
                        <small className="position-absolute top-50 translate-middle w-100 fw-bolder">{"№"}</small>
                    </div>
                    <div className="text-center border-end position-relative" style={{ width: '34%' }} >
                        <small className="position-absolute top-50 translate-middle w-100 fw-bolder">{"Дүйцүүлэн хаах хичээлийн нэр"}</small>
                    </div>
                    <div className="text-center border-end position-relative" style={{ width: '5%' }} >
                        <small className="position-absolute top-50 translate-middle w-100 fw-bolder">{"Кр"}</small>
                    </div>
                    <div className="text-center border-end position-relative" style={{ width: '3%' }} >
                        <small className="position-absolute top-50 translate-middle w-100 fw-bolder">{"№"}</small>
                    </div>
                    <div className="text-center border-end position-relative" style={{ width: '34%' }} >
                        <small className="position-absolute top-50 translate-middle w-100 fw-bolder">{"Судлах хичээлийн нэр"}</small>
                    </div>
                    <div className="text-center border-end position-relative " style={{ width: '5%' }} >
                        <small className="position-absolute top-50 translate-middle w-100 fw-bolder">{"Кр"}</small>
                    </div>
                    <div className="text-center border-end" style={{ width: '8%' }} >
                        <small className="w-100 fw-bolder">{"Тоон үнэлгээ"}</small>
                    </div>
                    <div className="text-center" style={{ width: '8%' }} >
                        <small className="w-100 fw-bolder">{"Үсгэн үнэлгээ"}</small>
                    </div>
                </div>

                {
                    Object.keys(datas) != 0
                    &&
                    datas?.correspondlessons.map((val, idx) =>
                    {
                        count = 0
                        return (
                            <>
                                <div className={`d-flex px-0 border border-top-0`} style={{ width: '98%' }} >
                                    <div className="text-center border-end" style={{ width: '45%' }} >
                                        <small className="w-100 fw-bolder">{`${val?.id}-р улирал`}</small>
                                    </div>
                                    <div className="text-center" style={{ width: '55%' }} >
                                        <small className="w-100 fw-bolder">{`${val?.id}-р улирал`}</small>
                                    </div>
                                </div>
                                {
                                    val?.datas.map((val, idx) =>
                                    {
                                        count++
                                        return (
                                            <div className={`d-flex px-0 border border-top-0`} style={{ width: '98%' }} >
                                                <div className="text-center border-end position-relative" style={{ width: '3%' }} >
                                                    <small className="position-absolute top-50 translate-middle w-100 fw-bolder">{count}</small>
                                                </div>
                                                <div className="border-end" style={{ width: '34%', paddingLeft: '2px' }} >
                                                    <small className="w-100 fw-bolder">{val?.correspond_lesson__name}</small>
                                                </div>
                                                <div className="text-center border-end position-relative" style={{ width: '5%' }} >
                                                    <small className="position-absolute top-50 translate-middle w-100 fw-bolder">{val?.correspond_kredit}</small>
                                                </div>
                                                <div className="text-center border-end position-relative" style={{ width: '3%' }} >
                                                    <small className="position-absolute top-50 translate-middle w-100 fw-bolder">{count}</small>
                                                </div>
                                                <div className="border-end" style={{ width: '34%', paddingLeft: '2px' }} >
                                                    <small className="w-100 fw-bolder">{val?.learn_lesson}</small>
                                                </div>
                                                <div className="text-center border-end position-relative" style={{ width: '5%' }} >
                                                    <small className="position-absolute top-50 translate-middle w-100 fw-bolder">{val?.learn_kredit}</small>
                                                </div>
                                                <div className="text-center border-end position-relative" style={{ width: '8%' }} >
                                                    <small className="position-absolute top-50 translate-middle w-100 fw-bolder">{val?.score}</small>
                                                </div>
                                                <div className="text-center position-relative" style={{ width: '8%' }} >
                                                    <small className="position-absolute top-50 translate-middle w-100 fw-bolder">{val?.assessment}</small>
                                                </div>
                                            </div>
                                        )
                                    })
                                }
                            </>
                        )
                    })
                }

                <small className="mt-2"><span className="fw-bolder">Дүйцүүлэлт хийсэн: </span>..................................... БМА-ны мэргэжилтэн /&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;/</small>

            </Row>
        </div>
    )
}
