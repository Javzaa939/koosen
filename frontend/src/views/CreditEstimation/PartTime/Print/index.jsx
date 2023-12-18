import React, { useEffect } from "react"

import { Row } from 'reactstrap'
import { useLocation } from 'react-router-dom';

// ** Styles
import logo from "@src/assets/images/logo/logo-muis.png"
import '@styles/base/pages/app-invoice-print.scss'

export default function Print()
{
    const location = useLocation();
    const data = location.state
    const datas = data.datas
    const months = data.months?.sort().toString()

    useEffect(
        () =>
        {
            if (Object.keys(datas).length != 0)
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
                window.history.go(-1);
            }
        },
        []
    )

    return (
        <>
            <div className='invoice-print' style={{color: 'black !important'}}>
                <div className='d-flex justify-content-center align-items-center w-100'>
                    <img className="fallback-logo ms-1" width={50} height={50} src={logo} alt="logo" />
                    <div className="d-flex flex-column text-center ms-2">
                        <span className='text-primary ms-1 fw-bolder'>
                            МОНГОЛЫН ҮНДЭСНИЙ ИХ СУРГУУЛЬ
                        </span>
                    </div>
                </div>
                {
                    datas.length > 0
                    &&
                    <Row className="px-2 mt-1">
                        <div className="border text-center px-2 border-bottom-0" style={{ fontSize: '12px' }}>
                            <h6>{`${months}  сарын цагийн багшийн тооцооны нэгтгэл`}</h6>
                        </div>
                        <div className={`d-flex px-0 `} style={{ width: '100%', fontSize: '11px'}} >
                            <div className="text-center border border-end-0 position-relative" style={{ width: '2%' }} >
                                <p className={` w-100 fw-bolder`}>{"№"}</p>
                            </div>
                            <div className="text-center border border-end-0 position-relative" style={{ width: '20%' }} >
                                <p className={`w-100 fw-bolder`}>{"Багш нарын нэрс"}</p>
                            </div>
                            <div className="text-center border border-end-0 position-relative" style={{ width: '20%' }} >
                                <p className={`w-100 fw-bolder`}>{"Харьяалагдах  салбар"}</p>
                            </div>
                            <div className="text-center border border-end-0 position-relative" style={{ width: '40%' }} >
                                <p className={`w-100 fw-bolder`}>{`${months} сар`}</p>
                                <div className="d-flex mb-0">
                                    <div className="text-center border-top position-relative" style={{ width: '25%' }} >
                                        <p className={` mt-0 fw-bolder`}>{"Лекц"}</p>
                                    </div>
                                    <div className="text-center  border border-bottom-0 border-end-0 position-relative" style={{ width: '25%' }} >
                                        <p className={` mt-0 w-100 fw-bolder`}>{"Семинар"}</p>
                                    </div>
                                    <div className="text-center border  border-bottom-0 border-end-0 position-relative" style={{ width: '25%' }} >
                                        <p className={` mt-0 w-100 fw-bolder`}>{"Лаборатори"}</p>
                                    </div>
                                    <div className="text-center border border-bottom-0  border-end-0 position-relative" style={{ width: '25%' }} >
                                        <p className={` mt-0 w-100 fw-bolder`}>{"Нийт"}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="text-center border position-relative" style={{ width: '18%' }} >
                                <p className={`w-100 fw-bolder`}>{"Тайлбар"}</p>
                            </div>
                        </div>
                        {
                            datas.length > 0 &&
                                datas.map((item, idx) => {
                                    return (
                                        <div className={`d-flex px-0 `} style={{ width: '100%', fontSize: '9px'}} key={idx}>
                                            <div className="text-center border border-end-0 border-top-0" style={{ width: '2%' }} >
                                                <span className="w-100 fw-bolder m-0">{idx + 1}</span>
                                            </div>
                                            <div className="text-center border border-end-0 border-top-0" style={{ width: '20%' }} >
                                                <span className="w-100 fw-bolder m-0">{item?.teacher?.full_name}</span>
                                            </div>
                                            <div className="text-center border border-end-0 border-top-0" style={{ width: '20%' }} >
                                                <span className="w-100 fw-bolder m-0">{item?.school?.name}</span>
                                            </div>
                                            <div className="text-center border border-end-0 border-top-0" style={{ width: '10%' }} >
                                                <span className="w-100 fw-bolder m-0">{item?.lekts}</span>
                                            </div>
                                            <div className="text-center border border-end-0 border-top-0" style={{ width: '10%' }} >
                                                <span className="w-100 fw-bolder m-0">{item?.seminar}</span>
                                            </div>
                                            <div className="text-center border border-end-0 border-top-0" style={{ width: '10%' }} >
                                                <span className="w-100 fw-bolder m-0">{item?.lab}</span>
                                            </div>
                                            <div className="text-center border border-end-0 border-top-0" style={{ width: '10%' }} >
                                                <span className="w-100 fw-bolder m-0">{item?.lekts + item?.seminar + item?.lab}</span>
                                            </div>
                                            <div className="text-center border border-top-0" style={{ width: '18%' }} >
                                                <span className="w-100 fw-bolder m-0">{item?.teacher?.full_name}</span>
                                            </div>
                                        </div>
                                    )
                                }
                                )
                        }
                    </Row>
                    }
                    <footer className="mt-1 text-center" style={{ fontSize: '11px'}}>
                        <span className="m-0 d-inline-block w-100">Хянасан: Сургалтын албаны дарга ............................................................. </span>
                    </footer>
                </div>
        </>
    )
}