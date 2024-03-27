
import React, { useEffect } from "react"
import { Row } from 'reactstrap'

import './style.css'

export default function LearningTrueEn()
{

    const datas = sessionStorage.getItem("student_data")? JSON.parse(sessionStorage.getItem("student_data")) : null;
    const listArr = sessionStorage.getItem("signature_data")? JSON.parse(sessionStorage.getItem("signature_data")) : null;
    const studentId = datas["id"]

    useEffect(
        () =>
        {
            window.onafterprint = function()
            {
                window.close()
                sessionStorage.removeItem("student_data")
                sessionStorage.removeItem("signature_data")
            }
        },
        []
    )

    function imageLoaded()
    {
        if (Object.keys(datas).length != 0)
        {
            setTimeout(() => window.print(), 1000)
        }
    }

    /** 1 => 01 болгох Format */
    const zeroFill = n => {
        return ('0' + n).slice(-2);
    }

    const logo = require("@src/assets/images/logo/dxis_logo.png").default

    return (
        <>
        <div className='ps-1 d-flex flex-column justify-content-center align-items-center fontchange'>
            {
                studentId
                ?
                <>
                    {/* {!isLoading && Loader} */}
                    <div className='d-flex flex-column justify-content-center align-items-center w-100 mt-3' style={{ fontSize: '14px' }} >
                        <img className="fallback-logo" width={100} height={100} src={logo} alt="logo" onLoad={imageLoaded} />
                        <div className="d-flex flex-column text-center fw-bolder">
                            <span className='mt-1'>
                                {datas?.school_data?.name?.toUpperCase()}
                            </span>
                            <span style={{ marginTop: '6px' }}>{datas?.school_data?.name_eng.toUpperCase()}</span>
                        </div>
                    </div>
                    <Row className="pb-2 ps-1 pe-3 pt-1" style={{ fontSize: '14px' }} >
                        <div style={{ borderBottom: '1px solid gray' }} />
                        {/* <p>Огноо: {new Date().getFullYear()}-{zeroFill(new Date().getMonth() + 1)}-{new Date().getDate()}</p> */}

                        <div className="text-center mt-1">
                            {datas?.school_data?.address} {datas?.school_data?.phone_number && `Утас: ${datas?.school_data?.phone_number}`} {datas?.school_data?.home_phone && `Факс: ${datas?.school_data?.home_phone}`}
                            <div>{datas?.school_data?.email && `E-mail: ${datas?.school_data?.email}`}</div>
                        </div>
                        <div className="text-center fst-italic">
                            _______________________________№_______________________________
                        </div>

                        <div className="text-center mt-3 fw-bolder fs-3">
                            DEFINITION
                        </div>

                        <div className="text-center mt-2">
                        {
                            datas?.status_code == 1
                            ?
                                `${datas?.code} кодтой ${datas?.last_name} овогтой ${datas?.first_name} нь ${datas?.school_data?.name}-д ${datas?.degree_name} зэргийн ${datas?.profession_name} мэргэжлээр ${datas?.group_level}-р курст суралцдаг нь үнэн болохыг тодорхойлов.`
                            :
                                datas?.status_code == 5
                                ?
                                    `${datas?.code} кодтой ${datas?.last_name} овогтой ${datas?.first_name} нь ${datas?.school_data?.name}-д ${datas?.degree_name}-н зэргийн ${datas?.group_name} мэргэжлээр ${datas?.group_join_year?.substring(0, 4)}-${datas?.graduation_work?.substring(datas?.graduation_work?.length - 4)} оны хооронд суралцаж ${datas?.graduation_work?.diplom_num} дипломын дугаартай төгссөн нь үнэн болохыг тодорхойлов.`
                                :
                                    `${datas?.code} кодтой ${datas?.last_name} овогтой ${datas?.first_name} нь ${datas?.school_data?.name}-ээс ${datas?.status_name?.toLowerCase()} нь үнэн болохыг тодорхойлов.`
                        }
                        </div>

                        <div className="text-center mt-3 text-uppercase">
                            {
                                listArr.map((val, idx) =>
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
                <p>Sorry, no information found</p>
            }
        </div>
        </>
    )
}
