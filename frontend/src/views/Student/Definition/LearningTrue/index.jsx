
import React, { useEffect } from "react"

import { Row } from 'reactstrap'

import useLoader from '@hooks/useLoader';

// ** Styles

import './style.css'


export default function LearningTrue()
{

    const datas = sessionStorage.getItem("student_data")? JSON.parse(sessionStorage.getItem("student_data")) : null;
    const listArr = sessionStorage.getItem("signature_data")? JSON.parse(sessionStorage.getItem("signature_data")) : null;
    const studentId = datas["id"]

    useEffect(
        () =>
        {
            window.onafterprint = function()
            {
                // window.close()
                // sessionStorage.removeItem("student_data")
                // sessionStorage.removeItem("signature_data")
            }
        },
        []
    )

    function imageLoaded()
    {
        // if (Object.keys(datas).length != 0)
        // {
        //     setTimeout(() => window.print(), 1000)
        // }
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
                        {/* <img className="fallback-logo" width={100} height={100} src='http://hr.mnun.edu.mn/media/orgs/logo/MNU-Logo_1.png' alt="logo" onLoad={imageLoaded} /> */}
                        <img className="fallback-logo" width={100} height={100} src={logo} alt="logo" onLoad={imageLoaded} />
                        <div className="d-flex flex-column text-center fw-bolder">
                            <span className='mt-1 text-uppercase'>
                                Дотоод хэргийн их сургууль
                            </span>
                            <span style={{ marginTop: '6px' }} className="text-uppercase">
                                {/* {datas?.school_data?.name_eng?.toUpperCase()} */}
                                University of internal affairs, mongolia
                            </span>
                        </div>
                    </div>
                    <Row className="pb-2 ps-1 pe-3 pt-1" style={{ fontSize: '14px' }} >
                        <div style={{ borderBottom: '1px solid gray' }} />
                        {/* <p>Огноо: {new Date().getFullYear()}-{zeroFill(new Date().getMonth() + 1)}-{new Date().getDate()}</p> */}

                        <div className="text-center mt-1">
                            {datas?.school?.address ? datas?.school?.address : 'Баянзүрх дүүрэг, VIII хороо Хилчний гудамж, ш/х - 210332, Улаанбаатар хот'}
                            {/* {datas?.school_data?.phone_number && `Утас: ${datas?.school_data?.phone_number}`} {datas?.school_data?.home_phone && `Факс: ${datas?.school_data?.home_phone}`} */}
                            <div>{datas?.school_data?.social && `E-mail: ${datas?.school_data?.social}`}</div>
                        </div>
                        <div className="text-center fst-italic">
                            _______________________________№_______________________________
                        </div>

                        <div className="text-center mt-3 fw-bolder fs-3">
                            ТОДОРХОЙЛОЛТ
                        </div>

                        <div className="text-center mt-2">
                        {
                            datas?.status_code == 1
                            ?
                            <div>
                                <span className="fw-bolder">{datas?.code} </span><span className="fw-bolder text-uppercase">{datas?.last_name}</span> овогтой <span className="fw-bolder text-uppercase">{datas?.first_name}</span> нь тус сургуульд <span className="fw-bolder text-uppercase">{datas?.profession_name}</span> <br/> хөтөлбөрөөр <span>{datas?.group_level}</span>-р курст
                                суралцдаг нь үнэн болохыг тодорхойлов.
                            </div>
                            :
                                datas?.status_code == 5
                                ?
                                   <span>
                                        <span className="text-uppercase">{datas?.code} кодтой {datas?.last_name} овогтой {datas?.first_name} нь тус сургуульд {datas?.profession_name} хөтөлбөрөөр {datas?.group_join_year?.substring(0, 4)}-{datas?.graduation_work?.graduation_year?.substring(0, 4)} оны хооронд суралцаж <br/> {datas?.graduation_work?.diplom_num} дипломын дугаартай </span>
                                        төгссөн нь үнэн болохыг тодорхойлов.
                                   </span>
                                :
                                    <span>
                                        {datas?.code} кодтой {datas?.last_name} овогтой {datas?.first_name} нь тус сургуулиас {datas?.status_name?.toLowerCase()} нь 
                                        <br/>
                                        үнэн болохыг тодорхойлов.
                                    </span>
                        }
                        </div>

                        <div className="mt-2 d-flex justify-content-center">
                            {
                                listArr.map((val, idx) =>
                                {
                                    return (
                                        <div className="d-flex flex-column me-1 mt-50">
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
        </>
    )
}
