
import React, { useEffect, useState } from "react"

import { Row, Col } from 'reactstrap'
import { useParams } from 'react-router-dom';
import { CheckSquare, Square } from 'react-feather'

import useApi from "@hooks/useApi"
import useLoader from '@hooks/useLoader';

// ** Styles
import logo from "@src/assets/images/logo/dxis_logo.png"
import '@styles/base/pages/app-invoice-print.scss'

export default function Print()
{
    const date = new Date()
    const menu_id = 'complaint2'
    var count = 0

    const { complaintId } = useParams()

    /** useState */
    const [ datas, setDatas ] = useState({})

    // // Loader
	const{ Loader, isLoading, fetchData } = useLoader({isFullScreen: true})

    const studentComplaintApi = useApi().request.complaint

    useEffect(
        () =>
        {
            if (complaintId)
            {
                getDatas(complaintId)
            }
        },
        [complaintId]
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
    async function getDatas(complaintId)
    {
        try
        {
            const { success, data } = await fetchData(studentComplaintApi.getOne(complaintId, menu_id))
            if (success)
            {
                setDatas(data)
            }
        } catch (error)
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
            <div className='d-flex justify-content-between align-items-center w-100'>
                <div className="d-flex align-items-center">
                    <img className="fallback-logo ms-1" width={30} height={30} src={logo} alt="logo" />
                    <span className='text-primary fw-bold ms-1'>Дотоод Хэргийн Их Сургууль</span>
                </div>
                <span className="fw-bold me-1">Өргөдлийн маягт</span>
            </div>

            <p className="text-center fst-italic fw-bolder"><small>1. Өргөдөл гаргагчийн бөглөх хэсэг</small></p>

            <Row className='pb-2 ps-3'>
                <Col>
                    <table>
                        <tbody>
                            <tr>
                                <td className='pe-1'><small>Овог:</small></td>
                                <td><small>{datas?.student?.last_name}</small></td>
                            </tr>
                            <tr>
                                <td className='pe-1'><small>Нэр:</small></td>
                                <td><small>{datas?.student?.first_name}</small></td>
                            </tr>
                            <tr>
                                <td className='pe-1'><small>Регистрийн дугаар:</small></td>
                                <td><small>{datas?.student?.register_num}</small></td>
                            </tr>
                            <tr>
                                <td className='pe-1'><small>Утасны дугаар:</small></td>
                                <td><small>{datas?.student?.phone}</small></td>
                            </tr>
                        </tbody>
                    </table>
                </Col>
                <Col>
                    <table>
                        <tbody>
                            <tr>
                                <td className='pe-1'><small>Элссэн он:</small></td>
                                <td><small>{datas?.group?.join_year}</small></td>
                            </tr>
                            <tr>
                                <td className='pe-1'><small>Мэргэжил:</small></td>
                                <td><small>{datas?.group?.profession}</small></td>
                            </tr>
                            <tr>
                                <td className='pe-1'><small>Бүлэг:</small></td>
                                <td><small>{datas?.group?.group_name}</small></td>
                            </tr>
                            <tr>
                                <td className='pe-1'><small>Бусад:</small></td>
                                <td><small>................................................................................</small></td>
                            </tr>
                        </tbody>
                    </table>
                </Col>

                <small className="fst-italic">
                    Өргөдлийн агуулгыг тэмдэглэнэ үү.
                    <CheckSquare className="me-1" size={15} fill={'none'} />
                </small>

                <div className="d-flex" style={{ paddingLeft: '30px' }} >
                    <div style={{ width: '33%' }} >
                        {
                            datas?.complaint_type == 1
                            ?
                                <CheckSquare className="me-1" size={15} fill={'none'} />
                            :
                                <Square className="me-1" size={15} fill={'none'} />
                        }
                        <small>Жилийн чөлөөнөөс эргэн суралцах</small>
                    </div>
                    <div style={{ width: '33%' }}>
                        {
                            datas?.complaint_type == 2
                            ?
                                <CheckSquare className="me-1" size={15} fill={'none'} />
                            :
                                <Square className="me-1" size={15} fill={'none'} />
                        }
                        <small>Анги солин суралцах</small>
                    </div>
                    <div style={{ width: '33%' }}>
                        {
                            datas?.complaint_type == 3
                            ?
                                <CheckSquare className="me-1" size={15} fill={'none'} />
                            :
                                <Square className="me-1" size={15} fill={'none'} />
                        }
                        <small>Улиран суралцах</small>
                    </div>
                </div>
                <div className="d-flex" style={{ paddingLeft: '30px' }} >
                    <div style={{ width: '33%' }}>
                        {
                            datas?.complaint_type == 4
                            ?
                                <CheckSquare className="me-1" size={15} fill={'none'} />
                            :
                                <Square className="me-1" size={15} fill={'none'} />
                        }
                        <small>Төгсөх хүсэлтэй</small>
                    </div>
                    <div style={{ width: '33%' }}>
                        {
                            datas?.complaint_type == 5
                            ?
                                <CheckSquare className="me-1" size={15} fill={'none'} />
                            :
                                <Square className="me-1" size={15} fill={'none'} />
                        }
                        <small>Дүнтэй холбоотой</small>
                    </div>
                    <div style={{ width: '33%' }}>
                        {
                            datas?.complaint_type == 6
                            ?
                                <CheckSquare className="me-1" size={15} fill={'none'} />
                            :
                                <Square className="me-1" size={15} fill={'none'} />
                        }
                        <small>Бусад</small>
                    </div>
                </div>

                <div className="border mt-1 ps-2" style={{ width: '98%' }}>
                    <small>Тайлбар: </small>
                    <small className="lineFillDotParent">
                        <span className="lineFillDotChild">{datas?.body}</span>
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

                <p className="text-center fst-italic fw-bolder"><small>1. Бүртгэл мэдээллийн албаны мэргэжилтний бөглүүлэх хэсэг</small></p>

                {
                    Object.keys(datas) != 0
                    &&
                    datas?.answers.map((val, idx) =>
                    {
                        val.id != 11 && count++
                        return (
                            val.id != 11
                            &&
                            <div className="p-0" key={idx}>
                                <div key={`complaintprint${count}`} className={`d-flex px-0 border ${idx !== 0 && 'border-top-0'}`} style={{ width: '98%' }} >
                                    <div className="text-center border-end position-relative" style={{ width: '5%' }} >
                                        <small className="position-absolute top-50 translate-middle w-100">{count}</small>
                                    </div>
                                    <div className="text-center border-end px-1 position-relative" style={{ width: '35%' }} >
                                        <small className="position-absolute top-50 translate-middle w-100">{val?.name}</small>
                                    </div>
                                    <div className="px-1" style={{ width: '60%' }} >
                                        <small className="">{val?.message}</small>
                                    </div>
                                </div>
                            </div>
                        )

                    })
                }

                <small><span className="fw-bolder">Анхааруулга:&nbsp;</span>Өргөдлийн хариу хүлээн авсан өдрөөс эхлэн ажлын 3-5 хоногийн дотор гарахыг анхаарна уу.</small>
                <small className="mt-1"><span className="fw-bolder">Холбоо барих утас:&nbsp;</span>96905577- Бүртгэл мэдээллийн алба</small>
                <small className="mt-1 text-end">{date.getFullYear()} оны .... сарын .... өдөр</small>
                <small className="mt-1 text-end">Гүйцэтгэх захирал .................................... /&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;/</small>
            </Row>
        </div>
    )
}
