
import React, { useEffect } from 'react'

import { moneyFormat, formatDate, zeroFill } from '@utils'

import themeConfig from '@src/configs/themeConfig'

import "./style.scss"
import { Row } from 'reactstrap'

export default function Print() {

    const date = new Date()
    const datas = JSON.parse(sessionStorage.getItem("myPaymentDatas"))

    useEffect(() => {
        if (datas && Object.keys(datas)?.length > 0) {
            setTimeout(() => window.print(), 1000)
        }
    }, [datas])

    useEffect(() => {
        window.onafterprint = function() {
            sessionStorage.removeItem("myPaymentDatas")
            window.close()
        }
    }, [])

    return (
        <div className='invoice_print fontchange'>
            <div className="d-flex align-items-center">
                <div style={{ width: '20%' }} className="d-inline-block">
                    <div className='d-flex flex-column justify-content-evenly align-items-center w-100'>
                        <img className="fallback-logo" style={{ objectFit: 'cover' }} width={75} height={75} src={themeConfig.app.appLogoImage} alt="logo"/>
                    </div>
                </div>
                <div style={{ width: '80%' }} className="d-inline-block">
                    <div className="me-5">
                        <div className="text-center me-5 fw-bolder fs-5 text-uppercase text-primary">
                            {themeConfig.app.fullName}
                        </div>
                    </div>
                    <div className="me-5">
                        <div className="text-center me-5 fw-bolder fs-5">
                            {datas?.lesson_year} оны {datas?.season_name} -н сургалтын төлбөрийн мэдээлэл
                        </div>
                    </div>
                </div>
            </div>
            <Row className='ps-1 pt-1 pe-1' style={{ fontSize: '13px' }}>
                <div className="fw-bolder">
                    <div className="d-inline-block" style={{width: '70%'}}>
                        Бүрэлдэхүүн сургууль: <span className="fw-normal">{datas?.school?.name}</span>
                    </div>
                    <div className="d-inline-block" style={{width: '30%'}}>
                        Оюутны код: <span className="fw-normal">{datas?.code}</span>
                    </div>
                </div>
                <div className="fw-bolder">
                    <div className="d-inline-block" style={{width: '70%'}}>
                        Мэргэжил: <span className="fw-normal">{datas?.group?.profession?.name}</span>
                    </div>
                    <div className="d-inline-block" style={{width: '30%'}}>
                        Оюутны овог нэр: <span className="fw-normal">{datas?.full_name}</span>
                    </div>
                </div>
                <div className="fw-bolder mt-0">
                    <div className="d-inline-block" style={{width: '70%'}}>
                        Курс: <span className="fw-normal">{datas?.group?.level}-р курс</span>
                    </div>
                    <div className="d-inline-block" style={{width: '30%'}}>
                        Оюутны регистр: <span className="fw-normal">{datas?.register_num}</span>
                    </div>
                </div>
                <small className="mt-1 text-end">Огноо: {date.getFullYear()}-{zeroFill(date.getMonth() + 1)}-{zeroFill(date.getDate())}</small>
                <table className={`table table-bordered fw-bolder text-center border border-dark`} style={{ fontSize: '12px' }}>
                    <thead className="w-100">
                        <tr>
                            <th rowSpan={2} style={{ width: '15%' }} className="p-50 head_text">Эхний үлдэгдэл</th>
                            <th rowSpan={2} style={{ width: '15%' }} className="p-50 head_text">Төлбөл зохих</th>
                            <th colSpan={3} style={{ width: '55%' }} className="p-50 head_text">Төлсөн дүн</th>
                            <th rowSpan={2} style={{ width: '15%' }} className="p-50 head_text">Эцсийн үлдэгдэл</th>
                        </tr>
                        <tr>
                            <th className="text-center p-50 head_text" style={{ width: '15%' }}>Огноо</th>
                            <th className="text-center p-50 head_text" style={{ width: '25%' }}>Тайлбар</th>
                            <th className="text-center p-50 head_text" style={{ width: '15%' }}>Мөнгөн дүн</th>
                        </tr>
                    </thead>
                    <tbody className="w-100" style={{ fontSize: '10px' }}>
                        {
                            datas?.payment_transactions && datas?.payment_transactions?.length > 0
                            ?
                                datas?.payment_transactions?.map((item, index) => {
                                    return(
                                        index === 0
                                        ?
                                            <tr key={index}>
                                                <td rowSpan={datas?.payment_transactions?.length} className="p-50 text-end head_text" style={{ width: '15%' }}>{moneyFormat(datas?.sum_first_balance)}₮</td>
                                                <td className="p-50 text-end head_text" rowSpan={datas?.payment_transactions?.length} style={{ width: '15%' }}>{moneyFormat(datas?.sum_payment)}₮</td>
                                                <td className="p-50 text-start head_text" style={{ width: '15%' }}>{formatDate(item?.pay_date, "YYYY-MM-DD HH:mm:ss")}</td>
                                                <td className="p-50 text-start head_text" style={{ width: '25%' }}>{item?.payment_description}</td>
                                                <td className="p-50 text-end head_text" style={{ width: '15%' }}>{moneyFormat(item?.amount)}₮</td>
                                                <td rowSpan={datas?.payment_transactions?.length} className="p-50 text-end head_text" style={{ width: '15%' }}>{moneyFormat(datas?.sum_last_balance)}₮</td>
                                            </tr>
                                        :
                                            <tr key={index}>
                                                <td className="p-50 text-start head_text" style={{ width: '15%' }}>{formatDate(item?.pay_date, "YYYY-MM-DD HH:mm:ss")}</td>
                                                <td className="p-50 text-start head_text" style={{ width: '25%' }}>{item?.payment_description}</td>
                                                <td className="p-50 text-end head_text" style={{ width: '15%' }}>{moneyFormat(item?.amount)}₮</td>
                                            </tr>
                                    )
                                })
                            :
                                <tr>
                                    <td className="p-50 text-end head_text" style={{ width: '15%' }}>{moneyFormat(datas?.sum_first_balance)}₮</td>
                                    <td className="p-50 text-end head_text" style={{ width: '15%' }}>{moneyFormat(datas?.sum_payment)}₮</td>
                                    <td colSpan={3} className="p-50 text-center head_text" style={{ width: '55%' }}>Гүйлгээний түүх олдсонгүй</td>
                                    <td className="p-50 text-end head_text" style={{ width: '15%' }}>{moneyFormat(datas?.sum_last_balance)}₮</td>
                                </tr>
                        }
                        <tr>
                            <td className='text-end head_text p-50' style={{ width: '15%' }}>{moneyFormat(datas?.sum_first_balance)}₮</td>
                            <td className="text-end head_text p-50" style={{ width: '15%' }}>{moneyFormat(datas?.sum_payment)}₮</td>
                            <td className="text-end head_text p-50" colSpan={3} style={{ width: '55%' }}>Нийт төлсөн дүн: {moneyFormat(datas?.sum_in_balance)}₮</td>
                            <td className="text-end head_text p-50" style={{ width: '15%' }}>{moneyFormat(datas?.sum_last_balance)}₮</td>
                        </tr>
                    </tbody>
                </table>
                <small className="mt-1 text-end">Нягтлан бодогч: ..............................................</small>
            </Row>
        </div>
    )
}
