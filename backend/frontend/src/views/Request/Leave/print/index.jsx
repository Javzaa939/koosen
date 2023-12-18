
import React, { useEffect, useState } from "react"

import { Row, Col, Table } from 'reactstrap'
import { useParams } from 'react-router-dom';
import { CheckSquare, Square } from "react-feather";

import useApi from "@hooks/useApi"
import useLoader from '@hooks/useLoader';

// ** Styles
import logo from "@src/assets/images/logo/logo-muis.png"
import '@styles/base/pages/app-invoice-print.scss'

import { zeroFill } from "@utils"
import { COMPLAINT_UNIT_BMA_ID } from '@utility/consts'

export default function Print()
{
    const menu_id = 'complaint4'

    var count = 0
    const date = new Date()

    const { leaveId } = useParams()

    /** useState */
    const [ datas, setDatas ] = useState({})

    // Loader
	const{ Loader, isLoading, fetchData } = useLoader({isFullScreen: true})

    const studentComplaintLeaveApi = useApi().request.leave

    useEffect(
        () =>
        {
            if (leaveId)
            {
                getDatas(leaveId)
            }
        },
        [leaveId]
    )

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

    /** Datatable-ийн утгаа авах */
    async function getDatas(leaveId)
    {
        try
        {
            const { success, data } = await fetchData(studentComplaintLeaveApi.getOne(leaveId, menu_id))
            if (success)
            {
                setDatas(data)
            }
        } catch (error)
        {
            window.close()
        }
    }

    function betweenDateSolve(cStartDate, cLeaveType, cCount)
    {
        let betweenDate = ''

        let startDate = new Date(cStartDate)

        if (cLeaveType == 1)
        {
            const customDate = new Date(cStartDate)
            customDate.setFullYear(customDate.getFullYear() + 1)

            betweenDate = `${startDate.getFullYear()}-${zeroFill(startDate.getMonth() + 1)}-${zeroFill(startDate.getDate())} - ${customDate.getFullYear()}-${zeroFill(customDate.getMonth() + 1)}-${zeroFill(customDate.getDate())}`
        }
        else if (cLeaveType == 2)
        {
            const customDate = new Date(cStartDate)
            customDate.setMonth(customDate.getMonth() + parseInt(cCount));
            betweenDate = `${startDate.getFullYear()}-${zeroFill(startDate.getMonth() + 1)}-${zeroFill(startDate.getDate())} - ${customDate.getFullYear()}-${zeroFill(customDate.getMonth() + 1)}-${zeroFill(customDate.getDate())}`
        }
        else if (cLeaveType == 3)
        {
            const customDate = new Date(cStartDate)
            customDate.setDate(customDate.getDate() + parseInt(cCount))
            betweenDate = `${startDate.getFullYear()}-${zeroFill(startDate.getMonth() + 1)}-${zeroFill(startDate.getDate())} - ${customDate.getFullYear()}-${zeroFill(customDate.getMonth() + 1)}-${zeroFill(customDate.getDate())}`

        }
        return betweenDate
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
            {isLoading && Loader}
            <div className='d-flex justify-content-center align-items-center w-100'>
                <div className="d-flex align-items-center">
                    <img className="fallback-logo" width={50} height={50} src={logo} alt="logo" />
                    <span className='text-primary fw-bold ms-1 fs-3'>ЧӨЛӨӨ АВАХ ОЮУТНЫ МАЯГТ</span>
                </div>
            </div>

            <Row className='pb-2 ps-4'>
                <Col >
                    <table>
                        <tbody>
                            <tr>
                                <td className='pe-1'><small>Овог/нэр:</small></td>
                                <td><small>{datas?.student?.full_name}</small></td>
                            </tr>
                            <tr>
                                <td className='pe-1'><small>Регистрийн дугаар:</small></td>
                                <td><small>{datas?.student?.register_num}</small></td>
                            </tr>
                        </tbody>
                    </table>
                </Col>
                <Col >
                    <table>
                        <tbody>
                            <tr>
                                <td className='pe-1'><small>Анги:</small></td>
                                <td><small>{datas?.group?.group_name}</small></td>
                            </tr>
                            <tr>
                                <td className='pe-1'><small>Утас:</small></td>
                                <td><small>{datas?.student?.phone}</small></td>
                            </tr>
                        </tbody>
                    </table>
                </Col>

                <small className="fst-italic">
                    Өргөдлийн агуулгыг тэмдэглэнэ үү.
                    <CheckSquare className="me-1" size={15} fill={'none'} />
                </small>

                <div className="d-flex justify-content-around">
                    <div>
                        {
                            datas?.leave_type == 1
                            ?
                                <CheckSquare className="me-1" size={15} fill={'none'} />
                            :
                                <Square className="me-1" size={15} fill={'none'} />
                        }
                        <small>Жилийн чөлөө авах</small>
                    </div>
                    <div>
                        {
                            datas?.leave_type == 2
                            ?
                                <CheckSquare className="me-1" size={15} fill={'none'} />
                            :
                                <Square className="me-1" size={15} fill={'none'} />
                        }
                        <small>Сарын чөлөө авах</small>
                    </div>
                    <div>
                        {
                            datas?.leave_type == 3
                            ?
                                <CheckSquare className="me-1" size={15} fill={'none'} />
                            :
                                <Square className="me-1" size={15} fill={'none'} />
                        }
                        <small>Хоногийн чөлөө авах</small>
                    </div>
                </div>

                <div className="border mt-1" style={{ width: '98%' }}>
                    <small>Тайлбар: </small>
                    <small className="lineFillDotParent">
                        <span className="lineFillDotChild">{datas?.cause}</span>
                    </small>
                    <small className="lineFillDotParent">
                        <p className="lineFillDotChild">&nbsp;</p>
                    </small>
                    <small className="lineFillDotParent">
                        <p className="lineFillDotChild">&nbsp;</p>
                    </small>
                    <small className="lineFillDotParent">
                        <p className="lineFillDotChild">&nbsp;</p>
                    </small>
                </div>

                <div className="px-0 border border-top-0" style={{ width: '98%' }} >
                    <div className="text-center d-inline-block border-end" style={{ width: '5%', paddingTop: '3px', paddingBottom: '3px' }} >
                        <small className="fw-bolder">№</small>
                    </div>
                    <div className="text-center d-inline-block border-end" style={{ width: '35%', paddingTop: '3px', paddingBottom: '3px' }} >
                        <small className="fw-bolder">Албан тушаал</small>
                    </div>
                    <div className="text-center d-inline-block" style={{ width: '60%', paddingTop: '3px', paddingBottom: '3px' }} >
                        <small className="fw-bolder">Шийдвэрлэгдсэн байдал/ Гарын үсэг</small>
                    </div>
                </div>

                {
                    Object.keys(datas) !=0
                    &&
                    datas?.answers.map((val, idx) =>
                    {
                        val.id != 11 && count++
                        return (
                            val.id != 11
                            &&
                            <div className="p-0" key={idx} >
                                <div key={idx} className="d-flex px-0 border border-top-0" style={{ width: '98%' }} >
                                    <div className="text-center border-end position-relative" style={{ width: '5%' }} >
                                        <small className="position-absolute top-50 translate-middle w-100">{count}</small>
                                    </div>
                                    <div className="text-center border-end px-1 position-relative" style={{ width: '35%' }} >
                                        <small className={`w-100 ${val?.message ? 'position-absolute top-50 translate-middle ' : ''}`}>{val?.name}</small>
                                    </div>
                                    <div className="px-1" style={{ width: '60%' }} >
                                        <small className="">{val?.message}</small>
                                    </div>
                                </div>
                            </div>
                        )

                    })
                }

                <small className="mt-2 text-center">{date.getFullYear()} оны {zeroFill(date.getMonth() + 1)} сарын {zeroFill(date.getDate())} өдөр</small>

                <p className="px-0">-------------------------------------------------------------------------------------------------------------------------------</p>

            </Row>

            <Row>
                <div className='d-flex justify-content-center align-items-center w-100'>
                    <div className="d-flex align-items-center">
                        <img className="fallback-logo" width={50} height={50} src={logo} alt="logo" />
                        <span className='text-primary fw-bold ms-1 fs-3 text-decoration-underline'>ЧӨЛӨӨНИЙ ХУУДАС</span>
                    </div>
                </div>

                <small className="ps-4 mt-1">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{datas?.group?.school_name}-ийн {datas?.group?.group_name} ангийн {datas?.student?.last_name} овогтой {datas?.student?.first_name} /РД: {datas?.student?.register_num}/ нь {datas?.cause} шалтгааны улмаас чөлөө хүссэн тул {betweenDateSolve(datas?.start_date, datas?.leave_type, datas?.count)} хүртэл /өдөр, сар, жил/-ийн чөлөө олгов. </small>

                <small className="ps-4 mt-2">Сургалт, Эрдэм шинжилгээ эрхэлсэн дэд ерөнхийлөгч .................................... /&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;/ </small>
                <small className="ps-4 mt-1 text-center">Бүртгэл мэдээллийн алба .................................... /&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;/</small>
                <small className="ps-4 mt-1 text-center">{date.getFullYear()} оны .... сарын .... өдөр</small>
            </Row>

        </div>
    )
}
