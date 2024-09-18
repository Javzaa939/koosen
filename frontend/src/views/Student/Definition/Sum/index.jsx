
import React, { useEffect, useState } from "react"

import { Row } from 'reactstrap'
import { useLocation } from 'react-router-dom';

import useApi from "@hooks/useApi"
import useLoader from '@hooks/useLoader';

// ** Styles
import './style.scss'

export default function Sum()
{
    const location = useLocation()
    const data = location.state

    // State
    const [ datas, setDatas ] = useState({})
    const [ listArr, setListArr ] = useState([])

    // Loader
    const { Loader, isLoading, fetchData } = useLoader({isFullScreen: true})

    // Api
    const signatureApi = useApi().signature
    const studentApi = useApi().student

    function getAllData()
    {
        if (data)
        {
            Promise.all([
                fetchData(signatureApi.get(1)),
                fetchData(studentApi.definition.getSum(data)),
            ]).then((values) => {
                setListArr(values[0]?.data)
                setDatas(values[1]?.data)
            })
        }
    }

    function imageLoaded()
    {
        if (Object.keys(datas).length != 0)
        {
            // setTimeout(() => window.print(), 1000)
        }
    }

    useEffect(
        () =>
        {
            getAllData();
        },
        []
    )

    useEffect(
        () =>
        {
            window.onafterprint = function()
            {
                // window.history.go(-1);
            }
        },
        []
    )

    /** 1 => 01 болгох Format */
    const zeroFill = n => {
        return ('0' + n).slice(-2);
    }

    const logo = require("@src/assets/images/logo/dxis_logo.png").default

    return (
        <>
            <div className='fontchange ps-1' >
            {
                data && datas?.score
                ?
                <>
                    {isLoading && Loader}
                    <div className='d-flex flex-column justify-content-center align-items-center w-100 mt-3' style={{ fontSize: '14px' }} >
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
                    <Row className="pb-2 ps-3 pe-2 pt-1" style={{ fontSize: '14px' }} >
                    <div style={{ borderBottom: '1px solid gray' }} />
                        <div className="text-center mt-1">
                            {datas?.school?.address ? datas?.school?.address : 'Баянзүрх дүүрэг, VIII хороо Хилчний гудамж, ш/х - 210332, Улаанбаатар хот'}
                            {datas?.school?.home_phone && `Факс: ${datas?.school?.home_phone}`}
                            <div>{datas?.school?.email && `E-mail: ${datas?.school?.email}`}</div>
                        </div>
                        <div className="text-center fst-italic">
                            _______________________________№_______________________________
                        </div>

                        <div className="text-center mt-3 fw-bolder fs-3">
                            ТОДОРХОЙЛОЛТ
                        </div>

                        <div className="mt-2 d-flex justify-content-center">
                            <div className="text-center" style={{ maxWidth: 720 }}>
                                {
                                    data.all_year
                                    ?
                                        `${datas?.student?.last_name} овогтой ${datas?.student?.first_name} /${datas?.student?.register_num}/ нь ${datas?.student?.profession_name} хөтөлбөрт ${Math.round(parseFloat(datas?.score?.gpa || 0) * 10) / 10} голч дүнтэй суралцдаг нь үнэн болно.`
                                    :
                                        `${datas?.student?.last_name} овогтой ${datas?.student?.first_name} /${datas?.student?.register_num}/ нь ${datas?.student?.group?.profession?.name} хөтөлбөрт ${data?.year_value} хичээлийн ${datas?.season_name ? 'жилийн' : 'жилд'} ${datas?.season_name?.toLowerCase()}${datas?.season_name ? 'ын улиралд' : ''} ${Math.round(parseFloat(datas?.score?.score_obj?.gpa || 0) * 10) / 10} голч дүнтэй суралцсан нь үнэн болно.`
                                }
                            </div>
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
                <p>Уучлаарай мэдээлэл олдсонгүй</p>
            }
            </div>
        </>
    )
}
