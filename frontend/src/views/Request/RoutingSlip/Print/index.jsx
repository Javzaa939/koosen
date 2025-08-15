
import React, { useEffect, useState } from "react"

import { Row } from 'reactstrap'
import { useParams } from 'react-router-dom';

import useApi from "@hooks/useApi"
import useLoader from '@hooks/useLoader';

// ** Styles
import logo from "@src/assets/images/logo/dxis_logo.png"
import '@styles/base/pages/app-invoice-print.scss'

export default function Print()
{
    const menu_id = 'complaint5'
    var count = 0
    const date = new Date()

    const { routingslipId } = useParams()

    /** useState */
    const [ datas, setDatas ] = useState({})

    // Loader
	const{ Loader, isLoading, fetchData } = useLoader({isFullScreen: false})

    const croutingdApi = useApi().request.routing

    useEffect(
        () =>
        {
            if (routingslipId)
            {
                getDatas(routingslipId)
            }
        },
        [routingslipId]
    )

    /** Datatable-ийн утгаа авах */
    async function getDatas(routingslipId)
    {
        try {
            const { success, data } = await fetchData(croutingdApi.getOne(routingslipId, menu_id))
            if (success)
            {
                setDatas(data)
            }
        } catch (error) {
            window.close()
        }
    }

    useEffect(
        () =>
        {
            if (Object.keys(datas).length != 0)
            {
                setTimeout(() => window.print(), 1000)
            }
        },
        [datas]
    )

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
        <>
        {
            Object.keys(datas).length != 0 && datas?.routingslip_type == 3
            ?
                <div className='invoice-print'>
                    <div className='d-flex justify-content-center align-items-center w-100'>
                        <div>
                            <img className="fallback-logo ms-1" width={30} height={30} src={logo} alt="logo" />
                            <span className='text-primary fw-bold ms-1 fw-bolder'>
                                Sus-ТӨГСӨГЧДИЙН ТОЙРОХ ХУУДАС
                            </span>
                        </div>
                    </div>

                    <Row className='pb-2 ps-3 pt-1'>

                        <div className="p-0" style={{ width: '98%' }} >
                            <div className="d-inline-block" style={{ width: '50%' }} >
                                <small className="fw-bolder">Овог: {datas?.student?.last_name}</small>
                            </div>
                            <div className="d-inline-block" style={{ width: '50%' }} >
                                <small className="fw-bolder">Нэр: {datas?.student?.first_name}</small>
                            </div>
                        </div>

                        <div className="p-0" style={{ width: '98%' }} >
                            <div className="d-inline-block" style={{ width: '50%' }} >
                                <small className="fw-bolder">РД: {datas?.student?.register_num}</small>
                            </div>
                            <div className="d-inline-block" style={{ width: '50%' }} >
                                <small className="fw-bolder">Утас: {datas?.student?.phone}</small>
                            </div>
                        </div>

                        <div className="p-0" style={{ width: '98%' }} >
                            <div className="d-inline-block" style={{ width: '50%' }} >
                                <small className="fw-bolder">Бүрэлдэхүүн сургууль: {datas?.school_name}</small>
                            </div>
                            <div className="d-inline-block" style={{ width: '50%' }} >
                                <small className="fw-bolder">Хөтөлбөр: {datas?.profession_name}</small>
                            </div>
                        </div>

                        <div className={`d-flex px-0 border mt-1`} style={{ width: '98%' }} >
                            <div className="text-center border-end" style={{ width: '3%' }} >
                                <small className="w-100 fw-bolder">{"№"}</small>
                            </div>
                            <div className="text-center border-end position-relative" style={{ width: '57%' }} >
                                <small className="position-absolute top-50 translate-middle w-100 fw-bolder">{"Албан тушаал"}</small>
                            </div>
                            <div className="text-center border-end position-relative" style={{ width: '40%' }} >
                                <small className="position-absolute top-50 translate-middle w-100 fw-bolder">{"Тооцоотой эсэх"}</small>
                            </div>
                            <div className="text-center position-relative" style={{ width: '20%' }} >
                                <small className="position-absolute top-50 translate-middle w-100 fw-bolder">{"Гарын үсэг"}</small>
                            </div>
                        </div>

                        {
                            Object.keys(datas) != 0
                            &&
                            datas?.answers.map((val, idx) =>
                            {
                                val.id != 11 && count++
                                return (
                                    val.id != 11
                                    &&
                                    <>
                                        <div className={`d-flex px-0 border border-top-0`} style={{ width: '98%' }} key={idx} >
                                            <div className="text-center border-end position-relative" style={{ width: '3%' }} >
                                                <small className="w-100 position-absolute top-50 start-50 translate-middle">{count}</small>
                                            </div>
                                            <div className="text-left border-end" style={{ width: '57%', paddingLeft: '2px' }} >
                                                <small className="w-100" >{val?.name}</small>
                                            </div>
                                            <div className="text-left border-end position-relative" style={{ width: '40%' }} >
                                                <small className="w-100 position-absolute top-50 start-50 translate-middle">{}</small>
                                            </div>
                                            <div className="text-left position-relative" style={{ width: '20%' }} >
                                                <small className="w-100 position-absolute top-50 start-50 translate-middle">{}</small>
                                            </div>
                                        </div>
                                    </>
                                )

                            })
                        }

                        <small className="mt-2">Тооцоог дуусгаж бичиг баримт олгосон: ............................................../БМА/</small>
                        <small className="mt-0">Олгосон бичиг баримтын нэр: ..............................................</small>
                        <small className="mt-0">Бичиг баримт хүлээн авсан: ..............................................</small>
                        <small className="mt-1 text-end">{date.getFullYear()} оны .... сарын .... өдөр</small>
                    </Row>

                </div>
            :
                Object.keys(datas).length != 0 && (datas?.routingslip_type == 1 || datas?.routingslip_type == 2)
                ?
                    <div className='invoice-print mt-1'>
                        <div className='d-flex justify-content-center align-items-center w-100'>
                            <div>
                                <img className="fallback-logo ms-1" width={30} height={30} src={logo} alt="logo" />
                                <span className='text-primary fw-bold ms-1 fw-bolder'>
                                    {
                                        datas?.routingslip_type == 1
                                        ?
                                            'Шилжих хөдөлгөөний маягт'
                                        :
                                            'Сургуулиас гарах маягт'
                                    }
                                </span>
                            </div>
                        </div>

                        <Row className='pb-2 ps-3 pt-1'>

                            <div className="p-0" style={{ width: '98%' }} >
                                <div className="d-inline-block" style={{ width: '50%' }} >
                                    <small className="fw-bolder">Овог: {datas?.student?.last_name}</small>
                                </div>
                                <div className="d-inline-block" style={{ width: '50%' }} >
                                    <small className="fw-bolder">Элссэн он: {datas?.group?.join_year}</small>
                                </div>
                            </div>

                            <div className="p-0" style={{ width: '98%' }} >
                                <div className="d-inline-block" style={{ width: '50%' }} >
                                    <small className="fw-bolder">Нэр: {datas?.student?.last_name}</small>
                                </div>
                                <div className="d-inline-block" style={{ width: '50%' }} >
                                    <small className="fw-bolder">Анги: {datas?.group?.group_name}</small>
                                </div>
                            </div>

                            <div className="p-0" style={{ width: '98%' }} >
                                <div className="d-inline-block" style={{ width: '50%' }} >
                                    <small className="fw-bolder">Регистрийн дугаар: {datas?.student?.register_num}</small>
                                </div>
                                <div className="d-inline-block" style={{ width: '50%' }} >
                                    <small className="fw-bolder">Утас: {datas?.student?.phone}</small>
                                </div>
                            </div>

                            <div className="p-0" style={{ width: '98%' }}>
                                <small className="fw-bolder">Өргөдлийн агуулга: </small>
                                <small className="lineFillDotParent">
                                    <span className="lineFillDotChild">{datas?.body}</span>
                                </small>
                                <small className="lineFillDotParent">
                                    <p className="lineFillDotChild"></p>
                                </small>
                            </div>


                            <div className={`d-flex px-0 border mt-1`} style={{ width: '98%' }} >
                                <div className="text-center border-end" style={{ width: '3%' }} >
                                    <small className="w-100 fw-bolder">{"№"}</small>
                                </div>
                                <div className="text-center border-end position-relative" style={{ width: '20%' }} >
                                    <small className="w-100 fw-bolder">{"Харъяалагдах алба/нэгж"}</small>
                                </div>
                                <div className="text-center border-end position-relative" style={{ width: '27%' }} >
                                    <small className="w-100 fw-bolder">{"Албан тушаал"}</small>
                                </div>
                                <div className="text-center position-relative border-end" style={{ width: '30%' }} >
                                    <small className="w-100 fw-bolder">{"Шийдвэрлэглсэн байдал"}</small>
                                </div>
                                <div className="text-center position-relative" style={{ width: '20%' }} >
                                    <small className="w-100 fw-bolder">{"Гарын үсэг"}</small>
                                </div>
                            </div>

                            {
                                Object.keys(datas) != 0
                                &&
                                datas?.answers.map((val, idx) =>
                                {
                                    val.id != 11 && count++
                                    return (
                                        val.id != 11
                                        &&
                                        <>
                                            <div className={`d-flex px-0 border border-top-0`} style={{ width: '98%' }} key={idx} >
                                                <div className="text-center border-end position-relative" style={{ width: '3%' }} >
                                                    <small className="w-100 position-absolute top-50 start-50 translate-middle">{count}</small>
                                                </div>
                                                <div className="text-left border-end" style={{ width: '20%', paddingLeft: '2px' }} >
                                                    <small className="w-100" >{val?.name}</small>
                                                </div>
                                                <div className="text-left border-end" style={{ width: '27%', paddingLeft: '2px' }} >
                                                    <small className="w-100" >{val?.name}</small>
                                                </div>
                                                <div className="text-left border-end" style={{ width: '30%', paddingLeft: '2px' }} >
                                                    <small className="w-100">{val?.message}</small>
                                                </div>
                                                <div className="text-center" style={{ width: '20%' }} >
                                                    <small className="w-100 fw-bolder">{}</small>
                                                </div>
                                            </div>
                                        </>
                                    )

                                })
                            }

                            <small className="mt-1 text-end">Оюутны гарын үсэг: ..............................................</small>
                            <small className="mt-1 text-end">{date.getFullYear()} оны .... сарын .... өдөр</small>
                        </Row>

                    </div>
                :
                    <></>
        }
        </>
    )
}
