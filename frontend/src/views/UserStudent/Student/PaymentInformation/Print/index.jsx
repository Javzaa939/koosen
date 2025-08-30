
import React, { useEffect, useState } from "react"

import { Row } from "reactstrap";

// ** Styles
import '@styles/base/pages/app-invoice-print.scss'

import { moneyFormat, formatDate } from '@utils'

import useLoader from '@hooks/useLoader';

// ** Theme Config Import
import themeConfig from "@configs/themeConfig"

import empty from "@src/assets/images/empty-image.jpg"

import './style.scss'

export default function Print() {

    /** useState */
    const [datas, setDatas] = useState([])

    // Loader
    const { Loader, isLoading, fetchData } = useLoader({ isFullScreen: true })

    function errorImage(e) {
        e.target.src = empty
    }

    useEffect(() => {
        if (!isLoading && datas.length != 0 && datas?.length > 0) {
            setTimeout(() => window.print(), 1000)
        }
    }, [datas])

    // Loader уншина
    if (isLoading) {
        return Loader;
    }

    useEffect(() => {
        const sessiondatas = sessionStorage.getItem("ebarimtDatas") ? JSON.parse(sessionStorage.getItem("ebarimtDatas")) : []
        setDatas(sessiondatas)
    }, [sessionStorage.getItem("ebarimtDatas")])

    return (
        <div className='invoice-print' style={{ fontWeight: 500 }}>
            {
                datas?.map((ebarimtDatas, index) => {
                    // Байгууллага эсэх
                    const isBusiness = ["B2B_RECEIPT", "B2B_INVOICE"].includes(ebarimtDatas?.ebarimt_datas?.type)

                    return(
                        <div key={index} className="pageBreakInside">
                            <div className="text-end mt-5" style={{ lineHeight: 0.9 }}>
                                <small className="text-end">Сангийн сайдын 2017 оны</small>
                                <br />
                                <small className="text-end"> 347 дугаар тушаалын хавсралт</small>
                            </div>
                            <div className="position-relative ms-5 me-1 p-4">
                                <div className="position-absolute top-50 start-0 translate-middle">
                                    <img width={60} height={60} src={themeConfig.app.appLogoImage} alt="logo" />
                                </div>
                                <div className="position-absolute top-50 start-50 translate-middle">
                                    <h4 className="text-uppercase fw-bolder">
                                        Төлбөрийн баримт
                                    </h4>
                                </div>
                            </div>
                            <div className="px-2" style={{ fontSize: '11px', marginTop: '10px', fontWeight: 500 }}>
                                <div className="d-inline-block" style={{ width: '50%' }}>
                                    ДДТД: <span>{ebarimtDatas?.ebarimt_datas?.ebarimtId || '........'}</span>
                                </div>
                                <div className="d-inline-block" style={{ width: '50%' }}>
                                    Огноо: <span>{formatDate(ebarimtDatas?.ebarimt_datas?.print_date, 'YYYY-MM-DD HH:mm:ss') || '........'}</span>
                                </div>
                                <div className="d-inline-block fw-bolder" style={{ width: '50%' }}>
                                    Борлуулагчийн:
                                </div>
                                {
                                    isBusiness &&
                                    <div className="d-inline-block fw-bolder" style={{ width: '50%' }}>
                                        Худалдан авагчийн:
                                    </div>
                                }
                                <div className="d-inline-block" style={{ width: '50%' }}>
                                    ТТД: <span>{ebarimtDatas?.ebarimt_datas.org_tin || '........'}</span>
                                </div>
                                {
                                    isBusiness &&
                                    <div className="d-inline-block" style={{ width: '50%' }}>
                                        ТТД: <span>{ebarimtDatas?.ebarimt_datas.customer_tin || '........'}</span>
                                    </div>
                                }
                                <div className="d-inline-block" style={{ width: '50%' }}>
                                    НЭР: <span>{ebarimtDatas?.ebarimt_datas.org_name || '........'}</span>
                                </div>
                                {
                                    isBusiness &&
                                    <div className="d-inline-block" style={{ width: '50%' }}>
                                        НЭР: <span>{ebarimtDatas?.ebarimt_datas.customer_name || '........'}</span>
                                    </div>
                                }
                                <div className="d-inline-block" style={{ width: '50%' }}>
                                    Хаяг: <span>{ebarimtDatas?.ebarimt_datas.address || '........'}</span>
                                </div>
                                {
                                    isBusiness &&
                                    <div className="d-inline-block" style={{ width: '50%' }}>
                                        Хаяг: <span>........</span>
                                    </div>
                                }
                                <div className="d-inline-block" style={{ width: '50%' }}>
                                    Утас: <span>{ebarimtDatas?.ebarimt_datas.phone || '........'}</span>
                                </div>
                                {
                                    isBusiness &&
                                    <div className="d-inline-block" style={{ width: '50%' }}>
                                        Утас: <span>........</span>
                                    </div>
                                }
                            </div>
                            <Row className="px-2 mt-1">
                                <table style={{ fontSize: '11px' }}>
                                    <thead>
                                        <tr>
                                            <td className="text-center p-50 border border-end-0" style={{ width: '5%' }}>Д/Д</td>
                                            <td className="p-50 border border-end-0" style={{ width: '35%' }}>Бараа, ажил, үйлчилгээний нэр</td>
                                            <td className="p-50 border border-end-0" style={{ width: '12%' }}>Код</td>
                                            <td className="p-50 border border-end-0" style={{ width: '10%' }}>Хэмжих нэгж</td>
                                            <td className="p-50 border border-end-0" style={{ width: '10%' }}>Тоо, хэмжээ</td>
                                            <td className="text-end p-50 border border-end-0" style={{ width: '13%' }}>Нэгжийн үнэ</td>
                                            <td className="text-end p-50 border" style={{ width: '15%' }}>Бүгд үнэ</td>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                            ebarimtDatas?.ebarimt_datas?.items?.map((item, idx) => {
                                                return(
                                                    <tr key={idx} style={{ lineHeight: 1 }}>
                                                        <td className="text-center p-50 border border-end-0" style={{ width: '5%' }}>{idx+1}</td>
                                                        <td className="p-50 border border-end-0" style={{ width: '35%' }}>{item?.name}</td>
                                                        <td className="p-50 border border-end-0" style={{ width: '12%' }}>{item?.barcode}</td>
                                                        <td className="p-50 border border-end-0" style={{ width: '10%' }}>{item?.measure_unit}</td>
                                                        <td className="p-50 border border-end-0" style={{ width: '10%' }}>{item?.qty}</td>
                                                        <td className="text-end p-50 border border-end-0" style={{ width: '13%' }}>{moneyFormat(item?.unit_price, 2)}</td>
                                                        <td className="text-end p-50 border" style={{ width: '15%' }}>{moneyFormat(item?.total_amount, 2)}</td>
                                                    </tr>
                                                )
                                            })
                                        }
                                        <tr style={{ lineHeight: 0.9 }}>
                                            <td colSpan={4} rowSpan={4} className="px-50 py-0 border-0 pt-50" style={{ width: '62%' }}>
                                                {
                                                    ebarimtDatas?.ebarimt_datas.lottery &&
                                                    <div className="fw-bolder mt-2">Сугалаа <strong>{ebarimtDatas?.ebarimt_datas.lottery}</strong></div>
                                                }
                                                <img
                                                    width={120}
                                                    style={{ objectFit: 'cover' }}
                                                    src={ebarimtDatas?.q_image ? `data:image/png;base64,${ebarimtDatas?.q_image}` : empty}
                                                    alt=''
                                                    onError={errorImage}
                                                />
                                            </td>
                                            <td colSpan={2} className="px-50 py-0 border-0 border-end" style={{ width: '23%' }}>Бараа, ажил үйлчилгээний үнэ:</td>
                                            <td className="border px-50 py-0 text-end" style={{ width: '15%' }}>{moneyFormat(ebarimtDatas?.ebarimt_datas?.total_amount, 2)}</td>
                                        </tr>
                                        <tr style={{ lineHeight: 0.9 }}>
                                            <td colSpan={2} className="px-50 py-0 border-0 border-end" style={{ width: '23%' }}>Нэмэгдсэн өртгийн албан татвар:</td>
                                            <td className="border px-50 py-0 text-end" style={{ width: '15%' }}>{moneyFormat(ebarimtDatas?.ebarimt_datas?.total_vat, 2)}</td>
                                        </tr>
                                        <tr style={{ lineHeight: 0.9 }}>
                                            <td colSpan={2} className="px-50 py-0 border-0 border-end" style={{ width: '23%' }}>Нийслэл хотын албан татвар:</td>
                                            <td className="border px-50 py-0 text-end" style={{ width: '15%' }}>{moneyFormat(ebarimtDatas?.ebarimt_datas?.total_citytax, 2)}</td>
                                        </tr>
                                        <tr style={{ lineHeight: 0.9 }}>
                                            <td colSpan={2} className="px-50 py-0 border-0 border-end" style={{ width: '23%' }}>Нийт дүн:</td>
                                            <td className="border px-50 py-0 text-end" style={{ width: '15%' }}>{moneyFormat(ebarimtDatas?.ebarimt_datas?.total_amount, 2)}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </Row>
                            {
                                isBusiness &&
                                <div className="row text-center fw-bold mt-5" style={{ fontSize: '11px' }}>
                                    <div className="col-3">
                                        <br />
                                        Тамга
                                    </div>
                                    <div className="col-8">
                                        <div className="col-12" md={12}>
                                            <span>Хүлээн авсан: ...................................................... /....................................../</span>
                                        </div>
                                        <div className="col-12" md={12}>
                                            <span className="text-end ms-5" style={{ fontStyle: 'italic' }}>(гарын үсэг)</span>
                                            <span className="ms-50" style={{ fontStyle: 'italic' }}>(нэр)</span>
                                        </div>
                                        <div className="col-12">
                                            <span>Хүлээлгэн өгсөн: ................................................. /....................................../</span>
                                        </div>
                                        <div className="col-12">
                                            <span className="text-end ms-5" style={{ fontStyle: 'italic' }}>(гарын үсэг)</span>
                                            <span className="ms-50" style={{ fontStyle: 'italic' }}>(нэр)</span>
                                        </div>
                                    </div>
                                </div>
                            }
                        </div>
                    )
                })
            }
        </div>
    )
}