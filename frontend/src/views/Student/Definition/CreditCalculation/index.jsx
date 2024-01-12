
import React, { useEffect, useState, useRef, useMemo } from "react"

import { Row } from 'reactstrap'
import { useLocation } from 'react-router-dom';

import useApi from "@hooks/useApi"
import useLoader from '@hooks/useLoader';

// ** Styles
import "./style.scss"

export default function CreditCalculation()
{
    const AMOUNT_CREDIT_CALCULATION = 'def2'

    const first_count = useRef(0)
    const last_count = useRef(0)
    const all_credit = useRef(0)

    const location = useLocation()
    const studentId = location.state

    // State
    const [ datas, setDatas ] = useState([])
    const [ listArr, setListArr ] = useState([])

    // Loader
    const { Loader, isLoading, fetchData } = useLoader({isFullScreen: false})

    // Api
    const signatureApi = useApi().signature
    const studentApi = useApi().student

    function getAllData()
    {
        if (studentId)
        {
            Promise.all([
                fetchData(signatureApi.get(1)),
                fetchData(studentApi.getDefinitionStudent(AMOUNT_CREDIT_CALCULATION, studentId)),
            ]).then((values) => {
                setListArr(values[0]?.data),
                setDatas(values[1]?.data)
            })
        }
    }

    function imageLoaded()
    {
        Object.keys(datas).length > 0 && setTimeout(() => window.print(), 1000)
    }

    useEffect(
        () =>
        {
            getAllData()

            window.onafterprint = function()
            {
                window.history.go(-1);
            }
        },
        []
    )

    /** 1 => 01 болгох Format */
    const zeroFill = n => {
        return ('0' + n).slice(-2);
    }

    const displayTable = useMemo(
        () =>
        {
            let datatable = []
            if (datas)
            {
                if (datas?.study_kredit && datas?.study_kredit?.length != 0)
                {
                    first_count.current = parseInt(datas?.study_kredit?.length / 2 + datas?.study_kredit?.length % 2);
                    last_count.current = parseInt(datas?.study_kredit?.length - first_count.current);

                    [...Array(first_count.current)].map((val, idx) =>
                    {
                        let first_num = idx
                        let last_num = idx + first_count.current

                        all_credit.current = all_credit.current + datas?.study_kredit[first_num]?.kr_count + (datas?.study_kredit[last_num]?.kr_count || 0)
                            datatable.push(
                                <tr key={`table${idx}`} className={`p-0 m-0 fw-bolder`} style={{ width: '100%', fontSize: '12px' }} >
                                    <td className="border-end border-dark bg-transparent fw-bolder" style={{ width: '2%' }} >
                                        {first_num + 1}
                                    </td>
                                    <td className="border-end ps-1 p-0 bg-transparent fw-bolder text-start border-dark" style={{ width: '41%', }} >
                                        {datas?.study_kredit[first_num]?.name}
                                    </td>
                                    <td className="border-end fw-bolder bg-transparent border-dark" style={{ width: '7%' }} >
                                        {datas?.study_kredit[first_num]?.kr_count}
                                    </td>
                                    <td className="border-end fw-bolder bg-transparent border-dark" style={{ width: '2%' }} >
                                        {datas?.study_kredit[last_num] && last_num + 1}
                                    </td>
                                    <td className="border-end fw-bolder bg-transparent text-start border-dark" style={{ width: '41%' }} >
                                        {datas?.study_kredit[last_num]?.name}
                                    </td>
                                    <td className="fw-bolder border-dark bg-transparent" style={{ width: '7%' }} >
                                        {datas?.study_kredit[last_num]?.kr_count}
                                    </td>
                                </tr>
                            )
                    })
                }
            }

            return datatable
        },
        [datas]
    )

    return (
        <div className='px-1 pe-5 fontchange'>
            {
                studentId
                ?
                <>
                    {isLoading && Loader}
                    <div className='d-flex flex-column justify-content-center align-items-center w-100 mt-5' style={{ fontSize: '12px' }} >
                        <img className="fallback-logo" width={100} height={100} src={`http://hr.mnun.edu.mn/media/orgs/logo/MNU-Logo_1.png`}  alt="logo" onLoad={imageLoaded} />
                        {/* <img className="fallback-logo" width={100} height={100} src={`${process. env.REACT_APP_MUIS_HR_MEDIA_URL}${datas?.school?.logo_url}`} alt="logo" onLoad={imageLoaded} /> */}
                        <div className="d-flex flex-column text-center fw-bolder">
                            <span className='mt-1'>
                                {datas?.school?.name.toUpperCase()}
                            </span>
                            <span style={{ marginTop: '6px' }}>{datas?.school?.name_eng.toUpperCase()}</span>
                        </div>
                    </div>
                    <Row className="pb-2 ps-3 pt-1" style={{ fontSize: '12px' }} >
                        <div style={{ borderBottom: '1px solid gray' }} />
                        {/* <p>Огноо: {new Date().getFullYear()}-{zeroFill(new Date().getMonth() + 1)}-{new Date().getDate()}</p> */}

                        <div className="text-center mt-2 fw-bolder fs-3">
                            Судлах кредитийн тодорхойлолт
                        </div>

                        <div className="w-100 fw-bolder mt-2">
                            <div className="w-50 d-inline-block">
                                Овог: <span className="fw-normal">{datas?.student?.last_name}</span>
                            </div>
                            <div className="w-50 d-inline-block">
                                Хичээлийн жил: <span className="fw-normal">2022-2023 он</span>
                            </div>
                        </div>
                        <div className="w-100 fw-bolder mt-2">
                            <div className="w-50 d-inline-block">
                                Нэр: <span className="fw-normal">{datas?.student?.first_name}</span>
                            </div>
                            <div className="w-50 d-inline-block">
                                Улирал: <span className="fw-normal">1</span>
                            </div>
                        </div>
                        <div className="w-100 fw-bolder mt-2">
                            <div className="w-50 d-inline-block">
                                Регистр: <span className="fw-normal">{datas?.student?.register_num}</span>
                            </div>
                            <div className="w-50 d-inline-block">
                                Хөтөлбөр: <span className="fw-normal">{datas?.student?.group?.profession?.name}</span>
                            </div>
                        </div>

                        <table className="table table-bordered border-2 mt-2 me-5 border-dark">
                            <thead>
                                <tr>
                                    <td className="border-end bg-transparent border-dark fw-bolder" style={{ width: '4%' }} >
                                        №
                                    </td>
                                    <td className="border-end bg-transparent border-dark fw-bolder" style={{ width: '41%' }} >
                                        Хичээлийн нэр
                                    </td>
                                    <td className="border-end bg-transparent border-dark fw-bolder" style={{ width: '7%' }} >
                                        Кр
                                    </td>
                                    <td className="border-end bg-transparent border-dark fw-bolder" style={{ width: '4%' }} >
                                        №
                                    </td>
                                    <td className="border-end bg-transparent border-dark fw-bolder" style={{ width: '41%' }} >
                                        Хичээлийн нэр
                                    </td>
                                    <td className="fw-bolder bg-transparent border-dark " style={{ width: '3%' }} >
                                        Кр
                                    </td>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    displayTable
                                }
                                <tr>
                                    <td colSpan={5} className="border-end-0 bg-transparent fw-bolder fst-italic">
                                        Нийт
                                    </td>
                                    <td className="fw-bolder bg-transparent" style={{ width: '7%' }} >
                                        {all_credit.current}
                                    </td>
                                </tr>
                            </tbody>
                                {/* Footer */}
                        </table>

                        <div className="text-center mt-3 text-uppercase">
                            {
                                listArr?.map((val, idx) =>
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
    )
}
