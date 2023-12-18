
import React, { useMemo, useEffect} from "react"

import { Row } from 'reactstrap'
import { useLocation } from 'react-router-dom';

// ** Styles
import '@styles/base/pages/app-invoice-print.scss'

import './style.css'

export default function Print()
{
    const location = useLocation();
    const printDatas = location.state
    const datas = printDatas?.datas

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
                window.history.go(-1);
            }
        },
        []
    )

    const header = useMemo(
        () => {
            if (!datas)
            {
                return <p>Уучлаарай утга олдсонгүй.</p>
            }
            else
            {
                return (
                    <>
                        <div className="text-center fw-bolder" style={{fontSize: '10px' }}>
                            <p className="m-0 text-uppercase">{printDatas?.subSchool}</p>
                        </div>

                        <div className="text-center fw-bolder px-3 m-0" style={{fontSize: '10px' }}>
                            <p className="m-0 text-uppercase">{printDatas?.year} ОНЫ ХИЧЭЭЛИЙН ЖИЛД БАГШ НАРЫН ГҮЙЦЭТГЭСЭН А ЦАГИЙН ТООЦООНЫ НЭГТГЭЛ </p>
                        </div>
                    </>
                )
            }
        },
        [printDatas]
    )

    const footer = useMemo(
        () => {
            if (printDatas)
            {
                return (
                    <div className="ms-1 mt-2">
                        <p className="fw-bolder text-center" style={{fontSize: '8px', marginLeft: '10px', margin: '0px' }} >Хянасан: Сургалтын албаны дарга ............................................ </p>
                    </div>
                )
            }
            else
            {
                <></>
            }
        },
        [printDatas]
    )

    return (
        <div className='invoice-print landscape overflow-hidden'>
            {
                header
            }
            {
                printDatas && datas.length > 0
                &&
                    <Row className='px-2 mt-1'>
                        <div className={`d-flex px-0 `} style={{ width: '100%', fontSize: '9px'}} >
                            <div className="text-center  border border-end-0 position-relative" style={{ width: '2%'}} >
                                <p className={` w-100 fw-bolder `}>{"№"}</p>
                            </div>
                            <div className="text-center border border-end-0 position-relative" style={{ width: '9%' }} >
                            <p className={`w-100 fw-bolder`} style={{wordWrap: 'break-word'}}>{"Бүрэлдэхүүн сургуулийн нэр"}</p>
                            </div>
                            <div className="text-center  border border-end-0 position-relative" style={{ width: '9%' }} >
                                <p className={`w-100 fw-bolder`}>{"Багшийн овог нэр"}</p>
                            </div>
                            <div className="text-center  border border-end-0 position-relative" style={{ width: '9%' }} >
                                <p className={`w-100 fw-bolder`}>{"Багшийн зэрэглэл"}</p>
                            </div>
                            <div className="text-center  border border-end-0 position-relative" style={{ width: '8%' }} >
                                <p className={`w-100 fw-bolder`}>{"А цагийн норм"}</p>
                            </div>
                            <div className="text-center  border border-end-0 position-relative" style={{ width: '8%' }} >
                                <p className={`w-100 fw-bolder`}>{"1-р улиралд заасан хичээлийн тоо"}</p>
                            </div>
                            <div className="text-center  border border-end-0 position-relative" style={{ width: '8%' }} >
                                <p className={`w-100 fw-bolder`}>{"1-р улиралд заасан цаг"}</p>
                            </div>
                            <div className="text-center  border border-end-0 position-relative" style={{ width: '8%' }} >
                                <p className={`w-100 fw-bolder`}>{"2-р улиралд заасан хичээлийн тоо"}</p>
                            </div>
                            <div className="text-center  border border-end-0 position-relative" style={{ width: '8%' }} >
                                <p className={`w-100 fw-bolder`}>{"2-р улиралд заасан цаг"}</p>
                            </div>
                            <div className="text-center  border border-end-0 position-relative" style={{ width: '5%' }} >
                                <p className={`w-100 fw-bolder`}>{"Нийт цаг"}</p>
                            </div>
                            <div className="text-center  border border-end-0 position-relative" style={{ width: '8%' }} >
                                <p className={`w-100 fw-bolder`}>{"Танхим кредит"}</p>
                            </div>
                            <div className="text-center  border border-end-0 position-relative" style={{ width: '8%' }} >
                                <p className={`w-100 fw-bolder`}>{"Танхим  бус кредит"}</p>
                            </div>
                            <div className="text-center  border border-end-0 position-relative" style={{ width: '5%' }} >
                                <p className={`w-100 fw-bolder`}>{"Нийт кредит"}</p>
                            </div>
                            <div className="text-center  border position-relative" style={{ width: '5%' }} >
                                <p className={`w-100 fw-bolder`}>{"Зөрүү кредит"}</p>
                            </div>
                        </div>
                        {
                            datas.length > 0 &&
                                datas.map((item, idx) => {
                                    return (
                                        <div className={`d-flex px-0 `} style={{ width: '100%', fontSize: '9px'}} key={idx}>
                                            <div className="text-center  border border-end-0 border-top-0 position-relative" style={{ width: '2%'}} >
                                                <p className={` w-100 fw-bolder`}>{idx + 1}</p>
                                            </div>
                                            <div className="text-center  border border-end-0 border-top-0 position-relative" style={{ width: '9%'}} >
                                                <p className={` w-100 fw-bolder`}>{printDatas?.subSchool}</p>
                                            </div>
                                            <div className="text-center  border border-end-0 border-top-0 position-relative" style={{ width: '9%'}} >
                                                <p className={` w-100 fw-bolder`}>{item?.teacher?.full_name}</p>
                                            </div>
                                            <div className="text-center  border border-end-0 border-top-0 position-relative" style={{ width: '9%'}} >
                                                <p className={` w-100 fw-bolder`}>{item?.teacher?.org_position}</p>
                                            </div>
                                            <div className="text-center  border border-end-0 border-top-0 position-relative" style={{ width: '8%'}} >
                                                <p className={` w-100 fw-bolder`}>{item?.teacher_norm}</p>
                                            </div>
                                            <div className="text-center  border border-end-0 border-top-0 position-relative" style={{ width: '8%'}} >
                                                <p className={` w-100 fw-bolder`}>{item?.autumn_lesson}</p>
                                            </div>
                                            <div className="text-center  border border-end-0 border-top-0 position-relative" style={{ width: '8%'}} >
                                                <p className={` w-100 fw-bolder`}>{item?.autumn_kredit}</p>
                                            </div>
                                            <div className="text-center  border border-end-0 border-top-0 position-relative" style={{ width: '8%'}} >
                                                <p className={` w-100 fw-bolder`}>{item?.spring_lesson}</p>
                                            </div>
                                            <div className="text-center  border border-end-0 border-top-0 position-relative" style={{ width: '8%'}} >
                                                <p className={` w-100 fw-bolder`}>{item?.spring_kredit}</p>
                                            </div>
                                            <div className="text-center  border border-end-0 border-top-0 position-relative" style={{ width: '5%'}} >
                                                <p className={` w-100 fw-bolder`}>{item?.spring_kredit + item?.autumn_kredit}</p>
                                            </div>
                                            <div className="text-center  border border-end-0 border-top-0 position-relative" style={{ width: '8%'}} >
                                                <p className={` w-100 fw-bolder`}>{item?.exec_kr}</p>
                                            </div>
                                            <div className="text-center  border border-end-0 border-top-0 position-relative" style={{ width: '8%'}} >
                                                <p className={` w-100 fw-bolder`}>{item?.not_chamber_exec_kr}</p>
                                            </div>
                                            <div className="text-center  border border-end-0 border-top-0 position-relative" style={{ width: '5%'}} >
                                                <p className={` w-100 fw-bolder`}>{item?.not_chamber_exec_kr + item?.exec_kr}</p>
                                            </div>
                                            <div className="text-center  border border-top-0 position-relative" style={{ width: '5%'}} >
                                                <p className={` w-100 fw-bolder`}>{(item?.not_chamber_exec_kr + item?.exec_kr) - item?.teacher_norm}</p>
                                            </div>
                                        </div>
                                    )
                                })
                        }
                    </Row>
            }
            {footer}
        </div>
    )
}
